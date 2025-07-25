
import React from 'react';
import { Label } from '@/components/ui/label';
import { Wine } from 'lucide-react';

interface WineRatingSectionProps {
  whiteWineRank: number;
  redWineRank: number;
  roseWineRank: number;
  sparklingWineRank: number;
  onWhiteWineChange: (rating: number) => void;
  onRedWineChange: (rating: number) => void;
  onRoseWineChange: (rating: number) => void;
  onSparklingWineChange: (rating: number) => void;
}

const WineRatingSection: React.FC<WineRatingSectionProps> = ({
  whiteWineRank,
  redWineRank,
  roseWineRank,
  sparklingWineRank,
  onWhiteWineChange,
  onRedWineChange,
  onRoseWineChange,
  onSparklingWineChange,
}) => {
  const renderGlassRating = (value: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full p-1"
          >
            <Wine 
              className="w-8 h-8 transition-all duration-200" 
              style={{ 
                color: '#9333EA',
                opacity: rating <= value ? 1 : 0.5 
              }}
              fill={rating <= value ? '#9333EA' : 'none'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Label className="text-slate-800 text-lg font-semibold mb-4 block">
        Rate each wine type based on your preference
      </Label>
      <p className="text-slate-600 text-base mb-8">
        1-Glass being "Not my favorite" and 5-Glass being "I love it!"
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-slate-700 font-medium">White Wine:</Label>
          {renderGlassRating(whiteWineRank, onWhiteWineChange)}
        </div>
        <div className="space-y-3">
          <Label className="text-slate-700 font-medium">Red Wine:</Label>
          {renderGlassRating(redWineRank, onRedWineChange)}
        </div>
        <div className="space-y-3">
          <Label className="text-slate-700 font-medium">Rosé Wine:</Label>
          {renderGlassRating(roseWineRank, onRoseWineChange)}
        </div>
        <div className="space-y-3">
          <Label className="text-slate-700 font-medium">Sparkling Wine:</Label>
          {renderGlassRating(sparklingWineRank, onSparklingWineChange)}
        </div>
      </div>
    </div>
  );
};

export default WineRatingSection;
