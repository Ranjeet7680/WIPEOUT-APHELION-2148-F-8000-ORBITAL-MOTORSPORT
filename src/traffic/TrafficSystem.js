import * as THREE from 'three';

// ============================================================================
// NEO-SHINJUKU AUTONOMOUS CIVILIAN TRAFFIC SYSTEM
// Autonomous Taxis, Cargo Transports, Futuristic Sedans & Police Interceptors
// ============================================================================

export class TrafficSystem {
  constructor(scene, circuit) {
    this.scene = scene;
    this.circuit = circuit;
    this.vehicles = [];

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Pre-allocated math objects to eliminate garbage collection stutter
    this._basisMatrix = new THREE.Matrix4();
    this._repelVector = new THREE.Vector3();
    this._collisionResult = { hit: false, vehicle: null, repelVector: this._repelVector };

    this.spawnTrafficFleet();
  }

  setCircuit(circuit) {
    this.circuit = circuit;
    this.vehicles.forEach(v => {
      if (v.mesh && v.mesh.parent) {
        v.mesh.parent.remove(v.mesh);
      }
    });
    this.vehicles = [];
    this.spawnTrafficFleet();
  }

  spawnTrafficFleet() {
    const trafficTypes = [
      { type: 'taxi', name: 'CYBER-TAXI', color: 0xFFB800, length: 4.8, width: 2.1, height: 1.45, speed: 140 },
      { type: 'police', name: 'PATROL CRUISER', color: 0x161C24, length: 5.0, width: 2.1, height: 1.48, speed: 180 },
      { type: 'sedan', name: 'AETHER SEDAN', color: 0x2A3C54, length: 4.9, width: 2.05, height: 1.42, speed: 155 },
      { type: 'van', name: 'LOGISTICS VAN', color: 0x1B2433, length: 6.2, width: 2.3, height: 2.1, speed: 125 }
    ];

    const trafficCount = 24;
    const laneOffsets = [-7.5, -2.5, 2.5, 7.5]; // 4 distinct traffic lanes across 26m road

    for (let i = 0; i < trafficCount; i++) {
      const spec = trafficTypes[i % trafficTypes.length];
      const mesh = this.buildTrafficMesh(spec);

      const u = (i / trafficCount) + Math.random() * 0.02;
      const lane = laneOffsets[i % laneOffsets.length];

      this.group.add(mesh);

      this.vehicles.push({
        mesh,
        spec,
        u,
        lane,
        targetLane: lane,
        speedKmh: spec.speed + (Math.random() - 0.5) * 20,
        laneChangeTimer: 5 + Math.random() * 10
      });
    }
  }

  buildTrafficMesh(spec) {
    const group = new THREE.Group();

    const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x10141C, roughness: 0.8, metalness: 0.2 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x15181E, roughness: 0.9, metalness: 0.1 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xC0C8D0, roughness: 0.3, metalness: 0.9 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x08101C, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });

    const bodyMat = new THREE.MeshStandardMaterial({
      color: spec.color,
      metalness: 0.85,
      roughness: 0.25
    });

    const isVan = spec.type === 'van';
    const isTaxi = spec.type === 'taxi';
    const isPolice = spec.type === 'police';

    // 1. Lower Body Fuselage
    const bodyHeight = isVan ? 0.9 : 0.48;
    const bodyGeo = new THREE.BoxGeometry(spec.width, bodyHeight, spec.length);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, bodyHeight * 0.5 + 0.35, 0);
    group.add(body);

    // 2. Cabin / Greenhouse
    const cabinWidth = spec.width * 0.88;
    const cabinHeight = isVan ? 1.0 : 0.55;
    const cabinLength = isVan ? spec.length * 0.75 : spec.length * 0.52;
    const cabinPosZ = isVan ? -0.3 : -0.2;
    const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
    const cabin = new THREE.Mesh(cabinGeo, isVan ? bodyMat : glassMat);
    cabin.position.set(0, bodyHeight + 0.35 + cabinHeight * 0.5, cabinPosZ);
    group.add(cabin);

    // Windshield frame for non-van
    if (!isVan) {
      const hoodGeo = new THREE.BoxGeometry(spec.width * 0.9, 0.08, spec.length * 0.35);
      const hood = new THREE.Mesh(hoodGeo, bodyMat);
      hood.position.set(0, bodyHeight + 0.36, spec.length * 0.3);
      group.add(hood);

      const trunkGeo = new THREE.BoxGeometry(spec.width * 0.88, 0.08, spec.length * 0.25);
      const trunk = new THREE.Mesh(trunkGeo, bodyMat);
      trunk.position.set(0, bodyHeight + 0.36, -spec.length * 0.35);
      group.add(trunk);
    }

    // 3. Iconic Rooftop Accents: Taxi Sign or Police Emergency Bar
    if (isTaxi) {
      const taxiSignGeo = new THREE.BoxGeometry(0.8, 0.22, 0.35);
      const taxiSignMat = new THREE.MeshBasicMaterial({ color: 0xFFE000 });
      const taxiSign = new THREE.Mesh(taxiSignGeo, taxiSignMat);
      taxiSign.position.set(0, bodyHeight + cabinHeight + 0.48, cabinPosZ);
      group.add(taxiSign);
    } else if (isPolice) {
      const barGeo = new THREE.BoxGeometry(1.2, 0.16, 0.25);
      const barMat = new THREE.MeshBasicMaterial({ color: 0xFF1E28 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, bodyHeight + cabinHeight + 0.45, cabinPosZ);
      group.add(bar);

      const blueGeo = new THREE.BoxGeometry(0.55, 0.18, 0.27);
      const blueMat = new THREE.MeshBasicMaterial({ color: 0x0066FF });
      const blueBar = new THREE.Mesh(blueGeo, blueMat);
      blueBar.position.set(0.3, bodyHeight + cabinHeight + 0.45, cabinPosZ);
      group.add(blueBar);
    }

    // 4. Headlights & Taillights
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xE8F8FF });
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xFF1424 });
    const hlGeo = new THREE.BoxGeometry(0.42, 0.14, 0.08);

    [-spec.width * 0.36, spec.width * 0.36].forEach(hx => {
      const hl = new THREE.Mesh(hlGeo, hlMat);
      hl.position.set(hx, bodyHeight * 0.6 + 0.35, spec.length * 0.5 + 0.02);
      group.add(hl);
    });

    const tlGeo = new THREE.BoxGeometry(spec.width * 0.85, 0.12, 0.08);
    const tl = new THREE.Mesh(tlGeo, tlMat);
    tl.position.set(0, bodyHeight * 0.6 + 0.35, -spec.length * 0.5 - 0.02);
    group.add(tl);

    // 5. 4 Realistic Rubber Tires & Alloy Rims (No floating boxes!)
    const wheelY = 0.36;
    const wheelPositions = [
      { x: -spec.width * 0.51, z: spec.length * 0.3 },
      { x: spec.width * 0.51, z: spec.length * 0.3 },
      { x: -spec.width * 0.51, z: -spec.length * 0.3 },
      { x: spec.width * 0.51, z: -spec.length * 0.3 }
    ];

    const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 16);
    tireGeo.rotateZ(Math.PI * 0.5);
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.25, 12);
    rimGeo.rotateZ(Math.PI * 0.5);

    wheelPositions.forEach(wp => {
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.position.set(wp.x, wheelY, wp.z);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      tire.add(rim);
      group.add(tire);
    });

    // 6. Ground-Effect Emissive Glow Plate (ZERO PointLights - 100% Free GPU Shading!)
    const glowGeo = new THREE.PlaneGeometry(spec.width * 0.9, spec.length * 0.85);
    glowGeo.rotateX(-Math.PI * 0.5);
    const glowMat = new THREE.MeshBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });
    const underglowPlate = new THREE.Mesh(glowGeo, glowMat);
    underglowPlate.position.set(0, 0.05, 0);
    group.add(underglowPlate);

    return group;
  }

  update(delta, playerPos, playerSpeedKmh) {
    const laneOffsets = [-7.5, -2.5, 2.5, 7.5];

    this.vehicles.forEach(v => {
      // 1. Spline progression
      const speedMs = v.speedKmh / 3.6;
      const trackLength = 5400.0;
      v.u = (v.u + (speedMs * delta) / trackLength) % 1.0;

      // 2. Periodic lane changes
      v.laneChangeTimer -= delta;
      if (v.laneChangeTimer <= 0) {
        v.laneChangeTimer = 8 + Math.random() * 12;
        v.targetLane = laneOffsets[Math.floor(Math.random() * laneOffsets.length)];
      }

      v.lane = THREE.MathUtils.lerp(v.lane, v.targetLane, delta * 1.5);

      // 3. Update world transform along circuit
      const frame = this.circuit.getFrameAt(v.u);
      v.mesh.position.copy(frame.pos)
        .addScaledVector(frame.binormal, v.lane)
        .addScaledVector(frame.normal, 0.5);

      this._basisMatrix.makeBasis(frame.binormal, frame.normal, frame.tangent);
      v.mesh.quaternion.setFromRotationMatrix(this._basisMatrix);

      // Dynamic distance culling: skip rendering vehicles beyond 450m
      if (playerPos) {
        const dSq = v.mesh.position.distanceToSquared(playerPos);
        v.mesh.visible = dSq < 202500; // 450^2
      }
    });
  }

  checkCollision(playerPos, playerRadius = 2.4) {
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      if (!v.mesh.visible) continue;
      const dist = v.mesh.position.distanceTo(playerPos);
      if (dist < playerRadius + v.spec.length * 0.4) {
        this._repelVector.copy(playerPos).sub(v.mesh.position).normalize();
        this._collisionResult.hit = true;
        this._collisionResult.vehicle = v;
        this._collisionResult.repelVector = this._repelVector;
        return this._collisionResult;
      }
    }
    this._collisionResult.hit = false;
    this._collisionResult.vehicle = null;
    return this._collisionResult;
  }

  spawnCivilianDroneCluster(targetU, count = 3) {
    const laneOffsets = [-5.0, 0.0, 5.0];
    for (let i = 0; i < Math.min(count, this.vehicles.length); i++) {
      const v = this.vehicles[i];
      v.u = (targetU + i * 0.012) % 1.0;
      v.lane = laneOffsets[i % laneOffsets.length];
      v.targetLane = v.lane;
      v.speedKmh = 130.0;
    }
  }
}
