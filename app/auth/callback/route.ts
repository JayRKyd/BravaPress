import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // First, check if we already have a session (from verify route)
  const { data: { session: existingSession } } = await supabase.auth.getSession()
  
  if (existingSession) {
    console.log('✅ Existing session found, redirecting to:', next)
    return NextResponse.redirect(new URL(next, request.url))
  }

  // If we have a code, try to exchange it
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('✅ Code exchanged successfully, redirecting to:', next)
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url))
    }
  }

  // Check one more time for session (in case it was set by middleware)
  const { data: { session: finalSession } } = await supabase.auth.getSession()
  
  if (finalSession) {
    console.log('✅ Final session check successful, redirecting to:', next)
    return NextResponse.redirect(new URL(next, request.url))
  }

  // No session found, redirect to login
  console.log('❌ No session found in callback, redirecting to login')
  return NextResponse.redirect(new URL('/auth/login?error=no_session', request.url))
} 