/**
 * Ghost Codex - Metadata Shredder Component
 * Upload and shred metadata from files
 */

import React, { useState, useRef, useCallback } from 'react';
import { FileX, Upload, Loader2, CheckCircle, AlertCircle, File, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG, apiRequest } from '@/lib/api-client';
import { toast } from 'sonner';
import { LoadingSpinner, ProgressBar } from '@/components/common/LoadingSpinner';

interface ShreddedFile {
  id: string;
  originalName: string;
  originalSize: number;
  shreddedPath: string;
  shreddedSize: number;
  metadataRemoved: string[];
  timestamp: string;
}

export function MetadataShredder() {
  const { token } = useAuthStore();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [shredding, setShredding] = useState(false);
  const [shredProgress, setShredProgress] = useState(0);
  const [shreddedFiles, setShreddedFiles] = useState<ShreddedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo',
    'audio/mpeg', 'audio/wav', 'audio/mp4',
    'application/pdf', 'application/msword',
  ];

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File "${file.name}" has unsupported type. Allowed: images, videos, audio, PDF, DOC`;
    }
    return null;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const errors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) selected`);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const shredFiles = async () => {
    if (selectedFiles.length === 0 || !token) {
      toast.error('Please select files and authenticate first');
      return;
    }

    setShredding(true);
    setShredProgress(0);

    try {
      const results: ShreddedFile[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiRequest<ShreddedFile>(
          API_CONFIG.ENDPOINTS.GHOST_SHRED,
          {
            method: 'POST',
            body: formData,
            requireAuth: true,
            showErrorToast: true,
            headers: {}, // Let browser set Content-Type for FormData
          }
        );

        if (response.success && response.data) {
          results.push(response.data);
        }

        setShredProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setShreddedFiles(prev => [...prev, ...results]);
      setSelectedFiles([]);
      toast.success(`Successfully shredded ${results.length} file(s)`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to shred files';
      toast.error(errorMsg);
    } finally {
      setShredding(false);
      setShredProgress(0);
    }
  };

  const downloadShreddedFile = async (file: ShreddedFile) => {
    if (!token) {
      toast.error('Please authenticate first');
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GHOST_SHRED}/${file.id}/download`,
        {
          headers: {
            'X-Secret-Room-Passcode': token,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shredded_${file.originalName}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('File downloaded');
      } else {
        throw new Error('Failed to download file');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to download file';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-3 sm:p-6 overflow-y-auto">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-cyan-400">Metadata Shredder</h2>
        <p className="text-sm sm:text-base text-gray-400">Remove all metadata from files</p>
      </div>

      {/* File Upload Zone - Responsive */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-colors cursor-pointer touch-target-min mb-4 sm:mb-6",
          dragActive
            ? "border-cyan-500 bg-cyan-500/10"
            : selectedFiles.length > 0
            ? "border-cyan-500 bg-cyan-500/5"
            : "border-gray-700 hover:border-cyan-500"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <FileX className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-500" />
        <p className="text-sm sm:text-base text-gray-400 font-semibold mb-1">
          {dragActive ? 'Drop files here' : 'Drag and drop files or click to select'}
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Supports: Images, Videos, Audio, PDF, DOC (Max 100MB per file)
        </p>
      </div>

      {/* Selected Files List - Responsive */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target-min flex-shrink-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shred Progress */}
      {shredding && (
        <div className="mb-4 sm:mb-6">
          <ProgressBar progress={shredProgress} label="Shredding files..." showPercentage={true} />
        </div>
      )}

      {/* Shred Button */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <button
            onClick={shredFiles}
            disabled={shredding || !token}
            className={cn(
              "w-full px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-400 active:bg-red-600 transition-colors touch-target-min disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              shredding && "opacity-75"
            )}
          >
            {shredding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Shredding...</span>
              </>
            ) : (
              <>
                <FileX className="w-5 h-5" />
                <span>Shred Metadata ({selectedFiles.length} file(s))</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Shredded Files History - Responsive */}
      {shreddedFiles.length > 0 && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Shredded Files</h3>
          <div className="space-y-3">
            {shreddedFiles.map((file) => (
              <div
                key={file.id}
                className="p-3 sm:p-4 bg-gray-900 rounded-lg border border-gray-800"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <p className="text-sm font-semibold text-white truncate">{file.originalName}</p>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1 ml-7">
                      <p>Original: {(file.originalSize / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Shredded: {(file.shreddedSize / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Time: {new Date(file.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadShreddedFile(file)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target-min flex-shrink-0"
                    title="Download shredded file"
                    aria-label={`Download ${file.originalName}`}
                  >
                    <Download className="w-5 h-5 text-cyan-400" />
                  </button>
                </div>
                {file.metadataRemoved.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-2">Metadata Removed:</p>
                    <div className="flex flex-wrap gap-2">
                      {file.metadataRemoved.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedFiles.length === 0 && shreddedFiles.length === 0 && !shredding && (
        <div className="flex-1 flex items-center justify-center text-center py-12">
          <div>
            <FileX className="w-16 h-16 mx-auto mb-4 text-gray-600 opacity-50" />
            <p className="text-gray-400 mb-2">No files selected</p>
            <p className="text-sm text-gray-500">
              Drag and drop files or click above to select files to shred
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
