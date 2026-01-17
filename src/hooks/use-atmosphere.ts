import { useRef } from "react";

export type AtmosphereMode = "instrumental" | "ambient" | "external";

export function useAtmosphere() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const stopFadeTimer = () => {
    if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
    fadeTimerRef.current = null;
  };

  const stop = () => {
    stopFadeTimer();
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.src = "";
      audioRef.current = null;
    }
  };

  const playLoop = (src: string, volume: number) => {
    stop();
    const a = new Audio(src);
    a.loop = true;

    a.volume = Math.min(Math.max(volume, 0), 0.15);

    a.play().catch(() => {});
    audioRef.current = a;
  };

  const fadeOutAndStop = (ms = 300) => {
    const a = audioRef.current;
    if (!a) return;

    stopFadeTimer();
    const steps = 12;
    const stepMs = Math.max(10, Math.floor(ms / steps));
    const startVol = a.volume;

    let i = 0;
    fadeTimerRef.current = window.setInterval(() => {
      i++;
      const next = startVol * (1 - i / steps);
      a.volume = Math.max(0, next);
      if (i >= steps) {
        stop();
      }
    }, stepMs);
  };

  const setVolume = (volume: number) => {
    const a = audioRef.current;
    if (a) a.volume = Math.min(Math.max(volume, 0), 0.15);
  };

  return { playLoop, stop, fadeOutAndStop, setVolume };
}
