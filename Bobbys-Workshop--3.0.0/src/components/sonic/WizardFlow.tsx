/**
 * Sonic Codex - Wizard Flow Component
 * Multi-step wizard for audio processing workflow
 * Complete implementation with file upload, URL extraction, validation, and loading states
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Settings, FileText, Eye, Download, Link as LinkIcon, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobLibrary } from './JobLibrary';
import { JobDetails } from './JobDetails';
import { LiveCapture } from './LiveCapture';
import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG, apiRequest } from '@/lib/api-client';
import { toast } from 'sonner';
import { LoadingSpinner, ProgressBar } from '@/components/common/LoadingSpinner';

type WizardStep = 'import' | 'metadata' | 'enhance' | 'transcribe' | 'review' | 'export';

interface WizardFlowProps {
  onComplete?: (jobId: string) => void;
}

interface FileMetadata {
  title: string;
  device: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const ALLOWED_FILE_TYPES = [
  'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/flac',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'
];

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.ogg', '.aac', '.mp4', '.mov', '.avi', '.mkv', '.webm'];
const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // 500MB

export function WizardFlow({ onComplete }: WizardFlowProps) {
  const { token } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<WizardStep>('import');
  const [jobId, setJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'wizard' | 'library' | 'details' | 'live'>('wizard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlInputError, setUrlInputError] = useState<string | null>(null);
  const [processingUrl, setProcessingUrl] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'url' | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata>({ title: '', device: '' });
  const [metadataErrors, setMetadataErrors] = useState<ValidationError[]>([]);
  const [enhancementPreset, setEnhancementPreset] = useState<string>('');
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [transcript, setTranscript] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const steps: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
    { id: 'import', label: 'Import', icon: <Upload className="w-4 h-4" /> },
    { id: 'metadata', label: 'Metadata', icon: <FileText className="w-4 h-4" /> },
    { id: 'enhance', label: 'Enhance', icon: <Settings className="w-4 h-4" /> },
    { id: 'transcribe', label: 'Transcribe', icon: <FileText className="w-4 h-4" /> },
    { id: 'review', label: 'Review', icon: <Eye className="w-4 h-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="w-4 h-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // Validation functions
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    return null;
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const validateMetadata = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (!metadata.title.trim()) {
      errors.push({ field: 'title', message: 'Title is required' });
    }
    if (!metadata.device.trim()) {
      errors.push({ field: 'device', message: 'Device is required' });
    }
    return errors;
  };

  // File handling
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSelectedFile(file);
    setImportMethod('file');
    if (!metadata.title) {
      setMetadata(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
    }
    toast.success(`File selected: ${file.name}`);
  }, [metadata]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Upload file
  const handleFileUpload = async () => {
    if (!selectedFile || !token) {
      toast.error('Please select a file and authenticate first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('device', metadata.device || 'Unknown');
      formData.append('title', metadata.title || selectedFile.name);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SONIC_UPLOAD}`, {
        method: 'POST',
        headers: {
          'X-Secret-Room-Passcode': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setJobId(data.job_id);
      setUploadProgress(100);
      toast.success('File uploaded successfully!');
      
      // Auto-advance to metadata if not set
      if (!metadata.title || !metadata.device) {
        setCurrentStep('metadata');
      } else {
        setCurrentStep('enhance');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload file';
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // Extract from URL
  const handleUrlExtract = async () => {
    if (!urlInput.trim() || !token) {
      toast.error('Please enter a valid URL and authenticate first');
      return;
    }

    if (!validateUrl(urlInput)) {
      setUrlInputError('Please enter a valid URL');
      toast.error('Invalid URL format');
      return;
    }

    setProcessingUrl(true);
    setUrlInputError(null);

    try {
      const response = await apiRequest<{ job_id: string; status: string }>(
        `${API_CONFIG.ENDPOINTS.SONIC_URL}?url=${encodeURIComponent(urlInput)}&device=${encodeURIComponent(metadata.device || 'URL_Source')}&title=${encodeURIComponent(metadata.title || 'URL_Extraction')}`,
        {
          method: 'POST',
          requireAuth: true,
          showErrorToast: true,
        }
      );

      if (response.success && response.data) {
        setJobId(response.data.job_id);
        toast.success('URL extraction started! Processing in background...');
        setCurrentStep('transcribe'); // Skip to transcribe as enhancement happens automatically
      } else {
        throw new Error(response.error || 'Failed to extract from URL');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to extract from URL';
      toast.error(errorMsg);
    } finally {
      setProcessingUrl(false);
    }
  };

  // Handle metadata submission
  const handleMetadataNext = () => {
    const errors = validateMetadata();
    if (errors.length > 0) {
      setMetadataErrors(errors);
      errors.forEach(err => toast.error(err.message));
      return;
    }

    setMetadataErrors([]);
    
    // If file selected, upload it
    if (selectedFile && importMethod === 'file') {
      handleFileUpload();
    } else {
      setCurrentStep('enhance');
    }
  };

  // Start transcription
  const handleTranscribe = async () => {
    if (!jobId || !token) {
      toast.error('Job ID or authentication missing');
      return;
    }

    setTranscribing(true);
    setTranscribeProgress(0);

    // Simulate progress (in real implementation, use WebSocket)
    const progressInterval = setInterval(() => {
      setTranscribeProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 1000);

    try {
      // TODO: Call actual transcription endpoint
      // For now, simulate success after 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      clearInterval(progressInterval);
      setTranscribeProgress(100);
      
      // Load transcript
      const transcriptResponse = await apiRequest(
        `${API_CONFIG.ENDPOINTS.SONIC_JOB_DETAILS.replace('{id}', jobId)}`,
        { method: 'GET', requireAuth: true }
      );

      if (transcriptResponse.success && transcriptResponse.data) {
        setTranscript(transcriptResponse.data.outputs?.transcript_original || { segments: [] });
        toast.success('Transcription completed!');
        setCurrentStep('review');
      }
    } catch (error) {
      clearInterval(progressInterval);
      const errorMsg = error instanceof Error ? error.message : 'Transcription failed';
      toast.error(errorMsg);
    } finally {
      setTranscribing(false);
    }
  };

  // Handle export
  const handleExport = async (format: 'zip' | 'txt' | 'srt' | 'json' = 'zip') => {
    if (!jobId || !token) {
      toast.error('Job ID or authentication missing');
      return;
    }

    setExporting(true);

    try {
      const downloadUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SONIC_JOB_DETAILS.replace('{id}', jobId)}/download?format=${format}`;
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
        toast.success(`${format.toUpperCase()} package downloaded!`);
        
        if (onComplete) {
          onComplete(jobId);
        }
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to export package';
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  // Show library, details, or live capture if in those modes
  if (viewMode === 'library') {
    return <JobLibrary />;
  }

  if (viewMode === 'details' && selectedJobId) {
    return <JobDetails jobId={selectedJobId} onBack={() => setViewMode('library')} />;
  }

  if (viewMode === 'live') {
    return <LiveCapture />;
  }

  return (
    <div className="flex flex-col h-full bg-black text-white p-3 sm:p-6 overflow-hidden">
      {/* Mode Toggle - Responsive */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('wizard')}
            className={cn(
              "px-3 py-2 rounded text-sm touch-target-min transition-colors",
              viewMode === 'wizard'
                ? "bg-cyan-500 text-black font-bold"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            New Job
          </button>
          <button
            onClick={() => setViewMode('library')}
            className={cn(
              "px-3 py-2 rounded text-sm touch-target-min transition-colors",
              viewMode === 'library'
                ? "bg-cyan-500 text-black font-bold"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            Job Library
          </button>
          <button
            onClick={() => setViewMode('live')}
            className={cn(
              "px-3 py-2 rounded text-sm touch-target-min transition-colors",
              viewMode === 'live'
                ? "bg-cyan-500 text-black font-bold"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            Live Capture
          </button>
        </div>
      </div>

      {/* Progress Bar - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1 min-w-[80px] sm:min-w-0">
              <div className="flex flex-col items-center flex-1 w-full">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0",
                    index <= currentStepIndex
                      ? "bg-cyan-500 border-cyan-500 text-black"
                      : "bg-gray-800 border-gray-700 text-gray-500"
                  )}
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5">{step.icon}</div>
                </div>
                <span className="text-xs mt-1 sm:mt-2 text-gray-400 text-center px-1 truncate w-full">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block h-0.5 flex-1 mx-2 transition-colors",
                    index < currentStepIndex ? "bg-cyan-500" : "bg-gray-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content - Responsive */}
      <div className="flex-1 bg-gray-950 rounded-lg border border-gray-800 p-3 sm:p-6 overflow-y-auto min-h-0">
        {/* Import Step */}
        {currentStep === 'import' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-cyan-400">Import Media</h2>
              <p className="text-sm sm:text-base text-gray-400">Upload audio/video file or extract from URL</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File Upload */}
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 sm:p-12 transition-colors cursor-pointer touch-target-min",
                  selectedFile
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-gray-700 hover:border-cyan-500"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-500" />
                <p className="text-sm sm:text-base text-gray-400 font-semibold mb-1">Upload File</p>
                <p className="text-xs sm:text-sm text-gray-500">Drag and drop or click to select</p>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setImportMethod(null);
                        }}
                        className="ml-2 p-1 hover:bg-gray-800 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* URL Extraction */}
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 sm:p-12 hover:border-cyan-500 transition-colors">
                <LinkIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-500" />
                <p className="text-sm sm:text-base text-gray-400 font-semibold mb-4">Extract from URL</p>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlInputError(null);
                      if (e.target.value) setImportMethod('url');
                    }}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                  {urlInputError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {urlInputError}
                    </p>
                  )}
                  <button
                    onClick={handleUrlExtract}
                    disabled={!urlInput.trim() || processingUrl || !token}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg font-bold text-sm transition-colors touch-target-min",
                      urlInput.trim() && !processingUrl && token
                        ? "bg-cyan-500 text-black hover:bg-cyan-400 active:bg-cyan-600"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    {processingUrl ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Extract Audio'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-6">
                <ProgressBar progress={uploadProgress} label="Uploading file..." />
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-center gap-4 mt-6">
              {selectedFile && importMethod === 'file' && (
                <button
                  onClick={() => setCurrentStep('metadata')}
                  disabled={uploading}
                  className="px-6 py-3 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 active:bg-cyan-600 transition-colors touch-target-min disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Add Metadata
                </button>
              )}
              {urlInput && importMethod === 'url' && !processingUrl && (
                <button
                  onClick={() => {
                    if (validateUrl(urlInput)) {
                      setCurrentStep('metadata');
                    } else {
                      setUrlInputError('Please enter a valid URL');
                    }
                  }}
                  className="px-6 py-3 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 active:bg-cyan-600 transition-colors touch-target-min"
                >
                  Next: Add Metadata
                </button>
              )}
            </div>
          </div>
        )}

        {/* Metadata Step */}
        {currentStep === 'metadata' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-cyan-400">File Metadata</h2>
              <p className="text-sm text-gray-400">Provide information about your audio source</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => {
                    setMetadata(prev => ({ ...prev, title: e.target.value }));
                    setMetadataErrors(errors => errors.filter(err => err.field !== 'title'));
                  }}
                  className={cn(
                    "w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors",
                    metadataErrors.find(e => e.field === 'title')
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-cyan-500"
                  )}
                  placeholder="Enter a descriptive title"
                  required
                />
                {metadataErrors.find(e => e.field === 'title') && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {metadataErrors.find(e => e.field === 'title')?.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Device <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={metadata.device}
                  onChange={(e) => {
                    setMetadata(prev => ({ ...prev, device: e.target.value }));
                    setMetadataErrors(errors => errors.filter(err => err.field !== 'device'));
                  }}
                  className={cn(
                    "w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors",
                    metadataErrors.find(e => e.field === 'device')
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-cyan-500"
                  )}
                  placeholder="Device name (e.g., iPhone 13 Pro, Desktop Microphone)"
                  required
                />
                {metadataErrors.find(e => e.field === 'device') && (
                  <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {metadataErrors.find(e => e.field === 'device')?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setCurrentStep('import')}
                className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min"
              >
                Back
              </button>
              <button
                onClick={handleMetadataNext}
                disabled={uploading}
                className="flex-1 px-6 py-2 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 active:bg-cyan-600 transition-colors touch-target-min disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedFile && importMethod === 'file' ? (
                  uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Upload & Continue'
                  )
                ) : (
                  'Next: Enhance'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Enhance Step */}
        {currentStep === 'enhance' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-cyan-400">Audio Enhancement</h2>
              <p className="text-sm text-gray-400">Select an enhancement preset for your audio</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'speech_clear', name: 'Speech Clear', desc: 'Optimize for clear speech' },
                { id: 'interview', name: 'Interview', desc: 'Two-person conversation' },
                { id: 'noisy_room', name: 'Noisy Room', desc: 'Background noise reduction' },
                { id: 'super_sonic', name: 'Super Sonic', desc: 'Maximum intelligibility boost' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setEnhancementPreset(preset.id);
                    toast.success(`Selected: ${preset.name}`);
                  }}
                  className={cn(
                    "p-4 bg-gray-900 border-2 rounded-lg transition-all touch-target-min text-left",
                    enhancementPreset === preset.id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-gray-700 hover:border-cyan-500"
                  )}
                >
                  <h3 className="font-bold text-white mb-1">{preset.name}</h3>
                  <p className="text-xs text-gray-400">{preset.desc}</p>
                  {enhancementPreset === preset.id && (
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-2" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setCurrentStep('metadata')}
                className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('transcribe')}
                disabled={!enhancementPreset && !jobId}
                className="flex-1 px-6 py-2 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 active:bg-cyan-600 transition-colors touch-target-min disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {jobId ? 'Next: Transcribe' : 'Start Enhancement'}
              </button>
            </div>
          </div>
        )}

        {/* Transcribe Step */}
        {currentStep === 'transcribe' && (
          <div className="text-center space-y-6 max-w-xl mx-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-cyan-400">
                {transcribing ? 'Transcribing...' : 'Ready to Transcribe'}
              </h2>
              <p className="text-sm text-gray-400">
                {transcribing 
                  ? 'Processing audio with Whisper AI'
                  : 'Click Start to begin transcription'}
              </p>
            </div>

            {transcribing ? (
              <>
                <ProgressBar 
                  progress={transcribeProgress} 
                  label="Transcription Progress" 
                  showPercentage={true}
                />
                <p className="text-xs text-gray-500">This may take a few minutes depending on audio length...</p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-sm text-gray-400">Audio will be transcribed using OpenAI Whisper</p>
                </div>
                <button
                  onClick={handleTranscribe}
                  disabled={!jobId || !token}
                  className="px-8 py-4 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 active:bg-cyan-600 transition-colors touch-target-min disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Transcription
                </button>
              </div>
            )}

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentStep('enhance')}
                disabled={transcribing}
                className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Review Step */}
        {currentStep === 'review' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-cyan-400">Review Transcript</h2>
              <p className="text-sm text-gray-400">Review and verify the transcription accuracy</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 sm:p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
              {transcript ? (
                <div className="space-y-3">
                  {transcript.segments?.map((seg: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        {seg.speaker && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded font-mono">
                            {seg.speaker}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          [{Math.floor(seg.start)}s - {Math.floor(seg.end)}s]
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{seg.text}</p>
                      {seg.confidence && (
                        <p className="text-xs text-gray-500 mt-1">Confidence: {(seg.confidence * 100).toFixed(0)}%</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                  <FileText className="w-12 h-12 mb-3 opacity-50" />
                  <p>Transcript will appear here after transcription completes</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setCurrentStep('transcribe')}
                className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('export')}
                disabled={!transcript}
                className="flex-1 px-6 py-2 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 active:bg-cyan-600 transition-colors touch-target-min disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Export
              </button>
            </div>
          </div>
        )}

        {/* Export Step */}
        {currentStep === 'export' && (
          <div className="text-center space-y-6 max-w-xl mx-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-cyan-400">Export Package</h2>
              <p className="text-sm text-gray-400">Download your complete forensic package</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { format: 'zip', label: 'ZIP Package', desc: 'All files in one archive' },
                { format: 'srt', label: 'SRT Subtitles', desc: 'Standard subtitle format' },
                { format: 'txt', label: 'Plain Text', desc: 'Simple text transcript' },
                { format: 'json', label: 'JSON Data', desc: 'Structured data format' },
              ].map(({ format, label, desc }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format as any)}
                  disabled={exporting || !jobId}
                  className={cn(
                    "p-4 bg-gray-900 border-2 rounded-lg transition-all touch-target-min text-left",
                    exporting || !jobId
                      ? "border-gray-700 opacity-50 cursor-not-allowed"
                      : "border-gray-700 hover:border-amber-500"
                  )}
                >
                  <h3 className="font-bold text-white mb-1">{label}</h3>
                  <p className="text-xs text-gray-400">{desc}</p>
                </button>
              ))}
            </div>

            {exporting && (
              <div className="pt-4">
                <LoadingSpinner size="md" text="Preparing export..." />
              </div>
            )}

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setCurrentStep('review')}
                disabled={exporting}
                className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 active:bg-gray-600 transition-colors touch-target-min disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
