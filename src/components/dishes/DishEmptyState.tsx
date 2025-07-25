
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wine } from 'lucide-react';

interface DishEmptyStateProps {
  menuItemsLength: number;
}

const DishEmptyState = ({ menuItemsLength }: DishEmptyStateProps) => {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wine className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {menuItemsLength === 0 ? "No Menu Items Found" : "No Matching Dishes"}
      </h3>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">
        {menuItemsLength === 0 
          ? "Upload and process menu images to see available dishes here."
          : "Try adjusting your search terms to find dishes that match your preferences."
        }
      </p>
      {menuItemsLength === 0 && (
        <Link to="/upload">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            Upload Menu Images
          </Button>
        </Link>
      )}
    </div>
  );
};

export default DishEmptyState;
