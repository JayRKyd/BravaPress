import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create a sample press release submission for testing
    const sampleSubmission = {
      user_id: user.id,
      title: 'Test Press Release - BravaPress Platform Launch',
      content: 'BravaPress, a revolutionary SaaS platform for automated press release distribution, has officially launched. The platform uses AI to generate professional press releases and automates submission to major media outlets including EINPresswire.',
      summary: 'BravaPress launches AI-powered press release automation platform',
      company_name: 'BravaPress Inc.',
      contact_name: 'Test User',
      contact_email: user.email || 'test@example.com',
      contact_phone: '(555) 123-4567',
      website_url: 'https://bravapress.com',
      industry: 'Technology',
      location: 'San Francisco, CA',
      package_type: 'basic',
      payment_amount: 39500, // $395.00 in cents
      payment_status: 'completed',
      stripe_payment_intent_id: `pi_test_${Date.now()}`,
      status: 'paid',
      submitted_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    // Insert the sample submission
    const { data: submission, error: insertError } = await supabase
      .from('press_release_submissions')
      .insert(sampleSubmission)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating test submission:', insertError);
      return NextResponse.json(
        { error: 'Failed to create test submission', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test submission created successfully',
      submission: {
        id: submission.id,
        title: submission.title,
        amount: submission.payment_amount,
        status: submission.payment_status,
        created_at: submission.created_at
      }
    });

  } catch (error) {
    console.error('Unexpected error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all test submissions for this user
    const { error: deleteError } = await supabase
      .from('press_release_submissions')
      .delete()
      .eq('user_id', user.id)
      .like('title', '%Test Press Release%');

    if (deleteError) {
      console.error('Error deleting test submissions:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete test submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test submissions deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error deleting test data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 