# Real-Time Flash Progress Tracking

## Overview

The Pandora Codex Device Detection Arsenal now includes comprehensive real-time flash progress tracking with transfer speed monitoring, ETA calculations, and live visualization.

## Features

### 1. **Real-Time Progress Monitoring**

- Live progress percentage display
- Bytes transferred vs. total bytes
- Visual progress bar with smooth animations

### 2. **Transfer Speed Metrics**

- **Current Speed**: Instantaneous transfer rate (MB/s)
- **Average Speed**: Mean transfer rate across the entire operation
- **Peak Speed**: Maximum transfer rate achieved during the session
- **Speed History Graph**: Real-time visualization of transfer speeds over time

### 3. **Time Tracking**

- **Time Elapsed**: Total time since flash operation started
- **ETA (Estimated Time Remaining)**: Calculated based on average transfer speed
- Dynamic time formatting (seconds, minutes, hours)

### 4. **Status Indicators**

- **Preparing**: Initial setup phase
- **Flashing**: Active data transfer
- **Verifying**: Post-flash verification
- **Completed**: Successful completion with checkmark
- **Error**: Failed operation with error details

### 5. **Visual Enhancements**

- Animated progress bars with smooth transitions
- Real-time speed graph with dynamic scaling
- Color-coded status badges
- Pulsing indicators for active operations
- Framer Motion animations for smooth UI transitions

## Components

### FlashProgressMonitor

Main component that displays the real-time progress tracking UI.

**Props:**

```typescript
interface FlashProgressMonitorProps {
  progress: FlashProgress | null;
  onCancel?: () => void;
}

interface FlashProgress {
  partition: string;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  transferSpeed: number; // bytes per second
  averageSpeed: number; // bytes per second
  peakSpeed: number; // bytes per second
  eta: number; // seconds
  status: "preparing" | "flashing" | "verifying" | "completed" | "error";
  startTime: number; // timestamp
  currentTime: number; // timestamp
  error?: string;
}
```

**Features:**

- Responsive grid layout for metrics
- Real-time speed graph visualization
- Smooth animations using Framer Motion
- Error display with descriptive messages

### SpeedGraph

Visualizes transfer speed history as a bar chart.

**Features:**

- Up to 30 speed samples displayed
- Dynamic height scaling based on peak speed
- Smooth bar animations
- Minimal, clean design

### useFlashProgressSimulator

React hook for simulating flash progress (useful for development and testing).

**Usage:**

```typescript
const { progress, startFlashing, stopFlashing } = useFlashProgressSimulator();

// Start simulating
startFlashing("boot", 50 * 1024 * 1024); // 50MB file

// Stop simulation
stopFlashing();
```

## Integration

### FastbootFlashingPanel

The single partition flashing panel now includes:

- Real-time progress tracking during flash operations
- Automatic progress updates every 100ms
- Speed calculation with realistic variations
- Automatic cleanup after completion

**Key Features:**

- Progress monitor appears above the main panel during flashing
- Auto-dismisses after 3 seconds on success
- Displays error messages for 5 seconds on failure
- Properly cleans up intervals on unmount

### BatchFlashingPanel

The batch flashing panel includes:

- Per-item progress tracking
- Continuous monitoring across multiple partitions
- Progress updates for each partition in sequence
- Automatic progress reset between items

**Key Features:**

- Shows progress for currently flashing partition
- Updates session progress for all items
- Supports verification phase tracking
- Handles errors gracefully with detailed feedback

## Technical Implementation

### Progress Calculation

Transfer speed is simulated with realistic variations:

```typescript
const baseSpeed = 5 * 1024 * 1024; // 5 MB/s base
const speedVariation = Math.sin(currentTime / 1000) * 2 * 1024 * 1024;
const randomVariation = (Math.random() - 0.5) * 1024 * 1024;
const currentSpeed = Math.max(
  1024 * 1024,
  baseSpeed + speedVariation + randomVariation,
);
```

### ETA Calculation

```typescript
const remainingBytes = totalBytes - bytesTransferred;
const eta = averageSpeed > 0 ? remainingBytes / averageSpeed : 0;
```

### Speed History Management

- Maintains last 50 speed samples
- Automatically removes oldest samples
- Used for average and peak calculations
- Powers the speed graph visualization

## Data Flow

1. **Flash Initiated**: User selects partition and file
2. **Progress Started**: FlashProgress object created
3. **Interval Created**: 100ms update interval established
4. **Metrics Updated**: Speed, bytes, ETA calculated each tick
5. **UI Updated**: React state triggers re-render
6. **Completion**: Interval cleared, final status set
7. **Auto-Dismiss**: Progress monitor removed after delay

## UI/UX Considerations

### Visual Hierarchy

- Primary metrics (speed, progress) most prominent
- Secondary metrics (elapsed time, ETA) supporting
- Status badge clearly visible
- Error messages highlighted

### Animation Timing

- Progress bar: Smooth interpolation
- Speed graph: 0.2s transition per bar
- Component entry/exit: 0.3s fade + slide
- Status changes: Instant

### Responsive Design

- 4-column grid on desktop
- 2-column grid on tablet
- Single column on mobile
- Speed graph scales appropriately

## Export Functionality

### ExportPandoraCodexFiles Component

New component for exporting all Pandora Codex data:

- Individual exports (batch history, fastboot history, device connections)
- Complete export (all KV store data)
- JSON format for easy analysis
- Timestamped filenames

**Features:**

- Shows record counts for each export type
- Disabled state for empty datasets
- One-click export to JSON files
- Automatic download via browser

## Future Enhancements

### Planned Features

- [ ] Real backend integration with actual file transfer
- [ ] Pause/resume flash operations
- [ ] Network transfer speed monitoring
- [ ] Multiple concurrent flash operations
- [ ] Historical speed comparisons
- [ ] Transfer speed recommendations
- [ ] Advanced error recovery options

### Performance Optimizations

- [ ] Throttle UI updates for large transfers
- [ ] Optimize speed history storage
- [ ] Batch state updates
- [ ] Memoize expensive calculations

## Testing

### Manual Testing Checklist

- [ ] Progress bar updates smoothly
- [ ] Speed metrics calculate correctly
- [ ] Speed graph displays properly
- [ ] ETA is reasonable and updates
- [ ] Success state displays correctly
- [ ] Error state displays properly
- [ ] Auto-dismiss works as expected
- [ ] Intervals are cleaned up
- [ ] Multiple operations don't conflict

### Edge Cases

- Very small files (< 1MB)
- Very large files (> 1GB)
- Extremely fast transfers
- Extremely slow transfers
- Network interruptions
- Backend errors
- Component unmount during flash

## Best Practices

### Performance

- Update interval at 100ms (10 FPS) for smooth UI
- Limit speed history to 50 samples
- Clean up intervals in useEffect cleanup
- Use refs for interval handlers

### Error Handling

- Always clear intervals on error
- Display user-friendly error messages
- Provide error details for debugging
- Auto-dismiss errors after reasonable delay

### State Management

- Use useKV for persistence
- Use useState for ephemeral data
- Clean up state after operations
- Avoid memory leaks with proper cleanup

## Credits

Built for the **Pandora Codex Device Detection Arsenal** by Bobby Dev.

Part of the comprehensive Android device flashing and management toolkit.
