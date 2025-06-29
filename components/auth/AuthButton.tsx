'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { useAuth } from './AuthProvider'

export default function AuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-foreground hover:bg-accent/10 hover:text-foreground"
    >
      {isLoading ? (
        <LoadingSpinner className="mr-2 h-4 w-4" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Sign out
    </Button>
  )
}
