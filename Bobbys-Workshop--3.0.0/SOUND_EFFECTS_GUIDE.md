# Bobby's Workshop - 90s/00s Hip-Hop Sound Effects Guide

## 🎵 Overview

This system adds authentic 90s/00s hip-hop sound effects to Bobby's Workshop UI interactions. All sounds follow the **truth-first principle** - only real audio files are played, no fake/mock success.

## 🔊 Sound Effect Library

### Available Sound Effects

| Effect | Usage | File Name | Description |
|--------|-------|-----------|-------------|
| **boom-bap-kick** | Button clicks, confirmations | `boom-bap-kick.mp3` | Classic 808/SP-1200 kick drum |
| **vinyl-scratch** | Deletions, cancellations | `vinyl-scratch.mp3` | DJ scratch effect |
| **cassette-click** | Tab switches, navigation | `cassette-click.mp3` | Cassette deck button press |
| **air-horn** | Alerts, warnings | `air-horn.mp3` | Classic hip-hop air horn |
| **cd-tray-open** | Expand/show actions | `cd-tray-open.mp3` | CD drive opening |
| **cd-tray-close** | Collapse/hide actions | `cd-tray-close.mp3` | CD drive closing |
| **sneaker-squeak** | Hover effects | `sneaker-squeak.mp3` | Basketball court squeak |
| **basketball-bounce** | List item selection | `basketball-bounce.mp3` | Single ball bounce |
| **spray-can** | New item creation | `spray-can.mp3` | Spray paint sound |
| **turntable-spin** | Loading states | `turntable-spin.mp3` | Record spinning up |
| **sample-chop** | Quick actions | `sample-chop.mp3` | MPC pad hit |
| **record-drop** | Heavy actions (flash, restore) | `record-drop.mp3` | Vinyl drop on turntable |

## 📁 Setup Instructions

### 1. Create Sound Assets Directory

```bash
mkdir -p public/sounds
```

### 2. Source Sound Files

You need to obtain/create actual MP3 files for each effect. Recommended sources:

- **Free Sources:**
  - Freesound.org (CC0 license)
  - YouTube Audio Library
  - BBC Sound Effects Archive
  - Sample packs from producers

- **Create Your Own:**
  - Record from real devices (cassette players, CD drives)
  - Use drum machine VSTs (MPC, SP-1200 emulators)
  - Edit existing samples with Audacity

### 3. File Requirements

- **Format:** MP3 (best browser compatibility)
- **Sample Rate:** 44.1kHz
- **Bit Rate:** 128-192kbps (good quality, small size)
- **Length:** 0.5-2.0 seconds (keep it snappy)
- **Volume:** Normalized to -3dB (prevent clipping)

### 4. Place Files in Public Directory

```
public/
└── sounds/
    ├── boom-bap-kick.mp3
    ├── vinyl-scratch.mp3
    ├── cassette-click.mp3
    ├── air-horn.mp3
    ├── cd-tray-open.mp3
    ├── cd-tray-close.mp3
    ├── sneaker-squeak.mp3
    ├── basketball-bounce.mp3
    ├── spray-can.mp3
    ├── turntable-spin.mp3
    ├── sample-chop.mp3
    └── record-drop.mp3
```

## 💻 Usage in Components

### Basic Usage

```typescript
import { soundManager } from '@/lib/soundManager';

function MyButton() {
  const handleClick = () => {
    soundManager.play('boom-bap-kick');
    // ... rest of your logic
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Using React Hook

```typescript
import { useSoundEffect } from '@/lib/soundManager';

function MyButton() {
  const playKick = useSoundEffect('boom-bap-kick');

  const handleClick = () => {
    playKick();
    // ... rest of your logic
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Higher-Order Component

```typescript
import { Button } from '@/components/ui/button';
import { withClickSound } from '@/lib/soundManager';

// Wrap any component to add sound on click
const SoundButton = withClickSound(Button, 'boom-bap-kick');

function MyComponent() {
  return <SoundButton>Click Me</SoundButton>;
}
```

### Initialize in App Root

```typescript
// src/main.tsx or src/App.tsx
import { soundManager } from '@/lib/soundManager';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Initialize sound system
    soundManager.init();

    // Optionally preload frequently used sounds
    soundManager.preloadMultiple([
      'boom-bap-kick',
      'cassette-click',
      'vinyl-scratch'
    ]);

    return () => {
      soundManager.destroy();
    };
  }, []);

  // ... rest of app
}
```

## ⚙️ User Settings

### Volume Control

```typescript
import { soundManager } from '@/lib/soundManager';

// Set volume (0.0 to 1.0)
soundManager.setVolume(0.7);

// Get current settings
const settings = soundManager.getSettings();
console.log(settings.volume); // 0.7
console.log(settings.enabled); // true
```

### Enable/Disable Sounds

```typescript
import { soundManager } from '@/lib/soundManager';

// Disable all sounds
soundManager.setEnabled(false);

// Re-enable
soundManager.setEnabled(true);
```

### Settings UI Example

```typescript
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { soundManager } from '@/lib/soundManager';
import { useState, useEffect } from 'react';

function SoundSettings() {
  const [settings, setSettings] = useState(soundManager.getSettings());

  const handleVolumeChange = (value: number[]) => {
    soundManager.setVolume(value[0]);
    setSettings(soundManager.getSettings());
  };

  const handleToggle = (enabled: boolean) => {
    soundManager.setEnabled(enabled);
    setSettings(soundManager.getSettings());
  };

  return (
    <div className="boom-bap-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <label className="boom-bap-text">Sound Effects</label>
        <Switch 
          checked={settings.enabled} 
          onCheckedChange={handleToggle}
        />
      </div>
      
      <div className="space-y-2">
        <label className="boom-bap-text text-sm">Volume</label>
        <Slider
          value={[settings.volume]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          disabled={!settings.enabled}
        />
      </div>
    </div>
  );
}
```

## 🎨 Recommended UI Mappings

### Navigation & Tabs

```typescript
// Room navigation
<button onClick={() => {
  soundManager.play('cassette-click');
  navigateTo('workbench');
}}>
  Workbench
</button>

// Tab switches
<Tab onClick={() => soundManager.play('cassette-click')}>
  Overview
</Tab>
```

### Device Actions

```typescript
// Flash/Restore (heavy action)
<button onClick={() => {
  soundManager.play('record-drop');
  startFlashing();
}}>
  Flash Device
</button>

// Diagnose (quick action)
<button onClick={() => {
  soundManager.play('sample-chop');
  runDiagnostics();
}}>
  Diagnose
</button>
```

### UI Interactions

```typescript
// Expand panels
<button onClick={() => {
  soundManager.play('cd-tray-open');
  setExpanded(true);
}}>
  Show Details
</button>

// Collapse panels
<button onClick={() => {
  soundManager.play('cd-tray-close');
  setExpanded(false);
}}>
  Hide Details
</button>

// Delete/Cancel
<button onClick={() => {
  soundManager.play('vinyl-scratch');
  deleteItem();
}}>
  Delete
</button>
```

### Status Changes

```typescript
// Success
useEffect(() => {
  if (status === 'success') {
    soundManager.play('boom-bap-kick');
  }
}, [status]);

// Warning
useEffect(() => {
  if (status === 'warning') {
    soundManager.play('air-horn');
  }
}, [status]);

// Error
useEffect(() => {
  if (status === 'error') {
    soundManager.play('vinyl-scratch');
  }
}, [status]);
```

## 🚫 What NOT To Do

### ❌ Don't Mock Sounds

```typescript
// BAD - fake sound with no file
soundManager.play('fake-sound-that-doesnt-exist');

// GOOD - only play sounds that have real files
if (soundFileExists) {
  soundManager.play('boom-bap-kick');
}
```

### ❌ Don't Override Browser Audio Permissions

```typescript
// BAD - forcing audio without user gesture
document.addEventListener('DOMContentLoaded', () => {
  soundManager.play('boom-bap-kick'); // Will fail/annoy users
});

// GOOD - play on user interaction
button.addEventListener('click', () => {
  soundManager.play('boom-bap-kick'); // Works reliably
});
```

### ❌ Don't Spam Sounds

```typescript
// BAD - sound on every mouse move
onMouseMove={() => soundManager.play('sneaker-squeak')}

// GOOD - throttled/debounced or on significant actions only
onMouseEnter={() => soundManager.play('sneaker-squeak')}
```

## 🎯 Future Enhancements

### Optional Features (Not Yet Implemented)

- **Sound Themes:** Switch between different era packs (90s, 00s, 10s)
- **Custom Sounds:** Let users upload their own effects
- **Spatial Audio:** Pan sounds left/right based on UI position
- **Randomization:** Play variations of same effect for variety
- **Music Tracks:** Background lo-fi boom bap beats (toggle on/off)

## 📝 License & Attribution

When using sound effects from public sources:

1. **Check License:** Ensure CC0 or appropriate usage rights
2. **Attribute:** Credit original creators if required
3. **Document:** Keep a `SOUND_CREDITS.md` file with sources
4. **Test:** Verify sounds work across browsers (Chrome, Firefox, Safari)

## 🔧 Troubleshooting

### Sounds Not Playing

1. Check browser console for errors
2. Verify files exist in `public/sounds/`
3. Check file names match exactly (case-sensitive)
4. Test in different browser (Safari has stricter autoplay policies)
5. Ensure user has interacted with page first (browser requirement)

### Performance Issues

1. Preload only frequently used sounds
2. Use compressed MP3 files (128kbps is fine)
3. Keep sound files under 100KB each
4. Don't play more than 2-3 sounds simultaneously

### Volume Too Loud/Quiet

1. Normalize all sound files to -3dB before adding
2. Adjust master volume with `soundManager.setVolume()`
3. Let users control volume in settings UI

---

**Status:** 🚧 Sound files need to be sourced/created - No mocks, real files only!

**Next Steps:**

1. Source or create 12 sound effect files
2. Place in `public/sounds/` directory
3. Test in development environment
4. Add settings UI to LeversPanel
5. Map sounds to UI interactions across rooms
