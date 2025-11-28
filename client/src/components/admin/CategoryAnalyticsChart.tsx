'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface CategoryMetrics {
  _id: string;
  categoryName: string;
  views: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  bounceRate: number;
}

interface CategoryAnalyticsChartProps {
  dateRange: string;
}

export default function CategoryAnalyticsChart({ dateRange }: CategoryAnalyticsChartProps) {
  const [categories, setCategories] = useState<CategoryMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof CategoryMetrics>('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCategoryAnalytics();
  }, [dateRange]);

  const fetchCategoryAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await api.get(`/analytics/admin/category-analytics?${params}`);
      setCategories(response.data.data.categories);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch category analytics');
    } finally {
      setLoading(false);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'desc' 
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    }
    
    return 0;
  });

  const handleSort = (column: keyof CategoryMetrics) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Category Analytics</h3>
        <div className="text-sm text-gray-500">
          {categories.length} categories analyzed
        </div>
      </div>

      {/* Category Analytics Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('categoryName')}
              >
                Category
                {sortBy === 'categoryName' && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('views')}
              >
                Views
                {sortBy === 'views' && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('uniqueVisitors')}
              >
                Unique Visitors
                {sortBy === 'uniqueVisitors' && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('avgTimeSpent')}
              >
                Avg. Time Spent
                {sortBy === 'avgTimeSpent' && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('bounceRate')}
              >
                Engagement Score
                {sortBy === 'bounceRate' && (
                  <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCategories.map((category) => (
              <tr key={category._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {category.categoryName || `Category ${category._id.slice(-6)}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {category._id.slice(-8)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {category.views.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((category.views / Math.max(...categories.map(c => c.views))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {category.uniqueVisitors.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTime(category.avgTimeSpent)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPercentage(category.bounceRate)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            category.bounceRate > 70 ? 'bg-green-600' : 
                            category.bounceRate > 40 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(category.bounceRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No category analytics data found for the selected period.</p>
        </div>
      )}

      {/* Summary Stats */}
      {categories.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Total Views</div>
            <div className="text-2xl font-bold text-blue-600">
              {categories.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-900">Total Unique Visitors</div>
            <div className="text-2xl font-bold text-green-600">
              {categories.reduce((sum, c) => sum + c.uniqueVisitors, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-purple-900">Avg. Time Spent</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatTime(categories.reduce((sum, c) => sum + c.avgTimeSpent, 0) / categories.length)}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-orange-900">Avg. Engagement</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatPercentage(categories.reduce((sum, c) => sum + c.bounceRate, 0) / categories.length)}
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Categories */}
      {categories.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Top Performing Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedCategories.slice(0, 3).map((category, index) => (
              <div key={category._id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    #{index + 1} {category.categoryName || `Category ${category._id.slice(-6)}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {category.views} views
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Unique visitors: {category.uniqueVisitors}</div>
                  <div>Avg. time: {formatTime(category.avgTimeSpent)}</div>
                  <div>Engagement: {formatPercentage(category.bounceRate)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}