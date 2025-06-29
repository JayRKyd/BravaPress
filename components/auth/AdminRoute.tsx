'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error || !currentUser) {
          router.push('/auth/login')
          return
        }

        setUser(currentUser)

        // Check if user is admin in database
        const { data: adminUser, error: adminCheckError } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', currentUser.id)
          .eq('is_active', true)
          .single()

        if (adminCheckError || !adminUser) {
          console.log('Admin check failed:', adminCheckError)
          router.push('/dashboard')
          return
        }

        console.log('Admin access granted:', adminUser)
        setIsAdmin(true)
        setLoading(false)

      } catch (error) {
        console.error('Error checking admin access:', error)
        router.push('/auth/login')
      }
    }

    checkAdminAccess()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this area.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
