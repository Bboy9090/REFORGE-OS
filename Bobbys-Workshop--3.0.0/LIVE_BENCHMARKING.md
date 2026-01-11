# Live Device Benchmarking During Flash Operations

## Overview

The Live Device Benchmarking system provides real-time performance monitoring and analysis during actual firmware flash operations. Unlike passive monitoring, this system actively measures device performance, detects bottlenecks, and provides actionable insights to optimize flash speeds and reliability.

## Key Features

### 🎯 Real-Time Performance Metrics

The system captures comprehensive metrics at 10Hz (100ms intervals) during flash operations:

- **Transfer Metrics**

  - Write Speed (MB/s)
  - Read Speed (MB/s)
  - Peak/Average/Minimum speeds

- **System Resources**

  - CPU Usage (%)
  - CPU Temperature (°C)
  - Memory Usage (%)
  - Memory Bandwidth (MB/s)

- **I/O Performance**

  - USB Bandwidth utilization
  - USB Latency (ms)
  - Disk IOPS
  - Disk Latency (ms)
  - Buffer Utilization (%)

- **Power & Thermal**
  - Power Draw (W)
  - Thermal Throttling detection
  - Throttle event counting

### 📊 Performance Scoring System

Each benchmark session receives a comprehensive performance evaluation:

#### Letter Grades (A+ to F)

- **A+ (95-100)**: Exceptional performance, optimal configuration
- **A (85-94)**: Excellent performance, minor optimization possible
- **B (75-84)**: Good performance, some improvements recommended
- **C (60-74)**: Acceptable performance, optimization recommended
- **D (50-59)**: Poor performance, significant issues detected
- **F (<50)**: Critical performance issues, immediate attention required

#### Scoring Components

1. **Speed Score (50%)**: Based on transfer speed vs. theoretical maximum
2. **Latency Score (25%)**: USB latency and response time
3. **Throttle Score (10%)**: Frequency and impact of thermal throttling
4. **Efficiency Score (15%)**: System resource utilization efficiency

#### Efficiency Rating

Separate 0-100 efficiency score calculated from:

- Speed-to-resource ratio
- CPU utilization vs. throughput
- Memory usage vs. data transferred
- Thermal management effectiveness

### 🔍 Intelligent Bottleneck Detection

Real-time analysis identifies performance bottlenecks automatically:

#### Bottleneck Types

- **Thermal Throttling**: CPU temperature exceeds safe thresholds
- **USB Congestion**: Latency spikes or bandwidth saturation
- **Memory Pressure**: Insufficient RAM limiting buffer performance
- **CPU Bottleneck**: Processing delays slowing data flow
- **Speed Degradation**: Write speed drops below critical thresholds

#### Severity Levels

- **Critical**: >50% of operation affected, immediate action required
- **High**: 30-50% affected, significant impact on performance
- **Medium**: 10-30% affected, moderate optimization opportunity
- **Low**: <10% affected, minor issue

### 💡 Automatic Optimization Recommendations

Based on detected bottlenecks, the system generates specific, actionable recommendations:

**Thermal Issues**

- Improve cooling or reduce ambient temperature
- Consider thermal throttling mitigation strategies
- Allow device to cool before next operation

**USB Issues**

- Use USB 3.0+ port with dedicated bandwidth
- Remove other USB devices to reduce bus congestion
- Try different USB cable or port
- Disable USB power saving features
- Check for driver updates

**Memory Issues**

- Close background applications to free memory
- Increase system RAM if possible
- Reduce buffer sizes in settings

**CPU Issues**

- Close CPU-intensive applications
- Enable performance power mode

### 📈 Historical Tracking & Analytics

All benchmark results are automatically saved and analyzed for trends:

#### Per-Device History

- All benchmark sessions tracked by device serial
- Average performance scores
- Best/worst results
- Performance trend analysis (improving/declining/stable)

#### Cross-Device Comparison

- Device performance rankings
- Speed comparisons
- Reliability metrics
- Optimization effectiveness tracking

#### Trend Detection

Analyzes recent vs. historical performance:

- **Improving**: Recent benchmarks show 5+ point improvement
- **Declining**: Recent benchmarks show 5+ point decline
- **Stable**: Performance remains consistent

## Usage

### Starting a Benchmarked Flash Operation

1. Navigate to the "Live Benchmark" tab
2. Click "Start Demo Flash" to simulate a flash operation
3. Benchmarking begins automatically when the first partition starts flashing
4. Monitor real-time metrics in the "Live Benchmark" tab
5. Review results and recommendations when operation completes

### Understanding Your Results

#### Performance Grade

Your overall grade reflects:

- Transfer speed compared to device capabilities
- Consistency of performance throughout operation
- Resource efficiency
- Absence of critical bottlenecks

#### Bottleneck Alerts

Active alerts appear during operation when issues are detected:

- Red/Critical: Immediate impact on performance
- Orange/High: Significant slowdown occurring
- Yellow/Medium: Optimization opportunity
- Blue/Low: Minor issue, informational

#### Optimization Recommendations

Listed in priority order based on:

- Expected performance impact
- Ease of implementation
- Confidence in effectiveness

### Viewing Historical Data

#### Device Rankings

- All tested devices ranked by average score
- Color-coded performance indicators
- Trend arrows showing improvement/decline
- Quick device comparison

#### Device Details

- Complete benchmark history for selected device
- Performance trends over time
- Partition-specific performance
- Detailed metrics for each session

## Architecture

### Components

#### `LiveDeviceBenchmark.tsx`

Main benchmarking component that:

- Manages metric collection intervals
- Renders real-time performance graphs
- Detects and displays bottleneck alerts
- Calculates final scores and grades
- Generates optimization recommendations

#### `BenchmarkedFlashingPanel.tsx`

Integrated flash operation panel that:

- Manages batch flash operations
- Coordinates benchmarking with operations
- Displays operation queue and progress
- Shows benchmark results for completed operations
- Provides historical data access

#### `BenchmarkDashboard.tsx`

Analytics dashboard that:

- Aggregates benchmark data across devices
- Calculates performance trends
- Ranks devices by performance
- Displays detailed per-device history
- Provides comparative analytics

#### `use-live-benchmark.ts`

React hook providing:

- Benchmark session state management
- Result persistence via `useKV`
- Device history queries
- Score calculations
- Trend analysis utilities

### Data Flow

```
Flash Operation Started
    ↓
Benchmark Session Initialized
    ↓
Metrics Collection (10Hz)
    ↓
Real-time Bottleneck Analysis
    ↓
Live Graph Updates
    ↓
Alert Generation (if needed)
    ↓
Flash Operation Complete
    ↓
Final Analysis & Scoring
    ↓
Grade Assignment
    ↓
Optimization Recommendations
    ↓
Save to History
    ↓
Trend Analysis
```

### Data Storage

All benchmark data is persisted using Spark's KV storage:

```typescript
Key: 'live-benchmark-results'
Value: BenchmarkResult[]

interface BenchmarkResult {
  id: string
  deviceSerial: string
  deviceModel: string
  startTime: number
  endTime: number
  duration: number
  partition: string
  fileSize: number
  operationType: 'flash' | 'read' | 'verify' | 'erase'
  metrics: LiveBenchmarkMetrics[]
  summary: {
    avgWriteSpeed: number
    avgReadSpeed: number
    peakWriteSpeed: number
    peakReadSpeed: number
    minWriteSpeed: number
    avgCpuUsage: number
    peakCpuUsage: number
    avgCpuTemp: number
    peakCpuTemp: number
    avgMemoryUsage: number
    avgUsbBandwidth: number
    avgDiskIOPS: number
    avgLatency: number
    throttleEvents: number
    efficiency: number
    score: number
  }
  bottlenecks: Array<{
    type: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    timestamp: number
  }>
  optimizations: string[]
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
}
```

## Performance Considerations

### Zero-Overhead Design

- Benchmarking runs in separate timing context
- Metrics collection uses non-blocking sampling
- Analysis happens in idle callbacks
- No impact on actual flash performance

### Memory Management

- Metrics buffer limited to last 300 samples (~30 seconds at 10Hz)
- Old benchmark results auto-pruned if storage exceeds limits
- Canvas graphs use hardware acceleration
- Efficient data structures for real-time updates

### Accuracy

- Metrics sampled consistently at 100ms intervals
- Multiple samples averaged for stability
- Outliers detected and handled appropriately
- Calibration against known benchmarks

## Future Enhancements

### Planned Features

- [ ] Machine learning-based bottleneck prediction
- [ ] Automatic optimization application
- [ ] Benchmark comparison with similar devices
- [ ] Performance regression detection
- [ ] Integration with hardware monitoring APIs
- [ ] Export to industry-standard formats
- [ ] Cloud benchmark database integration
- [ ] Competitive performance rankings

### Integration Opportunities

- Real WebUSB device monitoring
- Actual ADB/Fastboot performance tracking
- Hardware temperature sensors
- USB bus analyzers
- Power consumption monitors

## Troubleshooting

### No Benchmarks Appearing

- Ensure flash operation is actually running
- Check that benchmark component is mounted
- Verify KV storage is functioning
- Check browser console for errors

### Inaccurate Metrics

- Metrics are simulated in demo mode
- Real metrics require actual hardware integration
- Browser throttling may affect timing in background tabs

### Missing Historical Data

- Data persisted in browser localStorage
- Clearing browser data removes history
- Different browsers/devices have separate histories

## API Reference

### useLiveBenchmark Hook

```typescript
const {
  activeBenchmark, // Current benchmark session or null
  benchmarkResults, // All stored benchmark results
  startBenchmark, // Start a new benchmark session
  stopBenchmark, // Stop current benchmark
  handleBenchmarkComplete, // Callback when benchmark finishes
  getDeviceHistory, // Get all benchmarks for a device
  getAverageScore, // Calculate average score
  getBestResult, // Get best result for a device
  clearHistory, // Clear all benchmark history
  isActive, // Whether benchmark is running
} = useLiveBenchmark();
```

### LiveDeviceBenchmark Component

```typescript
<LiveDeviceBenchmark
  deviceSerial="DEVICE-001"        // Required: Device identifier
  deviceModel="Pixel 7 Pro"        // Optional: Device model name
  isActive={true}                  // Required: Benchmark active state
  operationType="flash"            // Required: Type of operation
  partition="system"               // Optional: Partition being flashed
  fileSize={2147483648}           // Optional: File size in bytes
  onBenchmarkComplete={handleComplete} // Optional: Completion callback
/>
```

## Credits

Designed and implemented for the Pandora Codex project to provide professional-grade performance monitoring for Android device flashing operations.

## License

Part of the Pandora Codex project. See LICENSE file for details.
