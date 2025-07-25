
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProcessingVerification = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyProcessingSuccess = useCallback(async (maxWaitTime = 45000): Promise<boolean> => {
    setIsVerifying(true);
    console.log('Starting optimized database verification...');
    
    if (!user) {
      console.log('No user found, verification failed');
      setIsVerifying(false);
      return false;
    }
    
    const startTime = Date.now();
    const pollInterval = 2000; // Check every 2 seconds
    const restaurantId = localStorage.getItem('currentRestaurantId');
    
    if (!restaurantId) {
      console.log('No restaurant ID found, verification failed');
      setIsVerifying(false);
      return false;
    }
    
    return new Promise((resolve) => {
      const checkDatabaseSuccess = async () => {
        const elapsed = Date.now() - startTime;
        
        try {
          console.log(`Verification attempt ${Math.floor(elapsed / pollInterval) + 1} - Checking database for restaurant: ${restaurantId}`);
          
          // Single optimized query to check for ANY data with row counts
          const [menuResult, wineResult] = await Promise.all([
            supabase
              .from('restaurant_menus')
              .select('id', { count: 'exact', head: true })
              .eq('restaurant_id', restaurantId),
            supabase
              .from('restaurant_wines')
              .select('id', { count: 'exact', head: true })
              .eq('restaurant_id', restaurantId)
          ]);
          
          const { count: menuCount, error: menuError } = menuResult;
          const { count: wineCount, error: wineError } = wineResult;
          
          console.log('Database verification check:', {
            elapsed: `${elapsed}ms`,
            restaurantId,
            menuItemsFound: menuCount || 0,
            winesFound: wineCount || 0,
            menuError: menuError?.message,
            wineError: wineError?.message
          });
          
          // Success if we have ANY data and no critical errors
          const hasData = (!menuError && menuCount && menuCount > 0) || 
                         (!wineError && wineCount && wineCount > 0);
          
          if (hasData) {
            console.log(`Database verification: SUCCESS - Found ${menuCount || 0} menu items and ${wineCount || 0} wines`);
            setIsVerifying(false);
            resolve(true);
            return;
          }
          
          // Continue checking if we haven't exceeded max wait time
          if (elapsed < maxWaitTime) {
            const remainingTime = Math.ceil((maxWaitTime - elapsed) / 1000);
            console.log(`Database verification: Continuing... (${elapsed}ms elapsed, ${remainingTime}s remaining)`);
            setTimeout(checkDatabaseSuccess, pollInterval);
          } else {
            console.log(`Database verification: TIMEOUT - No data found after ${maxWaitTime/1000} seconds`);
            setIsVerifying(false);
            resolve(false);
          }
        } catch (error) {
          console.error('Error during database verification:', error);
          
          // Continue checking if we haven't exceeded max wait time, unless it's an auth error
          if (elapsed < maxWaitTime && !error.message?.includes('auth')) {
            console.log(`Verification error (non-auth), retrying in ${pollInterval}ms...`);
            setTimeout(checkDatabaseSuccess, pollInterval);
          } else {
            console.log('Database verification: FAILED due to persistent errors or auth issues');
            setIsVerifying(false);
            resolve(false);
          }
        }
      };
      
      // Start checking immediately
      checkDatabaseSuccess();
    });
  }, [user]);

  return {
    verifyProcessingSuccess,
    isVerifying
  };
};
