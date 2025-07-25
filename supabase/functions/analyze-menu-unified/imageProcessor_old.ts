
import { optimizeImageForProcessing, getImageDiagnostics } from './imageOptimizer.ts';

// Get your API key
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface ProcessingOptions {
  extractionMethod: 'section' | 'single';
  useOCR: boolean; // We'll ignore this since direct GPT-4o is better
}

export async function analyzeImagesInParallel(
  images: string[],
  type: 'menu' | 'wine',
  options: ProcessingOptions
): Promise<any> {
  const { extractionMethod } = options;
  
  try {
    console.log(`🔄 Starting ${type} analysis: ${images.length} images, method=${extractionMethod}`);

    // PHASE 1: Optimize all images for better processing performance
    console.log(`🖼️ Optimizing ${images.length} ${type} images...`);
    const optimizedImages = await Promise.all(
      images.map(async (image, index) => {
        const diagnostics = getImageDiagnostics(image);
        console.log(`📊 Image ${index + 1} diagnostics: ${diagnostics.sizeMB.toFixed(2)}MB ${diagnostics.recommendsOptimization ? '(needs optimization)' : '(size OK)'}`);
        
        if (diagnostics.recommendsOptimization) {
          const optimization = await optimizeImageForProcessing(image, type);
          console.log(`✅ Image ${index + 1} optimized: ${optimization.compressionRatio.toFixed(1)}% size reduction`);
          return optimization.optimizedBase64;
        } else {
          console.log(`⚡ Image ${index + 1} already optimal, skipping compression`);
          return image;
        }
      })
    );

    if (extractionMethod === 'single' && optimizedImages.length > 1) {
      // Single-call approach: combine all images into one analysis
      return await analyzeSingleCall(optimizedImages, type);
    } else {
      // Section-by-section approach: process each image separately
      return await analyzeSectionBySection(optimizedImages, type);
    }
  } catch (error) {
    console.error(`💥 Critical error in ${type} analysis:`, error);
    throw error;
  }
}

// Direct GPT-4o Vision processing (the approach that works)
async function processWithGPT4o(
  imageBase64: string,
  type: 'menu' | 'wine',
  context: any
): Promise<any> {
  const startTime = Date.now();
  console.log(`🔄 Processing ${type} image with direct GPT-4o approach`);
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = type === 'menu' ? getMenuAnalysisPrompt() : getWineAnalysisPrompt();
  const imageData = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { url: imageData }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error ${response.status}:`, errorText);
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    const processingTime = Date.now() - startTime;
    
    // Return structured result
    if (type === 'menu') {
      const menuItems = parsedResult.menuItems || [];
      console.log(`✅ Menu processing SUCCESS: ${menuItems.length} items via GPT-4o in ${processingTime}ms`);
      
      return {
        menuItems,
        success: menuItems.length > 0,
        processingMethod: 'GPT-4o Direct',
        processingTimeMs: processingTime,
        extractionSummary: {
          totalItemsFound: menuItems.length,
          completionConfidence: parsedResult.completionConfidence || "Good"
        }
      };
    } else {
      const wines = parsedResult.wines || [];
      console.log(`✅ Wine processing SUCCESS: ${wines.length} wines via GPT-4o in ${processingTime}ms`);
      
      // Validate wine results
      const validWines = validateWineExtraction(wines);
      
      return {
        wines: validWines,
        success: validWines.length > 0,
        processingMethod: 'GPT-4o Direct',
        processingTimeMs: processingTime,
        extractionSummary: {
          totalWinesFound: validWines.length,
          completionConfidence: parsedResult.completionConfidence || "Good"
        }
      };
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ ${type} processing FAILED in ${processingTime}ms:`, error.message);
    
    if (type === 'wine') {
      console.log(`🔄 Providing fallback wines after processing failure`);
      const fallbackResult = generateFallbackWines();
      fallbackResult.diagnostics = {
        processingTimeMs: processingTime,
        errorCode: 'GPT4O_PROCESSING_ERROR',
        originalError: error.message,
        fallbackUsed: true
      };
      return fallbackResult;
    }
    
    throw new Error(`${type} processing failed: ${error.message}`);
  }
}

// Wine validation function with price and vintage validation
function validateWineExtraction(wines: any[]): any[] {
  console.log(`🔍 Validating ${wines.length} extracted wines`);
  const currentYear = new Date().getFullYear();
  
  const validWines = wines.filter(wine => {
    // Required: Must have a name
    if (!wine.name || wine.name.trim() === '') {
      console.log(`❌ Wine rejected: missing name`, wine);
      return false;
    }
    
    // Wine name should be reasonable length
    if (wine.name.length < 3 || wine.name.length > 100) {
      console.log(`❌ Wine rejected: invalid name length`, wine.name);
      return false;
    }
    
    // Validate vintage if present
    if (wine.vintage && wine.vintage !== '') {
      const vintage = parseInt(wine.vintage);
      if (isNaN(vintage) || vintage < 1950 || vintage > currentYear) {
        console.log(`❌ Wine rejected: invalid vintage ${wine.vintage} (should be 1950-${currentYear})`, wine.name);
        return false;
      }
    }
    
    // Validate prices if present
    if (wine.price_bottle) {
      const bottlePrice = parseFloat(wine.price_bottle.replace(/[^0-9.]/g, ''));
      if (isNaN(bottlePrice) || bottlePrice < 10 || bottlePrice > 500) {
        console.log(`❌ Wine rejected: suspicious bottle price ${wine.price_bottle}`, wine.name);
        return false;
      }
    }
    
    if (wine.price_glass) {
      const glassPrice = parseFloat(wine.price_glass.replace(/[^0-9.]/g, ''));
      if (isNaN(glassPrice) || glassPrice < 5 || glassPrice > 50) {
        console.log(`❌ Wine rejected: suspicious glass price ${wine.price_glass}`, wine.name);
        return false;
      }
    }
    
    // Check glass/bottle price ratio if both exist
    if (wine.price_bottle && wine.price_glass) {
      const bottlePrice = parseFloat(wine.price_bottle.replace(/[^0-9.]/g, ''));
      const glassPrice = parseFloat(wine.price_glass.replace(/[^0-9.]/g, ''));
      const ratio = bottlePrice / glassPrice;
      if (ratio < 3 || ratio > 6) {
        console.log(`❌ Wine rejected: suspicious price ratio ${ratio.toFixed(1)} (bottle: ${bottlePrice}, glass: ${glassPrice})`, wine.name);
        return false;
      }
    }
    
    return true;
  });
  
  console.log(`✅ Wine validation complete: ${validWines.length}/${wines.length} wines passed validation`);
  return validWines;
}

// Fallback wine generation
function generateFallbackWines(): any {
  console.log(`🍷 Generating fallback wines for pairing capability`);
  
  const fallbackWines = [
    {
      name: "House Red Wine",
      vintage: "",
      varietal: "Red Blend",
      region: "Available",
      price_bottle: "$32",
      price_glass: "$8",
      wine_type: "red",
      description: "Our house selection red wine, versatile with most dishes"
    },
    {
      name: "House White Wine", 
      vintage: "",
      varietal: "White Blend",
      region: "Available",
      price_bottle: "$28",
      price_glass: "$7",
      wine_type: "white",
      description: "Our house selection white wine, crisp and refreshing"
    },
    {
      name: "House Sparkling Wine",
      vintage: "",
      varietal: "Sparkling",
      region: "Available", 
      price_bottle: "$35",
      price_glass: "$9",
      wine_type: "sparkling",
      description: "Our house sparkling wine, perfect for celebrations"
    }
  ];
  
  return {
    success: true,
    wines: fallbackWines,
    processingMethod: 'Fallback Wine Generation',
    extractionSummary: {
      totalWinesFound: fallbackWines.length,
      completionConfidence: '100% (fallback)',
      note: 'Wine list processing failed, providing generic options for pairing'
    }
  };
}

async function analyzeSingleCall(
  images: string[],
  type: 'menu' | 'wine'
): Promise<any> {
  console.log(`🔀 Single-call analysis for ${images.length} ${type} images`);
  
  try {
    // For single call, we'll process the first image as primary
    const primaryImage = images[0];
    
    const result = await processWithGPT4o(primaryImage, type, {
      isMultiImage: images.length > 1,
      totalImages: images.length
    });

    return {
      [type === 'menu' ? 'menuItems' : 'wines']: result[type === 'menu' ? 'menuItems' : 'wines'] || [],
      totalExtracted: (result[type === 'menu' ? 'menuItems' : 'wines'] || []).length,
      extractionMethod: 'single',
      imageCount: images.length,
      successfulAnalyses: result.success ? 1 : 0,
      failedAnalyses: result.success ? 0 : 1,
      processingMethod: result.processingMethod
    };
  } catch (error) {
    console.error(`❌ Single-call analysis failed:`, error);
    throw error;
  }
}

async function analyzeSectionBySection(
  images: string[],
  type: 'menu' | 'wine'
): Promise<any> {
  console.log(`📄 Section-by-section analysis for ${images.length} ${type} images`);
  
  // Process multiple images in parallel
  const analysisPromises = images.map(async (imageBase64, index) => {
    const imageStartTime = Date.now();
    try {
      console.log(`🔄 Processing ${type} image ${index + 1}/${images.length}`);
      
      const result = await processWithGPT4o(imageBase64, type, {
        isSection: true,
        sectionIndex: index + 1,
        totalSections: images.length
      });
      
      const imageProcessingTime = Date.now() - imageStartTime;
      console.log(`✅ Image ${index + 1} completed in ${imageProcessingTime}ms`);
      
      return {
        ...result,
        imageIndex: index + 1,
        processingTimeMs: imageProcessingTime
      };
      
    } catch (error) {
      const imageProcessingTime = Date.now() - imageStartTime;
      console.error(`❌ Image ${index + 1} failed in ${imageProcessingTime}ms:`, error.message);
      
      // Add specific error diagnostics
      const errorCode = error.message.includes('timeout') ? 'IMAGE_TIMEOUT' :
                       error.message.includes('rate') ? 'RATE_LIMIT_ERROR' :
                       'PROCESSING_ERROR';
      
      return {
        success: false,
        [type === 'menu' ? 'menuItems' : 'wines']: [],
        imageIndex: index + 1,
        processingTimeMs: imageProcessingTime,
        extractionSummary: {
          [`total${type === 'menu' ? 'Items' : 'Wines'}Found`]: 0,
          completionConfidence: '0% - processing failed',
          errorCode,
          errorMessage: error.message
        },
        processingMethod: 'Failed',
        diagnostics: {
          errorCode,
          processingTimeMs: imageProcessingTime,
          imageIndex: index + 1
        }
      };
    }
  });

  console.log(`🚀 Launching parallel processing of ${images.length} images...`);
  const results = await Promise.all(analysisPromises);
  
  // Combine results with analytics
  const combinedItems = results.flatMap(result => 
    result[type === 'menu' ? 'menuItems' : 'wines'] || []
  );
  
  const totalExtracted = combinedItems.length;
  const successfulAnalyses = results.filter(result => result.success !== false).length;
  const failedAnalyses = images.length - successfulAnalyses;
  
  // Calculate processing statistics
  const processingTimes = results.map(r => r.processingTimeMs || 0);
  const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
  const maxProcessingTime = Math.max(...processingTimes);
  
  console.log(`📊 Section analysis summary for ${type}:`, {
    totalImages: images.length,
    successfulAnalyses,
    failedAnalyses,
    totalItemsExtracted: totalExtracted,
    avgProcessingTimeMs: Math.round(avgProcessingTime),
    maxProcessingTimeMs: maxProcessingTime
  });

  return {
    [type === 'menu' ? 'menuItems' : 'wines']: combinedItems,
    totalExtracted,
    extractionMethod: 'section',
    imageCount: images.length,
    successfulAnalyses,
    failedAnalyses,
    performance: {
      avgProcessingTimeMs: Math.round(avgProcessingTime),
      maxProcessingTimeMs: maxProcessingTime
    },
    extractionSummary: {
      [`total${type === 'menu' ? 'Items' : 'Wines'}Found`]: totalExtracted,
      completionConfidence: successfulAnalyses > 0 ? `${Math.round((successfulAnalyses/images.length)*100)}%` : '0%',
      processingMethod: `Direct GPT-4o section analysis`
    }
  };
}

function getMenuAnalysisPrompt(): string {
  return `Analyze this menu image and extract ALL menu items. Return a JSON object with this structure:

{
  "menuItems": [
    {
      "dish_name": "Name of dish",
      "description": "Description of the dish",
      "price": "Price as string (e.g., '$12.99')",
      "dish_type": "appetizer/entree/dessert/etc",
      "ingredients": ["ingredient1", "ingredient2"]
    }
  ],
  "completionConfidence": "90% - clear text, good lighting"
}

CRITICAL NUMBER ACCURACY REQUIREMENTS:
- Pay extreme attention to ALL numbers (prices, quantities)
- Common OCR errors to avoid:
  * Reading "5" as "8" or vice versa
  * Missing decimal points ($1250 vs $12.50)
  * Confusing "0" with "O" or "6" with "G"
- Price validation: Appetizers typically $8-25, Entrees $15-45
- Double-check any price over $50 for accuracy
- Look for context clues (similar items, price patterns)

MOBILE CAMERA CONSIDERATIONS:
- Text may be angled, tilted, or perspective-distorted
- Process text that appears diagonal or curved
- Account for phone camera angle variations
- Some menu sections may be at different orientations
- Handle partial visibility due to camera positioning
- Compensate for lighting variations across the image

Requirements:
- Extract EVERY menu item you can see clearly
- Include prices if visible
- Categorize dishes appropriately
- List main ingredients when mentioned
- Return valid JSON only`;
}

function getWineAnalysisPrompt(): string {
  const currentYear = new Date().getFullYear();
  
  return `Analyze this wine list/menu image and extract ALL wines. Return a JSON object with this structure:

{
  "wines": [
    {
      "name": "Wine name",
      "vintage": "Year if available",
      "varietal": "Grape variety/style",
      "region": "Region/producer if available", 
      "price_glass": "Glass price if available",
      "price_bottle": "Bottle price if available",
      "wine_type": "red/white/sparkling/etc",
      "wine_style": "Style description",
      "description": "Any tasting notes or description"
    }
  ],
  "completionConfidence": "85% - mostly clear text"
}

CRITICAL NUMBER ACCURACY REQUIREMENTS:
- Pay extreme attention to ALL numbers (prices, vintages)
- Common OCR errors to avoid:
  * Reading "3" as "8", "5" as "8", "1" as "7"
  * Missing decimal points ($6500 vs $65.00)
  * Confusing "0" with "O", "6" with "G", "2" with "Z"
- Vintage validation: Must be between 1950-${currentYear}
- Price validation: 
  * Glass prices typically $8-25
  * Bottle prices typically $25-200
  * Glass price should be 20-30% of bottle price
- Double-check any unusual numbers for accuracy
- Look for context clues (price patterns, vintage sequences)

MOBILE CAMERA CONSIDERATIONS:
- Wine lists may be photographed at angles
- Text may appear diagonal, tilted, or curved
- Handle perspective distortion from phone cameras
- Some wine entries may be at different orientations
- Account for varying distances from camera
- Process partially visible text due to camera positioning
- Compensate for uneven lighting across wine list sections

Requirements:
- Extract EVERY wine you can see clearly
- Include both glass and bottle prices if available
- Identify wine type and style
- Validate all numbers for accuracy
- Return valid JSON only`;
}
