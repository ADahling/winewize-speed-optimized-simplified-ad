
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DishesSearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredItemsLength: number;
  totalItemsLength: number;
}

const DishesSearchSection = ({
  searchTerm,
  onSearchChange,
  filteredItemsLength,
  totalItemsLength
}: DishesSearchSectionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search dishes by name, type, or ingredients..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 py-3 text-lg border-slate-200 focus:border-purple-300 focus:ring-purple-200"
        />
      </div>
      {searchTerm && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <span>Showing {filteredItemsLength} of {totalItemsLength} dishes</span>
          {filteredItemsLength === 0 && (
            <Badge variant="secondary">No matches found</Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default DishesSearchSection;
