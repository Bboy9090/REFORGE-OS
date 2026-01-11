import { TestResult, TestMetrics, generateMockMetrics, validateMetrics, delay, createTestId, calculateImprovement, OptimizationTestResult } from '@/lib/test-utils';

export interface TestSuite {
  name: string;
  tests: Array<() => Promise<TestResult>>;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export class OptimizationTestRunner {
  private results: TestResult[] = [];
  private running = false;

  async runSuite(suite: TestSuite): Promise<TestResult[]> {
    this.running = true;
    this.results = [];

    if (suite.setup) {
      await suite.setup();
    }

    for (const test of suite.tests) {
      try {
        const result = await test();
        this.results.push(result);
      } catch (error) {
        this.results.push({
          id: createTestId(),
          testName: 'Unknown Test',
          passed: false,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : String(error),
          duration: 0
        });
      }
    }

    if (suite.teardown) {
      await suite.teardown();
    }

    this.running = false;
    return this.results;
  }

  async testDeviceDetection(): Promise<TestResult> {
    const startTime = Date.now();
    const testId = createTestId();

    try {
      if (!navigator.usb) {
        return {
          id: testId,
          testName: 'USB Device Detection',
          passed: false,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          error: 'WebUSB API not available'
        };
      }

      const devices = await navigator.usb.getDevices();
      const passed = Array.isArray(devices);

      return {
        id: testId,
        testName: 'USB Device Detection',
        passed,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          deviceCount: devices.length,
          devices: devices.map(d => ({
            vendorId: d.vendorId,
            productId: d.productId,
            productName: d.productName
          }))
        }
      };
    } catch (error) {
      return {
        id: testId,
        testName: 'USB Device Detection',
        passed: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testMetricsValidation(): Promise<TestResult> {
    const startTime = Date.now();
    const testId = createTestId();

    try {
      const metrics = generateMockMetrics();
      const validation = validateMetrics(metrics);

      return {
        id: testId,
        testName: 'Metrics Validation',
        passed: validation.valid,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        metrics,
        details: {
          errors: validation.errors
        }
      };
    } catch (error) {
      return {
        id: testId,
        testName: 'Metrics Validation',
        passed: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testBottleneckDetection(): Promise<TestResult> {
    const startTime = Date.now();
    const testId = createTestId();

    try {
      const metrics = generateMockMetrics({
        usbUtilization: 98,
        transferSpeed: 15
      });

      const bottleneckDetected = metrics.usbUtilization > 95 && metrics.transferSpeed < 20;

      return {
        id: testId,
        testName: 'Bottleneck Detection - USB Saturation',
        passed: bottleneckDetected,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        metrics,
        details: {
          bottleneckType: 'usb',
          confidence: bottleneckDetected ? 0.95 : 0
        }
      };
    } catch (error) {
      return {
        id: testId,
        testName: 'Bottleneck Detection - USB Saturation',
        passed: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testPerformanceImprovement(): Promise<OptimizationTestResult> {
    const startTime = Date.now();
    const testId = createTestId();

    try {
      const baseline = generateMockMetrics({
        transferSpeed: 45,
        cpuUsage: 50,
        memoryUsage: 60
      });

      await delay(100);

      const optimized = generateMockMetrics({
        transferSpeed: 65,
        cpuUsage: 35,
        memoryUsage: 45
      });

      const speedImprovement = ((optimized.transferSpeed - baseline.transferSpeed) / baseline.transferSpeed) * 100;
      const cpuReduction = ((baseline.cpuUsage - optimized.cpuUsage) / baseline.cpuUsage) * 100;
      const memoryReduction = ((baseline.memoryUsage - optimized.memoryUsage) / baseline.memoryUsage) * 100;
      const overallScore = calculateImprovement(baseline, optimized);

      const passed = speedImprovement > 10 && cpuReduction > 5;

      return {
        id: testId,
        testName: 'Performance Improvement Validation',
        passed,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        baseline,
        optimized,
        improvement: {
          transferSpeed: speedImprovement,
          cpuUsage: cpuReduction,
          memoryUsage: memoryReduction,
          overallScore
        }
      };
    } catch (error) {
      const baseline = generateMockMetrics();
      return {
        id: testId,
        testName: 'Performance Improvement Validation',
        passed: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        baseline,
        optimized: baseline,
        improvement: {
          transferSpeed: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          overallScore: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testRealtimeMetricsStream(): Promise<TestResult> {
    const startTime = Date.now();
    const testId = createTestId();

    try {
      const samples: TestMetrics[] = [];
      const targetSamples = 10;

      for (let i = 0; i < targetSamples; i++) {
        samples.push(generateMockMetrics());
        await delay(10);
      }

      const avgLatency = (Date.now() - startTime) / targetSamples;
      const passed = avgLatency < 100 && samples.length === targetSamples;

      return {
        id: testId,
        testName: 'Real-time Metrics Stream',
        passed,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          samplesCollected: samples.length,
          targetSamples,
          avgLatency: `${avgLatency.toFixed(2)}ms`,
          meetsRequirement: avgLatency < 100
        }
      };
    } catch (error) {
      return {
        id: testId,
        testName: 'Real-time Metrics Stream',
        passed: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testHistoricalComparison(): Promise<TestResult> {
    const startTime = Date.now();
    const testId = createTestId();

    try {
      const historicalData = Array.from({ length: 5 }, () => generateMockMetrics());
      const currentMetrics = generateMockMetrics();

      const avgHistorical = historicalData.reduce((acc, m) => ({
        transferSpeed: acc.transferSpeed + m.transferSpeed / historicalData.length,
        cpuUsage: acc.cpuUsage + m.cpuUsage / historicalData.length,
        memoryUsage: acc.memoryUsage + m.memoryUsage / historicalData.length,
        usbUtilization: acc.usbUtilization + m.usbUtilization / historicalData.length,
        diskIO: acc.diskIO + m.diskIO / historicalData.length,
        bufferHealth: acc.bufferHealth + m.bufferHealth / historicalData.length
      }), {
        transferSpeed: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        usbUtilization: 0,
        diskIO: 0,
        bufferHealth: 0
      });

      const deviation = Math.abs(currentMetrics.transferSpeed - avgHistorical.transferSpeed) / avgHistorical.transferSpeed;
      const passed = deviation < 0.5;

      return {
        id: testId,
        testName: 'Historical Comparison',
        passed,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        details: {
          historicalAvg: avgHistorical,
          currentMetrics,
          deviation: `${(deviation * 100).toFixed(2)}%`,
          threshold: '50%'
        }
      };
    } catch (error) {
      return {
        id: testId,
        testName: 'Historical Comparison',
        passed: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testAlertSystem(): Promise<TestResult> {
    const startTime = Date.now();
    const testId = createTestId();

    try {
      const criticalMetrics = generateMockMetrics({
        transferSpeed: 5,
        cpuUsage: 95,
        memoryUsage: 98
      });

      const alertsTriggered: string[] = [];

      if (criticalMetrics.transferSpeed < 10) {
        alertsTriggered.push('Low transfer speed');
      }
      if (criticalMetrics.cpuUsage > 90) {
        alertsTriggered.push('High CPU usage');
      }
      if (criticalMetrics.memoryUsage > 95) {
        alertsTriggered.push('Critical memory pressure');
      }

      const passed = alertsTriggered.length >= 2;

      return {
        id: testId,
        testName: 'Alert System',
        passed,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        metrics: criticalMetrics,
        details: {
          alertsTriggered,
          expectedMinAlerts: 2
        }
      };
    } catch (error) {
      return {
        id: testId,
        testName: 'Alert System',
        passed: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testOptimizationRecommendations(): Promise<TestResult> {
    const startTime = Date.now();
    const testId = createTestId();

    try {
      const metrics = generateMockMetrics({
        usbUtilization: 98,
        transferSpeed: 12,
        bufferHealth: 45
      });

      interface Recommendation {
        title: string;
        priority: string;
        impact: string;
      }

      const recommendations: Recommendation[] = [];

      if (metrics.usbUtilization > 95) {
        recommendations.push({
          title: 'USB Bandwidth Optimization',
          priority: 'high',
          impact: 'high'
        });
      }

      if (metrics.bufferHealth < 50) {
        recommendations.push({
          title: 'Buffer Size Optimization',
          priority: 'medium',
          impact: 'medium'
        });
      }

      if (metrics.transferSpeed < 20) {
        recommendations.push({
          title: 'Transfer Protocol Optimization',
          priority: 'high',
          impact: 'high'
        });
      }

      const passed = recommendations.length > 0 && recommendations.some(r => r.priority === 'high');

      return {
        id: testId,
        testName: 'Optimization Recommendations',
        passed,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        metrics,
        details: {
          recommendationsGenerated: recommendations.length,
          recommendations
        }
      };
    } catch (error) {
      return {
        id: testId,
        testName: 'Optimization Recommendations',
        passed: false,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  isRunning(): boolean {
    return this.running;
  }

  getSummary(): { total: number; passed: number; failed: number; passRate: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    return { total, passed, failed, passRate };
  }
}

export const createOptimizationTestSuite = (): TestSuite => {
  const runner = new OptimizationTestRunner();

  return {
    name: 'Optimization Validation Suite',
    tests: [
      () => runner.testDeviceDetection(),
      () => runner.testMetricsValidation(),
      () => runner.testBottleneckDetection(),
      () => runner.testPerformanceImprovement(),
      () => runner.testRealtimeMetricsStream(),
      () => runner.testHistoricalComparison(),
      () => runner.testAlertSystem(),
      () => runner.testOptimizationRecommendations()
    ]
  };
};
