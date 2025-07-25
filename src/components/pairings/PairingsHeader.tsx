import React from 'react';
import BackButton from '@/components/navigation/BackButton';

interface PairingsHeaderProps {
  isRecentlyGenerated: boolean;
  restaurantName: string;
}

export const PairingsHeader: React.FC<PairingsHeaderProps> = ({ 
  isRecentlyGenerated, 
  restaurantName 
}) => {
  return (
    <div className="relative flex items-center justify-center mb-8">
      <div className="absolute left-0">
        <BackButton fallbackPath="/dishes" />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2">
          🍷 ✨ Your Wine Recommendations
          {isRecentlyGenerated && (
            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
              Fresh
            </span>
          )}
        </h1>
        <p className="text-slate-600 mt-2">
          Personalized wine pairings for your selected dishes{restaurantName && ` from ${restaurantName}`}, crafted by AI sommelier expertise.
        </p>
      </div>
    </div>
  );
};