// --- START OF FILE ---

import { getMenuAnalysisPrompt } from './promptBuilder.ts';
import { callExtractionService } from '../src/services/extractionService.ts';

export async function processMenuExtraction(
  imageBase64: string,
  context: any
): Promise<any> {
  const startTime = Date.now();
  console.log(`🔄 Processing menu image with extraction service`);

  const prompt = getMenuAnalysisPrompt();

  try {
    const data = await callExtractionService(imageBase64, prompt);

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
    
    console.log(`🍽️ Providing fallback menu items after processing failure`);
    const fallbackResult = generateFallbackMenuItems();
    fallbackResult.diagnostics = {
      processingTimeMs: processingTime,
      errorCode: 'GPT4O_PROCESSING_ERROR',
      originalError: error.message,
      fallbackUsed: true
    };
    return fallbackResult;
  }
}

// Fallback menu item generation
function generateFallbackMenuItems(): any {
  console.log(`🍽️ Generating fallback menu items`);
  const fallbackItems = [
    {
      "itemName": "Fallback Steak",
      "description": "A default steak option.",
      "price": "30",
      "category": "Main Course"
    },
    {
      "itemName": "Fallback Salad",
      "description": "A default salad option.",
      "price": "15",
      "category": "Appetizer"
    }
  ];
  return {
    success: true,
    menuItems: fallbackItems,
    processingMethod: 'Fallback Menu Generation',
    extractionSummary: {
      totalItemsFound: fallbackItems.length,
      completionConfidence: '100% (fallback)',
      note: 'Menu list processing failed, providing generic options'
    }
  };
}
// --- END OF FILE ---