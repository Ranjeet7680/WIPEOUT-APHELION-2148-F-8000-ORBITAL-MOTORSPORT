import * as THREE from 'three';

// ============================================================================
// NEO-SHINJUKU RIFT: HYPER CIRCUIT // AETHER-9
// 8-DISTRICT FUTURISTIC HIGHWAY CIRCUIT WITH ELEVATED SPLITS, TUNNELS & JUMPS
// ============================================================================

export const DISTRICTS = [
  { id: 'neonCore', name: 'NEON CORE', subtitle: 'DISTRICT 01 // METROPOLIS HEART', range: [0.0, 0.16], color: '#00F0FF', theme: 'cyan' },
  { id: 'skyway', name: 'SKYWAY DISTRICT', subtitle: 'DISTRICT 02 // ELEVATED HIGHWAY (+600m)', range: [0.16, 0.28], color: '#7928CA', theme: 'purple' },
  { id: 'industrial', name: 'INDUSTRIAL RIFT', subtitle: 'DISTRICT 03 // HEAVY PRODUCTION & VENTS', range: [0.28, 0.42], color: '#FFB800', theme: 'amber' },
  { id: 'oldShinjuku', name: 'OLD SHINJUKU', subtitle: 'DISTRICT 04 // RETRO-CYBER STREETS', range: [0.42, 0.54], color: '#FF2A13', theme: 'vermilion' },
  { id: 'undercity', name: 'UNDERCITY', subtitle: 'DISTRICT 05 // SUBTERRANEAN PIPE CHASM', range: [0.54, 0.68], color: '#00FF66', theme: 'acid' },
  { id: 'aetherPort', name: 'AETHER PORT', subtitle: 'DISTRICT 06 // ORBITAL LAUNCH LANES', range: [0.68, 0.80], color: '#00D4FF', theme: 'blue' },
  { id: 'megaTower', name: 'MEGA TOWER ZONE', subtitle: 'DISTRICT 07 // MONOLITH CORE PLUNGE', range: [0.80, 0.90], color: '#FF007F', theme: 'magenta' },
  { id: 'quantum', name: 'QUANTUM OUTSKIRTS', subtitle: 'DISTRICT 08 // HYPERSONIC HOME STRETCH', range: [0.90, 1.0], color: '#EAEFF5', theme: 'white' }
];

export function isInsideTunnel(u) {
  const normU = ((u % 1.0) + 1.0) % 1.0;
  const tunnelRanges = [
    [0.075, 0.135],
    [0.315, 0.385],
    [0.455, 0.520],
    [0.560, 0.660],
    [0.815, 0.885]
  ];
  return tunnelRanges.some(([start, end]) => normU >= start && normU <= end);
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

export class CityCircuit {
  constructor(scene) {
    this.scene = scene;
    this.segments = 600;
    this.roadWidth = 28.0;
    this.barrierHeight = 1.8;

    this.samples = []; // Array of { u, pos, tangent, normal, binormal, curvature, bank, district }
    this.boostPads = [0.04, 0.18, 0.32, 0.47, 0.62, 0.74, 0.86, 0.95];
    this.checkpoints = [
      { u: 0.12, name: 'CP 01 // NEON GATE' },
      { u: 0.25, name: 'CP 02 // SKYWAY SUMMIT' },
      { u: 0.38, name: 'CP 03 // CRYO-TRENCH' },
      { u: 0.50, name: 'CP 04 // OLD ALLEY' },
      { u: 0.65, name: 'CP 05 // UNDERCITY EXIT' },
      { u: 0.78, name: 'CP 06 // LAUNCH PYLON' },
      { u: 0.88, name: 'CP 07 // MEGA TOWER SWEEP' },
      { u: 0.98, name: 'CP 08 // GANTRY APPROACH' }
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
    this.zebraCrossingsGroup = new THREE.Group();
    this.trafficLightsGroup = new THREE.Group();
    this.streetlightsGroup = new THREE.Group();

    this.scene.add(this.curveIndicatorsGroup);
    this.scene.add(this.boostPadsGroup);
    this.scene.add(this.checkpointGatesGroup);
    this.scene.add(this.stuntRampsGroup);
    this.scene.add(this.zebraCrossingsGroup);
    this.scene.add(this.trafficLightsGroup);
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
    this.generateZebraCrossings();
    this.generateTrafficLightGantries();
    this.generateStreetlights();
  }

  buildCircuitSpline() {
    // 26 carefully engineered 3D waypoints through Neo-Shinjuku
    // Seamless continuous loop: high-speed straightaways, elevated bridge climb, undercity tunnel,
    // and sweeping Southern Carousel return with zero self-intersections or kinks.
    const points = [
      new THREE.Vector3(0, 150, 0),         // 00: START/FINISH: Central Shinjuku Boulevard
      new THREE.Vector3(120, 148, 240),     // 01: Neon Core: Grand Holo-Spire Straight
      new THREE.Vector3(280, 145, 460),     // 02: Neon Core: High-speed S-Curve
      new THREE.Vector3(520, 170, 580),     // 03: Transition to Skyway District
      new THREE.Vector3(780, 240, 520),     // 04: Skyway: Elevated Bridge Climb (+240m)
      new THREE.Vector3(980, 310, 340),     // 05: Skyway: Apex Overlook of city skyline
      new THREE.Vector3(1050, 290, 80),     // 06: Skyway: Sweeping hairpin curve
      new THREE.Vector3(920, 210, -180),    // 07: Descent toward Industrial District
      new THREE.Vector3(760, 120, -360),    // 08: Industrial Rift: Factory corridor
      new THREE.Vector3(540, 80, -480),     // 09: Industrial Rift: Pipeline chicane
      new THREE.Vector3(300, 60, -560),     // 10: Industrial Rift: Steam vent straight
      new THREE.Vector3(60, 45, -590),      // 11: Entrance to Old Shinjuku
      new THREE.Vector3(-180, 35, -540),    // 12: Old Shinjuku: Dense narrow alleys
      new THREE.Vector3(-380, 25, -420),    // 13: Old Shinjuku: Wet asphalt chicane
      new THREE.Vector3(-520, 5, -280),     // 14: Tunnel Plunge into Undercity (-40m datum)
      new THREE.Vector3(-620, -40, -100),   // 15: Undercity: Dark subterranean highway
      new THREE.Vector3(-660, -40, 120),    // 16: Undercity: Maintenance pipe sprint
      new THREE.Vector3(-590, 10, 320),     // 17: Undercity Ramp Exit into Aether Port
      new THREE.Vector3(-450, 110, 480),    // 18: Aether Port: Spaceport launch pad flyover
      new THREE.Vector3(-280, 180, 520),    // 19: Aether Port: Orbital tether gantry
      new THREE.Vector3(-180, 185, 300),    // 20: Mega Tower Zone: Super-Spire Helix
      new THREE.Vector3(-220, 180, 100),    // 21: Mega Tower: High-speed sweep
      new THREE.Vector3(-200, 170, -60),    // 22: Quantum Outskirts: Descending approach
      new THREE.Vector3(-150, 160, -180),   // 23: Southern Carousel: Sweeping apex turn
      new THREE.Vector3(-70, 154, -200),    // 24: Southern Carousel Exit
      new THREE.Vector3(-10, 151, -100)     // 25: Boulevard Entry: Straight alignment into start line
    ];

    this.curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);

    this.samples = [];
    const worldUp = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= this.segments; i++) {
      const u = i / this.segments;
      const pos = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u).normalize();

      // Estimate curvature from tangent finite difference
      const nextU = (u + 0.005) % 1.0;
      const prevU = (u - 0.005 + 1.0) % 1.0;
      const nextTan = this.curve.getTangentAt(nextU).normalize();
      const prevTan = this.curve.getTangentAt(prevU).normalize();
      const dTan = nextTan.clone().sub(prevTan).multiplyScalar(100);
      const curvature = dTan.length();

      // Calculate dynamic banking angle (gentle, stable inward tilt on turns, clamped for high-speed stability)
      const crossHoriz = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const lateralTurn = dTan.dot(crossHoriz);
      const targetBank = THREE.MathUtils.clamp(-lateralTurn * 0.012, -0.12, 0.12);

      // Compute stable Frenet frame (Tangent, Normal, Binormal) referenced to world Up
      let binormal = new THREE.Vector3().crossVectors(tangent, worldUp);
      if (binormal.lengthSq() < 0.0001) {
        binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 0, 1));
      }
      binormal.normalize();
      let normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

      // Apply banking around tangent
      const bankQuat = new THREE.Quaternion().setFromAxisAngle(tangent, targetBank);
      normal.applyQuaternion(bankQuat);
      binormal.applyQuaternion(bankQuat);

      // Determine district
      const district = DISTRICTS.find(d => u >= d.range[0] && u < d.range[1]) || DISTRICTS[0];

      this.samples.push({
        u,
        pos,
        tangent,
        normal,
        binormal,
        curvature,
        bank: targetBank,
        district
      });
    }
  }

  generateRoadGeometry() {
    const halfW = this.roadWidth * 0.5;
    const verts = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i];
      const p = frame.pos;
      const b = frame.binormal;
      const n = frame.normal;

      // 6 profile vertices across track width for road crown & curb lips
      const p0 = p.clone().addScaledVector(b, -halfW);
      const p1 = p.clone().addScaledVector(b, -halfW * 0.75).addScaledVector(n, 0.05);
      const p2 = p.clone().addScaledVector(b, -halfW * 0.25).addScaledVector(n, 0.12);
      const p3 = p.clone().addScaledVector(b, halfW * 0.25).addScaledVector(n, 0.12);
      const p4 = p.clone().addScaledVector(b, halfW * 0.75).addScaledVector(n, 0.05);
      const p5 = p.clone().addScaledVector(b, halfW);

      verts.push(
        p0.x, p0.y, p0.z,
        p1.x, p1.y, p1.z,
        p2.x, p2.y, p2.z,
        p3.x, p3.y, p3.z,
        p4.x, p4.y, p4.z,
        p5.x, p5.y, p5.z
      );

      const v = (i / this.segments) * 90;
      uvs.push(
        0.0, v,
        0.2, v,
        0.4, v,
        0.6, v,
        0.8, v,
        1.0, v
      );

      for (let k = 0; k < 6; k++) {
        normals.push(n.x, n.y, n.z);
      }
    }

    for (let i = 0; i < this.segments; i++) {
      const row1 = i * 6;
      const row2 = (i + 1) * 6;
      for (let s = 0; s < 5; s++) {
        const a = row1 + s;
        const b = row1 + s + 1;
        const c = row2 + s;
        const d = row2 + s + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    let roadMat;
    if (typeof document !== 'undefined') {
      // High-definition Procedural Wet Asphalt Texture with luminous induction rails, lane markers & apex curbs
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Illuminated dark slate asphalt base (crisp road readability, never pitch black)
      ctx.fillStyle = '#18202e';
      ctx.fillRect(0, 0, 1024, 1024);

      // Micro-texture asphalt grain
      for (let p = 0; p < 6000; p++) {
        const px = Math.random() * 1024;
        const py = Math.random() * 1024;
        const gray = Math.floor(34 + Math.random() * 32);
        ctx.fillStyle = `rgb(${gray}, ${gray + 8}, ${gray + 20})`;
        ctx.fillRect(px, py, 2, 2);
      }

      // Outer Apex Curb Rumble Strips (Left Cyan/Black, Right Red/White)
      const curbPatternHeight = 64;
      for (let cy = 0; cy < 1024; cy += curbPatternHeight) {
        const isAlt = (Math.floor(cy / curbPatternHeight) % 2) === 0;
        // Left curb
        ctx.fillStyle = isAlt ? '#00F0FF' : '#0B1522';
        ctx.fillRect(0, cy, 32, curbPatternHeight);
        // Right curb
        ctx.fillStyle = isAlt ? '#FF2244' : '#FFFFFF';
        ctx.fillRect(992, cy, 32, curbPatternHeight);
      }

      // Solid fluorescent border lines
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(36, 0, 12, 1024);
      ctx.fillStyle = '#FFB800';
      ctx.fillRect(976, 0, 12, 1024);

      // Crisp White Dashed Lane Dividers (4 distinct driving lanes across 28m width)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 8;
      ctx.setLineDash([48, 40]);
      ctx.beginPath();
      ctx.moveTo(270, 0); ctx.lineTo(270, 1024);
      ctx.moveTo(754, 0); ctx.lineTo(754, 1024);
      ctx.stroke();

      // High-tech magnetic induction double-centerline (Glowing cyan with neon bloom)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 14;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(496, 0); ctx.lineTo(496, 1024);
      ctx.moveTo(528, 0); ctx.lineTo(528, 1024);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // High-visibility directional racing chevrons
      ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
      for (let cy = 160; cy < 1024; cy += 320) {
        ctx.beginPath();
        ctx.moveTo(512, cy - 42);
        ctx.lineTo(440, cy + 32);
        ctx.lineTo(468, cy + 32);
        ctx.lineTo(512, cy - 10);
        ctx.lineTo(556, cy + 32);
        ctx.lineTo(584, cy + 32);
        ctx.closePath();
        ctx.fill();
      }

      const roadTexture = new THREE.CanvasTexture(canvas);
      roadTexture.wrapS = THREE.RepeatWrapping;
      roadTexture.wrapT = THREE.RepeatWrapping;
      roadTexture.repeat.set(1, 1);

      roadMat = new THREE.MeshStandardMaterial({
        map: roadTexture,
        roughness: 0.22,
        metalness: 0.45,
        emissive: new THREE.Color(0x0c1e36),
        emissiveIntensity: 0.95
      });
    } else {
      roadMat = new THREE.MeshStandardMaterial({
        color: 0x18202e,
        roughness: 0.22,
        metalness: 0.45,
        emissive: new THREE.Color(0x0c1e36),
        emissiveIntensity: 0.95
      });
    }

    this.trackMesh = new THREE.Mesh(geo, roadMat);
    this.trackMesh.receiveShadow = true;
    this.scene.add(this.trackMesh);

    // Generate underside structural hull & aerodynamic girder spine
    const subVerts = [];
    const subIndices = [];
    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i];
      const p = frame.pos;
      const b = frame.binormal;
      const n = frame.normal;

      const sp0 = p.clone().addScaledVector(b, -halfW).addScaledVector(n, -0.4);
      const sp1 = p.clone().addScaledVector(b, -halfW * 0.4).addScaledVector(n, -2.4);
      const sp2 = p.clone().addScaledVector(b, halfW * 0.4).addScaledVector(n, -2.4);
      const sp3 = p.clone().addScaledVector(b, halfW).addScaledVector(n, -0.4);

      subVerts.push(
        sp0.x, sp0.y, sp0.z,
        sp1.x, sp1.y, sp1.z,
        sp2.x, sp2.y, sp2.z,
        sp3.x, sp3.y, sp3.z
      );
    }

    for (let i = 0; i < this.segments; i++) {
      const r1 = i * 4;
      const r2 = (i + 1) * 4;
      for (let s = 0; s < 3; s++) {
        subIndices.push(r1 + s, r2 + s, r1 + s + 1);
        subIndices.push(r1 + s + 1, r2 + s, r2 + s + 1);
      }
    }

    const subGeo = new THREE.BufferGeometry();
    subGeo.setAttribute('position', new THREE.Float32BufferAttribute(subVerts, 3));
    subGeo.setIndex(subIndices);
    subGeo.computeVertexNormals();

    const subMat = new THREE.MeshStandardMaterial({
      color: 0x0e1320,
      metalness: 0.9,
      roughness: 0.35,
      side: THREE.DoubleSide
    });
    this.substructureMesh = new THREE.Mesh(subGeo, subMat);
    this.substructureMesh.receiveShadow = true;
    this.scene.add(this.substructureMesh);
  }

  generateBarriersAndNeonRails() {
    const halfW = this.roadWidth * 0.5;
    const bVerts = [];
    const bIndices = [];
    const glowVerts = [];

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i];
      const p = frame.pos;
      const b = frame.binormal;
      const n = frame.normal;

      // Left Barrier Top & Bottom
      const lbBot = p.clone().addScaledVector(b, -halfW);
      const lbTop = lbBot.clone().addScaledVector(n, this.barrierHeight);

      // Right Barrier Top & Bottom
      const rbBot = p.clone().addScaledVector(b, halfW);
      const rbTop = rbBot.clone().addScaledVector(n, this.barrierHeight);

      bVerts.push(
        lbBot.x, lbBot.y, lbBot.z,
        lbTop.x, lbTop.y, lbTop.z,
        rbBot.x, rbBot.y, rbBot.z,
        rbTop.x, rbTop.y, rbTop.z
      );

      // Neon rail strips along the barrier rims
      glowVerts.push(
        lbTop.x, lbTop.y, lbTop.z,
        rbTop.x, rbTop.y, rbTop.z
      );
    }

    for (let i = 0; i < this.segments; i++) {
      const r1 = i * 4;
      const r2 = (i + 1) * 4;

      // Left barrier quad
      bIndices.push(r1 + 0, r1 + 1, r2 + 0);
      bIndices.push(r1 + 1, r2 + 1, r2 + 0);

      // Right barrier quad
      bIndices.push(r1 + 2, r2 + 2, r1 + 3);
      bIndices.push(r1 + 3, r2 + 2, r2 + 3);
    }

    const barrierGeo = new THREE.BufferGeometry();
    barrierGeo.setAttribute('position', new THREE.Float32BufferAttribute(bVerts, 3));
    barrierGeo.setIndex(bIndices);
    barrierGeo.computeVertexNormals();

    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x182436,
      metalness: 0.85,
      roughness: 0.28,
      emissive: new THREE.Color(0x0a1628),
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide
    });

    this.barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
    this.barrierMesh.castShadow = true;
    this.barrierMesh.receiveShadow = true;
    this.scene.add(this.barrierMesh);

    // Glowing Neon Rails atop barriers (Enlarged diameter for distant road readability)
    const leftRailCurve = [];
    const rightRailCurve = [];
    for (let i = 0; i <= this.segments; i += 4) {
      const frame = this.samples[i];
      const lb = frame.pos.clone().addScaledVector(frame.binormal, -halfW).addScaledVector(frame.normal, this.barrierHeight + 0.12);
      const rb = frame.pos.clone().addScaledVector(frame.binormal, halfW).addScaledVector(frame.normal, this.barrierHeight + 0.12);
      leftRailCurve.push(lb);
      rightRailCurve.push(rb);
    }

    const leftSpline = new THREE.CatmullRomCurve3(leftRailCurve, true);
    const rightSpline = new THREE.CatmullRomCurve3(rightRailCurve, true);

    const leftRailGeo = new THREE.TubeGeometry(leftSpline, 300, 0.32, 8, true);
    const rightRailGeo = new THREE.TubeGeometry(rightSpline, 300, 0.32, 8, true);

    this.leftRailMesh = new THREE.Mesh(leftRailGeo, new THREE.MeshBasicMaterial({ color: 0x00F0FF }));
    this.rightRailMesh = new THREE.Mesh(rightRailGeo, new THREE.MeshBasicMaterial({ color: 0xFF9900 }));

    this.scene.add(this.leftRailMesh);
    this.scene.add(this.rightRailMesh);
  }

  generateDynamicRacingLine() {
    const halfW = this.roadWidth * 0.5;
    const verts = [];
    const colors = [];
    const indices = [];

    const cGreen = new THREE.Color(0x00FF66);
    const cAmber = new THREE.Color(0xFFB800);
    const cRed = new THREE.Color(0xFF2A13);

    for (let i = 0; i <= this.segments; i++) {
      const frame = this.samples[i];
      const k = frame.curvature || 0;
      const bank = frame.bank || 0;
      // Lateral offset of racing line apex: swing out before curve, cut in at apex
      const lateralShift = THREE.MathUtils.clamp(-bank * 12.0, -halfW * 0.65, halfW * 0.65);

      const center = frame.pos.clone()
        .addScaledVector(frame.normal, 0.14)
        .addScaledVector(frame.binormal, lateralShift);

      const ribbonHalfW = 0.9;
      const leftV = center.clone().addScaledVector(frame.binormal, -ribbonHalfW);
      const rightV = center.clone().addScaledVector(frame.binormal, ribbonHalfW);

      verts.push(leftV.x, leftV.y, leftV.z);
      verts.push(rightV.x, rightV.y, rightV.z);

      // Vertex color based on curvature / braking requirement
      const col = new THREE.Color();
      if (k < 0.28) {
        col.copy(cGreen);
      } else if (k < 0.58) {
        const t = (k - 0.28) / (0.58 - 0.28);
        col.copy(cGreen).lerp(cAmber, t);
      } else {
        const t = Math.min(1.0, (k - 0.58) / 0.4);
        col.copy(cAmber).lerp(cRed, t);
      }

      colors.push(col.r, col.g, col.b);
      colors.push(col.r, col.g, col.b);
    }

    for (let i = 0; i < this.segments; i++) {
      const r1 = i * 2;
      const r2 = (i + 1) * 2;
      indices.push(r1, r2, r1 + 1);
      indices.push(r1 + 1, r2, r2 + 1);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);

    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.racingLineMesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.racingLineMesh);
  }

  generateCurveIndicators() {
    this.scene.add(this.curveIndicatorsGroup);

    // Scan for sharp curve peaks along track
    const halfW = this.roadWidth * 0.5;
    let lastU = -1.0;

    for (let i = 0; i < this.segments; i += 6) {
      const frame = this.samples[i];
      const k = frame.curvature || 0;
      if (k > 0.42 && (lastU < 0 || Math.abs(frame.u - lastU) > 0.035)) {
        lastU = frame.u;
        const isLeftTurn = (frame.bank || 0) > 0;
        // Mount sign on outside barrier
        const sideOffset = isLeftTurn ? (halfW + 0.3) : -(halfW + 0.3);
        const signPos = frame.pos.clone()
          .addScaledVector(frame.binormal, sideOffset)
          .addScaledVector(frame.normal, this.barrierHeight + 1.2);

        const signGroup = new THREE.Group();
        signGroup.position.copy(signPos);

        const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
        signGroup.quaternion.setFromRotationMatrix(m);

        // Sign board
        const boardGeo = new THREE.PlaneGeometry(3.6, 1.8);
        boardGeo.rotateY(isLeftTurn ? -Math.PI * 0.5 : Math.PI * 0.5);

        let boardMat;
        if (typeof document !== 'undefined') {
          const cv = document.createElement('canvas');
          cv.width = 256;
          cv.height = 128;
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#060B14';
          ctx.fillRect(0, 0, 256, 128);
          ctx.strokeStyle = '#FFB800';
          ctx.lineWidth = 6;
          ctx.strokeRect(4, 4, 248, 120);

          ctx.fillStyle = '#FFB800';
          ctx.font = 'bold 64px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(isLeftTurn ? '◄ ◄ ◄' : '► ► ►', 128, 64);

          const tex = new THREE.CanvasTexture(cv);
          boardMat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95
          });
        } else {
          boardMat = new THREE.MeshBasicMaterial({
            color: 0xFFB800,
            side: THREE.DoubleSide
          });
        }

        const boardMesh = new THREE.Mesh(boardGeo, boardMat);
        signGroup.add(boardMesh);
        this.curveIndicatorsGroup.add(signGroup);
      }
    }
  }

  generateBoostPads() {
    this.scene.add(this.boostPadsGroup);
    const padGeo = new THREE.PlaneGeometry(6.5, 9.0);
    padGeo.rotateX(-Math.PI * 0.5);

    let padMat;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#06080F';
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = '#00F0FF';
      // 3 Glowing boost chevrons
      for (let y = 40; y <= 180; y += 70) {
        ctx.beginPath();
        ctx.moveTo(128, y - 35);
        ctx.lineTo(30, y + 25);
        ctx.lineTo(60, y + 25);
        ctx.lineTo(128, y - 5);
        ctx.lineTo(196, y + 25);
        ctx.lineTo(226, y + 25);
        ctx.closePath();
        ctx.fill();
      }

      const padTex = new THREE.CanvasTexture(canvas);
      padMat = new THREE.MeshBasicMaterial({
        map: padTex,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
    } else {
      padMat = new THREE.MeshBasicMaterial({
        color: 0x00F0FF,
        transparent: true,
        opacity: 0.95
      });
    }

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
    this.scene.add(this.checkpointGatesGroup);

    this.checkpoints.forEach((cp, idx) => {
      const frame = this.getFrameAt(cp.u);
      const gateGroup = new THREE.Group();
      gateGroup.position.copy(frame.pos);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      gateGroup.quaternion.setFromRotationMatrix(m);

      // Massive holographic arch
      const w = this.roadWidth + 4;
      const h = 10.0;
      const archShape = new THREE.Shape();
      archShape.moveTo(-w * 0.5 - 1.2, 0);
      archShape.lineTo(-w * 0.5 - 1.2, h + 1.2);
      archShape.lineTo(w * 0.5 + 1.2, h + 1.2);
      archShape.lineTo(w * 0.5 + 1.2, 0);
      archShape.lineTo(w * 0.5, 0);
      archShape.lineTo(w * 0.5, h);
      archShape.lineTo(-w * 0.5, h);
      archShape.lineTo(-w * 0.5, 0);
      archShape.closePath();

      const archGeo = new THREE.ExtrudeGeometry(archShape, { depth: 2.2, bevelEnabled: false });
      archGeo.center();
      const archMat = new THREE.MeshStandardMaterial({
        color: 0x182030,
        metalness: 0.9,
        roughness: 0.2,
        emissive: new THREE.Color(0x00F0FF),
        emissiveIntensity: 0.6
      });
      const archMesh = new THREE.Mesh(archGeo, archMat);
      archMesh.position.set(0, h * 0.5, 0);
      gateGroup.add(archMesh);

      // Holographic checkpoint field curtain
      const curtainGeo = new THREE.PlaneGeometry(w, h);
      const curtainMat = new THREE.MeshBasicMaterial({
        color: 0x00F0FF,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const curtain = new THREE.Mesh(curtainGeo, curtainMat);
      curtain.position.set(0, h * 0.5, 0);
      gateGroup.add(curtain);

      this.checkpointGatesGroup.add(gateGroup);
    });
  }

  generateStuntRamps() {
    this.scene.add(this.stuntRampsGroup);

    const rampLocations = [0.22, 0.44, 0.82];
    const rampWidth = 16.0;
    const rampLength = 9.0;
    const rampHeight = 1.8;

    rampLocations.forEach((u, idx) => {
      const frame = this.getFrameAt(u);
      const rampGroup = new THREE.Group();
      rampGroup.position.copy(frame.pos).addScaledVector(frame.normal, 0.1);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      rampGroup.quaternion.setFromRotationMatrix(m);

      const rampGeo = new THREE.BoxGeometry(rampWidth, rampHeight, rampLength);
      rampGeo.translate(0, rampHeight * 0.5, rampLength * 0.5);
      rampGeo.rotateX(-0.16);

      const rampMat = new THREE.MeshStandardMaterial({
        color: 0x121724,
        metalness: 0.9,
        roughness: 0.25,
        emissive: new THREE.Color(0xFFB800),
        emissiveIntensity: 0.4
      });

      const rampMesh = new THREE.Mesh(rampGeo, rampMat);
      rampMesh.castShadow = true;
      rampGroup.add(rampMesh);

      const arrowGeo = new THREE.PlaneGeometry(rampWidth * 0.75, 1.2);
      const arrowMat = new THREE.MeshBasicMaterial({
        color: 0xFFB800,
        side: THREE.DoubleSide
      });
      for (let k = 1; k <= 3; k++) {
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.rotation.x = -Math.PI * 0.5 - 0.16;
        arrow.position.set(0, 0.25 + k * 0.45, k * 2.4);
        rampGroup.add(arrow);
      }

      this.stuntRampsGroup.add(rampGroup);
    });
  }

  generateStartFinishArch() {
    const frame = this.samples[0];
    const gantry = new THREE.Group();
    gantry.position.copy(frame.pos);

    const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
    gantry.quaternion.setFromRotationMatrix(m);

    // Multi-tier metallic gantry tower with digital LED matrix
    const w = this.roadWidth + 8;
    const h = 14.0;
    const towerGeo = new THREE.BoxGeometry(2.5, h, 3.5);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x111622, metalness: 0.95, roughness: 0.2 });

    const leftTower = new THREE.Mesh(towerGeo, towerMat);
    leftTower.position.set(-w * 0.5, h * 0.5, 0);
    gantry.add(leftTower);

    const rightTower = new THREE.Mesh(towerGeo, towerMat);
    rightTower.position.set(w * 0.5, h * 0.5, 0);
    gantry.add(rightTower);

    const bridgeGeo = new THREE.BoxGeometry(w + 3, 2.5, 3.5);
    const bridge = new THREE.Mesh(bridgeGeo, towerMat);
    bridge.position.set(0, h + 1.25, 0);
    gantry.add(bridge);

    // Large glowing START / FINISH digital sign
    let signMat;
    if (typeof document !== 'undefined') {
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 1024;
      signCanvas.height = 256;
      const sctx = signCanvas.getContext('2d');
      sctx.fillStyle = '#060912';
      sctx.fillRect(0, 0, 1024, 256);
      sctx.strokeStyle = '#00F0FF';
      sctx.lineWidth = 12;
      sctx.strokeRect(10, 10, 1004, 236);
      sctx.fillStyle = '#FFFFFF';
      sctx.font = 'bold 90px monospace';
      sctx.textAlign = 'center';
      sctx.fillText('◄◄  NEO-SHINJUKU START // FINISH  ►►', 512, 120);
      sctx.fillStyle = '#00F0FF';
      sctx.font = 'bold 50px monospace';
      sctx.fillText('HYPER CIRCUIT // AETHER-9 // SECTOR 07', 512, 195);

      const signTex = new THREE.CanvasTexture(signCanvas);
      signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    } else {
      signMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, side: THREE.DoubleSide });
    }
    const signGeo = new THREE.PlaneGeometry(w - 2, 2.8);
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, h + 1.25, 1.8);
    gantry.add(signMesh);

    this.startFinishGantry = gantry;
    this.scene.add(gantry);
  }

  generateZebraCrossings() {
    // 6 major urban intersections with high-visibility zebra crossings across the circuit
    const crossingUValues = [0.02, 0.16, 0.24, 0.425, 0.70, 0.93];
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.25,
      metalness: 0.15,
      emissive: new THREE.Color(0xD8EEFF),
      emissiveIntensity: 0.22
    });

    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xFFB800,
      roughness: 0.3,
      metalness: 0.2,
      emissive: new THREE.Color(0xFFB800),
      emissiveIntensity: 0.18
    });

    crossingUValues.forEach(u => {
      const frame = this.getFrameAt(u);
      const crossGroup = new THREE.Group();
      crossGroup.position.copy(frame.pos);
      crossGroup.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
      );

      // 16 high-contrast thermal-plastic zebra crosswalk stripes spanning the road width
      const stripeCount = 16;
      const span = this.roadWidth * 0.90;
      const stripeWidth = 1.15;
      const stripeLength = 4.8;
      const stripeThickness = 0.035;
      const stripeGeo = new THREE.BoxGeometry(stripeWidth, stripeThickness, stripeLength);

      for (let s = 0; s < stripeCount; s++) {
        const offset = -span * 0.5 + (s / (stripeCount - 1)) * span;
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(offset, 0.08, 0);
        crossGroup.add(stripe);
      }

      // Yellow Pedestrian Safety Endcaps
      [-span * 0.52, span * 0.52].forEach(ex => {
        const borderGeo = new THREE.BoxGeometry(0.35, stripeThickness, stripeLength);
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.set(ex, 0.08, 0);
        crossGroup.add(border);
      });

      // Stop Line 3.4m before zebra crossing
      const stopLineGeo = new THREE.BoxGeometry(span, stripeThickness, 0.55);
      const stopLine = new THREE.Mesh(stopLineGeo, stripeMat);
      stopLine.position.set(0, 0.08, -3.4);
      crossGroup.add(stopLine);

      this.zebraCrossingsGroup.add(crossGroup);
    });
  }

  generateTrafficLightGantries() {
    // Located right at the zebra crossings / highway intersections
    const gantryUValues = [0.018, 0.158, 0.238, 0.423, 0.698, 0.928];

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x161c28,
      metalness: 0.92,
      roughness: 0.25
    });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xFF1E28 });
    const amberMat = new THREE.MeshBasicMaterial({ color: 0xFFA500 });
    const greenMat = new THREE.MeshBasicMaterial({ color: 0x00FF66 });

    gantryUValues.forEach((u) => {
      const frame = this.getFrameAt(u);
      const gantryGroup = new THREE.Group();
      gantryGroup.position.copy(frame.pos);
      gantryGroup.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
      );

      const span = this.roadWidth + 12; // 40m span ensures pylons sit 6m+ clear of barriers
      const height = 14.5; // 14.5m clearance guarantees high-speed vehicles never intersect overhead truss

      // Vertical Support Truss Pylons on both curbs
      [-span * 0.48, span * 0.48].forEach(px => {
        const pylonGeo = new THREE.BoxGeometry(0.65, height, 0.65);
        const pylon = new THREE.Mesh(pylonGeo, steelMat);
        pylon.position.set(px, height * 0.5, 0);
        gantryGroup.add(pylon);
      });

      // Overhead Horizontal Bridge Truss
      const trussGeo = new THREE.BoxGeometry(span, 0.75, 0.75);
      const truss = new THREE.Mesh(trussGeo, steelMat);
      truss.position.set(0, height, 0);
      gantryGroup.add(truss);

      // 4 Suspended 3-Aspect Traffic Signals hanging over road lanes
      const laneOffsets = [-span * 0.32, -span * 0.11, span * 0.11, span * 0.32];
      laneOffsets.forEach(lx => {
        const sigGroup = new THREE.Group();
        sigGroup.position.set(lx, height - 1.1, 0);

        // Hanger Arm
        const hangerGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
        const hanger = new THREE.Mesh(hangerGeo, steelMat);
        hanger.position.y = 0.65;
        sigGroup.add(hanger);

        // Signal Housing Box
        const houseGeo = new THREE.BoxGeometry(0.5, 1.45, 0.38);
        const house = new THREE.Mesh(houseGeo, steelMat);
        sigGroup.add(house);

        // Sun Visor Backplate
        const plateGeo = new THREE.BoxGeometry(0.65, 1.6, 0.04);
        const plate = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({ color: 0x0a0d12 }));
        plate.position.z = -0.18;
        sigGroup.add(plate);

        // 3 Circular Signal Lenses (Red, Amber, Green) with Visors
        const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
        lensGeo.rotateX(Math.PI * 0.5);

        // Top: Red
        const redLens = new THREE.Mesh(lensGeo, redMat);
        redLens.position.set(0, 0.42, 0.16);
        sigGroup.add(redLens);

        // Middle: Amber
        const ambLens = new THREE.Mesh(lensGeo, amberMat);
        ambLens.position.set(0, 0.0, 0.16);
        sigGroup.add(ambLens);

        // Bottom: Green (illuminated)
        const grnLens = new THREE.Mesh(lensGeo, greenMat);
        grnLens.position.set(0, -0.42, 0.16);
        sigGroup.add(grnLens);

        gantryGroup.add(sigGroup);
      });

      // Digital Overhead Speed & Highway Info Sign
      const signGeo = new THREE.PlaneGeometry(8.0, 1.4);
      let signTex = null;
      if (typeof document !== 'undefined') {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#060A14';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, 504, 120);
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SPEED LIMIT 420 KM/H', 256, 52);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('◄ PEDESTRIAN CROSSING AHEAD ►', 256, 96);
        signTex = new THREE.CanvasTexture(c);
      }
      const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, height + 1.2, 0);
      gantryGroup.add(sign);

      this.trafficLightsGroup.add(gantryGroup);
    });
  }

  generateStreetlights() {
    // Streetlights placed along the highway every ~0.025 U on open-air sections
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 9.5, 8);
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8);
    armGeo.rotateZ(Math.PI * 0.42);
    const headGeo = new THREE.BoxGeometry(0.55, 0.18, 1.1);
    const luminaireGeo = new THREE.PlaneGeometry(0.48, 0.95);
    luminaireGeo.rotateX(Math.PI * 0.5);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1a2130, metalness: 0.9, roughness: 0.3 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xE8F6FF });

    for (let i = 0; i < 40; i++) {
      const u = (i / 40.0) % 1.0;
      if (isInsideTunnel(u)) continue; // Tunnels feature integrated architectural LED guide tracks, no streetlights
      const frame = this.getFrameAt(u);
      const isRight = (i % 2 === 0);
      const sideOffset = isRight ? (this.roadWidth * 0.5 + 3.2) : -(this.roadWidth * 0.5 + 3.2);

      const lightGroup = new THREE.Group();
      lightGroup.position.copy(frame.pos).addScaledVector(frame.binormal, sideOffset);
      lightGroup.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
      );

      // Vertical Pole
      const pole = new THREE.Mesh(poleGeo, metalMat);
      pole.position.y = 4.75;
      lightGroup.add(pole);

      // Overhanging Arm
      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.position.set(isRight ? -1.8 : 1.8, 9.2, 0);
      lightGroup.add(arm);

      // Cobra Lamp Head
      const head = new THREE.Mesh(headGeo, metalMat);
      head.position.set(isRight ? -3.4 : 3.4, 9.0, 0);
      lightGroup.add(head);

      // Glowing LED Luminaire
      const luminaire = new THREE.Mesh(luminaireGeo, lampGlowMat);
      luminaire.position.set(isRight ? -3.4 : 3.4, 8.9, 0);
      lightGroup.add(luminaire);

      this.streetlightsGroup.add(lightGroup);
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

    // Fast path: if a hint position along track is provided, search localized window first!
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
      if (minDistSq < 1600) { // Found within 40m
        _scratchDeltaVec.copy(worldPos).sub(closestFrame.pos);
        _closestResult.frame = closestFrame;
        _closestResult.u = closestFrame.u;
        _closestResult.lateralOffset = _scratchDeltaVec.dot(closestFrame.binormal);
        _closestResult.trackWidth = this.roadWidth;
        _closestResult.distance = Math.sqrt(minDistSq);
        return _closestResult;
      }
    }

    const step = 6; // Fast coarse search
    for (let i = 0; i < this.segments; i += step) {
      const dSq = this.samples[i].pos.distanceToSquared(worldPos);
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closestFrame = this.samples[i];
      }
    }

    // Refined localized search around candidate
    const centerIdx = Math.floor(closestFrame.u * this.segments);
    const searchRadius = 8;
    for (let offset = -searchRadius; offset <= searchRadius; offset++) {
      const idx = ((centerIdx + offset) % this.segments + this.segments) % this.segments;
      const dSq = this.samples[idx].pos.distanceToSquared(worldPos);
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closestFrame = this.samples[idx];
      }
    }

    // Compute lateral offset from track centerline (zero allocation)
    _scratchDeltaVec.copy(worldPos).sub(closestFrame.pos);
    const lateralOffset = _scratchDeltaVec.dot(closestFrame.binormal);

    _closestResult.frame = closestFrame;
    _closestResult.u = closestFrame.u;
    _closestResult.lateralOffset = lateralOffset;
    _closestResult.trackWidth = this.roadWidth;
    _closestResult.distance = Math.sqrt(minDistSq);
    return _closestResult;
  }

  setLap(lap) {
    this.currentLap = lap;
    // Dynamic elimination hazard escalation (PDF Section 5 & 15)
    if (this.checkpointGatesGroup) {
      this.checkpointGatesGroup.children.forEach((gate, idx) => {
        // Find gate light materials
        gate.traverse(child => {
          if (child.isMesh && child.material && child.material.color) {
            if (lap >= 3) {
              // Critical elimination state: Emergency warning red
              if (child.material.emissive) {
                child.material.emissive.setHex(0xFF0033);
                child.material.emissiveIntensity = 1.8;
              }
            } else if (lap === 2) {
              // Escalating state: Warning amber
              if (child.material.emissive) {
                child.material.emissive.setHex(0xFFAA00);
                child.material.emissiveIntensity = 1.2;
              }
            }
          }
        });
      });
    }
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
    if (this.zebraCrossingsGroup) this.zebraCrossingsGroup.visible = visible;
    if (this.trafficLightsGroup) this.trafficLightsGroup.visible = visible;
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
      this.zebraCrossingsGroup,
      this.trafficLightsGroup,
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
