
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RestaurantAgeWarningProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  onUseExisting: () => void;
  onUploadNew: () => void;
}

const RestaurantAgeWarning: React.FC<RestaurantAgeWarningProps> = ({
  isOpen,
  onClose,
  restaurantName,
  onUseExisting,
  onUploadNew
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            Menu May Be Out of Date
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-2">
            The Menu and Wine List for <strong>{restaurantName}</strong> may be out of date. 
            Would you like to:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          <Button
            onClick={onUseExisting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
          >
            Use existing menu and wine list
          </Button>
          
          <Button
            onClick={onUploadNew}
            variant="outline"
            className="w-full py-3 border-slate-300"
          >
            Upload new images
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantAgeWarning;
