import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { monitoringService } from '../services/monitoringService';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTests: number;
  totalQuestions: number;
  averageResponseTime: number;
  errorRate: number;
  storageUsage: number;
}

interface PerformanceData {
  pageLoadTimes: { [key: string]: number[] };
  apiResponseTimes: { [key: string]: number[] };
  errorCounts: { [key: string]: number };
  featureUsage: { [key: string]: number };
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadMetrics();
    loadPerformanceData();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', getTimeRangeFilter());

      // Get test and question counts
      const { count: totalTests } = await supabase
        .from('tests')
        .select('*', { count: 'exact', head: true });

      const { count: totalQuestions } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      // Get performance metrics
      const { data: performanceLogs } = await supabase
        .from('system_logs')
        .select('action_details')
        .eq('action_type', 'performance_metric')
        .gte('created_at', getTimeRangeFilter());

      const avgResponseTime = performanceLogs?.reduce((acc, log) => {
        const details = log.action_details as any;
        return acc + (details.apiResponseTime || 0);
      }, 0) / (performanceLogs?.length || 1);

      // Get error rate
      const { data: errorLogs } = await supabase
        .from('system_logs')
        .select('*')
        .eq('action_type', 'error')
        .gte('created_at', getTimeRangeFilter());

      const errorRate = ((errorLogs?.length || 0) / (performanceLogs?.length || 1)) * 100;

      setMetrics({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalTests: totalTests || 0,
        totalQuestions: totalQuestions || 0,
        averageResponseTime: avgResponseTime || 0,
        errorRate: errorRate || 0,
        storageUsage: 0 // TODO: Implement storage usage calculation
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const { data: logs } = await supabase
        .from('system_logs')
        .select('*')
        .gte('created_at', getTimeRangeFilter());

      const pageLoadTimes: { [key: string]: number[] } = {};
      const apiResponseTimes: { [key: string]: number[] } = {};
      const errorCounts: { [key: string]: number } = {};
      const featureUsage: { [key: string]: number } = {};

      logs?.forEach(log => {
        const details = log.action_details as any;
        
        if (log.action_type === 'performance_metric') {
          if (details.pageLoadTime) {
            const page = details.page || 'unknown';
            pageLoadTimes[page] = pageLoadTimes[page] || [];
            pageLoadTimes[page].push(details.pageLoadTime);
          }
          
          if (details.apiResponseTime) {
            const endpoint = details.endpoint || 'unknown';
            apiResponseTimes[endpoint] = apiResponseTimes[endpoint] || [];
            apiResponseTimes[endpoint].push(details.apiResponseTime);
          }
        }
        
        if (log.action_type === 'error') {
          const component = details.component || 'unknown';
          errorCounts[component] = (errorCounts[component] || 0) + 1;
        }
        
        if (log.action_type === 'feature_usage') {
          const feature = details.feature || 'unknown';
          featureUsage[feature] = (featureUsage[feature] || 0) + 1;
        }
      });

      setPerformanceData({
        pageLoadTimes,
        apiResponseTimes,
        errorCounts,
        featureUsage
      });
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getAverage = (numbers: number[]) => {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  };

  const getStatusColor = (value: number, threshold: number) => {
    return value > threshold ? 'text-red-600' : 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <div className="flex space-x-2">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
                size="sm"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Users ({timeRange})</h3>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Tests</h3>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalTests}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Questions</h3>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalQuestions}</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.averageResponseTime, 1000)}`}>
                {metrics.averageResponseTime.toFixed(0)}ms
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Error Rate</h3>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.errorRate, 5)}`}>
                {metrics.errorRate.toFixed(2)}%
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Storage Usage</h3>
              <p className="text-2xl font-bold text-gray-900">{metrics.storageUsage}MB</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500">System Status</h3>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
            </Card>
          </div>
        )}

        {/* Performance Data */}
        {performanceData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Load Times */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Page Load Times</h3>
              <div className="space-y-2">
                {Object.entries(performanceData.pageLoadTimes).map(([page, times]) => (
                  <div key={page} className="flex justify-between">
                    <span className="text-sm text-gray-600">{page}</span>
                    <span className={`text-sm font-medium ${getStatusColor(getAverage(times), 3000)}`}>
                      {getAverage(times).toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* API Response Times */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">API Response Times</h3>
              <div className="space-y-2">
                {Object.entries(performanceData.apiResponseTimes).map(([endpoint, times]) => (
                  <div key={endpoint} className="flex justify-between">
                    <span className="text-sm text-gray-600">{endpoint}</span>
                    <span className={`text-sm font-medium ${getStatusColor(getAverage(times), 1000)}`}>
                      {getAverage(times).toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Error Counts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Error Counts</h3>
              <div className="space-y-2">
                {Object.entries(performanceData.errorCounts).map(([component, count]) => (
                  <div key={component} className="flex justify-between">
                    <span className="text-sm text-gray-600">{component}</span>
                    <span className="text-sm font-medium text-red-600">{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Feature Usage */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
              <div className="space-y-2">
                {Object.entries(performanceData.featureUsage).map(([feature, count]) => (
                  <div key={feature} className="flex justify-between">
                    <span className="text-sm text-gray-600">{feature}</span>
                    <span className="text-sm font-medium text-blue-600">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard; 