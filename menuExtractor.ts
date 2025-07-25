// --- START OF FILE ---

import { getMenuAnalysisPrompt } from './promptBuilder.ts';

// Get your API key
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export async function processMenuExtraction(
  imageBase64: string,
  context: any
): Promise<any> {
  const startTime = Date.now();
  console.log(`🔄 Processing menu image with direct GPT-4o approach`);
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = getMenuAnalysisPrompt();
  const imageData = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

  // Log prompt and image info
  console.log('�� [Menu] Prompt sent to OpenAI:', prompt);
  console.log('🖼️ [Menu] Base64 image size (chars):', imageBase64.length);
  try {
    const header = imageBase64.slice(0, 30);
    console.log('🖼️ [Menu] Base64 image preview:', header + '...');
  } catch (e) {}
  
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

    const data = await response.json();

    // === DIAGNOSTIC LOGGING START ===
    console.log('�� [DIAG] MENU PROMPT SENT TO OPENAI:', prompt);
    console.log('🟢 [DIAG] RAW OPENAI RESPONSE:', JSON.stringify(data, null, 2));
    // === DIAGNOSTIC LOGGING END ===

    const content = data.choices[0]?.message?.content;
    console.log('�� [DIAG] PARSED CONTENT FROM OPENAI:', content);

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
      console.log('�� [DIAG] PARSED JSON FROM OPENAI:', JSON.stringify(parsedResult, null, 2));
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    const processingTime = Date.now() - startTime;
    
    // Return structured result for menu items
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

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Menu processing FAILED in ${processingTime}ms:`, error.message);
    
    // Return empty menu items on failure
    return {
      menuItems: [],
      success: false,
      processingMethod: 'Failed',
      processingTimeMs: processingTime,
      extractionSummary: {
        totalItemsFound: 0,
        completionConfidence: '0% - processing failed',
        errorMessage: error.message
      }
    };
  }
}

// --- END OF FILE ---