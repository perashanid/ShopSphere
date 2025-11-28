import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | ShopSphere',
  description: 'Learn about how we use cookies',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-earth-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-earth-dark mb-8">Cookie Policy</h1>
        
        <div className="prose prose-earth max-w-none">
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <p className="text-earth-olive">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">What Are Cookies</h2>
              <p className="text-earth-olive">
                Cookies are small text files stored on your device when you visit our website. 
                They help us provide you with a better experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">How We Use Cookies</h2>
              <ul className="list-disc list-inside space-y-2 text-earth-olive">
                <li>Essential cookies for site functionality</li>
                <li>Analytics cookies to understand usage</li>
                <li>Preference cookies to remember your settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-earth-dark mb-3">Managing Cookies</h2>
              <p className="text-earth-olive">
                You can control cookies through your browser settings. Note that disabling 
                cookies may affect site functionality.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
