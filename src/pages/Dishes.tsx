
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFastDishesLogic } from '@/hooks/useFastDishesLogic';
import { useWinePairing } from '@/hooks/useWinePairing';
import { useQuickReorder } from '@/hooks/useQuickReorder';
import { useDishesHandlers } from '@/hooks/useDishesHandlers';
import DishesHeader from '@/components/DishesHeader';
import DishesLoadingState from '@/components/DishesLoadingState';
import { DishesDebugInfo } from '@/components/dishes/DishesDebugInfo';
import { DishesAuthGuard } from '@/components/dishes/DishesAuthGuard';
import { DishesModals } from '@/components/dishes/DishesModals';
import { DishesNavigation } from '@/components/dishes/DishesNavigation';
import { DishesMainContent } from '@/components/dishes/DishesMainContent';

const Dishes = () => {
  const { user, loading: authLoading } = useAuth();
  
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
    isImportFlow,
    setSearchTerm,
    handleDishSelect,
    clearAllSelections,
    setShowNoDataModal,
    getSelectedDishObjects,
  } = useFastDishesLogic();

  // CRITICAL FIX: Pass wines from sessionResults to useWinePairing
  const { 
    isGeneratingPairings, 
    usageStats,
    showUpgradePrompt,
    setShowUpgradePrompt,
    generateWinePairings
  } = useWinePairing(sessionResults?.wines);

  const { 
    savedOrders, 
    isLoading: isLoadingOrders, 
    deleteSavedOrder 
  } = useQuickReorder();

  // Create handleGeneratePairings function
  const handleGeneratePairings = async () => {
    console.log('🚀 [Dishes] handleGeneratePairings called');
    console.log('🍷 [Dishes] sessionResults?.wines:', sessionResults?.wines?.length, sessionResults?.wines);
    const selectedDishObjects = getSelectedDishObjects();
    console.log('🍽️ [Dishes] selectedDishObjects:', selectedDishObjects.length, selectedDishObjects);
    await generateWinePairings(selectedDishObjects);
  };

  if (authLoading || isLoading) {
    return <DishesLoadingState restaurantName={sessionRestaurant?.name || 'Loading...'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-96 md:pb-8">
      {/* Debug info and auth guard - side effects only */}
      <DishesDebugInfo
        isImportFlow={isImportFlow}
        hasValidSession={hasValidSession}
        menuItems={menuItems}
        sessionRestaurant={sessionRestaurant}
        sessionResults={sessionResults}
      />
      <DishesAuthGuard />

      <DishesHeader />
      
      <DishesNavigation
        isImportFlow={isImportFlow}
        restaurantName={sessionRestaurant?.name}
        menuItemsCount={menuItems.length}
      />

      <DishesModals
        showNoDataModal={showNoDataModal}
        onCloseNoDataModal={() => setShowNoDataModal(false)}
        restaurantName={sessionRestaurant?.name || 'Unknown Restaurant'}
        showUpgradePrompt={showUpgradePrompt}
        onCloseUpgradePrompt={() => setShowUpgradePrompt(false)}
        usageStats={usageStats}
      />

      <DishesMainContent
        hasValidSession={hasValidSession}
        savedOrders={savedOrders}
        onQuickReorder={handleGeneratePairings}
        onDeleteOrder={deleteSavedOrder}
        isLoadingOrders={isLoadingOrders}
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
        usageStats={usageStats}
      />
    </div>
  );
};

export default Dishes;
