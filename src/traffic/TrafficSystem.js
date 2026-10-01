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

  spawnTrafficFleet() {
    const trafficTypes = [
      { type: 'taxi', name: 'CYBER-TAXI', color: 0xFFB800, length: 5.4, width: 2.2, height: 1.5, speed: 140 },
      { type: 'sedan', name: 'AETHER SEDAN', color: 0x334466, length: 5.2, width: 2.1, height: 1.4, speed: 160 },
      { type: 'van', name: 'LOGISTICS VAN', color: 0x182434, length: 7.2, width: 2.6, height: 2.4, speed: 120 },
      { type: 'truck', name: 'CARGO HAULER', color: 0x0c1018, length: 11.5, width: 3.2, height: 3.2, speed: 110 }
    ];

    const trafficCount = 28;
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

    // Main Chassis Box
    const bodyGeo = new THREE.BoxGeometry(spec.width, spec.height, spec.length);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: spec.color,
      metalness: 0.85,
      roughness: 0.25,
      emissive: new THREE.Color(spec.color).multiplyScalar(0.15)
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, spec.height * 0.5 + 0.3, 0);
    body.castShadow = true;
    group.add(body);

    // Glowing Windshield / Sensor Visor
    const visorGeo = new THREE.BoxGeometry(spec.width * 0.9, spec.height * 0.35, spec.length * 0.45);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.75 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, spec.height * 0.75 + 0.3, spec.length * 0.1);
    group.add(visor);

    // Headlights (Twin White/Cyan point emitters)
    const hlGeo = new THREE.BoxGeometry(0.5, 0.2, 0.1);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xE0FFFF });
    const hlLeft = new THREE.Mesh(hlGeo, hlMat);
    hlLeft.position.set(-spec.width * 0.35, spec.height * 0.4 + 0.3, spec.length * 0.5 + 0.05);
    group.add(hlLeft);

    const hlRight = new THREE.Mesh(hlGeo, hlMat);
    hlRight.position.set(spec.width * 0.35, spec.height * 0.4 + 0.3, spec.length * 0.5 + 0.05);
    group.add(hlRight);

    // Taillights (Red LED strips)
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xFF1A1A });
    const tl = new THREE.Mesh(new THREE.BoxGeometry(spec.width * 0.8, 0.15, 0.1), tlMat);
    tl.position.set(0, spec.height * 0.4 + 0.3, -spec.length * 0.5 - 0.05);
    group.add(tl);

    // Hover underglow light
    const underglow = new THREE.PointLight(spec.color, 1.2, 6);
    underglow.position.set(0, 0.1, 0);
    group.add(underglow);

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
