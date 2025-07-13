'use client'

import { usePathname } from 'next/navigation'
import Header from "@/components/header"
import Footer from "@/components/footer"

function getLayoutConfig(pathname: string) {
  // Legal pages - show header and minimal footer
  if (pathname === '/privacy-policy' || pathname === '/terms-of-service') {
    return {
      showHeader: true,
      showFooter: true,
      footerVariant: 'minimal' as const
    }
  }

  // Homepage - don't show header (manually included), show full footer
  if (pathname === '/') {
    return {
      showHeader: false,
      showFooter: true,
      footerVariant: 'full' as const
    }
  }

  // Auth pages - show header only
  if (pathname === '/auth/login' || pathname === '/auth/verify') {
    return {
      showHeader: true,
      showFooter: false,
      footerVariant: 'minimal' as const
    }
  }

  // Dashboard pages - show header but no footer
  if (pathname.startsWith('/dashboard')) {
    return {
      showHeader: true, // Show main header above dashboard
      showFooter: false,
      footerVariant: 'minimal' as const
    }
  }

  // Default - show both with full footer
  return {
    showHeader: true,
    showFooter: true,
    footerVariant: 'full' as const
  }
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { showHeader, showFooter, footerVariant } = getLayoutConfig(pathname)

  return (
    <>
      {showHeader && <Header />}
      <main>{children}</main>
      {showFooter && <Footer variant={footerVariant} />}
    </>
  )
} 