
-- DEFINITIVE CLEANUP OF ALL DUPLICATE AND CONFLICTING RLS POLICIES
-- This will remove the exact duplicates and conflicts causing the 400 errors

-- STEP 1: DROP ALL EXISTING POLICIES FROM ALL THREE TABLES
-- Force drop everything to start completely clean
DROP POLICY IF EXISTS "profiles_select_user_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_user_own" ON public.profiles; 
DROP POLICY IF EXISTS "profiles_update_user_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;

DROP POLICY IF EXISTS "subscribers_user_manage_own" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_admin_all" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_manage_own" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_admin_manage_all" ON public.subscribers;

DROP POLICY IF EXISTS "wine_interactions_user_manage_own" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_admin_all" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_manage_own" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_admin_manage_all" ON public.wine_interactions;

-- STEP 2: CREATE ONLY ONE CLEAN SET OF POLICIES PER TABLE
-- PROFILES TABLE: One admin policy + separate user policies for each operation
CREATE POLICY "profiles_admin_access"
  ON public.profiles
  FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "profiles_user_select"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_user_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_user_update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- SUBSCRIBERS TABLE: One admin policy + one user policy
CREATE POLICY "subscribers_admin_access"
  ON public.subscribers
  FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "subscribers_user_access"
  ON public.subscribers
  FOR ALL
  USING (auth.uid() = user_id OR auth.email() = email)
  WITH CHECK (auth.uid() = user_id OR auth.email() = email);

-- WINE_INTERACTIONS TABLE: One admin policy + one user policy
CREATE POLICY "wine_interactions_admin_access"
  ON public.wine_interactions
  FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "wine_interactions_user_access"
  ON public.wine_interactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
