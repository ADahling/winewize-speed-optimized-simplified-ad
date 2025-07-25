-- CRITICAL DATABASE SCHEMA FIX
-- Add missing 'notes' column to wine_interactions table to resolve 400 errors

-- Add the notes column that's being referenced in the code
ALTER TABLE public.wine_interactions 
ADD COLUMN IF NOT EXISTS notes text;

-- Update the emergency RLS policies to be even more explicit
DROP POLICY IF EXISTS "wine_interactions_authenticated_access" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_admin_override" ON public.wine_interactions;

-- Create ultra-simple policies that work for all authenticated users
CREATE POLICY "wine_interactions_user_policy" 
  ON public.wine_interactions 
  FOR ALL 
  TO authenticated 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

-- Create admin policy that works
CREATE POLICY "wine_interactions_admin_policy" 
  ON public.wine_interactions 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Ensure admin profile is correct
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'kristimayfield@wine-wize.com';

-- Grant necessary permissions
GRANT ALL ON public.wine_interactions TO authenticated;