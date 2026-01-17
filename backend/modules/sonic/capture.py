"""
Sonic Codex - Live Audio Capture
Real-time audio recording and streaming
"""

try:
    import pyaudio
    PYAUDIO_AVAILABLE = True
except ImportError:
    PYAUDIO_AVAILABLE = False
    pyaudio = None  # Placeholder

import wave
import threading
from pathlib import Path
from typing import Optional, Callable
import time


class LiveAudioCapture:
    """Live audio capture using PyAudio"""
    
    def __init__(
        self,
        sample_rate: int = 44100,
        channels: int = 1,
        chunk_size: int = 1024,
        format: Optional[int] = None
    ):
        """
        Initialize audio capture
        
        Args:
            sample_rate: Sample rate in Hz (44100, 48000, etc.)
            channels: Number of channels (1=mono, 2=stereo)
            chunk_size: Buffer size for audio chunks
            format: Audio format (paInt16, paFloat32, etc.)
        """
        if not PYAUDIO_AVAILABLE:
            raise RuntimeError("pyaudio is not installed. Live capture is unavailable.")
        
        self.sample_rate = sample_rate
        self.channels = channels
        self.chunk_size = chunk_size
        self.format = format if format is not None else pyaudio.paInt16
        
        self.audio = pyaudio.PyAudio()
        self.stream: Optional[pyaudio.Stream] = None
        self.is_recording = False
        self.recording_thread: Optional[threading.Thread] = None
        self.audio_chunks = []
        self.on_chunk_callback: Optional[Callable] = None
    
    def start_recording(self, output_path: Optional[Path] = None, on_chunk: Optional[Callable] = None):
        """
        Start recording audio
        
        Args:
            output_path: Optional path to save WAV file
            on_chunk: Optional callback for each audio chunk
        """
        if self.is_recording:
            return
        
        self.is_recording = True
        self.audio_chunks = []
        self.on_chunk_callback = on_chunk
        
        # Open audio stream
        self.stream = self.audio.open(
            format=self.format,
            channels=self.channels,
            rate=self.sample_rate,
            input=True,
            frames_per_buffer=self.chunk_size
        )
        
        # Start recording thread
        self.recording_thread = threading.Thread(
            target=self._record_loop,
            args=(output_path,),
            daemon=True
        )
        self.recording_thread.start()
    
    def _record_loop(self, output_path: Optional[Path]):
        """Recording loop in separate thread"""
        try:
            while self.is_recording:
                if self.stream:
                    data = self.stream.read(self.chunk_size, exception_on_overflow=False)
                    self.audio_chunks.append(data)
                    
                    # Callback for real-time processing
                    if self.on_chunk_callback:
                        self.on_chunk_callback(data)
        except Exception as e:
            print(f"Recording error: {e}")
        finally:
            # Save to file if path provided
            if output_path and self.audio_chunks:
                self._save_to_wav(output_path)
    
    def stop_recording(self) -> Optional[bytes]:
        """
        Stop recording and return audio data
        
        Returns:
            Combined audio data as bytes
        """
        self.is_recording = False
        
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        
        if self.recording_thread:
            self.recording_thread.join(timeout=2)
        
        # Combine all chunks
        if self.audio_chunks:
            return b''.join(self.audio_chunks)
        return None
    
    def _save_to_wav(self, output_path: Path):
        """Save recorded audio to WAV file"""
        try:
            with wave.open(str(output_path), 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(self.audio.get_sample_size(self.format))
                wf.setframerate(self.sample_rate)
                wf.writeframes(b''.join(self.audio_chunks))
        except Exception as e:
            print(f"Error saving WAV: {e}")
    
    def get_available_devices(self) -> list:
        """Get list of available audio input devices"""
        devices = []
        for i in range(self.audio.get_device_count()):
            info = self.audio.get_device_info_by_index(i)
            if info['maxInputChannels'] > 0:
                devices.append({
                    'index': i,
                    'name': info['name'],
                    'channels': info['maxInputChannels'],
                    'sample_rate': int(info['defaultSampleRate'])
                })
        return devices
    
    def cleanup(self):
        """Clean up audio resources"""
        if self.is_recording:
            self.stop_recording()
        self.audio.terminate()
