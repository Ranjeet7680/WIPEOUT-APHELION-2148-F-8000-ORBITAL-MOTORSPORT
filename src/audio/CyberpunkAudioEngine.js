// ============================================================================
// CYBERPUNK AUDIO ENGINE: SYNTHESIZED 2089 SOUNDSCAPE
// Web Audio FM Propulsion Engine, Hyper-Boost Plasma Whine, Drift Screech & Cyber-Beats
// ============================================================================

export class CyberpunkAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;

    // Audio Nodes
    this.masterGain = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.boostOsc = null;
    this.boostGain = null;
    this.driftOsc = null;
    this.driftGain = null;

    // Music Sequencer State
    this.seqStep = 0;
    this.seqTimer = 0;
    this.bpm = 150;
    this.bassFreqs = [55, 55, 65, 55, 73, 55, 82, 65]; // Cyber-bassline in A minor
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Electric Propulsion Engine (FM Sawtooth + Modulator)
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(80, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      const engineFilter = this.ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.engineOsc.connect(engineFilter);
      engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);
      this.engineOsc.start();

      // 2. Hyper-Boost Plasma Whine (High Sine Wave)
      this.boostOsc = this.ctx.createOscillator();
      this.boostOsc.type = 'sine';
      this.boostOsc.frequency.setValueAtTime(600, this.ctx.currentTime);

      this.boostGain = this.ctx.createGain();
      this.boostGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.boostOsc.connect(this.boostGain);
      this.boostGain.connect(this.masterGain);
      this.boostOsc.start();

      // 3. Drift Friction Screech (White Noise / High Resonance)
      this.driftOsc = this.ctx.createOscillator();
      this.driftOsc.type = 'triangle';
      this.driftOsc.frequency.setValueAtTime(1200, this.ctx.currentTime);

      this.driftGain = this.ctx.createGain();
      this.driftGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.driftOsc.connect(this.driftGain);
      this.driftGain.connect(this.masterGain);
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
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.5, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  update(speedKmh, throttle, isBoosting, isDrifting, delta) {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const normSpeed = Math.min(speedKmh / 420.0, 1.2);

    // 1. Modulate Engine Pitch & Volume
    const baseFreq = 75 + normSpeed * 280 + (throttle * 80);
    this.engineOsc.frequency.setTargetAtTime(baseFreq, t, 0.05);
    this.engineGain.gain.setTargetAtTime(0.06 + normSpeed * 0.12, t, 0.05);

    // 2. Modulate Hyper-Boost Plasma Sound
    if (isBoosting) {
      this.boostOsc.frequency.setTargetAtTime(1200 + Math.sin(t * 30.0) * 150, t, 0.04);
      this.boostGain.gain.setTargetAtTime(0.22, t, 0.05);
    } else {
      this.boostGain.gain.setTargetAtTime(0.0, t, 0.1);
    }

    // 3. Modulate Drift Screech
    if (isDrifting) {
      this.driftOsc.frequency.setTargetAtTime(950 + Math.random() * 200, t, 0.03);
      this.driftGain.gain.setTargetAtTime(0.15, t, 0.05);
    } else {
      this.driftGain.gain.setTargetAtTime(0.0, t, 0.08);
    }

    // 4. Procedural 150 BPM Cyberpunk Synth Bassline
    this.seqTimer += delta;
    const stepDuration = 60.0 / (this.bpm * 2.0); // 16th notes
    if (this.seqTimer >= stepDuration) {
      this.seqTimer -= stepDuration;
      this.triggerBassStep();
      this.seqStep = (this.seqStep + 1) % this.bassFreqs.length;
    }
  }

  triggerBassStep() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const freq = this.bassFreqs[this.seqStep];
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
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
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.32);
  }

  playLapChime() {
    if (!this.ctx || this.isMuted) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + i * 0.06);
      osc.stop(this.ctx.currentTime + i * 0.06 + 0.35);
    });
  }
}
