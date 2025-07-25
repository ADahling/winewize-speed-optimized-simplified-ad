
-- Add role column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'subscriber' CHECK (role IN ('admin', 'subscriber'));
        
        -- Set kristimayfield@wine-wize.com as admin
        UPDATE profiles SET role = 'admin' WHERE email = 'kristimayfield@wine-wize.com';
        
        -- Create an index on the role column for better query performance
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
    END IF;
END $$;
