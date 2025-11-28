'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative bg-earth-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Discover Modern
              <span className="block text-earth-light">Excellence</span>
            </h1>
            <p className="text-xl text-earth-light/90 mb-8 leading-relaxed">
              Explore our curated collection of premium products designed for the modern lifestyle. 
              Quality, style, and innovation in every piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-earth-bronze text-white font-semibold rounded-md hover:bg-earth-caramel transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-earth-light text-earth-light font-semibold rounded-md hover:bg-earth-light hover:text-earth-dark transition-all duration-300"
              >
                Browse Categories
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop&crop=center"
                alt="Modern lifestyle products showcase"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-earth-dark/30"></div>
              <div className="absolute bottom-6 left-6 right-6 text-center">
                <p className="text-white font-medium drop-shadow-lg">Featured Product Showcase</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-earth-bronze/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-earth-light/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}