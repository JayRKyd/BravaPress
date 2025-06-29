'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { FullPageLoading } from '@/components/ui/loading'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (authError) throw authError
        
        if (!session) {
          // Redirect to login with the current path as the return URL
          const returnUrl = encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)
          router.push(`/auth/login?redirectedFrom=${returnUrl}`)
          return
        }
      } catch (err) {
        console.error('Error checking auth status:', err)
        setError('An error occurred while checking your authentication status.')
        // Still redirect to login but with error state
        router.push('/auth/login?error=auth_check_failed')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname, searchParams, supabase])

  if (isLoading) {
    return <FullPageLoading />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="text-destructive">
            <h2 className="text-xl font-semibold">Authentication Error</h2>
            <p className="mt-2">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
