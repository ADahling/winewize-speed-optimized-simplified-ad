import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Transaction logging for debugging
const logTransaction = (action: string, data?: any) => {
  console.log(`🔄 [WinePairing] ${action}`, data ? { data } : '');
};

const logError = (action: string, error: any) => {
  console.error(`❌ [WinePairing] ${action}`, error);
};

// Simple state indicator for UI
interface PairingState {
  isReady: boolean;
  hasWines: boolean;
  hasDishes: boolean;
  wineCount: number;
  dishCount: number;
}

export const useSimplifiedWinePairing = (winesFromState?: any[], mode?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingState, setPairingState] = useState<PairingState>({
    isReady: false,
    hasWines: false,
    hasDishes: false,
    wineCount: 0,
    dishCount: 0
  });
  
  const { user } = useAuth();

  // Simple function to check if ready for pairing
  const checkPairingReadiness = useCallback(() => {
    logTransaction('ENTRY: checkPairingReadiness');
    try {
      const sessionResults = JSON.parse(sessionStorage.getItem('currentSessionResults') || 'null');
      const hasWines = sessionResults?.wines?.length > 0;
      const hasDishes = sessionResults?.menuItems?.length > 0;
      const wineCount = sessionResults?.wines?.length || 0;
      const dishCount = sessionResults?.menuItems?.length || 0;
      const newState = {
        isReady: hasWines && hasDishes,
        hasWines,
        hasDishes,
        wineCount,
        dishCount
      };
      setPairingState(newState);
      logTransaction('EXIT: checkPairingReadiness', newState);
      return newState;
    } catch (error) {
      logError('checkPairingReadiness', error);
      return {
        isReady: false,
        hasWines: false,
        hasDishes: false,
        wineCount: 0,
        dishCount: 0
      };
    }
  }, []);

  // Simplified pairing generation - no complex mode detection or validation layers
  const generatePairings = useCallback(async (selectedDishes: any[]) => {
    console.log('[DEBUG] generatePairings called with mode:', mode, 'winesFromState:', winesFromState?.length, winesFromState);
    logTransaction('ENTRY: generatePairings', { dishCount: selectedDishes.length });
    setError(null);
    if (!user) {
      const errorMsg = 'Please log in to generate wine pairings';
      setError(errorMsg);
      toast.error(errorMsg);
      logError('generatePairings: No user', errorMsg);
      return;
    }
    if (!selectedDishes?.length) {
      const errorMsg = 'Please select at least one dish to pair wines with';
      setError(errorMsg);
      toast.error(errorMsg);
      logError('generatePairings: No dishes', errorMsg);
      return;
    }
    let wines = [];
    let restaurantName = 'Session Restaurant';
    let sessionResults: any = null;
    if (mode === 'IMPORT' && winesFromState && winesFromState.length > 0) {
      console.log('[DEBUG] Returning availableWines from winesFromState (IMPORT mode):', winesFromState.length, winesFromState);
      wines = winesFromState;
      // Try to get restaurantName from sessionResults if available
      sessionResults = JSON.parse(sessionStorage.getItem('currentSessionResults') || 'null');
      if (sessionResults?.restaurantName) {
        restaurantName = sessionResults.restaurantName;
      }
    } else {
      sessionResults = JSON.parse(sessionStorage.getItem('currentSessionResults') || 'null');
      wines = sessionResults?.wines || [];
      if (sessionResults?.restaurantName) {
        restaurantName = sessionResults.restaurantName;
      }
    }
    if (wines.length === 0) {
      const errorMsg = 'No wines found. Please upload wine list images first.';
      setError(errorMsg);
      toast.error(errorMsg);
      logError('generatePairings: No wines', { sessionResults });
      return;
    }
    logTransaction('Wine retrieval success', { wineCount: wines.length });
    try {
      setIsGenerating(true);
      logTransaction('Starting pairing generation');
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No valid session found');
      }
      const pairingPayload = {
        dishes: selectedDishes,
        availableWines: wines,
        mode: 'session',
        consolidatedMode: false,
        restaurantName,
        budget: 50
      };
      logTransaction('Calling wine-pairing-unified', pairingPayload);
      const { data: pairingData, error: pairingError } = await supabase.functions.invoke('wine-pairing-unified', {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
        body: pairingPayload
      });
      if (pairingError || !pairingData?.success) {
        throw new Error(pairingData?.error || pairingError?.message || 'Wine pairing failed');
      }
      logTransaction('Pairing generation success', { 
        pairingCount: pairingData.pairings?.length || 0 
      });
      const pairingResults = {
        pairings: pairingData.pairings || [],
        dishes: selectedDishes,
        timestamp: Date.now(),
        restaurantName
      };
      sessionStorage.setItem('currentPairingResults', JSON.stringify(pairingResults));
      toast.success(`Generated ${pairingData.pairings?.length || 0} wine pairings!`);
      logTransaction('EXIT: generatePairings success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate wine pairings';
      setError(errorMessage);
      toast.error(errorMessage);
      logError('generatePairings', error);
    } finally {
      setIsGenerating(false);
    }
  }, [winesFromState, mode, user]);

  // Simple pairing results retrieval
  const getPairingResults = useCallback(() => {
    logTransaction('ENTRY: getPairingResults');
    try {
      const results = JSON.parse(sessionStorage.getItem('currentPairingResults') || 'null');
      logTransaction('EXIT: getPairingResults', { hasResults: !!results });
      return results;
    } catch (error) {
      logError('getPairingResults', error);
      return null;
    }
  }, []);

  return {
    isGenerating,
    error,
    pairingState,
    generatePairings,
    checkPairingReadiness,
    getPairingResults,
    clearError: () => setError(null)
  };
};