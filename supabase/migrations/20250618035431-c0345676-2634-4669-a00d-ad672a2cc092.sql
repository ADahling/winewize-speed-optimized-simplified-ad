
-- DIAGNOSTIC QUERY: Show ALL current RLS policies on affected tables
-- This will reveal duplicate policies that need to be cleaned up

SELECT schemaname, tablename, policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename IN ('profiles', 'wine_interactions', 'subscribers', 'wine_preferences', 'user_wine_library', 'favorite_wines')
ORDER BY tablename, policyname;
