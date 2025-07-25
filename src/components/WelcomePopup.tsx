
import React, { useEffect } from 'react';
import { Wine } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

const WelcomePopup = ({ isOpen, onClose, autoCloseDelay = 3000 }: WelcomePopupProps) => {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Wine className="w-12 h-12 text-purple-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-purple-600">
            🍷✨ Processing Your Perfect Pairings!
          </DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <p className="text-slate-600 mb-6">
            Our AI sommelier is analyzing your selections to find the perfect wine matches...
          </p>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
