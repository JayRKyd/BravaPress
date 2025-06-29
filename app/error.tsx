'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to our error tracking system
    const logError = async () => {
      try {
        await fetch('/api/errors/client', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            type: 'page_error'
          })
        })
      } catch (logError) {
        console.error('Failed to log error:', logError)
      }
    }

    logError()
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Something went wrong!</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.digest && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Error ID: <code className="bg-gray-100 px-1 rounded">{error.digest}</code>
              </p>
            </div>
          )}

          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                <div className="text-red-600 font-bold">{error.message}</div>
                {error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={reset} className="flex-1">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="flex-1"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 