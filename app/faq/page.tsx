"use client"

import { Button } from "@/components/ui/button"

const faqs = [
  {
    question: "What if it doesn't get published?",
    answer: "We guarantee placements or you get a full refund."
  },
  {
    question: "Will this help my SEO?",
    answer: "Yes—your release includes real, indexable backlinks from high-DA sites like Yahoo! News and AP News."
  },
  {
    question: "Can I control the content?",
    answer: "Absolutely. You'll receive the AI-generated draft and can edit it as much as you like before giving final approval."
  },
  {
    question: "How long does the process take?",
    answer: (
      <div className="space-y-2">
        <p><span className="font-medium">Draft delivered:</span> immediate</p>
        <p><span className="font-medium">Review & edit:</span> on your schedule</p>
        <p><span className="font-medium">Distribution:</span> within 1–2 business days after your approval</p>
      </div>
    )
  },
  {
    question: "Any hidden fees or upsells?",
    answer: "No. Just one simple, flat price per campaign."
  }
]

export default function FAQPage() {
  return (
    <section className="py-20 bg-brava-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Addressing Common Questions
          </h1>
        </div>

        <div className="bg-white rounded-xl overflow-hidden border border-brava-200 divide-y divide-brava-100">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 hover:bg-brava-50/50 transition-colors">
              <h2 className="text-xl font-semibold mb-3 flex items-start gap-3">
                <span className="text-accent">❓</span>
                {faq.question}
              </h2>
              <div className="text-brava-600 pl-8">
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-brava-600 mb-6">
            Ready to get your story published?
          </p>
          <Button 
            className="bg-accent hover:bg-accent/90 text-white px-8"
            onClick={() => window.location.href = '/pricing'}
          >
            View Pricing
          </Button>
        </div>
      </div>
    </section>
  )
} 