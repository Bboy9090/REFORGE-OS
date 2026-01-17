/**
 * Sonic Codex Job Store
 * Cache for Sonic Codex jobs
 */

import { create } from 'zustand';

interface Job {
  job_id: string;
  title: string;
  device: string;
  stage: string;
  progress: number;
  created: string;
}

interface SonicJobState {
  jobs: Job[];
  selectedJob: Job | null;
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  setSelectedJob: (job: Job | null) => void;
  clearJobs: () => void;
}

export const useSonicJobStore = create<SonicJobState>((set) => ({
  jobs: [],
  selectedJob: null,

  setJobs: (jobs) => {
    set({ jobs });
  },

  addJob: (job) => {
    set((state) => ({
      jobs: [...state.jobs, job],
    }));
  },

  updateJob: (jobId, updates) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.job_id === jobId ? { ...job, ...updates } : job
      ),
      selectedJob:
        state.selectedJob?.job_id === jobId
          ? { ...state.selectedJob, ...updates }
          : state.selectedJob,
    }));
  },

  setSelectedJob: (job) => {
    set({ selectedJob: job });
  },

  clearJobs: () => {
    set({ jobs: [], selectedJob: null });
  },
}));
