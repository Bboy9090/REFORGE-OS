/**
 * Responsive utilities for mobile-first design
 * Ensures Bobby's Workshop works perfectly on phones, tablets, and desktops
 */

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  mobile: 640,    // sm
  tablet: 768,    // md
  desktop: 1024,  // lg
  wide: 1280,     // xl
} as const;

/**
 * Check if current viewport is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.tablet;
}

/**
 * Check if current viewport is tablet
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.tablet && window.innerWidth < BREAKPOINTS.desktop;
}

/**
 * Check if current viewport is desktop
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.desktop;
}

// Import React for the hook
import React from 'react';

/**
 * React hook for responsive breakpoints
 */
export function useResponsive() {
  const [isMobileView, setIsMobileView] = React.useState(isMobile());
  const [isTabletView, setIsTabletView] = React.useState(isTablet());
  const [isDesktopView, setIsDesktopView] = React.useState(isDesktop());

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
      setIsTabletView(isTablet());
      setIsDesktopView(isDesktop());
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: isMobileView,
    isTablet: isTabletView,
    isDesktop: isDesktopView,
  };
}
