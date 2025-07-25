
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MAX_IMAGES_PER_TYPE = 5;

export const useUploadState = () => {
  const { user } = useAuth();
  
  // Enhanced image management with limits
  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [wineImages, setWineImages] = useState<File[]>([]);
  
  // Simplified UI state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'menu' | 'wine'>('menu');
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [userBudget, setUserBudget] = useState<number>(50);

  // Fetch user preferences on component mount
  useEffect(() => {
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  const fetchUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('wine_preferences')
        .select('budget')
        .eq('user_id', user?.id)
        .single();

      if (data && !error) {
        setUserBudget(data.budget);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  // Enhanced setters with limit validation
  const setMenuImagesWithLimit = (images: File[] | ((prev: File[]) => File[])) => {
    if (typeof images === 'function') {
      setMenuImages(prev => {
        const newImages = images(prev);
        return newImages.slice(0, MAX_IMAGES_PER_TYPE);
      });
    } else {
      setMenuImages(images.slice(0, MAX_IMAGES_PER_TYPE));
    }
  };

  const setWineImagesWithLimit = (images: File[] | ((prev: File[]) => File[])) => {
    if (typeof images === 'function') {
      setWineImages(prev => {
        const newImages = images(prev);
        return newImages.slice(0, MAX_IMAGES_PER_TYPE);
      });
    } else {
      setWineImages(images.slice(0, MAX_IMAGES_PER_TYPE));
    }
  };

  // Remove individual image functions
  const removeMenuImage = (index: number) => {
    setMenuImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeWineImage = (index: number) => {
    setWineImages(prev => prev.filter((_, i) => i !== index));
  };

  // Check if can add more images
  const canAddMenuImage = menuImages.length < MAX_IMAGES_PER_TYPE;
  const canAddWineImage = wineImages.length < MAX_IMAGES_PER_TYPE;

  const totalImages = menuImages.length + wineImages.length;

  return {
    // State
    menuImages,
    wineImages,
    showCamera,
    cameraType,
    isProcessing,
    userBudget,
    totalImages,
    canAddMenuImage,
    canAddWineImage,
    maxImagesPerType: MAX_IMAGES_PER_TYPE,
    
    // Setters with limits
    setMenuImages: setMenuImagesWithLimit,
    setWineImages: setWineImagesWithLimit,
    setShowCamera,
    setCameraType,
    setIsProcessing,
    setUserBudget,
    
    // Image management
    removeMenuImage,
    removeWineImage,
  };
};
