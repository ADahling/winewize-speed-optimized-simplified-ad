
import React from 'react';
import { AlertTriangle, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageQualityCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onRescan: () => void;
  onProceed: () => void;
  type: 'menu' | 'wine';
}

const ImageQualityChecker = ({
  isOpen,
  onClose,
  imageSrc,
  onRescan,
  onProceed,
  type
}: ImageQualityCheckerProps) => {
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
          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
            <img 
              src={imageSrc} 
              alt={`${type} preview`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">
              Is your {type === 'menu' ? 'menu' : 'wine list'} clearly visible?
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Text should be sharp and readable</li>
              <li>• No blurry or dark areas</li>
              <li>• All items are within the frame</li>
              <li>• Good lighting without glare</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onRescan}
              variant="outline"
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Rescan
            </Button>
            <Button
              onClick={onProceed}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Looks Good
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageQualityChecker;
