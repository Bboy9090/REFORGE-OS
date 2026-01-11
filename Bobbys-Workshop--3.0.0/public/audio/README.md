# Audio Files - License-Clean Content Required

This directory contains background atmosphere audio for the Workshop Mode.

## ⚠️ Important: No Audio Files Included

Due to licensing requirements, **no audio files are included** in this repository.

You must provide your own license-clean audio loops following the specifications below.

## Directory Structure

Create the following structure:

```
public/audio/
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

## Audio Specifications

### Instrumental Loops

- **BPM**: 80-92
- **Style**: Boom-bap, dusty drums, soft swing
- **Vocals**: None
- **Melody**: Minimal or none
- **Feel**: Light vinyl noise baked in
- **Loudness**: -22 to -20 LUFS (quiet by design)
- **Length**: 45-75 seconds (seamless loop)
- **Format**: MP3 320kbps or FLAC

### Ambient Loops

- **Style**: Vinyl hiss, room tone, distant city hum
- **Beat**: None
- **Rhythm**: None
- **Loudness**: -22 to -20 LUFS
- **Length**: 45-75 seconds (seamless loop)
- **Format**: MP3 320kbps or FLAC

## Where to Get License-Clean Audio

### Royalty-Free Music Libraries (Subscription Required)

- **Artlist**: https://artlist.io
- **Epidemic Sound**: https://epidemicsound.com
- **Musicbed**: https://musicbed.com

### One-Time Purchase

- **AudioJungle**: https://audiojungle.net
- **Pond5**: https://pond5.com

### Commissioned Work

- Hire a producer on Fiverr or Upwork
- Request original loops matching the specifications
- Ensure you receive full commercial rights

### DIY (If You're a Producer)

- Create your own loops
- Use royalty-free samples
- Ensure all source material is licensed for commercial use

## What NOT to Use

❌ **DO NOT USE:**

- Copyrighted music from streaming services
- Samples ripped from commercial tracks
- "Sound-alike" versions of known songs
- YouTube downloads without explicit license
- Music from torrents or file-sharing sites

## Testing Without Audio Files

The atmosphere system will function without audio files present. It simply won't play anything if files are missing.

You can test the UI and controls without audio files installed.

## File Naming Convention

Files **must** be named exactly as shown:

- `loop_1.mp3` through `loop_6.mp3`
- Case-sensitive on Linux/Mac
- No spaces, no special characters

## Verifying Installation

After adding files, verify they load:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Enable Workshop Atmosphere in Settings
4. Start a flash operation
5. Check for successful loading of audio files

If you see 404 errors, check:

- File paths match exactly
- Files are in `public/audio/` directory
- File names are correct (loop_1.mp3, not Loop_1.MP3)
- Files are valid MP3/FLAC format

## Legal Compliance

By adding audio files to this directory, you confirm:

- You have the legal right to use these files
- You have obtained necessary licenses for commercial use
- Files do not infringe on any copyrights
- You take full responsibility for license compliance

## Questions?

See `WORKSHOP_ATMOSPHERE.md` for full system documentation.

---

**Remember**: When in doubt, commission original work or use verified royalty-free sources with proper licensing.
