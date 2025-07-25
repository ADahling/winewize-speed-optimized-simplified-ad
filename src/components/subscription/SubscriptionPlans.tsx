
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Updated with real Stripe price IDs
const STRIPE_PLANS = {
  glass_monthly: { priceId: 'price_1RYcTLEmBNz4MSYo45cGahnR', amount: 9.99, interval: 'month' },
  glass_annual: { priceId: 'price_1RYcTvEmBNz4MSYoy8F6Y6jM', amount: 99.99, interval: 'year' },
  bottle_monthly: { priceId: 'price_1RYcUbEmBNz4MSYo3l4C0gNC', amount: 24.99, interval: 'month' },
  bottle_annual: { priceId: 'price_1RYcV9EmBNz4MSYoBR3MOWhw', amount: 249.99, interval: 'year' },
};

const SubscriptionPlans = () => {
  const { createCheckout, subscriptionInfo } = useAuth();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (tier: 'glass' | 'bottle') => {
    const planKey = `${tier}_${billingCycle === 'monthly' ? 'monthly' : 'annual'}`;
    setLoadingPlan(planKey);
    
    try {
      const plan = STRIPE_PLANS[planKey as keyof typeof STRIPE_PLANS];
      const result = await createCheckout(plan.priceId, planKey);
      
      if (result.url) {
        // Open Stripe checkout in a new tab
        window.open(result.url, '_blank');
        toast({
          title: "Redirecting to payment",
          description: "Opening Stripe checkout in a new tab...",
        });
      } else if (result.error) {
        console.error('Checkout error:', result.error);
        toast({
          title: "Payment Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (tier: 'glass' | 'bottle') => {
    const planMap = {
      glass: ['Glass Monthly', 'Glass Annual'],
      bottle: ['Bottle Monthly', 'Bottle Annual']
    };
    return planMap[tier].includes(subscriptionInfo.subscription_tier || '');
  };

  const getPrice = (tier: 'glass' | 'bottle') => {
    if (billingCycle === 'monthly') {
      return tier === 'glass' ? '$9.99' : '$24.99';
    } else {
      return tier === 'glass' ? '$99.99' : '$249.99';
    }
  };

  const getSavings = (tier: 'glass' | 'bottle') => {
    if (billingCycle === 'annual') {
      const monthlyCost = tier === 'glass' ? 9.99 * 12 : 24.99 * 12;
      const annualCost = tier === 'glass' ? 99.99 : 249.99;
      const savings = Math.round(((monthlyCost - annualCost) / monthlyCost) * 100);
      return `Save ${savings}%`;
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Billing Toggle */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Choose Your Plan</h2>
        <ToggleGroup 
          type="single" 
          value={billingCycle} 
          onValueChange={(value) => value && setBillingCycle(value)}
          className="inline-flex bg-slate-100 rounded-lg p-1"
        >
          <ToggleGroupItem 
            value="monthly" 
            className="data-[state=on]:bg-white data-[state=on]:shadow-sm"
          >
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="annual" 
            className="data-[state=on]:bg-white data-[state=on]:shadow-sm"
          >
            Annual
            {billingCycle === 'annual' && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            )}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Glass Plan */}
        <div className={`bg-white rounded-2xl p-6 border-2 ${isCurrentPlan('glass') ? 'border-purple-500 bg-purple-50' : 'border-slate-200'} relative`}>
          {billingCycle === 'annual' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                {getSavings('glass')}
              </span>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Glass</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-purple-600">{getPrice('glass')}</span>
              <span className="text-slate-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </div>
            
            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                20 wine pairings/month
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Basic recommendations
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Wine library access
              </li>
            </ul>
            
            <Button 
              onClick={() => handleSubscribe('glass')}
              disabled={isCurrentPlan('glass') || loadingPlan === `glass_${billingCycle === 'monthly' ? 'monthly' : 'annual'}`}
              className="w-full"
              variant={isCurrentPlan('glass') ? 'secondary' : 'default'}
            >
              {loadingPlan === `glass_${billingCycle === 'monthly' ? 'monthly' : 'annual'}` ? (
                'Processing...'
              ) : isCurrentPlan('glass') ? (
                'Current Plan'
              ) : (
                'Subscribe to Glass'
              )}
            </Button>
          </div>
        </div>

        {/* Bottle Plan */}
        <div className={`bg-white rounded-2xl p-6 border-2 ${isCurrentPlan('bottle') ? 'border-purple-500 bg-purple-50' : 'border-slate-200'} relative`}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          
          {billingCycle === 'annual' && (
            <div className="absolute -top-3 right-4">
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                {getSavings('bottle')}
              </span>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Bottle</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-purple-600">{getPrice('bottle')}</span>
              <span className="text-slate-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </div>
            
            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Unlimited wine pairings
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Premium recommendations
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Full wine library
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Priority support
              </li>
            </ul>
            
            <Button 
              onClick={() => handleSubscribe('bottle')}
              disabled={isCurrentPlan('bottle') || loadingPlan === `bottle_${billingCycle === 'monthly' ? 'monthly' : 'annual'}`}
              className="w-full"
              variant={isCurrentPlan('bottle') ? 'secondary' : 'default'}
            >
              {loadingPlan === `bottle_${billingCycle === 'monthly' ? 'monthly' : 'annual'}` ? (
                'Processing...'
              ) : isCurrentPlan('bottle') ? (
                'Current Plan'
              ) : (
                'Subscribe to Bottle'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
