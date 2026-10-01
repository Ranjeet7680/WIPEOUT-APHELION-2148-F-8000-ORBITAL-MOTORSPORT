import * as THREE from 'three';

// ============================================================================
// 3D UNDERGROUND RACING HQ / GARAGE LOBBY ENVIRONMENT
// Dark Futuristic Garage, Turntable Platform, Neon Cyan & Purple Laser Scans,
// Holographic Panels, Wet Reflective Floor, and Camera Orbit Controls
// ============================================================================

export class GarageLobbyScene {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'GarageLobbyEnvironment';

    this.turntable = new THREE.Group();
    this.lasers = [];
    this.holoPanels = [];
    this.lights = [];

    // Interactive camera rotation
    this.rotationAngle = 0;
    this.targetRotationAngle = 0;
    this.cameraDistance = 8.5;
    this.targetCameraDistance = 8.5;
    this.cameraHeight = 2.2;
    this.targetCameraHeight = 2.2;
    this.isDragging = false;
    this.previousMouseX = 0;

    this.buildGarageArchitecture();
    this.setupEventListeners();
  }

  buildGarageArchitecture() {
    // 1. Wet Reflective Hexagonal Metallic Circuit Floor
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    let floorMat;

    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Dark brushed titanium base
      ctx.fillStyle = '#070a12';
      ctx.fillRect(0, 0, 1024, 1024);

      // Hexagonal tiles
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.lineWidth = 2;
      const size = 64;
      for (let y = 0; y < 1024 + size; y += size * 1.5) {
        for (let x = 0; x < 1024 + size * 2; x += size * Math.sqrt(3)) {
          const cx = (Math.floor(y / (size * 1.5)) % 2 === 0) ? x : x + (size * Math.sqrt(3)) * 0.5;
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = (Math.PI / 3) * a;
            const px = cx + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Glowing circuit traces & runway guidelines
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(512, 0); ctx.lineTo(512, 1024);
      ctx.moveTo(0, 512); ctx.lineTo(1024, 512);
      ctx.stroke();

      // Outer boundary warning chevrons
      ctx.fillStyle = 'rgba(255, 184, 0, 0.25)';
      for (let i = 40; i < 1000; i += 80) {
        ctx.fillRect(i, 20, 40, 6);
        ctx.fillRect(i, 998, 40, 6);
      }

      const floorTex = new THREE.CanvasTexture(canvas);
      floorTex.wrapS = THREE.RepeatWrapping;
      floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.repeat.set(3, 3);

      floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        color: 0x0a0e16,
        metalness: 0.88,
        roughness: 0.18,
        emissive: new THREE.Color(0x020812),
        emissiveIntensity: 0.35
      });
    } else {
      floorMat = new THREE.MeshStandardMaterial({
        color: 0x070a12,
        metalness: 0.88,
        roughness: 0.18
      });
    }

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI * 0.5;
    floor.receiveShadow = true;
    this.group.add(floor);

    // 2. Multi-tier High-Tech Rotating Turntable Platform
    const baseDaisGeo = new THREE.CylinderGeometry(5.4, 5.8, 0.25, 48);
    const baseDaisMat = new THREE.MeshStandardMaterial({
      color: 0x0e1320,
      metalness: 0.94,
      roughness: 0.22
    });
    const baseDais = new THREE.Mesh(baseDaisGeo, baseDaisMat);
    baseDais.position.y = 0.12;
    baseDais.receiveShadow = true;
    this.turntable.add(baseDais);

    // Carbon-fiber top deck
    const deckGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.18, 48);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x121724,
      metalness: 0.85,
      roughness: 0.32
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.position.y = 0.28;
    deckMesh.receiveShadow = true;
    this.turntable.add(deckMesh);

    // Dual Concentric Neon Rings
    const ringGeoInner = new THREE.TorusGeometry(4.75, 0.04, 16, 64);
    ringGeoInner.rotateX(Math.PI * 0.5);
    const ringMatInner = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const ringInner = new THREE.Mesh(ringGeoInner, ringMatInner);
    ringInner.position.y = 0.38;
    this.turntable.add(ringInner);

    const ringGeoOuter = new THREE.TorusGeometry(5.2, 0.03, 16, 64);
    ringGeoOuter.rotateX(Math.PI * 0.5);
    const ringMatOuter = new THREE.MeshBasicMaterial({ color: 0xFFB800 });
    const ringOuter = new THREE.Mesh(ringGeoOuter, ringMatOuter);
    ringOuter.position.y = 0.25;
    this.turntable.add(ringOuter);

    this.group.add(this.turntable);

    // 3. Complete 360-Degree Octagonal High-Tech Hangar Bay Architecture
    const wallHeight = 20;
    const hangarRadius = 24;
    const wallSegmentCount = 8;
    const wallSegmentWidth = 2 * hangarRadius * Math.tan(Math.PI / wallSegmentCount) + 1.0;

    const wallGeo = new THREE.PlaneGeometry(wallSegmentWidth, wallHeight);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x090D18,
      metalness: 0.92,
      roughness: 0.28
    });

    const pillarGeo = new THREE.BoxGeometry(1.6, wallHeight + 2, 1.6);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x070B14,
      metalness: 0.95,
      roughness: 0.22
    });

    // 8-Sided Wall Enclosure with Vertical Battens & Corner Columns
    for (let i = 0; i < wallSegmentCount; i++) {
      const angle = (i / wallSegmentCount) * Math.PI * 2;
      const midAngle = angle + (Math.PI / wallSegmentCount);

      // Wall panel
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(
        Math.sin(midAngle) * hangarRadius,
        wallHeight * 0.5,
        Math.cos(midAngle) * hangarRadius
      );
      wall.rotation.y = midAngle + Math.PI;
      wall.receiveShadow = true;
      this.group.add(wall);

      // Corner structural column
      const colX = Math.sin(angle) * (hangarRadius + 0.5);
      const colZ = Math.cos(angle) * (hangarRadius + 0.5);
      const col = new THREE.Mesh(pillarGeo, pillarMat);
      col.position.set(colX, (wallHeight + 2) * 0.5, colZ);
      this.group.add(col);

      // Overhead connecting truss between columns
      const nextAngle = ((i + 1) / wallSegmentCount) * Math.PI * 2;
      const nextColX = Math.sin(nextAngle) * (hangarRadius + 0.5);
      const nextColZ = Math.cos(nextAngle) * (hangarRadius + 0.5);

      const trussSpan = Math.hypot(nextColX - colX, nextColZ - colZ);
      const trussGeo = new THREE.BoxGeometry(0.8, 1.2, trussSpan);
      const truss = new THREE.Mesh(trussGeo, pillarMat);
      truss.position.set((colX + nextColX) * 0.5, wallHeight - 1, (colZ + nextColZ) * 0.5);
      truss.lookAt(nextColX, wallHeight - 1, nextColZ);
      this.group.add(truss);

      // Vertical neon light battens on each wall panel
      const battenColors = [0x00F0FF, 0x7928CA, 0xFFB800, 0x00F0FF, 0xFF007F, 0x00FF88, 0x00F0FF, 0x7928CA];
      const battenColor = battenColors[i % battenColors.length];
      const battenGeo = new THREE.BoxGeometry(0.25, wallHeight - 4, 0.25);
      const battenMat = new THREE.MeshBasicMaterial({ color: battenColor });

      [-wallSegmentWidth * 0.3, 0, wallSegmentWidth * 0.3].forEach(offset => {
        const batten = new THREE.Mesh(battenGeo, battenMat);
        const bDist = hangarRadius - 0.2;
        const bAngle = midAngle + (offset / hangarRadius);
        batten.position.set(Math.sin(bAngle) * bDist, wallHeight * 0.5, Math.cos(bAngle) * bDist);
        batten.rotation.y = midAngle;
        this.group.add(batten);
      });
    }

    // Overhead Ceiling Dome / Canopy Truss Ring
    const ceilingGeo = new THREE.RingGeometry(1, hangarRadius + 2, 8, 2);
    ceilingGeo.rotateX(-Math.PI * 0.5);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x05070E,
      metalness: 0.95,
      roughness: 0.4,
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = wallHeight;
    this.group.add(ceiling);

    // 4. Multi-Wall Holographic Screens (North, South, East, West)
    const holoTitles = [
      { text: 'AETHER-9 RACING // SECTOR 07', sub: 'PILOT: RANJEET  |  DIVISION: APHELION', color: '#00F0FF', angle: Math.PI },
      { text: 'APHELION PROPULSION LABS', sub: 'ION CORE STABILITY: 100% // READY', color: '#FFB800', angle: 0 },
      { text: 'GLOBAL TELEMETRY RELAY', sub: 'EDGE: TOKYO-01 // LATENCY: 18ms', color: '#00FF88', angle: Math.PI * 0.5 },
      { text: 'NEO-SHINJUKU SKYWAY MAP', sub: 'CIRCUIT: 5.4 KM // 8 DISTRICTS', color: '#FF007F', angle: -Math.PI * 0.5 }
    ];

    holoTitles.forEach((ht, idx) => {
      const screenGeo = new THREE.PlaneGeometry(8.5, 4.0);
      let screenTex = null;
      if (typeof document !== 'undefined') {
        const sCanvas = document.createElement('canvas');
        sCanvas.width = 512;
        sCanvas.height = 256;
        const sctx = sCanvas.getContext('2d');
        sctx.fillStyle = '#060A14';
        sctx.fillRect(0, 0, 512, 256);
        sctx.strokeStyle = ht.color;
        sctx.lineWidth = 6;
        sctx.strokeRect(8, 8, 496, 240);

        sctx.fillStyle = ht.color;
        sctx.font = 'bold 26px monospace';
        sctx.fillText(ht.text, 30, 60);

        sctx.fillStyle = '#FFFFFF';
        sctx.font = '18px monospace';
        sctx.fillText(ht.sub, 30, 115);

        sctx.fillStyle = '#A0B0C4';
        sctx.font = '15px monospace';
        sctx.fillText('STATUS: TELEMETRY STREAM ACTIVE', 30, 165);
        sctx.fillText('SECURITY PROTOCOL: LEVEL-A VERIFIED', 30, 205);

        screenTex = new THREE.CanvasTexture(sCanvas);
      }

      const screenMat = new THREE.MeshBasicMaterial({
        map: screenTex,
        color: screenTex ? 0xFFFFFF : 0x00F0FF,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide
      });

      const screen = new THREE.Mesh(screenGeo, screenMat);
      const sDist = hangarRadius - 4.5;
      screen.position.set(Math.sin(ht.angle) * sDist, 6.5, Math.cos(ht.angle) * sDist);
      screen.lookAt(0, 6.5, 0);
      this.holoPanels.push(screen);
      this.group.add(screen);
    });

    // 5. Atmospheric Laser Scanners (subtle accent lines)
    for (let i = 0; i < 4; i++) {
      const laserGeo = new THREE.CylinderGeometry(0.015, 0.015, 16, 6);
      const laserMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00F0FF : 0x7928CA,
        transparent: true,
        opacity: 0.35,
        depthWrite: false
      });
      const laser = new THREE.Mesh(laserGeo, laserMat);
      laser.position.set(Math.cos((i / 4) * Math.PI * 2) * 8.5, 6, Math.sin((i / 4) * Math.PI * 2) * 8.5);
      laser.rotation.z = Math.PI * 0.25;
      this.lasers.push(laser);
      this.group.add(laser);
    }

    // 6. Floating Atmospheric Cyberpunk Dust Motes
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3 + 0] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 1] = 0.5 + Math.random() * 4.5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));

    let dustMap = null;
    if (typeof document !== 'undefined') {
      const dCanvas = document.createElement('canvas');
      dCanvas.width = 32;
      dCanvas.height = 32;
      const dctx = dCanvas.getContext('2d');
      const dGrad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      dGrad.addColorStop(0, 'rgba(0, 240, 255, 1.0)');
      dGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.5)');
      dGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
      dctx.fillStyle = dGrad;
      dctx.fillRect(0, 0, 32, 32);
      dustMap = new THREE.CanvasTexture(dCanvas);
    }

    const dustMat = new THREE.PointsMaterial({
      size: 0.6,
      map: dustMap,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.dustPoints = new THREE.Points(dustGeo, dustMat);
    this.group.add(this.dustPoints);

    // 7. Refined Cyberpunk 3-Point Studio Lighting (Balanced to prevent bloom washout)
    const spotCyan = new THREE.SpotLight(0x00F0FF, 1.8, 32, Math.PI * 0.38, 0.85);
    spotCyan.position.set(-9, 14, 9);
    spotCyan.target.position.set(0, 0.6, 0);
    this.group.add(spotCyan);
    this.group.add(spotCyan.target);

    const spotPurple = new THREE.SpotLight(0xFF007F, 1.4, 32, Math.PI * 0.38, 0.85);
    spotPurple.position.set(9, 14, -9);
    spotPurple.target.position.set(0, 0.6, 0);
    this.group.add(spotPurple);
    this.group.add(spotPurple.target);

    const spotAmber = new THREE.SpotLight(0xFFB800, 1.1, 32, Math.PI * 0.4, 0.8);
    spotAmber.position.set(0, 15, -12);
    spotAmber.target.position.set(0, 0.6, 0);
    this.group.add(spotAmber);
    this.group.add(spotAmber.target);

    const keyLight = new THREE.DirectionalLight(0xE0F0FF, 1.2);
    keyLight.position.set(0, 18, 10);
    this.group.add(keyLight);

    const ambientLobby = new THREE.AmbientLight(0x0E1626, 0.9);
    this.group.add(ambientLobby);

    // 8. Autonomous Mechanic Inspection Drones
    this.drones = [];
    for (let k = 0; k < 3; k++) {
      const droneGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.2, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x121824, metalness: 0.9, roughness: 0.2 })
      );
      droneGroup.add(body);

      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00F0FF })
      );
      eye.position.set(0, 0, 0.35);
      droneGroup.add(eye);

      // Subtle vertical laser inspection line
      const scanLine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 2.2, 6),
        new THREE.MeshBasicMaterial({
          color: 0x00F0FF,
          transparent: true,
          opacity: 0.35,
          depthWrite: false
        })
      );
      scanLine.position.set(0, -1.1, 0.2);
      droneGroup.add(scanLine);

      const baseAngle = (k / 3) * Math.PI * 2;
      droneGroup.position.set(Math.cos(baseAngle) * 4.6, 1.8 + k * 0.35, Math.sin(baseAngle) * 4.6);
      this.group.add(droneGroup);
      this.drones.push({ group: droneGroup, angle: baseAngle, baseH: 1.8 + k * 0.35, speed: 0.5 + k * 0.15 });
    }
  }

  setupEventListeners() {
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && e.target.tagName === 'CANVAS') {
        this.isDragging = true;
        this.previousMouseX = e.clientX;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMouseX;
        this.targetRotationAngle += deltaX * 0.008;
        this.previousMouseX = e.clientX;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch support for drag rotate
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && e.target.tagName === 'CANVAS') {
        this.isDragging = true;
        this.previousMouseX = e.touches[0].clientX;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMouseX;
        this.targetRotationAngle += deltaX * 0.01;
        this.previousMouseX = e.touches[0].clientX;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Zoom on wheel
    window.addEventListener('wheel', (e) => {
      this.targetCameraDistance = THREE.MathUtils.clamp(
        this.targetCameraDistance + e.deltaY * 0.005,
        5.0,
        14.0
      );
    }, { passive: true });
  }

  setCameraAnglePreset(preset) {
    switch (preset) {
      case 'FRONT':
        this.targetRotationAngle = 0;
        this.targetCameraHeight = 1.8;
        this.targetCameraDistance = 7.5;
        break;
      case 'SIDE':
        this.targetRotationAngle = Math.PI * 0.5;
        this.targetCameraHeight = 1.8;
        this.targetCameraDistance = 8.0;
        break;
      case 'REAR':
        this.targetRotationAngle = Math.PI;
        this.targetCameraHeight = 2.0;
        this.targetCameraDistance = 7.5;
        break;
      case 'TOP':
        this.targetRotationAngle = Math.PI * 0.25;
        this.targetCameraHeight = 6.8;
        this.targetCameraDistance = 8.5;
        break;
      case 'LOW ANGLE':
        this.targetRotationAngle = -Math.PI * 0.25;
        this.targetCameraHeight = 0.8;
        this.targetCameraDistance = 6.8;
        break;
      case 'MODAL':
        this.targetRotationAngle = 0.35;
        this.targetCameraHeight = 1.95;
        this.targetCameraDistance = 8.2;
        break;
    }
  }

  show() {
    if (!this.group.parent) {
      this.scene.add(this.group);
    }
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }

  update(delta, camera, autoRotate = true) {
    if (!this.group.visible) return;

    const time = performance.now() * 0.001;

    // Slow auto-rotation when user is not manually orbiting
    if (autoRotate && !this.isDragging) {
      this.targetRotationAngle += delta * 0.15;
    }

    // Smooth damp camera orbit
    this.rotationAngle = THREE.MathUtils.lerp(this.rotationAngle, this.targetRotationAngle, delta * 8.0);
    this.cameraDistance = THREE.MathUtils.lerp(this.cameraDistance, this.targetCameraDistance, delta * 8.0);
    this.cameraHeight = THREE.MathUtils.lerp(this.cameraHeight, this.targetCameraHeight, delta * 8.0);

    // Apply orbit position to camera
    const cx = Math.sin(this.rotationAngle) * this.cameraDistance;
    const cz = Math.cos(this.rotationAngle) * this.cameraDistance;
    camera.position.set(cx, this.cameraHeight, cz);
    camera.lookAt(0, 0.9, 0);

    // Animate subtle floating dust motes
    if (this.dustPoints) {
      this.dustPoints.rotation.y = time * 0.04;
    }

    // Animate moving laser lights
    this.lasers.forEach((laser, idx) => {
      laser.rotation.y = time * 0.8 + idx;
      laser.rotation.x = Math.sin(time * 1.2 + idx) * 0.35;
    });

    // Holographic screen hover bob
    this.holoPanels.forEach((panel, idx) => {
      panel.position.y = 6.5 + Math.sin(time * 2.0 + idx) * 0.15;
    });

    // Mechanic Drones orbit and inspection bob
    if (this.drones) {
      this.drones.forEach(d => {
        d.angle += delta * d.speed;
        d.group.position.x = Math.cos(d.angle) * 4.2;
        d.group.position.z = Math.sin(d.angle) * 4.2;
        d.group.position.y = d.baseH + Math.sin(time * 3.0 + d.angle) * 0.2;
        d.group.lookAt(0, 0.6, 0);
      });
    }
  }
}
