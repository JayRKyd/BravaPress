-- ============================================================================
-- MINIMAL ADMIN SETUP - No constraints, no policies, just basics
-- ============================================================================

-- Step 1: Drop existing admin_users table if it has issues
DROP TABLE IF EXISTS admin_users CASCADE;

-- Step 2: Create simple admin_users table (no foreign keys initially)
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add your admin user directly (replace with your UUID)
INSERT INTO admin_users (user_id, role, is_active) 
VALUES ('8e018fbb-471b-4740-9f96-b42cd918c553', 'super_admin', true);

-- Step 4: Grant basic permissions
GRANT ALL ON admin_users TO authenticated;

-- Step 5: Verify it worked
SELECT 'Admin user created successfully!' as result;
SELECT * FROM admin_users; 