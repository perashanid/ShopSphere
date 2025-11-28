'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-earth-dark text-earth-light overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-earth-bronze opacity-50" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-earth-forest/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-earth-bronze/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <h3 className="text-3xl font-bold text-white tracking-tight">
                Shop<span className="text-earth-sage">Sphere</span>
              </h3>
            </Link>
            <p className="text-earth-light/80 leading-relaxed max-w-sm">
              Curating the finest modern essentials for your lifestyle. Quality, sustainability, and exceptional design in every product.
            </p>
            <div className="flex space-x-4 pt-2">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="h-10 w-10 rounded-full bg-earth-forest/30 flex items-center justify-center text-earth-light hover:bg-earth-bronze hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Shop
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-earth-bronze rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', href: '/products' },
                { label: 'New Arrivals', href: '/new-arrivals' },
                { label: 'Best Sellers', href: '/best-sellers' },
                { label: 'Special Deals', href: '/deals' },
                { label: 'Collections', href: '/collections' }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-earth-light/70 hover:text-earth-sage transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-earth-sage mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Support
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-earth-bronze rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'Shipping Info', href: '/shipping' },
                { label: 'Returns', href: '/returns' },
                { label: 'Size Guide', href: '/size-guide' },
                { label: 'Contact Us', href: '/contact' }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-earth-light/70 hover:text-earth-sage transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-earth-sage mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Stay Connected
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-earth-bronze rounded-full"></span>
            </h4>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3 text-earth-light/80">
                <MapPin className="h-5 w-5 text-earth-bronze mt-0.5 shrink-0" />
                <span>House 45, Road 11, Gulshan-1, Dhaka 1212, Bangladesh</span>
              </div>
              <div className="flex items-center space-x-3 text-earth-light/80">
                <Phone className="h-5 w-5 text-earth-bronze shrink-0" />
                <span>+880 1711-123456</span>
              </div>
              <div className="flex items-center space-x-3 text-earth-light/80">
                <Mail className="h-5 w-5 text-earth-bronze shrink-0" />
                <span>support@shopsphere.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-earth-olive/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-earth-light/60 text-sm">
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>

          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-earth-light/60 hover:text-earth-sage transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-earth-light/60 hover:text-earth-sage transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-earth-light/60 hover:text-earth-sage transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-8 right-8 p-3 bg-earth-bronze/90 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-earth-caramel hover:-translate-y-1 transition-all duration-300 group z-20 hidden md:block"
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5 group-hover:animate-bounce" />
      </button>
    </footer>
  );
}