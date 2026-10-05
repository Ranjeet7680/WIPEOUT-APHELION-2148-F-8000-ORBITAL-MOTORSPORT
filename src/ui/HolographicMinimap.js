import * as THREE from 'three';

const _minimapFwd = new THREE.Vector3();

// ============================================================================
// HOLOGRAPHIC MINIMAP RADAR: [ AETHER-9 // NAV ]
// Real-time 2D Canvas radar tracking player heading, rivals, checkpoints & boosts
// ============================================================================

export class HolographicMinimap {
  constructor(canvasId = 'hud-minimap-canvas', circuit = null) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.circuit = circuit;

    this.scale = 0.12; // Radar zoom factor (~700m radar range)
    this.sweepAngle = 0.0;
    this.pulsePhase = 0.0;

    this.getCanvas();
  }

  getCanvas() {
    if (typeof document === 'undefined') return null;
    const el = document.getElementById(this.canvasId);
    if (el) {
      if (el !== this.canvas || !this.ctx) {
        this.canvas = el;
        // Ensure proper internal pixel resolution
        if (this.canvas.width < 180) this.canvas.width = 180;
        if (this.canvas.height < 180) this.canvas.height = 180;
        try {
          this.ctx = this.canvas.getContext('2d', { alpha: true });
        } catch {
          this.ctx = null;
        }
      }
    }
    return this.canvas;
  }

  setCircuit(circuit) {
    this.circuit = circuit;
  }

  update(playerPos, playerQuat, playerU, rivals = [], currentDistrict = null) {
    try {
      // Dynamic fallback acquisition
      if (!this.canvas || !this.ctx || !this.canvas.isConnected) {
        this.getCanvas();
      }
      if (!this.ctx || !this.canvas) return;

      if ((!this.circuit || !this.circuit.samples || this.circuit.samples.length === 0) && typeof window !== 'undefined' && window.game && window.game.circuit) {
        this.circuit = window.game.circuit;
      }
      if (!this.circuit || !this.circuit.samples || this.circuit.samples.length === 0) return;
      if (!playerPos || !playerQuat) return;

    const ctx = this.ctx;
    const w = this.canvas.width || 180;
    const h = this.canvas.height || 180;
    if (w <= 0 || h <= 0) return;

    const cx = w * 0.5;
    const cy = h * 0.5;
    const radarRadius = w * 0.46;

    this.sweepAngle = (this.sweepAngle + 0.05) % (Math.PI * 2);
    this.pulsePhase = (this.pulsePhase + 0.08) % (Math.PI * 2);

    // 1. Clear background
    ctx.clearRect(0, 0, w, h);

    // Dark sleek tactical radar base
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
    const bgGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radarRadius);
    bgGrad.addColorStop(0, 'rgba(10, 22, 42, 0.96)');
    bgGrad.addColorStop(0.7, 'rgba(6, 14, 28, 0.94)');
    bgGrad.addColorStop(1, 'rgba(0, 240, 255, 0.40)');
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Concentric tactical range rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius * 0.66, 0, Math.PI * 2);
    ctx.arc(cx, cy, radarRadius * 0.33, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crosshairs
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - radarRadius + 4); ctx.lineTo(cx, cy + radarRadius - 4);
    ctx.moveTo(cx - radarRadius + 4, cy); ctx.lineTo(cx + radarRadius - 4, cy);
    ctx.stroke();

    // Animated radar sweep cone (safely handled across all browsers)
    try {
      if (ctx.createConicGradient) {
        const sweepGrad = ctx.createConicGradient(this.sweepAngle, cx, cy);
        if (sweepGrad) {
          sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
          sweepGrad.addColorStop(0.12, 'rgba(0, 240, 255, 0.0)');
          sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
          ctx.fillStyle = sweepGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, radarRadius - 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } catch (e) {
      // Conic gradient not supported in environment; graceful fallback
    }

    // Clip all track geometry inside radar disc
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius - 2, 0, Math.PI * 2);
    ctx.clip();

    // Extract player forward vector and right vector in horizontal XZ plane
    _minimapFwd.set(0, 0, 1).applyQuaternion(playerQuat);
    const fLen = Math.hypot(_minimapFwd.x, _minimapFwd.z) || 1.0;
    const fx = _minimapFwd.x / fLen;
    const fz = _minimapFwd.z / fLen;
    // Right vector in horizontal plane: (-fz, fx)
    const rx = -fz;
    const rz = fx;

    const toScreen = (worldX, worldZ) => {
      const dx = worldX - playerPos.x;
      const dz = worldZ - playerPos.z;
      // Local lateral (right) and local longitudinal (forward)
      const lx = dx * rx + dz * rz;
      const ly = dx * fx + dz * fz;
      return {
        x: cx + lx * this.scale,
        y: cy - ly * this.scale // minus so forward (+ly) maps UP on canvas
      };
    };

    // 2. Draw entire circuit spline (faint blueprint outline)
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.35)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    const sampleStep = 4;
    for (let i = 0; i < this.circuit.samples.length; i += sampleStep) {
      const frame = this.circuit.samples[i];
      if (!frame || !frame.pos) continue;
      const pt = toScreen(frame.pos.x, frame.pos.z);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.stroke();

    // 3. Draw nearby upcoming track segment (vibrant glowing neon cyan)
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 6.0;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    const totalSegs = this.circuit.segments || 600;
    const currentIdx = Math.floor(((playerU % 1.0 + 1.0) % 1.0) * totalSegs);
    const windowSpan = 50;
    let first = true;
    for (let offset = -15; offset <= windowSpan; offset += 2) {
      const idx = ((currentIdx + offset) % totalSegs + totalSegs) % totalSegs;
      const frame = this.circuit.samples[idx];
      if (!frame || !frame.pos) continue;
      const pt = toScreen(frame.pos.x, frame.pos.z);
      if (first) {
        ctx.moveTo(pt.x, pt.y);
        first = false;
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Boost Pads (Neon Green pulsing blips)
    if (this.circuit.boostPads) {
      ctx.fillStyle = '#00FF66';
      ctx.shadowColor = '#00FF66';
      ctx.shadowBlur = 8;
      this.circuit.boostPads.forEach(padU => {
        const frame = this.circuit.getFrameAt(padU);
        if (!frame || !frame.pos) return;
        const pt = toScreen(frame.pos.x, frame.pos.z);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }

    // 5. Checkpoints (Glowing Amber / Gold Diamonds)
    if (this.circuit.checkpoints) {
      ctx.fillStyle = '#FFB800';
      ctx.shadowColor = '#FFB800';
      ctx.shadowBlur = 8;
      this.circuit.checkpoints.forEach(cp => {
        const frame = this.circuit.getFrameAt(cp.u);
        if (!frame || !frame.pos) return;
        const pt = toScreen(frame.pos.x, frame.pos.z);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y - 4);
        ctx.lineTo(pt.x + 4, pt.y);
        ctx.lineTo(pt.x, pt.y + 4);
        ctx.lineTo(pt.x - 4, pt.y);
        ctx.closePath();
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }

    // 6. Rivals (High-contrast colored radar dots with white border)
    if (rivals && rivals.length > 0) {
      rivals.forEach(r => {
        if (!r.vehicle || !r.vehicle.group) return;
        const rPos = r.vehicle.group.position;
        const pt = toScreen(rPos.x, rPos.z);
        const col = (r.spec && r.spec.color)
          ? (typeof r.spec.color === 'string' ? r.spec.color : `#${r.spec.color.toString(16).padStart(6, '0')}`)
          : '#FF2A13';

        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
    }

    ctx.restore(); // Restore radar clip

    // 7. Player Indicator (Crisp Glowing Cyan Arrowhead in Center pointing UP)
    ctx.save();
    // Forward heading line
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy - 32);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player craft triangle
    ctx.fillStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 11);
    ctx.lineTo(cx - 8, cy + 8);
    ctx.lineTo(cx, cy + 4);
    ctx.lineTo(cx + 8, cy + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 8. Outer Neon Rim & Cardinal Directions
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal tick marks
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.fillRect(cx - 1, 2, 2, 6);
    ctx.fillRect(cx - 1, h - 8, 2, 6);
    ctx.fillRect(2, cy - 1, 6, 2);
    ctx.fillRect(w - 8, cy - 1, 6, 2);

      // Dynamic district badge at bottom of radar
      if (currentDistrict && currentDistrict.name) {
        ctx.fillStyle = currentDistrict.color || '#00F0FF';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(currentDistrict.name, cx, h - 10);
      }
    } catch (err) {
      console.warn('[Minimap] update error:', err);
    }
  }
}

