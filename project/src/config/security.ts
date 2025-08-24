// Security Configuration
export const securityConfig = {
  disableConsoleLogs: process.env.NODE_ENV === 'production',
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  }
};

// Disable console logs in production
if (securityConfig.disableConsoleLogs) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.debug = () => {};
}
