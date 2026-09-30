import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - 6-DOF CAMERA SYSTEM & BROADCAST TRACKING DRONE ENGINE
// Modes: CHASE, COCKPIT, BUMPER, BROADCAST_DRONE, ORBIT
// Features: Pan inertia, momentary focus hunting, aerospace telephoto tracking,
// elimination sequence cinematic replays, and non-inertial G-force shake
// ============================================================================

export const CAMERA_MODES = {
  CHASE: 'CHASE',
  COCKPIT: 'COCKPIT',
  BUMPER: 'BUMPER',
  BROADCAST_DRONE: 'BROADCAST DRONE',
  ORBIT: 'ORBIT'
};

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.mode = CAMERA_MODES.CHASE;

    // Chase Cam spring-damper parameters
    this.chaseDistance = 7.8;
    this.chaseHeight = 2.4;
    this.targetCameraPos = new THREE.Vector3();
    this.currentCameraPos = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.laggedLookTarget = new THREE.Vector3();

    // Broadcast Drone Telephoto State
    this.broadcastDroneAnchor = new THREE.Vector3();
    this.broadcastTargetDistance = 45.0;
    this.focusHuntPhase = 0.0;

    // Elimination Sequence Slow-Mo Replay State
    this.isEliminationReplay = false;
    this.eliminationTimer = 0.0;
    this.eliminationTargetPos = new THREE.Vector3();

    // Camera shake
    this.shakeIntensity = 0;
    this.shakeDecay = 4.0;

    // FOV elasticity
    this.baseFov = 75;
    this.maxFov = 110;
    this.broadcastFov = 32.0; // 180mm telephoto aerospace lens equivalent
  }

  setMode(mode) {
    this.mode = mode;
  }

  cycleMode() {
    const modes = [
      CAMERA_MODES.CHASE,
      CAMERA_MODES.COCKPIT,
      CAMERA_MODES.BUMPER,
      CAMERA_MODES.BROADCAST_DRONE,
      CAMERA_MODES.ORBIT
    ];
    const currentIndex = modes.indexOf(this.mode);
    this.mode = modes[(currentIndex + 1) % modes.length];
    return this.mode;
  }

  addShake(amount) {
    this.shakeIntensity = Math.min(this.shakeIntensity + amount, 1.2);
  }

  triggerEliminationReplay(victimWorldPos, duration = 3.0) {
    this.isEliminationReplay = true;
    this.eliminationTimer = duration;
    this.eliminationTargetPos.copy(victimWorldPos);
  }

  reset(craftPos, craftQuat) {
    this.isEliminationReplay = false;
    this.eliminationTimer = 0;
    this.shakeIntensity = 0;
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(craftQuat);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(craftQuat);
    this.targetCameraPos.copy(craftPos)
      .addScaledVector(fwd, -8.0)
      .addScaledVector(up, 2.4);
    this.currentCameraPos.copy(this.targetCameraPos);
    this.camera.position.copy(this.targetCameraPos);
    this.lookTarget.copy(craftPos).addScaledVector(fwd, 6.0).addScaledVector(up, 0.4);
    this.camera.lookAt(this.lookTarget);
    this.camera.up.copy(up);
  }

  update(delta, craftPos, craftVel, craftQuat, speedKmh, isScraping, isBoosting) {
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(craftQuat);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(craftQuat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(craftQuat);
    const time = performance.now() * 0.001;

    // Speed ratio 0..1 (top speed 1400 km/h)
    const speedRatio = Math.min(speedKmh / 1400, 1.2);

    // ------------------------------------------------------------------------
    // 0. ELIMINATION SEQUENCE CINEMATIC TRACKING OVERRIDE
    // ------------------------------------------------------------------------
    if (this.isEliminationReplay) {
      this.eliminationTimer -= delta;
      if (this.eliminationTimer <= 0) {
        this.isEliminationReplay = false;
      } else {
        // Dramatic low-angle orbital spectator dolly tracking the wreck
        const angle = time * 1.5;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 48.0, delta * 8.0);
        this.camera.updateProjectionMatrix();

        const replayPos = this.eliminationTargetPos.clone()
          .add(new THREE.Vector3(Math.cos(angle) * 12.0, 3.5, Math.sin(angle) * 12.0));
        this.camera.position.lerp(replayPos, delta * 6.0);
        this.camera.lookAt(this.eliminationTargetPos);
        return;
      }
    }

    // ------------------------------------------------------------------------
    // 1. DYNAMIC FOV & FOCUS HUNTING
    // ------------------------------------------------------------------------
    if (this.mode === CAMERA_MODES.BROADCAST_DRONE) {
      // Telephoto lens with momentary focus hunting oscillation
      this.focusHuntPhase += delta * 14.0;
      const focusBreath = Math.sin(this.focusHuntPhase) * 1.8;
      const targetFov = this.broadcastFov + focusBreath;
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 5.0);
    } else {
      const targetFov = this.baseFov + (this.maxFov - this.baseFov) * speedRatio + (isBoosting ? 8 : 0);
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 6.0);
    }
    this.camera.updateProjectionMatrix();

    // ------------------------------------------------------------------------
    // 2. CAMERA SHAKE COMPUTATION
    // ------------------------------------------------------------------------
    if (isScraping) this.addShake(0.08);
    if (isBoosting) this.addShake(0.05);

    let shakeOffset = new THREE.Vector3(0, 0, 0);
    if (this.shakeIntensity > 0.001) {
      shakeOffset.set(
        Math.sin(time * 65.0) * this.shakeIntensity * 0.18,
        Math.cos(time * 85.0) * this.shakeIntensity * 0.18,
        Math.sin(time * 105.0) * this.shakeIntensity * 0.12
      );
      this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * this.shakeDecay);
    }

    // ------------------------------------------------------------------------
    // 3. CAMERA MODES HANDLING
    // ------------------------------------------------------------------------
    switch (this.mode) {
      case CAMERA_MODES.CHASE: {
        let velDir = craftVel.clone();
        if (velDir.lengthSq() < 1.0) {
          velDir = fwd.clone();
        } else {
          velDir.normalize();
        }

        // Dynamic chase distance: 8m at rest → 14m at full speed for better track visibility
        const dynamicChaseDistance = THREE.MathUtils.lerp(8.0, 14.0, speedRatio);
        const dynamicChaseHeight   = THREE.MathUtils.lerp(2.4, 3.5, speedRatio);

        this.targetCameraPos.copy(craftPos)
          .addScaledVector(velDir, -dynamicChaseDistance)
          .addScaledVector(up, dynamicChaseHeight);

        // Snap immediately if uninitialized (prevents camera starting at 0,0,0 while track is at Y=850)
        if (this.currentCameraPos.lengthSq() < 1.0) {
          this.currentCameraPos.copy(this.targetCameraPos);
        }

        const followSpeed = 14.0;
        this.currentCameraPos.lerp(this.targetCameraPos, delta * followSpeed);
        this.camera.position.copy(this.currentCameraPos).add(shakeOffset);

        // Look ahead further at higher speeds for better reaction time
        const lookAheadDist = THREE.MathUtils.lerp(4.0, 12.0, speedRatio);
        this.lookTarget.copy(craftPos).addScaledVector(fwd, lookAheadDist).addScaledVector(up, 0.4);
        this.camera.lookAt(this.lookTarget);
        this.camera.up.copy(up);
        break;
      }

      case CAMERA_MODES.COCKPIT: {
        const eyePos = craftPos.clone()
          .addScaledVector(fwd, 0.1)
          .addScaledVector(up, 0.65);

        this.camera.position.copy(eyePos).add(shakeOffset);
        this.lookTarget.copy(craftPos).addScaledVector(fwd, 15.0).addScaledVector(up, 0.5);
        this.camera.lookAt(this.lookTarget);
        this.camera.up.copy(up);
        break;
      }

      case CAMERA_MODES.BUMPER: {
        const nosePos = craftPos.clone()
          .addScaledVector(fwd, 2.8)
          .addScaledVector(up, 0.2);

        this.camera.position.copy(nosePos).add(shakeOffset);
        this.lookTarget.copy(craftPos).addScaledVector(fwd, 25.0);
        this.camera.lookAt(this.lookTarget);
        this.camera.up.copy(up);
        break;
      }

      case CAMERA_MODES.BROADCAST_DRONE: {
        // Broadcast Drone: High-altitude stationary/panning telemetry tower
        // Leapfrogs ahead of craft along track
        const distToAnchor = this.camera.position.distanceTo(craftPos);
        if (distToAnchor > 140.0 || distToAnchor < 15.0 || this.broadcastDroneAnchor.lengthSq() === 0) {
          // Relocate drone 90 meters ahead and 18 meters off to the outside rail
          this.broadcastDroneAnchor.copy(craftPos)
            .addScaledVector(fwd, 85.0)
            .addScaledVector(right, 24.0)
            .addScaledVector(up, 16.0);
          this.camera.position.copy(this.broadcastDroneAnchor);
        }

        // Simulated camera pan inertia (pan damping lag)
        this.lookTarget.copy(craftPos).addScaledVector(craftVel, 0.08); // Leads slightly
        this.laggedLookTarget.lerp(this.lookTarget, delta * 6.5);
        this.camera.lookAt(this.laggedLookTarget);
        this.camera.up.set(0, 1, 0);
        break;
      }

      case CAMERA_MODES.ORBIT: {
        const orbitRadius = 10.0;
        const orbitX = Math.cos(time * 0.8) * orbitRadius;
        const orbitZ = Math.sin(time * 0.8) * orbitRadius;

        this.targetCameraPos.copy(craftPos)
          .addScaledVector(right, orbitX)
          .addScaledVector(fwd, orbitZ)
          .addScaledVector(up, 3.0);

        this.camera.position.lerp(this.targetCameraPos, delta * 8.0);
        this.camera.lookAt(craftPos);
        this.camera.up.set(0, 1, 0);
        break;
      }
    }
  }
}
