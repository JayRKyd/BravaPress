import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('Middleware running for path:', req.nextUrl.pathname)
  
  // Skip middleware for certain paths
  if (
    req.nextUrl.pathname.startsWith('/auth/callback') ||
    req.nextUrl.pathname.startsWith('/auth/v1/verify') ||
    req.nextUrl.pathname.startsWith('/auth/login') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname === '/favicon.ico'
  ) {
    console.log('Skipping middleware for path:', req.nextUrl.pathname)
    return NextResponse.next()
  }
  
  // TEMPORARY WORKAROUND: Completely bypass auth checks
  // This will be removed once the client fixes their Supabase configuration
  console.log('⚠️ TEMPORARY WORKAROUND: Auth checks disabled for all routes')
  return NextResponse.next()
  
  // The commented out code below is the original implementation
  // It will be restored once the client fixes their Supabase configuration
  /*
  // Only run middleware for dashboard routes
  if (!req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('Not a dashboard route, skipping auth check:', req.nextUrl.pathname)
    return NextResponse.next()
  }
  
  try {
    console.log('Checking session for protected route:', req.nextUrl.pathname)
    
    // Create a response that we can modify
    const res = NextResponse.next()
    
    // Create the Supabase client with the request and response
    const supabase = createMiddlewareClient({ req, res })
    
    // Check for a session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session in middleware:', error)
      // If there's an error getting the session, redirect to login
      return NextResponse.redirect(new URL('/auth/login?error=session_error', req.url))
    }
    
    // Log session details for debugging
    if (session) {
      console.log('Session found:', { 
        userId: session.user.id,
        email: session.user.email,
        expiresAt: new Date(session.expires_at! * 1000).toISOString()
      })
    } else {
      console.log('No session found')
    }
    
    // If no session, redirect to login
    if (!session) {
      console.log('No session found, redirecting to login')
      const loginUrl = new URL('/auth/login', req.url)
      // Add the original URL as a next parameter
      loginUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Session exists, allow access to the protected route
    console.log('Valid session found, allowing access to:', req.nextUrl.pathname)
    return res
  } catch (error) {
    console.error('Exception in middleware:', error)
    return NextResponse.redirect(new URL('/auth/login?error=middleware_error', req.url))
  }
  */
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)'
  ],
}
