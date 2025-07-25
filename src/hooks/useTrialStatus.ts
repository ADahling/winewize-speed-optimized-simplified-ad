
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserUsageStats } from '@/services/usageTracking';

export const useTrialStatus = () => {
  const { user, subscriptionInfo } = useAuth();
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [trialStatusChecked, setTrialStatusChecked] = useState(false);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user || trialStatusChecked) return;

      // Only check for users who are not subscribed
      if (subscriptionInfo.subscribed) {
        setTrialStatusChecked(true);
        return;
      }

      try {
        const usageStats = await getUserUsageStats(user.id, subscriptionInfo.subscription_tier || 'trial');
        
        // Check if user has exceeded trial limit
        if (usageStats.isLimitReached && !sessionStorage.getItem('trialExpiredModalShown')) {
          setShowTrialExpiredModal(true);
          sessionStorage.setItem('trialExpiredModalShown', 'true');
        }
        
        setTrialStatusChecked(true);
      } catch (error) {
        console.error('Error checking trial status:', error);
        setTrialStatusChecked(true);
      }
    };

    checkTrialStatus();
  }, [user, subscriptionInfo, trialStatusChecked]);

  const dismissTrialModal = () => {
    setShowTrialExpiredModal(false);
  };

  return {
    showTrialExpiredModal,
    dismissTrialModal,
    isTrialExpired: subscriptionInfo.subscription_tier === 'trial' && !subscriptionInfo.subscribed
  };
};
