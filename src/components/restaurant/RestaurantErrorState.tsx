
import React from 'react';

interface RestaurantErrorStateProps {
  hasError: boolean;
  restaurantsCount: number;
}

const RestaurantErrorState: React.FC<RestaurantErrorStateProps> = ({
  hasError,
  restaurantsCount
}) => {
  if (!hasError || restaurantsCount > 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <h3 className="text-red-800 font-semibold mb-2">Database Connection Error</h3>
      <p className="text-red-600 text-sm">
        Unable to load restaurants from the database. Please check your connection and try again.
      </p>
    </div>
  );
};

export default RestaurantErrorState;
