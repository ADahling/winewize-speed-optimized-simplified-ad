
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalPairings: number;
  avgRating: number;
  restaurants: number;
  thisMonth: number;
  wineStyleBreakdown: { style: string; count: number; percentage: number }[];
  monthlyActivity: { month: string; count: number }[];
  topRestaurants: { name: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  wineRatingDistribution: { rating: string; count: number; percentage: number }[];
}

const VALID_WINE_STYLES = [
  'Fresh & Crisp',
  'Funky & Floral', 
  'Rich & Creamy',
  'Fresh & Fruity',
  'Dry & Dirty',
  'Packed with a Punch'
];

export const useDashboardAnalytics = (userId: string | undefined) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPairings: 0,
    avgRating: 0,
    restaurants: 0,
    thisMonth: 0,
    wineStyleBreakdown: [],
    monthlyActivity: [],
    topRestaurants: [],
    ratingDistribution: [],
    wineRatingDistribution: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId]);

  const fetchAnalytics = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Fetch all wine library data
      const { data: wines, error: winesError } = await supabase
        .from('user_wine_library')
        .select('*')
        .eq('user_id', userId);

      if (winesError) throw winesError;

      // Fetch restaurant data with menu items to count restaurants user has visited
      const { data: menuData, error: menuError } = await supabase
        .from('restaurant_menus')
        .select(`
          id,
          created_at,
          restaurant_id,
          restaurants!inner(
            id,
            name
          )
        `)
        .not('restaurant_id', 'is', null);

      if (menuError) throw menuError;

      // Calculate basic stats
      const totalPairings = wines?.length || 0;
      const ratingsWithValues = wines?.filter(wine => wine.rating !== null) || [];
      const avgRating = ratingsWithValues.length > 0 
        ? ratingsWithValues.reduce((sum, wine) => sum + (wine.rating || 0), 0) / ratingsWithValues.length
        : 0;

      // Count unique restaurants from menu data
      const uniqueRestaurants = new Set(
        menuData?.map(item => item.restaurants?.name).filter(Boolean) || []
      ).size;

      // Calculate this month's pairings
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthPairings = wines?.filter(wine => 
        new Date(wine.created_at) >= thisMonth
      ).length || 0;

      // Wine style breakdown - filter for only valid Wine Wize styles
      const validWines = wines?.filter(wine => 
        wine.wine_style && VALID_WINE_STYLES.includes(wine.wine_style)
      ) || [];

      const styleBreakdown = validWines.reduce((acc, wine) => {
        const style = wine.wine_style;
        acc[style] = (acc[style] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const wineStyleBreakdown = Object.entries(styleBreakdown).map(([style, count]) => ({
        style,
        count,
        percentage: validWines.length > 0 ? Math.round((count / validWines.length) * 100) : 0
      })).sort((a, b) => b.count - a.count);

      console.log('Wine style breakdown with valid styles only:', wineStyleBreakdown);

      // Monthly activity (last 6 months)
      const monthlyActivity = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const count = wines?.filter(wine => {
          const wineDate = new Date(wine.created_at);
          return wineDate.getFullYear() === date.getFullYear() && 
                 wineDate.getMonth() === date.getMonth();
        }).length || 0;

        monthlyActivity.push({ month: monthName, count });
      }

      // Top restaurants from menu data
      const restaurantCounts = menuData?.reduce((acc, item) => {
        const name = item.restaurants?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topRestaurants = Object.entries(restaurantCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Rating distribution
      const ratingCounts = ratingsWithValues.reduce((acc, wine) => {
        const rating = wine.rating || 0;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: ratingCounts[rating] || 0
      }));

      // Wine Rating Distribution for pie chart
      const totalWines = wines?.length || 0;
      const unratedCount = totalWines - ratingsWithValues.length;
      
      const wineRatingDistribution = [
        { rating: '5 Stars', count: ratingCounts[5] || 0, percentage: totalWines > 0 ? Math.round(((ratingCounts[5] || 0) / totalWines) * 100) : 0 },
        { rating: '4 Stars', count: ratingCounts[4] || 0, percentage: totalWines > 0 ? Math.round(((ratingCounts[4] || 0) / totalWines) * 100) : 0 },
        { rating: '3 Stars', count: ratingCounts[3] || 0, percentage: totalWines > 0 ? Math.round(((ratingCounts[3] || 0) / totalWines) * 100) : 0 },
        { rating: '2 Stars', count: ratingCounts[2] || 0, percentage: totalWines > 0 ? Math.round(((ratingCounts[2] || 0) / totalWines) * 100) : 0 },
        { rating: '1 Star', count: ratingCounts[1] || 0, percentage: totalWines > 0 ? Math.round(((ratingCounts[1] || 0) / totalWines) * 100) : 0 },
        { rating: 'Unrated', count: unratedCount, percentage: totalWines > 0 ? Math.round((unratedCount / totalWines) * 100) : 0 }
      ].filter(item => item.count > 0); // Only show categories with wines

      setAnalytics({
        totalPairings,
        avgRating: Number(avgRating.toFixed(1)),
        restaurants: uniqueRestaurants,
        thisMonth: thisMonthPairings,
        wineStyleBreakdown,
        monthlyActivity,
        topRestaurants,
        ratingDistribution,
        wineRatingDistribution
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { analytics, isLoading, refetch: fetchAnalytics };
};
