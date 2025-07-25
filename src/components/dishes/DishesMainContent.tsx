import React from 'react';
import DishesContent from '@/components/DishesContent';
import CollapsibleQuickReorder from '@/components/CollapsibleQuickReorder';
import UsageIndicator from '@/components/subscription/UsageIndicator';
import { MenuItem, UsageStats } from '@/types/dishes';

interface DishesMainContentProps {
  hasValidSession: boolean;
  savedOrders: any[];
  onQuickReorder: (savedOrder: any) => void;
  onDeleteOrder: (id: string) => void;
  isLoadingOrders: boolean;
  restaurantName: string;
  menuItems: MenuItem[];
  filteredItems: MenuItem[];
  selectedDishes: string[];
  searchTerm: string;
  isGeneratingPairings: boolean;
  onSearchChange: (term: string) => void;
  onDishSelect: (dishId: string) => void;
  onClearAllSelections: () => void;
  onGeneratePairings: () => void;
  usageStats: UsageStats;
}

export const DishesMainContent = ({
  hasValidSession,
  savedOrders,
  onQuickReorder,
  onDeleteOrder,
  isLoadingOrders,
  restaurantName,
  menuItems,
  filteredItems,
  selectedDishes,
  searchTerm,
  isGeneratingPairings,
  onSearchChange,
  onDishSelect,
  onClearAllSelections,
  onGeneratePairings,
  usageStats
}: DishesMainContentProps) => {
  return (
    <>
      {/* Quick Reorder Section - Collapsible for mobile */}
      {savedOrders.length > 0 && (
        <div className="container mx-auto px-4 mb-6 max-w-4xl">
          <CollapsibleQuickReorder 
            savedOrders={savedOrders}
            onQuickReorder={onQuickReorder}
            onDeleteOrder={onDeleteOrder}
            isLoading={isLoadingOrders}
          />
        </div>
      )}

      {/* Only show content if we have valid session data */}
      {hasValidSession && (
        <DishesContent
          restaurantName={restaurantName}
          menuItems={menuItems}
          filteredItems={filteredItems}
          selectedDishes={selectedDishes}
          searchTerm={searchTerm}
          isGeneratingPairings={isGeneratingPairings}
          onSearchChange={onSearchChange}
          onDishSelect={onDishSelect}
          onClearAllSelections={onClearAllSelections}
          onGeneratePairings={onGeneratePairings}
        />
      )}

      {/* Usage Indicator - inline */}
      {hasValidSession && (
        <div className="container mx-auto px-4 mt-8 max-w-4xl">
          <UsageIndicator
            pairingsUsed={usageStats.pairingsUsed}
            pairingsLimit={usageStats.pairingsLimit}
            subscriptionTier={usageStats.subscriptionTier}
          />
        </div>
      )}
    </>
  );
};