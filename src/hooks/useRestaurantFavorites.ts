import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface FavoriteRestaurant {
  id: string;
  name: string;
  location: string;
  cuisine_type: string;
  lastVisited?: string;
  visitCount: number;
}

export const useRestaurantFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's favorite restaurants
  const loadFavorites = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Use wine_interactions to track restaurant preferences
      const { data, error } = await supabase
        .from('wine_interactions')
        .select('wine_name, created_at')
        .eq('user_id', user.id)
        .eq('interaction_type', 'restaurant_favorite')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform interaction data into favorites
      const favoritesMap = new Map();
      (data || []).forEach(interaction => {
        try {
          const restaurantData = JSON.parse(interaction.wine_name || '{}');
          if (restaurantData.id && restaurantData.name) {
            const key = restaurantData.id;
            const existing = favoritesMap.get(key);
            
            if (existing) {
              existing.visitCount += 1;
              existing.lastVisited = interaction.created_at;
            } else {
              favoritesMap.set(key, {
                id: restaurantData.id,
                name: restaurantData.name,
                location: restaurantData.location || 'Unknown',
                cuisine_type: restaurantData.cuisine_type || 'Various',
                lastVisited: interaction.created_at,
                visitCount: 1
              });
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      const favoritesList = Array.from(favoritesMap.values())
        .sort((a, b) => new Date(b.lastVisited || 0).getTime() - new Date(a.lastVisited || 0).getTime());

      setFavorites(favoritesList);
      logger.info('Loaded restaurant favorites', { count: favoritesList.length });

    } catch (error) {
      logger.error('Error loading restaurant favorites', { error, userId: user?.id });
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add restaurant to favorites
  const addToFavorites = async (restaurant: any) => {
    if (!user || !restaurant) return;

    try {
      const restaurantData = {
        id: restaurant.id,
        name: restaurant.name,
        location: restaurant.location,
        cuisine_type: restaurant.cuisine_type
      };

      const { error } = await supabase
        .from('wine_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'restaurant_favorite',
          wine_name: JSON.stringify(restaurantData)
        });

      if (error) throw error;

      logger.info('Added restaurant to favorites', { restaurantName: restaurant.name });
      await loadFavorites(); // Refresh list

    } catch (error) {
      logger.error('Error adding restaurant to favorites', { error, userId: user?.id });
    }
  };

  // Remove restaurant from favorites (remove from local state)
  const removeFromFavorites = async (restaurantId: string) => {
    if (!user) return;

    try {
      setFavorites(prev => prev.filter(fav => fav.id !== restaurantId));
      logger.info('Removed restaurant from favorites', { restaurantId });
    } catch (error) {
      logger.error('Error removing restaurant from favorites', { error, restaurantId });
    }
  };

  // Check if restaurant is favorited
  const isFavorite = (restaurantId: string): boolean => {
    return favorites.some(fav => fav.id === restaurantId);
  };

  // Toggle favorite status
  const toggleFavorite = async (restaurant: any) => {
    if (isFavorite(restaurant.id)) {
      await removeFromFavorites(restaurant.id);
    } else {
      await addToFavorites(restaurant);
    }
  };

  // Get most visited restaurants
  const getMostVisited = (): FavoriteRestaurant[] => {
    return [...favorites]
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 5);
  };

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    getMostVisited,
    loadFavorites
  };
};