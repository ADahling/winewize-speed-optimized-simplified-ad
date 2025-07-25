
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseWinePreferencesProps {
  userId: string;
  onComplete: () => void;
}

export const useWinePreferences = ({ userId, onComplete }: UseWinePreferencesProps) => {
  const [budget, setBudget] = useState<number>(50);
  const [whiteWineRank, setWhiteWineRank] = useState<number>(1);
  const [redWineRank, setRedWineRank] = useState<number>(1);
  const [roseWineRank, setRoseWineRank] = useState<number>(1);
  const [sparklingWineRank, setSparklingWineRank] = useState<number>(1);
  const [sweetness, setSweetness] = useState('');
  const [acidity, setAcidity] = useState('');
  const [alcohol, setAlcohol] = useState('');
  const [tannin, setTannin] = useState('');
  const [wwWhiteStyle, setWwWhiteStyle] = useState('');
  const [wwRedStyle, setWwRedStyle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);
  const { toast } = useToast();

  // Load existing preferences on component mount
  useEffect(() => {
    const loadExistingPreferences = async () => {
      try {
        console.log('Loading preferences for user:', userId);
        
        const { data, error } = await supabase
          .from('wine_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (data && !error) {
          // Populate form with existing preferences
          setBudget(data.budget || 50);
          setWhiteWineRank(data.white_wine_rank || 1);
          setRedWineRank(data.red_wine_rank || 1);
          setRoseWineRank(data.rose_wine_rank || 1);
          setSparklingWineRank(data.sparkling_wine_rank || 1);
          setSweetness(data.sweetness || '');
          setAcidity(data.acidity || '');
          setAlcohol(data.alcohol || '');
          setTannin(data.tannin || '');
          setWwWhiteStyle(data.ww_white_style || '');
          setWwRedStyle(data.ww_red_style || '');
          setHasExistingPreferences(true);
          
          console.log('Loaded existing wine preferences:', data);
        } else if (error) {
          console.error('Error loading preferences:', error);
        }
      } catch (error) {
        console.error('Error loading wine preferences:', error);
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    if (userId) {
      loadExistingPreferences();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      console.log('Starting wine preferences save process for user:', userId);

      const preferencesData = {
        user_id: userId,
        budget,
        white_wine_rank: whiteWineRank,
        red_wine_rank: redWineRank,
        rose_wine_rank: roseWineRank,
        sparkling_wine_rank: sparklingWineRank,
        sweetness,
        acidity,
        alcohol,
        tannin,
        ww_white_style: wwWhiteStyle || null,
        ww_red_style: wwRedStyle || null,
      };

      console.log('Preferences data to save:', preferencesData);

      // Use UPSERT to handle both insert and update
      const { error, data } = await supabase
        .from('wine_preferences')
        .upsert(preferencesData, {
          onConflict: 'user_id'
        })
        .select();

      console.log('Upsert result:', { error, data });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast({
        title: hasExistingPreferences ? "Preferences updated!" : "Preferences saved!",
        description: hasExistingPreferences ? "Your wine preferences have been updated successfully." : "Your wine preferences have been saved successfully.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    budget,
    whiteWineRank,
    redWineRank,
    roseWineRank,
    sparklingWineRank,
    sweetness,
    acidity,
    alcohol,
    tannin,
    wwWhiteStyle,
    wwRedStyle,
    isLoading,
    isLoadingPreferences,
    hasExistingPreferences,
    // Setters
    setBudget,
    setWhiteWineRank,
    setRedWineRank,
    setRoseWineRank,
    setSparklingWineRank,
    setSweetness,
    setAcidity,
    setAlcohol,
    setTannin,
    setWwWhiteStyle,
    setWwRedStyle,
    // Functions
    handleSubmit,
  };
};
