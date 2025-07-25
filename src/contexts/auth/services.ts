
import { supabase } from '@/integrations/supabase/client';
import { ensureUserProfile, syncToCRM } from './utils';

export const signUp = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string, 
  location: string
) => {
  // Remove email redirect since we're not using email confirmation
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        location: location
      }
    }
  });

  // If signup successful and user created, sync to CRM and ensure profile
  if (!error && data.user) {
    console.log('User created successfully, syncing data and sending welcome email...');
    
    // Ensure the user profile is created/updated (fallback if trigger fails)
    await ensureUserProfile(data.user.id, email, firstName, lastName, location);
    
    // Sync to CRM
    await syncToCRM(data.user.id, email, firstName, lastName, location);
    
    // Send welcome email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          templateName: 'menu-match-welcome',
          templateData: {
            name: firstName || 'Wine Enthusiast',
          }
        },
      });
      
      if (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      } else {
        console.log('Welcome email sent successfully to:', email);
      }
    } catch (emailException) {
      console.error('Exception sending welcome email:', emailException);
      // Don't fail the signup if email fails
    }
  }

  return { error };
};

export const signIn = async (email: string, password: string) => {
  console.log('🔐 SUPABASE SIGNIN ATTEMPT', { 
    email, 
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://kkkoepjiwdlchkkrvmub.supabase.co',
    timestamp: new Date().toISOString()
  });

  try {
    // Clear any existing session before signing in
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ SUPABASE SIGNIN ERROR', { 
        error: error.message, 
        email,
        errorCode: error.status || 'unknown',
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://kkkoepjiwdlchkkrvmub.supabase.co'
      });
      return { error };
    }

    if (data.user) {
      console.log('✅ SUPABASE SIGNIN SUCCESS', { 
        userId: data.user.id,
        email: data.user.email,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://kkkoepjiwdlchkkrvmub.supabase.co'
      });

      // For kristimayfield@wine-wize.com, verify profile exists
      if (email === 'kristimayfield@wine-wize.com') {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, role')
            .eq('id', data.user.id)
            .maybeSingle();

          console.log('🔍 ADMIN PROFILE CHECK', {
            userId: data.user.id,
            profile,
            profileError: profileError?.message
          });
        } catch (profileCheckError) {
          console.error('❌ ADMIN PROFILE CHECK FAILED', { profileCheckError });
        }
      }
    }

    return { error: null };
  } catch (exception) {
    console.error('💥 SIGNIN EXCEPTION', { 
      exception: exception instanceof Error ? exception.message : String(exception),
      email,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://kkkoepjiwdlchkkrvmub.supabase.co'
    });
    return { error: exception as any };
  }
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const resetPassword = async (email: string) => {
  const redirectUrl = `${window.location.origin}/`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });
  return { error };
};

export const saveWinePreferences = async (userId: string, preferences: any) => {
  const { error } = await supabase
    .from('wine_preferences')
    .insert({
      user_id: userId,
      ...preferences
    });
  return { error };
};

export const refreshSession = async () => {
  try {
    console.log('Manually refreshing session...');
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Manual session refresh failed:', error);
      throw error;
    }
    
    console.log('Manual session refresh successful');
    return data;
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
};

export const validateTokenExpiry = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.warn('No valid session found during token validation');
      return { isValid: false, session: null };
    }
    
    const now = Math.floor(Date.now() / 1000);
    const tokenExp = session.expires_at || 0;
    const timeUntilExpiry = tokenExp - now;
    
    // Consider token invalid if it expires within 1 minute
    const isValid = timeUntilExpiry > 60;
    
    console.log(`Token validation: ${isValid ? 'valid' : 'invalid'}, expires in ${timeUntilExpiry}s`);
    
    return { isValid, session, timeUntilExpiry };
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, session: null };
  }
};

export const checkSubscription = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('check-subscription');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking subscription:', error);
    throw error;
  }
};

export const createCheckout = async (priceId: string, planType: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId, planType }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
};

export const openCustomerPortal = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error opening customer portal:', error);
    throw error;
  }
};
