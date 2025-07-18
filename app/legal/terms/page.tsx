"use client"

export default function TermsPage() {
  return (
    <section className="py-20 bg-brava-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl overflow-hidden border border-brava-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none text-brava-600">
            <p className="text-sm text-brava-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing and using BravaPress's press release distribution services, you agree to be bound by these Terms 
                of Service. If you disagree with any part of these terms, you may not access or use our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="mb-4">
                BravaPress provides AI-powered press release writing and distribution services. Our services include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI-assisted press release generation</li>
                <li>Distribution to media outlets and news platforms</li>
                <li>Analytics and reporting</li>
                <li>Media coverage tracking</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and truthful information in your press releases</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not use our service for any unlawful purpose</li>
                <li>Not submit content that infringes on intellectual property rights</li>
                <li>Not distribute spam, malware, or harmful content</li>
                <li>Review and approve all AI-generated content before distribution</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment is required before press release distribution</li>
                <li>All fees are non-refundable unless distribution fails</li>
                <li>Prices are subject to change with notice</li>
                <li>You are responsible for all applicable taxes</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content Guidelines</h2>
              <p className="mb-4">Press releases must not contain:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>False or misleading information</li>
                <li>Defamatory statements</li>
                <li>Intellectual property infringement</li>
                <li>Explicit or inappropriate content</li>
                <li>Promotional content without proper disclosure</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Distribution and Publication</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not guarantee publication by specific media outlets</li>
                <li>Distribution timing may vary based on editorial review</li>
                <li>Content may be edited for clarity or format requirements</li>
                <li>You retain ownership of your press release content</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p>
                BravaPress is not liable for any indirect, incidental, special, consequential, or punitive damages resulting 
                from your use of our services. Our liability is limited to the amount paid for the specific service in question.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
              <p>
                While we strive for 100% uptime, we do not guarantee uninterrupted access to our services. We reserve the 
                right to modify, suspend, or discontinue any part of our service with notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p>
                The BravaPress platform, including its software, design, and AI technology, is protected by intellectual 
                property rights. You may not copy, modify, or reverse engineer any part of our service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p>
                We reserve the right to terminate or suspend access to our services for violations of these terms or for 
                any other reason at our discretion. You may terminate your use of our services at any time.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p>
                We may modify these terms at any time. Continued use of our services after changes constitutes acceptance 
                of the modified terms. We will notify users of significant changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p>
                For questions about these terms, please contact us at:
              </p>
              <div className="mt-4">
                <p>Email: legal@bravapress.com</p>
                <p>Address: [Your Business Address]</p>
                <p>Phone: [Your Phone Number]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
} 