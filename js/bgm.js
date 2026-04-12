/**
 * bgm.js — Shattered Nexus Background Music
 * Handles looping music for different game screens
 */
const BGM = {
  _current: null,      // Current playing audio element
  _muted: false,
  _volume: 0.5,
  _userInteracted: false,
  _pendingTrack: null,

  /**
   * Initialize on first user interaction
   */
  _initUserInteraction() {
    if (this._userInteracted) return;
    this._userInteracted = true;

    // Try to play pending track
    if (this._pendingTrack) {
      const track = this._pendingTrack;
      this._pendingTrack = null;
      this.play(track);
    }
  },

  /**
   * Load and play a BGM track
   * @param {string} trackName - Name without path (e.g., 'title', 'battle', 'exploration', 'story')
   */
  play(trackName) {
    // If user hasn't interacted yet, queue the track
    if (!this._userInteracted) {
      this._pendingTrack = trackName;
      return;
    }

    // Stop existing track
    if (this._current) {
      this._current.pause();
      this._current.currentTime = 0;
    }

    // Don't play if muted
    if (this._muted) {
      this._current = null;
      return;
    }

    // Create new audio element
    const audio = new Audio(`audio/bgm/${trackName}.mp3`);
    audio.loop = true;
    audio.volume = this._volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn(`Could not play BGM: ${trackName}`, err);
      });
    }

    this._current = audio;
  },

  /**
   * Stop current BGM
   */
  stop() {
    if (this._current) {
      this._current.pause();
      this._current.currentTime = 0;
      this._current = null;
    }
  },

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(vol) {
    this._volume = Math.max(0, Math.min(1, vol));
    if (this._current) {
      this._current.volume = this._volume;
    }
  },

  /**
   * Toggle mute (synced with SFX mute)
   */
  toggleMute(muted) {
    this._muted = muted;
    if (muted) {
      this.stop();
    }
    // Resume will be handled by the play() call
  },
};

// Initialize BGM on first user interaction
document.addEventListener('click', () => BGM._initUserInteraction(), { once: true });
document.addEventListener('keydown', () => BGM._initUserInteraction(), { once: true });
document.addEventListener('touchstart', () => BGM._initUserInteraction(), { once: true });
