
import React, { useState } from 'react';
import { Star, Wine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WineRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, notes?: string) => void;
  wineName: string;
  dishPairedWith?: string;
  existingRating?: number;
  existingNotes?: string;
}

const WineRatingModal: React.FC<WineRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  wineName,
  dishPairedWith,
  existingRating = 0,
  existingNotes = ''
}) => {
  const [rating, setRating] = useState(existingRating);
  const [notes, setNotes] = useState(existingNotes);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, notes);
      onClose();
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1: return "Not my favorite";
      case 2: return "Not great";
      case 3: return "I'd drink it again";
      case 4: return "Really good";
      case 5: return "I want more!";
      default: return "Rate this wine";
    }
  };

  const handleReset = () => {
    setRating(existingRating);
    setNotes(existingNotes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Wine className="w-5 h-5 text-purple-600" />
            Rate Your Wine
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-800">{wineName}</h3>
            {dishPairedWith && (
              <p className="text-sm text-slate-600">Paired with: {dishPairedWith}</p>
            )}
          </div>

          <div>
            <p className="text-slate-600 mb-4">How would you rate this wine?</p>
            
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`w-10 h-10 transition-colors ${
                    (hoveredRating || rating) >= star 
                      ? 'text-amber-400' 
                      : 'text-slate-300'
                  } hover:text-amber-400`}
                >
                  <Star className="w-10 h-10 fill-current" />
                </button>
              ))}
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              {getRatingLabel(hoveredRating || rating)}
            </p>
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tasting Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share your thoughts about this wine..."
              className="w-full h-20 resize-none"
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            {(rating !== existingRating || notes !== existingNotes) && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
            )}
            <Button 
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Save Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WineRatingModal;
