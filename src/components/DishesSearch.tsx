
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DishesSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const DishesSearch = ({ searchTerm, onSearchChange }: DishesSearchProps) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
      <Input
        placeholder="Search dishes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default DishesSearch;
