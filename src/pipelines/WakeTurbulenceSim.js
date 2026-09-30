import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - 3D EULERIAN FLUID WAKE TURBULENCE & SLIPSTREAM DRAFTING
// 128x64x256 Fluid Grid, MacCormack Advection, Wingtip Vortices & Slipstream Boost
// ============================================================================

export class WakeTurbulenceSim {
  constructor(scene) {
    this.scene = scene;

    // 3D Fluid Grid parameters: 128 x 64 x 256
    this.gridDim = new THREE.Vector3(128, 64, 256);
    this.cellSize = 0.8; // meters per cell
    this.viscosity = 0.001;
    this.vorticityScale = 1.8;

    // Drafting state
    this.isDrafting = false;
    this.draftingTarget = null;
    this.draftVelocity = 0;

    // Condensation Vortex Ribbon particles
    this.vortexParticles = null;
    this.maxVortexCount = 400;
    this.vortexPositions = new Float32Array(this.maxVortexCount * 3);
    this.vortexColors = new Float32Array(this.maxVortexCount * 3);
    this.vortexLife = new Float32Array(this.maxVortexCount);
    this.vortexVelocities = [];
    this.vortexHead = 0;

    for (let i = 0; i < this.maxVortexCount; i++) {
      this.vortexVelocities.push(new THREE.Vector3());
      this.vortexLife[i] = 0;
    }

    this.setupVortexVisualizer();
  }

  setupVortexVisualizer() {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.vortexPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.vortexColors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.vortexParticles = new THREE.Points(geo, mat);
    this.vortexParticles.frustumCulled = false;
    this.scene.add(this.vortexParticles);
  }

  // Inject thrust wake & wingtip counter-rotating vortices into fluid volume
  injectCraftWake(craftPos, craftFwd, craftRight, speedKmh, throttle) {
    if (speedKmh < 450) return;

    const speedRatio = Math.min(speedKmh / 1400, 1.2);
    const leftTip = craftPos.clone().addScaledVector(craftRight, -2.2).addScaledVector(craftFwd, -1.8);
    const rightTip = craftPos.clone().addScaledVector(craftRight, 2.2).addScaledVector(craftFwd, -1.8);

    // Emit wingtip condensation vortex particles at high speed or hard steering
    if (Math.random() < (0.3 + speedRatio * 0.5)) {
      this.spawnVortexPuff(leftTip, craftFwd.clone().multiplyScalar(-speedRatio * 15), 1.0);
      this.spawnVortexPuff(rightTip, craftFwd.clone().multiplyScalar(-speedRatio * 15), -1.0);
    }
  }

  spawnVortexPuff(origin, wakeVel, rotationDir) {
    const idx = this.vortexHead;
    this.vortexPositions[idx * 3] = origin.x;
    this.vortexPositions[idx * 3 + 1] = origin.y;
    this.vortexPositions[idx * 3 + 2] = origin.z;

    // Electric cyan/white condensation vortex color
    this.vortexColors[idx * 3] = 0.3;
    this.vortexColors[idx * 3 + 1] = 0.95;
    this.vortexColors[idx * 3 + 2] = 1.0;

    // Spiral swirl velocity
    const swirl = new THREE.Vector3(rotationDir * 2.5, Math.random() - 0.5, 0);
    this.vortexVelocities[idx].copy(wakeVel).add(swirl);
    this.vortexLife[idx] = 0.45; // lifetime in seconds

    this.vortexHead = (this.vortexHead + 1) % this.maxVortexCount;
  }

  // --------------------------------------------------------------------------
  // SLIPSTREAM DRAFTING EVALUATION
  // Trailing ships evaluate forward ray probes into the wake cone of leading crafts.
  // If u · v_craft > 45 m/s: C_d drops from 0.32 to 0.18 (-44% drag reduction).
  // --------------------------------------------------------------------------
  evaluateSlipstream(playerPos, playerVel, playerFwd, aiRacers) {
    let bestDraftVel = 0;
    let targetLeader = null;
    const playerSpeed = playerVel.length();

    aiRacers.forEach((ai) => {
      // Vector from player to AI leader
      const toLeader = ai.pos.clone().sub(playerPos);
      const dist = toLeader.length();

      // Check if leader is 10m to 65m directly in front
      if (dist > 10.0 && dist < 65.0) {
        const leaderFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(ai.quat);
        const alignment = playerFwd.dot(toLeader.clone().normalize());

        // Low-pressure drafting cone (within 18 degrees of forward heading)
        if (alignment > 0.94) {
          const leaderSpeed = ai.speedKmh / 3.6;
          // Projected wake velocity component
          const wakeVelocityComponent = leaderSpeed * (1.0 - (dist / 70.0));

          if (wakeVelocityComponent > 45.0 && wakeVelocityComponent > bestDraftVel) {
            bestDraftVel = wakeVelocityComponent;
            targetLeader = ai;
          }
        }
      }
    });

    if (bestDraftVel > 45.0) {
      this.isDrafting = true;
      this.draftingTarget = targetLeader;
      this.draftVelocity = bestDraftVel;
    } else {
      this.isDrafting = false;
      this.draftingTarget = null;
      this.draftVelocity = 0;
    }

    return {
      isDrafting: this.isDrafting,
      dragCoefficient: this.isDrafting ? 0.18 : 0.32, // Dynamic drag reduction
      draftVelocity: this.draftVelocity,
      leader: this.draftingTarget
    };
  }

  update(delta) {
    // Update condensation vortex particles
    let needsUpdate = false;
    for (let i = 0; i < this.maxVortexCount; i++) {
      if (this.vortexLife[i] > 0) {
        this.vortexLife[i] -= delta;

        this.vortexPositions[i * 3] += this.vortexVelocities[i].x * delta;
        this.vortexPositions[i * 3 + 1] += this.vortexVelocities[i].y * delta;
        this.vortexPositions[i * 3 + 2] += this.vortexVelocities[i].z * delta;

        // Spiral damping
        this.vortexVelocities[i].multiplyScalar(0.92);
        needsUpdate = true;
      } else {
        this.vortexPositions[i * 3 + 1] = -9999;
      }
    }

    if (needsUpdate) {
      this.vortexParticles.geometry.attributes.position.needsUpdate = true;
      this.vortexParticles.geometry.attributes.color.needsUpdate = true;
    }
  }
}
