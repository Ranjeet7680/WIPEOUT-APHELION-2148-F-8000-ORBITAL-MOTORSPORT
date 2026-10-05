import * as THREE from 'three';
import { isInsideTunnel } from '../track/CityCircuit.js';

// ============================================================================
// NEO-SHINJUKU METROPOLIS: 8-DISTRICT OPEN-WORLD ENVIRONMENT (2089)
// Megastructures, Holographic Ads, Elevated Skyways, Moving Aerodynes,
// Monorail Cyber-Trains, Steam Vents, and Dynamic Rain Atmosphere
// ============================================================================

// Scratch math objects to eliminate 64 allocations per frame in animation loop
const _skyAlt = new THREE.Vector3();
const _skyMat = new THREE.Matrix4();

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
    // 0. CELESTIAL SKY DOME & ORBITAL RING
    this.buildCelestialSkyDome();

    // 1. NEON CORE & MEGA TOWER SKYSCRAPERS (Instanced architecture)
    this.buildSkyscraperArcologies();

    // 1.5 SKYSCRAPER ROAD TUNNELS (Where road intercepts megabuildings)
    this.buildSkyscraperRoadTunnels();

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

    // 7. HIGHWAY OVERPASS ARCHES WITH ANIMATED LED CHEVRONS
    this.buildSkywayOverpassArches();

    // 8. LUSH URBAN TREES & ROADSIDE CHERRY BLOSSOM SAKURA GREENERY
    this.buildUrbanTreesAndGreenery();

    // 9. REALISTIC 2-3 STORY RESIDENTIAL HOUSES & STREET-LEVEL SHOPFRONTS
    this.buildStreetHousesAndShops();
  }

  buildCelestialSkyDome() {
    const skyGroup = new THREE.Group();

    // 0. Panoramic Cyberpunk Celestial Sky Sphere (360-degree gradient & horizon light pollution)
    const skyGeo = new THREE.SphereGeometry(4500, 36, 24);
    let skyTex = null;
    if (typeof document !== 'undefined') {
      const skyCanvas = document.createElement('canvas');
      skyCanvas.width = 1024;
      skyCanvas.height = 1024;
      const sCtx = skyCanvas.getContext('2d');

      // Atmospheric vertical gradient
      const skyGrad = sCtx.createLinearGradient(0, 0, 0, 1024);
      skyGrad.addColorStop(0.00, '#020308'); // Cosmic dark void zenith
      skyGrad.addColorStop(0.24, '#060918'); // Upper space depth
      skyGrad.addColorStop(0.48, '#140828'); // Cyber-violet stratosphere
      skyGrad.addColorStop(0.68, '#2d0a3d'); // Shinjuku neon magenta glow
      skyGrad.addColorStop(0.84, '#131b36'); // Indigo-cyan transition
      skyGrad.addColorStop(0.95, '#07243c'); // Vibrant cyan dawn horizon line
      skyGrad.addColorStop(1.00, '#05111e'); // Ground fog blend tone
      sCtx.fillStyle = skyGrad;
      sCtx.fillRect(0, 0, 1024, 1024);

      // Starfield detailing in upper sky
      sCtx.fillStyle = '#FFFFFF';
      for (let s = 0; s < 450; s++) {
        const sx = ((s * 97.7) % 1024);
        const sy = ((s * 43.3) % 650);
        const sr = 0.6 + (s % 3) * 0.45;
        const sa = 0.3 + (s % 7) * 0.1;
        sCtx.globalAlpha = sa;
        sCtx.beginPath();
        sCtx.arc(sx, sy, sr, 0, Math.PI * 2);
        sCtx.fill();
      }
      sCtx.globalAlpha = 1.0;

      // Glowing Cyberpunk Nebula Dust Ribbons
      const drawNebula = (cx, cy, rx, ry, color) => {
        const radGrad = sCtx.createRadialGradient(cx, cy, 10, cx, cy, rx);
        radGrad.addColorStop(0, color);
        radGrad.addColorStop(0.5, color.replace(/[\d\.]+\)$/, '0.07)'));
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = radGrad;
        sCtx.beginPath();
        sCtx.ellipse(cx, cy, rx, ry, 0.15, 0, Math.PI * 2);
        sCtx.fill();
      };
      drawNebula(300, 260, 260, 95, 'rgba(0, 240, 255, 0.16)');
      drawNebula(750, 360, 300, 110, 'rgba(255, 0, 127, 0.14)');
      drawNebula(520, 180, 200, 70, 'rgba(121, 40, 202, 0.16)');

      skyTex = new THREE.CanvasTexture(skyCanvas);
      skyTex.wrapS = THREE.RepeatWrapping;
      skyTex.wrapT = THREE.ClampToEdgeWrapping;
    }

    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    skyDome.position.set(0, 0, 0);
    skyGroup.add(skyDome);
    this.skyDome = skyDome;

    // 1. Distant Glowing Moon / Orbital Station Silhouette
    const moonGeo = new THREE.CircleGeometry(180, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0x9be5ff,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(450, 1600, -850);
    moon.lookAt(0, 150, 0);
    skyGroup.add(moon);

    // Glowing atmospheric moon halo
    const haloGeo = new THREE.RingGeometry(180, 240, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(moon.position);
    halo.quaternion.copy(moon.quaternion);
    skyGroup.add(halo);

    // 2. Gigantic Orbital Ring in Upper Stratosphere
    const ringGeo = new THREE.RingGeometry(3200, 3280, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 1800, 0);
    ring.rotation.x = Math.PI * 0.35;
    ring.rotation.y = Math.PI * 0.15;
    skyGroup.add(ring);

    // 3. Towering Light Spires shooting into the night sky (placed outside circuit perimeter)
    const spireColors = [0x00F0FF, 0x7928CA, 0xFF007F, 0x00FF88, 0xFFB800];
    const spirePositions = [
      { x: -1400, z: -1100 },
      { x: 1500, z: 1200 },
      { x: 1100, z: -1500 },
      { x: -1600, z: 900 },
      { x: 400, z: 1800 }
    ];
    spirePositions.forEach((pos, idx) => {
      const spireBeamGeo = new THREE.CylinderGeometry(0.8, 14, 1800, 8);
      const spireBeamMat = new THREE.MeshBasicMaterial({
        color: spireColors[idx % spireColors.length],
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      });
      const beam = new THREE.Mesh(spireBeamGeo, spireBeamMat);
      beam.position.set(pos.x, 900, pos.z);
      skyGroup.add(beam);
    });

    this.root.add(skyGroup);
  }

  buildSkywayOverpassArches() {
    const archUValues = [0.03, 0.18, 0.26, 0.42, 0.54, 0.68, 0.76, 0.92];
    const archGroup = new THREE.Group();

    archUValues.forEach((u, i) => {
      if (isInsideTunnel(u)) return;
      const frame = this.circuit.getFrameAt(u);
      const span = this.circuit.roadWidth + 14; // 42m span ensures columns sit 7m beyond barrier
      const height = 16.0; // 16m high clearance guarantees ascending slopes (e.g. u=0.76) never intersect

      // Heavy industrial support gantry
      const gantryGeo = new THREE.BoxGeometry(span, 1.4, 3.2);
      const gantryMat = new THREE.MeshStandardMaterial({
        color: 0x111622,
        metalness: 0.92,
        roughness: 0.25
      });
      const gantry = new THREE.Mesh(gantryGeo, gantryMat);
      gantry.position.copy(frame.pos).addScaledVector(frame.normal, height);
      gantry.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
      );
      archGroup.add(gantry);

      // Glowing LED guidance strip
      const neonStripGeo = new THREE.PlaneGeometry(span * 0.85, 0.6);
      const neonColor = (i % 2 === 0) ? 0x00F0FF : 0xFF007F;
      const neonMat = new THREE.MeshBasicMaterial({
        color: neonColor,
        side: THREE.DoubleSide
      });
      const strip = new THREE.Mesh(neonStripGeo, neonMat);
      strip.position.copy(frame.pos).addScaledVector(frame.normal, height - 0.4);
      strip.quaternion.copy(gantry.quaternion);
      archGroup.add(strip);

      // Dual upright columns
      [-span * 0.48, span * 0.48].forEach(sideOffset => {
        const colGeo = new THREE.CylinderGeometry(0.8, 1.0, height, 8);
        const col = new THREE.Mesh(colGeo, gantryMat);
        col.position.copy(frame.pos)
          .addScaledVector(frame.binormal, sideOffset)
          .addScaledVector(frame.normal, height * 0.5);
        col.quaternion.copy(gantry.quaternion);
        archGroup.add(col);
      });
    });

    this.root.add(archGroup);
  }

  buildSkyscraperArcologies() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // High-definition Cyberpunk Skyscraper Architectural Facade Texture
    let buildingTex = null;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // 1. Dark graphite composite armor paneling base
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, 0, 512, 1024);

      // 2. Vertical structural pilasters / mullions with depth shading
      const pilasters = [0, 64, 128, 256, 384, 448, 508];
      pilasters.forEach(px => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px, 0, 8, 1024);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.fillRect(px + 3, 0, 2, 1024);
      });

      // 3. Horizontal floor floorplates and structural service bands
      for (let y = 0; y < 1024; y += 64) {
        ctx.fillStyle = '#141e34';
        ctx.fillRect(0, y, 512, 6);
        ctx.fillStyle = '#05070d';
        ctx.fillRect(0, y + 6, 512, 2);
      }

      // 4. Edge luminescent cyber-conduits (Neon Cyan & Electric Magenta)
      ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.fillRect(2, 0, 4, 1024);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.fillRect(0, 0, 10, 1024);

      ctx.fillStyle = 'rgba(255, 0, 127, 0.9)';
      ctx.fillRect(506, 0, 4, 1024);
      ctx.fillStyle = 'rgba(255, 0, 127, 0.25)';
      ctx.fillRect(502, 0, 10, 1024);

      // 5. Multi-density illuminated window arrays
      for (let y = 14; y < 1010; y += 20) {
        const floorTier = Math.floor(y / 64);
        const isPenthouse = (y > 880);
        const isWarmZone = (floorTier % 4 === 0);
        const isServerZone = (floorTier % 4 === 2);

        for (let x = 16; x < 496; x += 32) {
          if (pilasters.some(p => Math.abs(x - p) < 14)) continue;

          const rand = Math.sin(x * 12.7 + y * 91.3) * 0.5 + 0.5;
          if (rand > 0.30) {
            if (isPenthouse) {
              ctx.fillStyle = 'rgba(255, 0, 127, 0.95)';
            } else if (isServerZone) {
              ctx.fillStyle = rand > 0.6 ? 'rgba(0, 240, 255, 0.95)' : 'rgba(0, 255, 136, 0.85)';
            } else if (isWarmZone) {
              ctx.fillStyle = 'rgba(255, 184, 0, 0.9)';
            } else {
              ctx.fillStyle = rand > 0.7 ? 'rgba(165, 230, 255, 0.95)' : 'rgba(0, 240, 255, 0.75)';
            }
            ctx.fillRect(x, y, 20, 10);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(x, y + 8, 20, 2);
          }
        }
      }

      // 6. High-level observation sky-lounge glass ribbons
      for (let py = 128; py < 950; py += 192) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
        ctx.fillRect(10, py, 492, 6);
        ctx.fillStyle = 'rgba(255, 0, 127, 0.7)';
        ctx.fillRect(10, py + 6, 492, 3);
      }

      // 7. Aviation hazard caution striping on mechanical service floors
      [192, 576, 768].forEach(hy => {
        ctx.fillStyle = 'rgba(255, 140, 0, 0.85)';
        for (let hx = 10; hx < 500; hx += 24) {
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + 12, hy);
          ctx.lineTo(hx + 4, hy + 12);
          ctx.lineTo(hx - 8, hy + 12);
          ctx.closePath();
          ctx.fill();
        }
      });

      // 8. Vertical Japanese Cyberpunk Kanji & Corporate Typography
      ctx.save();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      const kanjiList = ['新', '宿', '電', '脳', '区', '光', '速', '極'];
      kanjiList.forEach((k, ki) => {
        ctx.fillText(k, 36, 320 + ki * 42);
        ctx.fillText(k, 476, 320 + ki * 42);
      });
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('AETHER-9', 256, 120);
      ctx.fillText('APHELION CORP', 256, 500);
      ctx.fillText('NEO SHINJUKU', 256, 880);
      ctx.restore();

      buildingTex = new THREE.CanvasTexture(canvas);
      buildingTex.wrapS = THREE.RepeatWrapping;
      buildingTex.wrapT = THREE.RepeatWrapping;
      buildingTex.anisotropy = 4;
      buildingTex.generateMipmaps = true;
    }

    const buildingMat = new THREE.MeshStandardMaterial({
      map: buildingTex,
      metalness: 0.85,
      roughness: 0.25,
      emissive: new THREE.Color(0x060a14),
      emissiveIntensity: 0.95
    });

    const towerCount = 140;
    const instancedMesh = new THREE.InstancedMesh(boxGeo, buildingMat, towerCount);
    instancedMesh.castShadow = false; // Zero shadow pass overhead for high FPS
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < towerCount; i++) {
      // Place buildings along outer corridors flanking the circuit spline
      const u = (i / towerCount);
      const frame = this.circuit.getFrameAt(u);

      // Determine which side of the track (left or right) has open panoramic space
      // rather than an inner congested track loop
      let clearSide = (i % 2 === 0 ? 1 : -1);
      if (this.circuit && this.circuit.samples && this.circuit.samples.length > 0) {
        let minDPos = Infinity;
        let minDNeg = Infinity;
        const testD = 140.0;
        const pPos = frame.pos.clone().addScaledVector(frame.binormal, testD);
        const pNeg = frame.pos.clone().addScaledVector(frame.binormal, -testD);
        for (let s = 0; s < this.circuit.samples.length; s += 3) {
          const smp = this.circuit.samples[s];
          const du = Math.abs(smp.u - u);
          const wrapDu = Math.min(du, 1.0 - du);
          if (wrapDu > 0.04) {
            const dP = pPos.distanceTo(smp.pos);
            const dN = pNeg.distanceTo(smp.pos);
            if (dP < minDPos) minDPos = dP;
            if (dN < minDNeg) minDNeg = dN;
          }
        }
        clearSide = minDPos >= minDNeg ? 1 : -1;
      }

      const width = 45 + Math.random() * 75;
      const depth = 45 + Math.random() * 75;
      const height = 250 + Math.random() * 700;
      const y = height * 0.5 - 60;
      const cornerRadius = Math.sqrt(width * width + depth * depth) * 0.5;

      // Safe clearance: road half-width + tower diagonal corner radius + 28m buffer
      const minClearance = (this.circuit.roadWidth * 0.5) + cornerRadius + 28.0;
      let dist = Math.max(90 + Math.random() * 180, minClearance);

      let x = frame.pos.x + frame.binormal.x * clearSide * dist;
      let z = frame.pos.z + frame.binormal.z * clearSide * dist;

      // Exhaustive safety loop: ensure regular skyscrapers never intersect ANY segment of the circuit track loop
      if (this.circuit && this.circuit.samples && this.circuit.samples.length > 0) {
        let shifts = 0;
        for (let s = 0; s < this.circuit.samples.length && shifts < 50; s++) {
          const sample = this.circuit.samples[s];
          const dx = x - sample.pos.x;
          const dz = z - sample.pos.z;
          const dCenter = Math.sqrt(dx * dx + dz * dz);
          const reqDist = (this.circuit.roadWidth * 0.5) + cornerRadius + 20.0;
          if (dCenter < reqDist) {
            dist += (reqDist - dCenter) + 24.0;
            x = frame.pos.x + frame.binormal.x * clearSide * dist;
            z = frame.pos.z + frame.binormal.z * clearSide * dist;
            s = -1; // Restart verification from start of loop
            shifts++;
          }
        }
      }

      dummy.position.set(x, y, z);
      dummy.scale.set(width, height, depth);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();

      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    this.root.add(instancedMesh);
  }

  // --------------------------------------------------------------------------
  // 1.5 SKYSCRAPER ROAD TUNNELS: High-Tech Building Interceptions
  // Generates monumental cyberpunk arcology tunnels where the road punches
  // straight through massive skyscrapers with illuminated portals and interior LED strips
  // --------------------------------------------------------------------------
  buildSkyscraperRoadTunnels() {
    this.skyscraperTunnelsGroup = new THREE.Group();
    this.skyscraperTunnels = [];

    const tunnelSpecs = [
      {
        id: 'neonCoreTunnel',
        name: 'NEON CORE CITADEL SKYBRIDGE TUNNEL',
        uStart: 0.08,
        uEnd: 0.13,
        districtColor: 0x00F0FF,
        districtHex: '#00F0FF',
        towerHeight: 520,
        towerWidth: 55,
        towerDepth: 75,
        portalColor: 0x00F0FF,
        signTitle: '▲ CITADEL MEGASTRUCTURE // TRANSIT TUNNEL ▲',
        signSub: 'NEON CORE DISTRICT 01 // AUTONOMOUS HIGHWAY GRID'
      },
      {
        id: 'industrialRiftTunnel',
        name: 'INDUSTRIAL CRYO-MONOLITH ARCOLOGY TUNNEL',
        uStart: 0.32,
        uEnd: 0.38,
        districtColor: 0xFFB800,
        districtHex: '#FFB800',
        towerHeight: 560,
        towerWidth: 60,
        towerDepth: 85,
        portalColor: 0xFFAA00,
        signTitle: '▲ INDUSTRIAL RIFT // MONOLITH CORE TUNNEL ▲',
        signSub: 'HEAVY PRODUCTION CORRIDOR // CAUTION HIGH TURBULENCE'
      },
      {
        id: 'oldShinjukuTunnel',
        name: 'OLD SHINJUKU CYBER-MEGABUILDING TUNNEL',
        uStart: 0.46,
        uEnd: 0.515,
        districtColor: 0xFF2A13,
        districtHex: '#FF2A13',
        towerHeight: 450,
        towerWidth: 52,
        towerDepth: 70,
        portalColor: 0xFF2A13,
        signTitle: '▲ OLD SHINJUKU // RETRO-CYBER ARCADE TUNNEL ▲',
        signSub: 'MULTI-LEVEL TRANSIT DECK // RESTRICTED AIRSPACE'
      },
      {
        id: 'undercityTunnel',
        name: 'UNDERCITY SUBTERRANEAN MEGA-TUBE TUNNEL',
        uStart: 0.565,
        uEnd: 0.655,
        districtColor: 0x00FF66,
        districtHex: '#00FF66',
        towerHeight: 420,
        towerWidth: 65,
        towerDepth: 110,
        portalColor: 0x00FF88,
        signTitle: '▲ UNDERCITY CHASM // SUBTERRANEAN FOUNDATION TUNNEL ▲',
        signSub: 'UNDERGROUND ARCOLOGY PLUNGE // GROUND EFFECT LOCK'
      },
      {
        id: 'megaTowerTunnel',
        name: 'MEGA TOWER MONOLITH CORE PENETRATION TUNNEL',
        uStart: 0.82,
        uEnd: 0.88,
        districtColor: 0xFF007F,
        districtHex: '#FF007F',
        towerHeight: 780,
        towerWidth: 70,
        towerDepth: 80,
        portalColor: 0xFF007F,
        signTitle: '▲ MEGA TOWER ZONE // MONOLITH PENETRATION TUNNEL ▲',
        signSub: 'ORBITAL HIGHWAY FEEDER // MAXIMUM VELOCITY AUTHORIZED'
      }
    ];

    // Shared high-durability tunnel materials
    const tunnelLiningMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.88,
      roughness: 0.28,
      side: THREE.DoubleSide
    });

    const portalFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e18,
      metalness: 0.95,
      roughness: 0.2
    });

    tunnelSpecs.forEach(spec => {
      const tunnelGroup = new THREE.Group();
      const halfWidth = this.circuit.roadWidth * 0.5 + 3.2; // 17.2m clearance (road is 28m)
      const tunnelHeight = 13.5; // High clearance
      const sliceCount = 20;

      // 1. Continuous 3D Tunnel Canopy Tube Geometry
      const positions = [];
      const normals = [];
      const uvs = [];
      const indices = [];

      // 6-point arched cross section relative to track frame
      const crossSection = [
        { x: -halfWidth, y: 0.1 },             // 0: Left base
        { x: -halfWidth, y: 7.0 },             // 1: Left wall
        { x: -halfWidth * 0.65, y: 12.8 },     // 2: Left ceiling chamfer
        { x: 0.0, y: tunnelHeight },           // 3: Ceiling apex
        { x: halfWidth * 0.65, y: 12.8 },      // 4: Right ceiling chamfer
        { x: halfWidth, y: 7.0 },              // 5: Right wall
        { x: halfWidth, y: 0.1 }               // 6: Right base
      ];

      for (let s = 0; s < sliceCount; s++) {
        const u = spec.uStart + (s / (sliceCount - 1)) * (spec.uEnd - spec.uStart);
        const frame = this.circuit.getFrameAt(u);

        crossSection.forEach((pt, pIdx) => {
          const worldPos = frame.pos.clone()
            .addScaledVector(frame.binormal, pt.x)
            .addScaledVector(frame.normal, pt.y);

          positions.push(worldPos.x, worldPos.y, worldPos.z);

          // Calculate normal vector pointing inwards
          const inwardNorm = frame.binormal.clone().multiplyScalar(-Math.sign(pt.x) * (pt.y < 7.0 ? 1 : 0.5))
            .addScaledVector(frame.normal, -0.6).normalize();
          normals.push(inwardNorm.x, inwardNorm.y, inwardNorm.z);

          uvs.push(pIdx / (crossSection.length - 1), s / (sliceCount - 1));
        });

        // Form quad faces between adjacent slices
        if (s > 0) {
          const currBase = s * crossSection.length;
          const prevBase = (s - 1) * crossSection.length;
          for (let p = 0; p < crossSection.length - 1; p++) {
            const p0 = prevBase + p;
            const p1 = prevBase + p + 1;
            const p2 = currBase + p + 1;
            const p3 = currBase + p;
            // Two triangles for quad
            indices.push(p0, p1, p2);
            indices.push(p0, p2, p3);
          }
        }
      }

      const tubeGeo = new THREE.BufferGeometry();
      tubeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      tubeGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      tubeGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      tubeGeo.setIndex(indices);
      tubeGeo.computeVertexNormals();

      const tubeMesh = new THREE.Mesh(tubeGeo, tunnelLiningMat);
      tunnelGroup.add(tubeMesh);

      // 2. High-Speed 4-Track Illuminated Neon Runners (Ceiling & Floor Kick-Rails)
      const stripMat = new THREE.MeshBasicMaterial({
        color: spec.districtColor,
        side: THREE.DoubleSide
      });
      const floorStripMat = new THREE.MeshBasicMaterial({
        color: spec.portalColor,
        side: THREE.DoubleSide
      });

      // Ceiling Runners
      [-halfWidth * 0.45, halfWidth * 0.45].forEach(stripX => {
        const stripPositions = [];
        for (let s = 0; s < sliceCount; s++) {
          const u = spec.uStart + (s / (sliceCount - 1)) * (spec.uEnd - spec.uStart);
          const frame = this.circuit.getFrameAt(u);
          const pt = frame.pos.clone()
            .addScaledVector(frame.binormal, stripX)
            .addScaledVector(frame.normal, tunnelHeight - 0.4);
          stripPositions.push(pt);
        }
        const stripCurve = new THREE.CatmullRomCurve3(stripPositions);
        const stripGeo = new THREE.TubeGeometry(stripCurve, sliceCount * 2, 0.35, 6, false);
        const stripMesh = new THREE.Mesh(stripGeo, stripMat);
        tunnelGroup.add(stripMesh);
      });

      // Floor Baseboard Neon Kick-Rails
      [-halfWidth + 0.4, halfWidth - 0.4].forEach(stripX => {
        const stripPositions = [];
        for (let s = 0; s < sliceCount; s++) {
          const u = spec.uStart + (s / (sliceCount - 1)) * (spec.uEnd - spec.uStart);
          const frame = this.circuit.getFrameAt(u);
          const pt = frame.pos.clone()
            .addScaledVector(frame.binormal, stripX)
            .addScaledVector(frame.normal, 0.35);
          stripPositions.push(pt);
        }
        const stripCurve = new THREE.CatmullRomCurve3(stripPositions);
        const stripGeo = new THREE.TubeGeometry(stripCurve, sliceCount * 2, 0.22, 6, false);
        const stripMesh = new THREE.Mesh(stripGeo, floorStripMat);
        tunnelGroup.add(stripMesh);
      });

      // 3. Interior Structural Rib Arches & Ceiling Jet Booster Turbines
      const ribCount = Math.max(6, Math.floor(sliceCount * 0.65));
      const jetMat = new THREE.MeshStandardMaterial({ color: 0x141a26, metalness: 0.92, roughness: 0.25 });
      const jetFanMat = new THREE.MeshStandardMaterial({ color: 0x080c14, metalness: 0.95, roughness: 0.15 });

      for (let r = 0; r < ribCount; r++) {
        const u = spec.uStart + (r / (ribCount - 1)) * (spec.uEnd - spec.uStart);
        const frame = this.circuit.getFrameAt(u);

        const ribGeo = new THREE.TorusGeometry(halfWidth + 0.6, 0.75, 6, 20, Math.PI);
        const ribMesh = new THREE.Mesh(ribGeo, portalFrameMat);
        ribMesh.position.copy(frame.pos).addScaledVector(frame.normal, 0.5);

        const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
        ribMesh.quaternion.setFromRotationMatrix(m);
        tunnelGroup.add(ribMesh);

        // Emergency beacon ring on ribs
        const beaconMat = new THREE.MeshBasicMaterial({
          color: (r % 2 === 0) ? spec.districtColor : 0xFFAA00
        });
        const beaconGeo = new THREE.BoxGeometry(0.8, 0.3, 1.2);
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.copy(frame.pos).addScaledVector(frame.normal, tunnelHeight - 0.2);
        beacon.quaternion.copy(ribMesh.quaternion);
        tunnelGroup.add(beacon);

        // Overhead Jet Ventilation Boost Turbines mounted in pairs on alternating ribs
        if (r % 2 === 1) {
          [-halfWidth * 0.38, halfWidth * 0.38].forEach(fanX => {
            const turbineGroup = new THREE.Group();
            turbineGroup.position.copy(frame.pos)
              .addScaledVector(frame.binormal, fanX)
              .addScaledVector(frame.normal, tunnelHeight - 1.6);
            turbineGroup.quaternion.copy(ribMesh.quaternion);

            // Cylindrical Nacelle Housing
            const nacelleGeo = new THREE.CylinderGeometry(0.72, 0.72, 3.2, 12);
            nacelleGeo.rotateX(Math.PI * 0.5);
            const nacelle = new THREE.Mesh(nacelleGeo, jetMat);
            turbineGroup.add(nacelle);

            // Internal fan spinner cone
            const coneGeo = new THREE.ConeGeometry(0.25, 0.8, 8);
            coneGeo.rotateX(Math.PI * 0.5);
            const cone = new THREE.Mesh(coneGeo, jetFanMat);
            cone.position.set(0, 0, 1.3);
            turbineGroup.add(cone);

            // Warning Strobe Beacon
            const strobeGeo = new THREE.BoxGeometry(0.2, 0.15, 0.4);
            const strobeMat = new THREE.MeshBasicMaterial({ color: 0xFFAA00 });
            const strobe = new THREE.Mesh(strobeGeo, strobeMat);
            strobe.position.set(0, 0.8, 0);
            turbineGroup.add(strobe);

            tunnelGroup.add(turbineGroup);
          });
        }
      }

      // 4. Portal Entrance & Exit Gateway Arches (Heavy fortified portal gantries)
      [spec.uStart, spec.uEnd].forEach((portalU, pIdx) => {
        const frame = this.circuit.getFrameAt(portalU);
        const isEntrance = (pIdx === 0);

        // Heavy Portal Arch Frame
        const pSpan = halfWidth * 2 + 3.5;
        const pHeight = tunnelHeight + 3.0;

        // Top lintel
        const lintelGeo = new THREE.BoxGeometry(pSpan, 2.5, 4.0);
        const lintel = new THREE.Mesh(lintelGeo, portalFrameMat);
        lintel.position.copy(frame.pos).addScaledVector(frame.normal, pHeight - 1.2);
        lintel.quaternion.setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
        );
        tunnelGroup.add(lintel);

        // Side support pylons
        [-pSpan * 0.48, pSpan * 0.48].forEach(sideX => {
          const colGeo = new THREE.BoxGeometry(2.4, pHeight, 4.0);
          const col = new THREE.Mesh(colGeo, portalFrameMat);
          col.position.copy(frame.pos)
            .addScaledVector(frame.binormal, sideX)
            .addScaledVector(frame.normal, pHeight * 0.5);
          col.quaternion.copy(lintel.quaternion);
          tunnelGroup.add(col);

          // Vertical neon pylon strip
          const neonPylonGeo = new THREE.PlaneGeometry(0.5, pHeight * 0.85);
          const neonPylon = new THREE.Mesh(neonPylonGeo, stripMat);
          neonPylon.position.copy(col.position)
            .addScaledVector(frame.tangent, (isEntrance ? -2.05 : 2.05));
          neonPylon.quaternion.copy(lintel.quaternion);
          if (!isEntrance) neonPylon.rotateY(Math.PI);
          tunnelGroup.add(neonPylon);
        });

        // Glowing Neon Portal Outline Arch
        const portalArchGeo = new THREE.RingGeometry(pSpan * 0.42, pSpan * 0.46, 24, 1, 0, Math.PI);
        const portalArchMat = new THREE.MeshBasicMaterial({
          color: spec.portalColor,
          side: THREE.DoubleSide
        });
        const portalArch = new THREE.Mesh(portalArchGeo, portalArchMat);
        portalArch.position.copy(frame.pos)
          .addScaledVector(frame.normal, 0.4)
          .addScaledVector(frame.tangent, (isEntrance ? -2.1 : 2.1));
        portalArch.quaternion.copy(lintel.quaternion);
        tunnelGroup.add(portalArch);

        // Digital Holographic Highway Portal Display Board
        let signTex = null;
        if (typeof document !== 'undefined') {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');

          ctx.fillStyle = '#060a14';
          ctx.fillRect(0, 0, 512, 128);

          ctx.strokeStyle = spec.districtHex;
          ctx.lineWidth = 6;
          ctx.strokeRect(4, 4, 504, 120);

          ctx.fillStyle = spec.districtHex;
          ctx.font = 'bold 24px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(spec.signTitle, 256, 44);

          ctx.fillStyle = '#E0F0FF';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(spec.signSub, 256, 85);

          signTex = new THREE.CanvasTexture(canvas);
        }

        const signGeo = new THREE.PlaneGeometry(pSpan * 0.72, 3.2);
        const signMat = new THREE.MeshBasicMaterial({
          map: signTex,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide
        });
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.copy(frame.pos)
          .addScaledVector(frame.normal, pHeight + 0.8)
          .addScaledVector(frame.tangent, (isEntrance ? -2.05 : 2.05));
        signMesh.quaternion.copy(lintel.quaternion);
        if (!isEntrance) signMesh.rotateY(Math.PI);
        tunnelGroup.add(signMesh);
      });

      // 5. Monumental Cyber-Arcology Portals and Flanking Skyscraper Towers
      // The road penetrates through the base of towering skyscrapers at entrance and exit portals
      // Sleek dark titanium arcology finish - subtle architectural tone, eliminates solid pink wash
      const bMat = new THREE.MeshStandardMaterial({
        color: 0x0e1422,
        metalness: 0.92,
        roughness: 0.38,
        emissive: new THREE.Color(spec.districtColor),
        emissiveIntensity: 0.03
      });

      // World-Upright Monumental Portal Towers and Skybridge Crowns at Entrance and Exit
      [spec.uStart, spec.uEnd].forEach((pu) => {
        const pFrame = this.circuit.getFrameAt(pu);
        const heading = Math.atan2(pFrame.tangent.x, pFrame.tangent.z);
        const tWidth = spec.towerWidth * 0.75;
        const tHeight = spec.towerHeight;
        const tDepth = 22.0;
        const latDir = new THREE.Vector3(pFrame.binormal.x, 0, pFrame.binormal.z).normalize();

        // Left & Right Flanking Skyscraper Towers (World-Upright)
        [-1, 1].forEach(side => {
          const towerGeo = new THREE.BoxGeometry(tWidth, tHeight, tDepth);
          const tower = new THREE.Mesh(towerGeo, bMat);
          const offset = (halfWidth + tWidth * 0.5 + 8.0) * side;
          tower.position.set(
            pFrame.pos.x + latDir.x * offset,
            pFrame.pos.y + tHeight * 0.5 - 20.0,
            pFrame.pos.z + latDir.z * offset
          );
          tower.rotation.y = heading;

          // Road clearance safety verification against all circuit samples
          if (this.circuit && this.circuit.samples) {
            for (let s = 0; s < this.circuit.samples.length; s++) {
              const smp = this.circuit.samples[s];
              const dx = tower.position.x - smp.pos.x;
              const dz = tower.position.z - smp.pos.z;
              const d = Math.sqrt(dx * dx + dz * dz);
              const req = (this.circuit.roadWidth * 0.5) + (Math.max(tWidth, tDepth) * 0.5) + 6.0;
              if (d < req) {
                const push = (req - d) + 4.0;
                tower.position.x += latDir.x * side * push;
                tower.position.z += latDir.z * side * push;
              }
            }
          }

          // Architectural illuminated window strips on tower facing highway
          const winStripMat = new THREE.MeshStandardMaterial({
            color: 0x0a1626,
            emissive: new THREE.Color(spec.districtColor),
            emissiveIntensity: 0.25,
            metalness: 0.8,
            roughness: 0.2
          });
          const winStripGeo = new THREE.BoxGeometry(tWidth * 0.7, tHeight * 0.85, 0.4);
          const winStrip = new THREE.Mesh(winStripGeo, winStripMat);
          winStrip.position.set(0, 0, tDepth * 0.5 + 0.2);
          tower.add(winStrip);

          tunnelGroup.add(tower);
        });

        // Overhead Connecting Skybridge Truss (Spans above portal with elegant architectural proportions)
        const skybridgeH = 12.0; // Sleek multi-deck skybridge height
        const skybridgeW = halfWidth * 2 + tWidth * 1.2 + 8.0;
        const skybridgeDepth = 12.0;
        const skybridgeY = pFrame.pos.y + tunnelHeight + 5.0 + skybridgeH * 0.5;

        const bridgeGroup = new THREE.Group();
        bridgeGroup.position.set(pFrame.pos.x, skybridgeY, pFrame.pos.z);
        bridgeGroup.rotation.y = heading;

        // 1. Sleek Titanium Bridge Spine
        const bridgeSpineMat = new THREE.MeshStandardMaterial({
          color: 0x0d121c,
          metalness: 0.92,
          roughness: 0.35
        });
        const bridgeSpineGeo = new THREE.BoxGeometry(skybridgeW, skybridgeH, skybridgeDepth);
        const bridgeSpine = new THREE.Mesh(bridgeSpineGeo, bridgeSpineMat);
        bridgeGroup.add(bridgeSpine);

        // 2. Glazed Architectural Window Ribbon with Warm/District Interior Illumination
        const winBandGeo = new THREE.BoxGeometry(skybridgeW * 0.88, 3.2, skybridgeDepth + 0.3);
        const winBandMat = new THREE.MeshStandardMaterial({
          color: 0x1a334d,
          emissive: new THREE.Color(spec.districtColor),
          emissiveIntensity: 0.45,
          metalness: 0.5,
          roughness: 0.1
        });
        const winBand = new THREE.Mesh(winBandGeo, winBandMat);
        winBand.position.set(0, 0, 0);
        bridgeGroup.add(winBand);

        // 3. Neon Edge Runner Strips along Top & Bottom
        const edgeStripMat = new THREE.MeshBasicMaterial({ color: spec.portalColor });
        const topStripGeo = new THREE.BoxGeometry(skybridgeW + 0.4, 0.4, skybridgeDepth + 0.4);
        const topStrip = new THREE.Mesh(topStripGeo, edgeStripMat);
        topStrip.position.set(0, skybridgeH * 0.5 + 0.2, 0);
        bridgeGroup.add(topStrip);

        const btmStripGeo = new THREE.BoxGeometry(skybridgeW + 0.4, 0.4, skybridgeDepth + 0.4);
        const btmStrip = new THREE.Mesh(btmStripGeo, edgeStripMat);
        btmStrip.position.set(0, -skybridgeH * 0.5 - 0.2, 0);
        bridgeGroup.add(btmStrip);

        tunnelGroup.add(bridgeGroup);
      });

      this.skyscraperTunnelsGroup.add(tunnelGroup);
      this.skyscraperTunnels.push(spec);
    });

    this.root.add(this.skyscraperTunnelsGroup);
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
      let tex = null;
      if (typeof document !== 'undefined') {
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

        tex = new THREE.CanvasTexture(canvas);
      }
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.94,
        side: THREE.FrontSide
      });
      this.hologramMaterials.push(mat);

      const billboardGroup = new THREE.Group();

      // Screen plane
      const billboardGeo = new THREE.PlaneGeometry(36, 18);
      const screenMesh = new THREE.Mesh(billboardGeo, mat);
      screenMesh.position.z = 0.2;
      billboardGroup.add(screenMesh);

      // High-tech dark titanium backing frame & bezel
      const frameGeo = new THREE.BoxGeometry(37.5, 19.5, 0.4);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x0a0e16,
        metalness: 0.95,
        roughness: 0.3
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      billboardGroup.add(frameMesh);

      // Support truss pylon connecting to ground/buildings
      const trussGeo = new THREE.CylinderGeometry(0.6, 0.9, 32, 6);
      const trussMat = new THREE.MeshStandardMaterial({
        color: 0x111622,
        metalness: 0.9,
        roughness: 0.35
      });
      const trussMesh = new THREE.Mesh(trussGeo, trussMat);
      trussMesh.position.set(0, -20, 0);
      billboardGroup.add(trussMesh);

      // Position billboards along track with generous clearance
      const u = (i * 0.16 + 0.05) % 1.0;
      const frame = this.circuit.getFrameAt(u);
      const side = (i % 2 === 0 ? 1 : -1);

      billboardGroup.position.copy(frame.pos)
        .addScaledVector(frame.binormal, side * 36)
        .addScaledVector(frame.normal, 18 + (i % 3) * 6);

      billboardGroup.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(frame.binormal.clone().multiplyScalar(side), frame.normal, frame.tangent)
      );

      this.root.add(billboardGroup);
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
    // Monumental subterranean foundation pylons and chasm rock walls supporting upper metropolis (u = 0.55 to 0.66)
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x0c1018,
      metalness: 0.95,
      roughness: 0.35,
      emissive: new THREE.Color(0x003322),
      emissiveIntensity: 0.4
    });

    const pylonGeo = new THREE.BoxGeometry(6.0, 120.0, 12.0);
    const conduitGeo = new THREE.CylinderGeometry(0.8, 0.8, 120.0, 8);
    const neonConduitMat = new THREE.MeshBasicMaterial({ color: 0x00FF66 });

    const pylonCount = 14;
    for (let i = 0; i < pylonCount; i++) {
      const u = 0.54 + (i / (pylonCount - 1)) * 0.13;
      const frame = this.circuit.getFrameAt(u);
      
      [-1, 1].forEach(side => {
        const sideOffset = (this.circuit.roadWidth * 0.5 + 22.0) * side;
        const pylon = new THREE.Mesh(pylonGeo, pylonMat);
        pylon.position.copy(frame.pos)
          .addScaledVector(frame.binormal, sideOffset)
          .addScaledVector(frame.normal, 20.0);
        pylon.quaternion.setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
        );
        tunnelGroup.add(pylon);

        // Vertical luminescent energy conduits on foundation pillars
        const conduit = new THREE.Mesh(conduitGeo, neonConduitMat);
        conduit.position.copy(pylon.position).addScaledVector(frame.binormal, -side * 3.2);
        conduit.quaternion.copy(pylon.quaternion);
        tunnelGroup.add(conduit);
      });
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

    // Reusable shared materials for all 32 sky traffic craft to prevent GPU re-allocations
    const hlGeo = new THREE.BoxGeometry(0.8, 0.4, 0.2);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const tlGeo = new THREE.BoxGeometry(0.8, 0.4, 0.2);
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xFF2A13 });

    for (let i = 0; i < 32; i++) {
      const car = new THREE.Mesh(carGeo, carMat);
      const u = (i / 32);
      const altitude = 180 + Math.random() * 220;
      const side = (i % 2 === 0 ? 1 : -1) * (80 + Math.random() * 120);
      const speed = 0.015 + Math.random() * 0.025;

      // High-altitude glowing headlight & taillight geometry (Zero dynamic light cost!)
      const hl = new THREE.Mesh(hlGeo, hlMat);
      hl.position.set(0, 0, 4.6);
      car.add(hl);

      const tl = new THREE.Mesh(tlGeo, tlMat);
      tl.position.set(0, 0, -4.6);
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

    // Lightweight volumetric holographic searchlight beam (Zero lighting pass cost!)
    const beamGeo = new THREE.ConeGeometry(8.0, 50.0, 12, 1, true);
    beamGeo.translate(0, -25.0, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 6; i++) {
      const drone = new THREE.Mesh(droneGeo, droneMat);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      drone.add(beam);

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
    // Atmospheric ambient mist field (static GPU buffers without expensive CPU updates)
    const mistCount = 450;
    const mistGeo = new THREE.BufferGeometry();
    const mistPositions = new Float32Array(mistCount * 3);

    for (let i = 0; i < mistCount; i++) {
      mistPositions[i * 3 + 0] = (Math.random() - 0.5) * 450;
      mistPositions[i * 3 + 1] = 10 + Math.random() * 180;
      mistPositions[i * 3 + 2] = (Math.random() - 0.5) * 450;
    }

    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPositions, 3));

    let circleTex = null;
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(180, 230, 255, 1.0)');
      g.addColorStop(0.35, 'rgba(100, 200, 255, 0.6)');
      g.addColorStop(0.8, 'rgba(50, 150, 255, 0.15)');
      g.addColorStop(1.0, 'rgba(0, 50, 150, 0.0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 32, 32);
      circleTex = new THREE.CanvasTexture(c);
    }

    const mistMat = new THREE.PointsMaterial({
      color: 0x99ddff,
      size: 1.0,
      map: circleTex,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.rainParticles = new THREE.Points(mistGeo, mistMat);
    this.root.add(this.rainParticles);
  }

  update(delta, playerPos) {
    const time = performance.now() * 0.001;

    // 0. Celestial Sky Dome Slow Drift & Player Center (Infinite Sky Horizon)
    if (this.skyDome) {
      this.skyDome.rotation.y += 0.0006 * delta;
      if (playerPos) {
        this.skyDome.position.x = playerPos.x;
        this.skyDome.position.z = playerPos.z;
      }
    }

    // 1. Animate Sky Traffic (Zero per-frame allocations)
    this.skyTraffic.forEach(item => {
      item.u = (item.u + item.speed * delta) % 1.0;
      const frame = this.circuit.getFrameAt(item.u);
      _skyAlt.set(0, item.altitude - frame.pos.y, 0);
      item.mesh.position.copy(frame.pos)
        .addScaledVector(frame.binormal, item.side)
        .add(_skyAlt);

      _skyMat.makeBasis(frame.binormal, frame.normal, frame.tangent);
      item.mesh.quaternion.setFromRotationMatrix(_skyMat);
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

    // 4. Animate Monorail Train (Zero per-frame allocations)
    if (this.monorailTrain) {
      this.monorailTrain.u = (this.monorailTrain.u + this.monorailTrain.speed * delta) % 1.0;
      const frame = this.circuit.getFrameAt(this.monorailTrain.u);
      _skyAlt.set(0, 45, 0);
      this.monorailTrain.group.position.copy(frame.pos).add(_skyAlt);
      _skyMat.makeBasis(frame.binormal, frame.normal, frame.tangent);
      this.monorailTrain.group.quaternion.setFromRotationMatrix(_skyMat);
    }

    // 5. Ambient mist centered on player (Zero CPU buffer iteration!)
    if (this.rainParticles) {
      if (playerPos) {
        this.rainParticles.position.x = playerPos.x;
        this.rainParticles.position.y = playerPos.y * 0.2;
        this.rainParticles.position.z = playerPos.z;
      }
      this.rainParticles.rotation.y = time * 0.02;
    }
  }

  buildUrbanTreesAndGreenery() {
    const treeGroup = new THREE.Group();
    const treeUValues = [
      0.015, 0.035, 0.055,
      0.15, 0.17, 0.20, 0.23, 0.26,
      0.40, 0.42, 0.44,
      0.53, 0.55,
      0.68, 0.72, 0.76,
      0.90, 0.92, 0.95, 0.97
    ];

    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.65, 5.0, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9, metalness: 0.1 });

    const sakuraGeo = new THREE.DodecahedronGeometry(2.4, 1);
    const sakuraMat = new THREE.MeshStandardMaterial({
      color: 0xFF8AA8,
      roughness: 0.8,
      metalness: 0.1,
      emissive: new THREE.Color(0xFF2255),
      emissiveIntensity: 0.15
    });

    const elmGeo = new THREE.DodecahedronGeometry(2.6, 1);
    const elmMat = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.85,
      metalness: 0.1
    });

    const planterGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.45, 12);
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x202736, roughness: 0.7, metalness: 0.3 });

    treeUValues.forEach((u, i) => {
      if (isInsideTunnel(u)) return;
      const frame = this.circuit.getFrameAt(u);
      [-1, 1].forEach(side => {
        const sideDist = (this.circuit.roadWidth * 0.5 + 6.0) * side;
        const pos = frame.pos.clone().addScaledVector(frame.binormal, sideDist);

        const singleTree = new THREE.Group();
        singleTree.position.copy(pos);
        singleTree.quaternion.setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
        );

        // Planter base
        const planter = new THREE.Mesh(planterGeo, planterMat);
        planter.position.y = 0.22;
        singleTree.add(planter);

        // Trunk
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2.5;
        singleTree.add(trunk);

        // Foliage Crown (Alternating Sakura Pink & Lush Elm Green)
        const isSakura = (i + side) % 2 === 0;
        const crown = new THREE.Mesh(isSakura ? sakuraGeo : elmGeo, isSakura ? sakuraMat : elmMat);
        crown.position.y = 5.2;
        crown.scale.set(1.0, 1.2, 1.0);
        singleTree.add(crown);

        treeGroup.add(singleTree);
      });
    });

    this.root.add(treeGroup);
  }

  buildStreetHousesAndShops() {
    const shopGroup = new THREE.Group();
    const urbanUValues = [
      0.01, 0.03, 0.05,
      0.15, 0.17, 0.19, 0.25, 0.27,
      0.40, 0.42, 0.44,
      0.53, 0.55,
      0.68, 0.71, 0.75, 0.78,
      0.91, 0.93, 0.96
    ];

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1b2230, roughness: 0.7, metalness: 0.25 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f1520, roughness: 0.5, metalness: 0.5 });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });

    const shopNames = [
      { text: 'RAMEN 24H // 一番', color: '#FF3344' },
      { text: 'CYBER CAFE // ネット', color: '#00F0FF' },
      { text: 'CAPSULE HOTEL // 宿', color: '#FFB800' },
      { text: 'APHELION TUNING // 工房', color: '#00FF88' },
      { text: 'NEO PHARMA // 薬', color: '#FF007F' }
    ];

    // Pre-cache shop sign textures and materials once (Zero duplicate texture creation)
    const cachedSignMats = shopNames.map(signData => {
      let signTex = null;
      if (typeof document !== 'undefined') {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#060B14';
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = signData.color;
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, 504, 120);
        ctx.fillStyle = signData.color;
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(signData.text, 256, 75);
        signTex = new THREE.CanvasTexture(c);
      }
      return new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    });

    // Reusable structural geometries
    const bWidth = 9.0;
    const bDepth = 8.0;
    const blockGeo2 = new THREE.BoxGeometry(bDepth, 2 * 3.8, bWidth);
    const blockGeo3 = new THREE.BoxGeometry(bDepth, 3 * 3.8, bWidth);
    const roofGeo = new THREE.ConeGeometry(bWidth * 0.75, 2.2, 4);
    roofGeo.rotateY(Math.PI * 0.25);
    const winGeo = new THREE.BoxGeometry(bDepth + 0.1, 1.2, 2.2);
    const signGeo = new THREE.PlaneGeometry(6.5, 1.4);

    urbanUValues.forEach((u, idx) => {
      if (isInsideTunnel(u)) return;
      const frame = this.circuit.getFrameAt(u);
      [-1, 1].forEach(side => {
        const sideDist = (this.circuit.roadWidth * 0.5 + 16.0) * side;
        const pos = frame.pos.clone().addScaledVector(frame.binormal, sideDist);

        const bldg = new THREE.Group();
        bldg.position.copy(pos);
        bldg.quaternion.setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
        );

        const floors = 2 + (idx % 2); // 2 or 3 story building
        const bHeight = floors * 3.8;

        // Main Building Structure (reusing cached geometry)
        const block = new THREE.Mesh(floors === 2 ? blockGeo2 : blockGeo3, wallMat);
        block.position.y = bHeight * 0.5;
        bldg.add(block);

        // Slanted Eaves / Roof (reusing cached geometry)
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = bHeight + 1.1;
        bldg.add(roof);

        // Lit Windows on Upper Floors (reusing cached geometry)
        for (let f = 1; f < floors; f++) {
          const win = new THREE.Mesh(winGeo, windowMat);
          win.position.set(0, f * 3.8 + 0.5, (side > 0 ? -1 : 1) * 2.2);
          bldg.add(win);
        }

        // Ground Floor Glowing Shop Signboard facing the road (reusing pre-cached material)
        const signMat = cachedSignMats[(idx + (side > 0 ? 1 : 0)) % cachedSignMats.length];
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set((side > 0 ? -bDepth * 0.5 - 0.1 : bDepth * 0.5 + 0.1), 3.2, 0);
        sign.rotation.y = side > 0 ? -Math.PI * 0.5 : Math.PI * 0.5;
        bldg.add(sign);

        shopGroup.add(bldg);
      });
    });

    this.root.add(shopGroup);
  }

  dispose() {
    if (this.scene && this.root) {
      this.scene.remove(this.root);
    }
    this.skyTraffic = [];
    this.drones = [];
    this.steamVents = [];
    this.hologramMaterials = [];
  }
}
