import * as THREE from 'three';
import { isCoastlineTunnel } from '../track/CoastlineCircuit.js';

// ============================================================================
// SECTOR 02 // HYPERWAY — COASTLINE ENVIRONMENT
// Production 3D Environment matching AntiGravity Sector Design Plan (PDF Page 11-12, 30-31)
// 5-Layer Environment Stack:
// - Animated Ocean Water Plane with Sun Reflections & Shoreline Foam
// - Grand Suspension Bridge Towers & Tension Cables on Ocean Run
// - Towering Basalt Sea Cliffs flanking Cliffside Pass & Tunnel
// - White Sand Beach with Coastal Palm Trees along Beach Run
// - Offshore Floating Energy Platforms & Wind Turbines with Rotating Blades
// - Drifting Sea Mist Particle Field & Oceanic Celestial Sky
// ============================================================================

export class CoastlineWorld {
  constructor(scene, circuit) {
    this.scene = scene;
    this.circuit = circuit;

    this.root = new THREE.Group();
    this.scene.add(this.root);

    // Systems
    this.rotatingTurbines = [];
    this.marineDrones = [];
    this.seaMistParticles = null;
    this.seaMistPoints = null;
    this.oceanMesh = null;
    this.suspensionGroup = null;
    this.cliffsGroup = null;
    this.beachGroup = null;
    this.turbinesGroup = null;
    this.skyDome = null;

    this.buildOceanWaterPlane();
    this.buildSuspensionBridgeTowers();
    this.buildCoastalSeaCliffs();
    this.buildBeachAndPalms();
    this.buildOffshoreInfrastructure();
    this.buildMarinePatrolDrones();
    this.buildSeaMistParticles();
    this.buildOceanSkyDome();
  }

  buildOceanWaterPlane() {
    // Vast animated ocean plane beneath the track
    const oceanGeo = new THREE.PlaneGeometry(8000, 8000, 64, 64);
    oceanGeo.rotateX(-Math.PI * 0.5);

    // Deep oceanic turquoise to navy PBR material with high specular sheen
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x004d66,
      roughness: 0.12,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92
    });

    this.oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    this.oceanMesh.position.set(0, 0, 0); // Sea level at y = 0
    this.root.add(this.oceanMesh);
  }

  buildSuspensionBridgeTowers() {
    // Monumental bridge suspension towers holding the Ocean Run (u = 0.25 to 0.42)
    const towerGroup = new THREE.Group();
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x0f1b2b,
      metalness: 0.92,
      roughness: 0.28
    });
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });

    // 2 Grand Towers positioned along the Ocean Run
    const towerUValues = [0.28, 0.38];
    const towerHeight = 160.0;
    const towerWidth = 38.0;

    towerUValues.forEach((u, tIdx) => {
      const frame = this.circuit.getFrameAt(u);
      const bGroup = new THREE.Group();
      bGroup.position.copy(frame.pos);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      bGroup.quaternion.setFromRotationMatrix(m);

      // Left & Right Vertical Suspension Pylons
      [-towerWidth * 0.5, towerWidth * 0.5].forEach(sideX => {
        // Pylon legs rooted into ocean bedrock below sea level
        const pylonGeo = new THREE.BoxGeometry(4.5, towerHeight, 6.0);
        const pylon = new THREE.Mesh(pylonGeo, towerMat);
        pylon.position.set(sideX, towerHeight * 0.5 - 20, 0);
        bGroup.add(pylon);

        // Flashing maritime warning beacon on tower apex
        const beaconGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xFF0033 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(sideX, towerHeight - 19, 0);
        bGroup.add(beacon);
      });

      // Upper Crossbeam Gantry
      const beamGeo = new THREE.BoxGeometry(towerWidth + 8.0, 5.0, 6.5);
      const beam = new THREE.Mesh(beamGeo, towerMat);
      beam.position.set(0, towerHeight * 0.75, 0);
      bGroup.add(beam);

      // Connecting Suspension Cables swooping down towards track
      [-towerWidth * 0.48, towerWidth * 0.48].forEach(sideX => {
        const cablePoints = [
          new THREE.Vector3(sideX, towerHeight - 22, -180),
          new THREE.Vector3(sideX, 15, -60),
          new THREE.Vector3(sideX, towerHeight - 22, 0),
          new THREE.Vector3(sideX, 15, 60),
          new THREE.Vector3(sideX, towerHeight - 22, 180)
        ];
        const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
        const cableGeo = new THREE.TubeGeometry(cableCurve, 40, 0.4, 6, false);
        const cable = new THREE.Mesh(cableGeo, cableMat);
        bGroup.add(cable);
      });

      towerGroup.add(bGroup);
    });

    this.suspensionGroup = towerGroup;
    this.root.add(this.suspensionGroup);
  }

  buildCoastalSeaCliffs() {
    // Towering geological basalt cliffs flanking Cliffside Pass & Tunnel (u = 0.42 to 0.65)
    const cliffGroup = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x222b38,
      roughness: 0.85,
      metalness: 0.15
    });
    const rockStrataMat = new THREE.MeshStandardMaterial({
      color: 0x161e28,
      roughness: 0.9,
      metalness: 0.1
    });

    // Generate natural rock formations along the inside of cliffside curve
    for (let u = 0.42; u <= 0.65; u += 0.015) {
      const frame = this.circuit.getFrameAt(u);
      const rockHeight = 65.0 + Math.sin(u * 80) * 25.0;
      const rockRadius = 24.0 + (Math.sin(u * 120) * 8.0);

      // Cliff mass on inside of curve
      const rockGeo = new THREE.CylinderGeometry(rockRadius * 0.75, rockRadius * 1.1, rockHeight, 7);
      const rockMesh = new THREE.Mesh(rockGeo, (Math.random() > 0.5 ? rockMat : rockStrataMat));
      rockMesh.position.copy(frame.pos)
        .addScaledVector(frame.binormal, 28.0 + rockRadius * 0.5)
        .addScaledVector(frame.normal, rockHeight * 0.4 - 5);
      rockMesh.rotation.y = u * 40;
      rockMesh.rotation.z = 0.08;
      cliffGroup.add(rockMesh);
    }

    // Tunnel Portal Rock Shell (u = 0.56)
    const portalFrame = this.circuit.getFrameAt(0.56);
    const archRockGeo = new THREE.TorusGeometry(32, 14, 8, 16, Math.PI);
    const archRock = new THREE.Mesh(archRockGeo, rockMat);
    archRock.position.copy(portalFrame.pos).addScaledVector(portalFrame.normal, 12);
    const m = new THREE.Matrix4().makeBasis(portalFrame.binormal, portalFrame.normal, portalFrame.tangent);
    archRock.quaternion.setFromRotationMatrix(m);
    cliffGroup.add(archRock);

    this.cliffsGroup = cliffGroup;
    this.root.add(this.cliffsGroup);
  }

  buildBeachAndPalms() {
    // Low coast shoreline with sandy beach terrain and palm trees (u = 0.68 to 0.82)
    const beachGroup = new THREE.Group();

    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xd9c59a, // Warm coastal sand
      roughness: 0.92,
      metalness: 0.05
    });

    const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.8 });
    const palmFrondMat = new THREE.MeshStandardMaterial({ color: 0x1f5c2b, roughness: 0.6 });

    // Beach Sand Dunes along the outer margin of the road
    for (let u = 0.68; u <= 0.82; u += 0.02) {
      const frame = this.circuit.getFrameAt(u);

      const duneGeo = new THREE.ConeGeometry(22, 10, 8);
      duneGeo.scale(1.8, 0.4, 1.2);
      const dune = new THREE.Mesh(duneGeo, sandMat);
      dune.position.copy(frame.pos)
        .addScaledVector(frame.binormal, -(this.circuit.roadWidth * 0.5 + 24))
        .addScaledVector(frame.normal, -3);
      dune.position.y = 2; // Sits just above water level
      beachGroup.add(dune);

      // Coastal Palm Trees
      [-1, 1].forEach(side => {
        const palmGroup = new THREE.Group();
        palmGroup.position.copy(frame.pos)
          .addScaledVector(frame.binormal, side * (this.circuit.roadWidth * 0.5 + 16 + Math.random() * 8));
        palmGroup.position.y = 4;

        // Curved trunk
        const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 9.0, 6);
        trunkGeo.translate(0, 4.5, 0);
        trunkGeo.rotateZ(side * 0.12);
        const trunk = new THREE.Mesh(trunkGeo, palmTrunkMat);
        palmGroup.add(trunk);

        // Canopy fronds
        for (let f = 0; f < 6; f++) {
          const frondGeo = new THREE.ConeGeometry(1.6, 6.0, 4);
          frondGeo.translate(0, 3.0, 0);
          frondGeo.rotateX(Math.PI * 0.45);
          frondGeo.rotateY((f / 6) * Math.PI * 2);
          const frond = new THREE.Mesh(frondGeo, palmFrondMat);
          frond.position.set(0, 9.0, 0);
          palmGroup.add(frond);
        }

        beachGroup.add(palmGroup);
      });
    }

    this.beachGroup = beachGroup;
    this.root.add(this.beachGroup);
  }

  buildOffshoreInfrastructure() {
    // Offshore floating wind turbines with rotating blades & energy platforms (PDF Page 11, 30)
    const infraGroup = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1a2636, metalness: 0.9, roughness: 0.25 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: new THREE.Color(0x004466), metalness: 0.7, roughness: 0.3 });

    // 4 Offshore Wind Turbines placed out in the ocean
    const turbineCoords = [
      { x: 1800, z: -300 },
      { x: 1950, z: -700 },
      { x: -1400, z: -500 },
      { x: -1600, z: 100 }
    ];

    turbineCoords.forEach(pos => {
      const tGroup = new THREE.Group();
      tGroup.position.set(pos.x, 0, pos.z);

      // Base Pylon
      const towerGeo = new THREE.CylinderGeometry(2.4, 5.0, 110, 10);
      towerGeo.translate(0, 55, 0);
      const tower = new THREE.Mesh(towerGeo, metalMat);
      tGroup.add(tower);

      // Nacelle
      const nacelleGeo = new THREE.BoxGeometry(4.5, 4.5, 12.0);
      const nacelle = new THREE.Mesh(nacelleGeo, metalMat);
      nacelle.position.set(0, 110, 0);
      tGroup.add(nacelle);

      // Rotor Blades Hub
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, 110, 6.2);

      for (let b = 0; b < 3; b++) {
        const bladeGeo = new THREE.BoxGeometry(0.8, 48.0, 0.3);
        bladeGeo.translate(0, 24.0, 0);
        bladeGeo.rotateZ((b / 3) * Math.PI * 2);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        rotorGroup.add(blade);
      }
      tGroup.add(rotorGroup);

      this.rotatingTurbines.push({ rotor: rotorGroup, speed: 0.8 + Math.random() * 0.4 });
      infraGroup.add(tGroup);
    });

    // Distant Cargo Vessel Silhouette (PDF Page 11)
    const shipGeo = new THREE.BoxGeometry(32, 18, 140);
    const ship = new THREE.Mesh(shipGeo, metalMat);
    ship.position.set(2200, 6, -1100);
    ship.rotation.y = 0.45;
    infraGroup.add(ship);

    this.turbinesGroup = infraGroup;
    this.root.add(this.turbinesGroup);
  }

  buildMarinePatrolDrones() {
    // 3 Autonomous inspection drones flying over coastal waters
    const droneMat = new THREE.MeshStandardMaterial({
      color: 0x0a1420,
      metalness: 0.95,
      roughness: 0.2,
      emissive: new THREE.Color(0x00F0FF),
      emissiveIntensity: 0.4
    });

    for (let d = 0; d < 3; d++) {
      const droneGroup = new THREE.Group();

      const bodyGeo = new THREE.BoxGeometry(3.5, 0.8, 4.5);
      const body = new THREE.Mesh(bodyGeo, droneMat);
      droneGroup.add(body);

      // Glowing Rotor Pods
      [-1.8, 1.8].forEach(x => {
        [-1.8, 1.8].forEach(z => {
          const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.2, 8), droneMat);
          rotor.position.set(x, 0.4, z);
          droneGroup.add(rotor);
        });
      });

      this.marineDrones.push({
        group: droneGroup,
        u: d * 0.33,
        altitude: 45 + d * 8,
        speed: 0.015 + d * 0.005,
        swayPhase: d * 1.5
      });

      this.root.add(droneGroup);
    }
  }

  buildSeaMistParticles() {
    // Drifting sea spray and mist particles over water (PDF Page 11)
    const particleCount = 450;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 3000;
      positions[i * 3 + 1] = 2 + Math.random() * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3000;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x8AE2FF,
      size: 4.5,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    this.seaMistPoints = new THREE.Points(geo, mat);
    this.seaMistParticles = this.seaMistPoints;
    this.root.add(this.seaMistPoints);
  }

  buildOceanSkyDome() {
    // Oceanic Horizon Sky Dome
    const skyGeo = new THREE.SphereGeometry(4200, 32, 24);
    let skyTex = null;

    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0.0, '#020b1c'); // Deep space zenith
      grad.addColorStop(0.3, '#062045'); // Pacific blue stratosphere
      grad.addColorStop(0.6, '#0f487a'); // Bright marine cyan
      grad.addColorStop(0.85, '#288ab8'); // Oceanic horizon glow
      grad.addColorStop(1.0, '#0a223a'); // Sea level blend
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      skyTex = new THREE.CanvasTexture(canvas);
    }

    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.root.add(this.skyDome);
  }

  update(delta, playerPos) {
    const time = performance.now() * 0.001;

    // 1. Center Sky Dome on player
    if (this.skyDome && playerPos) {
      this.skyDome.position.x = playerPos.x;
      this.skyDome.position.z = playerPos.z;
    }

    // 2. Rotate offshore wind turbine blades
    this.rotatingTurbines.forEach(t => {
      t.rotor.rotation.z += t.speed * delta;
    });

    // 3. Animate patrolling marine drones
    this.marineDrones.forEach(d => {
      d.u = (d.u + d.speed * delta) % 1.0;
      const frame = this.circuit.getFrameAt(d.u);
      d.group.position.copy(frame.pos)
        .addScaledVector(frame.binormal, 35 + Math.sin(time + d.swayPhase) * 12)
        .addScaledVector(frame.normal, 18 + Math.cos(time * 0.8) * 4);
      d.group.rotation.y = Math.atan2(frame.tangent.x, frame.tangent.z);
    });

    // 4. Drift sea mist particles along the wind
    if (this.seaMistParticles) {
      const positions = this.seaMistParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 0] += 8.0 * delta; // Wind drift in X
        if (positions[i + 0] > 1500) positions[i + 0] = -1500;
      }
      this.seaMistParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  dispose() {
    if (this.scene && this.root) {
      this.scene.remove(this.root);
    }
    this.rotatingTurbines = [];
    this.marineDrones = [];
  }
}
