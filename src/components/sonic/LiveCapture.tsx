/**
 * Sonic Codex - Live Audio Capture
 * Real-time microphone recording interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spectrogram } from './Spectrogram';
import { apiRequest, API_CONFIG } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface AudioDevice {
  index: number;
  name: string;
  channels: number;
  sample_rate: number;
}

export function LiveCapture() {
  const { token } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDevices();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadDevices = async () => {
    if (!token) {
      // Try using browser's MediaDevices API instead
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = mediaDevices
          .filter(device => device.kind === 'audioinput')
          .map((device, index) => ({
            index,
            name: device.label || `Microphone ${index + 1}`,
            channels: 2,
            sample_rate: 44100,
          }));
        setDevices(audioInputs);
        return;
      } catch (error) {
        toast.error('Failed to access microphone devices. Please check permissions.');
        return;
      }
    }

    const response = await apiRequest<{ devices: AudioDevice[] }>(
      '/api/v1/trapdoor/sonic/capture/devices',
      {
        method: 'GET',
        requireAuth: true,
        showErrorToast: false,
      }
    );

    if (response.success && response.data) {
      setDevices(response.data.devices || []);
    } else {
      // Fallback to browser API
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = mediaDevices
          .filter(device => device.kind === 'audioinput')
          .map((device, index) => ({
            index,
            name: device.label || `Microphone ${index + 1}`,
            channels: 2,
            sample_rate: 44100,
          }));
        setDevices(audioInputs);
      } catch (error) {
        console.error('Failed to load devices:', error);
      }
    }
  };

  const startRecording = async () => {
    if (!token) {
      toast.error('Please authenticate first with Phoenix Key');
      return;
    }

    setLoading(true);
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevice && devices[selectedDevice] 
            ? { exact: devices[selectedDevice].index.toString() } 
            : undefined,
          sampleRate: 44100
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadRecording(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      // Create job first
      const jobResponse = await apiRequest<{ job_id: string }>(
        API_CONFIG.ENDPOINTS.SONIC_CAPTURE_START,
        {
          method: 'POST',
          body: {
            device: 'Microphone',
            title: `Live_Recording_${Date.now()}`,
            sample_rate: 44100
          },
          requireAuth: true,
        }
      );

      if (jobResponse.success && jobResponse.data) {
        setJobId(jobResponse.data.job_id);
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        setRecordingTime(0);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

        toast.success('Recording started');
      } else {
        stream.getTracks().forEach(track => track.stop());
        toast.error(jobResponse.error || 'Failed to create recording job');
      }
    } catch (error: any) {
      const errorMsg = error.name === 'NotAllowedError'
        ? 'Microphone permission denied. Please allow microphone access.'
        : error.name === 'NotFoundError'
        ? 'No microphone found. Please connect a microphone.'
        : 'Failed to start recording. Please check microphone permissions.';
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const uploadRecording = async (blob: Blob) => {
    if (!jobId || !token) {
      toast.error('Missing job ID or authentication');
      return;
    }

    const formData = new FormData();
    formData.append('file', blob, `recording_${jobId}.webm`);
    formData.append('device', 'Microphone');
    formData.append('title', `Live_Recording_${Date.now()}`);
    formData.append('job_id', jobId);

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SONIC_UPLOAD}?job_id=${jobId}`,
        {
          method: 'POST',
          headers: {
            'X-Secret-Room-Passcode': token,
          },
          body: formData
        }
      );

      if (response.ok) {
        toast.success('Recording uploaded successfully');
      } else {
        toast.error('Failed to upload recording');
      }
    } catch (error) {
      toast.error('Failed to upload recording. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-3 sm:p-6 overflow-y-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-cyan-400">Live Capture</h1>
        <p className="text-sm sm:text-base text-gray-400">Real-time audio recording and transcription</p>
      </div>

      {/* Device Selection - Responsive */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-sm text-gray-400 mb-2">Audio Input Device</label>
        <select
          value={selectedDevice || ''}
          onChange={(e) => setSelectedDevice(Number(e.target.value) || null)}
          disabled={isRecording || loading}
          className="w-full px-3 sm:px-4 py-2 sm:py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:border-cyan-500 focus:outline-none touch-target-min disabled:opacity-50"
        >
          <option value="">Default Device</option>
          {devices.map((device) => (
            <option key={device.index} value={device.index}>
              {device.name} ({device.sample_rate}Hz)
            </option>
          ))}
        </select>
      </div>

      {/* Recording Controls - Responsive */}
      <div className="mb-4 sm:mb-6 flex items-center justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={loading}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-red-500 text-white rounded-full font-bold hover:bg-red-400 active:bg-red-600 flex items-center gap-2 sm:gap-3 text-base sm:text-lg touch-target-min disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Start Recording</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-800 border-2 border-red-500 text-red-400 rounded-full font-bold hover:bg-gray-700 active:bg-gray-600 flex items-center gap-2 sm:gap-3 text-base sm:text-lg touch-target-min transition-colors"
          >
            <Square className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            <span className="hidden sm:inline">Stop Recording </span>
            <span>({formatTime(recordingTime)})</span>
          </button>
        )}
      </div>

      {/* Spectrogram */}
      {isRecording && (
        <div className="mb-6">
          <Spectrogram isLive={true} />
        </div>
      )}

      {/* Status - Responsive */}
      <div className="mt-auto p-3 sm:p-4 bg-gray-900 rounded-lg border border-gray-800">
        <p className="text-xs sm:text-sm text-gray-400 break-words">
          {isRecording ? (
            <span>
              <span className="text-red-400 animate-pulse">●</span> Recording... 
              {jobId && (
                <span className="block mt-1 font-mono text-xs">Job ID: {jobId}</span>
              )}
            </span>
          ) : (
            'Ready to record. Click Start Recording to begin.'
          )}
        </p>
      </div>
    </div>
  );
}
