
import { useCallback } from 'react';

export const useSessionManager = () => {
  
  const clearAllData = useCallback(() => {
    // Clear session storage (fast mode data)
    sessionStorage.removeItem('currentSessionResults');
    sessionStorage.removeItem('currentSessionRestaurant');
    sessionStorage.removeItem('sessionWinePairings');
    sessionStorage.removeItem('sessionSelectedDishes');
    sessionStorage.removeItem('sessionWines');
    sessionStorage.removeItem('wineBackup');
    sessionStorage.removeItem('pairingsGeneratedAt');
    
    // Clear localStorage (legacy data)
    localStorage.removeItem('currentRestaurantId');
    localStorage.removeItem('currentRestaurantName');
    localStorage.removeItem('selectedRestaurant');
    localStorage.removeItem('menuItems');
    localStorage.removeItem('availableWines');
    localStorage.removeItem('winePairings');
    localStorage.removeItem('selectedDishesForPairing');
    localStorage.removeItem('restaurantName');
    localStorage.removeItem('wineList');
    localStorage.removeItem('processedWines');
    
    // Clear age verification data
    localStorage.removeItem('ageVerified');
    localStorage.removeItem('ageVerificationExpiry');
    
    console.log('✅ ALL SESSION AND WINE DATA CLEARED - Fresh start guaranteed');
  }, []);

  const clearUserSpecificData = useCallback(() => {
    // Clear all user-specific data but preserve non-user specific settings
    clearAllData();
    console.log('User-specific data cleared');
  }, [clearAllData]);

  const startNewSession = useCallback((restaurantId: string, restaurantName: string) => {
    // Clear any existing data first
    clearAllData();
    
    // Set up new session with restaurant context
    localStorage.setItem('currentRestaurantId', restaurantId);
    localStorage.setItem('currentRestaurantName', restaurantName);
    localStorage.setItem('selectedRestaurant', JSON.stringify({
      id: restaurantId,
      name: restaurantName
    }));
    
    console.log(`New session started for restaurant: ${restaurantName} (${restaurantId})`);
  }, [clearAllData]);

  const hasValidSession = useCallback(() => {
    // Check for session-based data (fast mode)
    const sessionResults = sessionStorage.getItem('currentSessionResults');
    const sessionRestaurant = sessionStorage.getItem('currentSessionRestaurant');
    
    if (sessionResults && sessionRestaurant) {
      return true;
    }
    
    // Fallback: check for restaurant selection
    const restaurantId = localStorage.getItem('currentRestaurantId');
    const restaurantName = localStorage.getItem('currentRestaurantName');
    
    return !!(restaurantId && restaurantName);
  }, []);

  return {
    clearAllData,
    clearUserSpecificData,
    startNewSession,
    hasValidSession,
  };
};
