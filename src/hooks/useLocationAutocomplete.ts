
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LocationSuggestion {
  id: number;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  displayName: string;
}

interface UseLocationAutocompleteReturn {
  suggestions: LocationSuggestion[];
  isLoading: boolean;
  error: string | null;
  noResults: boolean;
  searchLocations: (query: string) => Promise<void>;
  clearSuggestions: () => void;
}

// Enhanced cache with better error handling
const suggestionCache = new Map<string, { data: LocationSuggestion[]; timestamp: number; isError: boolean }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for successful requests
const ERROR_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for errors

export const useLocationAutocomplete = (): UseLocationAutocompleteReturn => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);
  const { toast } = useToast();
  
  const currentRequestRef = useRef<string | null>(null);
  const lastSearchRef = useRef<string>('');

  const searchLocations = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setNoResults(false);
      setError(null);
      return;
    }

    const normalizedQuery = query.trim().toLowerCase();
    
    // Prevent duplicate searches
    if (normalizedQuery === lastSearchRef.current) {
      console.log('🔄 Skipping duplicate search for:', query);
      return;
    }
    lastSearchRef.current = normalizedQuery;
    
    // Check cache first
    const cached = suggestionCache.get(normalizedQuery);
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp;
      const maxAge = cached.isError ? ERROR_CACHE_DURATION : CACHE_DURATION;
      
      if (cacheAge < maxAge) {
        console.log('📋 Using cached results for:', query);
        setSuggestions(cached.data);
        setNoResults(cached.data.length === 0);
        setError(cached.isError ? 'Search temporarily unavailable' : null);
        return;
      } else {
        // Remove expired cache entry
        suggestionCache.delete(normalizedQuery);
      }
    }

    console.log('🔍 Enhanced location search for:', query);
    
    const requestId = `${Date.now()}-${Math.random()}`;
    currentRequestRef.current = requestId;
    
    setIsLoading(true);
    setError(null);
    setNoResults(false);

    try {
      console.log('📤 Calling enhanced get-cities function with query:', query);
      
      const { data, error: functionError } = await supabase.functions.invoke('get-cities', {
        body: { query: query.trim() }
      });

      // Check if request was cancelled
      if (currentRequestRef.current !== requestId) {
        console.log('⏹️ Request cancelled for query:', query);
        return;
      }

      console.log('📥 Enhanced function response:', { data, error: functionError });

      if (functionError) {
        console.error('❌ Supabase function error:', functionError);
        throw functionError;
      }

      if (data?.error) {
        console.error('❌ API returned error:', data.error);
        throw new Error(data.error);
      }

      const resultSuggestions = data?.suggestions || [];
      console.log('✅ Enhanced search received suggestions:', resultSuggestions.length, 'results');
      
      // Log top results for debugging
      if (resultSuggestions.length > 0) {
        console.log('🎯 Top 3 enhanced results:', resultSuggestions.slice(0, 3).map((s: any) => s.displayName));
      }
      
      // Cache the results
      suggestionCache.set(normalizedQuery, {
        data: resultSuggestions,
        timestamp: Date.now(),
        isError: false
      });
      
      setSuggestions(resultSuggestions);
      setNoResults(resultSuggestions.length === 0);
      
      if (resultSuggestions.length === 0) {
        console.log('📝 Enhanced search: No results found for query:', query);
      }
      
    } catch (err) {
      if (currentRequestRef.current !== requestId) {
        return;
      }
      
      console.error('❌ Error in enhanced location search:', err);
      
      let errorMessage = 'Failed to fetch location suggestions';
      
      if (err instanceof Error) {
        if (err.message.includes('rate limit') || err.message.includes('429')) {
          errorMessage = 'Search rate limit reached. Please try again in a moment.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Location search timed out. Please try again.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (err.message.includes('API key') || err.message.includes('authentication') || err.message.includes('401') || err.message.includes('403')) {
          errorMessage = 'Location service configuration error.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Location service temporarily unavailable.';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }
      
      console.error('📋 Caching error for query:', normalizedQuery);
      // Cache error with shorter duration
      suggestionCache.set(normalizedQuery, {
        data: [],
        timestamp: Date.now(),
        isError: true
      });
      
      setError(errorMessage);
      setSuggestions([]);
      setNoResults(true);
      
      // Only show toast for serious errors, not for no results
      if (!errorMessage.includes('No cities found')) {
        toast({
          title: "Location Search Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      if (currentRequestRef.current === requestId) {
        currentRequestRef.current = null;
      }
    }
  }, [toast]);

  const clearSuggestions = useCallback(() => {
    console.log('🧹 Clearing enhanced location suggestions');
    
    currentRequestRef.current = null;
    lastSearchRef.current = '';
    setSuggestions([]);
    setError(null);
    setIsLoading(false);
    setNoResults(false);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    noResults,
    searchLocations,
    clearSuggestions
  };
};
