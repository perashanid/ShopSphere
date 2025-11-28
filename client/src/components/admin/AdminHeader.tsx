'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  Bell, 
  UserCircle,
  ChevronDown,
  LogOut
} from 'lucide-react';

export default function AdminHeader() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleBackToStore = () => {
    router.push('/');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-earth-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-earth-dark lg:hidden">
              Admin Panel
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Back to Store Button */}
            <button
              onClick={handleBackToStore}
              className="btn-secondary text-sm"
            >
              Back to Store
            </button>
            {/* Notifications */}
            <button className="p-2 text-earth-sage hover:text-earth-bronze relative transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-earth-caramel ring-2 ring-white" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-earth-light/20 transition-colors"
              >
                <UserCircle className="h-8 w-8 text-earth-sage" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-earth-dark">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-xs text-earth-sage capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-earth-sage" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 card-modern shadow-lg ring-1 ring-earth-light/20 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-earth-dark border-b border-earth-light/20">
                      <p className="font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                      <p className="text-xs text-earth-sage">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-earth-dark hover:bg-earth-light/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
}