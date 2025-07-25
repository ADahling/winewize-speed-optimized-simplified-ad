
import React from 'react';
import { AlertTriangle, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UploadQualityHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAnyway: () => void;
  onRetakePhoto: () => void;
  feedback?: string;
}

const UploadQualityHandler = ({
  isOpen,
  onClose,
  onContinueAnyway,
  onRetakePhoto,
  feedback
}: UploadQualityHandlerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Image Quality Check
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">
              Image Quality Issue Detected
            </h4>
            <p className="text-sm text-amber-700">
              {feedback || "The image quality may not be optimal for processing. Would you like to retake the photo or continue anyway?"}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onRetakePhoto}
              variant="outline"
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Photo
            </Button>
            <Button
              onClick={onContinueAnyway}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Continue Anyway
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadQualityHandler;
