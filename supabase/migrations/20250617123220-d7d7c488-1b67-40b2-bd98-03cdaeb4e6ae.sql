
-- First, let's drop all existing policies on wine_interactions to start fresh
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Admins can view all interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Admins can manage all interactions" ON public.wine_interactions;

-- Create simple, working RLS policies for wine_interactions
CREATE POLICY "Users can view their own interactions" ON public.wine_interactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON public.wine_interactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON public.wine_interactions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON public.wine_interactions
FOR DELETE USING (auth.uid() = user_id);

-- Create admin policies that work correctly
CREATE POLICY "Admins can view all interactions" ON public.wine_interactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage all interactions" ON public.wine_interactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
