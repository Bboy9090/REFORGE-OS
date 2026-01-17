import { IndustryBenchmark } from '@/types/benchmarks';

export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  {
    category: 'flash_speed',
    metric: 'Sequential Write Speed',
    standards: {
      optimal: { min: 400, label: 'Optimal (USB 3.2 Gen 2)' },
      good: { min: 200, max: 400, label: 'Good (USB 3.1)' },
      acceptable: { min: 40, max: 200, label: 'Acceptable (USB 3.0)' },
      poor: { max: 40, label: 'Poor (USB 2.0)' }
    },
    unit: 'MB/s',
    description: 'Sequential write throughput for large partition images',
    source: 'USB-IF USB 3.2 Specification'
  },
  {
    category: 'flash_speed',
    metric: 'Random Write IOPS',
    standards: {
      optimal: { min: 10000, label: 'Optimal (NVMe-class)' },
      good: { min: 5000, max: 10000, label: 'Good (High-end eMMC)' },
      acceptable: { min: 1000, max: 5000, label: 'Acceptable (Standard eMMC)' },
      poor: { max: 1000, label: 'Poor (Legacy)' }
    },
    unit: 'IOPS',
    description: 'Random write operations per second',
    source: 'JEDEC eMMC 5.1 Standard'
  },
  {
    category: 'flash_speed',
    metric: 'Fastboot Flash Throughput',
    standards: {
      optimal: { min: 300, label: 'Optimal (Modern devices)' },
      good: { min: 150, max: 300, label: 'Good (Mid-range devices)' },
      acceptable: { min: 50, max: 150, label: 'Acceptable (Older devices)' },
      poor: { max: 50, label: 'Poor (Very old/throttled)' }
    },
    unit: 'MB/s',
    description: 'Fastboot protocol flash operation throughput',
    source: 'Android Platform Tools Benchmarks'
  },
  {
    category: 'usb_bandwidth',
    metric: 'USB Bus Utilization',
    standards: {
      optimal: { min: 80, max: 95, label: 'Optimal (80-95%)' },
      good: { min: 60, max: 80, label: 'Good (60-80%)' },
      acceptable: { min: 40, max: 60, label: 'Acceptable (40-60%)' },
      poor: { max: 40, label: 'Poor (<40%)' }
    },
    unit: '%',
    description: 'Percentage of theoretical USB bandwidth being utilized',
    source: 'USB 3.0 Performance Analysis'
  },
  {
    category: 'usb_bandwidth',
    metric: 'USB Protocol Overhead',
    standards: {
      optimal: { max: 10, label: 'Optimal (<10%)' },
      good: { min: 10, max: 15, label: 'Good (10-15%)' },
      acceptable: { min: 15, max: 25, label: 'Acceptable (15-25%)' },
      poor: { min: 25, label: 'Poor (>25%)' }
    },
    unit: '%',
    description: 'Protocol overhead reducing effective throughput',
    source: 'USB Protocol Efficiency Studies'
  },
  {
    category: 'cpu_efficiency',
    metric: 'CPU Usage During Flash',
    standards: {
      optimal: { max: 20, label: 'Optimal (<20%)' },
      good: { min: 20, max: 40, label: 'Good (20-40%)' },
      acceptable: { min: 40, max: 60, label: 'Acceptable (40-60%)' },
      poor: { min: 60, label: 'Poor (>60%)' }
    },
    unit: '%',
    description: 'CPU utilization during active flash operations',
    source: 'System Performance Best Practices'
  },
  {
    category: 'cpu_efficiency',
    metric: 'CPU Efficiency Score',
    standards: {
      optimal: { min: 15, label: 'Optimal (>15 MB/s per CPU%)' },
      good: { min: 10, max: 15, label: 'Good (10-15 MB/s per CPU%)' },
      acceptable: { min: 5, max: 10, label: 'Acceptable (5-10 MB/s per CPU%)' },
      poor: { max: 5, label: 'Poor (<5 MB/s per CPU%)' }
    },
    unit: 'MB/s per CPU%',
    description: 'Transfer throughput per percent CPU utilization',
    source: 'Efficiency Metrics Analysis'
  },
  {
    category: 'memory_usage',
    metric: 'Memory Footprint',
    standards: {
      optimal: { max: 100, label: 'Optimal (<100 MB)' },
      good: { min: 100, max: 250, label: 'Good (100-250 MB)' },
      acceptable: { min: 250, max: 500, label: 'Acceptable (250-500 MB)' },
      poor: { min: 500, label: 'Poor (>500 MB)' }
    },
    unit: 'MB',
    description: 'Peak memory usage during flash operations',
    source: 'Application Performance Guidelines'
  },
  {
    category: 'memory_usage',
    metric: 'Memory Leak Rate',
    standards: {
      optimal: { max: 1, label: 'Optimal (<1 MB/min)' },
      good: { min: 1, max: 5, label: 'Good (1-5 MB/min)' },
      acceptable: { min: 5, max: 10, label: 'Acceptable (5-10 MB/min)' },
      poor: { min: 10, label: 'Poor (>10 MB/min)' }
    },
    unit: 'MB/min',
    description: 'Rate of memory growth indicating potential leaks',
    source: 'Memory Management Best Practices'
  },
  {
    category: 'latency',
    metric: 'Command Response Time',
    standards: {
      optimal: { max: 50, label: 'Optimal (<50ms)' },
      good: { min: 50, max: 100, label: 'Good (50-100ms)' },
      acceptable: { min: 100, max: 250, label: 'Acceptable (100-250ms)' },
      poor: { min: 250, label: 'Poor (>250ms)' }
    },
    unit: 'ms',
    description: 'Time from command sent to first response byte',
    source: 'USB Latency Standards'
  },
  {
    category: 'latency',
    metric: 'End-to-End Latency',
    standards: {
      optimal: { max: 100, label: 'Optimal (<100ms)' },
      good: { min: 100, max: 250, label: 'Good (100-250ms)' },
      acceptable: { min: 250, max: 500, label: 'Acceptable (250-500ms)' },
      poor: { min: 500, label: 'Poor (>500ms)' }
    },
    unit: 'ms',
    description: 'Total time from operation request to completion',
    source: 'Real-time System Performance'
  },
  {
    category: 'reliability',
    metric: 'Success Rate',
    standards: {
      optimal: { min: 99.5, label: 'Optimal (>99.5%)' },
      good: { min: 98, max: 99.5, label: 'Good (98-99.5%)' },
      acceptable: { min: 95, max: 98, label: 'Acceptable (95-98%)' },
      poor: { max: 95, label: 'Poor (<95%)' }
    },
    unit: '%',
    description: 'Percentage of operations completing without errors',
    source: 'Industrial Reliability Standards'
  },
  {
    category: 'reliability',
    metric: 'Retry Rate',
    standards: {
      optimal: { max: 0.5, label: 'Optimal (<0.5%)' },
      good: { min: 0.5, max: 2, label: 'Good (0.5-2%)' },
      acceptable: { min: 2, max: 5, label: 'Acceptable (2-5%)' },
      poor: { min: 5, label: 'Poor (>5%)' }
    },
    unit: '%',
    description: 'Percentage of operations requiring retry',
    source: 'USB Transfer Reliability Metrics'
  },
  {
    category: 'reliability',
    metric: 'Connection Stability',
    standards: {
      optimal: { min: 99.9, label: 'Optimal (>99.9% uptime)' },
      good: { min: 99, max: 99.9, label: 'Good (99-99.9% uptime)' },
      acceptable: { min: 95, max: 99, label: 'Acceptable (95-99% uptime)' },
      poor: { max: 95, label: 'Poor (<95% uptime)' }
    },
    unit: '%',
    description: 'Connection uptime during operations',
    source: 'USB Connection Reliability Standards'
  },
  {
    category: 'power_efficiency',
    metric: 'Power Consumption',
    standards: {
      optimal: { max: 4.5, label: 'Optimal (<4.5W USB 3.0)' },
      good: { min: 4.5, max: 7.5, label: 'Good (4.5-7.5W)' },
      acceptable: { min: 7.5, max: 15, label: 'Acceptable (7.5-15W)' },
      poor: { min: 15, label: 'Poor (>15W)' }
    },
    unit: 'W',
    description: 'Average power draw during operations',
    source: 'USB Power Delivery Specification'
  },
  {
    category: 'power_efficiency',
    metric: 'Energy Efficiency',
    standards: {
      optimal: { min: 100, label: 'Optimal (>100 MB/J)' },
      good: { min: 50, max: 100, label: 'Good (50-100 MB/J)' },
      acceptable: { min: 20, max: 50, label: 'Acceptable (20-50 MB/J)' },
      poor: { max: 20, label: 'Poor (<20 MB/J)' }
    },
    unit: 'MB/J',
    description: 'Data transferred per joule of energy consumed',
    source: 'Energy Efficiency Standards'
  }
];

export function getBenchmarkByMetric(metric: string): IndustryBenchmark | undefined {
  return INDUSTRY_BENCHMARKS.find(b => b.metric === metric);
}

export function getBenchmarksByCategory(category: string): IndustryBenchmark[] {
  return INDUSTRY_BENCHMARKS.filter(b => b.category === category);
}

export function evaluateAgainstBenchmark(
  metric: string,
  value: number
): 'optimal' | 'good' | 'acceptable' | 'poor' | 'unknown' {
  const benchmark = getBenchmarkByMetric(metric);
  if (!benchmark) return 'unknown';

  const { standards } = benchmark;

  if (standards.optimal.min !== undefined && value >= standards.optimal.min) return 'optimal';
  if (standards.optimal.max !== undefined && value <= standards.optimal.max) return 'optimal';
  if (standards.optimal.min !== undefined && standards.optimal.max !== undefined) {
    if (value >= standards.optimal.min && value <= standards.optimal.max) return 'optimal';
  }

  if (standards.good.min !== undefined && standards.good.max !== undefined) {
    if (value >= standards.good.min && value <= standards.good.max) return 'good';
  } else if (standards.good.min !== undefined && value >= standards.good.min) {
    return 'good';
  } else if (standards.good.max !== undefined && value <= standards.good.max) {
    return 'good';
  }

  if (standards.acceptable.min !== undefined && standards.acceptable.max !== undefined) {
    if (value >= standards.acceptable.min && value <= standards.acceptable.max) return 'acceptable';
  } else if (standards.acceptable.min !== undefined && value >= standards.acceptable.min) {
    return 'acceptable';
  } else if (standards.acceptable.max !== undefined && value <= standards.acceptable.max) {
    return 'acceptable';
  }

  return 'poor';
}

export function calculatePercentile(metric: string, value: number): number {
  const benchmark = getBenchmarkByMetric(metric);
  if (!benchmark) return 50;

  const { standards } = benchmark;
  
  let min = 0;
  let max = 1000;
  
  if (standards.poor.max !== undefined) max = standards.poor.max * 2;
  if (standards.poor.min !== undefined) min = standards.poor.min / 2;
  if (standards.optimal.min !== undefined) max = standards.optimal.min * 1.5;
  if (standards.optimal.max !== undefined) min = standards.optimal.max * 0.5;

  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

export function generateRecommendation(
  metric: string,
  value: number,
  rating: string
): string | undefined {
  if (rating === 'optimal') return undefined;

  const benchmark = getBenchmarkByMetric(metric);
  if (!benchmark) return undefined;

  const recommendations: Record<string, Record<string, string>> = {
    'Sequential Write Speed': {
      poor: 'Consider upgrading to USB 3.0+ cable and port. Ensure device supports USB 3.0. Check for USB driver updates.',
      acceptable: 'Switch to USB 3.1/3.2 connection for 2-5x speed improvement. Avoid USB hubs.',
      good: 'Try USB 3.2 Gen 2 connection or use a direct motherboard USB-C port for optimal speed.'
    },
    'CPU Usage During Flash': {
      poor: 'High CPU usage detected. Close background applications. Check for malware. Update USB drivers to reduce CPU overhead.',
      acceptable: 'CPU usage is elevated. Consider reducing buffer sizes or using hardware-accelerated USB controllers.',
      good: 'CPU usage is acceptable but could be optimized with driver updates or kernel-level USB stack improvements.'
    },
    'USB Bus Utilization': {
      poor: 'Very low bus utilization suggests bottleneck elsewhere. Check CPU, disk I/O, or driver issues. Try different USB port.',
      acceptable: 'USB bus underutilized. Increase buffer sizes, check for background USB traffic, or try dedicated USB controller.',
      good: 'Good utilization, but there\'s room for improvement. Fine-tune buffer sizes and disable USB power management.'
    },
    'Memory Footprint': {
      poor: 'Excessive memory usage detected. Check for memory leaks. Reduce buffer sizes. Close other applications.',
      acceptable: 'Memory usage is high. Consider reducing buffer pool size or implementing streaming transfers.',
      good: 'Memory usage is acceptable but could be optimized by tuning buffer allocation strategies.'
    }
  };

  return recommendations[metric]?.[rating];
}
