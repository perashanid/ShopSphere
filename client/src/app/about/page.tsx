'use client';

import { motion } from 'framer-motion';
import { Users, Award, Truck, Shield, Heart, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

function TeamMemberCard({ member, index }: { member: any; index: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-white border-2 border-earth-light/30 rounded-2xl p-8 text-center hover:border-earth-bronze transition-all duration-300 hover:shadow-xl"
    >
      <div className="w-28 h-28 rounded-2xl mx-auto mb-5 overflow-hidden bg-earth-sage/40 relative ring-4 ring-earth-light/30 group-hover:ring-earth-bronze/30 transition-all">
        {!imageError ? (
          <Image
            src={member.image}
            alt={member.name}
            width={112}
            height={112}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="h-12 w-12 text-earth-bronze" />
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-earth-dark mb-1">{member.name}</h3>
      <p className="text-earth-bronze font-semibold text-sm mb-3">{member.role}</p>
      <p className="text-earth-olive text-sm leading-relaxed">{member.description}</p>
    </motion.div>
  );
}

export default function AboutPage() {
  const stats = [
    { label: 'Happy Customers', value: '50,000+', icon: Users },
    { label: 'Products Sold', value: '1M+', icon: Award },
    { label: 'Countries Served', value: '25+', icon: Truck },
    { label: 'Years of Excellence', value: '10+', icon: Star },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service and satisfaction.'
    },
    {
      icon: Award,
      title: 'Quality Products',
      description: 'We carefully curate our product selection to offer only the highest quality items from trusted brands.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your privacy and security are paramount. We use industry-leading security measures to protect your data.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping worldwide with real-time tracking and excellent customer support.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
      description: 'Visionary leader with 15+ years in e-commerce and retail innovation.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
      description: 'Technology expert focused on creating seamless digital experiences.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces',
      description: 'Creative director passionate about user-centered design and aesthetics.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-earth-dark/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-2 bg-earth-bronze/10 rounded-full"
            >
              <span className="text-earth-bronze font-semibold text-sm">About Us</span>
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-bold text-earth-dark mb-6 tracking-tight">
              Welcome to <span className="text-earth-bronze">ShopSphere</span>
            </h1>
            <p className="text-xl text-earth-olive max-w-3xl mx-auto leading-relaxed">
              We're redefining online shopping with curated products, exceptional service, 
              and a commitment to making quality accessible to everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="bg-white border-2 border-earth-light/30 rounded-2xl p-8 text-center transition-all duration-300 hover:border-earth-bronze hover:shadow-xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-earth-bronze/10 rounded-xl mb-4 group-hover:bg-earth-bronze/20 transition-colors">
                      <Icon className="h-8 w-8 text-earth-bronze" />
                    </div>
                    <div className="text-4xl font-bold text-earth-dark mb-2">{stat.value}</div>
                    <div className="text-sm text-earth-olive font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-4 px-3 py-1 bg-earth-bronze/10 rounded-full">
                <span className="text-earth-bronze font-semibold text-xs uppercase tracking-wide">Our Journey</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-earth-dark mb-6 leading-tight">
                Building the Future of Shopping
              </h2>
              <div className="space-y-5 text-earth-olive text-lg leading-relaxed">
                <p>
                  Founded in 2014, ShopSphere began as a small startup with a big dream: 
                  to revolutionize online shopping by combining cutting-edge technology 
                  with personalized customer service.
                </p>
                <p>
                  What started in a garage has grown into a global platform serving 
                  customers in over 25 countries. We've maintained our core values 
                  of quality, integrity, and customer satisfaction throughout our journey.
                </p>
                <p>
                  Today, we're proud to be a trusted partner for millions of customers 
                  worldwide, offering carefully curated products that enhance their lives.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop"
                  alt="Our Story"
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-earth-bronze text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-bold">10+</div>
                <div className="text-sm">Years Strong</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-3 py-1 bg-earth-bronze/10 rounded-full">
              <span className="text-earth-bronze font-semibold text-xs uppercase tracking-wide">What We Stand For</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-earth-dark mb-4">Our Core Values</h2>
            <p className="text-lg text-earth-olive max-w-2xl mx-auto">
              These principles guide everything we do and shape our commitment to excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative bg-white border-2 border-earth-light/30 rounded-2xl p-8 hover:border-earth-bronze transition-all duration-300 hover:shadow-xl"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-earth-bronze/10 rounded-xl mb-5 group-hover:bg-earth-bronze group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-7 w-7 text-earth-bronze group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-earth-dark mb-3">{value.title}</h3>
                  <p className="text-earth-olive text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-3 py-1 bg-earth-bronze/10 rounded-full">
              <span className="text-earth-bronze font-semibold text-xs uppercase tracking-wide">Leadership</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-earth-dark mb-4">Meet Our Team</h2>
            <p className="text-lg text-earth-olive max-w-2xl mx-auto">
              The passionate people behind ShopSphere who make it all possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <TeamMemberCard key={member.name} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-earth-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-earth-light/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join millions of satisfied customers and discover why ShopSphere is the 
              preferred choice for quality products and exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/products" className="inline-flex items-center justify-center px-8 py-4 bg-earth-bronze text-white font-semibold rounded-xl hover:bg-earth-caramel transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                Shop Now
              </a>
              <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/20">
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}