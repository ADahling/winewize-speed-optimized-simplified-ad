
import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  pairingsUsed: number;
  pairingsLimit: number;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  currentTier,
  pairingsUsed,
  pairingsLimit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
          <DialogTitle className="text-center">
            You've Reached Your Monthly Limit
          </DialogTitle>
          <DialogDescription className="text-center">
            You've used {pairingsUsed} of {pairingsLimit} wine pairings this month on the {currentTier} plan.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">
              Upgrade to get more pairings
            </h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Glass Plan: 50 pairings/month</li>
              <li>• Bottle Plan: Unlimited pairings</li>
              <li>• Premium wine recommendations</li>
              <li>• Advanced pairing algorithms</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Link to="/subscription" className="flex-1">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePrompt;
