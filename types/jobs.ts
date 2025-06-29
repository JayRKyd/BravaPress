// Background Job System Types for BravaPress

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
export type JobType = 'press_release_submission' | 'email_notification' | 'cleanup' | 'monitoring';

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: number;
  data: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  attempts: number;
  max_attempts: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = 'draft' | 'payment_pending' | 'paid' | 'processing' | 'submitted' | 'completed' | 'failed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PackageType = 'basic' | 'premium' | 'enterprise';

export interface PressReleaseSubmission {
  id: string;
  user_id: string;
  job_id?: string;
  
  // Submission Details
  title: string;
  content: string;
  summary: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website_url?: string;
  industry: string;
  location: string;
  package_type: PackageType;
  
  // Processing Status
  status: SubmissionStatus;
  
  // EINPresswire Results
  einpresswire_order_id?: string;
  einpresswire_submission_id?: string;
  einpresswire_confirmation_url?: string;
  
  // Payment Info
  payment_amount?: number; // in cents
  payment_status: PaymentStatus;
  stripe_payment_intent_id?: string;
  
  // Metadata
  screenshots?: string[]; // Base64 screenshots
  error_logs?: Record<string, any>;
  processing_logs?: Array<{
    timestamp: string;
    step: string;
    status: 'started' | 'completed' | 'failed';
    details?: any;
  }>;
  
  // Timestamps
  submitted_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Job Data Types for different job types
export interface PressReleaseJobData {
  submission_id: string;
  package_type: PackageType;
  test_mode?: boolean;
  demo_mode?: boolean;
}

export interface EmailNotificationJobData {
  to: string;
  template: 'completion' | 'error' | 'payment_confirmation';
  data: Record<string, any>;
}

// Job Queue Status for monitoring
export interface JobQueueStatus {
  status: JobStatus;
  type: JobType;
  count: number;
  oldest_job?: string;
  newest_job?: string;
}

// System Health Metrics
export interface SystemHealthMetric {
  metric_type: string;
  metric_name: string;
  value: number;
}

// API Response Types
export interface CreateJobResponse {
  success: boolean;
  job_id?: string;
  error?: string;
}

export interface JobProcessingResult {
  success: boolean;
  result?: any;
  error?: string;
  shouldRetry?: boolean;
} 