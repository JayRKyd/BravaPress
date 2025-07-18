"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: "📡",
    text: "Distribution to high-authority news outlets"
  },
  {
    icon: "🖼️",
    text: "Support for images, video, logos"
  },
  {
    icon: "🔗",
    text: "SEO-optimized links to live publications"
  },
  {
    icon: "📄",
    text: "Full media coverage report"
  },
  {
    icon: "🌍",
    text: "Target by country or industry"
  },
  {
    icon: "⚡",
    text: "Same-day distribution (business hours)"
  }
]

export default function PricingPage() {
  return (
    <section className="py-20 bg-brava-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            💰 Simple, <span className="text-accent">Transparent</span> Pricing
          </h1>
          <p className="text-lg text-brava-600 mb-8">
            No Contracts. No Retainers. Pay Only When You Publish.
          </p>
          <p className="text-lg text-brava-600">
            Get a professionally written, AI-generated press release and real distribution to top media channels—for a flat rate. No hidden fees. No subscriptions.
          </p>
        </div>

        <div className="bg-white rounded-xl overflow-hidden border-2 border-accent shadow-lg shadow-accent/20 p-8">
          <h2 className="text-2xl font-bold mb-4">✅ What You Get for $395</h2>
          <p className="text-brava-600 mb-8">One-Time Payment. Everything Included.</p>

          <div className="mb-8">
            <div className="flex justify-between items-center border-b border-brava-100 py-4">
              <span className="font-medium">Plan</span>
              <span className="font-medium">Price</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-lg">Single Release</span>
              <span className="text-3xl font-bold">$395</span>
            </div>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{feature.icon}</span>
                <span className="text-brava-600">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button className="w-full bg-accent hover:bg-accent/90 text-white">
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 