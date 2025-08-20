import { NextRequest, NextResponse } from 'next/server'
import { createDirectClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
	try {
		const supabase = createDirectClient()
		const { searchParams } = new URL(request.url)
		const limit = Number(searchParams.get('limit') || '20')
		const status = searchParams.get('status') || ''
		const search = searchParams.get('search') || ''

		let query = supabase
			.from('press_release_submissions')
			.select(`
				*,
				profiles:profiles!press_release_submissions_user_id_fkey (
					full_name,
					email
				)
			`)
			.order('created_at', { ascending: false })
			.limit(limit)

		if (status) query = query.eq('status', status)
		if (search) query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%`)

		const { data, error } = await query
		if (error) return NextResponse.json({ error: error.message }, { status: 500 })

		return NextResponse.json({ press_releases: data || [] })
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
	}
}

