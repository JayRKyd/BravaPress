import { NextRequest, NextResponse } from 'next/server';
import { createDirectClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createDirectClient(); // Use service role for webhook processing
    
    // Get the raw body for webhook signature verification
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', event.type);

    // Handle different webhook event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const paymentIntentId = session.payment_intent as string | null
        const submissionId = (session.client_reference_id as string) || (session.metadata?.submission_id as string)
        await handleCheckoutCompleted(supabase, {
          paymentIntentId: paymentIntentId || undefined,
          submissionId
        })
        break
      }
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabase, event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(supabase, event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(supabase, event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(supabase: any, paymentIntent: any) {
  try {
    console.log('Processing successful payment:', paymentIntent.id);

    // Find the press release submission by payment intent ID
    const { data: submission, error: findError } = await supabase
      .from('press_release_submissions')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (findError || !submission) {
      console.error('Could not find submission for payment intent:', paymentIntent.id, findError);
      return;
    }

    // Update the submission status
    const { error: updateError } = await supabase
      .from('press_release_submissions')
      .update({
        payment_status: 'completed',
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', submission.id);

    if (updateError) {
      console.error('Failed to update submission after payment:', updateError);
      return;
    }

    // Create a background job to process the press release
    const { error: jobError } = await supabase
      .from('jobs')
      .insert({
        type: 'press_release_submission',
        data: {
          submission_id: submission.id,
          user_id: submission.user_id,
          payment_intent_id: paymentIntent.id
        },
        priority: 1,
        status: 'pending'
      });

    if (jobError) {
      console.error('Failed to create background job:', jobError);
      // Don't return error here - payment was successful, job creation is secondary
    }

    console.log(`✅ Payment processed successfully for submission ${submission.id}`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handlePaymentFailed(supabase: any, paymentIntent: any) {
  try {
    console.log('Processing failed payment:', paymentIntent.id);

    // Update the submission status
    const { error } = await supabase
      .from('press_release_submissions')
      .update({
        payment_status: 'failed',
        status: 'payment_pending', // Keep in payment pending state for retry
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Failed to update submission after payment failure:', error);
    }

    console.log(`❌ Payment failed for payment intent ${paymentIntent.id}`);

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handlePaymentCanceled(supabase: any, paymentIntent: any) {
  try {
    console.log('Processing canceled payment:', paymentIntent.id);

    // Update the submission status
    const { error } = await supabase
      .from('press_release_submissions')
      .update({
        payment_status: 'failed',
        status: 'draft', // Return to draft state
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Failed to update submission after payment cancellation:', error);
    }

    console.log(`🚫 Payment canceled for payment intent ${paymentIntent.id}`);

  } catch (error) {
    console.error('Error handling canceled payment:', error);
  }
}

async function handleCheckoutCompleted(supabase: any, params: { paymentIntentId?: string, submissionId?: string }) {
  try {
    if (params.paymentIntentId) {
      // Ensure we store the payment intent ID if not already set
      await supabase
        .from('press_release_submissions')
        .update({ stripe_payment_intent_id: params.paymentIntentId })
        .eq('id', params.submissionId)
    }

    if (params.paymentIntentId) {
      // Reuse succeeded handler for consistent logic
      await handlePaymentSucceeded(supabase, { id: params.paymentIntentId })
    }
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error)
  }
}