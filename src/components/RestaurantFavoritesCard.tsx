import React from 'react';
import { Heart, MapPin, ChefHat, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface FavoriteRestaurant {
  id: string;
  name: string;
  location: string;
  cuisine_type: string;
  lastVisited?: string;
  visitCount: number;
}

interface RestaurantFavoritesCardProps {
  favorites: FavoriteRestaurant[];
  onSelectRestaurant: (restaurant: FavoriteRestaurant) => void;
  onRemoveFavorite: (restaurantId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const RestaurantFavoritesCard = ({ 
  favorites, 
  onSelectRestaurant, 
  onRemoveFavorite, 
  isLoading = false,
  className = "" 
}: RestaurantFavoritesCardProps) => {
  if (favorites.length === 0 && !isLoading) return null;

  return (
    <Card className={`border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-rose-600 fill-rose-100" />
          Favorite Restaurants
          <Badge variant="secondary" className="ml-auto text-xs">
            {favorites.length} Saved
          </Badge>
        </CardTitle>
        <p className="text-sm text-slate-600">
          Quick access to your most loved dining spots
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          favorites.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 group-hover:text-rose-700 transition-colors">
                    {restaurant.name}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{restaurant.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-3 h-3" />
                      <span>{restaurant.cuisine_type}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFavorite(restaurant.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-600"
                >
                  <Heart className="w-4 h-4 fill-rose-200" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {restaurant.lastVisited && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Last visit {formatDistanceToNow(new Date(restaurant.lastVisited), { addSuffix: true })}</span>
                    </div>
                  )}
                  {restaurant.visitCount > 1 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{restaurant.visitCount} visits</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                onClick={() => onSelectRestaurant(restaurant)}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-sm"
                size="sm"
              >
                <ChefHat className="w-3 h-3 mr-1" />
                Select & Get Menu
              </Button>
            </div>
          ))
        )}
        
        {favorites.length === 0 && !isLoading && (
          <div className="text-center py-4 text-slate-500 text-sm">
            No favorite restaurants yet. Heart a restaurant to add it to your favorites!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RestaurantFavoritesCard;