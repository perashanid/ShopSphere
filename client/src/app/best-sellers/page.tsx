'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, TrendingUp } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
}

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/products?sort=-rating&limit=12`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Failed to fetch best sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-earth-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-earth-bronze" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-earth-dark mb-4">Best Sellers</h1>
        <p className="text-earth-olive mb-8">Our most popular products loved by customers</p>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="relative h-64 bg-gray-100">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  {index < 3 && (
                    <div className="absolute top-2 right-2 bg-earth-bronze text-white px-2 py-1 rounded text-sm font-semibold flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      #{index + 1}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-earth-dark mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-red-600">${product.salePrice}</span>
                        <span className="text-sm text-gray-500 line-through">${product.price}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-earth-dark">${product.price}</span>
                    )}
                  </div>
                  {product.rating && (
                    <div className="flex items-center gap-1 text-sm text-earth-olive">
                      <span>⭐ {product.rating.toFixed(1)}</span>
                      {product.reviewCount && <span>({product.reviewCount})</span>}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-earth-olive mb-4">No best sellers available</p>
            <Link href="/products" className="text-earth-bronze hover:underline">
              Browse All Products →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
