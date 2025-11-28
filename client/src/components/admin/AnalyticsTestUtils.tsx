'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AnalyticsTestUtils() {
  const [loading, setLoading] = useState(false);

  const generateSampleData = async () => {
    try {
      setLoading(true);
      await api.post('/analytics/admin/generate-sample-data');
      toast.success('Sample analytics data generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to generate sample data');
    } finally {
      setLoading(false);
    }
  };

  const clearAnalyticsData = async () => {
    if (!confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete('/analytics/admin/clear-data');
      toast.success('Analytics data cleared successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to clear analytics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Test Utilities</h3>
      <p className="text-sm text-gray-600 mb-6">
        Use these utilities to test the analytics system with sample data.
      </p>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div>
            <button
              onClick={generateSampleData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Sample Data'}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Generates 30 days of sample analytics data for testing purposes.
            </p>
          </div>
          
          <div>
            <button
              onClick={clearAnalyticsData}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Clearing...' : 'Clear All Data'}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Removes all analytics data from the database.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Test Analytics Tracking</h4>
          <p className="text-sm text-gray-600 mb-3">
            Navigate through the site to test real-time analytics tracking:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Visit product pages to track product views and time spent</li>
            <li>• Add items to cart to track conversion events</li>
            <li>• Browse categories to track category analytics</li>
            <li>• Complete purchases to track order analytics</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Analytics Features</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Product click tracking</li>
            <li>✅ Time spent on products</li>
            <li>✅ Page visit duration</li>
            <li>✅ Average visit time</li>
            <li>✅ User interaction tracking</li>
            <li>✅ Scroll depth tracking</li>
            <li>✅ Order conversion funnel</li>
            <li>✅ Device and browser analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}