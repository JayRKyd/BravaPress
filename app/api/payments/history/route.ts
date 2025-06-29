import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
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

    // Get URL parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // Optional status filter

    // Build query for press release submissions with payment info
    let query = supabase
      .from('press_release_submissions')
      .select(`
        id,
        title,
        company_name,
        payment_amount,
        payment_status,
        stripe_payment_intent_id,
        status,
        created_at,
        updated_at,
        submitted_at,
        completed_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status) {
      query = query.eq('payment_status', status);
    }

    const { data: transactions, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching payment history:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch payment history' },
        { status: 500 }
      );
    }

    // Transform data to match frontend expectations
    const formattedTransactions = transactions?.map(transaction => ({
      id: transaction.stripe_payment_intent_id || transaction.id,
      date: new Date(transaction.created_at).toLocaleDateString(),
      amount: transaction.payment_amount ? `$${(transaction.payment_amount / 100).toFixed(2)}` : '$395.00',
      status: transaction.payment_status === 'completed' ? 'Paid' : 
              transaction.payment_status === 'failed' ? 'Failed' :
              transaction.payment_status === 'refunded' ? 'Refunded' : 'Pending',
      description: `Press Release: ${transaction.title}`,
      press_release_id: transaction.id,
      submission_status: transaction.status,
      submitted_at: transaction.submitted_at,
      completed_at: transaction.completed_at
    })) || [];

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('press_release_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error getting transaction count:', countError);
    }

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Unexpected error in payment history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 