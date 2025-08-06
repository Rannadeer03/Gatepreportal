// Environment-specific configuration
export const config = {
  // Development environment
  development: {
    enableConsoleLogs: true,
    enableAnalytics: false,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableDebugMode: true,
  },
  
  // Production environment
  production: {
    enableConsoleLogs: false,
    enableAnalytics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableDebugMode: false,
  },
  
  // Test environment
  test: {
    enableConsoleLogs: false,
    enableAnalytics: false,
    enableErrorTracking: false,
    enablePerformanceMonitoring: false,
    enableDebugMode: false,
  },
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env as keyof typeof config] || config.development;
};

// Environment utilities
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';

// Performance settings
export const performanceSettings = {
  // Image optimization
  imageQuality: isProduction() ? 85 : 100,
  imageFormat: 'webp',
  
  // Bundle optimization
  enableCodeSplitting: true,
  enableTreeShaking: true,
  enableMinification: isProduction(),
  
  // Caching
  enableCaching: isProduction(),
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  
  // Monitoring
  enableRealTimeMonitoring: isProduction(),
  monitoringInterval: 5000, // 5 seconds
};

// Analytics settings
export const analyticsSettings = {
  enableVercelAnalytics: isProduction(),
  enableCustomAnalytics: true,
  enableErrorTracking: true,
  enablePerformanceTracking: true,
  enableUserTracking: true,
};

// Security settings
export const securitySettings = {
  enableCSP: isProduction(),
  enableHSTS: isProduction(),
  enableXSSProtection: true,
  enableContentTypeSniffing: false,
  enableFrameOptions: true,
}; 