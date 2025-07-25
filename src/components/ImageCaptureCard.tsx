
import React from 'react';
import { Camera, Upload as UploadIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageCaptureCardProps {
  type: 'menu' | 'wine';
  title: string;
  icon: React.ReactNode;
  description: string;
  capturedCount: number;
  onCameraClick: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  bgColor: string;
  borderColor: string;
  buttonColor: string;
  images: File[];
  onRemoveImage: (index: number) => void;
  canAddMore: boolean;
  maxImages: number;
}

const ImageCaptureCard = ({
  type,
  title,
  icon,
  description,
  capturedCount,
  onCameraClick,
  onFileUpload,
  bgColor,
  borderColor,
  buttonColor,
  images,
  onRemoveImage,
  canAddMore,
  maxImages
}: ImageCaptureCardProps) => {
  return (
    <div className={`${bgColor} rounded-2xl p-6 border ${borderColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 ${borderColor.replace('border-', 'bg-').replace('100', '200')} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className={`text-xl font-semibold ${borderColor.replace('border-', 'text-').replace('100', '800')}`}>
          {title}
        </h3>
      </div>
      
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mb-4">
          <h4 className={`text-sm font-medium ${borderColor.replace('border-', 'text-').replace('100', '700')} mb-2`}>
            Captured Images ({images.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`${type} image ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className={`border-2 border-dashed ${borderColor.replace('100', '300')} rounded-xl p-8 text-center bg-white/50 mb-4`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-12 h-12 ${borderColor.replace('border-', 'bg-').replace('100', '100')} rounded-full flex items-center justify-center`}>
            <Camera className={`w-6 h-6 ${borderColor.replace('border-', 'text-').replace('100', '600')}`} />
          </div>
          <div>
            <h4 className={`text-lg font-semibold ${borderColor.replace('border-', 'text-').replace('100', '800')} mb-2`}>
              Capture {type === 'menu' ? 'Menu' : 'Wine List'}
            </h4>
            <p className={`${borderColor.replace('border-', 'text-').replace('100', '600')} text-sm mb-4`}>
              {description}
            </p>
            {!canAddMore && (
              <p className="text-amber-600 text-sm font-medium mb-2">
                Maximum {maxImages} images reached
              </p>
            )}
          </div>
          <div className="space-y-2 w-full">
            <Button 
              onClick={onCameraClick}
              disabled={!canAddMore}
              className={`w-full ${canAddMore ? buttonColor : 'bg-gray-400 cursor-not-allowed'} text-white`}
            >
              <Camera className="w-4 h-4 mr-2" />
              {canAddMore ? 'Open Camera' : 'Limit Reached'}
            </Button>
            <label className={canAddMore ? "cursor-pointer" : "cursor-not-allowed"}>
              <input
                type="file"
                accept="image/*"
                onChange={onFileUpload}
                disabled={!canAddMore}
                className="hidden"
              />
              <Button 
                variant="outline" 
                disabled={!canAddMore}
                className={`w-full ${!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}`} 
                asChild
              >
                <span>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  {canAddMore ? 'Choose from Gallery' : 'Limit Reached'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      {capturedCount > 0 && (
        <div className="text-center">
          <p className={`text-sm font-medium ${borderColor.replace('border-', 'text-').replace('100', '800')}`}>
            ✓ {capturedCount} {type} image{capturedCount > 1 ? 's' : ''} captured
            {capturedCount < maxImages && (
              <span className="text-gray-500"> • {maxImages - capturedCount} more allowed</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageCaptureCard;
