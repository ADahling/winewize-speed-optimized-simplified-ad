import { logger } from "./logger";

// Type definitions for edge function compatibility
interface OpenAI {
  chat: {
    completions: {
      create: (params: any) => Promise<any>;
    };
  };
}

interface Bucket {
  file: (name: string) => any;
}

// Define standard interfaces
interface ImageProcessingResult {
  text: string;
  isMenu: boolean;
  isWineList: boolean;
  confidence: number;
  languageCode: string;
  model: string;
}

interface VisionAnalysisResult {
  menu_items?: any[];
  wines?: any[];
  isMenu: boolean;
  isWineList: boolean;
  confidence: number;
  error?: string;
}

interface MenuProcessingStats {
  totalProcessingTime: number;
  ocrTime?: number;
  visionTime?: number;
  analysisTime?: number;
  ocrCharacterCount?: number;
  promptTokens?: number;
  completionTokens?: number;
  success: boolean;
}

// Main image processing function
export const processImage = async (
  imageUrl: string,
  openai: OpenAI,
  ocrFirst: boolean = true,
  prioritizeVision: boolean = false,
  bucket?: Bucket
): Promise<{ result: any; stats: MenuProcessingStats }> => {
  const startTime = Date.now();
  const stats: MenuProcessingStats = {
    totalProcessingTime: 0,
    success: false
  };

  try {
    // Choose the right processing approach based on parameters
    let result;

    if (prioritizeVision) {
      // Vision-first approach
      result = await processWithVision(imageUrl, openai, stats);
    } else if (ocrFirst) {
      // OCR-first with Vision fallback approach
      const ocrResult = await processWithOCR(imageUrl, openai, stats);
      
      // If OCR is confident, use that result
      if (ocrResult.confidence >= 0.7 && ocrResult.text.length > 100) {
        result = await analyzeExtractedText(ocrResult, openai, stats);
      } else {
        // Fall back to vision if OCR confidence is low
        logger.info("OCR confidence low, falling back to vision analysis");
        result = await processWithVision(imageUrl, openai, stats);
      }
    } else {
      // Vision-only approach
      result = await processWithVision(imageUrl, openai, stats);
    }

    stats.totalProcessingTime = Date.now() - startTime;
    stats.success = true;
    
    return { result, stats };
  } catch (error) {
    logger.error("Error processing image", error);
    stats.totalProcessingTime = Date.now() - startTime;
    stats.success = false;
    
    return {
      result: {
        isMenu: false,
        isWineList: false,
        confidence: 0,
        error: error.message
      },
      stats
    };
  }
}

// OCR-based processing path
const processWithOCR = async (
  imageUrl: string,
  openai: OpenAI,
  stats: MenuProcessingStats
): Promise<ImageProcessingResult> => {
  const ocrStartTime = Date.now();
  
  try {
    // Use gpt-3.5-turbo for OCR processing
    const ocrResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert OCR system. Extract all text from the image, preserving format where possible. 
          After extracting text, determine if this is likely a restaurant menu, a wine list, or something else.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please extract all text from this image and determine if it's a menu or wine list:" },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1500
    });

    const ocrText = ocrResponse.choices[0]?.message?.content || "";
    stats.ocrTime = Date.now() - ocrStartTime;
    stats.ocrCharacterCount = ocrText.length;
    
    // Analyze the text to determine if it's a menu or wine list
    const isMenu = /appetizer|entr[ée]e|main course|dessert|side|salad|soup|dish/i.test(ocrText);
    const isWineList = /wine|cabernet|merlot|chardonnay|sauvignon|pinot|champagne|bottle|glass/i.test(ocrText);
    
    // Calculate confidence based on relevant keywords and text length
    let confidence = 0.5;
    
    if (ocrText.length > 500) confidence += 0.2;
    if (isMenu && !isWineList) confidence += 0.2;
    if (isWineList && !isMenu) confidence += 0.2;
    if (isMenu && isWineList) confidence -= 0.1;
    
    return {
      text: ocrText,
      isMenu,
      isWineList,
      confidence: Math.min(confidence, 0.95),
      languageCode: "en",
      model: "gpt-3.5-turbo"
    };
  } catch (error) {
    logger.error("OCR processing failed", error);
    stats.ocrTime = Date.now() - ocrStartTime;
    
    return {
      text: "",
      isMenu: false,
      isWineList: false,
      confidence: 0,
      languageCode: "en",
      model: "gpt-3.5-turbo"
    };
  }
}

// Vision-based processing path
const processWithVision = async (
  imageUrl: string,
  openai: OpenAI,
  stats: MenuProcessingStats
): Promise<VisionAnalysisResult> => {
  const visionStartTime = Date.now();
  
  try {
    // Analyze with GPT-4 Vision directly
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert restaurant menu and wine list analyzer. Analyze the provided image and extract structured data.
          
          For menus: Extract dish names, descriptions, prices, and categorize by type (appetizer, main, etc.).
          For wine lists: Extract wine names, vintages, varietals, regions, and prices.
          
          Determine if this is a restaurant menu, wine list, or something else.`
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Please analyze this image. If it's a restaurant menu, extract all dishes with details. 
              If it's a wine list, extract all wines with details. Provide your response as JSON.` 
            },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content || "";
    stats.visionTime = Date.now() - visionStartTime;

    try {
      const parsedResult = JSON.parse(content);
      
      return {
        menu_items: parsedResult.menu_items || parsedResult.dishes || [],
        wines: parsedResult.wines || [],
        isMenu: parsedResult.isMenu || (parsedResult.menu_items || parsedResult.dishes || []).length > 0,
        isWineList: parsedResult.isWineList || (parsedResult.wines || []).length > 0,
        confidence: parsedResult.confidence || 0.8
      };
    } catch (error) {
      logger.error("Failed to parse vision analysis result", error);
      return {
        isMenu: false,
        isWineList: false,
        confidence: 0.3,
        error: "Failed to parse vision analysis result"
      };
    }
  } catch (error) {
    logger.error("Vision analysis failed", error);
    stats.visionTime = Date.now() - visionStartTime;
    
    return {
      isMenu: false,
      isWineList: false,
      confidence: 0,
      error: error.message
    };
  }
}

// Analyze extracted text to identify menu items and wines
const analyzeExtractedText = async (
  ocrResult: ImageProcessingResult,
  openai: OpenAI,
  stats: MenuProcessingStats
): Promise<VisionAnalysisResult> => {
  const analysisStartTime = Date.now();
  
  try {
    // Skip analysis if text is too short or seems unrelated to menus/wines
    if (ocrResult.text.length < 50 || (!ocrResult.isMenu && !ocrResult.isWineList)) {
      return {
        isMenu: ocrResult.isMenu,
        isWineList: ocrResult.isWineList,
        confidence: ocrResult.confidence,
        menu_items: [],
        wines: []
      };
    }
    
    // Prepare a prompt based on what type of content we think it is
    let systemPrompt = "";
    if (ocrResult.isMenu && ocrResult.isWineList) {
      systemPrompt = `You are a restaurant menu and wine list analyzer. Extract dishes and wines from the text.`;
    } else if (ocrResult.isMenu) {
      systemPrompt = `You are a restaurant menu analyzer. Extract all dishes with their details from the text.`;
    } else if (ocrResult.isWineList) {
      systemPrompt = `You are a wine list analyzer. Extract all wines with their details from the text.`;
    } else {
      systemPrompt = `You are a text analyzer for restaurant menus and wine lists. Determine if this contains menu items or wines.`;
    }
    
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Please analyze this text extracted from an image and extract structured data for all items found. 
          Return your response as JSON with arrays for menu_items and/or wines.
          
          The extracted text is:
          ${ocrResult.text}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });
    
    const content = analysisResponse.choices[0]?.message?.content || "";
    stats.analysisTime = Date.now() - analysisStartTime;
    
    try {
      const parsedResult = JSON.parse(content);
      
      return {
        menu_items: parsedResult.menu_items || parsedResult.dishes || [],
        wines: parsedResult.wines || [],
        isMenu: parsedResult.isMenu || (parsedResult.menu_items || parsedResult.dishes || []).length > 0,
        isWineList: parsedResult.isWineList || (parsedResult.wines || []).length > 0,
        confidence: parsedResult.confidence || ocrResult.confidence
      };
    } catch (error) {
      logger.error("Failed to parse text analysis result", error);
      return {
        isMenu: ocrResult.isMenu,
        isWineList: ocrResult.isWineList,
        confidence: ocrResult.confidence * 0.7,
        error: "Failed to parse text analysis result"
      };
    }
  } catch (error) {
    logger.error("Text analysis failed", error);
    stats.analysisTime = Date.now() - analysisStartTime;
    
    return {
      isMenu: ocrResult.isMenu,
      isWineList: ocrResult.isWineList,
      confidence: ocrResult.confidence * 0.5,
      error: error.message
    };
  }
}

// Create a simple hash for caching (browser-compatible)
export const createImageHash = (imageUrl: string): string => {
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    const char = imageUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

// Additional exports needed by other files
export const uploadImageToStorage = async (file: File, path: string): Promise<string> => {
  // Placeholder implementation - replace with actual storage logic
  return Promise.resolve(URL.createObjectURL(file));
};

export const convertFileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please use JPEG, PNG, or WebP.' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large. Maximum size is 10MB.' };
  }

  return { isValid: true };
};

