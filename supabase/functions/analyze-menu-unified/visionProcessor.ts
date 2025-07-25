interface ProcessingContext {
  isMultiImage?: boolean;
  totalImages?: number;
  isSection?: boolean;
  sectionIndex?: number;
  totalSections?: number;
  instruction?: string;
  sectionName?: string;
  isChunk?: boolean;
  chunkInfo?: string;
  chunkNumber?: number;
}

export async function analyzeImageWithVision(
  imageBase64: string, 
  type: 'menu' | 'wine',
  context: ProcessingContext = {}
): Promise<any> {
  console.log(`👁️ Vision analysis starting for ${type}`, context);
  
  // For menu type, use section-by-section approach
  if (type === 'menu') {
    return await analyzeMenuBySections(imageBase64, context);
  }
  
  // For wine type, use optimized standard processing
  const prompt = buildVisionPrompt(type, context);
  return await executeVisionRequest(imageBase64, prompt, context);
}

async function analyzeMenuBySections(imageBase64: string, context: ProcessingContext): Promise<any> {
  console.log('🔍 Starting section-by-section menu analysis');
  
  try {
    // Phase 1: Detect all sections in the menu
    const sections = await detectMenuSections(imageBase64);
    console.log(`📋 Detected ${sections.length} menu sections:`, sections.map(s => s.name));
    
    if (sections.length === 0) {
      console.log('⚠️ No sections detected, falling back to single-pass extraction');
      return await analyzeSinglePass(imageBase64, context);
    }
    
    // Phase 2: Extract items from each section in parallel
    const sectionPromises = sections.map(async (section, index) => {
      console.log(`🔄 Processing section ${index + 1}/${sections.length}: ${section.name}`);
      
      const sectionPrompt = buildSectionExtractionPrompt(section, index + 1, sections.length);
      const result = await executeVisionRequest(imageBase64, sectionPrompt, {
        ...context,
        sectionName: section.name,
        sectionIndex: index + 1,
        totalSections: sections.length
      });
      
      return {
        sectionName: section.name,
        items: result.menuItems || [],
        success: result.success
      };
    });
    
    const sectionResults = await Promise.all(sectionPromises);
    
    // Combine all section results
    const allItems = sectionResults.flatMap(result => result.items);
    const successfulSections = sectionResults.filter(r => r.success).length;
    
    // Validate extraction completeness
    const validation = validateExtraction(allItems, sections.length);
    
    console.log(`📊 Section analysis complete: ${allItems.length} items from ${successfulSections}/${sections.length} sections`);
    
    return {
      success: true,
      menuItems: allItems,
      processingMethod: 'Section-by-Section Vision',
      sectionsProcessed: sections.map(s => s.name),
      extractionSummary: {
        totalItemsFound: allItems.length,
        sectionsProcessed: sections.map(s => s.name),
        completionConfidence: validation.confidence,
        processingMethod: 'Section-by-section analysis'
      },
      context,
      validation
    };
    
  } catch (error) {
    console.error('❌ Section-by-section analysis failed, falling back to single-pass:', error);
    return await analyzeSinglePass(imageBase64, context);
  }
}

async function detectMenuSections(imageBase64: string): Promise<Array<{name: string, description: string}>> {
  const sectionDetectionPrompt = `You are an expert menu analyzer. Examine this menu image and identify ALL distinct sections/categories.

SECTION DETECTION REQUIREMENTS:
1. Look for section headers, category names, and visual separators
2. Identify common menu sections like: APPETIZERS, STARTERS, SALADS, SOUPS, MAINS, ENTREES, DESSERTS, BEVERAGES, WINE, COCKTAILS, etc.
3. Also identify restaurant-specific sections like: SMALL PLATES, LARGE PLATES, HANDHELDS, FLATBREADS, SPECIALS, etc.
4. Pay attention to visual layout, fonts, spacing, and dividers that separate sections
5. Include sections even if they have few items

Return ONLY valid JSON in this exact format:
{
  "sections": [
    {
      "name": "Section name as it appears",
      "description": "Brief description of what this section contains"
    }
  ],
  "extractionSummary": {
    "totalSectionsFound": 0,
    "confidence": "95%"
  }
}`;

  const result = await executeVisionRequest(imageBase64, sectionDetectionPrompt, {});
  return result.sections || [];
}

async function analyzeSinglePass(imageBase64: string, context: ProcessingContext): Promise<any> {
  console.log('🔄 Falling back to single-pass menu analysis');
  const prompt = buildVisionPrompt('menu', context);
  return await executeVisionRequest(imageBase64, prompt, context);
}

async function executeVisionRequest(imageBase64: string, prompt: string, context: ProcessingContext): Promise<any> {
  const requestPayload = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high'
            }
          }
        ]
      }
    ],
    max_tokens: context.isChunk ? 4000 : 8000, // Reduce tokens for chunks
    temperature: 0.1,
    response_format: { "type": "json_object" }
  };

  // Reduced timeout for chunks, standard for full images
  const timeoutMs = context.isChunk ? 35000 : 50000; // Reduced from 55s to 50s for full images, 35s for chunks
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  console.log(`⏱️ Vision request timeout set to ${timeoutMs/1000}s ${context.isChunk ? '(chunk)' : '(full image)'}`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysisResult = data.choices[0].message.content;
    
    // Track token usage
    const tokenUsage = {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
      estimatedCost: calculateOpenAICost(data.usage?.prompt_tokens || 0, data.usage?.completion_tokens || 0, 'gpt-4o')
    };
    
    console.log(`📊 Vision Analysis Token Usage: ${tokenUsage.totalTokens} tokens ($${tokenUsage.estimatedCost.toFixed(4)})`);
    
    try {
      const parsed = JSON.parse(analysisResult);
      return {
        success: true,
        ...parsed,
        processingMethod: 'Vision',
        context,
        tokenUsage
      };
    } catch (parseError) {
      console.error('Failed to parse Vision result:', parseError);
      throw new Error(`Failed to parse analysis result: ${parseError.message}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs/1000} seconds`);
    }
    
    // Add specific error diagnostics for debugging
    const errorDetails = {
      name: error.name,
      message: error.message,
      timeoutMs,
      isChunk: context.isChunk || false
    };
    
    console.error('🚨 Vision request failed with details:', errorDetails);
    throw error;
  }
}

function buildVisionPrompt(type: 'menu' | 'wine', context: ProcessingContext): string {
  const basePrompt = type === 'menu' ? getMenuVisionPrompt() : getWineVisionPrompt();
  
  let contextualInstructions = '';
  
  if (context.isChunk) {
    contextualInstructions += `\n\nCHUNK PROCESSING: ${context.chunkInfo}\nFocus on extracting items from this specific portion of the ${type}.`;
  }
  
  if (context.isMultiImage) {
    contextualInstructions += `\n\nCRITICAL: This analysis covers ${context.totalImages} images. Extract ALL visible items comprehensively.`;
  }
  
  if (context.isSection) {
    contextualInstructions += `\n\nCRITICAL: This is section ${context.sectionIndex} of ${context.totalSections}. Extract EVERY visible item from this section.`;
  }
  
  if (context.instruction) {
    contextualInstructions += `\n\n${context.instruction}`;
  }
  
  return basePrompt + contextualInstructions;
}

function buildSectionExtractionPrompt(
  section: {name: string, description: string}, 
  sectionIndex: number, 
  totalSections: number
): string {
  return `You are an expert menu analyzer. Focus EXCLUSIVELY on the "${section.name}" section of this menu.

SECTION-SPECIFIC EXTRACTION REQUIREMENTS:
1. ONLY extract items that belong to the "${section.name}" section
2. Look for visual cues like headers, borders, or spacing that define this section
3. Extract ALL items from this section with complete details
4. Include full descriptions, ingredients, and prices as they appear
5. Categorize items appropriately based on the section type

SECTION CONTEXT:
- Section: "${section.name}" (${sectionIndex} of ${totalSections})
- Description: ${section.description}
- Focus: Extract ONLY items from this specific section

Return ONLY valid JSON in this exact format:
{
  "menuItems": [
    {
      "dish_name": "Exact dish name as shown",
      "description": "Full description if available, empty string if not",
      "price": "Exact price as shown (e.g., '$24.95'), empty string if not visible",
      "dish_type": "${section.name.toLowerCase().includes('appetizer') || section.name.toLowerCase().includes('starter') ? 'appetizer' : 
                   section.name.toLowerCase().includes('entree') || section.name.toLowerCase().includes('main') ? 'entree' :
                   section.name.toLowerCase().includes('dessert') ? 'dessert' :
                   section.name.toLowerCase().includes('salad') ? 'salad' :
                   section.name.toLowerCase().includes('soup') ? 'soup' :
                   section.name.toLowerCase().includes('beverage') || section.name.toLowerCase().includes('drink') ? 'beverage' :
                   'other'}",
      "ingredients": ["list", "of", "key", "ingredients", "if", "mentioned"]
    }
  ],
  "extractionSummary": {
    "totalItemsFound": 0,
    "sectionProcessed": "${section.name}",
    "completionConfidence": "95%"
  }
}`;
}

function validateExtraction(items: any[], totalSections: number): {confidence: string, isValid: boolean, details: string} {
  const itemCount = items.length;
  const expectedMinimum = totalSections * 3; // At least 3 items per section
  
  if (itemCount === 0) {
    return {
      confidence: '0%',
      isValid: false,
      details: 'No items extracted - extraction failed'
    };
  }
  
  if (itemCount < expectedMinimum) {
    return {
      confidence: '60%',
      isValid: false,
      details: `Only ${itemCount} items extracted from ${totalSections} sections. Expected at least ${expectedMinimum}.`
    };
  }
  
  // Check for reasonable distribution
  const averagePerSection = itemCount / totalSections;
  if (averagePerSection < 2) {
    return {
      confidence: '70%',
      isValid: false,
      details: `Average of ${averagePerSection.toFixed(1)} items per section is too low`
    };
  }
  
  // Check for item quality
  const itemsWithPrices = items.filter(item => item.price && item.price !== '').length;
  const itemsWithDescriptions = items.filter(item => item.description && item.description !== '').length;
  
  const priceRatio = itemsWithPrices / itemCount;
  const descriptionRatio = itemsWithDescriptions / itemCount;
  
  if (priceRatio < 0.3) {
    return {
      confidence: '75%',
      isValid: true,
      details: `Good extraction but only ${Math.round(priceRatio * 100)}% of items have prices`
    };
  }
  
  if (averagePerSection >= 5 && priceRatio >= 0.5) {
    return {
      confidence: '95%',
      isValid: true,
      details: `Excellent extraction: ${itemCount} items with ${Math.round(priceRatio * 100)}% having prices`
    };
  }
  
  return {
    confidence: '85%',
    isValid: true,
    details: `Good extraction: ${itemCount} items from ${totalSections} sections`
  };
}

function calculateOpenAICost(promptTokens: number, completionTokens: number, model: string): number {
  // OpenAI pricing per 1K tokens (as of 2024)
  const pricing = {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }
  };
  
  const rates = pricing[model] || pricing['gpt-4o'];
  return ((promptTokens / 1000) * rates.input) + ((completionTokens / 1000) * rates.output);
}

function getMenuVisionPrompt(): string {
  return `You are an expert visual menu analyzer. Carefully examine this menu image and extract ALL visible food and beverage items with maximum accuracy.

VISUAL ANALYSIS REQUIREMENTS:
1. Scan the entire image systematically from top to bottom
2. Identify all text that represents food/drink items
3. Extract exact names, descriptions, and prices as they appear
4. Group items by menu section when clearly indicated
5. Handle multiple columns, varied layouts, and different fonts

Return ONLY valid JSON in this exact format:
{
  "menuItems": [
    {
      "dish_name": "Exact dish name as shown",
      "description": "Full description if available, empty string if not",
      "price": "Exact price as shown (e.g., '$24.95'), empty string if not visible",
      "dish_type": "appetizer/entree/dessert/beverage/etc",
      "ingredients": ["list", "of", "key", "ingredients", "if", "mentioned"]
    }
  ],
  "extractionSummary": {
    "totalItemsFound": 0,
    "sectionsProcessed": ["section names found"],
    "completionConfidence": "95%"
  }
}`;
}

function getWineVisionPrompt(): string {
  return `You are an expert sommelier and wine list analyzer. Examine this wine list image with EXTREME PRECISION and extract ALL visible wines with complete structured details.

🍷 WINE EXTRACTION REQUIREMENTS:
1. SYSTEMATICALLY scan the entire image from top to bottom, left to right
2. Extract EVERY wine entry with these REQUIRED fields:
   - Wine Name (REQUIRED - full name as shown)
   - Vintage (year if visible, empty string if not shown)
   - Varietal/Grape (grape variety if mentioned)
   - Region (wine region/appellation if shown)
   - Price Bottle (bottle price with currency symbol)
   - Price Glass (glass price with currency symbol)
   - Wine Type (red/white/sparkling/rosé/dessert)
   - Description (tasting notes, wine description)

🔍 VISUAL ANALYSIS FOCUS:
- Look for section headers (REDS, WHITES, SPARKLING, etc.)
- Identify price columns (by the bottle/by the glass)
- Extract vintage years (4-digit numbers like 2019, 2020)
- Capture producer/winery names
- Find region information (Napa Valley, Burgundy, etc.)
- Note any tasting descriptions or wine characteristics

📋 STRUCTURED OUTPUT REQUIREMENTS:
- Wine name MUST be present (reject entries without clear names)
- At least ONE price field should be present when possible
- Wine type classification is REQUIRED
- Use empty strings for missing optional fields
- Maintain exact spelling and capitalization from image

Return ONLY valid JSON in this exact format:
{
  "wines": [
    {
      "name": "EXACT wine name as shown on list",
      "vintage": "Year (e.g., '2021') or empty string",
      "varietal": "Grape variety (e.g., 'Cabernet Sauvignon') or empty string",
      "region": "Wine region (e.g., 'Napa Valley') or empty string",
      "price_bottle": "Bottle price with $ (e.g., '$45') or empty string",
      "price_glass": "Glass price with $ (e.g., '$12') or empty string", 
      "wine_type": "red/white/sparkling/rosé/dessert (REQUIRED)",
      "description": "Tasting notes or wine description or empty string"
    }
  ],
  "extractionSummary": {
    "totalWinesFound": 0,
    "categoriesProcessed": ["categories found like Red Wines, White Wines"],
    "completionConfidence": "95%",
    "processingMethod": "Wine-Optimized GPT-4o Vision"
  }
}

CRITICAL: Extract EVERY visible wine - do not skip wines due to formatting issues. Be thorough and systematic!`;
}
