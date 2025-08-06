import { monitoringService } from './monitoringService';

class PerformanceService {
  private isInitialized = false;

  // Initialize performance optimizations
  init() {
    if (this.isInitialized) return;
    
    this.setupImageOptimization();
    this.setupLazyLoading();
    this.setupCodeSplitting();
    this.setupErrorBoundaries();
    this.setupConsoleOptimization();
    
    this.isInitialized = true;
  }

  // Optimize image loading
  private setupImageOptimization() {
    // Intersection Observer for lazy image loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Setup lazy loading for components
  private setupLazyLoading() {
    // Intersection Observer for component lazy loading
    if ('IntersectionObserver' in window) {
      const componentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const component = entry.target as HTMLElement;
            component.classList.add('loaded');
            componentObserver.unobserve(component);
          }
        });
      });

      // Observe components with lazy-load class
      document.querySelectorAll('.lazy-load').forEach(component => {
        componentObserver.observe(component);
      });
    }
  }

  // Setup code splitting optimization
  private setupCodeSplitting() {
    // Disabled preloading to avoid warnings
    // Preloading should be handled by the build system
  }

  // Setup error boundaries
  private setupErrorBoundaries() {
    // Global error handler
    window.addEventListener('error', (event) => {
      monitoringService.trackError(event.error, 'global');
      
      // Prevent default error logging in production
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
      }
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      monitoringService.trackError(new Error(event.reason), 'promise');
      
      // Prevent default error logging in production
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
      }
    });
  }

  // Optimize console output
  private setupConsoleOptimization() {
    // Only show console logs in development
    if (process.env.NODE_ENV === 'production') {
      // Override console methods in production
      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
      };

      // Only log errors in production
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      
      // Keep error logging for monitoring
      console.error = (...args) => {
        originalConsole.error(...args);
        monitoringService.trackError(new Error(args.join(' ')), 'console');
      };
    }
  }

  // Optimize bundle size
  optimizeBundle() {
    // Remove unused CSS
    this.removeUnusedCSS();
    
    // Optimize fonts
    this.optimizeFonts();
    
    // Compress images
    this.compressImages();
  }

  private removeUnusedCSS() {
    // Implementation for removing unused CSS
    // This would typically be done at build time
  }

  private optimizeFonts() {
    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'style';
      document.head.appendChild(link);
    });
  }

  private compressImages() {
    // Implementation for image compression
    // This would typically be done at build time
  }

  // Performance monitoring
  trackPerformance(metric: string, value: number) {
    monitoringService.trackApiCall(metric, value, true);
  }

  // Memory optimization
  optimizeMemory() {
    // Clear unused event listeners
    this.clearUnusedEventListeners();
    
    // Clear unused timers
    this.clearUnusedTimers();
    
    // Clear unused intervals
    this.clearUnusedIntervals();
  }

  private clearUnusedEventListeners() {
    // Implementation for clearing unused event listeners
  }

  private clearUnusedTimers() {
    // Implementation for clearing unused timers
  }

  private clearUnusedIntervals() {
    // Implementation for clearing unused intervals
  }
}

export const performanceService = new PerformanceService(); 