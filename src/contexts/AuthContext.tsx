import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, SubscriptionInfo } from './auth/types';
import { useAuthInit } from './auth/useAuthInit';
import { useSessionManager } from '@/hooks/useSessionManager';
import * as authServices from './auth/services';
import { logger } from '@/utils/logger';
import { isAdminUser } from '@/utils/adminUtils';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    user,
    session,
    loading,
    authReady,
    setUser,
    setSession,
    setLoading
  } = useAuthInit();

  const { clearUserSpecificData } = useSessionManager();

  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });

  const [userProfile, setUserProfile] = useState<any>(null);

  const handleSignOut = async () => {
    setLoading(true);
    await authServices.signOut();
    setSession(null);
    setUser(null);
    setUserProfile(null);
    setSubscriptionInfo({ subscribed: false, subscription_tier: null, subscription_end: null });
    
    // Clear all session data on sign out
    clearUserSpecificData();
    
    setLoading(false);
    
    // Redirect will be handled by the component that calls signOut
    // This avoids the Router context issue
  };

  const handleRefreshSession = async () => {
    const data = await authServices.refreshSession();
    
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    } else {
      setSession(null);
      setUser(null);
      setUserProfile(null);
      // Clear session data if refresh fails
      clearUserSpecificData();
    }
  };

  const handleCheckSubscription = async () => {
    if (!user) return;
    
    try {
      // Check if user is admin first
      if (isAdminUser(user, userProfile?.role)) {
        // Admins get unlimited access
        setSubscriptionInfo({
          subscribed: true,
          subscription_tier: 'unlimited',
          subscription_end: null
        });
        return;
      }

      const data = await authServices.checkSubscription();
      setSubscriptionInfo({
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end
      });
    } catch (error) {
      logger.error('Failed to check subscription', { error, userId: user?.id });
    }
  };

  // Fetch user profile to get role information
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        logger.error('Failed to fetch user profile', { error, userId: user?.id });
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      logger.error('Failed to fetch user profile', { error, userId: user?.id });
    }
  };

  const handleCreateCheckout = async (priceId: string, planType: string) => {
    try {
      const data = await authServices.createCheckout(priceId, planType);
      return data;
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      const data = await authServices.openCustomerPortal();
      return data;
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const enhancedSignUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    location: string
  ) => {
    // Clear any existing session data before sign up
    clearUserSpecificData();
    
    const result = await authServices.signUp(email, password, firstName, lastName, location);
    
    return result;
  };

  const enhancedSignIn = async (email: string, password: string) => {
    // Clear any existing session data before sign in
    clearUserSpecificData();
    
    const result = await authServices.signIn(email, password);
    
    return result;
  };

  // Check subscription when user changes
  useEffect(() => {
    if (user && authReady) {
      fetchUserProfile();
      handleCheckSubscription();
    }
  }, [user, authReady, userProfile?.role]);

  const value = {
    user,
    session,
    loading,
    authReady,
    subscriptionInfo,
    signUp: enhancedSignUp,
    signIn: enhancedSignIn,
    signOut: handleSignOut,
    resetPassword: authServices.resetPassword,
    saveWinePreferences: authServices.saveWinePreferences,
    refreshSession: handleRefreshSession,
    checkSubscription: handleCheckSubscription,
    createCheckout: handleCreateCheckout,
    openCustomerPortal: handleOpenCustomerPortal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
