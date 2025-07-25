
import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Wine, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/navigation/BackButton';

interface UploadActionsProps {
  totalImages: number;
  isProcessing: boolean;
  onProcessClick: () => void;
  disabled?: boolean;
}

const UploadActions = ({ totalImages, isProcessing, onProcessClick, disabled = false }: UploadActionsProps) => {
  const hasImages = totalImages > 0;

  return (
    <>
      {/* Process Button - Always show if there are images */}
      {hasImages && (
        <div className="text-center mb-8">
          <Button
            onClick={onProcessClick}
            disabled={isProcessing || disabled}
            className={`px-8 py-4 text-lg transition-all duration-200 ${
              isProcessing 
                ? 'bg-gray-400 opacity-50 cursor-not-allowed text-gray-600' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wine className="w-5 h-5 mr-2" />
                Process Images ({totalImages})
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default UploadActions;
