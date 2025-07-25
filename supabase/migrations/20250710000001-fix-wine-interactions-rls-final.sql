-- CRITICAL FIX: Clean up duplicate RLS policies and fix wine_interactions access
-- This addresses the 400 errors causing 30+ second processing delays

-- STEP 1: Drop ALL existing policies on wine_interactions (prevent duplicates)
DO $$ 
DECLARE
    pol_name text;
BEGIN
    -- Drop all existing policies on wine_interactions table
    FOR pol_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'wine_interactions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.wine_interactions', pol_name);
        RAISE NOTICE 'Dropped policy: %', pol_name;
    END LOOP;
END $$;

-- STEP 2: Ensure RLS is enabled
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- STEP 3: Ensure is_admin function exists and works correctly
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

-- STEP 4: Create ONLY the essential policies (no duplicates)
-- Policy 1: Users can manage their own wine interactions
CREATE POLICY "wine_interactions_user_access" 
  ON public.wine_interactions 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Admins can manage all wine interactions  
CREATE POLICY "wine_interactions_admin_access" 
  ON public.wine_interactions 
  FOR ALL 
  TO authenticated 
  USING (public.is_admin(auth.uid()));

-- STEP 5: Ensure admin user profile exists with correct role
INSERT INTO public.profiles (id, email, first_name, last_name, location, role)
VALUES (
  '7daa99e0-a34e-4130-8dee-139ac28fdc4c'::uuid,
  'kristimayfield@wine-wize.com',
  'Kristi',
  'Mayfield',
  'Default',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  email = 'kristimayfield@wine-wize.com';

-- STEP 6: Test admin access (this will show in logs if successful)
DO $$
DECLARE
    admin_check boolean;
    profile_check record;
BEGIN
    -- Test is_admin function
    SELECT public.is_admin('7daa99e0-a34e-4130-8dee-139ac28fdc4c'::uuid) INTO admin_check;
    RAISE NOTICE 'Admin check result: %', admin_check;
    
    -- Check profile exists
    SELECT id, email, role INTO profile_check 
    FROM public.profiles 
    WHERE id = '7daa99e0-a34e-4130-8dee-139ac28fdc4c'::uuid;
    
    RAISE NOTICE 'Profile check - ID: %, Email: %, Role: %', 
        profile_check.id, profile_check.email, profile_check.role;
END $$;

-- STEP 7: Verify policies are created correctly
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'wine_interactions' AND schemaname = 'public';
    
    RAISE NOTICE 'Total wine_interactions policies created: %', policy_count;
    
    -- List all policies for verification
    FOR pol_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'wine_interactions' AND schemaname = 'public'
    LOOP
        RAISE NOTICE 'Active policy: %', pol_name;
    END LOOP;
END $$;