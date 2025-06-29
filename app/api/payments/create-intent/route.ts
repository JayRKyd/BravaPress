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

    // Parse request body
    const body = await request.json();
    const {
      press_release_id,
      amount = 39500, // Default $395.00 in cents
      package_type = 'basic',
      press_release_data
    } = body;

    // Validate required fields
    if (!press_release_data) {
      return NextResponse.json(
        { error: 'Press release data is required' },
        { status: 400 }
      );
    }

    const {
      title,
      content,
      summary,
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      website_url,
      industry,
      location
    } = press_release_data;

    // Validate required press release fields
    if (!title || !content || !summary || !company_name || !contact_name || !contact_email) {
      return NextResponse.json(
        { error: 'Missing required press release fields' },
        { status: 400 }
      );
    }

    // Create or update press release submission record
    const submissionData = {
      user_id: user.id,
      title,
      content,
      summary,
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      website_url,
      industry,
      location,
      package_type,
      payment_amount: amount,
      payment_status: 'pending',
      status: 'payment_pending'
    };

    let submission;
    if (press_release_id) {
      // Update existing submission
      const { data, error } = await supabase
        .from('press_release_submissions')
        .update(submissionData)
        .eq('id', press_release_id)
        .eq('user_id', user.id) // Security check
        .select()
        .single();

      if (error) {
        console.error('Error updating press release submission:', error);
        return NextResponse.json(
          { error: 'Failed to update press release submission' },
          { status: 500 }
        );
      }
      submission = data;
    } else {
      // Create new submission
      const { data, error } = await supabase
        .from('press_release_submissions')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating press release submission:', error);
        return NextResponse.json(
          { error: 'Failed to create press release submission' },
          { status: 500 }
        );
      }
      submission = data;
    }

    // TODO: Replace this mock with real Stripe integration
    // For now, return a mock payment intent that matches Stripe's structure
    const mockPaymentIntent = {
      id: `pi_mock_${submission.id}`,
      client_secret: `pi_mock_${submission.id}_secret_mock`,
      amount: amount,
      currency: 'usd',
      status: 'requires_payment_method',
      metadata: {
        press_release_id: submission.id,
        user_id: user.id,
        package_type
      }
    };

    // Update the submission with the mock payment intent ID
    await supabase
      .from('press_release_submissions')
      .update({ 
        stripe_payment_intent_id: mockPaymentIntent.id 
      })
      .eq('id', submission.id);

    return NextResponse.json({
      payment_intent: mockPaymentIntent,
      press_release_id: submission.id,
      message: 'Payment intent created successfully (mock mode - ready for Stripe integration)'
    });

  } catch (error) {
    console.error('Unexpected error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// TODO: When integrating with Stripe, replace the mock section with:
/*
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Replace mock payment intent creation with:
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount,
  currency: 'usd',
  metadata: {
    press_release_id: submission.id,
    user_id: user.id,
    package_type
  },
});

// Update submission with real Stripe payment intent ID
await supabase
  .from('press_release_submissions')
  .update({ 
    stripe_payment_intent_id: paymentIntent.id 
  })
  .eq('id', submission.id);

return NextResponse.json({
  payment_intent: {
    id: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status
  },
  press_release_id: submission.id
});
*/ 