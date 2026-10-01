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

export class CityCircuit {
  constructor(scene) {
    this.scene = scene;
    this.segments = 600;
    this.roadWidth = 26.0;
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
      { u: 0.88, name: 'CP 07 // SPIRE PLUNGE' },
      { u: 0.98, name: 'CP 08 // GANTRY APPROACH' }
    ];

    this.trackMesh = null;
    this.barrierMesh = null;
    this.glowRailsMesh = null;
    this.boostPadsGroup = new THREE.Group();
    this.checkpointGatesGroup = new THREE.Group();
    this.stuntRampsGroup = new THREE.Group();
    this.startFinishGantry = null;

    this.buildCircuitSpline();
    this.generateRoadGeometry();
    this.generateBarriersAndNeonRails();
    this.generateBoostPads();
    this.generateCheckpointGates();
    this.generateStuntRamps();
    this.generateStartFinishArch();
  }

  buildCircuitSpline() {
    // 24 carefully engineered 3D waypoints through Neo-Shinjuku
    // Creates high-speed straightaways, 90° chicanes, bridge climbs, a massive 70° vertical dive, and an undercity tunnel
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
      new THREE.Vector3(-100, 260, 420),    // 20: Mega Tower Zone: Super-Spire Helix
      new THREE.Vector3(60, 290, 240),      // 21: Mega Tower: Apex before the dive
      new THREE.Vector3(40, 210, 100),      // 22: Mega Tower: 70° vertical plunge
      new THREE.Vector3(10, 160, 30)        // 23: Quantum Outskirts: High-speed recovery to gantry
    ];

    this.curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);

    this.samples = [];
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

      // Calculate dynamic banking angle (inward tilt on sharp turns)
      const crossHoriz = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const lateralTurn = dTan.dot(crossHoriz);
      const targetBank = THREE.MathUtils.clamp(-lateralTurn * 0.035, -Math.PI * 0.35, Math.PI * 0.35);

      // Compute Frenet frame (Tangent, Normal, Binormal)
      let normal = new THREE.Vector3(0, 1, 0);
      let binormal = new THREE.Vector3().crossVectors(tangent, normal);
      if (binormal.lengthSq() < 0.001) {
        normal = new THREE.Vector3(1, 0, 0);
        binormal = new THREE.Vector3().crossVectors(tangent, normal);
      }
      binormal.normalize();
      normal.crossVectors(binormal, tangent).normalize();

      // Apply banking
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

      const v = (i / this.segments) * 120;
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
      // Procedural Wet Asphalt Texture with glowing neon cyan induction centerlines & road markings
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Dark wet asphalt base
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, 1024, 1024);

      // Asphalt aggregate grain & micro-noise
      for (let p = 0; p < 8000; p++) {
        const px = Math.random() * 1024;
        const py = Math.random() * 1024;
        const gray = Math.floor(18 + Math.random() * 22);
        ctx.fillStyle = `rgb(${gray}, ${gray + 4}, ${gray + 10})`;
        ctx.fillRect(px, py, 2, 2);
      }

      // Outer neon guidance borders (Left Cyan, Right Amber/Red)
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(20, 0, 14, 1024);
      ctx.fillStyle = '#FF2A13';
      ctx.fillRect(990, 0, 14, 1024);

      // Dashed lane divider lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 6;
      ctx.setLineDash([40, 40]);
      ctx.beginPath();
      ctx.moveTo(310, 0); ctx.lineTo(310, 1024);
      ctx.moveTo(714, 0); ctx.lineTo(714, 1024);
      ctx.stroke();

      // High-tech magnetic induction double-centerline (electric cyan with glow)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(500, 0); ctx.lineTo(500, 1024);
      ctx.moveTo(524, 0); ctx.lineTo(524, 1024);
      ctx.stroke();

      // Directional chevron speed markings
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      for (let cy = 120; cy < 1024; cy += 256) {
        ctx.beginPath();
        ctx.moveTo(512, cy - 30);
        ctx.lineTo(460, cy + 30);
        ctx.lineTo(480, cy + 30);
        ctx.lineTo(512, cy);
        ctx.lineTo(544, cy + 30);
        ctx.lineTo(564, cy + 30);
        ctx.closePath();
        ctx.fill();
      }

      const roadTexture = new THREE.CanvasTexture(canvas);
      roadTexture.wrapS = THREE.RepeatWrapping;
      roadTexture.wrapT = THREE.RepeatWrapping;
      roadTexture.repeat.set(1, 60);

      roadMat = new THREE.MeshStandardMaterial({
        map: roadTexture,
        roughness: 0.22,
        metalness: 0.65,
        emissive: new THREE.Color(0x020810),
        emissiveIntensity: 0.5
      });
    } else {
      roadMat = new THREE.MeshStandardMaterial({
        color: 0x080a0f,
        roughness: 0.22,
        metalness: 0.65
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
      color: 0x182030,
      metalness: 0.85,
      roughness: 0.28,
      emissive: new THREE.Color(0x060c18),
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide
    });

    this.barrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
    this.barrierMesh.castShadow = true;
    this.barrierMesh.receiveShadow = true;
    this.scene.add(this.barrierMesh);

    // Glowing Neon Rails atop barriers
    const railMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      wireframe: false
    });
    // Create tube or ribbon for neon glow rail
    const leftRailCurve = [];
    const rightRailCurve = [];
    for (let i = 0; i <= this.segments; i += 4) {
      const frame = this.samples[i];
      const lb = frame.pos.clone().addScaledVector(frame.binormal, -halfW).addScaledVector(frame.normal, this.barrierHeight + 0.1);
      const rb = frame.pos.clone().addScaledVector(frame.binormal, halfW).addScaledVector(frame.normal, this.barrierHeight + 0.1);
      leftRailCurve.push(lb);
      rightRailCurve.push(rb);
    }

    const leftSpline = new THREE.CatmullRomCurve3(leftRailCurve, true);
    const rightSpline = new THREE.CatmullRomCurve3(rightRailCurve, true);

    const leftRailGeo = new THREE.TubeGeometry(leftSpline, 300, 0.25, 6, true);
    const rightRailGeo = new THREE.TubeGeometry(rightSpline, 300, 0.25, 6, true);

    const leftRailMesh = new THREE.Mesh(leftRailGeo, new THREE.MeshBasicMaterial({ color: 0x00F0FF }));
    const rightRailMesh = new THREE.Mesh(rightRailGeo, new THREE.MeshBasicMaterial({ color: 0xFF2A13 }));

    this.scene.add(leftRailMesh);
    this.scene.add(rightRailMesh);
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

  getFrameAt(u) {
    const normU = ((u % 1.0) + 1.0) % 1.0;
    const index = Math.floor(normU * this.segments);
    return this.samples[index] || this.samples[0];
  }

  getClosestFrame(worldPos) {
    let closestFrame = this.samples[0];
    let minDistSq = Infinity;
    const step = 4; // Fast coarse search

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

    // Compute lateral offset from track centerline
    const delta = worldPos.clone().sub(closestFrame.pos);
    const lateralOffset = delta.dot(closestFrame.binormal);

    return {
      frame: closestFrame,
      u: closestFrame.u,
      lateralOffset,
      trackWidth: this.roadWidth,
      distance: Math.sqrt(minDistSq)
    };
  }

  update(delta) {
    // Pulse boost pads and holographic gates
    const t = performance.now() * 0.003;
    if (this.boostPadsGroup) {
      this.boostPadsGroup.children.forEach((mesh, idx) => {
        mesh.material.opacity = 0.75 + Math.sin(t * 3.0 + idx) * 0.25;
      });
    }
  }
}
