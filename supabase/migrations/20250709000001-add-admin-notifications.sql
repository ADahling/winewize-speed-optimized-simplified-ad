-- Add admin notifications to user creation trigger
-- This will call the notify-admin-new-user edge function when users sign up

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated user creation function with admin notifications
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  notification_result text;
BEGIN
  -- CRITICAL: Always use 'subscriber' as the profiles.role initially
  -- Admin status is determined by email check in is_admin() function
  -- This prevents JWT role claims from being set to "admin"
  
  INSERT INTO public.profiles (id, first_name, last_name, email, location, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'location',
    'subscriber'  -- Always start as subscriber, admin determined by email in is_admin()
  );
  
  -- Update to admin role ONLY in the profiles table if needed
  -- This does NOT affect JWT claims
  IF NEW.email = 'kristimayfield@wine-wize.com' THEN
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE id = NEW.id;
  END IF;
  
  -- Send admin notification (non-blocking)
  BEGIN
    SELECT current_setting('app.supabase_url', true) INTO supabase_url;
    SELECT current_setting('app.service_role_key', true) INTO service_role_key;
    
    -- Call the admin notification function
    SELECT net.http_post(
      url := coalesce(supabase_url, 'https://kkkoepjiwdlchkkrvmub.supabase.co') || '/functions/v1/notify-admin-new-user',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(service_role_key, current_setting('app.service_role_key', true))
      ),
      body := jsonb_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'first_name', NEW.raw_user_meta_data ->> 'first_name',
        'last_name', NEW.raw_user_meta_data ->> 'last_name',
        'location', NEW.raw_user_meta_data ->> 'location'
      )
    ) INTO notification_result;
    
    -- Log success (don't fail if notification fails)
    RAISE LOG 'Admin notification sent for user %', NEW.email;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Failed to send admin notification for user %: %', NEW.email, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the admin user has correct setup in profiles table
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'kristimayfield@wine-wize.com';