'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface UserInteraction {
  _id: string;
  userId: string;
  sessionId: string;
  event: {
    type: string;
    productId?: string;
    categoryId?: string;
    timestamp: string;
    metadata?: {
      productName?: string;
      categoryName?: string;
      timeSpent?: number;
      scrollDepth?: number;
      interactionCount?: number;
    };
  };
  userAgent: string;
  ipAddress: string;
  createdAt: string;
}

interface UserInteractionChartProps {
  dateRange: string;
}

export default function UserInteractionChart({ dateRange }: UserInteractionChartProps) {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    eventType: '',
    productId: '',
    categoryId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchInteractions();
  }, [dateRange, filters, pagination.page]);

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.eventType && { eventType: filters.eventType }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.categoryId && { categoryId: filters.categoryId })
      });

      const response = await api.get(`/analytics/admin/user-interactions?${params}`);
      setInteractions(response.data.data.interactions);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total,
        pages: response.data.data.pagination.pages
      }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch interactions');
    } finally {
      setLoading(false);
    }
  };

  const eventTypeOptions = [
    { value: '', label: 'All Events' },
    { value: 'product_click', label: 'Product Clicks' },
    { value: 'category_view', label: 'Category Views' },
    { value: 'page_time', label: 'Page Time' },
    { value: 'add_to_cart', label: 'Add to Cart' },
    { value: 'purchase', label: 'Purchases' },
    { value: 'search', label: 'Searches' }
  ];

  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && interactions.length === 0) {
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
        <h3 className="text-lg font-medium text-gray-900">User Interactions</h3>
        <div className="flex items-center space-x-4">
          <select
            value={filters.eventType}
            onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {eventTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product/Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interactions.map((interaction) => (
              <tr key={interaction._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatEventType(interaction.event.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {interaction.event.metadata?.productName || 
                   interaction.event.metadata?.categoryName || 
                   interaction.event.productId || 
                   interaction.event.categoryId || 
                   '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {interaction.userId ? `User ${interaction.userId.slice(-6)}` : 'Anonymous'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimestamp(interaction.event.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {interaction.event.metadata?.timeSpent && (
                    <span className="mr-2">
                      {Math.round(interaction.event.metadata.timeSpent)}s
                    </span>
                  )}
                  {interaction.event.metadata?.scrollDepth && (
                    <span className="mr-2">
                      {interaction.event.metadata.scrollDepth}% scroll
                    </span>
                  )}
                  {interaction.event.metadata?.interactionCount && (
                    <span>
                      {interaction.event.metadata.interactionCount} interactions
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {interactions.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No interactions found for the selected criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}