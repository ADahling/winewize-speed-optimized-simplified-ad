

import React, { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import WineCard from './WineCard';
import { logger } from '@/utils/logger';
import { WineRecommendation } from '@/types/wine';

interface DishWinePairingBlockProps {
  dishName: string;
  dishDescription?: string;
  dishPrice?: string;
  wines: WineRecommendation[];
}

const DishWinePairingBlock = ({ dishName, dishDescription, dishPrice, wines }: DishWinePairingBlockProps) => {
  const [userBudget, setUserBudget] = useState<number>(50);
  const [hasOverBudgetWines, setHasOverBudgetWines] = useState(false);
  const { user } = useAuth();


  useEffect(() => {
    const fetchUserBudget = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wine_preferences')
          .select('budget')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setUserBudget(data.budget);
        }
      } catch (error) {
        logger.error('Error fetching user budget for dish pairing', { 
          error, 
          userId: user?.id, 
          dishName 
        });
      }
    };

    fetchUserBudget();
  }, [user]);

  useEffect(() => {
    // Check if any wines are over budget
    const overBudget = wines.some(wine => {
      const priceMatch = wine.price?.match(/\$?(\d+)/);
      if (priceMatch) {
        const winePrice = parseInt(priceMatch[1]);
        return winePrice > userBudget;
      }
      return false;
    });
    setHasOverBudgetWines(overBudget);
  }, [wines, userBudget]);

  // Validate wines array
  if (!wines || !Array.isArray(wines)) {
    logger.warn('Invalid wines data for dish', { 
      dishName, 
      winesType: typeof wines, 
      isArray: Array.isArray(wines) 
    });
    return (
      <div className="bg-gradient-to-br from-pink-50/30 to-pink-100/30 rounded-2xl p-6 mb-8 shadow-lg border border-pink-200/50 backdrop-blur-sm">
        <div className="flex items-start gap-4 mb-6 pb-4 border-b border-pink-200/50">
          <div className="bg-pink-100 p-3 rounded-full">
            <Utensils className="w-6 h-6 text-pink-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{dishName}</h3>
            {dishDescription && (
              <p className="text-slate-600 mb-2 text-base">{dishDescription}</p>
            )}
            {dishPrice && (
              <span className="text-green-600 font-semibold text-sm">{dishPrice}</span>
            )}
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-500">No wine pairings available for this dish</p>
          <pre className="text-xs text-slate-400 mt-2 bg-slate-50 p-2 rounded">
            {JSON.stringify(wines, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (wines.length === 0) {
    logger.warn('No wines found for dish', { dishName });
    return (
      <div className="bg-gradient-to-br from-pink-50/30 to-pink-100/30 rounded-2xl p-6 mb-8 shadow-lg border border-pink-200/50 backdrop-blur-sm">
        <div className="flex items-start gap-4 mb-6 pb-4 border-b border-pink-200/50">
          <div className="bg-pink-100 p-3 rounded-full">
            <Utensils className="w-6 h-6 text-pink-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{dishName}</h3>
            {dishDescription && (
              <p className="text-slate-600 mb-2 text-base">{dishDescription}</p>
            )}
            {dishPrice && (
              <span className="text-green-600 font-semibold text-sm">{dishPrice}</span>
            )}
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-500">No wine pairings found for this dish</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-50/30 to-pink-100/30 rounded-2xl p-6 mb-8 shadow-lg border border-pink-200/50 backdrop-blur-sm">
      {/* Dish Header */}
      <div className="flex items-start gap-4 mb-6 pb-4 border-b border-pink-200/50">
        <div className="bg-pink-100 p-3 rounded-full">
          <Utensils className="w-6 h-6 text-pink-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{dishName}</h3>
          {dishDescription && (
            <p className="text-slate-600 mb-2 text-base">{dishDescription}</p>
          )}
          {dishPrice && (
            <span className="text-green-600 font-semibold text-sm">{dishPrice}</span>
          )}
        </div>
      </div>

      {/* Wine Recommendations */}
      <div>
        <h4 className="text-lg font-semibold text-pink-600 mb-4 flex items-center gap-2">
          🍷 Perfect Wine Pairings ({wines.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wines.map((wine, index) => {
            return (
              <WineCard
                key={`${wine.wineName}-${index}`}
                wine={wine}
                dishName={dishName}
                index={index}
              />
            );
          })}
        </div>
        
        {/* Budget Footnote */}
        {hasOverBudgetWines && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              <span className="font-medium">Budget Note:</span> We recognize some recommendations may be outside your budget preference of ${userBudget}. Wine pricing varies significantly between restaurants, and we want to show you the best pairings available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishWinePairingBlock;

