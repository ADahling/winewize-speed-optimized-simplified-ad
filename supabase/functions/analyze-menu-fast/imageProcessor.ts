
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface AnalysisResult {
  menuItems?: any[];
  wines?: any[];
  extractionSummary?: {
    totalItemsFound?: number;
    totalWinesFound?: number;
    completionConfidence?: string;
    errorMessage?: string;
  };
}

export async function analyzeImageChunk(
  imageBase64: string,
  analysisType: string,
  imageIndex: number,
  totalImages: number
): Promise<AnalysisResult> {
  console.log(`Analyzing ${analysisType} image ${imageIndex + 1}/${totalImages}`);

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const isMenuAnalysis = analysisType === 'menu';
  const prompt = isMenuAnalysis ? getMenuAnalysisPrompt() : getWineAnalysisPrompt();

  // Set appropriate token allocation for complete extraction
  const baseImageSize = imageBase64.length;
  const estimatedTokens = Math.min(8000, Math.max(4000, Math.floor(baseImageSize / 400)));
  console.log(`🔍 Vision processing: ${estimatedTokens} tokens for ${analysisType} image (${Math.floor(baseImageSize/1024)}KB)`);

  try {
    // Vision processing with extended timeout for complex menus
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for vision
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // CRITICAL FIX: Switch to full GPT-4o for complete extraction
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
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: estimatedTokens, // Dynamic allocation based on image size
        temperature: 0.1
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

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

    // Return structured result
    if (isMenuAnalysis) {
      return {
        menuItems: parsedResult.menuItems || [],
        extractionSummary: {
          totalItemsFound: parsedResult.menuItems?.length || 0,
          completionConfidence: parsedResult.completionConfidence || "unknown"
        }
      };
    } else {
      return {
        wines: parsedResult.wines || [],
        extractionSummary: {
          totalWinesFound: parsedResult.wines?.length || 0,
          completionConfidence: parsedResult.completionConfidence || "unknown"
        }
      };
    }

  } catch (error) {
    console.error(`Failed to analyze ${analysisType} image:`, error);
    return {
      [isMenuAnalysis ? 'menuItems' : 'wines']: [],
      extractionSummary: {
        [isMenuAnalysis ? 'totalItemsFound' : 'totalWinesFound']: 0,
        completionConfidence: "0% - analysis failed",
        errorMessage: error.message
      }
    };
  }
}

function getMenuAnalysisPrompt(): string {
  return `You are an expert menu analyst. Extract ALL food items from this menu image with complete accuracy.

EXTRACTION REQUIREMENTS:
- Extract EVERY visible dish, appetizer, entree, dessert, and side dish
- Use exact names as written on the menu
- Include full descriptions and prices if visible
- Scan the entire image systematically
- Count your extracted items to ensure completeness

Return a JSON object with this structure:
{
  "menuItems": [
    {
      "dish_name": "Exact name from menu",
      "description": "Full description if available",
      "price": "Price with currency symbol",
      "dish_type": "appetizer|main|dessert|side|beverage",
      "ingredients": ["ingredient1", "ingredient2"]
    }
  ],
  "completionConfidence": "95% - extracted all visible items"
}

CRITICAL: Extract ALL items visible - never truncate or stop early.`;
}

function getWineAnalysisPrompt(): string {
  return `You are an expert wine list analyst. Extract ALL wines from this wine list image with complete accuracy.

EXTRACTION REQUIREMENTS:
- Extract EVERY visible wine entry
- Include wine names, vintages, regions, and varietals
- Capture both glass and bottle prices if available
- Assign appropriate wine_type and ww_style categories
- Scan the entire image systematically

Return a JSON object with this structure:
{
  "wines": [
    {
      "name": "Wine name",
      "vintage": "Year if available",
      "varietal": "Grape variety/style",
      "region": "Region/producer if available",
      "price_glass": "Glass price if available",
      "price_bottle": "Bottle price if available",
      "wine_type": "red|white|sparkling|rosé|dessert",
      "ww_style": "Fresh & Crisp|Funky & Floral|Rich & Creamy|Fresh & Fruity|Dry & Dirty|Packed with a Punch",
      "description": "Any tasting notes or description"
    }
  ],
  "completionConfidence": "95% - extracted all visible wines"
}

CRITICAL: Extract ALL wine entries visible - never truncate or stop early.`;
}
