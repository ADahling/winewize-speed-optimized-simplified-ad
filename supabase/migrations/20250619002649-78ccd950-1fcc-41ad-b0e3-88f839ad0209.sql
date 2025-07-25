
-- First, ensure RLS is enabled on restaurants table
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view all restaurants (needed for search functionality)
DROP POLICY IF EXISTS restaurants_select_all ON public.restaurants;
CREATE POLICY restaurants_select_all
ON public.restaurants
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert restaurants with their user ID
DROP POLICY IF EXISTS restaurants_insert_own ON public.restaurants;
CREATE POLICY restaurants_insert_own
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Allow users to update restaurants they created, or admins to update any
DROP POLICY IF EXISTS restaurants_update_own_or_admin ON public.restaurants;
CREATE POLICY restaurants_update_own_or_admin
ON public.restaurants
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (created_by = auth.uid() OR public.is_admin(auth.uid()));

-- Allow users to delete restaurants they created, or admins to delete any
DROP POLICY IF EXISTS restaurants_delete_own_or_admin ON public.restaurants;
CREATE POLICY restaurants_delete_own_or_admin
ON public.restaurants
FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin(auth.uid()));
