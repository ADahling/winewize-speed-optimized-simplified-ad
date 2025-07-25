
import React from 'react';
import { Label } from '@/components/ui/label';

interface BudgetSelectorProps {
  budget: number;
  onChange: (budget: number) => void;
}

const BudgetSelector: React.FC<BudgetSelectorProps> = ({ budget, onChange }) => {
  const budgetOptions = [
    { value: 30, label: 'Under $30' },
    { value: 50, label: '$30-50' },
    { value: 75, label: '$50-75' },
    { value: 100, label: '$75-100' },
    { value: 150, label: '$100-150' },
    { value: 200, label: '$150+' }
  ];

  return (
    <div>
      <Label className="text-slate-800 text-lg font-semibold mb-4 block">
        What is your typical wine budget when dining out?
      </Label>
      <select
        value={budget}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        required
      >
        {budgetOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BudgetSelector;
