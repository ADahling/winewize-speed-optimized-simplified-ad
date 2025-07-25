
import { convertFileToBase64 } from '@/utils/imageConverter';
import { validateImagePayload } from '@/utils/imageValidation';

export const useImageConverter = () => {
  const convertImagesToBase64 = async (
    menuImages: File[],
    wineImages: File[],
    setProcessingProgress: (progress: number) => void
  ): Promise<string[]> => {
    const allImages = [...menuImages, ...wineImages];
    
    // Validate total payload size
    validateImagePayload(allImages);

    // Convert all images to base64 with detailed progress tracking
    console.log('Converting images to base64...');
    const base64ConversionPromises = allImages.map(async (image, index) => {
      try {
        console.log(`Converting image ${index + 1}/${allImages.length}: ${image.name} (${(image.size / 1024).toFixed(0)}KB)`);
        return await convertFileToBase64(image);
      } catch (error) {
        console.error(`Failed to convert image ${index + 1}:`, error);
        throw new Error(`Failed to process image ${index + 1}: ${image.name}`);
      }
    });
    
    const base64Images = await Promise.all(base64ConversionPromises);
    console.log('All images converted to base64 successfully');
    
    setProcessingProgress(40);
    return base64Images;
  };

  return {
    convertImagesToBase64
  };
};
