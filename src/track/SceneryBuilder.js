import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - SCENERY & CYBERPUNK MEGACITY ENVIRONMENT BUILDER
// Neo-Shinjuku Rift (Sector 07): High-elevation arcologies, The Monolith Dive,
// Industrial Cryo-Trench (-120m), Megaport Overpass (900m Rift), Aerodyne
// Sky-Traffic, Kinetic Mega-Holograms, Steam Pockets & Volumetric Acid Haze
// ============================================================================

export class SceneryBuilder {
  constructor(scene, circuitData) {
    this.scene = scene;
    this.data = circuitData;
    this.cityGroup = new THREE.Group();
    this.billboardMeshes = [];
    this.trafficVehicles = [];
    this.steamVents = [];
    this.laserFenceMeshes = [];
    this.clock = new THREE.Clock();

    this.build();
  }

  build() {
    this.buildSkybox();
    this.buildBrutalistMegacity();
    this.buildMonolithSpireCore();
    this.buildCryoTrenchInfrastructure();
    this.buildMegaportLaunchLanes();
    this.buildKineticMegaHolograms();
    this.buildAerodyneSkyTraffic();
    this.buildLaserFencedCorridors();
    this.buildVolumetricAcidHaze();

    this.scene.add(this.cityGroup);
  }

  // --------------------------------------------------------------------------
  // 1. SKYBOX: High-Altitude Overcast, Orbital Freight Elevator & Starfield
  // --------------------------------------------------------------------------
  buildSkybox() {
    // Starfield particles & upper stratosphere dust
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    const starColors = [];

    const c1 = new THREE.Color(0x00f0ff);
    const c2 = new THREE.Color(0x7928ca);
    const c3 = new THREE.Color(0xffffff);

    for (let i = 0; i < starCount; i++) {
      const radius = 3200 + Math.random() * 2500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) + 400; // Centered higher
      const z = radius * Math.cos(phi);

      starPos.push(x, y, z);
      const pickColor = Math.random() < 0.25 ? c1 : Math.random() < 0.45 ? c2 : c3;
      starColors.push(pickColor.r, pickColor.g, pickColor.b);
    }

    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 4.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starPoints = new THREE.Points(starGeo, starMat);
    this.cityGroup.add(starPoints);

    // Planetary Horizon & Sub-City Fog Abyss Sphere
    const planetGeo = new THREE.SphereGeometry(3500, 48, 24);
    const planetMat = new THREE.MeshBasicMaterial({
      color: 0x03050a,
      side: THREE.BackSide
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.position.set(0, -3200, 0);
    this.cityGroup.add(planetMesh);

    // Massive Central Orbital Freight Elevator Pylon (Climbing into space)
    const elevatorGeo = new THREE.CylinderGeometry(28, 65, 3000, 16);
    const elevatorMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      metalness: 0.92,
      roughness: 0.28,
      emissive: new THREE.Color(0x0a1424),
      emissiveIntensity: 0.5
    });
    const elevatorMesh = new THREE.Mesh(elevatorGeo, elevatorMat);
    elevatorMesh.position.set(-150, 1500, -800);
    this.cityGroup.add(elevatorMesh);

    // Orbital tether docking habitat rings
    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.TorusGeometry(140 + r * 55, 7, 8, 36);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x1e2434,
        metalness: 0.9,
        roughness: 0.2,
        emissive: new THREE.Color(0x7928ca),
        emissiveIntensity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(-150, 850 + r * 320, -800);
      ringMesh.rotation.x = Math.PI * 0.5;
      this.cityGroup.add(ringMesh);
    }
  }

  // --------------------------------------------------------------------------
  // 2. BRUTALIST MEGACITY: Kilometers-Tall Arcologies & Commercial Megatowers
  // --------------------------------------------------------------------------
  buildBrutalistMegacity() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // High-resolution sci-fi procedural window texture
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 512;
    bCanvas.height = 1024;
    const ctx = bCanvas.getContext('2d');
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, 512, 1024);

    // Window vertical bands with cyan and amber data arrays
    for (let y = 16; y < 1000; y += 24) {
      if (Math.random() > 0.35) {
        ctx.fillStyle = Math.random() > 0.2 ? '#00F0FF' : '#FFB800';
        const w1 = 14 + Math.random() * 32;
        const w2 = 14 + Math.random() * 32;
        const w3 = 14 + Math.random() * 32;
        ctx.fillRect(35, y, w1, 6);
        ctx.fillRect(180, y, w2, 6);
        ctx.fillRect(350, y, w3, 6);
      }
    }

    const bTexture = new THREE.CanvasTexture(bCanvas);
    bTexture.wrapS = THREE.RepeatWrapping;
    bTexture.wrapT = THREE.RepeatWrapping;

    const buildingMat = new THREE.MeshStandardMaterial({
      map: bTexture,
      roughness: 0.38,
      metalness: 0.85,
      color: 0x141a24,
      emissive: new THREE.Color(0x06111e),
      emissiveIntensity: 0.7
    });

    const instancedCount = 130;
    const instancedMesh = new THREE.InstancedMesh(boxGeo, buildingMat, instancedCount);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < instancedCount; i++) {
      const angle = (i / instancedCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const dist = 380 + Math.random() * 850;
      const x = Math.cos(angle) * dist + (Math.random() - 0.5) * 180;
      const z = Math.sin(angle) * dist + (Math.random() - 0.5) * 180;

      const width = 55 + Math.random() * 95;
      const depth = 55 + Math.random() * 95;
      // Heights ranging from lower trench datum up to +1200m
      const height = 400 + Math.random() * 900;
      const y = height * 0.5 - 200;

      dummy.position.set(x, y, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    this.cityGroup.add(instancedMesh);
  }

  // --------------------------------------------------------------------------
  // 3. SECTOR 2: THE MONOLITH SUPER-SPIRE (Architectural Core for 70° Plunge)
  // --------------------------------------------------------------------------
  buildMonolithSpireCore() {
    const spireGroup = new THREE.Group();
    spireGroup.position.set(700, 450, -100);

    // Monolithic hexagonal tower core
    const coreGeo = new THREE.CylinderGeometry(85, 140, 1100, 6);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0d1118,
      metalness: 0.95,
      roughness: 0.25,
      emissive: new THREE.Color(0x081525),
      emissiveIntensity: 0.6
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    spireGroup.add(coreMesh);

    // Superconducting induction ribbon wrapping helix around the spire
    const helixCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(120, 400, 0),
      new THREE.Vector3(0, 200, 140),
      new THREE.Vector3(-140, 0, 0),
      new THREE.Vector3(0, -200, -150),
      new THREE.Vector3(150, -400, 0)
    ]);
    const helixGeo = new THREE.TubeGeometry(helixCurve, 64, 5, 8, false);
    const helixMat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      emissive: new THREE.Color(0x00F0FF),
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.9
    });
    const helixMesh = new THREE.Mesh(helixGeo, helixMat);
    spireGroup.add(helixMesh);

    this.cityGroup.add(spireGroup);
  }

  // --------------------------------------------------------------------------
  // 4. SECTOR 3: CRYO-TRENCH SUB-SURFACE INFRASTRUCTURE (-120m Datum)
  // --------------------------------------------------------------------------
  buildCryoTrenchInfrastructure() {
    const trenchGroup = new THREE.Group();
    trenchGroup.position.set(-150, -120, -380);

    // Massive liquid nitrogen & coolant distribution pipelines
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.9,
      roughness: 0.3,
      emissive: new THREE.Color(0x003344),
      emissiveIntensity: 0.8
    });

    for (let p = 0; p < 4; p++) {
      const pipeGeo = new THREE.CylinderGeometry(8, 8, 480, 16);
      const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
      pipeMesh.rotation.z = Math.PI * 0.5;
      pipeMesh.position.set(0, -18 + p * 12, (p - 1.5) * 35);
      trenchGroup.add(pipeMesh);
    }

    // Industrial steam exhaust vents that pulse hot vapor
    const ventGeo = new THREE.ConeGeometry(12, 45, 12, 1, true);
    const ventMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    for (let v = 0; v < 6; v++) {
      const ventMesh = new THREE.Mesh(ventGeo, ventMat.clone());
      ventMesh.position.set((v - 2.5) * 70, 0, (Math.random() - 0.5) * 40);
      ventMesh.rotation.x = Math.PI;
      trenchGroup.add(ventMesh);
      this.steamVents.push({ mesh: ventMesh, baseOpacity: 0.25, phase: v * 1.2 });
    }

    this.cityGroup.add(trenchGroup);
  }

  // --------------------------------------------------------------------------
  // 5. SECTOR 4: MEGAPORT OVERPASS LAUNCH TOWERS & RE-ANCHOR GANTRIES
  // --------------------------------------------------------------------------
  buildMegaportLaunchLanes() {
    const megaportGroup = new THREE.Group();
    megaportGroup.position.set(-680, 480, 220);

    // Orbital launch gantry towers flanking the 900m gap
    const gantryMat = new THREE.MeshStandardMaterial({
      color: 0x222a38,
      metalness: 0.92,
      roughness: 0.25,
      emissive: new THREE.Color(0xFF4800),
      emissiveIntensity: 0.4
    });

    for (let g = 0; g < 3; g++) {
      const towerGeo = new THREE.BoxGeometry(35, 600, 35);
      const towerMesh = new THREE.Mesh(towerGeo, gantryMat);
      towerMesh.position.set((g - 1) * 140, 0, (g - 1) * 80);
      megaportGroup.add(towerMesh);

      // Warning laser beacon atop towers
      const beaconLight = new THREE.PointLight(0xFF4800, 2.5, 180);
      beaconLight.position.set((g - 1) * 140, 305, (g - 1) * 80);
      megaportGroup.add(beaconLight);
    }

    // Re-Anchor Magnetic Catch Pylons positioned at rift exit
    const pylonGeo = new THREE.TorusGeometry(32, 4.5, 12, 24);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      metalness: 0.95,
      roughness: 0.15,
      emissive: new THREE.Color(0x00F0FF),
      emissiveIntensity: 1.2
    });

    const pylon1 = new THREE.Mesh(pylonGeo, pylonMat);
    pylon1.position.set(360, 340, 100);
    megaportGroup.add(pylon1);

    const pylon2 = new THREE.Mesh(pylonGeo, pylonMat);
    pylon2.position.set(390, 355, 110);
    megaportGroup.add(pylon2);

    this.cityGroup.add(megaportGroup);
  }

  // --------------------------------------------------------------------------
  // 6. KINETIC MEGA-HOLOGRAMS (Corporate Ads with tDR Aesthetic)
  // --------------------------------------------------------------------------
  buildKineticMegaHolograms() {
    const brands = [
      { name: 'HYPERION', sub: 'KINETIC RAILGUNS // HEAVY DEFENSE', color: '#00F0FF' },
      { name: 'NEURO-MESH', sub: 'SYNAPTIC PILOT COUPLING // V.8', color: '#FFB800' },
      { name: 'COLONY-04', sub: 'OFF-WORLD EXPEDITION FLEET', color: '#7928CA' },
      { name: 'FEISAR-ORBITAL', sub: 'FEDERAL PROPULSION CONSORTIUM', color: '#00F0FF' },
      { name: 'AG-SYSTEMS', sub: 'MHD INDUCTION DRIVE SYSTEMS', color: '#FFB800' },
      { name: 'QIREX-VOSTOK', sub: 'MONOLITHIC COMBAT CHASSIS', color: '#FF2A13' },
      { name: 'KINETIX', sub: 'SUPERCONDUCTING FLUX CLAMPS', color: '#00F0FF' }
    ];

    brands.forEach((brand, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Dark translucent background with scanline grids
      ctx.fillStyle = '#060914';
      ctx.fillRect(0, 0, 512, 256);

      // Frame border
      ctx.strokeStyle = brand.color;
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, 496, 240);

      // Designers Republic corner ticks
      ctx.fillStyle = brand.color;
      ctx.fillRect(8, 8, 32, 8);
      ctx.fillRect(8, 8, 8, 32);
      ctx.fillRect(472, 8, 32, 8);
      ctx.fillRect(496, 8, 8, 32);

      // Typography
      ctx.font = 'bold 54px monospace';
      ctx.fillText(brand.name, 32, 105);

      ctx.font = '16px monospace';
      ctx.fillText(brand.sub, 32, 155);

      // Barcode / Telemetry data
      for (let bx = 32; bx < 480; bx += 8) {
        if (Math.random() > 0.3) {
          ctx.fillRect(bx, 185, 4, 34);
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      const billboardGeo = new THREE.PlaneGeometry(110, 55);
      const billboardMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });

      const billboardMesh = new THREE.Mesh(billboardGeo, billboardMat);

      // Strategically place near Sector 1 Sky-Chicane and Monolith Dive
      const angle = (idx / brands.length) * Math.PI * 2;
      const dist = 420 + (idx % 3) * 120;
      const y = 350 + (idx * 85);
      billboardMesh.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
      billboardMesh.rotation.y = angle + Math.PI * 0.5;

      this.cityGroup.add(billboardMesh);
      this.billboardMeshes.push(billboardMesh);
    });
  }

  // --------------------------------------------------------------------------
  // 7. AERODYNE SKY-TRAFFIC: Autonomous Commuter Cars & Cargo Barges
  // --------------------------------------------------------------------------
  buildAerodyneSkyTraffic() {
    const trafficCount = 36;
    const carGeo = new THREE.BoxGeometry(4.5, 1.8, 11);
    const carMat = new THREE.MeshStandardMaterial({
      color: 0x182030,
      metalness: 0.9,
      roughness: 0.3,
      emissive: new THREE.Color(0x0a1422),
      emissiveIntensity: 0.4
    });

    // Headlight (Cyan/White) and Taillight (Red) materials
    const headMat = new THREE.MeshBasicMaterial({ color: 0xCCF8FF });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xFF1E00 });

    for (let i = 0; i < trafficCount; i++) {
      const carGroup = new THREE.Group();
      const carBody = new THREE.Mesh(carGeo, carMat);
      carGroup.add(carBody);

      // Headlight lamps
      const headL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.4), headMat);
      headL.position.set(-1.4, 0.2, 5.5);
      const headR = headL.clone();
      headR.position.x = 1.4;
      carGroup.add(headL);
      carGroup.add(headR);

      // Taillight bar
      const tail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 0.4), tailMat);
      tail.position.set(0, 0.2, -5.5);
      carGroup.add(tail);

      // Trajectory spline parameters: height tiers from +200m to +900m
      const tierY = 220 + (i % 5) * 160;
      const radius = 350 + (i % 6) * 110;
      const speed = 0.04 + Math.random() * 0.05;
      const direction = i % 2 === 0 ? 1 : -1;

      carGroup.position.set(
        Math.cos((i / trafficCount) * Math.PI * 2) * radius,
        tierY,
        Math.sin((i / trafficCount) * Math.PI * 2) * radius
      );

      this.cityGroup.add(carGroup);
      this.trafficVehicles.push({
        group: carGroup,
        radius,
        tierY,
        angle: (i / trafficCount) * Math.PI * 2,
        speed,
        direction
      });
    }
  }

  // --------------------------------------------------------------------------
  // 8. LASER-FENCED RESTRICTED TRANSIT CORRIDORS
  // --------------------------------------------------------------------------
  buildLaserFencedCorridors() {
    // Holographic barrier grids separating civilian traffic from race track
    const fenceMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.18,
      wireframe: true,
      blending: THREE.AdditiveBlending
    });

    for (let f = 0; f < 3; f++) {
      const fenceGeo = new THREE.CylinderGeometry(280 + f * 180, 280 + f * 180, 80, 24, 4, true);
      const fenceMesh = new THREE.Mesh(fenceGeo, fenceMat);
      fenceMesh.position.set(0, 420 + f * 180, 0);
      this.cityGroup.add(fenceMesh);
      this.laserFenceMeshes.push(fenceMesh);
    }
  }

  // --------------------------------------------------------------------------
  // 9. VOLUMETRIC ACID HAZE: Multi-Scattered Smog Strata (Denser at low altitude)
  // --------------------------------------------------------------------------
  buildVolumetricAcidHaze() {
    const hazeCount = 18;
    const hazeMat = new THREE.MeshBasicMaterial({
      color: 0x091b24,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    for (let h = 0; h < hazeCount; h++) {
      const planeGeo = new THREE.PlaneGeometry(1600, 1600);
      const hazeMesh = new THREE.Mesh(planeGeo, hazeMat);
      // Denser strata concentrated in the lower industrial trench (-200m to +250m)
      hazeMesh.position.set(0, -180 + h * 35, 0);
      hazeMesh.rotation.x = Math.PI * 0.5;
      this.cityGroup.add(hazeMesh);
    }
  }

  // --------------------------------------------------------------------------
  // DYNAMIC UPDATE LOOP (Called every frame from main loop)
  // --------------------------------------------------------------------------
  update(delta = 0.016) {
    const time = this.clock.getElapsedTime();

    // 1. Animate Aerodyne Sky-Traffic along transit splines
    for (const car of this.trafficVehicles) {
      car.angle += car.speed * delta * car.direction;
      const x = Math.cos(car.angle) * car.radius;
      const z = Math.sin(car.angle) * car.radius;
      car.group.position.set(x, car.tierY + Math.sin(time * 2 + car.angle) * 3, z);
      // Look forward along circle tangent
      car.group.rotation.y = -car.angle + (car.direction > 0 ? 0 : Math.PI);
    }

    // 2. Pulse Mega-Holograms with scanline glitch and chromatic flicker
    for (let i = 0; i < this.billboardMeshes.length; i++) {
      const flicker = 0.8 + Math.sin(time * 3.5 + i * 1.5) * 0.15 + (Math.random() < 0.02 ? -0.2 : 0.0);
      this.billboardMeshes[i].material.opacity = flicker;
    }

    // 3. Erupt superheated steam plumes in Industrial Cryo-Trench
    for (const vent of this.steamVents) {
      const pulse = 0.2 + Math.abs(Math.sin(time * 2.8 + vent.phase)) * 0.45;
      vent.mesh.material.opacity = pulse;
      vent.mesh.scale.set(1.0 + pulse * 0.5, 1.0 + pulse * 0.8, 1.0 + pulse * 0.5);
    }

    // 4. Subtle rotation of laser-fence containment fields
    for (let i = 0; i < this.laserFenceMeshes.length; i++) {
      this.laserFenceMeshes[i].rotation.y = time * 0.02 * (i % 2 === 0 ? 1 : -1);
    }
  }
}
