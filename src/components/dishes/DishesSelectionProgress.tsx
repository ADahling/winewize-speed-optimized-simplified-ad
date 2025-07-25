
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DishesSelectionProgressProps {
  selectedDishes: string[];
  maxSelections: number;
  onClearAllSelections: () => void;
}

const DishesSelectionProgress = ({
  selectedDishes,
  maxSelections,
  onClearAllSelections
}: DishesSelectionProgressProps) => {
  const selectionProgress = (selectedDishes.length / maxSelections) * 100;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Select Your Dishes
            </h3>
            <p className="text-slate-600 text-sm">
              Choose up to {maxSelections} dishes for personalized wine pairings
            </p>
          </div>
        </div>
        <Badge 
          variant={selectedDishes.length === maxSelections ? "default" : "secondary"}
          className={selectedDishes.length === maxSelections ? "bg-green-100 text-green-800" : ""}
        >
          {selectedDishes.length} / {maxSelections}
        </Badge>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${selectionProgress}%` }}
        />
      </div>
      
      {selectedDishes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {selectedDishes.length === maxSelections 
              ? "Perfect! Ready to generate wine pairings." 
              : `${maxSelections - selectedDishes.length} more dish${maxSelections - selectedDishes.length !== 1 ? 'es' : ''} can be selected.`
            }
          </p>
          {selectedDishes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllSelections}
              className="text-slate-600 hover:text-slate-800"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DishesSelectionProgress;
