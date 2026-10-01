import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - 6-DOF DYNAMIC RACING CAMERA ENGINE
// Modes: CHASE, HOOD, COCKPIT, BUMPER, ACTION, BROADCAST_DRONE, ORBIT, SLOW_MO_FINISH
// Features: Dynamic Centrifugal Roll Banking, Apex Look-Ahead Tracking,
// Spring-Damper Follow Dynamics, Hypersonic Speed FOV Warp & Buffeting Shake,
// Mode Transition Smoothing, and Zero-Allocation Per-Frame Math.
// ============================================================================

export const CAMERA_MODES = {
  CHASE: 'CHASE',
  HOOD: 'HOOD',
  COCKPIT: 'COCKPIT',
  BUMPER: 'BUMPER',
  ACTION: 'ACTION',
  BROADCAST_DRONE: 'BROADCAST DRONE',
  ORBIT: 'ORBIT',
  SLOW_MO_FINISH: 'SLOW MO FINISH'
};

// Reusable scratch vectors to eliminate per-frame GC allocations
const _fwd = new THREE.Vector3();
const _up = new THREE.Vector3();
const _right = new THREE.Vector3();
const _velDir = new THREE.Vector3();
const _tempVec1 = new THREE.Vector3();
const _tempVec2 = new THREE.Vector3();
const _shakeOffset = new THREE.Vector3();
const _bankQuat = new THREE.Quaternion();

export class CameraController {
  constructor(camera, domElement, circuit = null) {
    this.camera = camera;
    this.domElement = domElement;
    this.circuit = circuit;

    this.mode = CAMERA_MODES.CHASE;
    this.enableBanking = true;

    // Chase Cam spring-damper parameters
    this.chaseDistance = 7.8;
    this.chaseHeight = 2.4;
    this.targetCameraPos = new THREE.Vector3();
    this.currentCameraPos = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.currentLookTarget = new THREE.Vector3();
    this.laggedLookTarget = new THREE.Vector3();

    // Roll banking angle
    this.currentRoll = 0.0;
    this.targetRoll = 0.0;

    // Broadcast Drone Telephoto State
    this.broadcastDroneAnchor = new THREE.Vector3();
    this.broadcastTargetDistance = 45.0;

    // Elimination Sequence Slow-Mo Replay State
    this.isEliminationReplay = false;
    this.eliminationTimer = 0.0;
    this.eliminationTargetPos = new THREE.Vector3();

    // Camera shake & speed buffeting
    this.shakeIntensity = 0.0;
    this.shakeDecay = 4.2;

    // FOV elasticity
    this.baseFov = 75.0;
    this.targetFov = 75.0;

    // Event listener callback
    this.onCameraChange = null;
  }

  setMode(mode) {
    if (this.mode !== mode) {
      this.mode = mode;
      if (this.onCameraChange) {
        this.onCameraChange(this.mode);
      }
    }
  }

  cycleMode() {
    const cycleModes = [
      CAMERA_MODES.CHASE,
      CAMERA_MODES.HOOD,
      CAMERA_MODES.COCKPIT,
      CAMERA_MODES.BUMPER,
      CAMERA_MODES.ACTION,
      CAMERA_MODES.BROADCAST_DRONE
    ];
    const currentIndex = cycleModes.indexOf(this.mode);
    const nextMode = cycleModes[(currentIndex + 1) % cycleModes.length];
    this.setMode(nextMode);
    return this.mode;
  }

  addShake(amount) {
    this.shakeIntensity = Math.min(this.shakeIntensity + amount, 1.4);
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
    this.currentRoll = 0;

    _fwd.set(0, 0, 1).applyQuaternion(craftQuat);
    _up.set(0, 1, 0).applyQuaternion(craftQuat);

    this.targetCameraPos.copy(craftPos)
      .addScaledVector(_fwd, -8.0)
      .addScaledVector(_up, 2.4);

    this.currentCameraPos.copy(this.targetCameraPos);
    this.camera.position.copy(this.targetCameraPos);

    this.lookTarget.copy(craftPos).addScaledVector(_fwd, 8.0).addScaledVector(_up, 0.4);
    this.currentLookTarget.copy(this.lookTarget);
    this.camera.lookAt(this.currentLookTarget);
    this.camera.up.copy(_up);
  }

  update(delta, craftPos, craftVel, craftQuat, speedKmh, isScraping, isBoosting) {
    _fwd.set(0, 0, 1).applyQuaternion(craftQuat);
    _up.set(0, 1, 0).applyQuaternion(craftQuat);
    _right.set(1, 0, 0).applyQuaternion(craftQuat);
    const time = performance.now() * 0.001;

    // Speed ratio 0..1 (top speed ~420 km/h baseline)
    const speedRatio = Math.min(speedKmh / 420.0, 1.3);

    // ------------------------------------------------------------------------
    // 0. ELIMINATION REPLAY CINEMATIC TRACKING OVERRIDE
    // ------------------------------------------------------------------------
    if (this.isEliminationReplay) {
      this.eliminationTimer -= delta;
      if (this.eliminationTimer <= 0) {
        this.isEliminationReplay = false;
      } else {
        const angle = time * 1.5;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 48.0, delta * 8.0);
        this.camera.updateProjectionMatrix();

        _tempVec1.set(Math.cos(angle) * 12.0, 3.5, Math.sin(angle) * 12.0)
          .add(this.eliminationTargetPos);

        this.camera.position.lerp(_tempVec1, delta * 6.0);
        this.camera.lookAt(this.eliminationTargetPos);
        return;
      }
    }

    // ------------------------------------------------------------------------
    // 1. DYNAMIC FOV & HYPERSONIC STRETCH
    // ------------------------------------------------------------------------
    let desiredFov = 75.0;
    if (this.mode === CAMERA_MODES.COCKPIT || this.mode === CAMERA_MODES.HOOD) {
      desiredFov = 80.0 + speedRatio * 22.0 + (isBoosting ? 14.0 : 0.0);
    } else if (this.mode === CAMERA_MODES.BUMPER) {
      desiredFov = 85.0 + speedRatio * 20.0 + (isBoosting ? 12.0 : 0.0);
    } else if (this.mode === CAMERA_MODES.BROADCAST_DRONE) {
      desiredFov = 34.0; // High telephoto lens
    } else {
      // Chase, Action, Orbit
      desiredFov = 75.0 + speedRatio * 22.0 + (isBoosting ? 15.0 : 0.0);
    }

    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, desiredFov, delta * 7.5);
    this.camera.updateProjectionMatrix();

    // ------------------------------------------------------------------------
    // 2. CAMERA SHAKE & HIGH-SPEED BUFFETING
    // ------------------------------------------------------------------------
    if (isScraping) this.addShake(0.09);
    if (isBoosting) this.addShake(0.04);

    // Aerodynamic buffeting at high velocity (>320 km/h)
    if (speedKmh > 320.0) {
      const buffetIntensity = ((speedKmh - 320.0) / 130.0) * 0.025;
      this.addShake(buffetIntensity * delta * 60.0);
    }

    _shakeOffset.set(0, 0, 0);
    if (this.shakeIntensity > 0.001) {
      _shakeOffset.set(
        Math.sin(time * 65.0) * this.shakeIntensity * 0.18,
        Math.cos(time * 85.0) * this.shakeIntensity * 0.18,
        Math.sin(time * 105.0) * this.shakeIntensity * 0.12
      );
      this.shakeIntensity = Math.max(0.0, this.shakeIntensity - delta * this.shakeDecay);
    }

    // ------------------------------------------------------------------------
    // 3. CENTRIFUGAL ROLL BANKING INTO TURNS
    // ------------------------------------------------------------------------
    if (this.enableBanking && (this.mode === CAMERA_MODES.CHASE || this.mode === CAMERA_MODES.HOOD || this.mode === CAMERA_MODES.ACTION)) {
      // Calculate lateral drift/steer angle relative to forward
      const lateralVel = craftVel.dot(_right);
      const targetRollDeg = THREE.MathUtils.clamp(-lateralVel * 0.025, -0.22, 0.22);
      this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, targetRollDeg, delta * 6.5);
    } else {
      this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, 0.0, delta * 8.0);
    }

    // Compute dynamic banked Up vector
    const dynamicUp = _tempVec2.copy(_up);
    if (Math.abs(this.currentRoll) > 0.001) {
      _bankQuat.setFromAxisAngle(_fwd, this.currentRoll);
      dynamicUp.applyQuaternion(_bankQuat);
    }

    // ------------------------------------------------------------------------
    // 4. CAMERA MODES LOGIC
    // ------------------------------------------------------------------------
    switch (this.mode) {
      case CAMERA_MODES.CHASE: {
        // Blend velocity direction with vehicle forward for smooth drift tracking
        _velDir.copy(craftVel);
        if (_velDir.lengthSq() < 2.0) {
          _velDir.copy(_fwd);
        } else {
          _velDir.normalize();
          // 70% forward + 30% velocity vector for natural trailing
          _velDir.lerp(_fwd, 0.45).normalize();
        }

        // Dynamic distance & height based on speed and boost
        const dynamicDistance = THREE.MathUtils.lerp(6.6, 9.4, speedRatio) + (isBoosting ? 1.6 : 0.0);
        const dynamicHeight   = THREE.MathUtils.lerp(2.2, 2.7, speedRatio);

        this.targetCameraPos.copy(craftPos)
          .addScaledVector(_velDir, -dynamicDistance)
          .addScaledVector(_up, dynamicHeight);

        // Snap immediately if uninitialized
        if (this.currentCameraPos.lengthSq() < 1.0) {
          this.currentCameraPos.copy(this.targetCameraPos);
        }

        const followSpeed = 16.0;
        this.currentCameraPos.lerp(this.targetCameraPos, Math.min(1.0, delta * followSpeed));

        // Track surface clearance clamping: prevents camera from penetrating track underside or clipping barriers
        if (this.circuit) {
          const closest = this.circuit.getClosestFrame(this.currentCameraPos);
          if (closest && closest.frame) {
            _tempVec1.copy(this.currentCameraPos).sub(closest.frame.pos);
            const heightAboveTrack = _tempVec1.dot(closest.frame.normal);
            const minHeight = 2.1;
            if (heightAboveTrack < minHeight) {
              this.currentCameraPos.addScaledVector(closest.frame.normal, minHeight - heightAboveTrack);
            }

            // Barrier clearance check: prevent clipping behind or inside the barrier
            const halfWidth = this.circuit.roadWidth * 0.5;
            const latDist = Math.abs(closest.lateralOffset);
            if (latDist > halfWidth - 2.4 && latDist < halfWidth + 2.4) {
              const barrierMinH = this.circuit.barrierHeight + 0.85;
              const curH = this.currentCameraPos.clone().sub(closest.frame.pos).dot(closest.frame.normal);
              if (curH < barrierMinH) {
                this.currentCameraPos.addScaledVector(closest.frame.normal, barrierMinH - curH);
              }
            }
          }
        }

        this.camera.position.copy(this.currentCameraPos).add(_shakeOffset);

        // Look-ahead apex target
        const lookAheadDist = THREE.MathUtils.lerp(6.5, 12.0, speedRatio);
        this.lookTarget.copy(craftPos)
          .addScaledVector(_fwd, lookAheadDist)
          .addScaledVector(_up, 0.45);

        this.currentLookTarget.lerp(this.lookTarget, Math.min(1.0, delta * 20.0));
        this.camera.lookAt(this.currentLookTarget);
        this.camera.up.copy(dynamicUp);
        break;
      }

      case CAMERA_MODES.HOOD: {
        // Nose / hood action perspective: intense, direct track connection
        const hoodPos = _tempVec1.copy(craftPos)
          .addScaledVector(_fwd, 1.4)
          .addScaledVector(_up, 0.55);

        this.camera.position.copy(hoodPos).add(_shakeOffset);
        this.lookTarget.copy(craftPos).addScaledVector(_fwd, 20.0).addScaledVector(_up, 0.3);
        this.camera.lookAt(this.lookTarget);
        this.camera.up.copy(dynamicUp);
        break;
      }

      case CAMERA_MODES.COCKPIT: {
        // First-person pilot perspective inside the canopy
        const eyePos = _tempVec1.copy(craftPos)
          .addScaledVector(_fwd, 0.15)
          .addScaledVector(_up, 0.65);

        this.camera.position.copy(eyePos).add(_shakeOffset);
        this.lookTarget.copy(craftPos).addScaledVector(_fwd, 18.0).addScaledVector(_up, 0.45);
        this.camera.lookAt(this.lookTarget);
        this.camera.up.copy(dynamicUp);
        break;
      }

      case CAMERA_MODES.BUMPER: {
        // Track-level splitter perspective: maximum speed rush
        const nosePos = _tempVec1.copy(craftPos)
          .addScaledVector(_fwd, 3.2)
          .addScaledVector(_up, 0.22);

        this.camera.position.copy(nosePos).add(_shakeOffset);
        this.lookTarget.copy(craftPos).addScaledVector(_fwd, 28.0).addScaledVector(_up, 0.1);
        this.camera.lookAt(this.lookTarget);
        this.camera.up.copy(_up);
        break;
      }

      case CAMERA_MODES.ACTION: {
        // Dynamic floating action camera: dynamic orbiting angle tracking drift
        const orbitAngle = time * 0.4;
        const actionDist = 8.2 + speedRatio * 2.0;
        this.targetCameraPos.copy(craftPos)
          .addScaledVector(_fwd, -actionDist * 0.85)
          .addScaledVector(_right, Math.sin(orbitAngle) * 3.5)
          .addScaledVector(_up, 2.5 + Math.cos(orbitAngle) * 0.6);

        this.camera.position.lerp(this.targetCameraPos, Math.min(1.0, delta * 10.0)).add(_shakeOffset);
        this.lookTarget.copy(craftPos).addScaledVector(_fwd, 5.0).addScaledVector(_up, 0.5);
        this.camera.lookAt(this.lookTarget);
        this.camera.up.copy(dynamicUp);
        break;
      }

      case CAMERA_MODES.BROADCAST_DRONE: {
        // Broadcast Drone: High-altitude stationary/panning telemetry tower
        const distToAnchor = this.camera.position.distanceTo(craftPos);
        if (distToAnchor > 140.0 || distToAnchor < 15.0 || this.broadcastDroneAnchor.lengthSq() === 0) {
          this.broadcastDroneAnchor.copy(craftPos)
            .addScaledVector(_fwd, 90.0)
            .addScaledVector(_right, 26.0)
            .addScaledVector(_up, 18.0);
          this.camera.position.copy(this.broadcastDroneAnchor);
        }

        this.lookTarget.copy(craftPos).addScaledVector(craftVel, 0.08);
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
          .addScaledVector(_right, orbitX)
          .addScaledVector(_fwd, orbitZ)
          .addScaledVector(_up, 3.0);

        this.camera.position.lerp(this.targetCameraPos, delta * 8.0);
        this.camera.lookAt(craftPos);
        this.camera.up.set(0, 1, 0);
        break;
      }

      case CAMERA_MODES.SLOW_MO_FINISH: {
        // Dramatic side-angle tracking pass across finish line
        this.targetCameraPos.copy(craftPos)
          .addScaledVector(_right, 7.5)
          .addScaledVector(_fwd, 1.2)
          .addScaledVector(_up, 1.6);

        this.camera.position.lerp(this.targetCameraPos, delta * 12.0);
        this.lookTarget.copy(craftPos).addScaledVector(_fwd, 2.0).addScaledVector(_up, 0.4);
        this.camera.lookAt(this.lookTarget);
        this.camera.up.set(0, 1, 0);
        break;
      }
    }
  }

  updateRaceIntro(introProgress, circuit, rivals = [], playerVehicle = null) {
    if (!circuit) return;

    if (introProgress < 0.32) {
      // 1. High-speed broadcast crane sweep over Start/Finish gantry along the illuminated track corridor
      const p = introProgress / 0.32;
      const easeP = p * p * (3.0 - 2.0 * p); // Smooth cubic ease
      const frame0 = circuit.getFrameAt(0.0);

      const startPos = _tempVec1.copy(frame0.pos)
        .addScaledVector(frame0.tangent, -42)
        .addScaledVector(frame0.normal, 20.0)
        .addScaledVector(frame0.binormal, 8.5);

      const endPos = _tempVec2.copy(frame0.pos)
        .addScaledVector(frame0.tangent, 18)
        .addScaledVector(frame0.normal, 4.8)
        .addScaledVector(frame0.binormal, 5.5);

      this.camera.position.lerpVectors(startPos, endPos, easeP);
      const lookAhead = _fwd.copy(frame0.pos)
        .addScaledVector(frame0.tangent, 55)
        .addScaledVector(frame0.normal, 1.8);
      this.camera.lookAt(lookAhead);
      this.camera.fov = THREE.MathUtils.lerp(65, 54, easeP);
      this.camera.updateProjectionMatrix();
    } else if (introProgress < 0.78) {
      // 2. Smooth continuous dolly tracking sweep past starting grid racers
      const p = (introProgress - 0.32) / 0.46;
      const allRacers = [
        playerVehicle,
        ...rivals.map(r => r.vehicle)
      ].filter(Boolean);

      const totalRacers = allRacers.length;
      if (totalRacers > 0) {
        // Continuous float index moving from back of grid to front of grid
        const floatIdx = (1.0 - p) * (totalRacers - 1);
        const baseIdx = Math.floor(floatIdx);
        const nextIdx = Math.min(baseIdx + 1, totalRacers - 1);
        const frac = floatIdx - baseIdx;

        const r1 = allRacers[baseIdx];
        const r2 = allRacers[nextIdx];

        if (r1 && r2) {
          _tempVec1.lerpVectors(r1.group.position, r2.group.position, 1.0 - frac);
        } else if (r1) {
          _tempVec1.copy(r1.group.position);
        } else {
          _tempVec1.set(0, 150, 0);
        }

        // Anchor camera relative to track corridor Frenet frame to prevent clipping into buildings
        const trackFrame = circuit.getClosestFrame ? circuit.getClosestFrame(_tempVec1) : circuit.getFrameAt(0.0);
        const fTangent = trackFrame.tangent || trackFrame.frame?.tangent || new THREE.Vector3(0, 0, 1);
        const fNormal = trackFrame.normal || trackFrame.frame?.normal || new THREE.Vector3(0, 1, 0);
        const fBinormal = trackFrame.binormal || trackFrame.frame?.binormal || new THREE.Vector3(1, 0, 0);

        const sideSweep = (Math.sin(p * Math.PI) * 1.2 + 3.8);
        this.camera.position.copy(_tempVec1)
          .addScaledVector(fTangent, -1.8)
          .addScaledVector(fNormal, 1.45)
          .addScaledVector(fBinormal, sideSweep);

        const lookTarget = _tempVec2.copy(_tempVec1)
          .addScaledVector(fTangent, 6.0)
          .addScaledVector(fNormal, 0.4);

        this.camera.lookAt(lookTarget);
        this.camera.up.copy(fNormal);
        this.camera.fov = 52;
        this.camera.updateProjectionMatrix();
      }
    } else {
      // 3. Final hero sweep behind player's craft, aligning seamlessly into Chase cam
      const p = (introProgress - 0.78) / 0.22;
      const easeP = p * p * (3.0 - 2.0 * p);

      if (playerVehicle) {
        const pPos = playerVehicle.group.position;
        const pRot = playerVehicle.group.quaternion;
        _fwd.set(0, 0, 1).applyQuaternion(pRot);
        _up.set(0, 1, 0).applyQuaternion(pRot);
        _right.set(1, 0, 0).applyQuaternion(pRot);

        const sideIntroPos = _tempVec1.copy(pPos)
          .addScaledVector(_fwd, -4.5)
          .addScaledVector(_right, 3.2)
          .addScaledVector(_up, 1.6);

        const targetChasePos = _tempVec2.copy(pPos)
          .addScaledVector(_fwd, -7.5)
          .addScaledVector(_up, 2.3);

        this.camera.position.lerpVectors(sideIntroPos, targetChasePos, easeP);
        const lookTarget = _tempVec1.copy(pPos).addScaledVector(_fwd, 8.0).addScaledVector(_up, 0.4);
        this.camera.lookAt(lookTarget);
        this.camera.up.copy(_up);
        this.camera.fov = THREE.MathUtils.lerp(52, 75, easeP);
        this.camera.updateProjectionMatrix();
      }
    }
  }
}
