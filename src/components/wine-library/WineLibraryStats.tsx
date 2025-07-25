import React from 'react';
import { Wine, Star, Heart, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WineStats {
  totalWines: number;
  ratedWines: number;
  averageRating: number;
  favoriteCount: number;
  typeDistribution: Record<string, number>;
}

interface WineLibraryStatsProps {
  stats: WineStats;
}

const WineLibraryStats = ({ stats }: WineLibraryStatsProps) => {
  const { totalWines, ratedWines, averageRating, favoriteCount, typeDistribution } = stats;

  const topWineType = Object.entries(typeDistribution)
    .filter(([type]) => type !== 'unknown')
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Wines */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-700">Total Wines</p>
              <p className="text-2xl font-bold text-purple-900">{totalWines}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-700">Avg Rating</p>
              <p className="text-2xl font-bold text-amber-900">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorites */}
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <div>
              <p className="text-sm font-medium text-rose-700">Favorites</p>
              <p className="text-2xl font-bold text-rose-900">{favoriteCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Wine Type */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-700">Top Type</p>
              <p className="text-lg font-bold text-emerald-900 capitalize">
                {topWineType ? `${topWineType[0]} (${topWineType[1]})` : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WineLibraryStats;