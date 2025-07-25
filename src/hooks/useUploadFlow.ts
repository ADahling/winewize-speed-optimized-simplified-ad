import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUploadState } from '@/hooks/useUploadState';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSessionOnlyMode } from '@/hooks/useSessionOnlyMode';
import { useWineProcessingState } from './useWineProcessingState';
import { supabase } from '@/integrations/supabase/client';

export const useUploadFlow = () => {
  const { user, loading, authReady } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSessionOnly, getSessionRestaurant } = useSessionOnlyMode();
  const { setWineProcessingComplete } = useWineProcessingState();

  const {
    menuImages,
    wineImages,
    totalImages,
    userBudget,
    canAddMenuImage,
    canAddWineImage,
    maxImagesPerType,
    setMenuImages,
    setWineImages,
    removeMenuImage,
    removeWineImage,
  } = useUploadState();

  const { handleCameraCapture } = useImageUpload();

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessingPopup, setShowProcessingPopup] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Get restaurant context
  const [selectedRestaurant, setSelectedRestaurant] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    if (!isSessionOnly && user && !selectedRestaurant) {
      const restaurantId = localStorage.getItem('currentRestaurantId');
      const restaurantName = localStorage.getItem('currentRestaurantName');
      if (restaurantId && restaurantName) {
        setSelectedRestaurant({ id: restaurantId, name: restaurantName });
      }
    }
  }, [isSessionOnly, user, selectedRestaurant]);

  // FIX: Add handleFileUpload function
  const handleFileUpload = (type: 'menu' | 'wine', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // You may want to add validation here if needed

    if (type === 'menu') {
      setMenuImages(prev => [...prev, file]);
    } else {
      setWineImages(prev => [...prev, file]);
    }

    event.target.value = '';
  };

  const handleProcessClick = async () => {
    try {
      setIsProcessing(true);
      setShowProcessingPopup(true);
      setProcessingStep('Analyzing images...');
      setProcessingProgress(10);

      // Build payload for edge function
      const payload: any = {
        menuImages,
        wineImages,
        restaurantName: isSessionOnly ? 'Session Restaurant' : selectedRestaurant?.name,
        restaurantId: isSessionOnly ? 'session-only' : selectedRestaurant?.id,
        persistMode: isSessionOnly ? 'session' : 'database',
        extractionMethod: 'section',
        useOCR: true,
      };

      // Get the user's access token
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;

      // Call Supabase edge function with Authorization header
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-menu-unified', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: payload
      });

      if (analysisError || !analysisData?.success) {
        throw new Error(analysisData?.error || 'Image analysis failed');
      }

      const menuItemsCount = analysisData.menuItems?.length || 0;
      const winesCount = analysisData.wines?.length || 0;

      if (menuItemsCount === 0 && winesCount === 0) {
        throw new Error('No menu items or wines found in images');
      }

      // Store ALL results at once - no background processing needed
      const sessionResults = {
        menuItems: analysisData.menuItems || [],
        wines: analysisData.wines || [],
        restaurantName: isSessionOnly ? 'Session Restaurant' : selectedRestaurant?.name,
        restaurantId: isSessionOnly ? 'session-only' : selectedRestaurant?.id,
        timestamp: Date.now(),
        sessionOnly: isSessionOnly
      };

      sessionStorage.setItem('currentSessionResults', JSON.stringify(sessionResults));
      sessionStorage.setItem('currentSessionRestaurant', JSON.stringify({
        id: isSessionOnly ? 'session-only' : selectedRestaurant?.id,
        name: isSessionOnly ? 'Session Restaurant' : selectedRestaurant?.name
      }));

      // CRITICAL: Set wineProcessingComplete in BOTH sessionStorage and React state
      sessionStorage.setItem('wineProcessingComplete', 'true');
      setWineProcessingComplete(true);
      window.dispatchEvent(new Event('wineProcessingComplete'));

      setProcessingProgress(100);
      setShowProcessingPopup(false);
      setIsProcessing(false);

      toast({
        title: "Processing complete!",
        description: `Found ${menuItemsCount} dishes and ${winesCount} wines`,
      });

      // Navigate to dishes page
      navigate('/dishes');
      console.log('🔄 [UploadFlow] EXIT: handleProcessClick success');
    } catch (error: any) {
      setShowProcessingPopup(false);
      setIsProcessing(false);
      toast({
        title: "Processing failed",
        description: error?.message || "An error occurred during processing.",
        variant: "destructive",
      });
    }
  };

  return {
    menuImages,
    wineImages,
    totalImages,
    userBudget,
    canAddMenuImage,
    canAddWineImage,
    maxImagesPerType,
    setMenuImages,
    setWineImages,
    removeMenuImage,
    removeWineImage,
    handleCameraCapture,
    handleFileUpload, // <-- Ensure this is returned!
    isProcessing,
    showProcessingPopup,
    processingStep,
    processingProgress,
    handleProcessClick,
    selectedRestaurant,
    setSelectedRestaurant,
  };
};