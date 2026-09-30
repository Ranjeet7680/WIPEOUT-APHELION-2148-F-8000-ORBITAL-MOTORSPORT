import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - 16-SURFACE PROCEDURAL KINETIC RIG & BIOMECHANICAL PILOT IK
// 1. Aerodynamic Dynamic Airbrake Deflection with High-Frequency Edge Flutter
// 2. Twin-Nozzle Spherical Gimbal (±15°) & Expansion Vectoring Heat Shields
// 3. Ventral Dual-Stage Spring Damped Repulsor Ring Breathing
// 4. Dynamic Multi-Slotted Front Canards
// 5. Cranial Inertia, G-LOC Neck Strain, Biometric Respiratory Expansion
// 6. 2-Bone Analytical Inverse Kinematics (IK) for Dual Flight-Stick Anchoring
// ============================================================================

export class CraftRig {
  constructor(craftVisualGroup) {
    this.visualGroup = craftVisualGroup;

    // 16 Kinetic Surfaces & Biomechanical IK Nodes
    this.bones = {
      // Hull Master Anchor
      rootHull: new THREE.Group(),

      // Kinetic Surfaces (1-4): Airbrakes & Split Bleeders
      airbrakeLMain: new THREE.Group(),
      airbrakeRMain: new THREE.Group(),
      airbrakeLSub: new THREE.Group(),
      airbrakeRSub: new THREE.Group(),

      // Kinetic Surfaces (5-6): Dynamic Multi-Slotted Front Canards
      canardLeft: new THREE.Group(),
      canardRight: new THREE.Group(),

      // Kinetic Surfaces (7-8): Vectoring Expansion Heat Shields
      heatShieldNozzleL: new THREE.Group(),
      heatShieldNozzleR: new THREE.Group(),

      // Kinetic Surfaces (9-10): Spherical Thrust Nozzles (±15°)
      gimbalNozzleLeft: new THREE.Group(),
      gimbalNozzleRight: new THREE.Group(),

      // Kinetic Surfaces (11-14): Ventral Dual-Stage Repulsor Breathing Rings
      repulsorRingFL: new THREE.Group(),
      repulsorRingFR: new THREE.Group(),
      repulsorRingRL: new THREE.Group(),
      repulsorRingRR: new THREE.Group(),

      // Kinetic Surfaces (15-16): Cockpit Fly-By-Wire Flight Sticks
      flightStickL: new THREE.Group(),
      flightStickR: new THREE.Group(),

      // Biomechanical Pilot Rig Nodes
      pilotSpine: new THREE.Group(),
      pilotChest: new THREE.Group(),
      pilotHeadLookAt: new THREE.Group(),

      // 2-Bone Arm IK Joint Chains
      pilotShoulderL: new THREE.Group(),
      pilotElbowL: new THREE.Group(),
      pilotHandL: new THREE.Group(),

      pilotShoulderR: new THREE.Group(),
      pilotElbowR: new THREE.Group(),
      pilotHandR: new THREE.Group()
    };

    // Dual-Stage Repulsor Spring-Damper State
    this.repulsorDampers = [
      { disp: 0, vel: 0 },
      { disp: 0, vel: 0 },
      { disp: 0, vel: 0 },
      { disp: 0, vel: 0 }
    ];

    // Biometric Respiratory Timing
    this.breathPhase = 0.0;
    this.heartbeatRate = 72; // bpm resting -> 180 bpm under 12G

    this.setupHierarchy();
  }

  setupHierarchy() {
    const b = this.bones;

    // 1. Root Hull is child of craft visual group
    this.visualGroup.add(b.rootHull);

    // 2. Airbrake pivots & Split Bleeders
    b.airbrakeLMain.position.set(-1.45, 0.45, -1.2);
    b.airbrakeLSub.position.set(-0.25, 0.08, -0.4);
    b.airbrakeLMain.add(b.airbrakeLSub);
    b.rootHull.add(b.airbrakeLMain);

    b.airbrakeRMain.position.set(1.45, 0.45, -1.2);
    b.airbrakeRSub.position.set(0.25, 0.08, -0.4);
    b.airbrakeRMain.add(b.airbrakeRSub);
    b.rootHull.add(b.airbrakeRMain);

    // 3. Dynamic Multi-Slotted Front Canards
    b.canardLeft.position.set(-0.85, 0.15, 1.8);
    b.canardRight.position.set(0.85, 0.15, 1.8);
    b.rootHull.add(b.canardLeft);
    b.rootHull.add(b.canardRight);

    // 4. Gimbal Thrust Nozzles (Twin spherical joints at rear)
    b.gimbalNozzleLeft.position.set(-0.75, 0.0, -2.6);
    b.gimbalNozzleRight.position.set(0.75, 0.0, -2.6);
    b.rootHull.add(b.gimbalNozzleLeft);
    b.rootHull.add(b.gimbalNozzleRight);

    // Afterburner Expansion Heat Shields (Parented to gimbals)
    b.heatShieldNozzleL.position.set(0.0, 0.0, 0.0);
    b.gimbalNozzleLeft.add(b.heatShieldNozzleL);

    b.heatShieldNozzleR.position.set(0.0, 0.0, 0.0);
    b.gimbalNozzleRight.add(b.heatShieldNozzleR);

    // 5. 4 Ventral Repulsor Breathing Rings
    b.repulsorRingFL.position.set(-1.1, -0.3, 1.4);
    b.repulsorRingFR.position.set(1.1, -0.3, 1.4);
    b.repulsorRingRL.position.set(-1.25, -0.3, -1.5);
    b.repulsorRingRR.position.set(1.25, -0.3, -1.5);

    b.rootHull.add(b.repulsorRingFL);
    b.rootHull.add(b.repulsorRingFR);
    b.rootHull.add(b.repulsorRingRL);
    b.rootHull.add(b.repulsorRingRR);

    // 6. Cockpit Fly-By-Wire Flight Sticks
    b.flightStickL.position.set(-0.24, 0.38, 0.55);
    b.flightStickR.position.set(0.24, 0.38, 0.55);
    b.rootHull.add(b.flightStickL);
    b.rootHull.add(b.flightStickR);

    // 7. Pilot Biomechanical Chain
    b.pilotSpine.position.set(0.0, 0.36, 0.1);
    b.rootHull.add(b.pilotSpine);

    b.pilotChest.position.set(0.0, 0.14, 0.02);
    b.pilotSpine.add(b.pilotChest);

    b.pilotHeadLookAt.position.set(0.0, 0.18, 0.04);
    b.pilotChest.add(b.pilotHeadLookAt);

    // Pilot Left Arm Chain
    b.pilotShoulderL.position.set(-0.18, 0.08, -0.02);
    b.pilotChest.add(b.pilotShoulderL);
    b.pilotElbowL.position.set(0.0, -0.16, 0.12);
    b.pilotShoulderL.add(b.pilotElbowL);
    b.pilotHandL.position.set(0.0, -0.14, 0.14);
    b.pilotElbowL.add(b.pilotHandL);

    // Pilot Right Arm Chain
    b.pilotShoulderR.position.set(0.18, 0.08, -0.02);
    b.pilotChest.add(b.pilotShoulderR);
    b.pilotElbowR.position.set(0.0, -0.16, 0.12);
    b.pilotShoulderR.add(b.pilotElbowR);
    b.pilotHandR.position.set(0.0, -0.14, 0.14);
    b.pilotElbowR.add(b.pilotHandR);
  }

  update(
    delta,
    steerInput,
    pitchInput,
    leftBrakeInput,
    rightBrakeInput,
    speedRatio,
    apexLookTarget = null,
    gForce = { lateral: 0, longitudinal: 0, magnitude: 1.0 },
    isBoosting = false
  ) {
    const b = this.bones;
    const time = performance.now() * 0.001;

    // ------------------------------------------------------------------------
    // 1. ROOT HULL PROCEDURAL ROLL, BANK & INERTIAL COUNTER-STEER
    // ------------------------------------------------------------------------
    const targetRoll = -steerInput * 0.32; // Inward 18.3° banking
    const targetPitch = pitchInput * 0.14 - (speedRatio * 0.045) + (isBoosting ? -0.04 : 0.0);
    b.rootHull.rotation.z = THREE.MathUtils.lerp(b.rootHull.rotation.z, targetRoll, delta * 12.0);
    b.rootHull.rotation.x = THREE.MathUtils.lerp(b.rootHull.rotation.x, targetPitch, delta * 10.0);

    // ------------------------------------------------------------------------
    // 2. DYNAMIC AIRBRAKE DEFLECTION & HIGH-FREQUENCY EDGE FLUTTER
    // θ_flap = θ_input * (1.0 - clamp(||v_craft|| / v_max, 0.0, 0.45))
    // ------------------------------------------------------------------------
    const maxFlapAngle = 48.0 * (Math.PI / 180.0); // 0.8377 rad
    const aeroResistanceFactor = 1.0 - THREE.MathUtils.clamp(speedRatio, 0.0, 0.45);

    // Trailing edge boundary layer flutter
    const flutterFreq = 52.0; // rad/s
    const flutterAmp = 0.045 * speedRatio;
    const flutterL = Math.sin(time * flutterFreq) * flutterAmp * leftBrakeInput;
    const flutterR = Math.cos(time * flutterFreq * 1.05) * flutterAmp * rightBrakeInput;

    const targetLeftAngle = (leftBrakeInput * maxFlapAngle * aeroResistanceFactor) + flutterL;
    const targetRightAngle = (rightBrakeInput * maxFlapAngle * aeroResistanceFactor) + flutterR;

    // Dual-axis outward/upward pivot
    b.airbrakeLMain.rotation.x = THREE.MathUtils.lerp(b.airbrakeLMain.rotation.x, targetLeftAngle, delta * 18.0);
    b.airbrakeLMain.rotation.z = THREE.MathUtils.lerp(b.airbrakeLMain.rotation.z, targetLeftAngle * 0.35, delta * 18.0);

    b.airbrakeRMain.rotation.x = THREE.MathUtils.lerp(b.airbrakeRMain.rotation.x, targetRightAngle, delta * 18.0);
    b.airbrakeRMain.rotation.z = THREE.MathUtils.lerp(b.airbrakeRMain.rotation.z, -targetRightAngle * 0.35, delta * 18.0);

    // Secondary Split-Flap Bleeders (Boundary layer vortex shedding at high alpha or brake)
    const subFlapRatioL = Math.max(0.0, (leftBrakeInput - 0.35) / 0.65) + (speedRatio > 0.85 ? 0.15 : 0.0);
    b.airbrakeLSub.rotation.x = THREE.MathUtils.lerp(b.airbrakeLSub.rotation.x, subFlapRatioL * 0.52, delta * 20.0);

    const subFlapRatioR = Math.max(0.0, (rightBrakeInput - 0.35) / 0.65) + (speedRatio > 0.85 ? 0.15 : 0.0);
    b.airbrakeRSub.rotation.x = THREE.MathUtils.lerp(b.airbrakeRSub.rotation.x, subFlapRatioR * 0.52, delta * 20.0);

    // ------------------------------------------------------------------------
    // 3. DYNAMIC MULTI-SLOTTED FRONT CANARDS (Angle of Attack & High-Speed Trim)
    // ------------------------------------------------------------------------
    const canardBaseAngle = -pitchInput * 0.28 + (speedRatio * 0.12);
    const canardRollDifferential = steerInput * 0.18;
    b.canardLeft.rotation.x = THREE.MathUtils.lerp(b.canardLeft.rotation.x, canardBaseAngle + canardRollDifferential, delta * 16.0);
    b.canardRight.rotation.x = THREE.MathUtils.lerp(b.canardRight.rotation.x, canardBaseAngle - canardRollDifferential, delta * 16.0);

    // ------------------------------------------------------------------------
    // 4. TWIN-NOZZLE SPHERICAL GIMBAL (±15°) & AFTERBURNER EXPANSION HEAT SHIELDS
    // ------------------------------------------------------------------------
    const maxVectorAngle = 15.0 * (Math.PI / 180.0);
    const nozzleYaw = -steerInput * maxVectorAngle;
    const nozzlePitch = -pitchInput * maxVectorAngle;

    b.gimbalNozzleLeft.rotation.y = THREE.MathUtils.lerp(b.gimbalNozzleLeft.rotation.y, nozzleYaw, delta * 16.0);
    b.gimbalNozzleLeft.rotation.x = THREE.MathUtils.lerp(b.gimbalNozzleLeft.rotation.x, nozzlePitch, delta * 16.0);

    b.gimbalNozzleRight.rotation.y = THREE.MathUtils.lerp(b.gimbalNozzleRight.rotation.y, nozzleYaw, delta * 16.0);
    b.gimbalNozzleRight.rotation.x = THREE.MathUtils.lerp(b.gimbalNozzleRight.rotation.x, nozzlePitch, delta * 16.0);

    // Vectoring Heat Shields radial bloom under afterburner / boost load
    const shieldExpansion = isBoosting ? 1.45 : (1.0 + speedRatio * 0.25);
    b.heatShieldNozzleL.scale.set(shieldExpansion, shieldExpansion, 1.0);
    b.heatShieldNozzleR.scale.set(shieldExpansion, shieldExpansion, 1.0);

    // ------------------------------------------------------------------------
    // 5. VENTRAL SUSPENSION BREATHING (Dual-Stage Spring Damping)
    // ------------------------------------------------------------------------
    const trackContourWobble = Math.sin(time * 16.0) * 0.04 * speedRatio;
    const rollDisplacement = steerInput * 0.035;

    const targetDisplacements = [
      trackContourWobble - rollDisplacement, // FL
      -trackContourWobble + rollDisplacement, // FR
      -trackContourWobble - rollDisplacement, // RL
      trackContourWobble + rollDisplacement  // RR
    ];

    const springKp = 28.0;
    const damperKd = 7.5;
    const rings = [b.repulsorRingFL, b.repulsorRingFR, b.repulsorRingRL, b.repulsorRingRR];

    for (let i = 0; i < 4; i++) {
      const d = this.repulsorDampers[i];
      const target = targetDisplacements[i];
      const error = target - d.disp;
      const accel = springKp * error - damperKd * d.vel;
      d.vel += accel * delta;
      d.disp += d.vel * delta;
      rings[i].position.y = -0.3 + d.disp;
    }

    // ------------------------------------------------------------------------
    // 6. PILOT BIOMECHANICS, G-LOC CRANIAL STRAIN & RESPIRATORY CHEST EXPANSION
    // ------------------------------------------------------------------------
    // G-Force load response: head/spine compress into bucket seat
    const gLat = gForce.lateral || 0;
    const gLong = gForce.longitudinal || 0;
    const gMag = gForce.magnitude || 1.0;

    // Heart rate elevates from 72 bpm to 180 bpm under 12G stress
    this.heartbeatRate = THREE.MathUtils.lerp(72, 185, THREE.MathUtils.clamp((gMag - 1.0) / 8.0, 0.0, 1.0));
    const breathFreq = (this.heartbeatRate / 60.0) * 0.35 * Math.PI * 2.0;
    this.breathPhase += delta * breathFreq;

    // Respiratory chest expansion
    const chestExpansion = 1.0 + Math.sin(this.breathPhase) * 0.065;
    b.pilotChest.scale.set(chestExpansion, 1.0, chestExpansion * 0.95);

    // Spine compression under negative/positive Gs
    const spineCompressY = 0.36 - Math.min(0.06, gMag * 0.005);
    const spinePitchX = -gLong * 0.025;
    const spineRollZ = -gLat * 0.035;

    b.pilotSpine.position.y = THREE.MathUtils.lerp(b.pilotSpine.position.y, spineCompressY, delta * 10.0);
    b.pilotSpine.rotation.x = THREE.MathUtils.lerp(b.pilotSpine.rotation.x, spinePitchX, delta * 12.0);
    b.pilotSpine.rotation.z = THREE.MathUtils.lerp(b.pilotSpine.rotation.z, spineRollZ, delta * 12.0);

    // Pilot Cranial LookAt & G-LOC Neck Strain Lag
    if (apexLookTarget) {
      b.pilotHeadLookAt.lookAt(apexLookTarget);
      // Add neck strain tilt counteracting lateral Gs
      b.pilotHeadLookAt.rotation.z += -gLat * 0.04;
    } else {
      const headYaw = steerInput * 0.42; // Looks deeply into corner apex
      const headTilt = -gLat * 0.05;
      const headNod = -gLong * 0.03;
      b.pilotHeadLookAt.rotation.y = THREE.MathUtils.lerp(b.pilotHeadLookAt.rotation.y, headYaw, delta * 8.0);
      b.pilotHeadLookAt.rotation.z = THREE.MathUtils.lerp(b.pilotHeadLookAt.rotation.z, headTilt, delta * 10.0);
      b.pilotHeadLookAt.rotation.x = THREE.MathUtils.lerp(b.pilotHeadLookAt.rotation.x, headNod, delta * 10.0);
    }

    // ------------------------------------------------------------------------
    // 7. DUAL FLIGHT-STICK YOKE & 2-BONE ANALYTICAL IK SOLVER
    // ------------------------------------------------------------------------
    // Rail micro-vibrations traveling up pilot's gloves
    const railTremor = (Math.random() - 0.5) * 0.008 * speedRatio;
    const stickPitch = pitchInput * 0.25;
    const stickRoll = steerInput * 0.22;

    b.flightStickL.rotation.x = stickPitch + (leftBrakeInput * 0.15);
    b.flightStickL.rotation.y = stickRoll;
    b.flightStickL.position.y = 0.38 + railTremor;

    b.flightStickR.rotation.x = stickPitch + (rightBrakeInput * 0.15);
    b.flightStickR.rotation.y = stickRoll;
    b.flightStickR.position.y = 0.38 + railTremor;

    // Solve 2-Bone Analytical IK from shoulder to flight stick
    this.solveTwoBoneIK(
      b.pilotShoulderL,
      b.pilotElbowL,
      b.pilotHandL,
      b.flightStickL.position,
      0.16, // Upper arm length
      0.14  // Forearm length
    );

    this.solveTwoBoneIK(
      b.pilotShoulderR,
      b.pilotElbowR,
      b.pilotHandR,
      b.flightStickR.position,
      0.16,
      0.14
    );
  }

  // --------------------------------------------------------------------------
  // 2-Bone Analytical Inverse Kinematics (Law of Cosines Solver)
  // --------------------------------------------------------------------------
  solveTwoBoneIK(shoulderNode, elbowNode, handNode, targetLocalPos, l1, l2) {
    const toTarget = targetLocalPos.clone().sub(shoulderNode.position);
    const dist = THREE.MathUtils.clamp(toTarget.length(), 0.01, l1 + l2 - 0.001);

    // Law of cosines for elbow interior angle
    const cosElbow = (l1 * l1 + l2 * l2 - dist * dist) / (2 * l1 * l2);
    const elbowAngle = Math.PI - Math.acos(THREE.MathUtils.clamp(cosElbow, -1.0, 1.0));

    elbowNode.rotation.x = elbowAngle * 0.85;

    // Shoulder angle aiming toward target
    const cosShoulder = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
    const shoulderAngleOffset = Math.acos(THREE.MathUtils.clamp(cosShoulder, -1.0, 1.0));

    shoulderNode.lookAt(targetLocalPos);
    shoulderNode.rotation.x += shoulderAngleOffset * 0.65;
  }
}
