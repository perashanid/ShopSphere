'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import api from '@/lib/api';
import { Package, ShoppingCart, Users, TrendingUp, AlertCircle, Eye } from 'lucide-react';

interface OverviewData {
  overview: {
    totalSessions: number;
    uniqueUsers: number;
    totalPageViews: number;
    totalEvents: number;
    avgSessionDuration: number;
  };
  topProducts: Array<{
    _id: string;
    productName: string;
    clicks: number;
  }>;
  topCategories: Array<{
    _id: string;
    categoryName: string;
    views: number;
  }>;
  deviceBreakdown: Array<{
    deviceType: string;
    count: number;
  }>;
  trafficSources: Array<{
    _id: string;
    count: number;
  }>;
}

interface SystemStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch analytics data
        const analyticsParams = new URLSearchParams({
          startDate: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        });
        
        const [analyticsResponse, productsResponse, ordersResponse, usersResponse] = await Promise.all([
          api.get(`/admin/analytics/overview?${analyticsParams}`).catch(() => ({ data: { data: null } })),
          api.get('/admin/products?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
          api.get('/admin/orders?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
          api.get('/admin/users?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } }))
        ]);
        
        setOverviewData(analyticsResponse.data.data);
        
        // Get system stats
        const stats: SystemStats = {
          totalProducts: productsResponse.data.data?.pagination?.total || 0,
          totalOrders: ordersResponse.data.data?.pagination?.total || 0,
          totalUsers: usersResponse.data.data?.pagination?.total || 0,
          lowStockProducts: 0, // Will be calculated from products
          pendingOrders: 0, // Will be calculated from orders
          recentActivity: []
        };
        
        // Get low stock products
        try {
          const lowStockResponse = await api.get('/admin/products?status=low-stock');
          stats.lowStockProducts = lowStockResponse.data.data?.products?.length || 0;
        } catch (e) {
          // Ignore error
        }
        
        // Get pending orders
        try {
          const pendingOrdersResponse = await api.get('/admin/orders?status=pending');
          stats.pendingOrders = pendingOrdersResponse.data.data?.orders?.length || 0;
        } catch (e) {
          // Ignore error
        }
        
        setSystemStats(stats);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-modern p-6 h-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-modern p-6 h-64"></div>
            <div className="card-modern p-6 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-earth-light/30 rounded-md px-3 py-2 text-sm bg-white/80 backdrop-blur-sm text-earth-dark focus-elegant"
          >
            <option value="1">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* System Overview Cards */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card-modern overflow-hidden hover-lift">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-earth-bronze" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-earth-sage truncate">Total Products</dt>
                    <dd className="text-lg font-medium text-earth-dark">{systemStats.totalProducts}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/admin/products" className="text-sm text-earth-bronze hover:text-earth-caramel transition-colors">
                  Manage Products →
                </Link>
              </div>
            </div>
          </div>

          <div className="card-modern overflow-hidden hover-lift">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-earth-olive" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-earth-sage truncate">Total Orders</dt>
                    <dd className="text-lg font-medium text-earth-dark">{systemStats.totalOrders}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/admin/orders" className="text-sm text-earth-olive hover:text-earth-forest transition-colors">
                  Manage Orders →
                </Link>
              </div>
            </div>
          </div>

          <div className="card-modern overflow-hidden hover-lift">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-earth-sage" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-earth-sage truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-earth-dark">{systemStats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/admin/users" className="text-sm text-earth-sage hover:text-earth-olive transition-colors">
                  Manage Users →
                </Link>
              </div>
            </div>
          </div>

          <div className="card-modern overflow-hidden hover-lift">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-earth-caramel" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-earth-sage truncate">Analytics</dt>
                    <dd className="text-lg font-medium text-earth-dark">
                      {overviewData?.overview?.totalSessions || 0} Sessions
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/admin/analytics" className="text-sm text-earth-caramel hover:text-earth-bronze transition-colors">
                  View Analytics →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {systemStats && (systemStats.lowStockProducts > 0 || systemStats.pendingOrders > 0) && (
        <div className="bg-earth-caramel/10 border border-earth-caramel/30 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-earth-caramel" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-earth-brown">Attention Required</h3>
              <div className="mt-2 text-sm text-earth-dark">
                <ul className="list-disc pl-5 space-y-1">
                  {systemStats.lowStockProducts > 0 && (
                    <li>
                      <Link href="/admin/products?status=low-stock" className="underline">
                        {systemStats.lowStockProducts} products are low in stock
                      </Link>
                    </li>
                  )}
                  {systemStats.pendingOrders > 0 && (
                    <li>
                      <Link href="/admin/orders?status=pending" className="underline">
                        {systemStats.pendingOrders} orders are pending
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card-modern p-6 mb-6">
        <h3 className="text-lg font-medium text-earth-dark mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products/new"
            className="flex items-center p-4 border border-earth-light/30 rounded-lg hover:bg-earth-light/20 hover-lift transition-all"
          >
            <Package className="h-8 w-8 text-earth-bronze mr-3" />
            <div>
              <p className="font-medium text-earth-dark">Add New Product</p>
              <p className="text-sm text-earth-sage">Create a new product listing</p>
            </div>
          </Link>
          
          <Link
            href="/admin/orders"
            className="flex items-center p-4 border border-earth-light/30 rounded-lg hover:bg-earth-light/20 hover-lift transition-all"
          >
            <ShoppingCart className="h-8 w-8 text-earth-olive mr-3" />
            <div>
              <p className="font-medium text-earth-dark">View Orders</p>
              <p className="text-sm text-earth-sage">Manage customer orders</p>
            </div>
          </Link>
          
          <Link
            href="/admin/analytics"
            className="flex items-center p-4 border border-earth-light/30 rounded-lg hover:bg-earth-light/20 hover-lift transition-all"
          >
            <Eye className="h-8 w-8 text-earth-sage mr-3" />
            <div>
              <p className="font-medium text-earth-dark">View Analytics</p>
              <p className="text-sm text-earth-sage">Check performance metrics</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {overviewData && <AnalyticsDashboard data={overviewData} />}
    </div>
  );
}