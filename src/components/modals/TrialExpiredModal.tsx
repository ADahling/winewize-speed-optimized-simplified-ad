
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrialExpiredModal = ({ isOpen, onClose }: TrialExpiredModalProps) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Wine className="w-16 h-16 text-purple-600" />
              <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-purple-600 mb-2">
            Your trial has ended
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-slate-600 text-lg">
            Don't worry, you're just a click away from continuing to get your perfect wine pairings! 🍷
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
            <p className="text-sm text-slate-700">
              Join thousands of wine lovers who've discovered their perfect pairings with Wine Wize
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
            >
              Continue to Plans
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialExpiredModal;
