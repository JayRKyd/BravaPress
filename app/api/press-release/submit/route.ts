import { NextRequest, NextResponse } from 'next/server';
import { EINPresswireAutomation, type PressReleaseSubmission } from '@/services/einpresswire-automation';

export interface SubmissionRequest {
  pressRelease: PressReleaseSubmission;
  packageType?: 'basic' | 'premium' | 'enterprise';
}

export async function POST(request: NextRequest) {
  console.log('🚀 API Route: /api/press-release/submit called');
  
  try {
    const { pressRelease, packageType = 'basic' }: SubmissionRequest = await request.json();
    console.log('📝 Received submission request:', { pressRelease, packageType });

    // Validate required fields
    if (!pressRelease.title || !pressRelease.content || !pressRelease.companyName) {
      console.error('❌ Missing required fields for submission');
      return NextResponse.json(
        { error: 'Missing required fields: title, content, companyName' },
        { status: 400 }
      );
    }

    // Initialize automation service
    console.log('🤖 Initializing EINPresswire automation...');
    const automation = new EINPresswireAutomation();
    
    try {
      // Initialize browser
      // Default to headless in server environments. Set PLAYWRIGHT_HEADLESS=false to debug locally.
      const headless = process.env.PLAYWRIGHT_HEADLESS !== 'false';
      await automation.initialize(headless);
      console.log('✅ Browser initialized');

      // New flow: Directly submit via EIN Step 1 → Step 2 → Step 3 using credits
      // (Fills edit form, proceeds to preview, selects distribution, confirms review)
      console.log('📤 Submitting press release via EIN Step 1 → 3 flow...');
      const submissionResult = await automation.submitPressRelease(pressRelease);

      if (!submissionResult.success) {
        console.error('❌ Submission failed:', submissionResult.error);
        return NextResponse.json(
          { 
            error: `Submission failed: ${submissionResult.error}`,
            submission: submissionResult
          },
          { status: 500 }
        );
      }

      console.log('✅ Press release submitted successfully:', submissionResult.submissionId);

      // Return successful result
      return NextResponse.json({
        submission: submissionResult
      });

    } finally {
      // Always cleanup browser resources
      await automation.cleanup();
      console.log('🧹 Browser cleanup completed');
    }

  } catch (error) {
    console.error('💥 Error in press release submission:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: `Failed to submit press release: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 