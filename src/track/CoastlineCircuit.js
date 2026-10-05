import * as THREE from 'three';

// ============================================================================
// SECTOR 02 // HYPERWAY — COASTLINE (5.4 KM / 3 LAPS)
// Production track geometry matching AntiGravity Sector Design Plan (PDF Page 2, 11-12)
// High-speed showcase coastal hyperway:
// - Elevated Coastal Start Platform
// - T1: Broad Banked Coastal Curve
// - Ocean Run: Monumental Suspension Bridge over open ocean
// - Cliffside Road: Hugging volcanic basalt sea cliffs
// - High-Speed Cliff Tunnel
// - Beach Run: Low-elevation shoreline highway
// - Boost Corridor: Supersonic straight with sequential energy arches
// - Sky Bridge Return to Start Gantry
// ============================================================================

export const COASTLINE_DISTRICTS = [
  { id: 'coastalPlatform', name: 'COASTAL PLATFORM', subtitle: 'START/FINISH // ELEVATED GANTRY', range: [0.0, 0.12], color: '#00F0FF', theme: 'cyan' },
  { id: 'turnOne', name: 'PACIFIC BANK', subtitle: 'SECTOR 02 // BROAD BANKED CURVE', range: [0.12, 0.25], color: '#0088FF', theme: 'blue' },
  { id: 'oceanRun', name: 'OCEAN RUN', subtitle: 'SUSPENSION BRIDGE // OPEN WATER', range: [0.25, 0.42], color: '#00E5FF', theme: 'cyan' },
  { id: 'cliffsidePass', name: 'CLIFFSIDE PASS', subtitle: 'BASALT ROCK STRATA // SEA WALL', range: [0.42, 0.56], color: '#FF9900', theme: 'amber' },
  { id: 'cliffTunnel', name: 'CLIFF TUNNEL', subtitle: 'HIGH-SPEED ROCK CUTTING // SPEED RIBS', range: [0.56, 0.68], color: '#FF3366', theme: 'magenta' },
  { id: 'beachRun', name: 'BEACH RUN', subtitle: 'LOW COASTLINE // WHITE SHORELINE', range: [0.68, 0.82], color: '#00FFCC', theme: 'teal' },
  { id: 'boostCorridor', name: 'BOOST CORRIDOR', subtitle: 'SUPERSONIC STRAIGHT // ENERGY NODES', range: [0.82, 0.94], color: '#7928CA', theme: 'purple' },
  { id: 'skyBridge', name: 'SKY BRIDGE RETURN', subtitle: 'FINAL SWEEP // HIGH-SPEED DESCENT', range: [0.94, 1.0], color: '#00F0FF', theme: 'cyan' }
];

export function isCoastlineTunnel(u) {
  const normU = ((u % 1.0) + 1.0) % 1.0;
  return normU >= 0.56 && normU <= 0.68;
}

const _scratchDeltaVec = new THREE.Vector3();
const _closestResult = {
  frame: null,
  u: 0,
  lateralOffset: 0,
  trackWidth: 28.0,
  distance: 0
};
const _interpFrame = {
  u: 0,
  pos: new THREE.Vector3(),
  tangent: new THREE.Vector3(),
  normal: new THREE.Vector3(),
  binormal: new THREE.Vector3(),
  curvature: 0,
  bank: 0,
  district: null
};

export class CoastlineCircuit {
  constructor(scene) {
    this.scene = scene;
    this.sectorId = 'coastline';
    this.name = 'COASTLINE HYPERWAY';
    this.sector = 'SECTOR 02';
    this.lengthKm = 5.4;
    this.laps = 3;
    this.segments = 600;
    this.roadWidth = 28.0;
    this.barrierHeight = 1.8;

    this.samples = []; // Array of { u, pos, tangent, normal, binormal, curvature, bank, district }
    this.boostPads = [0.06, 0.22, 0.38, 0.52, 0.66, 0.84, 0.88, 0.92];
    this.checkpoints = [
      { u: 0.12, name: 'CP 01 // PLATFORM OVERLOOK' },
      { u: 0.25, name: 'CP 02 // PACIFIC BANK APEX' },
      { u: 0.38, name: 'CP 03 // OCEAN BRIDGE TOWER' },
      { u: 0.52, name: 'CP 04 // CLIFF PROMONTORY' },
      { u: 0.64, name: 'CP 05 // TUNNEL EXIT' },
      { u: 0.78, name: 'CP 06 // BEACH TRANSIT HUB' },
      { u: 0.88, name: 'CP 07 // BOOST GATE ALPHA' },
      { u: 0.96, name: 'CP 08 // GANTRY VECTOR' }
    ];

    this.trackMesh = null;
    this.substructureMesh = null;
    this.barrierMesh = null;
    this.leftRailMesh = null;
    this.rightRailMesh = null;
    this.racingLineMesh = null;
    this.curveIndicatorsGroup = new THREE.Group();
    this.boostPadsGroup = new THREE.Group();
    this.checkpointGatesGroup = new THREE.Group();
    this.stuntRampsGroup = new THREE.Group();
    this.startFinishGantry = null;
    this.streetlightsGroup = new THREE.Group();

    this.scene.add(this.curveIndicatorsGroup);
    this.scene.add(this.boostPadsGroup);
    this.scene.add(this.checkpointGatesGroup);
    this.scene.add(this.stuntRampsGroup);
    this.scene.add(this.streetlightsGroup);

    this.buildCircuitSpline();
    this.generateRoadGeometry();
    this.generateBarriersAndNeonRails();
    this.generateDynamicRacingLine();
    this.generateCurveIndicators();
    this.generateBoostPads();
    this.generateCheckpointGates();
    this.generateStuntRamps();
    this.generateStartFinishArch();
    this.generateStreetlights();
  }

  buildCircuitSpline() {
    // 24 control points matching PDF Page 2 diagram (Coastline 5.4 KM)
    const points = [
      new THREE.Vector3(0, 45, 0),         // 00: START/FINISH: Elevated Coastal Platform
      new THREE.Vector3(260, 48, 180),     // 01: High-Speed Coastal Straight
      new THREE.Vector3(580, 44, 360),     // 02: T1 Approach: Banking toward ocean
      new THREE.Vector3(900, 36, 340),     // 03: T1: Broad Banked Coastal Curve
      new THREE.Vector3(1160, 26, 140),    // 04: Ocean Run Transition: Leaving mainland
      new THREE.Vector3(1380, 22, -180),   // 05: Ocean Run: Deep water bridge pylon 1
      new THREE.Vector3(1440, 24, -540),   // 06: Ocean Run: Apex overwater curve
      new THREE.Vector3(1280, 28, -860),   // 07: Ocean Run: Deep water bridge pylon 2
      new THREE.Vector3(990, 40, -1080),   // 08: Approach to Cliffside Road
      new THREE.Vector3(650, 58, -1180),   // 09: Cliffside Pass: Rocky promontory
      new THREE.Vector3(280, 74, -1120),   // 10: Cliffside Pass: Hugging basalt cliffs
      new THREE.Vector3(-110, 70, -1020),  // 11: Cliff Tunnel Portal Entrance
      new THREE.Vector3(-440, 54, -880),   // 12: High-Speed Cliff Tunnel Interior
      new THREE.Vector3(-710, 38, -680),   // 13: Tunnel Exit onto Beach Corridor
      new THREE.Vector3(-910, 18, -420),   // 14: Beach Run: Low Coast near sea level (+18m)
      new THREE.Vector3(-1030, 14, -120),  // 15: Beach Run: White sand shoreline
      new THREE.Vector3(-970, 16, 220),    // 16: Beach Run: Marine transit hub bend
      new THREE.Vector3(-770, 24, 540),    // 17: Entry into Boost Corridor
      new THREE.Vector3(-510, 34, 740),    // 18: Boost Corridor: Supersonic straight
      new THREE.Vector3(-210, 40, 860),    // 19: Boost Corridor: Terminal velocity
      new THREE.Vector3(90, 44, 820),      // 20: Sky Bridge: Overwater climb (+44m)
      new THREE.Vector3(280, 48, 620),     // 21: Sky Bridge: Sweeping final turn
      new THREE.Vector3(220, 46, 340),     // 22: Gantry Approach alignment
      new THREE.Vector3(60, 45, 120)       // 23: Final Straight into Start Line
    ];

    points.forEach(p => { p.x *= 0.6758; p.z *= 0.6758; });
    this.curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    this.totalLength = this.curve.getLength();

    this.samples = [];
    const worldUp = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < this.segments; i++) {
      const u = i / this.segments;
      const pos = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u).normalize();

      // Curvature estimate
      const nextU = (u + 0.005) % 1.0;
      const prevU = (u - 0.005 + 1.0) % 1.0;
      const nextTan = this.curve.getTangentAt(nextU).normalize();
      const prevTan = this.curve.getTangentAt(prevU).normalize();
      const dTan = nextTan.clone().sub(prevTan).multiplyScalar(100);
      const curvature = dTan.length();

      // Dynamic Banking (Smooth inward roll on turns)
      const crossHoriz = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const lateralTurn = dTan.dot(crossHoriz);
      const maxBank = 0.28; // ~16 degrees
      const bank = Math.max(-maxBank, Math.min(maxBank, -lateralTurn * 0.065));

      const binormal = new THREE.Vector3().crossVectors(tangent, worldUp).normalize();
      const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

      // Apply banking rotation around tangent
      if (Math.abs(bank) > 0.001) {
        binormal.applyAxisAngle(tangent, bank);
        normal.applyAxisAngle(tangent, bank);
      }

      // District assignment
      const district = COASTLINE_DISTRICTS.find(d => u >= d.range[0] && u < d.range[1]) || COASTLINE_DISTRICTS[0];

      this.samples.push({
        u,
        pos,
        tangent,
        normal,
        binormal,
        curvature,
        bank,
        district
      });
    }
  }

  generateRoadGeometry() {
    // 4-lane primary racing surface with magnetic energy guide channels (PDF Page 5)
    const positions = [];
    const normals = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    const halfW = this.roadWidth * 0.5;
    const ribCount = this.segments;
    const lateralSlices = 12;

    const baseColor = new THREE.Color(0x121b28); // Oceanic dark composite
    const edgeColor = new THREE.Color(0x0a1018); // Reinforced shoulder
    const laneMarkerColor = new THREE.Color(0x00F0FF); // Cyan magnetic lane indicators

    for (let i = 0; i <= ribCount; i++) {
      const frame = this.samples[i % ribCount];

      for (let j = 0; j <= lateralSlices; j++) {
        const t = j / lateralSlices; // 0..1
        const xOffset = (t - 0.5) * this.roadWidth;

        // Slight crown in center for water runoff (PDF Page 5)
        const crownY = Math.cos((t - 0.5) * Math.PI) * 0.18;

        const vertPos = frame.pos.clone()
          .addScaledVector(frame.binormal, xOffset)
          .addScaledVector(frame.normal, crownY);

        positions.push(vertPos.x, vertPos.y, vertPos.z);
        normals.push(frame.normal.x, frame.normal.y, frame.normal.z);
        uvs.push(t * 4.0, (i / ribCount) * 120.0);

        // Procedural vertex coloring: distinct lanes & energy borders
        let c = baseColor.clone();
        if (t < 0.05 || t > 0.95) {
          c = edgeColor;
        } else if (Math.abs(t - 0.25) < 0.015 || Math.abs(t - 0.5) < 0.015 || Math.abs(t - 0.75) < 0.015) {
          c = laneMarkerColor;
        }
        colors.push(c.r, c.g, c.b);
      }

      if (i < ribCount) {
        const row1 = i * (lateralSlices + 1);
        const row2 = (i + 1) * (lateralSlices + 1);
        for (let j = 0; j < lateralSlices; j++) {
          indices.push(row1 + j, row1 + j + 1, row2 + j);
          indices.push(row1 + j + 1, row2 + j + 1, row2 + j);
        }
      }
    }

    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    roadGeo.setIndex(indices);

    // Physically based road surface with wet oceanic response
    const roadMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.32,
      metalness: 0.65,
      side: THREE.DoubleSide
    });

    this.trackMesh = new THREE.Mesh(roadGeo, roadMat);
    this.scene.add(this.trackMesh);

    // Structural under-deck keel (load-bearing anti-gravity conduits)
    this.generateSubstructureMesh();
  }

  generateSubstructureMesh() {
    const positions = [];
    const normals = [];
    const indices = [];

    const halfW = this.roadWidth * 0.5;
    const depth = 4.2;

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i % this.segments];

      // 4 points forming an inverted trapezoidal keel
      const pLTop = frame.pos.clone().addScaledVector(frame.binormal, -halfW);
      const pRTop = frame.pos.clone().addScaledVector(frame.binormal, halfW);
      const pRBot = frame.pos.clone().addScaledVector(frame.binormal, halfW * 0.6).addScaledVector(frame.normal, -depth);
      const pLBot = frame.pos.clone().addScaledVector(frame.binormal, -halfW * 0.6).addScaledVector(frame.normal, -depth);

      positions.push(pLTop.x, pLTop.y, pLTop.z);
      positions.push(pRTop.x, pRTop.y, pRTop.z);
      positions.push(pRBot.x, pRBot.y, pRBot.z);
      positions.push(pLBot.x, pLBot.y, pLBot.z);

      const n = frame.normal.clone().negate();
      normals.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z);

      if (i < this.segments) {
        const b = i * 4;
        const nb = (i + 1) * 4;
        // Left flank
        indices.push(b, nb, nb + 3); indices.push(b, nb + 3, b + 3);
        // Bottom keel
        indices.push(b + 3, nb + 3, nb + 2); indices.push(b + 3, nb + 2, b + 2);
        // Right flank
        indices.push(b + 2, nb + 2, nb + 1); indices.push(b + 2, nb + 1, b + 1);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x0a121d,
      roughness: 0.5,
      metalness: 0.9
    });

    this.substructureMesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.substructureMesh);
  }

  generateBarriersAndNeonRails() {
    // Translucent aerodynamic marine wind shields & glowing blue neon energy rails
    const halfW = this.roadWidth * 0.5 + 0.6;
    const bHeight = this.barrierHeight;

    const barrierPositions = [];
    const barrierNormals = [];
    const barrierIndices = [];

    const railLPositions = [];
    const railRPositions = [];

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i % this.segments];

      // Left Barrier
      const lBase = frame.pos.clone().addScaledVector(frame.binormal, -halfW);
      const lTop = lBase.clone().addScaledVector(frame.normal, bHeight);
      railLPositions.push(lTop.clone());

      // Right Barrier
      const rBase = frame.pos.clone().addScaledVector(frame.binormal, halfW);
      const rTop = rBase.clone().addScaledVector(frame.normal, bHeight);
      railRPositions.push(rTop.clone());

      // Quad vertices for left barrier (0, 1) and right barrier (2, 3)
      barrierPositions.push(lBase.x, lBase.y, lBase.z, lTop.x, lTop.y, lTop.z);
      barrierPositions.push(rBase.x, rBase.y, rBase.z, rTop.x, rTop.y, rTop.z);

      const nL = frame.binormal.clone();
      const nR = frame.binormal.clone().negate();
      barrierNormals.push(nL.x, nL.y, nL.z, nL.x, nL.y, nL.z);
      barrierNormals.push(nR.x, nR.y, nR.z, nR.x, nR.y, nR.z);

      if (i < this.segments) {
        const b = i * 4;
        const nb = (i + 1) * 4;
        // Left
        barrierIndices.push(b, b + 1, nb + 1);
        barrierIndices.push(b, nb + 1, nb);
        // Right
        barrierIndices.push(b + 2, nb + 3, b + 3);
        barrierIndices.push(b + 2, nb + 2, nb + 3);
      }
    }

    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.Float32BufferAttribute(barrierPositions, 3));
    bGeo.setAttribute('normal', new THREE.Float32BufferAttribute(barrierNormals, 3));
    bGeo.setIndex(barrierIndices);

    // Translucent marine wind shields (PDF Page 10)
    const bMat = new THREE.MeshStandardMaterial({
      color: 0x004466,
      transparent: true,
      opacity: 0.72,
      roughness: 0.15,
      metalness: 0.85,
      side: THREE.DoubleSide
    });

    this.barrierMesh = new THREE.Mesh(bGeo, bMat);
    this.scene.add(this.barrierMesh);

    // Glowing Neon Energy Strips along barriers
    const railMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });

    const curveL = new THREE.CatmullRomCurve3(railLPositions, true);
    const railLGeo = new THREE.TubeGeometry(curveL, this.segments, 0.28, 6, true);
    this.leftRailMesh = new THREE.Mesh(railLGeo, railMat);
    this.scene.add(this.leftRailMesh);

    const curveR = new THREE.CatmullRomCurve3(railRPositions, true);
    const railRGeo = new THREE.TubeGeometry(curveR, this.segments, 0.28, 6, true);
    this.rightRailMesh = new THREE.Mesh(railRGeo, railMat);
    this.scene.add(this.rightRailMesh);
  }

  generateDynamicRacingLine() {
    // Dynamic curvature-responsive 3D racing line ribbon
    const linePositions = [];
    const lineColors = [];
    const lineIndices = [];
    const ribbonHalfW = 0.85;

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i % this.segments];

      // Apex lateral shifting
      const apexOffset = Math.max(-8.0, Math.min(8.0, -frame.bank * 35.0));
      const center = frame.pos.clone().addScaledVector(frame.binormal, apexOffset).addScaledVector(frame.normal, 0.08);

      const pL = center.clone().addScaledVector(frame.binormal, -ribbonHalfW);
      const pR = center.clone().addScaledVector(frame.binormal, ribbonHalfW);

      linePositions.push(pL.x, pL.y, pL.z);
      linePositions.push(pR.x, pR.y, pR.z);

      // Color shifts from Cyan (flat) to Amber/Red (high-G curve)
      const heat = Math.min(1.0, frame.curvature * 3.5);
      const c = new THREE.Color().lerpColors(new THREE.Color(0x00F0FF), new THREE.Color(0xFF3300), heat);
      lineColors.push(c.r, c.g, c.b, c.r, c.g, c.b);

      if (i < this.segments) {
        const b = i * 2;
        lineIndices.push(b, b + 1, b + 2);
        lineIndices.push(b + 1, b + 3, b + 2);
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    lineGeo.setIndex(lineIndices);

    const lineMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });

    this.racingLineMesh = new THREE.Mesh(lineGeo, lineMat);
    this.scene.add(this.racingLineMesh);
  }

  generateCurveIndicators() {
    // Curved arrow chevron indicators placed along major turns (T1, Apex)
    const chevronUValues = [
      0.15, 0.17, 0.19, 0.21, 0.23,
      0.34, 0.36, 0.38,
      0.46, 0.48, 0.50,
      0.88, 0.90, 0.92, 0.94
    ];

    const chevronGeo = new THREE.PlaneGeometry(3.6, 2.0);
    const chevronMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      side: THREE.DoubleSide
    });

    chevronUValues.forEach(u => {
      const frame = this.getFrameAt(u);
      const isRight = frame.bank > 0;
      const sideOffset = isRight ? -(this.roadWidth * 0.5 + 1.2) : (this.roadWidth * 0.5 + 1.2);

      const mesh = new THREE.Mesh(chevronGeo, chevronMat);
      mesh.position.copy(frame.pos)
        .addScaledVector(frame.binormal, sideOffset)
        .addScaledVector(frame.normal, 2.5);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      mesh.quaternion.setFromRotationMatrix(m);
      if (isRight) mesh.rotateY(Math.PI);

      this.curveIndicatorsGroup.add(mesh);
    });
  }

  generateBoostPads() {
    const padGeo = new THREE.PlaneGeometry(16.0, 7.5);
    padGeo.rotateX(-Math.PI * 0.5);

    const padMat = new THREE.MeshBasicMaterial({
      color: 0x00FF88,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });

    this.boostPads.forEach(u => {
      const frame = this.getFrameAt(u);
      const mesh = new THREE.Mesh(padGeo, padMat);
      mesh.position.copy(frame.pos).addScaledVector(frame.normal, 0.15);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      mesh.quaternion.setFromRotationMatrix(m);

      this.boostPadsGroup.add(mesh);
    });
  }

  generateCheckpointGates() {
    const w = this.roadWidth + 4;
    const h = 10.0;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0e1724, metalness: 0.9, roughness: 0.2 });
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.45, side: THREE.DoubleSide });

    this.checkpoints.forEach((cp, idx) => {
      const frame = this.getFrameAt(cp.u);
      const gateGroup = new THREE.Group();
      gateGroup.position.copy(frame.pos);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      gateGroup.quaternion.setFromRotationMatrix(m);

      // Arch Truss
      const postL = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.4), frameMat);
      postL.position.set(-w * 0.5, h * 0.5, 0);
      gateGroup.add(postL);

      const postR = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.4), frameMat);
      postR.position.set(w * 0.5, h * 0.5, 0);
      gateGroup.add(postR);

      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 1.4, 1.4), frameMat);
      crossbar.position.set(0, h, 0);
      gateGroup.add(crossbar);

      // Holographic checkpoint progress plane
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w - 1.0, h - 1.0), beamMat);
      plane.position.set(0, h * 0.5, 0);
      gateGroup.add(plane);

      this.checkpointGatesGroup.add(gateGroup);
    });
  }

  generateStuntRamps() {
    // 2 high-speed launch ramps on overwater straight
    [0.32, 0.86].forEach(u => {
      const frame = this.getFrameAt(u);
      const rampGeo = new THREE.BoxGeometry(14.0, 1.6, 9.0);
      rampGeo.translate(0, 0.8, 4.5);
      rampGeo.rotateX(-0.16);

      const rampMat = new THREE.MeshStandardMaterial({
        color: 0x141f2e,
        metalness: 0.85,
        roughness: 0.3,
        emissive: new THREE.Color(0x00E5FF),
        emissiveIntensity: 0.3
      });

      const ramp = new THREE.Mesh(rampGeo, rampMat);
      ramp.position.copy(frame.pos).addScaledVector(frame.normal, 0.1);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      ramp.quaternion.setFromRotationMatrix(m);

      this.stuntRampsGroup.add(ramp);
    });
  }

  generateStartFinishArch() {
    const frame = this.getFrameAt(0.0);
    const gantry = new THREE.Group();
    gantry.position.copy(frame.pos);

    const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
    gantry.quaternion.setFromRotationMatrix(m);

    const w = this.roadWidth + 8;
    const h = 13.5;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x0a1420, metalness: 0.95, roughness: 0.2 });

    const pylonL = new THREE.Mesh(new THREE.BoxGeometry(2.0, h, 2.5), steelMat);
    pylonL.position.set(-w * 0.5, h * 0.5, 0);
    gantry.add(pylonL);

    const pylonR = new THREE.Mesh(new THREE.BoxGeometry(2.0, h, 2.5), steelMat);
    pylonR.position.set(w * 0.5, h * 0.5, 0);
    gantry.add(pylonR);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(w, 2.8, 3.2), steelMat);
    arch.position.set(0, h, 0);
    gantry.add(arch);

    // Glowing Neon Banner
    const bannerGeo = new THREE.PlaneGeometry(w * 0.75, 2.2);
    const bannerMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, side: THREE.DoubleSide });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, h, 1.7);
    gantry.add(banner);

    this.startFinishGantry = gantry;
    this.scene.add(this.startFinishGantry);
  }

  generateStreetlights() {
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.35, 9.5, 8);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x0f1826, metalness: 0.9, roughness: 0.3 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });

    for (let i = 0; i < this.segments; i += 20) {
      const u = i / this.segments;
      if (isCoastlineTunnel(u)) continue; // Keep tunnel interior clean

      const frame = this.getFrameAt(u);
      const isRight = (i % 40 === 0);
      const sideOffset = isRight ? (this.roadWidth * 0.5 + 2.8) : -(this.roadWidth * 0.5 + 2.8);

      const pole = new THREE.Mesh(poleGeo, metalMat);
      pole.position.copy(frame.pos).addScaledVector(frame.binormal, sideOffset).addScaledVector(frame.normal, 4.75);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      pole.quaternion.setFromRotationMatrix(m);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 1.5), bulbMat);
      head.position.set(0, 4.8, 0);
      pole.add(head);

      this.streetlightsGroup.add(pole);
    }
  }

  getInterpolatedFrame(u) {
    const normU = ((u % 1.0) + 1.0) % 1.0;
    if (!this.samples || this.samples.length === 0) return null;
    const floatIdx = normU * this.segments;
    const i0 = Math.floor(floatIdx) % this.segments;
    const i1 = (i0 + 1) % this.segments;
    const alpha = floatIdx - Math.floor(floatIdx);

    const s0 = this.samples[i0];
    const s1 = this.samples[i1];
    if (!s0) return this.samples[0];
    if (!s1 || alpha < 0.0001) return s0;

    _interpFrame.u = normU;
    _interpFrame.pos.lerpVectors(s0.pos, s1.pos, alpha);
    _interpFrame.tangent.lerpVectors(s0.tangent, s1.tangent, alpha).normalize();
    _interpFrame.normal.lerpVectors(s0.normal, s1.normal, alpha).normalize();
    _interpFrame.binormal.lerpVectors(s0.binormal, s1.binormal, alpha).normalize();
    _interpFrame.curvature = THREE.MathUtils.lerp(s0.curvature || 0, s1.curvature || 0, alpha);
    _interpFrame.bank = THREE.MathUtils.lerp(s0.bank || 0, s1.bank || 0, alpha);
    _interpFrame.district = s0.district;
    return _interpFrame;
  }

  getFrameAt(u, smooth = false) {
    if (smooth) return this.getInterpolatedFrame(u);
    const normU = ((u % 1.0) + 1.0) % 1.0;
    const index = Math.floor(normU * this.segments);
    return this.samples[index] || this.samples[0];
  }

  getClosestFrame(worldPos, hintU = -1) {
    let closestFrame = this.samples[0];
    let minDistSq = Infinity;

    if (hintU >= 0 && hintU <= 1.0) {
      const centerIdx = Math.floor(hintU * this.segments);
      const searchRadius = 24;
      for (let offset = -searchRadius; offset <= searchRadius; offset++) {
        const idx = ((centerIdx + offset) % this.segments + this.segments) % this.segments;
        const dSq = this.samples[idx].pos.distanceToSquared(worldPos);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestFrame = this.samples[idx];
        }
      }
    } else {
      for (let i = 0; i < this.samples.length; i += 6) {
        const dSq = this.samples[i].pos.distanceToSquared(worldPos);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestFrame = this.samples[i];
        }
      }
    }

    const centerIdx = Math.floor(closestFrame.u * this.segments);
    for (let offset = -8; offset <= 8; offset++) {
      const idx = ((centerIdx + offset) % this.segments + this.segments) % this.segments;
      const dSq = this.samples[idx].pos.distanceToSquared(worldPos);
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closestFrame = this.samples[idx];
      }
    }

    _scratchDeltaVec.copy(worldPos).sub(closestFrame.pos);
    const lateralOffset = _scratchDeltaVec.dot(closestFrame.binormal);

    _closestResult.frame = closestFrame;
    _closestResult.u = closestFrame.u;
    _closestResult.lateralOffset = lateralOffset;
    _closestResult.trackWidth = this.roadWidth;
    _closestResult.distance = Math.sqrt(minDistSq);
    return _closestResult;
  }

  getDistrictAt(u) {
    const normU = ((u % 1.0) + 1.0) % 1.0;
    return COASTLINE_DISTRICTS.find(d => normU >= d.range[0] && normU < d.range[1]) || COASTLINE_DISTRICTS[0];
  }

  update(delta) {
    const t = performance.now() * 0.003;
    if (this.boostPadsGroup && this.boostPadsGroup.children.length > 0) {
      const padMesh = this.boostPadsGroup.children[0];
      if (padMesh && padMesh.material) {
        padMesh.material.opacity = 0.75 + Math.sin(t * 3.0) * 0.25;
      }
    }
  }

  setVisible(visible) {
    if (this.trackMesh) this.trackMesh.visible = visible;
    if (this.substructureMesh) this.substructureMesh.visible = visible;
    if (this.barrierMesh) this.barrierMesh.visible = visible;
    if (this.leftRailMesh) this.leftRailMesh.visible = visible;
    if (this.rightRailMesh) this.rightRailMesh.visible = visible;
    if (this.racingLineMesh) this.racingLineMesh.visible = visible;
    if (this.curveIndicatorsGroup) this.curveIndicatorsGroup.visible = visible;
    if (this.boostPadsGroup) this.boostPadsGroup.visible = visible;
    if (this.checkpointGatesGroup) this.checkpointGatesGroup.visible = visible;
    if (this.stuntRampsGroup) this.stuntRampsGroup.visible = visible;
    if (this.startFinishGantry) this.startFinishGantry.visible = visible;
    if (this.streetlightsGroup) this.streetlightsGroup.visible = visible;
  }

  dispose() {
    const items = [
      this.trackMesh,
      this.substructureMesh,
      this.barrierMesh,
      this.leftRailMesh,
      this.rightRailMesh,
      this.racingLineMesh,
      this.curveIndicatorsGroup,
      this.boostPadsGroup,
      this.checkpointGatesGroup,
      this.stuntRampsGroup,
      this.startFinishGantry,
      this.streetlightsGroup
    ];
    items.forEach(item => {
      if (item) {
        if (item.parent) item.parent.remove(item);
        if (item.geometry) item.geometry.dispose();
      }
    });
  }
}
