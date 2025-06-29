'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestAuthPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [anonData, setAnonData] = useState<any>(null)
  const [serviceData, setServiceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const testAuth = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Test client-side auth
        const supabase = createClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`)
        }
        
        setSessionData({
          exists: !!session,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email,
          } : null
        })
        
        // Test anon key access to database
        if (session) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .limit(1)
            
            setAnonData({
              success: !profileError,
              data: profileData,
              error: profileError ? profileError.message : null
            })
          } catch (e: any) {
            setAnonData({
              success: false,
              error: e.message || 'Unknown error'
            })
          }
        }
        
        // Test service role key access via API
        try {
          const response = await fetch('/api/test-tables/profiles')
          const data = await response.json()
          
          setServiceData({
            success: response.ok,
            data: data,
            status: response.status,
            error: !response.ok ? data.error : null
          })
        } catch (e: any) {
          setServiceData({
            success: false,
            error: e.message || 'Unknown error'
          })
        }
        
      } catch (err: any) {
        console.error('Error testing auth:', err)
        setError(err.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    testAuth()
  }, [])
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      {loading ? (
        <div className="text-center p-6">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Anon Key Database Access</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(anonData, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Service Role Key Database Access</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(serviceData, null, 2)}
            </pre>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="/dashboard" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Dashboard
            </a>
            <a 
              href="/auth/login" 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Go to Login
            </a>
            <button 
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
