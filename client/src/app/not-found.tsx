'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-9xl font-bold text-earth-bronze/20 select-none">404</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-24 w-24 text-earth-sage" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl lg:text-5xl font-bold text-earth-dark mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-earth-olive mb-8 leading-relaxed">
            Oops! The page you're looking for seems to have wandered off. 
            Don't worry, even the best explorers sometimes take a wrong turn.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/" className="btn-primary inline-flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className="btn-secondary inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
            
            <Link href="/products" className="btn-secondary inline-flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Browse Products
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="card-modern p-6">
            <h2 className="text-lg font-semibold text-earth-dark mb-4">
              Looking for something specific?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Link 
                href="/products" 
                className="text-earth-olive hover:text-earth-bronze transition-colors"
              >
                All Products
              </Link>
              <Link 
                href="/categories" 
                className="text-earth-olive hover:text-earth-bronze transition-colors"
              >
                Categories
              </Link>
              <Link 
                href="/about" 
                className="text-earth-olive hover:text-earth-bronze transition-colors"
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="text-earth-olive hover:text-earth-bronze transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}