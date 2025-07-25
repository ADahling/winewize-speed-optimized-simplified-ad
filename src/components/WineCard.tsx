
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWineUserPreferences } from '@/hooks/useWineUserPreferences';
import { addWineToLibrary, trackWineInteraction } from '@/services/wineLibraryService';
import { useWinePairing } from '@/hooks/useWinePairing';
import AddToLibraryModal from './AddToLibraryModal';
import WineCardHeader from './WineCardHeader';
import WineCardFooter from './WineCardFooter';
import WineDescription from './WineDescription';
import WinePreferenceMatch from './WinePreferenceMatch';
import { logger } from '@/utils/logger';
import { WineRecommendation } from '@/types/wine';

interface WineCardProps {
  wine: WineRecommendation;
  dishName: string;
  index: number;
}

// Enhanced price extraction function that prioritizes bottle pricing
const extractPriceForBudgetComparison = (priceString: string): number | null => {
  // First try to extract bottle price specifically
  const bottleMatch = priceString.match(/(?:bottle|btl):\s*\$?(\d+)/i);
  if (bottleMatch) {
    return parseInt(bottleMatch[1]);
  }
  
  // Look for bottle price patterns
  const bottlePatterns = [
    /\$?(\d+)\s*bottle/i,
    /bottle:\s*\$?(\d+)/i,
    /\$?(\d+)\s*btl/i
  ];
  
  for (const pattern of bottlePatterns) {
    const match = priceString.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  // If we have both glass and bottle mentioned, extract the higher price (likely bottle)
  if (priceString.toLowerCase().includes('glass') && priceString.toLowerCase().includes('bottle')) {
    const allPrices = priceString.match(/\$?(\d+)/g);
    if (allPrices && allPrices.length >= 2) {
      const prices = allPrices.map(p => parseInt(p.replace('$', '')));
      return Math.max(...prices); // Return the higher price (bottle)
    }
  }
  
  // Fallback to first price found
  const match = priceString.match(/\$?(\d+)/);
  return match ? parseInt(match[1]) : null;
};

const WineCard = ({ wine, dishName, index }: WineCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isOverBudget, setIsOverBudget] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { budget, wineWhiteStyle, wineRedStyle } = useWineUserPreferences();
  const { learnFromSelection } = useWinePairing();

  useEffect(() => {
    // Use enhanced price extraction that prioritizes bottle pricing
    const winePrice = extractPriceForBudgetComparison(wine.price);
    if (winePrice !== null) {
      setIsOverBudget(winePrice > budget);
    } else {
      setIsOverBudget(false);
    }
  }, [wine.price, budget, wine.wineName]);

  const handleAddToLibrary = async () => {
    if (!user) return;
    
    setIsAdding(true);
    
    try {
      await addWineToLibrary(user.id, wine, dishName);

      // Learn from this selection for smart recommendations
      await learnFromSelection(
        wine.wineName,
        wine.wineStyle || '',
        wine.wineType,
        dishName
      );

      toast({
        title: "Added to Wine Library! 🍷",
        description: `${wine.wineName} has been saved to your collection`,
      });

      setShowModal(false);
    } catch (error) {
      logger.error('Error adding wine to library', { 
        error, 
        userId: user?.id, 
        wineName: wine.wineName 
      });
      toast({
        title: "Error",
        description: "Failed to add wine to library",
        variant: "destructive",
      });
    }finally {
      setIsAdding(false);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Track interaction
    if (user) {
      trackWineInteraction(
        user.id,
        'add_to_library_click',
        wine.wineName,
        wine.wineStyle,
        dishName
      );
    }
    
    setShowModal(true);
  };

  return (
    <>
      <div 
        className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200"
        style={{
          animationDelay: `${index * 150}ms`
        }}
      >
        <WineCardHeader
          wineName={wine.wineName}
          wineType={wine.wineType}
          wineStyle={wine.wineStyle || ''}
          confidenceLevel={wine.confidenceLevel || 'Medium'}
          pairingType={(wine as any).pairingType}
          preferenceMatch={(wine as any).preferenceMatch}
        />

        <WinePreferenceMatch
          wineType={wine.wineType}
          wineStyle={wine.wineStyle}
          userWwWhiteStyle={wineWhiteStyle}
          userWwRedStyle={wineRedStyle}
        />

        <WineDescription description={wine.description} />

        <WineCardFooter
          price={wine.price}
          isOverBudget={isOverBudget}
          onAddClick={handleAddClick}
        />
      </div>

      <AddToLibraryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleAddToLibrary}
        wineName={wine.wineName}
        isLoading={isAdding}
      />
    </>
  );
};

export default WineCard;
