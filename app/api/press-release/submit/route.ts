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
      // Initialize browser (non-headless for debugging)
      await automation.initialize(false);
      console.log('✅ Browser initialized');

      // Step 1: Purchase package
      console.log(`💳 Purchasing ${packageType} package...`);
      const purchaseResult = await automation.purchasePackage(packageType);
      
      if (!purchaseResult.success) {
        console.error('❌ Purchase failed:', purchaseResult.error);
        return NextResponse.json(
          { 
            error: `Purchase failed: ${purchaseResult.error}`,
            purchase: purchaseResult
          },
          { status: 500 }
        );
      }

      console.log('✅ Package purchased successfully:', purchaseResult.orderId);

      // Step 2: Submit press release
      console.log('📤 Submitting press release...');
      const submissionResult = await automation.submitPressRelease(
        pressRelease, 
        purchaseResult.accessCredentials
      );

      if (!submissionResult.success) {
        console.error('❌ Submission failed:', submissionResult.error);
        return NextResponse.json(
          { 
            error: `Submission failed: ${submissionResult.error}`,
            purchase: purchaseResult,
            submission: submissionResult
          },
          { status: 500 }
        );
      }

      console.log('✅ Press release submitted successfully:', submissionResult.submissionId);

      // Return successful result
      return NextResponse.json({
        purchase: purchaseResult,
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