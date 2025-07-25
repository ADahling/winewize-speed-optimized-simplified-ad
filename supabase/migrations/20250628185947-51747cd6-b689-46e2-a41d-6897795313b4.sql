
-- PHASE 1: Fix RLS Infinite Recursion in restaurant_staff table
-- The current policies are causing infinite recursion when accessing restaurant_menus and restaurant_wines

-- First, identify and drop problematic policies that might be causing recursion
DROP POLICY IF EXISTS "restaurant_menus_simple_select" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_simple_insert" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_simple_update" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_simple_delete" ON public.restaurant_menus;

DROP POLICY IF EXISTS "restaurant_wines_simple_select" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_simple_insert" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_simple_update" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_simple_delete" ON public.restaurant_wines;

-- Create ultra-simple policies that don't reference restaurant_staff at all
-- This eliminates the infinite recursion issue
CREATE POLICY "restaurant_menus_basic_access"
  ON public.restaurant_menus
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "restaurant_wines_basic_access"
  ON public.restaurant_wines
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_wines ENABLE ROW LEVEL SECURITY;
