
-- CORRECTED COMPREHENSIVE DATA MANAGEMENT PLAN
-- Fix Schema Inconsistencies: Roles & Subscription Logic

-- First, drop the overly permissive simple policies from the previous migration
DROP POLICY IF EXISTS "restaurant_menus_simple_select" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_simple_insert" ON public.restaurant_menus; 
DROP POLICY IF EXISTS "restaurant_menus_simple_update" ON public.restaurant_menus;
DROP POLICY IF EXISTS "restaurant_menus_simple_delete" ON public.restaurant_menus;

DROP POLICY IF EXISTS "restaurant_wines_simple_select" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_simple_insert" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_simple_update" ON public.restaurant_wines;
DROP POLICY IF EXISTS "restaurant_wines_simple_delete" ON public.restaurant_wines;

-- Add ownership and lifecycle columns to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS ownership_status text DEFAULT 'active' CHECK (ownership_status IN ('active', 'at-risk', 'orphaned', 'deleted')),
ADD COLUMN IF NOT EXISTS last_activity_check timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS ownership_transferred_at timestamp with time zone;

-- CORRECTED Security Definer Functions (using proper role values)
CREATE OR REPLACE FUNCTION public.is_site_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'site_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_restaurant_admin(user_id uuid, restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_staff 
    WHERE user_id = user_id 
    AND restaurant_id = restaurant_id 
    AND role = 'rest_admin' 
    AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_original_creator(user_id uuid, restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants 
    WHERE id = restaurant_id 
    AND created_by = user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_restaurant_admin(restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_staff 
    WHERE restaurant_id = restaurant_id 
    AND role = 'rest_admin' 
    AND status = 'active'
  );
$$;

-- CORRECTED subscription check function (uses subscribers table as source of truth)
CREATE OR REPLACE FUNCTION public.user_has_active_subscription(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE 
    -- Check subscribers table first (paid subscriptions)
    WHEN EXISTS (
      SELECT 1 FROM public.subscribers 
      WHERE user_id = user_has_active_subscription.user_id 
      AND subscribed = true 
      AND (subscription_end IS NULL OR subscription_end > now())
    ) THEN true
    -- Fallback to profiles trial status
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = user_has_active_subscription.user_id 
      AND subscription_status = 'trial' 
      AND trial_end_date > now()
    ) THEN true
    ELSE false
  END;
$$;

-- CORRECTED RLS POLICIES FOR RESTAURANT_MENUS
-- Everyone can READ (preserves import/pairing workflow)
CREATE POLICY "restaurant_menus_read_access"
ON public.restaurant_menus
FOR SELECT
TO authenticated
USING (is_active = true);

-- INSERT: Site admin, restaurant admin, original creator (if no admin exists)
CREATE POLICY "restaurant_menus_insert_access"
ON public.restaurant_menus
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_site_admin(auth.uid()) OR
  public.is_restaurant_admin(auth.uid(), restaurant_id) OR
  (public.is_original_creator(auth.uid(), restaurant_id) AND NOT public.has_restaurant_admin(restaurant_id))
);

-- UPDATE/DELETE: Site admin, restaurant admin, or original creator (if no admin exists)
CREATE POLICY "restaurant_menus_update_access"
ON public.restaurant_menus
FOR UPDATE
TO authenticated
USING (
  public.is_site_admin(auth.uid()) OR
  public.is_restaurant_admin(auth.uid(), restaurant_id) OR
  (public.is_original_creator(auth.uid(), restaurant_id) AND NOT public.has_restaurant_admin(restaurant_id))
);

CREATE POLICY "restaurant_menus_delete_access"
ON public.restaurant_menus
FOR DELETE
TO authenticated
USING (
  public.is_site_admin(auth.uid()) OR
  public.is_restaurant_admin(auth.uid(), restaurant_id) OR
  (public.is_original_creator(auth.uid(), restaurant_id) AND NOT public.has_restaurant_admin(restaurant_id))
);

-- CORRECTED RLS POLICIES FOR RESTAURANT_WINES
-- Everyone can READ (preserves import/pairing workflow)
CREATE POLICY "restaurant_wines_read_access"
ON public.restaurant_wines
FOR SELECT
TO authenticated
USING (is_active = true);

-- INSERT: Site admin, restaurant admin, original creator (if no admin exists)
CREATE POLICY "restaurant_wines_insert_access"
ON public.restaurant_wines
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_site_admin(auth.uid()) OR
  public.is_restaurant_admin(auth.uid(), restaurant_id) OR
  (public.is_original_creator(auth.uid(), restaurant_id) AND NOT public.has_restaurant_admin(restaurant_id))
);

-- UPDATE/DELETE: Site admin, restaurant admin, or original creator (if no admin exists)
CREATE POLICY "restaurant_wines_update_access"
ON public.restaurant_wines
FOR UPDATE
TO authenticated
USING (
  public.is_site_admin(auth.uid()) OR
  public.is_restaurant_admin(auth.uid(), restaurant_id) OR
  (public.is_original_creator(auth.uid(), restaurant_id) AND NOT public.has_restaurant_admin(restaurant_id))
);

CREATE POLICY "restaurant_wines_delete_access"
ON public.restaurant_wines
FOR DELETE
TO authenticated
USING (
  public.is_site_admin(auth.uid()) OR
  public.is_restaurant_admin(auth.uid(), restaurant_id) OR
  (public.is_original_creator(auth.uid(), restaurant_id) AND NOT public.has_restaurant_admin(restaurant_id))
);

-- DATA LIFECYCLE MANAGEMENT FUNCTIONS (CORRECTED)

-- Function to identify at-risk restaurants (owner inactive for 30+ days)
CREATE OR REPLACE FUNCTION public.identify_at_risk_restaurants()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.restaurants 
  SET 
    ownership_status = 'at-risk',
    last_activity_check = now()
  WHERE 
    ownership_status = 'active'
    AND NOT public.user_has_active_subscription(created_by)
    AND updated_at < now() - interval '30 days'
    AND NOT public.has_restaurant_admin(id);
END;
$$;

-- Function to mark restaurants as orphaned (inactive for 90+ days)
CREATE OR REPLACE FUNCTION public.mark_orphaned_restaurants()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.restaurants 
  SET 
    ownership_status = 'orphaned',
    last_activity_check = now()
  WHERE 
    ownership_status = 'at-risk'
    AND NOT public.user_has_active_subscription(created_by)
    AND updated_at < now() - interval '90 days'
    AND NOT public.has_restaurant_admin(id);
END;
$$;

-- Function to allow claiming orphaned restaurants
CREATE OR REPLACE FUNCTION public.claim_orphaned_restaurant(restaurant_id uuid, new_owner_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  restaurant_status text;
BEGIN
  -- Check if restaurant is orphaned and claimer has active subscription
  SELECT ownership_status INTO restaurant_status
  FROM public.restaurants
  WHERE id = restaurant_id;
  
  IF restaurant_status = 'orphaned' AND public.user_has_active_subscription(new_owner_id) THEN
    -- Transfer ownership
    UPDATE public.restaurants
    SET 
      created_by = new_owner_id,
      ownership_status = 'active',
      ownership_transferred_at = now(),
      updated_at = now()
    WHERE id = restaurant_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to clean up old inactive data (after 12 months)
CREATE OR REPLACE FUNCTION public.cleanup_old_restaurant_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Soft delete old menu items from orphaned restaurants
  UPDATE public.restaurant_menus
  SET is_active = false
  WHERE 
    is_active = true
    AND restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE ownership_status = 'orphaned' 
      AND last_activity_check < now() - interval '12 months'
    );
    
  -- Soft delete old wine items from orphaned restaurants
  UPDATE public.restaurant_wines
  SET is_active = false
  WHERE 
    is_active = true
    AND restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE ownership_status = 'orphaned' 
      AND last_activity_check < now() - interval '12 months'
    );
    
  -- Mark restaurants for deletion
  UPDATE public.restaurants
  SET ownership_status = 'deleted'
  WHERE 
    ownership_status = 'orphaned'
    AND last_activity_check < now() - interval '12 months';
END;
$$;

-- Function to hard delete very old data (after 15 months)
CREATE OR REPLACE FUNCTION public.hard_delete_old_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Hard delete menu items
  DELETE FROM public.restaurant_menus
  WHERE 
    is_active = false
    AND updated_at < now() - interval '15 months';
    
  -- Hard delete wine items
  DELETE FROM public.restaurant_wines
  WHERE 
    is_active = false
    AND updated_at < now() - interval '15 months';
    
  -- Hard delete restaurants
  DELETE FROM public.restaurants
  WHERE 
    ownership_status = 'deleted'
    AND last_activity_check < now() - interval '15 months';
END;
$$;

-- Create audit log table for ownership changes
CREATE TABLE IF NOT EXISTS public.restaurant_ownership_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  old_owner_id uuid,
  new_owner_id uuid,
  change_type text NOT NULL CHECK (change_type IN ('created', 'transferred', 'claimed', 'admin_assigned')),
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  notes text
);

-- Enable RLS on audit log
ALTER TABLE public.restaurant_ownership_log ENABLE ROW LEVEL SECURITY;

-- Only site admins can view audit logs
CREATE POLICY "audit_log_site_admin_only"
ON public.restaurant_ownership_log
FOR ALL
TO authenticated
USING (public.is_site_admin(auth.uid()));

-- Trigger to log ownership changes
CREATE OR REPLACE FUNCTION public.log_ownership_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.restaurant_ownership_log (
      restaurant_id, new_owner_id, change_type, changed_by
    ) VALUES (
      NEW.id, NEW.created_by, 'created', NEW.created_by
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.created_by != NEW.created_by THEN
    INSERT INTO public.restaurant_ownership_log (
      restaurant_id, old_owner_id, new_owner_id, change_type, changed_by
    ) VALUES (
      NEW.id, OLD.created_by, NEW.created_by, 'transferred', auth.uid()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for ownership logging
DROP TRIGGER IF EXISTS restaurant_ownership_change_trigger ON public.restaurants;
CREATE TRIGGER restaurant_ownership_change_trigger
  AFTER INSERT OR UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ownership_change();

-- Ensure RLS is enabled
ALTER TABLE public.restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_wines ENABLE ROW LEVEL SECURITY;
