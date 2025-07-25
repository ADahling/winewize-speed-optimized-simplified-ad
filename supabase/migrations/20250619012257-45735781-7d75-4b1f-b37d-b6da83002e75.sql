
-- STEP 1: DROP ALL EXISTING POLICIES FROM RESTAURANTS TABLE
DROP POLICY IF EXISTS "restaurants_select_all" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_insert_own" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_update_own_or_admin" ON public.restaurants;
DROP POLICY IF EXISTS "restaurants_delete_own_or_admin" ON public.restaurants;
DROP POLICY IF EXISTS "Authenticated users can insert restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can manage their own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admins can manage all restaurants" ON public.restaurants;

-- STEP 2: DROP ALL EXISTING POLICIES FROM WINE_INTERACTIONS TABLE
DROP POLICY IF EXISTS "Users can manage their own wine interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Admins can manage all wine interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_manage_own" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_admin_manage_all" ON public.wine_interactions;
DROP POLICY IF EXISTS "Allow users to manage their own wine interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Allow admins to manage all wine interactions" ON public.wine_interactions;

-- STEP 3: ENSURE RLS IS ENABLED
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- STEP 4: CREATE CLEAN POLICIES FOR RESTAURANTS TABLE
-- All authenticated users can read all restaurants
CREATE POLICY "restaurants_select_policy" 
ON public.restaurants 
FOR SELECT 
TO authenticated 
USING (true);

-- Any authenticated user can add a restaurant with their user ID
CREATE POLICY "restaurants_insert_policy" 
ON public.restaurants 
FOR INSERT 
TO authenticated 
WITH CHECK (created_by = auth.uid());

-- Only creator or admin can update restaurants
CREATE POLICY "restaurants_update_policy" 
ON public.restaurants 
FOR UPDATE 
TO authenticated 
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Only creator or admin can delete restaurants
CREATE POLICY "restaurants_delete_policy" 
ON public.restaurants 
FOR DELETE 
TO authenticated 
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- STEP 5: CREATE CLEAN POLICIES FOR WINE_INTERACTIONS TABLE
-- Users can manage their own wine interactions
CREATE POLICY "wine_interactions_user_policy" 
ON public.wine_interactions 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Admins can manage all wine interactions
CREATE POLICY "wine_interactions_admin_policy" 
ON public.wine_interactions 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);
