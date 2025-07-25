
import React from 'react';
import ProgressSteps from '@/components/ProgressSteps';
import Header from '@/components/Header';
import BackButton from '@/components/navigation/BackButton';

const RestaurantPageHeader = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-4 pt-20 max-w-2xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <BackButton 
            fallbackPath="/welcome" 
            label="Back" 
            className="flex-shrink-0" 
          />
          <h1 className="text-3xl font-bold text-purple-600 flex-1 text-center">
            Restaurant
          </h1>
          <div className="w-16 flex-shrink-0"></div> {/* Spacer for balance */}
        </div>

        {/* Progress Indicator with Step Labels */}
        <ProgressSteps currentStep={2} />
      </div>
    </>
  );
};

export default RestaurantPageHeader;
