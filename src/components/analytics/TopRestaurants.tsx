
import React from 'react';
import { MapPin } from 'lucide-react';

interface RestaurantData {
  name: string;
  count: number;
}

interface TopRestaurantsProps {
  data: RestaurantData[];
}

const TopRestaurants: React.FC<TopRestaurantsProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="text-center text-slate-500 py-8">
        <p>No restaurant data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((restaurant, index) => (
        <div key={restaurant.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-800">{restaurant.name}</span>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {restaurant.count} visit{restaurant.count !== 1 ? 's' : ''}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopRestaurants;
