
import { useState, useEffect } from 'react';

export const useSessionResults = () => {
  const [sessionResults, setSessionResults] = useState(null);
  const [sessionRestaurant, setSessionRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = () => {
    try {
      console.log('Loading session data...');
      
      // Load session results
      const storedResults = sessionStorage.getItem('currentSessionResults');
      if (storedResults) {
        const results = JSON.parse(storedResults);
        console.log('Loaded session results:', {
          menuItems: results.menuItems?.length || 0,
          wines: results.wines?.length || 0,
          restaurant: results.restaurantName
        });
        setSessionResults(results);
      } else {
        console.log('No session results found');
        setSessionResults(null);
      }

      // Load session restaurant
      const storedRestaurant = sessionStorage.getItem('currentSessionRestaurant');
      if (storedRestaurant) {
        const restaurant = JSON.parse(storedRestaurant);
        console.log('Loaded session restaurant:', restaurant);
        setSessionRestaurant(restaurant);
      } else {
        console.log('No session restaurant found');
        setSessionRestaurant(null);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      setSessionResults(null);
      setSessionRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    console.log('Clearing session data');
    sessionStorage.removeItem('currentSessionResults');
    sessionStorage.removeItem('currentSessionRestaurant');
    setSessionResults(null);
    setSessionRestaurant(null);
  };

  const hasValidSession = sessionResults && sessionRestaurant && 
    (sessionResults.menuItems?.length > 0 || sessionResults.wines?.length > 0);

  return {
    sessionResults,
    sessionRestaurant,
    isLoading,
    hasValidSession,
    loadSessionData,
    clearSession
  };
};
