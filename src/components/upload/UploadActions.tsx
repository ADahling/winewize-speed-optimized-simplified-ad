
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UploadActionsProps {
  onFileSelect: () => void;
  isUploading: boolean;
  hasImages: boolean;
  onSelectRestaurant?: () => void;
  showSelectRestaurant?: boolean;
}

const UploadActions: React.FC<UploadActionsProps> = ({
  onFileSelect,
  isUploading,
  hasImages,
  onSelectRestaurant,
  showSelectRestaurant = false
}) => {
  return (
    <div className="space-y-4">
      {showSelectRestaurant && onSelectRestaurant && (
        <Button
          onClick={onSelectRestaurant}
          variant="outline"
          className="w-full border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all duration-300 px-3 py-3 rounded-xl font-semibold whitespace-normal break-words text-center min-w-0"
        >
          <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="leading-tight">Select Restaurant</span>
        </Button>
      )}
      
      <Button
        onClick={onFileSelect}
        disabled={isUploading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:opacity-50"
      >
        <Upload className="w-5 h-5 mr-2 flex-shrink-0" />
        <span className="leading-tight">
          {isUploading ? 'Uploading...' : hasImages ? 'Add More Images' : 'Upload Images'}
        </span>
      </Button>
    </div>
  );
};

export default UploadActions;
