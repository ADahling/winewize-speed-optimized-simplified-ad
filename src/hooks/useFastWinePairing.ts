import { useState, useEffect, useMemo } from 'react';
import { usePairingApiCalls } from './usePairingApiCalls';

export const useFastWinePairing = () => {
  const [isPairingInProgress, setIsPairingInProgress] = useState(false);
  const [pairingStatus, setPairingStatus] = useState('');
  const [pairingProgress, setPairingProgress] = useState(0);
  const [fastPairingEnabled, setFastPairingEnabled] = useState(true);
  
  const apiCalls = usePairingApiCalls();
  
  // Ensure wine list is completely loaded before pairing
  const ensureWineListReady = (wines: any[] | undefined): boolean => {
    if (!wines || wines.length === 0) {
      setPairingStatus('Waiting for wine list to load...');
      console.warn('Wine list not ready for pairing');
      return false;
    }
    
    console.log(`Wine list ready with ${wines.length} wines`);
    return true;
  };
  
  const getPairingsForDishes = async (
    dishes: any[],
    restaurantId?: string,
    availableWines?: any[],
    userPreferences?: any
  ) => {
    if (!dishes || dishes.length === 0) {
      console.error('No dishes provided for pairing');
      return [];
    }
    
    if (!ensureWineListReady(availableWines)) {
      return [];
    }
    
    setIsPairingInProgress(true);
    setPairingStatus('Generating wine pairings...');
    setPairingProgress(10);
    
    try {
      const dishCount = dishes.length;
      console.log(`Pairing ${dishCount} dishes with fast pairing engine`);
      
      // Create progress updates
      const progressInterval = setInterval(() => {
        setPairingProgress(prev => {
          if (prev < 90) {
            const newProgress = prev + 5;
            setPairingStatus(`Analyzing flavor profiles... ${Math.round(newProgress)}%`);
            return newProgress;
          }
          return prev;
        });
      }, 1000);
      
      // Get pairings
      const results = await apiCalls.getPairingsForDishes(
        dishes,
        restaurantId,
        availableWines,
        userPreferences
      );
      
      clearInterval(progressInterval);
      setPairingProgress(100);
      setPairingStatus('Wine pairings ready!');
      
      return results;
    } catch (error) {
      console.error('Error in fast wine pairing:', error);
      setPairingStatus('Error generating pairings');
      return [];
    } finally {
      setTimeout(() => {
        setIsPairingInProgress(false);
      }, 500);
    }
  };
  
  const getConsolidatedPairings = async (
    dishes: any[],
    restaurantId?: string,
    availableWines?: any[],
    userPreferences?: any
  ) => {
    if (!dishes || dishes.length === 0) {
      console.error('No dishes provided for consolidated pairing');
      return [];
    }
    
    if (!ensureWineListReady(availableWines)) {
      return [];
    }
    
    setIsPairingInProgress(true);
    setPairingStatus('Creating consolidated pairings...');
    setPairingProgress(10);
    
    try {
      const dishCount = dishes.length;
      console.log(`Creating consolidated pairings for ${dishCount} dishes`);
      
      // Create progress updates
      const progressInterval = setInterval(() => {
        setPairingProgress(prev => {
          if (prev < 90) {
            const newProgress = prev + 5;
            setPairingStatus(`Analyzing flavor harmony... ${Math.round(newProgress)}%`);
            return newProgress;
          }
          return prev;
        });
      }, 1000);
      
      // Get consolidated pairings
      const results = await apiCalls.getConsolidatedPairings(
        dishes,
        restaurantId,
        availableWines,
        userPreferences
      );
      
      clearInterval(progressInterval);
      setPairingProgress(100);
      setPairingStatus('Consolidated pairings ready!');
      
      return results;
    } catch (error) {
      console.error('Error in consolidated pairing:', error);
      setPairingStatus('Error generating consolidated pairings');
      return [];
    } finally {
      setTimeout(() => {
        setIsPairingInProgress(false);
      }, 500);
    }
  };
  
  const pairingResults = useMemo(() => apiCalls.pairingResults, [apiCalls.pairingResults]);
  const consolidatedPairings = useMemo(() => apiCalls.consolidatedPairings, [apiCalls.consolidatedPairings]);
  const hasPairings = useMemo(() => apiCalls.hasPairings, [apiCalls.hasPairings]);
  const hasConsolidatedPairings = useMemo(() => apiCalls.hasConsolidatedPairings, [apiCalls.hasConsolidatedPairings]);
  
  return {
    isPairingInProgress,
    pairingStatus,
    pairingProgress,
    fastPairingEnabled,
    pairingResults,
    consolidatedPairings,
    hasPairings,
    hasConsolidatedPairings,
    getPairingsForDishes,
    getConsolidatedPairings
  };
};