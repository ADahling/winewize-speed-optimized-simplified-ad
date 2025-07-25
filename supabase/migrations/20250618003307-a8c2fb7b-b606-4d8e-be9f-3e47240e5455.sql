
-- ENABLE RLS (required if previously disabled)
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- CLEAN UP: Remove existing conflicting policies
DROP POLICY IF EXISTS "Allow users to manage their own wine interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Allow admins to manage all wine interactions" ON public.wine_interactions;

-- ADD CLEAN POLICIES
CREATE POLICY "Allow users to manage their own wine interactions"
  ON public.wine_interactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all wine interactions"
  ON public.wine_interactions
  FOR ALL
  USING (public.is_admin(auth.uid()));
