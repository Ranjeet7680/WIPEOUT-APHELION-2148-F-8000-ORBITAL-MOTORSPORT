import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - START-GRID PNEUMATIC GANTRY & COOLANT VENTING PIPELINE
// 1. Magnetic Gantry Teeth holding craft 2m above tarmac
// 2. Liquid Nitrogen (LN2) Coolant Vapor Umbilical Plumes
// 3. Clamps Disengage (0.00s) -> MHD Ignition (0.25s) -> Slingshot Launch (1.00s)
// ============================================================================

export class StartGridGantry {
  constructor(scene, track) {
    this.scene = scene;
    this.track = track;

    this.gantryGroup = new THREE.Group();
    this.teethLeft = [];
    this.teethRight = [];
    this.coolantVaporParticles = null;
    this.vaporPositions = null;
    this.vaporVelocities = [];
    this.vaporOpacities = [];
    this.vaporCount = 180;

    this.isRetracted = false;
    this.clampExtension = 1.0; // 1.0 = fully clamped, 0.0 = flush with barrier
    this.empPulseActive = false;
    this.empPulseScale = 0.0;

    this.buildGantryStructure();
    this.buildCoolantVaporSystem();
    this.buildEMPShockwave();

    this.scene.add(this.gantryGroup);
  }

  buildGantryStructure() {
    // Get start grid track frame at u = 0.0
    const frame = this.track.getClosestTrackFrame(new THREE.Vector3(0, 0, 0));
    const startPos = frame.pos;
    const startNorm = frame.normal;
    const startBinorm = frame.binormal;
    const startFwd = frame.tangent;

    this.gantryGroup.position.copy(startPos);
    const rot = new THREE.Matrix4().makeBasis(startBinorm, startNorm, startFwd);
    this.gantryGroup.quaternion.setFromRotationMatrix(rot);

    // Overhead Magnetic Gantry Arch
    const archRadius = this.track.trackWidth * 0.58;
    const archGeo = new THREE.TorusGeometry(archRadius, 0.6, 8, 24, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.3,
      metalness: 0.9,
      emissive: new THREE.Color(0x00F0FF),
      emissiveIntensity: 0.25
    });

    const archMesh = new THREE.Mesh(archGeo, archMat);
    archMesh.position.set(0, 1.2, 0);
    this.gantryGroup.add(archMesh);

    // Gantry Teeth (Left & Right magnetic clamping jaws)
    const toothGeo = new THREE.BoxGeometry(1.8, 0.45, 0.8);
    const toothMat = new THREE.MeshStandardMaterial({
      color: 0x222A38,
      roughness: 0.2,
      metalness: 0.95,
      emissive: new THREE.Color(0xFFB800),
      emissiveIntensity: 0.5
    });

    for (let i = 0; i < 3; i++) {
      const zOffset = (i - 1) * 3.2;

      // Left clamp tooth
      const toothL = new THREE.Mesh(toothGeo, toothMat);
      toothL.position.set(-archRadius * 0.85, 2.0, zOffset);
      this.gantryGroup.add(toothL);
      this.teethLeft.push({ mesh: toothL, basePos: toothL.position.clone() });

      // Right clamp tooth
      const toothR = new THREE.Mesh(toothGeo, toothMat);
      toothR.position.set(archRadius * 0.85, 2.0, zOffset);
      this.gantryGroup.add(toothR);
      this.teethRight.push({ mesh: toothR, basePos: toothR.position.clone() });
    }
  }

  buildCoolantVaporSystem() {
    const geo = new THREE.BufferGeometry();
    this.vaporPositions = new Float32Array(this.vaporCount * 3);
    const colors = new Float32Array(this.vaporCount * 3);

    for (let i = 0; i < this.vaporCount; i++) {
      this.vaporPositions[i * 3] = (Math.random() - 0.5) * 4.0;
      this.vaporPositions[i * 3 + 1] = 1.0 + Math.random() * 1.5;
      this.vaporPositions[i * 3 + 2] = (Math.random() - 0.5) * 5.0;

      // Cryogenic nitrogen white/ice-blue color
      colors[i * 3] = 0.88 + Math.random() * 0.12;
      colors[i * 3 + 1] = 0.94 + Math.random() * 0.06;
      colors[i * 3 + 2] = 1.0;

      this.vaporVelocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        -1.5 - Math.random() * 2.0, // Billow downward off repulsor coils
        (Math.random() - 0.5) * 1.5
      ));

      this.vaporOpacities.push(Math.random());
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.vaporPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.coolantVaporParticles = new THREE.Points(geo, mat);
    this.gantryGroup.add(this.coolantVaporParticles);
  }

  buildEMPShockwave() {
    const ringGeo = new THREE.RingGeometry(0.5, 2.2, 32);
    ringGeo.rotateX(-Math.PI * 0.5);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    this.empMesh = new THREE.Mesh(ringGeo, ringMat);
    this.empMesh.position.set(0, 0.4, 0);
    this.gantryGroup.add(this.empMesh);
  }

  update(delta, countdownTime, status) {
    // ------------------------------------------------------------------------
    // TIMING PHASES:
    // > 1.0s (COUNTDOWN): Clamps Engaged (2m altitude hold) + LN2 vapor billowing
    // 1.0s -> 0.0s: Clamps retract flush into track barrier
    // 0.25s: MHD coils ignite (handled by craft thermal stress)
    // 0.00s (RACING): Slingshot EMP shockwave discharge
    // ------------------------------------------------------------------------
    if (status === 'COUNTDOWN') {
      if (countdownTime > 1.0) {
        // Clamps fully extended holding craft
        this.clampExtension = 1.0;
        this.coolantVaporParticles.visible = true;

        // Billow cryogenic vapor particles
        for (let i = 0; i < this.vaporCount; i++) {
          this.vaporPositions[i * 3] += this.vaporVelocities[i].x * delta;
          this.vaporPositions[i * 3 + 1] += this.vaporVelocities[i].y * delta;
          this.vaporPositions[i * 3 + 2] += this.vaporVelocities[i].z * delta;

          // Recycle when hitting track bed
          if (this.vaporPositions[i * 3 + 1] < 0.1) {
            this.vaporPositions[i * 3] = (Math.random() - 0.5) * 3.5;
            this.vaporPositions[i * 3 + 1] = 2.2;
            this.vaporPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
          }
        }
        this.coolantVaporParticles.geometry.attributes.position.needsUpdate = true;
      } else {
        // Countdown < 1.0s: Clamps rapidly retract flush with barrier walls
        this.clampExtension = THREE.MathUtils.lerp(this.clampExtension, 0.0, delta * 8.0);
        // Coolant vapor dissipates
        this.coolantVaporParticles.material.opacity = Math.max(0, this.clampExtension * 0.75);
      }
    } else {
      // Racing status: teeth fully retracted
      this.clampExtension = THREE.MathUtils.lerp(this.clampExtension, 0.0, delta * 12.0);
      this.coolantVaporParticles.visible = false;

      // Trigger Slingshot EMP Shockwave on race start
      if (!this.empPulseActive && countdownTime <= 0) {
        this.empPulseActive = true;
        this.empPulseScale = 1.0;
      }
    }

    // Animate teeth retraction outward along local X
    const retractDistance = 3.2 * (1.0 - this.clampExtension);
    this.teethLeft.forEach(item => {
      item.mesh.position.x = item.basePos.x - retractDistance;
    });
    this.teethRight.forEach(item => {
      item.mesh.position.x = item.basePos.x + retractDistance;
    });

    // Animate EMP Shockwave Expansion
    if (this.empPulseActive) {
      this.empPulseScale += delta * 24.0;
      const empOpacity = Math.max(0, 1.0 - (this.empPulseScale / 24.0));
      this.empMesh.scale.set(this.empPulseScale, 1.0, this.empPulseScale);
      this.empMesh.material.opacity = empOpacity;

      if (empOpacity <= 0) {
        this.empPulseActive = false;
        this.empMesh.visible = false;
      }
    }
  }
}
