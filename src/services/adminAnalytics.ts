
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionUsageData {
  tier: string;
  totalUsers: number;
  averagePairingsPerMonth: number;
  totalPairingsThisMonth: number;
  usersNearLimit: number;
}

export interface UsageTrendData {
  month: string;
  glassTier: number;
  bottleTier: number;
  trialTier: number;
}

export const getSubscriptionUsageAnalytics = async (): Promise<SubscriptionUsageData[]> => {
  try {
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('subscription_tier, user_id');

    if (error) throw error;

    const tierGroups = subscribers?.reduce((acc, sub) => {
      const tier = sub.subscription_tier || 'trial';
      if (!acc[tier]) {
        acc[tier] = [];
      }
      acc[tier].push(sub.user_id);
      return acc;
    }, {} as Record<string, string[]>) || {};

    const result: SubscriptionUsageData[] = [];

    for (const [tier, userIds] of Object.entries(tierGroups)) {
      const totalUsers = userIds.length;
      
      // Mock data for now - replace with actual analytics when available
      result.push({
        tier,
        totalUsers,
        averagePairingsPerMonth: Math.floor(Math.random() * 20) + 5,
        totalPairingsThisMonth: Math.floor(Math.random() * 50) + 10,
        usersNearLimit: Math.floor(totalUsers * 0.2)
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching subscription usage analytics:', error);
    return [];
  }
};

export const getUsageTrends = async (): Promise<UsageTrendData[]> => {
  try {
    // Generate trend data for the last 6 months
    const trends: UsageTrendData[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      trends.push({
        month: monthName,
        glassTier: Math.floor(Math.random() * 50) + 20,
        bottleTier: Math.floor(Math.random() * 30) + 10,
        trialTier: Math.floor(Math.random() * 100) + 50
      });
    }

    return trends;
  } catch (error) {
    console.error('Error fetching usage trends:', error);
    return [];
  }
};
