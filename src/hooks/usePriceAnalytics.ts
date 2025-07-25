
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePriceAnalytics = (userId: string | undefined) => {
  const [avgPriceData, setAvgPriceData] = useState<any[]>([]);
  const [annualAverage, setAnnualAverage] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      fetchPriceAnalytics();
    }
  }, [userId]);

  const fetchPriceAnalytics = async () => {
    if (!userId) return;

    try {
      const { data: wines, error } = await supabase
        .from('user_wine_library')
        .select('price, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      // Process price data by month
      const monthlyData: { [key: string]: number[] } = {};
      let totalPrices: number[] = [];

      wines?.forEach(wine => {
        const priceMatch = wine.price.match(/\$?(\d+)/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1]);
          totalPrices.push(price);
          
          const date = new Date(wine.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
          }
          monthlyData[monthKey].push(price);
        }
      });

      // Calculate monthly averages
      const chartData = Object.entries(monthlyData)
        .map(([month, prices]) => ({
          month: month,
          avgPrice: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Last 6 months

      setAvgPriceData(chartData);

      // Calculate annual average
      const yearlyAvg = totalPrices.length > 0 
        ? Math.round(totalPrices.reduce((sum, price) => sum + price, 0) / totalPrices.length)
        : 0;
      setAnnualAverage(yearlyAvg);

    } catch (error) {
      console.error('Error fetching price analytics:', error);
    }
  };

  return { avgPriceData, annualAverage, refetch: fetchPriceAnalytics };
};
