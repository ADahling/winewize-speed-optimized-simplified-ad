
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getDishTypeColor } from './utils';

interface MenuItem {
  id: string;
  dish_name: string;
  description: string;
  price: string;
  dish_type: string;
  ingredients: string[];
}

interface DishTableRowProps {
  item: MenuItem;
  isSelected: boolean;
  isExpanded: boolean;
  onDishSelect: (dishId: string) => void;
  onToggleExpand: (itemId: string) => void;
}

const DishTableRow = ({ 
  item, 
  isSelected, 
  isExpanded, 
  onDishSelect, 
  onToggleExpand 
}: DishTableRowProps) => {
  const isMobile = useIsMobile();

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    // Validate the ID before calling onDishSelect
    if (!item.id || item.id === 'undefined') {
      console.error('Cannot select dish with invalid ID:', item.id);
      return;
    }
    
    onDishSelect(item.id);
  };

  // Don't render if no valid ID
  if (!item.id || item.id === 'undefined') {
    console.error('DishTableRow: Invalid item ID:', item);
    return null;
  }

  return (
    <>
      <TableRow 
        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
          isSelected ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : ''
        }`}
      >
        <TableCell className={isMobile ? 'p-2' : 'p-4'}>
          <div className="flex items-center justify-center">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className={isSelected ? 'border-purple-500 data-[state=checked]:bg-purple-600' : ''}
            />
          </div>
        </TableCell>
        <TableCell className={isMobile ? 'p-2' : 'p-4'}>
          <div className="space-y-2">
            <div className="font-medium text-slate-800 leading-tight">
              {item.dish_name}
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary"
                className={`text-xs capitalize ${getDishTypeColor(item.dish_type)}`}
              >
                {item.dish_type || 'Dish'}
              </Badge>
              {isSelected && (
                <Badge className="bg-purple-100 text-purple-800 text-xs">
                  Selected
                </Badge>
              )}
            </div>
          </div>
        </TableCell>
        {!isMobile && (
          <TableCell className="p-4">
            <div className="text-slate-600 max-w-md leading-relaxed">
              {item.description || 'No description available'}
            </div>
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                <span className="font-medium">Key ingredients:</span> {item.ingredients.slice(0, 3).join(', ')}
                {item.ingredients.length > 3 && '...'}
              </div>
            )}
          </TableCell>
        )}
        <TableCell className={isMobile ? 'p-2' : 'p-4'}>
          <div className="font-semibold text-slate-800 text-lg">
            {item.price || 'Market Price'}
          </div>
        </TableCell>
        {isMobile && (
          <TableCell className="p-2">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 w-8"
                  onClick={() => onToggleExpand(item.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </TableCell>
        )}
      </TableRow>
      {isMobile && isExpanded && (
        <TableRow>
          <TableCell colSpan={4} className="p-4 bg-slate-50">
            <div className="space-y-3">
              <div className="text-slate-700">
                <span className="font-medium text-slate-800">Description:</span>
                <p className="mt-1 leading-relaxed">{item.description || 'No description available'}</p>
              </div>
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="text-slate-700">
                  <span className="font-medium text-slate-800">Ingredients:</span>
                  <p className="mt-1 text-sm">{item.ingredients.join(', ')}</p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default DishTableRow;
