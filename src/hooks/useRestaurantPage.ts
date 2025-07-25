import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useRestaurantSearch } from '@/hooks/useRestaurantSearch';
import { Restaurant, RestaurantData } from '@/types/restaurant';

export const useRestaurantPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startNewSession, clearAllData } = useSessionManager();
  const { checkRestaurantAge, searchRestaurants } = useRestaurantSearch();

  // Clear any existing session data when entering restaurant selection
  useEffect(() => {
    clearAllData();
  }, [clearAllData]);

  const handleSearch = useCallback(async (term: string) => {
    if (!term || term.length <= 1) {
      setRestaurants([]);
      return;
    }

    console.log(`🔍 Searching for restaurants matching: "${term}"`);
    const results = await searchRestaurants(term);
    setRestaurants(results);
  }, [searchRestaurants]);

  const handleRestaurantSelect = useCallback((restaurant: Restaurant) => {
    console.log('🎯 Restaurant selected for IMPORT flow:', restaurant.name);
    
    // Find the full restaurant data from our search results
    const fullRestaurant = restaurants.find(r => r.id === restaurant.id);
    if (fullRestaurant) {
      setSelectedRestaurant(fullRestaurant);
      console.log('✅ Selected restaurant data:', fullRestaurant);
      
      // PHASE 1 FIX: Clear session data and set restaurant context for IMPORT flow
      console.log('🧹 Clearing session data for clean IMPORT flow setup');
      sessionStorage.removeItem('currentSessionResults');
      sessionStorage.removeItem('currentSessionRestaurant');
      sessionStorage.removeItem('sessionWinePairings');
      sessionStorage.removeItem('sessionSelectedDishes');
      
      // Set restaurant context for IMPORT flow
      localStorage.setItem('currentRestaurantId', fullRestaurant.id);
      localStorage.setItem('currentRestaurantName', fullRestaurant.name);
      
      console.log('🔧 Restaurant context set for IMPORT flow:', {
        id: fullRestaurant.id,
        name: fullRestaurant.name
      });
      
      // Check restaurant age for flow decision
      if (checkRestaurantAge(fullRestaurant)) {
        console.log('⏰ Restaurant data is old, showing age warning');
        setShowAgeWarning(true);
        setShowImportOptions(false);
      } else {
        console.log('✨ Restaurant data is recent, showing import options');
        setShowImportOptions(true);
        setShowAgeWarning(false);
      }
    } else {
      // Convert to RestaurantData type for new restaurants
      const restaurantData: RestaurantData = {
        ...restaurant,
        last_menu_update: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setSelectedRestaurant(restaurantData);
      setShowImportOptions(true);
      setShowAgeWarning(false);
      
      // PHASE 1 FIX: Also clear session data for new restaurants
      sessionStorage.removeItem('currentSessionResults');
      sessionStorage.removeItem('currentSessionRestaurant');
      
      localStorage.setItem('currentRestaurantId', restaurantData.id);
      localStorage.setItem('currentRestaurantName', restaurantData.name);
      
      console.log('🆕 New restaurant context set:', {
        id: restaurantData.id,
        name: restaurantData.name
      });
    }
  }, [restaurants, checkRestaurantAge]);

  const handleUseExistingMenu = useCallback(() => {
    setShowAgeWarning(false);
    console.log('📋 Using existing menu for IMPORT flow:', selectedRestaurant?.name);
    navigate('/dishes');
  }, [selectedRestaurant, navigate]);

  const handleUploadNewImages = useCallback(() => {
    setShowAgeWarning(false);
    setShowImportOptions(false);
    console.log('📸 Switching to UPLOAD flow for restaurant:', selectedRestaurant?.name);
    navigate('/upload');
  }, [selectedRestaurant, navigate]);

  const handleImportMenu = useCallback(async () => {
    if (!selectedRestaurant) return;
    
    setShowImportOptions(false);
    console.log('📥 Starting IMPORT flow for restaurant:', selectedRestaurant.name);
    
    try {
      // PHASE 1 FIX: Ensure clean state for import flow
      console.log('🧹 Final cleanup before IMPORT flow navigation');
      sessionStorage.removeItem('currentSessionResults');
      sessionStorage.removeItem('currentSessionRestaurant');
      sessionStorage.removeItem('sessionWinePairings');
      sessionStorage.removeItem('sessionSelectedDishes');
      
      // Verify restaurant context is properly set
      localStorage.setItem('currentRestaurantId', selectedRestaurant.id);
      localStorage.setItem('currentRestaurantName', selectedRestaurant.name);
      
      console.log('✅ IMPORT flow setup complete:', {
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name,
        flow: 'IMPORT'
      });
      
      // Navigate to dishes page - it will load data from database
      navigate('/dishes');
    } catch (error) {
      console.error('❌ Error setting up IMPORT flow:', error);
      toast({
        title: "Import setup failed",
        description: "Failed to set up menu import. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedRestaurant, navigate, toast]);

  const handleContinueToUpload = useCallback(() => {
    if (selectedRestaurant) {
      console.log('Continuing to upload page with restaurant:', selectedRestaurant);
      navigate('/upload');
    } else {
      // Allow continuing without a selected restaurant
      console.log('Continuing to upload page without specific restaurant');
      navigate('/upload');
    }
  }, [selectedRestaurant, navigate]);

  // FIXED: Efficient filtering that works with search results
  const filteredRestaurants = restaurants.filter(restaurant =>
    searchTerm.trim() && (
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return {
    searchTerm,
    setSearchTerm,
    restaurants,
    selectedRestaurant,
    isLoading,
    hasError,
    showAgeWarning,
    setShowAgeWarning,
    showImportOptions,
    filteredRestaurants,
    handleRestaurantSelect,
    handleUseExistingMenu,
    handleUploadNewImages,
    handleImportMenu,
    handleContinueToUpload,
    handleSearch,
  };
};
