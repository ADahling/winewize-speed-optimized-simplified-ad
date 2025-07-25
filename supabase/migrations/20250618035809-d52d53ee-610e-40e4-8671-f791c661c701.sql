
-- CLEANUP: Remove duplicate and conflicting RLS policies
-- This fixes 400 errors caused by policy conflicts, not missing policies

-- PROFILES TABLE: Remove redundant individual policies where ALL policy exists
DROP POLICY IF EXISTS "profiles_user_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;

-- WINE_INTERACTIONS TABLE: Remove redundant individual policies where ALL policy exists
DROP POLICY IF EXISTS "wine_interactions_select_own" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_insert_own" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_update_own" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_delete_own" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_user_access" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_manage_own" ON public.wine_interactions;
DROP POLICY IF EXISTS "wine_interactions_admin_manage_all" ON public.wine_interactions;

-- SUBSCRIBERS TABLE: Remove redundant individual policies where ALL policy exists
DROP POLICY IF EXISTS "subscribers_insert_own" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_select_own" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_manage_own" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_admin_manage_all" ON public.subscribers;

-- WINE_PREFERENCES TABLE: Remove any duplicate policies
DROP POLICY IF EXISTS "wine_preferences_select_own" ON public.wine_preferences;
DROP POLICY IF EXISTS "wine_preferences_insert_own" ON public.wine_preferences;
DROP POLICY IF EXISTS "wine_preferences_update_own" ON public.wine_preferences;

-- USER_WINE_LIBRARY TABLE: Remove any duplicate policies
DROP POLICY IF EXISTS "user_wine_library_select_own" ON public.user_wine_library;
DROP POLICY IF EXISTS "user_wine_library_insert_own" ON public.user_wine_library;

-- FAVORITE_WINES TABLE: Remove any duplicate policies
DROP POLICY IF EXISTS "favorite_wines_select_own" ON public.favorite_wines;
DROP POLICY IF EXISTS "favorite_wines_insert_own" ON public.favorite_wines;
DROP POLICY IF EXISTS "favorite_wines_update_own" ON public.favorite_wines;
