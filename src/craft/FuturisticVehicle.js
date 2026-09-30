import * as THREE from 'three';

// ============================================================================
// 6 ORIGINAL FUTURISTIC RACING MACHINES (YEAR 2089)
// F-8000 NIGHTRIFT, V-720 PHANTOM, X-900 VELOCITY, K-77 QUANTUM, R-500 RAZOR, A-11 AETHER
// ============================================================================

export const VEHICLE_CATALOG = [
  {
    id: 'f8000',
    name: 'F-8000 // NIGHTRIFT',
    classType: 'BALANCED PROTOTYPE',
    description: 'Flagship 2089 anti-gravity machine with quad articulated nacelles and responsive all-around vectoring.',
    primaryColor: 0x00F0FF,
    underglowColor: 0x00F0FF,
    trailColor: 0x00F0FF,
    maxSpeedKmh: 420,
    accelRate: 185,
    handlingRate: 92,
    brakingRate: 320,
    boostEfficiency: 90,
    stats: { topSpeed: 88, accel: 90, handling: 92, braking: 88, boost: 90 }
  },
  {
    id: 'v720',
    name: 'V-720 // PHANTOM',
    classType: 'STEALTH SPEEDSTER',
    description: 'Black-ops low-drag delta fuselage engineered for extreme straightaway velocity and slipstream penetration.',
    primaryColor: 0xFF1A1A,
    underglowColor: 0xFF0033,
    trailColor: 0xFF0055,
    maxSpeedKmh: 445,
    accelRate: 170,
    handlingRate: 80,
    brakingRate: 300,
    boostEfficiency: 94,
    stats: { topSpeed: 98, accel: 82, handling: 80, braking: 82, boost: 94 }
  },
  {
    id: 'x900',
    name: 'X-900 // VELOCITY',
    classType: 'ION OVERCHARGER',
    description: 'Twin-turbine propulsion chassis with instantaneous throttle acceleration out of apex turns.',
    primaryColor: 0xFFB800,
    underglowColor: 0xFFAA00,
    trailColor: 0xFFCC00,
    maxSpeedKmh: 410,
    accelRate: 215,
    handlingRate: 86,
    brakingRate: 310,
    boostEfficiency: 92,
    stats: { topSpeed: 84, accel: 98, handling: 86, braking: 86, boost: 92 }
  },
  {
    id: 'k77',
    name: 'K-77 // QUANTUM',
    classType: 'CORNERING APEX',
    description: 'Wide aerodynamic canards and superconducting repulsor ground plates for razor-sharp apex grip.',
    primaryColor: 0x00FF66,
    underglowColor: 0x00FF88,
    trailColor: 0x00FF99,
    maxSpeedKmh: 400,
    accelRate: 175,
    handlingRate: 98,
    brakingRate: 360,
    boostEfficiency: 86,
    stats: { topSpeed: 80, accel: 86, handling: 98, braking: 96, boost: 86 }
  },
  {
    id: 'r500',
    name: 'R-500 // RAZOR',
    classType: 'DRIFT SPECIALIST',
    description: 'High-slip wedge profile featuring twin rear diffusers and rapid friction capacitor recharge.',
    primaryColor: 0x9933FF,
    underglowColor: 0x7928CA,
    trailColor: 0xBF55FF,
    maxSpeedKmh: 415,
    accelRate: 190,
    handlingRate: 94,
    brakingRate: 305,
    boostEfficiency: 95,
    stats: { topSpeed: 86, accel: 90, handling: 94, braking: 85, boost: 95 }
  },
  {
    id: 'a11',
    name: 'A-11 // AETHER',
    classType: 'OVERDRIVE PROTOTYPE',
    description: 'Experimental orbital craft boasting the longest sustained Hyper-Boost burn in the Aether-9 championship.',
    primaryColor: 0xF0F4F8,
    underglowColor: 0x00D4FF,
    trailColor: 0x00FFFF,
    maxSpeedKmh: 430,
    accelRate: 195,
    handlingRate: 88,
    brakingRate: 330,
    boostEfficiency: 98,
    stats: { topSpeed: 92, accel: 92, handling: 88, braking: 90, boost: 98 }
  }
];

export class FuturisticVehicle {
  constructor(scene, isPlayer = true, specOrId = 'f8000') {
    this.scene = scene;
    this.isPlayer = isPlayer;

    // Resolve specification
    this.spec = (typeof specOrId === 'string')
      ? (VEHICLE_CATALOG.find(v => v.id === specOrId) || VEHICLE_CATALOG[0])
      : specOrId;

    this.primaryColor = new THREE.Color(this.spec.primaryColor || 0x00F0FF);
    this.underglowColor = new THREE.Color(this.spec.underglowColor || 0x00F0FF);
    this.trailColor = new THREE.Color(this.spec.trailColor || 0x00F0FF);

    this.currentKit = 'aero';
    this.currentSpoiler = 'stock';

    // Top root groups
    this.group = new THREE.Group();
    this.visualChassis = new THREE.Group();
    this.group.add(this.visualChassis);

    // Component references
    this.bodyMesh = null;
    this.cowlMesh = null;
    this.energyCoreMesh = null;
    this.underglowLight = null;
    this.headlights = [];
    this.brakeLights = [];
    this.propulsionModules = [];
    this.propulsionCoils = [];
    this.exhaustPlumes = [];
    this.aeroKitGroup = new THREE.Group();
    this.spoilerGroup = new THREE.Group();
    this.visualChassis.add(this.aeroKitGroup);
    this.visualChassis.add(this.spoilerGroup);

    // Kinetic angles
    this.steerAngle = 0;
    this.pitchAngle = 0;
    this.rollAngle = 0;
    this.barrelRollAngle = 0;
    this.spin360Angle = 0;

    // Victory celebration state
    this.celebrationTime = 0;

    this.buildTopology();
    if (this.scene) {
      this.scene.add(this.group);
    }
  }

  buildTopology() {
    // Clear existing children
    while (this.visualChassis.children.length > 2) {
      this.visualChassis.remove(this.visualChassis.children[0]);
    }
    this.headlights = [];
    this.brakeLights = [];
    this.propulsionModules = [];
    this.propulsionCoils = [];
    this.exhaustPlumes = [];

    const id = this.spec.id;

    // 1. Aerodynamic Monocoque Body
    this.buildBodyChassis(id);

    // 2. Cockpit Canopy
    this.buildCanopy(id);

    // 3. Central Energy Core
    this.buildEnergyCore(id);

    // 4. Quad / Twin Propulsion Nacelles with Rotating Coils
    this.buildPropulsionSystem(id);

    // 5. Plasma Exhaust Nozzles
    this.buildExhaustNozzles(id);

    // 6. Headlights & Digital Brake Lights
    this.buildLights(id);

    // 7. Dynamic Aero Kit & Spoiler
    this.updateAeroKit(this.currentKit);
    this.updateSpoiler(this.currentSpoiler);

    // 8. Underglow Light
    if (!this.underglowLight) {
      this.underglowLight = new THREE.PointLight(this.underglowColor, 3.2, 16);
      this.underglowLight.position.set(0, -0.2, 0);
      this.group.add(this.underglowLight);
    } else {
      this.underglowLight.color.copy(this.underglowColor);
    }
  }

  buildBodyChassis(id) {
    const shape = new THREE.Shape();

    if (id === 'v720') {
      // Stealth Arrow Delta
      shape.moveTo(0, 4.6);
      shape.lineTo(1.1, 1.8);
      shape.lineTo(2.4, -2.6);
      shape.lineTo(1.8, -3.8);
      shape.lineTo(0.5, -3.4);
      shape.lineTo(0.0, -3.0);
      shape.lineTo(-0.5, -3.4);
      shape.lineTo(-1.8, -3.8);
      shape.lineTo(-2.4, -2.6);
      shape.lineTo(-1.1, 1.8);
    } else if (id === 'k77') {
      // Wide Cornering Canard Apex
      shape.moveTo(0, 3.8);
      shape.lineTo(1.6, 2.8);
      shape.lineTo(2.2, 1.0);
      shape.lineTo(2.1, -2.0);
      shape.lineTo(1.4, -3.6);
      shape.lineTo(-1.4, -3.6);
      shape.lineTo(-2.1, -2.0);
      shape.lineTo(-2.2, 1.0);
      shape.lineTo(-1.6, 2.8);
    } else if (id === 'r500') {
      // Razor-sharp Wedge
      shape.moveTo(0, 4.4);
      shape.lineTo(0.6, 2.0);
      shape.lineTo(1.9, -1.2);
      shape.lineTo(2.4, -3.4);
      shape.lineTo(0.8, -3.8);
      shape.lineTo(-0.8, -3.8);
      shape.lineTo(-2.4, -3.4);
      shape.lineTo(-1.9, -1.2);
      shape.lineTo(-0.6, 2.0);
    } else {
      // F-8000 / X-900 / A-11 Standard Sleek Monocoque
      shape.moveTo(0, 4.2);
      shape.lineTo(0.9, 2.6);
      shape.lineTo(1.8, 0.4);
      shape.lineTo(2.4, -1.8);
      shape.lineTo(2.2, -3.4);
      shape.lineTo(1.2, -3.8);
      shape.lineTo(0.4, -3.8);
      shape.lineTo(0.0, -3.2);
      shape.lineTo(-0.4, -3.8);
      shape.lineTo(-1.2, -3.8);
      shape.lineTo(-2.2, -3.4);
      shape.lineTo(-2.4, -1.8);
      shape.lineTo(-1.8, 0.4);
      shape.lineTo(-0.9, 2.6);
    }
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.85,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.22,
      bevelThickness: 0.16
    });
    geo.rotateX(-Math.PI * 0.5);
    geo.center();

    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c0f16,
      metalness: 0.92,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    this.bodyMesh = new THREE.Mesh(geo, carbonMat);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.visualChassis.add(this.bodyMesh);

    // Upper Livery Cowling with Primary Color
    const cowlShape = new THREE.Shape();
    cowlShape.moveTo(0, 3.2);
    cowlShape.lineTo(0.7, 1.8);
    cowlShape.lineTo(1.3, -0.6);
    cowlShape.lineTo(1.6, -2.8);
    cowlShape.lineTo(0.5, -3.0);
    cowlShape.lineTo(0.0, -2.4);
    cowlShape.lineTo(-0.5, -3.0);
    cowlShape.lineTo(-1.6, -2.8);
    cowlShape.lineTo(-1.3, -0.6);
    cowlShape.lineTo(-0.7, 1.8);
    cowlShape.closePath();

    const cowlGeo = new THREE.ExtrudeGeometry(cowlShape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.12,
      bevelThickness: 0.1
    });
    cowlGeo.rotateX(-Math.PI * 0.5);
    cowlGeo.center();

    const liveryMat = new THREE.MeshStandardMaterial({
      color: this.primaryColor,
      metalness: 0.75,
      roughness: 0.22,
      emissive: this.primaryColor.clone().multiplyScalar(0.25)
    });

    this.cowlMesh = new THREE.Mesh(cowlGeo, liveryMat);
    this.cowlMesh.position.set(0, 0.42, 0);
    this.visualChassis.add(this.cowlMesh);
  }

  buildCanopy(id) {
    const canopyGeo = new THREE.ConeGeometry(0.85, 2.7, 6);
    canopyGeo.rotateX(Math.PI * 0.5);
    canopyGeo.scale(1.0, 0.45, 1.0);

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x060912,
      metalness: 0.98,
      roughness: 0.05,
      transmission: 0.65,
      transparent: true,
      opacity: 0.85,
      ior: 1.6
    });

    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.72, 0.4);
    this.visualChassis.add(canopy);
  }

  buildEnergyCore(id) {
    const coreGeo = new THREE.SphereGeometry(0.55, 16, 16);
    coreGeo.scale(0.8, 0.4, 1.8);

    const coreMat = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });

    this.energyCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.energyCoreMesh.position.set(0, 0.55, -0.6);
    this.visualChassis.add(this.energyCoreMesh);

    const coreLight = new THREE.PointLight(this.primaryColor, 3.0, 10);
    coreLight.position.set(0, 0.7, -0.6);
    this.visualChassis.add(coreLight);
  }

  buildPropulsionSystem(id) {
    const modulePositions = [
      { x: -1.75, y: -0.15, z: 1.8 },
      { x: 1.75, y: -0.15, z: 1.8 },
      { x: -2.1, y: -0.15, z: -2.2 },
      { x: 2.1, y: -0.15, z: -2.2 }
    ];

    const nacelleGeo = new THREE.BoxGeometry(0.7, 0.5, 1.9);
    const nacelleMat = new THREE.MeshStandardMaterial({ color: 0x141822, metalness: 0.95, roughness: 0.2 });

    const coilGeo = new THREE.TorusGeometry(0.42, 0.08, 8, 16);
    coilGeo.rotateX(Math.PI * 0.5);

    modulePositions.forEach(pos => {
      const mod = new THREE.Group();
      mod.position.set(pos.x, pos.y, pos.z);

      const n = new THREE.Mesh(nacelleGeo, nacelleMat);
      mod.add(n);

      const coilMat = new THREE.MeshBasicMaterial({ color: this.primaryColor });
      const coil1 = new THREE.Mesh(coilGeo, coilMat.clone());
      coil1.position.set(0, 0, 0.4);
      mod.add(coil1);
      this.propulsionCoils.push(coil1);

      const coil2 = new THREE.Mesh(coilGeo, coilMat.clone());
      coil2.position.set(0, 0, -0.4);
      mod.add(coil2);
      this.propulsionCoils.push(coil2);

      this.visualChassis.add(mod);
      this.propulsionModules.push(mod);
    });
  }

  buildExhaustNozzles(id) {
    const flameGeo = new THREE.ConeGeometry(0.35, 1.8, 12);
    flameGeo.rotateX(-Math.PI * 0.5);

    const flameMat = new THREE.MeshBasicMaterial({
      color: this.trailColor,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    [-0.65, 0.65].forEach(x => {
      const flame = new THREE.Mesh(flameGeo, flameMat.clone());
      flame.position.set(x, 0.15, -4.4);
      this.visualChassis.add(flame);
      this.exhaustPlumes.push(flame);
    });
  }

  buildLights(id) {
    // Twin forward headlights
    const hlGeo = new THREE.BoxGeometry(0.4, 0.12, 0.1);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xE0FFFF });

    const hlLeft = new THREE.Mesh(hlGeo, hlMat);
    hlLeft.position.set(-0.8, 0.15, 3.8);
    this.visualChassis.add(hlLeft);
    this.headlights.push(hlLeft);

    const hlRight = new THREE.Mesh(hlGeo, hlMat);
    hlRight.position.set(0.8, 0.15, 3.8);
    this.visualChassis.add(hlRight);
    this.headlights.push(hlRight);

    // Rear digital brake lights
    const blMat = new THREE.MeshBasicMaterial({ color: 0xFF1A1A });
    [-1.2, 1.2].forEach(x => {
      const bl = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.1), blMat.clone());
      bl.position.set(x, 0.25, -3.8);
      this.visualChassis.add(bl);
      this.brakeLights.push(bl);
    });
  }

  updateAeroKit(kitType = 'aero') {
    this.currentKit = kitType;
    while (this.aeroKitGroup.children.length > 0) {
      this.aeroKitGroup.remove(this.aeroKitGroup.children[0]);
    }

    const kitMat = new THREE.MeshStandardMaterial({
      color: 0x080a10,
      metalness: 0.95,
      roughness: 0.2
    });

    if (kitType === 'aero') {
      // Extended Front Splitter Canards
      const canardGeo = new THREE.BoxGeometry(0.9, 0.05, 0.5);
      const cLeft = new THREE.Mesh(canardGeo, kitMat);
      cLeft.position.set(-1.6, 0.05, 3.0);
      cLeft.rotation.z = 0.1;
      this.aeroKitGroup.add(cLeft);

      const cRight = new THREE.Mesh(canardGeo, kitMat);
      cRight.position.set(1.6, 0.05, 3.0);
      cRight.rotation.z = -0.1;
      this.aeroKitGroup.add(cRight);
    } else if (kitType === 'drag') {
      // Super-Highway Rear Diffuser Venturis
      const diffGeo = new THREE.BoxGeometry(2.4, 0.12, 0.8);
      const diff = new THREE.Mesh(diffGeo, kitMat);
      diff.position.set(0, -0.2, -4.0);
      this.aeroKitGroup.add(diff);
    } else if (kitType === 'vortex') {
      // Vortex Wing Endplates
      const plateGeo = new THREE.BoxGeometry(0.08, 0.8, 1.2);
      const pLeft = new THREE.Mesh(plateGeo, kitMat);
      pLeft.position.set(-2.2, 0.4, -3.0);
      this.aeroKitGroup.add(pLeft);

      const pRight = new THREE.Mesh(plateGeo, kitMat);
      pRight.position.set(2.2, 0.4, -3.0);
      this.aeroKitGroup.add(pRight);
    }
  }

  updateSpoiler(spoilerType = 'stock') {
    this.currentSpoiler = spoilerType;
    while (this.spoilerGroup.children.length > 0) {
      this.spoilerGroup.remove(this.spoilerGroup.children[0]);
    }

    if (spoilerType === 'wing' || spoilerType === 'vortex') {
      const wingGeo = new THREE.BoxGeometry(3.2, 0.08, 0.6);
      const pMat = new THREE.MeshStandardMaterial({ color: this.primaryColor, metalness: 0.8, roughness: 0.2 });
      const wing = new THREE.Mesh(wingGeo, pMat);
      wing.position.set(0, 0.95, -3.4);
      this.spoilerGroup.add(wing);

      // Twin uprights
      const strutGeo = new THREE.BoxGeometry(0.08, 0.55, 0.3);
      const sMat = new THREE.MeshStandardMaterial({ color: 0x10141f, metalness: 0.95 });
      const s1 = new THREE.Mesh(strutGeo, sMat);
      s1.position.set(-0.9, 0.65, -3.4);
      this.spoilerGroup.add(s1);

      const s2 = new THREE.Mesh(strutGeo, sMat);
      s2.position.set(0.9, 0.65, -3.4);
      this.spoilerGroup.add(s2);
    }
  }

  setCustomLivery(bodyColorHex, underglowHex, trailHex, kitType, spoilerType) {
    if (bodyColorHex !== undefined && bodyColorHex !== null) {
      this.primaryColor.setHex(bodyColorHex);
      if (this.cowlMesh) this.cowlMesh.material.color.setHex(bodyColorHex);
      if (this.energyCoreMesh) this.energyCoreMesh.material.color.setHex(bodyColorHex);
      this.propulsionCoils.forEach(c => c.material.color.setHex(bodyColorHex));
    }
    if (underglowHex !== undefined && underglowHex !== null) {
      this.underglowColor.setHex(underglowHex);
      if (this.underglowLight) this.underglowLight.color.setHex(underglowHex);
    }
    if (trailHex !== undefined && trailHex !== null) {
      this.trailColor.setHex(trailHex);
      this.exhaustPlumes.forEach(f => f.material.color.setHex(trailHex));
    }
    if (kitType) this.updateAeroKit(kitType);
    if (spoilerType) this.updateSpoiler(spoilerType);
  }

  updateKineticState(delta, steerInput, throttleInput, brakeInput, driftActive, boostActive, speedKmh, aerial = null) {
    const time = performance.now() * 0.001;
    const speedRatio = Math.min(speedKmh / 420.0, 1.2);

    // 1. Inward corner roll and pitch
    const targetRoll = -steerInput * 0.32;
    const targetPitch = (throttleInput > 0 ? -0.05 : 0) + (brakeInput > 0 ? 0.08 : 0);
    const targetYaw = driftActive ? steerInput * 0.45 : steerInput * 0.12;

    this.rollAngle = THREE.MathUtils.lerp(this.rollAngle, targetRoll, delta * 8.0);
    this.pitchAngle = THREE.MathUtils.lerp(this.pitchAngle, targetPitch, delta * 6.0);
    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetYaw, delta * 10.0);

    // Aerial Stunt Rotations (Barrel roll & 360 spin)
    if (aerial && aerial.inAir) {
      this.barrelRollAngle = aerial.barrelRollAngle || 0;
      this.spin360Angle = aerial.spin360Angle || 0;
    } else {
      this.barrelRollAngle = THREE.MathUtils.lerp(this.barrelRollAngle, 0, delta * 10.0);
      this.spin360Angle = THREE.MathUtils.lerp(this.spin360Angle, 0, delta * 10.0);
    }

    // High speed engine vibration
    const vib = (0.015 + speedRatio * 0.03) * Math.sin(time * 65.0);
    this.visualChassis.position.y = vib;
    this.visualChassis.rotation.set(
      this.pitchAngle,
      this.steerAngle + this.spin360Angle,
      this.rollAngle + this.barrelRollAngle
    );

    // 2. Pulse Energy Core
    if (this.energyCoreMesh) {
      const corePulse = 0.85 + Math.sin(time * (boostActive ? 24.0 : 8.0)) * 0.2;
      this.energyCoreMesh.scale.set(corePulse, corePulse * 0.5, corePulse * 1.8);
    }

    // 3. Propulsion Modules & Spinning Coils
    this.propulsionModules.forEach((mod, idx) => {
      const side = (idx % 2 === 0 ? 1 : -1);
      const suspY = Math.sin(time * 12.0 + idx * 1.5) * 0.04 - (steerInput * side * 0.08);
      mod.position.y = -0.15 + suspY;
      mod.rotation.z = steerInput * side * 0.15;
    });

    this.propulsionCoils.forEach(coil => {
      coil.rotation.z += delta * (8.0 + speedRatio * 26.0);
      coil.material.color.setHex(boostActive ? 0xFF00FF : (driftActive ? 0xFFB800 : this.primaryColor.getHex()));
    });

    // 4. Exhaust Plumes
    this.exhaustPlumes.forEach(flame => {
      const boostScale = boostActive ? 2.4 : (1.0 + throttleInput * 0.8);
      const flicker = 0.9 + Math.random() * 0.2;
      flame.scale.set(boostScale * flicker, boostScale * flicker, boostScale * flicker * (boostActive ? 2.6 : 1.2));
      flame.visible = throttleInput > 0.05 || boostActive;
    });

    // 5. Brake Lights
    this.brakeLights.forEach(light => {
      light.material.color.setHex(brakeInput > 0.1 || driftActive ? 0xFF0033 : 0x440000);
      light.scale.y = brakeInput > 0.1 ? 1.6 : 1.0;
    });
  }

  updatePodiumCelebration(delta, rank = 1) {
    this.celebrationTime += delta;
    const t = this.celebrationTime;

    if (rank === 1) {
      // 1st Place Victory Animation: Rev engine, lift front repulsors, pulse core
      const bounce = Math.abs(Math.sin(t * 3.5)) * 0.45;
      const pitchLift = -0.18 + Math.sin(t * 3.5) * 0.08;
      this.visualChassis.position.y = bounce;
      this.visualChassis.rotation.set(pitchLift, Math.sin(t * 1.2) * 0.2, 0);

      if (this.energyCoreMesh) {
        const pulse = 1.0 + Math.sin(t * 15.0) * 0.35;
        this.energyCoreMesh.scale.set(pulse, pulse * 0.6, pulse * 2.0);
      }
      this.exhaustPlumes.forEach(f => {
        f.visible = true;
        f.scale.set(1.6, 1.6, 2.0 + Math.sin(t * 10.0) * 0.5);
      });
    } else {
      // 2nd/3rd Place: Gentle hover idle
      this.visualChassis.position.y = Math.sin(t * 2.0) * 0.12;
      this.visualChassis.rotation.set(0, Math.sin(t * 0.8) * 0.05, 0);
    }
  }
}
