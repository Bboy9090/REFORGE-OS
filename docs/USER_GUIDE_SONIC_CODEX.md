# 🎵 Sonic Codex - User Guide

## Overview

Sonic Codex is Bobby's Workshop's Audio Forensic Intelligence suite. It recovers muffled, distant, or low-quality speech from audio/video sources and provides professional-grade transcription with speaker identification.

---

## Getting Started

### Accessing Sonic Codex

1. Navigate to **Secret Rooms** in Bobby's Workshop
2. Authenticate with **Phoenix Key** (secret sequence or gesture)
3. Select **Sonic Codex** from the room navigation

---

## Workflows

### Workflow 1: Upload & Process File

**Step 1: Import**
- Click **"New Job"** or use the wizard
- Drag and drop an audio/video file, or click to browse
- Supported formats: MP3, WAV, MP4, MOV, M4A, FLAC

**Step 2: Metadata**
- Enter a **Title** (e.g., "Meeting_Notes_2025")
- Enter **Device** name (e.g., "iPhone_13_Pro")
- Add optional notes

**Step 3: Enhance**
- Select an enhancement preset:
  - **Speech Clear**: General speech enhancement
  - **Interview**: Mid-range boost for vocal presence
  - **Noisy Room**: Aggressive noise reduction
  - **Super Sonic**: Maximum enhancement (neural processing)
- Click **"Next: Transcribe"**

**Step 4: Transcribe**
- Language is auto-detected
- Enable **Speaker Diarization** to identify different speakers
- Processing may take several minutes for long files
- Progress is shown in real-time

**Step 5: Review**
- Play enhanced audio with synced transcript
- Toggle between **Original** and **Enhanced** audio
- View **Original Language**, **English Translation**, or **Dual** view
- Click any word to jump to that timestamp
- Speaker labels appear if diarization is enabled

**Step 6: Export**
- Click **"Export"** button
- Choose format:
  - **ZIP**: Complete forensic package (recommended)
  - **SRT**: Subtitle file for video editing
  - **TXT**: Plain text transcript
  - **JSON**: Structured data with timestamps

---

### Workflow 2: Extract from URL

1. Click **"New Job"** → **"Extract from URL"**
2. Paste YouTube, TikTok, or other video URL
3. Select format preference (WAV recommended for quality)
4. Click **"Extract"**
5. File is automatically processed through the pipeline

---

### Workflow 3: Live Recording

1. Click **"Live Capture"** tab
2. Select audio input device (if multiple available)
3. Click **"Start Recording"**
4. Watch real-time spectrogram visualization
5. Click **"Stop Recording"** when done
6. Recording is automatically uploaded and processed

---

## Job Library

### Features

- **Search**: Filter jobs by title, device, or job ID
- **Filter**: Show only specific stages (Complete, Processing, etc.)
- **Sort**: By date, name, or progress
- **View Details**: Click eye icon to open full job review
- **Delete**: Remove jobs you no longer need

### Status Indicators

- 🟢 **Green**: Complete
- 🔵 **Cyan**: Processing (Transcribing, Enhancing, etc.)
- 🔴 **Red**: Failed
- ⚪ **Gray**: Waiting/Uploading

---

## Advanced Features

### Speaker Diarization

When enabled, the transcript identifies different speakers:
```
[Speaker 1] Hello, how are you?
[Speaker 2] I'm doing great, thanks!
```

**When to use:**
- Multi-person conversations
- Interviews
- Meetings
- Phone calls

### Enhancement Presets

**Speech Clear** (Default)
- Best for: General speech, podcasts, lectures
- Processing: Moderate noise reduction, consonant boost

**Interview**
- Best for: One-on-one conversations, interviews
- Processing: Mid-range vocal boost, de-essing

**Noisy Room**
- Best for: Recordings with heavy background noise
- Processing: Aggressive noise gate, spectral subtraction

**Super Sonic**
- Best for: Maximum clarity, forensic analysis
- Processing: Neural dereverberation, advanced filtering
- Note: Requires GPU, slower processing

### Spectrogram Visualization

The spectrogram shows frequency content in real-time:
- **Cyan**: Low frequencies (bass, rumble)
- **Yellow**: Mid frequencies (speech fundamentals)
- **Red**: High frequencies (consonants, clarity)

Use it to:
- Verify audio quality before processing
- Identify frequency issues
- Monitor live recording

---

## Tips & Best Practices

1. **File Quality**: Higher quality input = better results
   - Use WAV or FLAC when possible
   - Avoid heavily compressed MP3s

2. **Naming**: Use descriptive titles
   - Format: `Device_Date_Description`
   - Example: `iPhone_13_2025-01-15_Client_Meeting`

3. **Processing Time**:
   - Short files (< 5 min): ~1-2 minutes
   - Medium files (5-30 min): ~5-15 minutes
   - Long files (30+ min): ~15-60 minutes

4. **Speaker Diarization**:
   - Works best with clear speaker separation
   - May struggle with overlapping speech
   - Enable for multi-speaker content

5. **Export Formats**:
   - **ZIP**: Use for complete archival
   - **SRT**: Use for video subtitles
   - **TXT**: Use for simple text needs
   - **JSON**: Use for programmatic processing

---

## Troubleshooting

### "No audio file found"
- Ensure file uploaded successfully
- Check file format is supported
- Try re-uploading the file

### "Transcription failed"
- Check audio has actual speech (not just silence)
- Verify file isn't corrupted
- Try a different enhancement preset

### "Processing stuck"
- Refresh the page (job state is saved)
- Check backend is running
- Verify sufficient disk space

### "Export failed"
- Ensure transcription completed successfully
- Check all output files exist
- Try exporting individual formats

---

## Keyboard Shortcuts

- **Space**: Play/Pause audio (in Job Details)
- **Arrow Left/Right**: Seek backward/forward
- **Click Word**: Jump to timestamp in transcript

---

**Need Help?** Check the developer documentation or contact support.
