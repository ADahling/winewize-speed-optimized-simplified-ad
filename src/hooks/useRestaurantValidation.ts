
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

export const useRestaurantValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const checkDuplicate = useCallback(async (name: string, location: string) => {
    if (!name.trim() || !location.trim()) return false;

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .rpc('check_restaurant_duplicate', {
          check_name: name.trim(),
          check_location: location.trim()
        });

      if (error) {
        console.error('Error checking duplicate:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in duplicate check:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const searchExisting = useCallback(async (name: string, location: string) => {
    if (!name.trim() || !location.trim()) return null;

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .rpc('search_restaurants_case_insensitive', {
          search_name: name.trim(),
          search_location: location.trim()
        });

      if (error) {
        console.error('Error searching restaurants:', error);
        return null;
      }

      return data && Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in restaurant search:', error);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateAndSearch = useCallback(async (name: string, location: string) => {
    const existing = await searchExisting(name, location);
    if (existing) {
      toast({
        title: "Restaurant found",
        description: `Found existing restaurant: ${existing.name} in ${existing.location}`,
      });
    }
    return existing;
  }, [searchExisting, toast]);

  return {
    isValidating,
    checkDuplicate,
    searchExisting,
    validateAndSearch
  };
};
