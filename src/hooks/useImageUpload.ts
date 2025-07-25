
import { useToast } from '@/hooks/use-toast';
import { validateImageFile } from '@/utils/imageProcessor';
import { optimizeImage, validateImageQuality } from '@/utils/imageOptimizer';

export const useImageUpload = () => {
  const { toast } = useToast();

  const handleCameraCapture = async (
    file: File, 
    type: 'menu' | 'wine',
    menuImages: File[],
    wineImages: File[],
    setMenuImages: (images: File[]) => void,
    setWineImages: (images: File[]) => void
  ) => {
    try {
      console.log(`Processing ${type} image capture:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const validation = validateImageFile(file);
      if (!validation.isValid) {
        console.error('Image validation failed:', validation.error);
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      // Automatic quality validation for camera captures
      const qualityCheck = await validateImageQuality(file);
      if (!qualityCheck.isValid) {
        console.error('Image quality check failed:', qualityCheck.feedback);
        toast({
          title: "Image quality issue",
          description: qualityCheck.feedback,
          variant: "destructive",
        });
        return;
      }

      // Optimize image with enhanced logging
      console.log('Starting image optimization for camera capture...');
      toast({
        title: "Processing photo...",
        description: "Optimizing captured image",
      });

      // More aggressive optimization for camera captures (usually larger)
      const maxWidth = file.size > 3 * 1024 * 1024 ? 1280 : 1920;
      const quality = file.size > 3 * 1024 * 1024 ? 0.7 : 0.8;
      
      const optimized = await optimizeImage(file, maxWidth, 1080, quality);
      console.log('Camera image optimization complete:', {
        originalSize: file.size,
        optimizedSize: optimized.file.size,
        compressionRatio: optimized.compressionRatio
      });
      
      // Additional size check after optimization
      if (optimized.file.size > 8 * 1024 * 1024) {
        console.error('Optimized camera image still too large:', optimized.file.size);
        toast({
          title: "Image too large",
          description: "Please retake the photo or reduce image quality",
          variant: "destructive",
        });
        return;
      }
      
      // Store the optimized file
      if (type === 'menu') {
        const newMenuImages = [...menuImages, optimized.file];
        setMenuImages(newMenuImages);
        console.log(`Added menu image from camera. Total menu images: ${newMenuImages.length}`);
      } else {
        const newWineImages = [...wineImages, optimized.file];
        setWineImages(newWineImages);
        console.log(`Added wine image from camera. Total wine images: ${newWineImages.length}`);
      }

      toast({
        title: "Photo captured!",
        description: `${type === 'menu' ? 'Menu' : 'Wine list'} image processed successfully`,
      });

    } catch (error) {
      console.error('Error handling camera capture:', error);
      toast({
        title: "Capture failed",
        description: "Failed to process captured photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    handleCameraCapture,
  };
};
