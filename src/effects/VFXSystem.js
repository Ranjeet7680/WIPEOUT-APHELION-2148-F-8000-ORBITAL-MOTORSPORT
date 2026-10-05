import * as THREE from 'three';

// ============================================================================
// NEO-SHINJUKU RIFT: DEDICATED HIGH-PERFORMANCE VFX SYSTEM
// Modular GPU-aligned particle pools & cinematic shader effects:
// Boost & Overdrive, Drift Sparks & Skid Decals, Landing Shockwaves,
// Collision Sparks, Rain Streaks & Road Spray, Speed Tunnel Lines, Checkpoints & Podium
// ============================================================================

export class VFXSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // Soft circular radial alpha texture for organic glow
    let softParticleTex = null;
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      g.addColorStop(0.35, 'rgba(255, 255, 255, 0.7)');
      g.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
      g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      softParticleTex = new THREE.CanvasTexture(c);
    }
    this.softParticleTex = softParticleTex;

    // 1. Boost & Exhaust Plasma Particles
    this.maxBoostParticles = 300;
    this.boostGeo = new THREE.BufferGeometry();
    this.boostPos = new Float32Array(this.maxBoostParticles * 3);
    this.boostColors = new Float32Array(this.maxBoostParticles * 3);
    this.boostSizes = new Float32Array(this.maxBoostParticles);
    this.boostVel = [];
    this.boostLife = new Float32Array(this.maxBoostParticles);

    for (let i = 0; i < this.maxBoostParticles; i++) {
      this.boostVel.push(new THREE.Vector3());
      this.boostLife[i] = 0;
      this.boostSizes[i] = 2.0;
    }

    this.boostGeo.setAttribute('position', new THREE.BufferAttribute(this.boostPos, 3));
    this.boostGeo.setAttribute('color', new THREE.BufferAttribute(this.boostColors, 3));
    this.boostGeo.setAttribute('size', new THREE.BufferAttribute(this.boostSizes, 1));

    const boostMat = new THREE.PointsMaterial({
      size: 3.5,
      map: softParticleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.boostPoints = new THREE.Points(this.boostGeo, boostMat);
    this.boostPoints.frustumCulled = false;
    this.scene.add(this.boostPoints);

    // 2. Drift Sparks & Smoke Particles
    this.maxDriftParticles = 250;
    this.driftGeo = new THREE.BufferGeometry();
    this.driftPos = new Float32Array(this.maxDriftParticles * 3);
    this.driftColors = new Float32Array(this.maxDriftParticles * 3);
    this.driftVel = [];
    this.driftLife = new Float32Array(this.maxDriftParticles);

    for (let i = 0; i < this.maxDriftParticles; i++) {
      this.driftVel.push(new THREE.Vector3());
      this.driftLife[i] = 0;
    }

    this.driftGeo.setAttribute('position', new THREE.BufferAttribute(this.driftPos, 3));
    this.driftGeo.setAttribute('color', new THREE.BufferAttribute(this.driftColors, 3));

    const driftMat = new THREE.PointsMaterial({
      size: 2.8,
      map: softParticleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.driftPoints = new THREE.Points(this.driftGeo, driftMat);
    this.driftPoints.frustumCulled = false;
    this.scene.add(this.driftPoints);

    // 3. Collision Sparks Pool
    this.maxCollisionSparks = 200;
    this.colGeo = new THREE.BufferGeometry();
    this.colPos = new Float32Array(this.maxCollisionSparks * 3);
    this.colColors = new Float32Array(this.maxCollisionSparks * 3);
    this.colVel = [];
    this.colLife = new Float32Array(this.maxCollisionSparks);

    for (let i = 0; i < this.maxCollisionSparks; i++) {
      this.colVel.push(new THREE.Vector3());
      this.colLife[i] = 0;
    }

    this.colGeo.setAttribute('position', new THREE.BufferAttribute(this.colPos, 3));
    this.colGeo.setAttribute('color', new THREE.BufferAttribute(this.colColors, 3));

    const colMat = new THREE.PointsMaterial({
      size: 3.2,
      map: softParticleTex,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.colPoints = new THREE.Points(this.colGeo, colMat);
    this.colPoints.frustumCulled = false;
    this.scene.add(this.colPoints);

    // 4. Landing Shockwave Rings Pool (3 Rings)
    this.shockwaves = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(0.8, 3.2, 32);
      ringGeo.rotateX(-Math.PI * 0.5);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00F0FF,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.visible = false;
      this.scene.add(ringMesh);
      this.shockwaves.push({
        mesh: ringMesh,
        scale: 1.0,
        opacity: 0.0,
        active: false,
        maxScale: 18.0
      });
    }

    // 5. High-Velocity Rain Streaks (Centered around Player Camera)
    this.maxRainDrops = 600;
    this.rainGeo = new THREE.BufferGeometry();
    this.rainPos = new Float32Array(this.maxRainDrops * 6); // 2 vertices per line streak
    this.rainOffset = [];

    for (let i = 0; i < this.maxRainDrops; i++) {
      this.rainOffset.push({
        x: (Math.random() - 0.5) * 120,
        y: Math.random() * 70,
        z: (Math.random() - 0.5) * 120,
        speed: 100 + Math.random() * 60,
        len: 2.0 + Math.random() * 2.5
      });
    }

    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPos, 3));
    const rainMat = new THREE.LineBasicMaterial({
      color: 0x70C8FF,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.rainLines = new THREE.LineSegments(this.rainGeo, rainMat);
    this.rainLines.frustumCulled = false;
    this.scene.add(this.rainLines);

    // Dynamic performance scaling defaults
    this.activeRainDrops = 450;
    this.activeSpeedLines = 50;

    // 6. Hypersonic Peripheral Warp Lines (Edges only, clear center view)
    this.maxSpeedLines = 60;
    this.speedLineGeo = new THREE.BufferGeometry();
    this.speedLinePos = new Float32Array(this.maxSpeedLines * 6);
    this.speedLinesData = [];

    for (let i = 0; i < this.maxSpeedLines; i++) {
      this.speedLinesData.push({
        radius: 22 + Math.random() * 32, // Strictly peripheral edges so car and road remain 100% visible
        angle: Math.random() * Math.PI * 2,
        z: -Math.random() * 80,
        len: 5 + Math.random() * 10,
        speed: 140 + Math.random() * 80
      });
    }

    this.speedLineGeo.setAttribute('position', new THREE.BufferAttribute(this.speedLinePos, 3));
    const speedMat = new THREE.LineBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.speedLinesMesh = new THREE.LineSegments(this.speedLineGeo, speedMat);
    this.speedLinesMesh.frustumCulled = false;
    this.camera.add(this.speedLinesMesh);

    // 7. Checkpoint & Gate Burst Rings
    this.gateBursts = [];
    for (let i = 0; i < 4; i++) {
      const gGeo = new THREE.RingGeometry(4.0, 5.5, 32);
      const gMat = new THREE.MeshBasicMaterial({
        color: 0x00FF88,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const gMesh = new THREE.Mesh(gGeo, gMat);
      gMesh.visible = false;
      this.scene.add(gMesh);
      this.gateBursts.push({
        mesh: gMesh,
        active: false,
        scale: 1.0,
        opacity: 0.0
      });
    }

    // 8. Celebratory Finish Confetti & Fireworks
    this.maxConfetti = 400;
    this.confettiGeo = new THREE.BufferGeometry();
    this.confettiPos = new Float32Array(this.maxConfetti * 3);
    this.confettiColors = new Float32Array(this.maxConfetti * 3);
    this.confettiVel = [];
    this.confettiLife = new Float32Array(this.maxConfetti);

    const confettiPalette = [
      new THREE.Color(0xFFD700), // Gold
      new THREE.Color(0x00F0FF), // Cyan
      new THREE.Color(0xFF007F), // Magenta
      new THREE.Color(0x00FF88), // Acid Lime
      new THREE.Color(0xFFFFFF)  // White
    ];

    for (let i = 0; i < this.maxConfetti; i++) {
      this.confettiVel.push(new THREE.Vector3());
      this.confettiLife[i] = 0;
      const c = confettiPalette[i % confettiPalette.length];
      this.confettiColors[i * 3] = c.r;
      this.confettiColors[i * 3 + 1] = c.g;
      this.confettiColors[i * 3 + 2] = c.b;
    }

    this.confettiGeo.setAttribute('position', new THREE.BufferAttribute(this.confettiPos, 3));
    this.confettiGeo.setAttribute('color', new THREE.BufferAttribute(this.confettiColors, 3));

    const confettiMat = new THREE.PointsMaterial({
      size: 4.5,
      map: softParticleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.confettiPoints = new THREE.Points(this.confettiGeo, confettiMat);
    this.confettiPoints.frustumCulled = false;
    this.scene.add(this.confettiPoints);

    this.confettiActive = false;
  }

  // --------------------------------------------------------------------------
  // SPAWN METHODS
  // --------------------------------------------------------------------------

  spawnBoostParticles(rearLeftPos, rearRightPos, forwardDir, isOverdrive = false) {
    const count = isOverdrive ? 10 : 5;
    const oppDir = forwardDir.clone().negate();

    for (let k = 0; k < count; k++) {
      const emitterPos = (k % 2 === 0) ? rearLeftPos : rearRightPos;
      const idx = this.findFreeBoostParticle();
      if (idx === -1) break;

      this.boostPos[idx * 3] = emitterPos.x + (Math.random() - 0.5) * 0.4;
      this.boostPos[idx * 3 + 1] = emitterPos.y + (Math.random() - 0.5) * 0.3;
      this.boostPos[idx * 3 + 2] = emitterPos.z + (Math.random() - 0.5) * 0.4;

      const spread = 0.35;
      this.boostVel[idx].copy(oppDir)
        .add(new THREE.Vector3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread))
        .normalize()
        .multiplyScalar(28.0 + Math.random() * 22.0);

      this.boostLife[idx] = 1.0;

      if (isOverdrive) {
        // Magenta / Hot Violet in Overdrive
        this.boostColors[idx * 3] = 1.0;
        this.boostColors[idx * 3 + 1] = 0.05 + Math.random() * 0.3;
        this.boostColors[idx * 3 + 2] = 0.95;
      } else {
        // High Intensity Electric Cyan
        this.boostColors[idx * 3] = 0.0;
        this.boostColors[idx * 3 + 1] = 0.9 + Math.random() * 0.1;
        this.boostColors[idx * 3 + 2] = 1.0;
      }
    }
  }

  spawnDriftSparks(contactPos, lateralDir, isPerfect = false, driftIntensity = 0.5) {
    // Scale particle count with drift intensity (0..1): 2 at low intensity, 12 at max
    const baseCount = isPerfect ? 8 : 4;
    const count = Math.max(2, Math.floor(baseCount * (0.5 + driftIntensity * 0.5)));

    for (let k = 0; k < count; k++) {
      const idx = this.findFreeDriftParticle();
      if (idx === -1) break;

      this.driftPos[idx * 3] = contactPos.x + (Math.random() - 0.5) * 0.5;
      this.driftPos[idx * 3 + 1] = contactPos.y + 0.1;
      this.driftPos[idx * 3 + 2] = contactPos.z + (Math.random() - 0.5) * 0.5;

      // Speed scales with drift intensity
      const sparkSpeed = 6.0 + driftIntensity * 14.0;
      this.driftVel[idx].set(
        lateralDir.x * (sparkSpeed + Math.random() * 8.0) + (Math.random() - 0.5) * 3.0,
        2.5 + driftIntensity * 3.0 + Math.random() * 4.0,
        lateralDir.z * (sparkSpeed + Math.random() * 8.0) + (Math.random() - 0.5) * 3.0
      );

      this.driftLife[idx] = 1.0;

      if (isPerfect) {
        // Cyan / White sparks on perfect drift
        this.driftColors[idx * 3] = 0.2;
        this.driftColors[idx * 3 + 1] = 1.0;
        this.driftColors[idx * 3 + 2] = 1.0;
      } else {
        // Color heat: orange at low intensity, white-hot at max intensity
        this.driftColors[idx * 3] = 1.0;
        this.driftColors[idx * 3 + 1] = Math.max(0.2, 0.65 + Math.random() * 0.25 - driftIntensity * 0.3);
        this.driftColors[idx * 3 + 2] = Math.max(0.0, 0.1 - driftIntensity * 0.08);
      }
    }
  }


  spawnLandingShockwave(groundPos, trackNormal, isPerfect = false) {
    const sw = this.shockwaves.find(s => !s.active) || this.shockwaves[0];
    sw.active = true;
    sw.mesh.visible = true;
    sw.mesh.position.copy(groundPos).addScaledVector(trackNormal, 0.15);

    // Align ring with track surface
    sw.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), trackNormal);

    sw.scale = 1.0;
    sw.mesh.scale.set(1.0, 1.0, 1.0);
    sw.opacity = 1.0;
    sw.mesh.material.opacity = 1.0;
    sw.mesh.material.color.setHex(isPerfect ? 0x00FF88 : 0x00F0FF);
    sw.maxScale = isPerfect ? 24.0 : 16.0;
  }

  spawnCollisionSparks(hitPos, hitNormal, impulse = 1.0) {
    const count = Math.min(30, Math.floor(impulse * 25));
    for (let k = 0; k < count; k++) {
      const idx = this.findFreeColParticle();
      if (idx === -1) break;

      this.colPos[idx * 3] = hitPos.x;
      this.colPos[idx * 3 + 1] = hitPos.y;
      this.colPos[idx * 3 + 2] = hitPos.z;

      this.colVel[idx].copy(hitNormal)
        .add(new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.2, (Math.random() - 0.5) * 1.5))
        .normalize()
        .multiplyScalar(15.0 + Math.random() * 20.0);

      this.colLife[idx] = 1.0;

      // Bright yellow/orange sparks
      this.colColors[idx * 3] = 1.0;
      this.colColors[idx * 3 + 1] = 0.8 + Math.random() * 0.2;
      this.colColors[idx * 3 + 2] = 0.2;
    }
  }

  spawnCheckpointBurst(gatePos, gateQuat, isSuccess = true) {
    const burst = this.gateBursts.find(b => !b.active) || this.gateBursts[0];
    burst.active = true;
    burst.mesh.visible = true;
    burst.mesh.position.copy(gatePos);
    burst.mesh.quaternion.copy(gateQuat);

    burst.scale = 1.0;
    burst.mesh.scale.set(1.0, 1.0, 1.0);
    burst.opacity = 1.0;
    burst.mesh.material.opacity = 1.0;
    burst.mesh.material.color.setHex(isSuccess ? 0x00FF88 : 0xFF1A1A);
  }

  spawnFinishCelebration(finishPos) {
    this.confettiActive = true;
    this.confettiPoints.material.opacity = 1.0;

    for (let i = 0; i < this.maxConfetti; i++) {
      this.confettiPos[i * 3] = finishPos.x + (Math.random() - 0.5) * 35;
      this.confettiPos[i * 3 + 1] = finishPos.y + 5.0 + Math.random() * 15;
      this.confettiPos[i * 3 + 2] = finishPos.z + (Math.random() - 0.5) * 35;

      this.confettiVel[i].set(
        (Math.random() - 0.5) * 16.0,
        12.0 + Math.random() * 18.0,
        (Math.random() - 0.5) * 16.0
      );
      this.confettiLife[i] = 1.0;
    }
  }

  spawnLevelUpVFX(pos) {
    this.spawnLandingShockwave(pos, new THREE.Vector3(0, 1, 0), true);
    for (let i = 0; i < 40; i++) {
      const idx = this.findFreeColParticle();
      if (idx === -1) break;
      this.colPos[idx * 3] = pos.x + (Math.random() - 0.5) * 2;
      this.colPos[idx * 3 + 1] = pos.y + 1;
      this.colPos[idx * 3 + 2] = pos.z + (Math.random() - 0.5) * 2;
      this.colVel[idx].set((Math.random() - 0.5) * 10, 12 + Math.random() * 10, (Math.random() - 0.5) * 10);
      this.colLife[idx] = 1.2;
      this.colColors[idx * 3] = 1.0;
      this.colColors[idx * 3 + 1] = 0.84;
      this.colColors[idx * 3 + 2] = 0.0; // Gold
    }
  }

  spawnRewardVFX(pos) {
    for (let i = 0; i < 30; i++) {
      const idx = this.findFreeColParticle();
      if (idx === -1) break;
      this.colPos[idx * 3] = pos.x + (Math.random() - 0.5) * 4;
      this.colPos[idx * 3 + 1] = pos.y + 0.5 + Math.random() * 2;
      this.colPos[idx * 3 + 2] = pos.z + (Math.random() - 0.5) * 4;
      this.colVel[idx].set((Math.random() - 0.5) * 6, 6 + Math.random() * 8, (Math.random() - 0.5) * 6);
      this.colLife[idx] = 1.0;
      this.colColors[idx * 3] = 0.0;
      this.colColors[idx * 3 + 1] = 0.94;
      this.colColors[idx * 3 + 2] = 1.0; // Cyan
    }
  }

  spawnPodiumVFX(rank = 1, pos = new THREE.Vector3(0, 0, 0)) {
    this.confettiActive = true;
    this.confettiPoints.material.opacity = 1.0;
    const color = rank === 1 ? new THREE.Color(0xFFD700) : (rank === 2 ? new THREE.Color(0xE0E8F5) : new THREE.Color(0xCD7F32));

    for (let i = 0; i < 150; i++) {
      this.confettiPos[i * 3] = pos.x + (Math.random() - 0.5) * 20;
      this.confettiPos[i * 3 + 1] = pos.y + 4.0 + Math.random() * 10;
      this.confettiPos[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 20;
      this.confettiVel[i].set((Math.random() - 0.5) * 14.0, 10.0 + Math.random() * 16.0, (Math.random() - 0.5) * 14.0);
      this.confettiLife[i] = 1.2;
      this.confettiColors[i * 3] = color.r;
      this.confettiColors[i * 3 + 1] = color.g;
      this.confettiColors[i * 3 + 2] = color.b;
    }
  }

  triggerMenuTransition() {
    const el = document.getElementById('cinematic-ui-root');
    if (!el) return;
    el.classList.remove('glitch-transition');
    void el.offsetWidth;
    el.classList.add('glitch-transition');
    setTimeout(() => {
      el.classList.remove('glitch-transition');
    }, 400);
  }

  // --------------------------------------------------------------------------
  // POOL FINDERS
  // --------------------------------------------------------------------------

  findFreeBoostParticle() {
    for (let i = 0; i < this.maxBoostParticles; i++) {
      if (this.boostLife[i] <= 0.0) return i;
    }
    return -1;
  }

  findFreeDriftParticle() {
    for (let i = 0; i < this.maxDriftParticles; i++) {
      if (this.driftLife[i] <= 0.0) return i;
    }
    return -1;
  }

  findFreeColParticle() {
    for (let i = 0; i < this.maxCollisionSparks; i++) {
      if (this.colLife[i] <= 0.0) return i;
    }
    return -1;
  }

  setQuality(preset = 'HIGH') {
    switch (preset) {
      case 'LOW':
        this.activeRainDrops = 0;
        this.activeSpeedLines = 30;
        this.rainLines.visible = false;
        break;
      case 'MEDIUM':
        this.activeRainDrops = 180;
        this.activeSpeedLines = 60;
        this.rainLines.visible = true;
        break;
      case 'HIGH':
        this.activeRainDrops = 380;
        this.activeSpeedLines = 90;
        this.rainLines.visible = true;
        break;
      case 'ULTRA':
      default:
        this.activeRainDrops = 600;
        this.activeSpeedLines = 120;
        this.rainLines.visible = true;
        break;
    }
  }

  // --------------------------------------------------------------------------
  // FRAME UPDATE LOOP
  // --------------------------------------------------------------------------

  update(delta, playerPos, playerVel, camera, isBoosting, isDrifting, speedKmh) {
    // 1. Update Boost Particles
    let boostDirty = false;
    for (let i = 0; i < this.maxBoostParticles; i++) {
      if (this.boostLife[i] > 0.0) {
        this.boostLife[i] -= delta * 3.5;
        this.boostPos[i * 3] += this.boostVel[i].x * delta;
        this.boostPos[i * 3 + 1] += this.boostVel[i].y * delta;
        this.boostPos[i * 3 + 2] += this.boostVel[i].z * delta;
        boostDirty = true;
      } else {
        this.boostPos[i * 3 + 1] = -9999;
      }
    }
    if (boostDirty) {
      this.boostGeo.attributes.position.needsUpdate = true;
      this.boostGeo.attributes.color.needsUpdate = true;
    }

    // 2. Update Drift Sparks
    let driftDirty = false;
    for (let i = 0; i < this.maxDriftParticles; i++) {
      if (this.driftLife[i] > 0.0) {
        this.driftLife[i] -= delta * 3.0;
        this.driftVel[i].y -= 9.8 * delta; // Gravity on sparks
        this.driftPos[i * 3] += this.driftVel[i].x * delta;
        this.driftPos[i * 3 + 1] += this.driftVel[i].y * delta;
        this.driftPos[i * 3 + 2] += this.driftVel[i].z * delta;
        driftDirty = true;
      } else {
        this.driftPos[i * 3 + 1] = -9999;
      }
    }
    if (driftDirty) {
      this.driftGeo.attributes.position.needsUpdate = true;
      this.driftGeo.attributes.color.needsUpdate = true;
    }

    // 3. Update Collision Sparks
    let colDirty = false;
    for (let i = 0; i < this.maxCollisionSparks; i++) {
      if (this.colLife[i] > 0.0) {
        this.colLife[i] -= delta * 2.8;
        this.colVel[i].y -= 15.0 * delta;
        this.colPos[i * 3] += this.colVel[i].x * delta;
        this.colPos[i * 3 + 1] += this.colVel[i].y * delta;
        this.colPos[i * 3 + 2] += this.colVel[i].z * delta;
        colDirty = true;
      } else {
        this.colPos[i * 3 + 1] = -9999;
      }
    }
    if (colDirty) {
      this.colGeo.attributes.position.needsUpdate = true;
      this.colGeo.attributes.color.needsUpdate = true;
    }

    // 4. Update Landing Shockwave Rings
    this.shockwaves.forEach(sw => {
      if (sw.active) {
        sw.scale += (sw.maxScale - sw.scale) * delta * 7.5;
        sw.opacity = Math.max(0.0, sw.opacity - delta * 2.2);
        sw.mesh.scale.set(sw.scale, sw.scale, sw.scale);
        sw.mesh.material.opacity = sw.opacity;

        if (sw.opacity <= 0.02) {
          sw.active = false;
          sw.mesh.visible = false;
        }
      }
    });

    // 5. Update Checkpoint Bursts
    this.gateBursts.forEach(gb => {
      if (gb.active) {
        gb.scale += delta * 12.0;
        gb.opacity = Math.max(0.0, gb.opacity - delta * 2.4);
        gb.mesh.scale.set(gb.scale, gb.scale, gb.scale);
        gb.mesh.material.opacity = gb.opacity;

        if (gb.opacity <= 0.02) {
          gb.active = false;
          gb.mesh.visible = false;
        }
      }
    });

    // 6. Update High-Velocity Rain Lines around Player
    if (playerPos && this.rainLines.visible && this.activeRainDrops > 0) {
      const count = Math.min(this.activeRainDrops, this.maxRainDrops);
      const pVx = playerVel ? playerVel.x * 0.04 : 0;
      const pVz = playerVel ? playerVel.z * 0.04 : 0;

      for (let i = 0; i < count; i++) {
        const drop = this.rainOffset[i];
        drop.y -= drop.speed * delta;
        if (drop.y < -15.0) {
          drop.y = 75.0 + Math.random() * 20.0;
          drop.x = (Math.random() - 0.5) * 140;
          drop.z = (Math.random() - 0.5) * 140;
        }

        const worldX = playerPos.x + drop.x;
        const worldY = playerPos.y + drop.y;
        const worldZ = playerPos.z + drop.z;

        const base = i * 6;
        // Top vertex
        this.rainPos[base] = worldX;
        this.rainPos[base + 1] = worldY;
        this.rainPos[base + 2] = worldZ;

        // Bottom vertex with velocity angle
        this.rainPos[base + 3] = worldX - pVx;
        this.rainPos[base + 4] = worldY - drop.len;
        this.rainPos[base + 5] = worldZ - pVz;
      }
      this.rainGeo.setDrawRange(0, count * 2);
      this.rainGeo.attributes.position.needsUpdate = true;
    }

    // 7. Update Speed Lines (> 340 km/h or Overdrive Boost)
    const speedRatio = isBoosting ? 1.0 : Math.max(0.0, (speedKmh - 340.0) / 100.0);
    this.speedLinesMesh.material.opacity = Math.min(0.40, speedRatio * (isBoosting ? 0.45 : 0.25));

    if (this.speedLinesMesh.material.opacity > 0.01) {
      const lineCount = Math.min(this.activeSpeedLines || 50, this.maxSpeedLines);
      for (let i = 0; i < lineCount; i++) {
        const line = this.speedLinesData[i];
        line.z += line.speed * delta * (1.0 + speedRatio * 0.8);
        if (line.z > 5.0) {
          line.z = -80.0 - Math.random() * 25.0;
          line.angle = Math.random() * Math.PI * 2;
          line.radius = 22.0 + Math.random() * 32.0;
        }

        const lx = Math.cos(line.angle) * line.radius;
        const ly = Math.sin(line.angle) * line.radius;

        const base = i * 6;
        // Line start (further away)
        this.speedLinePos[base] = lx;
        this.speedLinePos[base + 1] = ly;
        this.speedLinePos[base + 2] = line.z - line.len;

        // Line end (closer)
        this.speedLinePos[base + 3] = lx;
        this.speedLinePos[base + 4] = ly;
        this.speedLinePos[base + 5] = line.z;
      }
      this.speedLineGeo.setDrawRange(0, lineCount * 2);
      this.speedLineGeo.attributes.position.needsUpdate = true;
    }

    // 8. Update Confetti
    if (this.confettiActive) {
      let activeCount = 0;
      for (let i = 0; i < this.maxConfetti; i++) {
        if (this.confettiLife[i] > 0.0) {
          this.confettiLife[i] -= delta * 0.25;
          this.confettiVel[i].y -= 8.0 * delta; // Gravity
          this.confettiPos[i * 3] += this.confettiVel[i].x * delta;
          this.confettiPos[i * 3 + 1] += this.confettiVel[i].y * delta;
          this.confettiPos[i * 3 + 2] += this.confettiVel[i].z * delta;
          activeCount++;
        }
      }
      this.confettiGeo.attributes.position.needsUpdate = true;
      if (activeCount === 0) {
        this.confettiActive = false;
        this.confettiPoints.material.opacity = 0.0;
      }
    }
  }
}
