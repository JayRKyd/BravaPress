'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        // Check if user is now authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard')
        } else {
          // No user found, redirect to login
          router.push('/auth/login?error=auth_failed')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/auth/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  )
}
