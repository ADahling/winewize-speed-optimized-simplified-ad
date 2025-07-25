
import React from 'react';
import DishesHeader from './DishesHeader';

interface DishesLoadingStateProps {
  restaurantName: string;
}

const DishesLoadingState = ({ restaurantName }: DishesLoadingStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <DishesHeader />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dishes from {restaurantName}...</p>
        </div>
      </div>
    </div>
  );
};

export default DishesLoadingState;
