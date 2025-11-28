'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const categories = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and tech',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop&crop=center',
    productCount: 150,
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing and accessories',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&crop=center',
    productCount: 200,
  },
  {
    id: '3',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Beautiful home essentials',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&crop=center',
    productCount: 120,
  },
  {
    id: '4',
    name: 'Sports',
    slug: 'sports',
    description: 'Athletic gear and equipment',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&crop=center',
    productCount: 80,
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-16 bg-accent-100/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-earth-dark mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-earth-olive max-w-2xl mx-auto">
            Discover our wide range of products across different categories, 
            each carefully curated for quality and style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={`/categories/${category.slug}`}
                className="group block bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-earth-light/20"
              >
                <div className="aspect-square relative overflow-hidden">
                  {/* Category Image */}
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-earth-dark/60 group-hover:bg-earth-dark/80 transition-all duration-300"></div>
                  
                  {/* Category info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold text-lg mb-1 drop-shadow-sm">{category.name}</h3>
                    <p className="text-sm text-white/90 drop-shadow-sm">{category.productCount} products</p>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-earth-olive text-sm">{category.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 bg-earth-bronze text-white font-semibold rounded-md hover:bg-earth-caramel transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}