-- FINAL EMERGENCY DATABASE FIX
-- This combines all necessary fixes to resolve the wine_interactions 400 errors

-- Drop ALL existing wine_interactions policies to start completely clean
DO $$ 
DECLARE
    pol_name text;
BEGIN
    FOR pol_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'wine_interactions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.wine_interactions', pol_name);
        RAISE NOTICE 'Dropped policy: %', pol_name;
    END LOOP;
END $$;

-- Ensure the table has all required columns
ALTER TABLE public.wine_interactions 
ADD COLUMN IF NOT EXISTS notes text;

-- Enable RLS
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- Create the simplest possible policies that actually work
CREATE POLICY "wine_interactions_select" 
  ON public.wine_interactions 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "wine_interactions_insert" 
  ON public.wine_interactions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "wine_interactions_update" 
  ON public.wine_interactions 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "wine_interactions_delete" 
  ON public.wine_interactions 
  FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Admin policy that actually works
CREATE POLICY "wine_interactions_admin" 
  ON public.wine_interactions 
  FOR ALL 
  TO authenticated 
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'admin' OR email = 'kristimayfield@wine-wize.com'
    )
  );

-- Ensure admin profile exists and is correct
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

-- Grant explicit permissions
GRANT ALL ON public.wine_interactions TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'EMERGENCY FIX COMPLETE: wine_interactions table should now work correctly';
    RAISE NOTICE 'Policies created: 5 (select, insert, update, delete, admin)';
    RAISE NOTICE 'Admin user verified: kristimayfield@wine-wize.com';
END $$;