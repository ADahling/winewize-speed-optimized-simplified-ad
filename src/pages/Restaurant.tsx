
import React, { useEffect } from 'react';
import RestaurantPageHeader from '@/components/restaurant/RestaurantPageHeader';
import RestaurantLoadingState from '@/components/restaurant/RestaurantLoadingState';
import RestaurantErrorState from '@/components/restaurant/RestaurantErrorState';
import RestaurantSearch from '@/components/RestaurantSearch';
import RestaurantAgeWarning from '@/components/restaurant/RestaurantAgeWarning';
import RestaurantSearchWithImport from '@/components/restaurant/RestaurantSearchWithImport';
import RestaurantBottomNav from '@/components/restaurant/RestaurantBottomNav';
import RestaurantFavoritesCard from '@/components/RestaurantFavoritesCard';
import { useRestaurantFavorites } from '@/hooks/useRestaurantFavorites';
import Copyright from '@/components/Copyright';
import SessionValidator from '@/components/auth/SessionValidator';
import { useRestaurantPage } from '@/hooks/useRestaurantPage';

const Restaurant = () => {
  const {
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
    handleSearch 
  } = useRestaurantPage();

  const { 
    favorites, 
    isLoading: isLoadingFavorites, 
    toggleFavorite 
  } = useRestaurantFavorites();

  const handleFavoriteSelect = (restaurant: any) => {
    // Convert favorite to restaurant format and select
    const restaurantData = {
      id: restaurant.id,
      name: restaurant.name,
      location: restaurant.location,
      cuisine_type: restaurant.cuisine_type
    };
    handleRestaurantSelect(restaurantData);
  };

  // REMOVED: The problematic useEffect that was causing infinite loops

  if (isLoading) {
    return <RestaurantLoadingState />;
  }

  return (
    <SessionValidator>
      <div className="min-h-screen bg-white pb-96">{/* Massive bottom padding for mobile scrolling */}
        <RestaurantPageHeader />
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Error State */}
          <RestaurantErrorState 
            hasError={hasError} 
            restaurantsCount={restaurants.length} 
          />

          {/* Favorites Section - Show at top when available */}
          {favorites.length > 0 && !showImportOptions && (
            <div className="mb-6">
              <RestaurantFavoritesCard 
                favorites={favorites}
                onSelectRestaurant={handleFavoriteSelect}
                onRemoveFavorite={() => {}} // Simplified for now
                isLoading={isLoadingFavorites}
              />
            </div>
          )}

          {/* CRITICAL: Import Options Modal - Show when showImportOptions is true */}
          {showImportOptions && selectedRestaurant && (
            <div className="mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Import Menu for {selectedRestaurant.name}
                </h3>
                <p className="text-slate-600 mb-6">
                  We found menu data for this restaurant. Would you like to:
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleImportMenu}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-semibold"
                  >
                    Import Existing Menu Data
                  </button>
                  <button
                    onClick={handleUploadNewImages}
                    className="w-full border border-slate-300 text-slate-600 hover:bg-slate-50 py-3 px-4 rounded-lg font-semibold"
                  >
                    Upload New Menu Images
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Section - Hide when showing import options */}
          {!showImportOptions && (
            <div className="mb-8">
              <RestaurantSearch
                restaurants={restaurants}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredRestaurants={filteredRestaurants}
                onRestaurantSelect={handleRestaurantSelect}
                onContinueToMenu={handleContinueToUpload}
                handleSearch={handleSearch}
              />
            </div>
          )}

          {/* Age Warning Modal */}
          <RestaurantAgeWarning
            isOpen={showAgeWarning}
            onClose={() => setShowAgeWarning(false)}
            restaurantName={selectedRestaurant?.name || ''}
            onUseExisting={handleUseExistingMenu}
            onUploadNew={handleUploadNewImages}
          />

          {/* Navigation - Fixed bottom bar */}
          <RestaurantBottomNav />
        </div>
        <Copyright />
      </div>
    </SessionValidator>
  );
};

export default Restaurant;
