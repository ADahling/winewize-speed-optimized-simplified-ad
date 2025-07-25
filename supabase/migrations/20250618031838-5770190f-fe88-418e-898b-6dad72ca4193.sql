
-- Add RLS policies to profiles table to fix 400 errors for users with JWT role "admin"
-- This will allow both "authenticated" and "admin" JWT roles to access the table

-- Policy for users to view and update their own profile
CREATE POLICY "Users can manage their own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for admin users to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy for admin users to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()));
