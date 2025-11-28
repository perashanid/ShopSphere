import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide | ShopSphere',
  description: 'Find your perfect fit with our size guide',
};

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-earth-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-earth-dark mb-8">Size Guide</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-earth-dark mb-4">How to Measure</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-earth-olive mb-4">
                Use a measuring tape to get accurate measurements. Refer to our size charts below.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-earth-dark mb-4">Size Charts</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
              <table className="min-w-full text-earth-olive">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Size</th>
                    <th className="py-2 px-4 text-left">Chest (in)</th>
                    <th className="py-2 px-4 text-left">Waist (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="py-2 px-4">S</td><td className="py-2 px-4">34-36</td><td className="py-2 px-4">28-30</td></tr>
                  <tr className="border-b"><td className="py-2 px-4">M</td><td className="py-2 px-4">38-40</td><td className="py-2 px-4">32-34</td></tr>
                  <tr className="border-b"><td className="py-2 px-4">L</td><td className="py-2 px-4">42-44</td><td className="py-2 px-4">36-38</td></tr>
                  <tr><td className="py-2 px-4">XL</td><td className="py-2 px-4">46-48</td><td className="py-2 px-4">40-42</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
