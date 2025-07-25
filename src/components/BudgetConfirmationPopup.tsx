
import React, { useState } from 'react';
import { Wine, DollarSign, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BudgetConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  budget: string;
  onConfirmBudget: (wineTypes: string[]) => void;
  onUpdateBudget: () => void;
}

const BudgetConfirmationPopup = ({
  isOpen,
  onClose,
  budget,
  onConfirmBudget,
  onUpdateBudget
}: BudgetConfirmationPopupProps) => {
  const [selectedWineTypes, setSelectedWineTypes] = useState<string[]>([]);
  const [showWineSelection, setShowWineSelection] = useState(false);

  const wineTypes = [
    { value: 'red', label: 'RED', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'white', label: 'WHITE', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'rose', label: 'ROSÉ', color: 'bg-pink-100 text-pink-800 border-pink-300' },
    { value: 'sparkling', label: 'SPARKLING', color: 'bg-purple-100 text-purple-800 border-purple-300' }
  ];

  const handleWineTypeToggle = (type: string) => {
    setSelectedWineTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleConfirmBudget = () => {
    setShowWineSelection(true);
  };

  const handleContinue = () => {
    onConfirmBudget(selectedWineTypes);
    onClose();
    setShowWineSelection(false);
    setSelectedWineTypes([]);
  };

  const formatBudget = (budget: string) => {
    const budgetRanges: { [key: string]: string } = {
      'budget': '$15-30',
      'mid': '$30-60',
      'premium': '$60-100',
      'luxury': '$100+'
    };
    return budgetRanges[budget] || budget;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-purple-600" />
            Wine Budget Confirmation
          </DialogTitle>
        </DialogHeader>

        {!showWineSelection ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-slate-600 mb-4">
                We'll find wines within your preferred budget range:
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-xl font-semibold text-purple-800">
                    {formatBudget(budget)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleConfirmBudget}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Find Wines In My Budget
              </Button>
              
              <Button
                onClick={onUpdateBudget}
                variant="outline"
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Update My Max Price
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-slate-600 mb-4">
                Which types of wine are you interested in?
              </p>
              <p className="text-sm text-slate-500">
                Select all that apply
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {wineTypes.map((wine) => (
                <button
                  key={wine.value}
                  onClick={() => handleWineTypeToggle(wine.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${wine.color} ${
                    selectedWineTypes.includes(wine.value)
                      ? 'ring-2 ring-purple-500 ring-offset-2'
                      : 'hover:ring-1 hover:ring-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <span className="font-semibold text-sm">{wine.label}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                disabled={selectedWineTypes.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300"
              >
                Continue ({selectedWineTypes.length} selected)
              </Button>
              
              <Button
                onClick={() => setShowWineSelection(false)}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BudgetConfirmationPopup;
