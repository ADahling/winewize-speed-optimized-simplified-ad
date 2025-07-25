
-- Drop the conflicting policy that's causing the 400 error
DROP POLICY IF EXISTS "Users can view and update their own data" ON public.profiles;

-- Also drop any other potentially conflicting policies with ALL command
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to view and update their own profile" ON public.profiles;
