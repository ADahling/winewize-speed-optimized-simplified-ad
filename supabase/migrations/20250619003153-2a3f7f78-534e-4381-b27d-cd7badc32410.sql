
-- Remove the duplicate INSERT policy that's causing the conflict
DROP POLICY IF EXISTS "Authenticated users can insert restaurants" ON public.restaurants;
