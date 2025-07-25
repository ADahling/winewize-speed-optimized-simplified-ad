import React, { useState, useCallback } from 'react';
import { Wine, Users, Loader2, ChefHat, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { WineRecommendation } from '@/types/wine';
import { useSessionOnlyMode } from '@/hooks/useSessionOnlyMode';
import WineCard from '@/components/WineCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConsolidatedPairingCardProps {
  selectedDishes: string[];
  onPairingsGenerated: (pairings: WineRecommendation[]) => void;
  winesFromState?: any[]; // <-- Add this prop for IMPORT mode
  mode?: string; // Added mode prop
}

const ConsolidatedPairingCard: React.FC<ConsolidatedPairingCardProps> = ({
  selectedDishes,
  onPairingsGenerated,
  winesFromState, // <-- Add this prop for IMPORT mode
  mode, // Added mode prop
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [consolidatedPairings, setConsolidatedPairings] = useState<WineRecommendation[]>([]);
  const [insufficientWines, setInsufficientWines] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSessionOnly } = useSessionOnlyMode();

  // Detect pairing mode based on current context
  const detectPairingMode = () => {
    if (isSessionOnly) {
      return 'SESSION';
    }

    const sessionResults = sessionStorage.getItem('currentSessionResults');
    if (sessionResults) {
      try {
        const results = JSON.parse(sessionResults);
        if (results.sessionOnly || results.restaurantId === 'session-only') {
          return 'SESSION';
        }
        if (results.restaurantId && results.restaurantId !== 'session-only') {
          return 'UPLOAD';
        }
      } catch (error) {
        console.warn('Error parsing session results:', error);
      }
    }

    const currentRestaurantId = localStorage.getItem('currentRestaurantId');
    if (currentRestaurantId && currentRestaurantId !== 'session-only') {
      return 'IMPORT';
    }

    return 'SESSION';
  };

  // Process wine data with validation
  const processWineData = (wines: any[]) => {
    if (!wines || wines.length === 0) {
      return [];
    }

    // Filter out invalid wines
    const validWines = wines.filter(wine => {
      if (!wine.name || wine.name.trim() === '') {
        return false;
      }
      
      // Make sure it's a real wine with basic properties
      const hasBasicWineProps = wine.wine_type || wine.varietal || wine.ww_style;
      if (!wine.restaurant_id && !hasBasicWineProps) {
        return false;
      }
      
      return true;
    });

    // Map wines to consistent format without adding fictional properties
    return validWines.map(wine => ({
      id: wine.id || `temp-${Date.now()}-${Math.random()}`,
      name: wine.name,
      varietal: wine.varietal || '',
      region: wine.region || '',
      vintage: wine.vintage || '',
      price_bottle: wine.price_bottle || wine.price || '',
      price_glass: wine.price_glass || '',
      wine_type: wine.wine_type || detectWineType(wine.name, wine.varietal || ''),
      ww_style: wine.ww_style || mapToWineWizeStyle(wine.wine_type || detectWineType(wine.name, wine.varietal || '')),
      description: wine.description || '',
      restaurant_id: wine.restaurant_id || null,
      confidence_level: wine.confidence_level || 'Medium',
      source: wine.restaurant_id ? 'restaurant' : 'session'
    }));
  };

  const detectWineType = (wineName: string, varietal: string): string => {
    const lowerWineName = wineName.toLowerCase();
    const lowerVarietal = varietal.toLowerCase();

    if (
      lowerWineName.includes('red') ||
      lowerVarietal.includes('cabernet') ||
      lowerVarietal.includes('merlot') ||
      lowerVarietal.includes('syrah') ||
      lowerVarietal.includes('malbec')
    ) {
      return 'Red';
    } else if (
      lowerWineName.includes('white') ||
      lowerVarietal.includes('chardonnay') ||
      lowerVarietal.includes('sauvignon blanc') ||
      lowerVarietal.includes('riesling')
    ) {
      return 'White';
    } else if (lowerWineName.includes('rosé') || lowerVarietal.includes('rosé')) {
      return 'Rosé';
    } else if (lowerWineName.includes('sparkling') || lowerVarietal.includes('champagne') || lowerVarietal.includes('prosecco')) {
      return 'Sparkling';
    } else {
      return 'Unknown';
    }
  };

  const mapToWineWizeStyle = (wineType: string): string => {
    switch (wineType.toLowerCase()) {
      case 'red':
        return 'Fresh & Fruity';
      case 'white':
        return 'Fresh & Crisp';
      case 'rosé':
      case 'rose':
        return 'Fresh & Crisp';
      case 'sparkling':
        return 'Fresh & Crisp';
      default:
        return 'Fresh & Crisp';
    }
  };

  const generateConsolidatedPairings = useCallback(async () => {
    console.log('[DEBUG] generateConsolidatedPairings called in ConsolidatedPairingCard');
    if (selectedDishes.length === 0) {
      toast({
        title: "No dishes selected",
        description: "Please select dishes first to get consolidated recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setInsufficientWines(false);

    try {
      const pairingMode = detectPairingMode();
      let selectedDishDetails = [];
      let availableWines = [];
      let restaurantId = null;
      let restaurantName = 'Unknown Restaurant';

      // Get dishes and wines based on mode
      if (pairingMode === 'SESSION') {
        const sessionResults = sessionStorage.getItem('currentSessionResults');
        if (!sessionResults) {
          throw new Error('No session data found');
        }

        const parsedResults = JSON.parse(sessionResults);
        selectedDishDetails = [];
        
        for (const selectedId of selectedDishes) {
          let matchedDish = parsedResults.menuItems.find((item: any) => item.id === selectedId);
          
          if (!matchedDish && selectedId.includes('fallback_')) {
            const parts = selectedId.split('_');
            const possibleIndex = parseInt(parts[parts.length - 1]);
            
            if (!isNaN(possibleIndex) && possibleIndex < parsedResults.menuItems.length) {
              matchedDish = parsedResults.menuItems[possibleIndex];
            }
          }
          
          if (!matchedDish) {
            const sessionSelectedDishes = sessionStorage.getItem('sessionSelectedDishes');
            if (sessionSelectedDishes) {
              try {
                const storedDishes = JSON.parse(sessionSelectedDishes);
                const storedDish = storedDishes.find((dish: any) => dish.id === selectedId);
                if (storedDish && storedDish.dish_name) {
                  matchedDish = parsedResults.menuItems.find((item: any) => 
                    (item.dish_name || item.name) === storedDish.dish_name
                  );
                }
              } catch (error) {
                console.warn('Error parsing stored dishes:', error);
              }
            }
          }
          
          if (matchedDish) {
            selectedDishDetails.push(matchedDish);
          }
        }

        if (!selectedDishDetails || selectedDishDetails.length === 0) {
          throw new Error('No valid dishes found for pairing. Please try selecting dishes again.');
        }

        availableWines = parsedResults.wines || [];
        restaurantId = parsedResults.restaurantId;
        restaurantName = parsedResults.restaurantName;
        
        // Fetch wines from database if needed
        if (availableWines.length === 0) {
          const currentRestaurantId = localStorage.getItem('currentRestaurantId');
          if (currentRestaurantId && currentRestaurantId !== 'session-only') {
            const { data: restaurantWines, error: winesError } = await supabase
              .from('restaurant_wines')
              .select('*')
              .eq('restaurant_id', currentRestaurantId)
              .eq('is_active', true);

            if (!winesError) {
              availableWines = restaurantWines || [];
            }
          }
        }
      } else if (pairingMode === 'UPLOAD') {
        const sessionResults = sessionStorage.getItem('currentSessionResults');
        if (!sessionResults) {
          throw new Error('No session data found for upload mode');
        }

        const parsedResults = JSON.parse(sessionResults);
        selectedDishDetails = parsedResults.menuItems.filter((item: any) => 
          selectedDishes.includes(item.id)
        );
        availableWines = parsedResults.wines || [];
        restaurantId = parsedResults.restaurantId;
        restaurantName = parsedResults.restaurantName;
        
      } else if (pairingMode === 'IMPORT') {
        const currentRestaurantId = localStorage.getItem('currentRestaurantId');
        const currentRestaurantName = localStorage.getItem('currentRestaurantName');
        
        if (!currentRestaurantId) {
          throw new Error('No restaurant selected for import mode');
        }

        // Fetch menu items from database
        const { data: menuItems, error: menuError } = await supabase
          .from('restaurant_menus')
          .select('*')
          .eq('restaurant_id', currentRestaurantId)
          .eq('is_active', true);

        if (menuError) throw menuError;

        // Fetch wines from database
        const { data: restaurantWines, error: winesError } = await supabase
          .from('restaurant_wines')
          .select('*')
          .eq('restaurant_id', currentRestaurantId)
          .eq('is_active', true);

        if (winesError) throw winesError;

        selectedDishDetails = (menuItems || []).filter((item: any) => 
          selectedDishes.includes(item.id)
        );
        availableWines = restaurantWines || [];
        restaurantId = currentRestaurantId;
        restaurantName = currentRestaurantName || 'Current Restaurant';
      }

      // Process and validate wines
      const processedWines = processWineData(availableWines);

      // Check if we have sufficient wines (CRITICAL FIX)
      if (processedWines.length < 10) {
        console.warn(`Insufficient wines available: ${processedWines.length} wines`);
        setInsufficientWines(true);
        toast({
          title: "Not enough wines available",
          description: "At least 10 wines are required for accurate table recommendations.",
          variant: "destructive",
        });
        return;
      }

      // Format dishes for pairing request
      const formattedDishes = selectedDishDetails.map((dish: any) => ({
        id: dish.id,
        dish_name: dish.dish_name || dish.name || 'Unknown Dish',
        description: dish.description || '',
        price: dish.price || '',
        dish_type: dish.dish_type || dish.type || '',
        ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : [],
        preparation: dish.preparation || '',
        cuisine: dish.cuisine || '',
        dietary_info: dish.dietary_info || ''
      }));

      // Get user preferences
      let userPreferences = null;
      try {
        const { data: preferences } = await supabase
          .from('wine_preferences')
          .select('*')
          .eq('user_id', user?.id)
          .single();
        
        userPreferences = preferences;
      } catch (error) {
        // Using default preferences
      }

      let pairingData;

      if (pairingMode === 'SESSION') {
        const fastPairingPayload = {
          dishes: formattedDishes,
          availableWines: processedWines,
          mode: 'session',
          consolidatedMode: true,
          userPreferences: userPreferences,
          budget: userPreferences?.budget || 50,
          restaurantName: restaurantName,
          cacheDuration: 60
        };

        const { data, error } = await supabase.functions.invoke('wine-pairing-unified', {
          body: fastPairingPayload
        });

        if (error) throw error;
        pairingData = data;
      } else {
        const regularPairingPayload = {
          dishes: selectedDishDetails.map(dish => ({
            id: dish.id,
            name: dish.dish_name,
            description: dish.description || '',
            price: dish.price || '',
            type: dish.dish_type || '',
            ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : []
          })),
          availableWines: processedWines,
          userPreferences: userPreferences,
          budget: userPreferences?.budget || 50,
          restaurantName: restaurantName,
          restaurantId: restaurantId,
          consolidatedMode: true
        };

        const { data, error } = await supabase.functions.invoke('wine-pairing', {
          body: regularPairingPayload
        });

        if (error) throw error;
        pairingData = data;
      }

      if (!pairingData || !pairingData.success) {
        throw new Error(pairingData?.error || 'Failed to generate consolidated pairings');
      }

      // Transform the response to WineRecommendation format
      const transformedPairings = pairingData.pairings.map((wine: any) => ({
        wineName: wine.wineName || wine.name || 'Unknown Wine',
        wineType: wine.wineType || wine.wine_type || 'Unknown',
        wineStyle: wine.wineStyle || wine.wine_style || wine.ww_style || 'Fresh & Crisp',
        description: wine.description || wine.dishCompatibility || '',
        price: wine.price || '',
        confidenceLevel: wine.confidenceLevel || wine.confidence_level || 'Medium'
      }));

      // IMPROVED VALIDATION: More flexible wine name matching
      console.log('🍷 VALIDATING CONSOLIDATED WINES...');
      console.log('Available wines for matching:', processedWines.map(w => w.name));
      console.log('AI recommended wines:', transformedPairings.map(w => w.wineName));
      
      const fictionalCount = transformedPairings.filter(wine => {
        const wineName = wine.wineName.toLowerCase().trim();
        
        // Check for exact matches first
        const exactMatch = processedWines.some(available => 
          available.name.toLowerCase().trim() === wineName
        );
        
        if (exactMatch) return false;
        
        // Check for partial matches (wine name contains available wine name or vice versa)
        const partialMatch = processedWines.some(available => {
          const availableName = available.name.toLowerCase().trim();
          return wineName.includes(availableName) || availableName.includes(wineName);
        });
        
        if (partialMatch) return false;
        
        // Check for matches by removing common suffixes/prefixes like years
        const cleanWineName = wineName.replace(/\b\d{4}\b/g, '').trim();
        const yearMatch = processedWines.some(available => {
          const cleanAvailableName = available.name.toLowerCase().trim().replace(/\b\d{4}\b/g, '').trim();
          return cleanWineName === cleanAvailableName || 
                 cleanWineName.includes(cleanAvailableName) || 
                 cleanAvailableName.includes(cleanWineName);
        });
        
        if (!yearMatch) {
          console.warn(`🚨 Potentially fictional wine detected: "${wine.wineName}"`);
          return true;
        }
        
        return false;
      }).length;

      console.log(`📊 Validation results: ${fictionalCount}/${transformedPairings.length} potentially fictional wines`);

      // Only reject if MORE THAN HALF the wines are unrecognized (more lenient threshold)
      if (fictionalCount > transformedPairings.length / 2) {
        console.error(`❌ Too many unrecognized wines: ${fictionalCount}/${transformedPairings.length}`);
        throw new Error("The AI recommended wines that don't match your wine list. Please try again.");
      }
      
      // Store the results both in state and pass to parent
      setConsolidatedPairings(transformedPairings);
      onPairingsGenerated(transformedPairings);

      toast({
        title: "Table recommendations ready!",
        description: `Found ${transformedPairings.length} wines that pair well with your selection.`,
      });

    } catch (error) {
      console.error('Error generating consolidated pairings:', error);
      
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate table recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedDishes, user, onPairingsGenerated, mode, winesFromState]); // Added winesFromState to dependencies

  return (
    <div className="space-y-6">
      {/* Generation Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
            <Users className="w-6 h-6 text-amber-600" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold text-amber-800 mb-2">
              Table Wine Recommendations
            </h3>
            
            <p className="text-amber-700 mb-4 leading-relaxed text-sm md:text-base">
              Get wine recommendations that complement all your selected dishes. 
              Ideal when you're sharing bottles for the entire table!
            </p>

            {selectedDishes.length > 0 && (
              <div className="bg-white/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-700 flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2">
                  <ChefHat className="w-4 h-4" />
                  <span>Analyzing {selectedDishes.length} selected dish{selectedDishes.length > 1 ? 'es' : ''} for table pairing</span>
                </p>
              </div>
            )}
            
            {insufficientWines && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Not enough wines</AlertTitle>
                <AlertDescription>
                  At least 10 wines are required for table recommendations. Please add more wines to the menu.
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={generateConsolidatedPairings}
              disabled={isGenerating || selectedDishes.length === 0}
              className="w-full md:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-4 md:px-6 py-3 text-sm md:text-base"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Analyzing Table Pairings...</span>
                </>
              ) : (
                <>
                  <Wine className="w-4 h-4 mr-2" />
                  <span>Get Table Wine Recommendations</span>
                </>
              )}
            </Button>
            
            {selectedDishes.length === 0 && (
              <p className="text-xs md:text-sm text-amber-600 mt-2">
                Please select some dishes first to get table recommendations
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Table Wine Recommendations */}
      {consolidatedPairings.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50/30 to-purple-100/30 rounded-2xl shadow-lg p-6 border border-purple-200/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-purple-800 mb-6 flex items-center gap-2">
            <Wine className="w-6 h-6" />
            Table Wine Recommendations
          </h3>
          <p className="text-purple-700 mb-6 text-sm">
            These wines pair well with all your selected dishes - perfect for sharing at the table!
          </p>
          
          <div className="grid gap-4">
            {consolidatedPairings.map((wine, index) => (
              <div key={index} className="transform hover:scale-[1.02] transition-all duration-200">
                <WineCard 
                  wine={wine}
                  dishName="Table Selection"
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedPairingCard;
