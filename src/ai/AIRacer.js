import * as THREE from 'three';
import { CraftMesh, CRAFT_TEAMS } from '../craft/CraftMesh.js';
import { NeuralTrajectoryPolicy } from './NeuralTrajectoryPolicy.js';

// ============================================================================
// WIPEOUT: APHELION - AI RIVAL RACERS (F-8000 LEAGUE RACERS)
// Autonomous spline pathing, WebNN neural trajectory prediction & evasive maneuvers
// ============================================================================

export class AIRacer {
  constructor(scene, trackBuilder, teamKey, gridSlot = 1) {
    this.scene = scene;
    this.track = trackBuilder;
    this.teamKey = teamKey;
    this.team = CRAFT_TEAMS[teamKey] || CRAFT_TEAMS.feisar;
    this.gridSlot = gridSlot;

    // Visual Mesh
    this.craftMesh = new CraftMesh(scene, this.team, false);

    // Client-Side Neural Trajectory Prediction Network (<0.4ms inference)
    this.neuralPolicy = new NeuralTrajectoryPolicy();

    // Track progression: u in [0, 1]
    this.u = (1.0 - gridSlot * 0.015) % 1.0;
    this.currentLap = 1;
    this.totalDistance = gridSlot * -50;

    // Lateral position on track (-8m to +8m)
    this.lateralOffset = (gridSlot % 2 === 0 ? 1 : -1) * (2.0 + (gridSlot * 1.2));
    this.targetLateralOffset = this.lateralOffset;

    // Speeds
    this.speedKmh = 0; // Start from rest; will accelerate to baseSpeedKmh naturally
    this.baseSpeedKmh = this.team.maxSpeedKmh * (0.85 + Math.random() * 0.12);
    this.boostTimer = 0;

    // Steering & airbrakes state for kinetic visual articulation
    this.steer = 0;
    this.pitchTrim = 0;
    this.throttle = 1.0;
    this.leftAirbrake = 0;
    this.rightAirbrake = 0;
    this.shieldHealth = 1.0;
    this.hasExternalControls = false;
    this.isEliminated = false;
    this.eliminationTriggered = false;
    this.barricadeDeployed = false;
    this.fluxDisruptedTimer = 0.0;

    // Position & orientation in world
    this.pos = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.fwd = new THREE.Vector3(0, 0, 1);

    this.initPosition();
  }

  takeDamage(amount, impactOrigin = null) {
    this.shieldHealth = Math.max(0.0, this.shieldHealth - amount);
    if (this.craftMesh) {
      const contact = impactOrigin || this.pos;
      this.craftMesh.triggerShieldImpact(contact, 0.85);
    }
    // Knock lateral position
    this.targetLateralOffset += (Math.random() > 0.5 ? 2.5 : -2.5);
    this.targetLateralOffset = THREE.MathUtils.clamp(this.targetLateralOffset, -7.5, 7.5);
    // Speed penalty
    this.speedKmh = Math.max(300, this.speedKmh * 0.75);

    if (this.shieldHealth <= 0 && !this.isEliminated) {
      this.isEliminated = true;
      if (this.craftMesh && this.craftMesh.group) {
        this.craftMesh.group.visible = false;
      }
    }
  }

  disruptFlux(duration = 2.5) {
    this.fluxDisruptedTimer = duration;
    // Violent wobble & lost magnetic grip
    this.targetLateralOffset += (Math.random() - 0.5) * 6.0;
    this.targetLateralOffset = THREE.MathUtils.clamp(this.targetLateralOffset, -7.5, 7.5);
    this.speedKmh = Math.max(400, this.speedKmh * 0.65);
  }

  initPosition() {
    this.isEliminated = false;
    this.eliminationTriggered = false;
    this.barricadeDeployed = false;
    this.shieldHealth = 1.0;
    this.speedKmh = 0;
    const idx = Math.floor(this.u * this.track.segments);
    const frame = this.track.samples[idx];
    this.pos.copy(frame.pos)
      .addScaledVector(frame.binormal, this.lateralOffset)
      .addScaledVector(frame.normal, 1.6);

    const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
    this.quat.setFromRotationMatrix(m);
    this.fwd.set(0, 0, 1).applyQuaternion(this.quat);
    this.craftMesh.group.position.copy(this.pos);
    this.craftMesh.group.quaternion.copy(this.quat);
    if (this.craftMesh.group) this.craftMesh.group.visible = true;
  }

  applyFlightControls(controls) {
    this.steer = controls.steering;               // [-1.0, 1.0]
    this.pitchTrim = controls.pitchTrim;         // [-1.0, 1.0]
    this.throttle = controls.throttle;           // [ 0.0, 1.0]
    this.leftAirbrake = controls.leftAirbrake;   // [ 0.0, 1.0]
    this.rightAirbrake = controls.rightAirbrake; // [ 0.0, 1.0]
    this.hasExternalControls = true;
  }

  update(delta, playerPos, playerU, competitorCrafts = []) {
    // 1. Boost pads detection
    for (const boostPad of this.track.boostPads) {
      if (Math.abs(this.u - boostPad) < 0.01 && this.boostTimer <= 0) {
        this.boostTimer = 1.8;
      }
    }

    if (this.boostTimer > 0) {
      this.boostTimer -= delta;
      this.speedKmh = Math.min(this.speedKmh + delta * 800, this.baseSpeedKmh * 1.35);
    } else {
      this.speedKmh = THREE.MathUtils.lerp(this.speedKmh, this.baseSpeedKmh, delta * 4.5);
    }

    // Flux Disruption wobble from Radial EMP
    if (this.fluxDisruptedTimer > 0) {
      this.fluxDisruptedTimer -= delta;
      this.targetLateralOffset += Math.sin(performance.now() * 0.02) * 0.45;
    }
    const speedMs = this.speedKmh / 3.6;
    const trackLength = this.track.data.lengthKm * 1000;
    const deltaU = (speedMs * delta) / trackLength;

    const prevU = this.u;
    this.u = (this.u + deltaU) % 1.0;
    this.totalDistance += speedMs * delta;

    if (this.u < prevU) {
      this.currentLap++;
    }

    // 3. WebNN / SIMD Neural Trajectory Evaluation (<0.4 ms)
    const sensors = this.neuralPolicy.gatherSensors(this.pos, this.quat, this.fwd, this.track, competitorCrafts);
    const decision = this.neuralPolicy.evaluate(sensors);

    // 4. Dynamic racing line + Neural evasion blending
    const currentIdx = Math.floor(this.u * this.track.segments);
    const frame = this.track.samples[currentIdx];
    const nextIdx = (currentIdx + 15) % this.track.segments;
    const lookAheadFrame = this.track.samples[nextIdx];

    const curvature = frame.curvature || 0;
    if (curvature > 0.003) {
      const turnDir = frame.tangent.clone().cross(lookAheadFrame.tangent).dot(frame.normal);
      this.targetLateralOffset = turnDir > 0 ? -5.5 : 5.5;

      if (this.speedKmh > 1100 || decision.airbrakeDelta > 0.4) {
        if (turnDir > 0) {
          this.leftAirbrake = 0.85;
          this.rightAirbrake = 0.0;
        } else {
          this.leftAirbrake = 0.0;
          this.rightAirbrake = 0.85;
        }
      } else {
        this.leftAirbrake = 0;
        this.rightAirbrake = 0;
      }
    } else {
      // Straightaway: weave slightly and perform neural competitor evasion
      this.targetLateralOffset = (this.gridSlot % 2 === 0 ? 3.5 : -3.5) + (decision.targetSteerRoll * 2.0);
      this.leftAirbrake = 0;
      this.rightAirbrake = 0;
    }

    // Apply continuous 5-channel neural policy controls if active
    if (this.hasExternalControls) {
      this.targetLateralOffset += this.steer * 3.0;
      if (this.throttle > 0.1) {
        const targetSpeed = this.baseSpeedKmh * (0.75 + this.throttle * 0.4);
        this.speedKmh = THREE.MathUtils.lerp(this.speedKmh, targetSpeed, delta * 1.8);
      }
      if (this.leftAirbrake > 0.4 || this.rightAirbrake > 0.4) {
        this.speedKmh = Math.max(400, this.speedKmh - (this.leftAirbrake + this.rightAirbrake) * delta * 200);
      }
    }

    // Smooth lateral movement
    this.lateralOffset = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(this.lateralOffset, this.targetLateralOffset, delta * 3.0),
      -8.0,
      8.0
    );

    // 5. Update world position & orientation along track ribbon
    this.pos.copy(frame.pos)
      .addScaledVector(frame.binormal, this.lateralOffset)
      .addScaledVector(frame.normal, 1.6);

    const rotMat = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
    this.quat.setFromRotationMatrix(rotMat);
    this.fwd.set(0, 0, 1).applyQuaternion(this.quat);

    this.craftMesh.group.position.copy(this.pos);
    this.craftMesh.group.quaternion.copy(this.quat);

    // 6. Update kinetic mesh articulation (inward roll + airbrakes)
    const speedRatio = this.speedKmh / this.team.maxSpeedKmh;
    const steerInput = (this.targetLateralOffset - this.lateralOffset) * 0.2 + decision.targetSteerRoll * 0.3;
    this.craftMesh.updateKineticState(
      delta,
      steerInput,
      this.leftAirbrake,
      this.rightAirbrake,
      speedRatio,
      this.boostTimer > 0,
      this.shieldHealth
    );
  }
}
