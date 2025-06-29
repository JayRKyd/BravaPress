import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect_to') || '/dashboard'

  console.log('=== VERIFICATION REQUEST ===')
  console.log('Token:', token ? `${token.substring(0, 10)}...` : 'null')
  console.log('Type:', type)
  console.log('Redirect To:', redirectTo)

  if (!token) {
    console.error('Missing token parameter')
    return NextResponse.redirect(new URL('/auth/login?error=missing_token', request.url))
  }

  try {
    const supabase = await createClient()
    
    // For PKCE tokens, we need to verify them with Supabase to get the actual auth code
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })

    if (error) {
      console.error('Error verifying token:', error)
      return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url))
    }

    if (data.session) {
      // If we got a session directly, redirect to destination
      console.log('✅ Direct session created, redirecting to:', redirectTo)
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    // If no direct session but verification was successful, redirect to callback
    console.log('✅ Token verified, redirecting to callback')
    return NextResponse.redirect(new URL('/auth/callback', request.url))

  } catch (error: any) {
    console.error('Exception in verify route:', error)
    return NextResponse.redirect(new URL('/auth/login?error=verification_error', request.url))
  }
}
