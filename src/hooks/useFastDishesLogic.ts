
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchMenuAndWinesFromDB } from '@/services/wineLibraryService';

export interface MenuItem {
  id: string;
  dish_name: string;
  description?: string;
  price?: string;
  dish_type?: string;
  ingredients?: string[];
}

export interface Wine {
  id: string;
  name: string;
  varietal?: string;
  region?: string;
  price_bottle?: string;
  price_glass?: string;
  wine_type?: string;
  ww_style?: string;
  description?: string;
}

export interface SessionResults {
  menuItems: MenuItem[];
  wines: Wine[];
  restaurantName: string;
  restaurantId: string;
  timestamp: number;
  sessionOnly?: boolean;
}

export interface SessionRestaurant {
  id: string;
  name: string;
}

// Helper function to ensure menu items have IDs
const ensureMenuItemsHaveIds = (items: any[]): MenuItem[] => {
  return items.map((item, index) => {
    if (!item.id) {
      // Generate a consistent ID based on dish name and index
      const id = `session-${item.dish_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`;
      return { ...item, id };
    }
    return item;
  });
};

// PHASE 1 FIX: Flow detection logic
const determineFlowMode = () => {
  // Priority 1: Check for restaurant context (IMPORT flow)
  const restaurantId = localStorage.getItem('currentRestaurantId');
  const restaurantName = localStorage.getItem('currentRestaurantName');
  
  // Priority 2: Check for session data (SESSION/UPLOAD flow)
  const sessionResults = sessionStorage.getItem('currentSessionResults');
  const sessionRestaurant = sessionStorage.getItem('currentSessionRestaurant');
  
  console.log('🔍 Flow Detection:', {
    hasRestaurantContext: !!(restaurantId && restaurantName),
    hasSessionData: !!(sessionResults && sessionRestaurant),
    restaurantId,
    restaurantName
  });
  
  // CRITICAL FIX: Restaurant context takes priority over session data
  if (restaurantId && restaurantName) {
    console.log('✅ IMPORT MODE detected - User selected existing restaurant');
    return {
      mode: 'IMPORT',
      restaurantId,
      restaurantName,
      shouldClearSession: true // Clear conflicting session data
    };
  }
  
  if (sessionResults && sessionRestaurant) {
    console.log('✅ SESSION MODE detected - User uploaded new images');
    return {
      mode: 'SESSION',
      sessionData: { sessionResults, sessionRestaurant },
      shouldClearSession: false
    };
  }
  
  console.log('❌ NO VALID FLOW detected');
  return {
    mode: 'NONE',
    shouldClearSession: false
  };
};

export const useFastDishesLogic = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [sessionRestaurant, setSessionRestaurant] = useState<SessionRestaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportFlow, setIsImportFlow] = useState(false);

  // PHASE 1 FIX: Improved data loading logic
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // CRITICAL: Use new flow detection logic
        const flowInfo = determineFlowMode();
        
        if (flowInfo.mode === 'IMPORT') {
          console.log('🔄 Loading IMPORT flow data from database');
          
          // Clear conflicting session data for import flow
          if (flowInfo.shouldClearSession) {
            console.log('🧹 FORCE CLEARING ALL SESSION DATA for import flow to prevent contamination');
            sessionStorage.removeItem('currentSessionResults');
            sessionStorage.removeItem('currentSessionRestaurant');
            sessionStorage.removeItem('sessionWines');
            sessionStorage.removeItem('wineBackup');
            sessionStorage.removeItem('sessionWinePairings');
            localStorage.removeItem('availableWines');
            localStorage.removeItem('wineList');
            localStorage.removeItem('processedWines');
          }
          
          setIsImportFlow(true);
          
          // Load menu items and wines from database
          const [menuResult, wineResult] = await Promise.all([
            supabase
              .from('restaurant_menus')
              .select('*')
              .eq('restaurant_id', flowInfo.restaurantId)
              .eq('is_active', true),
            supabase
              .from('restaurant_wines')
              .select('*')
              .eq('restaurant_id', flowInfo.restaurantId)
              .eq('is_active', true)
          ]);

          if (menuResult.error) {
            console.error('❌ Error loading menu items:', menuResult.error);
            throw menuResult.error;
          }

          if (wineResult.error) {
            console.error('❌ Error loading wines:', wineResult.error);
            throw wineResult.error;
          }

          const menuItems = (menuResult.data || []).map(item => ({
            id: item.id,
            dish_name: item.dish_name,
            description: item.description,
            price: item.price,
            dish_type: item.dish_type,
            ingredients: item.ingredients
          }));

          const wines = (wineResult.data || []).map(wine => ({
            id: wine.id,
            name: wine.name,
            varietal: wine.varietal,
            region: wine.region,
            price_bottle: wine.price_bottle,
            price_glass: wine.price_glass,
            wine_type: wine.wine_type,
            ww_style: wine.ww_style,
            description: wine.description
          }));

          console.log(`✅ Loaded ${menuItems.length} menu items and ${wines.length} wines from database`);

          if (menuItems.length === 0 && wines.length === 0) {
            console.log('⚠️ No menu data found in database for import flow');
            setShowNoDataModal(true);
          } else {
            // Store results ONLY in React state/context, not sessionStorage/localStorage
            const importedResults = {
              menuItems,
              wines,
              restaurantName: flowInfo.restaurantName!,
              restaurantId: flowInfo.restaurantId!,
              timestamp: Date.now(),
              sessionOnly: false
            };
            setSessionResults(importedResults);
            setSessionRestaurant({ 
              id: flowInfo.restaurantId!, 
              name: flowInfo.restaurantName! 
            });
          }
          return;
        } else if (flowInfo.mode === 'SESSION') {
          console.log('🔄 Loading SESSION flow data from session storage');
          
          const parsedResults = JSON.parse(flowInfo.sessionData!.sessionResults);
          const parsedRestaurant = JSON.parse(flowInfo.sessionData!.sessionRestaurant);
          
          // Ensure menu items have IDs for session data
          const menuItemsWithIds = ensureMenuItemsHaveIds(parsedResults.menuItems || []);
          const updatedResults = { ...parsedResults, menuItems: menuItemsWithIds };
          
          setSessionResults(updatedResults);
          setSessionRestaurant(parsedRestaurant);
          setIsImportFlow(false);
          
        } else {
          console.log('❌ No valid flow detected - showing no data modal');
          setShowNoDataModal(true);
        }
        
      } catch (error) {
        console.error('❌ Error loading dishes data:', error);
        toast({
          title: "Error loading menu data",
          description: "Failed to load menu items. Please try again.",
          variant: "destructive",
        });
        setShowNoDataModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, toast]);

  // Computed values
  const menuItems = sessionResults?.menuItems || [];
  const hasValidSession = sessionResults !== null && menuItems.length > 0;

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems;
    
    const searchLower = searchTerm.toLowerCase();
    return menuItems.filter(item =>
      item.dish_name.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.dish_type?.toLowerCase().includes(searchLower) ||
      item.ingredients?.some(ingredient => 
        ingredient.toLowerCase().includes(searchLower)
      )
    );
  }, [menuItems, searchTerm]);

  // Dish selection handlers
  const handleDishSelect = (dishId: string) => {
    setSelectedDishes(prev => {
      if (prev.includes(dishId)) {
        return prev.filter(id => id !== dishId);
      } else if (prev.length < 4) {
        return [...prev, dishId];
      } else {
        toast({
          title: "Maximum dishes selected",
          description: "You can select up to 4 dishes for wine pairing",
          variant: "destructive",
        });
        return prev;
      }
    });
  };

  const clearAllSelections = () => {
    setSelectedDishes([]);
  };

  const getSelectedDishObjects = () => {
    return menuItems.filter(item => selectedDishes.includes(item.id));
  };

  return {
    sessionResults,
    sessionRestaurant,
    isLoading,
    hasValidSession,
    showNoDataModal,
    menuItems,
    filteredItems,
    selectedDishes,
    searchTerm,
    isImportFlow,
    setSearchTerm,
    handleDishSelect,
    clearAllSelections,
    setShowNoDataModal,
    getSelectedDishObjects,
  };
};
