import * as THREE from 'three';

// ============================================================================
// REALISTIC AUTOMOTIVE 3D VEHICLE ARCHITECTURE & CATALOG
// Iconic Muscle, Supercars, JDM Tuners, Classic Muscle, Luxury Sedans & SUVs
// Inspired by Real-World GTA Vehicle Roster & Modern Supercars
// Hand-crafted Procedural Topology, PBR Automotive Clearcoat, Detailed Interior,
// 3D Wheels with Drilled Rotors & Brembo Calipers, Authentic Fascias & Exhausts
// Developed by Ranjeet Kumar
// ============================================================================

export const VEHICLE_CATALOG = [
  {
    id: 'f8000',
    name: 'F-8000 // NIGHTRIFT',
    category: 'MUSCLE',
    classType: 'WIDEBODY HELLCAT COUPE',
    description: 'Flagship American modern muscle machine with flared widebody fenders, menacing quad halo projector headlamps, dual heat-extractor hood, and supercharged V8.',
    primaryColor: 0x00F0FF,
    underglowColor: 0x00F0FF,
    trailColor: 0x00F0FF,
    maxSpeedKmh: 420,
    accelRate: 185,
    handlingRate: 92,
    brakingRate: 320,
    boostEfficiency: 90,
    stats: { topSpeed: 88, topSpeedKmh: 420, accel: 90, handling: 92, braking: 88, boost: 90, nitro: 9.2, drift: 9.1 },
    archetype: 'MODERN_MUSCLE'
  },
  {
    id: 'nxr01',
    name: 'NXR-01 // HYPERCAR',
    category: 'HYPERCAR',
    classType: 'CARRERA MID-ENGINE EXOTIC',
    description: 'Ultra-low aerodynamic mid-engine supercar inspired by Porsche Carrera GT, featuring teardrop headlights, twin roll-hoop nacelles, visible mid-engine louvers, and active GT wing.',
    primaryColor: 0xC8D2DC,
    underglowColor: 0x00F0FF,
    trailColor: 0x00F0FF,
    maxSpeedKmh: 382,
    accelRate: 196,
    handlingRate: 88,
    brakingRate: 330,
    boostEfficiency: 94,
    stats: { topSpeed: 85, topSpeedKmh: 382, accel: 96, handling: 88, braking: 90, boost: 94, nitro: 9.4, drift: 9.2 },
    archetype: 'EXOTIC_SUPERCAR'
  },
  {
    id: 'v720',
    name: 'V-720 // PHANTOM',
    category: 'SUPERCAR',
    classType: 'F40 WEDGE CLASSIC',
    description: 'Iconic 80s/90s wedge supercar inspired by Ferrari F40 and Cheetah, featuring low razor nose, pop-up lights, side air strakes, large integrated rear wing, and triple exhaust.',
    primaryColor: 0xE61E28,
    underglowColor: 0xFF0033,
    trailColor: 0xFF0055,
    maxSpeedKmh: 445,
    accelRate: 170,
    handlingRate: 80,
    brakingRate: 300,
    boostEfficiency: 94,
    stats: { topSpeed: 98, topSpeedKmh: 445, accel: 82, handling: 80, braking: 82, boost: 94, nitro: 9.5, drift: 8.6 },
    archetype: 'WEDGE_SUPERCAR'
  },
  {
    id: 'x900',
    name: 'X-900 // VELOCITY',
    category: 'SPORTS',
    classType: 'RX-7 JDM TUNER COUPE',
    description: 'Aerodynamic Japanese sports coupe inspired by Mazda RX-7 FD and Firebird, with pop-up headlight lids, fastback hatch, front-mount intercooler, and ducktail spoiler.',
    primaryColor: 0x00A896,
    underglowColor: 0x00FFB8,
    trailColor: 0x00FFCC,
    maxSpeedKmh: 410,
    accelRate: 215,
    handlingRate: 86,
    brakingRate: 310,
    boostEfficiency: 92,
    stats: { topSpeed: 84, topSpeedKmh: 410, accel: 98, handling: 86, braking: 86, boost: 92, nitro: 9.2, drift: 8.9 },
    archetype: 'JDM_TUNER'
  },
  {
    id: 'k77',
    name: 'K-77 // QUANTUM',
    category: 'JDM',
    classType: 'M3 GERMAN TOURING',
    description: 'Box-flared DTM touring icon inspired by BMW E30 M3, featuring iconic twin kidney grille, quad round headlights, straight-edged greenhouse, and bootlid wing.',
    primaryColor: 0x2A323D,
    underglowColor: 0x00FF88,
    trailColor: 0x00FF99,
    maxSpeedKmh: 400,
    accelRate: 175,
    handlingRate: 98,
    brakingRate: 360,
    boostEfficiency: 86,
    stats: { topSpeed: 80, topSpeedKmh: 400, accel: 86, handling: 98, braking: 96, boost: 86, nitro: 8.8, drift: 9.6 },
    archetype: 'GERMAN_TOURING'
  },
  {
    id: 'r500',
    name: 'R-500 // RAZOR',
    category: 'MUSCLE',
    classType: '1970 R/T CLASSIC MUSCLE',
    description: 'Vintage 1970 muscle legend inspired by Dodge Challenger R/T and classic Mustang, featuring functional shaker scoop, chrome bumpers, wide rectangular grille, and vintage dish wheels.',
    primaryColor: 0xBA181B,
    underglowColor: 0xFF5500,
    trailColor: 0xFFAA00,
    maxSpeedKmh: 415,
    accelRate: 190,
    handlingRate: 94,
    brakingRate: 305,
    boostEfficiency: 95,
    stats: { topSpeed: 86, topSpeedKmh: 415, accel: 90, handling: 94, braking: 85, boost: 95, nitro: 9.6, drift: 9.5 },
    archetype: 'CLASSIC_MUSCLE'
  },
  {
    id: 'wl04',
    name: 'WL-04 // APEX RALLY',
    category: 'RALLY',
    classType: 'RALLY CROSS / STOCK CAR',
    description: 'Competition rally cross machine with quad bumper spotlights, roof intake scoop, competition rally wing, front dive planes, and competition OZ-style wheels.',
    primaryColor: 0xFA8231,
    underglowColor: 0xFFA801,
    trailColor: 0xFFD32A,
    maxSpeedKmh: 395,
    accelRate: 194,
    handlingRate: 95,
    brakingRate: 350,
    boostEfficiency: 88,
    stats: { topSpeed: 82, topSpeedKmh: 395, accel: 94, handling: 95, braking: 92, boost: 88, nitro: 8.9, drift: 9.7 },
    archetype: 'RALLY_CROSS'
  },
  {
    id: 'terrax',
    name: 'TERRA-X // CYBER BEAST',
    category: 'OFF-ROAD',
    classType: 'ESCALADE ARMORED SUV',
    description: 'Commanding luxury SUV inspired by Cadillac Escalade and Mesa 4x4, featuring massive multi-slat chrome grille, tall stance, roof rack rails, and vertical LED light blades.',
    primaryColor: 0x3D0C11,
    underglowColor: 0xFF3300,
    trailColor: 0xFFAA00,
    maxSpeedKmh: 390,
    accelRate: 192,
    handlingRate: 90,
    brakingRate: 360,
    boostEfficiency: 90,
    stats: { topSpeed: 81, topSpeedKmh: 390, accel: 92, handling: 90, braking: 95, boost: 90, nitro: 9.0, drift: 8.8 },
    archetype: 'LUXURY_SUV'
  },
  {
    id: 'a11',
    name: 'A-11 // AETHER',
    category: 'HYPERCAR',
    classType: 'MERCEDES AMG EXECUTIVE GT',
    description: 'Prestigious luxury executive coupe inspired by Mercedes-Benz AMG, featuring horizontal chrome louvre grille, upright hood star ornament, panoramic glass, and quad oval chrome exhausts.',
    primaryColor: 0xF2EAE1,
    underglowColor: 0x00D4FF,
    trailColor: 0x00FFFF,
    maxSpeedKmh: 430,
    accelRate: 195,
    handlingRate: 88,
    brakingRate: 330,
    boostEfficiency: 98,
    stats: { topSpeed: 92, topSpeedKmh: 430, accel: 92, handling: 88, braking: 90, boost: 98, nitro: 9.8, drift: 9.0 },
    archetype: 'EXECUTIVE_GT'
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
    this.currentWheelType = 'cyber';
    this.currentDecal = 'none';

    // Root groups
    this.group = new THREE.Group();
    this.visualChassis = new THREE.Group();
    this.group.add(this.visualChassis);

    // Component references
    this.bodyMesh = null;
    this.cowlMesh = null;
    this.energyCoreMesh = null;
    this.underglowLight = null;
    this.headlightSpot = null;
    this.headlightBeams = null;
    this.headlights = [];
    this.brakeLights = [];
    this.wheels = [];
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

    // Kinetic angles & 2nd-order spring-damper suspension dynamics
    this.steerAngle = 0;
    this.pitchAngle = 0;
    this.rollAngle = 0;
    this.pitchVel = 0;
    this.rollVel = 0;
    this.steerVel = 0;
    this.chassisYVel = 0;
    this.barrelRollAngle = 0;
    this.spin360Angle = 0;
    this.celebrationTime = 0;

    this.buildTopology();

    if (this.scene) {
      this.scene.add(this.group);
    }
  }

  buildTopology() {
    // Clear previous elements
    const toRemove = [];
    this.visualChassis.children.forEach(child => {
      if (child !== this.aeroKitGroup && child !== this.spoilerGroup) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(child => this.visualChassis.remove(child));

    this.headlights = [];
    this.brakeLights = [];
    this.wheels = [];
    this.propulsionModules = [];
    this.propulsionCoils = [];
    this.exhaustPlumes = [];
    this.repulsorPads = [];
    this.leftElevon = null;
    this.rightElevon = null;
    this.airBrakeFlap = null;

    const id = this.spec.id;
    const archetype = this.spec.archetype || 'MODERN_MUSCLE';

    // Build common automotive PBR materials
    this.materials = this.createMaterials(archetype);
    const materials = this.materials;

    // 1. Chassis, Lower Sills & Front/Rear Diffuser
    this.buildChassisUnderbody(archetype, materials);

    // 2. Main Sculpted Body (Hood, Fenders, Doors, Rear Quarters)
    this.buildMainBodyShell(archetype, materials);

    // 3. Greenhouse (A/B/C Pillars, Roof, Windshield, Side Glass)
    this.buildGreenhouseAndRoof(archetype, materials);

    // 4. Cockpit Interior (Dashboard, Steering Wheel, Bucket Racing Seats)
    this.buildInteriorCockpit(archetype, materials);

    // 5. Front Fascia (Iconic Grille, Headlamps, Splitter Lip)
    this.buildFrontFascia(archetype, materials);

    // 6. Rear Fascia (Iconic Taillights, Bumper, Exhaust Cutouts)
    this.buildRearFascia(archetype, materials);

    // 7. Side Mirrors & Door Handles
    this.buildMirrorsAndDetails(archetype, materials);

    // 8. Realistic High-Detail 3D Wheels with Drilled Rotors & Brembo Calipers
    this.buildRealisticWheels(archetype, materials);

    // 9. Hollow Exhaust Tailpipes & Plasma Flame Thrusters
    this.buildExhaustPipes(archetype, materials);

    // 10. Engine Bay / Sub-Chassis Cores (Ensures full compatibility with existing systems)
    this.buildEngineAndRepulsors(archetype, materials);

    // 11. Aero Kits and Rear Spoilers
    this.updateAeroKit(this.currentKit);
    this.updateSpoiler(this.currentSpoiler);

    // 12. Dynamic Underglow Ground-Effect Lighting (Player-only for maximum 144 FPS)
    if (this.isPlayer) {
      if (!this.underglowLight) {
        this.underglowLight = new THREE.PointLight(this.underglowColor, 2.0, 10, 2.0);
        this.underglowLight.position.set(0, -0.3, 0);
        this.group.add(this.underglowLight);
      } else {
        this.underglowLight.color.copy(this.underglowColor);
      }

      // 13. High-Intensity Forward Projector Headlights (Player-only)
      if (!this.headlightSpot) {
        this.headlightSpot = new THREE.SpotLight(0xF0F8FF, 4.2, 110, Math.PI * 0.22, 0.45, 1.2);
        this.headlightSpot.position.set(0, 0.65, 2.3);
        const spotTarget = new THREE.Object3D();
        spotTarget.position.set(0, -0.2, 32.0);
        this.visualChassis.add(spotTarget);
        this.headlightSpot.target = spotTarget;
        this.visualChassis.add(this.headlightSpot);
      }

      // Atmospheric Volumetric Forward Light Beams
      if (!this.headlightBeams) {
        const beamGeo = new THREE.ConeGeometry(2.2, 16.0, 12, 1, true);
        beamGeo.rotateX(Math.PI * 0.5);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xD8EEFF,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        this.headlightBeams = new THREE.Group();
        [-0.55, 0.55].forEach(bx => {
          const beam = new THREE.Mesh(beamGeo, beamMat);
          beam.position.set(bx, 0.45, 9.5);
          this.headlightBeams.add(beam);
        });
        this.visualChassis.add(this.headlightBeams);
      }
    }
  }

  setGoldenCarMode(enabled) {
    if (!this.materials || !this.materials.paintMat) return;
    if (enabled) {
      this.materials.paintMat.color.setHex(0xFFD700);
      this.materials.paintMat.metalness = 0.98;
      this.materials.paintMat.roughness = 0.08;
      this.materials.paintMat.clearcoat = 1.0;
      this.materials.paintMat.clearcoatRoughness = 0.03;
      this.materials.paintMat.emissive.setHex(0x553800);
      this.materials.paintMat.emissiveIntensity = 0.35;
      if (this.materials.chromeMat) {
        this.materials.chromeMat.color.setHex(0xFFE57F);
      }
      if (this.underglowLight) {
        this.underglowLight.color.setHex(0xFFD700);
        this.underglowLight.intensity = 3.5;
      }
    } else {
      this.materials.paintMat.color.copy(this.primaryColor);
      this.materials.paintMat.metalness = this.spec && this.spec.archetype === 'CLASSIC_MUSCLE' ? 0.72 : 0.86;
      this.materials.paintMat.roughness = 0.16;
      this.materials.paintMat.clearcoat = 1.0;
      this.materials.paintMat.clearcoatRoughness = 0.06;
      this.materials.paintMat.emissive.copy(this.primaryColor).multiplyScalar(0.04);
      this.materials.paintMat.emissiveIntensity = 0.04;
      if (this.materials.chromeMat) {
        this.materials.chromeMat.color.setHex(0xF0F4F8);
      }
      if (this.underglowLight) {
        this.underglowLight.color.copy(this.underglowColor);
        this.underglowLight.intensity = 2.0;
      }
    }
  }

  createMaterials(archetype) {
    // Clearcoat automotive metallic paint
    const paintMat = new THREE.MeshPhysicalMaterial({
      color: this.primaryColor,
      metalness: archetype === 'CLASSIC_MUSCLE' ? 0.72 : 0.86,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      emissive: this.primaryColor.clone().multiplyScalar(0.04),
      emissiveIntensity: 0.04
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x101318,
      roughness: 0.75,
      metalness: 0.3
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x090c10,
      roughness: 0.35,
      metalness: 0.85
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xF0F4F8,
      metalness: 0.98,
      roughness: 0.08
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a1420,
      metalness: 0.92,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.65,
      ior: 1.54,
      reflectivity: 0.95
    });

    const interiorMat = new THREE.MeshStandardMaterial({
      color: 0x141820,
      roughness: 0.85,
      metalness: 0.1
    });

    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x1c222e,
      roughness: 0.7,
      metalness: 0.2
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.88,
      metalness: 0.08
    });

    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0xB5BDC6,
      metalness: 0.95,
      roughness: 0.22
    });

    const caliperMat = new THREE.MeshStandardMaterial({
      color: (archetype === 'EXOTIC_SUPERCAR' || archetype === 'MODERN_MUSCLE') ? 0xE61E28 : (archetype === 'JDM_TUNER' ? 0x00FF88 : 0xFFA500),
      metalness: 0.6,
      roughness: 0.25
    });

    const headlampLensMat = new THREE.MeshStandardMaterial({
      color: 0xF0F8FF,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75
    });

    const headlampGlowMat = new THREE.MeshBasicMaterial({
      color: 0xF0FBFF
    });

    const taillightGlowMat = new THREE.MeshBasicMaterial({
      color: 0xFF1424
    });

    const amberLightMat = new THREE.MeshBasicMaterial({
      color: 0xFFA500
    });

    return {
      paintMat,
      darkTrimMat,
      carbonMat,
      chromeMat,
      glassMat,
      interiorMat,
      seatMat,
      tireMat,
      rotorMat,
      caliperMat,
      headlampLensMat,
      headlampGlowMat,
      taillightGlowMat,
      amberLightMat
    };
  }

  buildChassisUnderbody(archetype, mats) {
    const isSUV = archetype === 'LUXURY_SUV';
    const isSuper = archetype === 'EXOTIC_SUPERCAR' || archetype === 'WEDGE_SUPERCAR';

    // 1. Carbon / Heavy Steel Flat Undertray with Venturi Channels
    const undertrayWidth = isSUV ? 2.15 : (isSuper ? 2.1 : 2.02);
    const undertrayLength = isSUV ? 4.8 : 4.6;
    const trayGeo = new THREE.BoxGeometry(undertrayWidth, 0.08, undertrayLength);
    const underTray = new THREE.Mesh(trayGeo, mats.carbonMat);
    underTray.position.set(0, isSUV ? -0.1 : -0.22, 0);
    underTray.receiveShadow = true;
    this.visualChassis.add(underTray);
    this.bodyMesh = underTray;

    // 2. Front Chin Splitter
    const splitterWidth = undertrayWidth + 0.08;
    const splitterGeo = new THREE.BoxGeometry(splitterWidth, 0.05, 0.6);
    const splitter = new THREE.Mesh(splitterGeo, mats.darkTrimMat);
    splitter.position.set(0, isSUV ? -0.08 : -0.24, (undertrayLength * 0.5) + 0.1);
    this.visualChassis.add(splitter);

    // 3. Rear Diffuser with 4 Vertical Aerodynamic Strakes
    const diffuserGeo = new THREE.BoxGeometry(undertrayWidth * 0.92, 0.12, 0.7);
    const diffuser = new THREE.Mesh(diffuserGeo, mats.darkTrimMat);
    diffuser.position.set(0, isSUV ? -0.05 : -0.18, -(undertrayLength * 0.5) - 0.05);
    this.visualChassis.add(diffuser);

    [-0.6, -0.2, 0.2, 0.6].forEach(dx => {
      const strakeGeo = new THREE.BoxGeometry(0.04, 0.16, 0.6);
      const strake = new THREE.Mesh(strakeGeo, mats.carbonMat);
      strake.position.set(dx, isSUV ? -0.07 : -0.2, -(undertrayLength * 0.5) - 0.05);
      this.visualChassis.add(strake);
    });

    // 4. Side Skirts
    [-undertrayWidth * 0.5, undertrayWidth * 0.5].forEach(sx => {
      const skirtGeo = new THREE.BoxGeometry(0.12, isSUV ? 0.16 : 0.08, 2.6);
      const skirt = new THREE.Mesh(skirtGeo, mats.darkTrimMat);
      skirt.position.set(sx, isSUV ? -0.08 : -0.22, 0);
      this.visualChassis.add(skirt);
    });
  }

  buildMainBodyShell(archetype, mats) {
    const isSUV = archetype === 'LUXURY_SUV';
    const isSuper = archetype === 'EXOTIC_SUPERCAR' || archetype === 'WEDGE_SUPERCAR';
    const isWedge = archetype === 'WEDGE_SUPERCAR';
    const isClassic = archetype === 'CLASSIC_MUSCLE';
    const isM3 = archetype === 'GERMAN_TOURING';

    const bodyWidth = isSUV ? 2.18 : (isSuper ? 2.12 : 2.05);
    const bodyHeight = isSUV ? 0.68 : (isSuper ? 0.42 : 0.5);
    const bodyCenterY = isSUV ? 0.35 : (isSuper ? 0.05 : 0.12);

    // 1. Lower Core Fuselage (Beltline down to skirts)
    const lowerBodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, 4.4);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, mats.paintMat);
    lowerBody.position.set(0, bodyCenterY, 0);
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    this.visualChassis.add(lowerBody);
    this.cowlMesh = lowerBody; // Key reference for decals and livery textures

    // 2. Sculpted Hood (Bonnet)
    const hoodLength = isSuper ? 1.5 : (isSUV ? 1.6 : 1.85);
    const hoodPosZ = isSuper ? 1.4 : 1.3;
    const hoodPosY = bodyCenterY + (bodyHeight * 0.48);
    const hoodGeo = new THREE.BoxGeometry(bodyWidth * 0.88, 0.1, hoodLength);
    const hood = new THREE.Mesh(hoodGeo, mats.paintMat);
    hood.position.set(0, hoodPosY, hoodPosZ);
    hood.rotation.x = isSuper ? 0.11 : (isWedge ? 0.14 : 0.04);
    hood.castShadow = true;
    this.visualChassis.add(hood);

    // Muscle Shaker / Heat Extractors / Supercar Vents
    if (archetype === 'CLASSIC_MUSCLE') {
      // 1970 Shaker Hood Scoop (Matte Black protruding from hood)
      const scoopGeo = new THREE.BoxGeometry(0.55, 0.14, 0.65);
      const scoop = new THREE.Mesh(scoopGeo, mats.darkTrimMat);
      scoop.position.set(0, hoodPosY + 0.1, hoodPosZ - 0.15);
      scoop.rotation.x = 0.04;
      this.visualChassis.add(scoop);
    } else if (archetype === 'MODERN_MUSCLE') {
      // Hellcat Dual Heat Extractor Hood Vents
      [-0.45, 0.45].forEach(vx => {
        const ventGeo = new THREE.BoxGeometry(0.24, 0.04, 0.45);
        const vent = new THREE.Mesh(ventGeo, mats.darkTrimMat);
        vent.position.set(vx, hoodPosY + 0.06, hoodPosZ);
        vent.rotation.x = 0.04;
        this.visualChassis.add(vent);
      });
      // Center Muscle Power Bulge
      const bulgeGeo = new THREE.BoxGeometry(0.38, 0.06, 1.1);
      const bulge = new THREE.Mesh(bulgeGeo, mats.paintMat);
      bulge.position.set(0, hoodPosY + 0.06, hoodPosZ + 0.1);
      bulge.rotation.x = 0.04;
      this.visualChassis.add(bulge);
    } else if (isSuper) {
      // Aerodynamic Center Hood Radiator Extraction Duct
      const ventGeo = new THREE.BoxGeometry(0.55, 0.04, 0.5);
      const vent = new THREE.Mesh(ventGeo, mats.carbonMat);
      vent.position.set(0, hoodPosY + 0.02, hoodPosZ);
      this.visualChassis.add(vent);
    }

    // 3. Widebody Wheel Arches & Fender Flares
    const archPositions = [
      { x: -bodyWidth * 0.52, z: 1.45, isFront: true },
      { x: bodyWidth * 0.52, z: 1.45, isFront: true },
      { x: -bodyWidth * 0.53, z: -1.45, isFront: false },
      { x: bodyWidth * 0.53, z: -1.45, isFront: false }
    ];

    archPositions.forEach(pos => {
      const archFlareGeo = isM3
        ? new THREE.BoxGeometry(0.18, 0.38, 1.15) // E30 M3 Boxed Fenders!
        : new THREE.CylinderGeometry(0.52, 0.56, 0.18, 16, 1, false, 0, Math.PI);

      if (!isM3) archFlareGeo.rotateZ(pos.x > 0 ? -Math.PI * 0.5 : Math.PI * 0.5);

      const flare = new THREE.Mesh(archFlareGeo, mats.paintMat);
      flare.position.set(pos.x, bodyCenterY - 0.02, pos.z);
      this.visualChassis.add(flare);

      // Inner dark wheel well liner
      const wellGeo = new THREE.BoxGeometry(0.24, 0.44, 0.95);
      const well = new THREE.Mesh(wellGeo, mats.darkTrimMat);
      well.position.set(pos.x > 0 ? pos.x - 0.12 : pos.x + 0.12, bodyCenterY - 0.04, pos.z);
      this.visualChassis.add(well);
    });

    // 4. Side Air Intakes (Supercar Mid-Engine cooling)
    if (isSuper || archetype === 'JDM_TUNER') {
      [-bodyWidth * 0.51, bodyWidth * 0.51].forEach(sx => {
        const scoopGeo = new THREE.BoxGeometry(0.12, 0.28, 0.65);
        const scoop = new THREE.Mesh(scoopGeo, mats.carbonMat);
        scoop.position.set(sx, bodyCenterY, -0.6);
        this.visualChassis.add(scoop);
      });
    }
  }

  buildGreenhouseAndRoof(archetype, mats) {
    const isSUV = archetype === 'LUXURY_SUV';
    const isSuper = archetype === 'EXOTIC_SUPERCAR';
    const isWedge = archetype === 'WEDGE_SUPERCAR';
    const isM3 = archetype === 'GERMAN_TOURING';

    if (archetype === 'EXOTIC_SUPERCAR') {
      // Carrera GT Open-Top Roadster Cockpit with Twin Roll Hoops
      const windshieldGeo = new THREE.BoxGeometry(1.68, 0.38, 0.7);
      const windshield = new THREE.Mesh(windshieldGeo, mats.glassMat);
      windshield.position.set(0, 0.52, 0.35);
      windshield.rotation.x = -0.48;
      this.visualChassis.add(windshield);

      // Twin Aerodynamic Fairings & Roll Hoops behind Driver & Passenger
      [-0.45, 0.45].forEach(rx => {
        const hoopGeo = new THREE.TorusGeometry(0.22, 0.045, 8, 16, Math.PI);
        const hoop = new THREE.Mesh(hoopGeo, mats.paintMat);
        hoop.position.set(rx, 0.52, -0.45);
        hoop.rotation.y = Math.PI * 0.5;
        this.visualChassis.add(hoop);

        const fairingGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.9, 12);
        fairingGeo.rotateX(Math.PI * 0.5);
        const fairing = new THREE.Mesh(fairingGeo, mats.paintMat);
        fairing.position.set(rx, 0.44, -0.85);
        this.visualChassis.add(fairing);
      });

      // Mid-engine transparent glass cover with cooling louvers
      const coverGeo = new THREE.BoxGeometry(1.1, 0.04, 1.15);
      const cover = new THREE.Mesh(coverGeo, mats.glassMat);
      cover.position.set(0, 0.42, -1.25);
      this.visualChassis.add(cover);

      return;
    }

    // Standard Coupe / Sedan / SUV Cabin Structure
    const cabinWidth = isSUV ? 1.88 : (isM3 ? 1.74 : 1.78);
    const cabinLength = isSUV ? 3.1 : (isWedge ? 2.1 : 2.4);
    const roofHeight = isSUV ? 0.95 : (isWedge ? 0.58 : 0.65);
    const roofPosY = isSUV ? 0.98 : (isWedge ? 0.48 : 0.58);
    const cabinPosZ = isSUV ? -0.2 : (isWedge ? -0.1 : -0.15);

    // 1. Windshield
    const wsAngle = isWedge ? -0.58 : (isSUV ? -0.32 : -0.46);
    const wsLength = isWedge ? 1.05 : 0.88;
    const wsGeo = new THREE.BoxGeometry(cabinWidth * 0.92, 0.05, wsLength);
    const windshield = new THREE.Mesh(wsGeo, mats.glassMat);
    windshield.position.set(0, roofPosY - 0.12, cabinPosZ + (cabinLength * 0.46));
    windshield.rotation.x = wsAngle;
    this.visualChassis.add(windshield);

    // 2. Roof Panel
    const roofLength = isSUV ? 2.2 : (isWedge ? 1.1 : 1.35);
    const roofGeo = new THREE.BoxGeometry(cabinWidth * 0.86, 0.06, roofLength);
    const roof = new THREE.Mesh(roofGeo, mats.paintMat);
    roof.position.set(0, roofPosY + 0.06, cabinPosZ + (isSUV ? 0.1 : -0.05));
    roof.castShadow = true;
    this.visualChassis.add(roof);

    // SUV Roof Rack Rails & Crossbars
    if (isSUV) {
      [-cabinWidth * 0.42, cabinWidth * 0.42].forEach(rx => {
        const railGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.3, 8);
        railGeo.rotateX(Math.PI * 0.5);
        const rail = new THREE.Mesh(railGeo, mats.chromeMat);
        rail.position.set(rx, roofPosY + 0.16, cabinPosZ + 0.1);
        this.visualChassis.add(rail);
      });
      [-0.5, 0.5].forEach(cz => {
        const crossGeo = new THREE.BoxGeometry(cabinWidth * 0.84, 0.03, 0.06);
        const cross = new THREE.Mesh(crossGeo, mats.darkTrimMat);
        cross.position.set(0, roofPosY + 0.16, cabinPosZ + 0.1 + cz);
        this.visualChassis.add(cross);
      });
    }

    // 3. Rear Window / Fastback Hatch
    const rwAngle = isWedge ? 0.42 : (isSUV ? 0.12 : 0.38);
    const rwLength = isSUV ? 0.65 : 0.82;
    const rwGeo = new THREE.BoxGeometry(cabinWidth * 0.88, 0.05, rwLength);
    const rearWindow = new THREE.Mesh(rwGeo, mats.glassMat);
    rearWindow.position.set(0, roofPosY - 0.12, cabinPosZ - (cabinLength * 0.46));
    rearWindow.rotation.x = rwAngle;
    this.visualChassis.add(rearWindow);

    // 4. Side Glass (Driver & Passenger)
    [-cabinWidth * 0.46, cabinWidth * 0.46].forEach(gx => {
      const sideGeo = new THREE.BoxGeometry(0.04, roofHeight * 0.45, cabinLength * 0.82);
      const sideGlass = new THREE.Mesh(sideGeo, mats.glassMat);
      sideGlass.position.set(gx, roofPosY - 0.12, cabinPosZ);
      this.visualChassis.add(sideGlass);
    });

    // 5. A / B / C Structural Pillars
    [-cabinWidth * 0.46, cabinWidth * 0.46].forEach(px => {
      // A-Pillars
      const aGeo = new THREE.BoxGeometry(0.08, 0.08, wsLength);
      const aPillar = new THREE.Mesh(aGeo, mats.paintMat);
      aPillar.position.set(px, roofPosY - 0.12, cabinPosZ + (cabinLength * 0.46));
      aPillar.rotation.x = wsAngle;
      this.visualChassis.add(aPillar);

      // B-Pillars
      const bGeo = new THREE.BoxGeometry(0.08, roofHeight * 0.5, 0.12);
      const bPillar = new THREE.Mesh(bGeo, mats.darkTrimMat);
      bPillar.position.set(px, roofPosY - 0.12, cabinPosZ);
      this.visualChassis.add(bPillar);

      // C-Pillars
      const cGeo = new THREE.BoxGeometry(0.12, 0.08, rwLength);
      const cPillar = new THREE.Mesh(cGeo, mats.paintMat);
      cPillar.position.set(px, roofPosY - 0.12, cabinPosZ - (cabinLength * 0.46));
      cPillar.rotation.x = rwAngle;
      this.visualChassis.add(cPillar);
    });

    // 6. Sculpted Rear Trunk Decklid & Muscular Quarter Haunches (Bridges cabin to rear bumper)
    const deckLength = isSUV ? 0.75 : (isWedge ? 0.85 : 1.15);
    const deckZ = isSUV ? -1.95 : (isWedge ? -1.82 : -1.72);
    const deckY = isSUV ? 0.52 : (isSuper ? 0.22 : 0.32);
    const deckGeo = new THREE.BoxGeometry(cabinWidth * 0.96, 0.08, deckLength);
    const decklid = new THREE.Mesh(deckGeo, mats.paintMat);
    decklid.position.set(0, deckY, deckZ);
    decklid.castShadow = true;
    this.visualChassis.add(decklid);

    // Integrated Rear Ducktail Lip Spoiler / Haunch Capping
    const lipGeo = new THREE.BoxGeometry(cabinWidth * 0.98, 0.06, 0.18);
    const lip = new THREE.Mesh(lipGeo, mats.carbonMat);
    lip.position.set(0, deckY + 0.04, deckZ - (deckLength * 0.5) + 0.04);
    this.visualChassis.add(lip);

    // Muscular Rear Quarter Buttresses (Flanking the rear deck)
    [-cabinWidth * 0.5, cabinWidth * 0.5].forEach(bx => {
      const buttressGeo = new THREE.BoxGeometry(0.18, 0.22, deckLength * 1.05);
      const buttress = new THREE.Mesh(buttressGeo, mats.paintMat);
      buttress.position.set(bx, deckY - 0.04, deckZ);
      this.visualChassis.add(buttress);
    });
  }

  buildInteriorCockpit(archetype, mats) {
    const isSUV = archetype === 'LUXURY_SUV';
    const isSuper = archetype === 'EXOTIC_SUPERCAR' || archetype === 'WEDGE_SUPERCAR';
    const interiorPosY = isSUV ? 0.35 : (isSuper ? 0.05 : 0.14);

    // 1. Dashboard Assembly
    const dashGeo = new THREE.BoxGeometry(1.65, 0.28, 0.55);
    const dash = new THREE.Mesh(dashGeo, mats.interiorMat);
    dash.position.set(0, interiorPosY + 0.24, 0.55);
    this.visualChassis.add(dash);

    // Digital Instrument Gauge Cluster Glow
    const gaugeGeo = new THREE.BoxGeometry(0.42, 0.12, 0.02);
    const gaugeMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
    gauge.position.set(-0.4, interiorPosY + 0.32, 0.32);
    this.visualChassis.add(gauge);

    // 2. 3-Spoke Sports Steering Wheel
    const wheelRimGeo = new THREE.TorusGeometry(0.18, 0.022, 8, 20);
    const steer = new THREE.Mesh(wheelRimGeo, mats.darkTrimMat);
    steer.position.set(-0.4, interiorPosY + 0.34, 0.22);
    steer.rotation.x = 0.35;
    this.visualChassis.add(steer);

    // 3. Center Console & Shifter
    const consoleGeo = new THREE.BoxGeometry(0.32, 0.22, 1.1);
    const cConsole = new THREE.Mesh(consoleGeo, mats.interiorMat);
    cConsole.position.set(0, interiorPosY + 0.14, -0.15);
    this.visualChassis.add(cConsole);

    // 4. Twin Bucket Racing Seats with Headrests
    [-0.42, 0.42].forEach(sx => {
      // Seat Cushion
      const cushionGeo = new THREE.BoxGeometry(0.52, 0.14, 0.55);
      const cushion = new THREE.Mesh(cushionGeo, mats.seatMat);
      cushion.position.set(sx, interiorPosY + 0.1, -0.2);
      this.visualChassis.add(cushion);

      // Seat Backrest with Bolsters
      const backGeo = new THREE.BoxGeometry(0.5, 0.55, 0.14);
      const back = new THREE.Mesh(backGeo, mats.seatMat);
      back.position.set(sx, interiorPosY + 0.38, -0.48);
      back.rotation.x = -0.18;
      this.visualChassis.add(back);

      // Headrest
      const hrGeo = new THREE.BoxGeometry(0.26, 0.2, 0.1);
      const hr = new THREE.Mesh(hrGeo, mats.seatMat);
      hr.position.set(sx, interiorPosY + 0.7, -0.56);
      this.visualChassis.add(hr);
    });
  }

  buildFrontFascia(archetype, mats) {
    const isSUV = archetype === 'LUXURY_SUV';
    const isClassic = archetype === 'CLASSIC_MUSCLE';
    const isSuper = archetype === 'EXOTIC_SUPERCAR';
    const isWedge = archetype === 'WEDGE_SUPERCAR';
    const isM3 = archetype === 'GERMAN_TOURING';
    const isAMG = archetype === 'EXECUTIVE_GT';
    const isRally = archetype === 'RALLY_CROSS';

    const noseZ = isSUV ? 2.45 : (isSuper ? 2.38 : 2.42);
    const noseY = isSUV ? 0.35 : (isSuper ? 0.08 : 0.18);

    // Front Bumper Core
    const bumperGeo = new THREE.BoxGeometry(2.08, 0.35, 0.45);
    const bumper = new THREE.Mesh(bumperGeo, mats.paintMat);
    bumper.position.set(0, noseY - 0.08, noseZ - 0.15);
    this.visualChassis.add(bumper);

    if (archetype === 'MODERN_MUSCLE') {
      // Dodge Challenger Wide Dark Recessed Honeycomb Grille
      const grilleSurroundGeo = new THREE.BoxGeometry(1.68, 0.28, 0.08);
      const surround = new THREE.Mesh(grilleSurroundGeo, mats.darkTrimMat);
      surround.position.set(0, noseY + 0.12, noseZ);
      this.visualChassis.add(surround);

      // Quad Round Halo Projector Headlamps
      [-0.68, -0.42, 0.42, 0.68].forEach(hx => {
        const ringGeo = new THREE.TorusGeometry(0.09, 0.02, 8, 20);
        const ring = new THREE.Mesh(ringGeo, mats.headlampGlowMat);
        ring.position.set(hx, noseY + 0.12, noseZ + 0.04);
        this.visualChassis.add(ring);

        const bulbGeo = new THREE.SphereGeometry(0.05, 12, 12);
        const bulb = new THREE.Mesh(bulbGeo, mats.headlampGlowMat);
        bulb.position.set(hx, noseY + 0.12, noseZ + 0.03);
        this.visualChassis.add(bulb);
        this.headlights.push(bulb, ring);
      });
    } else if (isClassic) {
      // 1970 Muscle Chrome Bumper + Wide Rectangular Grille
      const chromeBumperGeo = new THREE.BoxGeometry(2.14, 0.16, 0.22);
      const chromeBumper = new THREE.Mesh(chromeBumperGeo, mats.chromeMat);
      chromeBumper.position.set(0, noseY - 0.06, noseZ + 0.08);
      this.visualChassis.add(chromeBumper);

      const grilleGeo = new THREE.BoxGeometry(1.65, 0.24, 0.06);
      const grille = new THREE.Mesh(grilleGeo, mats.darkTrimMat);
      grille.position.set(0, noseY + 0.14, noseZ);
      this.visualChassis.add(grille);

      // Dual Classic Round Headlights with Chrome Bezels
      [-0.65, 0.65].forEach(hx => {
        const bezelGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 20);
        const bezel = new THREE.Mesh(bezelGeo, mats.chromeMat);
        bezel.position.set(hx, noseY + 0.14, noseZ + 0.03);
        this.visualChassis.add(bezel);

        const lampGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const lamp = new THREE.Mesh(lampGeo, mats.headlampGlowMat);
        lamp.position.set(hx, noseY + 0.14, noseZ + 0.02);
        this.visualChassis.add(lamp);
        this.headlights.push(lamp);
      });
    } else if (isM3) {
      // BMW E30 M3 Twin Kidney Grille + Quad Round Headlamps
      [-0.14, 0.14].forEach(kx => {
        const kidneyGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 16);
        const kidney = new THREE.Mesh(kidneyGeo, mats.chromeMat);
        kidney.position.set(kx, noseY + 0.12, noseZ + 0.02);
        kidney.scale.set(0.7, 1.2, 1.0);
        this.visualChassis.add(kidney);
      });

      // Quad Round Lamps
      [-0.72, -0.48, 0.48, 0.72].forEach(hx => {
        const lampGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16);
        lampGeo.rotateX(Math.PI * 0.5);
        const lamp = new THREE.Mesh(lampGeo, mats.headlampGlowMat);
        lamp.position.set(hx, noseY + 0.12, noseZ + 0.02);
        this.visualChassis.add(lamp);
        this.headlights.push(lamp);
      });
    } else if (isAMG) {
      // Mercedes AMG Horizontal Chrome Louvres & Hood Star
      const grilleGeo = new THREE.BoxGeometry(1.25, 0.32, 0.08);
      const grille = new THREE.Mesh(grilleGeo, mats.chromeMat);
      grille.position.set(0, noseY + 0.12, noseZ + 0.02);
      this.visualChassis.add(grille);

      // Upright Hood Star Emblem
      const starRingGeo = new THREE.TorusGeometry(0.07, 0.015, 8, 16);
      const star = new THREE.Mesh(starRingGeo, mats.chromeMat);
      star.position.set(0, noseY + 0.38, noseZ - 0.15);
      this.visualChassis.add(star);

      // Sweptback Headlight Pods
      [-0.78, 0.78].forEach(hx => {
        const podGeo = new THREE.BoxGeometry(0.38, 0.16, 0.08);
        const pod = new THREE.Mesh(podGeo, mats.headlampGlowMat);
        pod.position.set(hx, noseY + 0.14, noseZ);
        pod.rotation.y = hx > 0 ? -0.2 : 0.2;
        this.visualChassis.add(pod);
        this.headlights.push(pod);
      });
    } else if (isSUV) {
      // Cadillac Escalade Massive Upright Chrome Mesh Grille
      const suvGrilleGeo = new THREE.BoxGeometry(1.45, 0.52, 0.1);
      const suvGrille = new THREE.Mesh(suvGrilleGeo, mats.chromeMat);
      suvGrille.position.set(0, noseY + 0.2, noseZ + 0.02);
      this.visualChassis.add(suvGrille);

      // Bi-Xenon Headlamp Stacks
      [-0.85, 0.85].forEach(hx => {
        const lampGeo = new THREE.BoxGeometry(0.24, 0.44, 0.08);
        const lamp = new THREE.Mesh(lampGeo, mats.headlampGlowMat);
        lamp.position.set(hx, noseY + 0.22, noseZ);
        this.visualChassis.add(lamp);
        this.headlights.push(lamp);
      });
    } else if (isSuper) {
      // Carrera GT Teardrop Pods with Dual Vertical Projectors
      [-0.68, 0.68].forEach(hx => {
        const podGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.45, 16);
        podGeo.rotateX(Math.PI * 0.42);
        const pod = new THREE.Mesh(podGeo, mats.headlampLensMat);
        pod.position.set(hx, noseY + 0.2, noseZ - 0.25);
        this.visualChassis.add(pod);

        const bulbGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const bulb = new THREE.Mesh(bulbGeo, mats.headlampGlowMat);
        bulb.position.set(hx, noseY + 0.16, noseZ - 0.12);
        this.visualChassis.add(bulb);
        this.headlights.push(bulb);
      });
    } else {
      // Pop-up Headlight Lids (F40 / RX-7)
      [-0.65, 0.65].forEach(hx => {
        const lidGeo = new THREE.BoxGeometry(0.38, 0.05, 0.38);
        const lid = new THREE.Mesh(lidGeo, mats.paintMat);
        lid.position.set(hx, noseY + 0.22, noseZ - 0.4);
        lid.rotation.x = 0.12;
        this.visualChassis.add(lid);

        // Lower Driving Lamps
        const lampGeo = new THREE.BoxGeometry(0.32, 0.1, 0.06);
        const lamp = new THREE.Mesh(lampGeo, mats.headlampGlowMat);
        lamp.position.set(hx, noseY + 0.02, noseZ);
        this.visualChassis.add(lamp);
        this.headlights.push(lamp);
      });
    }

    // Rally Quad Aux Spotlights
    if (isRally) {
      [-0.45, -0.15, 0.15, 0.45].forEach(rx => {
        const podGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
        podGeo.rotateX(Math.PI * 0.5);
        const pod = new THREE.Mesh(podGeo, mats.chromeMat);
        pod.position.set(rx, noseY + 0.16, noseZ + 0.12);
        this.visualChassis.add(pod);

        const lensGeo = new THREE.CircleGeometry(0.1, 16);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0xFFEA00 });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.set(rx, noseY + 0.16, noseZ + 0.17);
        this.visualChassis.add(lens);
        this.headlights.push(lens);
      });
    }
  }

  buildRearFascia(archetype, mats) {
    const isSUV = archetype === 'LUXURY_SUV';
    const isClassic = archetype === 'CLASSIC_MUSCLE';
    const isSuper = archetype === 'EXOTIC_SUPERCAR';
    const isWedge = archetype === 'WEDGE_SUPERCAR';
    const isM3 = archetype === 'GERMAN_TOURING';
    const isAMG = archetype === 'EXECUTIVE_GT';

    const tailZ = isSUV ? -2.42 : -2.38;
    const tailY = isSUV ? 0.38 : (isSuper ? 0.15 : 0.24);

    // Rear Bumper
    const rearBumperGeo = new THREE.BoxGeometry(2.1, 0.38, 0.38);
    const rearBumper = new THREE.Mesh(rearBumperGeo, isClassic ? mats.chromeMat : mats.paintMat);
    rearBumper.position.set(0, tailY - 0.08, tailZ + 0.12);
    this.visualChassis.add(rearBumper);

    if (archetype === 'MODERN_MUSCLE') {
      // Dodge Challenger Continuous Racetrack LED Taillight Bar
      const lightbarGeo = new THREE.BoxGeometry(1.78, 0.16, 0.06);
      const lightbar = new THREE.Mesh(lightbarGeo, mats.taillightGlowMat);
      lightbar.position.set(0, tailY + 0.15, tailZ);
      this.visualChassis.add(lightbar);
      this.brakeLights.push(lightbar);
    } else if (isWedge) {
      // Ferrari F40 Iconic Quad Round Taillights
      [-0.68, -0.42, 0.42, 0.68].forEach(tx => {
        const ringGeo = new THREE.TorusGeometry(0.09, 0.02, 8, 20);
        const ring = new THREE.Mesh(ringGeo, mats.taillightGlowMat);
        ring.position.set(tx, tailY + 0.14, tailZ);
        this.visualChassis.add(ring);
        this.brakeLights.push(ring);
      });
    } else if (isSUV) {
      // Escalade Full-Height Vertical LED Light Blades
      [-0.92, 0.92].forEach(tx => {
        const bladeGeo = new THREE.BoxGeometry(0.12, 0.85, 0.06);
        const blade = new THREE.Mesh(bladeGeo, mats.taillightGlowMat);
        blade.position.set(tx, tailY + 0.35, tailZ);
        this.visualChassis.add(blade);
        this.brakeLights.push(blade);
      });
    } else {
      // Horizontal Split Taillight Clusters (BMW, Mercedes, RX-7, Classic)
      [-0.72, 0.72].forEach(tx => {
        const clusterGeo = new THREE.BoxGeometry(0.55, 0.18, 0.06);
        const cluster = new THREE.Mesh(clusterGeo, mats.taillightGlowMat);
        cluster.position.set(tx, tailY + 0.15, tailZ);
        this.visualChassis.add(cluster);
        this.brakeLights.push(cluster);
      });
    }

    // License Plate "RANJEET" with frame and LED illumination
    if (typeof document !== 'undefined') {
      const lpCanvas = document.createElement('canvas');
      lpCanvas.width = 256;
      lpCanvas.height = 64;
      const lpCtx = lpCanvas.getContext('2d');
      lpCtx.fillStyle = '#060A14';
      lpCtx.fillRect(0, 0, 256, 64);
      lpCtx.strokeStyle = '#F0F4F8';
      lpCtx.lineWidth = 4;
      lpCtx.strokeRect(4, 4, 248, 56);
      lpCtx.fillStyle = '#FFB800';
      lpCtx.fillRect(14, 14, 18, 18);
      lpCtx.fillStyle = '#FFFFFF';
      lpCtx.font = 'bold 32px monospace';
      lpCtx.textAlign = 'center';
      lpCtx.textBaseline = 'middle';
      lpCtx.fillText('RANJEET', 140, 32);

      const lpTex = new THREE.CanvasTexture(lpCanvas);
      const lpMat = new THREE.MeshBasicMaterial({ map: lpTex });
      const lpMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.24), lpMat);
      lpMesh.position.set(0, tailY - 0.06, tailZ - 0.02);
      lpMesh.rotation.y = Math.PI;
      this.visualChassis.add(lpMesh);
    }
  }

  buildMirrorsAndDetails(archetype, mats) {
    const isSUV = archetype === 'LUXURY_SUV';
    const mirrorY = isSUV ? 0.65 : 0.38;
    const mirrorZ = 0.65;
    const mirrorX = 1.08;

    [-mirrorX, mirrorX].forEach(mx => {
      const mirrorGroup = new THREE.Group();
      mirrorGroup.position.set(mx, mirrorY, mirrorZ);

      // Stalk
      const stalkGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12);
      stalkGeo.rotateZ(mx > 0 ? -0.4 : 0.4);
      const stalk = new THREE.Mesh(stalkGeo, mats.darkTrimMat);
      mirrorGroup.add(stalk);

      // Housing
      const houseGeo = new THREE.BoxGeometry(0.18, 0.12, 0.26);
      const house = new THREE.Mesh(houseGeo, mats.paintMat);
      house.position.set(mx > 0 ? 0.06 : -0.06, 0.04, 0);
      mirrorGroup.add(house);

      // Reflective Chrome Mirror Glass Face
      const faceGeo = new THREE.PlaneGeometry(0.16, 0.1);
      const face = new THREE.Mesh(faceGeo, mats.chromeMat);
      face.position.set(mx > 0 ? 0.06 : -0.06, 0.04, -0.135);
      face.rotation.y = Math.PI;
      mirrorGroup.add(face);

      this.visualChassis.add(mirrorGroup);
    });

    // Recessed Door Handles
    [-1.04, 1.04].forEach(dx => {
      [-0.1, 0.45].forEach(dz => {
        const handleGeo = new THREE.BoxGeometry(0.04, 0.04, 0.18);
        const handle = new THREE.Mesh(handleGeo, mats.darkTrimMat);
        handle.position.set(dx, isSUV ? 0.45 : 0.22, dz);
        this.visualChassis.add(handle);
      });
    });
  }

  buildRealisticWheels(archetype, mats) {
    this.wheels = [];
    const isSUV = archetype === 'LUXURY_SUV';
    const wheelCenterY = isSUV ? -0.06 : -0.16;
    const wheelPositions = [
      { x: -1.06, y: wheelCenterY, z: 1.45, isFront: true },
      { x: 1.06, y: wheelCenterY, z: 1.45, isFront: true },
      { x: -1.10, y: wheelCenterY, z: -1.45, isFront: false },
      { x: 1.10, y: wheelCenterY, z: -1.45, isFront: false }
    ];

    const tireRadius = isSUV ? 0.48 : 0.42;
    const rimRadius = isSUV ? 0.36 : 0.32;
    const frontWidth = isSUV ? 0.34 : 0.32;
    const rearWidth = isSUV ? 0.38 : 0.36; // Staggered aggressive rear fitment

    wheelPositions.forEach(pos => {
      const isRear = !pos.isFront;
      const width = isRear ? rearWidth : frontWidth;

      const wheelMount = new THREE.Group();
      wheelMount.position.set(pos.x, pos.y, pos.z);

      const rotatingPart = new THREE.Group();

      // 1. Rubber Tire with Rounded Sidewall Bevel
      const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, width, 24);
      tireGeo.rotateZ(Math.PI * 0.5);
      const tire = new THREE.Mesh(tireGeo, mats.tireMat);
      tire.castShadow = true;
      rotatingPart.add(tire);

      // 2. Metallic Alloy Outer Rim Barrel
      const rimBarrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width + 0.01, 20, 1, true);
      rimBarrelGeo.rotateZ(Math.PI * 0.5);
      const rimBarrel = new THREE.Mesh(rimBarrelGeo, mats.chromeMat);
      rotatingPart.add(rimBarrel);

      // 3. 3D Alloy Spokes (5-Spoke Star / Mesh)
      const spokeCount = archetype === 'CLASSIC_MUSCLE' ? 5 : (archetype === 'GERMAN_TOURING' ? 10 : 6);
      for (let s = 0; s < spokeCount; s++) {
        const angle = (Math.PI * 2 / spokeCount) * s;
        const spokeGeo = new THREE.BoxGeometry(0.04, rimRadius * 0.9, 0.035);
        const spoke = new THREE.Mesh(spokeGeo, mats.chromeMat);
        spoke.position.set(pos.x > 0 ? (width * 0.48) : -(width * 0.48), Math.sin(angle) * (rimRadius * 0.45), Math.cos(angle) * (rimRadius * 0.45));
        spoke.rotation.x = angle;
        rotatingPart.add(spoke);
      }

      // Center Hub Cap with Hex Nut
      const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 12);
      hubGeo.rotateZ(Math.PI * 0.5);
      const hub = new THREE.Mesh(hubGeo, mats.chromeMat);
      hub.position.x = pos.x > 0 ? (width * 0.5) : -(width * 0.5);
      rotatingPart.add(hub);

      // 4. Large Drilled Stainless Steel Brake Disc Rotor (Mounted inside wheel)
      const rotorGeo = new THREE.CylinderGeometry(rimRadius * 0.75, rimRadius * 0.75, 0.03, 20);
      rotorGeo.rotateZ(Math.PI * 0.5);
      const rotor = new THREE.Mesh(rotorGeo, mats.rotorMat);
      rotor.position.x = pos.x > 0 ? 0.03 : -0.03;
      rotatingPart.add(rotor);

      // 5. Painted High-Performance Brake Caliper (Brembo style, non-rotating)
      const caliperGeo = new THREE.BoxGeometry(0.07, 0.18, 0.12);
      const caliper = new THREE.Mesh(caliperGeo, mats.caliperMat);
      caliper.position.set(pos.x > 0 ? 0.06 : -0.06, rimRadius * 0.45, 0);
      wheelMount.add(caliper);

      wheelMount.add(rotatingPart);
      this.visualChassis.add(wheelMount);

      this.wheels.push({
        mount: wheelMount,
        rotor: rotatingPart,
        isFront: pos.isFront,
        isLeft: pos.x < 0,
        baseX: pos.x,
        baseY: pos.y,
        baseZ: pos.z
      });
    });
  }

  buildExhaustPipes(archetype, mats) {
    const isWedge = archetype === 'WEDGE_SUPERCAR';
    const isAMG = archetype === 'EXECUTIVE_GT';
    const tailZ = -2.46;
    const tailY = -0.15;

    let pipePositions = [-0.5, 0.5];
    if (isWedge) {
      pipePositions = [-0.18, 0.0, 0.18]; // Triple Central F40 Titanium Pipes
    } else if (isAMG) {
      pipePositions = [-0.68, -0.52, 0.52, 0.68]; // Quad AMG Oval Tips
    }

    const tipGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.28, 16, 1, true);
    tipGeo.rotateX(Math.PI * 0.5);

    // Inner dark titanium bore for authentic depth
    const innerGeo = new THREE.CircleGeometry(0.078, 16);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x06080C });

    // Compact energetic nitro plasma cone
    const flameGeo = new THREE.ConeGeometry(0.075, 0.7, 12);
    flameGeo.rotateX(-Math.PI * 0.5);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    pipePositions.forEach(px => {
      // Hollow chrome / titanium exhaust tip
      const tip = new THREE.Mesh(tipGeo, mats.chromeMat);
      tip.position.set(px, tailY, tailZ);
      this.visualChassis.add(tip);

      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.set(px, tailY, tailZ + 0.05);
      this.visualChassis.add(inner);

      // Nitro / Boost Plasma Exhaust Flame (position flush at tailpipe exit)
      const flame = new THREE.Mesh(flameGeo, flameMat.clone());
      flame.position.set(px, tailY, tailZ - 0.42);
      flame.visible = false;
      this.visualChassis.add(flame);
      this.exhaustPlumes.push(flame);
    });
  }

  buildEngineAndRepulsors(archetype, mats) {
    // Retain internal propulsion coils, energy core, and underbody repulsor pads
    // to preserve 100% compatibility with kinetic updates, game loops, and physics tests
    const coreGeo = new THREE.SphereGeometry(0.35, 12, 12);
    coreGeo.scale(0.7, 0.4, 1.2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      transparent: true,
      opacity: 0.85
    });
    this.energyCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.energyCoreMesh.position.set(0, 0.18, -0.8);
    this.visualChassis.add(this.energyCoreMesh);

    // 4 Underbody Ground-Effect Emitter Disks
    const padPositions = [
      { x: -0.9, z: 1.3 },
      { x: 0.9, z: 1.3 },
      { x: -0.9, z: -1.3 },
      { x: 0.9, z: -1.3 }
    ];
    const padGeo = new THREE.CircleGeometry(0.22, 16);
    padGeo.rotateX(-Math.PI * 0.5);
    const padMat = new THREE.MeshBasicMaterial({
      color: this.underglowColor,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    padPositions.forEach(p => {
      const pad = new THREE.Mesh(padGeo, padMat.clone());
      pad.position.set(p.x, -0.23, p.z);
      this.visualChassis.add(pad);
      this.repulsorPads.push(pad);
    });

    // 4 Propulsion vectoring modules
    const coilGeo = new THREE.TorusGeometry(0.3, 0.04, 8, 16);
    coilGeo.rotateX(Math.PI * 0.5);
    padPositions.forEach(pos => {
      const mod = new THREE.Group();
      mod.position.set(pos.x, -0.15, pos.z);
      const coil = new THREE.Mesh(coilGeo, coreMat.clone());
      mod.add(coil);
      this.visualChassis.add(mod);
      this.propulsionModules.push(mod);
      this.propulsionCoils.push(coil);
    });

    // Steering elevons and active airbrake
    const elevonGeo = new THREE.BoxGeometry(0.45, 0.03, 0.35);
    this.leftElevon = new THREE.Mesh(elevonGeo, mats.carbonMat);
    this.leftElevon.position.set(-0.85, -0.12, -2.2);
    this.visualChassis.add(this.leftElevon);

    this.rightElevon = new THREE.Mesh(elevonGeo, mats.carbonMat);
    this.rightElevon.position.set(0.85, -0.12, -2.2);
    this.visualChassis.add(this.rightElevon);

    const brakeFlapGeo = new THREE.BoxGeometry(0.9, 0.035, 0.3);
    this.airBrakeFlap = new THREE.Mesh(brakeFlapGeo, mats.carbonMat);
    this.airBrakeFlap.position.set(0, 0.38, -2.1);
    this.visualChassis.add(this.airBrakeFlap);
  }

  updateAeroKit(kitType = 'aero') {
    this.currentKit = kitType;
    while (this.aeroKitGroup.children.length > 0) {
      this.aeroKitGroup.remove(this.aeroKitGroup.children[0]);
    }

    const kitMat = new THREE.MeshStandardMaterial({
      color: 0x090c10,
      metalness: 0.95,
      roughness: 0.2
    });

    if (kitType === 'aero') {
      // Carbon Front Splitter Canards
      [-1.15, 1.15].forEach(cx => {
        const canardGeo = new THREE.BoxGeometry(0.42, 0.04, 0.45);
        const canard = new THREE.Mesh(canardGeo, kitMat);
        canard.position.set(cx, -0.06, 2.3);
        canard.rotation.z = cx > 0 ? -0.15 : 0.15;
        this.aeroKitGroup.add(canard);
      });
    } else if (kitType === 'drag') {
      // Rear Diffuser Underbody Extension
      const diffGeo = new THREE.BoxGeometry(2.1, 0.08, 0.7);
      const diff = new THREE.Mesh(diffGeo, kitMat);
      diff.position.set(0, -0.24, -2.6);
      this.aeroKitGroup.add(diff);
    } else if (kitType === 'vortex') {
      // Vortex Generator Roof Fins
      [-0.4, -0.15, 0.15, 0.4].forEach(vx => {
        const finGeo = new THREE.BoxGeometry(0.025, 0.08, 0.2);
        const fin = new THREE.Mesh(finGeo, kitMat);
        fin.position.set(vx, 0.68, -1.05);
        this.aeroKitGroup.add(fin);
      });
    }
  }

  updateSpoiler(spoilerType = 'stock') {
    this.currentSpoiler = spoilerType;
    while (this.spoilerGroup.children.length > 0) {
      this.spoilerGroup.remove(this.spoilerGroup.children[0]);
    }

    const archetype = this.spec.archetype || 'MODERN_MUSCLE';

    if (spoilerType === 'wing' || spoilerType === 'vortex' || archetype === 'EXOTIC_SUPERCAR' || archetype === 'WEDGE_SUPERCAR' || archetype === 'RALLY_CROSS') {
      const isTall = spoilerType === 'vortex' || archetype === 'WEDGE_SUPERCAR' || archetype === 'RALLY_CROSS';
      const wingWidth = archetype === 'WEDGE_SUPERCAR' ? 2.15 : 1.95;
      const wingHeight = isTall ? 0.75 : 0.52;
      const wingZ = -2.25;

      // Carbon Wing Blade
      const wingGeo = new THREE.BoxGeometry(wingWidth, 0.05, 0.38);
      const wingMat = new THREE.MeshPhysicalMaterial({
        color: this.primaryColor,
        metalness: 0.85,
        roughness: 0.16,
        clearcoat: 1.0
      });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(0, wingHeight, wingZ);
      wing.rotation.x = -0.06;
      this.spoilerGroup.add(wing);

      // Twin Aluminum / Carbon Stanchions
      [-0.6, 0.6].forEach(sx => {
        const strutGeo = new THREE.BoxGeometry(0.04, isTall ? 0.48 : 0.28, 0.22);
        const strutMat = new THREE.MeshStandardMaterial({ color: 0x11151c, metalness: 0.95 });
        const strut = new THREE.Mesh(strutGeo, strutMat);
        strut.position.set(sx, wingHeight - (isTall ? 0.22 : 0.14), wingZ);
        strut.rotation.x = -0.15;
        this.spoilerGroup.add(strut);
      });

      // Endplates
      [-wingWidth * 0.5, wingWidth * 0.5].forEach(ex => {
        const plateGeo = new THREE.BoxGeometry(0.03, 0.22, 0.42);
        const plate = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({ color: 0x090c10 }));
        plate.position.set(ex, wingHeight, wingZ);
        this.spoilerGroup.add(plate);
      });
    } else {
      // Stock Ducktail / Lip Spoiler on Trunk Decklid
      const duckGeo = new THREE.BoxGeometry(1.72, 0.06, 0.18);
      const duckMat = new THREE.MeshStandardMaterial({ color: 0x090c10, metalness: 0.8 });
      const duck = new THREE.Mesh(duckGeo, duckMat);
      duck.position.set(0, 0.42, -2.18);
      duck.rotation.x = -0.25;
      this.spoilerGroup.add(duck);
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

      ctx.fillStyle = '#' + this.primaryColor.getHexString();
      ctx.fillRect(0, 0, 512, 512);

      if (decalId === 'stripes') {
        // Classic Dual Racing Stripes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(215, 0, 36, 512);
        ctx.fillRect(261, 0, 36, 512);
        ctx.fillStyle = '#FF0055';
        ctx.fillRect(207, 0, 8, 512);
        ctx.fillRect(297, 0, 8, 512);
      } else if (decalId === 'apex_racing') {
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, 452, 452);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 76px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('01 APEX', 256, 220);
        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('NEO-SHINJUKU', 256, 280);
      } else if (decalId === 'syndicate') {
        ctx.fillStyle = '#FF1E28';
        ctx.font = 'bold 120px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('疾風', 256, 240);
        ctx.fillStyle = '#FFB800';
        ctx.font = 'bold 32px monospace';
        ctx.fillText('SYNDICATE R/T', 256, 310);
      }

      const tex = new THREE.CanvasTexture(canvas);
      this.cowlMesh.material.map = tex;
      this.cowlMesh.material.needsUpdate = true;
    } catch (e) {
      // Fallback in headless environments
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
          if (mesh.material && mesh.material.color && mesh.geometry && mesh.geometry.type === 'TorusGeometry') {
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

  updateKineticState(delta, steerInput, throttleInput, brakeInput, driftActive, boostActive, speedKmh, aerial = null, telemetry = null) {
    const time = performance.now() * 0.001;
    const speedRatio = Math.min(speedKmh / 420.0, 1.2);

    // 1. Dynamic Gear Tracking & Shift Recoil
    const currentGear = speedKmh < 30.0 ? 1 : speedKmh < 85.0 ? 2 : speedKmh < 165.0 ? 3 : speedKmh < 245.0 ? 4 : speedKmh < 325.0 ? 5 : speedKmh < 395.0 ? 6 : 7;
    if (this.lastGear !== undefined && this.lastGear !== currentGear && speedKmh > 25.0) {
      const isUpshift = currentGear > this.lastGear;
      this.gearShiftKick = isUpshift ? 1.2 : -0.7;
      this.gearShiftPopTimer = 0.16; // 160ms exhaust flame pop
      if (typeof window !== 'undefined' && window.game && window.game.sound && window.game.sound.playGearShiftSound) {
        window.game.sound.playGearShiftSound(currentGear);
      }
    }
    this.lastGear = currentGear;

    if (this.gearShiftKick) {
      this.gearShiftKick = THREE.MathUtils.damp(this.gearShiftKick, 0.0, 14.0, delta);
    } else {
      this.gearShiftKick = 0.0;
    }

    // 2. Dynamic Automotive Suspension Physics (Squat, Dive, Roll, Yaw)
    const shiftPitch = this.gearShiftKick * -0.07;
    const targetPitch = (brakeInput > 0 ? 0.092 * Math.min(1.0, brakeInput) : 0) + (throttleInput > 0 ? -0.062 * Math.min(1.0, throttleInput) : 0) + shiftPitch;
    const targetRoll = -steerInput * 0.28 * Math.min(1.0, speedKmh / 45.0);
    const targetYaw = driftActive ? steerInput * 0.44 : steerInput * 0.14;

    // 2nd-Order Spring-Damper Suspension Equation for Pitch & Roll
    if (this.pitchVel === undefined) this.pitchVel = 0;
    if (this.rollVel === undefined) this.rollVel = 0;

    const pitchSpring = 140.0;
    const pitchDamp = 20.0;
    const pitchAcc = (targetPitch - this.pitchAngle) * pitchSpring - this.pitchVel * pitchDamp;
    this.pitchVel += pitchAcc * delta;
    this.pitchAngle += this.pitchVel * delta;

    const rollSpring = 130.0;
    const rollDamp = 19.0;
    const rollAcc = (targetRoll - this.rollAngle) * rollSpring - this.rollVel * rollDamp;
    this.rollVel += rollAcc * delta;
    this.rollAngle += this.rollVel * delta;

    this.steerAngle = THREE.MathUtils.damp(this.steerAngle, targetYaw, 15.0, delta);

    // Stunt Rotations in aerial maneuvers
    if (aerial && aerial.inAir) {
      this.barrelRollAngle = aerial.barrelRollAngle || 0;
      this.spin360Angle = aerial.spin360Angle || 0;
    } else {
      this.barrelRollAngle = THREE.MathUtils.damp(this.barrelRollAngle, 0, 12.0, delta);
      this.spin360Angle = THREE.MathUtils.damp(this.spin360Angle, 0, 12.0, delta);
    }

    // 3. Smooth Aerodynamic Ground Effect & High-Frequency Engine Shudder
    this.hoverPhase = ((this.hoverPhase || 0) + delta * (speedKmh > 20.0 ? 5.5 : 2.5)) % (Math.PI * 2);
    const isStationary = Math.abs(speedKmh) < 6.0;
    let chassisY = 0;
    if (isStationary) {
      chassisY = Math.sin(time * 16.0) * 0.0035; // Engine idle mechanical pulse
    } else {
      const hoverBob = Math.sin(this.hoverPhase) * 0.012 * Math.max(0.15, 1.0 - speedRatio * 0.6);
      const aeroDownforce = -speedRatio * 0.048; // Aerodynamic venturi downforce suction
      const roadTextureMicro = Math.sin(time * 42.0) * (0.0038 * speedRatio);
      chassisY = hoverBob + aeroDownforce + roadTextureMicro;
    }

    this.visualChassis.position.y = THREE.MathUtils.damp(this.visualChassis.position.y, chassisY, 16.0, delta);
    this.visualChassis.rotation.set(
      this.pitchAngle,
      this.steerAngle + this.spin360Angle,
      this.rollAngle + this.barrelRollAngle
    );

    // 4. Realistic 4-Wheel Rolling, Dynamic Steering Camber & 4-Corner Suspension Travel
    if (this.wheels && this.wheels.length > 0) {
      const wheelRotSpeed = (speedKmh / 3.6) * delta * 2.75;
      const frontCamber = -steerInput * 0.085; // Dynamic racing negative camber on front wheels

      const curbRumble = (telemetry && telemetry.curbRumble) ? telemetry.curbRumble : 0;
      const roadBump = (telemetry && telemetry.roadBumpDisp) ? telemetry.roadBumpDisp : 0;

      this.wheels.forEach(w => {
        w.rotor.rotation.x += wheelRotSpeed;
        if (w.isFront) {
          // Ackermann dynamic steering angle: inner wheel turns slightly sharper
          const isLeftWheel = w.isLeft !== undefined ? w.isLeft : (w.mount.position.x < 0);
          const isInner = (steerInput > 0 && !isLeftWheel) || (steerInput < 0 && isLeftWheel);
          const ackermannFactor = isInner ? 1.08 : 0.94;
          w.mount.rotation.y = THREE.MathUtils.damp(w.mount.rotation.y, steerInput * 0.40 * ackermannFactor, 15.0, delta);
          w.mount.rotation.z = THREE.MathUtils.damp(w.mount.rotation.z, frontCamber, 14.0, delta);
        }

        // Dynamic 4-corner independent suspension travel
        // Front wheels dive under braking; rear wheels squat under throttle
        const pitchTravel = w.isFront
          ? (brakeInput > 0.05 ? -0.038 * brakeInput : 0.018 * throttleInput)
          : (throttleInput > 0.05 ? -0.042 * throttleInput : 0.024 * brakeInput);

        // Lateral roll travel: outside wheels compress into arches, inside wheels extend
        const isLeft = w.isLeft !== undefined ? w.isLeft : (w.mount.position.x < 0);
        const rollTravel = (isLeft ? -1 : 1) * (steerInput * 0.030 * Math.min(1.0, speedKmh / 45.0));

        // Curb rumble & asphalt micro-bump per corner
        const cornerBump = roadBump * 0.85 + (curbRumble > 0.05 ? Math.sin(time * 52.0 + (w.isFront ? 0 : 1.5)) * 0.016 * curbRumble : 0.0);

        const baseY = w.baseY !== undefined ? w.baseY : (this.spec.archetype === 'LUXURY_SUV' ? -0.06 : -0.16);
        const targetSuspensionY = baseY + pitchTravel + rollTravel + cornerBump;
        w.mount.position.y = THREE.MathUtils.damp(w.mount.position.y, targetSuspensionY, 18.0, delta);
      });
    }

    // 4.5 Thermochromic Glowing Brake Rotors (Brake discs glow fiery orange under heavy braking)
    if (brakeInput > 0.05 && speedKmh > 40.0) {
      this.rotorHeat = Math.min(1.0, (this.rotorHeat || 0) + delta * brakeInput * (speedKmh / 180.0) * 2.2);
    } else {
      // Aerodynamic cooling rate scales with speed
      const coolingRate = 0.45 + (speedKmh / 400.0) * 0.75;
      this.rotorHeat = Math.max(0.0, (this.rotorHeat || 0) - delta * coolingRate);
    }

    if (this.materials && this.materials.rotorMat) {
      if (this.rotorHeat > 0.02) {
        this.materials.rotorMat.emissive.setHex(0xFF4400);
        this.materials.rotorMat.emissiveIntensity = this.rotorHeat * 2.0;
      } else {
        this.materials.rotorMat.emissiveIntensity = 0.0;
      }
    }

    // 5. Active Dynamic Rear GT Wing, DRS & Airbrakes
    if (this.spoilerGroup) {
      const aeroLift = speedKmh > 110.0 ? Math.min(0.18, (speedKmh - 110.0) / 250.0 * 0.18) : 0.0;
      // Airbrake mode: tilts 38° forward under heavy braking; DRS mode: flattens under boost
      const brakeTilt = brakeInput > 0.10 ? 0.42 : (boostActive ? -0.08 : 0.0);
      this.spoilerGroup.position.y = THREE.MathUtils.damp(this.spoilerGroup.position.y, aeroLift, 10.0, delta);
      this.spoilerGroup.rotation.x = THREE.MathUtils.damp(this.spoilerGroup.rotation.x, brakeTilt, 16.0, delta);
    }

    // 6. Ceramic Exhaust Tailpipe Flames with Gear Shift Backfire Pops
    if (this.gearShiftPopTimer > 0) {
      this.gearShiftPopTimer -= delta;
    }
    const isGearPopping = this.gearShiftPopTimer > 0;

    this.exhaustPlumes.forEach(flame => {
      const boostScale = boostActive ? 1.75 : (isGearPopping ? 1.45 : (throttleInput > 0.95 && Math.random() < 0.28 ? 0.9 : 0.0));
      const flicker = 0.85 + Math.random() * 0.3;
      flame.scale.set(boostScale * flicker, boostScale * flicker, boostScale * flicker * (boostActive ? 2.2 : 1.35));
      flame.visible = boostActive || isGearPopping || (throttleInput > 0.95 && Math.random() < 0.28);
    });

    // 7. Responsive Brake Lights
    this.brakeLights.forEach(light => {
      if (light.material) {
        light.material.color.setHex(brakeInput > 0.1 || driftActive ? 0xFF0033 : 0x550008);
      }
    });

    // 8. Kinetic Elevons & Airbrake Flaps
    if (this.leftElevon && this.rightElevon) {
      const elevonDeflection = steerInput * 0.36;
      this.leftElevon.rotation.x = -elevonDeflection;
      this.rightElevon.rotation.x = elevonDeflection;
    }
    if (this.airBrakeFlap) {
      const targetBrakeAngle = brakeInput > 0.1 ? -0.45 : 0.0;
      this.airBrakeFlap.rotation.x = THREE.MathUtils.damp(this.airBrakeFlap.rotation.x, targetBrakeAngle, 14.0, delta);
    }
  }

  updatePodiumCelebration(delta, rank = 1) {
    this.celebrationTime += delta;
    const t = this.celebrationTime;

    if (rank === 1) {
      // 1st Place Victory Animation: Rev engine, front suspension bounce, revving flames
      const bounce = Math.abs(Math.sin(t * 4.0)) * 0.25;
      const pitchLift = -0.12 + Math.sin(t * 4.0) * 0.05;
      this.visualChassis.position.y = bounce;
      this.visualChassis.rotation.set(pitchLift, Math.sin(t * 1.5) * 0.15, 0);

      this.exhaustPlumes.forEach(f => {
        f.visible = true;
        f.scale.set(1.5, 1.5, 1.8 + Math.sin(t * 12.0) * 0.4);
      });
    } else {
      this.visualChassis.position.y = Math.sin(t * 2.0) * 0.08;
      this.visualChassis.rotation.set(0, Math.sin(t * 0.8) * 0.04, 0);
    }
  }
}
