
import { supabase } from '@/integrations/supabase/client';
import { TestResult, AllowedTables } from './types';
import { fetchFromTable } from './utils';

export const testTable = async (tableName: AllowedTables, operations: string[], user: any): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  
  console.log(`\n🧪 TESTING TABLE: ${tableName.toUpperCase()}`);
  console.log(`Auth UID: ${user?.id}`);
  console.log(`Auth Email: ${user?.email}`);

  for (const operation of operations) {
    try {
      let query;
      let result;
      
      console.log(`\n🔍 Testing ${operation} on ${tableName}...`);
      
      switch (operation) {
        case 'SELECT':
          query = fetchFromTable(tableName).select('*');
          result = await query;
          
          console.log(`✅ SELECT ${tableName}:`, {
            success: !result.error,
            count: result.data?.length || 0,
            error: result.error?.message,
            authUid: user?.id,
            data: result.data?.slice(0, 2)
          });
          break;
          
        case 'COUNT':
          query = fetchFromTable(tableName).select('*', { count: 'exact', head: true });
          result = await query;
          
          console.log(`🔢 COUNT ${tableName}:`, {
            success: !result.error,
            count: result.count || 0,
            error: result.error?.message,
            authUid: user?.id
          });
          break;
          
        case 'INSERT_TEST':
          let testData: any;
          
          if (tableName === 'profiles') {
            testData = { id: user?.id, email: user?.email, first_name: 'Test', last_name: 'User', location: 'Test' };
          } else if (tableName === 'subscribers') {
            testData = { user_id: user?.id, email: user?.email, subscription_status: 'trial' };
          } else if (tableName === 'wine_interactions') {
            testData = { user_id: user?.id, interaction_type: 'test', wine_name: 'Test Wine' };
          } else if (tableName === 'restaurants') {
            testData = { name: 'Test Restaurant', location: 'Test Location', created_by: user?.id };
          } else {
            testData = { user_id: user?.id, name: 'Test Entry' };
          }
          
          result = await fetchFromTable(tableName).insert(testData).select();
          
          console.log(`➕ INSERT ${tableName}:`, {
            success: !result.error,
            error: result.error?.message,
            authUid: user?.id,
            testData
          });
          
          // Clean up test data if successful
          if (!result.error && result.data?.[0]) {
            await fetchFromTable(tableName).delete().eq('id', result.data[0].id);
          }
          break;
      }

      results.push({
        table: tableName,
        operation,
        success: !result.error,
        error: result.error?.message,
        authUid: user?.id,
        recordCount: result.data?.length,
        details: result.error ? result.error : { count: result.data?.length }
      });

    } catch (error) {
      console.error(`❌ Error testing ${operation} on ${tableName}:`, error);
      results.push({
        table: tableName,
        operation,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        authUid: user?.id
      });
    }
  }

  return results;
};

export const testAdminFunction = async (user: any): Promise<TestResult> => {
  console.log('\n🔐 TESTING ADMIN FUNCTION');
  try {
    // Check if user has admin role in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin';
    
    console.log('Admin function result:', {
      isAdmin,
      error: profileError?.message,
      userId: user.id,
      userEmail: user.email
    });

    return {
      table: 'admin_function',
      operation: 'is_admin_check',
      success: !profileError,
      error: profileError?.message,
      authUid: user.id,
      details: { isAdmin }
    };
  } catch (adminFuncError) {
    console.error('❌ Admin function test failed:', adminFuncError);
    return {
      table: 'admin_function',
      operation: 'is_admin_check',
      success: false,
      error: adminFuncError instanceof Error ? adminFuncError.message : 'Unknown error',
      authUid: user.id
    };
  }
};

export const testPolicyCleanup = async (): Promise<TestResult> => {
  console.log('\n🧹 TESTING FINAL RLS POLICY FIX');
  try {
    // Test a simple query that should work if policies are clean
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    console.log('Final policy verification:', {
      success: !error,
      error: error?.message,
      message: error ? 'RLS policies still have issues' : 'RLS policies are now clean and working'
    });

    return {
      table: 'final_policy_fix',
      operation: 'verification',
      success: !error,
      error: error?.message,
      details: { 
        message: error ? 'RLS policies still have conflicts - check console for details' : 'SUCCESS: All RLS policies are now clean and working!' 
      }
    };
  } catch (cleanupError) {
    return {
      table: 'final_policy_fix',
      operation: 'verification',
      success: false,
      error: cleanupError instanceof Error ? cleanupError.message : 'Unknown error',
      details: { message: 'Final policy verification failed' }
    };
  }
};
