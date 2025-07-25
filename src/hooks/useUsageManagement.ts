import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { trackPairingUsage, getUserUsageStats } from '@/services/usageTracking';
import { isAdminUser } from '@/utils/adminUtils';

interface UsageStats {
  pairingsUsed: number;
  pairingsLimit: number;
  subscriptionTier: string;
  isLimitReached: boolean;
}

export const useUsageManagement = () => {
  const [usageStats, setUsageStats] = useState<UsageStats>({
    pairingsUsed: 0,
    pairingsLimit: 10,
    subscriptionTier: 'free',
    isLimitReached: false
  });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const { user, subscriptionInfo } = useAuth();

  const checkUsageLimit = useCallback(async () => {
    if (!user) return false;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (isAdminUser(user, profile?.role)) {
        return true; // Admin users bypass limits
      }

      const currentUsageStats = await getUserUsageStats(user.id, subscriptionInfo?.subscription_tier);
      setUsageStats(currentUsageStats);
      
      if (currentUsageStats.isLimitReached) {
        setShowUpgradePrompt(true);
        toast.error('You have reached your monthly pairing limit. Please upgrade your subscription.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      // EMERGENCY FIX: Allow pairing to proceed even if usage check fails
      return true;
    }
  }, [user, subscriptionInfo]);

  const trackUsage = useCallback(async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!isAdminUser(user, profile?.role)) {
      await trackPairingUsage(user.id);
    }
  }, [user]);

  return {
    usageStats,
    showUpgradePrompt,
    setShowUpgradePrompt,
    checkUsageLimit,
    trackUsage
  };
};