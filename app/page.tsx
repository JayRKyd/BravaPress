'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { FullPageLoading } from '@/components/ui/loading'
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Star, TrendingUp, Globe, BarChart3, Users, Zap, Shield, Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.replace('/dashboard')
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return <FullPageLoading />
  }

  return (
      <div className="min-h-screen bg-white">
        {/* Navigation Header */}
        <Header />
  
        {/* Hero Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                  Get Featured on Major News Sites in days{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  - Guaranteed
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                BravaPress delivers AI-assisted press releases, distributed through guaranteed premium media channels—without agency retainers or long delays.{' '}
                  <span className="font-semibold text-gray-900">Perfect for product launches, company milestones, thought leadership, or building authority and SEO</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-medium rounded-lg"
                    asChild
                  >
                    <Link href="/auth/login">
                      Get Published
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium rounded-lg"
                  >
                    <Link href="/pricing">
                      See Pricing
                    </Link>
                  </Button>
                </div>
              </motion.div>
  
              {/* Right Column - Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center items-center"
              >
                <Image
                  src="/PressConference.png"
                  alt="Press conference illustration"
                  width={600}
                  height={450}
                  className="object-contain w-full max-w-2xl"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </section>
  
        {/* Trust/Partners Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-gray-600 font-medium">
              Distributed via 100+ Media Partners to 170M+ Monthly Readers
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {/* Google News */}
              <div className=" hover:opacity-100 transition-opacity">
                <Image 
                  src="/news-1.png" 
                  alt="Google News" 
                  width={120} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              
              {/* AP */}
              <div className=" hover:opacity-100 transition-opacity">
                <Image 
                  src="/news-2.png" 
                  alt="Associated Press" 
                  width={80} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              
              {/* Benzinga */}
              <div className=" hover:opacity-100 transition-opacity">
                <Image 
                  src="/news-3.png" 
                  alt="Benzinga" 
                  width={120} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              
              {/* ABC */}
              <div className=" hover:opacity-100 transition-opacity">
                <Image 
                  src="/news-4.png" 
                  alt="ABC News" 
                  width={80} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              
              {/* FOX */}
              <div className=" hover:opacity-100 transition-opacity">
                <Image 
                  src="/news-5.png" 
                  alt="FOX News" 
                  width={80} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              
              {/* NBC */}
              <div className=" hover:opacity-100 transition-opacity">
                <Image 
                  src="/news-6.png" 
                  alt="NBC News" 
                  width={80} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              
              {/* Bloomberg Terminal */}
              <div className=" hover:opacity-100 transition-opacity">
                <Image 
                  src="/news-7.png" 
                  alt="Bloomberg Terminal" 
                  width={160} 
                  height={40} 
                  className="object-contain"
                />
              </div>
              
              {/* Yahoo News */}
              <div className=" hover:opacity-100 transition-opacity">
                <Image 
                  src="/news-8.png" 
                  alt="Yahoo News" 
                  width={120} 
                  height={40} 
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>
  
        {/* Before/After Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Before
                </span>{' '}
                vs After BravaPress
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See how BravaPress transforms your PR strategy from scattered efforts
                <br />
                to streamlined, professional media coverage.
              </p>
            </div>
  
            {/* Before/After Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Before Section */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
                  BEFORE BRAVAPRESS
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      No media coverage or third-party validation
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      Poor SEO authority and low Google visibility
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      Low customer trust, leading to lost sales
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      Complicated, expensive PR agencies
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      No control over content or distribution
                    </span>
                  </li>
                </ul>
              </div>
  
              {/* After Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-wide">
                  AFTER BRAVAPRESS
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      Your business featured on top-tier news sites
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      SEO-boosting backlinks from high DA media outlets
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      AI-generated press release that you can review and edit before approval
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      Clear, one-time pricing—no retainers or contracts
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">
                      Full distribution report with live publication links
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
  
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Section */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Centralize
                </span>{' '}
                Your PR. Create Fast. Distribute Instantly.
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                No more jumping between writing tools, wire services, and inboxes.
                <br />
                BravaPress lets you create polished press releases with AI and distribute them instantly to a high-visibility media network—without subscriptions, contracts, or PR agencies.
              </p>
            </div>
  
            {/* Center Image */}
            <div className="flex justify-center mb-16">
              <Image 
                src="/Announcement 07.png" 
                alt="Two people announcing with megaphones" 
                width={200} 
                height={200} 
                className="object-contain"
              />
            </div>
  
            {/* Bottom Section */}
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Create Once.{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Launch Everywhere.
                </span>
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Built for founders, marketers, and creators who need PR without the fluff.
                <br />
                With BravaPress, your entire press workflow—from copywriting to distribution—is handled in one place.
              </p>
            </div>
          </div>
        </section>
  
        {/* Detailed Features Showcase */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Feature 1: Write It with AI */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    <span>✍️</span>
                    <span>Write It with AI</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Let AI generate your press release in seconds
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Our press-release-trained AI creates a professional, media-ready draft.
                    Just enter your news and key details.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Smart headline + subheadline generation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Media-ready tone and format</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Optional call-to-action and quotes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">30+ language support</span>
                    </li>
                  </ul>
                  {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Explore AI Writing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button> */}
                </div>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl p-6 border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">AI Writing Assistant</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xs font-bold">AI</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">Generated Headlines:</div>
                        <div className="space-y-2">
                          <div className="bg-white rounded p-2 text-sm">"Company Launches Revolutionary AI Platform"</div>
                          <div className="bg-white rounded p-2 text-sm">"Breaking: New AI Technology Transforms Industry"</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs text-blue-600 font-medium">Tone</div>
                          <div className="text-sm text-gray-900">Professional</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-xs text-green-600 font-medium">Language</div>
                          <div className="text-sm text-gray-900">English</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Feature 2: Distribute Everywhere */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-white rounded-2xl shadow-xl p-6 border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Distribution Network</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-xs font-bold">📡</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-50 rounded p-2 text-center">
                          <div className="text-xs font-medium text-blue-600">Google News</div>
                        </div>
                        <div className="bg-red-50 rounded p-2 text-center">
                          <div className="text-xs font-medium text-red-600">AP News</div>
                        </div>
                        <div className="bg-green-50 rounded p-2 text-center">
                          <div className="text-xs font-medium text-green-600">Benzinga</div>
                        </div>
                        <div className="bg-purple-50 rounded p-2 text-center">
                          <div className="text-xs font-medium text-purple-600">NBC</div>
                        </div>
                        <div className="bg-orange-50 rounded p-2 text-center">
                          <div className="text-xs font-medium text-orange-600">FOX</div>
                        </div>
                        <div className="bg-indigo-50 rounded p-2 text-center">
                          <div className="text-xs font-medium text-indigo-600">ABC</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Reach</div>
                        <div className="text-lg font-bold text-gray-900">170M+ Monthly Readers</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    <span>📡</span>
                    <span>Distribute Everywhere</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Reach millions through top-tier media networks
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    BravaPress syndicates your story across 100+ media partners
                    to maximize your reach and impact.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Major news sites including Google News, AP, Benzinga</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Affiliate sites of NBC, FOX, ABC, CBS</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Leading financial terminals (Bloomberg, Moody's)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Social platforms and mobile news apps</span>
                    </li>
                  </ul>
                  {/* <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Explore Distribution
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button> */}
                </div>
              </div>
            </div>
  
            {/* Feature 3: Get Seen & Indexed */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    <span>🔍</span>
                    <span>Get Seen & Indexed</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Build long-term SEO value and digital presence
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Your press release becomes part of the global digital conversation,
                    indexed and discoverable for years to come.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Indexed by search engines for long-term SEO value</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Discovered by AI-powered tools and aggregators</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Shared via social feeds with hashtag customization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Published to high-authority domains for credibility</span>
                    </li>
                  </ul>
                  {/* <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Explore SEO Benefits
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button> */}
                </div>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl p-6 border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">SEO Performance</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs font-bold">📈</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">Search Visibility</div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">+285%</div>
                        <div className="text-xs text-green-600">↗ 12% increase this month</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs text-blue-600 font-medium">Backlinks</div>
                          <div className="text-lg font-bold text-gray-900">1,247</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="text-xs text-purple-600 font-medium">DA Score</div>
                          <div className="text-lg font-bold text-gray-900">85+</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Feature 4: Track Performance */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl p-6 border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Performance Goals</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-xs font-bold">🎯</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Media placements</span>
                          <span className="text-sm font-medium text-gray-900">112.6k</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total reach</span>
                          <span className="text-sm font-medium text-gray-900">584.7k</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Backlinks generated</span>
                          <span className="text-sm font-medium text-gray-900">5.1k</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">SEO improvement</span>
                          <span className="text-sm font-medium text-gray-900">35.2%</span>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 mt-4">
                        <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
                        <div className="text-3xl font-bold text-green-600 mb-1">56%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '56%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    <span>🎯</span>
                    <span>Track Performance</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Monitor your PR success in real-time
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Get detailed analytics on where your story appears and how it performs
                    across different media outlets and platforms.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Live list of publication placements</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Track engagement and reach metrics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Monitor SEO impact and backlink growth</span>
                    </li>
                  </ul>
                  {/* <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    Explore Tracking
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button> */}
                </div>
              </div>
            </div>
  
            {/* Feature 5: Global Reach */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    <span>🌍</span>
                    <span>Go Global</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Reach audiences worldwide with targeted distribution
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Distribute your press releases by language, location, or industry vertical
                    to maximize relevance and impact in specific markets.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Multi-language distribution support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Geographic targeting by region or country</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Industry-specific media outlet selection</span>
                    </li>
                  </ul>
                  {/* <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Explore Global Reach
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button> */}
                </div>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl p-6 border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Global Forecasting</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs font-bold">🌍</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">Projected Reach</div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">148,384</div>
                        <div className="text-xs text-blue-600">Monthly readers across regions</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">North America</span>
                          <span className="text-xs font-medium text-gray-900">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Europe</span>
                          <span className="text-xs font-medium text-gray-900">28%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Asia Pacific</span>
                          <span className="text-xs font-medium text-gray-900">18%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Other regions</span>
                          <span className="text-xs font-medium text-gray-900">9%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Feature 6: Competitive Analysis */}

          </div>
        </section>
  

        {/* Footer CTA Section */}
        <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-600/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-600/20 to-transparent rounded-full transform -translate-x-16 translate-y-16"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get your news published in{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                5 minutes
              </span>{' '}
              or less
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Join thousands of businesses getting featured on major news sites with AI-powered press release distribution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3"
                asChild
              >
                <Link href="/auth/login">
                  Get Published
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-gray-800 text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-3"
                asChild
              >
                <Link href="/pricing">
                  See Pricing
                </Link>
              </Button>
            </div>
            
            {/* <div className="text-left max-w-4xl mx-auto">
              <p className="text-sm text-gray-400 mb-4">Latest from our blog</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    AI-Powered Press Releases: The Future of PR Distribution
                  </h4>
                  <p className="text-gray-400">
                    How artificial intelligence is transforming the way businesses create and distribute press releases for maximum media coverage.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    SEO Best Practices: Building Authority Through Press Coverage
                  </h4>
                  <p className="text-gray-400">
                    Learn how strategic press release distribution can boost your search rankings and build long-term domain authority.
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </section>
  
      </div>
    )
}
