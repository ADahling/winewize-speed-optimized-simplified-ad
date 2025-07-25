
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  location?: string | null;
  subscription_level: string | null;
  trial_end_date: string | null;
}

export const useSessionValidation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    hasProfile: boolean;
    hasSubscription: boolean;
    hasValidTrial: boolean;
    profileData: UserProfile | null;
  }>({
    hasProfile: false,
    hasSubscription: false,
    hasValidTrial: false,
    profileData: null
  });

  useEffect(() => {
    if (user) {
      validateUserSession();
    }
  }, [user]);

  const validateUserSession = async () => {
    if (!user) return;

    setIsValidating(true);
    try {
      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile validation error:', profileError);
      }

      // Check subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError) {
        console.error('Subscription validation error:', subError);
      }

      const hasValidTrial = profile ? 
        new Date(profile.trial_end_date || '') > new Date() : false;

      const profileData: UserProfile | null = profile ? {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        location: profile.location || null,
        subscription_level: profile.subscription_level,
        trial_end_date: profile.trial_end_date
      } : null;

      setValidationResults({
        hasProfile: !!profile,
        hasSubscription: !!subscription,
        hasValidTrial,
        profileData
      });

      // Auto-create profile if missing
      if (!profile && user) {
        await createUserProfile();
      }

    } catch (error) {
      console.error('Session validation error:', error);
      toast({
        title: "Session validation failed",
        description: "There was an issue validating your session",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const createUserProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          location: null,
          subscription_level: 'glass',
          trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      // Refresh validation after creating profile
      await validateUserSession();
      
      toast({
        title: "Profile created",
        description: "Your user profile has been set up successfully",
      });
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  };

  return {
    isValidating,
    validationResults,
    validateUserSession,
    createUserProfile
  };
};
