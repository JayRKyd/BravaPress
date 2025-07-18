"use client"

import Link from "next/link"

const Footer = ({ variant = 'full' }: { variant?: 'full' | 'minimal' }) => {
  if (variant === 'minimal') {
    return (
      <footer className="bg-gray-900 border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="text-white font-bold text-xl">BravaPress™</div>
              <div className="text-gray-400 text-sm">AI-Powered Press Release Distribution</div>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 BravaPress, Inc. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-32">
          {/* Product Section */}
          <div className="flex flex-col items-center space-y-4">
          <h3 className="text-white text-lg font-semibold">Product</h3>
            <Link 
              href="/faq" 
              className="text-gray-400 hover:text-white transition-colors" 
              aria-label="FAQ"
            >
              FAQ
            </Link>

            <Link 
              href="/pricing" 
              className="text-gray-400 hover:text-white transition-colors" 
              aria-label="Pricing"
            >
              Pricing
            </Link>
          </div>

          {/* Legal Section */}
          <div className="flex flex-col items-center space-y-4">
          <h3 className="text-white text-lg font-semibold">Legal</h3>
            <Link 
              href="/legal/privacy" 
              className="text-gray-400 hover:text-white transition-colors" 
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </Link>

            <Link 
              href="/legal/terms" 
              className="text-gray-400 hover:text-white transition-colors" 
              aria-label="Terms of Service"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          © 2025 BravaPress, Inc. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
