'use client'

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import AuthProvider from './auth/AuthProvider'

type ProvidersProps = ThemeProviderProps & {
  children: React.ReactNode
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <NextThemesProvider {...props}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </NextThemesProvider>
  )
}
