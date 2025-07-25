
import React from 'react';
import { Heart } from 'lucide-react';

interface WinePreferenceMatchProps {
  wineType: string;
  wineStyle: string;
  userWwWhiteStyle?: string;
  userWwRedStyle?: string;
}

const WinePreferenceMatch = ({ wineType, wineStyle, userWwWhiteStyle, userWwRedStyle }: WinePreferenceMatchProps) => {
  const getMatchingStyle = () => {
    const lowerWineType = wineType.toLowerCase();
    
    // Check if this wine's style matches user's preference for this wine type
    if ((lowerWineType === 'white' || lowerWineType === 'sparkling') && userWwWhiteStyle) {
      return wineStyle === userWwWhiteStyle ? userWwWhiteStyle : null;
    }
    
    if (lowerWineType === 'red' && userWwRedStyle) {
      return wineStyle === userWwRedStyle ? userWwRedStyle : null;
    }
    
    return null;
  };

  const matchingStyle = getMatchingStyle();

  if (!matchingStyle) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
      <Heart className="w-3 h-3" />
      <span>Matches your {matchingStyle} preference</span>
    </div>
  );
};

export default WinePreferenceMatch;
