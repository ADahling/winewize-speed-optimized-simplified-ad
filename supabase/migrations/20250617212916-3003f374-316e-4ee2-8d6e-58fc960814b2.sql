
-- STEP 1: Clean up all existing conflicting RLS policies
-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and update their own data" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to view and update their own profile" ON public.profiles;

-- Drop all existing policies on subscribers table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "System can insert subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Drop all existing policies on wine_interactions table (already done in previous migration but ensuring clean state)
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can insert their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Admins can view all interactions" ON public.wine_interactions;
DROP POLICY IF EXISTS "Admins can manage all interactions" ON public.wine_interactions;

-- STEP 2: Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_interactions ENABLE ROW LEVEL SECURITY;

-- STEP 3: Implement clean, non-conflicting RLS policies

-- PROFILES TABLE POLICIES
CREATE POLICY "Allow users to read their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Allow admins to read all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- SUBSCRIBERS TABLE POLICIES
CREATE POLICY "Allow users to manage their own subscription data"
ON public.subscribers
FOR ALL
USING (auth.uid() = user_id OR auth.email() = email)
WITH CHECK (auth.uid() = user_id OR auth.email() = email);

CREATE POLICY "Allow admins to manage all subscriptions"
ON public.subscribers
FOR ALL
USING (public.is_admin(auth.uid()));

-- WINE_INTERACTIONS TABLE POLICIES
CREATE POLICY "Allow users to manage their own wine interactions"
ON public.wine_interactions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all wine interactions"
ON public.wine_interactions
FOR ALL
USING (public.is_admin(auth.uid()));

-- STEP 4: Verify and update the handle_new_user function to ensure it works correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Determine role based on email
  DECLARE
    user_role text := 'subscriber';
  BEGIN
    IF NEW.email = 'kristimayfield@wine-wize.com' THEN
      user_role := 'admin';
    END IF;
    
    -- Insert profile with role
    INSERT INTO public.profiles (id, first_name, last_name, email, location, role)
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data ->> 'first_name', 
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.email,
      NEW.raw_user_meta_data ->> 'location',
      user_role
    );
    RETURN NEW;
  END;
END;
$$;

-- STEP 5: Ensure the trigger exists for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
