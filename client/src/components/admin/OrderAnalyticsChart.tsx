'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface OrderMetrics {
  checkoutStarts: number;
  checkoutCompletes: number;
  purchases: number;
  totalRevenue: number;
  avgOrderValue: number;
  checkoutConversionRate: number;
  purchaseConversionRate: number;
}

interface DailyTrend {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  orders: number;
  revenue: number;
}

interface OrderAnalyticsData {
  metrics: OrderMetrics;
  dailyTrends: DailyTrend[];
}

interface OrderAnalyticsChartProps {
  dateRange: string;
}

export default function OrderAnalyticsChart({ dateRange }: OrderAnalyticsChartProps) {
  const [data, setData] = useState<OrderAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderAnalytics();
  }, [dateRange]);

  const fetchOrderAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await api.get(`/analytics/admin/order-analytics?${params}`);
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch order analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateObj: { year: number; month: number; day: number }) => {
    return `${dateObj.month}/${dateObj.day}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No order analytics data available.</p>
        </div>
      </div>
    );
  }

  const { metrics, dailyTrends } = data;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Order Analytics</h3>
        <div className="text-sm text-gray-500">
          Last {dateRange} days
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-900">Checkout Starts</div>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.checkoutStarts.toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-900">Checkout Completes</div>
          <div className="text-2xl font-bold text-green-600">
            {metrics.checkoutCompletes.toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-purple-900">Purchases</div>
          <div className="text-2xl font-bold text-purple-600">
            {metrics.purchases.toLocaleString()}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-orange-900">Total Revenue</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(metrics.totalRevenue)}
          </div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-indigo-900">Avg Order Value</div>
          <div className="text-2xl font-bold text-indigo-600">
            {formatCurrency(metrics.avgOrderValue)}
          </div>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-pink-900">Purchase Rate</div>
          <div className="text-2xl font-bold text-pink-600">
            {formatPercentage(metrics.purchaseConversionRate)}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
              <span className="text-sm font-medium text-gray-900">Checkout Started</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{metrics.checkoutStarts.toLocaleString()}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-full"></div>
              </div>
              <span className="text-sm font-medium text-gray-900">100%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
              <span className="text-sm font-medium text-gray-900">Checkout Completed</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{metrics.checkoutCompletes.toLocaleString()}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${metrics.checkoutStarts > 0 ? (metrics.checkoutCompletes / metrics.checkoutStarts) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(metrics.checkoutConversionRate)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
              <span className="text-sm font-medium text-gray-900">Purchase Completed</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{metrics.purchases.toLocaleString()}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ 
                    width: `${metrics.checkoutStarts > 0 ? (metrics.purchases / metrics.checkoutStarts) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(metrics.checkoutStarts > 0 ? (metrics.purchases / metrics.checkoutStarts) * 100 : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trends */}
      {dailyTrends.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Daily Order Trends</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Order Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyTrends.map((trend, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(trend._id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trend.orders.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(trend.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(trend.orders > 0 ? trend.revenue / trend.orders : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}