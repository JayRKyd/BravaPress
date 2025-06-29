-- ============================================================================
-- SIMPLE ADMIN USER CREATION SCRIPT
-- Run this to create your admin account safely
-- ============================================================================

-- STEP 1: Check what users exist in auth.users
SELECT 'Current users in your database:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- STEP 2: Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support')) DEFAULT 'admin',
  permissions JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Ensure one admin record per user
  UNIQUE(user_id)
);

-- STEP 3: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;

-- STEP 4: Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create RLS policies
DROP POLICY IF EXISTS "Admin users can view admin_users" ON admin_users;
CREATE POLICY "Admin users can view admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

DROP POLICY IF EXISTS "Super admins can manage admin_users" ON admin_users;
CREATE POLICY "Super admins can manage admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
    )
  );

-- ============================================================================
-- STEP 6: NOW MANUALLY ADD YOUR ADMIN USER
-- After seeing the user list above, copy the ID of your user and paste it below
-- ============================================================================

-- REPLACE 'YOUR_USER_ID_HERE' with the actual UUID from the query above
-- Example: INSERT INTO admin_users (user_id, role, is_active) 
--          VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'super_admin', true);

-- UNCOMMENT AND EDIT THE LINE BELOW:
-- INSERT INTO admin_users (user_id, role, is_active) 
-- VALUES ('YOUR_USER_ID_HERE', 'super_admin', true)
-- ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', is_active = true;

SELECT 'Admin user table ready! Now uncomment and edit the INSERT statement above with your user ID.' as next_step; 