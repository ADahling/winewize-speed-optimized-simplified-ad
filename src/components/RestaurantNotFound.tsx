
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RestaurantNotFound: React.FC = () => {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 shadow-lg border border-slate-100 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">We didn't find your restaurant, but don't worry!</h3>
      <p className="text-slate-600 mb-4">
        Move to the next step and upload your menu and wine list to get personalized recommendations.
      </p>
      
      <Link to="/upload">
        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          Continue to Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
};

export default RestaurantNotFound;
