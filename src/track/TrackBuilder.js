import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - PROCEDURAL TRACK BUILDER
// Superconductor magnetic ribbon, induction rails, boost pads & spatial chevrons
// ============================================================================

export class TrackBuilder {
  constructor(scene, circuitData) {
    this.scene = scene;
    this.data = circuitData;
    this.segments = 400; // Resolution of spline ribbon
    this.trackWidth = 20.0;
    this.railHeight = 1.6;

    // Frenet frames and sample points
    this.curve = null;
    this.samples = []; // Array of { u, pos, tangent, normal, binormal, curvature, bank }
    
    // Meshes
    this.trackMesh = null;
    this.railsMesh = null;
    this.boostPadMeshes = [];
    this.apexChevronMeshes = [];
    this.archMeshes = [];

    this.build();
  }

  build() {
    // 1. Create CatmullRom Curve
    this.curve = new THREE.CatmullRomCurve3(this.data.controlPoints, true, 'catmullrom', 0.5);

    // 2. Sample the spline with advanced dynamic banking and curvature calculation
    this.computeTrackFrames();

    // 3. Generate 3D procedural ribbon geometry
    this.buildRibbonGeometry();

    // 4. Generate magnetic induction guide rails
    this.buildGuideRails();

    // 5. Generate boost acceleration pads
    this.buildBoostPads();

    // 6. Generate spatial apex telemetry chevrons
    this.buildApexChevrons();

    // 7. Generate magnetic containment arches & vacuum rift gates
    this.buildContainmentArches();
  }

  computeTrackFrames() {
    this.samples = [];
    const numSamples = this.segments;

    // Up vector for initial reference
    let lastUp = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= numSamples; i++) {
      const u = i / numSamples;
      const pos = this.curve.getPointAt(u);
      const tangent = this.curve.getTangentAt(u).normalize();

      // Estimate curvature from finite difference
      const nextU = (u + 0.01) % 1.0;
      const prevU = (u - 0.01 + 1.0) % 1.0;
      const nextTan = this.curve.getTangentAt(nextU).normalize();
      const prevTan = this.curve.getTangentAt(prevU).normalize();
      const dTan = nextTan.clone().sub(prevTan).multiplyScalar(50);
      const curvature = dTan.length();

      // Desired bank angle based on lateral turn
      const crossHorizontal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const lateralTurn = dTan.dot(crossHorizontal);
      const targetBank = THREE.MathUtils.clamp(-lateralTurn * 0.025, -Math.PI * 0.42, Math.PI * 0.42);

      // Compute normal and binormal
      let normal = new THREE.Vector3(0, 1, 0);
      let binormal = new THREE.Vector3().crossVectors(tangent, normal);

      if (binormal.lengthSq() < 0.001) {
        normal = new THREE.Vector3(1, 0, 0);
        binormal = new THREE.Vector3().crossVectors(tangent, normal);
      }
      binormal.normalize();
      normal.crossVectors(binormal, tangent).normalize();

      // Apply banking rotation around the tangent axis
      const bankQuat = new THREE.Quaternion().setFromAxisAngle(tangent, targetBank);
      normal.applyQuaternion(bankQuat);
      binormal.applyQuaternion(bankQuat);

      this.samples.push({
        u,
        pos,
        tangent,
        normal,
        binormal,
        curvature,
        bank: targetBank
      });
    }
  }

  buildRibbonGeometry() {
    const numSamples = this.segments;
    const halfWidth = this.trackWidth * 0.5;

    // We generate vertices for a ribbon with cross-section profile:
    // Left rail lip (-halfWidth), track bed, Right rail lip (+halfWidth)
    const verts = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    for (let i = 0; i <= numSamples; i++) {
      const frame = this.samples[i];
      const p = frame.pos;
      const b = frame.binormal;
      const n = frame.normal;

      // 4 points across the track width: Left Edge, Center-Left, Center-Right, Right Edge
      const p0 = p.clone().addScaledVector(b, -halfWidth);
      const p1 = p.clone().addScaledVector(b, -halfWidth * 0.35);
      const p2 = p.clone().addScaledVector(b, halfWidth * 0.35);
      const p3 = p.clone().addScaledVector(b, halfWidth);

      // Push vertices
      verts.push(p0.x, p0.y, p0.z);
      verts.push(p1.x, p1.y, p1.z);
      verts.push(p2.x, p2.y, p2.z);
      verts.push(p3.x, p3.y, p3.z);

      // UVs: V coordinates along length, U across width
      const v = (i / numSamples) * 80;
      uvs.push(0, v, 0.35, v, 0.65, v, 1, v);

      // Normals
      for (let k = 0; k < 4; k++) {
        normals.push(n.x, n.y, n.z);
      }
    }

    // Build quad indices
    for (let i = 0; i < numSamples; i++) {
      const row1 = i * 4;
      const row2 = (i + 1) * 4;

      for (let seg = 0; seg < 3; seg++) {
        const a = row1 + seg;
        const b = row1 + seg + 1;
        const c = row2 + seg;
        const d = row2 + seg + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);

    // Matte Obsidian roadbed material with frosted photovoltaic tile reflections
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0F1115';
    ctx.fillRect(0, 0, 512, 512);

    // Photovoltaic grid lines
    ctx.strokeStyle = '#181C26';
    ctx.lineWidth = 4;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y < 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Centerline induction guidance stripe
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();

    // Secondary dashed telemetry lines
    ctx.strokeStyle = '#7928CA';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 512);
    ctx.moveTo(384, 0);
    ctx.lineTo(384, 512);
    ctx.stroke();

    const roadTexture = new THREE.CanvasTexture(canvas);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 40);

    const mat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.35,
      metalness: 0.85,
      emissive: new THREE.Color(0x020813),
      emissiveIntensity: 0.4
    });

    this.trackMesh = new THREE.Mesh(geo, mat);
    this.trackMesh.castShadow = true;
    this.trackMesh.receiveShadow = true;
    this.scene.add(this.trackMesh);
  }

  buildGuideRails() {
    // Left and Right Superconductor Violet Magnetic Induction Rails
    const halfWidth = this.trackWidth * 0.5;
    const numSamples = this.segments;

    const buildRail = (sideMultiplier) => {
      const railVerts = [];
      const railIndices = [];
      const railNormals = [];

      for (let i = 0; i <= numSamples; i++) {
        const frame = this.samples[i];
        const p = frame.pos;
        const b = frame.binormal;
        const n = frame.normal;

        const basePos = p.clone().addScaledVector(b, sideMultiplier * halfWidth);
        const topPos = basePos.clone().addScaledVector(n, this.railHeight);
        const outerPos = basePos.clone().addScaledVector(b, sideMultiplier * 0.6).addScaledVector(n, this.railHeight * 0.5);

        railVerts.push(basePos.x, basePos.y, basePos.z);
        railVerts.push(topPos.x, topPos.y, topPos.z);
        railVerts.push(outerPos.x, outerPos.y, outerPos.z);

        for (let k = 0; k < 3; k++) {
          railNormals.push(-b.x * sideMultiplier, -b.y * sideMultiplier, -b.z * sideMultiplier);
        }
      }

      for (let i = 0; i < numSamples; i++) {
        const row1 = i * 3;
        const row2 = (i + 1) * 3;

        // Front Face
        railIndices.push(row1, row1 + 1, row2);
        railIndices.push(row1 + 1, row2 + 1, row2);

        // Top/Outer Face
        railIndices.push(row1 + 1, row1 + 2, row2 + 1);
        railIndices.push(row1 + 2, row2 + 2, row2 + 1);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(railVerts, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(railNormals, 3));
      geo.setIndex(railIndices);

      const mat = new THREE.MeshStandardMaterial({
        color: 0x140c24,
        roughness: 0.2,
        metalness: 0.9,
        emissive: new THREE.Color(0x7928CA),
        emissiveIntensity: 0.9
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    };

    buildRail(-1);
    buildRail(1);
  }

  buildBoostPads() {
    const padTexCanvas = document.createElement('canvas');
    padTexCanvas.width = 256;
    padTexCanvas.height = 256;
    const ctx = padTexCanvas.getContext('2d');

    ctx.fillStyle = '#05040d';
    ctx.fillRect(0, 0, 256, 256);

    // Glowing Chevrons pointing forward
    ctx.fillStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 15;

    for (let y = 40; y < 240; y += 70) {
      ctx.beginPath();
      ctx.moveTo(128, y - 30);
      ctx.lineTo(220, y + 25);
      ctx.lineTo(190, y + 25);
      ctx.lineTo(128, y - 10);
      ctx.lineTo(66, y + 25);
      ctx.lineTo(36, y + 25);
      ctx.closePath();
      ctx.fill();
    }

    const padTexture = new THREE.CanvasTexture(padTexCanvas);

    for (const u of this.data.boostPads) {
      const idx = Math.floor(u * this.segments);
      const frame = this.samples[idx];

      const padGeo = new THREE.PlaneGeometry(8, 14);
      const padMat = new THREE.MeshBasicMaterial({
        map: padTexture,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });

      const padMesh = new THREE.Mesh(padGeo, padMat);
      // Align with track frame
      padMesh.position.copy(frame.pos).addScaledVector(frame.normal, 0.08);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.tangent, frame.normal);
      padMesh.quaternion.setFromRotationMatrix(m);

      this.scene.add(padMesh);
      this.boostPadMeshes.push({ mesh: padMesh, u, active: true });
    }
  }

  buildApexChevrons() {
    // 3D Diegetic Apex Chevron Holographic Gates
    for (const u of this.data.apexPoints) {
      const idx = Math.floor(u * this.segments);
      const frame = this.samples[idx];

      const chevronGroup = new THREE.Group();

      // Create 3 layered floating chevrons
      for (let c = 0; c < 3; c++) {
        const shape = new THREE.Shape();
        shape.moveTo(-3.5, -0.6);
        shape.lineTo(0, 2.2);
        shape.lineTo(3.5, -0.6);
        shape.lineTo(2.4, -0.6);
        shape.lineTo(0, 1.2);
        shape.lineTo(-2.4, -0.6);
        shape.closePath();

        const geo = new THREE.ShapeGeometry(shape);
        const mat = new THREE.MeshBasicMaterial({
          color: 0x00F0FF,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        });

        const chevron = new THREE.Mesh(geo, mat);
        chevron.position.set(0, 3.5 + c * 1.8, -c * 5.0);
        chevronGroup.add(chevron);
      }

      // Position along track
      chevronGroup.position.copy(frame.pos);
      const rotMat = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      chevronGroup.quaternion.setFromRotationMatrix(rotMat);

      this.scene.add(chevronGroup);
      this.apexChevronMeshes.push({
        group: chevronGroup,
        u,
        baseColor: new THREE.Color(0x00F0FF),
        dangerColor: new THREE.Color(0xFF2A13)
      });
    }
  }

  buildContainmentArches() {
    // Energy Containment Rings over track every ~50 segments
    const ringSpacing = 35;
    for (let i = 0; i < this.segments; i += ringSpacing) {
      const frame = this.samples[i];

      const archRadius = this.trackWidth * 0.65;
      const archGeo = new THREE.TorusGeometry(archRadius, 0.45, 12, 32, Math.PI);
      const archMat = new THREE.MeshStandardMaterial({
        color: 0x222633,
        roughness: 0.25,
        metalness: 0.95,
        emissive: new THREE.Color(0x7928CA),
        emissiveIntensity: 0.6
      });

      const archMesh = new THREE.Mesh(archGeo, archMat);
      archMesh.position.copy(frame.pos).addScaledVector(frame.normal, 1.0);

      // Rotate torus: it lies in XY, so align with normal and binormal
      const rot = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      archMesh.quaternion.setFromRotationMatrix(rot);

      this.scene.add(archMesh);
      this.archMeshes.push(archMesh);
    }
  }

  // --------------------------------------------------------------------------
  // TRACK QUERY & TELEMETRY
  // --------------------------------------------------------------------------
  getClosestTrackFrame(point) {
    let closestDistSq = Infinity;
    let closestIndex = 0;

    // Fast search across sampled points
    for (let i = 0; i < this.samples.length; i++) {
      const dSq = point.distanceToSquared(this.samples[i].pos);
      if (dSq < closestDistSq) {
        closestDistSq = dSq;
        closestIndex = i;
      }
    }

    const frame = this.samples[closestIndex];
    // Lateral offset: project vector (point - frame.pos) onto binormal
    const toPoint = point.clone().sub(frame.pos);
    const lateralOffset = toPoint.dot(frame.binormal);
    const normalOffset = toPoint.dot(frame.normal);

    return {
      u: frame.u,
      pos: frame.pos,
      tangent: frame.tangent,
      normal: frame.normal,
      binormal: frame.binormal,
      distance: Math.sqrt(closestDistSq),
      lateralOffset,
      normalOffset,
      trackWidth: this.trackWidth,
      index: closestIndex
    };
  }

  isVacuumRift(u) {
    const range = this.data.vacuumRiftRange;
    if (range[0] <= range[1]) {
      return u >= range[0] && u <= range[1];
    } else {
      // Wraps around 0/1 boundary
      return u >= range[0] || u <= range[1];
    }
  }

  getPointAt(u) {
    if (!this.curve) return new THREE.Vector3();
    const clampedU = ((u % 1.0) + 1.0) % 1.0;
    return this.curve.getPointAt(clampedU);
  }

  update(craftSpeedKmh, craftU) {
    // Update Apex Chevron color telemetry dynamically!
    // Blue/Cyan = optimal speed, Orange/Red = excessive speed approaching corner
    const dangerSpeedThreshold = 950; // km/h

    for (const apex of this.apexChevronMeshes) {
      // Calculate delta U distance to apex
      let deltaU = apex.u - craftU;
      if (deltaU < 0) deltaU += 1.0;

      // When craft is within 0.1 track distance before apex
      if (deltaU < 0.12 && deltaU > 0.001) {
        const isDangerous = craftSpeedKmh > dangerSpeedThreshold;
        const color = isDangerous ? apex.dangerColor : apex.baseColor;
        const pulse = 0.7 + Math.sin(Date.now() * 0.015) * 0.3;

        apex.group.children.forEach((mesh) => {
          mesh.material.color.copy(color);
          mesh.material.opacity = pulse;
        });
      } else {
        apex.group.children.forEach((mesh) => {
          mesh.material.color.copy(apex.baseColor);
          mesh.material.opacity = 0.45;
        });
      }
    }

    // Pulse Boost pads
    const padPulse = 0.8 + Math.sin(Date.now() * 0.008) * 0.2;
    for (const pad of this.boostPadMeshes) {
      pad.mesh.material.opacity = padPulse;
    }
  }
}
