// Batch Analysis Interface
// Analyze multiple devices for shops

import React, { useState } from 'react';

interface BatchJob {
  id: string;
  deviceModel: string;
  platform: string;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export default function BatchAnalysis() {
  const [devices, setDevices] = useState<string[]>([]);
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addDevice = (deviceModel: string) => {
    if (deviceModel.trim() && !devices.includes(deviceModel.trim())) {
      setDevices([...devices, deviceModel.trim()]);
    }
  };

  const removeDevice = (index: number) => {
    setDevices(devices.filter((_, i) => i !== index));
  };

  const startBatchAnalysis = async () => {
    if (devices.length === 0) return;

    setIsProcessing(true);
    const newJobs: BatchJob[] = devices.map((device, index) => ({
      id: `job-${Date.now()}-${index}`,
      deviceModel: device,
      platform: device.includes('iPhone') || device.includes('iPad') ? 'iOS' : 'Android',
      status: 'pending' as const,
      progress: 0,
    }));

    setJobs(newJobs);
    setDevices([]);

    // Simulate batch processing
    for (let i = 0; i < newJobs.length; i++) {
      const job = newJobs[i];
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'analyzing', progress: 0 } : j));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 25) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, progress } : j));
      }

      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'complete', progress: 100 } : j));
    }

    setIsProcessing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'var(--state-success)';
      case 'analyzing': return 'var(--accent-steel)';
      case 'error': return 'var(--state-error)';
      default: return 'var(--ink-muted)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return '✓';
      case 'analyzing': return '⟳';
      case 'error': return '✕';
      default: return '○';
    }
  };

  const completedJobs = jobs.filter(j => j.status === 'complete').length;
  const totalJobs = jobs.length;

  return (
    <section className="batch-analysis">
      <div className="container max-w-7xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-gold)' }}>Batch Analysis</h2>
        <p className="mb-8" style={{ color: 'var(--ink-secondary)' }}>Analyze multiple devices simultaneously</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Input */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Add Devices</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Device model (e.g., iPhone 12, Samsung Galaxy S21)"
                  className="flex-1 px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--surface-tertiary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--ink-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addDevice(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input) {
                      addDevice(input.value);
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--accent-gold)',
                    color: 'var(--ink-inverse)',
                    boxShadow: 'var(--glow-gold)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                  }}
                >
                  Add
                </button>
              </div>

              {devices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>Devices in Queue ({devices.length})</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {devices.map((device, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded"
                        style={{ backgroundColor: 'var(--surface-tertiary)' }}
                      >
                        <span className="text-sm" style={{ color: 'var(--ink-primary)' }}>{device}</span>
                        <button
                          onClick={() => removeDevice(index)}
                          className="transition-colors"
                          style={{ color: 'var(--state-error)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={startBatchAnalysis}
                    disabled={isProcessing}
                    className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300"
                    style={{
                      backgroundColor: isProcessing ? 'var(--surface-tertiary)' : 'var(--state-success)',
                      color: isProcessing ? 'var(--ink-muted)' : 'var(--ink-inverse)',
                      cursor: isProcessing ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.opacity = '0.9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                  >
                    Start Batch Analysis
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Job Status */}
          <div className="rounded-lg shadow-sm border p-6" style={{ 
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border-primary)'
          }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Analysis Queue</h3>
            {jobs.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>No jobs in queue</p>
            ) : (
              <div className="space-y-3">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>Progress</span>
                    <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                      {completedJobs} / {totalJobs} complete
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(completedJobs / totalJobs) * 100}%`,
                        backgroundColor: 'var(--accent-steel)'
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-3" style={{ 
                      backgroundColor: 'var(--surface-tertiary)',
                      borderColor: 'var(--border-primary)'
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span style={{ color: getStatusColor(job.status) }}>
                            {getStatusIcon(job.status)}
                          </span>
                          <span className="font-medium text-sm" style={{ color: 'var(--ink-primary)' }}>{job.deviceModel}</span>
                        </div>
                        <span className="text-xs font-medium" style={{ color: getStatusColor(job.status) }}>
                          {job.status}
                        </span>
                      </div>
                      {job.status === 'analyzing' && (
                        <div className="w-full rounded-full h-1.5 mt-2" style={{ backgroundColor: 'var(--surface-secondary)' }}>
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ 
                              width: `${job.progress}%`,
                              backgroundColor: 'var(--accent-steel)'
                            }}
                          ></div>
                        </div>
                      )}
                      {job.error && (
                        <p className="text-xs mt-1" style={{ color: 'var(--state-error)' }}>{job.error}</p>
                      )}
                    </div>
                  ))}
                </div>

                {completedJobs === totalJobs && totalJobs > 0 && (
                  <button className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 mt-4"
                    style={{
                      backgroundColor: 'var(--accent-gold)',
                      color: 'var(--ink-inverse)',
                      boxShadow: 'var(--glow-gold)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent-gold-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                    }}
                  >
                    Generate Batch Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
