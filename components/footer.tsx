import Link from "next/link"

interface FooterProps {
  variant?: 'full' | 'minimal'
}

const Footer = ({ variant = 'full' }: FooterProps) => {
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/features" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link href="/ai-writing" className="hover:text-white transition-colors">AI Writing</Link></li>
              <li><Link href="/distribution" className="hover:text-white transition-colors">Distribution</Link></li>
              <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Compare</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/vs-prweb" className="hover:text-white transition-colors">vs. PRWeb</Link></li>
              <li><Link href="/vs-newswire" className="hover:text-white transition-colors">vs. Newswire</Link></li>
              <li><Link href="/vs-agencies" className="hover:text-white transition-colors">vs. PR Agencies</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/guides" className="hover:text-white transition-colors">PR Guides</Link></li>
              <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
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

export default Footer
