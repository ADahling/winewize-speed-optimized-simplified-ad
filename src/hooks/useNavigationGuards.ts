
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionManager } from './useSessionManager';
import { useWineProcessingState } from '@/hooks/useWineProcessingState';
import { useToast } from '@/hooks/use-toast';

interface NavigationGuard {
  path: string;
  requiresAuth: boolean;
  requiresRestaurant?: boolean;
  requiresSessionData?: boolean;
  redirectTo?: string;
}

const navigationRules: NavigationGuard[] = [
  // Authentication required routes
  { path: '/welcome', requiresAuth: true, redirectTo: '/login' },
  { path: '/restaurant', requiresAuth: true, redirectTo: '/login' },
  { path: '/upload', requiresAuth: true, requiresRestaurant: false, redirectTo: '/restaurant' },
  { path: '/dishes', requiresAuth: true, requiresSessionData: true, redirectTo: '/restaurant' },
  { path: '/pairings', requiresAuth: true, requiresSessionData: true, redirectTo: '/restaurant' },
  { path: '/profile', requiresAuth: true, redirectTo: '/login' },
  { path: '/library', requiresAuth: true, redirectTo: '/login' },
  { path: '/wine-preferences', requiresAuth: true, redirectTo: '/login' },
];

export const useNavigationGuards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, authReady, refreshSession } = useAuth();
  const { hasValidSession } = useSessionManager();
  const { wineProcessingComplete } = useWineProcessingState();
  const { toast } = useToast();
  const lastProcessedPath = useRef<string>('');
  const guardTimeoutRef = useRef<NodeJS.Timeout>();
  const processingRef = useRef<boolean>(false);


  // Auto-redirect to login when user becomes null (logout scenario)
  useEffect(() => {
    // Only redirect if we were previously authenticated and now we're not
    // And we're not already on the login or index page
    if (authReady && !loading && !user && 
        location.pathname !== '/login' && 
        location.pathname !== '/' &&
        location.pathname !== '/register') {
      console.log('User logged out, redirecting to login');
      navigate('/login');
    }
  }, [user, authReady, loading, location.pathname, navigate]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Clear any existing timeout
    if (guardTimeoutRef.current) {
      clearTimeout(guardTimeoutRef.current);
    }

    // Don't process while auth is loading or not ready
    if (loading || !authReady) {
      console.log('Navigation guard: Auth loading or not ready, waiting...');
      return;
    }

    // Prevent duplicate processing
    if (processingRef.current || lastProcessedPath.current === currentPath) {
      return;
    }

    const rule = navigationRules.find(r => r.path === currentPath);
    
    if (!rule) {
      lastProcessedPath.current = currentPath;
      return; // No guard for this route
    }

    // Debounce navigation guard execution
    guardTimeoutRef.current = setTimeout(() => {
      processGuard(currentPath, rule);
    }, 100);

    return () => {
      if (guardTimeoutRef.current) {
        clearTimeout(guardTimeoutRef.current);
      }
    };
  }, [location.pathname, user, loading, authReady, hasValidSession, wineProcessingComplete, navigate, toast, refreshSession]);

  const processGuard = async (currentPath: string, rule: NavigationGuard) => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    
    try {
      console.log(`Navigation guard: Processing ${currentPath}`);

      // CRITICAL: Enhanced session data validation for dishes and pairings pages
      if (rule.requiresSessionData) {
        const sessionResults = sessionStorage.getItem('currentSessionResults');
        const sessionRestaurant = sessionStorage.getItem('currentSessionRestaurant');
        const sessionWinePairings = sessionStorage.getItem('sessionWinePairings');
        const restaurantId = localStorage.getItem('currentRestaurantId');
        const restaurantName = localStorage.getItem('currentRestaurantName');
        
        // Special handling for /pairings page - MUST have completed wine processing
        if (currentPath === '/pairings') {
          const hasSessionData = sessionResults && sessionRestaurant;
          
          // CRITICAL: Check actual wine processing completion, not just pairings storage
          if (!wineProcessingComplete) {
            console.log(`Navigation guard: ${currentPath} blocked - wine processing not complete yet (wineProcessingComplete: ${wineProcessingComplete})`);
            // Only show toast if no modal is active (check for wine processing modal)
            const modalActive = document.querySelector('[role="dialog"]');
            if (!modalActive) {
              toast({
                title: "Wine processing in progress",
                description: "Please wait while we analyze the wine list for perfect pairings",
                variant: "default",
              });
            }
            navigate('/dishes');
            return;
          }
          
          if (hasSessionData && wineProcessingComplete) {
            console.log(`Navigation guard: ${currentPath} has complete wine processing, allowing access`);
            lastProcessedPath.current = currentPath;
            processingRef.current = false;
            return;
          }
        }
        
        // For /dishes page, allow access if we have session data OR restaurant context
        const hasSessionData = sessionResults && sessionRestaurant;
        const hasRestaurantContext = restaurantId && restaurantName;
        
        if (hasSessionData) {
          console.log(`Navigation guard: ${currentPath} has valid session data (upload flow), allowing access`);
          lastProcessedPath.current = currentPath;
          processingRef.current = false;
          return;
        } else if (hasRestaurantContext) {
          console.log(`Navigation guard: ${currentPath} has restaurant context (import flow), allowing access`);
          lastProcessedPath.current = currentPath;
          processingRef.current = false;
          return;
        } else {
          console.log(`Navigation guard: ${currentPath} requires data but none found, redirecting`);
          toast({
            title: "No menu data found",
            description: "Please start a new session by selecting a restaurant and uploading images",
            variant: "destructive",
          });
          navigate(rule.redirectTo || '/restaurant');
          return;
        }
      }

      // Check authentication
      if (rule.requiresAuth && !user) {
        console.log(`Navigation guard: ${currentPath} requires auth, attempting session refresh first`);
        
        try {
          await refreshSession();
          // If refresh succeeds, the auth state will update and this effect will re-run
          return;
        } catch (refreshError) {
          console.log('Session refresh failed, redirecting to login');
          toast({
            title: "Authentication required",
            description: "Please log in to continue",
            variant: "destructive",
          });
          navigate(rule.redirectTo || '/login');
          return;
        }
      }

      // Special handling for upload route - more lenient restaurant check
      if (currentPath === '/upload' && user) {
        const restaurantId = localStorage.getItem('currentRestaurantId');
        const restaurantName = localStorage.getItem('currentRestaurantName');
        
        // For upload route, allow access even without restaurant if user is authenticated
        if (!restaurantId || !restaurantName) {
          console.log('Upload route: No restaurant selected, but allowing access with prompt');
          // Don't redirect, let the upload page handle this
        }
      } else if (rule.requiresRestaurant && user) {
        // Strict restaurant check for other routes
        const restaurantId = localStorage.getItem('currentRestaurantId');
        const restaurantName = localStorage.getItem('currentRestaurantName');
        
        if (!restaurantId || !restaurantName) {
          console.log(`Navigation guard: ${currentPath} requires restaurant selection, redirecting to ${rule.redirectTo}`);
          toast({
            title: "Restaurant selection required",
            description: "Please select a restaurant first",
            variant: "destructive",
          });
          navigate(rule.redirectTo || '/restaurant');
          return;
        }
      }

      console.log(`Navigation guard: ${currentPath} passed all checks`);
    } catch (error) {
      console.error('Navigation guard error:', error);
      toast({
        title: "Navigation error",
        description: "Please try again or refresh the page",
        variant: "destructive",
      });
    } finally {
      lastProcessedPath.current = currentPath;
      processingRef.current = false;
    }
  };

  return null; // This hook doesn't render anything
};
