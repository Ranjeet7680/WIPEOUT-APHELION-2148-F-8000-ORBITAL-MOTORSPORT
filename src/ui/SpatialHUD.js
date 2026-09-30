import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - FORWARD SPATIAL HORIZON (COLLIMATED 3D DIEGETIC HUD)
// Projected 10m ahead along velocity vector; pitch ladder, speed & tether compass
// ============================================================================

export class SpatialHUD {
  constructor(scene) {
    this.scene = scene;

    // HUD Canvas for dynamic ultra-crisp vector graphics
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = false;
    this.texture.minFilter = THREE.LinearFilter;

    // Plane geometry projected in world space
    const hudGeo = new THREE.PlaneGeometry(8.5, 4.25);
    const hudMat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthTest: false
    });

    this.mesh = new THREE.Mesh(hudGeo, hudMat);
    this.mesh.renderOrder = 999;
    this.scene.add(this.mesh);

    // Interpolated HUD position along velocity vector
    this.targetPos = new THREE.Vector3();
    this.currentPos = new THREE.Vector3();

    this.lastDrawTime = 0;
  }

  update(delta, craftPos, craftVel, craftQuat, speedKmh, shieldHealth, lap, maxLaps, pos, totalRacers, isBoosting, vacuumRift, physics = null) {
    this.physics = physics;
    const velLen = craftVel.length();
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(craftQuat);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(craftQuat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(craftQuat);

    // Velocity vector alignment: leads in the direction of actual travel!
    let leadVector;
    if (velLen > 5.0) {
      leadVector = craftVel.clone().normalize();
      // Blend slightly with heading so it never spins out
      leadVector.lerp(fwd, 0.25).normalize();
    } else {
      leadVector = fwd.clone();
    }

    // Projected 10m ahead in front of the craft
    this.targetPos.copy(craftPos)
      .addScaledVector(leadVector, 10.0)
      .addScaledVector(up, 0.7);

    // Smooth position interpolation to give that collimated floating illusion
    this.currentPos.lerp(this.targetPos, delta * 18.0);
    this.mesh.position.copy(this.currentPos);

    // Orient HUD toward camera / align perpendicular to lead vector
    this.mesh.quaternion.copy(craftQuat);

    // Redraw Canvas telemetry at ~60fps
    const now = performance.now();
    if (now - this.lastDrawTime > 16) {
      this.drawHUD(speedKmh, shieldHealth, lap, maxLaps, pos, totalRacers, isBoosting, vacuumRift, physics);
      this.texture.needsUpdate = true;
      this.lastDrawTime = now;
    }
  }

  drawHUD(speedKmh, shieldHealth, lap, maxLaps, pos, totalRacers, isBoosting, vacuumRift, physics) {
    const ctx = this.ctx;
    const w = 1024;
    const h = 512;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Primary Colors
    const cyan = '#00F0FF';
    const amber = '#FFB800';
    const vermilion = '#FF2A13';
    const emerald = '#00FF66';
    const violet = '#B800FF';

    const shieldColor = shieldHealth > 0.5 ? cyan : shieldHealth > 0.2 ? amber : vermilion;

    // 1. TOP SPATIAL VECTOR BRACKET
    const speedInt = Math.floor(speedKmh);
    const gear = speedKmh < 300 ? '01' : speedKmh < 650 ? '02' : speedKmh < 1000 ? '03' : speedKmh < 1350 ? '04' : 'MAX';

    ctx.save();
    ctx.strokeStyle = cyan;
    ctx.lineWidth = 3;
    ctx.fillStyle = cyan;
    ctx.font = '900 24px "Share Tech Mono", monospace, monospace';

    // Main Bracket Box
    const boxW = 560;
    const boxH = 50;
    const boxX = cx - boxW / 2;
    const boxY = cy - 140;

    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Bracket corner ticks
    ctx.fillRect(boxX - 4, boxY - 4, 12, 4);
    ctx.fillRect(boxX - 4, boxY - 4, 4, 12);
    ctx.fillRect(boxX + boxW - 8, boxY - 4, 12, 4);
    ctx.fillRect(boxX + boxW, boxY - 4, 4, 12);

    // Vector pointer arrow
    ctx.beginPath();
    ctx.moveTo(cx, boxY - 14);
    ctx.lineTo(cx - 10, boxY);
    ctx.lineTo(cx + 10, boxY);
    ctx.closePath();
    ctx.fill();

    // Speed readout text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let statusTag = ` // GEAR ${gear}`;
    if (physics && physics.hudGlitchTimer > 0) {
      statusTag = ' // [HUD INTERFERENCE // STATIC]';
    } else if (physics && physics.cobraActive) {
      statusTag = ' // [COBRA 180° DECOUPLE]';
    } else if (isBoosting) {
      statusTag = ' // [HYPER-BOOST]';
    } else if (vacuumRift) {
      statusTag = ' // [VACUUM RIFT 6-DOF]';
    }

    if (physics && physics.hudGlitchTimer > 0) {
      ctx.fillStyle = '#FF2A13';
      ctx.fillText(`◄◄  ---- KM/H  // TELEMETRY LOSS  ►►`, cx, boxY + boxH / 2);
    } else {
      ctx.fillText(`◄◄  ${speedInt.toLocaleString()} KM/H  ${statusTag}  ►►`, cx, boxY + boxH / 2);
    }

    // 2. PITCH LADDER / ARTIFICIAL HORIZON TICKS
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 2;

    [-60, -30, 30, 60].forEach((offsetY) => {
      const lineLen = Math.abs(offsetY) === 30 ? 60 : 35;
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + offsetY);
      ctx.lineTo(cx - 120 + lineLen, cy + offsetY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 120, cy + offsetY);
      ctx.lineTo(cx + 120 - lineLen, cy + offsetY);
      ctx.stroke();
    });

    // 3. CENTER FLIGHT VECTOR RETICLE
    const reticleColor = (physics && physics.cobraActive) ? amber : isBoosting ? emerald : cyan;
    ctx.strokeStyle = reticleColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 26, cy); ctx.lineTo(cx - 16, cy);
    ctx.moveTo(cx + 16, cy); ctx.lineTo(cx + 26, cy);
    ctx.moveTo(cx, cy - 26); ctx.lineTo(cx, cy - 16);
    ctx.moveTo(cx, cy + 16); ctx.lineTo(cx, cy + 26);
    ctx.stroke();

    // 4. CORE 1: TRI-VECTOR ENERGY DIVERTER GAUGES (Center Bottom)
    if (physics && physics.power) {
      const pY = cy - 75;
      const pW = 90;
      const pH = 6;
      const startX = cx - 145;

      // Header
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      const profName = physics.powerProfile || 'BALANCED';
      ctx.fillStyle = profName === 'THRUST' ? vermilion : profName === 'FLUX' ? cyan : profName === 'BARRIER' ? emerald : amber;
      ctx.fillText(`POWER BUS [1-4] // ${profName}`, cx, pY - 8);

      // Thrust Segment
      ctx.fillStyle = vermilion;
      ctx.fillText(`THR ${Math.round(physics.power.thrust * 100)}%`, startX + pW / 2, pY + 16);
      ctx.strokeStyle = 'rgba(255, 42, 19, 0.4)';
      ctx.strokeRect(startX, pY, pW, pH);
      ctx.fillRect(startX, pY, pW * physics.power.thrust, pH);

      // Flux Segment
      ctx.fillStyle = cyan;
      ctx.fillText(`FLX ${Math.round(physics.power.flux * 100)}%`, startX + pW + 10 + pW / 2, pY + 16);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.strokeRect(startX + pW + 10, pY, pW, pH);
      ctx.fillRect(startX + pW + 10, pY, pW * physics.power.flux, pH);

      // Barrier Segment
      ctx.fillStyle = emerald;
      ctx.fillText(`BAR ${Math.round(physics.power.barrier * 100)}%`, startX + (pW + 10) * 2 + pW / 2, pY + 16);
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
      ctx.strokeRect(startX + (pW + 10) * 2, pY, pW, pH);
      ctx.fillRect(startX + (pW + 10) * 2, pY, pW * physics.power.barrier, pH);
    }

    // 5. LEFT WING: DIEGETIC SHIELD & FRICTION CAPACITOR GAUGES
    const barW = 180;
    const barH = 10;
    const shieldX = cx - 380;
    const shieldY = cy + 70;

    // Shield Integrity
    ctx.strokeStyle = shieldColor;
    ctx.strokeRect(shieldX, shieldY, barW, barH);
    ctx.fillStyle = shieldColor;
    ctx.fillRect(shieldX + 2, shieldY + 2, (barW - 4) * Math.max(0, shieldHealth), barH - 4);

    ctx.font = '15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SHIELD // ${Math.floor(shieldHealth * 100)}%`, shieldX, shieldY - 6);

    // CORE 3: Friction Capacitor
    if (physics) {
      const capY = shieldY + 32;
      const capVal = physics.frictionCapacitor || 0;
      const capColor = capVal >= 0.6 ? emerald : capVal >= 0.35 ? amber : cyan;

      ctx.strokeStyle = capColor;
      ctx.strokeRect(shieldX, capY, barW, barH);
      ctx.fillStyle = capColor;
      ctx.fillRect(shieldX + 2, capY + 2, (barW - 4) * capVal, barH - 4);

      ctx.font = '13px monospace';
      ctx.fillText(`FRICTION CAPACITOR // ${Math.floor(capVal * 100)}%`, shieldX, capY - 6);

      // Status tags
      if (physics.isInductionGrinding) {
        ctx.fillStyle = emerald;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`⚡ INDUCTION GRINDING (NO DRAG)`, shieldX, capY + 24);
      } else if (capVal >= 0.60) {
        ctx.fillStyle = emerald;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`[SHIFT] BURNOUT  [X] EMP PULSE`, shieldX, capY + 24);
      } else if (capVal >= 0.35) {
        ctx.fillStyle = amber;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`[SHIFT] BURNOUT BOOST READY`, shieldX, capY + 24);
      }
    }

    // 6. RIGHT WING: RACE STATS & VACUUM RE-ANCHOR / FLUX STATUS
    const statsX = cx + 220;
    const statsY = cy + 70;

    ctx.fillStyle = cyan;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`POS ${pos}/${totalRacers}  LAP ${lap}/${maxLaps}`, statsX, statsY);

    if (physics) {
      // CORE 2: Re-Anchor Gate Check
      if (physics.reAnchorTimer > 0) {
        const isLocked = physics.reAnchorStatus === 'LOCKED';
        ctx.fillStyle = isLocked ? emerald : vermilion;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`RE-ANCHOR GATE: ${physics.reAnchorAlignment.toFixed(1)}° [${physics.reAnchorStatus}]`, statsX, statsY + 24);
      } else if (physics.inVacuumRift) {
        ctx.fillStyle = amber;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`ZERO-G 6-DOF // RE-ANCHOR GATE < 25°`, statsX, statsY + 24);
      } else {
        const fluxVal = Math.round((physics.power ? physics.power.flux : 0.34) * 100);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.font = '13px monospace';
        ctx.fillText(`FLUX CLAMP: ACTIVE [${fluxVal}%]`, statsX, statsY + 24);
      }

      // CORE 5: Component Jettison & Damage Asymmetry Alert
      if (physics.jettisoned) {
        ctx.fillStyle = cyan;
        ctx.font = '12px monospace';
        ctx.fillText(`AERO SHED // MASS 984kg // Cd 0.27`, statsX, statsY + 44);
      } else if (Math.abs(physics.asymmetricPull) > 0.04) {
        ctx.fillStyle = vermilion;
        ctx.font = 'bold 12px monospace';
        const pullDir = physics.asymmetricPull > 0 ? 'RIGHT' : 'LEFT';
        ctx.fillText(`CANARD DAMAGE (PULL ${pullDir}) // [J] JETTISON`, statsX, statsY + 44);
      }
    }

    // 7. COBRA AIR-ANCHOR ACTIVE BANNER (Center)
    if (physics && physics.cobraActive) {
      ctx.fillStyle = amber;
      ctx.font = '900 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`◄◄ COBRA 180° REAR TARGETING // [K / SPACE] FIRE RAILGUN ►►`, cx, cy + 50);
    }

    ctx.restore();
  }

  setVisible(visible) {
    this.mesh.visible = visible;
  }
}
