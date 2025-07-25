import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface UserWinePreference {
  wine_style: string;
  wine_type: string;
  price_range: string;
  confidence_score: number;
  interaction_count: number;
}

interface SmartRecommendation {
  wineName: string;
  wineType: string;
  wineStyle: string;
  description: string;
  price: string;
  confidenceReason: string;
  matchScore: number;
}

export const useSmartPairingMemory = () => {
  const { user } = useAuth();
  const [userPreferences, setUserPreferences] = useState<UserWinePreference[]>([]);
  const [isLearning, setIsLearning] = useState(false);

  // Load user's wine preferences from interactions
  const loadUserPreferences = async () => {
    if (!user) return;

    try {
      // Get user's wine interaction history with error handling (remove notes column)
      const { data: interactions, error } = await supabase
        .from('wine_interactions')
        .select('wine_name, wine_style, rating, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Failed to load wine interactions:', error);
        setUserPreferences([]);
        return;
      }

      // Get user's wine library for additional preference data
      const { data: library, error: libraryError } = await supabase
        .from('user_wine_library')
        .select('wine_name, wine_style, rating, price')
        .eq('user_id', user.id)
        .not('rating', 'is', null);

      if (libraryError) throw libraryError;

      // Analyze preferences
      const preferences = analyzeWinePreferences(interactions || [], library || []);
      setUserPreferences(preferences);


    } catch (error) {
      logger.error('Error loading user preferences', { error, userId: user?.id });
    }
  };

  // Analyze user's wine interactions to build preference profile
  const analyzeWinePreferences = (
    interactions: any[], 
    library: any[]
  ): UserWinePreference[] => {
    const styleMap = new Map<string, { count: number, totalRating: number, priceRange: string[] }>();

    // Process library items (higher weight due to user explicitly saving them)
    library.forEach(item => {
      const key = `${item.wine_style}`;
      const existing = styleMap.get(key) || { count: 0, totalRating: 0, priceRange: [] };
      
      styleMap.set(key, {
        count: existing.count + 3, // Higher weight for library items
        totalRating: existing.totalRating + (item.rating || 3),
        priceRange: [...existing.priceRange, item.price]
      });
    });

    // Process interactions (lower weight but still valuable)
    interactions.forEach(interaction => {
      if (interaction.wine_style) {
        const key = `${interaction.wine_style}`;
        const existing = styleMap.get(key) || { count: 0, totalRating: 0, priceRange: [] };
        
        styleMap.set(key, {
          count: existing.count + 1,
          totalRating: existing.totalRating + (interaction.rating || 3),
          priceRange: existing.priceRange
        });
      }
    });

    // Convert to preference objects
    return Array.from(styleMap.entries())
      .map(([style, data]) => {
        const avgRating = data.totalRating / data.count;
        const commonPriceRange = getMostCommonPriceRange(data.priceRange);
        
        return {
          wine_style: style,
          wine_type: getWineTypeFromStyle(style),
          price_range: commonPriceRange,
          confidence_score: Math.min(data.count * avgRating / 10, 1), // Normalize to 0-1
          interaction_count: data.count
        };
      })
      .filter(pref => pref.confidence_score > 0.2) // Only keep meaningful preferences
      .sort((a, b) => b.confidence_score - a.confidence_score);
  };

  // Learn from a new wine selection
  const learnFromSelection = async (
    wineName: string,
    wineStyle: string,
    wineType: string,
    dishName: string,
    rating?: number
  ) => {
    if (!user) return;

    setIsLearning(true);

    try {
      // Record the interaction with error handling (remove notes column)
      const { error } = await supabase
        .from('wine_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'selection',
          wine_name: wineName,
          wine_style: wineStyle,
          dish_name: `Selected for ${dishName}`,
          rating: rating || null
        });

      if (error) {
        console.warn('Failed to record wine selection:', error);
        return; // Fail silently to prevent blocking user flow
      }

      // Refresh preferences only if recording succeeded
      await loadUserPreferences();

      logger.info('Learned from wine selection', {
        userId: user.id,
        wineName,
        wineStyle,
        dishName,
        rating
      });

    } catch (error) {
      logger.error('Error learning from selection', { error, userId: user?.id });
    } finally {
      setIsLearning(false);
    }
  };

  // Get smart recommendations based on dish and user preferences
  const getSmartRecommendations = (
    availableWines: any[],
    dishName: string,
    dishDescription: string
  ): SmartRecommendation[] => {
    if (userPreferences.length === 0) {
      return []; // No preferences to work with yet
    }

    return availableWines
      .map(wine => {
        const matchingPref = userPreferences.find(pref => 
          pref.wine_style === wine.ww_style || pref.wine_type === wine.wine_type
        );

        if (!matchingPref) return null;

        const matchScore = calculateMatchScore(wine, matchingPref, dishDescription);
        
        return {
          wineName: wine.name || wine.wine_name,
          wineType: wine.wine_type,
          wineStyle: wine.ww_style,
          description: wine.description || '',
          price: wine.price || '',
          confidenceReason: buildConfidenceReason(matchingPref, matchScore),
          matchScore
        };
      })
      .filter(rec => rec !== null && rec.matchScore > 0.3)
      .sort((a, b) => b!.matchScore - a!.matchScore)
      .slice(0, 3); // Top 3 recommendations
  };

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  return {
    userPreferences,
    isLearning,
    learnFromSelection,
    getSmartRecommendations,
    loadUserPreferences
  };
};

// Helper functions
const getMostCommonPriceRange = (prices: string[]): string => {
  if (prices.length === 0) return 'moderate';
  
  const priceMap = new Map<string, number>();
  prices.forEach(price => {
    const range = categorizePrice(price);
    priceMap.set(range, (priceMap.get(range) || 0) + 1);
  });
  
  return Array.from(priceMap.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'moderate';
};

const categorizePrice = (price: string): string => {
  const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  if (numPrice < 30) return 'budget';
  if (numPrice < 60) return 'moderate';
  if (numPrice < 100) return 'premium';
  return 'luxury';
};

const getWineTypeFromStyle = (style: string): string => {
  const redStyles = ['Fresh & Fruity', 'Dry & Dirty', 'Packed with a Punch'];
  const whiteStyles = ['Fresh & Crisp', 'Funky & Floral', 'Rich & Creamy'];
  
  if (redStyles.includes(style)) return 'Red';
  if (whiteStyles.includes(style)) return 'White';
  return 'White'; // Default
};

const calculateMatchScore = (
  wine: any, 
  preference: UserWinePreference, 
  dishDescription: string
): number => {
  let score = preference.confidence_score; // Base score from user confidence
  
  // Style match bonus
  if (wine.ww_style === preference.wine_style) {
    score += 0.3;
  }
  
  // Type match bonus
  if (wine.wine_type === preference.wine_type) {
    score += 0.2;
  }
  
  // Price preference match
  const winePrice = categorizePrice(wine.price || '50');
  if (winePrice === preference.price_range) {
    score += 0.1;
  }
  
  return Math.min(score, 1); // Cap at 1.0
};

const buildConfidenceReason = (
  preference: UserWinePreference, 
  matchScore: number
): string => {
  const reasons = [];
  
  if (preference.confidence_score > 0.7) {
    reasons.push("you frequently enjoy this style");
  } else if (preference.confidence_score > 0.4) {
    reasons.push("you've liked similar wines");
  }
  
  if (preference.interaction_count > 5) {
    reasons.push("based on your wine history");
  }
  
  if (matchScore > 0.8) {
    reasons.push("perfect match for your taste");
  } else if (matchScore > 0.6) {
    reasons.push("good match for your preferences");
  }
  
  return reasons.length > 0 
    ? `Recommended because ${reasons.join(' and ')}`
    : 'Matches your wine preferences';
};