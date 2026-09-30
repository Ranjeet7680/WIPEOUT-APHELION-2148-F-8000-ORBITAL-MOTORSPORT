import * as THREE from 'three';
import { CraftRig } from './CraftRig.js';
import { ConformalHexShield } from './ConformalHexShield.js';
import { MachVaporCone } from './MachVaporCone.js';
import { ExhaustRibbonPipeline } from './ExhaustRibbonPipeline.js';

// ============================================================================
// WIPEOUT: APHELION - 3D HARD-SURFACE CRAFT TOPOLOGY & ASSET SPECIFICATIONS
// 12-Bone Procedural Rig, Carbon-Aramid Monocoque, Split Airbrakes,
// Thermal-Stress Repulsor Manifolds, Mach-1 Vapor Cone, and HDR Exhaust Ribbons
// ============================================================================

export const CRAFT_TEAMS = {
  feisar: {
    id: 'feisar',
    name: 'FEISAR FX-450',
    coalition: 'FEDERAL EUROPEAN INDUSTRIAL',
    silhouette: 'Needle-nosed tri-hull with twin articulated forward canards and electric-cyan striping',
    propulsion: 'Quad-stage micro-turbines with vectoring ventral lift rings',
    handlingSignature: 'Maximum Agility. Instantaneous turn-in, precise airbrake response, balanced acceleration, moderate top speed.',
    primaryColor: 0x00D4FF, // Electric Cyan
    secondaryColor: 0xFFD700, // European Gold
    accentColor: 0x141822, // Slate
    handling: 1.0,
    maxSpeedKmh: 1420,
    accel: 0.90,
    shield: 0.90,
    pilot: 'Teresa Silva',
    doctrine: 'Articulated Multi-Canard Agility'
  },
  qirex: {
    id: 'qirex',
    name: 'QIREX-VOSTOK D-92',
    coalition: 'EURASIAN INDUSTRIAL',
    silhouette: 'Heavy, brutalist slab-hull in matte graphite and hazard orange; exposed titanium heat exchangers',
    propulsion: 'Monolithic single-bore plasma ramjet',
    handlingSignature: 'Top-End Brute. High dry mass, slow corner rotation, unmatched top-end velocity and kinetic ramming resistance.',
    primaryColor: 0xFF5500, // Hazard Orange
    secondaryColor: 0x242830, // Matte Graphite
    accentColor: 0x111317, // Weathered Titanium
    handling: 0.78,
    maxSpeedKmh: 1590,
    accel: 0.82,
    shield: 1.0,
    pilot: 'Ivan Morozov',
    doctrine: 'Monolithic Titanium Battering Ram'
  },
  agSys: {
    id: 'agSys',
    name: 'AG SYSTEMS INTERCEPTOR',
    coalition: 'NEO-TOKYO AEROSPACE',
    silhouette: 'Swept-forward composite delta wing; razor-thin carbon-aramid profile',
    propulsion: 'Magnetohydrodynamic (MHD) induction drive with exposed copper field coils',
    handlingSignature: 'Acceleration Specialist. Fast recovery out of hairpins, highly sensitive pitch control, vulnerable kinetic shielding.',
    primaryColor: 0x00F0FF, // Neo-Tokyo Cyan
    secondaryColor: 0xEAEFF5, // Aerospace White
    accentColor: 0xB87333, // Exposed Copper
    handling: 0.94,
    maxSpeedKmh: 1470,
    accel: 1.0,
    shield: 0.82,
    pilot: 'Akira Thorne',
    doctrine: 'Pure Flight Kinetics'
  },
  auricom: {
    id: 'auricom',
    name: 'AURICOM VANGUARD',
    coalition: 'PAN-AMERICAN UNION',
    silhouette: 'Aerodynamic lifting-body fuselage with enclosed cockpit canopy and twin vertical stabilizers',
    propulsion: 'Dual clean-burning pulse-detonation ion thrusters',
    handlingSignature: 'Defensive Anchor. Robust harmonic shielding, predictable drift curve, stable platform under heavy cross-winds.',
    primaryColor: 0xFFB800, // Auricom Gold
    secondaryColor: 0xF0F4F8, // White Composite
    accentColor: 0x1A1C20, // Carbon
    handling: 0.88,
    maxSpeedKmh: 1500,
    accel: 0.92,
    shield: 0.96,
    pilot: 'Connor Brody',
    doctrine: 'Harmonic Shielding Integrity'
  },
  pirHana: {
    id: 'pirHana',
    name: 'PIR-HANA SCORPIO',
    coalition: 'PRIVATEER SYNDICATE',
    silhouette: 'Aggressive multi-segmented hull with predatory forward prongs and crimson emissive accents',
    propulsion: 'Experimental twin-stage dark-plasma injector',
    handlingSignature: 'Hyper-Velocity Glass Cannon. Uncapped boost speed, extreme oversteer tendency, high shield degradation under wall contact.',
    primaryColor: 0x121418, // Matte Obsidian
    secondaryColor: 0xFF1A1A, // Crimson Emissive
    accentColor: 0xFF3300, // Thermal Red
    handling: 0.82,
    maxSpeedKmh: 1650,
    accel: 0.96,
    shield: 0.76,
    pilot: 'Hector Ramos',
    doctrine: 'Terminal Horizon Hyper-Boost'
  }
};

export class CraftMesh {
  constructor(scene, teamConfig = CRAFT_TEAMS.agSys, isPlayer = true, lodLevel = 0) {
    this.scene = scene;
    this.team = teamConfig;
    this.isPlayer = isPlayer;
    this.lodLevel = lodLevel; // 0 = Player/Hero, 1 = Proximity Opponents, 2 = Mid, 3 = Silhouette

    // Root Group (Directly anchored to 120Hz physics simulation)
    this.group = new THREE.Group();

    // Kinetic Visual Articulation Group (Houses procedural 12-bone rig)
    this.visualGroup = new THREE.Group();
    this.group.add(this.visualGroup);

    // 12-Bone Procedural Rig
    this.rig = new CraftRig(this.visualGroup);

    // Ventral Repulsor Coils & Thermal Stress Attributes
    this.repulsorMeshes = [];
    this.repulsorThermalAttrs = [];
    this.thermalStressLevel = 0.0;

    // Gimbal Thrust Nozzles & Shock Diamonds
    this.thrustNozzleMeshes = [];
    this.shockDiamonds = [];
    this.exhaustNozzles = [];

    // Airbrake Glow Vents
    this.leftGlow = null;
    this.rightGlow = null;

    // VFX Systems
    this.shield = null;
    this.vaporCone = null;
    this.leftRibbon = null;
    this.rightRibbon = null;

    this.build();
    this.scene.add(this.group);
  }

  build() {
    this.buildCarbonChassis();
    this.buildCockpitAndPilot();
    this.buildDynamicCanards();
    this.buildRiggedAirbrakes();
    this.buildThermalRepulsorCoils();
    this.buildGimbalVectorNozzles();

    // 1. Conformal Voronoi Hex Shield
    this.shield = new ConformalHexShield(this.visualGroup);

    // 2. Mach-1 Prandtl-Glauert Condensation Vapor Cone
    this.vaporCone = new MachVaporCone(this.visualGroup);

    // 3. Continuous 128-Element GPU Exhaust Ribbons
    if (this.isPlayer) {
      this.leftRibbon = new ExhaustRibbonPipeline(this.scene, this.team.primaryColor, 0.55, 128);
      this.rightRibbon = new ExhaustRibbonPipeline(this.scene, this.team.primaryColor, 0.55, 128);
    }
  }

  // --------------------------------------------------------------------------
  // 1. CARBON-ARAMID MONOCOQUE CHASSIS & LIVERY
  // --------------------------------------------------------------------------
  buildCarbonChassis() {
    const root = this.rig.bones.rootHull;

    // Primary Lifting-Body Airframe: Swept delta wedge
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 3.4);       // Sharp nose needle
    bodyShape.lineTo(0.65, 1.9);     // Forward chine
    bodyShape.lineTo(1.85, -0.5);    // Mid-fuselage vortex flap
    bodyShape.lineTo(2.45, -2.4);    // Outer wingtip
    bodyShape.lineTo(1.35, -2.8);    // Engine bay intake
    bodyShape.lineTo(0.55, -2.8);    // Nacelle seam
    bodyShape.lineTo(0.0, -2.2);     // Center tail vent notch
    bodyShape.lineTo(-0.55, -2.8);
    bodyShape.lineTo(-1.35, -2.8);
    bodyShape.lineTo(-2.45, -2.4);
    bodyShape.lineTo(-1.85, -0.5);
    bodyShape.lineTo(-0.65, 1.9);
    bodyShape.closePath();

    const extrudeSettings = {
      depth: 0.62,
      bevelEnabled: true,
      bevelSegments: this.lodLevel === 0 ? 4 : 2,
      steps: 1,
      bevelSize: 0.22,
      bevelThickness: 0.16
    };

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeo.rotateX(Math.PI * 0.5);
    bodyGeo.center();

    // Carbon-Aramid PBR Material: Dual-lobe clearcoat model
    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: this.team.accentColor,
      roughness: 0.18,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95
    });

    const bodyMesh = new THREE.Mesh(bodyGeo, carbonMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    root.add(bodyMesh);

    // Upper Composite Livery Shell (Team Primary Color)
    const upperShape = new THREE.Shape();
    upperShape.moveTo(0, 2.9);
    upperShape.lineTo(0.48, 1.7);
    upperShape.lineTo(1.25, -0.3);
    upperShape.lineTo(1.6, -2.3);
    upperShape.lineTo(0.45, -2.3);
    upperShape.lineTo(0.0, -1.9);
    upperShape.lineTo(-0.45, -2.3);
    upperShape.lineTo(-1.6, -2.3);
    upperShape.lineTo(-1.25, -0.3);
    upperShape.lineTo(-0.48, 1.7);
    upperShape.closePath();

    const upperGeo = new THREE.ExtrudeGeometry(upperShape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.12,
      bevelThickness: 0.1
    });
    upperGeo.rotateX(Math.PI * 0.5);
    upperGeo.center();

    const liveryMat = new THREE.MeshPhysicalMaterial({
      color: this.team.primaryColor,
      roughness: 0.15,
      metalness: 0.65,
      clearcoat: 0.9,
      emissive: new THREE.Color(this.team.primaryColor),
      emissiveIntensity: 0.25
    });

    const upperMesh = new THREE.Mesh(upperGeo, liveryMat);
    upperMesh.position.y = 0.24;
    upperMesh.castShadow = true;
    root.add(upperMesh);

    // Twin Anhedral Dorsal Stabilizer Fins
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(1.1, 0);
    finShape.lineTo(0.5, 1.05);
    finShape.lineTo(0.0, 1.05);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.09, bevelEnabled: true, bevelSize: 0.02 });
    const finMat = new THREE.MeshStandardMaterial({
      color: this.team.secondaryColor,
      roughness: 0.22,
      metalness: 0.8
    });

    const leftFin = new THREE.Mesh(finGeo, finMat);
    leftFin.rotation.x = Math.PI * 0.5;
    leftFin.rotation.z = -0.24; // Inward cant
    leftFin.position.set(-1.15, 0.32, -1.75);
    root.add(leftFin);

    const rightFin = new THREE.Mesh(finGeo, finMat);
    rightFin.rotation.x = Math.PI * 0.5;
    rightFin.rotation.z = 0.24; // Inward cant
    rightFin.position.set(1.15, 0.32, -1.75);
    root.add(rightFin);

    // ------------------------------------------------------------------------
    // TEAM ARCHETYPE SILHOUETTES & PROPULSION GEOMETRY
    // ------------------------------------------------------------------------
    if (this.team.id === 'feisar') {
      // FEISAR FX-450: Needle-nosed tri-hull with twin articulated needle canards
      const needleGeo = new THREE.ConeGeometry(0.08, 1.6, 6);
      needleGeo.rotateX(Math.PI * 0.5);
      const needleMat = new THREE.MeshStandardMaterial({
        color: 0x00D4FF,
        emissive: new THREE.Color(0x00D4FF),
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.2
      });
      const needleL = new THREE.Mesh(needleGeo, needleMat);
      needleL.position.set(-0.55, 0.1, 3.2);
      const needleR = needleL.clone();
      needleR.position.x = 0.55;
      root.add(needleL);
      root.add(needleR);
    } else if (this.team.id === 'qirex') {
      // QIREX-VOSTOK D-92: Heavy brutalist slab-hull with titanium heat exchangers
      const slabGeo = new THREE.BoxGeometry(0.35, 0.55, 3.2);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x242830,
        metalness: 0.95,
        roughness: 0.4
      });
      const slabL = new THREE.Mesh(slabGeo, slabMat);
      slabL.position.set(-1.8, 0.05, -0.6);
      const slabR = slabL.clone();
      slabR.position.x = 1.8;
      root.add(slabL);
      root.add(slabR);

      // Monolithic single-bore plasma ramjet cowl
      const ramjetGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.4, 16);
      ramjetGeo.rotateX(Math.PI * 0.5);
      const ramjetMat = new THREE.MeshStandardMaterial({
        color: 0x111317,
        metalness: 0.9,
        roughness: 0.2,
        emissive: new THREE.Color(0xFF5500),
        emissiveIntensity: 0.4
      });
      const ramjetMesh = new THREE.Mesh(ramjetGeo, ramjetMat);
      ramjetMesh.position.set(0, 0.1, -2.4);
      root.add(ramjetMesh);
    } else if (this.team.id === 'agSys') {
      // AG SYSTEMS INTERCEPTOR: Swept-forward composite delta with copper induction coils
      const coilGeo = new THREE.TorusGeometry(0.28, 0.05, 8, 16);
      const coilMat = new THREE.MeshStandardMaterial({
        color: 0xB87333, // Exposed Copper
        metalness: 0.95,
        roughness: 0.15,
        emissive: new THREE.Color(0xB87333),
        emissiveIntensity: 0.5
      });
      for (let c = 0; c < 3; c++) {
        const coilL = new THREE.Mesh(coilGeo, coilMat);
        coilL.rotation.y = Math.PI * 0.5;
        coilL.position.set(-1.45, 0.1, -0.8 + c * 0.7);
        const coilR = coilL.clone();
        coilR.position.x = 1.45;
        root.add(coilL);
        root.add(coilR);
      }
    } else if (this.team.id === 'auricom') {
      // AURICOM VANGUARD: Twin vertical aerodynamic stabilizers
      const stabGeo = new THREE.BoxGeometry(0.08, 1.1, 1.3);
      const stabMat = new THREE.MeshStandardMaterial({
        color: 0xFFB800,
        metalness: 0.8,
        roughness: 0.25
      });
      const stabL = new THREE.Mesh(stabGeo, stabMat);
      stabL.position.set(-0.85, 0.7, -1.8);
      const stabR = stabL.clone();
      stabR.position.x = 0.85;
      root.add(stabL);
      root.add(stabR);
    } else if (this.team.id === 'pirHana') {
      // PIR-HANA SCORPIO: Predatory split forward mandibles/prongs
      const prongGeo = new THREE.ConeGeometry(0.12, 1.8, 4);
      prongGeo.rotateX(Math.PI * 0.5);
      const prongMat = new THREE.MeshStandardMaterial({
        color: 0x111116,
        metalness: 0.95,
        roughness: 0.2,
        emissive: new THREE.Color(0xFF1A1A),
        emissiveIntensity: 0.8
      });
      const prongL = new THREE.Mesh(prongGeo, prongMat);
      prongL.position.set(-0.95, 0.05, 3.4);
      prongL.rotation.z = -0.15;
      const prongR = prongL.clone();
      prongR.position.x = 0.95;
      prongR.rotation.z = 0.15;
      root.add(prongL);
      root.add(prongR);
    }
  }

  // --------------------------------------------------------------------------
  // 2. COCKPIT CANOPY & DIEGETIC PILOT HELMET
  // --------------------------------------------------------------------------
  buildCockpitAndPilot() {
    const root = this.rig.bones.rootHull;

    // Polarized Dielectric Canopy Glass
    const canopyGeo = new THREE.ConeGeometry(0.5, 2.3, 6);
    canopyGeo.rotateX(-Math.PI * 0.5);
    canopyGeo.scale(1.22, 0.52, 1.0);

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x050C16,
      roughness: 0.04,
      metalness: 0.98,
      transmission: 0.6,
      opacity: 0.92,
      transparent: true,
      reflectivity: 1.0,
      clearcoat: 1.0,
      emissive: new THREE.Color(0x00F0FF),
      emissiveIntensity: 0.12
    });

    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.54, 0.2);
    canopy.castShadow = true;
    root.add(canopy);

    // Diegetic Pilot Helmet mounted to pilotHeadLookAt bone
    const headNode = this.rig.bones.pilotHeadLookAt;
    const helmetGeo = new THREE.SphereGeometry(0.18, 12, 12);
    helmetGeo.scale(1.0, 1.15, 1.1);

    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0xEAEFF5,
      roughness: 0.2,
      metalness: 0.85
    });
    const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
    headNode.add(helmetMesh);

    // Pilot Visor
    const visorGeo = new THREE.BoxGeometry(0.22, 0.1, 0.16);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xFFB800,
      roughness: 0.05,
      metalness: 1.0,
      emissive: new THREE.Color(0xFF8800),
      emissiveIntensity: 0.3
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.02, 0.1);
    headNode.add(visorMesh);

    // Pilot Flight Suit Torso attached to pilotChest bone
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1A202C,
      roughness: 0.5,
      metalness: 0.2
    });
    const torsoGeo = new THREE.BoxGeometry(0.34, 0.28, 0.24);
    const torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
    this.rig.bones.pilotChest.add(torsoMesh);

    // Dual Fly-By-Wire Flight Sticks
    const stickGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.14, 8);
    const gripGeo = new THREE.BoxGeometry(0.038, 0.07, 0.045);
    gripGeo.translate(0, 0.07, 0.02);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.3, metalness: 0.8 });

    const stickL = new THREE.Mesh(stickGeo, stickMat);
    stickL.add(new THREE.Mesh(gripGeo, stickMat));
    this.rig.bones.flightStickL.add(stickL);

    const stickR = new THREE.Mesh(stickGeo, stickMat);
    stickR.add(new THREE.Mesh(gripGeo, stickMat));
    this.rig.bones.flightStickR.add(stickR);

    // Pilot Biomechanical 2-Bone Arms with Gloved Hands
    const armGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.14, 8);
    armGeo.rotateX(Math.PI * 0.5);
    const gloveGeo = new THREE.BoxGeometry(0.045, 0.045, 0.06);
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0xEAEFF5, roughness: 0.3, metalness: 0.6 });

    this.rig.bones.pilotShoulderL.add(new THREE.Mesh(armGeo, suitMat));
    this.rig.bones.pilotElbowL.add(new THREE.Mesh(armGeo.clone(), suitMat));
    this.rig.bones.pilotHandL.add(new THREE.Mesh(gloveGeo, gloveMat));

    this.rig.bones.pilotShoulderR.add(new THREE.Mesh(armGeo.clone(), suitMat));
    this.rig.bones.pilotElbowR.add(new THREE.Mesh(armGeo.clone(), suitMat));
    this.rig.bones.pilotHandR.add(new THREE.Mesh(gloveGeo.clone(), gloveMat));
  }

  // --------------------------------------------------------------------------
  // 2b. DYNAMIC MULTI-SLOTTED FRONT CANARDS
  // --------------------------------------------------------------------------
  buildDynamicCanards() {
    const canardMat = new THREE.MeshStandardMaterial({
      color: this.team.primaryColor,
      roughness: 0.18,
      metalness: 0.75
    });
    const canardGeo = new THREE.BoxGeometry(0.48, 0.025, 0.32);
    canardGeo.translate(0, 0, -0.16);

    const canardL = new THREE.Mesh(canardGeo, canardMat);
    this.rig.bones.canardLeft.add(canardL);

    const canardR = new THREE.Mesh(canardGeo.clone(), canardMat);
    this.rig.bones.canardRight.add(canardR);
  }

  // --------------------------------------------------------------------------
  // 3. DYNAMIC RIGGED AIRBRAKES (Main Flaps + Split-Flap Bleeders)
  // --------------------------------------------------------------------------
  buildRiggedAirbrakes() {
    const flapMat = new THREE.MeshStandardMaterial({
      color: 0x1A1F28,
      roughness: 0.25,
      metalness: 0.85
    });

    const mainFlapGeo = new THREE.BoxGeometry(0.72, 0.07, 0.88);
    mainFlapGeo.translate(0, 0.035, -0.44);

    const subFlapGeo = new THREE.BoxGeometry(0.5, 0.04, 0.45);
    subFlapGeo.translate(0, 0.02, -0.22);

    // Left Main Flap
    const leftMainMesh = new THREE.Mesh(mainFlapGeo, flapMat);
    this.rig.bones.airbrakeLMain.add(leftMainMesh);

    // Left Sub Flap (Bleeder)
    const leftSubMesh = new THREE.Mesh(subFlapGeo, flapMat);
    this.rig.bones.airbrakeLSub.add(leftSubMesh);

    // Left Plasma Bleed Vent Glow
    const glowGeo = new THREE.PlaneGeometry(0.68, 0.82);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFFB800,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });

    this.leftGlow = new THREE.Mesh(glowGeo, glowMat);
    this.leftGlow.rotation.x = Math.PI * 0.5;
    this.leftGlow.position.set(0, -0.02, -0.44);
    this.rig.bones.airbrakeLMain.add(this.leftGlow);

    // Right Main Flap
    const rightMainMesh = new THREE.Mesh(mainFlapGeo, flapMat);
    this.rig.bones.airbrakeRMain.add(rightMainMesh);

    // Right Sub Flap (Bleeder)
    const rightSubMesh = new THREE.Mesh(subFlapGeo, flapMat);
    this.rig.bones.airbrakeRSub.add(rightSubMesh);

    // Right Plasma Bleed Vent Glow
    this.rightGlow = new THREE.Mesh(glowGeo, glowMat.clone());
    this.rightGlow.rotation.x = Math.PI * 0.5;
    this.rightGlow.position.set(0, -0.02, -0.44);
    this.rig.bones.airbrakeRMain.add(this.rightGlow);
  }

  // --------------------------------------------------------------------------
  // 4. VENTRAL REPULSOR COILS & a_ThermalStress ATTRIBUTE
  // --------------------------------------------------------------------------
  buildThermalRepulsorCoils() {
    const coilNodes = [
      this.rig.bones.repulsorRingFL,
      this.rig.bones.repulsorRingFR,
      this.rig.bones.repulsorRingRL,
      this.rig.bones.repulsorRingRR
    ];

    coilNodes.forEach((node) => {
      const geo = new THREE.TorusGeometry(0.42, 0.1, 10, 20);
      geo.rotateX(Math.PI * 0.5);

      // Create a_ThermalStress vertex attribute [0.0 = cold titanium, 1.0 = incandescent]
      const count = geo.attributes.position.count;
      const thermalStressArray = new Float32Array(count);
      geo.setAttribute('a_ThermalStress', new THREE.BufferAttribute(thermalStressArray, 1));
      this.repulsorThermalAttrs.push(geo.attributes.a_ThermalStress);

      // Dynamic Material with Thermal Stress Emissive Mapping
      const mat = new THREE.MeshStandardMaterial({
        color: 0x2A2E33, // Cold titanium gray
        roughness: 0.28,
        metalness: 0.92,
        emissive: new THREE.Color(0x2A2E33),
        emissiveIntensity: 0.2
      });

      const mesh = new THREE.Mesh(geo, mat);
      node.add(mesh);
      this.repulsorMeshes.push(mesh);
    });
  }

  // --------------------------------------------------------------------------
  // 5. GIMBAL THRUST VECTOR NOZZLES (Spherical +-15 deg Joints)
  // --------------------------------------------------------------------------
  buildGimbalVectorNozzles() {
    const nozzleNodes = [
      this.rig.bones.gimbalNozzleLeft,
      this.rig.bones.gimbalNozzleRight
    ];

    const shieldPetalNodes = [
      this.rig.bones.heatShieldNozzleL,
      this.rig.bones.heatShieldNozzleR
    ];

    nozzleNodes.forEach((node, idx) => {
      // Spherical gimbal ball & outer nozzle collar
      const collarGeo = new THREE.CylinderGeometry(0.36, 0.42, 1.2, 16);
      collarGeo.rotateX(Math.PI * 0.5);

      const collarMat = new THREE.MeshStandardMaterial({
        color: 0x111620,
        roughness: 0.22,
        metalness: 0.95
      });
      const collar = new THREE.Mesh(collarGeo, collarMat);
      node.add(collar);
      this.thrustNozzleMeshes.push(collar);

      // Vectoring Expansion Heat Shield Petals
      const petalGeo = new THREE.CylinderGeometry(0.44, 0.48, 0.55, 12, 1, true);
      petalGeo.rotateX(Math.PI * 0.5);
      const petalMat = new THREE.MeshStandardMaterial({
        color: 0x1A2230,
        roughness: 0.35,
        metalness: 0.9
      });
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(0, 0, -0.3);
      shieldPetalNodes[idx].add(petal);

      // Inner exhaust flame cone
      const flameGeo = new THREE.ConeGeometry(0.36, 2.5, 16, 1, true);
      flameGeo.rotateX(-Math.PI * 0.5);
      flameGeo.translate(0, 0, -1.25);

      const flameMat = new THREE.MeshBasicMaterial({
        color: this.team.primaryColor,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      node.add(flameMesh);

      // Shock Diamond Octahedron
      const diamondGeo = new THREE.OctahedronGeometry(0.2, 0);
      const diamondMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.set(0, 0, -1.5);
      node.add(diamond);
      this.shockDiamonds.push(diamond);

      // Anchor point for ribbon trails
      const anchor = new THREE.Object3D();
      anchor.position.set(0, 0, -1.3);
      node.add(anchor);
      this.exhaustNozzles.push(anchor);
    });
  }

  // --------------------------------------------------------------------------
  // KINETIC ARTICULATION & FRAME UPDATE
  // --------------------------------------------------------------------------
  updateKineticState(
    delta,
    steeringInput,
    leftAirbrakeInput,
    rightAirbrakeInput,
    speedRatio,
    isBoosting,
    shieldHealth,
    trackApexTarget = null,
    gForce = { lateral: 0, longitudinal: 0, magnitude: 1.0 },
    pitchInput = 0.0
  ) {
    // 1. Update 16-Surface Procedural Kinetic Rig & Biomechanical Pilot IK
    this.rig.update(
      delta,
      steeringInput,
      pitchInput,
      leftAirbrakeInput,
      rightAirbrakeInput,
      speedRatio,
      trackApexTarget,
      gForce,
      isBoosting
    );

    // 2. Airbrake Glow Vents
    if (this.leftGlow && this.rightGlow) {
      this.leftGlow.material.opacity = leftAirbrakeInput * 0.88;
      this.rightGlow.material.opacity = rightAirbrakeInput * 0.88;
    }

    // 3. Dynamic Thermal Stress on Ventral Repulsor Coils
    // Sustained braking / maximum top speed heats coils to incandescent yellow-orange (#FFAA00)
    const targetThermal = THREE.MathUtils.clamp(
      (leftAirbrakeInput + rightAirbrakeInput) * 1.6 + (speedRatio * 0.55) + (isBoosting ? 0.9 : 0.0),
      0.0,
      1.0
    );
    this.thermalStressLevel = THREE.MathUtils.lerp(this.thermalStressLevel, targetThermal, delta * 3.5);

    // Titanium Gray (#2A2E33) -> Incandescent Orange-Yellow (#FFAA00)
    const coldColor = new THREE.Color(0x2A2E33);
    const hotColor = new THREE.Color(0xFFAA00);
    const currentColor = coldColor.clone().lerp(hotColor, this.thermalStressLevel);

    this.repulsorMeshes.forEach((mesh) => {
      mesh.material.emissive.copy(currentColor);
      // Up to 120 cd/m^2 emissive radiance equivalent
      mesh.material.emissiveIntensity = 0.2 + this.thermalStressLevel * 4.5;
    });

    this.repulsorThermalAttrs.forEach((attr) => {
      attr.array.fill(this.thermalStressLevel);
      attr.needsUpdate = true;
    });

    // 4. Acoustic Shock Diamonds
    const diamondPulse = Math.sin(Date.now() * 0.04) * 0.15 + 1.0;
    this.shockDiamonds.forEach((diamond) => {
      diamond.scale.set(diamondPulse, diamondPulse, diamondPulse * (1.0 + speedRatio * 0.5));
    });

    // 5. Update Conformal Hex Shield
    if (this.shield) {
      this.shield.update(delta, shieldHealth);
    }

    // 6. Update Mach-1 Vapor Cone
    if (this.vaporCone) {
      const speedKmh = speedRatio * this.team.maxSpeedKmh;
      this.vaporCone.update(delta, speedKmh, isBoosting, false);
    }

    // 7. Update Continuous 128-Element GPU Exhaust Ribbons
    if (this.isPlayer && this.leftRibbon && this.rightRibbon && this.exhaustNozzles.length === 2) {
      const pLeft = new THREE.Vector3();
      const pRight = new THREE.Vector3();
      this.exhaustNozzles[0].getWorldPosition(pLeft);
      this.exhaustNozzles[1].getWorldPosition(pRight);

      const thrustIntensity = Math.min(1.0, 0.4 + speedRatio * 0.6 + (isBoosting ? 0.5 : 0.0));
      this.leftRibbon.pushAnchor(pLeft, thrustIntensity);
      this.rightRibbon.pushAnchor(pRight, thrustIntensity);

      const cam = this.scene.userData.activeCamera || this.visualGroup.parent;
      if (cam) {
        this.leftRibbon.update(cam, delta);
        this.rightRibbon.update(cam, delta);
      }
    }
  }

  // Trigger shield impact fracture at specific world location
  triggerShieldImpact(hitPos, intensity = 1.0) {
    if (this.shield) {
      this.shield.triggerImpact(hitPos, intensity);
    }
  }
}
