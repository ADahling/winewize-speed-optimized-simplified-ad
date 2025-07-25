
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePairingMode } from '@/hooks/usePairingMode';
import { useWineRetrieval } from '@/hooks/useWineRetrieval';
import { useWineValidation } from '@/hooks/useWineValidation';
import { useUsageManagement } from '@/hooks/useUsageManagement';
import { usePairingApiCalls } from '@/hooks/usePairingApiCalls';
import { useWineProcessingState } from '@/hooks/useWineProcessingState';
import { transformPairingResponse, storePairingResults } from '@/utils/pairingResponseUtils';
import { useAuth } from '@/contexts/AuthContext';

// Streamlined core wine pairing logic
export const useWinePairingCore = (winesFromState?: any[], mode?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { detectPairingMode } = usePairingMode();
  const { retrieveWines } = useWineRetrieval();
  const { validateAndProcessWines } = useWineValidation();
  const { usageStats, showUpgradePrompt, setShowUpgradePrompt, checkUsageLimit, trackUsage } = useUsageManagement();
  const { getPairingsForDishes, getConsolidatedPairings } = usePairingApiCalls();
  const { wineProcessingComplete } = useWineProcessingState();

  const generatePairings = useCallback(async (selectedDishesInput: any[], suppressErrors = false) => {
    console.log('🚀 [WinePairingCore] GENERATE PAIRINGS CALLED');
    console.log('🍷 [WinePairingCore] winesFromState:', winesFromState?.length, winesFromState);
    console.log('🍽️ [WinePairingCore] selectedDishes:', selectedDishesInput?.length, selectedDishesInput);
    
    // Simple validation without verbose logging
    let selectedDishes;
    if (selectedDishesInput.length > 0 && typeof selectedDishesInput[0] === 'string') {
      if (!suppressErrors) toast.error('Invalid dish data format. Please try selecting dishes again.');
      return;
    } else {
      selectedDishes = selectedDishesInput;
    }

    if (!selectedDishes?.length) {
      if (!suppressErrors) toast.error('Please select at least one dish to pair wines with');
      return;
    }

    if (!user) {
      if (!suppressErrors) toast.error('Please log in to generate wine pairings');
      return;
    }

    // Fast mode detection and usage check
    const pairingMode = detectPairingMode();
    console.log('🎯 [WinePairingCore] Detected pairing mode:', pairingMode);
    
    const canProceed = await checkUsageLimit();
    if (!canProceed) return;

    try {
      setIsGenerating(true);
      setError(null);

      let availableWines = [];

      if (mode === 'IMPORT' && winesFromState && winesFromState.length > 0) {
        console.log('[DEBUG] useWinePairingCore: Using winesFromState in IMPORT mode:', winesFromState.length, winesFromState);
        availableWines = winesFromState;
      } else {
        console.log('🔄 [WinePairingCore] Fallback to session/local storage for SESSION/UPLOAD');
        // Fallback to session/local storage for SESSION/UPLOAD
        const currentRestaurantId = localStorage.getItem('currentRestaurantId');
        if (!currentRestaurantId) {
          throw new Error('No restaurant selected');
        }

        const restaurantWines = await retrieveWines({ 
          mode: pairingMode,
          restaurantId: currentRestaurantId
        });

        if (restaurantWines.length === 0) {
          throw new Error('No wines found for pairing. Please ensure wine images were uploaded.');
        }

        availableWines = restaurantWines;
      }

      // Validate and process wines
      console.log('🔍 [WinePairingCore] Validating wines before API call:', availableWines.length);
      const validWines = validateAndProcessWines(availableWines);

      if (validWines.length === 0) {
        throw new Error('No valid wines found for pairing after processing. Please check wine data quality.');
      }

      console.log('✅ [WinePairingCore] Valid wines ready for API call:', validWines.length);

      // Call pairing API with validated wines
      console.log('📡 [WinePairingCore] Calling getPairingsForDishes API...');
      const pairingData = await getPairingsForDishes(selectedDishes, localStorage.getItem('currentRestaurantId'), validWines);
      console.log('✅ [WinePairingCore] API call completed:', pairingData?.length);

      // Fast response transformation
      const transformedPairings = transformPairingResponse(pairingData, pairingMode);
      console.log('🔄 [WinePairingCore] Transformed pairings:', transformedPairings.length);

      // Store results
      storePairingResults(transformedPairings, selectedDishes);

      if (!suppressErrors) {
        toast.success(`Generated ${transformedPairings.length} wine pairings successfully!`);
      }

      // Track usage
      await trackUsage();

      // CRITICAL FIX: Navigate to pairings page after successful generation
      console.log('🚀 [WinePairingCore] Navigating to /pairings');
      navigate('/pairings', { 
        state: { 
          pairings: transformedPairings,
          fromDishes: true,
          restaurantId: localStorage.getItem('currentRestaurantId') || 'session-only'
        }
      });

    } catch (error) {
      console.error('❌ [WinePairingCore] Error in generatePairings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate wine pairings';
      setError(errorMessage);
      if (!suppressErrors) {
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [user, detectPairingMode, retrieveWines, validateAndProcessWines, checkUsageLimit, trackUsage, getPairingsForDishes, wineProcessingComplete, navigate, winesFromState, mode]);

  return {
    isGenerating,
    error,
    generatePairings,
    clearError: () => setError(null),
    usageStats,
    showUpgradePrompt,
    setShowUpgradePrompt
  };
};
