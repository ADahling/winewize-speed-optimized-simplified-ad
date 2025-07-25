
import React from 'react';
import { Crown, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const SubscriptionStatus = () => {
  const { subscriptionInfo, checkSubscription, openCustomerPortal, user } = useAuth();

  const handleRefreshStatus = async () => {
    await checkSubscription();
  };

  const handleManageSubscription = async () => {
    const result = await openCustomerPortal();
    if (result.url) {
      window.open(result.url, '_blank');
    } else if (result.error) {
      console.error('Portal error:', result.error);
    }
  };

  const formatEndDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-800">
              {subscriptionInfo.subscribed ? 'Premium Subscription' : 'Free Trial'}
            </h3>
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              {subscriptionInfo.subscribed ? (
                <>
                  <span>Plan: {subscriptionInfo.subscription_tier}</span>
                  {subscriptionInfo.subscription_end && (
                    <>
                      <span className="mx-1">•</span>
                      <Calendar className="w-4 h-4" />
                      <span>Renews {formatEndDate(subscriptionInfo.subscription_end)}</span>
                    </>
                  )}
                </>
              ) : (
                <span>7-day free trial active</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshStatus}
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {subscriptionInfo.subscribed && (
            <Button
              size="sm"
              onClick={handleManageSubscription}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Manage Subscription
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
