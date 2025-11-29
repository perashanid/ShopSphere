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
                                    <div className="absolute right-0 mt-2 w-64 bg-primary-50/95 backdrop-blur-md rounded-xl shadow-xl ring-1 ring-earth-sage/20 z-50 border border-earth-sage/30 transform origin-top-right transition-all duration-200">
                                        <div className="py-2">
                                            <div className="px-4 py-3 border-b border-earth-sage/20 bg-earth-sage/10">
                                                <p className="text-sm font-bold text-earth-dark truncate">
                                                    {user?.profile?.firstName} {user?.profile?.lastName}
                                                </p>
                                                <p className="text-xs text-earth-olive truncate mt-1 font-medium">
                                                    {user?.email}
                                                </p>
                                                {isAdmin && (
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-earth-bronze/10 text-earth-bronze border border-earth-bronze/20">
                                                            Administrator
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="py-1">
                                                <Link
                                                    href="/account"
                                                    className="group flex items-center px-4 py-2.5 text-sm text-earth-dark hover:bg-earth-sage/10 hover:text-earth-forest transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <User className="mr-3 h-4 w-4 text-earth-sage group-hover:text-earth-olive transition-colors" />
                                                    My Account
                                                </Link>

                                                {isAdmin && (
                                                    <>
                                                        <Link
                                                            href="/admin"
                                                            className="group flex items-center px-4 py-2.5 text-sm text-earth-dark hover:bg-earth-sage/10 hover:text-earth-forest transition-colors"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                        >
                                                            <BarChart3 className="mr-3 h-4 w-4 text-earth-sage group-hover:text-earth-olive transition-colors" />
                                                            Admin Dashboard
                                                        </Link>
                                                        <Link
                                                            href="/admin/products"
                                                            className="group flex items-center px-4 py-2.5 text-sm text-earth-dark hover:bg-earth-sage/10 hover:text-earth-forest transition-colors"
                                                            onClick={() => setIsUserMenuOpen(false)}
                                                        >
                                                            <Settings className="mr-3 h-4 w-4 text-earth-sage group-hover:text-earth-olive transition-colors" />
                                                            Manage Products
                                                        </Link>
                                                    </>
                                                )}
                                            </div>

                                            <div className="border-t border-earth-sage/20 pt-1 mt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="group flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors"
                                                >
                                                    <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500 transition-colors" />
                                                    Sign Out
                                                </button>
                                            </div>
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