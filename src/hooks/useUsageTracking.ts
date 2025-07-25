
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserUsageStats, trackPairingUsage, UsageStats } from '@/services/usageTracking';

export const useUsageTracking = () => {
  const { user, subscriptionInfo } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats>({
    pairingsUsed: 0,
    pairingsLimit: 5,
    isLimitReached: false,
    subscriptionTier: 'trial'
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsageStats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const tier = subscriptionInfo.subscribed 
        ? subscriptionInfo.subscription_tier || 'trial'
        : 'trial';
        
      const stats = await getUserUsageStats(user.id, tier);
      setUsageStats(stats);
    } catch (error) {
      console.error('Error refreshing usage stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackPairing = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if at limit before tracking
      if (usageStats.isLimitReached) {
        return false;
      }
      
      await trackPairingUsage(user.id);
      await refreshUsageStats(); // Refresh after tracking
      return true;
    } catch (error) {
      console.error('Error tracking pairing:', error);
      return false;
    }
  };

  const canGeneratePairing = (): boolean => {
    return !usageStats.isLimitReached;
  };

  useEffect(() => {
    if (user) {
      refreshUsageStats();
    }
  }, [user, subscriptionInfo]);

  return {
    usageStats,
    isLoading,
    refreshUsageStats,
    trackPairing,
    canGeneratePairing
  };
};
