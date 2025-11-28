import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Information | ShopSphere',
  description: 'Learn about our shipping policies and delivery options',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-earth-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-earth-dark mb-8">Shipping Information</h1>
        
        <div className="prose prose-earth max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-earth-dark mb-4">Delivery Options</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ul className="space-y-3 text-earth-olive">
                <li><strong>Standard Shipping:</strong> 5-7 business days</li>
                <li><strong>Express Shipping:</strong> 2-3 business days</li>
                <li><strong>Next Day Delivery:</strong> Order before 2 PM</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-earth-dark mb-4">Shipping Costs</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-earth-olive">Free shipping on orders over $50. Standard rates apply for orders under $50.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
