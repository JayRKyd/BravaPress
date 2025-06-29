-- BravaPress Background Job System Setup
-- This creates tables for job queuing, press release tracking, and monitoring

-- ================================
-- 1. JOBS TABLE (Background Queue)
-- ================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'press_release_submission', 'email_notification', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'retrying'
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  data JSONB NOT NULL, -- Job payload/parameters
  result JSONB, -- Job result data
  error TEXT, -- Error message if failed
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT jobs_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
  CONSTRAINT jobs_attempts_check CHECK (attempts >= 0),
  CONSTRAINT jobs_max_attempts_check CHECK (max_attempts > 0)
);

-- Jobs table indexes for performance
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs (status);
CREATE INDEX IF NOT EXISTS jobs_type_idx ON public.jobs (type);
CREATE INDEX IF NOT EXISTS jobs_scheduled_at_idx ON public.jobs (scheduled_at);
CREATE INDEX IF NOT EXISTS jobs_priority_status_idx ON public.jobs (priority DESC, status, scheduled_at);

-- ========================================
-- 2. PRESS RELEASE SUBMISSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.press_release_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Submission Details
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  industry TEXT,
  location TEXT,
  package_type TEXT DEFAULT 'basic', -- 'basic', 'premium', 'enterprise'
  
  -- Processing Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'payment_pending', 'paid', 'processing', 'submitted', 'completed', 'failed'
  
  -- EINPresswire Results
  einpresswire_order_id TEXT,
  einpresswire_submission_id TEXT,
  einpresswire_confirmation_url TEXT,
  
  -- Payment Info
  payment_amount INTEGER, -- Amount in cents
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  stripe_payment_intent_id TEXT,
  
  -- Metadata
  screenshots JSONB, -- Base64 screenshots for debugging
  error_logs JSONB, -- Error tracking
  processing_logs JSONB, -- Step-by-step processing log
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT submissions_status_check CHECK (status IN ('draft', 'payment_pending', 'paid', 'processing', 'submitted', 'completed', 'failed')),
  CONSTRAINT submissions_payment_status_check CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  CONSTRAINT submissions_package_type_check CHECK (package_type IN ('basic', 'premium', 'enterprise'))
);

-- Submissions table indexes
CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON public.press_release_submissions (user_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON public.press_release_submissions (status);
CREATE INDEX IF NOT EXISTS submissions_created_at_idx ON public.press_release_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS submissions_job_id_idx ON public.press_release_submissions (job_id);

-- ========================================
-- 3. JOB PROCESSING FUNCTIONS
-- ========================================

-- Function to update job timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS jobs_updated_at_trigger ON public.jobs;
CREATE TRIGGER jobs_updated_at_trigger
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS submissions_updated_at_trigger ON public.press_release_submissions;
CREATE TRIGGER submissions_updated_at_trigger
    BEFORE UPDATE ON public.press_release_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get next available job
CREATE OR REPLACE FUNCTION get_next_job()
RETURNS TABLE(
    job_id UUID,
    job_type TEXT,
    job_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    UPDATE public.jobs 
    SET 
        status = 'processing',
        started_at = now(),
        attempts = attempts + 1
    WHERE id = (
        SELECT j.id 
        FROM public.jobs j
        WHERE j.status IN ('pending', 'retrying')
        AND j.scheduled_at <= now()
        AND j.attempts < j.max_attempts
        ORDER BY j.priority DESC, j.scheduled_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING id, type, data;
END;
$$ LANGUAGE plpgsql;

-- Function to mark job as completed
CREATE OR REPLACE FUNCTION complete_job(job_uuid UUID, job_result JSONB DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.jobs
    SET 
        status = 'completed',
        completed_at = now(),
        result = COALESCE(job_result, result)
    WHERE id = job_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to mark job as failed
CREATE OR REPLACE FUNCTION fail_job(job_uuid UUID, error_message TEXT, should_retry BOOLEAN DEFAULT TRUE)
RETURNS BOOLEAN AS $$
DECLARE
    job_record RECORD;
BEGIN
    SELECT * INTO job_record FROM public.jobs WHERE id = job_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if we should retry
    IF should_retry AND job_record.attempts < job_record.max_attempts THEN
        UPDATE public.jobs
        SET 
            status = 'retrying',
            error = error_message,
            scheduled_at = now() + INTERVAL '5 minutes' * job_record.attempts -- Exponential backoff
        WHERE id = job_uuid;
    ELSE
        UPDATE public.jobs
        SET 
            status = 'failed',
            completed_at = now(),
            error = error_message
        WHERE id = job_uuid;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on both tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_release_submissions ENABLE ROW LEVEL SECURITY;

-- Jobs table policies (service role can manage all jobs)
CREATE POLICY "Service role can manage all jobs"
    ON public.jobs FOR ALL
    USING (auth.role() = 'service_role');

-- Press release submissions policies
CREATE POLICY "Users can view their own submissions"
    ON public.press_release_submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
    ON public.press_release_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
    ON public.press_release_submissions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all submissions"
    ON public.press_release_submissions FOR ALL
    USING (auth.role() = 'service_role');

-- ========================================
-- 5. MONITORING VIEWS
-- ========================================

-- Job queue status view
CREATE OR REPLACE VIEW job_queue_status AS
SELECT 
    status,
    type,
    COUNT(*) as count,
    MIN(created_at) as oldest_job,
    MAX(created_at) as newest_job
FROM public.jobs 
GROUP BY status, type
ORDER BY status, type;

-- Recent submissions view
CREATE OR REPLACE VIEW recent_submissions AS
SELECT 
    s.id,
    s.company_name,
    s.title,
    s.status,
    s.package_type,
    s.payment_status,
    s.created_at,
    s.completed_at,
    p.email as user_email
FROM public.press_release_submissions s
JOIN public.profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC
LIMIT 100;

-- System health metrics view
CREATE OR REPLACE VIEW system_health AS
SELECT 
    'jobs' as metric_type,
    'pending' as metric_name,
    COUNT(*) as value
FROM public.jobs WHERE status = 'pending'
UNION ALL
SELECT 
    'jobs' as metric_type,
    'processing' as metric_name,
    COUNT(*) as value
FROM public.jobs WHERE status = 'processing'
UNION ALL
SELECT 
    'jobs' as metric_type,
    'failed' as metric_name,
    COUNT(*) as value
FROM public.jobs WHERE status = 'failed' AND created_at > now() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'submissions' as metric_type,
    'today' as metric_name,
    COUNT(*) as value
FROM public.press_release_submissions WHERE created_at::date = CURRENT_DATE;

-- Grant access to monitoring views
GRANT SELECT ON job_queue_status TO authenticated;
GRANT SELECT ON recent_submissions TO authenticated;
GRANT SELECT ON system_health TO authenticated; 