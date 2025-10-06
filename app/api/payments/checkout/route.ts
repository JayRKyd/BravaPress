import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-06-30.basil'
})

function getBaseUrl() {
	const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
	if (explicit) return explicit.replace(/\/$/, '')
	const vercel = process.env.NEXT_PUBLIC_VERCEL_URL
	if (vercel) return `https://${vercel}`
	return 'http://localhost:8000'
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient()

		// Require authenticated user
		const { data: { user }, error: authError } = await supabase.auth.getUser()
		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const {
			press_release_id,
			amount = 39500,
			package_type = 'basic',
			press_release_data
		} = body || {}

		if (!press_release_data) {
			return NextResponse.json({ error: 'press_release_data is required' }, { status: 400 })
		}

		// Accept minimal required details at payment time
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
		} = press_release_data

		if (!company_name || !contact_email || !contact_name) {
			return NextResponse.json({ error: 'company_name, contact_name and contact_email are required' }, { status: 400 })
		}

		// Create or update submission in payment_pending
		const submissionPayload = {
			user_id: user.id,
			title: title || null,
			content: content || null,
			summary: summary || null,
			company_name,
			contact_name,
			contact_email,
			contact_phone: contact_phone || null,
			website_url: website_url || null,
			industry: industry || null,
			location: location || null,
			package_type,
			payment_amount: amount,
			payment_status: 'pending',
			status: 'payment_pending'
		}

		let submission
		if (press_release_id) {
			const { data, error } = await supabase
				.from('press_release_submissions')
				.update(submissionPayload)
				.eq('id', press_release_id)
				.eq('user_id', user.id)
				.select()
				.single()
			if (error) {
				console.error('Failed to update submission before checkout:', error)
				return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
			}
			submission = data
		} else {
			const { data, error } = await supabase
				.from('press_release_submissions')
				.insert(submissionPayload)
				.select()
				.single()
			if (error) {
				console.error('Failed to create submission before checkout:', error)
				return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
			}
			submission = data
		}

		const baseUrl = getBaseUrl()

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: { name: `Press Release (${package_type})` },
						unit_amount: amount
					},
					quantity: 1
				}
			],
			success_url: `${baseUrl}/dashboard/new-release?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}/dashboard/new-release?canceled=1`,
			client_reference_id: submission.id,
			metadata: {
				submission_id: submission.id,
				user_id: user.id,
				package_type
			},
			payment_intent_data: {
				metadata: {
					submission_id: submission.id,
					user_id: user.id,
					package_type
				}
			}
		})

		return NextResponse.json({
			checkout_session_id: session.id,
			url: session.url,
			press_release_id: submission.id
		})
	} catch (error) {
		console.error('Unexpected error creating checkout session:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}


