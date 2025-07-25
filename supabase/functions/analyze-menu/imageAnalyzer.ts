// Inline Deno type declarations to avoid import issues
declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }
}

import { menuAnalysisPrompt, wineListAnalysisPrompt } from './prompts.ts';
import { parseAnalysisResult } from './jsonProcessor.ts';
import { processImageForAnalysis } from './jsonProcessor.ts';
import { validateAnalysisResults } from './dataValidator.ts';
import type { AnalysisRequest, AnalysisResult } from './types.ts';

export async function analyzeImageChunk(imageBase64: string, analysisType: string, chunkIndex: number = 0, totalChunks: number = 1) {
  const basePrompt = analysisType === 'wine' ? wineListAnalysisPrompt : menuAnalysisPrompt;
  
  let prompt = basePrompt;
  if (totalChunks > 1) {
    prompt += `\n\nCRITICAL: This is chunk ${chunkIndex + 1} of ${totalChunks}. You MUST extract EVERY visible item from this section. Do not assume other chunks will handle any items - extract ALL items you can see in this image section.`;
  }
  
  console.log(`Starting analysis for ${analysisType} chunk ${chunkIndex + 1}/${totalChunks}`);
  
  const requestPayload = {
    model: 'gpt-4o', // High-powered model for maximum accuracy
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
              detail: 'high' // Maximum detail for text recognition
            }
          }
        ]
      }
    ],
    max_tokens: 8000, // Increased significantly for large menus
    temperature: 0.1, // Low temperature for consistent extraction
    response_format: { "type": "json_object" } // Enforce JSON response
  };

  console.log(`Making OpenAI API request for ${analysisType} chunk ${chunkIndex + 1}/${totalChunks}`);

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
    console.error(`OpenAI API error for ${analysisType} chunk ${chunkIndex + 1}:`, {
      status: response.status,
      statusText: response.statusText,
      error: errorText
    });
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error(`Invalid OpenAI response structure for ${analysisType} chunk ${chunkIndex + 1}:`, data);
    throw new Error(`Invalid response structure from OpenAI API`);
  }
  
  const analysisResult = data.choices[0].message.content;
  
  console.log(`Completed analysis for ${analysisType} chunk ${chunkIndex + 1}/${totalChunks}`, {
    responseLength: analysisResult.length,
    tokensUsed: data.usage || 'unknown'
  });
  
  // Log token usage for monitoring
  if (data.usage) {
    console.log(`Token usage - Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`);
  }
  
  try {
    return parseAnalysisResult(analysisResult, analysisType, chunkIndex);
  } catch (parseError) {
    console.error(`Failed to parse analysis result for ${analysisType} chunk ${chunkIndex + 1}:`, {
      error: parseError.message,
      rawResult: analysisResult.substring(0, 500) + '...'
    });
    throw new Error(`Failed to parse ${analysisType} analysis result: ${parseError.message}`);
  }
}

// Enhanced parallel processing with better error handling
export async function analyzeImagesInParallel(images: string[], analysisType: string) {
  try {
    console.log(`Starting parallel analysis of ${images.length} ${analysisType} images`);
    
    // Process all images in parallel with enhanced error handling
    const analysisPromises = images.map(async (imageBase64, index) => {
      try {
        console.log(`Processing ${analysisType} image ${index + 1}/${images.length}`);
        return await analyzeImageChunk(imageBase64, analysisType, index, images.length);
      } catch (error) {
        console.error(`Failed to analyze ${analysisType} image ${index + 1}:`, error);
        // Return empty result instead of failing completely
        return {
          [analysisType === 'menu' ? 'menuItems' : 'wines']: [],
          extractionSummary: {
            [`total${analysisType === 'menu' ? 'Items' : 'Wines'}Found`]: 0,
            [`${analysisType === 'menu' ? 'sections' : 'categories'}Processed`]: [],
            completionConfidence: "0% - processing failed",
            errorMessage: error.message
          }
        };
      }
    });
    
    const results = await Promise.all(analysisPromises);
    console.log(`Completed parallel analysis of ${images.length} ${analysisType} images`);
    
    // Combine results with detailed logging
    const combinedItems = results.flatMap(result => result.menuItems || result.wines || []);
    const totalExtracted = combinedItems.length;
    
    // Count successful vs failed analyses
    const successfulAnalyses = results.filter(result => 
      (result.menuItems && result.menuItems.length > 0) || 
      (result.wines && result.wines.length > 0)
    ).length;
    
    const failedAnalyses = images.length - successfulAnalyses;
    
    console.log(`Analysis summary for ${analysisType}:`, {
      totalImages: images.length,
      successfulAnalyses,
      failedAnalyses,
      totalItemsExtracted: totalExtracted
    });
    
    // Log extraction summaries if available
    results.forEach((result, index) => {
      if (result.extractionSummary) {
        console.log(`Image ${index + 1} summary:`, result.extractionSummary);
      }
    });
    
    // If all analyses failed, throw an error
    if (totalExtracted === 0 && images.length > 0) {
      throw new Error(`All ${analysisType} image analyses failed. No items could be extracted.`);
    }
    
    return {
      [analysisType === 'menu' ? 'menuItems' : 'wines']: combinedItems,
      totalExtracted,
      imageCount: images.length,
      successfulAnalyses,
      failedAnalyses
    };
  } catch (error) {
    console.error(`Critical error in parallel ${analysisType} analysis:`, error);
    throw error;
  }
}

export async function analyzeImage(imageBase64: string, analysisType: string) {
  // Fallback for single image processing with enhanced error handling
  try {
    return await analyzeImageChunk(imageBase64, analysisType, 0, 1);
  } catch (error) {
    console.error(`Failed to analyze single ${analysisType} image:`, error);
    throw error;
  }
}
