
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSessionOnlyMode } from '@/hooks/useSessionOnlyMode';
import RestaurantSearchInput from '@/components/restaurant/RestaurantSearchInput';
import AddRestaurantForm from '@/components/restaurant/AddRestaurantForm';
import SelectedRestaurantDisplay from '@/components/restaurant/SelectedRestaurantDisplay';
import RestaurantFavoritesCard from '@/components/RestaurantFavoritesCard';
import RestaurantFavoriteButton from '@/components/restaurant/RestaurantFavoriteButton';
import { useRestaurantFavorites } from '@/hooks/useRestaurantFavorites';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';

interface RestaurantSearchProps {
  restaurants: Restaurant[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredRestaurants: Restaurant[];
  onRestaurantSelect: (restaurant: Restaurant) => void;
  onContinueToMenu: () => void;
  handleSearch: (term: string) => Promise<void>;
}

const RestaurantSearch: React.FC<RestaurantSearchProps> = ({
  restaurants,
  searchTerm,
  setSearchTerm,
  filteredRestaurants,
  onRestaurantSelect,
  onContinueToMenu,
  handleSearch
}) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { enableSessionOnlyMode } = useSessionOnlyMode();
  const { 
    favorites, 
    isLoading: isLoadingFavorites, 
    isFavorite, 
    toggleFavorite 
  } = useRestaurantFavorites();

  // FIXED: Use ref to prevent infinite search loops
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchTermRef = useRef<string>('');
  const isSearchingRef = useRef<boolean>(false);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // CRITICAL: Only update if value actually changed
    if (value === lastSearchTermRef.current) {
      return;
    }
    lastSearchTermRef.current = value;
    setSearchTerm(value);
    setSelectedRestaurant(null);
    setShowDropdown(value.trim().length > 1);
    setShowAddForm(false);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // PERFORMANCE: Only trigger search after user stops typing and prevent concurrent searches
    if (value.length > 1 && !isSearchingRef.current) {
      searchTimeoutRef.current = setTimeout(async () => {
        if (isSearchingRef.current) return; // Prevent concurrent searches

        isSearchingRef.current = true;
        console.log(`Debounced search triggered for: "${value}"`);
        try {
          await handleSearch(value);
        } finally {
          isSearchingRef.current = false;
        }
      }, 500); // Increased debounce time to 500ms
    }
  }, [setSearchTerm, handleSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleRestaurantSelect = useCallback((restaurant: Restaurant) => {
    console.log('RestaurantSearch: Selecting restaurant:', restaurant.name);
    setSelectedRestaurant(restaurant);
    setSearchTerm(restaurant.name);
    setShowDropdown(false);
    setShowAddForm(false);

    // Clear the last search term to prevent issues
    lastSearchTermRef.current = restaurant.name;

    // CRITICAL: Call parent's onRestaurantSelect to trigger the flow
    onRestaurantSelect(restaurant);
    toast({
      title: "Restaurant selected!",
      description: `You've selected ${restaurant.name}`
    });
  }, [onRestaurantSelect, setSearchTerm, toast]);

  const handleFavoriteSelect = useCallback((restaurant: any) => {
    // Convert favorite restaurant to Restaurant type and select it
    const restaurantData: Restaurant = {
      id: restaurant.id,
      name: restaurant.name,
      location: restaurant.location,
      cuisine_type: restaurant.cuisine_type
    };
    handleRestaurantSelect(restaurantData);
  }, [handleRestaurantSelect]);

  const handleRestaurantAdded = useCallback((restaurant: Restaurant) => {
    handleRestaurantSelect(restaurant);
  }, [handleRestaurantSelect]);

  const handleFocus = useCallback(() => {
    if (searchTerm && filteredRestaurants.length > 0) {
      setShowDropdown(true);
    }
  }, [searchTerm, filteredRestaurants.length]);

  const handleCancelAddForm = useCallback(() => {
    setShowAddForm(false);
  }, []);

  const handleContinueWithoutRestaurant = useCallback(() => {
    enableSessionOnlyMode();
    toast({
      title: "Fast Track enabled",
      description: "Your menu analysis will be temporary for this session only"
    });
    navigate('/upload');
  }, [enableSessionOnlyMode, toast, navigate]);

  // Determine current state for UI
  const hasSearched = searchTerm.trim().length > 0;
  const hasResults = filteredRestaurants.length > 0;
  const showNotFound = hasSearched && !hasResults && !selectedRestaurant;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-opacity-10 rounded-2xl p-6 shadow-lg border border-slate-100 mb-6" style={{
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)'
    }}>
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-600">Where are you dining tonight?</h2>
        
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <RestaurantFavoritesCard 
              favorites={favorites}
              onSelectRestaurant={handleFavoriteSelect}
              onRemoveFavorite={() => {}} // Simplified for now
              isLoading={isLoadingFavorites}
            />
          </div>
        )}
        
        <RestaurantSearchInput
          searchTerm={searchTerm} 
          filteredRestaurants={filteredRestaurants} 
          showDropdown={showDropdown} 
          onSearchChange={handleSearchChange} 
          onFocus={handleFocus} 
          onRestaurantSelect={handleRestaurantSelect} 
        />

        {/* Selected Restaurant Display */}
        {selectedRestaurant && (
          <div className="mt-6">
            <SelectedRestaurantDisplay selectedRestaurant={selectedRestaurant} />
            <div className="mt-3 flex justify-center">
              <RestaurantFavoriteButton
                isFavorite={isFavorite(selectedRestaurant.id)}
                onToggle={() => toggleFavorite(selectedRestaurant)}
              />
            </div>
          </div>
        )}

        {/* Add Restaurant Section */}
        {!selectedRestaurant && (
          <div className="mt-6">
            {/* Show "Add Restaurant" button or form */}
            {!showAddForm ? (
              <div className="space-y-4">
                {showNotFound && (
                  <div className="text-center py-4">
                    <p className="text-slate-600 mb-4">Restaurant not found in our database.</p>
                  </div>
                )}
                <Button 
                  onClick={() => setShowAddForm(true)} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Restaurant
                </Button>
                
                {/* Continue Without Restaurant Option */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-slate-500">or</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleContinueWithoutRestaurant} 
                  variant="outline" 
                  className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 transition-all duration-300 px-3 py-3 rounded-xl font-semibold whitespace-normal break-words text-center min-w-0"
                >
                  <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="leading-tight">Continue Without Restaurant Selection</span>
                </Button>
                
                <p className="text-xs text-slate-500 text-center leading-tight">
                  Menu analysis will be temporary for this session only
                </p>
              </div>
            ) : (
              <AddRestaurantForm 
                onRestaurantAdded={handleRestaurantAdded} 
                onCancel={handleCancelAddForm} 
              />
            )}
          </div>
        )}

        {/* Action Button for Selected Restaurant */}
        {selectedRestaurant && (
          <div className="mt-6">
            <Button
              onClick={onContinueToMenu}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="leading-tight">Continue with {selectedRestaurant.name}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSearch;
