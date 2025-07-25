
import React from 'react';
import ProgressSteps from './ProgressSteps';
import Header from './Header';

const DishesHeader = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-2 pt-20 max-w-4xl">
        {/* Progress Steps */}
        <ProgressSteps currentStep={4} />
        
        {/* Main Content */}
        <div className="text-center mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-600 mb-2 flex items-center justify-center gap-2">
            🍽️✨ Choose Your Dishes
          </h1>
          <p className="text-slate-600 text-sm md:text-base mb-2">
            Select up to 4 menu items to get personalized wine pairing recommendations.
          </p>
        </div>
      </div>
    </>
  );
};

export default DishesHeader;
