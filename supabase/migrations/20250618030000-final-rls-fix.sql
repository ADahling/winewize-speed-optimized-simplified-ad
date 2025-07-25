
-- FINAL COMPREHENSIVE RLS FIX
-- This migration will completely reset all RLS policies and create clean, working ones

-- STEP 1: DROP ALL EXISTING POLICIES (COMPREHENSIVE CLEANUP)
DO $$ 
DECLARE
    pol_name text;
BEGIN
    -- Drop all policies on profiles table
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol_name);
    END LOOP;
    
    -- Drop all policies on subscribers table
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'subscribers' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscribers', pol_name);
    END LOOP;
    
    -- Drop all policies on wine_interactions table
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'wine_interactions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.wine_interactions', pol_name);
    END LOOP;
END $$;

-- STEP 2: ENSURE RLS IS ENABLED
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- STEP 3: RECREATE WORKING is_admin FUNCTION
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

-- STEP 4: CREATE SIMPLE, WORKING POLICIES FOR PROFILES
CREATE POLICY "profiles_select_own" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" 
  ON public.profiles 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- STEP 5: CREATE SIMPLE, WORKING POLICIES FOR SUBSCRIBERS
CREATE POLICY "subscribers_own_access" 
  ON public.subscribers 
  FOR ALL 
  USING (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "subscribers_admin_access" 
  ON public.subscribers 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- STEP 6: CREATE SIMPLE, WORKING POLICIES FOR WINE_INTERACTIONS
CREATE POLICY "wine_interactions_own_access" 
  ON public.wine_interactions 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "wine_interactions_admin_access" 
  ON public.wine_interactions 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- STEP 7: VERIFY ADMIN USER HAS CORRECT ROLE
INSERT INTO public.profiles (id, email, first_name, last_name, location, role)
SELECT 
  '7daa99e0-a34e-4130-8dee-139ac28fdc4c'::uuid,
  'kristimayfield@wine-wize.com',
  'Kristi',
  'Mayfield',
  'Default',
  'admin'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  email = 'kristimayfield@wine-wize.com';
