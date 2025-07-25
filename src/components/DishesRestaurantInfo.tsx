
import React from 'react';
import { MapPin, ChefHat, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DishesRestaurantInfoProps {
  restaurantName: string;
  totalDishes: number;
}

const DishesRestaurantInfo = ({ restaurantName, totalDishes }: DishesRestaurantInfoProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 opacity-10">
        <div className="w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8" />
        <div className="w-20 h-20 rounded-full bg-white transform translate-x-16 -translate-y-16" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Menu Analysis Complete
                </h1>
                <div className="flex items-center gap-2 text-purple-100">
                  <MapPin className="w-4 h-4" />
                  <span className="text-lg">{restaurantName}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <Badge className="bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                {totalDishes} Dishes Found
              </Badge>
              <Badge className="bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30 border-0">
                AI-Powered Analysis
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
          <p className="text-purple-100 text-sm leading-relaxed">
            🍷 Select your favorite dishes below and our AI sommelier will recommend perfectly paired wines from the restaurant's collection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DishesRestaurantInfo;
