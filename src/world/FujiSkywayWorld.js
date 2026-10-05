import * as THREE from 'three';

// ============================================================================
// SECTOR 03 // MOUNTAIN — ORIFT / FUJI SKYWAY ENVIRONMENT
// Production 3D Environment matching AntiGravity Sector Design Plan (PDF Page 12-13, 31)
// 5-Layer Environment Stack:
// - Monumental 3D Snow-Capped Mount Fuji Volcanic Peak in North-West
// - Dense Alpine Pine & Birch Forest at Lower Elevations
// - Rugged Volcanic Basalt Rock Cliffs & Retaining Walls on Sky Rise
// - Suspended Sky Bridge Cable Pylons over Deep Alpine Gorge
// - High-Altitude Meteorological Observatory & Geodesic Radar Dome
// - Falling Snow Particles & Drifting Valley Cloud Banks
// ============================================================================

export class FujiSkywayWorld {
  constructor(scene, circuit) {
    this.scene = scene;
    this.circuit = circuit;

    this.root = new THREE.Group();
    this.scene.add(this.root);

    // Systems
    this.snowParticles = null;
    this.snowPoints = null;
    this.valleyClouds = [];
    this.drones = [];
    this.fujiMesh = null;
    this.forestGroup = null;
    this.rockGroup = null;
    this.bridgeGroup = null;
    this.observatoryMesh = null;
    this.skyDome = null;

    this.buildMountFujiSilhouette();
    this.buildAlpinePineForest();
    this.buildVolcanicCliffsAndRocks();
    this.buildSkyBridgeSupportPylons();
    this.buildMountainObservatory();
    this.buildFallingSnowParticles();
    this.buildAlpineSkyDome();
  }

  buildMountFujiSilhouette() {
    // Dominant 3D Volcanic Cone Silhouette of Mount Fuji (PDF Page 12, 31)
    const fujiGroup = new THREE.Group();
    // Positioned in North-West horizon so it anchors visual orientation throughout lap
    fujiGroup.position.set(-1800, 100, -2200);

    // Volcanic Cone Base
    const fujiBaseGeo = new THREE.ConeGeometry(850, 920, 32);
    const fujiBaseMat = new THREE.MeshStandardMaterial({
      color: 0x181f2a, // Dark volcanic basalt
      roughness: 0.9,
      metalness: 0.1
    });
    const fujiBase = new THREE.Mesh(fujiBaseGeo, fujiBaseMat);
    fujiBase.position.y = 460;
    fujiGroup.add(fujiBase);

    // Iconic Snow Cap on Summit
    const fujiSnowGeo = new THREE.ConeGeometry(380, 420, 32);
    const fujiSnowMat = new THREE.MeshStandardMaterial({
      color: 0xf0f6ff, // Pure white snow
      roughness: 0.45,
      metalness: 0.2
    });
    const fujiSnow = new THREE.Mesh(fujiSnowGeo, fujiSnowMat);
    fujiSnow.position.y = 710;
    fujiGroup.add(fujiSnow);

    // Flanking mountain ridgelines for depth
    [-800, 950].forEach((ox, idx) => {
      const ridgeGeo = new THREE.ConeGeometry(520, 560, 16);
      const ridge = new THREE.Mesh(ridgeGeo, fujiBaseMat);
      ridge.position.set(ox, 280, 200 + idx * 300);
      fujiGroup.add(ridge);
    });

    this.fujiMesh = fujiGroup;
    this.root.add(this.fujiMesh);
  }

  buildAlpinePineForest() {
    // Dense alpine evergreen forest along lower elevation (u = 0.0 to 0.28)
    const forestGroup = new THREE.Group();

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2b1c11, roughness: 0.85 });
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x1a3824, roughness: 0.75 });
    const snowPineMat = new THREE.MeshStandardMaterial({ color: 0x416852, roughness: 0.65 });

    const pineGeo1 = new THREE.ConeGeometry(2.8, 8.0, 6);
    const pineGeo2 = new THREE.ConeGeometry(2.2, 6.0, 6);
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 4.0, 5);

    // Dense cluster along S-bends
    for (let u = 0.02; u <= 0.32; u += 0.008) {
      const frame = this.circuit.getFrameAt(u);

      [-1, 1].forEach(side => {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let c = 0; c < count; c++) {
          const dist = this.circuit.roadWidth * 0.5 + 12 + c * 10 + Math.random() * 8;
          const treeGroup = new THREE.Group();
          treeGroup.position.copy(frame.pos)
            .addScaledVector(frame.binormal, side * dist)
            .addScaledVector(frame.normal, -0.5);

          // Trunk
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.y = 2.0;
          treeGroup.add(trunk);

          // Tiered foliage
          const mat = Math.random() > 0.5 ? pineMat : snowPineMat;
          const tier1 = new THREE.Mesh(pineGeo1, mat);
          tier1.position.y = 6.0;
          treeGroup.add(tier1);

          const tier2 = new THREE.Mesh(pineGeo2, mat);
          tier2.position.y = 9.5;
          treeGroup.add(tier2);

          forestGroup.add(treeGroup);
        }
      });
    }

    this.forestGroup = forestGroup;
    this.root.add(this.forestGroup);
  }

  buildVolcanicCliffsAndRocks() {
    // High-altitude basalt cliffs and retaining walls along Sky Rise and Cliff Run (u = 0.35 to 0.65)
    const rockGroup = new THREE.Group();

    const basaltMat = new THREE.MeshStandardMaterial({
      color: 0x1f242e,
      roughness: 0.88,
      metalness: 0.2
    });

    const snowRockMat = new THREE.MeshStandardMaterial({
      color: 0xdde5f0,
      roughness: 0.6,
      metalness: 0.25
    });

    for (let u = 0.35; u <= 0.65; u += 0.015) {
      const frame = this.circuit.getFrameAt(u);
      const isHairpin = (u >= 0.54 && u <= 0.62);

      // Inner cliff face
      const h = 55.0 + Math.sin(u * 50) * 20.0;
      const r = 22.0 + Math.cos(u * 70) * 6.0;
      const rockGeo = new THREE.CylinderGeometry(r * 0.8, r * 1.15, h, 6);
      const rock = new THREE.Mesh(rockGeo, (frame.pos.y > 450 ? snowRockMat : basaltMat));

      const sideOffset = isHairpin ? (this.circuit.roadWidth * 0.5 + r * 0.8) : (this.circuit.roadWidth * 0.5 + 24);
      rock.position.copy(frame.pos)
        .addScaledVector(frame.binormal, sideOffset)
        .addScaledVector(frame.normal, h * 0.45);
      rock.rotation.y = u * 25;
      rockGroup.add(rock);

      // Outer barrier retaining concrete foundation
      const wallGeo = new THREE.BoxGeometry(3.5, 12.0, 16.0);
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x121720, metalness: 0.9, roughness: 0.3 });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.copy(frame.pos)
        .addScaledVector(frame.binormal, -(this.circuit.roadWidth * 0.5 + 2.5))
        .addScaledVector(frame.normal, -4);
      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      wall.quaternion.setFromRotationMatrix(m);
      rockGroup.add(wall);
    }

    this.rockGroup = rockGroup;
    this.root.add(this.rockGroup);
  }

  buildSkyBridgeSupportPylons() {
    // Massive suspended anti-gravity pylons supporting The Sky Bridge (u = 0.74 to 0.88)
    const bridgeGroup = new THREE.Group();
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x0c131d, metalness: 0.95, roughness: 0.2 });
    const emitterMat = new THREE.MeshBasicMaterial({ color: 0x8AE2FF });

    [0.76, 0.84].forEach(u => {
      const frame = this.circuit.getFrameAt(u);
      const pylonGroup = new THREE.Group();
      pylonGroup.position.copy(frame.pos);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      pylonGroup.quaternion.setFromRotationMatrix(m);

      const span = this.circuit.roadWidth + 14.0;
      const height = 95.0;

      // Left & Right Tower Columns
      [-span * 0.5, span * 0.5].forEach(sideX => {
        const colGeo = new THREE.CylinderGeometry(2.2, 3.8, height, 8);
        const col = new THREE.Mesh(colGeo, steelMat);
        col.position.set(sideX, height * 0.5 - 20, 0);
        pylonGroup.add(col);

        // Magnetic Field Emitter Ring on Pylon top
        const ringGeo = new THREE.TorusGeometry(3.2, 0.4, 6, 16);
        const ring = new THREE.Mesh(ringGeo, emitterMat);
        ring.position.set(sideX, height - 20, 0);
        pylonGroup.add(ring);
      });

      // Arch Crossbeam
      const crossGeo = new THREE.BoxGeometry(span + 4.0, 3.8, 5.0);
      const cross = new THREE.Mesh(crossGeo, steelMat);
      cross.position.set(0, height * 0.75, 0);
      pylonGroup.add(cross);

      bridgeGroup.add(pylonGroup);
    });

    this.bridgeGroup = bridgeGroup;
    this.root.add(this.bridgeGroup);
  }

  buildMountainObservatory() {
    // High-altitude research observatory with geodesic radar dome (u = 0.86)
    const obsFrame = this.circuit.getFrameAt(0.86);
    const obsGroup = new THREE.Group();
    obsGroup.position.copy(obsFrame.pos)
      .addScaledVector(obsFrame.binormal, 48.0)
      .addScaledVector(obsFrame.normal, 12.0);

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a2332, metalness: 0.9, roughness: 0.3 });
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xd0e0f0, metalness: 0.5, roughness: 0.15 });

    // Observatory Cylindrical Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(14, 16, 18, 16), baseMat);
    base.position.y = 9;
    obsGroup.add(base);

    // Geodesic Radar Dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), domeMat);
    dome.position.y = 18;
    obsGroup.add(dome);

    // Communication Antenna Spire
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.8, 32, 6), baseMat);
    spire.position.y = 34;
    obsGroup.add(spire);

    // Flashing red warning light at antenna tip
    const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshBasicMaterial({ color: 0xFF0033 }));
    beacon.position.y = 50;
    obsGroup.add(beacon);

    this.observatoryMesh = obsGroup;
    this.root.add(this.observatoryMesh);
  }

  buildFallingSnowParticles() {
    // Falling snow particles active over high mountain elevations (PDF Page 16)
    const snowCount = 650;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);

    for (let i = 0; i < snowCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 2400;
      positions[i * 3 + 1] = 60 + Math.random() * 520;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2400;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 3.5,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.snowPoints = new THREE.Points(geo, mat);
    this.snowParticles = this.snowPoints;
    this.root.add(this.snowPoints);
  }

  buildAlpineSkyDome() {
    const skyGeo = new THREE.SphereGeometry(4200, 32, 24);
    let skyTex = null;

    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0.0, '#030814'); // Crisp high-altitude zenith
      grad.addColorStop(0.35, '#0a1d38'); // Deep alpine blue
      grad.addColorStop(0.7, '#1b3f63'); // Cold mountain troposphere
      grad.addColorStop(0.9, '#4d759a'); // Snow haze horizon
      grad.addColorStop(1.0, '#1a293b'); // Valley floor blend
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
    // 1. Center Sky Dome on player
    if (this.skyDome && playerPos) {
      this.skyDome.position.x = playerPos.x;
      this.skyDome.position.z = playerPos.z;
    }

    // 2. Animate falling snow particles
    if (this.snowParticles) {
      const positions = this.snowParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 22.0 * delta; // Fall downwards
        positions[i + 0] += 4.0 * delta;  // Slight alpine wind drift
        if (positions[i + 1] < 40) {
          positions[i + 1] = 560; // Reset to sky
        }
      }
      this.snowParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  dispose() {
    if (this.scene && this.root) {
      this.scene.remove(this.root);
    }
  }
}
