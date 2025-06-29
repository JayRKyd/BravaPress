import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const redirectTo = requestUrl.searchParams.get('redirect_to')
  
  // Log the verification request details
  console.log('Verification Request:', {
    token,
    type,
    redirectTo,
    url: request.url,
  })
  
  // Create a Supabase client
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    // For magic links (PKCE tokens), redirect to our callback page
    if (token) {
      const callbackUrl = new URL('/auth/callback', request.url)
      
      // Pass both token and code (they're the same for PKCE)
      callbackUrl.searchParams.set('token', token)
      callbackUrl.searchParams.set('code', token)
      
      // Pass the type
      if (type) {
        callbackUrl.searchParams.set('type', type)
      }
      
      // Set the next destination
      const nextUrl = redirectTo ? decodeURIComponent(redirectTo) : '/dashboard'
      const nextParam = nextUrl.includes('/auth/callback') ? '/dashboard' : nextUrl
      callbackUrl.searchParams.set('next', nextParam)
      
      console.log('Redirecting to callback with PKCE token:', callbackUrl.toString())
      return NextResponse.redirect(callbackUrl)
    }
    
    // If no token, redirect to login with error
    console.log('No token found, redirecting to login')
    return NextResponse.redirect(new URL('/auth/login?error=missing_token', request.url))
    
  } catch (error) {
    console.error('Unexpected error during verification:', error)
    return NextResponse.redirect(new URL('/auth/login?error=verification_error', request.url))
  }
}
