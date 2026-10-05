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
    this.lastTrackU = 0.0;

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

    this.boostPushback = 0.0;
    this.accelLag = 0.0;
    this.lastSpeedKmh = 0.0;

    // FOV elasticity
    this.baseFov = 75.0;
    this.targetFov = 75.0;

    // Event listener callback
    this.onCameraChange = null;
  }

  setCircuit(circuit) {
    this.circuit = circuit;
  }

  setMode(mode) {
    if (this.mode !== mode) {
      this.mode = mode;
      // Snap currentCameraPos to current camera position to prevent violent warp on mode switch
      this.currentCameraPos.copy(this.camera.position);
      this.currentLookTarget.copy(this.lookTarget);
      if (this.onCameraChange) {
        this.onCameraChange(this.mode);
      }
    }
  }

  isFPP() {
    return this.mode === CAMERA_MODES.COCKPIT || this.mode === CAMERA_MODES.HOOD || this.mode === CAMERA_MODES.BUMPER;
  }

  togglePerspective() {
    if (this.isFPP()) {
      this.setMode(CAMERA_MODES.CHASE);
    } else {
      this.setMode(CAMERA_MODES.COCKPIT);
    }
    return this.mode;
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

  reset(craftPos, craftQuat, snap = true) {
    this.isEliminationReplay = false;
    this.eliminationTimer = 0;
    this.boostPushback = 0.0;
    this.accelLag = 0.0;
    this.lastSpeedKmh = 0.0;
    this.targetRoll = 0.0;
    this.broadcastDroneAnchor.set(0, 0, 0);
    this.shakeIntensity = 0;
    this.currentRoll = 0;

    _fwd.set(0, 0, 1).applyQuaternion(craftQuat);
    _up.set(0, 1, 0).applyQuaternion(craftQuat);

    this.targetCameraPos.copy(craftPos)
      .addScaledVector(_fwd, -7.4)
      .addScaledVector(_up, 2.3);

    this.lookTarget.copy(craftPos).addScaledVector(_fwd, 20.0).addScaledVector(_up, 1.25);

    if (snap || this.currentCameraPos.lengthSq() < 1.0) {
      this.currentCameraPos.copy(this.targetCameraPos);
      this.camera.position.copy(this.targetCameraPos);
      this.currentLookTarget.copy(this.lookTarget);
      this.camera.lookAt(this.currentLookTarget);
      this.camera.up.copy(_up);
      this.camera.fov = this.baseFov;
      this.camera.updateProjectionMatrix();
    } else {
      this.targetFov = this.baseFov;
    }
  }

  update(delta, craftPos, craftVel, craftQuat, speedKmh, isScraping, isBoosting, aerialInfo = null, landingShake = 0.0) {
    _fwd.set(0, 0, 1).applyQuaternion(craftQuat);
    _up.set(0, 1, 0).applyQuaternion(craftQuat);
    _right.set(1, 0, 0).applyQuaternion(craftQuat);
    const time = performance.now() * 0.001;

    // Speed ratio 0..1 (top speed ~420 km/h baseline)
    const speedRatio = Math.min(speedKmh / 420.0, 1.25);

    // Dynamic G-force acceleration pull-back / braking forward compression lag
    const speedDelta = (speedKmh - this.lastSpeedKmh) / Math.max(0.001, delta);
    this.lastSpeedKmh = speedKmh;
    const targetAccelLag = THREE.MathUtils.clamp(speedDelta * 0.007, -0.65, 0.95);
    this.accelLag = THREE.MathUtils.damp(this.accelLag, targetAccelLag, 6.0, delta);

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
    // 1. CALIBRATED DYNAMIC FOV (74° base to 85° high-speed + 5° nitro = 90° max)
    // Preserves vehicle prominence on screen rather than shrinking vehicle into distance
    // ------------------------------------------------------------------------
    let desiredFov = 74.0;
    if (this.mode === CAMERA_MODES.COCKPIT || this.mode === CAMERA_MODES.HOOD) {
      desiredFov = 78.0 + speedRatio * 15.0 + (isBoosting ? 8.0 : 0.0);
    } else if (this.mode === CAMERA_MODES.BUMPER) {
      desiredFov = 82.0 + speedRatio * 14.0 + (isBoosting ? 8.0 : 0.0);
    } else if (this.mode === CAMERA_MODES.BROADCAST_DRONE) {
      desiredFov = 34.0; // High telephoto lens
    } else {
      // Chase, Action, Orbit: natural cinematic FOV curve
      desiredFov = 74.0 + speedRatio * 11.0 + (isBoosting ? 5.5 : 0.0);
    }

    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, desiredFov, delta * 7.5);
    this.camera.updateProjectionMatrix();

    // ------------------------------------------------------------------------
    // 2. CAMERA SHAKE, LANDING IMPULSE & NITRO VIBRATION
    // ------------------------------------------------------------------------
    if (landingShake > 0.01) this.addShake(landingShake);
    if (isScraping) this.addShake(0.09);
    if (isBoosting) this.addShake(0.035);

    // Aerodynamic buffeting at hypersonic velocity (>340 km/h)
    if (speedKmh > 340.0) {
      const buffetIntensity = ((speedKmh - 340.0) / 120.0) * 0.022;
      this.addShake(buffetIntensity * delta * 60.0);
    }

    _shakeOffset.set(0, 0, 0);
    if (this.shakeIntensity > 0.001) {
      const shakeScale = 0.5 + speedRatio * 0.5;
      _shakeOffset.set(
        Math.sin(time * 65.0) * this.shakeIntensity * 0.16 * shakeScale,
        Math.cos(time * 85.0) * this.shakeIntensity * 0.16 * shakeScale,
        Math.sin(time * 105.0) * this.shakeIntensity * 0.10 * shakeScale
      );
      this.shakeIntensity = Math.max(0.0, this.shakeIntensity - delta * this.shakeDecay);
    }

    // Subtle high-frequency camera vibration during nitro boost
    if (isBoosting) {
      _shakeOffset.x += Math.sin(time * 95.0) * 0.025;
      _shakeOffset.y += Math.cos(time * 115.0) * 0.020;
    }

    // ------------------------------------------------------------------------
    // 3. CENTRIFUGAL ROLL BANKING INTO TURNS WITH STABILIZATION
    // ------------------------------------------------------------------------
    // Track normal reference prevents sideways tilting on curb or wall scrape
    let trackNormal = _up;
    let trackTangent = _fwd;
    if (this.circuit && this.circuit.getClosestFrame) {
      const trackRef = this.circuit.getClosestFrame(craftPos, this.lastTrackU);
      if (trackRef && trackRef.frame) {
        trackNormal = trackRef.frame.normal;
        trackTangent = trackRef.frame.tangent;
        this.lastTrackU = trackRef.u;
      }
    }

    // Blend up vector to track normal when stationary, wedged or tilted
    if (speedKmh < 45.0 || _up.dot(trackNormal) < 0.88) {
      _up.lerp(trackNormal, Math.min(1.0, delta * 12.0)).normalize();
    }

    if (this.enableBanking && (this.mode === CAMERA_MODES.CHASE || this.mode === CAMERA_MODES.HOOD || this.mode === CAMERA_MODES.ACTION)) {
      if (speedKmh > 30.0) {
        const lateralVel = craftVel.dot(_right);
        const targetRollDeg = THREE.MathUtils.clamp(-lateralVel * 0.02, -0.12, 0.12);
        this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, targetRollDeg, delta * 6.5);
        if (aerialInfo && aerialInfo.inAir && aerialInfo.barrelRollAngle) {
          this.currentRoll += THREE.MathUtils.clamp(aerialInfo.barrelRollAngle * 0.14, -0.2, 0.2);
        }
      } else {
        this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, 0.0, delta * 10.0);
      }
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
        // TPP (Third-Person Perspective) Behind-the-Car Follow Camera
        // Firmly positioned directly behind the vehicle heading for authentic arcade rear chase view
        _velDir.copy(_fwd);
        if (speedKmh > 25.0 && craftVel.lengthSq() > 1.0) {
          const velNorm = _tempVec1.copy(craftVel).normalize();
          // Maintain 88% vehicle forward + 12% velocity vector for subtle drift yaw without swinging sideways
          _velDir.lerp(velNorm, 0.12).normalize();
        }

        if (isBoosting) {
          this.boostPushback = THREE.MathUtils.lerp(this.boostPushback, 0.75, delta * 8.0);
        } else {
          this.boostPushback = THREE.MathUtils.lerp(this.boostPushback, 0.0, delta * 6.0);
        }

        // Calibrated TPP distance & height: vehicle retains commanding scale and speed perception
        const dynamicDistance = THREE.MathUtils.lerp(6.2, 7.4, speedRatio) + this.boostPushback + this.accelLag;
        const dynamicHeight   = THREE.MathUtils.lerp(2.20, 2.48, speedRatio);

        // Jump pitch follow: smoothly tilt camera with vehicle launch and trajectory
        if (aerialInfo && aerialInfo.inAir) {
          const jumpPitch = THREE.MathUtils.clamp((aerialInfo.verticalVel || 0) * 0.012, -0.14, 0.22);
          dynamicUp.addScaledVector(_fwd, jumpPitch);
        }

        this.targetCameraPos.copy(craftPos)
          .addScaledVector(_velDir, -dynamicDistance)
          .addScaledVector(dynamicUp, dynamicHeight);

        // Snap immediately if uninitialized
        if (this.currentCameraPos.lengthSq() < 1.0) {
          this.currentCameraPos.copy(this.targetCameraPos);
        }

        // Responsive spring-damper following directly behind vehicle rear
        const followSpeed = 22.0;
        this.currentCameraPos.lerp(this.targetCameraPos, Math.min(1.0, delta * followSpeed));

        // Track surface clearance clamping: prevents camera from penetrating track underside or clipping barriers
        if (this.circuit) {
          const closest = this.circuit.getClosestFrame(this.currentCameraPos, this.lastTrackU);
          if (closest && closest.frame) {
            _tempVec1.copy(this.currentCameraPos).sub(closest.frame.pos);
            const heightAboveTrack = _tempVec1.dot(closest.frame.normal);
            const minHeight = 2.1;
            if (heightAboveTrack < minHeight) {
              this.currentCameraPos.addScaledVector(closest.frame.normal, minHeight - heightAboveTrack);
            }

            // Barrier clearance check: push camera inward and up if near walls
            const halfWidth = this.circuit.roadWidth * 0.5;
            const latDist = Math.abs(closest.lateralOffset);
            if (latDist > halfWidth - 2.8) {
              const pushInward = (latDist - (halfWidth - 2.8)) * 0.85;
              this.currentCameraPos.addScaledVector(closest.frame.binormal, -Math.sign(closest.lateralOffset) * pushInward);
              const barrierMinH = this.circuit.barrierHeight + 1.15;
              const curH = _tempVec1.copy(this.currentCameraPos).sub(closest.frame.pos).dot(closest.frame.normal);
              if (curH < barrierMinH) {
                this.currentCameraPos.addScaledVector(closest.frame.normal, barrierMinH - curH);
              }
            }
          }
        }

        this.camera.position.copy(this.currentCameraPos).add(_shakeOffset);

        // Look-ahead target anchored ahead of vehicle for panoramic forward road preview
        const lookAheadDist = THREE.MathUtils.lerp(18.0, 34.0, speedRatio);
        this.lookTarget.copy(craftPos)
          .addScaledVector(_fwd, lookAheadDist)
          .addScaledVector(dynamicUp, 1.25);

        this.currentLookTarget.lerp(this.lookTarget, Math.min(1.0, delta * 24.0));
        this.camera.up.copy(dynamicUp);
        this.camera.lookAt(this.currentLookTarget);
        break;
      }

      case CAMERA_MODES.HOOD: {
        // Nose / hood action perspective: intense, direct track connection
        const hoodPos = _tempVec1.copy(craftPos)
          .addScaledVector(_fwd, 1.4)
          .addScaledVector(_up, 0.55);

        this.camera.position.copy(hoodPos).add(_shakeOffset);
        this.lookTarget.copy(craftPos).addScaledVector(_fwd, 20.0).addScaledVector(_up, 0.3);
        this.camera.up.copy(dynamicUp);
        this.camera.lookAt(this.lookTarget);
        break;
      }

      case CAMERA_MODES.COCKPIT: {
        // First-person pilot perspective inside the canopy
        const eyePos = _tempVec1.copy(craftPos)
          .addScaledVector(_fwd, 0.15)
          .addScaledVector(_up, 0.65);

        const bobAmt = Math.min(speedKmh / 420.0, 1.0) * 0.04;
        eyePos.addScaledVector(_up, Math.sin(time * 18.0) * bobAmt);

        this.camera.position.copy(eyePos).add(_shakeOffset);
        this.lookTarget.copy(craftPos).addScaledVector(_fwd, 18.0).addScaledVector(_up, 0.45);
        this.camera.up.copy(dynamicUp);
        this.camera.lookAt(this.lookTarget);
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
        this.camera.up.copy(dynamicUp);
        this.camera.lookAt(this.lookTarget);
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
        const finishAngle = time * 0.6;
        this.targetCameraPos.copy(craftPos)
          .addScaledVector(_right, Math.cos(finishAngle) * 8.5)
          .addScaledVector(_fwd, Math.sin(finishAngle) * 3.5)
          .addScaledVector(_up, 1.8 + Math.sin(finishAngle * 0.5) * 0.5);

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

    // Resolve player craft position and orientation with robust fallbacks
    const frame0 = circuit.getFrameAt(0.0);
    const pPos = (playerVehicle && playerVehicle.group) ? playerVehicle.group.position : frame0.pos;
    const pRot = (playerVehicle && playerVehicle.group) ? playerVehicle.group.quaternion : new THREE.Quaternion();

    _fwd.set(0, 0, 1).applyQuaternion(pRot);
    _up.set(0, 1, 0).applyQuaternion(pRot);
    _right.set(1, 0, 0).applyQuaternion(pRot);

    if (introProgress < 0.25) {
      // ----------------------------------------------------------------------
      // SHOT 1 (0.00 - 0.25): [CAM 01 // HERO FASCIA & AERODYNAMICS]
      // Low-angle Dutch beauty pass gliding across the front splitter, headlights and canopy
      // ----------------------------------------------------------------------
      const p = introProgress / 0.25;
      const easeP = p * p * (3.0 - 2.0 * p);

      const startPos = _tempVec1.copy(pPos)
        .addScaledVector(_fwd, 4.2)
        .addScaledVector(_right, 2.4)
        .addScaledVector(_up, 0.45);

      const endPos = _tempVec2.copy(pPos)
        .addScaledVector(_fwd, 2.6)
        .addScaledVector(_right, -1.8)
        .addScaledVector(_up, 0.85);

      this.camera.position.lerpVectors(startPos, endPos, easeP);

      const startLook = _velDir.copy(pPos).addScaledVector(_fwd, 0.6).addScaledVector(_up, 0.35);
      const endLook = _shakeOffset.copy(pPos).addScaledVector(_fwd, -0.3).addScaledVector(_up, 0.65);
      this.lookTarget.lerpVectors(startLook, endLook, easeP);
      this.camera.lookAt(this.lookTarget);

      // Subtle Dutch angle for dramatic automotive aesthetic
      const dutchAngle = THREE.MathUtils.lerp(-0.08, 0.05, easeP);
      _bankQuat.setFromAxisAngle(_fwd, dutchAngle);
      this.camera.up.copy(_up).applyQuaternion(_bankQuat);

      this.camera.fov = THREE.MathUtils.lerp(42.0, 48.0, easeP);
      this.camera.updateProjectionMatrix();

    } else if (introProgress < 0.50) {
      // ----------------------------------------------------------------------
      // SHOT 2 (0.25 - 0.50): [CAM 02 // DUAL THRUSTER PROPULSION & DIFFUSER]
      // Ultra-low asphalt angle tracking titanium exhaust vents, underglow & turbine spool
      // ----------------------------------------------------------------------
      const p = (introProgress - 0.25) / 0.25;
      const easeP = p * p * (3.0 - 2.0 * p);

      const startPos = _tempVec1.copy(pPos)
        .addScaledVector(_fwd, -3.4)
        .addScaledVector(_right, -1.9)
        .addScaledVector(_up, 0.32);

      const endPos = _tempVec2.copy(pPos)
        .addScaledVector(_fwd, -4.8)
        .addScaledVector(_right, 1.4)
        .addScaledVector(_up, 0.82);

      this.camera.position.lerpVectors(startPos, endPos, easeP);

      this.lookTarget.copy(pPos)
        .addScaledVector(_fwd, -0.6)
        .addScaledVector(_up, 0.42);
      this.camera.lookAt(this.lookTarget);

      const dutchAngle = THREE.MathUtils.lerp(0.06, -0.04, easeP);
      _bankQuat.setFromAxisAngle(_fwd, dutchAngle);
      this.camera.up.copy(_up).applyQuaternion(_bankQuat);

      this.camera.fov = THREE.MathUtils.lerp(48.0, 52.0, easeP);
      this.camera.updateProjectionMatrix();

    } else if (introProgress < 0.72) {
      // ----------------------------------------------------------------------
      // SHOT 3 (0.50 - 0.72): [CAM 03 // TRACKSIDE TELEPHOTO GRID FLYBY]
      // Telephoto barrier broadcast lens sweeping down starting grid past rival racers
      // ----------------------------------------------------------------------
      const p = (introProgress - 0.50) / 0.22;
      const allRacers = [
        playerVehicle,
        ...rivals.map(r => r.vehicle)
      ].filter(Boolean);

      const totalRacers = allRacers.length;
      if (totalRacers > 0) {
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
          _tempVec1.copy(frame0.pos);
        }

        const trackFrame = circuit.getClosestFrame ? circuit.getClosestFrame(_tempVec1) : frame0;
        const fTangent = trackFrame.tangent || trackFrame.frame?.tangent || new THREE.Vector3(0, 0, 1);
        const fNormal = trackFrame.normal || trackFrame.frame?.normal || new THREE.Vector3(0, 1, 0);
        const fBinormal = trackFrame.binormal || trackFrame.frame?.binormal || new THREE.Vector3(1, 0, 0);

        const sideSweep = Math.sin(p * Math.PI) * 1.0 + 4.2;
        this.camera.position.copy(_tempVec1)
          .addScaledVector(fTangent, -2.2)
          .addScaledVector(fNormal, 1.65)
          .addScaledVector(fBinormal, sideSweep);

        this.lookTarget.copy(_tempVec1)
          .addScaledVector(fTangent, 7.5)
          .addScaledVector(fNormal, 0.45);

        this.camera.lookAt(this.lookTarget);
        this.camera.up.copy(fNormal);
        this.camera.fov = 36.0; // High telephoto broadcast compression
        this.camera.updateProjectionMatrix();
      }

    } else {
      // ----------------------------------------------------------------------
      // SHOT 4 (0.72 - 1.00): [CAM 04 // LAUNCH GANTRY SWOOP & CHASE TOUCHDOWN]
      // High gantry crane swooping smoothly down into the driver's Chase Cam
      // ----------------------------------------------------------------------
      const p = (introProgress - 0.72) / 0.28;
      const easeP = p * p * (3.0 - 2.0 * p);

      const highCranePos = _tempVec1.copy(pPos)
        .addScaledVector(_fwd, -16.0)
        .addScaledVector(_right, 3.8)
        .addScaledVector(_up, 11.5);

      const targetChasePos = _tempVec2.copy(pPos)
        .addScaledVector(_fwd, -7.4)
        .addScaledVector(_up, 2.3);

      this.camera.position.lerpVectors(highCranePos, targetChasePos, easeP);

      const craneLook = _velDir.copy(pPos).addScaledVector(_fwd, 26.0).addScaledVector(_up, 0.8);
      const chaseLook = _shakeOffset.copy(pPos).addScaledVector(_fwd, 20.0).addScaledVector(_up, 1.25);
      this.lookTarget.lerpVectors(craneLook, chaseLook, easeP);

      this.camera.lookAt(this.lookTarget);
      this.camera.up.copy(_up);
      this.camera.fov = THREE.MathUtils.lerp(48.0, 74.0, easeP);
      this.camera.updateProjectionMatrix();

      // Pre-seed chase camera vectors so transition into COUNTDOWN / RACING is 100% seamless
      this.currentCameraPos.copy(this.camera.position);
      this.currentLookTarget.copy(this.lookTarget);
      this.targetCameraPos.copy(this.camera.position);
    }
  }
}
