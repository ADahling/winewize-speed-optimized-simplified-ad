
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap } from 'lucide-react';

interface UsageIndicatorProps {
  pairingsUsed: number;
  pairingsLimit: number;
  subscriptionTier: string;
  className?: string;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  pairingsUsed,
  pairingsLimit,
  subscriptionTier,
  className = ''
}) => {
  const isUnlimited = pairingsLimit === -1;
  const percentage = isUnlimited ? 0 : Math.min((pairingsUsed / pairingsLimit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getDisplayText = () => {
    if (subscriptionTier.includes('Glass')) {
      return '20 wine pairings/month';
    }
    return 'Monthly Wine Pairings';
  };

  return (
    <div className={`bg-white rounded-lg p-4 border border-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <Crown className="w-4 h-4 text-purple-600" />
          ) : (
            <Zap className="w-4 h-4 text-slate-600" />
          )}
          <span className="text-sm font-medium text-slate-700">
            {getDisplayText()}
          </span>
        </div>
        <span className="text-sm text-slate-500">
          {isUnlimited ? (
            <span className="text-purple-600 font-medium">Unlimited</span>
          ) : (
            `${pairingsUsed}/${pairingsLimit}`
          )}
        </span>
      </div>
      
      {!isUnlimited && (
        <>
          <Progress 
            value={percentage} 
            className="h-2 mb-2"
            style={{
              background: isAtLimit ? '#fee2e2' : isNearLimit ? '#fef3c7' : '#f1f5f9'
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {subscriptionTier} Plan
            </span>
            {isAtLimit && (
              <span className="text-xs text-red-600 font-medium">
                Limit reached
              </span>
            )}
            {isNearLimit && !isAtLimit && (
              <span className="text-xs text-amber-600 font-medium">
                Almost at limit
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UsageIndicator;
