import * as THREE from 'three';

// ============================================================================
// ENHANCED ARCADE RACING PHYSICS ENGINE (120Hz Fixed Sub-Stepping)
// Dynamic Vehicle Specs, Stunt Ramps, Aerial Barrel Rolls, 360 Spins,
// 3-Tier Hyper-Boost & Overdrive, Airbrakes (Q/E), Lateral Momentum,
// Near Miss, Slipstream, Boost Pad Debounce & Zero-Allocation Math
// ============================================================================

// Module-level static scratch objects for zero-allocation 120Hz math
const _scratchVec1 = new THREE.Vector3();
const _scratchVec2 = new THREE.Vector3();
const _scratchQuat1 = new THREE.Quaternion();
const _scratchMat1 = new THREE.Matrix4();
const _interpPos = new THREE.Vector3();
const _interpQuat = new THREE.Quaternion();
const _interpTransform = { pos: _interpPos, quat: _interpQuat };

export class ArcadeRacingPhysics {
  constructor(circuit, soundEngine = null) {
    this.circuit = circuit;
    this.sound = soundEngine;

    // Fixed timestep accumulator (120 Hz)
    this.fixedDelta = 1.0 / 120.0;
    this.accumulator = 0.0;

    // Kinematic State
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.prevPos = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.prevQuat = new THREE.Quaternion();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.up = new THREE.Vector3(0, 1, 0);

    // Track progression
    this.currentU = 0.0;
    this.lateralOffset = 0.0; // [-13m .. +13m]
    this.lateralVelocity = 0.0; // Smooth 2nd order lateral momentum
    this.totalDistance = 0.0;
    this.currentLap = 1;

    // Vehicle Performance Specs (Initialized with F-8000 baseline)
    this.maxSpeedKmh = 420.0;
    this.baseMaxSpeedKmh = 380.0;
    this.boostMaxSpeedKmh = 440.0;
    this.accelRate = 185.0; // km/h per second
    this.brakeRate = 320.0;
    this.dragCoeff = 0.28;
    this.gripFactor = 0.88;
    this.handlingRate = 92;

    // Drift System
    this.isDrifting = false;
    this.driftDirection = 0;
    this.driftAngle = 0.0;
    this.driftDuration = 0.0;
    this.totalDriftScore = 0;
    this.totalDriftDistance = 0;

    // 3-Tier Hyper-Boost System (0..100%)
    this.boostCapacity = 1.0;
    this.isBoosting = false;
    this.boostTier = 'NORMAL'; // NORMAL, PERFECT, OVERDRIVE
    this.boostDuration = 0.0;
    this.totalBoostUses = 0;
    this.perfectBoostWindow = false;

    // Boost Pad Debounce tracking
    this.lastTriggeredPadIndex = -1;
    this.boostPadCooldown = 0.0;

    // Stunt System (Ramps, Barrel Roll, 360 Spin, Perfect Landing)
    this.stuntRamps = [0.22, 0.44, 0.82]; // Stunt ramp positions along 5.4km circuit
    this.aerialState = {
      inAir: false,
      altitude: 0.0,
      verticalVel: 0.0,
      barrelRollAngle: 0.0,
      spin360Angle: 0.0,
      barrelRollProgress: 0.0,
      spin360Progress: 0.0,
      airTime: 0.0,
      stuntsCompleted: 0
    };
    this.totalStunts = 0;
    this.comboCount = 1;
    this.comboTimer = 0.0;
    this.totalScore = 0;

    // Near Miss & Slipstream state
    this.totalNearMisses = 0;
    this.isSlipstreaming = false;
    this.slipstreamTimer = 0.0;
    this.lastNearMissTime = 0.0;

    // Player inputs
    this.inputs = {
      throttle: 0.0,
      steer: 0.0,
      brake: 0.0,
      drift: false,
      boost: false,
      energyBrake: false,
      airbrakeLeft: false,
      airbrakeRight: false
    };

    // Collision telemetry
    this.isColliding = false;
    this.collisionImpulse = 0.0;
    this.sparkBurst = false;

    // Action listener callback (triggers HUD popups)
    this.onAction = null;

    this.resetToStart();
  }

  applyVehicleSpecs(spec) {
    if (!spec) return;
    this.baseMaxSpeedKmh = spec.maxSpeedKmh ? spec.maxSpeedKmh * 0.9 : 380.0;
    this.boostMaxSpeedKmh = spec.maxSpeedKmh ? spec.maxSpeedKmh * 1.06 : 445.0;
    this.maxSpeedKmh = this.boostMaxSpeedKmh;
    this.accelRate = spec.accelRate || 185.0;
    this.brakeRate = spec.brakingRate || 320.0;
    this.handlingRate = spec.handlingRate || 92;
  }

  resetToStart() {
    const startFrame = this.circuit.getFrameAt(0.0);
    this.pos.copy(startFrame.pos).addScaledVector(startFrame.normal, 0.8);
    this.vel.set(0, 0, 0);
    this.prevPos.copy(this.pos);

    _scratchMat1.makeBasis(startFrame.binormal, startFrame.normal, startFrame.tangent);
    this.quat.setFromRotationMatrix(_scratchMat1);
    this.prevQuat.copy(this.quat);

    this.currentU = 0.0;
    this.lateralOffset = 0.0;
    this.lateralVelocity = 0.0;
    this.totalDistance = 0.0;
    this.currentLap = 1;
    this.boostCapacity = 1.0;
    this.isBoosting = false;
    this.boostTier = 'NORMAL';
    this.isDrifting = false;
    this.driftDuration = 0.0;
    this.totalDriftScore = 0;
    this.totalDriftDistance = 0;
    this.totalBoostUses = 0;
    this.totalStunts = 0;
    this.totalNearMisses = 0;
    this.totalScore = 0;
    this.comboCount = 1;
    this.comboTimer = 0.0;
    this.lastTriggeredPadIndex = -1;
    this.boostPadCooldown = 0.0;

    this.aerialState = {
      inAir: false,
      altitude: 0.0,
      verticalVel: 0.0,
      barrelRollAngle: 0.0,
      spin360Angle: 0.0,
      barrelRollProgress: 0.0,
      spin360Progress: 0.0,
      airTime: 0.0,
      stuntsCompleted: 0
    };
  }

  setInputs(inputs) {
    this.inputs.throttle = THREE.MathUtils.clamp(inputs.throttle || 0.0, 0.0, 1.0);
    this.inputs.steer = THREE.MathUtils.clamp(inputs.steer || 0.0, -1.0, 1.0);
    this.inputs.brake = THREE.MathUtils.clamp(inputs.brake || 0.0, 0.0, 1.0);
    this.inputs.drift = !!inputs.drift;
    this.inputs.boost = !!inputs.boost;
    this.inputs.energyBrake = !!inputs.energyBrake;
    this.inputs.airbrakeLeft = !!inputs.airbrakeLeft;
    this.inputs.airbrakeRight = !!inputs.airbrakeRight;
  }

  getSpeedKmh() {
    return this.vel.length() * 3.6;
  }

  triggerAction(name, points) {
    this.comboTimer = 3.5;
    const finalPoints = points * this.comboCount;
    this.totalScore += finalPoints;

    if (this.onAction) {
      this.onAction(name, finalPoints, this.comboCount);
    }

    if (this.sound && points >= 250) {
      this.sound.playLapChime();
    }
  }

  update(delta) {
    this.accumulator += Math.min(delta, 0.1);

    // Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboCount = 1;
      }
    }

    // Boost pad cooldown decay
    if (this.boostPadCooldown > 0) {
      this.boostPadCooldown -= delta;
    }

    while (this.accumulator >= this.fixedDelta) {
      this.prevPos.copy(this.pos);
      this.prevQuat.copy(this.quat);
      this.stepPhysics(this.fixedDelta);
      this.accumulator -= this.fixedDelta;
    }

    return this.accumulator / this.fixedDelta;
  }

  stepPhysics(dt) {
    let speedKmh = this.getSpeedKmh();

    // ------------------------------------------------------------------------
    // 1. 3-TIER HYPER-BOOST & OVERDRIVE SYSTEM
    // ------------------------------------------------------------------------
    if (this.inputs.boost && this.boostCapacity > 0.03) {
      if (!this.isBoosting) {
        this.isBoosting = true;
        this.totalBoostUses++;

        // Perfect Boost timing check (sweet spot: 60% to 85% capacity)
        if (this.boostCapacity >= 0.60 && this.boostCapacity <= 0.85) {
          this.boostTier = 'OVERDRIVE';
          this.triggerAction('PERFECT BOOST // OVERDRIVE', 350);
          this.comboCount++;
          if (this.sound && this.sound.playOverdriveBurstSound) {
            this.sound.playOverdriveBurstSound();
          }
        } else {
          this.boostTier = 'NORMAL';
        }
      }

      this.boostDuration += dt;
      const drainRate = this.boostTier === 'OVERDRIVE' ? 0.22 : 0.16;
      this.boostCapacity = Math.max(0.0, this.boostCapacity - dt * drainRate);

      if (this.sound && Math.random() > 0.90) {
        this.sound.playBoostPadSound();
      }
    } else {
      this.isBoosting = false;
      this.boostTier = 'NORMAL';
      this.boostDuration = 0.0;

      // Clean driving passive recharge at high speeds
      if (speedKmh > 220 && !this.isDrifting && !this.aerialState.inAir) {
        this.boostCapacity = Math.min(1.0, this.boostCapacity + dt * 0.045);
      }
    }

    // ------------------------------------------------------------------------
    // 2. DRIFT SYSTEM & ACTIVE RECHARGE
    // ------------------------------------------------------------------------
    const wantsDrift = (this.inputs.drift || (this.inputs.airbrakeLeft && this.inputs.steer < -0.2) || (this.inputs.airbrakeRight && this.inputs.steer > 0.2));
    if (wantsDrift && speedKmh > 80.0 && (Math.abs(this.inputs.steer) > 0.15 || this.inputs.airbrakeLeft || this.inputs.airbrakeRight) && !this.aerialState.inAir) {
      if (!this.isDrifting) {
        this.isDrifting = true;
        this.driftDirection = this.inputs.steer !== 0 ? Math.sign(this.inputs.steer) : (this.inputs.airbrakeLeft ? -1 : 1);
      }
      this.driftDuration += dt;
      const driftDist = (speedKmh / 3.6) * dt;
      this.totalDriftDistance += driftDist;
      this.totalDriftScore += Math.floor(speedKmh * dt * 2.5);

      // Drifting actively charges Hyper-Boost
      this.boostCapacity = Math.min(1.0, this.boostCapacity + dt * 0.18);
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, this.driftDirection * 0.48, dt * 7.0);

      if (this.driftDuration > 1.2 && Math.random() < 0.02) {
        this.triggerAction('POWER DRIFT', 120);
      }
    } else {
      this.isDrifting = false;
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, 0.0, dt * 9.0);
      this.driftDuration = 0.0;
    }

    // ------------------------------------------------------------------------
    // 3. ACCELERATION, BRAKING, AIRBRAKES & SLIPSTREAM
    // ------------------------------------------------------------------------
    let targetTopSpeed = this.isBoosting
      ? (this.boostTier === 'OVERDRIVE' ? this.boostMaxSpeedKmh + 20.0 : this.boostMaxSpeedKmh)
      : this.baseMaxSpeedKmh;

    if (this.isSlipstreaming) {
      targetTopSpeed += 30.0; // Slipstream top speed bonus
    }

    // Dual Airbrakes or dedicated Energy Brake
    const dualAirbrake = (this.inputs.airbrakeLeft && this.inputs.airbrakeRight);
    if (this.inputs.energyBrake || dualAirbrake) {
      speedKmh = Math.max(0.0, speedKmh - this.brakeRate * 2.2 * dt);
      if (this.sound && Math.random() > 0.92) {
        this.sound.playAirbrakeSound();
      }
    } else if (this.inputs.brake > 0.05) {
      speedKmh = Math.max(-50.0, speedKmh - this.brakeRate * this.inputs.brake * dt);
    } else if (this.inputs.throttle > 0.05) {
      const accelMult = (this.isBoosting ? 2.5 : 1.0) * (this.isSlipstreaming ? 1.3 : 1.0);
      speedKmh = Math.min(targetTopSpeed, speedKmh + this.accelRate * this.inputs.throttle * accelMult * dt);
    } else {
      // Natural aerodynamic drag
      speedKmh = Math.max(0.0, speedKmh - speedKmh * this.dragCoeff * dt * 0.85);
    }

    // ------------------------------------------------------------------------
    // 4. STUNT RAMPS & AERIAL STUNT SIMULATION
    // ------------------------------------------------------------------------
    let speedMs = speedKmh / 3.6;
    const trackLength = 5400.0;
    const deltaU = (speedMs * dt) / trackLength;

    const prevU = this.currentU;
    this.currentU = ((this.currentU + deltaU) % 1.0 + 1.0) % 1.0;
    this.totalDistance += speedMs * dt;

    if (prevU > 0.85 && this.currentU < 0.15) {
      this.currentLap++;
      if (this.sound) this.sound.playLapChime();
    }

    // Check Stunt Ramp Launch
    this.stuntRamps.forEach(rampU => {
      if (Math.abs(this.currentU - rampU) < 0.006 && !this.aerialState.inAir && speedKmh > 140) {
        this.aerialState.inAir = true;
        this.aerialState.verticalVel = 18.0 + (speedKmh / 420.0) * 12.0; // High launch
        this.aerialState.altitude = 0.5;
        this.aerialState.barrelRollAngle = 0;
        this.aerialState.spin360Angle = 0;
        this.aerialState.barrelRollProgress = 0;
        this.aerialState.spin360Progress = 0;
        this.aerialState.airTime = 0;
        this.triggerAction('RAMP LAUNCH', 200);
        this.comboCount++;
        if (this.sound) this.sound.playStuntWhoosh();
      }
    });

    // In-Air Physics & Aerial Stunts
    if (this.aerialState.inAir) {
      this.aerialState.airTime += dt;
      this.aerialState.verticalVel -= 28.0 * dt; // Gravity
      this.aerialState.altitude += this.aerialState.verticalVel * dt;

      // Aerial Barrel Roll on Steer
      if (Math.abs(this.inputs.steer) > 0.3) {
        const rollDir = Math.sign(this.inputs.steer);
        this.aerialState.barrelRollProgress += dt * 6.5;
        this.aerialState.barrelRollAngle = rollDir * this.aerialState.barrelRollProgress * Math.PI;

        if (this.aerialState.barrelRollProgress >= 2.0 && this.aerialState.barrelRollProgress - dt * 6.5 < 2.0) {
          this.totalStunts++;
          this.triggerAction('BARREL ROLL', 350);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.35);
          this.comboCount++;
          if (this.sound) this.sound.playStuntWhoosh();
        }
      }

      // Aerial 360 Spin on Boost in air
      if (this.inputs.boost) {
        this.aerialState.spin360Progress += dt * 7.0;
        this.aerialState.spin360Angle = this.aerialState.spin360Progress * Math.PI;

        if (this.aerialState.spin360Progress >= 2.0 && this.aerialState.spin360Progress - dt * 7.0 < 2.0) {
          this.totalStunts++;
          this.triggerAction('360 SPIN', 450);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.45);
          this.comboCount++;
          if (this.sound) this.sound.playStuntWhoosh();
        }
      }

      // Touchdown Check
      if (this.aerialState.altitude <= 0.0) {
        this.aerialState.inAir = false;
        this.aerialState.altitude = 0.0;
        this.aerialState.verticalVel = 0.0;

        // Perfect landing if barrel roll is close to multiple of 360°
        const rollError = Math.abs(this.aerialState.barrelRollAngle % (Math.PI * 2));
        if (rollError < 0.65 || rollError > Math.PI * 2 - 0.65) {
          this.triggerAction('PERFECT LANDING', 500);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.4);
          this.comboCount++;
          if (this.sound) this.sound.playPerfectLanding();
        } else {
          speedKmh = Math.max(160, speedKmh * 0.88); // Rough landing penalty
        }

        this.aerialState.barrelRollAngle = 0;
        this.aerialState.spin360Angle = 0;
      }
    }

    // ------------------------------------------------------------------------
    // 5. HOVERCRAFT LATERAL MOMENTUM & AIRBRAKE APEX CARVING
    // ------------------------------------------------------------------------
    let steerForce = this.inputs.steer;
    if (this.inputs.airbrakeLeft) {
      steerForce -= 0.55;
    }
    if (this.inputs.airbrakeRight) {
      steerForce += 0.55;
    }
    steerForce = THREE.MathUtils.clamp(steerForce, -1.0, 1.0);

    const steerResponse = (this.isDrifting ? 1.55 : 1.1) * (this.handlingRate / 90.0);
    const targetLateralSpeed = steerForce * (18.0 + (speedKmh / 420.0) * 16.0) * steerResponse;

    // Smooth lateral acceleration with drift inertia
    const grip = this.isDrifting ? 0.45 : (this.gripFactor * 9.5);
    this.lateralVelocity = THREE.MathUtils.lerp(this.lateralVelocity, targetLateralSpeed, Math.min(1.0, dt * grip));
    this.lateralOffset += this.lateralVelocity * dt;

    // Track barrier bounds (+/- 12.2m)
    const halfWidth = this.circuit.roadWidth * 0.5 - 0.8;
    this.isColliding = false;
    this.collisionImpulse = 0.0;

    if (Math.abs(this.lateralOffset) > halfWidth) {
      this.lateralOffset = Math.sign(this.lateralOffset) * halfWidth;
      // Rebound inward
      this.lateralVelocity = -this.lateralVelocity * 0.35;
      this.isColliding = true;
      this.collisionImpulse = speedKmh * 0.0035;
      speedKmh = Math.max(110.0, speedKmh * 0.93);
      this.sparkBurst = true;
    } else {
      this.sparkBurst = false;
    }

    // ------------------------------------------------------------------------
    // 6. BOOST PAD DETECTION (Debounced with instant velocity burst)
    // ------------------------------------------------------------------------
    for (let pIdx = 0; pIdx < this.circuit.boostPads.length; pIdx++) {
      const padU = this.circuit.boostPads[pIdx];
      if (Math.abs(this.currentU - padU) < 0.006) {
        if (this.lastTriggeredPadIndex !== pIdx && this.boostPadCooldown <= 0) {
          this.lastTriggeredPadIndex = pIdx;
          this.boostPadCooldown = 0.8; // Prevent re-trigger on same pad

          speedKmh = Math.min(this.boostMaxSpeedKmh + 25.0, speedKmh + 80.0);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.35);
          this.triggerAction('BOOST PAD', 180);
          this.comboCount++;

          if (this.sound) this.sound.playBoostPadSound();
        }
        break;
      }
    }

    // Clear triggered pad index once well past pad
    if (this.lastTriggeredPadIndex !== -1) {
      const padU = this.circuit.boostPads[this.lastTriggeredPadIndex];
      if (Math.abs(this.currentU - padU) > 0.02) {
        this.lastTriggeredPadIndex = -1;
      }
    }

    // ------------------------------------------------------------------------
    // 7. PERSIST VELOCITY & UPDATE 3D WORLD TRANSFORM
    // ------------------------------------------------------------------------
    speedMs = speedKmh / 3.6;

    const frame = this.circuit.getFrameAt(this.currentU);
    const rideHeight = 0.72 + this.aerialState.altitude;

    this.pos.copy(frame.pos)
      .addScaledVector(frame.binormal, this.lateralOffset)
      .addScaledVector(frame.normal, rideHeight);

    _scratchMat1.makeBasis(frame.binormal, frame.normal, frame.tangent);
    this.quat.setFromRotationMatrix(_scratchMat1);

    // Apply drift yaw rotation around local normal
    if (Math.abs(this.driftAngle) > 0.01) {
      _scratchQuat1.setFromAxisAngle(frame.normal, -this.driftAngle);
      this.quat.multiply(_scratchQuat1);
    }

    this.forward.set(0, 0, 1).applyQuaternion(this.quat);
    this.up.set(0, 1, 0).applyQuaternion(this.quat);

    // Ensure this.vel is completely accurate and persisted with all modified speeds
    this.vel.copy(this.forward).multiplyScalar(speedMs);
  }

  checkTrafficNearMiss(trafficVehicles, playerPos) {
    const now = performance.now() * 0.001;
    if (now - this.lastNearMissTime < 0.9) return;

    for (let i = 0; i < trafficVehicles.length; i++) {
      const v = trafficVehicles[i];
      const dist = v.mesh.position.distanceTo(playerPos);

      // Near miss threshold: 2.6m to 4.8m
      if (dist > 2.6 && dist < 4.8) {
        this.totalNearMisses++;
        this.lastNearMissTime = now;
        this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.20);
        this.triggerAction('NEAR MISS', 150);
        this.comboCount++;
        if (this.sound) this.sound.playNearMiss();
        break;
      }
    }
  }

  checkSlipstream(aiRacers, playerPos, playerForward) {
    let drafting = false;
    for (let i = 0; i < aiRacers.length; i++) {
      const ai = aiRacers[i];
      if (!ai.vehicle) continue;
      const aiPos = ai.vehicle.group.position;
      _scratchVec1.copy(aiPos).sub(playerPos);
      const dist = _scratchVec1.length();

      if (dist > 3.0 && dist < 22.0) {
        _scratchVec1.normalize();
        const dot = playerForward.dot(_scratchVec1);
        if (dot > 0.80) {
          drafting = true;
          break;
        }
      }
    }

    if (drafting && !this.isSlipstreaming) {
      this.isSlipstreaming = true;
      this.triggerAction('SLIPSTREAM ACTIVE', 100);
    } else if (!drafting && this.isSlipstreaming) {
      this.isSlipstreaming = false;
    }
  }

  getInterpolatedTransform(alpha) {
    _interpPos.lerpVectors(this.prevPos, this.pos, alpha);
    _interpQuat.slerpQuaternions(this.prevQuat, this.quat, alpha);
    return _interpTransform;
  }
}
