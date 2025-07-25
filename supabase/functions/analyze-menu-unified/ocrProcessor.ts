interface ProcessingContext {
  isMultiImage?: boolean;
  totalImages?: number;
  isSection?: boolean;
  sectionIndex?: number;
  totalSections?: number;
  instruction?: string;
}

export async function analyzeImageWithOCR(
  imageBase64: string, 
  type: 'menu' | 'wine',
  context: ProcessingContext = {}
): Promise<any> {
  console.log(`🔍 OCR analysis starting for ${type}`, context);
  
  const prompt = buildPrompt(type, context);
  
  // Add timeout to prevent hangs
  const timeoutMs = 45000; // 45 seconds max
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
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
    max_tokens: 8000,
    temperature: 0.1,
    response_format: { "type": "json_object" }
  };

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
    
    console.log(`📊 OCR Analysis Token Usage: ${tokenUsage.totalTokens} tokens ($${tokenUsage.estimatedCost.toFixed(4)})`);
    
    try {
      const parsed = JSON.parse(analysisResult);
      return {
        success: true,
        ...parsed,
        processingMethod: 'OCR',
        context,
        tokenUsage
      };
    } catch (parseError) {
      console.error('Failed to parse OCR result:', parseError);
      throw new Error(`Failed to parse ${type} analysis result: ${parseError.message}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OCR request timed out after 45 seconds');
    }
    throw error;
  }
}

function buildPrompt(type: 'menu' | 'wine', context: ProcessingContext): string {
  const basePrompt = type === 'menu' ? getMenuPrompt() : getWinePrompt();
  
  let contextualInstructions = '';
  
  if (context.isMultiImage) {
    contextualInstructions += `\n\nCRITICAL: This analysis covers ${context.totalImages} images. Extract ALL visible items comprehensively from this combined view.`;
  }
  
  if (context.isSection) {
    contextualInstructions += `\n\nCRITICAL: This is section ${context.sectionIndex} of ${context.totalSections}. Extract EVERY visible item from this section only. Do not assume other sections will handle any items.`;
  }
  
  if (context.instruction) {
    contextualInstructions += `\n\n${context.instruction}`;
  }
  
  return basePrompt + contextualInstructions;
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

function getMenuPrompt(): string {
  return `You are an expert menu analysis system. Analyze this menu image and extract ALL visible food items in perfect JSON format.

CRITICAL REQUIREMENTS:
1. Extract EVERY visible dish, appetizer, entree, dessert, and beverage
2. Include accurate prices when visible
3. Capture complete descriptions when available
4. Identify dish types and ingredients when mentioned

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
    "sectionsProcessed": ["section names"],
    "completionConfidence": "95%"
  }
}`;
}

function getWinePrompt(): string {
  return `You are an expert wine list analysis system. Analyze this wine list image and extract ALL visible wines in perfect JSON format.

CRITICAL REQUIREMENTS:
1. Extract EVERY visible wine with complete details
2. Include both bottle and glass prices when available
3. Capture vintage, varietal, region when shown
4. Identify wine type (red, white, sparkling, rosé)

Return ONLY valid JSON in this exact format:
{
  "wines": [
    {
      "name": "Full wine name as shown",
      "vintage": "Year if shown, empty string if not",
      "varietal": "Grape variety if mentioned",
      "region": "Region/appellation if shown",
      "price_bottle": "Bottle price if shown",
      "price_glass": "Glass price if shown", 
      "wine_type": "red/white/sparkling/rosé/dessert",
      "description": "Any tasting notes or description"
    }
  ],
  "extractionSummary": {
    "totalWinesFound": 0,
    "categoriesProcessed": ["category names"],
    "completionConfidence": "95%"
  }
}`;
}