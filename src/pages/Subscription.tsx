
import React from 'react';
import { Crown } from 'lucide-react';
import Header from '@/components/Header';
import BreadcrumbNav from '@/components/navigation/BreadcrumbNav';
import BackButton from '@/components/navigation/BackButton';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
import Copyright from '@/components/Copyright';
import { useAuth } from '@/contexts/AuthContext';

const Subscription = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Please sign in to view subscriptions</h1>
        </div>
        <Copyright />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20">
        <BreadcrumbNav />
        
        <div className="mb-6">
          <BackButton fallbackPath="/profile" label="Back to Profile" />
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Wine Pairing Subscriptions</h1>
          <p className="text-slate-600">Choose the perfect plan for your wine journey</p>
        </div>

        <SubscriptionStatus />
        <SubscriptionPlans />
      </div>
      <Copyright />
    </div>
  );
};

export default Subscription;
