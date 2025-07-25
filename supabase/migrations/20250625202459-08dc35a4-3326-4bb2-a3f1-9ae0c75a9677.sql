
-- Add missing columns to existing tables to match code expectations

-- Add missing columns to restaurants table
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS last_menu_update TIMESTAMP WITH TIME ZONE;

-- Add missing columns to profiles table  
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Add missing columns to wine_preferences table
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS white_wine_rank INTEGER DEFAULT 1;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS red_wine_rank INTEGER DEFAULT 1;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS rose_wine_rank INTEGER DEFAULT 1;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS sparkling_wine_rank INTEGER DEFAULT 1;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS sweetness TEXT;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS acidity TEXT;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS alcohol TEXT;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS tannin TEXT;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS ww_white_style TEXT;
ALTER TABLE public.wine_preferences ADD COLUMN IF NOT EXISTS ww_red_style TEXT;

-- Add missing columns to user_wine_library table
ALTER TABLE public.user_wine_library ADD COLUMN IF NOT EXISTS wine_style TEXT;

-- Add missing columns to wine_rating_reminders table
ALTER TABLE public.wine_rating_reminders ADD COLUMN IF NOT EXISTS wine_library_id UUID REFERENCES public.user_wine_library(id);
ALTER TABLE public.wine_rating_reminders ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.wine_rating_reminders ADD COLUMN IF NOT EXISTS sent BOOLEAN DEFAULT false;

-- Add missing columns to restaurant_menus table
ALTER TABLE public.restaurant_menus ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to restaurant_wines table  
ALTER TABLE public.restaurant_wines ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create database functions that the code expects
CREATE OR REPLACE FUNCTION public.check_restaurant_duplicate(check_name TEXT, check_location TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.restaurants 
    WHERE LOWER(name) = LOWER(check_name) 
    AND LOWER(location) = LOWER(check_location)
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.search_restaurants_case_insensitive(search_name TEXT, search_location TEXT)
RETURNS TABLE(id UUID, name TEXT, location TEXT, cuisine_type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.location, r.cuisine_type
  FROM public.restaurants r
  WHERE LOWER(r.name) = LOWER(search_name) 
  AND LOWER(r.location) = LOWER(search_location)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
