
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import UploadImageCapture from './UploadImageCapture';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { uploadImageToStorage, convertFileToBase64, validateImageFile } from '@/utils/imageProcessor';

interface RestaurantUploadFlowProps {
  restaurantId: string;
  restaurantName: string;
  onUploadComplete?: () => void;
}

const RestaurantUploadFlow = ({ restaurantId, restaurantName, onUploadComplete }: RestaurantUploadFlowProps) => {
  const [menuImages, setMenuImages] = useState<File[]>([]);
  const [wineImages, setWineImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const maxImagesPerType = 3;

  const handleCameraClick = useCallback((type: 'menu' | 'wine') => {
    // Use native camera via file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      if (type === 'menu') {
        setMenuImages(prev => [...prev, file]);
      } else if (type === 'wine') {
        setWineImages(prev => [...prev, file]);
      }

      toast.success(`${type === 'menu' ? 'Menu' : 'Wine list'} image captured successfully!`);
    };
    
    input.click();
  }, []);

  const handleFileUpload = useCallback((type: 'menu' | 'wine', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    if (type === 'menu') {
      setMenuImages(prev => [...prev, file]);
    } else {
      setWineImages(prev => [...prev, file]);
    }

    toast.success(`${type === 'menu' ? 'Menu' : 'Wine list'} image added successfully!`);
    event.target.value = '';
  }, []);

  const handleRemoveMenuImage = useCallback((index: number) => {
    setMenuImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveWineImage = useCallback((index: number) => {
    setWineImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadAndProcess = useCallback(async () => {
    if (!user || (!menuImages.length && !wineImages.length)) {
      toast.error('Please add at least one image before processing');
      return;
    }

    setIsUploading(true);

    try {
      // Convert images to base64 for processing
      const imagePromises = [];
      
      for (const image of menuImages) {
        imagePromises.push({
          type: 'menu' as const,
          base64: await convertFileToBase64(image)
        });
      }
      
      for (const image of wineImages) {
        imagePromises.push({
          type: 'wine' as const,
          base64: await convertFileToBase64(image)
        });
      }

      const processedImages = await Promise.all(imagePromises);

      // Call the analyze-menu-unified edge function
      const { data, error } = await supabase.functions.invoke('analyze-menu-unified', {
        body: {
          menuImages: processedImages,
          wineImages: [],
          restaurantName,
          persistMode: 'database',
          restaurantId,
          userId: user.id
        }
      });

      if (error) {
        console.error('Menu analysis failed:', error);
        throw error;
      }

      console.log('Menu analysis completed:', data);
      toast.success('Images processed successfully! Menu data has been extracted.');
      
      // Clear images after successful processing
      setMenuImages([]);
      setWineImages([]);
      
      // Call completion callback
      onUploadComplete?.();

    } catch (error) {
      console.error('Upload and processing failed:', error);
      toast.error('Failed to process images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [user, menuImages, wineImages, restaurantId, restaurantName, onUploadComplete]);

  const canAddMenuImage = menuImages.length < maxImagesPerType;
  const canAddWineImage = wineImages.length < maxImagesPerType;

  return (
    <div className="space-y-6">
      <UploadImageCapture
        menuImages={menuImages}
        wineImages={wineImages}
        onCameraClick={handleCameraClick}
        onFileUpload={handleFileUpload}
        onRemoveMenuImage={handleRemoveMenuImage}
        onRemoveWineImage={handleRemoveWineImage}
        canAddMenuImage={canAddMenuImage}
        canAddWineImage={canAddWineImage}
        maxImagesPerType={maxImagesPerType}
      />

      {(menuImages.length > 0 || wineImages.length > 0) && (
        <div className="text-center">
          <button
            onClick={handleUploadAndProcess}
            disabled={isUploading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Processing Images...' : 'Process Menu Images'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantUploadFlow;
