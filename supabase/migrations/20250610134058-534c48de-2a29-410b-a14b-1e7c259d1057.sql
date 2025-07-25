
-- Drop all existing functions first
DROP FUNCTION IF EXISTS public.create_or_find_restaurant_by_user(text, text, text, uuid);
DROP FUNCTION IF EXISTS public.search_restaurants_case_insensitive(text, text);
DROP FUNCTION IF EXISTS public.check_restaurant_duplicate(text, text);

-- Rename the 'address' column to 'location' in the restaurants table
ALTER TABLE public.restaurants 
RENAME COLUMN address TO location;

-- Create the updated function with new parameter names
CREATE OR REPLACE FUNCTION public.create_or_find_restaurant_by_user(
  restaurant_name text, 
  restaurant_location text DEFAULT NULL::text, 
  restaurant_cuisine text DEFAULT NULL::text, 
  user_id_param uuid DEFAULT NULL::uuid
)
RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
  restaurant_id uuid;
BEGIN
  -- Try to find existing restaurant by name and location (case insensitive)
  SELECT id INTO restaurant_id
  FROM restaurants
  WHERE 
    LOWER(TRIM(name)) = LOWER(TRIM(restaurant_name))
    AND (
      restaurant_location IS NULL 
      OR location IS NULL 
      OR LOWER(TRIM(location)) = LOWER(TRIM(restaurant_location))
    )
  LIMIT 1;

  -- If not found, create new restaurant
  IF restaurant_id IS NULL THEN
    INSERT INTO restaurants (name, location, cuisine_type, created_by, manual_entry, last_menu_update)
    VALUES (restaurant_name, restaurant_location, restaurant_cuisine, user_id_param, true, now())
    RETURNING id INTO restaurant_id;
  END IF;

  RETURN restaurant_id;
END;
$function$;

-- Create the search function with updated column name
CREATE OR REPLACE FUNCTION public.search_restaurants_case_insensitive(
  search_name text, 
  search_location text DEFAULT NULL::text
)
RETURNS TABLE(
  id uuid, 
  name text, 
  location text, 
  cuisine_type text, 
  last_menu_update timestamp with time zone, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.location,
    r.cuisine_type,
    r.last_menu_update,
    r.created_at,
    r.updated_at
  FROM restaurants r
  WHERE 
    LOWER(TRIM(r.name)) = LOWER(TRIM(search_name))
    AND (
      search_location IS NULL 
      OR LOWER(TRIM(r.location)) = LOWER(TRIM(search_location))
    )
    ORDER BY r.updated_at DESC;
END;
$function$;

-- Create the duplicate check function with updated column name
CREATE OR REPLACE FUNCTION public.check_restaurant_duplicate(
  check_name text, 
  check_location text
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM restaurants
    WHERE 
      LOWER(TRIM(name)) = LOWER(TRIM(check_name))
      AND LOWER(TRIM(location)) = LOWER(TRIM(check_location))
  );
END;
$function$;
