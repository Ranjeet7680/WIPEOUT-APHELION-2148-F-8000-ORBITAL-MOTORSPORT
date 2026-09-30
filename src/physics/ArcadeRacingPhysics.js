import * as THREE from 'three';

// ============================================================================
// ARCADE RACING PHYSICS ENGINE (120Hz Fixed Sub-Stepping)
// Max Speed: 420 km/h // Responsive Drift // Hyper-Boost Energy Reallocation
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

    // Vehicle Performance Specs (420 km/h max)
    this.maxSpeedKmh = 420.0;
    this.baseMaxSpeedKmh = 380.0;
    this.boostMaxSpeedKmh = 440.0;
    this.accelRate = 180.0; // km/h per second
    this.brakeRate = 320.0;
    this.dragCoeff = 0.28;
    this.gripFactor = 0.88;

    // Drift System
    this.isDrifting = false;
    this.driftDirection = 0; // -1 = Left, 1 = Right
    this.driftAngle = 0.0;
    this.driftDuration = 0.0;
    this.totalDriftScore = 0;

    // Hyper-Boost System (Max 5s continuous duration, 0..100% capacity)
    this.boostCapacity = 1.0; // 100%
    this.isBoosting = false;
    this.boostDuration = 0.0;

    // Player inputs
    this.inputs = {
      throttle: 0.0,
      steer: 0.0,
      brake: 0.0,
      drift: false,
      boost: false,
      energyBrake: false
    };

    // Collision & Camera shake telemetry
    this.isColliding = false;
    this.collisionImpulse = 0.0;
    this.sparkBurst = false;

    this.resetToStart();
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
    this.isDrifting = false;
    this.driftDuration = 0.0;
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

  update(delta) {
    this.accumulator += Math.min(delta, 0.1);

    while (this.accumulator >= this.fixedDelta) {
      this.prevPos.copy(this.pos);
      this.prevQuat.copy(this.quat);
      this.stepPhysics(this.fixedDelta);
      this.accumulator -= this.fixedDelta;
    }

    return this.accumulator / this.fixedDelta; // Render interpolation alpha
  }

  stepPhysics(dt) {
    let speedKmh = this.getSpeedKmh();

    // ------------------------------------------------------------------------
    // 1. HYPER-BOOST LOGIC
    // ------------------------------------------------------------------------
    if (this.inputs.boost && this.boostCapacity > 0.05) {
      this.isBoosting = true;
      this.boostDuration += dt;
      this.boostCapacity = Math.max(0.0, this.boostCapacity - dt * 0.20); // 5 sec full drain
      if (this.sound && Math.random() > 0.85) this.sound.playBoostPadSound();
    } else {
      this.isBoosting = false;
      this.boostDuration = 0.0;
      // Passive clean driving recharge
      if (speedKmh > 200 && !this.isDrifting) {
        this.boostCapacity = Math.min(1.0, this.boostCapacity + dt * 0.04);
      }
    }

    // ------------------------------------------------------------------------
    // 2. DRIFT LOGIC & CHARGING
    // ------------------------------------------------------------------------
    if (this.inputs.drift && speedKmh > 80.0 && Math.abs(this.inputs.steer) > 0.15) {
      if (!this.isDrifting) {
        this.isDrifting = true;
        this.driftDirection = Math.sign(this.inputs.steer);
      }
      this.driftDuration += dt;
      this.totalDriftScore += Math.floor(speedKmh * dt * 2.0);
      // Drifting rapidly recharges Hyper-Boost!
      this.boostCapacity = Math.min(1.0, this.boostCapacity + dt * 0.12);
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, this.driftDirection * 0.42, dt * 6.0);
    } else {
      this.isDrifting = false;
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, 0.0, dt * 8.0);
      this.driftDuration = 0.0;
    }

    // ------------------------------------------------------------------------
    // 3. ACCELERATION, BRAKING & TOP SPEED
    // ------------------------------------------------------------------------
    const targetTopSpeed = this.isBoosting ? this.boostMaxSpeedKmh : this.baseMaxSpeedKmh;

    if (this.inputs.energyBrake) {
      // Energy Emergency Brake
      speedKmh = Math.max(0.0, speedKmh - this.brakeRate * 2.2 * dt);
    } else if (this.inputs.brake > 0.05) {
      // Standard Brake / Reverse
      speedKmh = Math.max(-60.0, speedKmh - this.brakeRate * this.inputs.brake * dt);
    } else if (this.inputs.throttle > 0.05) {
      // Forward Ion Acceleration
      const accelBoost = this.isBoosting ? 2.4 : 1.0;
      speedKmh = Math.min(targetTopSpeed, speedKmh + this.accelRate * this.inputs.throttle * accelBoost * dt);
    } else {
      // Aerodynamic Drag & Coasting Friction
      speedKmh = Math.max(0.0, speedKmh - speedKmh * this.dragCoeff * dt * 0.85);
    }

    // ------------------------------------------------------------------------
    // 4. ROAD SPLINE TRACKING & LATERAL MOVEMENT
    // ------------------------------------------------------------------------
    const speedMs = speedKmh / 3.6;
    const trackLength = 5400.0; // Approx 5.4 km
    const deltaU = (speedMs * dt) / trackLength;

    const prevU = this.currentU;
    this.currentU = ((this.currentU + deltaU) % 1.0 + 1.0) % 1.0;
    this.totalDistance += speedMs * dt;

    if (prevU > 0.85 && this.currentU < 0.15) {
      this.currentLap++;
      if (this.sound) this.sound.playLapChime();
    }

    // Steering lateral speed (faster at higher speeds, with drift slip bonus)
    const steerResponse = this.isDrifting ? 1.45 : 1.0;
    const lateralSpeed = this.inputs.steer * (16.0 + (speedKmh / 420.0) * 14.0) * steerResponse;
    this.lateralOffset += lateralSpeed * dt;

    // Track barrier collision detection (trackWidth is 26m, so bounds are +/- 12.2m)
    const halfWidth = this.circuit.roadWidth * 0.5 - 0.8;
    this.isColliding = false;
    this.collisionImpulse = 0.0;

    if (Math.abs(this.lateralOffset) > halfWidth) {
      this.lateralOffset = Math.sign(this.lateralOffset) * halfWidth;
      // Collision penalty & spark emission
      this.isColliding = true;
      this.collisionImpulse = speedKmh * 0.003;
      speedKmh = Math.max(120.0, speedKmh * 0.94); // Light bounce rather than dead stop
      this.sparkBurst = true;
    } else {
      this.sparkBurst = false;
    }

    // ------------------------------------------------------------------------
    // 5. UPDATE 3D WORLD TRANSFORM ALONG ROAD SURFACE
    // ------------------------------------------------------------------------
    const frame = this.circuit.getFrameAt(this.currentU);

    // Ride height is 0.7m above asphalt
    this.pos.copy(frame.pos)
      .addScaledVector(frame.binormal, this.lateralOffset)
      .addScaledVector(frame.normal, 0.7);

    // Orientation: Orient along tangent, binormal, normal + apply drift yaw
    const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
    this.quat.setFromRotationMatrix(m);

    // Apply drift yaw rotation around local normal
    if (Math.abs(this.driftAngle) > 0.01) {
      const driftQuat = new THREE.Quaternion().setFromAxisAngle(frame.normal, -this.driftAngle);
      this.quat.multiply(driftQuat);
    }

    // Reconstruct velocity vector
    this.forward.set(0, 0, 1).applyQuaternion(this.quat);
    this.up.set(0, 1, 0).applyQuaternion(this.quat);
    this.vel.copy(this.forward).multiplyScalar(speedMs);

    // ------------------------------------------------------------------------
    // 6. BOOST PAD DETECTION
    // ------------------------------------------------------------------------
    this.circuit.boostPads.forEach(padU => {
      if (Math.abs(this.currentU - padU) < 0.008) {
        // Boost pad impulse!
        speedKmh = Math.min(this.boostMaxSpeedKmh, speedKmh + 65.0);
        this.boostCapacity = Math.min(1.0, this.boostCapacity + 0.35);
        if (this.sound) this.sound.playBoostPadSound();
      }
    });
  }

  getInterpolatedTransform(alpha) {
    const p = new THREE.Vector3().lerpVectors(this.prevPos, this.pos, alpha);
    const q = new THREE.Quaternion().slerpQuaternions(this.prevQuat, this.quat, alpha);
    return { pos: p, quat: q };
  }
}
