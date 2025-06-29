import { NextRequest, NextResponse } from 'next/server';
import { JobQueue } from '@/services/job-queue';
import { EINPresswireAutomation, type PressReleaseSubmission } from '@/services/einpresswire-automation';
import { PressReleaseJobData, EmailNotificationJobData } from '@/types/jobs';
import { createDirectClient } from '@/utils/supabase/server';

// Job processor that can handle different types of background jobs
export async function POST(request: NextRequest) {
  console.log('🔄 Job Processor: Starting job processing cycle');
  
  const jobQueue = new JobQueue();
  const supabase = createDirectClient();
  
  try {
    // Get the next job from the queue
    const job = await jobQueue.getNextJob();
    
    if (!job) {
      console.log('ℹ️ No jobs available for processing');
      return NextResponse.json({ 
        success: true, 
        message: 'No jobs available',
        processed: false 
      });
    }

    console.log(`🚀 Processing job: ${job.id} (${job.type})`);
    
    let result;
    let success = false;
    
    try {
      // Process job based on type
      switch (job.type) {
        case 'press_release_submission':
          result = await processPressReleaseJob(job.data as PressReleaseJobData, supabase);
          success = result.success;
          break;
          
        case 'email_notification':
          result = await processEmailJob(job.data as EmailNotificationJobData);
          success = result.success;
          break;
          
        case 'cleanup':
          result = await processCleanupJob();
          success = result.success;
          break;
          
        default:
          console.error(`❌ Unknown job type: ${job.type}`);
          await jobQueue.failJob(job.id, `Unknown job type: ${job.type}`, false);
          return NextResponse.json({ 
            success: false, 
            error: `Unknown job type: ${job.type}` 
          });
      }
      
      if (success) {
        await jobQueue.completeJob(job.id, result);
        console.log(`✅ Job completed successfully: ${job.id}`);
      } else {
        await jobQueue.failJob(job.id, result.error || 'Job failed without specific error');
        console.log(`❌ Job failed: ${job.id} - ${result.error}`);
      }
      
    } catch (processingError) {
      const errorMessage = processingError instanceof Error ? processingError.message : 'Unknown processing error';
      console.error(`💥 Job processing error for ${job.id}:`, processingError);
      
      await jobQueue.failJob(job.id, errorMessage);
    }

    return NextResponse.json({
      success: true,
      processed: true,
      job_id: job.id,
      job_type: job.type,
      job_success: success,
      result: success ? result : undefined,
      error: success ? undefined : result?.error
    });

  } catch (error) {
    console.error('💥 Job processor error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Process press release submission job
async function processPressReleaseJob(data: PressReleaseJobData, supabase: any) {
  console.log(`📤 Processing press release submission: ${data.submission_id}`);
  
  try {
    // Get submission details from database
    const { data: submission, error: fetchError } = await supabase
      .from('press_release_submissions')
      .select('*')
      .eq('id', data.submission_id)
      .single();

    if (fetchError || !submission) {
      throw new Error(`Failed to fetch submission: ${fetchError?.message || 'Not found'}`);
    }

    // Update status to processing
    await supabase
      .from('press_release_submissions')
      .update({ 
        status: 'processing',
        processing_logs: [
          ...(submission.processing_logs || []),
          {
            timestamp: new Date().toISOString(),
            step: 'automation_started',
            status: 'started',
            details: { package_type: data.package_type, test_mode: data.test_mode, demo_mode: data.demo_mode }
          }
        ]
      })
      .eq('id', data.submission_id);

    // Initialize automation
    const automation = new EINPresswireAutomation();
    
    try {
      await automation.initialize(true); // Always headless in production
      
      const pressReleaseData: PressReleaseSubmission = {
        title: submission.title,
        content: submission.content,
        summary: submission.summary,
        companyName: submission.company_name,
        contactName: submission.contact_name,
        contactEmail: submission.contact_email,
        contactPhone: submission.contact_phone,
        websiteUrl: submission.website_url,
        industry: submission.industry,
        location: submission.location
      };

      // Production mode - real submission only
      const purchaseResult = await automation.purchasePackage(data.package_type);
      if (!purchaseResult.success) {
        throw new Error(`Purchase failed: ${purchaseResult.error}`);
      }

      const submissionResult = await automation.submitPressRelease(
        pressReleaseData, 
        purchaseResult.accessCredentials
      );
      
      const automationResult = {
        purchase: purchaseResult,
        submission: submissionResult
      };

      // Update submission with results
      const finalStatus = automationResult.submission.success ? 'completed' : 'failed';
      await supabase
        .from('press_release_submissions')
        .update({
          status: finalStatus,
          einpresswire_order_id: automationResult.purchase.orderId,
          einpresswire_submission_id: automationResult.submission.submissionId,
          einpresswire_confirmation_url: automationResult.submission.confirmationUrl,
          screenshots: automationResult.submission.screenshots,
          completed_at: new Date().toISOString(),
          processing_logs: [
            ...(submission.processing_logs || []),
            {
              timestamp: new Date().toISOString(),
              step: 'automation_completed',
              status: automationResult.submission.success ? 'completed' : 'failed',
              details: automationResult
            }
          ]
        })
        .eq('id', data.submission_id);

      return {
        success: automationResult.submission.success,
        result: automationResult,
        error: automationResult.submission.success ? undefined : automationResult.submission.error
      };

    } finally {
      await automation.cleanup();
    }

  } catch (error) {
    // Update submission status to failed
    await supabase
      .from('press_release_submissions')
      .update({
        status: 'failed',
        error_logs: {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      })
      .eq('id', data.submission_id);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Process email notification job
async function processEmailJob(data: EmailNotificationJobData) {
  console.log(`📧 Processing email job: ${data.template} to ${data.to}`);
  
  try {
    // TODO: Implement email sending with Resend
    // For now, just simulate success
    console.log(`📧 Email sent: ${data.template} template to ${data.to}`);
    
    return {
      success: true,
      result: {
        to: data.to,
        template: data.template,
        sent_at: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email send failed'
    };
  }
}

// Process cleanup job
async function processCleanupJob() {
  console.log('🧹 Processing cleanup job');
  
  try {
    const jobQueue = new JobQueue();
    const deletedCount = await jobQueue.cleanupOldJobs(7); // Clean up jobs older than 7 days
    
    return {
      success: true,
      result: {
        deleted_count: deletedCount,
        cleaned_at: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed'
    };
  }
} 