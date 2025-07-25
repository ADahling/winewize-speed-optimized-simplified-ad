
import { useImageUpload } from './useImageUpload';
import { useRestaurantDrivenUpload } from './useRestaurantDrivenUpload';

export const useUploadLogic = () => {
  const { handleCameraCapture } = useImageUpload();
  const {
    isProcessing,
    showProcessingPopup,
    processingStep,
    processingProgress,
    processImagesForSession,
    setShowProcessingPopup
  } = useRestaurantDrivenUpload();

  return {
    // Image capture
    handleCameraCapture,
    
    // Restaurant-driven processing
    isProcessing,
    showProcessingPopup,
    processingStep,
    processingProgress,
    processImagesForSession,
    setShowProcessingPopup,
  };
};
