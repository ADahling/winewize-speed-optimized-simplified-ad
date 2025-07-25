
import React from 'react';
import Header from '@/components/Header';

const RestaurantLoadingState = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-28 max-w-2xl">
        <div className="text-center">
          <p className="text-slate-600">Loading restaurants...</p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLoadingState;
