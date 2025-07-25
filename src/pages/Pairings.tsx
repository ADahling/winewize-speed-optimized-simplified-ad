
import React, { useState, useEffect } from 'react';
import { Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePairingPopup } from '@/contexts/PairingPopupContext';
import { useWinePairing } from '@/hooks/useWinePairing';
import SmartRecommendations from '@/components/SmartRecommendations';
import Header from '@/components/Header';
import ProgressSteps from '@/components/ProgressSteps';
import LoadingAnimation from '@/components/LoadingAnimation';
import DishWinePairingBlock from '@/components/DishWinePairingBlock';
import ConsolidatedPairingCard from '@/components/ConsolidatedPairingCard';
import UnifiedProcessingModal from '@/components/UnifiedProcessingModal';
import { PairingsHeader } from '@/components/pairings/PairingsHeader';
import { PairingsSuccessMessage } from '@/components/pairings/PairingsSuccessMessage';
import { PairingsEmptyState } from '@/components/pairings/PairingsEmptyState';
import { logger } from '@/utils/logger';
import { WineRecommendation, DishRecommendation } from '@/types/wine';

const Pairings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<DishRecommendation[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<{
    error?: string;
    data?: unknown;
    stack?: string;
    dishCount?: number;
    totalWines?: number;
    sampleStructure?: unknown;
    isRecentlyGenerated?: boolean;
  } | null>(null);
  const [isRecentlyGenerated, setIsRecentlyGenerated] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<any[]>([]);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const { hidePopup } = usePairingPopup();
  const { getSmartRecommendations } = useWinePairing();

  useEffect(() => {
    // Check if we have wine processing in progress
    const checkProcessingStatus = () => {
      const sessionRecommendations = sessionStorage.getItem('sessionWinePairings');
      const sessionRestaurant = sessionStorage.getItem('currentSessionRestaurant');
      const sessionSelectedDishes = sessionStorage.getItem('sessionSelectedDishes');
      
      // If no recommendations but we have dishes selected, keep processing modal open
      if (!sessionRecommendations && sessionSelectedDishes) {
        logger.info('No wine pairings found but dishes selected - keeping processing modal open');
        setShowProcessingModal(true);
        setProcessingProgress(75); // Show progress as we wait for wine processing
        
        // MOBILE-OPTIMIZED POLLING - More frequent checks, longer timeout
        let pollCount = 0;
        const maxPolls = 45; // 90 seconds total (45 * 2s = 90s)
        
        const pollInterval = setInterval(() => {
          pollCount++;
          const updatedRecommendations = sessionStorage.getItem('sessionWinePairings');
          
          logger.info(`🚨 MOBILE POLLING ${pollCount}/${maxPolls}:`, {
            hasRecommendations: !!updatedRecommendations,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
          
          if (updatedRecommendations) {
            logger.info('Wine pairings found during polling - closing processing modal');
            setShowProcessingModal(false);
            loadSessionRecommendations();
            clearInterval(pollInterval);
            return;
          }
          
          // Extended timeout for mobile
          if (pollCount >= maxPolls) {
            logger.error('🚨 MOBILE TIMEOUT: Wine pairing generation failed after 90 seconds');
            clearInterval(pollInterval);
            setShowProcessingModal(false);
            setIsLoading(false);
            setDebugInfo({ 
              error: 'Wine pairing generation timed out. This may be due to network issues on mobile. Please try again or check your connection.',
              data: { 
                timeout: '90 seconds',
                pollCount,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
              }
            });
          }
        }, 2000);
        
        return;
      }
      
      // Load recommendations immediately if available
      loadSessionRecommendations();
    };

    // Show loading animation for 2 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Load recommendations from session storage (fast mode)
    const loadSessionRecommendations = () => {
      try {
        // Try session storage first (fast mode)
        const sessionRecommendations = sessionStorage.getItem('sessionWinePairings');
        const sessionRestaurant = sessionStorage.getItem('currentSessionRestaurant');
        const sessionSelectedDishes = sessionStorage.getItem('sessionSelectedDishes');
        
        logger.info('Loading session recommendations', { 
          hasSessionRecommendations: !!sessionRecommendations,
          hasSessionRestaurant: !!sessionRestaurant 
        });
        
        if (sessionRecommendations) {
          const parsed = JSON.parse(sessionRecommendations);
          
          logger.info('Session data parsed successfully', { 
            recommendationCount: parsed?.length || 0,
            dataType: Array.isArray(parsed) ? 'array' : typeof parsed,
            sampleData: parsed[0]
          });
          
          // Load selected dishes for consolidated pairing card - FIXED
          if (sessionSelectedDishes) {
            try {
              const dishes = JSON.parse(sessionSelectedDishes);
              console.log('🔍 [Pairings] Loading selected dishes for table pairing:', dishes);
              setSelectedDishes(dishes.map((dish: any) => dish.id));
            } catch (e) {
              console.error('Error parsing session selected dishes:', e);
            }
          }
          
          // Check if this is recently generated data (within last 5 seconds)
          const lastGenerated = sessionStorage.getItem('pairingsGeneratedAt');
          const isRecent = lastGenerated && (Date.now() - parseInt(lastGenerated)) < 5000;
          setIsRecentlyGenerated(!!isRecent);
          
          // FIXED: Validate DishRecommendation[] structure
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Validate each dish recommendation has the correct structure
            const isValidStructure = parsed.every(dish => 
              dish.dish && 
              dish.dishDescription !== undefined && 
              dish.dishPrice !== undefined &&
              Array.isArray(dish.pairings)
            );

            if (isValidStructure) {
              const totalWines = parsed.reduce((sum, dish) => sum + (dish.pairings?.length || 0), 0);
              logger.info('Valid DishRecommendation[] structure detected', { 
                dishCount: parsed.length,
                totalWines,
                sampleDish: parsed[0]?.dish,
                samplePairingsCount: parsed[0]?.pairings?.length || 0
              });
              
              setDebugInfo({
                dishCount: parsed.length,
                totalWines,
                sampleStructure: parsed[0],
                isRecentlyGenerated: isRecent
              });

              setRecommendations(parsed);
              
              // Set restaurant name from session or localStorage
              if (sessionRestaurant) {
                const restaurant = JSON.parse(sessionRestaurant);
                setRestaurantName(restaurant.name);
              } else {
                const currentRestaurantName = localStorage.getItem('currentRestaurantName');
                setRestaurantName(currentRestaurantName || '');
              }

              // Auto-dismiss the global popup when results are loaded
              setTimeout(() => {
                hidePopup();
              }, 500);
            } else {
              logger.warn('Invalid DishRecommendation structure detected', { 
                parsedType: typeof parsed,
                isArray: Array.isArray(parsed),
                firstItemStructure: parsed[0],
                expectedKeys: ['dish', 'dishDescription', 'dishPrice', 'pairings']
              });
              setDebugInfo({ error: 'Invalid recommendation structure - missing required properties', data: parsed });
              hidePopup();
            }
          } else {
            logger.warn('Empty or invalid recommendations array', { 
              parsedType: typeof parsed,
              isArray: Array.isArray(parsed),
              parsedValue: parsed 
            });
            setDebugInfo({ error: 'Empty or invalid recommendations array', data: parsed });
            hidePopup();
          }
        } else {
          logger.info('No session data found, checking localStorage fallback');
          // Fallback to localStorage for backward compatibility
          const savedRecommendations = localStorage.getItem('winePairings');
          if (savedRecommendations) {
            const parsed = JSON.parse(savedRecommendations);
            logger.info('Loaded localStorage recommendations', { 
              recommendationCount: parsed?.length || 0 
            });
            setRecommendations(parsed);
          } else {
            logger.warn('No recommendations found in session or local storage');
            setDebugInfo({ error: 'No pairing data found - please generate wine pairings first' });
          }
          hidePopup();
        }
      } catch (error) {
        logger.error('Error loading recommendations', { 
          error, 
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack 
        });
        setDebugInfo({ error: (error as Error).message, stack: (error as Error).stack });
        hidePopup();
      }
    };

    checkProcessingStatus();

    // Track page view interaction
    if (user) {
      supabase
        .from('wine_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'view',
          wine_name: '',
          dish_name: 'Multiple dishes pairing view'
        });
    }

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [user, hidePopup]);

  const handleConsolidatedPairingsGenerated = (pairings: WineRecommendation[]) => {
    // This handles the consolidated pairings from the ConsolidatedPairingCard
    logger.info('Consolidated pairings generated:', pairings);
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  // Show processing modal if wine processing is still in progress
  if (showProcessingModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-28">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">
              🍷✨ Crafting Your Perfect Wine Pairings
            </h1>
            <p className="text-slate-600">
              Our AI sommelier is analyzing the wine list to find the perfect matches for your dishes...
            </p>
          </div>
          
          <UnifiedProcessingModal
            isOpen={true}
            onClose={() => {}}
            currentStep="analyzing"
            progress={processingProgress}
            showTips={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-96">{/* Massive bottom padding for mobile scrolling */}
      <Header />
      <div className="container mx-auto px-4 py-8 pt-28">
        <PairingsHeader 
          isRecentlyGenerated={isRecentlyGenerated}
          restaurantName={restaurantName}
        />

        {/* Progress Indicator */}
        <ProgressSteps currentStep={5} />

        {/* Debug Information (only show if there are real errors) */}
        {debugInfo && debugInfo.error && recommendations.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2">Debug Information:</h3>
            <pre className="text-sm text-amber-700 overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Success Message */}
        {recommendations.length > 0 && (
          <PairingsSuccessMessage
            recommendationsCount={recommendations.length}
            isRecentlyGenerated={isRecentlyGenerated}
            totalWines={debugInfo?.totalWines}
          />
        )}

        {/* Consolidated Pairing Card - FIXED: show when selectedDishes exist */}
        {selectedDishes.length > 0 && (
          <div className="mb-8">
            <ConsolidatedPairingCard 
              selectedDishes={selectedDishes}
              onPairingsGenerated={handleConsolidatedPairingsGenerated}
            />
          </div>
        )}

        {/* Individual Dish Pairings Section Header */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-br from-pink-50/80 to-purple-50/80 border border-pink-200 rounded-2xl p-4 md:p-6 mb-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                <Utensils className="w-6 h-6 text-pink-600" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-bold text-pink-800 mb-2">
                  🍷 Perfect Pairings for Your Dishes
                </h3>
                
                <p className="text-pink-700 leading-relaxed text-sm md:text-base">
                  Hand-picked wines chosen to elevate every bite and bring out the best in your meal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wine Pairings Blocks - Individual dish pairings */}
        {recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((dishRec, index) => {
              return (
                <DishWinePairingBlock
                  key={`${dishRec.dish}-${index}`}
                  dishName={dishRec.dish}
                  dishDescription={dishRec.dishDescription}
                  dishPrice={dishRec.dishPrice}
                  wines={dishRec.pairings || []}
                />
              );
            })}
          </div>
        ) : (
          <PairingsEmptyState />
        )}

        {/* Smart Recommendations - show when no regular recommendations */}
        {recommendations.length === 0 && (
          <SmartRecommendations 
            recommendations={smartRecommendations}
            onRecommendationSelect={(recommendation) => {
              logger.info('Smart recommendation selected:', recommendation);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Pairings;
