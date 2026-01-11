/**
 * Enhanced Audio System with Sound Effects
 * - Connection/disconnection sounds
 * - Job success/failure chimes
 * - Boom bap beats during idle
 * - Silence during active jobs
 */

import { useRef, useCallback } from 'react';

export type SoundEffect = 
  | 'connect' 
  | 'disconnect' 
  | 'job-start' 
  | 'job-success' 
  | 'job-error'
  | 'click'
  | 'notification';

interface SoundEffectConfig {
  path: string;
  volume: number;
}

const SOUND_EFFECTS: Record<SoundEffect, SoundEffectConfig> = {
  'connect': { path: '/audio/sfx/connect.mp3', volume: 0.3 },
  'disconnect': { path: '/audio/sfx/disconnect.mp3', volume: 0.3 },
  'job-start': { path: '/audio/sfx/job-start.mp3', volume: 0.2 },
  'job-success': { path: '/audio/sfx/success-chime.mp3', volume: 0.4 },
  'job-error': { path: '/audio/sfx/error-chime.mp3', volume: 0.4 },
  'click': { path: '/audio/sfx/click.mp3', volume: 0.15 },
  'notification': { path: '/audio/sfx/notification.mp3', volume: 0.25 },
};

export function useSoundEffects() {
  const audioCache = useRef<Map<SoundEffect, HTMLAudioElement>>(new Map());

  const preloadSounds = useCallback(() => {
    Object.entries(SOUND_EFFECTS).forEach(([effect, config]) => {
      if (!audioCache.current.has(effect as SoundEffect)) {
        const audio = new Audio(config.path);
        audio.volume = config.volume;
        audio.preload = 'auto';
        audioCache.current.set(effect as SoundEffect, audio);
      }
    });
  }, []);

  const play = useCallback((effect: SoundEffect) => {
    try {
      let audio = audioCache.current.get(effect);
      
      if (!audio) {
        const config = SOUND_EFFECTS[effect];
        audio = new Audio(config.path);
        audio.volume = config.volume;
        audioCache.current.set(effect, audio);
      }

      // Clone and play to allow overlapping sounds
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = audio.volume;
      clone.play().catch(err => {
        console.warn(`[SoundEffects] Failed to play ${effect}:`, err);
      });
    } catch (error) {
      console.error(`[SoundEffects] Error playing ${effect}:`, error);
    }
  }, []);

  const playWithFallback = useCallback((effect: SoundEffect, fallback?: () => void) => {
    try {
      play(effect);
    } catch {
      fallback?.();
    }
  }, [play]);

  return {
    play,
    playWithFallback,
    preloadSounds,
  };
}
