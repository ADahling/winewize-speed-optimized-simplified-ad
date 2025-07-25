
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NoMenuDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
}

const NoMenuDataModal: React.FC<NoMenuDataModalProps> = ({
  isOpen,
  onClose,
  restaurantName
}) => {
  const navigate = useNavigate();

  // Get restaurant name from props, localStorage as fallback
  const displayName = restaurantName && restaurantName !== 'Unknown Restaurant' 
    ? restaurantName 
    : localStorage.getItem('currentRestaurantName') || 'this restaurant';

  const handleGoToRestaurant = () => {
    onClose();
    navigate('/restaurant');
  };

  const handleGoToUpload = () => {
    onClose();
    navigate('/upload');
  };

  const handleStartOver = () => {
    // Clear all session data
    sessionStorage.clear();
    localStorage.removeItem('currentRestaurantId');
    localStorage.removeItem('currentRestaurantName');
    onClose();
    navigate('/welcome');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            Get Ready for a Great Meal!
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-2">
            We don't have a current menu or wine list for{' '}
            <strong>{displayName}</strong>.
            <br />
            Let's change that and upload them now for personalized wine pairings!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-6">
          <Button
            onClick={handleGoToUpload}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Menu & Wine List Now
          </Button>
          
          <Button
            onClick={handleGoToRestaurant}
            variant="outline"
            className="w-full py-3 border-slate-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Other Options
          </Button>
          
          <Button
            onClick={handleStartOver}
            variant="ghost"
            className="w-full py-2 text-slate-500 hover:text-slate-700"
          >
            Start Over
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoMenuDataModal;
