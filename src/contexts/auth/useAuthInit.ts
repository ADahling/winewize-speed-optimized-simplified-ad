
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthInit = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let sessionInitialized = false;
    let refreshTimer: NodeJS.Timeout | null = null;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        // Clear any existing refresh timer
        if (refreshTimer) {
          clearTimeout(refreshTimer);
          refreshTimer = null;
        }

        // Update session and user state
        setSession(session);
        setUser(session?.user ?? null);

        // Set up automatic token refresh if we have a valid session
        if (session?.expires_at) {
          const expiresAt = session.expires_at * 1000; // Convert to milliseconds
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;
          
          // Refresh 2 minutes before expiry (reduced from 5 minutes)
          const refreshIn = Math.max(0, timeUntilExpiry - (2 * 60 * 1000));
          
          console.log(`🔐 Session expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes, will refresh in ${Math.round(refreshIn / 1000 / 60)} minutes`);
          
          if (refreshIn > 0) {
            refreshTimer = setTimeout(async () => {
              console.log('🔐 Auto-refreshing session before expiry...');
              try {
                const { data, error } = await supabase.auth.refreshSession();
                if (error) {
                  console.error('🔐 Auto-refresh failed:', error);
                  // Don't force logout on refresh failure - let Supabase handle it naturally
                } else {
                  console.log('🔐 Auto-refresh successful');
                }
              } catch (error) {
                console.error('🔐 Auto-refresh exception:', error);
              }
            }, refreshIn);
          } else {
            console.log('🔐 Session already expired or expiring soon, triggering immediate refresh...');
            try {
              await supabase.auth.refreshSession();
            } catch (error) {
              console.error('🔐 Immediate refresh failed:', error);
            }
          }
        }

        // Mark as ready after any auth state change
        if (!sessionInitialized) {
          sessionInitialized = true;
          setLoading(false);
          setAuthReady(true);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔐 Error getting session:', error);
          // Clear any stale session data
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        } else {
          console.log('🔐 Initial session loaded:', session?.user?.id);
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        console.error('🔐 Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted && !sessionInitialized) {
          sessionInitialized = true;
          setLoading(false);
          setAuthReady(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    authReady,
    setUser,
    setSession,
    setLoading
  };
};
