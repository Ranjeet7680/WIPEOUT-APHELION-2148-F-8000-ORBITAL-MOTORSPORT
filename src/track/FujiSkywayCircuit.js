import * as THREE from 'three';

// ============================================================================
// SECTOR 03 // MOUNTAIN — ORIFT / FUJI SKYWAY (5.2 KM / 3 LAPS)
// Production track geometry matching AntiGravity Sector Design Plan (PDF Page 3, 12-13)
// Technical mountain sector:
// - Alpine Valley Starting Grid (+80m)
// - S-bends (S1): Rhythmic climbing chicanes through pine forest
// - Sky Rise: Steep uphill mountain grade climbing to +460m
// - Volcanic Cliff Run: Cut into basalt cliffs with vertical drops (+510m)
// - Signature Apex Hairpin: 150° precision banked corner with valley overlook
// - Mountain Drop: High-speed downhill plunge
// - The Sky Bridge: Monumental anti-gravity bridge crossing deep cloud chasm
// - Alpine Descent: Sweeping downhill curve returning to finish
// ============================================================================

export const FUJI_DISTRICTS = [
  { id: 'valleyBase', name: 'ALPINE BASE', subtitle: 'START/FINISH // VALLEY GANTRY', range: [0.0, 0.14], color: '#8AE2FF', theme: 'ice' },
  { id: 'forestSbends', name: 'FOREST S-BENDS', subtitle: 'PINE CANOPY // RHYTHMIC CHICANE', range: [0.14, 0.28], color: '#00FF88', theme: 'forest' },
  { id: 'skyRise', name: 'SKY RISE ASCENT', subtitle: 'STEEP GRADE (+480m) // HIGH ELEVATION', range: [0.28, 0.42], color: '#FFB800', theme: 'amber' },
  { id: 'volcanicCliff', name: 'CLIFF RUN', subtitle: 'BASALT ROCK STRATA // DEEP DROP', range: [0.42, 0.54], color: '#FF3B30', theme: 'red' },
  { id: 'apexHairpin', name: 'APEX HAIRPIN', subtitle: 'SIGNATURE 150° TURN // VALLEY OVERLOOK', range: [0.54, 0.64], color: '#FF007F', theme: 'magenta' },
  { id: 'mountainDrop', name: 'MOUNTAIN DROP', subtitle: 'GRAVITY PLUNGE // DECELERATION ZONE', range: [0.64, 0.74], color: '#FFB800', theme: 'amber' },
  { id: 'skyBridge', name: 'THE SKY BRIDGE', subtitle: 'SUSPENDED GORGE SPAN // CLOUD CHASM', range: [0.74, 0.88], color: '#00F0FF', theme: 'cyan' },
  { id: 'alpineDescent', name: 'ALPINE DESCENT', subtitle: 'OBSERVATORY RUN // HOME STRETCH', range: [0.88, 1.0], color: '#8AE2FF', theme: 'ice' }
];

export function isFujiTunnel(u) {
  const normU = ((u % 1.0) + 1.0) % 1.0;
  return normU >= 0.88 && normU <= 0.94;
}

const _scratchDeltaVec = new THREE.Vector3();
const _closestResult = {
  frame: null,
  u: 0,
  lateralOffset: 0,
  trackWidth: 26.0,
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

export class FujiSkywayCircuit {
  constructor(scene) {
    this.scene = scene;
    this.sectorId = 'fuji';
    this.name = 'ORIFT / FUJI SKYWAY';
    this.sector = 'SECTOR 03';
    this.lengthKm = 5.2;
    this.laps = 3;
    this.segments = 600;
    this.roadWidth = 26.0;
    this.barrierHeight = 1.9;

    this.samples = []; // Array of { u, pos, tangent, normal, binormal, curvature, bank, district }
    this.boostPads = [0.08, 0.24, 0.38, 0.50, 0.62, 0.72, 0.84, 0.95];
    this.checkpoints = [
      { u: 0.12, name: 'CP 01 // FOREST GATE' },
      { u: 0.26, name: 'CP 02 // S-BEND APEX' },
      { u: 0.40, name: 'CP 03 // SKY RISE CREST' },
      { u: 0.52, name: 'CP 04 // CLIFF RUN BALCONY' },
      { u: 0.60, name: 'CP 05 // HAIRPIN APEX' },
      { u: 0.72, name: 'CP 06 // DROP VALLEY PORTAL' },
      { u: 0.84, name: 'CP 07 // SKY BRIDGE TOWER' },
      { u: 0.96, name: 'CP 08 // GANTRY APPROACH' }
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
    // 24 control points matching PDF Page 3 diagram (Fuji Skyway 5.2 KM with dramatic elevation)
    const points = [
      new THREE.Vector3(0, 80, 0),          // 00: START/FINISH: Alpine Valley Gantry
      new THREE.Vector3(120, 110, 220),     // 01: S1: Entry into pine forest
      new THREE.Vector3(-80, 150, 420),     // 02: S1: Counter-turn climbing switchback
      new THREE.Vector3(160, 210, 600),     // 03: S1 Exit: Entering Sky Rise Ascent
      new THREE.Vector3(440, 290, 720),     // 04: Sky Rise: Steep uphill grade (+290m)
      new THREE.Vector3(720, 380, 680),     // 05: Sky Rise: Thinning forest to scree (+380m)
      new THREE.Vector3(980, 460, 520),     // 06: Sky Rise Summit (+460m)
      new THREE.Vector3(1120, 490, 260),    // 07: Transition to Volcanic Cliff Run
      new THREE.Vector3(1080, 510, -80),    // 08: Cliff Run: Sheer basalt face (+510m)
      new THREE.Vector3(940, 515, -380),    // 09: Cliff Run: Outer barrier overlooking abyss
      new THREE.Vector3(740, 510, -640),    // 10: Hairpin Approach: Heavy braking zone
      new THREE.Vector3(480, 495, -780),    // 11: Apex Hairpin Turn-in
      new THREE.Vector3(340, 480, -720),    // 12: Apex Hairpin Climax (150° tight curve)
      new THREE.Vector3(420, 440, -520),    // 13: Hairpin Exit: Dramatic valley overlook
      new THREE.Vector3(560, 380, -320),    // 14: Mountain Drop: High-speed gravity plunge
      new THREE.Vector3(640, 310, -100),    // 15: Drop Transition into Sky Bridge
      new THREE.Vector3(620, 250, 160),     // 16: The Sky Bridge: Valley gorge crossing (+250m)
      new THREE.Vector3(520, 210, 400),     // 17: The Sky Bridge: Mid-span pylon
      new THREE.Vector3(340, 170, 560),     // 18: Sky Bridge Exit to Research Ridge
      new THREE.Vector3(120, 135, 620),     // 19: Observatory Run: Meteorological station
      new THREE.Vector3(-140, 110, 520),    // 20: Alpine descent through rock cuttings
      new THREE.Vector3(-260, 95, 340),     // 21: High-speed sweeping downhill curve
      new THREE.Vector3(-210, 85, 140),     // 22: Valley Entry: Straight alignment
      new THREE.Vector3(-90, 82, 40)        // 23: Final straight into Valley Gantry
    ];

    points.forEach(p => { p.x *= 0.825; p.z *= 0.825; });
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

      // High-G banked inward tilt on mountain turns (up to 20° on Hairpin)
      const crossHoriz = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const lateralTurn = dTan.dot(crossHoriz);
      const maxBank = 0.35; // ~20 degrees
      const bank = Math.max(-maxBank, Math.min(maxBank, -lateralTurn * 0.085));

      const binormal = new THREE.Vector3().crossVectors(tangent, worldUp).normalize();
      const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

      if (Math.abs(bank) > 0.001) {
        binormal.applyAxisAngle(tangent, bank);
        normal.applyAxisAngle(tangent, bank);
      }

      const district = FUJI_DISTRICTS.find(d => u >= d.range[0] && u < d.range[1]) || FUJI_DISTRICTS[0];

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
    const positions = [];
    const normals = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    const ribCount = this.segments;
    const lateralSlices = 10;

    const baseColor = new THREE.Color(0x1a212b); // Cold alpine asphalt
    const snowEdgeColor = new THREE.Color(0xdde8f5); // Snow crust on road shoulders (PDF Page 10, 13)
    const laneMarkerColor = new THREE.Color(0x8AE2FF); // Icy blue lane indicators

    for (let i = 0; i <= ribCount; i++) {
      const frame = this.samples[i % ribCount];

      for (let j = 0; j <= lateralSlices; j++) {
        const t = j / lateralSlices;
        const xOffset = (t - 0.5) * this.roadWidth;

        const vertPos = frame.pos.clone()
          .addScaledVector(frame.binormal, xOffset);

        positions.push(vertPos.x, vertPos.y, vertPos.z);
        normals.push(frame.normal.x, frame.normal.y, frame.normal.z);
        uvs.push(t * 3.0, (i / ribCount) * 110.0);

        // Snow accumulation on outer edges at high elevation (> 300m)
        let c = baseColor.clone();
        if ((t < 0.08 || t > 0.92) && frame.pos.y > 320) {
          c = snowEdgeColor;
        } else if (Math.abs(t - 0.5) < 0.02) {
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

    const roadMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.42,
      metalness: 0.55,
      side: THREE.DoubleSide
    });

    this.trackMesh = new THREE.Mesh(roadGeo, roadMat);
    this.scene.add(this.trackMesh);

    this.generateSubstructureMesh();
  }

  generateSubstructureMesh() {
    const positions = [];
    const normals = [];
    const indices = [];

    const halfW = this.roadWidth * 0.5;
    const depth = 4.8;

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i % this.segments];

      const pLTop = frame.pos.clone().addScaledVector(frame.binormal, -halfW);
      const pRTop = frame.pos.clone().addScaledVector(frame.binormal, halfW);
      const pRBot = frame.pos.clone().addScaledVector(frame.binormal, halfW * 0.5).addScaledVector(frame.normal, -depth);
      const pLBot = frame.pos.clone().addScaledVector(frame.binormal, -halfW * 0.5).addScaledVector(frame.normal, -depth);

      positions.push(pLTop.x, pLTop.y, pLTop.z);
      positions.push(pRTop.x, pRTop.y, pRTop.z);
      positions.push(pRBot.x, pRBot.y, pRBot.z);
      positions.push(pLBot.x, pLBot.y, pLBot.z);

      const n = frame.normal.clone().negate();
      normals.push(n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z);

      if (i < this.segments) {
        const b = i * 4;
        const nb = (i + 1) * 4;
        indices.push(b, nb, nb + 3); indices.push(b, nb + 3, b + 3);
        indices.push(b + 3, nb + 3, nb + 2); indices.push(b + 3, nb + 2, b + 2);
        indices.push(b + 2, nb + 2, nb + 1); indices.push(b + 2, nb + 1, b + 1);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x111620,
      roughness: 0.6,
      metalness: 0.85
    });

    this.substructureMesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.substructureMesh);
  }

  generateBarriersAndNeonRails() {
    // Rugged mountain guard barriers and reinforced field pylons (PDF Page 10)
    const halfW = this.roadWidth * 0.5 + 0.5;
    const bHeight = this.barrierHeight;

    const barrierPositions = [];
    const barrierNormals = [];
    const barrierIndices = [];

    const railLPositions = [];
    const railRPositions = [];

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i % this.segments];

      const lBase = frame.pos.clone().addScaledVector(frame.binormal, -halfW);
      const lTop = lBase.clone().addScaledVector(frame.normal, bHeight);
      railLPositions.push(lTop.clone());

      const rBase = frame.pos.clone().addScaledVector(frame.binormal, halfW);
      const rTop = rBase.clone().addScaledVector(frame.normal, bHeight);
      railRPositions.push(rTop.clone());

      barrierPositions.push(lBase.x, lBase.y, lBase.z, lTop.x, lTop.y, lTop.z);
      barrierPositions.push(rBase.x, rBase.y, rBase.z, rTop.x, rTop.y, rTop.z);

      const nL = frame.binormal.clone();
      const nR = frame.binormal.clone().negate();
      barrierNormals.push(nL.x, nL.y, nL.z, nL.x, nL.y, nL.z);
      barrierNormals.push(nR.x, nR.y, nR.z, nR.x, nR.y, nR.z);

      if (i < this.segments) {
        const b = i * 4;
        const nb = (i + 1) * 4;
        barrierIndices.push(b, b + 1, nb + 1);
        barrierIndices.push(b, nb + 1, nb);
        barrierIndices.push(b + 2, nb + 3, b + 3);
        barrierIndices.push(b + 2, nb + 2, nb + 3);
      }
    }

    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.Float32BufferAttribute(barrierPositions, 3));
    bGeo.setAttribute('normal', new THREE.Float32BufferAttribute(barrierNormals, 3));
    bGeo.setIndex(barrierIndices);

    const bMat = new THREE.MeshStandardMaterial({
      color: 0x1f2a36,
      roughness: 0.35,
      metalness: 0.88,
      side: THREE.DoubleSide
    });

    this.barrierMesh = new THREE.Mesh(bGeo, bMat);
    this.scene.add(this.barrierMesh);

    // Glowing Alpine Red / Ice Cyan Neon Guide Rails
    const railMat = new THREE.MeshBasicMaterial({ color: 0xFF3B30 });

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
    const linePositions = [];
    const lineColors = [];
    const lineIndices = [];
    const ribbonHalfW = 0.8;

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i % this.segments];

      const apexOffset = Math.max(-7.5, Math.min(7.5, -frame.bank * 28.0));
      const center = frame.pos.clone().addScaledVector(frame.binormal, apexOffset).addScaledVector(frame.normal, 0.08);

      const pL = center.clone().addScaledVector(frame.binormal, -ribbonHalfW);
      const pR = center.clone().addScaledVector(frame.binormal, ribbonHalfW);

      linePositions.push(pL.x, pL.y, pL.z);
      linePositions.push(pR.x, pR.y, pR.z);

      const heat = Math.min(1.0, frame.curvature * 3.8);
      const c = new THREE.Color().lerpColors(new THREE.Color(0x8AE2FF), new THREE.Color(0xFF3B30), heat);
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
      opacity: 0.68,
      side: THREE.DoubleSide
    });

    this.racingLineMesh = new THREE.Mesh(lineGeo, lineMat);
    this.scene.add(this.racingLineMesh);
  }

  generateCurveIndicators() {
    // Sharp mountain turn chevrons (Hairpin at u = 0.58, S-bends at u = 0.16)
    const chevronUValues = [
      0.15, 0.17, 0.19, 0.21,
      0.54, 0.56, 0.58, 0.60, 0.62,
      0.68, 0.70,
      0.90, 0.92
    ];

    const chevronGeo = new THREE.PlaneGeometry(3.6, 2.0);
    const chevronMat = new THREE.MeshBasicMaterial({ color: 0xFF3B30, side: THREE.DoubleSide });

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
    const padGeo = new THREE.PlaneGeometry(15.0, 7.0);
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

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x121a24, metalness: 0.9, roughness: 0.2 });
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x8AE2FF, transparent: true, opacity: 0.45, side: THREE.DoubleSide });

    this.checkpoints.forEach(cp => {
      const frame = this.getFrameAt(cp.u);
      const gateGroup = new THREE.Group();
      gateGroup.position.copy(frame.pos);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      gateGroup.quaternion.setFromRotationMatrix(m);

      const postL = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.4), frameMat);
      postL.position.set(-w * 0.5, h * 0.5, 0);
      gateGroup.add(postL);

      const postR = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.4), frameMat);
      postR.position.set(w * 0.5, h * 0.5, 0);
      gateGroup.add(postR);

      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 1.4, 1.4), frameMat);
      crossbar.position.set(0, h, 0);
      gateGroup.add(crossbar);

      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w - 1.0, h - 1.0), beamMat);
      plane.position.set(0, h * 0.5, 0);
      gateGroup.add(plane);

      this.checkpointGatesGroup.add(gateGroup);
    });
  }

  generateStuntRamps() {
    // 2 mountain ramps: Drop launch and Sky Bridge approach
    [0.34, 0.74].forEach(u => {
      const frame = this.getFrameAt(u);
      const rampGeo = new THREE.BoxGeometry(13.0, 1.5, 8.5);
      rampGeo.translate(0, 0.75, 4.25);
      rampGeo.rotateX(-0.16);

      const rampMat = new THREE.MeshStandardMaterial({
        color: 0x141f2e,
        metalness: 0.85,
        roughness: 0.3,
        emissive: new THREE.Color(0xFF3B30),
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

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x0c141d, metalness: 0.95, roughness: 0.2 });

    const pylonL = new THREE.Mesh(new THREE.BoxGeometry(2.0, h, 2.5), steelMat);
    pylonL.position.set(-w * 0.5, h * 0.5, 0);
    gantry.add(pylonL);

    const pylonR = new THREE.Mesh(new THREE.BoxGeometry(2.0, h, 2.5), steelMat);
    pylonR.position.set(w * 0.5, h * 0.5, 0);
    gantry.add(pylonR);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(w, 2.8, 3.2), steelMat);
    arch.position.set(0, h, 0);
    gantry.add(arch);

    const bannerGeo = new THREE.PlaneGeometry(w * 0.75, 2.2);
    const bannerMat = new THREE.MeshBasicMaterial({ color: 0xFF3B30, side: THREE.DoubleSide });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, h, 1.7);
    gantry.add(banner);

    this.startFinishGantry = gantry;
    this.scene.add(this.startFinishGantry);
  }

  generateStreetlights() {
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.35, 9.5, 8);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x0f1826, metalness: 0.9, roughness: 0.3 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0x8AE2FF });

    for (let i = 0; i < this.segments; i += 24) {
      const u = i / this.segments;
      const frame = this.getFrameAt(u);
      const isRight = (i % 48 === 0);
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
    return FUJI_DISTRICTS.find(d => normU >= d.range[0] && normU < d.range[1]) || FUJI_DISTRICTS[0];
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
