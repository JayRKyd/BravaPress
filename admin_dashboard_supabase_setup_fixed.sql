-- ============================================================================
-- BRAVAPRESS ADMIN DASHBOARD DATABASE SETUP - FIXED VERSION
-- Run this AFTER running basic_tables_setup.sql
-- ============================================================================

-- 1. CREATE ADMIN USERS TABLE
-- ============================================================================
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- ============================================================================
-- 2. CREATE AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'press_release', 'user', 'job', 'payment', etc.
  resource_id TEXT, -- ID of the resource being acted upon
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- 3. CREATE USER CREDITS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  used_for_submission_id UUID REFERENCES press_release_submissions(id),
  granted_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_is_used ON user_credits(is_used);
CREATE INDEX IF NOT EXISTS idx_user_credits_expires_at ON user_credits(expires_at);

-- ============================================================================
-- 4. CREATE NOTIFICATION PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(user_id)
);

-- ============================================================================
-- 5. CREATE EMAIL QUEUE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  template_name TEXT,
  template_data JSONB DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')) DEFAULT 'pending',
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for email queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient_user_id ON email_queue(recipient_user_id);

-- ============================================================================
-- 6. CREATE RLS POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Admin users policies (only admins can manage admin users)
CREATE POLICY "Admin users can view admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
    )
  );

-- Audit logs policies (admins can view, system can insert)
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- User credits policies
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user credits" ON user_credits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- Notification preferences policies
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Email queue policies (admins only)
CREATE POLICY "Admins can view email queue" ON email_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- ============================================================================
-- 7. CREATE FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
  log_id UUID;
BEGIN
  -- Get admin_users record for current user
  SELECT id INTO admin_id 
  FROM admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'User is not an admin or is inactive';
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (admin_user_id, action, resource_type, resource_id, details)
  VALUES (admin_id, p_action, p_resource_type, p_resource_id, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user's available credits
CREATE OR REPLACE FUNCTION get_user_available_credits(user_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount) 
     FROM user_credits 
     WHERE user_id = user_uuid 
       AND is_used = false 
       AND (expires_at IS NULL OR expires_at > NOW())
    ), 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. CREATE UPDATED_AT TRIGGERS
-- ============================================================================

-- Apply updated_at triggers to tables that need them
DROP TRIGGER IF EXISTS set_timestamp_admin_users ON admin_users;
CREATE TRIGGER set_timestamp_admin_users
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_user_credits ON user_credits;
CREATE TRIGGER set_timestamp_user_credits
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_notification_preferences ON notification_preferences;
CREATE TRIGGER set_timestamp_notification_preferences
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_email_queue ON email_queue;
CREATE TRIGGER set_timestamp_email_queue
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- 9. GRANT PERMISSIONS
-- ============================================================================
-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_credits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_queue TO authenticated;

-- ============================================================================
-- 10. CREATE FIRST ADMIN USER (YOU MUST EDIT THIS!)
-- ============================================================================

-- STEP 1: First, check what users exist in auth.users
SELECT 'Current users in auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- STEP 2: Replace YOUR_EMAIL_HERE with your actual email address
-- Then uncomment and run this block:

/*
DO $$
DECLARE
  admin_user_uuid UUID;
BEGIN
  -- Get the user ID for your email - CHANGE THE EMAIL BELOW!
  SELECT id INTO admin_user_uuid 
  FROM auth.users 
  WHERE email = 'YOUR_EMAIL_HERE'; -- ⚠️ CHANGE THIS TO YOUR EMAIL!
  
  IF admin_user_uuid IS NOT NULL THEN
    -- Insert admin record
    INSERT INTO admin_users (user_id, role, is_active, created_at)
    VALUES (admin_user_uuid, 'super_admin', true, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'super_admin',
      is_active = true,
      updated_at = NOW();
    
    RAISE NOTICE 'Admin user created/updated for user ID: %', admin_user_uuid;
  ELSE
    RAISE NOTICE 'User with that email not found. Please check the email address.';
  END IF;
END $$;
*/

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Verify the setup
SELECT 
  'Admin dashboard setup completed successfully!' as message,
  'New tables created: ' || COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'admin_users', 
    'audit_logs', 
    'user_credits', 
    'notification_preferences', 
    'email_queue'
  ); 