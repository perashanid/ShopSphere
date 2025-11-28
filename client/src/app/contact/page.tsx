'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, HelpCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const StoreMap = dynamic(() => import('@/components/contact/StoreMap').then(mod => ({ default: mod.StoreMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-earth-sage/40 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-16 w-16 text-earth-bronze mx-auto mb-4 animate-pulse" />
        <p className="text-earth-olive">Loading map...</p>
      </div>
    </div>
  ),
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@shopsphere.com',
      description: 'Send us an email anytime'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+880 1711-123456',
      description: 'Sat-Thu 10AM-8PM BST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'House 45, Road 11, Gulshan-1, Dhaka 1212',
      description: 'Our flagship store'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Sat-Thu: 10AM-8PM BST',
      description: 'Friday closed'
    }
  ];

  const supportCategories = [
    {
      icon: HelpCircle,
      title: 'General Support',
      description: 'Questions about our products or services'
    },
    {
      icon: Truck,
      title: 'Shipping & Orders',
      description: 'Track orders, shipping questions, returns'
    },
    {
      icon: MessageCircle,
      title: 'Technical Support',
      description: 'Website issues, account problems'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-earth-dark mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-earth-olive max-w-3xl mx-auto leading-relaxed">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-modern p-6 text-center hover-lift"
                >
                  <Icon className="h-12 w-12 text-earth-bronze mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-earth-dark mb-2">{info.title}</h3>
                  <p className="text-earth-olive font-medium mb-1">{info.details}</p>
                  <p className="text-earth-sage text-sm">{info.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="card-modern p-8"
            >
              <h2 className="text-2xl font-bold text-earth-dark mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-earth-olive mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-earth-light/30 rounded-md focus-elegant bg-white/80 text-earth-dark placeholder-earth-sage"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-earth-olive mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-earth-light/30 rounded-md focus-elegant bg-white/80 text-earth-dark placeholder-earth-sage"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-earth-olive mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-earth-light/30 rounded-md focus-elegant bg-white/80 text-earth-dark"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="shipping">Shipping & Orders</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-earth-olive mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-earth-light/30 rounded-md focus-elegant bg-white/80 text-earth-dark placeholder-earth-sage"
                    placeholder="Brief subject line"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-earth-olive mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-earth-light/30 rounded-md focus-elegant bg-white/80 text-earth-dark placeholder-earth-sage resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Support Categories & FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Support Categories */}
              <div className="card-modern p-8">
                <h2 className="text-2xl font-bold text-earth-dark mb-6">How Can We Help?</h2>
                <div className="space-y-4">
                  {supportCategories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.title} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-earth-light/10 transition-colors">
                        <Icon className="h-6 w-6 text-earth-bronze flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-earth-dark mb-1">{category.title}</h3>
                          <p className="text-earth-olive text-sm">{category.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Links */}
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-earth-dark mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a href="/faq" className="block text-earth-olive hover:text-earth-bronze transition-colors">
                    → Frequently Asked Questions
                  </a>
                  <a href="/shipping" className="block text-earth-olive hover:text-earth-bronze transition-colors">
                    → Shipping Information
                  </a>
                  <a href="/returns" className="block text-earth-olive hover:text-earth-bronze transition-colors">
                    → Returns & Exchanges
                  </a>
                  <a href="/size-guide" className="block text-earth-olive hover:text-earth-bronze transition-colors">
                    → Size Guide
                  </a>
                  <a href="/track-order" className="block text-earth-olive hover:text-earth-bronze transition-colors">
                    → Track Your Order
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div className="card-modern p-6 bg-earth-bronze/10 border border-earth-bronze/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="h-6 w-6 text-earth-bronze" />
                  <h3 className="font-semibold text-earth-dark">Response Time</h3>
                </div>
                <p className="text-earth-olive text-sm">
                  We typically respond to all inquiries within 24 hours during business days. 
                  For urgent matters, please call our support line.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="card-modern p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-earth-dark mb-4">Visit Our Store</h2>
            <p className="text-earth-olive mb-6">
              Come visit our flagship store in Gulshan, Dhaka
            </p>
            <div className="aspect-video rounded-lg overflow-hidden">
              <StoreMap />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}