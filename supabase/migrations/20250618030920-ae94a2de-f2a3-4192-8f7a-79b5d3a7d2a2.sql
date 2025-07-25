
-- FIX JWT ROLE CLAIMS - CRITICAL FIX FOR 400 ERRORS
-- The issue is that admin users are getting JWT role "admin" instead of "authenticated"
-- PostgreSQL only has "authenticated" and "anon" roles, not "admin"

-- DROP AND RECREATE the user creation trigger with correct role handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create corrected user creation function that NEVER sets JWT role to admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- CRITICAL: Always use 'subscriber' as the profiles.role initially
  -- Admin status is determined by email check in is_admin() function
  -- This prevents JWT role claims from being set to "admin"
  
  INSERT INTO public.profiles (id, first_name, last_name, email, location, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'location',
    'subscriber'  -- Always start as subscriber, admin determined by email in is_admin()
  );
  
  -- Update to admin role ONLY in the profiles table if needed
  -- This does NOT affect JWT claims
  IF NEW.email = 'kristimayfield@wine-wize.com' THEN
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the admin user has correct setup in profiles table
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'kristimayfield@wine-wize.com';

-- Verify the is_admin function is working correctly
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = user_id LIMIT 1),
    (SELECT email = 'kristimayfield@wine-wize.com' FROM public.profiles WHERE id = user_id LIMIT 1),
    false
  );
$$;
