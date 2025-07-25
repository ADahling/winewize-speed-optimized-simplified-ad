
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { UsageDataPoint, TrendDataPoint } from '@/types/wine';

interface SubscriptionStatsData {
  usageData: UsageDataPoint[];
  trendData: TrendDataPoint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  totalUsers: number;
  activeSubscriptions: number;
  averageUsage: number;
}

export const useSubscriptionStats = (): SubscriptionStatsData => {
  const [usageData, setUsageData] = useState<UsageDataPoint[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [averageUsage, setAverageUsage] = useState(0);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) {
        logger.error('Error fetching user count', { error: userError });
        throw userError;
      }

      // Fixed: Use subscription_level instead of subscription_tier
      // Exclude site_admin users from active subscription count
      const { count: subscriptionCount, error: subscriptionError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('subscription_level', 'is', null)
        .neq('role', 'site_admin');

      if (subscriptionError) {
        logger.error('Error fetching subscription count', { error: subscriptionError });
        throw subscriptionError;
      }

      setTotalUsers(userCount || 0);
      setActiveSubscriptions(subscriptionCount || 0);
      setAverageUsage(0); // Placeholder for now

      setUsageData([]);
      setTrendData([]);

      logger.info('Subscription stats fetched successfully', {
        totalUsers: userCount,
        activeSubscriptions: subscriptionCount
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Error fetching subscription stats', { error: err });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = () => {
    fetchStats();
  };

  return {
    usageData,
    trendData,
    isLoading,
    error,
    refetch,
    totalUsers,
    activeSubscriptions,
    averageUsage
  };
};
