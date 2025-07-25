
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UploadHeader from '@/components/UploadHeader';
import UploadInstructions from '@/components/UploadInstructions';
import UploadRestaurantContext from '@/components/upload/UploadRestaurantContext';
import UploadImageCapture from '@/components/upload/UploadImageCapture';
import UploadActions from '@/components/UploadActions';
import UnifiedProcessingModal from '@/components/UnifiedProcessingModal';
import { useUploadFlow } from '@/hooks/useUploadFlow';

const Upload = () => {
  const { user, loading, authReady } = useAuth();
  const hasCleanedUpRef = useRef(false);
  
  const {
    selectedRestaurant,
    menuImages,
    wineImages,
    totalImages,
    isProcessing,
    showProcessingPopup,
    processingStep,
    processingProgress,
    canAddMenuImage,
    canAddWineImage,
    maxImagesPerType,
    handleCameraClick,
    handleFileUpload,
    handleProcessClick,
    handleChangeRestaurant,
    removeMenuImage,
    removeWineImage,
  } = useUploadFlow();

  useEffect(() => {
    return () => {
      if (!hasCleanedUpRef.current) {
        console.log('Upload page final unmount - cleanup');
        hasCleanedUpRef.current = true;
      }
    };
  }, []);

  if (loading || !authReady || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600">
            {loading || !authReady ? 'Loading...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-96">{/* Massive bottom padding for mobile scrolling */}
      <UploadHeader />
      
      <div className="container mx-auto px-4 py-4">
        <UploadRestaurantContext 
          restaurant={selectedRestaurant}
          onChangeRestaurant={handleChangeRestaurant}
        />
        
        <UploadInstructions totalImages={totalImages} />
        
        <UploadImageCapture
          menuImages={menuImages}
          wineImages={wineImages}
          onCameraClick={handleCameraClick}
          onFileUpload={handleFileUpload}
          onRemoveMenuImage={removeMenuImage}
          onRemoveWineImage={removeWineImage}
          canAddMenuImage={canAddMenuImage}
          canAddWineImage={canAddWineImage}
          maxImagesPerType={maxImagesPerType}
        />
        
        <UploadActions 
          totalImages={totalImages}
          isProcessing={isProcessing}
          onProcessClick={handleProcessClick}
          disabled={!selectedRestaurant}
        />

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
          <div className="container mx-auto max-w-4xl space-y-3">
            {/* Main action button */}
            {totalImages > 0 ? (
              <Link to="/dishes" className="w-full">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                  disabled={isProcessing || !selectedRestaurant}
                >
                  Continue to Dish Selection
                </Button>
              </Link>
            ) : (
              <Link to="/restaurant" className="w-full">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                >
                  Select Restaurant
                </Button>
              </Link>
            )}
            
            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/restaurant" className="w-full">
                <Button variant="outline" className="w-full justify-center border border-slate-300 bg-white hover:bg-slate-50">
                  Back
                </Button>
              </Link>
              <Link to="/welcome" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <UnifiedProcessingModal
        isOpen={showProcessingPopup}
        currentStep={processingStep}
        progress={processingProgress}
        showTips={true}
        onClose={() => {}}
        onPreferencesSubmit={(preferences) => {
          console.log('User preferences collected during processing:', preferences);
          // Preferences are already stored in sessionStorage by the component
        }}
      />
    </div>
  );
};

export default Upload;
