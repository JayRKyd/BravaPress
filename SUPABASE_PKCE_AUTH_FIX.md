# Supabase PKCE Authentication Fix Documentation

## Overview
This document details the complete fix for BravaPress authentication issues with self-hosted Supabase using magic links and PKCE flow.

## Problem Statement

### Initial Issues
- **PKCE Flow Errors**: `invalid flow state, no valid flow state found`
- **Next.js 15 Compatibility**: Cookie access errors requiring `await cookies()`
- **Token Exchange Failures**: `invalid request: both auth code and code verifier should be non-empty`
- **Mixed Authentication Flows**: Using deprecated `@supabase/auth-helpers-nextjs` with implicit flow instead of PKCE
- **Session Management**: Inconsistent session handling across middleware and routes

### Error Examples
```
Failed to load resource: 135.148.41.27:8000/auth/v1/token?grant_type=pkce 404 Not Found
[Error: Route "/auth/callback" used cookies().get('sb-auth-token-code-verifier'). cookies() should be awaited before using its value]
AuthApiError: invalid request: both auth code and code verifier should be non-empty
```

## Solution Implementation

### Phase 1: Package Updates

#### Removed Deprecated Package
```bash
npm uninstall @supabase/auth-helpers-nextjs --force
```

#### Kept Modern Packages
- `@supabase/supabase-js@2.49.5` ✅
- `@supabase/ssr@0.6.1` ✅

### Phase 2: Core File Replacements

#### 1. Server Utils (`utils/supabase/server.ts`)
**Before**: Used deprecated auth helpers with complex cookie handling
**After**: Clean `@supabase/ssr` implementation

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component limitation - handled by middleware
          }
        },
      },
    }
  )
}
```

**Key Changes**:
- ✅ Next.js 15 compatible with `await cookies()`
- ✅ Simplified cookie handling with `getAll()`/`setAll()`
- ✅ Proper error handling for Server Component limitations

#### 2. Client Utils (`utils/supabase/client.ts`)
**Before**: Complex PKCE configuration and manual cookie handling
**After**: Simple browser client

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Key Changes**:
- ✅ Automatic PKCE flow handling
- ✅ No manual cookie management needed
- ✅ Clean, minimal implementation

#### 3. Middleware (`middleware.ts`)
**Before**: Used deprecated `createMiddlewareClient`
**After**: Modern SSR middleware with automatic session refresh

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

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
  
  // Route protection logic...
}
```

**Key Changes**:
- ✅ Automatic session refresh
- ✅ Proper cookie synchronization
- ✅ PKCE-compatible session handling

#### 4. Auth Callback Route (`app/auth/callback/route.ts`)
**Before**: Complex token handling with multiple fallbacks
**After**: Clean session checking and code exchange

```typescript
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // Check for existing session first
  const { data: { session: existingSession } } = await supabase.auth.getSession()
  
  if (existingSession) {
    return NextResponse.redirect(new URL(next, request.url))
  }

  // Exchange code if available
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Fallback error handling...
}
```

**Key Changes**:
- ✅ Session-first approach
- ✅ Proper code exchange for PKCE
- ✅ Clean error handling

#### 5. Token Verification Route (`app/auth/v1/verify/route.ts`)
**Before**: Incorrectly tried to use PKCE tokens as authorization codes
**After**: Proper token verification with Supabase API

```typescript
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect_to') || '/dashboard'

  const supabase = await createClient()
  
  // Verify the PKCE token with Supabase
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: type as any,
  })

  if (error) {
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url))
  }

  if (data.session) {
    // Direct session created - redirect to destination
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  // Redirect to callback for final processing
  return NextResponse.redirect(new URL('/auth/callback', request.url))
}
```

**Key Changes**:
- ✅ **CRITICAL FIX**: Use `verifyOtp()` instead of treating PKCE tokens as auth codes
- ✅ Proper session creation
- ✅ Clean redirect flow

#### 6. Login Page (`app/auth/login/page.tsx`)
**Before**: Mixed OTP input and magic link flows
**After**: Pure magic link implementation

```typescript
const handleSignIn = async (e: React.FormEvent) => {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: `${location.origin}/auth/callback`,
    },
  })

  if (error) {
    setError(error.message)
  } else {
    setMessage('Check your email for the magic link!')
  }
}
```

**Key Changes**:
- ✅ Clean magic link flow only
- ✅ Proper redirect URL configuration
- ✅ Better UX with success messaging

### Phase 3: Authentication Flow

#### Complete Flow Diagram
```
1. User enters email on /auth/login
   ↓
2. signInWithOtp() sends magic link email
   ↓
3. User clicks link in email
   ↓
4. Email redirects to /auth/v1/verify?token=pkce_xxx&type=signup
   ↓
5. Verify route calls verifyOtp() with token_hash
   ↓
6. Supabase creates session and redirects to /auth/callback
   ↓
7. Callback route detects existing session
   ↓
8. User redirected to /dashboard (authenticated)
```

#### Key Success Indicators
```
=== VERIFICATION REQUEST ===
Token: pkce_17c2f...
Type: signup
Redirect To: http://localhost:8000/auth/callback
✅ Direct session created, redirecting to: http://localhost:8000/auth/callback

✅ Existing session found, redirecting to: /dashboard
GET /dashboard 200 in 2400ms
```

## Technical Details

### PKCE vs Implicit Flow
- **Before**: `flowType: 'implicit'` - deprecated and incompatible with magic links
- **After**: Automatic PKCE flow handling by `@supabase/ssr`

### Next.js 15 Compatibility
- **Issue**: `cookies()` must be awaited in app router
- **Solution**: `const cookieStore = await cookies()` in all server components

### Self-Hosted Supabase Considerations
- Works with custom Supabase URLs (e.g., `135.148.41.27:8000`)
- Requires proper environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=http://your-supabase-host:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing Verification

### Success Criteria
- ✅ Magic link email sent without errors
- ✅ Email link redirects properly through verify → callback → dashboard
- ✅ User session persists across page refreshes
- ✅ Protected routes (e.g., `/dashboard`) work correctly
- ✅ Middleware properly handles authentication state

### Test Steps
1. Navigate to `/auth/login`
2. Enter email address
3. Click "Send Magic Link"
4. Check email for magic link
5. Click magic link in email
6. Verify redirect to dashboard
7. Test protected route access
8. Test session persistence on refresh

## Common Issues & Solutions

### Issue: "Invalid flow state" errors
**Solution**: Ensure using `@supabase/ssr` instead of deprecated auth helpers

### Issue: Cookie access errors in Next.js 15
**Solution**: Always `await cookies()` before using cookie methods

### Issue: PKCE token treated as authorization code
**Solution**: Use `verifyOtp()` with `token_hash` parameter in verify route

### Issue: Session not persisting
**Solution**: Ensure middleware calls `supabase.auth.getUser()` for session refresh

## Files Modified

### Core Authentication Files
- `utils/supabase/server.ts` - Server-side Supabase client
- `utils/supabase/client.ts` - Client-side Supabase client  
- `middleware.ts` - Route protection and session management
- `app/auth/callback/route.ts` - Auth callback handler
- `app/auth/callback/page.tsx` - Auth callback page
- `app/auth/login/page.tsx` - Login form
- `app/auth/v1/verify/route.ts` - Token verification handler

### Package Changes
- Removed: `@supabase/auth-helpers-nextjs`
- Kept: `@supabase/supabase-js`, `@supabase/ssr`

## Future Maintenance

### Monitoring
- Watch for Supabase client library updates
- Monitor Next.js compatibility with new versions
- Check for new authentication best practices

### Potential Improvements
- Add proper error pages for authentication failures
- Implement admin-specific authentication flows
- Add session timeout handling
- Consider adding 2FA support

## References
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js 15 App Router Documentation](https://nextjs.org/docs)
- [PKCE Flow Specification](https://tools.ietf.org/html/rfc7636)

---

**Implementation Date**: January 2025  
**Status**: ✅ Completed and Working  
**Next.js Version**: 15  
**Supabase Version**: Self-hosted 