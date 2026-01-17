/**
 * Bundle Optimization Utilities
 * Code splitting, lazy loading, and performance optimization helpers
 */

import React, { lazy, Suspense, ComponentType, useState, useEffect, RefObject } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

/**
 * Lazy load component with loading fallback
 */
export function lazyLoad<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  _fallback?: React.ReactNode
): React.LazyExoticComponent<T> {
  return lazy(importFn);
}

/**
 * Create lazy component with spinner fallback
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  _spinnerSize: 'sm' | 'md' | 'lg' = 'lg'
): React.LazyExoticComponent<T> {
  const LazyComponent = lazy(importFn);
  
  // Wrap with Suspense boundary
  return LazyComponent;
}

/**
 * Lazy load routes for code splitting
 */
export const LazySonicCodex = lazy(() => import('@/components/sonic/WizardFlow').then(m => ({ default: m.WizardFlow })));
export const LazyGhostCodex = lazy(() => import('@/components/ghost/GhostDashboard').then(m => ({ default: m.GhostDashboard })));
export const LazyPandoraCodex = lazy(() => import('@/components/pandora/ChainBreakerDashboard').then(m => ({ default: m.ChainBreakerDashboard })));

/**
 * Lazy load heavy components
 */
export const LazyJobLibrary = lazy(() => import('@/components/sonic/JobLibrary').then(m => ({ default: m.JobLibrary })));
export const LazyJobDetails = lazy(() => import('@/components/sonic/JobDetails').then(m => ({ default: m.JobDetails })));
export const LazyLiveCapture = lazy(() => import('@/components/sonic/LiveCapture').then(m => ({ default: m.LiveCapture })));

/**
 * Suspense wrapper component
 */
export function SuspenseWrapper({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return React.createElement(
    Suspense,
    { fallback: fallback || React.createElement(LoadingSpinner, { size: "lg", text: "Loading..." }) },
    children
  );
}

/**
 * Preload component for faster subsequent loads
 */
export function preloadComponent(importFn: () => Promise<unknown>): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      importFn().catch(() => {
        // Ignore preload errors
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      importFn().catch(() => {
        // Ignore preload errors
      });
    }, 1000);
  }
}

/**
 * Preload critical routes
 */
export function preloadCriticalRoutes(): void {
  // Preload secret room components after initial render
  setTimeout(() => {
    preloadComponent(() => import('@/components/sonic/WizardFlow'));
    preloadComponent(() => import('@/components/ghost/GhostDashboard'));
    preloadComponent(() => import('@/components/pandora/ChainBreakerDashboard'));
  }, 2000);
}

/**
 * Intersection Observer hook for lazy loading images/components
 * Note: This should be used in component files that import React hooks
 */
export function useIntersectionObserver(
  ref: RefObject<HTMLElement>,
  options: IntersectionObserverInit & { once?: boolean } = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && options.once) {
          observer.unobserve(entry.target);
        }
      },
      {
        root: options.root || null,
        rootMargin: options.rootMargin || '0px',
        threshold: options.threshold || 0.1,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.root, options.rootMargin, options.threshold, options.once]);

  return isIntersecting;
}
