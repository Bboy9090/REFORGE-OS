/**
 * Console Cleaner
 * Removes console statements in production
 * Replaces console.log/info/debug with no-ops in production builds
 */

if (import.meta.env.PROD) {
  // Replace console methods with no-ops in production
  const noOp = () => {};
  
  // Keep only errors and warnings
  console.log = noOp;
  console.info = noOp;
  console.debug = noOp;
  console.trace = noOp;
  console.table = noOp;
  console.time = noOp;
  console.timeEnd = noOp;
  console.group = noOp;
  console.groupEnd = noOp;
  console.groupCollapsed = noOp;
  console.count = noOp;
  console.countReset = noOp;
  
  // Keep console.warn, console.error, and console.assert for production debugging
  // These are critical for production error tracking
}

/**
 * Safe console wrapper that respects environment
 */
export const safeConsole = {
  log: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.debug(...args);
    }
  },
  warn: (...args: unknown[]) => {
    // Always show warnings (even in production)
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Always show errors (even in production)
    console.error(...args);
  },
};
