
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import UsageIndicator from '@/components/subscription/UsageIndicator';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';

const ProfileUsage = () => {
  const { usageStats, isLoading } = useUsageTracking();
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(false);

  const handleUpgradeClick = () => {
    setShowUpgradePrompt(true);
  };

  const handleCloseUpgradePrompt = () => {
    setShowUpgradePrompt(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <UsageIndicator
            pairingsUsed={usageStats.pairingsUsed}
            pairingsLimit={usageStats.pairingsLimit}
            subscriptionTier={usageStats.subscriptionTier}
          />
          
          {usageStats.isLimitReached && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 mb-2">
                You've reached your monthly limit of {usageStats.pairingsLimit} pairings.
              </p>
              <button 
                onClick={handleUpgradeClick}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Upgrade to get more pairings →
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={handleCloseUpgradePrompt}
        currentTier={usageStats.subscriptionTier}
        pairingsUsed={usageStats.pairingsUsed}
        pairingsLimit={usageStats.pairingsLimit}
      />
    </>
  );
};

export default ProfileUsage;
