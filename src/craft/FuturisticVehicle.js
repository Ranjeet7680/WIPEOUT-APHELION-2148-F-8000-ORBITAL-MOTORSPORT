import * as THREE from 'three';

// ============================================================================
// 6 ORIGINAL FUTURISTIC RACING MACHINES (YEAR 2089 - AETHER-9 CHAMPIONSHIP)
// F-8000 NIGHTRIFT, V-720 PHANTOM, X-900 VELOCITY, K-77 QUANTUM, R-500 RAZOR, A-11 AETHER
// ============================================================================

export const VEHICLE_CATALOG = [
  {
    id: 'f8000',
    name: 'F-8000 // NIGHTRIFT',
    category: 'HYPERCAR',
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
    stats: { topSpeed: 88, topSpeedKmh: 420, accel: 90, handling: 92, braking: 88, boost: 90, nitro: 9.2, drift: 9.1 }
  },
  {
    id: 'nxr01',
    name: 'NXR-01 // HYPERCAR',
    category: 'HYPERCAR',
    classType: 'APEX HYPERCAR',
    description: 'Ultra-light carbon-nanotube hypercar engineered for supersonic acceleration and active downforce vectoring.',
    primaryColor: 0x00F0FF,
    underglowColor: 0x00F0FF,
    trailColor: 0x00F0FF,
    maxSpeedKmh: 382,
    accelRate: 196,
    handlingRate: 88,
    brakingRate: 330,
    boostEfficiency: 94,
    stats: { topSpeed: 85, topSpeedKmh: 382, accel: 96, handling: 88, braking: 90, boost: 94, nitro: 9.4, drift: 9.2 }
  },
  {
    id: 'v720',
    name: 'V-720 // PHANTOM',
    category: 'SUPERCAR',
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
    stats: { topSpeed: 98, topSpeedKmh: 445, accel: 82, handling: 80, braking: 82, boost: 94, nitro: 9.5, drift: 8.6 }
  },
  {
    id: 'x900',
    name: 'X-900 // VELOCITY',
    category: 'SPORTS',
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
    stats: { topSpeed: 84, topSpeedKmh: 410, accel: 98, handling: 86, braking: 86, boost: 92, nitro: 9.2, drift: 8.9 }
  },
  {
    id: 'k77',
    name: 'K-77 // QUANTUM',
    category: 'JDM',
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
    stats: { topSpeed: 80, topSpeedKmh: 400, accel: 86, handling: 98, braking: 96, boost: 86, nitro: 8.8, drift: 9.6 }
  },
  {
    id: 'r500',
    name: 'R-500 // RAZOR',
    category: 'MUSCLE',
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
    stats: { topSpeed: 86, topSpeedKmh: 415, accel: 90, handling: 94, braking: 85, boost: 95, nitro: 9.6, drift: 9.5 }
  },
  {
    id: 'wl04',
    name: 'WL-04 // APEX RALLY',
    category: 'RALLY',
    classType: 'RALLY CROSS APEX',
    description: 'Reinforced carbon composite suspension and active all-terrain repulsor pads for dirt, snow, and gravel.',
    primaryColor: 0x00E5FF,
    underglowColor: 0x00B4D8,
    trailColor: 0x90E0EF,
    maxSpeedKmh: 395,
    accelRate: 194,
    handlingRate: 95,
    brakingRate: 350,
    boostEfficiency: 88,
    stats: { topSpeed: 82, topSpeedKmh: 395, accel: 94, handling: 95, braking: 92, boost: 88, nitro: 8.9, drift: 9.7 }
  },
  {
    id: 'terrax',
    name: 'TERRA-X // CYBER BEAST',
    category: 'OFF-ROAD',
    classType: 'OFF-ROAD TITAN',
    description: 'Heavy armored anti-gravity frame with high ground clearance and terrain-conquering hydraulic dampeners.',
    primaryColor: 0xFF5500,
    underglowColor: 0xFF3300,
    trailColor: 0xFFAA00,
    maxSpeedKmh: 390,
    accelRate: 192,
    handlingRate: 90,
    brakingRate: 360,
    boostEfficiency: 90,
    stats: { topSpeed: 81, topSpeedKmh: 390, accel: 92, handling: 90, braking: 95, boost: 90, nitro: 9.0, drift: 8.8 }
  },
  {
    id: 'a11',
    name: 'A-11 // AETHER',
    category: 'HYPERCAR',
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
    stats: { topSpeed: 92, topSpeedKmh: 430, accel: 92, handling: 88, braking: 90, boost: 98, nitro: 9.8, drift: 9.0 }
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
    this.repulsorPads = [];
    this.leftElevon = null;
    this.rightElevon = null;
    this.airBrakeFlap = null;

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
    // Clear existing children except aeroKitGroup and spoilerGroup
    const toRemove = [];
    this.visualChassis.children.forEach(child => {
      if (child !== this.aeroKitGroup && child !== this.spoilerGroup) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(child => this.visualChassis.remove(child));

    this.headlights = [];
    this.brakeLights = [];
    this.propulsionModules = [];
    this.propulsionCoils = [];
    this.exhaustPlumes = [];
    this.repulsorPads = [];
    this.wheels = [];
    this.leftElevon = null;
    this.rightElevon = null;
    this.airBrakeFlap = null;

    const id = this.spec.id;

    // 1. Aerodynamic Monocoque Body & Carbon Undertray
    this.buildBodyChassis(id);

    // 2. High-Tech Cockpit Canopy & Holographic HUD Reticle
    this.buildCanopy(id);

    // 3. Central Pulsing Grav-Core
    this.buildEnergyCore(id);

    // 4. Quad / Twin Articulated Vectoring Propulsion Nacelles
    this.buildPropulsionSystem(id);

    // 5. Ceramic Thruster Nozzles & Triple Plasma Plumes
    this.buildExhaustNozzles(id);

    // 6. Underbody Anti-Gravity Repulsor Emitters
    this.buildRepulsorPads(id);

    // 7. Kinetic Elevons & Air Brake
    this.buildKineticFlaps(id);

    // 8. High-Performance Aerodynamic Racing Wheels
    this.buildWheels(id);

    // 9. Headlights, Y-Shaped LED Taillights & RANJEET License Plate
    this.buildLights(id);

    // 10. Dynamic Aero Kit & Spoiler
    this.updateAeroKit(this.currentKit);
    this.updateSpoiler(this.currentSpoiler);

    // 11. Underglow Ground-Effect Lighting
    if (!this.underglowLight) {
      this.underglowLight = new THREE.PointLight(this.underglowColor, 2.5, 12, 1.8);
      this.underglowLight.position.set(0, -0.25, 0);
      this.group.add(this.underglowLight);
    } else {
      this.underglowLight.color.copy(this.underglowColor);
    }
  }

  buildBodyChassis(id) {
    // PBR Physical Carbon Fiber Undertray Material
    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x090c14,
      metalness: 0.94,
      roughness: 0.22,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12
    });

    // PBR Automotive Gloss Livery Paint with clearcoat & controlled emissive
    const liveryMat = new THREE.MeshPhysicalMaterial({
      color: this.primaryColor,
      metalness: 0.84,
      roughness: 0.16,
      clearcoat: 0.96,
      clearcoatRoughness: 0.08,
      emissive: this.primaryColor.clone().multiplyScalar(0.04),
      emissiveIntensity: 0.04
    });

    // 1. Lower Carbon Ground-Effect Undertray with front splitter & rear venturi
    const underShape = new THREE.Shape();
    if (id === 'v720') {
      // Delta Stealth Arrow
      underShape.moveTo(0, 4.8);
      underShape.lineTo(1.2, 1.8);
      underShape.lineTo(2.4, -2.6);
      underShape.lineTo(1.8, -4.0);
      underShape.lineTo(-1.8, -4.0);
      underShape.lineTo(-2.4, -2.6);
      underShape.lineTo(-1.2, 1.8);
    } else if (id === 'k77') {
      // Wide Cornering Canard Apex
      underShape.moveTo(0, 4.0);
      underShape.lineTo(1.8, 2.8);
      underShape.lineTo(2.3, 0.8);
      underShape.lineTo(2.1, -2.4);
      underShape.lineTo(1.5, -3.8);
      underShape.lineTo(-1.5, -3.8);
      underShape.lineTo(-2.1, -2.4);
      underShape.lineTo(-2.3, 0.8);
      underShape.lineTo(-1.8, 2.8);
    } else if (id === 'r500') {
      // Triple Wedge Drift Profile
      underShape.moveTo(0, 4.6);
      underShape.lineTo(0.7, 2.0);
      underShape.lineTo(2.0, -1.2);
      underShape.lineTo(2.5, -3.6);
      underShape.lineTo(0.9, -4.0);
      underShape.lineTo(-0.9, -4.0);
      underShape.lineTo(-2.5, -3.6);
      underShape.lineTo(-2.0, -1.2);
      underShape.lineTo(-0.7, 2.0);
    } else {
      // F-8000 / X-900 / A-11 Balanced Monocoque
      underShape.moveTo(0, 4.4);
      underShape.lineTo(0.95, 2.6);
      underShape.lineTo(1.85, 0.4);
      underShape.lineTo(2.45, -1.8);
      underShape.lineTo(2.2, -3.6);
      underShape.lineTo(1.2, -4.0);
      underShape.lineTo(-1.2, -4.0);
      underShape.lineTo(-2.2, -3.6);
      underShape.lineTo(-2.45, -1.8);
      underShape.lineTo(-1.85, 0.4);
      underShape.lineTo(-0.95, 2.6);
    }
    underShape.closePath();

    const underGeo = new THREE.ExtrudeGeometry(underShape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.1
    });
    underGeo.rotateX(-Math.PI * 0.5);
    underGeo.center();

    this.bodyMesh = new THREE.Mesh(underGeo, carbonMat);
    this.bodyMesh.position.y = -0.12;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.visualChassis.add(this.bodyMesh);

    // 2. Sculpted Upper Livery Cowling with intake scoops & air flow channels
    const cowlShape = new THREE.Shape();
    cowlShape.moveTo(0, 3.6);
    cowlShape.lineTo(0.75, 2.2);
    cowlShape.lineTo(1.35, -0.2);
    cowlShape.lineTo(1.65, -2.6);
    cowlShape.lineTo(0.6, -3.2);
    cowlShape.lineTo(0.0, -2.6);
    cowlShape.lineTo(-0.6, -3.2);
    cowlShape.lineTo(-1.65, -2.6);
    cowlShape.lineTo(-1.35, -0.2);
    cowlShape.lineTo(-0.75, 2.2);
    cowlShape.closePath();

    const cowlGeo = new THREE.ExtrudeGeometry(cowlShape, {
      depth: 0.48,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.14,
      bevelThickness: 0.12
    });
    cowlGeo.rotateX(-Math.PI * 0.5);
    cowlGeo.center();

    this.cowlMesh = new THREE.Mesh(cowlGeo, liveryMat);
    this.cowlMesh.position.set(0, 0.32, 0);
    this.cowlMesh.castShadow = true;
    this.cowlMesh.receiveShadow = true;
    this.visualChassis.add(this.cowlMesh);

    // 3. Side NACA Air Scoops with Metallic Honeycomb Vent Grilles
    const grilleMat = new THREE.MeshStandardMaterial({
      color: 0x181e28,
      metalness: 0.95,
      roughness: 0.3
    });
    const grilleGeo = new THREE.BoxGeometry(0.18, 0.28, 1.2);

    [-1.25, 1.25].forEach(gx => {
      const grille = new THREE.Mesh(grilleGeo, grilleMat);
      grille.position.set(gx, 0.22, 0.6);
      grille.rotation.y = gx > 0 ? -0.15 : 0.15;
      this.visualChassis.add(grille);
    });

    // 4. Nose Aero Dive Planes / Forward Canards
    const canardGeo = new THREE.BoxGeometry(0.7, 0.04, 0.45);
    const canardMat = new THREE.MeshStandardMaterial({
      color: 0x0f1522,
      metalness: 0.9,
      roughness: 0.2
    });
    [-1.2, 1.2].forEach(cx => {
      const c = new THREE.Mesh(canardGeo, canardMat);
      c.position.set(cx, 0.12, 2.6);
      c.rotation.z = cx > 0 ? -0.12 : 0.12;
      this.visualChassis.add(c);
    });
  }

  buildCanopy(id) {
    // 1. Aerodynamic Double-Bubble Cockpit Canopy (Dark Iridium Glass)
    const canopyGeo = new THREE.ConeGeometry(0.78, 2.6, 8);
    canopyGeo.rotateX(Math.PI * 0.5);
    canopyGeo.scale(1.0, 0.42, 1.0);

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x050914,
      metalness: 0.96,
      roughness: 0.04,
      transmission: 0.72,
      transparent: true,
      opacity: 0.88,
      ior: 1.68,
      reflectivity: 0.95
    });

    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.62, 0.55);
    this.visualChassis.add(canopy);

    // 2. Cockpit Interior Tub & Pilot Headrest Silhouette
    const seatGeo = new THREE.BoxGeometry(0.3, 0.38, 0.22);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0a0d16, roughness: 0.8 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.52, 0.25);
    this.visualChassis.add(seat);

    // 3. Illuminated Flight HUD Reticle inside cockpit
    const hudRingGeo = new THREE.RingGeometry(0.08, 0.11, 24);
    const hudMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const hudRing = new THREE.Mesh(hudRingGeo, hudMat);
    hudRing.position.set(0, 0.58, 0.95);
    this.visualChassis.add(hudRing);

    // HUD Crosshair blips
    const crossGeo = new THREE.BoxGeometry(0.02, 0.06, 0.01);
    const cross1 = new THREE.Mesh(crossGeo, hudMat);
    cross1.position.set(0, 0.58, 0.96);
    this.visualChassis.add(cross1);

    const cross2 = new THREE.Mesh(crossGeo, hudMat);
    cross2.position.set(0, 0.58, 0.96);
    cross2.rotation.z = Math.PI * 0.5;
    this.visualChassis.add(cross2);
  }

  buildEnergyCore(id) {
    const coreGeo = new THREE.SphereGeometry(0.48, 16, 16);
    coreGeo.scale(0.75, 0.38, 1.6);

    const coreMat = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });

    this.energyCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.energyCoreMesh.position.set(0, 0.52, -0.65);
    this.visualChassis.add(this.energyCoreMesh);

    // Surrounding magnetic containment coils
    const coilCageGeo = new THREE.TorusGeometry(0.52, 0.025, 8, 24);
    const cageMat = new THREE.MeshStandardMaterial({ color: 0x161c28, metalness: 0.95 });
    [-0.3, 0.3].forEach(cz => {
      const ring = new THREE.Mesh(coilCageGeo, cageMat);
      ring.position.set(0, 0.52, -0.65 + cz);
      this.visualChassis.add(ring);
    });

    const coreLight = new THREE.PointLight(this.primaryColor, 2.2, 8, 2.0);
    coreLight.position.set(0, 0.65, -0.65);
    this.visualChassis.add(coreLight);
  }

  buildPropulsionSystem(id) {
    const modulePositions = [
      { x: -1.75, y: -0.05, z: 1.6 },
      { x: 1.75, y: -0.05, z: 1.6 },
      { x: -2.05, y: -0.05, z: -2.2 },
      { x: 2.05, y: -0.05, z: -2.2 }
    ];

    const nacelleGeo = new THREE.BoxGeometry(0.68, 0.44, 1.85);
    const nacelleMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.95,
      roughness: 0.22
    });

    // Dual rotating magnetic stator rings with notched energy teeth
    const coilGeo = new THREE.TorusGeometry(0.44, 0.065, 8, 16);
    coilGeo.rotateX(Math.PI * 0.5);

    modulePositions.forEach(pos => {
      const mod = new THREE.Group();
      mod.position.set(pos.x, pos.y, pos.z);

      const n = new THREE.Mesh(nacelleGeo, nacelleMat);
      n.castShadow = true;
      mod.add(n);

      const coilMat = new THREE.MeshBasicMaterial({ color: this.primaryColor });
      const coil1 = new THREE.Mesh(coilGeo, coilMat.clone());
      coil1.position.set(0, 0, 0.42);
      mod.add(coil1);
      this.propulsionCoils.push(coil1);

      const coil2 = new THREE.Mesh(coilGeo, coilMat.clone());
      coil2.position.set(0, 0, -0.42);
      mod.add(coil2);
      this.propulsionCoils.push(coil2);

      this.visualChassis.add(mod);
      this.propulsionModules.push(mod);
    });
  }

  buildExhaustNozzles(id) {
    // Triple central titanium exhaust pipes matching gameplay reference
    const cowlGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.42, 16, 1, true);
    cowlGeo.rotateX(Math.PI * 0.5);
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0x181e28,
      metalness: 0.95,
      roughness: 0.2
    });

    const flameGeo = new THREE.ConeGeometry(0.2, 1.8, 12);
    flameGeo.rotateX(-Math.PI * 0.5);

    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF, // Vibrant electric cyan/blue plasma
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    [-0.32, 0.0, 0.32].forEach(x => {
      // Titanium outer nozzle
      const nozzle = new THREE.Mesh(cowlGeo, nozzleMat);
      nozzle.position.set(x, 0.16, -3.8);
      this.visualChassis.add(nozzle);

      // Glowing blue plasma exhaust flame
      const flame = new THREE.Mesh(flameGeo, flameMat.clone());
      flame.position.set(x, 0.16, -4.6);
      this.visualChassis.add(flame);
      this.exhaustPlumes.push(flame);
    });
  }

  buildRepulsorPads(id) {
    // 4 Underbody Magnetic Levitation Emitter Disks
    const padPositions = [
      { x: -1.1, z: 2.2 },
      { x: 1.1, z: 2.2 },
      { x: -1.2, z: -2.4 },
      { x: 1.2, z: -2.4 }
    ];

    const rimGeo = new THREE.TorusGeometry(0.28, 0.04, 8, 20);
    rimGeo.rotateX(Math.PI * 0.5);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x161b26, metalness: 0.9 });

    const coreGeo = new THREE.CircleGeometry(0.24, 16);
    coreGeo.rotateX(-Math.PI * 0.5);
    const coreMat = new THREE.MeshBasicMaterial({
      color: this.underglowColor,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });

    padPositions.forEach(p => {
      const padGroup = new THREE.Group();
      padGroup.position.set(p.x, -0.22, p.z);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      padGroup.add(rim);

      const emitter = new THREE.Mesh(coreGeo, coreMat.clone());
      padGroup.add(emitter);

      this.visualChassis.add(padGroup);
      this.repulsorPads.push(emitter);
    });
  }

  buildKineticFlaps(id) {
    // Left and Right dynamic steering elevons mounted at aft fuselage
    const elevonGeo = new THREE.BoxGeometry(0.65, 0.035, 0.45);
    const elevonMat = new THREE.MeshStandardMaterial({
      color: 0x0f1420,
      metalness: 0.9,
      roughness: 0.25
    });

    this.leftElevon = new THREE.Mesh(elevonGeo, elevonMat);
    this.leftElevon.position.set(-1.85, 0.18, -3.2);
    this.visualChassis.add(this.leftElevon);

    this.rightElevon = new THREE.Mesh(elevonGeo, elevonMat);
    this.rightElevon.position.set(1.85, 0.18, -3.2);
    this.visualChassis.add(this.rightElevon);

    // Active center air-brake flap
    const brakeFlapGeo = new THREE.BoxGeometry(1.2, 0.04, 0.35);
    this.airBrakeFlap = new THREE.Mesh(brakeFlapGeo, elevonMat);
    this.airBrakeFlap.position.set(0, 0.46, -2.6);
    this.visualChassis.add(this.airBrakeFlap);
  }

  buildWheels(id) {
    this.wheels = [];
    const wheelPositions = [
      { x: -1.35, y: -0.12, z: 2.1, isFront: true },
      { x: 1.35, y: -0.12, z: 2.1, isFront: true },
      { x: -1.45, y: -0.12, z: -2.3, isFront: false },
      { x: 1.45, y: -0.12, z: -2.3, isFront: false }
    ];

    const tireGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 24);
    tireGeo.rotateZ(Math.PI * 0.5);
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.8,
      metalness: 0.1
    });

    const rimGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.38, 16);
    rimGeo.rotateZ(Math.PI * 0.5);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x161c26,
      metalness: 0.95,
      roughness: 0.18
    });

    const glowRingGeo = new THREE.TorusGeometry(0.34, 0.02, 8, 24);
    glowRingGeo.rotateY(Math.PI * 0.5);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });

    wheelPositions.forEach(pos => {
      const wheelMount = new THREE.Group();
      wheelMount.position.set(pos.x, pos.y, pos.z);

      const rotatingPart = new THREE.Group();

      const tire = new THREE.Mesh(tireGeo, tireMat);
      rotatingPart.add(tire);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rotatingPart.add(rim);

      const glow = new THREE.Mesh(glowRingGeo, glowMat);
      rotatingPart.add(glow);

      wheelMount.add(rotatingPart);
      this.visualChassis.add(wheelMount);

      this.wheels.push({
        mount: wheelMount,
        rotor: rotatingPart,
        isFront: pos.isFront
      });
    });
  }

  buildLights(id) {
    // Twin forward cyber headlights
    const hlGeo = new THREE.BoxGeometry(0.42, 0.1, 0.08);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xF0FFFF });

    const hlLeft = new THREE.Mesh(hlGeo, hlMat);
    hlLeft.position.set(-0.85, 0.14, 3.8);
    this.visualChassis.add(hlLeft);
    this.headlights.push(hlLeft);

    const hlRight = new THREE.Mesh(hlGeo, hlMat);
    hlRight.position.set(0.85, 0.14, 3.8);
    this.visualChassis.add(hlRight);
    this.headlights.push(hlRight);

    // Iconic Y-shaped rear LED taillights matching reference images
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xFF1A2A });
    [-1.2, 1.2].forEach(sideX => {
      const tailGroup = new THREE.Group();
      tailGroup.position.set(sideX, 0.28, -3.85);

      // Main horizontal bar
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.04), tailMat);
      tailGroup.add(bar);

      // Upper & lower Y-fork branches
      const branchGeo = new THREE.BoxGeometry(0.35, 0.07, 0.04);
      const b1 = new THREE.Mesh(branchGeo, tailMat);
      b1.position.set(sideX > 0 ? 0.25 : -0.25, 0.08, 0);
      b1.rotation.z = sideX > 0 ? 0.5 : -0.5;
      tailGroup.add(b1);

      const b2 = new THREE.Mesh(branchGeo, tailMat);
      b2.position.set(sideX > 0 ? 0.25 : -0.25, -0.08, 0);
      b2.rotation.z = sideX > 0 ? -0.5 : 0.5;
      tailGroup.add(b2);

      this.visualChassis.add(tailGroup);
      this.brakeLights.push(bar, b1, b2);
    });

    // License Plate "RANJEET" centered on rear bumper
    if (typeof document !== 'undefined') {
      const lpCanvas = document.createElement('canvas');
      lpCanvas.width = 256;
      lpCanvas.height = 64;
      const lpCtx = lpCanvas.getContext('2d');
      lpCtx.fillStyle = '#060A14';
      lpCtx.fillRect(0, 0, 256, 64);
      lpCtx.strokeStyle = '#00F0FF';
      lpCtx.lineWidth = 4;
      lpCtx.strokeRect(4, 4, 248, 56);
      lpCtx.fillStyle = '#FFFFFF';
      lpCtx.font = 'bold 30px monospace';
      lpCtx.textAlign = 'center';
      lpCtx.textBaseline = 'middle';
      lpCtx.fillText('RANJEET', 128, 32);

      const lpTex = new THREE.CanvasTexture(lpCanvas);
      const lpMat = new THREE.MeshBasicMaterial({ map: lpTex });
      const lpMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.24), lpMat);
      lpMesh.position.set(0, 0.28, -3.88);
      lpMesh.rotation.y = Math.PI;
      this.visualChassis.add(lpMesh);
    }
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
      const pMat = new THREE.MeshPhysicalMaterial({
        color: this.primaryColor,
        metalness: 0.85,
        roughness: 0.18,
        clearcoat: 0.95
      });
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

  setDecal(decalId = 'none') {
    this.currentDecal = decalId;
    if (!this.cowlMesh || typeof document === 'undefined') return;

    if (decalId === 'none') {
      this.cowlMesh.material.map = null;
      this.cowlMesh.material.needsUpdate = true;
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Base color
      ctx.fillStyle = '#' + this.primaryColor.getHexString();
      ctx.fillRect(0, 0, 512, 512);

      if (decalId === 'stripes') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(220, 0, 32, 512);
        ctx.fillRect(260, 0, 32, 512);
        ctx.fillStyle = '#FF007F';
        ctx.fillRect(212, 0, 8, 512);
        ctx.fillRect(292, 0, 8, 512);
      } else if (decalId === 'apex_racing') {
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 12;
        ctx.strokeRect(40, 40, 432, 432);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 72px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('01 APEX', 256, 220);
        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('NEO-SHINJUKU', 256, 280);
      } else if (decalId === 'cyber_hex') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 4;
        const size = 32;
        for (let y = 0; y < 512; y += size * 1.5) {
          for (let x = 0; x < 512; x += size * 1.732) {
            ctx.strokeRect(x, y, size, size);
          }
        }
      } else if (decalId === 'syndicate') {
        ctx.fillStyle = '#FF1A1A';
        ctx.font = 'bold 120px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('疾風', 256, 250);
        ctx.fillStyle = '#FFB800';
        ctx.font = 'bold 32px monospace';
        ctx.fillText('SYNDICATE 2089', 256, 320);
      } else if (decalId === 'sakura') {
        ctx.fillStyle = 'rgba(255, 105, 180, 0.7)';
        for (let i = 0; i < 20; i++) {
          const x = 50 + (i * 37) % 400;
          const y = 50 + (i * 49) % 400;
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      this.cowlMesh.material.map = tex;
      this.cowlMesh.material.needsUpdate = true;
    } catch (e) {
      // Fallback gracefully in headless test environments
    }
  }

  setWheelType(wheelType = 'cyber') {
    this.currentWheelType = wheelType;
    if (!this.wheels) return;
    const colors = {
      cyber: 0x00F0FF,
      turbine: 0xFFB800,
      concave: 0xFF007F,
      disc: 0x00FF88
    };
    const glowHex = colors[wheelType] || 0x00F0FF;
    this.wheels.forEach(w => {
      if (w.rotor && w.rotor.children) {
        w.rotor.children.forEach(mesh => {
          if (mesh.geometry && mesh.geometry.type === 'TorusGeometry') {
            mesh.material.color.setHex(glowHex);
          }
        });
      }
    });
  }

  setExhaustColor(colorHex) {
    if (colorHex !== undefined && colorHex !== null) {
      this.trailColor.setHex(colorHex);
      this.exhaustPlumes.forEach(f => f.material.color.setHex(colorHex));
    }
  }

  setCustomLivery(bodyColorHex, underglowHex, trailHex, kitType, spoilerType, decalId, wheelType) {
    if (bodyColorHex !== undefined && bodyColorHex !== null) {
      this.primaryColor.setHex(bodyColorHex);
      if (this.cowlMesh) {
        this.cowlMesh.material.color.setHex(bodyColorHex);
        this.cowlMesh.material.emissive.setHex(bodyColorHex).multiplyScalar(0.04);
      }
      if (this.energyCoreMesh) this.energyCoreMesh.material.color.setHex(bodyColorHex);
      this.propulsionCoils.forEach(c => c.material.color.setHex(bodyColorHex));
    }
    if (underglowHex !== undefined && underglowHex !== null) {
      this.underglowColor.setHex(underglowHex);
      if (this.underglowLight) this.underglowLight.color.setHex(underglowHex);
      this.repulsorPads.forEach(p => p.material.color.setHex(underglowHex));
    }
    if (trailHex !== undefined && trailHex !== null) {
      this.setExhaustColor(trailHex);
    }
    if (kitType) this.updateAeroKit(kitType);
    if (spoilerType) this.updateSpoiler(spoilerType);
    if (decalId) this.setDecal(decalId);
    if (wheelType) this.setWheelType(wheelType);
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

    // 2. Anti-Gravity Hover Breathing Animation vs High-Speed Downforce
    // When stationary (< 15 km/h), vehicle breathes with smooth harmonic buoyancy
    const isStationary = speedKmh < 15.0;
    let hoverY = 0;
    let hoverPitch = 0;
    let hoverRoll = 0;

    if (isStationary) {
      // Natural magnetic levitation oscillation
      const heave = Math.sin(time * 2.2) * 0.045 + Math.sin(time * 5.0) * 0.008;
      hoverY = heave;
      hoverPitch = Math.sin(time * 1.5) * 0.018;
      hoverRoll = Math.cos(time * 1.8) * 0.015;
    } else {
      // Aerodynamic compression downforce + high-speed road vibration
      const vib = (0.012 + speedRatio * 0.025) * Math.sin(time * 65.0);
      hoverY = vib;
    }

    this.visualChassis.position.y = hoverY;
    this.visualChassis.rotation.set(
      this.pitchAngle + hoverPitch,
      this.steerAngle + this.spin360Angle,
      this.rollAngle + this.barrelRollAngle + hoverRoll
    );

    // 3. Articulated Kinetic Elevons & Air Brake Flap Deflection
    if (this.leftElevon && this.rightElevon) {
      const elevonDeflection = steerInput * 0.35;
      this.leftElevon.rotation.x = -elevonDeflection;
      this.rightElevon.rotation.x = elevonDeflection;
    }

    if (this.airBrakeFlap) {
      const targetBrakeAngle = brakeInput > 0.1 ? -0.45 : 0.0;
      this.airBrakeFlap.rotation.x = THREE.MathUtils.lerp(this.airBrakeFlap.rotation.x, targetBrakeAngle, delta * 12.0);
    }

    // 4. Pulse Central Energy Core
    if (this.energyCoreMesh) {
      const corePulse = 0.85 + Math.sin(time * (boostActive ? 24.0 : 8.0)) * 0.18;
      this.energyCoreMesh.scale.set(corePulse, corePulse * 0.5, corePulse * 1.6);
    }

    // 5. Underbody Repulsor Ground-Effect Pulse
    if (this.repulsorPads.length > 0) {
      const repulsePulse = 0.65 + Math.sin(time * 8.0) * 0.25;
      this.repulsorPads.forEach(pad => {
        pad.material.opacity = repulsePulse;
      });
    }

    // 5b. Dynamic Wheel Rotation and Front Steering Alignment
    if (this.wheels && this.wheels.length > 0) {
      const wheelRotSpeed = (speedKmh / 3.6) * delta * 2.8;
      this.wheels.forEach(w => {
        w.rotor.rotation.x += wheelRotSpeed;
        if (w.isFront) {
          w.mount.rotation.y = THREE.MathUtils.lerp(w.mount.rotation.y, steerInput * 0.38, delta * 12.0);
        }
      });
    }

    // 6. Propulsion Modules & Rotating Magnetic Stator Rings
    this.propulsionModules.forEach((mod, idx) => {
      const side = (idx % 2 === 0 ? 1 : -1);
      const suspY = Math.sin(time * 12.0 + idx * 1.5) * 0.035 - (steerInput * side * 0.06);
      mod.position.y = -0.05 + suspY;
      mod.rotation.z = steerInput * side * 0.12;
    });

    this.propulsionCoils.forEach(coil => {
      coil.rotation.z += delta * (8.0 + speedRatio * 32.0);
      coil.material.color.setHex(boostActive ? 0xFF00FF : (driftActive ? 0xFFB800 : this.primaryColor.getHex()));
    });

    // 7. Ceramic Exhaust Plumes with Throttle Scaling
    this.exhaustPlumes.forEach(flame => {
      const boostScale = boostActive ? 2.4 : (1.0 + throttleInput * 0.8);
      const flicker = 0.9 + Math.random() * 0.2;
      flame.scale.set(boostScale * flicker, boostScale * flicker, boostScale * flicker * (boostActive ? 2.6 : 1.2));
      flame.visible = throttleInput > 0.05 || boostActive;
    });

    // 8. Digital Brake Lights
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
