# Workshop Atmosphere Audio System

## Overview

The Workshop Atmosphere system provides optional background audio for focused work during device operations. It's designed with safety, professionalism, and control in mind.

## Core Principles

1. **Never auto-plays** on app launch
2. **Hard capped at 15% volume** for safety
3. **Starts only when work begins** (job start)
4. **Fades out gracefully** on errors or completion
5. **Zero licensing issues** - uses clean audio or external sources

## Audio Modes

### Instrumental

- **Description**: Rhythmic, unobtrusive, vocal-free
- **Style**: 80-92 BPM boom-bap feel with dusty drums
- **Use case**: Active work sessions with rhythm
- **Loudness**: -22 to -20 LUFS (quiet by design)

### Ambient

- **Description**: Texture only. No beat.
- **Style**: Vinyl hiss, distant city hum, subtle electrical noise
- **Use case**: Deep focus without rhythm distraction
- **Loudness**: -22 to -20 LUFS

### External

- **Description**: Use your system audio (Spotify, local player, etc.)
- **How it works**: App does nothing - you control playback externally
- **Use case**: BYO sound - full control

## Settings

### Enable Workshop Atmosphere

Toggle to enable/disable the system. **Default: OFF**

### Intensity Slider

- **Range**: 0-15% volume
- **Default**: 8%
- **Hard cap**: Cannot exceed 15% for safety

### Auto-mute on Errors

When enabled, atmosphere fades out within 200ms when errors occur.
**Default: ON**

### Pause on Job Complete

When enabled, atmosphere fades out within 300ms when operations finish.
**Default: ON**

## Audio File Structure

Audio files should be placed in the `public/audio` directory:

```
public/
  audio/
    instrumental/
      loop_1.mp3
      loop_2.mp3
      loop_3.mp3
      loop_4.mp3
      loop_5.mp3
      loop_6.mp3
    ambient/
      loop_1.mp3
      loop_2.mp3
      loop_3.mp3
      loop_4.mp3
      loop_5.mp3
      loop_6.mp3
```

### Audio Specifications

**Loop Length**: 45-75 seconds (seamless)
**Format**: MP3, 320kbps or FLAC
**Loudness**: -22 to -20 LUFS
**Channels**: Stereo
**Sample Rate**: 44.1kHz or 48kHz

### Important: License Requirements

⚠️ **DO NOT** include copyrighted music, samples from commercial tracks, or "sound-alike" versions of known songs.

✅ **USE**:

- Royalty-free music libraries (with commercial license)
- Commissioned original loops
- Public domain recordings
- Your own original compositions

Recommended sources:

- Artlist (with subscription)
- Epidemic Sound (with subscription)
- AudioJungle (one-time purchase)
- Commissioned work from producers

## Implementation Details

### React Hook: `useAtmosphere`

Manages audio playback with fade controls:

```typescript
const { playLoop, stop, fadeOutAndStop, setVolume } = useAtmosphere();

// Start playing with volume control
playLoop("/audio/instrumental/loop_1.mp3", 0.08);

// Fade out over 300ms
fadeOutAndStop(300);

// Stop immediately
stop();

// Change volume (hard capped at 0.15)
setVolume(0.1);
```

### React Hook: `useAudioNotifications`

Integrates with job lifecycle:

```typescript
const audio = useAudioNotifications();

// Start atmosphere when job begins
audio.handleJobStart("job-123");

// Auto-mute on error (if enabled)
audio.handleJobError();

// Fade out on completion (if enabled)
audio.handleJobComplete();

// Stop manually
audio.stopAtmosphere();
```

### Integration with Existing Components

The atmosphere system is designed to integrate with your existing flash/diagnostic operations:

```typescript
// In your flash component
import { useAudioNotifications } from "@/hooks/use-audio-notifications";

function FlashPanel() {
  const audio = useAudioNotifications();

  const startFlash = async () => {
    audio.handleJobStart();

    try {
      // ... your flash logic
      await performFlash();
      audio.handleJobComplete();
    } catch (error) {
      audio.handleJobError();
      throw error;
    }
  };
}
```

## User Experience

### Silence = Confidence

The atmosphere never competes with:

- Error messages
- Console logs
- User interactions
- Alert sounds

### Feels Like the Room

It sounds like music in the next room—not a soundtrack. It's present but not demanding attention.

### Workshop Vibe

Inspired by late-night repair sessions in a Bronx apartment:

- Old hip-hop playing quietly
- Focused work
- Tools clicking
- The hum of the city outside

## Accessing Settings

1. Navigate to the Hub
2. Click the **Settings** card
3. Configure **Workshop Atmosphere** preferences
4. Changes save automatically via KV storage

## Technical Notes

### Storage Keys

- `atmosphere-enabled`: boolean
- `atmosphere-mode`: "instrumental" | "ambient" | "external"
- `atmosphere-intensity`: number (0.00-0.15)
- `atmosphere-auto-mute`: boolean
- `atmosphere-pause-complete`: boolean

### Browser Compatibility

Uses Web Audio API (HTMLAudioElement), supported in all modern browsers.

### Performance

Minimal CPU/memory impact. Audio loops are loaded on-demand and cleaned up immediately when stopped.

### Privacy

All settings stored locally via Spark KV. No telemetry, no external requests (except loading audio files from your own public/ directory).

## Future Enhancements

Potential additions (not implemented):

- Custom audio file upload
- Per-operation audio themes
- Crossfade between tracks
- Playlist mode with multiple loops
- Audio visualization (waveform or spectrum)

## Credits

System designed for Bobby's World Workshop Toolkit
Built with safety, professionalism, and focus in mind
No placeholders • Real functionality • Clean implementation

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Component**: Workshop Atmosphere System
