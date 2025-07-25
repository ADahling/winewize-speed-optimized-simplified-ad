
import React from 'react';
import { Wine, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddToLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  wineName: string;
  isLoading?: boolean;
}

const AddToLibraryModal = ({ isOpen, onClose, onConfirm, wineName, isLoading }: AddToLibraryModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Wine className="w-10 h-10 text-purple-600" />
          </div>
          <DialogTitle className="text-center text-lg font-semibold text-slate-800">
            Add to Wine Library?
          </DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <p className="text-slate-600 mb-6">
            Would you like to add <strong>{wineName}</strong> to your Wine Library?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              No, Thanks
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Yes, Add It!'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToLibraryModal;
