import { useState, useEffect } from 'react';

// Centralized wine processing state management
export const useWineProcessingState = () => {
  const [wineProcessingComplete, setWineProcessingComplete] = useState(() => {
    // EMERGENCY FIX: Always allow wine pairing to proceed unless explicitly blocked
    const sessionComplete = sessionStorage.getItem('wineProcessingComplete') === 'true';
    const hasMenuData = sessionStorage.getItem('currentSessionResults') || localStorage.getItem('currentRestaurantId');
    return sessionComplete || !!hasMenuData; // Default to true if we have any menu data
  });

  useEffect(() => {
    // Listen for wine processing completion events
    const handleWineProcessingComplete = () => {
      setWineProcessingComplete(true);
    };

    // Add event listener
    window.addEventListener('wineProcessingComplete', handleWineProcessingComplete);

    // Check sessionStorage on mount in case event was missed
    const isComplete = sessionStorage.getItem('wineProcessingComplete') === 'true';
    if (isComplete) {
      setWineProcessingComplete(true);
    }

    // Cleanup
    return () => {
      window.removeEventListener('wineProcessingComplete', handleWineProcessingComplete);
    };
  }, []);

  return {
    wineProcessingComplete,
    setWineProcessingComplete
  };
};