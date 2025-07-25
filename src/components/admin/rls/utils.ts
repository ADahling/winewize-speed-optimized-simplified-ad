
import { supabase } from '@/integrations/supabase/client';
import { AllowedTables } from './types';

// Type-safe helper function for dynamic table queries
export const fetchFromTable = (tableName: AllowedTables) => {
  return supabase.from(tableName);
};

export const logAuthContext = (user: any) => {
  console.log('=== AUTH CONTEXT FOR RLS TESTING ===');
  console.log('Current user ID:', user?.id);
  console.log('Current user email:', user?.email);
  console.log('Current user metadata:', user?.user_metadata);
  console.log('Session info:', user ? 'authenticated' : 'not authenticated');
  console.log('========================================');
};
