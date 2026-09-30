import * as THREE from 'three';

// ============================================================================
// F-8000 // NIGHTRIFT - ORIGINAL 2089 FUTURISTIC RACING MACHINE
// Low Aerodynamic Carbon Monocoque, 4 Articulated Propulsion Modules,
// Enclosed Cockpit, Pulsing Cyan Energy Core, Neon Underglow & Plasma Exhaust
// ============================================================================

export class NightriftVehicle {
  constructor(scene, isPlayer = true, colorHex = 0x00F0FF) {
    this.scene = scene;
    this.isPlayer = isPlayer;
    this.primaryColor = new THREE.Color(colorHex);
    this.underglowColor = new THREE.Color(colorHex);

    this.group = new THREE.Group();
    this.visualChassis = new THREE.Group();
    this.group.add(this.visualChassis);

    // Dynamic animation components
    this.propulsionModules = [];
    this.propulsionCoils = [];
    this.energyCoreMesh = null;
    this.exhaustPlumes = [];
    this.underglowLight = null;
    this.brakeLights = [];
    this.leftAirbrake = null;
    this.rightAirbrake = null;

    // Kinetic state
    this.steerAngle = 0;
    this.pitchAngle = 0;
    this.rollAngle = 0;
    this.throttleLevel = 0;
    this.brakeLevel = 0;
    this.isBoosting = false;
    this.isDrifting = false;

    this.buildNightriftTopology();
    this.scene.add(this.group);
  }

  buildNightriftTopology() {
    // ------------------------------------------------------------------------
    // 1. MAIN AERODYNAMIC CARBON-FIBER MONOCOQUE BODY
    // ------------------------------------------------------------------------
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 4.2);        // Needle nose with aerodynamic intake
    bodyShape.lineTo(0.9, 2.6);      // Forward chine
    bodyShape.lineTo(1.8, 0.4);      // Side air-channel intake
    bodyShape.lineTo(2.4, -1.8);     // Rear wing root
    bodyShape.lineTo(2.2, -3.4);     // Outer aero blade
    bodyShape.lineTo(1.2, -3.8);     // Rear diffuser port
    bodyShape.lineTo(0.4, -3.8);     // Plasma nozzle bay
    bodyShape.lineTo(0.0, -3.2);     // Center vortex notch
    bodyShape.lineTo(-0.4, -3.8);
    bodyShape.lineTo(-1.2, -3.8);
    bodyShape.lineTo(-2.2, -3.4);
    bodyShape.lineTo(-2.4, -1.8);
    bodyShape.lineTo(-1.8, 0.4);
    bodyShape.lineTo(-0.9, 2.6);
    bodyShape.closePath();

    const extrudeSettings = {
      depth: 0.85,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.25,
      bevelThickness: 0.18
    };

    // Rotate so +Y in shape becomes forward +Z in 3D
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeo.rotateX(-Math.PI * 0.5);
    bodyGeo.center();

    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c0f16,
      metalness: 0.92,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });

    const bodyMesh = new THREE.Mesh(bodyGeo, carbonMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.visualChassis.add(bodyMesh);

    // ------------------------------------------------------------------------
    // 2. UPPER COMPOSITE LIVERY COWLINGS (Cyan / Livery Accents)
    // ------------------------------------------------------------------------
    const cowlShape = new THREE.Shape();
    cowlShape.moveTo(0, 3.4);
    cowlShape.lineTo(0.65, 2.0);
    cowlShape.lineTo(1.3, -0.6);
    cowlShape.lineTo(1.7, -3.0);
    cowlShape.lineTo(0.5, -3.2);
    cowlShape.lineTo(0.0, -2.6);
    cowlShape.lineTo(-0.5, -3.2);
    cowlShape.lineTo(-1.7, -3.0);
    cowlShape.lineTo(-1.3, -0.6);
    cowlShape.lineTo(-0.65, 2.0);
    cowlShape.closePath();

    const cowlGeo = new THREE.ExtrudeGeometry(cowlShape, {
      depth: 0.45,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.15,
      bevelThickness: 0.12
    });
    cowlGeo.rotateX(-Math.PI * 0.5);
    cowlGeo.center();

    const liveryMat = new THREE.MeshStandardMaterial({
      color: this.primaryColor,
      metalness: 0.7,
      roughness: 0.25,
      emissive: this.primaryColor.clone().multiplyScalar(0.25)
    });

    const cowlMesh = new THREE.Mesh(cowlGeo, liveryMat);
    cowlMesh.position.set(0, 0.4, 0);
    this.visualChassis.add(cowlMesh);

    // ------------------------------------------------------------------------
    // 3. ENCLOSED COCKPIT CANOPY & PILOT
    // ------------------------------------------------------------------------
    const canopyGeo = new THREE.ConeGeometry(0.85, 2.8, 6);
    canopyGeo.rotateX(Math.PI * 0.5);
    canopyGeo.scale(1.0, 0.45, 1.0);

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x050810,
      metalness: 0.98,
      roughness: 0.05,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      ior: 1.6
    });

    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.set(0, 0.72, 0.4);
    this.visualChassis.add(canopyMesh);

    // ------------------------------------------------------------------------
    // 4. CENTRAL PULSING CYAN ENERGY CORE (Visible through dorsal slit)
    // ------------------------------------------------------------------------
    const coreGeo = new THREE.SphereGeometry(0.55, 16, 16);
    coreGeo.scale(0.8, 0.4, 1.8);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.energyCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.energyCoreMesh.position.set(0, 0.55, -0.6);
    this.visualChassis.add(this.energyCoreMesh);

    const coreLight = new THREE.PointLight(0x00F0FF, 3.5, 12);
    coreLight.position.set(0, 0.7, -0.6);
    this.visualChassis.add(coreLight);

    // ------------------------------------------------------------------------
    // 5. FOUR INDEPENDENT ARTICULATED PROPULSION MODULES (FL, FR, RL, RR)
    // ------------------------------------------------------------------------
    const modulePositions = [
      { x: -1.75, y: -0.15, z: 1.8, isFront: true },   // Front-Left
      { x: 1.75, y: -0.15, z: 1.8, isFront: true },    // Front-Right
      { x: -2.1, y: -0.15, z: -2.2, isFront: false },  // Rear-Left
      { x: 2.1, y: -0.15, z: -2.2, isFront: false }    // Rear-Right
    ];

    const nacelleGeo = new THREE.BoxGeometry(0.7, 0.5, 1.9);
    const nacelleMat = new THREE.MeshStandardMaterial({ color: 0x141822, metalness: 0.95, roughness: 0.2 });

    const coilGeo = new THREE.TorusGeometry(0.42, 0.08, 8, 16);
    coilGeo.rotateX(Math.PI * 0.5);
    const coilMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: false });

    modulePositions.forEach((pos, idx) => {
      const moduleGroup = new THREE.Group();
      moduleGroup.position.set(pos.x, pos.y, pos.z);

      const nacelle = new THREE.Mesh(nacelleGeo, nacelleMat);
      moduleGroup.add(nacelle);

      // Glowing induction rings (2 per module)
      const coil1 = new THREE.Mesh(coilGeo, coilMat.clone());
      coil1.position.set(0, 0, 0.4);
      moduleGroup.add(coil1);

      const coil2 = new THREE.Mesh(coilGeo, coilMat.clone());
      coil2.position.set(0, 0, -0.4);
      moduleGroup.add(coil2);

      this.visualChassis.add(moduleGroup);
      this.propulsionModules.push(moduleGroup);
      this.propulsionCoils.push(coil1, coil2);
    });

    // ------------------------------------------------------------------------
    // 6. TWIN REAR PLASMA EXHAUST NOZZLES & FLAME TRAILS
    // ------------------------------------------------------------------------
    const nozzleGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.9, 12);
    nozzleGeo.rotateX(Math.PI * 0.5);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, metalness: 0.95, roughness: 0.3 });

    const leftNozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    leftNozzle.position.set(-0.75, 0.1, -3.8);
    this.visualChassis.add(leftNozzle);

    const rightNozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    rightNozzle.position.set(0.75, 0.1, -3.8);
    this.visualChassis.add(rightNozzle);

    // Glowing plasma flame plumes
    const flameGeo = new THREE.ConeGeometry(0.32, 2.5, 12, 1, true);
    flameGeo.rotateX(-Math.PI * 0.5);
    flameGeo.translate(0, 0, -1.25);

    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const leftFlame = new THREE.Mesh(flameGeo, flameMat);
    leftFlame.position.set(-0.75, 0.1, -4.2);
    this.visualChassis.add(leftFlame);

    const rightFlame = new THREE.Mesh(flameGeo, flameMat.clone());
    rightFlame.position.set(0.75, 0.1, -4.2);
    this.visualChassis.add(rightFlame);

    this.exhaustPlumes.push(leftFlame, rightFlame);

    // ------------------------------------------------------------------------
    // 7. DIGITAL BRAKE LIGHTS & REAR DIFFUSER
    // ------------------------------------------------------------------------
    const brakeGeo = new THREE.BoxGeometry(1.2, 0.15, 0.2);
    const brakeMat = new THREE.MeshBasicMaterial({ color: 0xFF2A13 });

    const leftBrake = new THREE.Mesh(brakeGeo, brakeMat);
    leftBrake.position.set(-1.4, 0.35, -3.5);
    this.visualChassis.add(leftBrake);

    const rightBrake = new THREE.Mesh(brakeGeo, brakeMat);
    rightBrake.position.set(1.4, 0.35, -3.5);
    this.visualChassis.add(rightBrake);

    this.brakeLights.push(leftBrake, rightBrake);

    // ------------------------------------------------------------------------
    // 8. NEON UNDERGLOW ILLUMINATION (Casts onto asphalt)
    // ------------------------------------------------------------------------
    this.underglowLight = new THREE.PointLight(this.underglowColor, 4.0, 8.0);
    this.underglowLight.position.set(0, -0.6, 0);
    this.visualChassis.add(this.underglowLight);

    // Ground neon halo disc
    const haloGeo = new THREE.PlaneGeometry(5.2, 8.5);
    haloGeo.rotateX(-Math.PI * 0.5);
    const haloMat = new THREE.MeshBasicMaterial({
      color: this.underglowColor,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, -0.75, 0);
    this.visualChassis.add(haloMesh);

    // ------------------------------------------------------------------------
    // 9. DYNAMIC AIRBRAKE FLAPS (Articulates during drifting/braking)
    // ------------------------------------------------------------------------
    const flapGeo = new THREE.BoxGeometry(0.8, 0.08, 1.2);
    const flapMat = new THREE.MeshStandardMaterial({ color: 0x141822, metalness: 0.9, roughness: 0.3 });

    this.leftAirbrake = new THREE.Mesh(flapGeo, flapMat);
    this.leftAirbrake.position.set(-1.8, 0.55, -2.6);
    this.visualChassis.add(this.leftAirbrake);

    this.rightAirbrake = new THREE.Mesh(flapGeo, flapMat);
    this.rightAirbrake.position.set(1.8, 0.55, -2.6);
    this.visualChassis.add(this.rightAirbrake);
  }

  setCustomColors(primaryHex, underglowHex) {
    if (primaryHex) this.primaryColor.setHex(primaryHex);
    if (underglowHex) this.underglowColor.setHex(underglowHex);
    if (this.underglowLight) this.underglowLight.color.copy(this.underglowColor);
  }

  updateKineticState(delta, steerInput, throttleInput, brakeInput, driftActive, boostActive, speedKmh) {
    const time = performance.now() * 0.001;
    const speedRatio = Math.min(speedKmh / 420.0, 1.2);

    // 1. Steering Roll & Yaw Articulation (18° inward banking on corners)
    const targetRoll = -steerInput * 0.32; // Inward bank
    const targetPitch = (throttleInput > 0 ? -0.05 : 0) + (brakeInput > 0 ? 0.08 : 0);
    const targetYaw = driftActive ? steerInput * 0.45 : steerInput * 0.12;

    this.rollAngle = THREE.MathUtils.lerp(this.rollAngle, targetRoll, delta * 8.0);
    this.pitchAngle = THREE.MathUtils.lerp(this.pitchAngle, targetPitch, delta * 6.0);
    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetYaw, delta * 10.0);

    // Engine Idle & High-Speed Vibration
    const vib = (0.015 + speedRatio * 0.035) * Math.sin(time * 65.0);
    this.visualChassis.position.y = vib;
    this.visualChassis.rotation.set(this.pitchAngle, this.steerAngle, this.rollAngle);

    // 2. Pulse Energy Core
    if (this.energyCoreMesh) {
      const corePulse = 0.85 + Math.sin(time * (boostActive ? 22.0 : 8.0)) * 0.18;
      this.energyCoreMesh.scale.set(corePulse, corePulse * 0.5, corePulse * 1.8);
    }

    // 3. Propulsion Modules Suspension Articulation
    this.propulsionModules.forEach((mod, idx) => {
      const side = (idx % 2 === 0 ? 1 : -1);
      const suspY = Math.sin(time * 12.0 + idx * 1.5) * 0.04 - (steerInput * side * 0.08);
      mod.position.y = -0.15 + suspY;
      mod.rotation.z = steerInput * side * 0.15;
    });

    // 4. Rotating / Pulsing Induction Coils
    this.propulsionCoils.forEach((coil, idx) => {
      coil.rotation.z += delta * (8.0 + speedRatio * 24.0);
      coil.material.color.setHex(boostActive ? 0xFF00FF : (driftActive ? 0xFFB800 : 0x00F0FF));
    });

    // 5. Plasma Exhaust Scaling
    this.exhaustPlumes.forEach(flame => {
      const boostScale = boostActive ? 2.2 : (1.0 + throttleInput * 0.8);
      const flicker = 0.9 + Math.random() * 0.2;
      flame.scale.set(boostScale * flicker, boostScale * flicker, boostScale * flicker * (boostActive ? 2.5 : 1.2));
      flame.material.color.setHex(boostActive ? 0xFF007F : (speedRatio > 0.8 ? 0x00F0FF : 0x7928CA));
      flame.visible = throttleInput > 0.05 || boostActive;
    });

    // 6. Brake Lights Brightness
    this.brakeLights.forEach(light => {
      light.material.color.setHex(brakeInput > 0.1 || driftActive ? 0xFF0033 : 0x440000);
      light.scale.y = brakeInput > 0.1 ? 1.5 : 1.0;
    });

    // 7. Airbrakes Flap Deployment
    if (this.leftAirbrake && this.rightAirbrake) {
      const leftDeploy = (steerInput < -0.2 ? -steerInput : 0) + (brakeInput > 0.2 ? 0.6 : 0) + (driftActive ? 0.8 : 0);
      const rightDeploy = (steerInput > 0.2 ? steerInput : 0) + (brakeInput > 0.2 ? 0.6 : 0) + (driftActive ? 0.8 : 0);

      this.leftAirbrake.rotation.x = THREE.MathUtils.lerp(this.leftAirbrake.rotation.x, leftDeploy * 0.65, delta * 12.0);
      this.rightAirbrake.rotation.x = THREE.MathUtils.lerp(this.rightAirbrake.rotation.x, rightDeploy * 0.65, delta * 12.0);
    }
  }
}
