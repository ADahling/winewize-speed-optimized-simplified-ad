
import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePairingPopup } from '@/contexts/PairingPopupContext';
import LoadingAnimation from '@/components/LoadingAnimation';

const GlobalPairingPopup = () => {
  const { isVisible, hidePopup } = usePairingPopup();

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={hidePopup}>
      <DialogContent className="sm:max-w-sm w-full aspect-square">
        <DialogTitle className="sr-only">
          Wine Pairing Generation
        </DialogTitle>
        <DialogDescription className="sr-only">
          AI is analyzing your selected dishes and generating personalized wine recommendations
        </DialogDescription>
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
          <LoadingAnimation />
          <p className="text-center text-slate-600 font-medium">
            Generating your perfect wine pairings...
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={hidePopup}
            className="mt-4"
          >
            <X className="w-4 h-4 mr-2" />
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalPairingPopup;
