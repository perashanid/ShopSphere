'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { Category } from '@/types';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';


export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // Use sample data when API fails
            setSampleCategories();
        } finally {
            setLoading(false);
        }
    };

    const setSampleCategories = () => {
        const sampleCategories: Category[] = [
            {
                id: '1',
                name: 'Electronics',
                slug: 'electronics',
                description: 'Latest gadgets, smartphones, laptops, and electronic accessories for modern living.',
                productCount: 45,
                isFeatured: true,
                isActive: true,
                showInNavigation: true,
                level: 0,
                path: 'electronics',
                fullPath: 'electronics',
                breadcrumbs: [{ name: 'Electronics', slug: 'electronics' }],
                images: {
                    thumbnail: {
                        url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center',
                        alt: 'Electronics category',
                        type: 'thumbnail' as const
                    }
                },
                displayOrder: 1,
                seo: {
                    title: 'Electronics - ShopSphere',
                    description: 'Latest gadgets and electronic accessories',
                    keywords: ['electronics', 'gadgets', 'smartphones']
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Fashion',
                slug: 'fashion',
                description: 'Trendy clothing, shoes, and accessories for men and women.',
                productCount: 78,
                isFeatured: true,
                isActive: true,
                showInNavigation: true,
                level: 0,
                path: 'fashion',
                fullPath: 'fashion',
                breadcrumbs: [{ name: 'Fashion', slug: 'fashion' }],
                images: {
                    thumbnail: {
                        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
                        alt: 'Fashion category',
                        type: 'thumbnail' as const
                    }
                },
                displayOrder: 2,
                seo: {
                    title: 'Fashion - ShopSphere',
                    description: 'Trendy clothing and accessories',
                    keywords: ['fashion', 'clothing', 'accessories']
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Home & Garden',
                slug: 'home-garden',
                description: 'Beautiful home decor, furniture, and garden essentials.',
                productCount: 32,
                isFeatured: true,
                isActive: true,
                showInNavigation: true,
                level: 0,
                path: 'home-garden',
                fullPath: 'home-garden',
                breadcrumbs: [{ name: 'Home & Garden', slug: 'home-garden' }],
                images: {
                    thumbnail: {
                        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
                        alt: 'Home & Garden category',
                        type: 'thumbnail' as const
                    }
                },
                displayOrder: 3,
                seo: {
                    title: 'Home & Garden - ShopSphere',
                    description: 'Home decor and garden essentials',
                    keywords: ['home', 'garden', 'decor']
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '4',
                name: 'Sports & Fitness',
                slug: 'sports-fitness',
                description: 'Athletic gear, fitness equipment, and outdoor sports accessories.',
                productCount: 28,
                isFeatured: false,
                isActive: true,
                showInNavigation: true,
                level: 0,
                path: 'sports-fitness',
                fullPath: 'sports-fitness',
                breadcrumbs: [{ name: 'Sports & Fitness', slug: 'sports-fitness' }],
                images: {
                    thumbnail: {
                        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
                        alt: 'Sports & Fitness category',
                        type: 'thumbnail' as const
                    }
                },
                displayOrder: 4,
                seo: {
                    title: 'Sports & Fitness - ShopSphere',
                    description: 'Athletic gear and fitness equipment',
                    keywords: ['sports', 'fitness', 'athletic']
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '5',
                name: 'Books & Media',
                slug: 'books-media',
                description: 'Books, magazines, movies, and digital media content.',
                productCount: 156,
                isFeatured: false,
                isActive: true,
                showInNavigation: true,
                level: 0,
                path: 'books-media',
                fullPath: 'books-media',
                breadcrumbs: [{ name: 'Books & Media', slug: 'books-media' }],
                images: {
                    thumbnail: {
                        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center',
                        alt: 'Books & Media category',
                        type: 'thumbnail' as const
                    }
                },
                displayOrder: 5,
                seo: {
                    title: 'Books & Media - ShopSphere',
                    description: 'Books, magazines, and digital media',
                    keywords: ['books', 'media', 'magazines']
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '6',
                name: 'Health & Beauty',
                slug: 'health-beauty',
                description: 'Skincare, cosmetics, wellness products, and health supplements.',
                productCount: 67,
                isFeatured: true,
                isActive: true,
                showInNavigation: true,
                level: 0,
                path: 'health-beauty',
                fullPath: 'health-beauty',
                breadcrumbs: [{ name: 'Health & Beauty', slug: 'health-beauty' }],
                images: {
                    thumbnail: {
                        url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
                        alt: 'Health & Beauty category',
                        type: 'thumbnail' as const
                    }
                },
                displayOrder: 6,
                seo: {
                    title: 'Health & Beauty - ShopSphere',
                    description: 'Skincare, cosmetics, and wellness products',
                    keywords: ['health', 'beauty', 'skincare']
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        setCategories(sampleCategories);
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-earth-dark mb-4">Shop by Category</h1>
                    <p className="text-lg text-earth-olive">
                        Discover our wide range of products organized by category
                    </p>
                </div>

                {/* Categories Grid */}
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="h-16 w-16 text-earth-sage mx-auto mb-4" />
                        <p className="text-earth-olive text-lg">No categories found</p>
                        <p className="text-earth-sage text-sm mt-2">Categories will appear here once they are added</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                )}


            </div>
        </div>
    );
}

function CategoryCard({ category }: { category: Category }) {
    const analytics = useAnalyticsContext();
    
    const handleCategoryClick = () => {
        analytics.trackCategoryView(category.id, category.name);
    };
    
    return (
        <Link 
            href={`/products?category=${category.id}`} 
            className="group"
            onClick={handleCategoryClick}
        >
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105 transform border border-earth-light/20">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden relative">
                        {category.images?.thumbnail ? (
                            <Image
                                src={category.images.thumbnail.url}
                                alt={category.images.thumbnail.alt}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-earth-light/30 rounded-lg flex items-center justify-center">
                                <Package className="h-8 w-8 text-earth-olive" />
                            </div>
                        )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-earth-sage group-hover:text-earth-bronze transition-colors" />
                </div>

                <h3 className="text-xl font-semibold text-earth-dark mb-2 group-hover:text-earth-bronze transition-colors">
                    {category.name}
                </h3>

                {category.description && (
                    <p className="text-earth-olive text-sm mb-4 line-clamp-2">
                        {category.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-earth-sage">
                        {category.productCount || 0} products
                    </span>
                    {category.isFeatured && (
                        <span className="bg-earth-bronze/20 text-earth-bronze px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}