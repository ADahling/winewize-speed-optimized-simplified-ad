
import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useForceLogout = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const logoutInProgress = useRef(false);

  const checkAndFixJWTIssue = async () => {
    if (!user || logoutInProgress.current) return false;

    try {
      // COMPLETELY DISABLED FOR ADMIN TROUBLESHOOTING
      console.log('🔍 JWT issue check DISABLED for admin troubleshooting');
      
      // For kristimayfield@wine-wize.com, completely skip any JWT checks
      if (user.email === 'kristimayfield@wine-wize.com' || user.id === '7daa99e0-a34e-4130-8dee-139ac28fdc4c') {
        console.log('🔑 Admin user detected - ALL JWT checks bypassed for troubleshooting');
        return false;
      }

      // For all other users, also skip for now to avoid interference
      console.log('✅ JWT check bypassed for all users during admin troubleshooting');
      return false;

    } catch (error) {
      console.error('❌ Error in JWT check (bypassed):', error);
      return false;
    }
  };

  return { checkAndFixJWTIssue };
};
