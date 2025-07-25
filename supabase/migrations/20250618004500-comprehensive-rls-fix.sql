
-- COMPREHENSIVE FIX FOR ALL RLS ISSUES
-- This migration will clean up all duplicate policies and fix the core problems

-- STEP 1: FORCE DROP ALL EXISTING POLICIES ON ALL AFFECTED TABLES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can view and update their own data" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Enable users to view and update their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles CASCADE;

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "System can insert subscriptions" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Allow users to manage their own subscription data" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Allow admins to manage all subscriptions" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "subscribers_manage_own" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "subscribers_admin_manage_all" ON public.subscribers CASCADE;

DROP POLICY IF EXISTS "Users can view their own interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Admins can view all interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Admins can manage all interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Allow users to manage their own wine interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Allow admins to manage all wine interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "wine_interactions_manage_own" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "wine_interactions_admin_manage_all" ON public.wine_interactions CASCADE;

-- STEP 2: ENSURE RLS IS ENABLED
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- STEP 3: FIX THE ADMIN FUNCTION TO HANDLE MISSING ROLE GRACEFULLY
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

-- STEP 4: CREATE CLEAN, SINGLE POLICIES FOR PROFILES TABLE
CREATE POLICY "profiles_select_user_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_user_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_user_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
  ON public.profiles
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- STEP 5: CREATE CLEAN, SINGLE POLICIES FOR SUBSCRIBERS TABLE
-- Handle both user_id and email matching for flexibility
CREATE POLICY "subscribers_user_manage_own"
  ON public.subscribers
  FOR ALL
  USING (auth.uid() = user_id OR auth.email() = email)
  WITH CHECK (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "subscribers_admin_all"
  ON public.subscribers
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- STEP 6: CREATE CLEAN, SINGLE POLICIES FOR WINE_INTERACTIONS TABLE
CREATE POLICY "wine_interactions_user_manage_own"
  ON public.wine_interactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wine_interactions_admin_all"
  ON public.wine_interactions
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- STEP 7: VERIFY ADMIN USER EXISTS WITH CORRECT ROLE
-- Ensure kristimayfield@wine-wize.com has admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'kristimayfield@wine-wize.com' AND role != 'admin';
