/**
 * Sonic Codex - Job Details Screen
 * Full job review with audio player and synced transcript
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, FileText, Headphones, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spectrogram } from './Spectrogram';
import { useAuthStore } from '@/stores/authStore';
import { apiRequest, API_CONFIG } from '@/lib/api-client';
import { toast } from 'sonner';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

interface JobData {
  job_id: string;
  metadata: {
    title: string;
    device: string;
    timestamp: string;
  };
  pipeline: {
    stage: string;
    progress: number;
  };
  outputs: {
    original?: string;
    enhanced?: string;
    transcript_original?: string;
    transcript_english?: string;
  };
}

interface JobDetailsProps {
  jobId: string;
  onBack?: () => void;
}

export function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEnhanced, setIsEnhanced] = useState(true);
  const [viewMode, setViewMode] = useState<'original' | 'english' | 'dual'>('dual');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadJobData();
  }, [jobId, token]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);
    
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  const { token } = useAuthStore();

  const loadJobData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    const endpoint = API_CONFIG.ENDPOINTS.SONIC_JOB_DETAILS.replace('{id}', jobId);
    const response = await apiRequest<JobData>(endpoint, {
      method: 'GET',
      requireAuth: true,
      showErrorToast: true,
    });

    if (response.success && response.data) {
      setJobData(response.data);
      
      // Load transcript if available
      if (response.data.outputs?.transcript_original) {
        try {
          const transcriptUrl = response.data.outputs.transcript_original;
          const transcriptResponse = await fetch(
            transcriptUrl.startsWith('http') 
              ? transcriptUrl 
              : `${API_CONFIG.BASE_URL}${transcriptUrl}`
          );
          if (transcriptResponse.ok) {
            const transcriptData = await transcriptResponse.json();
            setTranscript(transcriptData.segments || []);
          }
        } catch (error) {
          console.error('Failed to load transcript:', error);
        }
      }
    } else {
      toast.error(response.error || 'Failed to load job details');
    }
    
    setLoading(false);
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const jumpToTime = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = time;
    setCurrentTime(time);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const getActiveSegment = () => {
    return transcript.find(
      seg => currentTime >= seg.start && currentTime <= seg.end
    );
  };

  const [exporting, setExporting] = useState<{ [key: string]: boolean }>({});

  const handleExport = async (format: 'zip' | 'txt' | 'srt' | 'json') => {
    if (!token) {
      toast.error('Please authenticate first with Phoenix Key');
      return;
    }

    setExporting(prev => ({ ...prev, [format]: true }));
    const downloadUrl = `${API_CONFIG.BASE_URL}/api/v1/trapdoor/sonic/jobs/${jobId}/download?format=${format}`;
    
    try {
      const response = await fetch(downloadUrl, {
        headers: {
          'X-Secret-Room-Passcode': token,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `job_${jobId}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`${format.toUpperCase()} file downloaded successfully!`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to export file' }));
        toast.error(errorData.message || 'Failed to export file');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to export file. Please try again.';
      toast.error(errorMsg);
    } finally {
      setExporting(prev => ({ ...prev, [format]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Loading job details...</p>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
        <p className="text-lg mb-2">Job not found</p>
        <p className="text-sm text-gray-500">The requested job could not be loaded.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Library
          </button>
        )}
      </div>
    );
  }

  const audioUrl = isEnhanced && jobData.outputs?.enhanced
    ? jobData.outputs.enhanced
    : jobData.outputs?.original;

  return (
    <div className="flex flex-col h-full bg-black text-white p-3 sm:p-6 overflow-y-auto">
      {/* Header - Responsive */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-gray-800 pb-3 sm:pb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1 truncate">{jobData.metadata.title}</h1>
          <p className="text-xs sm:text-sm text-gray-400 break-words">
            <span className="block sm:inline">{jobData.metadata.device}</span>
            <span className="hidden sm:inline"> • </span>
            <span className="block sm:inline">{new Date(jobData.metadata.timestamp).toLocaleString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsEnhanced(!isEnhanced)}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 touch-target-min",
              isEnhanced
                ? "bg-cyan-500 text-black hover:bg-cyan-400"
                : "bg-gray-800 border border-gray-700 text-cyan-400 hover:bg-gray-700"
            )}
          >
            {isEnhanced ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{isEnhanced ? 'Enhanced' : 'Original'}</span>
            <span className="sm:hidden">{isEnhanced ? 'Enhanced' : 'Original'}</span>
          </button>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={() => handleExport('zip')}
              disabled={exporting['zip']}
              className="px-3 sm:px-4 py-2 bg-amber-500 text-black rounded-lg text-xs sm:text-sm font-bold hover:bg-amber-400 active:bg-amber-600 flex items-center gap-2 touch-target-min transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export ZIP Package"
              aria-label="Export ZIP Package"
            >
              {exporting['zip'] ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>ZIP</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleExport('srt')}
              disabled={exporting['srt']}
              className="px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-700 active:bg-gray-600 touch-target-min transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Export SRT Subtitles"
              aria-label="Export SRT"
            >
              {exporting['srt'] ? (
                <>
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                </>
              ) : (
                'SRT'
              )}
            </button>
            <button
              onClick={() => handleExport('txt')}
              disabled={exporting['txt']}
              className="px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-700 active:bg-gray-600 touch-target-min transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Export Plain Text"
              aria-label="Export TXT"
            >
              {exporting['txt'] ? (
                <>
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                </>
              ) : (
                'TXT'
              )}
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting['json']}
              className="px-2 sm:px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-700 active:bg-gray-600 touch-target-min transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Export JSON"
              aria-label="Export JSON"
            >
              {exporting['json'] ? (
                <>
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                </>
              ) : (
                'JSON'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spectrogram */}
      {audioUrl && (
        <div className="mb-6">
          <Spectrogram audioUrl={audioUrl} />
        </div>
      )}

      {/* Audio Player - Responsive */}
      <div className="mb-4 sm:mb-6">
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-800">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <button
              onClick={togglePlayback}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400 active:bg-cyan-600 transition-colors touch-target-min flex-shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 sm:ml-1" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="w-full bg-gray-800 rounded-full h-1.5 sm:h-2 mb-2">
                <div
                  className="bg-cyan-500 h-1.5 sm:h-2 rounded-full transition-all"
                  style={{
                    width: audioRef.current && audioRef.current.duration > 0
                      ? `${(currentTime / audioRef.current.duration) * 100}%`
                      : '0%'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{audioRef.current && audioRef.current.duration ? formatTime(audioRef.current.duration) : '0:00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript View Controls - Responsive */}
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
        <span className="text-xs sm:text-sm text-gray-400">View:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('original')}
            className={cn(
              "px-2 sm:px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm touch-target-min transition-colors",
              viewMode === 'original'
                ? "bg-cyan-500 text-black hover:bg-cyan-400"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600"
            )}
          >
            Original
          </button>
          <button
            onClick={() => setViewMode('english')}
            className={cn(
              "px-2 sm:px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm touch-target-min transition-colors",
              viewMode === 'english'
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600"
            )}
          >
            English
          </button>
          <button
            onClick={() => setViewMode('dual')}
            className={cn(
              "px-2 sm:px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm touch-target-min transition-colors",
              viewMode === 'dual'
                ? "bg-purple-500 text-black hover:bg-purple-400"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 active:bg-gray-600"
            )}
          >
            Dual
          </button>
        </div>
      </div>

      {/* Transcript Viewer - Responsive */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-h-0">
        {(viewMode === 'original' || viewMode === 'dual') && (
          <div className="flex flex-col bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-3 bg-gray-900 border-b border-gray-800">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Original Language
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {transcript.map((seg, i) => {
                const isActive = currentTime >= seg.start && currentTime <= seg.end;
                return (
                  <p
                    key={i}
                    onClick={() => jumpToTime(seg.start)}
                    className={cn(
                      "cursor-pointer transition-all text-sm",
                      isActive
                        ? "text-cyan-400 text-base scale-105 font-semibold"
                        : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {seg.speaker && (
                      <span className="text-xs text-purple-400 mr-2">[{seg.speaker}]</span>
                    )}
                    <span className="text-[10px] mr-2 opacity-50">
                      [{Math.floor(seg.start)}s]
                    </span>
                    {seg.text}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {(viewMode === 'english' || viewMode === 'dual') && (
          <div className="flex flex-col bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-3 bg-gray-900 border-b border-gray-800">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                English Translation
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {transcript.map((seg, i) => {
                const isActive = currentTime >= seg.start && currentTime <= seg.end;
                return (
                  <p
                    key={i}
                    onClick={() => jumpToTime(seg.start)}
                    className={cn(
                      "cursor-pointer transition-all text-sm",
                      isActive
                        ? "text-amber-400 text-base scale-105 font-semibold"
                        : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {seg.speaker && (
                      <span className="text-xs text-purple-400 mr-2">[{seg.speaker}]</span>
                    )}
                    <span className="text-[10px] mr-2 opacity-50">
                      [{Math.floor(seg.start)}s]
                    </span>
                    {seg.text}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
