import { createServerClient } from '@supabase/ssr'
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

  // Create initial response
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Add layout condition header
  const showHeaderFooter = !req.nextUrl.pathname.startsWith('/dashboard') || 
                         req.nextUrl.pathname === '/auth/login' || 
                         req.nextUrl.pathname === '/auth/verify' ||
                         req.nextUrl.pathname === '/privacy-policy' ||
                         req.nextUrl.pathname === '/terms-of-service'

  response.headers.set('x-show-layout', showHeaderFooter.toString())

  // Initialize Supabase client for authentication
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Check authentication for protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log('Redirecting unauthenticated user from:', req.nextUrl.pathname)
        const loginUrl = new URL('/auth/login', req.url)
        loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      console.log('Authenticated user accessing:', req.nextUrl.pathname)
    } catch (error) {
      console.error('Auth check failed:', error)
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Refresh session if it exists
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
