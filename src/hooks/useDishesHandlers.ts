// --- START OF FILE ---

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWineProcessingState } from './useWineProcessingState';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDishesHandlers = (winesFromState?: any[], mode?: string) => {
  const navigate = useNavigate();
  const { setWineProcessingComplete } = useWineProcessingState();
  // Removed: const { toast } = useToast();

  const handlePairingsReady = useCallback(() => {
    setWineProcessingComplete(true);
    window.dispatchEvent(new Event('wineProcessingComplete'));
    navigate('/pairings');
  }, [navigate, setWineProcessingComplete]);

  const handleProcessingError = useCallback((error: Error) => {
    toast.error(error.message || 'Processing Error');
    setWineProcessingComplete(false);
  }, [setWineProcessingComplete]);

  const handleGeneratePairings = useCallback(async (dishes: any[], options?: any) => {
    console.log('[DEBUG] handleGeneratePairings called with mode:', mode, 'winesFromState:', winesFromState?.length, winesFromState);
    let availableWines: any[] = [];
    if (mode === 'IMPORT' && winesFromState && winesFromState.length > 0) {
      console.log('🍷 [DishesHandlers] Using wines from React state/context (IMPORT mode):', winesFromState.length);
      availableWines = winesFromState;
      const pairingPayload = {
        dishes,
        availableWines,
        mode: 'import',
        consolidatedMode: false,
        restaurantName: localStorage.getItem('currentRestaurantName') || 'Imported Restaurant',
        budget: 50
      };
      console.log('[DEBUG] About to call wine-pairing-unified', pairingPayload);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          throw new Error('No valid session found');
        }
        const { data: pairingData, error: pairingError } = await supabase.functions.invoke('wine-pairing-unified', {
          headers: { Authorization: `Bearer ${session.session.access_token}` },
          body: pairingPayload
        });
        console.log('[DEBUG] Edge function response:', pairingData, pairingError);
        if (pairingError || !pairingData?.success) {
          throw new Error(pairingData?.error || pairingError?.message || 'Wine pairing failed');
        }
        toast.success(`Generated ${pairingData.pairings?.length || 0} wine pairings!`);
        console.log('[DEBUG] Navigating to /pairings after successful pairing');
        navigate('/pairings');
        return pairingData.pairings;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate wine pairings';
        toast.error(errorMessage);
        console.error('[IMPORT] Wine pairing error:', error);
        return [];
      }
    } else {
      // SESSION/UPLOAD fallback logic (untouched)
      try {
        const currentSessionResults = sessionStorage.getItem('currentSessionResults');
        const sessionWinesRaw = sessionStorage.getItem('sessionWines');
        const wineBackupRaw = localStorage.getItem('wineBackup');
        // Check currentSessionResults first
        const sessionResults = JSON.parse(currentSessionResults || 'null');
        if (sessionResults?.wines?.length > 0) {
          availableWines = sessionResults.wines;
        } else {
          const sessionWines = JSON.parse(sessionWinesRaw || '[]');
          if (sessionWines && typeof sessionWines === 'object' && !Array.isArray(sessionWines)) {
            if (sessionWines.wines && Array.isArray(sessionWines.wines) && sessionWines.wines.length > 0) {
              availableWines = sessionWines.wines;
            }
          } else if (Array.isArray(sessionWines) && sessionWines.length > 0) {
            availableWines = sessionWines;
          } else {
            const wineBackup = JSON.parse(wineBackupRaw || '[]');
            if (Array.isArray(wineBackup) && wineBackup.length > 0) {
              availableWines = wineBackup;
            }
          }
        }
        // Only call edge function if wines are found
        if (availableWines.length > 0) {
          console.log('[DEBUG] Calling wine-pairing-unified edge function with SESSION/UPLOAD mode wines:', availableWines.length, availableWines);
          const { data: session } = await supabase.auth.getSession();
          if (!session?.session?.access_token) {
            throw new Error('No valid session found');
          }
          const pairingPayload = {
            dishes,
            availableWines,
            mode: 'session',
            consolidatedMode: false,
            restaurantName: localStorage.getItem('currentRestaurantName') || 'Session Restaurant',
            budget: 50
          };
          const { data: pairingData, error: pairingError } = await supabase.functions.invoke('wine-pairing-unified', {
            headers: { Authorization: `Bearer ${session.session.access_token}` },
            body: pairingPayload
          });
          if (pairingError || !pairingData?.success) {
            throw new Error(pairingData?.error || pairingError?.message || 'Wine pairing failed');
          }
          toast.success(`Generated ${pairingData.pairings?.length || 0} wine pairings!`);
          navigate('/pairings');
          return pairingData.pairings;
        } else {
          toast.error('No wines found. Please upload wine list images first.');
          return [];
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate wine pairings';
        toast.error(errorMessage);
        console.error('[SESSION/UPLOAD] Wine pairing error:', error);
        return [];
      }
    }
  }, [winesFromState, mode, navigate]);

  return {
    handlePairingsReady,
    handleProcessingError,
    handleGeneratePairings,
  };
};

// --- END OF FILE ---