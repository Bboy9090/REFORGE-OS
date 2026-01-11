import { useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import type { BenchmarkResult } from '@/components/LiveDeviceBenchmark';

export interface ActiveBenchmark {
  deviceSerial: string;
  deviceModel: string;
  operationType: 'flash' | 'read' | 'verify' | 'erase';
  partition: string;
  fileSize: number;
  startTime: number;
}

export function useLiveBenchmark() {
  const [activeBenchmark, setActiveBenchmark] = useState<ActiveBenchmark | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useKV<BenchmarkResult[]>('live-benchmark-results', []);

  const startBenchmark = useCallback((
    deviceSerial: string,
    deviceModel: string,
    operationType: 'flash' | 'read' | 'verify' | 'erase',
    partition: string,
    fileSize: number
  ) => {
    setActiveBenchmark({
      deviceSerial,
      deviceModel,
      operationType,
      partition,
      fileSize,
      startTime: Date.now()
    });
  }, []);

  const stopBenchmark = useCallback(() => {
    setActiveBenchmark(null);
  }, []);

  const handleBenchmarkComplete = useCallback((result: BenchmarkResult) => {
    setBenchmarkResults(prev => [...(prev || []), result]);
    setActiveBenchmark(null);
  }, [setBenchmarkResults]);

  const getDeviceHistory = useCallback((deviceSerial: string): BenchmarkResult[] => {
    return (benchmarkResults || []).filter(r => r.deviceSerial === deviceSerial);
  }, [benchmarkResults]);

  const getAverageScore = useCallback((deviceSerial?: string): number => {
    const results = deviceSerial 
      ? getDeviceHistory(deviceSerial)
      : (benchmarkResults || []);
    
    if (results.length === 0) return 0;
    
    const totalScore = results.reduce((sum, r) => sum + r.summary.score, 0);
    return Math.round(totalScore / results.length);
  }, [benchmarkResults, getDeviceHistory]);

  const getBestResult = useCallback((deviceSerial?: string): BenchmarkResult | null => {
    const results = deviceSerial 
      ? getDeviceHistory(deviceSerial)
      : (benchmarkResults || []);
    
    if (results.length === 0) return null;
    
    return results.reduce((best, current) => 
      current.summary.score > best.summary.score ? current : best
    );
  }, [benchmarkResults, getDeviceHistory]);

  const clearHistory = useCallback(() => {
    setBenchmarkResults([]);
  }, [setBenchmarkResults]);

  return {
    activeBenchmark,
    benchmarkResults: benchmarkResults || [],
    startBenchmark,
    stopBenchmark,
    handleBenchmarkComplete,
    getDeviceHistory,
    getAverageScore,
    getBestResult,
    clearHistory,
    isActive: activeBenchmark !== null
  };
}
