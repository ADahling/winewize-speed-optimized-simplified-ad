
import React from 'react';
import { Wine, Search, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DishesTable from './DishesTable';


interface DishesContentProps {
  restaurantName: string;
  menuItems: any[];
  filteredItems: any[];
  selectedDishes: string[];
  searchTerm: string;
  isGeneratingPairings: boolean;
  onSearchChange: (term: string) => void;
  onDishSelect: (dishId: string) => void;
  onClearAllSelections: () => void;
  onGeneratePairings: () => void;
}

const DishesContent = ({
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
  mode,
  winesFromState
}: DishesContentProps & { mode?: string; winesFromState?: any[] }) => {
  return (
    <>
      <div className="container mx-auto px-4 pb-8">
        {/* Restaurant Info */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4 text-center">
          <p className="text-purple-800 font-medium">
            🏪 Fast Track • Found {menuItems.length} dishes
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Selection Summary */}
        {selectedDishes.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-purple-800 font-medium text-sm">
                {selectedDishes.length} dish{selectedDishes.length !== 1 ? 'es' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllSelections}
                className="text-purple-600 border-purple-300 hover:bg-purple-100 text-xs px-2 py-1"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Find My Wine Button - Above Table */}
        {selectedDishes.length > 0 && (
          <div className="mb-4">
            <Button
              onClick={() => {
                console.log('[DEBUG] Button clicked in DishesContent');
                onGeneratePairings();
              }}
              disabled={isGeneratingPairings}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-base font-semibold"
            >
              {isGeneratingPairings ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Finding Perfect Pairings...
                </>
              ) : (
                <>
                  <Wine className="w-5 h-5 mr-2" />
                  Find My Wine for {selectedDishes.length} Dish{selectedDishes.length !== 1 ? 'es' : ''}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Dishes Table */}
        <DishesTable
          filteredItems={filteredItems}
          selectedDishes={selectedDishes}
          onDishSelect={onDishSelect}
          menuItemsLength={menuItems.length}
        />

      </div>
    </>
  );
};

export default DishesContent;
