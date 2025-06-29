// Job Queue Service for BravaPress Background Processing

import { createDirectClient } from '@/utils/supabase/server';
import { 
  Job, 
  JobType, 
  JobStatus,
  CreateJobResponse,
  JobProcessingResult,
  PressReleaseJobData,
  EmailNotificationJobData
} from '@/types/jobs';

export class JobQueue {
  private supabase;

  constructor() {
    this.supabase = createDirectClient();
  }

  /**
   * Add a new job to the queue
   */
  async addJob(
    type: JobType,
    data: PressReleaseJobData | EmailNotificationJobData | any,
    options: {
      priority?: number;
      maxAttempts?: number;
      scheduledAt?: Date;
    } = {}
  ): Promise<CreateJobResponse> {
    try {
      const { data: job, error } = await this.supabase
        .from('jobs')
        .insert({
          type,
          data,
          priority: options.priority || 0,
          max_attempts: options.maxAttempts || 3,
          scheduled_at: options.scheduledAt?.toISOString() || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to add job to queue:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Job added to queue: ${job.id} (${type})`);
      return { success: true, job_id: job.id };
    } catch (error) {
      console.error('Error adding job to queue:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get the next available job from the queue
   */
  async getNextJob(): Promise<Job | null> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_next_job');

      if (error) {
        console.error('Failed to get next job:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null; // No jobs available
      }

      const jobData = data[0];
      return {
        id: jobData.job_id,
        type: jobData.job_type,
        data: jobData.job_data,
        status: 'processing', // It's already set to processing by the function
        priority: 0, // We'll need to fetch this separately if needed
        attempts: 0, // We'll need to fetch this separately if needed
        max_attempts: 3,
        scheduled_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Job;
    } catch (error) {
      console.error('Error getting next job:', error);
      return null;
    }
  }

  /**
   * Mark a job as completed
   */
  async completeJob(jobId: string, result?: any): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('complete_job', { 
          job_uuid: jobId, 
          job_result: result ? JSON.stringify(result) : null 
        });

      if (error) {
        console.error('Failed to complete job:', error);
        return false;
      }

      console.log(`✅ Job completed: ${jobId}`);
      return true;
    } catch (error) {
      console.error('Error completing job:', error);
      return false;
    }
  }

  /**
   * Mark a job as failed
   */
  async failJob(jobId: string, errorMessage: string, shouldRetry: boolean = true): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('fail_job', { 
          job_uuid: jobId, 
          error_message: errorMessage,
          should_retry: shouldRetry
        });

      if (error) {
        console.error('Failed to mark job as failed:', error);
        return false;
      }

      console.log(`❌ Job failed: ${jobId} - ${errorMessage}`);
      return true;
    } catch (error) {
      console.error('Error failing job:', error);
      return false;
    }
  }

  /**
   * Get job queue status for monitoring
   */
  async getQueueStatus() {
    try {
      const { data, error } = await this.supabase
        .from('job_queue_status')
        .select('*');

      if (error) {
        console.error('Failed to get queue status:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error getting queue status:', error);
      return [];
    }
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    try {
      const { data, error } = await this.supabase
        .from('system_health')
        .select('*');

      if (error) {
        console.error('Failed to get system health:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error getting system health:', error);
      return [];
    }
  }

  /**
   * Clean up old completed jobs (housekeeping)
   */
  async cleanupOldJobs(olderThanDays: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data, error } = await this.supabase
        .from('jobs')
        .delete()
        .in('status', ['completed', 'failed'])
        .lt('completed_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('Failed to cleanup old jobs:', error);
        return 0;
      }

      const deletedCount = data?.length || 0;
      console.log(`🧹 Cleaned up ${deletedCount} old jobs`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old jobs:', error);
      return 0;
    }
  }
}

// Convenience functions for specific job types
export class PressReleaseJobQueue extends JobQueue {
  /**
   * Add a press release submission job
   */
  async addPressReleaseJob(
    submissionId: string,
    packageType: 'basic' | 'premium' | 'enterprise',
    options: {
      testMode?: boolean;
      demoMode?: boolean;
      priority?: number;
    } = {}
  ): Promise<CreateJobResponse> {
    const jobData: PressReleaseJobData = {
      submission_id: submissionId,
      package_type: packageType,
      test_mode: options.testMode,
      demo_mode: options.demoMode
    };

    return this.addJob('press_release_submission', jobData, {
      priority: options.priority || 10 // High priority for press releases
    });
  }

  /**
   * Add an email notification job
   */
  async addEmailJob(
    to: string,
    template: 'completion' | 'error' | 'payment_confirmation',
    templateData: any,
    options: { priority?: number } = {}
  ): Promise<CreateJobResponse> {
    const jobData: EmailNotificationJobData = {
      to,
      template,
      data: templateData
    };

    return this.addJob('email_notification', jobData, {
      priority: options.priority || 5 // Medium priority for emails
    });
  }
} 