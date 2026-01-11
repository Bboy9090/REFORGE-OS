/**
 * useBugsGreeting - Hook for managing "What's up, doc?" greeting state
 * 
 * Rules:
 * - Once per session (default)
 * - Suppressed during: flashing, unlocking, destructive ops, Secret Room rituals
 */

import { useState, useEffect } from 'react';

interface UseBugsGreetingOptions {
  suppressDuring?: 'flashing' | 'unlocking' | 'destructive' | 'secret-room' | null;
  enabled?: boolean;
}

export function useBugsGreeting(options: UseBugsGreetingOptions = {}) {
  const { suppressDuring = null, enabled = true } = options;
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  useEffect(() => {
    // Check session storage - only run once on mount to prevent loops
    const sessionKey = 'bugs-greeting-shown';
    const shown = sessionStorage.getItem(sessionKey) === 'true';

    // Don't show if disabled, already shown, or suppressed
    if (!enabled || shown || suppressDuring) {
      setShowGreeting(false);
      return;
    }

    // Show greeting once per session
    setShowGreeting(true);
    setHasShownThisSession(true);
    sessionStorage.setItem(sessionKey, 'true');
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const dismiss = () => {
    setShowGreeting(false);
  };

  const reset = () => {
    sessionStorage.removeItem('bugs-greeting-shown');
    setHasShownThisSession(false);
    setShowGreeting(false);
  };

  return {
    showGreeting,
    dismiss,
    reset,
    hasShownThisSession,
  };
}
