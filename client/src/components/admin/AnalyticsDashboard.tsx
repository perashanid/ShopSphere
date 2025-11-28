'use client';

import { 
  BarChart3, 
  Users, 
  Eye, 
  MousePointer 
} from 'lucide-react';

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

interface AnalyticsDashboardProps {
  data: OverviewData;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const { overview, topProducts, topCategories, deviceBreakdown, trafficSources } = data;

  const stats = [
    {
      name: 'Total Sessions',
      value: overview.totalSessions.toLocaleString(),
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      name: 'Unique Users',
      value: overview.uniqueUsers.toLocaleString(),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Page Views',
      value: overview.totalPageViews.toLocaleString(),
      icon: Eye,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Events',
      value: overview.totalEvents.toLocaleString(),
      icon: MousePointer,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Products
            </h3>
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-gray-900 ml-2 truncate">
                      {product.productName || `Product ${product._id}`}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {product.clicks} clicks
                  </span>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No product data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Categories
            </h3>
            <div className="space-y-3">
              {topCategories.slice(0, 5).map((category, index) => (
                <div key={category._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-gray-900 ml-2 truncate">
                      {category.categoryName || `Category ${category._id}`}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {category.views} views
                  </span>
                </div>
              ))}
              {topCategories.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No category data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Device Breakdown
            </h3>
            <div className="space-y-3">
              {deviceBreakdown.map((device) => {
                const total = deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
                const percentage = total > 0 ? Math.round((device.count / total) * 100) : 0;
                
                return (
                  <div key={device.deviceType} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 capitalize">
                        {device.deviceType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {deviceBreakdown.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No device data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Traffic Sources
            </h3>
            <div className="space-y-3">
              {trafficSources.slice(0, 5).map((source) => {
                const total = trafficSources.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? Math.round((source.count / total) * 100) : 0;
                
                return (
                  <div key={source._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 capitalize">
                        {source._id || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {trafficSources.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No traffic source data available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}