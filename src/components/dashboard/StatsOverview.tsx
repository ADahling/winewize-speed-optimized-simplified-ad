
import React from 'react';
import { TrendingUp, Wine, Star, MapPin } from 'lucide-react';

interface StatsOverviewProps {
  totalPairings: number;
  avgRating: number;
  restaurants: number;
  thisMonth: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalPairings,
  avgRating,
  restaurants,
  thisMonth
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Wine className="w-5 h-5 text-purple-600" />
          <span className="text-sm text-slate-600">Total Pairings</span>
        </div>
        <div className="text-2xl font-bold text-slate-800">{totalPairings}</div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-slate-600">Avg Rating</span>
        </div>
        <div className="text-2xl font-bold text-slate-800">{avgRating}</div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span className="text-sm text-slate-600">Restaurants</span>
        </div>
        <div className="text-2xl font-bold text-slate-800">{restaurants}</div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-slate-600">This Month</span>
        </div>
        <div className="text-2xl font-bold text-slate-800">{thisMonth}</div>
      </div>
    </div>
  );
};

export default StatsOverview;
