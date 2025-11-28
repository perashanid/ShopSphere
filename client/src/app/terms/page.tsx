import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ShopSphere',
  description: 'Terms and conditions for using ShopSphere',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-earth-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-earth-dark mb-8">Terms of Service</h1>
        
        <div className="prose prose-earth max-w-none">
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <p className="text-earth-olive">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">1. Acceptance of Terms</h2>
              <p className="text-earth-olive">
                By accessing and using ShopSphere, you accept and agree to be bound by these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">2. Use of Service</h2>
              <p className="text-earth-olive">
                You agree to use our service only for lawful purposes and in accordance with these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">3. Account Responsibilities</h2>
              <p className="text-earth-olive">
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">4. Product Information</h2>
              <p className="text-earth-olive">
                We strive to provide accurate product information but cannot guarantee complete accuracy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">5. Limitation of Liability</h2>
              <p className="text-earth-olive">
                ShopSphere shall not be liable for any indirect, incidental, or consequential damages.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
