
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimplifiedPairingStatus } from '@/components/SimplifiedPairingStatus';

interface DishesActionsProps {
  selectedDishes: string[];
  isGeneratingPairings: boolean;
  onClearAll: () => void;
  onGeneratePairings: () => void;
}

const DishesActions = ({ 
  selectedDishes, 
  isGeneratingPairings, 
  onClearAll, 
  onGeneratePairings 
}: DishesActionsProps) => {
  console.log('🎯 DISHES ACTIONS RENDER:', { 
    entry: true,
    selectedDishes: selectedDishes.length, 
    isGeneratingPairings,
    timestamp: new Date().toISOString()
  });

  return (
    <>
      {/* Wine Pairing Readiness Status */}
      <div className="mb-6">
        <SimplifiedPairingStatus />
      </div>

      {/* Status Pill */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">
          {selectedDishes.length}/4 dishes selected
        </div>
      </div>

      {/* Selection Count */}
      <div className="text-center mb-6">
        <p className="text-slate-600 font-medium">
          Selected: {selectedDishes.length}/4
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={onClearAll}
          disabled={selectedDishes.length === 0}
          className="flex-1"
        >
          Clear All
        </Button>
        
        <Button 
          onClick={() => {
            console.log('[DEBUG] Button clicked in DishesActions');
            onGeneratePairings();
          }}
          disabled={selectedDishes.length === 0 || isGeneratingPairings}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {isGeneratingPairings ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Pairings...
            </>
          ) : (
            <>
              Find Perfect Wine Pairings
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <Link to="/upload" className="flex-1">
          <Button variant="outline" className="w-full">Go Back</Button>
        </Link>
      </div>
    </>
  );
};

export default DishesActions;
