
import { supabase } from '@/integrations/supabase/client';

export const ensureUserProfile = async (
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  location: string
) => {
  try {
    console.log('🔐 ENSURING USER PROFILE WITH FIXED JWT CLAIMS');
    console.log('User details:', { userId, email, firstName, lastName, location });
    
    // Check if profile already exists using maybeSingle() to avoid 400 errors
    console.log('🔍 Checking if profile exists for user:', userId);
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    console.log('🔍 Profile existence check result:', {
      profileExists: !!existingProfile,
      profileData: existingProfile,
      error: selectError?.message,
      authUid: userId,
      queryType: 'SELECT profiles WHERE id = userId'
    });

    if (existingProfile) {
      console.log('✅ Profile already exists for user:', userId, 'with role:', existingProfile.role);
      return;
    }

    if (selectError) {
      console.warn('⚠️ Error checking existing profile (non-blocking):', selectError);
    }

    // The trigger will handle profile creation automatically now with correct JWT role
    // No manual intervention needed - the fixed trigger ensures proper role handling
    console.log('✅ Profile creation will be handled by the fixed database trigger');
    
  } catch (error) {
    console.error('💥 Error in ensureUserProfile (non-blocking):', error);
    // Don't throw error as profile creation is handled by the trigger
  }
};

export const syncToCRM = async (
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  location: string
) => {
  try {
    console.log('📧 Syncing user to CRM:', { userId, email, firstName, lastName, location });
    
    const { error } = await supabase.functions.invoke('sync-to-systeme-io', {
      body: {
        user_id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        location
      }
    });

    if (error) {
      console.error('❌ CRM sync error (non-blocking):', error);
      // Don't throw error as CRM sync is not critical for user registration
    } else {
      console.log('✅ User synced to CRM successfully');
    }
  } catch (error) {
    console.error('💥 CRM sync error (non-blocking):', error);
    // Don't throw error as CRM sync is not critical for user registration
  }
};
