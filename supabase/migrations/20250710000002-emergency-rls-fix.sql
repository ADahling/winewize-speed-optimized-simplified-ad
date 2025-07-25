-- EMERGENCY FIX: Final wine_interactions RLS policy fix
-- This will resolve the 400 errors that are causing 30+ second delays

-- Drop any existing policies to start clean
DROP POLICY IF EXISTS "wine_interactions_user_access" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_admin_access" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can manage their own wine interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Admins can manage all wine interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_own_access" ON public.wine_interactions;

-- Ensure RLS is enabled
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "wine_interactions_authenticated_access" 
  ON public.wine_interactions 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Admin override policy
CREATE POLICY "wine_interactions_admin_override" 
  ON public.wine_interactions 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'kristimayfield@wine-wize.com')
    )
  );

-- Verify the admin profile exists
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES (
  '7daa99e0-a34e-4130-8dee-139ac28fdc4c'::uuid,
  'kristimayfield@wine-wize.com',
  'Kristi',
  'Mayfield',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  email = 'kristimayfield@wine-wize.com';