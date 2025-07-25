
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WineBudgetIndicatorProps {
  isOverBudget: boolean;
}

const WineBudgetIndicator = ({ isOverBudget }: WineBudgetIndicatorProps) => {
  if (!isOverBudget) return null;

  return (
    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
      <AlertTriangle className="w-3 h-3" />
      <span className="text-xs font-medium">Over Budget</span>
    </div>
  );
};

export default WineBudgetIndicator;
