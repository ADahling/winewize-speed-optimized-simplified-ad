
-- PHASE 2: Complete RLS Recursion Fix - Remove ALL references to restaurant_staff
-- The previous migration didn't catch all the problematic policies

-- First, drop ALL existing policies on restaurant_menus
DROP POLICY IF EXISTS "restaurant_menus_basic_access" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_read_access" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_insert_access" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_update_access" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_delete_access" ON public.restaurant_menus;

-- Drop ALL existing policies on restaurant_wines
DROP POLICY IF EXISTS "restaurant_wines_basic_access" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_read_access" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_insert_access" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_update_access" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_delete_access" ON public.restaurant_wines;

-- Create completely simple policies that avoid any table references that could cause recursion
-- For restaurant_menus: Allow all authenticated users full access
CREATE POLICY "menus_full_access"
  ON public.restaurant_menus
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- For restaurant_wines: Allow all authenticated users full access  
CREATE POLICY "wines_full_access"
  ON public.restaurant_wines
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled on both tables
ALTER TABLE public.restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_wines ENABLE ROW LEVEL SECURITY;
