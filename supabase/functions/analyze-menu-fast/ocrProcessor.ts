import { menuAnalysisPrompt, wineListAnalysisPrompt } from './prompts.ts';

interface MenuItem {
  dishName: string;
  description?: string;
  price?: string;
  ingredients?: string[];
  dishType?: string;
  dietaryInfo?: string;
  portionSize?: string;
}

interface Wine {
  name: string;
  vintage?: string;
  varietal?: string;
  region?: string;
  price_bottle?: string;
  price_glass?: string;
  wineType?: string;
  wineStyle?: string;
  tastingNotes?: string;
  specialDesignation?: string;
}

// Process menu image using the proven working approach from analyze-menu
async function processMenuImage(imageBase64: string): Promise<MenuItem[]> {
  console.log('Processing menu image with proven working method (gpt-4o)');
  
  const requestPayload = {
    model: 'gpt-4o', // Use the working model
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: menuAnalysisPrompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high' // Maximum detail for text recognition
            }
          }
        ]
      }
    ],
    max_tokens: 8000, // Increased for large menus
    temperature: 0.1, // Low temperature for consistent extraction
    response_format: { "type": "json_object" } // Enforce JSON response
  };

  console.log('Making OpenAI API request for menu analysis');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error for menu:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Invalid OpenAI response structure for menu:', data);
    throw new Error('Invalid response structure from OpenAI API');
  }
  
  const analysisResult = data.choices[0].message.content;
  
  console.log('Completed menu analysis', {
    responseLength: analysisResult.length,
    tokensUsed: data.usage || 'unknown'
  });
  
  // Log token usage for monitoring
  if (data.usage) {
    console.log(`Token usage - Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`);
  }

  try {
    const parsed = JSON.parse(analysisResult);
    return parsed.menuItems || [];
  } catch (parseError) {
    console.error('Failed to parse menu analysis result:', {
      error: parseError.message,
      rawResult: analysisResult.substring(0, 500) + '...'
    });
    throw new Error(`Failed to parse menu analysis result: ${parseError.message}`);
  }
}

// Process wine image using the proven working approach from analyze-menu
async function processWineImage(imageBase64: string): Promise<Wine[]> {
  console.log('Processing wine image with proven working method (gpt-4o)');
  
  const requestPayload = {
    model: 'gpt-4o', // Use the working model
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: wineListAnalysisPrompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high' // Maximum detail for text recognition
            }
          }
        ]
      }
    ],
    max_tokens: 8000, // Increased for large wine lists
    temperature: 0.1, // Low temperature for consistent extraction
    response_format: { "type": "json_object" } // Enforce JSON response
  };

  console.log('Making OpenAI API request for wine analysis');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error for wine:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Invalid OpenAI response structure for wine:', data);
    throw new Error('Invalid response structure from OpenAI API');
  }
  
  const analysisResult = data.choices[0].message.content;
  
  console.log('Completed wine analysis', {
    responseLength: analysisResult.length,
    tokensUsed: data.usage || 'unknown'
  });
  
  // Log token usage for monitoring
  if (data.usage) {
    console.log(`Token usage - Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`);
  }

  try {
    const parsed = JSON.parse(analysisResult);
    return parsed.wines || [];
  } catch (parseError) {
    console.error('Failed to parse wine analysis result:', {
      error: parseError.message,
      rawResult: analysisResult.substring(0, 500) + '...'
    });
    throw new Error(`Failed to parse wine analysis result: ${parseError.message}`);
  }
}

// Main entry point for image analysis - using proven working approach
export async function analyzeImageWithOCR(
  imageBase64: string,
  type: 'menu' | 'wine'
) {
  try {
    console.log(`Starting ${type} analysis with proven working method (gpt-4o)`);
    
    const results = type === 'menu' 
      ? await processMenuImage(imageBase64)
      : await processWineImage(imageBase64);
    
    console.log(`Completed ${type} analysis:`, {
      itemsExtracted: results.length,
      type: type
    });

    return {
      success: true,
      [type === 'menu' ? 'menuItems' : 'wines']: results,
      extractionSummary: {
        [`total${type === 'menu' ? 'Items' : 'Wines'}Found`]: results.length,
        completionConfidence: `${results.length > 0 ? '95%' : '0%'} - ${type} extraction completed`,
        processingMethod: 'Direct GPT-4o vision analysis (proven working method)'
      }
    };
  } catch (error) {
    console.error(`Error in ${type} analysis:`, error);
    return {
      success: false,
      [type === 'menu' ? 'menuItems' : 'wines']: [],
      extractionSummary: {
        [`total${type === 'menu' ? 'Items' : 'Wines'}Found`]: 0,
        completionConfidence: '0% - processing failed',
        processingMethod: 'Direct GPT-4o vision analysis (proven working method)',
        errorMessage: error.message
      }
    };
  }
}