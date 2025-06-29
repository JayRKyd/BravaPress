'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { FullPageLoading } from '@/components/ui/loading'
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import UseCasesSection from "@/components/use-cases-section"
import ExamplesSection from "@/components/examples-section"
import PricingSection from "@/components/pricing-section"

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
    <>
      <HeroSection />
      <FeaturesSection />
      <UseCasesSection />
      <ExamplesSection />
      <PricingSection />
    </>
  )
}
