/**
 * Phoenix Key - Secret Authentication
 * Gesture/sequence based authentication for secret rooms
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/apiClient';
import { API_CONFIG } from '@/lib/apiConfig';

interface PhoenixKeyProps {
  onUnlock: (token: string) => void;
  onCancel: () => void;
}

const SECRET_SEQUENCE = "PHOENIX_RISES_2025"; // Default, should be configurable
const GESTURE_PATTERN = [1, 2, 3, 2, 1]; // Click pattern: top-left, top-right, center, top-right, top-left

export function PhoenixKey({ onUnlock, onCancel }: PhoenixKeyProps) {
  const [input, setInput] = useState('');
  const [gestureSequence, setGestureSequence] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const { setToken } = useAuthStore();

  const handleSequenceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setError('');
  };

  const handleSequenceSubmit = async () => {
    if (input.trim() === SECRET_SEQUENCE) {
      setIsUnlocking(true);
      
      // Generate token
      try {
        const data = await api.post<{ token: string; expires_at: string }>(
          API_CONFIG.ENDPOINTS.PHOENIX_UNLOCK,
          { sequence: input },
          { skipAuth: true } // This is the auth endpoint itself
        );
        
        if (data.token) {
          setToken(data.token);
          // Store token in localStorage
          try {
            localStorage.setItem('phoenix_key_token', data.token);
            if (data.expires_at) {
              localStorage.setItem('phoenix_key_expires_at', data.expires_at);
            }
          } catch (e) {
            console.warn('Failed to store token in localStorage:', e);
          }
          onUnlock(data.token);
        } else {
          setError('Authentication failed: No token received');
          setAttempts(prev => prev + 1);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Connection error';
        setError(errorMessage);
        setAttempts(prev => prev + 1);
      } finally {
        setIsUnlocking(false);
      }
    } else {
      setError('Invalid sequence');
      setAttempts(prev => prev + 1);
    }
  };

  const handleGridClick = (index: number) => {
    const newSequence = [...gestureSequence, index];
    setGestureSequence(newSequence);
    setError('');

    // Check if pattern matches
    if (newSequence.length === GESTURE_PATTERN.length) {
      const matches = newSequence.every((val, i) => val === GESTURE_PATTERN[i]);
      
      if (matches) {
        setIsUnlocking(true);
        // Generate token via gesture
        api.post<{ token: string; expires_at: string }>(
          API_CONFIG.ENDPOINTS.PHOENIX_UNLOCK,
          { gesture: newSequence },
          { skipAuth: true }
        )
          .then(data => {
            if (data.token) {
              setToken(data.token);
              try {
                localStorage.setItem('phoenix_key_token', data.token);
                if (data.expires_at) {
                  localStorage.setItem('phoenix_key_expires_at', data.expires_at);
                }
              } catch (e) {
                console.warn('Failed to store token:', e);
              }
              onUnlock(data.token);
            } else {
              setError('Gesture authentication failed');
              setAttempts(prev => prev + 1);
            }
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : 'Connection error');
            setAttempts(prev => prev + 1);
          })
          .finally(() => {
            setIsUnlocking(false);
          })
          .finally(() => {
            setIsUnlocking(false);
            setGestureSequence([]);
          });
      } else {
        setError('Invalid gesture pattern');
        setAttempts(prev => prev + 1);
        setGestureSequence([]);
      }
    } else if (newSequence.length > GESTURE_PATTERN.length) {
      // Reset if too many clicks
      setGestureSequence([]);
    }
  };

  // Auto-lock after too many failed attempts
  useEffect(() => {
    if (attempts >= 5) {
      setError('Too many failed attempts. Please wait...');
      setTimeout(() => {
        setAttempts(0);
        setError('');
      }, 30000); // 30 second lockout
    }
  }, [attempts]);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isUnlocking ? (
              <Unlock className="w-8 h-8 text-cyan-400 animate-pulse" />
            ) : (
              <Lock className="w-8 h-8 text-gray-500" />
            )}
            <h2 className="text-2xl font-bold text-cyan-400">Phoenix Key</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-400 mb-6 text-sm">
          Enter the secret sequence or perform the gesture pattern
        </p>

        {/* Sequence Input */}
        <div className="mb-6">
          <input
            type="password"
            value={input}
            onChange={handleSequenceInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSequenceSubmit()}
            placeholder="Enter secret sequence..."
            disabled={isUnlocking || attempts >= 5}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSequenceSubmit}
            disabled={isUnlocking || attempts >= 5 || !input.trim()}
            className="mt-3 w-full px-4 py-2 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        </div>

        {/* Gesture Pattern */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-3 text-center">
            Or use gesture pattern ({gestureSequence.length}/{GESTURE_PATTERN.length})
          </p>
          <div
            ref={gridRef}
            className="grid grid-cols-3 gap-2 max-w-xs mx-auto"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const isActive = gestureSequence.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleGridClick(num)}
                  disabled={isUnlocking || attempts >= 5}
                  className={cn(
                    "aspect-square rounded-lg border-2 transition-all",
                    isActive
                      ? "bg-cyan-500 border-cyan-400 scale-110"
                      : "bg-gray-800 border-gray-700 hover:border-gray-600",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Attempts Counter */}
        {attempts > 0 && attempts < 5 && (
          <p className="text-xs text-gray-500 text-center">
            Failed attempts: {attempts}/5
          </p>
        )}
      </div>
    </div>
  );
}
