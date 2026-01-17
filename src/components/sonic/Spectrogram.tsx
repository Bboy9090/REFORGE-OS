/**
 * Sonic Codex - Spectrogram Visualization
 * Real-time frequency visualization using Web Audio API
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SpectrogramProps {
  audioUrl?: string;
  isLive?: boolean;
  width?: number;
  height?: number;
}

export function Spectrogram({ audioUrl, isLive = false, width = 800, height = 200 }: SpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Draw function
    const draw = () => {
      if (!analyser || !ctx) return;

      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw spectrogram bars
      const barWidth = width / bufferLength * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;

        // Color gradient: low = cyan, mid = yellow, high = red
        const hue = (i / bufferLength) * 240; // 0-240 (cyan to red)
        const saturation = 100;
        const lightness = 50 + (dataArray[i] / 255) * 50;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      // Draw frequency labels
      ctx.fillStyle = '#22d3ee';
      ctx.font = '10px monospace';
      ctx.fillText('0 Hz', 5, height - 5);
      ctx.fillText('20 kHz', width - 50, height - 5);
    };

    if (isActive) {
      draw();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [width, height, isActive]);

  useEffect(() => {
    if (!audioUrl || !audioContextRef.current || !analyserRef.current) return;

    const audio = new Audio(audioUrl);
    const source = audioContextRef.current.createMediaElementSource(audio);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    audio.addEventListener('play', () => setIsActive(true));
    audio.addEventListener('pause', () => setIsActive(false));
    audio.addEventListener('ended', () => setIsActive(false));

    return () => {
      audio.pause();
      source.disconnect();
    };
  }, [audioUrl]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-cyan-400">Spectrogram</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3 h-3 bg-cyan-500 rounded"></div>
          <span>Low</span>
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Mid</span>
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>High</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full rounded border border-gray-700"
      />
    </div>
  );
}
