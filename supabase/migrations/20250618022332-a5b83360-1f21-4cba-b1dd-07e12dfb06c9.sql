
-- FIX MISSING ADMIN POLICIES - Complete the failed comprehensive migration
-- This will restore admin access for kristimayfield@wine-wize.com

-- First, ensure the is_admin function is working properly
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Use email-based admin check as fallback if role system fails
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = user_id),
    (SELECT email = 'kristimayfield@wine-wize.com' FROM public.profiles WHERE id = user_id),
    false
  );
$$;

-- ADD MISSING ADMIN POLICIES FOR PROFILES TABLE
-- The comprehensive migration created user policies but missed admin policies
CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- ADD MISSING INSERT POLICY FOR PROFILES (needed for profile creation)
DROP POLICY IF EXISTS "profiles_insert_user_own" ON public.profiles;
CREATE POLICY "profiles_insert_user_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- VERIFY SUBSCRIBERS TABLE HAS PROPER ADMIN POLICIES
DROP POLICY IF EXISTS "subscribers_admin_all" ON public.subscribers;
CREATE POLICY "subscribers_admin_all"
  ON public.subscribers
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- VERIFY WINE_INTERACTIONS TABLE HAS PROPER ADMIN POLICIES  
DROP POLICY IF EXISTS "wine_interactions_admin_all" ON public.wine_interactions;
CREATE POLICY "wine_interactions_admin_all"
  ON public.wine_interactions
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- ENSURE KRISTIMAYFIELD HAS ADMIN ROLE (safety check)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'kristimayfield@wine-wize.com' AND role != 'admin';
