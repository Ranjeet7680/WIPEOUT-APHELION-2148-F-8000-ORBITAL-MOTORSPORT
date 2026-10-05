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
    this.slipstreamBonus = 0.0;

    // Additional Properties
    this.rubberBandStrength = 0.0;
    this.boostRechargeRate = 0.0;
    this.boostJustFilled = false;
    this.boostRecentlyUsed = 0.0;
    this.driftIntensity = 0.0;
    this.collisionRecoveryTimer = 0.0;

    // Running Dynamic Telemetry & Inertia (G-forces, slip angle, curb compliance)
    this.lateralG = 0.0;
    this.longitudinalG = 0.0;
    this.verticalG = 1.0;
    this.slipAngle = 0.0;
    this.curbRumble = 0.0;
    this.roadBumpDisp = 0.0;
    this.prevLateralVel = 0.0;
    this.prevSpeedMs = 0.0;

    // Progressive Nitro & Hybrid 70/30 Anti-Gravity Suspension
    this.nitroRamp = 0.0;
    this.suspensionPitch = 0.0;
    this.suspensionHeave = 0.0;
    this.suspensionRoll = 0.0;
    this.suspensionPitchVel = 0.0;
    this.suspensionHeaveVel = 0.0;
    this.suspensionRollVel = 0.0;
    this.landingShakeImpulse = 0.0;
    this.impactFlash = false;

    // Cornering & Overtake Tracking
    this.inCorner = false;
    this.cleanCornerTimer = 0.0;
    this.overtakenRivals = new Set();
    this.totalOvertakes = 0;

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

    // Off-track & 3-Second Auto-Reset System
    this.isOffTrack = false;
    this.offTrackTimer = 0.0;
    this.offTrackCountdown = 3.0;
    this.stuckTimer = 0.0;

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
    const startFrame = this.circuit.getInterpolatedFrame ? this.circuit.getInterpolatedFrame(0.0) : this.circuit.getFrameAt(0.0);
    this.pos.copy(startFrame.pos).addScaledVector(startFrame.normal, 0.72);
    this.vel.set(0, 0, 0);
    this.prevPos.copy(this.pos);

    _scratchMat1.makeBasis(startFrame.binormal, startFrame.normal, startFrame.tangent);
    this.quat.setFromRotationMatrix(_scratchMat1);
    this.quat.normalize();
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
    this.collisionRecoveryTimer = 0.0;
    this.boostRecentlyUsed = 0.0;
    this.boostJustFilled = false;
    this.slipstreamBonus = 0.0;
    this.isOffTrack = false;
    this.offTrackTimer = 0.0;
    this.offTrackCountdown = 3.0;
    this.stuckTimer = 0.0;

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

    this.accumulator = 0.0;
    this.driftAngle = 0.0;
    this.driftIntensity = 0.0;
    this.isSlipstreaming = false;
    this.slipstreamTimer = 0.0;
    this.isColliding = false;
    this.collisionImpulse = 0.0;
    this.sparkBurst = false;
    this.inputs = { throttle: 0, steer: 0, brake: 0, drift: false, boost: false, energyBrake: false, airbrakeLeft: false, airbrakeRight: false };
    this.forward.set(0, 0, 1).applyQuaternion(this.quat);
    this.up.set(0, 1, 0).applyQuaternion(this.quat);

    this.filteredSteer = 0.0;
    this.lateralG = 0.0;
    this.longitudinalG = 0.0;
    this.verticalG = 1.0;
    this.slipAngle = 0.0;
    this.curbRumble = 0.0;
    this.roadBumpDisp = 0.0;
    this.prevLateralVel = 0.0;
    this.prevSpeedMs = 0.0;

    this.nitroRamp = 0.0;
    this.suspensionPitch = 0.0;
    this.suspensionHeave = 0.0;
    this.suspensionRoll = 0.0;
    this.suspensionPitchVel = 0.0;
    this.suspensionHeaveVel = 0.0;
    this.suspensionRollVel = 0.0;
    this.landingShakeImpulse = 0.0;
    this.impactFlash = false;
    this.inCorner = false;
    this.cleanCornerTimer = 0.0;
    if (this.overtakenRivals) this.overtakenRivals.clear();
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

  setCircuit(circuit) {
    this.circuit = circuit;
    this.resetToStart();
  }

  getSpeedKmh() {
    return this.vel.length() * 3.6;
  }

  getSignedSpeedKmh() {
    const forwardDot = this.vel.dot(this.forward);
    return (forwardDot < -0.05 ? -1 : 1) * this.vel.length() * 3.6;
  }

  getRunningTelemetry() {
    return {
      lateralG: this.lateralG,
      longitudinalG: this.longitudinalG,
      verticalG: this.verticalG,
      slipAngle: this.slipAngle,
      curbRumble: this.curbRumble,
      roadBumpDisp: this.roadBumpDisp,
      signedSpeedKmh: this.getSignedSpeedKmh(),
      suspensionPitch: this.suspensionPitch,
      suspensionRoll: this.suspensionRoll,
      suspensionHeave: this.suspensionHeave,
      landingShakeImpulse: this.landingShakeImpulse,
      nitroRamp: this.nitroRamp,
      impactFlash: this.impactFlash
    };
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

    if (this.collisionRecoveryTimer > 0) {
      this.collisionRecoveryTimer -= delta;
    }

    if (this.boostRecentlyUsed > 0) {
      this.boostRecentlyUsed -= delta;
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
    let speedKmh = this.getSignedSpeedKmh();
    const prevBoostForTracking = this.boostCapacity;

    // ------------------------------------------------------------------------
    // 1. 3-TIER HYPER-BOOST & PROGRESSIVE NITRO OVERDRIVE
    // ------------------------------------------------------------------------
    if (this.inputs.boost && this.boostCapacity > 0.03) {
      this.boostRecentlyUsed = 0.5;
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

    // Progressive Nitro Ramp: smooth power buildup curve rather than instant teleport
    this.nitroRamp = THREE.MathUtils.damp(this.nitroRamp || 0.0, this.isBoosting ? 1.0 : 0.0, this.isBoosting ? 5.5 : 7.0, dt);

    // ------------------------------------------------------------------------
    // 2. DRIFT SYSTEM & ACTIVE RECHARGE
    // ------------------------------------------------------------------------
    const wantsDrift = (this.inputs.drift || (this.inputs.airbrakeLeft && this.inputs.steer < -0.2) || (this.inputs.airbrakeRight && this.inputs.steer > 0.2));
    if (wantsDrift && speedKmh > 70.0 && (Math.abs(this.inputs.steer) > 0.12 || this.inputs.airbrakeLeft || this.inputs.airbrakeRight) && !this.aerialState.inAir) {
      if (!this.isDrifting) {
        this.isDrifting = true;
        this.driftDirection = this.inputs.steer !== 0 ? Math.sign(this.inputs.steer) : (this.inputs.airbrakeLeft ? -1 : 1);
      }
      this.driftDuration += dt;
      const driftDist = (speedKmh / 3.6) * dt;
      this.totalDriftDistance += driftDist;
      this.totalDriftScore += Math.floor(speedKmh * dt * 2.5);

      // Drifting actively charges Hyper-Boost
      this.boostCapacity = Math.min(1.0, this.boostCapacity + dt * 0.22);
      const targetDriftAngle = this.driftDirection * (0.38 + Math.abs(this.inputs.steer) * 0.14);
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, targetDriftAngle, dt * 9.0);
      this.driftIntensity = Math.min(1.0, this.driftDuration / 1.2);

      if (this.driftDuration > 1.2 && Math.random() < 0.02) {
        this.triggerAction('POWER DRIFT', 120);
      }
    } else {
      if (this.isDrifting && this.driftDuration > 0.7) {
        // Crisp arcade drift exit boost
        speedKmh = Math.min(this.boostMaxSpeedKmh, speedKmh + 20.0);
        this.triggerAction('DRIFT BOOST', 150);
        if (this.sound && this.sound.playBoostPadSound) {
          this.sound.playBoostPadSound();
        }
      }
      this.isDrifting = false;
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, 0.0, dt * 10.0);
      this.driftDuration = 0.0;
    }

    // ------------------------------------------------------------------------
    // 3. PROGRESSIVE 7-GEAR ACCELERATION, QUADRATIC DRAG & REVERSE
    // ------------------------------------------------------------------------
    const maxBoostSpeed = (this.boostTier === 'OVERDRIVE' ? this.boostMaxSpeedKmh + 22.0 : this.boostMaxSpeedKmh);
    let targetTopSpeed = THREE.MathUtils.lerp(this.baseMaxSpeedKmh, maxBoostSpeed, this.nitroRamp);

    if (this.isSlipstreaming) {
      targetTopSpeed += 32.0 * this.slipstreamBonus; // Slipstream top speed bonus
    }

    // Aerodynamic Quadratic Drag + Speed-Dependent Friction (F_drag = 0.5 * rho * Cd * A * v^2)
    const speedMsCurr = Math.abs(speedKmh) / 3.6;
    const rho = 1.225; // kg/m^3 atmospheric density
    const Cd = this.dragCoeff;
    const frontalArea = 2.1; // m^2
    const vehicleMass = 1150.0; // kg
    const quadraticDragDecel = (0.5 * rho * Cd * frontalArea * (speedMsCurr * speedMsCurr)) / vehicleMass * 3.6; // km/h per sec
    const rollingResistance = (6.0 + Math.abs(speedKmh) * 0.035); // km/h per sec

    // Dual Airbrakes or dedicated Energy Brake
    const dualAirbrake = (this.inputs.airbrakeLeft && this.inputs.airbrakeRight);
    if (this.inputs.energyBrake || dualAirbrake) {
      speedKmh = Math.max(0.0, speedKmh - (this.brakeRate * 2.2 + quadraticDragDecel) * dt);
      if (this.sound && Math.random() > 0.92) {
        this.sound.playAirbrakeSound();
      }
    } else if (this.inputs.brake > 0.05) {
      // Dynamic progressive braking with smooth reverse transition
      if (speedKmh > 2.0) {
        // High-performance braking with aerodynamic stopping assist
        speedKmh = Math.max(0.0, speedKmh - (this.brakeRate * this.inputs.brake + quadraticDragDecel) * dt);
      } else {
        // Smooth reverse engagement when holding brake at standstill
        speedKmh = Math.max(-55.0, speedKmh - this.accelRate * 0.75 * this.inputs.brake * dt);
      }
    } else if (this.inputs.throttle > 0.05) {
      if (speedKmh < 0) {
        // Throttle cancels reverse and transitions cleanly to forward
        speedKmh = Math.min(targetTopSpeed, speedKmh + this.brakeRate * 1.5 * dt);
      } else {
        // Virtual 7-Speed Dynamic Torque Band: progressive acceleration without artificial snap
        let gearTorque = 1.0;
        if (speedKmh < 65.0) {
          gearTorque = 3.6 - (speedKmh / 65.0) * 1.2; // 1st Gear: punchy 3.6x launch torque
        } else if (speedKmh < 135.0) {
          gearTorque = 2.4 - ((speedKmh - 65.0) / 70.0) * 0.7; // 2nd Gear: strong pull
        } else if (speedKmh < 210.0) {
          gearTorque = 1.7 - ((speedKmh - 135.0) / 75.0) * 0.4; // 3rd Gear: agile sweep
        } else if (speedKmh < 285.0) {
          gearTorque = 1.3 - ((speedKmh - 210.0) / 75.0) * 0.2; // 4th Gear: rapid highway pull
        } else if (speedKmh < 350.0) {
          gearTorque = 1.1 - ((speedKmh - 285.0) / 65.0) * 0.1; // 5th Gear: high-speed sweep
        } else {
          gearTorque = 1.0; // 6th/7th Gear: top-end aerodynamic battle
        }

        const boostMult = 1.0 + this.nitroRamp * (this.boostTier === 'OVERDRIVE' ? 1.65 : 1.35);
        const accelMult = boostMult * (this.isSlipstreaming ? 1.35 : 1.0) * gearTorque;

        if (speedKmh > targetTopSpeed) {
          // Quadratic aero drag bleeds off excess boost speed smoothly
          speedKmh = Math.max(targetTopSpeed, speedKmh - (quadraticDragDecel * 1.8 + 25.0) * dt);
        } else {
          // Progressive acceleration curve with aerodynamic drag opposition
          const netAccelRate = (this.accelRate * this.inputs.throttle * accelMult) - (quadraticDragDecel * 0.35);
          speedKmh = Math.min(targetTopSpeed, speedKmh + Math.max(25.0 * this.inputs.throttle, netAccelRate) * dt);
        }
      }
    } else {
      // Natural coasting quadratic aerodynamic drag and rolling resistance
      speedKmh = Math.max(0.0, speedKmh - (quadraticDragDecel + rollingResistance) * dt);
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
      // Lap chime handled centrally by GameState.js to avoid double-play
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

      // High-altitude stabilization decay: vehicle maintains orientation when high above track
      const aerialAuthority = this.aerialState.altitude > 4.0 ? 0.75 : 1.0;

      // Aerial Barrel Roll on Steer
      if (Math.abs(this.inputs.steer) > 0.3) {
        const rollDir = Math.sign(this.inputs.steer);
        this.aerialState.barrelRollProgress += dt * 6.5 * aerialAuthority;
        this.aerialState.barrelRollAngle = rollDir * this.aerialState.barrelRollProgress * Math.PI;

        if (this.aerialState.barrelRollProgress >= 2.0 && this.aerialState.barrelRollProgress - dt * 6.5 * aerialAuthority < 2.0) {
          this.totalStunts++;
          this.triggerAction('BARREL ROLL', 350);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.35);
          this.comboCount++;
          if (this.sound) this.sound.playStuntWhoosh();
        }
      }

      // Aerial 360 Spin on Boost in air
      if (this.inputs.boost) {
        this.aerialState.spin360Progress += dt * 7.0 * aerialAuthority;
        this.aerialState.spin360Angle = this.aerialState.spin360Progress * Math.PI;

        if (this.aerialState.spin360Progress >= 2.0 && this.aerialState.spin360Progress - dt * 7.0 * aerialAuthority < 2.0) {
          this.totalStunts++;
          this.triggerAction('360 SPIN', 450);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.45);
          this.comboCount++;
          if (this.sound) this.sound.playStuntWhoosh();
        }
      }

      // Touchdown Check with dynamic suspension compression and landing feedback
      if (this.aerialState.altitude <= 0.0) {
        this.aerialState.inAir = false;
        this.aerialState.altitude = 0.0;
        const impactSpeed = Math.abs(this.aerialState.verticalVel);
        this.aerialState.verticalVel = 0.0;

        // Suspension compression impact & rebound impulse
        this.suspensionHeaveVel = -Math.min(16.0, impactSpeed * 0.55);
        this.landingShakeImpulse = Math.min(0.9, impactSpeed * 0.04);

        // Landing quality evaluation
        const rollError = Math.abs(this.aerialState.barrelRollAngle % (Math.PI * 2));
        if (rollError < 0.65 || rollError > Math.PI * 2 - 0.65) {
          if (this.aerialState.stuntsCompleted > 0 || Math.abs(this.aerialState.barrelRollAngle) > 1.0) {
            this.triggerAction('PERFECT LANDING', 500);
            this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.4);
            this.comboCount++;
            if (this.sound && this.sound.playPerfectLanding) this.sound.playPerfectLanding();
          } else {
            this.triggerAction('CLEAN LANDING', 300);
            this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.25);
            if (this.sound && this.sound.playPerfectLanding) this.sound.playPerfectLanding();
          }
        } else {
          speedKmh = Math.max(0.0, speedKmh * 0.88); // Rough landing penalty
        }

        this.aerialState.barrelRollAngle = 0;
        this.aerialState.spin360Angle = 0;
      }
    }

    // ------------------------------------------------------------------------
    // 5. 3-TIER SPEED-SENSITIVE STEERING & CONTROLLED LATERAL MOMENTUM
    // ------------------------------------------------------------------------
    let rawSteer = this.inputs.steer;
    if (this.inputs.airbrakeLeft) {
      rawSteer -= 0.65;
    }
    if (this.inputs.airbrakeRight) {
      rawSteer += 0.65;
    }
    rawSteer = THREE.MathUtils.clamp(rawSteer, -1.0, 1.0);

    // Speed-sensitive automotive steering ratio & self-centering damping
    const centeringSpeed = rawSteer === 0 ? 24.0 : 20.0;
    this.filteredSteer = THREE.MathUtils.damp(this.filteredSteer || 0.0, rawSteer, centeringSpeed, dt);
    const steerForce = this.filteredSteer;

    // 3-Tier Speed-Sensitive Steering Response:
    // Low speed (< 90 km/h): High steering response (1.35x)
    // Medium speed (90 - 240 km/h): Normal balanced response (1.0x)
    // High speed (> 240 km/h): Progressively reduced sensitivity down to 0.46x
    let speedSensitivity = 1.0;
    if (Math.abs(speedKmh) < 90.0) {
      speedSensitivity = 1.35;
    } else if (Math.abs(speedKmh) < 240.0) {
      speedSensitivity = 1.0;
    } else {
      const highRatio = Math.min(1.0, (Math.abs(speedKmh) - 240.0) / 200.0);
      speedSensitivity = THREE.MathUtils.lerp(1.0, 0.46, highRatio);
    }

    // High-speed electronic stability assist (dampens micro-oscillations)
    const stabilityAssist = Math.abs(speedKmh) > 260.0 ? Math.max(0.60, 1.0 - (Math.abs(speedKmh) - 260.0) / 450.0) : 1.0;

    // Wall breakaway assist: if near barrier and steering away, boost steering authority
    const halfWidth = this.circuit.roadWidth * 0.5 - 0.8;
    const isNearWall = Math.abs(this.lateralOffset) > (halfWidth - 1.5);
    const steeringAwayFromWall = isNearWall && (Math.sign(steerForce) !== Math.sign(this.lateralOffset) && Math.abs(steerForce) > 0.05);
    const wallAssist = steeringAwayFromWall ? 2.0 : (1.0 - 0.12 * Math.max(0, this.collisionRecoveryTimer / 0.4));

    const steerResponse = (this.isDrifting ? 1.55 : 1.25) * (this.handlingRate / 90.0) * wallAssist * speedSensitivity;
    // Speed-dependent steering authority: zero lateral translation at standstill, agile scaling with forward motion
    const speedFactor = THREE.MathUtils.clamp(Math.abs(speedKmh) / 14.0, 0.0, 1.0);
    const targetLateralSpeed = steerForce * (22.0 + (Math.abs(speedKmh) / 420.0) * 18.0) * steerResponse * speedFactor * stabilityAssist;

    // Banked Turn Camber Assist: On high-speed banked turns with active steering, road bank angle assists apex turn-in
    const curFrame = this.circuit ? (this.circuit.getInterpolatedFrame ? this.circuit.getInterpolatedFrame(this.currentU) : this.circuit.getFrameAt(this.currentU)) : null;
    if (steerForce !== 0 && curFrame && curFrame.bank && Math.abs(curFrame.bank) > 0.01 && Math.abs(speedKmh) > 40.0) {
      const camberPush = Math.sin(curFrame.bank) * (speedMs * 0.14) * Math.sign(steerForce);
      this.lateralVelocity += camberPush * dt;
    }

    // Speed-dependent high-performance grip: crisp lateral tracking, eliminate unnatural sideways sliding & floating
    const speedGripBonus = Math.min(1.0, Math.abs(speedKmh) / 220.0) * 8.0;
    const grip = this.isDrifting ? 7.2 : (this.gripFactor * (24.0 + speedGripBonus));
    this.lateralVelocity = THREE.MathUtils.lerp(this.lateralVelocity, targetLateralSpeed, Math.min(1.0, dt * grip));

    // When steering is released and not drifting, firmly stabilize lateral velocity to center line
    if (Math.abs(steerForce) < 0.02 && !this.isDrifting) {
      this.lateralVelocity = THREE.MathUtils.damp(this.lateralVelocity, 0.0, 20.0, dt);
    }

    // High-speed subtle counter-steering force when slip angle is excessive
    if (Math.abs(speedKmh) > 180.0 && !this.isDrifting && Math.abs(this.slipAngle) > 0.045 && steerForce === 0) {
      this.lateralVelocity -= this.slipAngle * 10.0 * dt;
    }

    // Dynamic G-forces & slip angle for realistic car running dynamics
    const latAcc = (this.lateralVelocity - this.prevLateralVel) / Math.max(0.001, dt);
    this.prevLateralVel = this.lateralVelocity;
    this.lateralG = THREE.MathUtils.clamp(latAcc / 9.81, -2.5, 2.5);

    const longAcc = (speedMs - this.prevSpeedMs) / Math.max(0.001, dt);
    this.prevSpeedMs = speedMs;
    this.longitudinalG = THREE.MathUtils.clamp(longAcc / 9.81, -3.0, 2.5);

    this.slipAngle = Math.atan2(this.lateralVelocity, Math.max(6.0, Math.abs(speedMs)));

    // Damped harmonic 2nd-order suspension for hover heave and weight transfer
    const targetSuspPitch = (this.inputs.brake > 0 ? 0.075 * this.inputs.brake : 0) + (this.inputs.throttle > 0 ? -0.052 * this.inputs.throttle : 0);
    const targetSuspRoll = -steerForce * 0.12 * Math.min(1.0, Math.abs(speedKmh) / 60.0);
    const targetSuspHeave = (Math.abs(speedKmh) > 180.0 ? -0.026 * (Math.abs(speedKmh) / 420.0) : 0.0);

    const sSpring = 150.0;
    const sDamp = 20.0;

    const sPitchAcc = (targetSuspPitch - this.suspensionPitch) * sSpring - this.suspensionPitchVel * sDamp;
    this.suspensionPitchVel += sPitchAcc * dt;
    this.suspensionPitch += this.suspensionPitchVel * dt;

    const sHeaveAcc = (targetSuspHeave - this.suspensionHeave) * 140.0 - this.suspensionHeaveVel * 18.0;
    this.suspensionHeaveVel += sHeaveAcc * dt;
    this.suspensionHeave += this.suspensionHeaveVel * dt;

    const sRollAcc = (targetSuspRoll - this.suspensionRoll) * 140.0 - this.suspensionRollVel * 18.0;
    this.suspensionRollVel += sRollAcc * dt;
    this.suspensionRoll += this.suspensionRollVel * dt;

    // Decay landing shake impulse
    if (this.landingShakeImpulse > 0) {
      this.landingShakeImpulse = Math.max(0.0, this.landingShakeImpulse - dt * 6.0);
    }

    // Dynamic Perfect Cornering feedback
    if (curFrame) {
      const curCurv = curFrame.curvature || 0;
      if (curCurv > 0.0035 && Math.abs(speedKmh) > 175.0 && !this.isColliding) {
        if (!this.inCorner) {
          this.inCorner = true;
          this.cleanCornerTimer = 0.0;
        }
        this.cleanCornerTimer += dt;
      } else if (this.inCorner && curCurv < 0.002) {
        if (this.cleanCornerTimer > 0.40 && !this.isColliding && Math.abs(this.lateralOffset) < 5.5) {
          this.triggerAction('PERFECT LINE', 400);
          this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.20);
          this.comboCount++;
          if (this.sound && this.sound.playLapChime) this.sound.playLapChime();
        }
        this.inCorner = false;
        this.cleanCornerTimer = 0.0;
      }
    }

    // Dynamic Road Surface Compliance & Curb Detection
    const latAbs = Math.abs(this.lateralOffset);
    const curbZone = halfWidth - 2.2;
    if (latAbs > curbZone && !this.aerialState.inAir && Math.abs(speedKmh) > 20.0) {
      this.curbRumble = Math.min(1.0, (latAbs - curbZone) / 1.5);
      const curbFreq = this.totalDistance * 16.0;
      this.roadBumpDisp = Math.sin(curbFreq) * (0.020 * this.curbRumble);
    } else if (!this.aerialState.inAir && Math.abs(speedKmh) > 20.0) {
      this.curbRumble = 0.0;
      const asphaltFreq = this.totalDistance * 3.5;
      this.roadBumpDisp = (Math.sin(asphaltFreq * 1.7) * 0.0032 + Math.sin(asphaltFreq * 4.3) * 0.0018) * Math.min(1.0, Math.abs(speedKmh) / 100.0);
    } else {
      this.curbRumble = 0.0;
      this.roadBumpDisp = 0.0;
    }

    // Barrier sliding and repulsion (+/- 12.2m)
    this.isColliding = false;
    this.collisionImpulse = 0.0;
    this.impactFlash = false;

    // Inward repulsion buffer zone (1.2m before reaching barrier)
    const barrierBuffer = halfWidth - 1.2;
    if (Math.abs(this.lateralOffset) > barrierBuffer) {
      const penetration = Math.abs(this.lateralOffset) - barrierBuffer;
      const repelForce = penetration * 48.0;
      this.lateralVelocity -= Math.sign(this.lateralOffset) * repelForce * dt;
    }

    this.lateralOffset += this.lateralVelocity * dt;

    // Detect if vehicle was outside boundary or at the barrier BEFORE boundary clamping
    const wasOutsideBoundary = Math.abs(this.lateralOffset) >= halfWidth - 0.1;
    const isWedgedAgainstBarrier = (Math.abs(this.lateralOffset) >= halfWidth - 0.6 && speedKmh < 45.0);
    const isFallingOff = this.aerialState.altitude < -1.5;

    // Hard boundary clamp & smooth wall sliding with instant breakaway
    if (Math.abs(this.lateralOffset) >= halfWidth - 0.2) {
      const wallSign = Math.sign(this.lateralOffset);
      this.lateralOffset = wallSign * (halfWidth - 0.2);

      // Smooth barrier contact without violent pinball catapulting
      if (steeringAwayFromWall) {
        // Player is actively steering away: crisp, immediate breakaway toward road
        this.lateralVelocity = -wallSign * 3.5;
      } else {
        // Glancing barrier slide: zero outward velocity, soft inward cushion
        this.lateralVelocity = -wallSign * 0.8;
      }
      this.isColliding = true;
      this.collisionRecoveryTimer = 0.18;
      this.collisionImpulse = Math.max(0.25, Math.min(1.0, Math.abs(speedKmh) * 0.0028));
      // Subtle suspension recoil
      this.suspensionHeaveVel -= 1.8;
      this.suspensionRollVel += wallSign * 4.2;
      // Maintain forward momentum with smooth friction scrub
      speedKmh = Math.max(80.0, speedKmh - 35.0 * dt);
      this.sparkBurst = true;
      this.impactFlash = true;
    } else {
      this.sparkBurst = false;
    }

    // ------------------------------------------------------------------------
    // 5.5 ACTIVE ANTI-STUCK & OFF-TRACK AUTO-RECOVERY (GUARANTEED NO FREEZE)
    // ------------------------------------------------------------------------
    const isTrappedAtBarrier = (this.isColliding || Math.abs(this.lateralOffset) >= halfWidth - 0.8) && speedKmh < 18.0;
    if (isTrappedAtBarrier && !this.aerialState.inAir) {
      this.stuckTimer += dt;
      if (this.stuckTimer >= 2.0) {
        // Auto-disengage: cleanly push craft toward track center and launch forward
        this.lateralOffset = THREE.MathUtils.lerp(this.lateralOffset, 0, 0.45);
        this.lateralVelocity = -Math.sign(this.lateralOffset || 1) * 6.5;
        speedKmh = Math.max(speedKmh, 85.0);
        this.stuckTimer = 0.0;
        this.isOffTrack = false;
        this.offTrackTimer = 0.0;
        this.offTrackCountdown = 3.0;
        this.triggerAction('AUTO RECOVERY // TRACK RE-ENGAGED', 50);
        if (this.sound && this.sound.playBoostPadSound) {
          this.sound.playBoostPadSound();
        }
      }
    } else {
      this.stuckTimer = 0.0;
    }

    if (wasOutsideBoundary || isWedgedAgainstBarrier || isFallingOff || (this.isOffTrack && Math.abs(this.lateralOffset) > halfWidth - 1.5)) {
      this.isOffTrack = true;
      this.offTrackTimer += dt;
      this.offTrackCountdown = Math.max(0.0, 3.0 - this.offTrackTimer);

      if (this.offTrackTimer >= 3.0) {
        this.resetToTrackCenter();
        return;
      }
    } else if (speedKmh > 35.0 && Math.abs(this.lateralOffset) < halfWidth - 1.8) {
      this.isOffTrack = false;
      this.offTrackTimer = 0.0;
      this.offTrackCountdown = 3.0;
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

    const frame = this.circuit.getInterpolatedFrame ? this.circuit.getInterpolatedFrame(this.currentU) : this.circuit.getFrameAt(this.currentU);
    const rideHeight = 0.72 + this.aerialState.altitude + (this.aerialState.inAir ? 0.0 : (this.roadBumpDisp + this.suspensionHeave));

    this.pos.copy(frame.pos)
      .addScaledVector(frame.binormal, this.lateralOffset)
      .addScaledVector(frame.normal, rideHeight);

    _scratchMat1.makeBasis(frame.binormal, frame.normal, frame.tangent);
    this.quat.setFromRotationMatrix(_scratchMat1);
    this.quat.normalize();

    // Turn yaw angle: when steering, craft body organically yaws into the direction of motion
    const turnYaw = this.isDrifting
      ? -this.driftAngle
      : (steerForce * 0.10 * Math.min(1.0, Math.abs(speedKmh) / 28.0));

    if (Math.abs(turnYaw) > 0.001) {
      _scratchQuat1.setFromAxisAngle(frame.normal, turnYaw);
      this.quat.multiply(_scratchQuat1);
      this.quat.normalize();
    }

    // Apply aerial barrel roll and 360 spin to vehicle transform
    if (this.aerialState.inAir) {
      if (Math.abs(this.aerialState.barrelRollAngle) > 0.001) {
        _scratchQuat1.setFromAxisAngle(frame.tangent, this.aerialState.barrelRollAngle);
        this.quat.multiply(_scratchQuat1);
      }
      if (Math.abs(this.aerialState.spin360Angle) > 0.001) {
        _scratchQuat1.setFromAxisAngle(frame.normal, this.aerialState.spin360Angle);
        this.quat.multiply(_scratchQuat1);
      }
    }

    this.forward.set(0, 0, 1).applyQuaternion(this.quat);
    this.up.set(0, 1, 0).applyQuaternion(this.quat);

    // Ensure this.vel is completely accurate and persisted with all modified speeds
    this.vel.copy(this.forward).multiplyScalar(speedMs);
    if (Math.abs(this.lateralVelocity) > 0.05) {
      this.vel.addScaledVector(frame.binormal, this.lateralVelocity);
    }

    this.boostRechargeRate = Math.max(0, (this.boostCapacity - prevBoostForTracking) / dt);
    if (prevBoostForTracking < 1.0 && this.boostCapacity >= 1.0) {
      this.boostJustFilled = true;
    }
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

    if (drafting) {
      this.slipstreamBonus = THREE.MathUtils.lerp(this.slipstreamBonus, 1.0, 0.1);
    } else {
      this.slipstreamBonus = THREE.MathUtils.lerp(this.slipstreamBonus, 0.0, 0.1);
    }
  }

  checkOvertakes(aiRacers) {
    if (!aiRacers || !aiRacers.length) return;
    for (let i = 0; i < aiRacers.length; i++) {
      const rival = aiRacers[i];
      if (!rival || rival.isFinished) continue;
      const key = rival.spec ? rival.spec.id : `rival_${i}`;
      const isAhead = (this.totalDistance - rival.totalDistance) > 1.5;
      const wasBehind = this.overtakenRivals && !this.overtakenRivals.has(key);

      if (isAhead && wasBehind && this.totalDistance > 80.0) {
        this.overtakenRivals.add(key);
        this.totalOvertakes++;
        this.triggerAction('OVERTAKE', 500);
        this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.30);
        this.comboCount++;
        if (this.sound && this.sound.playLapChime) {
          this.sound.playLapChime();
        }
      } else if (!isAhead && this.overtakenRivals && this.overtakenRivals.has(key)) {
        this.overtakenRivals.delete(key);
      }
    }
  }

  resetToTrackCenter(targetU = null) {
    if (targetU !== null && typeof targetU === 'number' && targetU >= 0 && targetU <= 1.0) {
      this.currentU = targetU;
    }
    this.lateralOffset = 0.0;
    this.lateralVelocity = 0.0;
    this.aerialState.inAir = false;
    this.aerialState.altitude = 0.0;
    this.aerialState.verticalVel = 0.0;
    this.aerialState.barrelRollAngle = 0.0;
    this.aerialState.spin360Angle = 0.0;
    this.driftAngle = 0.0;
    this.isDrifting = false;
    this.isColliding = false;
    this.collisionRecoveryTimer = 0.0;
    this.sparkBurst = false;

    this.isOffTrack = false;
    this.offTrackTimer = 0.0;
    this.offTrackCountdown = 3.0;
    this.stuckTimer = 0.0;

    this.filteredSteer = 0.0;
    this.lateralG = 0.0;
    this.longitudinalG = 0.0;
    this.verticalG = 1.0;
    this.slipAngle = 0.0;
    this.curbRumble = 0.0;
    this.roadBumpDisp = 0.0;
    this.prevLateralVel = 0.0;

    this.nitroRamp = 0.0;
    this.suspensionPitch = 0.0;
    this.suspensionHeave = 0.0;
    this.suspensionRoll = 0.0;
    this.suspensionPitchVel = 0.0;
    this.suspensionHeaveVel = 0.0;
    this.suspensionRollVel = 0.0;
    this.landingShakeImpulse = 0.0;
    this.impactFlash = false;
    this.inCorner = false;
    this.cleanCornerTimer = 0.0;

    // Rolling launch speed forward along track tangent (80 km/h)
    const resumeSpeedKmh = Math.max(85.0, this.baseMaxSpeedKmh * 0.28);
    const resumeSpeedMs = resumeSpeedKmh / 3.6;

    const frame = this.circuit.getInterpolatedFrame ? this.circuit.getInterpolatedFrame(this.currentU) : this.circuit.getFrameAt(this.currentU);
    this.pos.copy(frame.pos).addScaledVector(frame.normal, 0.72);
    _scratchMat1.makeBasis(frame.binormal, frame.normal, frame.tangent);
    this.quat.setFromRotationMatrix(_scratchMat1);
    this.quat.normalize();
    this.forward.set(0, 0, 1).applyQuaternion(this.quat);
    this.up.set(0, 1, 0).applyQuaternion(this.quat);
    this.vel.copy(this.forward).multiplyScalar(resumeSpeedMs);

    this.prevPos.copy(this.pos);
    this.prevQuat.copy(this.quat);

    this.triggerAction('TRACK RESET // RE-ENGAGED', 0);
    if (this.sound && this.sound.playCountdownBeep) {
      this.sound.playCountdownBeep(true);
    }
  }

  applyExternalRepulsion(repelVector, intensity = 1.0) {
    const frame = this.circuit.getInterpolatedFrame ? this.circuit.getInterpolatedFrame(this.currentU) : this.circuit.getFrameAt(this.currentU);
    if (!frame) return;

    // Project repel vector onto track binormal (lateral axis)
    const lateralDot = repelVector.dot(frame.binormal);
    let deflectDir = Math.sign(lateralDot);
    if (Math.abs(lateralDot) < 0.1) {
      deflectDir = this.lateralOffset >= 0 ? -1 : 1;
    }

    // Displace lateral offset smoothly and impart controlled deflection velocity
    const halfWidth = this.circuit.roadWidth * 0.5 - 1.2;
    this.lateralOffset = THREE.MathUtils.clamp(this.lateralOffset + deflectDir * 1.5 * intensity, -halfWidth, halfWidth);
    this.lateralVelocity = deflectDir * (5.0 + 2.5 * intensity);
    this.collisionRecoveryTimer = 0.25;
    this.sparkBurst = true;
  }

  getInterpolatedTransform(alpha) {
    _interpPos.lerpVectors(this.prevPos, this.pos, alpha);
    _interpQuat.slerpQuaternions(this.prevQuat, this.quat, alpha);
    return _interpTransform;
  }
}
