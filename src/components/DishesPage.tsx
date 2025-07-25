
import React from 'react';
import { useFastDishesLogic } from '@/hooks/useFastDishesLogic';
import { useWinePairing } from '@/hooks/useWinePairing';
import DishesHeader from './DishesHeader';
import DishesContent from './DishesContent';
import DishesLoadingState from './DishesLoadingState';
import NoMenuDataModal from './NoMenuDataModal';

console.log('REDCANARY: DishesPage loaded');

const DishesPage = () => {
  const {
    sessionResults,
    sessionRestaurant,
    isLoading,
    hasValidSession,
    showNoDataModal,
    menuItems,
    filteredItems,
    selectedDishes,
    searchTerm,
    setSearchTerm,
    handleDishSelect,
    clearAllSelections,
    setShowNoDataModal,
    getSelectedDishObjects,
  } = useFastDishesLogic();

  const { isGeneratingPairings, generateWinePairings } = useWinePairing();

  const handleGeneratePairings = async () => {
    console.log('[DEBUG] handleGeneratePairings called in DishesPage');
    const selectedDishObjects = getSelectedDishObjects();
    await generateWinePairings(selectedDishObjects);
  };

  // Show loading state
  if (isLoading) {
    return <DishesLoadingState restaurantName={sessionRestaurant?.name || 'Loading...'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <DishesHeader />
      
      {/* No Session Data Modal */}
      <NoMenuDataModal
        isOpen={showNoDataModal}
        onClose={() => setShowNoDataModal(false)}
        restaurantName={sessionRestaurant?.name || 'Unknown Restaurant'}
      />

      {/* Only show content if we have valid session data */}
      {hasValidSession && (
        <DishesContent
          restaurantName={sessionRestaurant?.name || 'Unknown Restaurant'}
          menuItems={menuItems}
          filteredItems={filteredItems}
          selectedDishes={selectedDishes}
          searchTerm={searchTerm}
          isGeneratingPairings={isGeneratingPairings}
          onSearchChange={setSearchTerm}
          onDishSelect={handleDishSelect}
          onClearAllSelections={clearAllSelections}
          onGeneratePairings={handleGeneratePairings}
        />
      )}
    </div>
  );
};

export default DishesPage;
