
-- STEP 1: FORCE DROP ALL POLICIES FROM PROFILES TABLE
-- Using CASCADE to ensure complete removal of any hidden or conflicting policies
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

-- STEP 2: VERIFY RLS IS ENABLED
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 3: CREATE ONLY THE ESSENTIAL POLICIES (NO DUPLICATES)
-- Policy 1: Users can SELECT their own profile
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can INSERT their own profile
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can UPDATE their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy 4: Admins can SELECT all profiles
CREATE POLICY "profiles_admin_select_all"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- STEP 4: CLEAN UP ANY REMAINING DUPLICATE POLICIES ON OTHER TABLES
-- Clean subscribers table policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "System can insert subscriptions" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Allow users to manage their own subscription data" ON public.subscribers CASCADE;
DROP POLICY IF EXISTS "Allow admins to manage all subscriptions" ON public.subscribers CASCADE;

-- Recreate clean subscribers policies
CREATE POLICY "subscribers_manage_own"
ON public.subscribers
FOR ALL
USING (auth.uid() = user_id OR auth.email() = email)
WITH CHECK (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "subscribers_admin_manage_all"
ON public.subscribers
FOR ALL
USING (public.is_admin(auth.uid()));

-- Clean wine_interactions table policies
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Admins can view all interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Admins can manage all interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Allow users to manage their own wine interactions" ON public.wine_interactions CASCADE;
DROP POLICY IF EXISTS "Allow admins to manage all wine interactions" ON public.wine_interactions CASCADE;

-- Recreate clean wine_interactions policies
CREATE POLICY "wine_interactions_manage_own"
ON public.wine_interactions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wine_interactions_admin_manage_all"
ON public.wine_interactions
FOR ALL
USING (public.is_admin(auth.uid()));
