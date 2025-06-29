# BravaPress Authentication Setup

This document outlines the authentication system for BravaPress, including the magic link flow, database setup, and implementation details.

## Authentication Flow

### 1. User Login Process

1. **User Enters Email**
   - User visits `/auth/login`
   - Enters their email address
   - Clicks "Send Magic Link"

2. **Magic Link Email**
   - System calls `supabase.auth.signInWithOtp()`
   - Supabase sends an email with a magic link
   - User sees "Check your email" message

3. **User Clicks Magic Link**
   - Magic link contains a special code
   - Clicking redirects to `/auth/callback?code=xxx`

4. **Authentication Completion**
   - Callback page extracts the code
   - Calls `supabase.auth.exchangeCodeForSession(code)`
   - Supabase creates a session and returns a token

5. **Redirection to Dashboard**
   - User is redirected to `/dashboard`
   - Session token stored in cookies
   - Protected routes check this token

### 2. Profile Creation

When a new user signs up, a database trigger automatically creates a profile record:

```sql
-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Implementation Details

### Key Files

1. **Login Page**: `app/auth/login/page.tsx`
   - Handles email input
   - Initiates magic link process
   - Shows loading and success states

2. **Callback Handler**: `app/auth/callback/page.tsx`
   - Processes the magic link code
   - Exchanges code for session
   - Handles errors and redirects

3. **Protected Route Component**: `components/auth/ProtectedRoute.tsx`
   - Wraps protected pages
   - Checks authentication status
   - Redirects unauthenticated users

4. **Middleware**: `middleware.ts`
   - Runs on every request
   - Verifies authentication for protected routes
   - Handles redirects for unauthenticated users

5. **Profile Utilities**: `utils/supabase/profile.ts`
   - Functions to get and update user profiles
   - Type definitions for profile data

### Database Schema

1. **auth.users** (Managed by Supabase)
   - Stores authentication data
   - Created automatically by Supabase

2. **public.profiles**
   - Links to auth.users via foreign key
   - Stores additional user information
   - Created by our trigger on signup

## Troubleshooting

### Common Issues

1. **404 Error on Callback**
   - Ensure both `route.ts` and `page.tsx` aren't in the same directory
   - Verify the callback URL in Supabase settings
   - Check server logs for detailed errors

2. **Magic Link Not Working**
   - Verify SMTP settings in Supabase
   - Check that the Email provider is enabled
   - Ensure Site URL is correctly configured

3. **Authentication Not Persisting**
   - Check cookie settings
   - Verify middleware is correctly configured
   - Ensure the session is being properly stored

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing Authentication

1. Start the development server: `npm run dev`
2. Navigate to `/auth/login`
3. Enter your email and request a magic link
4. Check your email and click the link
5. You should be redirected to the dashboard
6. Verify that your profile was created in the database

## Security Considerations

1. **Row Level Security (RLS)**
   - Ensures users can only access their own data
   - Configured for all tables with user data

2. **Service Role Key**
   - Used only on the server side
   - Never exposed to the client

3. **Session Management**
   - Sessions expire after inactivity
   - Can be manually invalidated by signing out
