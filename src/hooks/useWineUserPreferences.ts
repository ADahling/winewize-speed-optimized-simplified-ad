
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WineUserPreferences {
  budget: number;
  wineWhiteStyle: string;
  wineRedStyle: string;
}

export const useWineUserPreferences = () => {
  const [preferences, setPreferences] = useState<WineUserPreferences>({
    budget: 50,
    wineWhiteStyle: '',
    wineRedStyle: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wine_preferences')
          .select('budget, ww_white_style, ww_red_style')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setPreferences({
            budget: data.budget,
            wineWhiteStyle: data.ww_white_style || '',
            wineRedStyle: data.ww_red_style || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPreferences();
  }, [user]);

  return preferences;
};
