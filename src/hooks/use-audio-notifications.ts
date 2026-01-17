import { useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { useAtmosphere, AtmosphereMode } from './use-atmosphere';
import { useSoundEffects } from './use-sound-effects';

export function useAudioNotifications() {
  const [enabled] = useKV<boolean>("atmosphere-enabled", true);  // Default ON for boom bap vibes
  const [mode] = useKV<AtmosphereMode>("atmosphere-mode", "instrumental");
  const [intensity] = useKV<number>("atmosphere-intensity", 0.08);
  const [autoMuteOnErrors] = useKV<boolean>("atmosphere-auto-mute", true);
  const [pauseOnComplete] = useKV<boolean>("atmosphere-pause-complete", true);
  const [sfxEnabled] = useKV<boolean>("sound-effects-enabled", true);

  const atmosphere = useAtmosphere();
  const soundEffects = useSoundEffects();
  const currentJobRef = useRef<string | null>(null);

  const pickTrack = (selectedMode: AtmosphereMode): string => {
    if (selectedMode === "external") return "";
    
    const base = selectedMode === "instrumental" ? "/audio/instrumental" : "/audio/ambient";
    const n = 1 + Math.floor(Math.random() * 6);
    return `${base}/loop_${n}.mp3`;
  };

  const handleJobStart = (jobId?: string) => {
    if (sfxEnabled) {
      soundEffects.play('job-start');
    }
    
    // Stop boom bap beats when job starts (silence for focus)
    atmosphere.fadeOutAndStop(500);
    
    currentJobRef.current = jobId || `job-${Date.now()}`;
  };

  const handleJobError = () => {
    if (sfxEnabled) {
      soundEffects.play('job-error');
    }
    
    if (!enabled || !autoMuteOnErrors) return;
    
    // Resume boom bap beats after error
    setTimeout(() => {
      if (enabled && mode !== "external") {
        const track = pickTrack(mode || "instrumental");
        if (track) {
          atmosphere.playLoop(track, intensity || 0.08);
        }
      }
    }, 2000);
  };

  const handleJobComplete = () => {
    if (sfxEnabled) {
      soundEffects.play('job-success');
    }
    
    currentJobRef.current = null;
    
    // Resume boom bap beats after completion
    setTimeout(() => {
      if (enabled && mode !== "external") {
        const track = pickTrack(mode || "instrumental");
        if (track) {
          atmosphere.playLoop(track, intensity || 0.08);
        }
      }
    }, 2000);
  };

  const handleConnect = () => {
    if (sfxEnabled) {
      soundEffects.play('connect');
    }
  };

  const handleDisconnect = () => {
    if (sfxEnabled) {
      soundEffects.play('disconnect');
    }
  };

  const handleJobProgress = () => {
  };

  useEffect(() => {
    if (enabled && mode !== "external") {
      atmosphere.setVolume(intensity || 0.08);
    }
  }, [intensity, enabled, mode]);

  // Auto-start boom bap beats on app load if enabled
  useEffect(() => {
    if (enabled && mode !== "external" && !currentJobRef.current) {
      const track = pickTrack(mode || "instrumental");
      if (track) {
        setTimeout(() => {
          atmosphere.playLoop(track, intensity || 0.08);
        }, 1000);
      }
    }
  }, [enabled, mode]);

  useEffect(() => {
    // Preload sound effects
    soundEffects.preloadSounds();
    
    return () => {
      atmosphere.stop();
    };
  }, []);

  return {
    handleJobStart,
    handleJobError,
    handleJobComplete,
    handleJobProgress,
    handleConnect,
    handleDisconnect,
    stopAtmosphere: atmosphere.stop,
    playSoundEffect: soundEffects.play,
  };
}
