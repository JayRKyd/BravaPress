-- ============================================================================
-- BASIC TABLES SETUP - Run this FIRST
-- Creates the fundamental tables that might be missing
-- ============================================================================

-- 1. CREATE PROFILES TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  website TEXT,
  email_preferences JSONB DEFAULT '{"statusUpdates": true, "distributionReports": true}',
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. CREATE PRESS_RELEASE_SUBMISSIONS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS press_release_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'payment_pending', 'paid', 'processing', 'completed', 'failed', 'refunded')),
  payment_amount DECIMAL(10,2),
  payment_intent_id TEXT,
  stripe_payment_id TEXT,
  
  -- Refund fields
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refunded_by UUID REFERENCES auth.users(id),
  stripe_refund_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_press_release_submissions_user_id ON press_release_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_press_release_submissions_status ON press_release_submissions(status);
CREATE INDEX IF NOT EXISTS idx_press_release_submissions_created_at ON press_release_submissions(created_at);

-- Enable RLS
ALTER TABLE press_release_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own submissions" ON press_release_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions" ON press_release_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions" ON press_release_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. CREATE JOBS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
  submission_id UUID REFERENCES press_release_submissions(id) ON DELETE CASCADE,
  payload JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  error TEXT,
  attempts INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_submission_id ON jobs(submission_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_for ON jobs(scheduled_for);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies (jobs can be accessed by system)
CREATE POLICY "System can manage jobs" ON jobs
  FOR ALL USING (true);

-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS set_timestamp_profiles ON profiles;
CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_press_release_submissions ON press_release_submissions;
CREATE TRIGGER set_timestamp_press_release_submissions
  BEFORE UPDATE ON press_release_submissions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_jobs ON jobs;
CREATE TRIGGER set_timestamp_jobs
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- 5. GRANT PERMISSIONS
-- ============================================================================
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON press_release_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON jobs TO authenticated;

-- ============================================================================
-- BASIC SETUP COMPLETE!
-- ============================================================================
SELECT 'Basic tables setup completed!' as message; 