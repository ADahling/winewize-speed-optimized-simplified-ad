
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "System can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Admins can view all interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Admins can manage all interactions" ON public.wine_interactions;

-- Create or replace the admin check function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (public.is_admin(auth.uid()));

-- Create RLS policies for subscribers table
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE USING (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "Admins can view all subscriptions" ON public.subscribers
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all subscriptions" ON public.subscribers
FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert subscriptions" ON public.subscribers
FOR INSERT WITH CHECK (true);

-- Create RLS policies for wine_interactions table
CREATE POLICY "Users can view their own interactions" ON public.wine_interactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON public.wine_interactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON public.wine_interactions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON public.wine_interactions
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all interactions" ON public.wine_interactions
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all interactions" ON public.wine_interactions
FOR ALL USING (public.is_admin(auth.uid()));
