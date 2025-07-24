"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Clock, Building } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would go here
    console.log("Form submitted:", formData)
  }

  return (
    <section className="py-20 bg-brava-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-brava-600 max-w-2xl mx-auto">
            Have questions about our press release service? Our team is here to help you get your story published.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="bg-white rounded-xl p-8 border border-brava-200">
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Email Us</h3>
                  <p className="text-brava-600">support@bravapress.com</p>
                  <p className="text-sm text-brava-500">For general inquiries and support</p>
                </div>
              </div>



              <div className="flex items-start gap-4">
                <Building className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Business Inquiries</h3>
                  <p className="text-brava-600">sales@bravapress.com</p>
                  <p className="text-sm text-brava-500">For enterprise solutions and partnerships</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-accent mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Response Time</h3>
                  <p className="text-brava-600">2–3 business days</p>
                  <p className="text-sm text-brava-500">We aim to respond to all inquiries within 2–3 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 border border-brava-200">
            <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brava-900 mb-2">
                  Your Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brava-900 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-brava-900 mb-2">
                  Company Name
                </label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-brava-900 mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="h-32"
                />
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
} 