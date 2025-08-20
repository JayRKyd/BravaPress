import { NextRequest, NextResponse } from 'next/server'
import { createDirectClient } from '@/utils/supabase/server'

function getCutoffDate(timeframe: string | null): string | null {
	const now = new Date()
	switch (timeframe) {
		case '1day':
			now.setDate(now.getDate() - 1)
			return now.toISOString()
		case '7days':
			now.setDate(now.getDate() - 7)
			return now.toISOString()
		case '30days':
			now.setDate(now.getDate() - 30)
			return now.toISOString()
		case '90days':
			now.setDate(now.getDate() - 90)
			return now.toISOString()
		default:
			return null
	}
}

export async function GET(request: NextRequest) {
	try {
		const supabase = createDirectClient()
		const { searchParams } = new URL(request.url)
		const timeframe = searchParams.get('timeframe')
		const cutoff = getCutoffDate(timeframe)

		let prsQuery = supabase
			.from('press_release_submissions')
			.select('*')

		if (cutoff) prsQuery = prsQuery.gte('created_at', cutoff)

		const { data: prs, error: prsError } = await prsQuery

		if (prsError) {
			return NextResponse.json({ error: prsError.message }, { status: 500 })
		}

		const total_submissions = prs?.length || 0
		const completed_submissions = prs?.filter(p => p.status === 'completed').length || 0
		const failed_submissions = prs?.filter(p => p.status === 'failed').length || 0
		const pending_submissions = prs?.filter(p => p.status === 'payment_pending' || p.status === 'processing' || p.status === 'paid').length || 0
		const total_revenue = prs?.reduce((sum, p) => sum + (Number(p.payment_amount) || 0), 0) || 0

		let avg_processing_time_minutes = 0
		if (prs && prs.length > 0) {
			const completed = prs.filter(p => p.completed_at && p.created_at)
			if (completed.length > 0) {
				const totalMs = completed.reduce((sum, p) => sum + (new Date(p.completed_at).getTime() - new Date(p.created_at).getTime()), 0)
				avg_processing_time_minutes = totalMs / completed.length / 1000 / 60
			}
		}

		// Jobs metrics
		let jobsQuery = supabase
			.from('jobs')
			.select('*')
		if (cutoff) jobsQuery = jobsQuery.gte('created_at', cutoff)
		const { data: jobs, error: jobsError } = await jobsQuery
		if (jobsError) {
			return NextResponse.json({ error: jobsError.message }, { status: 500 })
		}

		const total_jobs = jobs?.length || 0
		const failed_jobs = jobs?.filter(j => j.status === 'failed').length || 0
		const pending_jobs = jobs?.filter(j => j.status === 'pending').length || 0
		const processing_jobs = jobs?.filter(j => j.status === 'processing').length || 0
		const job_success_rate = total_jobs > 0 ? Math.round(((total_jobs - failed_jobs) / total_jobs) * 100) : 100

		const submissions_24h_cutoff = getCutoffDate('1day')!
		const submissions_24h = (prs || []).filter(p => new Date(p.created_at).toISOString() >= submissions_24h_cutoff).length
		const revenue_24h = (prs || [])
			.filter(p => new Date(p.created_at).toISOString() >= submissions_24h_cutoff)
			.reduce((sum, p) => sum + (Number(p.payment_amount) || 0), 0)

		const status_breakdown = {
			draft: (prs || []).filter(p => p.status === 'draft').length || 0,
			payment_pending: (prs || []).filter(p => p.status === 'payment_pending').length || 0,
			paid: (prs || []).filter(p => p.status === 'paid').length || 0,
			processing: (prs || []).filter(p => p.status === 'processing').length || 0,
			completed: (prs || []).filter(p => p.status === 'completed').length || 0,
			failed: (prs || []).filter(p => p.status === 'failed').length || 0,
		}

		return NextResponse.json({
			overview: {
				total_submissions,
				completed_submissions,
				failed_submissions,
				pending_submissions,
				success_rate: total_submissions > 0 ? Math.round((completed_submissions / total_submissions) * 100) : 0,
				total_revenue,
				avg_processing_time_minutes
			},
			jobs: {
				total_jobs,
				failed_jobs,
				pending_jobs,
				processing_jobs,
				job_success_rate
			},
			recent_activity: {
				submissions_24h,
				revenue_24h
			},
			status_breakdown
		})
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
	}
}

