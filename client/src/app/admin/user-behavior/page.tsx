'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Users, Package, TrendingUp, Eye } from 'lucide-react';
import api from '@/lib/api';

interface FavoriteItem {
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productCategory: string;
  addedAt: string;
  productImage?: {
    url: string;
    alt: string;
  };
}

interface CartItem {
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  totalQuantity: number;
  lastAddedAt: string;
  addCount: number;
}

interface UserBehaviorData {
  favorites: FavoriteItem[];
  cartData: CartItem[];
  favoritesSummary: {
    totalFavorites: number;
    uniqueUsers: number;
    uniqueProducts: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      count: number;
    }>;
  };
  cartsSummary: {
    totalCartEvents: number;
    uniqueUsers: number;
    uniqueProducts: number;
    totalQuantity: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      quantity: number;
      count: number;
    }>;
  };
}

export default function UserBehaviorPage() {
  const [activeTab, setActiveTab] = useState<'favorites' | 'carts'>('favorites');
  const [data, setData] = useState<UserBehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [favoritesResponse, cartsResponse] = await Promise.all([
        api.get(`/admin/user-behavior/favorites?page=${page}&limit=${limit}`),
        api.get(`/admin/user-behavior/carts?page=${page}&limit=${limit}`)
      ]);

      setData({
        favorites: favoritesResponse.data.data.favorites,
        cartData: cartsResponse.data.data.cartData,
        favoritesSummary: favoritesResponse.data.data.summary,
        cartsSummary: cartsResponse.data.data.summary
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch user behavior data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient">User Behavior</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-24"></div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg shadow h-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient">User Behavior</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSummary = activeTab === 'favorites' ? data?.favoritesSummary : data?.cartsSummary;
  const currentData = activeTab === 'favorites' ? data?.favorites : data?.cartData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gradient">User Behavior Analytics</h1>
      </div>

      {/* Summary Cards */}
      {currentSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {activeTab === 'favorites' ? (
                    <Heart className="h-6 w-6 text-red-600" />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total {activeTab === 'favorites' ? 'Favorites' : 'Cart Events'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeTab === 'favorites' 
                        ? (currentSummary as UserBehaviorData['favoritesSummary']).totalFavorites?.toLocaleString()
                        : (currentSummary as UserBehaviorData['cartsSummary']).totalCartEvents?.toLocaleString()
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Unique Users</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {currentSummary.uniqueUsers?.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Unique Products</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {currentSummary.uniqueProducts?.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {activeTab === 'favorites' ? 'Avg per User' : 'Total Quantity'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {activeTab === 'favorites' 
                        ? ((currentSummary as UserBehaviorData['favoritesSummary']).totalFavorites / Math.max(currentSummary.uniqueUsers, 1)).toFixed(1)
                        : (currentSummary as UserBehaviorData['cartsSummary']).totalQuantity?.toLocaleString()
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'favorites'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Heart className="inline-block w-4 h-4 mr-2" />
            User Favorites
          </button>
          <button
            onClick={() => setActiveTab('carts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'carts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingCart className="inline-block w-4 h-4 mr-2" />
            Cart Activity
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Data Table */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {activeTab === 'favorites' ? 'Recent Favorites' : 'Recent Cart Activity'}
              </h3>
              
              {currentData && currentData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        {activeTab === 'carts' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentData.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {activeTab === 'favorites' 
                                  ? (item as FavoriteItem).userName 
                                  : (item as CartItem).userEmail
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {activeTab === 'favorites' 
                                  ? (item as FavoriteItem).userEmail 
                                  : (item as CartItem).userId
                                }
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {activeTab === 'favorites' 
                                ? (item as FavoriteItem).productName 
                                : (item as CartItem).productName
                              }
                            </div>
                            {activeTab === 'favorites' && (
                              <div className="text-sm text-gray-500">
                                ${(item as FavoriteItem).productPrice?.toFixed(2)} • {(item as FavoriteItem).productCategory}
                              </div>
                            )}
                          </td>
                          {activeTab === 'carts' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(item as CartItem).totalQuantity} ({(item as CartItem).addCount} events)
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              activeTab === 'favorites' 
                                ? (item as FavoriteItem).addedAt 
                                : (item as CartItem).lastAddedAt
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No {activeTab} data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Products Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Top Products
              </h3>
              <div className="space-y-3">
                {currentSummary?.topProducts?.slice(0, 10).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-900 ml-2 truncate">
                        {product.productName || `Product ${product.productId}`}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {activeTab === 'favorites' 
                        ? `${product.count} favorites`
                        : `${(product as any).quantity} items`
                      }
                    </span>
                  </div>
                ))}
                {(!currentSummary?.topProducts || currentSummary.topProducts.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No product data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}