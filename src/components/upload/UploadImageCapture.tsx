
import React from 'react';
import { Camera, Upload, Trash2, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadImageCaptureProps {
  menuImages: File[];
  wineImages: File[];
  onCameraClick: (type: 'menu' | 'wine') => void;
  onFileUpload: (type: 'menu' | 'wine', event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMenuImage: (index: number) => void;
  onRemoveWineImage: (index: number) => void;
  canAddMenuImage: boolean;
  canAddWineImage: boolean;
  maxImagesPerType: number;
}

const UploadImageCapture: React.FC<UploadImageCaptureProps> = ({
  menuImages,
  wineImages,
  onCameraClick,
  onFileUpload,
  onRemoveMenuImage,
  onRemoveWineImage,
  canAddMenuImage,
  canAddWineImage,
  maxImagesPerType,
}) => {
  const handleNativeCamera = (type: 'menu' | 'wine') => {
    onCameraClick(type);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Menu Images Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileImage className="w-5 h-5" />
          Menu Images ({menuImages.length}/{maxImagesPerType})
        </h3>
        
        {/* Menu Images Preview Inside Card */}
        {menuImages.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {menuImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Menu ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => onRemoveMenuImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={() => handleNativeCamera('menu')}
            disabled={!canAddMenuImage}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo of Menu
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload('menu', e)}
              disabled={!canAddMenuImage}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <Button
              variant="outline"
              disabled={!canAddMenuImage}
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Menu Photo
            </Button>
          </div>
        </div>
        
        {!canAddMenuImage && (
          <p className="text-sm text-slate-500 mt-2">
            Maximum {maxImagesPerType} menu images allowed
          </p>
        )}
      </div>

      {/* Wine List Images Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileImage className="w-5 h-5" />
          Wine List Images ({wineImages.length}/{maxImagesPerType})
        </h3>
        
        {/* Wine Images Preview Inside Card */}
        {wineImages.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {wineImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={URL.createObjectURL(image)} 
                    alt={`Wine list ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => onRemoveWineImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={() => handleNativeCamera('wine')}
            disabled={!canAddWineImage}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo of Wine List
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload('wine', e)}
              disabled={!canAddWineImage}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <Button
              variant="outline"
              disabled={!canAddWineImage}
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Wine List Photo
            </Button>
          </div>
        </div>
        
        {!canAddWineImage && (
          <p className="text-sm text-slate-500 mt-2">
            Maximum {maxImagesPerType} wine list images allowed
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadImageCapture;
