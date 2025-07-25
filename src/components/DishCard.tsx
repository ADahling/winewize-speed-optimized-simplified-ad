
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface DishCardProps {
  dish: {
    id: string;
    dish_name: string;
    description?: string;
    price?: string | number;
    dish_type?: string;
    ingredients?: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
}

const DishCard = ({ dish, isSelected, onSelect }: DishCardProps) => {
  const formatPrice = (price: string | number | undefined) => {
    if (!price) return 'Price not available';
    
    const priceStr = price.toString();
    const numericPrice = priceStr.replace(/[^\d.-]/g, '');
    
    if (numericPrice && !isNaN(parseFloat(numericPrice))) {
      return `$${parseFloat(numericPrice).toFixed(2)}`;
    }
    
    return priceStr;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-300' 
          : 'hover:border-purple-200'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-800 text-lg leading-tight">
            {dish.dish_name}
          </h3>
          {isSelected && (
            <div className="flex-shrink-0 ml-2">
              <div className="bg-purple-600 rounded-full p-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>
        
        {dish.description && (
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
            {dish.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="font-semibold text-purple-700">
            {formatPrice(dish.price)}
          </span>
          
          {dish.dish_type && (
            <Badge variant="secondary" className="text-xs">
              {dish.dish_type}
            </Badge>
          )}
        </div>
        
        {dish.ingredients && dish.ingredients.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-500 line-clamp-1">
              {dish.ingredients.slice(0, 3).join(', ')}
              {dish.ingredients.length > 3 && '...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DishCard;
