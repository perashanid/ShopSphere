'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, Settings, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const { itemCount } = useCart();
    const router = useRouter();

    // Initialize app data (auth and cart)
    useAppInitialization();

    const handleLogout = async () => {
        await logout();
        setIsUserMenuOpen(false);
        router.push('/');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <header className="sticky top-0 z-50 bg-earth-light border-b border-earth-sage/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-12 h-12">
                                <img
                                    src="/logo.png"
                                    alt="ShopSphere Logo"
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <span className="text-2xl font-bold text-earth-dark group-hover:text-earth-forest transition-colors">
                                ShopSphere
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <Link href="/products" className="text-earth-olive hover:text-earth-forest transition-colors font-medium">
                            Products
                        </Link>
                        <Link href="/categories" className="text-earth-olive hover:text-earth-forest transition-colors font-medium">
                            Categories
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="text-earth-bronze hover:text-earth-caramel transition-colors font-medium flex items-center space-x-1">
                                <BarChart3 className="h-4 w-4" />
                                <span>Admin</span>
                            </Link>
                        )}
                        <Link href="/about" className="text-earth-olive hover:text-earth-forest transition-colors font-medium">
                            About
                        </Link>
                        <Link href="/contact" className="text-earth-olive hover:text-earth-forest transition-colors font-medium">
                            Contact
                        </Link>
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 text-earth-olive hover:text-earth-forest transition-colors"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5" />
                        </button>

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative p-2 text-earth-olive hover:text-earth-forest transition-colors"
                            aria-label="Shopping cart"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-earth-bronze text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {/* User Account */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 text-earth-olive hover:text-earth-forest transition-colors"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="hidden sm:block text-sm">
                                        {user?.profile?.firstName || 'User'}
                                        {isAdmin && <span className="text-earth-bronze ml-1">(Admin)</span>}
                                    </span>
                                </button>

                                {/* User Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="py-1">
                                            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                                <p className="font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                                {isAdmin && <p className="text-xs text-earth-bronze font-medium">Administrator</p>}
                                            </div>

                                            <Link
                                                href="/account"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-3" />
                                                    My Account
                                                </div>
                                            </Link>

                                            {isAdmin && (
                                                <>
                                                    <Link
                                                        href="/admin"
                                                        className="block px-4 py-2 text-sm text-earth-bronze hover:bg-gray-100"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <div className="flex items-center">
                                                            <BarChart3 className="h-4 w-4 mr-3" />
                                                            Admin Dashboard
                                                        </div>
                                                    </Link>
                                                    <Link
                                                        href="/admin/products"
                                                        className="block px-4 py-2 text-sm text-earth-bronze hover:bg-gray-100"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <div className="flex items-center">
                                                            <Settings className="h-4 w-4 mr-3" />
                                                            Manage Products
                                                        </div>
                                                    </Link>
                                                </>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                            >
                                                <div className="flex items-center">
                                                    <LogOut className="h-4 w-4 mr-3" />
                                                    Sign Out
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Click outside to close user menu */}
                                {isUserMenuOpen && (
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-2">
                                <Link
                                    href="/auth/login"
                                    className="text-earth-olive hover:text-earth-forest transition-colors text-sm font-medium"
                                >
                                    Sign In
                                </Link>
                                <span className="text-earth-sage/50">|</span>
                                <Link
                                    href="/auth/register"
                                    className="text-earth-olive hover:text-earth-forest transition-colors text-sm font-medium"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-earth-olive hover:text-earth-forest transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {isSearchOpen && (
                    <div className="py-4 border-t border-earth-sage/20">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 border border-earth-light/30 rounded-md focus-elegant bg-white/80 backdrop-blur-sm text-earth-dark placeholder-earth-sage"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-earth-sage" />
                        </div>
                    </div>
                )}

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-earth-sage/20 glass">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/products"
                                className="text-earth-olive hover:text-earth-forest transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Products
                            </Link>
                            <Link
                                href="/categories"
                                className="text-earth-olive hover:text-earth-forest transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Categories
                            </Link>

                            {isAdmin && (
                                <div className="pt-2 border-t border-earth-bronze/20">
                                    <p className="text-xs text-earth-bronze font-medium mb-2">ADMIN</p>
                                    <Link
                                        href="/admin"
                                        className="text-earth-bronze hover:text-earth-caramel transition-colors font-medium flex items-center space-x-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link
                                        href="/admin/products"
                                        className="text-earth-bronze hover:text-earth-caramel transition-colors font-medium flex items-center space-x-2 mt-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>Manage Products</span>
                                    </Link>
                                </div>
                            )}

                            <Link
                                href="/about"
                                className="text-earth-olive hover:text-earth-forest transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link
                                href="/contact"
                                className="text-earth-olive hover:text-earth-forest transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </Link>

                            {isAuthenticated ? (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex flex-col space-y-2">
                                        <div className="text-sm text-gray-600 mb-2">
                                            Signed in as {user?.profile?.firstName}
                                            {isAdmin && <span className="text-earth-bronze ml-1">(Admin)</span>}
                                        </div>
                                        <Link
                                            href="/account"
                                            className="text-earth-olive hover:text-earth-forest transition-colors font-medium"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Account
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="text-red-600 hover:text-red-700 transition-colors font-medium text-left"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex flex-col space-y-2">
                                        <Link
                                            href="/auth/login"
                                            className="text-earth-olive hover:text-earth-forest transition-colors font-medium"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/auth/register"
                                            className="text-earth-olive hover:text-earth-forest transition-colors font-medium"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}