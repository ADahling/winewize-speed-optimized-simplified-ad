
-- Complete fix for role column in profiles table
-- Run this manually in your Supabase SQL Editor

DO $$ 
BEGIN
    -- First, check if the role column exists and add it if it doesn't
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='role'
    ) THEN
        -- Add role column with proper constraints
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'subscriber';
        
        -- Add constraint to ensure only valid roles
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('admin', 'subscriber'));
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
        
        RAISE NOTICE 'Role column added successfully';
    ELSE
        RAISE NOTICE 'Role column already exists';
    END IF;
    
    -- Update all existing users to have subscriber role by default
    UPDATE profiles SET role = 'subscriber' WHERE role IS NULL;
    
    -- Set kristimayfield@wine-wize.com as admin (critical step)
    UPDATE profiles SET role = 'admin' 
    WHERE email = 'kristimayfield@wine-wize.com';
    
    -- If kristimayfield@wine-wize.com doesn't exist in profiles, we'll need to handle that
    -- during the next login when ensureUserProfile runs
    
    RAISE NOTICE 'Role assignments completed successfully';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
    -- Don't fail the transaction, just log the error
END $$;

-- Verify the results
SELECT email, role FROM profiles WHERE email = 'kristimayfield@wine-wize.com';
SELECT role, COUNT(*) FROM profiles GROUP BY role;
