
import { supabase } from '@/integrations/supabase/client';
import { isAdminUser } from '@/utils/adminUtils';

export interface UsageStats {
  pairingsUsed: number;
  pairingsLimit: number;
  isLimitReached: boolean;
  subscriptionTier: string;
}

export const TIER_LIMITS = {
  trial: 5,
  'Glass Monthly': 20,
  'Glass Annual': 20,
  'Bottle Monthly': -1, // Unlimited
  'Bottle Annual': -1, // Unlimited
  unlimited: -1, // Admin users
  free: 5
};

export const trackPairingUsage = async (userId: string): Promise<void> => {
  try {
    // Track this pairing generation with error handling
    const { error: insertError } = await supabase
      .from('wine_interactions')
      .insert({
        user_id: userId,
        interaction_type: 'pairing_generated',
        wine_name: 'Pairing Session',
        wine_style: 'N/A',
        dish_name: 'Multiple Dishes'
      });

    if (insertError) {
      console.warn('Failed to track pairing usage:', insertError);
      return; // Fail silently to prevent blocking pairing generation
    }
  } catch (error) {
    console.warn('Error tracking pairing usage:', error);
    // Don't throw - tracking failures shouldn't block core functionality
  }
};

export const getUserUsageStats = async (userId: string, subscriptionTier?: string): Promise<UsageStats> => {
  try {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    // Get user info to check if they're admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (isAdminUser(user, profile?.role)) {
      return {
        pairingsUsed: 0,
        pairingsLimit: -1, // Unlimited
        isLimitReached: false,
        subscriptionTier: 'unlimited'
      };
    }

    // Get current month start
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Count pairings generated this month with error handling
    const { data: usageData, error } = await supabase
      .from('wine_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('interaction_type', 'pairing_generated')
      .gte('created_at', monthStart.toISOString());

    if (error) {
      console.warn('Failed to get usage stats:', error);
      // Return conservative stats on database error
      return {
        pairingsUsed: 0,
        pairingsLimit: TIER_LIMITS.trial,
        isLimitReached: false,
        subscriptionTier: subscriptionTier || 'trial'
      };
    }

    const pairingsUsed = usageData?.length || 0;
    const tier = subscriptionTier || 'trial';
    const pairingsLimit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.trial;
    const isLimitReached = pairingsLimit > 0 && pairingsUsed >= pairingsLimit;

    return {
      pairingsUsed,
      pairingsLimit,
      isLimitReached,
      subscriptionTier: tier
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return {
      pairingsUsed: 0,
      pairingsLimit: TIER_LIMITS.trial,
      isLimitReached: false,
      subscriptionTier: 'trial'
    };
  }
};
