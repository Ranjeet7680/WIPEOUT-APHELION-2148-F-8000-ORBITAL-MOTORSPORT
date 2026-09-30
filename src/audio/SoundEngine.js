// ============================================================================
// WIPEOUT: APHELION - DYNAMIC AUDIO ENGINE & NEURO-TECHNO SYNTHESIZER
// Pure Web Audio API: 150 BPM Procedural Neuro-Techno + 6-DOF MHD Engine Synth
// ============================================================================

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.isMuted = false;
    this.musicVolume = 0.55;
    this.sfxVolume = 0.85;

    // Master bus
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicFilter = null; // Used for Tier 3 shield critical low-pass muffle

    // MHD Engine nodes
    this.engineCarrier = null;
    this.engineModulator = null;
    this.engineModGain = null;
    this.engineSub = null;
    this.engineSubGain = null;
    this.engineWhine = null;
    this.engineWhineGain = null;
    this.engineGain = null;
    this.engineDistortion = null;

    // Airbrake noise nodes
    this.airbrakeNoise = null;
    this.airbrakeFilter = null;
    this.airbrakeGain = null;

    // Biometric heartbeat & alarms
    this.heartbeatOsc = null;
    this.heartbeatGain = null;
    this.alarmGain = null;

    // Music Sequencer State
    this.tempo = 150;
    this.currentStep = 0;
    this.nextNoteTime = 0;
    this.musicTier = 1; // 1: Cruising, 2: Pack Racing / High Speed, 3: Shield Critical
    this.timerId = null;

    // Noise buffer cache
    this.noiseBuffer = null;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output setup
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Bus with Tier 3 Dynamic Low-Pass Filter
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
      this.musicFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.musicFilter);
      this.musicFilter.connect(this.masterGain);

      // Generate White Noise Buffer
      this.createNoiseBuffer();

      // Setup MHD Engine Synth
      this.setupEngineSynth();

      // Setup Airbrake Noise
      this.setupAirbrakeNoise();

      // Start Procedural Neuro-Techno Sequencer
      this.startMusicSequencer();

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio initialization deferred until user interaction.", e);
    }
  }

  resume() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  // --------------------------------------------------------------------------
  // MHD ENGINE SYNTHESIS (Twin FM Oscillators + Granular Resonance)
  // Low speed: 40-65 Hz sub-bass hum
  // High speed: 3-8 kHz screaming turbine whine
  // --------------------------------------------------------------------------
  setupEngineSynth() {
    const t = this.ctx.currentTime;

    // Carrier
    this.engineCarrier = this.ctx.createOscillator();
    this.engineCarrier.type = 'sawtooth';
    this.engineCarrier.frequency.setValueAtTime(55, t);

    // Modulator for FM synthesis
    this.engineModulator = this.ctx.createOscillator();
    this.engineModulator.type = 'sine';
    this.engineModulator.frequency.setValueAtTime(110, t);

    this.engineModGain = this.ctx.createGain();
    this.engineModGain.gain.setValueAtTime(40, t);
    this.engineModulator.connect(this.engineModGain);
    this.engineModGain.connect(this.engineCarrier.frequency);

    // Deep Sub-Bass Oscillator (40-65Hz)
    this.engineSub = this.ctx.createOscillator();
    this.engineSub.type = 'triangle';
    this.engineSub.frequency.setValueAtTime(45, t);
    this.engineSubGain = this.ctx.createGain();
    this.engineSubGain.gain.setValueAtTime(0.4, t);
    this.engineSub.connect(this.engineSubGain);

    // Turbine High Screaming Resonance (3-8 kHz)
    this.engineWhine = this.ctx.createOscillator();
    this.engineWhine.type = 'sine';
    this.engineWhine.frequency.setValueAtTime(1200, t);
    this.engineWhineGain = this.ctx.createGain();
    this.engineWhineGain.gain.setValueAtTime(0.05, t);
    this.engineWhine.connect(this.engineWhineGain);

    // High-frequency Slipstream Drafting Whistle (4.2 kHz resonant sweep)
    this.draftingWhistle = this.ctx.createOscillator();
    this.draftingWhistle.type = 'sine';
    this.draftingWhistle.frequency.setValueAtTime(4200, t);
    this.draftingWhistleGain = this.ctx.createGain();
    this.draftingWhistleGain.gain.setValueAtTime(0.0, t);
    this.draftingWhistle.connect(this.draftingWhistleGain);
    this.draftingWhistleGain.connect(this.sfxGain);
    this.draftingWhistle.start();

    // Waveshaper for subtle non-linear electromagnetic saturation
    this.engineDistortion = this.ctx.createWaveShaper();
    this.engineDistortion.curve = this.makeDistortionCurve(15);
    this.engineDistortion.oversample = '2x';

    // Master Engine Bus
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.3, t);

    this.engineCarrier.connect(this.engineDistortion);
    this.engineSubGain.connect(this.engineDistortion);
    this.engineWhineGain.connect(this.engineGain);
    this.engineDistortion.connect(this.engineGain);

    this.engineGain.connect(this.sfxGain);

    this.engineCarrier.start();
    this.engineModulator.start();
    this.engineSub.start();
    this.engineWhine.start();
  }

  makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 20;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  setupAirbrakeNoise() {
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;

    this.airbrakeFilter = this.ctx.createBiquadFilter();
    this.airbrakeFilter.type = 'bandpass';
    this.airbrakeFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.airbrakeFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.airbrakeGain = this.ctx.createGain();
    this.airbrakeGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    noiseSource.connect(this.airbrakeFilter);
    this.airbrakeFilter.connect(this.airbrakeGain);
    this.airbrakeGain.connect(this.sfxGain);

    noiseSource.start();
  }

  // --------------------------------------------------------------------------
  // DYNAMIC AUDIO PARAMETERS UPDATE (Called every frame from game loop)
  // --------------------------------------------------------------------------
  update(speedKmh, throttle, airbrakeAmount, shieldPercent, isBoosting, isDrafting = false) {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Speed normalized 0..1 (top speed ~1,600 km/h)
    const normSpeed = Math.min(Math.max(speedKmh / 1400, 0), 1.4);

    // 1. MHD Engine modulation
    const carrierFreq = 48 + normSpeed * 180 + throttle * 40;
    const modFreq = 96 + normSpeed * 400;
    const modDepth = 30 + normSpeed * 140 + (isBoosting ? 80 : 0);
    const subFreq = 38 + normSpeed * 32;
    const whineFreq = 800 + Math.pow(normSpeed, 1.8) * 6500;
    const whineVol = 0.02 + Math.pow(normSpeed, 2.2) * 0.28 + (isBoosting ? 0.15 : 0);

    this.engineCarrier.frequency.setTargetAtTime(carrierFreq, t, 0.05);
    this.engineModulator.frequency.setTargetAtTime(modFreq, t, 0.05);
    this.engineModGain.gain.setTargetAtTime(modDepth, t, 0.05);
    this.engineSub.frequency.setTargetAtTime(subFreq, t, 0.05);
    this.engineWhine.frequency.setTargetAtTime(whineFreq, t, 0.08);
    this.engineWhineGain.gain.setTargetAtTime(whineVol, t, 0.06);

    // High-frequency Slipstream Drafting Whistle
    if (this.draftingWhistleGain) {
      const whistleVol = isDrafting ? 0.35 : 0.0;
      this.draftingWhistleGain.gain.setTargetAtTime(whistleVol, t, 0.05);
    }

    const targetEngineVol = 0.15 + (throttle * 0.22) + (normSpeed * 0.35) + (isBoosting ? 0.3 : 0);
    this.engineGain.gain.setTargetAtTime(targetEngineVol, t, 0.05);

    // 2. Airbrake Pneumatic Drag Hiss
    if (this.airbrakeGain) {
      const airbrakeVol = Math.min(airbrakeAmount * (0.1 + normSpeed * 0.45), 0.55);
      const airbrakeFreq = 900 + normSpeed * 1600;
      this.airbrakeGain.gain.setTargetAtTime(airbrakeVol, t, 0.04);
      this.airbrakeFilter.frequency.setTargetAtTime(airbrakeFreq, t, 0.04);
    }

    // 3. Music Tier Logic:
    // Tier 1: Cruising (speed < 700)
    // Tier 2: Pack Racing / High Speed / Boosting (speed >= 700 or boosting)
    // Tier 3: Critical Shields (< 20%) -> 800Hz lowpass filter + biometric alarm
    if (shieldPercent < 0.2) {
      this.setMusicTier(3);
    } else if (normSpeed > 0.5 || isBoosting) {
      this.setMusicTier(2);
    } else {
      this.setMusicTier(1);
    }

    // Shield Critical Low-Pass Filter
    if (this.musicFilter) {
      const cutoff = shieldPercent < 0.2 ? 650 : 20000;
      this.musicFilter.frequency.setTargetAtTime(cutoff, t, 0.15);
    }
  }

  setMusicTier(tier) {
    if (this.musicTier === tier) return;
    this.musicTier = tier;
    if (tier === 3) {
      this.triggerHeartbeat();
    }
  }

  // --------------------------------------------------------------------------
  // ONE-SHOT SOUND EFFECTS
  // --------------------------------------------------------------------------
  playSonicBoom() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Deep sub-impact drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(24, t + 0.6);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.8);

    // Stereo crack
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.35);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.4);
  }

  playBoostPadSound() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.28);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(2800, t + 0.3);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playWallScrape(intensity = 0.5) {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(Math.min(intensity * 0.4, 0.4), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.18);
  }

  playLapChime() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [587.33, 880, 1174.66]; // D5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.4, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.45);
    });
  }

  triggerHeartbeat() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;
    // Lub-dub pulse
    const playPulse = (delay, freq, vol) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      osc.frequency.exponentialRampToValueAtTime(35, t + delay + 0.12);

      gain.gain.setValueAtTime(vol, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.16);
    };

    playPulse(0.0, 70, 0.6);
    playPulse(0.18, 55, 0.4);
  }

  // --------------------------------------------------------------------------
  // CORE 5 DIFFERENTIATING MECHANICS SOUND SYNTHESIS
  // --------------------------------------------------------------------------

  // 1. Friction Capacitor Tungsten-Copper Induction Whine
  playInductionGrind(intensity = 0.7) {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400 + Math.random() * 300, t);
    osc.frequency.exponentialRampToValueAtTime(3200, t + 0.12);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.setValueAtTime(8.0, t);

    gain.gain.setValueAtTime(Math.min(intensity * 0.35, 0.35), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 2. Thermal Burnout Boost Catapult
  playBurnoutBoost() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Supersonic expansion whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(85, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.18);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.6);

    gain.gain.setValueAtTime(0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.7);

    // Crackle noise burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.4);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.45);
  }

  // 3. Radial EMP Shockwave Pulse
  playEMPPulse() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Sub-bass electromagnetic implosion
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.4);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.6);

    // Static discharge sizzle
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, t);
    filter.frequency.linearRampToValueAtTime(1000, t + 0.35);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.4);
  }

  // 4. Kinetic Railgun Bolt Hypersonic Shot
  playRailgunFire() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    // High energy slug crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2600, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.15);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(5.0, t);

    gain.gain.setValueAtTime(0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 5. Vacuum Rift Re-Anchor Gate (Smooth Lock vs Violent Hull Bounce)
  playReAnchorLatch(success = true) {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    if (success) {
      // Clean magnetic rail clamping chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.15);

      gain.gain.setValueAtTime(0.55, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.38);
    } else {
      // Violent structural crunch & spark recoil
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.45);

      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.52);

      this.playWallScrape(1.0);
    }
  }

  // 6. Kinetic Component Jettison Explosive Squibs
  playJettisonExplosion() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Detonation squib
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.32);

    // Metal separation hiss
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  // 7. Cobra Air-Anchor Engagement (16-surface air deployment thump)
  playCobraEngage() {
    if (!this.initialized || !this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.22);

    gain.gain.setValueAtTime(0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  // --------------------------------------------------------------------------
  // PROCEDURAL NEURO-TECHNO / BREAKBEAT MUSIC SEQUENCER (150 BPM)
  // --------------------------------------------------------------------------
  startMusicSequencer() {
    const lookahead = 25.0; // ms
    const scheduleAheadTime = 0.1; // seconds

    this.nextNoteTime = this.ctx.currentTime + 0.1;

    const scheduler = () => {
      while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
        this.scheduleStep(this.currentStep, this.nextNoteTime);
        this.advanceStep();
      }
      this.timerId = setTimeout(scheduler, lookahead);
    };

    scheduler();
  }

  advanceStep() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note steps
    this.currentStep = (this.currentStep + 1) % 16;
  }

  scheduleStep(step, time) {
    if (this.isMuted) return;

    // 1. Kick Drum: 4-on-the-floor driving industrial kick (steps 0, 4, 8, 12)
    if (step % 4 === 0) {
      this.synthesizeKick(time);
    }

    // 2. Snare / Clang: steps 4 and 12, plus syncopated breakbeat hits on 7, 10, 15 in Tier 2
    if (step === 4 || step === 12) {
      this.synthesizeSnare(time, 0.5);
    } else if (this.musicTier >= 2 && (step === 7 || step === 10 || step === 15)) {
      this.synthesizeSnare(time, 0.25);
    }

    // 3. Hi-Hat & Percussion
    if (step % 2 === 0) {
      this.synthesizeHat(time, step % 4 === 2 ? 0.35 : 0.18, step % 4 === 2);
    } else if (this.musicTier >= 2) {
      this.synthesizeHat(time, 0.12, false);
    }

    // 4. Acid 303 Bassline (D Minor / Phrygian cyberpunk scale: D, Eb, F, G, A, Bb, C)
    const acidPattern = [
      73.42, 0, 73.42, 77.78,   // D2, -, D2, Eb2
      0, 73.42, 87.31, 0,       // -, D2, F2, -
      98.00, 73.42, 0, 110.00,  // G2, D2, -, A2
      77.78, 0, 87.31, 73.42    // Eb2, -, F2, D2
    ];

    const noteFreq = acidPattern[step];
    if (noteFreq > 0) {
      this.synthesizeAcidBass(time, noteFreq, step);
    }

    // 5. Tier 2 Synth Arp: Futuristic Neuro-Arpeggio
    if (this.musicTier >= 2 && step % 2 === 1) {
      const arpNotes = [293.66, 311.13, 349.23, 440.0, 587.33, 622.25]; // D4, Eb4, F4, A4, D5, Eb5
      const note = arpNotes[(step * 3) % arpNotes.length];
      this.synthesizeLeadArp(time, note);
    }
  }

  synthesizeKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.09);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.24);
  }

  synthesizeSnare(time, vol = 0.4) {
    // Noise snap
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    noise.start(time);
    noise.stop(time + 0.2);

    // Body tone
    const osc = this.ctx.createOscillator();
    const toneGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    toneGain.gain.setValueAtTime(vol * 0.6, time);
    toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(toneGain);
    toneGain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  synthesizeHat(time, vol = 0.2, open = false) {
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    const decay = open ? 0.22 : 0.05;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    noise.start(time);
    noise.stop(time + decay + 0.02);
  }

  synthesizeAcidBass(time, freq, step) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(9.0, time); // Acid resonance

    // Modulate filter cutoff dynamically
    const baseCutoff = this.musicTier >= 2 ? 800 : 500;
    const peakCutoff = (step % 4 === 0 || step === 10) ? 3400 : 1800;
    filter.frequency.setValueAtTime(baseCutoff, time);
    filter.frequency.exponentialRampToValueAtTime(peakCutoff, time + 0.03);
    filter.frequency.exponentialRampToValueAtTime(baseCutoff, time + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.22);
  }

  synthesizeLeadArp(time, freq) {
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.Q.setValueAtTime(3.0, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}
