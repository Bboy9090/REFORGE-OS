export interface TestMetrics {
  transferSpeed: number;
  cpuUsage: number;
  memoryUsage: number;
  usbUtilization: number;
  diskIO: number;
  bufferHealth: number;
}

export interface TestResult {
  id: string;
  testName: string;
  passed: boolean;
  timestamp: number;
  metrics?: TestMetrics;
  error?: string;
  duration: number;
  details?: Record<string, any>;
}

export interface OptimizationTestResult extends TestResult {
  baseline: TestMetrics;
  optimized: TestMetrics;
  improvement: {
    transferSpeed: number;
    cpuUsage: number;
    memoryUsage: number;
    overallScore: number;
  };
  passed: boolean;
}

export function generateMockMetrics(overrides?: Partial<TestMetrics>): TestMetrics {
  return {
    transferSpeed: 45 + Math.random() * 10,
    cpuUsage: 30 + Math.random() * 20,
    memoryUsage: 40 + Math.random() * 15,
    usbUtilization: 70 + Math.random() * 20,
    diskIO: 50 + Math.random() * 30,
    bufferHealth: 85 + Math.random() * 10,
    ...overrides
  };
}

export function calculateImprovement(baseline: TestMetrics, optimized: TestMetrics): number {
  const speedImprovement = ((optimized.transferSpeed - baseline.transferSpeed) / baseline.transferSpeed) * 100;
  const cpuReduction = ((baseline.cpuUsage - optimized.cpuUsage) / baseline.cpuUsage) * 100;
  const memoryReduction = ((baseline.memoryUsage - optimized.memoryUsage) / baseline.memoryUsage) * 100;
  
  return (speedImprovement * 0.5 + cpuReduction * 0.25 + memoryReduction * 0.25);
}

export function validateMetrics(metrics: TestMetrics): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (metrics.transferSpeed < 0 || metrics.transferSpeed > 1000) {
    errors.push(`Invalid transfer speed: ${metrics.transferSpeed} MB/s`);
  }
  if (metrics.cpuUsage < 0 || metrics.cpuUsage > 100) {
    errors.push(`Invalid CPU usage: ${metrics.cpuUsage}%`);
  }
  if (metrics.memoryUsage < 0 || metrics.memoryUsage > 100) {
    errors.push(`Invalid memory usage: ${metrics.memoryUsage}%`);
  }
  if (metrics.usbUtilization < 0 || metrics.usbUtilization > 100) {
    errors.push(`Invalid USB utilization: ${metrics.usbUtilization}%`);
  }
  if (metrics.diskIO < 0 || metrics.diskIO > 1000) {
    errors.push(`Invalid disk I/O: ${metrics.diskIO} MB/s`);
  }
  if (metrics.bufferHealth < 0 || metrics.bufferHealth > 100) {
    errors.push(`Invalid buffer health: ${metrics.bufferHealth}%`);
  }
  
  return { valid: errors.length === 0, errors };
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
