import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | ShopSphere',
  description: 'Get help and support for your ShopSphere experience',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-earth-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-earth-dark mb-8">Help Center</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-earth-dark mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-earth-dark mb-2">How do I track my order?</h3>
                <p className="text-earth-olive">You can track your order from your account dashboard.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-earth-dark mb-2">What is your return policy?</h3>
                <p className="text-earth-olive">We offer 30-day returns on most items.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
