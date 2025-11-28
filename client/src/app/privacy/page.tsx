import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ShopSphere',
  description: 'How we protect and handle your personal information',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-earth-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-earth-dark mb-8">Privacy Policy</h1>
        
        <div className="prose prose-earth max-w-none">
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <p className="text-earth-olive">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">Information We Collect</h2>
              <p className="text-earth-olive mb-3">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-earth-olive">
                <li>Name and contact information</li>
                <li>Payment and billing information</li>
                <li>Shipping address</li>
                <li>Order history and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">How We Use Your Information</h2>
              <p className="text-earth-olive mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-earth-olive">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders</li>
                <li>Improve our products and services</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">Data Security</h2>
              <p className="text-earth-olive">
                We implement appropriate security measures to protect your personal information 
                from unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">Your Rights</h2>
              <p className="text-earth-olive mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-earth-olive">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">Contact Us</h2>
              <p className="text-earth-olive">
                If you have questions about this Privacy Policy, please contact us at privacy@shopsphere.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
