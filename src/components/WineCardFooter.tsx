
import React from 'react';
import { Plus, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WineCardFooterProps {
  price: string;
  isOverBudget: boolean;
  onAddClick: (e: React.MouseEvent) => void;
}

const WineCardFooter = ({ price, isOverBudget, onAddClick }: WineCardFooterProps) => {
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      <div className="flex items-center gap-2 flex-1">
        <span className="flex items-center gap-1 text-sm">
          <CircleDollarSign 
            className={`w-5 h-5 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}
          />
          <span className="text-green-600 font-semibold">{price}</span>
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 hover:bg-purple-50 min-h-[44px] px-3 py-2 text-sm font-medium"
        onClick={onAddClick}
      >
        <Plus className="w-3 h-3" />
        <span className="hidden sm:inline">Add to Library</span>
        <span className="sm:hidden">Add</span>
      </Button>
    </div>
  );
};

export default WineCardFooter;
