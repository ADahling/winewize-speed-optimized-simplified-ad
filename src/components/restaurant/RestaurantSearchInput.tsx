import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Restaurant } from '@/types/restaurant';
interface RestaurantSearchInputProps {
  searchTerm: string;
  filteredRestaurants: Restaurant[];
  showDropdown: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onRestaurantSelect: (restaurant: Restaurant) => void;
}
const RestaurantSearchInput = ({
  searchTerm,
  filteredRestaurants,
  showDropdown,
  onSearchChange,
  onFocus,
  onRestaurantSelect
}: RestaurantSearchInputProps) => {
  return <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
      <Input type="text" placeholder="Search for your restaurant..." value={searchTerm} onChange={onSearchChange} onFocus={onFocus} className="pl-10 py-3 text-lg bg-purple-100" />
      
      {/* Dropdown Results */}
      {showDropdown && filteredRestaurants.length > 0 && <div className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {filteredRestaurants.map(restaurant => <div key={restaurant.id} className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0" onClick={() => onRestaurantSelect(restaurant)}>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-slate-800">{restaurant.name}</div>
                  <div className="text-sm text-slate-600">{restaurant.location} • {restaurant.cuisine_type}</div>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
};
export default RestaurantSearchInput;