
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/navigation/BackButton';

const RestaurantBottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
      <div className="container mx-auto max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <BackButton 
            fallbackPath="/welcome"
            label="Go Back"
            className="w-full justify-center border border-slate-300 bg-white hover:bg-slate-50"
          />
          <Link to="/welcome" className="w-full">
            <Button variant="outline" className="w-full flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Start Over
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBottomNav;
