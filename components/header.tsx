"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
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
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#use-cases" className="nav-link">
              Use Cases
            </a>
            <a href="#examples" className="nav-link">
              Examples
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
          </nav>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-brava-300 text-brava-900 hover:bg-brava-50" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-white" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
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
            <a href="#features" className="block py-2 nav-link" onClick={toggleMenu}>
              Features
            </a>
            <a href="#use-cases" className="block py-2 nav-link" onClick={toggleMenu}>
              Use Cases
            </a>
            <a href="#examples" className="block py-2 nav-link" onClick={toggleMenu}>
              Examples
            </a>
            <a href="#pricing" className="block py-2 nav-link" onClick={toggleMenu}>
              Pricing
            </a>
            <div className="pt-2 flex flex-col space-y-3">
              <Button variant="outline" className="w-full border-brava-300 text-brava-900 hover:bg-brava-50" asChild>
                <Link href="/login" onClick={toggleMenu}>
                  Sign In
                </Link>
              </Button>
              <Button className="w-full bg-accent hover:bg-accent/90 text-white" asChild>
                <Link href="/login" onClick={toggleMenu}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
