
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  location: string;
  created_at: string;
}

interface UserStats {
  winesTried: number;
  restaurants: number;
  avgRating: number;
}

interface WineLibraryEntry {
  id: string;
  wine_name: string;
  dish_paired_with: string;
  rating: number | null;
  created_at: string;
}

export const useProfileData = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ winesTried: 0, restaurants: 0, avgRating: 0 });
  const [wineLibrary, setWineLibrary] = useState<WineLibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    console.log('🔍 FETCHING USER DATA WITH RLS LOGGING');
    console.log('User ID:', userId);
    console.log('Auth context:', { uid: userId });
    
    try {
      // Fetch user profile with detailed logging
      console.log('📋 Attempting to fetch profile for user:', userId);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📋 Profile query result:', {
        success: !profileError,
        data: profileData,
        error: profileError?.message,
        authUid: userId,
        queryType: 'SELECT profiles WHERE id = auth.uid()'
      });

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
      } else if (profileData) {
        console.log('✅ Profile data loaded successfully:', profileData);
        setProfile(profileData);
      } else {
        console.warn('⚠️ No profile data found for user:', userId);
      }

      // Fetch wine library entries with logging
      console.log('🍷 Attempting to fetch wine library for user:', userId);
      const { data: wineData, error: wineError } = await supabase
        .from('user_wine_library')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('🍷 Wine library query result:', {
        success: !wineError,
        count: wineData?.length || 0,
        error: wineError?.message,
        authUid: userId,
        queryType: 'SELECT user_wine_library WHERE user_id = auth.uid()'
      });

      if (wineError) {
        console.error('❌ Wine library fetch error:', wineError);
      } else {
        console.log('✅ Wine library data loaded:', wineData?.length || 0, 'entries');
        setWineLibrary(wineData || []);
      }

      // Calculate statistics with logging
      console.log('📊 Calculating user statistics...');
      const { data: allWines, error: statsError } = await supabase
        .from('user_wine_library')
        .select('rating')
        .eq('user_id', userId);

      console.log('📊 Stats calculation query result:', {
        success: !statsError,
        totalWines: allWines?.length || 0,
        error: statsError?.message,
        authUid: userId
      });

      if (!statsError && allWines) {
        const winesTried = allWines.length;
        const ratingsWithValues = allWines.filter(wine => wine.rating !== null);
        const avgRating = ratingsWithValues.length > 0 
          ? ratingsWithValues.reduce((sum, wine) => sum + (wine.rating || 0), 0) / ratingsWithValues.length
          : 0;

        // Count unique restaurants from restaurant_menus table
        console.log('🏪 Fetching restaurant count...');
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurant_menus')
          .select(`
            restaurant_id,
            restaurants!inner(
              id,
              name
            )
          `)
          .not('restaurant_id', 'is', null);

        console.log('🏪 Restaurant count query result:', {
          success: !restaurantError,
          totalRestaurantMenus: restaurantData?.length || 0,
          error: restaurantError?.message
        });

        const uniqueRestaurants = restaurantData 
          ? new Set(restaurantData.map(item => item.restaurants?.name).filter(Boolean)).size
          : 0;

        const calculatedStats = {
          winesTried,
          restaurants: uniqueRestaurants,
          avgRating: Math.round(avgRating * 10) / 10
        };

        console.log('📊 Final calculated stats:', calculatedStats);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('💥 Critical error fetching user data:', error);
    } finally {
      setIsLoading(false);
      console.log('🏁 User data fetch completed');
    }
  };

  const getInitials = () => {
    if (!profile) return 'U';
    const firstInitial = profile.first_name?.[0] || '';
    const lastInitial = profile.last_name?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!profile) return 'Wine Enthusiast';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return firstName && lastName ? `${firstName} ${lastName}` : 'Wine Enthusiast';
  };

  const getMemberSince = () => {
    if (!profile?.created_at) return '2024';
    return new Date(profile.created_at).getFullYear().toString();
  };

  return {
    profile,
    stats,
    wineLibrary,
    isLoading,
    getInitials,
    getDisplayName,
    getMemberSince
  };
};
