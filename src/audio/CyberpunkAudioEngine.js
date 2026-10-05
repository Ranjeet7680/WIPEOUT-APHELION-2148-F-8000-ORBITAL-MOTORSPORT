// ============================================================================
// CYBERPUNK AUDIO ENGINE: SYNTHESIZED 2089 SOUNDSCAPE
// Multi-phase Procedural Music (Lobby, Intro, Racing, Final Lap, Podium)
// + Full Arcade Sound Effects (Engine, Boost, Drift, Stunts, Near Miss, Landing)
// ============================================================================

export class CyberpunkAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;

    // Master & Sub-bus Gains
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.sfxVolume = 1.0;
    this.musicVolume = 0.85;

    // Continuous SFX nodes
    this.engineOsc = null;
    this.engineGain = null;
    this.engineOsc2 = null;
    this.engineGain2 = null;
    this.engineSubOsc = null;
    this.engineSubGain = null;
    this.engineFilter = null;
    this.boostOsc = null;
    this.boostGain = null;
    this.driftOsc = null;
    this.driftGain = null;
    this.windOsc = null;
    this.windGain = null;
    this.windFilter = null;

    // Music State
    this.musicState = 'LOBBY'; // 'LOBBY', 'INTRO', 'COUNTDOWN', 'RACING', 'FINAL_LAP', 'PODIUM'
    this.seqStep = 0;
    this.seqTimer = 0;
    this.bpm = 150;

    // Musical Scales
    this.bassFreqs = [55, 55, 65, 55, 73, 55, 82, 65]; // A minor driving bass
    this.finalLapBass = [65, 65, 82, 65, 98, 82, 110, 82]; // High octave tension
    this.lobbyChords = [110, 130.81, 164.81, 196.00]; // Ambient synth pad

    // Main Lobby Exclusive Soundtracks (User theme songs)
    this.lobbyAudio = null;
    this.currentLobbyTheme = 'CHASE_THE_HORIZON'; // 'CHASE_THE_HORIZON', 'BORN_TO_RACE', 'PROCEDURAL_SYNTH'
    this.lobbyTracks = {
      'CHASE_THE_HORIZON': '/audio/chase_the_horizon.mp3',
      'BORN_TO_RACE': '/audio/born_to_race.mp3'
    };
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // 1. Electric Propulsion Engine (FM Sawtooth + Sub-bass rumble + Resonant filter)
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(80, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'sawtooth';
      this.engineOsc2.frequency.setValueAtTime(42, this.ctx.currentTime);

      this.engineGain2 = this.ctx.createGain();
      this.engineGain2.gain.setValueAtTime(0.2, this.ctx.currentTime);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.engineFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

      // Deep Sub-Bass Mag-Lev Core
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineSubOsc.type = 'sine';
      this.engineSubOsc.frequency.setValueAtTime(44, this.ctx.currentTime);

      this.engineSubGain = this.ctx.createGain();
      this.engineSubGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineGain2);
      this.engineGain2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);

      this.engineSubOsc.connect(this.engineSubGain);
      this.engineSubGain.connect(this.sfxGain);

      this.engineOsc.start();
      this.engineOsc2.start();
      this.engineSubOsc.start();

      // Aerodynamic Hypersonic Wind Sheer (White Noise Source + Bandpass Filter)
      const bufferSize = Math.floor(this.ctx.sampleRate * 2.0);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.7;
      }
      this.windOsc = this.ctx.createBufferSource();
      this.windOsc.buffer = noiseBuffer;
      this.windOsc.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(550, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.windOsc.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.sfxGain);
      this.windOsc.start();

      // 2. Hyper-Boost Plasma Whine (High Sine Wave)
      this.boostOsc = this.ctx.createOscillator();
      this.boostOsc.type = 'sine';
      this.boostOsc.frequency.setValueAtTime(600, this.ctx.currentTime);

      this.boostGain = this.ctx.createGain();
      this.boostGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.boostOsc.connect(this.boostGain);
      this.boostGain.connect(this.sfxGain);
      this.boostOsc.start();

      // 3. Drift Friction Screech
      this.driftOsc = this.ctx.createOscillator();
      this.driftOsc.type = 'triangle';
      this.driftOsc.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.driftGain = this.ctx.createGain();
      this.driftGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.driftOsc.connect(this.driftGain);
      this.driftGain.connect(this.sfxGain);
      this.driftOsc.start();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization deferred until user interaction');
    }
  }

  resume() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.musicState === 'LOBBY') {
      this.playLobbyTheme();
    }
  }

  setLobbyTheme(theme) {
    this.currentLobbyTheme = theme;
    if (this.musicState === 'LOBBY') {
      this.playLobbyTheme();
    } else {
      this.stopLobbyTheme();
    }
  }

  playLobbyTheme() {
    if (this.isMuted) return;

    const trackSrc = this.lobbyTracks[this.currentLobbyTheme];
    if (trackSrc && typeof Audio !== 'undefined') {
      try {
        if (!this.lobbyAudio) {
          this.lobbyAudio = new Audio();
          this.lobbyAudio.loop = true;
          this.lobbyAudio.preload = 'auto';
        }

        const currentSrc = this.lobbyAudio.getAttribute('src');
        if (currentSrc !== trackSrc) {
          this.lobbyAudio.src = trackSrc;
        }

        this.lobbyAudio.volume = Math.max(0.0, Math.min(1.0, this.musicVolume));
        const p = this.lobbyAudio.play();
        if (p !== undefined) {
          p.catch(() => {
            // Autoplay deferred until user interaction
          });
        }
      } catch (err) {
        console.warn('[AudioEngine] Lobby theme playback error:', err);
      }
    } else {
      this.stopLobbyTheme();
    }
  }

  stopLobbyTheme() {
    if (this.lobbyAudio) {
      try {
        this.lobbyAudio.pause();
      } catch {}
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.5, this.ctx.currentTime);
    }
    if (this.lobbyAudio) {
      this.lobbyAudio.muted = this.isMuted;
      if (!this.isMuted && this.musicState === 'LOBBY') {
        this.playLobbyTheme();
      }
    }
    return !this.isMuted;
  }

  setMasterVolume(val) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0.0, Math.min(1.0, val));
      this.masterGain.gain.setValueAtTime(clamped * 0.5, this.ctx.currentTime);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0.0, Math.min(1.0, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0.0, Math.min(1.0, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
    if (this.lobbyAudio) {
      this.lobbyAudio.volume = this.musicVolume;
    }
  }

  setMusicState(state) {
    this.musicState = state;
    this.seqStep = 0;
    this.seqTimer = 0.0;
    if (state === 'FINAL_LAP') {
      this.bpm = 160;
    } else {
      this.bpm = 150;
    }

    if (state === 'LOBBY') {
      this.playLobbyTheme();
      this.silenceContinuousSFX();
    } else {
      // Main lobby theme only: immediately stop when leaving lobby
      this.stopLobbyTheme();
      if (state !== 'RACING' && state !== 'FINAL_LAP' && state !== 'TUTORIAL') {
        this.silenceContinuousSFX();
      }
    }
  }

  silenceContinuousSFX() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    try {
      if (this.engineGain) this.engineGain.gain.setTargetAtTime(0.0, t, 0.05);
      if (this.engineGain2) this.engineGain2.gain.setTargetAtTime(0.0, t, 0.05);
      if (this.engineSubGain) this.engineSubGain.gain.setTargetAtTime(0.0, t, 0.05);
      if (this.boostGain) this.boostGain.gain.setTargetAtTime(0.0, t, 0.05);
      if (this.driftGain) this.driftGain.gain.setTargetAtTime(0.0, t, 0.05);
      if (this.windGain) this.windGain.gain.setTargetAtTime(0.0, t, 0.05);
    } catch {}
  }

  update(speedKmh, throttle, isBoosting, isDrifting, delta) {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const normSpeed = Math.min(speedKmh / 440.0, 1.25);
    const thr = Math.max(0, Math.min(1.0, throttle || 0));

    // 1. Modulate Engine Pitch & Volume
    const baseFreq = 68 + normSpeed * 310 + (thr * 95);
    if (this.engineOsc) this.engineOsc.frequency.setTargetAtTime(baseFreq, t, 0.04);
    if (this.engineGain) this.engineGain.gain.setTargetAtTime(0.07 + normSpeed * 0.14 + (thr * 0.06), t, 0.04);

    // Detuned second harmonic turbine blade frequency
    if (this.engineOsc2) this.engineOsc2.frequency.setTargetAtTime((baseFreq * 0.5) + normSpeed * 85 + 4.5, t, 0.04);

    // Deep Sub-Bass Mag-Lev rumble (rich visceral low end)
    if (this.engineSubOsc && this.engineSubGain) {
      const subFreq = 42 + normSpeed * 46 + (thr * 16);
      this.engineSubOsc.frequency.setTargetAtTime(subFreq, t, 0.05);
      this.engineSubGain.gain.setTargetAtTime(0.09 + normSpeed * 0.12 + (thr * 0.05), t, 0.05);
    }

    // Dynamic Filter Opening with Throttle & Boost (Throaty engine response)
    if (this.engineFilter) {
      const targetFilterFreq = 380 + (thr * 1900) + (normSpeed * 1200) + (isBoosting ? 1500 : 0);
      this.engineFilter.frequency.setTargetAtTime(targetFilterFreq, t, 0.05);
    }

    // 2. Hypersonic Aerodynamic Wind Sheer Modulation
    if (speedKmh > 160) {
      const windIntensity = Math.min(1.0, (speedKmh - 160) / 280.0);
      if (this.windGain) {
        this.windGain.gain.setTargetAtTime(windIntensity * 0.14, t, 0.08);
      }
      if (this.windFilter) {
        this.windFilter.frequency.setTargetAtTime(500 + windIntensity * 1600, t, 0.08);
      }
    } else {
      if (this.windGain) this.windGain.gain.setTargetAtTime(0.0, t, 0.1);
    }

    // 3. Modulate Hyper-Boost Plasma Sound
    if (isBoosting) {
      if (this.boostOsc) this.boostOsc.frequency.setTargetAtTime(1350 + Math.sin(t * 36.0) * 190, t, 0.03);
      if (this.boostGain) this.boostGain.gain.setTargetAtTime(0.26, t, 0.04);
    } else {
      if (this.boostGain) this.boostGain.gain.setTargetAtTime(0.0, t, 0.1);
    }

    // 4. Modulate Drift Screech
    if (isDrifting) {
      if (this.driftOsc) this.driftOsc.frequency.setTargetAtTime(980 + Math.random() * 260, t, 0.03);
      if (this.driftGain) this.driftGain.gain.setTargetAtTime(0.18, t, 0.04);
    } else {
      if (this.driftGain) this.driftGain.gain.setTargetAtTime(0.0, t, 0.08);
    }

    // 5. Procedural Sequencer Based on Music State
    this.seqTimer += delta;
    const stepDuration = 60.0 / (this.bpm * (this.musicState === 'LOBBY' ? 0.5 : 2.0));

    if (this.seqTimer >= stepDuration) {
      this.seqTimer -= stepDuration;
      this.triggerSequencerStep();
      this.seqStep = (this.seqStep + 1) % 8;
    }
  }

  triggerSequencerStep() {
    if (!this.ctx || this.isMuted) return;

    if (this.musicState === 'LOBBY') {
      // Only play procedural synth arpeggio if user explicitly selected PROCEDURAL_SYNTH
      if (this.currentLobbyTheme !== 'PROCEDURAL_SYNTH') return;

      // Ambient atmospheric arpeggio
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.lobbyChords[this.seqStep % this.lobbyChords.length] * 2, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(this.musicGain || this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.85);
    } else if (this.musicState === 'COUNTDOWN') {
      // Ascending tension arpeggio
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220 * Math.pow(2, this.seqStep / 12.0), this.ctx.currentTime);
      gain.gain.setValueAtTime(0.10, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.musicGain || this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } else if (this.musicState === 'RACING' || this.musicState === 'FINAL_LAP') {
      // 150-160 BPM Driving Techno Bassline
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      const freqs = this.musicState === 'FINAL_LAP' ? this.finalLapBass : this.bassFreqs;
      osc.frequency.setValueAtTime(freqs[this.seqStep], this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.musicState === 'FINAL_LAP' ? 440 : 320, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain || this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }
  }

  playStuntWhoosh() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.38);
  }

  playPerfectLanding() {
    if (!this.ctx || this.isMuted) return;
    [659.25, 880.0, 1318.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.05);
      osc.stop(this.ctx.currentTime + idx * 0.05 + 0.3);
    });
  }

  playNearMiss() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  playCountdownPip(isFinal = false) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    if (!isFinal) {
      // 3, 2, 1 Launch Gantry Holographic Pip (Dual Chime: E5 + E6 overtone)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, t);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.5, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.25);
      osc2.stop(t + 0.25);
    } else {
      // GO! - Massive Launch Explosion & Fanfare
      // 1. Sub-bass kinetic drop punch
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, t);
      subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.45);
      subGain.gain.setValueAtTime(0.45, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      subOsc.connect(subGain);
      subGain.connect(this.sfxGain || this.masterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.6);

      // 2. High-energy Green Light Synth Fanfare Chords (A5 major / 880Hz + 1760Hz)
      [880.0, 1108.73, 1318.5, 1760.0].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3500, t);
        filter.frequency.exponentialRampToValueAtTime(600, t + 0.45);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain || this.masterGain);
        osc.start(t);
        osc.stop(t + 0.52);
      });
    }
  }

  playCountdownBeep(isFinal) {
    this.playCountdownPip(isFinal);
  }

  playGearShiftSound(gear = 1) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    try {
      // 1. High-pressure pneumatic shift pop / blow-off valve hiss
      const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.022));
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600 + gear * 120, t);
      filter.Q.setValueAtTime(2.2, t);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain || this.masterGain);
      whiteNoise.start(t);
      whiteNoise.stop(t + 0.09);

      // 2. Heavy sequential dog-ring gear engagement clack
      const clackOsc = this.ctx.createOscillator();
      const clackGain = this.ctx.createGain();
      clackOsc.type = 'triangle';
      clackOsc.frequency.setValueAtTime(240 + gear * 35, t);
      clackOsc.frequency.exponentialRampToValueAtTime(50, t + 0.06);
      clackGain.gain.setValueAtTime(0.32, t);
      clackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      clackOsc.connect(clackGain);
      clackGain.connect(this.sfxGain || this.masterGain);
      clackOsc.start(t);
      clackOsc.stop(t + 0.08);
    } catch {}
  }

  playCollisionImpact(intensity) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const impactScale = Math.min(1.0, Math.max(0.15, intensity || 0.25));

    // 1. Sub-Bass Kinetic Thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.2);
    subGain.gain.setValueAtTime(0.38 * impactScale, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain || this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.24);

    // 2. Distorted Metallic Barrier Crunch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110 + Math.random() * 50, t);

    // WaveShaperNode distortion
    const dist = this.ctx.createWaveShaper();
    const curve = new Float32Array(400);
    for (let i = 0; i < 400; i++) {
      const x = (i * 2) / 400 - 1;
      curve[i] = (3 + 20) * x * 20 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x));
    }
    dist.curve = curve;

    gain.gain.setValueAtTime(0.25 * impactScale, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(dist);
    dist.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playVictorySting() {
    if (!this.ctx || this.isMuted) return;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.55);
    });
  }

  playBoostPadSound() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // 1. Resonant Upward Laser Sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(1850, t + 0.28);
    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start(t);
    osc.stop(t + 0.35);

    // 2. Plasma Burst Sub Punch
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.25);
    subGain.gain.setValueAtTime(0.28, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain || this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.28);
  }

  playLapChime() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    
    // Chord
    [523.25, 659.25, 784.0].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(freq + (Math.random() * 4 - 2), t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);
      osc.start(t);
      osc.stop(t + 0.45);
    });

    // Delayed higher note
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.frequency.setValueAtTime(1046.5, t + 0.15);
    gain2.gain.setValueAtTime(0.2, t + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15 + 0.25);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain || this.masterGain);
    osc2.start(t + 0.15);
    osc2.stop(t + 0.45);
  }

  playMenuClick() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  playUIHover() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  }

  playRaceFound() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);
      gain.gain.setValueAtTime(0.16, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.3);
    });
  }

  playConfirmation() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    [880.0, 1320.0].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);
      gain.gain.setValueAtTime(0.12, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.16);
    });
  }

  playRewardRoll() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1100 + Math.random() * 200, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.025);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playMenuTransition() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playCameraSwitchSound() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playAirbrakeSound() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(95, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  playOverdriveBurstSound() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(140, t);
    osc1.frequency.exponentialRampToValueAtTime(32, t + 0.5);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(1800, t);
    osc2.frequency.exponentialRampToValueAtTime(180, t + 0.38);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.45);

    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc1.connect(gain);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.58);
    osc2.stop(t + 0.58);
  }

  playCheckpointChime() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    [880.0, 1320.0].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.2, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.2);
    });
  }
}
