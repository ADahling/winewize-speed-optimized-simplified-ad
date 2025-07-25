import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface SavedOrder {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_name: string;
  dish_names: string[];
  dish_count: number;
  created_at: string;
  last_used: string;
}

interface QuickOrderItem {
  id: string;
  restaurantName: string;
  dishNames: string[];
  dishCount: number;
  lastUsed: string;
  restaurantId: string;
}

export const useQuickReorder = () => {
  const { user } = useAuth();
  const [savedOrders, setSavedOrders] = useState<QuickOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user's saved orders (using wine_interactions table as fallback)
  const loadSavedOrders = async () => {
    if (!user) return;

    // Skip database calls in session-only mode to prevent 400 errors
    const restaurantId = localStorage.getItem('currentRestaurantId');
    if (restaurantId === 'session-only') {
      setSavedOrders([]);
      return;
    }

    setIsLoading(true);
    try {
      // Add retry logic and error handling for wine_interactions
      const { data, error } = await supabase
        .from('wine_interactions')
        .select('wine_name, created_at')
        .eq('user_id', user.id)
        .eq('interaction_type', 'pairing_session')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.warn('wine_interactions query failed:', error);
        setSavedOrders([]);
        return;
      }

      // Transform wine_interactions data into quick orders
      const uniqueOrders = new Map();
      (data || []).forEach(interaction => {
        try {
          const sessionData = JSON.parse(interaction.wine_name || '{}');
          if (sessionData.restaurantName && sessionData.dishNames) {
            const key = `${sessionData.restaurantId}-${sessionData.dishNames.join(',')}`;
            if (!uniqueOrders.has(key)) {
              uniqueOrders.set(key, {
                id: `session-${Date.now()}-${Math.random()}`,
                restaurantName: sessionData.restaurantName,
                dishNames: sessionData.dishNames,
                dishCount: sessionData.dishNames.length,
                lastUsed: interaction.created_at,
                restaurantId: sessionData.restaurantId || 'unknown'
              });
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      // Limit to 5 most recent orders
      const limitedOrders = Array.from(uniqueOrders.values()).slice(0, 5);
      setSavedOrders(limitedOrders);
      logger.info('Loaded saved orders from interactions', { count: uniqueOrders.size });

    } catch (error) {
      logger.error('Error loading saved orders', { error, userId: user?.id });
      setSavedOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save current order for quick reordering (using wine_interactions)
  const saveCurrentOrder = async (
    restaurantId: string,
    restaurantName: string,
    selectedDishes: any[]
  ) => {
    if (!user || selectedDishes.length === 0) return;

    // Skip database saves in session-only mode to prevent 400 errors
    if (restaurantId === 'session-only') {
      logger.info('Skipping save in session mode');
      return;
    }

    setIsSaving(true);
    try {
      const dishNames = selectedDishes.map(dish => dish.dish_name);
      
      // Save pairing session data to wine_interactions with error handling
      const sessionData = {
        restaurantId,
        restaurantName,
        dishNames,
        dishCount: dishNames.length
      };

      const { error } = await supabase
        .from('wine_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'pairing_session',
          wine_name: JSON.stringify(sessionData)
        });

      if (error) {
        console.warn('Failed to save pairing session:', error);
        return; // Fail silently to prevent user disruption
      }
      logger.info('Saved pairing session', { restaurantName, dishCount: dishNames.length });

      // Refresh the saved orders list
      await loadSavedOrders();

    } catch (error) {
      logger.error('Error saving pairing session', { error, userId: user?.id });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a saved order (remove from local state for now)
  const deleteSavedOrder = async (orderId: string) => {
    if (!user) return;

    try {
      setSavedOrders(prev => prev.filter(order => order.id !== orderId));
      logger.info('Deleted saved order', { orderId });
    } catch (error) {
      logger.error('Error deleting saved order', { error, orderId });
    }
  };

  // Quick reorder - sets up the session for the saved order
  const quickReorder = async (savedOrder: QuickOrderItem) => {
    if (!user) return null;

    try {
      // Set up restaurant context
      localStorage.setItem('currentRestaurantId', savedOrder.restaurantId);
      localStorage.setItem('currentRestaurantName', savedOrder.restaurantName);

      // Return the order data for the calling component to handle
      return {
        restaurantId: savedOrder.restaurantId,
        restaurantName: savedOrder.restaurantName,
        dishNames: savedOrder.dishNames
      };

    } catch (error) {
      logger.error('Error during quick reorder', { error, orderId: savedOrder.id });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadSavedOrders();
    }
  }, [user]);

  return {
    savedOrders,
    isLoading,
    isSaving,
    saveCurrentOrder,
    deleteSavedOrder,
    quickReorder,
    loadSavedOrders
  };
};