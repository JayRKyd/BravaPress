'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseUrl, setSupabaseUrl] = useState<string>('')
  const supabase = createClient()
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get the Supabase URL from environment
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Unknown'
        setSupabaseUrl(url)
        
        // Check session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }
        
        setSessionInfo({
          hasSession: !!data.session,
          user: data.session?.user ? {
            id: data.session.user.id,
            email: data.session.user.email,
            lastSignInAt: data.session.user.last_sign_in_at,
            metadata: data.session.user.user_metadata,
          } : null,
          expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toLocaleString() : null,
        })
      } catch (err: any) {
        console.error('Error checking session:', err)
        setError(err.message || 'An error occurred while checking the session')
        setSessionInfo(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
  }, [supabase])
  
  const handleSignOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Refresh the page to update session info
      window.location.reload()
    } catch (err: any) {
      console.error('Error signing out:', err)
      setError(err.message || 'An error occurred while signing out')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        <h1 className="text-3xl font-bold text-foreground">Authentication Debug</h1>
        
        <div className="p-4 bg-muted rounded-md">
          <h2 className="text-xl font-semibold mb-2">Environment</h2>
          <p><strong>Supabase URL:</strong> {supabaseUrl}</p>
          <p><strong>Running at:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server'}</p>
        </div>
        
        {loading ? (
          <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
            Loading session information...
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <h2 className="text-xl font-semibold mb-2">Session Status</h2>
              <p><strong>Has active session:</strong> {sessionInfo?.hasSession ? 'Yes' : 'No'}</p>
              {sessionInfo?.expiresAt && (
                <p><strong>Expires at:</strong> {sessionInfo.expiresAt}</p>
              )}
            </div>
            
            {sessionInfo?.user && (
              <div className="p-4 bg-muted rounded-md">
                <h2 className="text-xl font-semibold mb-2">User Information</h2>
                <p><strong>User ID:</strong> {sessionInfo.user.id}</p>
                <p><strong>Email:</strong> {sessionInfo.user.email}</p>
                <p><strong>Last Sign In:</strong> {sessionInfo.user.lastSignInAt || 'Unknown'}</p>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">User Metadata</h3>
                  <pre className="bg-background p-3 rounded-md overflow-x-auto text-sm">
                    {JSON.stringify(sessionInfo.user.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              {sessionInfo?.hasSession ? (
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive disabled:opacity-50"
                >
                  Sign Out
                </button>
              ) : (
                <a
                  href="/auth/login"
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Go to Login
                </a>
              )}
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-border">
          <h2 className="text-xl font-semibold mb-2">Debug Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/auth/login"
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-muted text-center"
            >
              Go to Login Page
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-muted text-center"
            >
              Go to Dashboard
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-muted"
            >
              Refresh Session Info
            </button>
            <a
              href="/auth/callback?code=debug_mode"
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-muted text-center"
            >
              Test Callback Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
