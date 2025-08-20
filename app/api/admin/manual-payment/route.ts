import { NextRequest, NextResponse } from 'next/server'
import { createDirectClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createDirectClient()
    const body = await request.json()
    const action = body?.action
    const submissionId = body?.submission_id

    if (action === 'approve_payment' && submissionId) {
      // Update submission status to paid
      const { error: updateError } = await supabase
        .from('press_release_submissions')
        .update({ 
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Create a new job for this submission (skip purchase step)
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          type: 'press_release_submission',
          status: 'pending',
          submission_id: submissionId,
          data: {
            skip_purchase: true,
            submission_id: submissionId
          },
          priority: 10,
          created_at: new Date().toISOString()
        })

      if (jobError) {
        return NextResponse.json({ error: jobError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Manual payment approved and job queued for retry',
        submission_id: submissionId
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 