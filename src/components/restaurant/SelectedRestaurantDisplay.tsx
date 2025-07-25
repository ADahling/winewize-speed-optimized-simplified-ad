
import React from 'react';
import { MapPin, Utensils } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';

interface SelectedRestaurantDisplayProps {
  selectedRestaurant: Restaurant;
}

const SelectedRestaurantDisplay: React.FC<SelectedRestaurantDisplayProps> = ({
  selectedRestaurant
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Utensils className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-green-800">{selectedRestaurant.name}</h3>
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{selectedRestaurant.location}</span>
            {selectedRestaurant.cuisine_type && (
              <>
                <span className="mx-1">•</span>
                <span>{selectedRestaurant.cuisine_type}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedRestaurantDisplay;
