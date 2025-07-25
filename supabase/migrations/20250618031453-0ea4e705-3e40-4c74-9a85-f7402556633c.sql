
-- Add RLS policies to wine_interactions table to fix 400 errors
-- This will allow both "authenticated" and "admin" JWT roles to access the table

-- Policy for users to manage their own wine interactions
CREATE POLICY "Users can manage their own wine interactions"
  ON public.wine_interactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for admin users to manage all wine interactions
CREATE POLICY "Admins can manage all wine interactions"
  ON public.wine_interactions
  FOR ALL
  USING (public.is_admin(auth.uid()));
