'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, ShoppingBag, BarChart3 } from 'lucide-react';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-earth-light/10 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-earth-dark px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.profile?.firstName} {user.profile?.lastName}
                </h1>
                <p className="text-earth-light">{user.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-earth-bronze text-white mt-2">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="h-6 w-6 text-earth-bronze" />
                  <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Name:</span> {user.profile?.firstName} {user.profile?.lastName}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Phone:</span> {user.profile?.phone || 'Not provided'}</p>
                  <p><span className="font-medium">Role:</span> {user.role}</p>
                </div>
                <button className="mt-4 text-earth-bronze hover:text-earth-caramel text-sm font-medium">
                  Edit Profile
                </button>
              </div>

              {/* Orders Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ShoppingBag className="h-6 w-6 text-earth-bronze" />
                  <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  View and track your order history
                </p>
                <Link
                  href="/orders"
                  className="text-earth-bronze hover:text-earth-caramel text-sm font-medium"
                >
                  View Orders →
                </Link>
              </div>

              {/* Settings Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="h-6 w-6 text-earth-bronze" />
                  <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your account preferences
                </p>
                <button className="text-earth-bronze hover:text-earth-caramel text-sm font-medium">
                  Account Settings
                </button>
              </div>

              {/* Admin Panel Card (only for admins) */}
              {isAdmin && (
                <div className="bg-earth-bronze/10 rounded-lg p-6 border border-earth-bronze/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="h-6 w-6 text-earth-bronze" />
                    <h3 className="text-lg font-semibold text-earth-bronze">Admin Panel</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Access admin dashboard and management tools
                  </p>
                  <div className="space-y-2">
                    <Link
                      href="/admin"
                      className="block text-earth-bronze hover:text-earth-caramel text-sm font-medium"
                    >
                      Dashboard →
                    </Link>
                    <Link
                      href="/admin/products"
                      className="block text-earth-bronze hover:text-earth-caramel text-sm font-medium"
                    >
                      Manage Products →
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="block text-earth-bronze hover:text-earth-caramel text-sm font-medium"
                    >
                      Manage Orders →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 border border-earth-bronze text-earth-bronze hover:bg-earth-bronze hover:text-white transition-colors rounded-md text-sm font-medium"
                >
                  Browse Products
                </Link>
                <Link
                  href="/cart"
                  className="inline-flex items-center px-4 py-2 border border-earth-bronze text-earth-bronze hover:bg-earth-bronze hover:text-white transition-colors rounded-md text-sm font-medium"
                >
                  View Cart
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center px-4 py-2 bg-earth-bronze text-white hover:bg-earth-caramel transition-colors rounded-md text-sm font-medium"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}