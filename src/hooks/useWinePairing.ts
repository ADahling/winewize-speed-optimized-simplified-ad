
import { useState } from 'react';
import { useSmartPairingMemory } from '@/hooks/useSmartPairingMemory';
import { useWinePairingCore } from '@/hooks/useWinePairingCore';

// Legacy types for backward compatibility
interface Pairing {
  wine: Wine;
  dish: Dish;
  score: number;
  justification: string;
}

interface Wine {
  id: string;
  name: string;
  varietal: string;
  region: string;
  vintage: string;
  price_bottle: string;
  price_glass: string;
  wine_type: string;
  ww_style: string;
  description: string;
  restaurant_id: string | null;
  confidence_level: string;
  source: string;
}

interface Dish {
  id: string;
  dish_name: string;
  description: string;
  price: string;
  dish_type: string;
  ingredients: string[];
}

export const useWinePairing = (winesFromState?: any[]) => {
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const { learnFromSelection, getSmartRecommendations } = useSmartPairingMemory();
  
  // Pass winesFromState to the core pairing logic
  const {
    isGenerating,
    error,
    generatePairings,
    clearError,
    usageStats,
    showUpgradePrompt,
    setShowUpgradePrompt
  } = useWinePairingCore({ winesFromState });

  return {
    pairings,
    isGenerating,
    error,
    generatePairings,
    clearPairings: () => setPairings([]),
    clearError,
    isGeneratingPairings: isGenerating,
    generateWinePairings: generatePairings,
    usageStats,
    showUpgradePrompt,
    setShowUpgradePrompt,
    learnFromSelection,
    getSmartRecommendations
  };
};
