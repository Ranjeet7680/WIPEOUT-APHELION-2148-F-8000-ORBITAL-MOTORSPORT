import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - COCKPIT INSTRUMENTATION (FIRST-PERSON VIEW MFDs)
// Angled canopy glass, G-force meter, capacitor readout, rear tactical radar
// ============================================================================

export class CockpitHUD {
  constructor(craftGroup) {
    this.parentGroup = craftGroup;
    this.cockpitGroup = new THREE.Group();
    this.visible = false;

    // Cockpit Dynamic Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);

    this.build();
    this.parentGroup.add(this.cockpitGroup);
    this.cockpitGroup.visible = false;
  }

  build() {
    // 1. Cockpit Canopy Frame Struts (Dark titanium structural ribs)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0D1117,
      metalness: 0.9,
      roughness: 0.3
    });

    // Top arch
    const archGeo = new THREE.TorusGeometry(0.85, 0.035, 8, 24, Math.PI);
    const archMesh = new THREE.Mesh(archGeo, frameMat);
    archMesh.position.set(0, 0.65, 0.2);
    archMesh.rotation.x = 0.35;
    this.cockpitGroup.add(archMesh);

    // 2. Center HUD Glass Screen
    const hudGeo = new THREE.PlaneGeometry(1.6, 0.85);
    const hudMat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    this.hudMesh = new THREE.Mesh(hudGeo, hudMat);
    this.hudMesh.position.set(0, 0.58, 0.72);
    this.hudMesh.rotation.x = -0.15;
    this.cockpitGroup.add(this.hudMesh);
  }

  update(speedKmh, gForce, shieldHealth, boostPercent, repulsorHeat, rivals = [], physics = null) {
    if (!this.cockpitGroup.visible) return;

    const ctx = this.ctx;
    const w = 1024;
    const h = 512;
    ctx.clearRect(0, 0, w, h);

    const cyan = '#00F0FF';
    const amber = '#FFB800';
    const red = '#FF2A13';
    const emerald = '#00FF66';

    // 1. LEFT MFD: G-FORCE & TRI-VECTOR POWER ROUTING
    const leftX = 180;
    const leftY = 220;
    ctx.strokeStyle = cyan;
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 80, 260, 340);

    ctx.fillStyle = cyan;
    ctx.font = '14px monospace';
    ctx.fillText('MFD-L // G-DYNAMICS & TRI-POWER', 65, 105);

    // G-Circle
    ctx.beginPath();
    ctx.arc(leftX, leftY, 55, 0, Math.PI * 2);
    ctx.stroke();

    // G-Force Vector Pip
    const gPipX = leftX + (gForce.lateral || 0) * 12;
    const gPipY = leftY - (gForce.longitudinal || 0) * 12;
    ctx.fillStyle = amber;
    ctx.beginPath();
    ctx.arc(gPipX, gPipY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cyan;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${(gForce.magnitude || 1.0).toFixed(1)} G`, leftX - 20, leftY + 75);

    // CORE 1: Tri-Vector Power readouts on Left MFD
    if (physics && physics.power) {
      const busY = leftY + 95;
      ctx.font = '11px monospace';
      ctx.fillStyle = amber;
      ctx.fillText(`POWER BUS [1-4]: ${physics.powerProfile}`, 65, busY);

      // Mini bars
      const mBarW = 70;
      const mBarH = 6;
      ctx.fillStyle = red;
      ctx.fillText(`THR ${Math.round(physics.power.thrust * 100)}%`, 65, busY + 20);
      ctx.fillRect(130, busY + 12, mBarW * physics.power.thrust, mBarH);

      ctx.fillStyle = cyan;
      ctx.fillText(`FLX ${Math.round(physics.power.flux * 100)}%`, 65, busY + 36);
      ctx.fillRect(130, busY + 28, mBarW * physics.power.flux, mBarH);

      ctx.fillStyle = emerald;
      ctx.fillText(`BAR ${Math.round(physics.power.barrier * 100)}%`, 65, busY + 52);
      ctx.fillRect(130, busY + 44, mBarW * physics.power.barrier, mBarH);
    }

    // 2. CENTER HUD: COLLIMATED VECTOR RETICLE, SPEED & RE-ANCHOR
    const midX = 512;
    const midY = 220;

    const hudReticleColor = (physics && physics.cobraActive) ? amber : cyan;
    ctx.strokeStyle = hudReticleColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(midX, midY, 45, 0, Math.PI * 2);
    ctx.stroke();

    // Pitch ladder lines
    ctx.beginPath();
    ctx.moveTo(midX - 70, midY); ctx.lineTo(midX - 30, midY);
    ctx.moveTo(midX + 30, midY); ctx.lineTo(midX + 70, midY);
    ctx.stroke();

    // Speed display
    ctx.fillStyle = cyan;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(speedKmh)} KM/H`, midX, midY + 95);

    // CORE 4: Cobra Rearward Lock Status
    if (physics && physics.cobraActive) {
      ctx.fillStyle = amber;
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`COBRA 180° REAR LOCK // [K / SPACE] RAILGUN`, midX, midY - 60);
    } else if (physics && physics.inVacuumRift) {
      ctx.fillStyle = amber;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`VACUUM RIFT 6-DOF // ALIGN GATE < 25°`, midX, midY - 60);
    } else if (physics && physics.reAnchorTimer > 0) {
      const isLocked = physics.reAnchorStatus === 'LOCKED';
      ctx.fillStyle = isLocked ? emerald : red;
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`GATE RE-ANCHOR: ${physics.reAnchorAlignment.toFixed(1)}° [${physics.reAnchorStatus}]`, midX, midY - 60);
    }

    // 3. RIGHT MFD: CAPACITOR, SHIELD & COMPONENT JETTISON
    const rightBoxX = 714;
    ctx.strokeStyle = cyan;
    ctx.lineWidth = 2;
    ctx.strokeRect(rightBoxX, 80, 260, 340);

    ctx.fillStyle = cyan;
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MFD-R // FLUX & CAPACITOR', rightBoxX + 15, 105);

    // CORE 3: Friction Capacitor
    const capVal = physics ? (physics.frictionCapacitor || 0) : boostPercent;
    const capColor = capVal >= 0.6 ? emerald : capVal >= 0.35 ? amber : cyan;
    ctx.fillText(`FRICTION CAPACITOR (${Math.round(capVal * 100)}%)`, rightBoxX + 15, 145);
    ctx.strokeStyle = capColor;
    ctx.strokeRect(rightBoxX + 15, 155, 230, 16);
    ctx.fillStyle = capColor;
    ctx.fillRect(rightBoxX + 17, 157, 226 * capVal, 12);

    ctx.font = '11px monospace';
    if (physics && physics.isInductionGrinding) {
      ctx.fillStyle = emerald;
      ctx.fillText(`⚡ INDUCTION GRINDING // NO SPEED DAMP`, rightBoxX + 15, 188);
    } else if (capVal >= 0.6) {
      ctx.fillStyle = emerald;
      ctx.fillText(`[SHIFT] BURNOUT  [X] RADIAL EMP`, rightBoxX + 15, 188);
    } else if (capVal >= 0.35) {
      ctx.fillStyle = amber;
      ctx.fillText(`[SHIFT] BURNOUT BOOST READY`, rightBoxX + 15, 188);
    }

    // Shield Integrity
    ctx.fillStyle = cyan;
    ctx.font = '14px monospace';
    ctx.fillText(`SHIELD INTEGRITY (${Math.round(shieldHealth * 100)}%)`, rightBoxX + 15, 225);
    const sColor = shieldHealth > 0.5 ? cyan : shieldHealth > 0.2 ? amber : red;
    ctx.strokeStyle = sColor;
    ctx.strokeRect(rightBoxX + 15, 235, 230, 16);
    ctx.fillStyle = sColor;
    ctx.fillRect(rightBoxX + 17, 237, 226 * shieldHealth, 12);

    // CORE 5: Component Jettison
    ctx.font = '12px monospace';
    if (physics && physics.jettisoned) {
      ctx.fillStyle = cyan;
      ctx.fillText(`AERO SHED // MASS: 984 KG`, rightBoxX + 15, 280);
      ctx.fillText(`DRAG Cd: 0.27 // +22% ACCEL`, rightBoxX + 15, 298);
    } else if (physics && Math.abs(physics.asymmetricPull) > 0.04) {
      ctx.fillStyle = red;
      const pullDir = physics.asymmetricPull > 0 ? 'RIGHT' : 'LEFT';
      ctx.fillText(`⚠ CANARD DAMAGE: PULL ${pullDir}`, rightBoxX + 15, 280);
      ctx.fillText(`[J] EMERGENCY JETTISON`, rightBoxX + 15, 298);
    } else {
      ctx.fillStyle = cyan;
      ctx.fillText(`MASS: 1,200 KG // Cd: 0.32`, rightBoxX + 15, 280);
      ctx.fillText(`HULL MONOCOQUE INTACT`, rightBoxX + 15, 298);
    }

    // Repulsor Temp
    ctx.fillStyle = cyan;
    ctx.fillText(`REPULSOR TEMP: ${(380 + repulsorHeat * 480).toFixed(0)} K`, rightBoxX + 15, 335);

    // 4. TOP MFD: HOLOGRAPHIC REAR TACTICAL RADAR
    const radarX = 512;
    const radarY = 55;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.strokeRect(362, 10, 300, 80);

    ctx.fillStyle = cyan;
    ctx.font = '12px monospace';
    ctx.fillText('REAR TACTICAL RADAR // COBRA TARGETING BUS', 375, 25);

    // Radar Center & Rival Blips
    ctx.fillStyle = '#00FF66';
    ctx.fillRect(radarX - 3, radarY - 3, 6, 6); // Player

    // Draw nearby rivals behind player
    rivals.forEach((rival) => {
      const rx = radarX + rival.relX * 2.5;
      const ry = radarY + rival.relZ * 0.8;
      if (rx >= 370 && rx <= 650 && ry >= 30 && ry <= 85) {
        ctx.fillStyle = red;
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    this.texture.needsUpdate = true;
  }

  setVisible(visible) {
    this.cockpitGroup.visible = visible;
  }
}
