// Utility to disable console logs for security
export const disableConsoleLogs = () => {
  if (process.env.NODE_ENV === 'production') {
    // Store original console methods
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    // Override console methods
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.debug = () => {};

    // Allow critical errors to still be logged if needed
    console.critical = originalConsole.error;
  }
};

// Call immediately
disableConsoleLogs();
