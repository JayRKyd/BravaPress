import { NextRequest, NextResponse } from 'next/server';
import { JobQueue } from '@/services/job-queue';

// Get job queue status and system health metrics
export async function GET(request: NextRequest) {
  console.log('📊 Job Status API: Getting queue status and system health');
  
  try {
    const jobQueue = new JobQueue();
    
    // Get queue status
    const queueStatus = await jobQueue.getQueueStatus();
    
    // Get system health metrics
    const systemHealth = await jobQueue.getSystemHealth();
    
    // Calculate summary metrics
    const summary = {
      total_pending: queueStatus
        .filter(item => item.status === 'pending')
        .reduce((sum, item) => sum + item.count, 0),
      total_processing: queueStatus
        .filter(item => item.status === 'processing')
        .reduce((sum, item) => sum + item.count, 0),
      total_failed_today: queueStatus
        .filter(item => item.status === 'failed')
        .reduce((sum, item) => sum + item.count, 0),
      submissions_today: systemHealth.find(metric => 
        metric.metric_type === 'submissions' && metric.metric_name === 'today'
      )?.value || 0
    };
    
    return NextResponse.json({
      success: true,
      queue_status: queueStatus,
      system_health: systemHealth,
      summary,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Job status API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Manually trigger job processing
export async function POST(request: NextRequest) {
  console.log('🔄 Job Status API: Manual job processing trigger');
  
  try {
    // This will trigger the job processor
    const processorResponse = await fetch(`${request.nextUrl.origin}/api/jobs/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await processorResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Job processing triggered',
      processor_result: result
    });

  } catch (error) {
    console.error('💥 Manual job trigger error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 