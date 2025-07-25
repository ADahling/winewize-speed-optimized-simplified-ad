import React from 'react';
import BackButton from '@/components/navigation/BackButton';

interface DishesNavigationProps {
  isImportFlow: boolean;
  restaurantName?: string;
  menuItemsCount: number;
}

export const DishesNavigation = ({
  isImportFlow,
  restaurantName,
  menuItemsCount
}: DishesNavigationProps) => {
  return (
    <>
      {/* Back Button - prominently placed */}
      <div className="container mx-auto px-4 mb-4">
        <BackButton 
          fallbackPath={isImportFlow ? "/restaurant" : "/upload"} 
          label={isImportFlow ? "Back to Restaurant" : "Back to Upload"} 
        />
      </div>
      
      {/* PHASE 1 FIX: Enhanced Import Flow Indicator with debugging info */}
      {isImportFlow && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              📊 <strong>IMPORT MODE:</strong> Viewing menu data from database for {restaurantName}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-blue-600 mt-1">
                Debug: {menuItemsCount} items loaded from restaurant_menus table
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};