/**
 * Bobby's Workshop - Sound Manager
 * 90s/00s Hip-Hop Sound Effects System
 * 
 * Truth-first principle: Only plays sounds that actually exist
 * No fake/mock audio - all effects must be real files
 */

type SoundEffect = 
  | 'boom-bap-kick'
  | 'vinyl-scratch'
  | 'cassette-click'
  | 'air-horn'
  | 'cd-tray-open'
  | 'cd-tray-close'
  | 'sneaker-squeak'
  | 'basketball-bounce'
  | 'spray-can'
  | 'turntable-spin'
  | 'sample-chop'
  | 'record-drop';

interface SoundSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
}

class SoundManager {
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map();
  private missing: Set<SoundEffect> = new Set();
  private settings: SoundSettings = {
    enabled: true,
    volume: 0.5,
  };

  constructor() {
    this.loadSettings();
  }

  /**
   * Initialize sound manager
   * Only loads sounds that actually exist in public/sounds/
   */
  async init(): Promise<void> {
    // Load settings from localStorage
    this.loadSettings();

    // NOTE: Sound files must be placed in public/sounds/ directory
    // We don't load them until they're actually needed (lazy loading)
  }

  /**
   * Play a sound effect
   * Returns false if settings are disabled or the effect is known-missing
   */
  play(effect: SoundEffect): boolean {
    if (!this.settings.enabled) {
      return false;
    }

    if (this.missing.has(effect)) {
      return false;
    }

    try {
      const audio = this.getOrCreateAudio(effect);
      audio.volume = this.settings.volume;
      audio.currentTime = 0; // Reset to start
      audio.play().catch(err => {
        this.missing.add(effect);
        console.warn(`Sound effect "${effect}" failed to play:`, err);
      });
      return true;
    } catch (error) {
      this.missing.add(effect);
      console.warn(`Sound effect "${effect}" not available:`, error);
      return false;
    }
  }

  /**
   * Preload a specific sound effect
   * Only preloads if file exists
   */
  async preload(effect: SoundEffect): Promise<boolean> {
    try {
      const audio = this.getOrCreateAudio(effect);
      return new Promise((resolve) => {
        audio.addEventListener('canplaythrough', () => resolve(true), { once: true });
        audio.addEventListener(
          'error',
          () => {
            this.missing.add(effect);
            resolve(false);
          },
          { once: true }
        );
      });
    } catch {
      this.missing.add(effect);
      return false;
    }
  }

  /**
   * Preload multiple sound effects
   */
  async preloadMultiple(effects: SoundEffect[]): Promise<void> {
    await Promise.all(effects.map(effect => this.preload(effect)));
  }

  private getOrCreateAudio(effect: SoundEffect): HTMLAudioElement {
    if (!this.sounds.has(effect)) {
      const audio = new Audio(`/sounds/${effect}.mp3`);
      audio.volume = this.settings.volume;
      audio.addEventListener(
        'error',
        () => {
          this.missing.add(effect);
        },
        { once: true }
      );
      this.sounds.set(effect, audio);
    }
    return this.sounds.get(effect)!;
  }

  /**
   * Enable/disable all sound effects
   */
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
    this.saveSettings();
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    
    // Update all loaded audio elements
    this.sounds.forEach(audio => {
      audio.volume = this.settings.volume;
    });
  }

  /**
   * Get current settings
   */
  getSettings(): SoundSettings {
    return { ...this.settings };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem('workshop-sound-settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('workshop-sound-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save sound settings:', error);
    }
  }

  /**
   * Cleanup - stop all sounds and free memory
   */
  destroy(): void {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.sounds.clear();
  }
}

// Singleton instance
export const soundManager = new SoundManager();

/**
 * React hook for using sound effects
 */
export function useSoundEffect(effect: SoundEffect) {
  return () => soundManager.play(effect);
}
