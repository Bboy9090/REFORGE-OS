/**
 * Shared state and utilities for flash operations
 * Used by both v1 flash router and legacy endpoints during migration
 */

// Flash job storage (in-memory for now - in production would use database)
export let flashHistory = [];
export let activeFlashJobs = new Map();
export let jobCounter = 1;

/**
 * Broadcast flash progress to WebSocket clients
 */
export function broadcastFlashProgress(jobId, data) {
  // Import WebSocket server dynamically to avoid circular dependencies
  // This will be injected by server/index.js
  if (typeof global.flashProgressBroadcast === 'function') {
    global.flashProgressBroadcast(jobId, data);
  }
}

/**
 * Simulate flash operation (for testing/demo purposes)
 * In production, this would execute actual flash commands
 */
export function simulateFlashOperation(jobId, config) {
  const job = activeFlashJobs.get(jobId);
  if (!job) return;
  
  job.status.status = 'running';
  job.status.logs.push(`[${new Date().toISOString()}] Starting flash operation`);
  job.status.currentStep = `Flashing ${config.partitions[0].name}`;
  
  broadcastFlashProgress(jobId, {
    type: 'progress',
    status: job.status
  });
  
  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    const job = activeFlashJobs.get(jobId);
    if (!job) {
      clearInterval(stepInterval);
      return;
    }
    
    job.status.progress += 10;
    job.status.timeElapsed = Math.floor((Date.now() - job.status.startTime) / 1000);
    job.status.speed = Math.floor(Math.random() * 20 + 10);
    
    if (job.status.progress >= 100) {
      job.status.progress = 100;
      job.status.status = 'completed';
      job.status.currentStep = 'Completed';
      job.status.logs.push(`[${new Date().toISOString()}] Flash operation completed successfully`);
      
      flashHistory.unshift({
        jobId,
        deviceSerial: config.deviceSerial,
        deviceBrand: config.deviceBrand,
        flashMethod: config.flashMethod,
        partitions: config.partitions.map(p => p.name),
        status: 'completed',
        startTime: job.status.startTime,
        endTime: Date.now(),
        duration: Math.floor((Date.now() - job.status.startTime) / 1000),
        bytesWritten: job.status.totalBytes,
        averageSpeed: Math.floor(Math.random() * 20 + 10)
      });
      
      if (flashHistory.length > 50) {
        flashHistory = flashHistory.slice(0, 50);
      }
      
      broadcastFlashProgress(jobId, {
        type: 'completed',
        status: job.status
      });
      
      clearInterval(stepInterval);
      setTimeout(() => activeFlashJobs.delete(jobId), 5000);
    } else if (job.status.progress % 30 === 0 && stepIndex < config.partitions.length - 1) {
      stepIndex++;
      job.status.completedSteps = stepIndex;
      job.status.currentStep = `Flashing ${config.partitions[stepIndex].name}`;
      job.status.logs.push(`[${new Date().toISOString()}] Flashing partition: ${config.partitions[stepIndex].name}`);
    }
    
    broadcastFlashProgress(jobId, {
      type: 'progress',
      status: job.status
    });
  }, 1000);
}

