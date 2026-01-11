/**
 * Sonic Codex - Job Library
 * Display all processed jobs with search, filter, and sort
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ArrowUpDown, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useSonicJobStore } from '@/stores/sonicJobStore';
import { apiRequest, API_CONFIG } from '@/lib/api-client';
import { toast } from 'sonner';

interface Job {
  job_id: string;
  title: string;
  device: string;
  stage: string;
  progress: number;
  created: string;
}

export function JobLibrary() {
  const { token } = useAuthStore();
  const { jobs, setJobs } = useSonicJobStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadJobs = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    const response = await apiRequest<{ jobs: Job[] }>(
      API_CONFIG.ENDPOINTS.SONIC_JOBS,
      {
        method: 'GET',
        requireAuth: true,
        showErrorToast: false, // Don't show toast on background refresh
      }
    );
    
    if (response.success && response.data) {
      setJobs(response.data.jobs || []);
    } else if (response.error && response.status !== 0) {
      // Only show error if it's not a network error (status 0 = offline)
      console.error('Failed to load jobs:', response.error);
    }
    
    setLoading(false);
  }, [token, setJobs]);

  useEffect(() => {
    loadJobs();
    // Refresh every 5 seconds
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.job_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStage === 'all' || job.stage === filterStage;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.created.localeCompare(b.created);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'complete':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'transcribing':
      case 'enhancing':
      case 'preprocessing':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'failed_upload':
      case 'failed_enhance':
      case 'failed_transcribe':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-cyan-400">Job Library</h1>
        <p className="text-sm sm:text-base text-gray-400">All your audio processing jobs</p>
      </div>

      {/* Search and Filters - Responsive */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:border-cyan-500 focus:outline-none"
        >
          <option value="all">All Stages</option>
          <option value="complete">Complete</option>
          <option value="transcribing">Transcribing</option>
          <option value="enhancing">Enhancing</option>
          <option value="preprocessing">Preprocessing</option>
          <option value="uploading">Uploading</option>
        </select>
        
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-');
            setSortBy(by as any);
            setSortOrder(order as any);
          }}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:border-cyan-500 focus:outline-none"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="progress-desc">Progress High-Low</option>
          <option value="progress-asc">Progress Low-High</option>
        </select>
      </div>

      {/* Jobs List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {searchQuery || filterStage !== 'all' 
              ? 'No jobs match your filters' 
              : 'No jobs yet. Start by uploading a file!'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.job_id}
                className="p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate">{job.title}</h3>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-mono border flex-shrink-0",
                        getStageColor(job.stage)
                      )}>
                        {job.stage}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-400">
                      <span className="truncate">{job.device}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{job.created}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-mono text-xs truncate">ID: {job.job_id.substring(0, 8)}...</span>
                    </div>
                    {job.stage !== 'complete' && job.stage !== 'failed_upload' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div
                            className="bg-cyan-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                    <button
                      className="p-2 sm:p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target-min"
                      title="View Details"
                      aria-label="View job details"
                    >
                      <Eye className="w-5 h-5 text-cyan-400" />
                    </button>
                    <button
                      className="p-2 sm:p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target-min"
                      title="Delete"
                      aria-label="Delete job"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
