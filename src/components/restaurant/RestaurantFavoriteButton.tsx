import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RestaurantFavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
  size?: 'sm' | 'default';
}

const RestaurantFavoriteButton = ({ 
  isFavorite, 
  onToggle, 
  className = "",
  size = 'sm'
}: RestaurantFavoriteButtonProps) => {
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "transition-all duration-200",
        isFavorite 
          ? "text-rose-600 hover:text-rose-700" 
          : "text-slate-400 hover:text-rose-500",
        className
      )}
    >
      <Heart 
        className={cn(
          "w-4 h-4",
          isFavorite && "fill-rose-600"
        )} 
      />
      <span className="ml-1 text-xs">
        {isFavorite ? 'Favorited' : 'Add to Favorites'}
      </span>
    </Button>
  );
};

export default RestaurantFavoriteButton;