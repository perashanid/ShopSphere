import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds | ShopSphere',
  description: 'Our return and refund policy',
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-earth-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-earth-dark mb-8">Returns & Refunds</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-earth-dark mb-4">Return Policy</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-earth-olive mb-4">
                We offer a 30-day return policy on most items. Items must be unused and in original packaging.
              </p>
              <ul className="list-disc list-inside space-y-2 text-earth-olive">
                <li>Returns accepted within 30 days of delivery</li>
                <li>Items must be in original condition</li>
                <li>Refunds processed within 5-7 business days</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
