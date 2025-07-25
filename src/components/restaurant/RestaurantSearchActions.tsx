
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';

interface RestaurantSearchActionsProps {
  onAddRestaurant: () => void;
  onContinueWithoutRestaurant: () => void;
}

const RestaurantSearchActions: React.FC<RestaurantSearchActionsProps> = ({
  onAddRestaurant,
  onContinueWithoutRestaurant
}) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={onAddRestaurant}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
      >
        <Plus className="w-5 h-5 mr-2 flex-shrink-0" />
        <span className="leading-tight">Add New Restaurant</span>
      </Button>
      
      <div className="text-center">
        <p className="text-slate-600 mb-3">or</p>
        <Button
          onClick={onContinueWithoutRestaurant}
          variant="outline"
          className="w-full border-gray-300 transition-all duration-300 px-3 py-3 rounded-xl bg-violet-100 font-semibold text-purple-900 whitespace-normal break-words text-center min-w-0"
        >
          <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="leading-tight">Continue Without Restaurant Selection</span>
        </Button>
        <p className="text-sm text-slate-500 mt-2 leading-tight">
          Menu analysis will be temporary for this session only
        </p>
      </div>
    </div>
  );
};

export default RestaurantSearchActions;
