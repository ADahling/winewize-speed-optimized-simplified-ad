import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useProcessingResults = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProcessingSuccess = (
    data: any,
    setProcessingProgress: (progress: number) => void,
    setProcessingStep: (step: string) => void,
    setShowProcessingPopup: (show: boolean) => void
  ) => {
    setProcessingProgress(100);
    setProcessingStep('complete');
    
    console.log('=== PROCESSING SUCCESS ===');
    console.log('Results:', {
      menuItems: data.menuItems?.length || 0,
      wines: data.wines?.length || 0,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName
    });
    
    // Store restaurant information for dishes page
    if (data.restaurantId && data.restaurantName) {
      localStorage.setItem('currentRestaurantId', data.restaurantId);
      localStorage.setItem('currentRestaurantName', data.restaurantName);
      console.log(`Stored restaurant info: ${data.restaurantName} (${data.restaurantId})`);
    } else {
      console.error('Missing restaurant information in response:', data);
      throw new Error('Invalid response: missing restaurant information');
    }
    
    // Clear legacy localStorage data since we're now using database
    localStorage.removeItem('availableWines');
    localStorage.removeItem('menuItems');
    
    // CRITICAL: Set wineProcessingComplete in sessionStorage and dispatch event
    sessionStorage.setItem('wineProcessingComplete', 'true');
    window.dispatchEvent(new Event('wineProcessingComplete'));
    
    // Small delay to show completion
    setTimeout(() => {
      setShowProcessingPopup(false);
      
      // Only navigate if we have valid data
      if (data.restaurantId && (data.menuItems?.length > 0 || data.wines?.length > 0)) {
        toast({
          title: "Processing complete!",
          description: `Found ${data.menuItems?.length || 0} dishes and ${data.wines?.length || 0} wines`,
        });
        
        console.log('Navigating to dishes page with fresh data');
        navigate('/dishes');
      } else {
        console.error('Cannot navigate: insufficient data');
        throw new Error('Processing completed but insufficient data was saved');
      }
    }, 1000);
  };

  const handleProcessingError = (
    error: any,
    processingSucceeded: boolean,
    setShowProcessingPopup: (show: boolean) => void
  ) => {
    setShowProcessingPopup(false);
    toast({
      title: "Processing failed",
      description: error?.message || "An error occurred during processing.",
      variant: "destructive",
    });
  };

  return {
    handleProcessingSuccess,
    handleProcessingError,
  };
};