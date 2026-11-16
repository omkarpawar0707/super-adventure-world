/**
 * Super Adventure World - Retro Web Audio Synthesizer & Chiptune Music Engine
 * 100% self-contained chiptune audio using native HTML5 Web Audio API.
 * Requires zero external sound files, guaranteeing offline & file:// compatibility.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.isMuted = false;
    this.volume = 0.5;

    // Track active BGM state
    this.currentTrack = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bpm = 135;
    this.isPlayingBGM = false;

    // Load user mute preference
    const savedMute = localStorage.getItem('saw_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // BGM channel
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      if (this.ctx.state === 'suspended') {
        const unlock = () => {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
          }
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        window.addEventListener('touchstart', unlock);
      }
    } catch (e) {
      console.warn('Web Audio not supported or restricted', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('saw_muted', this.isMuted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // --- Sound Effects ---

  playJump() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';

    // Fast pitch sweep up
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  playCoin() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Classic 2-tone ping: B5 (987Hz) then E6 (1318Hz)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0.3, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  playStomp() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Low pitch drop + crunchy pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playBump() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.09);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playBreak() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Create crunchy noise burst
    const bufferSize = this.ctx.sampleRate * 0.16;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(200, now + 0.16);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(now);
  }

  playKick() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';

    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playPowerup() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.2, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.05 + 0.02);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.05);
      osc.stop(now + (i + 1) * 0.05 + 0.03);
    });
  }

  playHurt() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.22);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  playDeath() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    this.stopBGM();
    const now = this.ctx.currentTime;

    // Classic sad falling arpeggio
    const notes = [
      { f: 493.88, d: 0.14 }, // B4
      { f: 440.00, d: 0.14 }, // A4
      { f: 392.00, d: 0.14 }, // G4
      { f: 349.23, d: 0.14 }, // F4
      { f: 293.66, d: 0.20 }, // D4
      { f: 220.00, d: 0.40 }  // A3
    ];

    let t = now;
    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d;
    });
  }

  playCheckpoint() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.08);

      gain.gain.setValueAtTime(0.35, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.16);
    });
  }

  playFlagpole() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Sliding pitch down
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(750, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.7);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.76);
  }

  playLevelClear() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    this.stopBGM();
    const now = this.ctx.currentTime;

    // Triumphant 8-bit fanfare!
    const fanfare = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.22 }, // C6
      { f: 880.00, d: 0.14 }, // A5
      { f: 1046.50, d: 0.40 } // C6 (long)
    ];

    let t = now + 0.3;
    fanfare.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d;
    });
  }

  playGameOver() {
    if (!this.ctx) this.init();
    if (this.isMuted || !this.ctx) return;
    this.stopBGM();
    const now = this.ctx.currentTime;

    const jingle = [
      { f: 392.00, d: 0.25 }, // G4
      { f: 329.63, d: 0.25 }, // E4
      { f: 293.66, d: 0.25 }, // D4
      { f: 261.63, d: 0.60 }  // C4
    ];

    let t = now;
    jingle.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d;
    });
  }

  // --- Background Music Chiptune Sequencer ---

  playBGM(trackName) {
    if (!this.ctx) this.init();
    if (this.currentTrack === trackName && this.isPlayingBGM) return;

    this.stopBGM();
    this.currentTrack = trackName;
    this.isPlayingBGM = true;
    this.bgmStep = 0;

    let score = null;
    let bpm = 135;

    if (trackName === 'grassland') {
      bpm = 140;
      score = this.getGrasslandScore();
    } else if (trackName === 'forest') {
      bpm = 130;
      score = this.getForestScore();
    } else if (trackName === 'underground') {
      bpm = 118;
      score = this.getUndergroundScore();
    } else if (trackName === 'title') {
      bpm = 125;
      score = this.getTitleScore();
    }

    if (!score) return;

    const stepInterval = (60 / bpm) / 4; // 16th notes
    let nextNoteTime = this.ctx.currentTime + 0.05;

    const schedule = () => {
      if (!this.isPlayingBGM || !this.ctx) return;

      while (nextNoteTime < this.ctx.currentTime + 0.25) {
        const step = this.bgmStep % score.length;

        // Lead note
        if (score.melody && score.melody[step]) {
          this.playNote(score.melody[step], nextNoteTime, stepInterval * 0.9, 'square', 0.16);
        }

        // Bass note
        if (score.bass && score.bass[step]) {
          this.playNote(score.bass[step], nextNoteTime, stepInterval * 0.95, 'triangle', 0.28);
        }

        // Percussion hit
        if (score.drums && score.drums[step]) {
          this.playDrum(score.drums[step], nextNoteTime);
        }

        this.bgmStep++;
        nextNoteTime += stepInterval;
      }

      this.bgmTimer = setTimeout(schedule, 50);
    };

    schedule();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playNote(freq, time, duration, waveType = 'square', volume = 0.2) {
    if (this.isMuted || !this.ctx || freq <= 0) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(time);
      osc.stop(time + duration);
    } catch (e) {
      // AudioContext could be resetting
    }
  }

  playDrum(type, time) {
    if (this.isMuted || !this.ctx) return;
    try {
      if (type === 'kick') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);

        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + 0.09);
      } else if (type === 'snare') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, time);
        osc.frequency.exponentialRampToValueAtTime(70, time + 0.06);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + 0.07);
      } else if (type === 'hat') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(time);
        osc.stop(time + 0.04);
      }
    } catch (e) {}
  }

  // Helper note frequencies
  static NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
    C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, Bb5: 932.33, B5: 987.77,
    C6: 1046.50
  };

  getGrasslandScore() {
    const N = SoundEngine.NOTES;
    const melody = [
      N.E5, N.E5, 0, N.E5,   0, N.C5, N.E5, 0,    N.G5, 0, 0, 0,     N.G4, 0, 0, 0,
      N.C5, 0, 0, N.G4,      0, 0, N.E4, 0,       N.A4, 0, N.B4, 0,  N.A4, 0, N.G4, 0,
      N.E5, 0, N.G5, N.A5,   0, N.F5, N.G5, 0,    N.E5, 0, N.C5, N.D5, N.B4, 0, 0, 0,
      N.C5, 0, 0, N.G4,      0, 0, N.E4, 0,       N.A4, 0, N.B4, 0,  N.A4, 0, N.G4, 0
    ];

    const bass = [
      N.D3, 0, N.D3, 0,      N.D3, 0, N.D3, 0,    N.G3, 0, N.G3, 0,  N.G3, 0, N.G3, 0,
      N.C3, 0, N.G3, 0,      N.C3, 0, N.G3, 0,    N.F3, 0, N.C3, 0,  N.F3, 0, N.G3, 0,
      N.C3, 0, N.G3, 0,      N.F3, 0, N.C3, 0,    N.C3, 0, N.G3, 0,  N.G3, 0, N.D3, 0,
      N.C3, 0, N.G3, 0,      N.C3, 0, N.G3, 0,    N.F3, 0, N.C3, 0,  N.F3, 0, N.G3, 0
    ];

    const drums = [
      'kick', 'hat', 'snare', 'hat', 'kick', 'hat', 'snare', 'hat',
      'kick', 'hat', 'snare', 'hat', 'kick', 'hat', 'snare', 'hat',
      'kick', 'hat', 'snare', 'hat', 'kick', 'hat', 'snare', 'hat',
      'kick', 'hat', 'snare', 'hat', 'kick', 'hat', 'snare', 'hat'
    ];

    return { length: melody.length, melody, bass, drums };
  }

  getForestScore() {
    const N = SoundEngine.NOTES;
    const melody = [
      N.A4, 0, N.C5, 0,      N.E5, 0, N.D5, N.C5, N.B4, 0, N.G4, 0,  N.A4, 0, 0, 0,
      N.C5, 0, N.D5, 0,      N.E5, 0, N.F5, 0,    N.E5, N.D5, N.C5, 0, N.B4, 0, 0, 0,
      N.A4, 0, N.C5, 0,      N.E5, 0, N.D5, N.C5, N.B4, 0, N.D5, 0,  N.C5, 0, N.B4, 0,
      N.A4, 0, N.E4, 0,      N.A4, 0, N.B4, 0,    N.C5, 0, N.B4, 0,  N.A4, 0, 0, 0
    ];

    const bass = [
      N.A3, 0, N.E3, 0,      N.A3, 0, N.E3, 0,    N.D3, 0, N.A3, 0,  N.A3, 0, N.E3, 0,
      N.F3, 0, N.C3, 0,      N.D3, 0, N.A3, 0,    N.E3, 0, N.B3, 0,  N.E3, 0, N.B3, 0,
      N.A3, 0, N.E3, 0,      N.A3, 0, N.E3, 0,    N.D3, 0, N.A3, 0,  N.F3, 0, N.C3, 0,
      N.A3, 0, N.E3, 0,      N.D3, 0, N.E3, 0,    N.A3, 0, N.E3, 0,  N.A3, 0, 0, 0
    ];

    const drums = [
      'kick', 0, 'snare', 'hat', 'kick', 'hat', 'snare', 0,
      'kick', 0, 'snare', 'hat', 'kick', 'kick', 'snare', 0,
      'kick', 0, 'snare', 'hat', 'kick', 'hat', 'snare', 0,
      'kick', 0, 'snare', 'hat', 'kick', 'kick', 'snare', 'hat'
    ];

    return { length: melody.length, melody, bass, drums };
  }

  getUndergroundScore() {
    const N = SoundEngine.NOTES;
    const melody = [
      N.C4, N.C5, N.A4, N.A5,  N.Bb3, N.Bb4, 0, 0,  0, 0, 0, 0,        0, 0, 0, 0,
      N.C4, N.C5, N.A4, N.A5,  N.Bb3, N.Bb4, 0, 0,  0, 0, 0, 0,        0, 0, 0, 0,
      N.F4, 0, N.Fs4, 0,       N.G4, 0, 0, 0,       N.Eb4, 0, N.E4, 0, N.F4, 0, 0, 0,
      N.D4, 0, N.Eb4, 0,       N.E4, 0, 0, 0,       N.C4, 0, 0, 0,     0, 0, 0, 0
    ];

    const bass = [
      N.C3, 0, N.C3, 0,      N.Eb4, 0, N.F3, 0,   N.Fs3, 0, N.G3, 0, N.C3, 0, N.Bb3, 0,
      N.C3, 0, N.C3, 0,      N.Eb4, 0, N.F3, 0,   N.Fs3, 0, N.G3, 0, N.C3, 0, N.Bb3, 0,
      N.F3, 0, N.C3, 0,      N.F3, 0, N.C3, 0,    N.C3, 0, N.G3, 0,  N.C3, 0, N.G3, 0,
      N.G3, 0, N.D3, 0,      N.G3, 0, N.D3, 0,    N.C3, 0, N.G3, 0,  N.C3, 0, 0, 0
    ];

    const drums = [
      'kick', 0, 'hat', 0, 'snare', 0, 'hat', 0,
      'kick', 0, 'hat', 0, 'snare', 0, 'hat', 'hat',
      'kick', 0, 'hat', 0, 'snare', 0, 'hat', 0,
      'kick', 0, 'hat', 0, 'snare', 0, 'hat', 'snare'
    ];

    return { length: melody.length, melody, bass, drums };
  }

  getTitleScore() {
    const N = SoundEngine.NOTES;
    const melody = [
      N.C5, 0, N.E5, 0,      N.G5, 0, N.E5, 0,    N.C5, 0, N.D5, 0,  N.E5, 0, 0, 0,
      N.D5, 0, N.F5, 0,      N.A5, 0, N.F5, 0,    N.D5, 0, N.E5, 0,  N.C5, 0, 0, 0
    ];
    const bass = [
      N.C3, 0, N.G3, 0,      N.C3, 0, N.G3, 0,    N.C3, 0, N.G3, 0,  N.C3, 0, N.G3, 0,
      N.F3, 0, N.C3, 0,      N.F3, 0, N.C3, 0,    N.G3, 0, N.D3, 0,  N.C3, 0, N.G3, 0
    ];
    const drums = [
      'kick', 'hat', 'snare', 'hat', 'kick', 'hat', 'snare', 'hat',
      'kick', 'hat', 'snare', 'hat', 'kick', 'hat', 'snare', 'hat'
    ];
    return { length: melody.length, melody, bass, drums };
  }
}

// Global instance
window.soundEngine = new SoundEngine();
