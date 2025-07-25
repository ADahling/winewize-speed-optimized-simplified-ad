
import { logger } from './logger';

export interface OptimizedImage {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export const optimizeImage = async (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<OptimizedImage> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      // PHASE 2 SPEED OPTIMIZATION: Aggressive size reduction for OCR
      // Target max 800px for maximum OCR speed (testing shows this is optimal)
      const targetMaxWidth = 800;
      const targetMaxHeight = 800;
      
      // Always resize to optimal dimensions for processing speed
      if (width > targetMaxWidth || height > targetMaxHeight) {
        const ratio = Math.min(targetMaxWidth / width, targetMaxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Enhanced image processing for better OCR results
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // More aggressive quality optimization for speed
      const finalQuality = file.size > 1 * 1024 * 1024 ? 0.4 : 0.6; // More aggressive compression
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            logger.info('Image optimization complete', { 
              fileName: file.name,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: Math.round((1 - blob.size / file.size) * 100)
            });

            resolve({
              file: optimizedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: Math.round((1 - blob.size / file.size) * 100)
            });
          }
        },
        'image/jpeg',
        finalQuality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export const validateImageQuality = async (file: File): Promise<{ isValid: boolean; feedback?: string }> => {
  // Enhanced validation with size limits
  if (file.size > 50 * 1024 * 1024) { // 50MB absolute limit
    return { isValid: false, feedback: "Image file is too large (max 50MB). Please use a smaller image." };
  }

  if (!file.type.startsWith('image/')) {
    return { isValid: false, feedback: "Please select a valid image file" };
  }

  // Auto-approve most images to eliminate quality check popup delays
  return { isValid: true };
};
