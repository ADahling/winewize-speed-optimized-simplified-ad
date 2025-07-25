
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserStats {
  winesTried: number;
  restaurants: number;
  avgRating: number;
}

interface ProfileStatsProps {
  isLoading: boolean;
  stats: UserStats;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ isLoading, stats }) => {
  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-8 mx-auto mb-1" />
        ) : (
          <div className="text-2xl font-bold text-purple-600">{stats.winesTried}</div>
        )}
        <div className="text-sm text-slate-600">Wines Tried</div>
      </div>
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-8 mx-auto mb-1" />
        ) : (
          <div className="text-2xl font-bold text-purple-600">{stats.restaurants}</div>
        )}
        <div className="text-sm text-slate-600">Restaurants</div>
      </div>
      <div>
        {isLoading ? (
          <Skeleton className="h-8 w-8 mx-auto mb-1" />
        ) : (
          <div className="text-2xl font-bold text-purple-600">
            {stats.avgRating > 0 ? stats.avgRating : '-'}
          </div>
        )}
        <div className="text-sm text-slate-600">Avg Rating</div>
      </div>
    </div>
  );
};

export default ProfileStats;
