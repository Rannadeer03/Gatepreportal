import { supabase } from '../lib/supabase';
import { loggingService } from './loggingService';

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  userAgent: string;
  timestamp: string;
}

export interface ErrorReport {
  error: string;
  stack?: string;
  component?: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
}

export interface UserAnalytics {
  pageViews: number;
  uniqueUsers: number;
  sessionDuration: number;
  featureUsage: { [key: string]: number };
}

class MonitoringService {
  private performanceMetrics: PerformanceMetrics[] = [];
  private errorReports: ErrorReport[] = [];
  private analyticsData: UserAnalytics = {
    pageViews: 0,
    uniqueUsers: 0,
    sessionDuration: 0,
    featureUsage: {}
  };

  // Track page load performance
  trackPageLoad(pageName: string, loadTime: number) {
    const metric: PerformanceMetrics = {
      pageLoadTime: loadTime,
      apiResponseTime: 0,
      memoryUsage: performance.memory?.usedJSHeapSize || 0,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.performanceMetrics.push(metric);
    this.analyticsData.pageViews++;

    // Log to Supabase every 10 metrics
    if (this.performanceMetrics.length >= 10) {
      this.flushPerformanceMetrics();
    }

    // Log page view
    loggingService.logActivity('page_view', {
      page: pageName,
      loadTime,
      userAgent: navigator.userAgent
    });
  }

  // Track API response times
  trackApiCall(endpoint: string, responseTime: number, success: boolean) {
    const metric: PerformanceMetrics = {
      pageLoadTime: 0,
      apiResponseTime: responseTime,
      memoryUsage: performance.memory?.usedJSHeapSize || 0,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.performanceMetrics.push(metric);

    // Log API call
    loggingService.logActivity('api_call', {
      endpoint,
      responseTime,
      success
    });
  }

  // Track errors
  trackError(error: Error, component?: string) {
    const errorReport: ErrorReport = {
      error: error.message,
      stack: error.stack,
      component,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.errorReports.push(errorReport);

    // Log error immediately
    loggingService.logActivity('error', {
      message: error.message,
      component,
      stack: error.stack?.substring(0, 500) // Limit stack trace
    });

    // Flush errors every 5 reports
    if (this.errorReports.length >= 5) {
      this.flushErrorReports();
    }
  }

  // Track feature usage
  trackFeatureUsage(feature: string) {
    this.analyticsData.featureUsage[feature] = 
      (this.analyticsData.featureUsage[feature] || 0) + 1;

    loggingService.logActivity('feature_usage', {
      feature,
      count: this.analyticsData.featureUsage[feature]
    });
  }

  // Track session duration
  trackSessionDuration(duration: number) {
    this.analyticsData.sessionDuration = duration;
    
    loggingService.logActivity('session_end', {
      duration,
      pageViews: this.analyticsData.pageViews
    });
  }

  // Flush performance metrics to database
  private async flushPerformanceMetrics() {
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert(
          this.performanceMetrics.map(metric => ({
            user_id: null,
            action_type: 'performance_metric',
            action_details: metric,
            ip_address: null,
            user_agent: metric.userAgent,
            session_id: null
          }))
        );

      if (error) {
        console.error('Failed to flush performance metrics:', error);
      } else {
        this.performanceMetrics = [];
      }
    } catch (error) {
      console.error('Error flushing performance metrics:', error);
    }
  }

  // Flush error reports to database
  private async flushErrorReports() {
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert(
          this.errorReports.map(report => ({
            user_id: null,
            action_type: 'error_report',
            action_details: report,
            ip_address: null,
            user_agent: report.userAgent,
            session_id: null
          }))
        );

      if (error) {
        console.error('Failed to flush error reports:', error);
      } else {
        this.errorReports = [];
      }
    } catch (error) {
      console.error('Error flushing error reports:', error);
    }
  }

  // Get analytics summary
  getAnalyticsSummary(): UserAnalytics {
    return { ...this.analyticsData };
  }

  // Initialize monitoring
  init() {
    // Track session start
    loggingService.logActivity('session_start', {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Set up error tracking
    window.addEventListener('error', (event) => {
      this.trackError(event.error, 'global');
    });

    // Set up unhandled promise rejection tracking
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), 'promise');
    });

    // Track session end
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - performance.timing.navigationStart;
      this.trackSessionDuration(sessionDuration);
    });

    console.log('Monitoring service initialized');
  }
}

export const monitoringService = new MonitoringService(); 