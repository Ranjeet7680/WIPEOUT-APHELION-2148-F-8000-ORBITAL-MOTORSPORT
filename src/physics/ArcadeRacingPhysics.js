import * as THREE from 'three';

// ============================================================================
// ENHANCED ARCADE RACING PHYSICS ENGINE (120Hz Fixed Sub-Stepping)
// Dynamic Vehicle Specs, Stunt Ramps, Aerial Barrel Rolls, 360 Spins,
// 3-Tier Hyper-Boost, Near Miss, Slipstream & Combo Scoring
// ============================================================================

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
      energyBrake: false
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
    this.boostMaxSpeedKmh = spec.maxSpeedKmh ? spec.maxSpeedKmh * 1.05 : 440.0;
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

    const m = new THREE.Matrix4().makeBasis(startFrame.binormal, startFrame.normal, startFrame.tangent);
    this.quat.setFromRotationMatrix(m);
    this.prevQuat.copy(this.quat);

    this.currentU = 0.0;
    this.lateralOffset = 0.0;
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
    // 1. 3-TIER HYPER-BOOST SYSTEM
    // ------------------------------------------------------------------------
    if (this.inputs.boost && this.boostCapacity > 0.04) {
      if (!this.isBoosting) {
        this.isBoosting = true;
        this.totalBoostUses++;

        // Perfect Boost timing check (if triggered when capacity is in sweet spot)
        if (this.boostCapacity >= 0.65 && this.boostCapacity <= 0.85) {
          this.boostTier = 'OVERDRIVE';
          this.triggerAction('PERFECT BOOST // OVERDRIVE', 300);
          this.comboCount++;
        } else {
          this.boostTier = 'NORMAL';
        }
      }

      this.boostDuration += dt;
      const drainRate = this.boostTier === 'OVERDRIVE' ? 0.24 : 0.18;
      this.boostCapacity = Math.max(0.0, this.boostCapacity - dt * drainRate);

      if (this.sound && Math.random() > 0.88) {
        this.sound.playBoostPadSound();
      }
    } else {
      this.isBoosting = false;
      this.boostTier = 'NORMAL';
      this.boostDuration = 0.0;

      // Clean driving passive recharge
      if (speedKmh > 200 && !this.isDrifting && !this.aerialState.inAir) {
        this.boostCapacity = Math.min(1.0, this.boostCapacity + dt * 0.04);
      }
    }

    // ------------------------------------------------------------------------
    // 2. DRIFT SYSTEM & RECHARGE
    // ------------------------------------------------------------------------
    if (this.inputs.drift && speedKmh > 80.0 && Math.abs(this.inputs.steer) > 0.12 && !this.aerialState.inAir) {
      if (!this.isDrifting) {
        this.isDrifting = true;
        this.driftDirection = Math.sign(this.inputs.steer);
      }
      this.driftDuration += dt;
      const driftDist = (speedKmh / 3.6) * dt;
      this.totalDriftDistance += driftDist;
      this.totalDriftScore += Math.floor(speedKmh * dt * 2.2);

      // Drifting rapidly charges Hyper-Boost
      this.boostCapacity = Math.min(1.0, this.boostCapacity + dt * 0.15);
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, this.driftDirection * 0.45, dt * 6.0);

      if (this.driftDuration > 1.2 && Math.random() < 0.02) {
        this.triggerAction('POWER DRIFT', 120);
      }
    } else {
      this.isDrifting = false;
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, 0.0, dt * 8.0);
      this.driftDuration = 0.0;
    }

    // ------------------------------------------------------------------------
    // 3. ACCELERATION, BRAKING & SLIPSTREAM BOOST
    // ------------------------------------------------------------------------
    let targetTopSpeed = this.isBoosting
      ? (this.boostTier === 'OVERDRIVE' ? this.boostMaxSpeedKmh + 15 : this.boostMaxSpeedKmh)
      : this.baseMaxSpeedKmh;

    if (this.isSlipstreaming) {
      targetTopSpeed += 30; // +15% slipstream speed bonus
    }

    if (this.inputs.energyBrake) {
      speedKmh = Math.max(0.0, speedKmh - this.brakeRate * 2.2 * dt);
    } else if (this.inputs.brake > 0.05) {
      speedKmh = Math.max(-50.0, speedKmh - this.brakeRate * this.inputs.brake * dt);
    } else if (this.inputs.throttle > 0.05) {
      const accelMult = (this.isBoosting ? 2.4 : 1.0) * (this.isSlipstreaming ? 1.3 : 1.0);
      speedKmh = Math.min(targetTopSpeed, speedKmh + this.accelRate * this.inputs.throttle * accelMult * dt);
    } else {
      speedKmh = Math.max(0.0, speedKmh - speedKmh * this.dragCoeff * dt * 0.85);
    }

    // ------------------------------------------------------------------------
    // 4. STUNT RAMPS & AERIAL STUNT SIMULATION
    // ------------------------------------------------------------------------
    const speedMs = speedKmh / 3.6;
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
        this.aerialState.verticalVel = 18.0 + (speedKmh / 420.0) * 12.0; // High aerial launch!
        this.aerialState.altitude = 0.5;
        this.aerialState.barrelRollAngle = 0;
        this.aerialState.spin360Angle = 0;
        this.aerialState.barrelRollProgress = 0;
        this.aerialState.spin360Progress = 0;
        this.aerialState.airTime = 0;
        this.triggerAction('RAMP LAUNCH', 200);
        this.comboCount++;
      }
    });

    // In-Air Physics & Aerial Stunts
    if (this.aerialState.inAir) {
      this.aerialState.airTime += dt;
      this.aerialState.verticalVel -= 28.0 * dt; // Gravity
      this.aerialState.altitude += this.aerialState.verticalVel * dt;

      // Aerial Stunts: Barrel Roll on Steer
      if (Math.abs(this.inputs.steer) > 0.3) {
        const rollDir = Math.sign(this.inputs.steer);
        this.aerialState.barrelRollProgress += dt * 6.5;
        this.aerialState.barrelRollAngle = rollDir * this.aerialState.barrelRollProgress * Math.PI;

        if (this.aerialState.barrelRollProgress >= 2.0 && this.aerialState.barrelRollProgress - dt * 6.5 < 2.0) {
          this.totalStunts++;
          this.triggerAction('BARREL ROLL', 350);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.35);
          this.comboCount++;
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
        }
      }

      // Touchdown Check
      if (this.aerialState.altitude <= 0.0) {
        this.aerialState.inAir = false;
        this.aerialState.altitude = 0.0;
        this.aerialState.verticalVel = 0.0;

        // Perfect landing if barrel roll is close to 360° multiple
        const rollError = Math.abs(this.aerialState.barrelRollAngle % (Math.PI * 2));
        if (rollError < 0.6 || rollError > Math.PI * 2 - 0.6) {
          this.triggerAction('PERFECT LANDING', 500);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.4);
          this.comboCount++;
        } else {
          speedKmh = Math.max(160, speedKmh * 0.88); // Slight penalty for rough landing
        }

        this.aerialState.barrelRollAngle = 0;
        this.aerialState.spin360Angle = 0;
      }
    }

    // ------------------------------------------------------------------------
    // 5. ROAD SPLINE TRACKING & LATERAL MOVEMENT
    // ------------------------------------------------------------------------
    const steerResponse = (this.isDrifting ? 1.45 : 1.0) * (this.handlingRate / 90.0);
    const lateralSpeed = this.inputs.steer * (16.0 + (speedKmh / 420.0) * 14.0) * steerResponse;
    this.lateralOffset += lateralSpeed * dt;

    // Track barrier bounds (+/- 12.2m)
    const halfWidth = this.circuit.roadWidth * 0.5 - 0.8;
    this.isColliding = false;
    this.collisionImpulse = 0.0;

    if (Math.abs(this.lateralOffset) > halfWidth) {
      this.lateralOffset = Math.sign(this.lateralOffset) * halfWidth;
      this.isColliding = true;
      this.collisionImpulse = speedKmh * 0.003;
      speedKmh = Math.max(120.0, speedKmh * 0.94);
      this.sparkBurst = true;
    } else {
      this.sparkBurst = false;
    }

    // ------------------------------------------------------------------------
    // 6. UPDATE 3D WORLD TRANSFORM ALONG ROAD SURFACE
    // ------------------------------------------------------------------------
    const frame = this.circuit.getFrameAt(this.currentU);
    const rideHeight = 0.7 + this.aerialState.altitude;

    this.pos.copy(frame.pos)
      .addScaledVector(frame.binormal, this.lateralOffset)
      .addScaledVector(frame.normal, rideHeight);

    const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
    this.quat.setFromRotationMatrix(m);

    // Apply drift yaw rotation around local normal
    if (Math.abs(this.driftAngle) > 0.01) {
      const driftQuat = new THREE.Quaternion().setFromAxisAngle(frame.normal, -this.driftAngle);
      this.quat.multiply(driftQuat);
    }

    this.forward.set(0, 0, 1).applyQuaternion(this.quat);
    this.up.set(0, 1, 0).applyQuaternion(this.quat);
    this.vel.copy(this.forward).multiplyScalar(speedMs);

    // ------------------------------------------------------------------------
    // 7. BOOST PAD DETECTION
    // ------------------------------------------------------------------------
    this.circuit.boostPads.forEach(padU => {
      if (Math.abs(this.currentU - padU) < 0.007) {
        speedKmh = Math.min(this.boostMaxSpeedKmh + 20, speedKmh + 65.0);
        this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.35);
        this.triggerAction('BOOST PAD', 150);
        if (this.sound) this.sound.playBoostPadSound();
      }
    });
  }

  checkTrafficNearMiss(trafficVehicles, playerPos) {
    const now = performance.now() * 0.001;
    if (now - this.lastNearMissTime < 1.0) return;

    for (let i = 0; i < trafficVehicles.length; i++) {
      const v = trafficVehicles[i];
      const dist = v.mesh.position.distanceTo(playerPos);

      // Near miss threshold: 2.8m to 4.5m
      if (dist > 2.8 && dist < 4.8) {
        this.totalNearMisses++;
        this.lastNearMissTime = now;
        this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.18);
        this.triggerAction('NEAR MISS', 150);
        this.comboCount++;
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
      const toAi = aiPos.clone().sub(playerPos);
      const dist = toAi.length();

      if (dist > 3.0 && dist < 18.0) {
        toAi.normalize();
        const dot = playerForward.dot(toAi);
        if (dot > 0.82) {
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
    const p = new THREE.Vector3().lerpVectors(this.prevPos, this.pos, alpha);
    const q = new THREE.Quaternion().slerpQuaternions(this.prevQuat, this.quat, alpha);
    return { pos: p, quat: q };
  }
}
