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
    this.boostOsc = null;
    this.boostGain = null;
    this.driftOsc = null;
    this.driftGain = null;
    this.windOsc = null;
    this.windGain = null;

    // Music State
    this.musicState = 'LOBBY'; // 'LOBBY', 'INTRO', 'COUNTDOWN', 'RACING', 'FINAL_LAP', 'PODIUM'
    this.seqStep = 0;
    this.seqTimer = 0;
    this.bpm = 150;

    // Musical Scales
    this.bassFreqs = [55, 55, 65, 55, 73, 55, 82, 65]; // A minor driving bass
    this.finalLapBass = [65, 65, 82, 65, 98, 82, 110, 82]; // High octave tension
    this.lobbyChords = [110, 130.81, 164.81, 196.00]; // Ambient synth pad
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
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

      // 1. Electric Propulsion Engine (FM Sawtooth + Modulator)
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(80, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'square';
      this.engineOsc2.frequency.setValueAtTime(40, this.ctx.currentTime);

      this.engineGain2 = this.ctx.createGain();
      this.engineGain2.gain.setValueAtTime(0.04, this.ctx.currentTime);

      const engineFilter = this.ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.engineOsc.connect(engineFilter);
      this.engineOsc2.connect(this.engineGain2);
      this.engineGain2.connect(engineFilter);
      engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.sfxGain);
      this.engineOsc.start();
      this.engineOsc2.start();

      // Wind sound
      this.windOsc = this.ctx.createOscillator();
      this.windOsc.type = 'sawtooth';
      
      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(300, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.windOsc.connect(windFilter);
      windFilter.connect(this.windGain);
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
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.5, this.ctx.currentTime);
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
  }

  setMusicState(state) {
    this.musicState = state;
    if (state === 'FINAL_LAP') {
      this.bpm = 160;
    } else {
      this.bpm = 150;
    }
  }

  update(speedKmh, throttle, isBoosting, isDrifting, delta) {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const normSpeed = Math.min(speedKmh / 420.0, 1.2);

    // 1. Modulate Engine Pitch & Volume
    const baseFreq = 75 + normSpeed * 280 + (throttle * 80);
    this.engineOsc.frequency.setTargetAtTime(baseFreq, t, 0.05);
    this.engineGain.gain.setTargetAtTime(0.06 + normSpeed * 0.12, t, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 0.5 + normSpeed * 80, t, 0.05);

    // Wind Sound Modulation
    if (speedKmh > 280) {
      this.windGain.gain.setTargetAtTime(Math.max(0, (normSpeed - 0.65) * 0.08), t, 0.1);
    } else {
      this.windGain.gain.setTargetAtTime(0.0, t, 0.1);
    }

    // 2. Modulate Hyper-Boost Plasma Sound
    if (isBoosting) {
      this.boostOsc.frequency.setTargetAtTime(1250 + Math.sin(t * 30.0) * 160, t, 0.04);
      this.boostGain.gain.setTargetAtTime(0.24, t, 0.05);
    } else {
      this.boostGain.gain.setTargetAtTime(0.0, t, 0.1);
    }

    // 3. Modulate Drift Screech
    if (isDrifting) {
      this.driftOsc.frequency.setTargetAtTime(950 + Math.random() * 200, t, 0.03);
      this.driftGain.gain.setTargetAtTime(0.16, t, 0.05);
    } else {
      this.driftGain.gain.setTargetAtTime(0.0, t, 0.08);
    }

    // 4. Procedural Sequencer Based on Music State
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
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freq = isFinal ? 880 : 440;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (isFinal ? 0.45 : 0.2));
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + (isFinal ? 0.5 : 0.22));
  }

  playCountdownBeep(isFinal) {
    this.playCountdownPip(isFinal);
  }

  playCollisionImpact(intensity) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80 + Math.random() * 40, this.ctx.currentTime);
    
    // WaveShaperNode distortion
    const dist = this.ctx.createWaveShaper();
    const curve = new Float32Array(400);
    for (let i = 0; i < 400; i++) {
      const x = (i * 2) / 400 - 1;
      curve[i] = (3 + 20) * x * 20 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x));
    }
    dist.curve = curve;

    const safeGain = Math.max(0.001, 0.15 * Math.min(1, Math.max(0.01, intensity || 0.1)));
    gain.gain.setValueAtTime(safeGain, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(dist);
    dist.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
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
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.32);
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
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.45);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(1600, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.38, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain || this.masterGain);
    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.52);
    osc2.stop(this.ctx.currentTime + 0.52);
  }
}
