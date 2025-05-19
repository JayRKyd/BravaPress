"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CheckCircle } from "lucide-react"

const PricingSection = () => {
  const [billingAnnually, setBillingAnnually] = useState(true)

  const toggleBilling = () => {
    setBillingAnnually(!billingAnnually)
  }

  // Price data with both monthly and annual options
  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small startups",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "5 AI-generated press releases per month",
        "Distribution to 500+ media outlets",
        "Basic analytics dashboard",
        "Email support",
      ],
      mostPopular: false,
      buttonVariant: "outline" as const,
    },
    {
      name: "Professional",
      description: "Ideal for growing businesses and agencies",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "15 AI-generated press releases per month",
        "Distribution to 2,000+ media outlets",
        "Advanced analytics and reporting",
        "Guaranteed publication on 3 top-tier sites",
        "Priority support",
      ],
      mostPopular: true,
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      description: "For large organizations with extensive PR needs",
      monthlyPrice: 199,
      annualPrice: 159,
      features: [
        "Unlimited AI-generated press releases",
        "Distribution to 5,000+ media outlets",
        "Comprehensive analytics with competitor tracking",
        "Guaranteed publication on 10 top-tier sites",
        "Dedicated account manager",
        "Custom distribution lists",
      ],
      mostPopular: false,
      buttonVariant: "outline" as const,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-brava-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple, <span className="text-accent">Transparent</span> Pricing
          </h2>
          <p className="text-lg text-brava-600 mb-8">
            Choose the perfect plan for your PR needs with our flexible pricing options.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${billingAnnually ? "text-brava-500" : "text-brava-900"}`}>
              Monthly
            </span>
            <Switch checked={billingAnnually} onCheckedChange={toggleBilling} />
            <div className="flex items-center">
              <span className={`text-sm font-medium ${billingAnnually ? "text-brava-900" : "text-brava-500"}`}>
                Annual
              </span>
              <span className="ml-2 text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">Save 20%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl overflow-hidden ${
                plan.mostPopular
                  ? "bg-white border-2 border-accent shadow-lg shadow-accent/20 transform md:-translate-y-4"
                  : "bg-white border border-brava-200"
              }`}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 inset-x-0 bg-accent text-white text-center text-sm py-1 font-medium">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.mostPopular ? "pt-10" : ""}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-brava-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-4xl font-bold">
                      ${billingAnnually ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-brava-600 ml-2">/month</span>
                  </div>
                  {billingAnnually && (
                    <p className="text-sm text-green-600 mt-1">Billed annually (${plan.annualPrice * 12}/year)</p>
                  )}
                </div>

                <Button
                  variant={plan.buttonVariant}
                  className={`w-full mb-8 ${plan.mostPopular ? "bg-accent hover:bg-accent/90 text-white" : ""}`}
                >
                  Get Started
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-brava-600 mb-4">Need a custom solution for your organization?</p>
          <Button variant="outline" className="border-brava-300">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
