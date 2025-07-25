
-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role text DEFAULT 'subscriber' CHECK (role IN ('admin', 'subscriber'));

-- Set kristimayfield@wine-wize.com as admin
UPDATE profiles SET role = 'admin' WHERE email = 'kristimayfield@wine-wize.com';

-- Create an index on the role column for better query performance
CREATE INDEX idx_profiles_role ON profiles(role);
