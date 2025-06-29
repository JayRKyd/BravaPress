'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to our error logging system
    this.logError(error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Send error to our logging endpoint
      await fetch('/api/errors/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.errorId && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Error ID: <code className="bg-gray-100 px-1 rounded">{this.state.errorId}</code>
                  </p>
                </div>
              )}

              {/* Show error details in development */}
              {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                    <div className="text-red-600 font-bold">{this.state.error.message}</div>
                    {this.state.error.stack && (
                      <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Specialized error boundaries for different parts of the app
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showDetails={true}
      fallback={
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dashboard Error</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading the dashboard. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Dashboard
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">Form Error</h3>
          </div>
          <p className="text-red-700 text-sm mt-1">
            There was an error with this form. Please refresh the page and try again.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showDetails={true}
      fallback={
        <div className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Admin Panel Error</h2>
          <p className="text-muted-foreground mb-6">
            There was an error in the admin panel. This has been logged for investigation.
          </p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reload Panel
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
} 