import * as THREE from 'three';

// ============================================================================
// HOLOGRAPHIC MINIMAP RADAR: [ AETHER-9 // NAV ]
// Real-time rotating 2D Canvas radar tracking player, rivals, checkpoints & boosts
// ============================================================================

export class HolographicMinimap {
  constructor(canvasId = 'hud-minimap-canvas', circuit = null) {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.circuit = circuit;

    this.scale = 0.12; // Radar zoom factor
  }

  getCanvas() {
    if (!this.canvas) {
      this.canvas = document.getElementById(this.canvasId);
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
      }
    }
    return this.canvas;
  }

  setCircuit(circuit) {
    this.circuit = circuit;
  }

  update(playerPos, playerQuat, playerU, rivals = [], currentDistrict = null) {
    if (!this.ctx && !this.getCanvas()) return;
    if (!this.ctx || !this.circuit || !playerPos) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w * 0.5;
    const cy = h * 0.5;

    // Clear with dark transparent radial gradient
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.5);
    grad.addColorStop(0, 'rgba(8, 12, 20, 0.85)');
    grad.addColorStop(0.85, 'rgba(6, 9, 15, 0.95)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.25)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Outer radar ring & degree ticks
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.32, 0, Math.PI * 2);
    ctx.arc(cx, cy, w * 0.16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Extract player yaw rotation angle
    const euler = new THREE.Euler().setFromQuaternion(playerQuat, 'YXZ');
    const playerHeading = -euler.y;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerHeading); // Rotate world around player so UP is forward!

    // 1. Draw Track Spline Ribbon
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();

    const sampleStep = 4;
    for (let i = 0; i <= this.circuit.segments; i += sampleStep) {
      const frame = this.circuit.samples[i];
      const dx = (frame.pos.x - playerPos.x) * this.scale;
      const dz = (frame.pos.z - playerPos.z) * this.scale;

      if (i === 0) {
        ctx.moveTo(dx, dz);
      } else {
        ctx.lineTo(dx, dz);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // 2. Draw Boost Pads
    ctx.fillStyle = '#00FF66';
    this.circuit.boostPads.forEach(padU => {
      const frame = this.circuit.getFrameAt(padU);
      const dx = (frame.pos.x - playerPos.x) * this.scale;
      const dz = (frame.pos.z - playerPos.z) * this.scale;
      ctx.beginPath();
      ctx.arc(dx, dz, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw Checkpoint Gates
    ctx.fillStyle = '#FFB800';
    this.circuit.checkpoints.forEach(cp => {
      const frame = this.circuit.getFrameAt(cp.u);
      const dx = (frame.pos.x - playerPos.x) * this.scale;
      const dz = (frame.pos.z - playerPos.z) * this.scale;
      ctx.fillRect(dx - 3, dz - 3, 6, 6);
    });

    // 4. Draw Rival Racers
    rivals.forEach(r => {
      if (!r.vehicle) return;
      const rPos = r.vehicle.group.position;
      const dx = (rPos.x - playerPos.x) * this.scale;
      const dz = (rPos.z - playerPos.z) * this.scale;

      // Color-coded blips
      ctx.fillStyle = `#${r.spec.color.toString(16).padStart(6, '0')}`;
      ctx.beginPath();
      ctx.arc(dx, dz, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();

    // 5. Draw Player Marker (Centered triangle pointing UP)
    ctx.fillStyle = '#00F0FF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx - 6, cy + 6);
    ctx.lineTo(cx, cy + 3);
    ctx.lineTo(cx + 6, cy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dynamic district label on radar
    if (currentDistrict) {
      ctx.fillStyle = currentDistrict.color || '#00F0FF';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(currentDistrict.name, cx, h - 8);
    }
  }
}
