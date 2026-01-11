/**
 * Accessibility Utilities
 * Keyboard shortcuts, ARIA attributes, and screen reader support
 */

import { useEffect, useCallback } from 'react';

/**
 * Keyboard shortcut handler
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  const {
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    preventDefault = true,
  } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check modifiers
      if (ctrl && !event.ctrlKey) return;
      if (shift && !event.shiftKey) return;
      if (alt && !event.altKey) return;
      if (meta && !event.metaKey) return;
      
      // Check if other modifiers are not pressed
      if (!ctrl && event.ctrlKey) return;
      if (!shift && event.shiftKey) return;
      if (!alt && event.altKey) return;
      if (!meta && event.metaKey) return;

      // Check key match (case-insensitive)
      if (event.key.toLowerCase() === key.toLowerCase()) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrl, shift, alt, meta, preventDefault]);
}

/**
 * Register global keyboard shortcuts
 */
export function registerGlobalShortcuts() {
  useEffect(() => {
    const shortcuts: Array<{
      key: string;
      callback: () => void;
      description: string;
      modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean };
    }> = [
      // Add global shortcuts here
      // Example: { key: 'k', callback: () => console.log('K pressed'), description: 'Search', modifiers: { ctrl: true } },
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const { key, callback, modifiers = {} } = shortcut;
        const { ctrl = false, shift = false, alt = false, meta = false } = modifiers;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          event.ctrlKey === ctrl &&
          event.shiftKey === shift &&
          event.altKey === alt &&
          event.metaKey === meta
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * Focus management utilities
 */
export function focusElement(selector: string): boolean {
  try {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      return true;
    }
  } catch (error) {
    console.error('Failed to focus element:', error);
  }
  return false;
}

/**
 * Trap focus within a container (for modals)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, isActive]);
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Get accessible label for icon-only buttons
 */
export function getAccessibleLabel(
  iconName: string,
  action: string
): string {
  return `${action} - ${iconName}`;
}
