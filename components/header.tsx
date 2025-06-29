"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import AuthButton from "./auth/AuthButton"
import { useAuth } from "./auth/AuthProvider"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Use the centralized auth state instead of separate state management
  const { user, session, isLoading } = useAuth()
  const isLoggedIn = !!user
  const userEmail = user?.email || null

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isAuthPage = pathname.startsWith('/auth')

  // Don't render auth-dependent content while loading
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-brava-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-serif font-bold text-brava-900">
                  Brava<span className="text-accent">Press</span>
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-brava-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-serif font-bold text-brava-900">
                Brava<span className="text-accent">Press</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" className="nav-link">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="#features" className="nav-link">
                  Features
                </Link>
                <Link href="#pricing" className="nav-link">
                  Pricing
                </Link>
              </>
            )}
          </nav>

          {/* Auth State - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <span className="hidden sm:inline">{userEmail}</span>
                </div>
                <AuthButton />
              </div>
            ) : (
              <>
                <Button variant="outline" className="border-brava-300 text-brava-900 hover:bg-brava-50" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button className="bg-accent hover:bg-accent/90 text-white" asChild>
                  <Link href="/auth/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-brava-200">
          <div className="pt-2 pb-4 px-4 space-y-4">
            {isLoggedIn && (
              <>
                <Link 
                  href="/dashboard" 
                  className="block py-2 nav-link" 
                  onClick={toggleMenu}
                >
              Dashboard
                </Link>
                <Link 
                  href="/dashboard/profile" 
                  className="block py-2 nav-link" 
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
              </>
            )}
            
            {!isLoggedIn && (
              <>
                <Link 
                  href="#features" 
                  className="block py-2 nav-link" 
                  onClick={toggleMenu}
                >
                  Features
                </Link>
                <Link 
                  href="#pricing" 
                  className="block py-2 nav-link" 
                  onClick={toggleMenu}
                >
                  Pricing
                </Link>
              </>
            )}
            
            {isLoggedIn ? (
              <div className="pt-2">
                <div className="flex items-center space-x-2 py-2 px-3 mb-3 text-sm bg-brava-50 rounded-md">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-foreground">{userEmail}</span>
                </div>
                <AuthButton />
              </div>
            ) : (
              <div className="pt-2 flex flex-col space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-brava-300 text-brava-900 hover:bg-brava-50" 
                  asChild
                  onClick={toggleMenu}
                >
                  <Link href="/auth/login">
                    Sign In
                  </Link>
                </Button>
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-white" 
                  asChild
                  onClick={toggleMenu}
                >
                  <Link href="/auth/login">
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
