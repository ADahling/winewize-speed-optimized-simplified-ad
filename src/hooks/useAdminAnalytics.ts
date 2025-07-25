
import { useState, useEffect } from 'react';
import { getSubscriptionUsageAnalytics, getUsageTrends, SubscriptionUsageData, UsageTrendData } from '@/services/adminAnalytics';

export const useAdminAnalytics = () => {
  const [usageData, setUsageData] = useState<SubscriptionUsageData[]>([]);
  const [trendData, setTrendData] = useState<UsageTrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [usage, trends] = await Promise.all([
        getSubscriptionUsageAnalytics(),
        getUsageTrends()
      ]);
      
      setUsageData(usage);
      setTrendData(trends);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    usageData,
    trendData,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
};
