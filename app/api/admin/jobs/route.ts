import { NextRequest, NextResponse } from 'next/server'
import { createDirectClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
	try {
		const supabase = createDirectClient()
		const { searchParams } = new URL(request.url)
		const limit = Number(searchParams.get('limit') || '20')
		const status = searchParams.get('status') || ''
		const type = searchParams.get('type') || ''

		let query = supabase
			.from('jobs')
			.select(`
				*,
				press_release_submissions:press_release_submissions!jobs_submission_id_fkey (
					title,
					company_name,
					profiles:profiles!press_release_submissions_user_id_fkey (
						full_name,
						email
					)
				)
			`)
			.order('created_at', { ascending: false })
			.limit(limit)

		if (status) query = query.eq('status', status)
		if (type) query = query.eq('type', type)

		const { data, error } = await query
		if (error) return NextResponse.json({ error: error.message }, { status: 500 })

		return NextResponse.json({ jobs: data || [] })
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = createDirectClient()
		const body = await request.json()
		const action = body?.action

		if (action === 'retry_job' && body?.job_id) {
			const { error } = await supabase
				.from('jobs')
				.update({ status: 'pending', error: null, attempts: 0 })
				.eq('id', body.job_id)
			if (error) return NextResponse.json({ error: error.message }, { status: 500 })
			return NextResponse.json({ message: 'Job marked for retry' })
		}

		if (action === 'retry_all_failed') {
			const { error } = await supabase
				.from('jobs')
				.update({ status: 'pending', error: null })
				.eq('status', 'failed')
			if (error) return NextResponse.json({ error: error.message }, { status: 500 })
			return NextResponse.json({ message: 'All failed jobs queued for retry' })
		}

    if (action === 'requeue_stuck_processing') {
      // Requeue jobs stuck in processing for > 30 minutes
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'pending', error: null, started_at: null })
        .eq('status', 'processing')
        .lt('started_at', cutoff)
        .select('id')
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ message: `Requeued ${data?.length || 0} stuck job(s)` })
    }

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
	}
}

