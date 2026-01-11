export interface IndustryBenchmark {
  category: BenchmarkCategory;
  metric: string;
  standards: {
    optimal: BenchmarkThreshold;
    good: BenchmarkThreshold;
    acceptable: BenchmarkThreshold;
    poor: BenchmarkThreshold;
  };
  unit: string;
  description: string;
  source: string;
}

export type BenchmarkCategory = 
  | 'flash_speed'
  | 'usb_bandwidth'
  | 'cpu_efficiency'
  | 'memory_usage'
  | 'latency'
  | 'reliability'
  | 'power_efficiency';

export interface BenchmarkThreshold {
  min?: number;
  max?: number;
  target?: number;
  label: string;
}

export interface BenchmarkResult {
  metric: string;
  currentValue: number;
  standard: IndustryBenchmark;
  rating: 'optimal' | 'good' | 'acceptable' | 'poor';
  percentile: number;
  comparison: string;
  recommendation?: string;
}

export interface BenchmarkSession {
  id: string;
  timestamp: number;
  deviceInfo: {
    serial?: string;
    model?: string;
    mode?: string;
  };
  results: BenchmarkResult[];
  overallScore: number;
  category: string;
  duration: number;
}

export interface PerformanceComparison {
  metric: string;
  yourValue: number;
  industryAverage: number;
  topPerformer: number;
  percentDifference: number;
  ranking: 'top-10' | 'above-average' | 'average' | 'below-average' | 'needs-improvement';
}
