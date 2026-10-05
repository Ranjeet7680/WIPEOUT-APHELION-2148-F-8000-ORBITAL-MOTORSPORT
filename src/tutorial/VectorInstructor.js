import { saveManager } from '../game/SaveManager.js';

// ============================================================================
// VECTOR: HOLOGRAPHIC CYBERNETIC AI INSTRUCTOR
// Abstract geometric face avatar with animated gyro rings and waveform visualizer,
// Web Speech API synthetic neural voice + procedural synth chimes, and subtitles
// ============================================================================

export class VectorInstructor {
  constructor(audioEngine) {
    this.audio = audioEngine;
    this.container = null;
    this.avatarCanvas = null;
    this.dialogueText = null;
    this.subtitleContainer = null;
    this.subtitleText = null;

    this.speechSynth = typeof window !== 'undefined' && ('speechSynthesis' in window) ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.animFrameId = null;
    this.isSpeaking = false;
    this.glowIntensity = 1.0;

    this.buildDOM();
    this.initAvatarRenderer();
  }

  buildDOM() {
    // 1. Vector Hologram Widget (HUD Avatar)
    this.container = document.createElement('div');
    this.container.id = 'vector-hologram-widget';
    this.container.className = 'vector-widget';
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <div class="vector-frame">
        <div class="vector-hud-header">
          <span class="vector-status-dot"></span>
          <span class="vector-name">AI // VECTOR</span>
          <span class="vector-ver">V2.89</span>
        </div>
        <div class="vector-avatar-viewport">
          <canvas id="vector-avatar-canvas" width="120" height="120"></canvas>
          <div class="vector-scan-overlay"></div>
        </div>
        <div class="vector-message-box">
          <span class="vector-msg-tag">TRANSMISSION:</span>
          <div id="vector-dialogue-content" class="vector-msg-body">STANDBY...</div>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);

    this.avatarCanvas = document.getElementById('vector-avatar-canvas');
    this.dialogueText = document.getElementById('vector-dialogue-content');

    // 2. Cinematic Subtitle Banner
    this.subtitleContainer = document.createElement('div');
    this.subtitleContainer.id = 'cinematic-subtitles';
    this.subtitleContainer.className = 'cinematic-subtitles';
    this.subtitleContainer.style.display = 'none';
    this.subtitleContainer.innerHTML = `
      <div class="subtitle-box">
        <span class="sub-speaker">VECTOR // INSTRUCTOR:</span>
        <p id="subtitle-line-content" class="sub-line"></p>
      </div>
    `;
    document.body.appendChild(this.subtitleContainer);

    this.subtitleText = document.getElementById('subtitle-line-content');
  }

  initAvatarRenderer() {
    if (!this.avatarCanvas) return;
    const ctx = this.avatarCanvas.getContext('2d');
    let angle = 0;

    const render = () => {
      if (!this.container || this.container.style.display === 'none') {
        this.animFrameId = requestAnimationFrame(render);
        return;
      }

      angle += 0.04;
      const w = this.avatarCanvas.width;
      const h = this.avatarCanvas.height;
      const cx = w * 0.5;
      const cy = h * 0.5;

      ctx.clearRect(0, 0, w, h);

      // Radial background aura
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 55);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      // Outer Rotating Concentric Gyro Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.5);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([12, 8, 4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Mid Counter-Rotating Ring with Segment Ticks
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 0.8);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([20, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Central Abstract Geometric AI Core (Diamond / Hexagon that pulses with speech)
      const pulse = this.isSpeaking ? Math.sin(angle * 6.0) * 4.0 : Math.sin(angle * 1.5) * 1.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = this.isSpeaking ? '#00FF88' : '#00F0FF';
      ctx.fillStyle = this.isSpeaking ? 'rgba(0, 255, 136, 0.25)' : 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 2.2;

      ctx.beginPath();
      const coreSize = 18 + pulse;
      ctx.moveTo(0, -coreSize);
      ctx.lineTo(coreSize * 0.86, -coreSize * 0.5);
      ctx.lineTo(coreSize * 0.86, coreSize * 0.5);
      ctx.lineTo(0, coreSize);
      ctx.lineTo(-coreSize * 0.86, coreSize * 0.5);
      ctx.lineTo(-coreSize * 0.86, -coreSize * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Eye / Iris
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5 + (this.isSpeaking ? 1.5 : 0), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Audio Equalizer Waveform bars along bottom
      const bars = 7;
      const barWidth = 4;
      const barSpacing = 4;
      const startX = cx - (bars * (barWidth + barSpacing) * 0.5);
      for (let i = 0; i < bars; i++) {
        const barH = this.isSpeaking
          ? 4 + Math.abs(Math.sin(angle * 8 + i * 1.4)) * 14
          : 2 + Math.abs(Math.sin(angle * 2 + i * 0.8)) * 4;
        ctx.fillStyle = this.isSpeaking ? '#00FF88' : '#00F0FF';
        ctx.fillRect(startX + i * (barWidth + barSpacing), cy + 42 - barH, barWidth, barH);
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  show() {
    const settings = saveManager.getSettings();
    if (settings.vectorEnabled && this.container) {
      this.container.style.display = 'block';
    }
  }

  hide() {
    if (this.container) this.container.style.display = 'none';
    if (this.subtitleContainer) this.subtitleContainer.style.display = 'none';
    this.stopSpeaking();
  }

  speak(text, subtitle = null, durationMs = 3500, onDone = null) {
    const settings = saveManager.getSettings();
    const subText = subtitle || text;

    // 1. Show UI Widget & Subtitles
    if (settings.vectorEnabled && this.container) {
      this.container.style.display = 'block';
      if (this.dialogueText) {
        this.dialogueText.textContent = text;
      }
    }

    if (settings.subtitleEnabled && this.subtitleContainer && this.subtitleText) {
      this.subtitleText.textContent = `"${subText}"`;
      this.subtitleContainer.style.display = 'flex';
    }

    // 2. Play Audio Chime
    if (this.audio) {
      this.audio.playCountdownPip(false);
    }

    // 3. Web Speech API Voice Synthesis
    this.stopSpeaking();
    this.isSpeaking = true;

    if (settings.voiceEnabled && this.speechSynth) {
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.08;
        utter.pitch = 0.92;
        utter.volume = 0.85;

        // Try to pick English voice
        const voices = this.speechSynth.getVoices();
        const techVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft') || v.name.includes('Samantha')));
        if (techVoice) {
          utter.voice = techVoice;
        }

        utter.onend = () => {
          this.isSpeaking = false;
        };
        utter.onerror = () => {
          this.isSpeaking = false;
        };

        this.speechSynth.speak(utter);
        this.currentUtterance = utter;
      } catch (e) {
        this.isSpeaking = false;
      }
    }

    // Auto-hide subtitle after duration
    clearTimeout(this.subtitleTimeout);
    this.subtitleTimeout = setTimeout(() => {
      this.isSpeaking = false;
      if (this.subtitleContainer) {
        this.subtitleContainer.style.display = 'none';
      }
      if (onDone) onDone();
    }, durationMs);
  }

  stopSpeaking() {
    this.isSpeaking = false;
    if (this.speechSynth && this.speechSynth.speaking) {
      try {
        this.speechSynth.cancel();
      } catch (e) {}
    }
  }
}
