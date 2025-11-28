'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || data || []);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
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
        <h1 className="text-4xl font-bold text-earth-dark mb-4">Collections</h1>
        <p className="text-earth-olive mb-8">Explore our curated product collections</p>
        
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="relative h-48 bg-gradient-to-br from-earth-sage/20 to-earth-bronze/20">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-earth-dark mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-earth-olive text-sm mb-3 line-clamp-2">{category.description}</p>
                  )}
                  {category.productCount !== undefined && (
                    <p className="text-earth-bronze text-sm font-medium">
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-earth-olive mb-4">No collections available</p>
            <Link href="/products" className="text-earth-bronze hover:underline">
              Browse All Products →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
