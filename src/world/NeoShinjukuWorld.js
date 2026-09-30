import * as THREE from 'three';

// ============================================================================
// NEO-SHINJUKU METROPOLIS: 8-DISTRICT OPEN-WORLD ENVIRONMENT (2089)
// Megastructures, Holographic Ads, Elevated Skyways, Moving Aerodynes,
// Monorail Cyber-Trains, Steam Vents, and Dynamic Rain Atmosphere
// ============================================================================

export class NeoShinjukuWorld {
  constructor(scene, circuit) {
    this.scene = scene;
    this.circuit = circuit;

    this.root = new THREE.Group();
    this.scene.add(this.root);

    // Systems
    this.skyTraffic = [];
    this.drones = [];
    this.steamVents = [];
    this.rainParticles = null;
    this.monorailTrain = null;
    this.hologramMaterials = [];

    // Weather state
    this.weather = 'RAIN'; // CLEAR, RAIN, HEAVY_RAIN, FOG, ELECTRIC_STORM, NEON_NIGHT
    this.timeOfDay = 'NIGHT';

    this.buildDistrictEnvironments();
    this.buildSkyTrafficSystem();
    this.buildPatrolDrones();
    this.buildOverheadMonorail();
    this.buildRainParticleField();
  }

  buildDistrictEnvironments() {
    // 1. NEON CORE & MEGA TOWER SKYSCRAPERS (Instanced architecture)
    this.buildSkyscraperArcologies();

    // 2. GIANT HOLOGRAPHIC ADVERTISEMENTS & SIGNAGE
    this.buildHolographicBillboards();

    // 3. INDUSTRIAL RIFT COOLANT PIPELINES & STEAM VENTS
    this.buildIndustrialInfrastructure();

    // 4. AETHER PORT ORBITAL ELEVATOR & SPACEPORT PYLONS
    this.buildAetherPortOrbitalElevator();

    // 5. OLD SHINJUKU CYBER-ALLEY LANTERNS & OVERHEAD CABLES
    this.buildOldShinjukuAlleyDecor();

    // 6. UNDERCITY SUBTERRANEAN TUNNEL ENCLOSURE
    this.buildUndercityTunnelSection();
  }

  buildSkyscraperArcologies() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // Procedural sci-fi facade texture with glowing window grids
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, 512, 1024);

    for (let y = 10; y < 1000; y += 20) {
      if (Math.random() > 0.3) {
        ctx.fillStyle = Math.random() > 0.4 ? '#00F0FF' : (Math.random() > 0.5 ? '#FFB800' : '#FF007F');
        for (let x = 20; x < 500; x += 40) {
          if (Math.random() > 0.35) {
            ctx.fillRect(x, y, 22, 6);
          }
        }
      }
    }

    const buildingTex = new THREE.CanvasTexture(canvas);
    buildingTex.wrapS = THREE.RepeatWrapping;
    buildingTex.wrapT = THREE.RepeatWrapping;

    const buildingMat = new THREE.MeshStandardMaterial({
      map: buildingTex,
      metalness: 0.85,
      roughness: 0.25,
      emissive: new THREE.Color(0x040810),
      emissiveIntensity: 0.8
    });

    const towerCount = 140;
    const instancedMesh = new THREE.InstancedMesh(boxGeo, buildingMat, towerCount);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < towerCount; i++) {
      // Place buildings along outer corridors flanking the circuit spline
      const u = (i / towerCount);
      const frame = this.circuit.getFrameAt(u);
      const side = (i % 2 === 0 ? 1 : -1);
      const dist = 55 + Math.random() * 220;

      const x = frame.pos.x + frame.binormal.x * side * dist + (Math.random() - 0.5) * 60;
      const z = frame.pos.z + frame.binormal.z * side * dist + (Math.random() - 0.5) * 60;

      const width = 45 + Math.random() * 85;
      const depth = 45 + Math.random() * 85;
      const height = 250 + Math.random() * 700;
      const y = height * 0.5 - 60;

      dummy.position.set(x, y, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    this.root.add(instancedMesh);
  }

  buildHolographicBillboards() {
    const holoAds = [
      { text: 'AETHER-9 // ORBITAL', sub: 'NEO-SHINJUKU HIGHWAY', color: '#00F0FF', kanji: '新・宿' },
      { text: 'KIROSHI OPTICS', sub: 'NEURAL AUGMENTATION', color: '#FFB800', kanji: '超感覚' },
      { text: 'QUANTUM GRAV-DRIVE', sub: 'HYPER ACCELERATION', color: '#FF2A13', kanji: '反重力' },
      { text: 'NIGHTRIFT F-8000', sub: 'LEAGUE SPEC RACER', color: '#7928CA', kanji: '夜裂' },
      { text: 'TETSUO INDUSTRIAL', sub: 'PLASMA CONTAINMENT', color: '#00FF66', kanji: '鉄雄' },
      { text: 'HYPER-BOOST CAPACITOR', sub: 'FULL CAPACITY // READY', color: '#FF007F', kanji: '加速' }
    ];

    holoAds.forEach((ad, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'rgba(6, 9, 16, 0.9)';
      ctx.fillRect(0, 0, 512, 256);

      ctx.strokeStyle = ad.color;
      ctx.lineWidth = 8;
      ctx.strokeRect(6, 6, 500, 244);

      // Large Japanese Kanji watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.font = '900 130px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(ad.kanji, 490, 180);

      // Text
      ctx.fillStyle = ad.color;
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(ad.text, 24, 80);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(ad.sub, 24, 130);

      // Scanline grid
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      for (let y = 0; y < 256; y += 8) {
        ctx.fillRect(0, y, 512, 2);
      }

      const tex = new THREE.CanvasTexture(canvas);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      this.hologramMaterials.push(mat);

      const billboardGeo = new THREE.PlaneGeometry(36, 18);
      const mesh = new THREE.Mesh(billboardGeo, mat);

      // Position billboards along track
      const u = (i * 0.16 + 0.05) % 1.0;
      const frame = this.circuit.getFrameAt(u);
      const side = (i % 2 === 0 ? 1 : -1);

      mesh.position.copy(frame.pos)
        .addScaledVector(frame.binormal, side * 28)
        .addScaledVector(frame.normal, 16 + Math.random() * 8);

      mesh.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(frame.binormal.clone().multiplyScalar(side), frame.normal, frame.tangent)
      );

      this.root.add(mesh);
    });
  }

  buildIndustrialInfrastructure() {
    const pipeGroup = new THREE.Group();
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x1f2736,
      metalness: 0.9,
      roughness: 0.3,
      emissive: new THREE.Color(0x002233),
      emissiveIntensity: 0.7
    });

    // Massive coolant pipelines running along Industrial Rift (u = 0.28 to 0.42)
    for (let p = 0; p < 6; p++) {
      const curvePoints = [];
      for (let u = 0.28; u <= 0.42; u += 0.015) {
        const frame = this.circuit.getFrameAt(u);
        const pt = frame.pos.clone()
          .addScaledVector(frame.binormal, 22 + (p - 2.5) * 5)
          .addScaledVector(frame.normal, -4 + (p % 2) * 8);
        curvePoints.push(pt);
      }
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 2.2, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, pipeMat);
      pipeGroup.add(tubeMesh);
    }

    // Industrial Steam Exhaust Vents
    const ventGeo = new THREE.ConeGeometry(5, 26, 10, 1, true);
    const ventMat = new THREE.MeshBasicMaterial({
      color: 0x88ddff,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    for (let v = 0; v < 8; v++) {
      const u = 0.30 + v * 0.014;
      const frame = this.circuit.getFrameAt(u);
      const vent = new THREE.Mesh(ventGeo, ventMat.clone());
      vent.position.copy(frame.pos)
        .addScaledVector(frame.binormal, (v % 2 === 0 ? 1 : -1) * 16)
        .addScaledVector(frame.normal, 1);
      vent.rotation.x = Math.PI;
      pipeGroup.add(vent);
      this.steamVents.push({ mesh: vent, baseOpacity: 0.28, phase: v * 1.5 });
    }

    this.root.add(pipeGroup);
  }

  buildAetherPortOrbitalElevator() {
    const portGroup = new THREE.Group();
    const frame = this.circuit.getFrameAt(0.74); // Aether Port center

    // Orbital space elevator anchor tower (Reaches +2,400m into sky)
    const towerGeo = new THREE.CylinderGeometry(24, 75, 2400, 8);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x0c121e,
      metalness: 0.95,
      roughness: 0.2,
      emissive: new THREE.Color(0x00F0FF),
      emissiveIntensity: 0.4
    });
    const towerMesh = new THREE.Mesh(towerGeo, towerMat);
    towerMesh.position.copy(frame.pos).add(new THREE.Vector3(180, 1100, -180));
    portGroup.add(towerMesh);

    // Glowing containment rings wrapped around the elevator
    for (let r = 0; r < 5; r++) {
      const ringGeo = new THREE.TorusGeometry(85 + r * 22, 4.5, 8, 36);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x7928CA });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(towerMesh.position).add(new THREE.Vector3(0, -600 + r * 350, 0));
      ringMesh.rotation.x = Math.PI * 0.5;
      portGroup.add(ringMesh);
    }

    this.root.add(portGroup);
  }

  buildOldShinjukuAlleyDecor() {
    const alleyGroup = new THREE.Group();
    const lanternGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const redLanternMat = new THREE.MeshBasicMaterial({ color: 0xFF1A1A });
    const amberLanternMat = new THREE.MeshBasicMaterial({ color: 0xFFAA00 });

    // Clustered glowing lanterns along Old Shinjuku (u = 0.42 to 0.54)
    for (let u = 0.42; u <= 0.54; u += 0.015) {
      const frame = this.circuit.getFrameAt(u);
      for (let side of [-1, 1]) {
        const lantern = new THREE.Mesh(lanternGeo, Math.random() > 0.5 ? redLanternMat : amberLanternMat);
        lantern.position.copy(frame.pos)
          .addScaledVector(frame.binormal, side * (this.circuit.roadWidth * 0.5 + 4))
          .addScaledVector(frame.normal, 5 + Math.random() * 4);
        alleyGroup.add(lantern);
      }
    }

    this.root.add(alleyGroup);
  }

  buildUndercityTunnelSection() {
    const tunnelGroup = new THREE.Group();
    // Enclosed tunnel arch tubes covering Undercity (u = 0.55 to 0.66)
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0x111620,
      metalness: 0.9,
      roughness: 0.4,
      side: THREE.DoubleSide
    });

    const ribCount = 30;
    for (let i = 0; i < ribCount; i++) {
      const u = 0.55 + (i / ribCount) * 0.11;
      const frame = this.circuit.getFrameAt(u);
      const archGeo = new THREE.TorusGeometry(this.circuit.roadWidth * 0.6, 1.2, 6, 18, Math.PI);
      const archMesh = new THREE.Mesh(archGeo, ribMat);
      archMesh.position.copy(frame.pos).addScaledVector(frame.normal, 1);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      archMesh.quaternion.setFromRotationMatrix(m);
      tunnelGroup.add(archMesh);

      // Flickering green/cyan industrial hazard strip
      const stripGeo = new THREE.BoxGeometry(0.8, 0.4, 4.0);
      const stripMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00FF66 : 0x00F0FF });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.copy(frame.pos).addScaledVector(frame.normal, 12);
      strip.quaternion.copy(archMesh.quaternion);
      tunnelGroup.add(strip);
    }

    this.root.add(tunnelGroup);
  }

  buildSkyTrafficSystem() {
    // 36 autonomous flying vehicles cruising on high-altitude transit lanes
    const carGeo = new THREE.BoxGeometry(4.2, 1.6, 9.0);
    const carMat = new THREE.MeshStandardMaterial({
      color: 0x182030,
      metalness: 0.9,
      roughness: 0.2,
      emissive: new THREE.Color(0x002244),
      emissiveIntensity: 0.8
    });

    for (let i = 0; i < 32; i++) {
      const car = new THREE.Mesh(carGeo, carMat.clone());
      const u = (i / 32);
      const altitude = 180 + Math.random() * 220;
      const side = (i % 2 === 0 ? 1 : -1) * (80 + Math.random() * 120);
      const speed = 0.015 + Math.random() * 0.025;

      // Headlight / taillight sprites
      const hl = new THREE.PointLight(0x00F0FF, 1.5, 40);
      hl.position.set(0, 0, 5);
      car.add(hl);

      const tl = new THREE.PointLight(0xFF2A13, 1.5, 30);
      tl.position.set(0, 0, -5);
      car.add(tl);

      this.root.add(car);
      this.skyTraffic.push({ mesh: car, u, altitude, side, speed });
    }
  }

  buildPatrolDrones() {
    const droneGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.8, 6);
    const droneMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      emissive: new THREE.Color(0x00F0FF),
      emissiveIntensity: 1.2
    });

    for (let i = 0; i < 6; i++) {
      const drone = new THREE.Mesh(droneGeo, droneMat);
      const spotlight = new THREE.SpotLight(0x00F0FF, 4, 90, Math.PI * 0.25, 0.4);
      drone.add(spotlight);
      spotlight.position.set(0, -0.5, 0);

      this.root.add(drone);
      this.drones.push({ mesh: drone, angle: i * 1.05, height: 180 + i * 20 });
    }
  }

  buildOverheadMonorail() {
    // Futuristic high-speed maglev train soaring across the sky
    const trainGroup = new THREE.Group();
    const trainMat = new THREE.MeshStandardMaterial({
      color: 0x141a28,
      metalness: 0.95,
      roughness: 0.2,
      emissive: new THREE.Color(0x00F0FF),
      emissiveIntensity: 0.5
    });

    for (let c = 0; c < 5; c++) {
      const carGeo = new THREE.BoxGeometry(6, 4.5, 24);
      const carMesh = new THREE.Mesh(carGeo, trainMat);
      carMesh.position.set(0, 0, c * 26);
      trainGroup.add(carMesh);
    }

    this.monorailTrain = { group: trainGroup, u: 0.0, speed: 0.04 };
    this.root.add(trainGroup);
  }

  buildRainParticleField() {
    const rainCount = 4000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3 + 0] = (Math.random() - 0.5) * 500;
      rainPositions[i * 3 + 1] = Math.random() * 300;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 500;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x99ddff,
      size: 1.4,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.root.add(this.rainParticles);
  }

  update(delta, playerPos) {
    const time = performance.now() * 0.001;

    // 1. Animate Sky Traffic
    this.skyTraffic.forEach(item => {
      item.u = (item.u + item.speed * delta) % 1.0;
      const frame = this.circuit.getFrameAt(item.u);
      item.mesh.position.copy(frame.pos)
        .addScaledVector(frame.binormal, item.side)
        .add(new THREE.Vector3(0, item.altitude - frame.pos.y, 0));

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      item.mesh.quaternion.setFromRotationMatrix(m);
    });

    // 2. Animate Patrol Drones
    this.drones.forEach((d, idx) => {
      d.angle += delta * 0.4;
      const r = 260 + Math.sin(time + idx) * 40;
      d.mesh.position.set(
        Math.cos(d.angle) * r,
        d.height + Math.sin(time * 2.0 + idx) * 8,
        Math.sin(d.angle) * r
      );
    });

    // 3. Animate Steam Vents
    this.steamVents.forEach(vent => {
      const op = vent.baseOpacity * (0.5 + Math.sin(time * 4.0 + vent.phase) * 0.5);
      vent.mesh.material.opacity = op;
      vent.mesh.scale.set(1 + op * 0.5, 1 + op * 0.8, 1 + op * 0.5);
    });

    // 4. Animate Monorail Train
    if (this.monorailTrain) {
      this.monorailTrain.u = (this.monorailTrain.u + this.monorailTrain.speed * delta) % 1.0;
      const frame = this.circuit.getFrameAt(this.monorailTrain.u);
      this.monorailTrain.group.position.copy(frame.pos).add(new THREE.Vector3(0, 45, 0));
      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      this.monorailTrain.group.quaternion.setFromRotationMatrix(m);
    }

    // 5. Rain particles centered around player
    if (this.rainParticles && playerPos) {
      this.rainParticles.position.x = playerPos.x;
      this.rainParticles.position.z = playerPos.z;

      const pos = this.rainParticles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= delta * 350; // High terminal velocity rain fall
        if (pos[i] < -20) {
          pos[i] = 280;
        }
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
