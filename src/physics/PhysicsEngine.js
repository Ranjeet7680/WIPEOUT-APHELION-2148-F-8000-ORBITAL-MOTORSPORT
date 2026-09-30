import * as THREE from 'three';
import { PIDController } from './PIDController.js';
import { SIMDSuspension } from './SIMDSuspension.js';

// ============================================================================
// WIPEOUT: APHELION - 6-DOF ANTI-GRAVITY PHYSICS ENGINE (120Hz SUB-STEPPING)
// Tri-Vector Energy Diverter, 6-DOF Vacuum Rifts & Re-Anchor Gate Check,
// Friction Capacitor & Induction Wall-Grinding, Cobra Air-Anchor 180° Decoupling,
// and Kinetic Component Jettison (-18% Mass & Fairing Shedding)
// ============================================================================

export const POWER_PROFILES = {
  BALANCED: { thrust: 0.33, flux: 0.34, barrier: 0.33, label: 'BALANCED' },
  THRUST:   { thrust: 0.70, flux: 0.15, barrier: 0.15, label: 'THRUST OVERDRIVE' },
  FLUX:     { thrust: 0.15, flux: 0.70, barrier: 0.15, label: 'FLUX CLAMPING' },
  BARRIER:  { thrust: 0.15, flux: 0.15, barrier: 0.70, label: 'KINETIC BARRIER' }
};

export class PhysicsEngine {
  constructor(trackBuilder, soundEngine, particleSystem) {
    this.track = trackBuilder;
    this.sound = soundEngine;
    this.particles = particleSystem;

    // Fixed 120Hz sub-stepping
    this.fixedDt = 1.0 / 120.0; // 0.00833s
    this.accumulator = 0.0;

    // Target hover height
    this.hTarget = 1.6; // meters

    // 128-bit SIMD Vectorized Suspension Solver
    this.simdSuspension = new SIMDSuspension(110.0, 24.0);
    this.dragCoefficient = 0.32; // Normal 0.32, reduces to 0.18 when drafting, 0.27 when jettisoned

    // 4 Corner PID Levitation Controllers (FL, FR, RL, RR)
    this.pidProbes = [
      new PIDController(110.0, 5.0, 24.0, 600.0), // FL
      new PIDController(110.0, 5.0, 24.0, 600.0), // FR
      new PIDController(110.0, 5.0, 24.0, 600.0), // RL
      new PIDController(110.0, 5.0, 24.0, 600.0)  // RR
    ];

    // Probe local offsets from craft center of mass
    this.probeOffsets = [
      new THREE.Vector3(-0.95, -0.3, 1.2),  // FL
      new THREE.Vector3(0.95, -0.3, 1.2),   // FR
      new THREE.Vector3(-1.15, -0.3, -1.4), // RL
      new THREE.Vector3(1.15, -0.3, -1.4)   // RR
    ];

    // Physical state
    this.baseMass = 1200.0; // kg
    this.mass = 1200.0;
    this.pos = new THREE.Vector3(0, 25, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.quat = new THREE.Quaternion();
    this.angVel = new THREE.Vector3(0, 0, 0);

    // Previous state for visual interpolation
    this.prevPos = new THREE.Vector3();
    this.prevQuat = new THREE.Quaternion();

    // Inputs (Normalized -1..1 or 0..1)
    this.throttle = 0;
    this.steer = 0;
    this.pitchInput = 0;
    this.leftAirbrake = 0;
    this.rightAirbrake = 0;
    this.isBoosting = false;
    this.boostTimer = 0;

    // ------------------------------------------------------------------------
    // CORE 1: TRI-VECTOR ENERGY DIVERTER
    // ------------------------------------------------------------------------
    this.powerProfile = 'BALANCED';
    this.power = { thrust: 0.33, flux: 0.34, barrier: 0.33 };
    this.targetPower = { thrust: 0.33, flux: 0.34, barrier: 0.33 };

    // ------------------------------------------------------------------------
    // CORE 2: ORBITAL DE-ANCHORING & 6-DOF VACUUM RIFTS & RE-ANCHOR GATE
    // ------------------------------------------------------------------------
    this.inVacuumRift = false;
    this.wasVacuumRift = false;
    this.reAnchorAlignment = 0.0; // Alignment error in degrees
    this.reAnchorStatus = 'NORMAL'; // 'NORMAL' | 'LOCKED' | 'MISALIGNED'
    this.reAnchorTimer = 0.0;

    // ------------------------------------------------------------------------
    // CORE 3: FRICTION CAPACITOR & INDUCTION WALL-GRINDING
    // ------------------------------------------------------------------------
    this.frictionCapacitor = 0.0; // 0.0 to 1.0 (0% to 100%)
    this.isInductionGrinding = false;
    this.lastScrapeAngle = 0.0;

    // ------------------------------------------------------------------------
    // CORE 4: THE "COBRA AIR-ANCHOR" & 180° DECOUPLED TARGETING
    // ------------------------------------------------------------------------
    this.cobraActive = false;
    this.cobraTimer = 0.0;
    this.cobraCooldown = 0.0;
    this.cobraRotation = 0.0; // 0 rad (forward) to PI rad (180 deg rearward)

    // ------------------------------------------------------------------------
    // CORE 5: KINETIC COMPONENT JETTISON (DYNAMIC WEIGHT SHEDDING)
    // ------------------------------------------------------------------------
    this.jettisoned = false;
    this.asymmetricPull = 0.0; // Induced steering bias from damage (-0.25 to +0.25)
    this.jettisonAlertTimer = 0.0;

    // Gameplay stats
    this.shieldHealth = 1.0; // 1.0 = 100%
    this.maxShieldHealth = 1.0;
    this.isWallScraping = false;
    this.currentTrackU = 0;
    this.sonicBoomPlayed = false;
    this.hudGlitchTimer = 0.0;
    this.energyBarricades = [];
    this.teamHandlingMult = 1.0;

    // Reset to start line
    this.resetToStart();
  }

  setTeam(team) {
    if (!team) return;
    this.currentTeam = team;
    if (team.id === 'feisar') {
      this.baseMass = 1100.0;
      this.teamHandlingMult = 1.15;
      this.maxShieldHealth = 0.90;
    } else if (team.id === 'qirex') {
      this.baseMass = 1450.0;
      this.teamHandlingMult = 0.82;
      this.maxShieldHealth = 1.20;
    } else if (team.id === 'agSys') {
      this.baseMass = 980.0;
      this.teamHandlingMult = 1.05;
      this.maxShieldHealth = 0.82;
    } else if (team.id === 'auricom') {
      this.baseMass = 1250.0;
      this.teamHandlingMult = 0.95;
      this.maxShieldHealth = 1.10;
    } else if (team.id === 'pirHana') {
      this.baseMass = 1050.0;
      this.teamHandlingMult = 1.0;
      this.maxShieldHealth = 0.78;
    }
    this.mass = this.baseMass;
    this.shieldHealth = this.maxShieldHealth;
  }

  deployEnergyBarricade(pos) {
    this.energyBarricades.push({
      pos: pos.clone(),
      lifetime: 12.0 // Active for 12 seconds
    });
  }

  resetToStart() {
    const startFrame = this.track.samples[0];
    this.pos.copy(startFrame.pos).addScaledVector(startFrame.normal, this.hTarget + 0.2);
    this.vel.set(0, 0, 0);
    this.angVel.set(0, 0, 0);

    const m = new THREE.Matrix4().makeBasis(startFrame.binormal, startFrame.normal, startFrame.tangent);
    this.quat.setFromRotationMatrix(m);

    this.prevPos.copy(this.pos);
    this.prevQuat.copy(this.quat);
    // Restore team-specific max shield capacity; fall back to 1.0 if no team set yet
    if (this.currentTeam) {
      this.setTeam(this.currentTeam);
    } else {
      this.shieldHealth = 1.0;
      this.maxShieldHealth = 1.0;
    }
    this.currentTrackU = 0;
    this.mass = this.baseMass;
    this.dragCoefficient = 0.32;
    this.jettisoned = false;
    this.asymmetricPull = 0.0;
    this.frictionCapacitor = 0.0;
    this.isInductionGrinding = false;
    this.cobraActive = false;
    this.cobraTimer = 0.0;
    this.cobraCooldown = 0.0;
    this.cobraRotation = 0.0;
    this.reAnchorStatus = 'NORMAL';
    this.reAnchorTimer = 0.0;
    this.setPowerProfile('BALANCED');
  }

  // --------------------------------------------------------------------------
  // INPUT INGESTION & COBRA TRIGGER CHECK
  // --------------------------------------------------------------------------
  setInputs(throttle, steer, pitch, leftBrake, rightBrake, boost) {
    this.throttle = throttle;
    this.steer = steer;
    this.pitchInput = pitch;
    this.leftAirbrake = leftBrake;
    this.rightAirbrake = rightBrake;

    // Boost pad or manual shield boost
    if (boost && this.boostTimer <= 0 && this.shieldHealth > 0.15) {
      this.activateBoost();
    }

    // CHECK COBRA AIR-ANCHOR INITIATION:
    // 100% Dual Airbrakes ([Q] + [E]) + Violent Pitch-Up ([S] or Down Arrow) at > 120 km/h
    const isDualBraking = this.leftAirbrake > 0.85 && this.rightAirbrake > 0.85;
    const isPitchingUp = this.pitchInput < -0.7; // Negative pitchInput = nose-up
    const currentSpeed = this.vel.length() * 3.6;

    if (isDualBraking && isPitchingUp && currentSpeed > 120 && this.cobraCooldown <= 0 && !this.cobraActive) {
      this.engageCobraAnchor();
    }
  }

  // --------------------------------------------------------------------------
  // CORE 1: TRI-VECTOR ENERGY DIVERTER CONTROL
  // --------------------------------------------------------------------------
  setPowerProfile(profileKey) {
    if (POWER_PROFILES[profileKey]) {
      this.powerProfile = profileKey;
      this.targetPower = { ...POWER_PROFILES[profileKey] };
    }
  }

  cyclePowerProfile() {
    const keys = Object.keys(POWER_PROFILES);
    const currIdx = keys.indexOf(this.powerProfile);
    const nextKey = keys[(currIdx + 1) % keys.length];
    this.setPowerProfile(nextKey);
    return nextKey;
  }

  // --------------------------------------------------------------------------
  // CORE 3: FRICTION CAPACITOR DISCHARGE (BURNOUT / EMP)
  // --------------------------------------------------------------------------
  dischargeCapacitor(mode = 'BURNOUT', aiRacers = []) {
    if (mode === 'BURNOUT') {
      if (this.frictionCapacitor < 0.35) return false;
      // Unleash stored induction current into MHD afterburners: +45 m/s (+162 km/h) catapult boost!
      const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(this.quat);
      const impulseMagnitude = 45.0 * (this.frictionCapacitor / 1.0);
      this.vel.addScaledVector(fwd, impulseMagnitude);
      this.frictionCapacitor = 0.0;

      if (this.sound) this.sound.playBurnoutBoost();
      this.particles.triggerSonicBoom(this.pos, fwd);
      return true;
    } else if (mode === 'EMP') {
      if (this.frictionCapacitor < 0.60) return false;
      // Radial EMP Pulse (25m wave disabling adjacent rival flux clamping)
      const empRadius = 25.0;
      this.particles.emitRadialEMP(this.pos, empRadius);
      if (this.sound) this.sound.playEMPPulse();
      this.frictionCapacitor = 0.0;

      // Disrupt nearby AI rival racers
      if (aiRacers && aiRacers.length > 0) {
        aiRacers.forEach(ai => {
          const dist = this.pos.distanceTo(ai.pos);
          if (dist <= empRadius) {
            ai.disruptFlux(3.0);
            ai.takeDamage(0.25, this.pos);
          }
        });
      }
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // CORE 4: COBRA AIR-ANCHOR & 180° DECOUPLED REARWARD TARGETING
  // --------------------------------------------------------------------------
  engageCobraAnchor() {
    this.cobraActive = true;
    this.cobraTimer = 1.8; // 1.8 seconds max decoupled window
    this.cobraCooldown = 4.5; // Cooldown before next Cobra

    if (this.sound) this.sound.playCobraEngage();
  }

  fireRailgun(aiRacers = []) {
    // Determine firing direction: forward normally, or 180° backward if Cobra is active!
    let fireDir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.quat);
    if (this.cobraRotation > 1.5) {
      // Rotate 180° backward along craft local up axis
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.quat);
      fireDir.applyAxisAngle(up, this.cobraRotation);
    }

    const startPos = this.pos.clone().addScaledVector(fireDir, 2.8);
    const range = 280.0; // meters

    this.particles.emitRailgunBolt(startPos, fireDir, range);
    if (this.sound) this.sound.playRailgunFire();

    // Hit-scan cylinder test against AI racers
    let hitRival = null;
    let closestDist = range;

    if (aiRacers && aiRacers.length > 0) {
      for (const ai of aiRacers) {
        if (ai.isEliminated) continue;
        const toAi = ai.pos.clone().sub(startPos);
        const proj = toAi.dot(fireDir);
        if (proj > 2.0 && proj < closestDist) {
          const perpDist = toAi.clone().subScaledVector(fireDir, proj).length();
          if (perpDist < 3.8) { // craft hit radius
            closestDist = proj;
            hitRival = ai;
          }
        }
      }
    }

    if (hitRival) {
      hitRival.takeDamage(0.35, startPos);
      const hitPos = startPos.clone().addScaledVector(fireDir, closestDist);
      const trackSurfaceY = hitRival.pos ? hitRival.pos.y : 0.0;
      this.particles.emitSparks(hitPos, fireDir.clone().negate(), 35, false, this.vel, trackSurfaceY);
    }

    return hitRival;
  }

  // --------------------------------------------------------------------------
  // CORE 5: KINETIC COMPONENT JETTISON (DYNAMIC WEIGHT SHEDDING)
  // --------------------------------------------------------------------------
  triggerEmergencyJettison() {
    if (this.jettisoned) return false;

    this.jettisoned = true;
    this.jettisonAlertTimer = 3.0;

    // 1. Shed 18% dry mass: 1200 kg -> 984 kg
    this.mass = this.baseMass * 0.82;

    // 2. Drop drag coefficient: 0.32 -> 0.27
    this.dragCoefficient = 0.27;

    // 3. Clear all asymmetric pull (bent fairings and canards are ejected!)
    this.asymmetricPull = 0.0;

    // 4. Max shield capacity reduced to 75%
    this.maxShieldHealth = 0.75;
    this.shieldHealth = Math.min(this.shieldHealth, this.maxShieldHealth);

    if (this.sound) this.sound.playJettisonExplosion();

    // Spawn explosive composite fairing debris flying backward
    const backDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quat);
    this.particles.triggerElimination(this.pos, backDir.multiplyScalar(40.0), 0xE0E0E0);
    return true;
  }

  activateBoost() {
    this.isBoosting = true;
    this.boostTimer = 2.2; // seconds of hyper-boost
    if (this.sound) this.sound.playBoostPadSound();

    // Forward impulse: +35% instantaneous velocity surge (minimum +55 m/s)
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(this.quat);
    const speed = this.vel.length();
    const impulse = Math.max(55.0, speed * 0.35);
    this.vel.addScaledVector(fwd, impulse);
    if (this.particles) this.particles.triggerSonicBoom(this.pos, fwd);
  }

  // --------------------------------------------------------------------------
  // GAME LOOP SUB-STEPPING (Accumulator pattern for rock-solid 120Hz physics)
  // --------------------------------------------------------------------------
  update(frameDelta) {
    const clampedDelta = Math.min(frameDelta, 0.08);
    this.accumulator += clampedDelta;

    while (this.accumulator >= this.fixedDt) {
      this.prevPos.copy(this.pos);
      this.prevQuat.copy(this.quat);

      this.stepPhysics(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    const alpha = this.accumulator / this.fixedDt;
    return alpha;
  }

  // --------------------------------------------------------------------------
  // 120Hz FIXED PHYSICS TICK
  // --------------------------------------------------------------------------
  stepPhysics(dt) {
    // Boost timer
    if (this.boostTimer > 0) {
      this.boostTimer -= dt;
      if (this.boostTimer <= 0) {
        this.isBoosting = false;
      }
    }

    // Cobra Air-Anchor Timer & Cooldown
    if (this.cobraTimer > 0) {
      this.cobraTimer -= dt;
      // Smoothly rotate 180° (PI radians) backward
      this.cobraRotation = THREE.MathUtils.lerp(this.cobraRotation, Math.PI, dt * 7.5);

      if (this.cobraTimer <= 0 || (this.leftAirbrake < 0.3 && this.rightAirbrake < 0.3)) {
        this.cobraActive = false;
        this.cobraTimer = 0.0;
      }
    } else {
      // Smoothly snap back forward to 0 rad
      this.cobraRotation = THREE.MathUtils.lerp(this.cobraRotation, 0.0, dt * 8.5);
    }

    if (this.cobraCooldown > 0) this.cobraCooldown -= dt;
    if (this.reAnchorTimer > 0) this.reAnchorTimer -= dt;
    if (this.jettisonAlertTimer > 0) this.jettisonAlertTimer -= dt;
    if (this.hudGlitchTimer > 0) this.hudGlitchTimer -= dt;

    // Check dynamic energy barricades (deployed by eliminated opponents ahead)
    for (let i = this.energyBarricades.length - 1; i >= 0; i--) {
      const b = this.energyBarricades[i];
      b.lifetime -= dt;
      if (b.lifetime <= 0) {
        this.energyBarricades.splice(i, 1);
        continue;
      }
      if (this.pos.distanceTo(b.pos) < 18.0) {
        this.hudGlitchTimer = 0.2; // 0.2s forward telemetry corruption
      }
    }

    // Smooth Tri-Vector Power transitions
    this.power.thrust = THREE.MathUtils.lerp(this.power.thrust, this.targetPower.thrust, dt * 6.0);
    this.power.flux = THREE.MathUtils.lerp(this.power.flux, this.targetPower.flux, dt * 6.0);
    this.power.barrier = THREE.MathUtils.lerp(this.power.barrier, this.targetPower.barrier, dt * 6.0);

    // Current Craft Direction Vectors in World Space
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(this.quat);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.quat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.quat);

    // 1. Query Track Frame at craft position
    const trackInfo = this.track.getClosestTrackFrame(this.pos);
    this.currentTrackU = trackInfo.u;
    const isNowVacuum = this.track.isVacuumRift(this.currentTrackU);

    // ------------------------------------------------------------------------
    // CORE 2: VACUUM RIFT & RE-ANCHOR GATE ALIGNMENT CHECK (<= 30° catch vs > 30° bounce)
    // ------------------------------------------------------------------------
    if (this.wasVacuumRift && !isNowVacuum) {
      // Craft just exited the 6-DOF Vacuum Rift! Check vector alignment
      const velNorm = this.vel.length() > 5.0 ? this.vel.clone().normalize() : fwd;
      const trackTan = trackInfo.tangent.clone().normalize();
      const dot = THREE.MathUtils.clamp(velNorm.dot(trackTan), -1.0, 1.0);
      const alignmentAngleDeg = Math.acos(dot) * (180.0 / Math.PI);

      this.reAnchorAlignment = alignmentAngleDeg;
      this.reAnchorTimer = 2.5;

      if (alignmentAngleDeg <= 30.0) {
        // Smooth magnetic catch! Magnetic funnels apply corrective force aligning craft
        this.reAnchorStatus = 'LOCKED';
        if (this.sound) this.sound.playReAnchorLatch(true);

        // Correct craft velocity toward track tangent
        const currentSpeed = this.vel.length();
        this.vel.lerp(trackTan.clone().multiplyScalar(currentSpeed), 0.5);

        const trackSurfaceY = trackInfo.pos ? trackInfo.pos.y : 0.0;
        this.particles.emitSparks(this.pos, trackInfo.normal, 28, false, this.vel, trackSurfaceY);
      } else {
        // Violent hull bounce! Momentum loss & structural damage (> 30° deviation)
        this.reAnchorStatus = 'MISALIGNED';
        if (this.sound) this.sound.playReAnchorLatch(false);

        // 40% speed drop penalty
        this.vel.multiplyScalar(0.60);

        // 20% hull damage (mitigated by barrier power)
        const damageTaken = 0.20 * (1.0 - this.power.barrier * 0.85);
        this.shieldHealth = Math.max(0.0, this.shieldHealth - damageTaken);

        // Violent tumbling torque impulse
        this.angVel.add(new THREE.Vector3(
          (Math.random() - 0.5) * 4.0,
          (Math.random() - 0.5) * 4.0,
          (Math.random() - 0.5) * 4.0
        ));

        // Massive spark eruption
        const trackSurfaceY = trackInfo.pos ? trackInfo.pos.y : 0.0;
        this.particles.emitSparks(this.pos, trackInfo.normal, 65, true, this.vel, trackSurfaceY);
      }
    }
    this.wasVacuumRift = isNowVacuum;
    this.inVacuumRift = isNowVacuum;

    // Forces and Torques accumulator
    const netForce = new THREE.Vector3(0, 0, 0);
    const netTorque = new THREE.Vector3(0, 0, 0);

    // 2. MAGNETIC FLUX CLAMPING (Scaled dynamically by Tri-Vector Diverter)
    // Pulls craft down toward track bed whether upright, vertical wall, or inverted loop
    // In vacuum rift: drops to 0 (free floating zero-G!)
    const magFluxCoilStrength = this.inVacuumRift
      ? 0.0
      : (18.0 + this.power.flux * 72.0); // 18 m/s^2 at min, up to ~68-85 m/s^2 at 70% flux!
    
    if (magFluxCoilStrength > 0) {
      const gravityForce = trackInfo.normal.clone().multiplyScalar(-magFluxCoilStrength * this.mass);
      netForce.add(gravityForce);
    }

    // Track normal restorative alignment torque (zero in vacuum rift)
    if (!this.inVacuumRift) {
      const alignAxis = new THREE.Vector3().crossVectors(up, trackInfo.normal);
      const alignStrength = 22.0 + this.power.flux * 75.0;
      const alignTorque = alignAxis.multiplyScalar(alignStrength * this.mass);
      netTorque.add(alignTorque);
    }

    // 3. 4-PROBE PID-CONTROLLED LEVITATION SUSPENSION
    for (let i = 0; i < 4; i++) {
      const probeWorldPos = this.probeOffsets[i].clone().applyQuaternion(this.quat).add(this.pos);
      const probeTrackInfo = this.track.getClosestTrackFrame(probeWorldPos);

      // Measure current probe height h above track surface
      const deltaH = probeWorldPos.clone().sub(probeTrackInfo.pos).dot(probeTrackInfo.normal);

      // In vacuum rift, suspension softly decouples
      const targetH = this.inVacuumRift ? this.hTarget + 0.6 : this.hTarget;
      const pidForceMagnitude = this.pidProbes[i].compute(targetH, deltaH, dt);

      // Repulsor push along probe's track normal
      const repulsorScale = this.inVacuumRift ? 0.35 : 1.0;
      const repulsorForce = probeTrackInfo.normal.clone().multiplyScalar(pidForceMagnitude * (this.mass / 4.0) * repulsorScale);
      netForce.add(repulsorForce);

      // Torque = r x F
      const probeArm = this.probeOffsets[i].clone().applyQuaternion(this.quat);
      const probeTorque = new THREE.Vector3().crossVectors(probeArm, repulsorForce);
      netTorque.add(probeTorque.multiplyScalar(0.7));
    }

    // 4. THRUST & ION PROPULSION (Scaled by Tri-Vector Overdrive & Jettison)
    const baseThrust = 48000.0; // Newtons
    const boostMultiplier = this.isBoosting ? 2.2 : 1.0;
    const powerThrustScale = 0.60 + this.power.thrust * 1.30; // 0.80 Balanced, 1.51 Thrust Overdrive
    const jettisonAccelBoost = this.jettisoned ? 1.22 : 1.0; // +22% acceleration when fairings shed

    const currentThrust = this.throttle * baseThrust * powerThrustScale * boostMultiplier * jettisonAccelBoost;
    netForce.add(fwd.clone().multiplyScalar(currentThrust));

    // 5. STEERING & LATERAL CONTROL (With asymmetric pull from persistent damage)
    const effectiveSteer = this.steer + this.asymmetricPull;
    const yawStrength = 16.0 * this.mass;
    netTorque.add(up.clone().multiplyScalar(-effectiveSteer * yawStrength));

    // Pitch control (nose up/down)
    const pitchStrength = 8.0 * this.mass;
    netTorque.add(right.clone().multiplyScalar(this.pitchInput * pitchStrength));

    // 6. DUAL INDEPENDENT AIRBRAKES & COBRA DRAG
    const speed = this.vel.length();
    const airbrakeYawCoeff = 24.0 * this.mass;
    const airbrakeDragCoeff = 3200.0;

    if (this.leftAirbrake > 0) {
      netTorque.add(up.clone().multiplyScalar(this.leftAirbrake * airbrakeYawCoeff * (speed / 100.0)));
      const leftDrag = fwd.clone().multiplyScalar(-this.leftAirbrake * airbrakeDragCoeff * (speed / 100.0));
      netForce.add(leftDrag);
    }

    if (this.rightAirbrake > 0) {
      netTorque.add(up.clone().multiplyScalar(-this.rightAirbrake * airbrakeYawCoeff * (speed / 100.0)));
      const rightDrag = fwd.clone().multiplyScalar(-this.rightAirbrake * airbrakeDragCoeff * (speed / 100.0));
      netForce.add(rightDrag);
    }

    // Cobra Air-Anchor: 16 kinetic surfaces deployment aerodynamic drag
    if (this.cobraActive) {
      const cobraDrag = this.vel.clone().multiplyScalar(-0.35 * speed);
      netForce.add(cobraDrag);
    }

    // 7. ATMOSPHERIC DRAG vs VACUUM RIFT
    const airDensity = this.inVacuumRift ? 0.04 : 1.0;
    const dragCoeff = this.dragCoefficient * airDensity;
    const dragForce = this.vel.clone().multiplyScalar(-0.5 * dragCoeff * speed * speed);
    netForce.add(dragForce);

    // Lateral drift friction (Grip-drift feel scaled by Flux Clamping)
    const lateralVel = right.clone().multiplyScalar(this.vel.dot(right));
    const lateralGripFactor = this.inVacuumRift
      ? 1.8
      : (2.2 + this.power.flux * 6.5); // Drifty in Thrust, rock-solid locked in Flux
    netForce.add(lateralVel.multiplyScalar(-lateralGripFactor * this.mass));

    // Angular damping (stabilizes tumbling)
    this.angVel.multiplyScalar(0.94);

    // Cold-Gas RCS puffs in Vacuum Rift when steering
    if (this.inVacuumRift && Math.abs(this.steer) > 0.2 && Math.random() < 0.35) {
      const rcsPos = this.pos.clone().addScaledVector(fwd, 2.0);
      const rcsDir = right.clone().multiplyScalar(this.steer > 0 ? -1 : 1);
      this.particles.emitRCSPuff(rcsPos, rcsDir);
    }

    // 8. INTEGRATE LINEAR MOTION (Verlet/Euler)
    const accel = netForce.divideScalar(this.mass);
    this.vel.addScaledVector(accel, dt);
    this.pos.addScaledVector(this.vel, dt);

    // 9. INTEGRATE ANGULAR MOTION
    const angAccel = netTorque.divideScalar(this.mass * 2.0);
    this.angVel.addScaledVector(angAccel, dt);

    const deltaRot = new THREE.Quaternion(
      this.angVel.x * dt * 0.5,
      this.angVel.y * dt * 0.5,
      this.angVel.z * dt * 0.5,
      1.0
    ).normalize();
    this.quat.multiply(deltaRot).normalize();

    // ------------------------------------------------------------------------
    // CORE 3: TRACK BOUNDARIES, ACUTE INDUCTION SCRAPING & FRICTION CAPACITOR
    // ------------------------------------------------------------------------
    const halfWidth = trackInfo.trackWidth * 0.5;
    const lateralOffset = trackInfo.lateralOffset;
    const maxOffset = halfWidth - 1.1;

    if (Math.abs(lateralOffset) > maxOffset) {
      this.isWallScraping = true;
      const penetration = Math.abs(lateralOffset) - maxOffset;
      const normalDir = lateralOffset > 0 ? -1 : 1; // Push inward
      const wallNormal = trackInfo.binormal.clone().multiplyScalar(normalDir);

      // Compute scraping angle against wall normal
      const velNorm = speed > 1.0 ? this.vel.clone().normalize() : fwd;
      const normalComp = Math.abs(velNorm.dot(wallNormal));
      const scrapeAngleDeg = Math.asin(THREE.MathUtils.clamp(normalComp, 0.0, 1.0)) * (180.0 / Math.PI);
      this.lastScrapeAngle = scrapeAngleDeg;

      const contactPoint = this.pos.clone().addScaledVector(trackInfo.binormal, (lateralOffset > 0 ? 1 : -1) * 1.5);
      const trackSurfaceY = trackInfo.pos ? trackInfo.pos.y : 0.0;

      if (scrapeAngleDeg < 15.0) {
        // ACUTE ANGLE SCRAPING (< 15°): Tungsten-Copper contact skids engage!
        this.isInductionGrinding = true;

        // ZERO SPEED PENALTY: No vel.multiplyScalar(0.985)!
        // Charge the Friction Capacitor: 0 to 100% in ~2.2s of grinding
        this.frictionCapacitor = Math.min(1.0, this.frictionCapacitor + dt * 0.45);

        // Minimal shield wear mitigated by Kinetic Barrier
        const barrierAbsorption = 1.0 - this.power.barrier * 0.85;
        this.shieldHealth = Math.max(0.0, this.shieldHealth - 0.005 * dt * barrierAbsorption);

        // Soft rebound along normal to smoothly guide along barrier
        const softRebound = wallNormal.clone().multiplyScalar(penetration * 26000.0);
        this.vel.addScaledVector(softRebound.divideScalar(this.mass), dt);

        // Emit electric-blue & gold induction arcs
        this.particles.emitInductionArcs(contactPoint, wallNormal);
        if (this.sound && Math.random() < 0.28) {
          this.sound.playInductionGrind(0.75);
        }
      } else {
        // VIOLENT PERPENDICULAR COLLISION (>= 15°):
        this.isInductionGrinding = false;

        // Severe friction drag penalty
        this.vel.multiplyScalar(0.985);

        // Structural shield damage (scaled by Kinetic Barrier)
        const barrierAbsorption = 1.0 - this.power.barrier * 0.85;
        this.shieldHealth = Math.max(0.0, this.shieldHealth - 0.07 * dt * barrierAbsorption);

        // Damage can induce asymmetric pull unless already jettisoned
        if (!this.jettisoned && Math.random() < 0.07) {
          this.asymmetricPull += (lateralOffset > 0 ? -0.05 : 0.05);
          this.asymmetricPull = THREE.MathUtils.clamp(this.asymmetricPull, -0.22, 0.22);
        }

        // Hard Rebound Force
        const reboundForce = wallNormal.clone().multiplyScalar(penetration * 48000.0);
        this.vel.addScaledVector(reboundForce.divideScalar(this.mass), dt);

        // Standard ballistic sparks & impact audio
        this.particles.emitSparks(contactPoint, wallNormal, 14, true, this.vel, trackSurfaceY);
        if (this.sound && Math.random() < 0.25) {
          this.sound.playWallScrape(0.65);
        }
      }
    } else {
      this.isWallScraping = false;
      this.isInductionGrinding = false;
    }

    // 11. BOOST PADS INTERACTION
    for (const boostPad of this.track.boostPads) {
      let deltaU = Math.abs(this.currentTrackU - boostPad);
      if (deltaU > 0.5) deltaU = 1.0 - deltaU;

      if (deltaU < 0.015 && Math.abs(lateralOffset) < 4.2) {
        this.activateBoost();
        const trackSurfaceY = trackInfo.pos ? trackInfo.pos.y : 0.0;
        this.particles.emitSparks(this.pos, trackInfo.normal, 25, false, this.vel, trackSurfaceY);
        break;
      }
    }

    // 12. MACH 1 SONIC BOOM CHECK (~1050 km/h)
    const speedKmh = this.getSpeedKmh();
    if (speedKmh > 1050 && !this.sonicBoomPlayed) {
      this.sonicBoomPlayed = true;
      if (this.sound) this.sound.playSonicBoom();
      this.particles.triggerSonicBoom(this.pos, fwd);
    } else if (speedKmh < 980) {
      this.sonicBoomPlayed = false;
    }
  }

  getSpeedKmh() {
    return this.vel.length() * 3.6;
  }

  // Get smooth interpolated transform for rendering (with Cobra 180° visual decoupling)
  getInterpolatedTransform(alpha) {
    const renderPos = new THREE.Vector3().lerpVectors(this.prevPos, this.pos, alpha);
    const renderQuat = new THREE.Quaternion().copy(this.prevQuat).slerp(this.quat, alpha);

    // If Cobra Air-Anchor is active or transitioning, apply decoupled yaw rotation
    if (this.cobraRotation > 0.001) {
      const up = new THREE.Vector3(0, 1, 0);
      const decoupledYaw = new THREE.Quaternion().setFromAxisAngle(up, this.cobraRotation);
      renderQuat.multiply(decoupledYaw);
    }

    return { pos: renderPos, quat: renderQuat };
  }
}
