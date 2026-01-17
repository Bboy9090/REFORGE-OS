/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

import { logger } from './logger';

/**
 * Performance metrics tracker
 */
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Start performance measurement
   */
  start(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration);
      logger.debug('Performance', `${label}: ${duration.toFixed(2)}ms`);
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Get performance statistics for a metric
   */
  getStats(label: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    median: number;
  } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const count = sorted.length;
    const avg = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const median = sorted[Math.floor(count / 2)];

    return { count, avg, min, max, median };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, ReturnType<typeof this.getStats>> {
    const result: Record<string, ReturnType<typeof this.getStats>> = {};
    this.metrics.forEach((_, label) => {
      result[label] = this.getStats(label)!;
    });
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance measurement
 * Note: Import React and useEffect in component files when using this
 */
export function usePerformanceMeasure(label: string, dependencies: unknown[] = []): void {
  // This hook should be used in component files with React hooks imported
  // Example usage:
  // import { useEffect } from 'react';
  // import { usePerformanceMeasure } from '@/lib/performance';
  // usePerformanceMeasure('MyComponent', [dep1, dep2]);
  // Implementation is handled in component files
}

/**
 * Wrap async function with performance tracking
 */
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  label: string
): T {
  return (async (...args: any[]) => {
    const stop = performanceMonitor.start(label);
    try {
      const result = await fn(...args);
      return result;
    } finally {
      stop();
    }
  }) as T;
}
