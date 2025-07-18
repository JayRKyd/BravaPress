"use client"

export default function PrivacyPage() {
  return (
    <section className="py-20 bg-brava-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl overflow-hidden border border-brava-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none text-brava-600">
            <p className="text-sm text-brava-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p>
                BravaPress ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our press release 
                distribution service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Name and contact information</li>
                <li>Company details</li>
                <li>Billing information</li>
                <li>Email address</li>
                <li>Phone number</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Press Release Content</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Press release text and media</li>
                <li>Distribution preferences</li>
                <li>Target audience information</li>
                <li>Publication history</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">Technical Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Usage statistics</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our press release distribution service</li>
                <li>To process your payments and transactions</li>
                <li>To distribute your press releases to media outlets</li>
                <li>To generate analytics and performance reports</li>
                <li>To communicate with you about your account and service</li>
                <li>To improve our services and user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
              <p className="mb-4">
                We share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Media outlets and distribution partners (for press release distribution)</li>
                <li>Payment processors (for billing purposes)</li>
                <li>Analytics providers (in aggregate form)</li>
                <li>Legal authorities (when required by law)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information from unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
                storage is 100% secure.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, 
                and understand where our visitors come from. You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new 
                privacy policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <div className="mt-4">
                <p>Email: privacy@bravapress.com</p>
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