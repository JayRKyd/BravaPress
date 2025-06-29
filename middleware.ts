import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/callback',
    '/auth/verify',
    '/test-connection',
    '/api/test-connection',
    '/api/test-tables',
    '/api/health',
    '/dashboard', // Temporarily public for development
  ]

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return response
  }

  // Initialize Supabase client for authentication
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

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
