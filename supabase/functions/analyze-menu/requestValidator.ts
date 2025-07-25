import type { AnalysisRequest } from './types.ts';

export interface RequestBody {
  images: string[];
  analysisType?: string;
  menuCount?: number;
  wineCount?: number;
  restaurantName?: string;
}

export interface ValidationResult {
  images: string[];
  analysisType: string;
  menuCount: number;
  wineCount: number;
  restaurantName: string;
}

// Inline Deno type declarations to avoid import issues
declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }
}

export function parseAndValidateRequest(req: Request): Promise<ValidationResult> {
  return new Promise(async (resolve, reject) => {
    console.log('=== REQUEST VALIDATION STARTED ===');
    console.log(`Request method: ${req.method}`);

    try {
      let requestBody: RequestBody;
      try {
        requestBody = await req.json();
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        reject(new Error('Invalid request format. Please ensure images are properly encoded.'));
        return;
      }

      const { 
        images, 
        analysisType = 'combined', 
        menuCount = 0, 
        wineCount = 0,
        restaurantName = 'Unknown Restaurant'
      } = requestBody;

      // Comprehensive input validation
      if (!images || !Array.isArray(images) || images.length === 0) {
        reject(new Error('Image data array is required and cannot be empty'));
        return;
      }

      if (images.length > 20) {
        reject(new Error('Maximum 20 images allowed per request'));
        return;
      }

      // Validate base64 data
      for (let i = 0; i < images.length; i++) {
        if (!images[i] || typeof images[i] !== 'string') {
          reject(new Error(`Image ${i + 1} is not valid base64 data`));
          return;
        }
        if (images[i].length < 100) {
          reject(new Error(`Image ${i + 1} appears to be invalid or corrupted`));
          return;
        }
      }

      console.log(`Processing ${images.length} images for restaurant: ${restaurantName}`);
      console.log(`Menu images: ${menuCount}, Wine images: ${wineCount}`);

      resolve({
        images,
        analysisType,
        menuCount,
        wineCount,
        restaurantName
      });
    } catch (error) {
      console.error('Request validation failed:', error);
      reject(error);
    }
  });
}
