
-- FIX SITE_ADMIN ROLE RECOGNITION - Support both "admin" and "site_admin" roles
-- Add hardcoded fallbacks for kristimayfield@wine-wize.com

-- Drop and recreate the is_admin function to support both admin and site_admin roles
DROP FUNCTION IF EXISTS public.is_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Multi-layer admin check with hardcoded fallbacks
  SELECT COALESCE(
    -- Check if user has admin or site_admin role in profiles
    (SELECT role IN ('admin', 'site_admin') FROM public.profiles WHERE id = user_id LIMIT 1),
    -- Hardcoded user ID check for kristimayfield@wine-wize.com
    (user_id = '7daa99e0-a34e-4130-8dee-139ac28fdc4c'::uuid),
    -- Email-based fallback check
    (SELECT email = 'kristimayfield@wine-wize.com' FROM public.profiles WHERE id = user_id LIMIT 1),
    false
  );
$$;

-- Ensure kristimayfield@wine-wize.com keeps site_admin role (don't change it to admin)
-- This query will only update if the profile exists and email matches
UPDATE public.profiles 
SET role = 'site_admin' 
WHERE email = 'kristimayfield@wine-wize.com' 
  AND id = '7daa99e0-a34e-4130-8dee-139ac28fdc4c'::uuid
  AND (role IS NULL OR role != 'site_admin');

-- Verify the function works
SELECT public.is_admin('7daa99e0-a34e-4130-8dee-139ac28fdc4c'::uuid) as should_be_true;
