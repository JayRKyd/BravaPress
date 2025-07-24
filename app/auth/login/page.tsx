'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!agreedToTerms) {
      setError('You need to agree to the terms of service and privacy policy to proceed')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const supabase = createClient()
      
      // Build callback URL with redirect parameter
      const callbackUrl = new URL('/auth/callback', location.origin)
      if (redirectTo) {
        callbackUrl.searchParams.set('next', redirectTo)
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for the login link!')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign in to BravaPress</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive your signup/login link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm leading-5 text-muted-foreground">
                I agree to the{' '}
                <Link href="/legal/terms" className="text-primary hover:underline" target="_blank">
                  Terms and Conditions (including editorial guidelines)
                </Link>{' '}
                and the{' '}
                <Link href="/legal/privacy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </Link>
              </label>
            </div>
            
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading || !agreedToTerms}>
              {loading ? 'Sending...' : 'Send me a login link'}
            </Button>
            
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                {message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
