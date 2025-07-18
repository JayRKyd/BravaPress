"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import AuthButton from "./auth/AuthButton"
import { useAuth } from "./auth/AuthProvider"

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Use the centralized auth state instead of separate state management
  const { user, session, isLoading } = useAuth()
  const isLoggedIn = !!user
  const userEmail = user?.email || null

  const isAuthPage = pathname.startsWith('/auth')

  // Don't render auth-dependent content while loading
  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Image
                  src="/images/bravapress-logoandname(1).png"
                  alt="BravaPress Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16"
                />

              </div>
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
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/bravapress-logoandname.png"
                alt="BravaPress Logo"
                width={180}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!isLoggedIn && (
              <>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                  Pricing
                </Link>
                <Link href="/faq" className="text-gray-600 hover:text-gray-900 font-medium">
                  FAQ
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* CTA Button & Auth State - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="hidden sm:inline">{userEmail}</span>
                </div>
                <AuthButton />
              </div>
            ) : (
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
                asChild
              >
                <Link href="/auth/login">
                  Get Published
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {!isLoggedIn && (
                <>
                  <Link 
                    href="/pricing" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="/faq" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}
              
              {isLoggedIn ? (
                <div className="pt-2">
                  <div className="flex items-center space-x-2 py-2 px-3 mb-3 text-sm bg-blue-50 rounded-md">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-foreground">{userEmail}</span>
                  </div>
                  <AuthButton />
                </div>
              ) : (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium w-fit"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/auth/login">
                    Get Published
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
