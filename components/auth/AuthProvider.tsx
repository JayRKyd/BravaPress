'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { FullPageLoading } from '@/components/ui/loading'
import { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Create client only when component is mounted (client-side)
        const supabase = createClient()
        
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
        }
        
        // Set up auth state change listener without redirect logic
        // Let middleware handle redirects to avoid conflicts
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event, newSession?.user?.email)
            
            if (newSession) {
              setSession(newSession)
              setUser(newSession.user)
              console.log('Session established in AuthProvider')
            } else {
              setSession(null)
              setUser(null)
              console.log('Session cleared in AuthProvider')
            }
          }
        )
        
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error setting up auth:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    setupAuth()
  }, [router, pathname])
  
  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }
  
  // Provide the auth context value
  const value = {
    user,
    session,
    isLoading,
    signOut
  }
  
  // Show loading state while checking auth
  if (isLoading) {
    return <FullPageLoading />
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
