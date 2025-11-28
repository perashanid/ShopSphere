'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import UserInteractionChart from '@/components/admin/UserInteractionChart';
import ProductPerformanceChart from '@/components/admin/ProductPerformanceChart';
import CategoryAnalyticsChart from '@/components/admin/CategoryAnalyticsChart';
import OrderAnalyticsChart from '@/components/admin/OrderAnalyticsChart';
import AnalyticsTestUtils from '@/components/admin/AnalyticsTestUtils';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('interactions');
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'interactions', name: 'User Interactions', component: UserInteractionChart },
    { id: 'products', name: 'Product Performance', component: ProductPerformanceChart },
    { id: 'orders', name: 'Order Analytics', component: OrderAnalyticsChart },
    { id: 'categories', name: 'Category Analytics', component: CategoryAnalyticsChart },
    { id: 'test-utils', name: 'Test Utils', component: AnalyticsTestUtils },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || UserInteractionChart;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gradient">Analytics</h1>
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

      {/* Tab Navigation */}
      <div className="border-b border-earth-light/30">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-earth-bronze text-earth-bronze'
                  : 'border-transparent text-earth-sage hover:text-earth-dark hover:border-earth-light'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card-modern">
        <ActiveComponent dateRange={dateRange} />
      </div>
    </div>
  );
}