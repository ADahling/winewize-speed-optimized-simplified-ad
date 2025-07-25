
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Restaurant, RestaurantData } from '@/types/restaurant';

export const useRestaurantSearch = () => {
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // FIXED: Add the missing checkRestaurantAge function
  const checkRestaurantAge = (restaurant: RestaurantData): boolean => {
    if (!restaurant.last_menu_update) {
      console.log('No last menu update found, showing age warning');
      return true; // Show age warning if no update date
    }

    const lastUpdate = new Date(restaurant.last_menu_update);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`Restaurant age check: ${daysSinceUpdate} days since last update`);
    
    // Show age warning if older than 90 days
    return daysSinceUpdate > 90;
  };

  // PERFORMANCE FIX: Efficient restaurant search instead of fetching all
  const searchRestaurants = async (searchTerm: string): Promise<RestaurantData[]> => {
    if (!user || !searchTerm.trim()) {
      return [];
    }

    setIsLoading(true);
    setHasError(false);

    try {
      console.log(`🔍 Searching for restaurants matching: "${searchTerm}"`);
      
      // OPTIMIZED: Search by name with ILIKE for case-insensitive partial matching
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(10); // Limit results for performance

      if (error) {
        console.error('❌ Restaurant search failed:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} restaurants matching "${searchTerm}"`);

      const transformedRestaurants: RestaurantData[] = data.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        location: restaurant.location || 'Location not available',
        cuisine_type: restaurant.cuisine_type || 'Cuisine not specified',
        last_menu_update: restaurant.last_menu_update,
        created_at: restaurant.created_at,
        updated_at: restaurant.updated_at
      }));

      setRestaurants(transformedRestaurants);
      return transformedRestaurants;
      
    } catch (error) {
      console.error('❌ Restaurant search error:', error);
      setHasError(true);
      toast({
        title: "Search failed",
        description: 'Failed to search restaurants. Please try again.',
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    restaurants,
    isLoading,
    hasError,
    searchRestaurants,
    checkRestaurantAge
  };
};
