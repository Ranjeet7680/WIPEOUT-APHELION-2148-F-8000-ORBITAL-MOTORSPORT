import * as THREE from 'three';
import { JapanCityPanorama } from './JapanCityPanorama.js';

// ============================================================================
// AAA LUXURY HYPERCAR SHOWROOM & 360° JAPAN NEO-TOKYO GARAGE LOBBY
// Penthouse Observation Sky Terrace, Polished Hexagonal Epoxy Turntable,
// Frameless 360° Glass Balustrade, Overhead Architectural Canopy & Softbox Lights,
// Surrounding 360° Illuminated Neo-Tokyo Skyline, and 24K Golden Car Mode
// Developed by Ranjeet Kumar
// ============================================================================

export class GarageLobbyScene {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'GarageLobbyEnvironment';

    this.turntable = new THREE.Group();
    this.holoPanels = [];
    this.lights = [];
    this.isGoldenMode = false;

    // Interactive camera rotation
    this.rotationAngle = 0.45;
    this.targetRotationAngle = 0.45;
    this.cameraDistance = 8.4;
    this.targetCameraDistance = 8.4;
    this.cameraHeight = 1.95;
    this.targetCameraHeight = 1.95;
    this.isDragging = false;
    this.previousMouseX = 0;
    this.previousMouseY = 0;

    // 360 Panoramic Japan Cityscape
    this.panorama = new JapanCityPanorama({ victoryMode: false });
    this.group.add(this.panorama.group);

    this.buildShowroomArchitecture();
    this.setupEventListeners();
  }

  buildShowroomArchitecture() {
    // 1. High-Gloss Polished Hexagonal Epoxy Showroom Floor
    const floorGeo = new THREE.CylinderGeometry(20, 20.5, 0.4, 48);
    let floorMat;

    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Deep rich slate showroom base
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, 1024, 1024);

      // Fine hexagonal showroom tiles
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.lineWidth = 1.5;
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

      // Perimeter guide inlays
      ctx.strokeStyle = 'rgba(255, 184, 0, 0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(512, 512, 480, 0, Math.PI * 2);
      ctx.stroke();

      const floorTex = new THREE.CanvasTexture(canvas);
      floorTex.wrapS = THREE.RepeatWrapping;
      floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.repeat.set(2, 2);

      floorMat = new THREE.MeshStandardMaterial({
        map: floorTex,
        color: 0x111724,
        metalness: 0.92,
        roughness: 0.12
      });
    } else {
      floorMat = new THREE.MeshStandardMaterial({
        color: 0x111724,
        metalness: 0.92,
        roughness: 0.12
      });
    }

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // 2. Multi-tier High-End Turntable Display Platform
    // Base Plinth
    const baseGeo = new THREE.CylinderGeometry(5.4, 5.7, 0.22, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x121722,
      metalness: 0.95,
      roughness: 0.18
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.11;
    base.receiveShadow = true;
    this.turntable.add(base);

    // Brushed Titanium Top Deck (Top surface at y = 0.35)
    const deckGeo = new THREE.CylinderGeometry(4.9, 5.1, 0.16, 64);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x181f2c,
      metalness: 0.92,
      roughness: 0.25
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 0.27;
    this.baseMesh = base;
    this.deckMesh = deck;

    // Inner Glowing LED Ring (Electric Cyan or Golden in Golden Mode)
    const ringGeo1 = new THREE.TorusGeometry(4.88, 0.035, 16, 64);
    ringGeo1.rotateX(Math.PI * 0.5);
    this.ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const ring1 = new THREE.Mesh(ringGeo1, this.ringMat1);
    ring1.position.y = 0.355;
    this.ring1 = ring1;
    this.turntable.add(ring1);

    // Outer Accent Ring (Warm Gold)
    const ringGeo2 = new THREE.TorusGeometry(5.35, 0.025, 16, 64);
    ringGeo2.rotateX(Math.PI * 0.5);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xFFB800 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.position.y = 0.22;
    this.ring2 = ring2;
    this.turntable.add(ring2);

    // 2b. Animated Holographic Underglow Energy Field & Floating Grid
    this.energyRingGroup = new THREE.Group();
    this.energyRingGroup.position.y = 0.352;

    // Glowing Concentric Energy Disc
    const energyDiscGeo = new THREE.RingGeometry(0.3, 3.4, 32);
    energyDiscGeo.rotateX(-Math.PI * 0.5);
    this.energyDiscMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    this.energyDiscMesh = new THREE.Mesh(energyDiscGeo, this.energyDiscMat);
    this.energyRingGroup.add(this.energyDiscMesh);

    // Dynamic Rotating Energy Arcs
    const arcGeo = new THREE.RingGeometry(2.1, 2.3, 32, 1, 0, Math.PI * 1.4);
    arcGeo.rotateX(-Math.PI * 0.5);
    this.energyArcMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    this.energyArcMesh = new THREE.Mesh(arcGeo, this.energyArcMat);
    this.energyRingGroup.add(this.energyArcMesh);

    // Moving Holographic Grid Lines Plane
    const gridGeo = new THREE.PlaneGeometry(6.4, 6.4, 16, 16);
    gridGeo.rotateX(-Math.PI * 0.5);
    this.holoGridMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    this.holoGridMesh = new THREE.Mesh(gridGeo, this.holoGridMat);
    this.holoGridMesh.position.y = 0.005;
    this.energyRingGroup.add(this.holoGridMesh);

    this.turntable.add(this.energyRingGroup);

    // 2c. Atmospheric Floating Dust/Energy Particles
    const pCount = 90;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 16;
      pPositions[i * 3 + 1] = Math.random() * 6.5 + 0.4;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    this.pMat = new THREE.PointsMaterial({
      color: 0x00F0FF,
      size: 0.07,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(pGeo, this.pMat);
    this.group.add(this.particles);

    // 2d. Small Floating Holographic Technical Information Chips Around Vehicle
    this.techChipsGroup = new THREE.Group();
    this.buildTechChips();
    this.group.add(this.techChipsGroup);

    this.group.add(this.turntable);

    // 3. Frameless 360° Glass Terrace Balustrade & Glowing Neon Edge
    const railRadius = 19.5;
    const glassRailGeo = new THREE.CylinderGeometry(railRadius, railRadius, 1.25, 48, 1, true);
    const glassRailMat = new THREE.MeshPhysicalMaterial({
      color: 0x051020,
      metalness: 0.85,
      roughness: 0.05,
      transmission: 0.88,
      transparent: true,
      opacity: 0.75,
      ior: 1.52,
      side: THREE.DoubleSide
    });
    const glassRail = new THREE.Mesh(glassRailGeo, glassRailMat);
    glassRail.position.y = 0.62;
    this.group.add(glassRail);

    // Cyan illuminated perimeter handrail ring
    const topRailGeo = new THREE.TorusGeometry(railRadius, 0.045, 12, 64);
    topRailGeo.rotateX(Math.PI * 0.5);
    const topRailMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const topRail = new THREE.Mesh(topRailGeo, topRailMat);
    topRail.position.y = 1.25;
    this.group.add(topRail);

    // Perimeter Terrace Neon Planters with Cyberpunk Japanese Cherry Blossoms (Sakura)
    const planterAngles = [0.4, 1.5, 2.7, 3.8, 4.9, 5.8];
    planterAngles.forEach(ang => {
      const px = Math.sin(ang) * 18.2;
      const pz = Math.cos(ang) * 18.2;

      // Planter box
      const boxGeo = new THREE.BoxGeometry(2.4, 0.7, 0.9);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x0c121e, metalness: 0.9 });
      const pBox = new THREE.Mesh(boxGeo, boxMat);
      pBox.position.set(px, 0.35, pz);
      pBox.lookAt(0, 0.35, 0);
      this.group.add(pBox);

      // Glowing Sakura Foliage
      const sakuraGeo = new THREE.SphereGeometry(0.85, 8, 8);
      const sakuraMat = new THREE.MeshBasicMaterial({
        color: 0xFF69B4,
        transparent: true,
        opacity: 0.85
      });
      const sakura = new THREE.Mesh(sakuraGeo, sakuraMat);
      sakura.position.set(px, 1.3, pz);
      sakura.scale.set(1.4, 0.8, 1.1);
      this.group.add(sakura);
    });

    // 4. Overhead Floating High-Tech Canopy & Softbox Studio Diffusers
    const canopyH = 11.5;
    const canopyGeo = new THREE.CylinderGeometry(15, 16.5, 0.35, 32);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x0b101a,
      metalness: 0.94,
      roughness: 0.25
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = canopyH;
    this.group.add(canopy);

    // Slender Architectural Perimeter Pylons
    const pylonAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    pylonAngles.forEach(pAng => {
      const pylonGeo = new THREE.BoxGeometry(0.35, canopyH, 0.35);
      const pylonMat = new THREE.MeshStandardMaterial({ color: 0x121724, metalness: 0.9 });
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(Math.sin(pAng) * 14.8, canopyH * 0.5, Math.cos(pAng) * 14.8);
      this.group.add(pylon);

      // Vertical LED strip on pylon
      const ledGeo = new THREE.BoxGeometry(0.08, canopyH * 0.9, 0.37);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.copy(pylon.position);
      this.group.add(led);
    });

    // Overhead Rectangular Studio Softbox Diffusers (Pure White Reflective Arrays)
    const softboxMat = new THREE.MeshBasicMaterial({ color: 0xF8FBFF });
    [
      { x: 0, z: 0, w: 6.5, l: 3.2 },
      { x: -5.0, z: 0, w: 1.8, l: 7.2 },
      { x: 5.0, z: 0, w: 1.8, l: 7.2 },
      { x: 0, z: -5.0, w: 7.2, l: 1.8 },
      { x: 0, z: 5.0, w: 7.2, l: 1.8 }
    ].forEach(box => {
      const boxGeo = new THREE.BoxGeometry(box.w, 0.12, box.l);
      const sBox = new THREE.Mesh(boxGeo, softboxMat);
      sBox.position.set(box.x, canopyH - 0.15, box.z);
      this.group.add(sBox);

      // Matte Black Bezel
      const bezelGeo = new THREE.BoxGeometry(box.w + 0.15, 0.14, box.l + 0.15);
      const bezelMat = new THREE.MeshStandardMaterial({ color: 0x06080e, metalness: 0.9 });
      const bezel = new THREE.Mesh(bezelGeo, bezelMat);
      bezel.position.set(box.x, canopyH - 0.1, box.z);
      this.group.add(bezel);
    });

    // 5. Professional Multi-Point Studio Lighting
    // Overhead Soft Directional Key Light
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    keyLight.position.set(5, 12, 6);
    this.group.add(keyLight);
    this.lights.push(keyLight);

    // Cool Rim Light for crisp highlights along vehicle roofline and spoiler
    const rimLight = new THREE.DirectionalLight(0x00F0FF, 1.3);
    rimLight.position.set(-8, 9, -7);
    this.group.add(rimLight);
    this.lights.push(rimLight);

    // Warm Fill Light for realistic automotive paint depth
    const fillLight = new THREE.DirectionalLight(0xFFE4C4, 0.9);
    fillLight.position.set(0, 6, 8);
    this.group.add(fillLight);
    this.lights.push(fillLight);

    // Dedicated 24K Golden Key Light (Activated in Golden Car Mode)
    this.goldenLight = new THREE.DirectionalLight(0xFFD700, 0.0);
    this.goldenLight.position.set(3, 10, 4);
    this.group.add(this.goldenLight);
    this.lights.push(this.goldenLight);

    // Ambient Illumination (Ensures bright, crisp views in full 360°)
    const ambientLight = new THREE.AmbientLight(0x354460, 1.6);
    this.group.add(ambientLight);
    this.lights.push(ambientLight);

    // 4 Turntable Floor Recessed Spotlights
    [
      { x: -4.2, z: 4.2 },
      { x: 4.2, z: 4.2 },
      { x: -4.2, z: -4.2 },
      { x: 4.2, z: -4.2 }
    ].forEach(spotPos => {
      const upSpot = new THREE.SpotLight(0xF0F8FF, 1.4, 12, Math.PI * 0.25, 0.5);
      upSpot.position.set(spotPos.x, 0.2, spotPos.z);
      upSpot.target.position.set(0, 0.95, 0);
      this.group.add(upSpot);
      this.group.add(upSpot.target);
      this.lights.push(upSpot);
    });

    // Golden Underglow Light (Turntable center)
    this.goldenUnderglow = new THREE.PointLight(0xFFD700, 0.0, 8);
    this.goldenUnderglow.position.set(0, 0.5, 0);
    this.group.add(this.goldenUnderglow);

    // 6. Floating Holographic Spec Telemetry Screen
    this.buildHoloTelemetryPanel();
  }

  setGoldenCarMode(enabled) {
    this.isGoldenMode = !!enabled;
    if (this.goldenLight) {
      this.goldenLight.intensity = this.isGoldenMode ? 2.8 : 0.0;
    }
    if (this.goldenUnderglow) {
      this.goldenUnderglow.intensity = this.isGoldenMode ? 3.5 : 0.0;
      this.goldenUnderglow.visible = this.isGoldenMode;
    }
    if (this.ringMat1) {
      this.ringMat1.color.setHex(this.isGoldenMode ? 0xFFD700 : 0x00F0FF);
    }
  }

  buildHoloTelemetryPanel() {
    const screenGeo = new THREE.PlaneGeometry(3.6, 2.0);
    let screenTex = null;

    if (typeof document !== 'undefined') {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 512;
      sCanvas.height = 288;
      const sctx = sCanvas.getContext('2d');

      sctx.fillStyle = '#060B16';
      sctx.fillRect(0, 0, 512, 288);

      sctx.strokeStyle = '#00F0FF';
      sctx.lineWidth = 4;
      sctx.strokeRect(6, 6, 500, 276);

      sctx.fillStyle = '#00F0FF';
      sctx.font = 'bold 24px monospace';
      sctx.fillText('NEO-SHINJUKU // SKY-TERRACE', 24, 48);

      sctx.fillStyle = '#FFFFFF';
      sctx.font = '16px monospace';
      sctx.fillText('SKYLINE: 360° TOKYO PANORAMA ACTIVE', 24, 96);
      sctx.fillText('TURNTABLE: 360° ORBIT ENABLED', 24, 136);

      sctx.fillStyle = '#FFB800';
      sctx.fillText('DRAG MOUSE OR TOUCH TO ROTATE', 24, 186);

      sctx.fillStyle = '#00FF88';
      sctx.fillText('HIGH-PERFORMANCE RUNTIME: ONLINE', 24, 236);

      screenTex = new THREE.CanvasTexture(sCanvas);
    }

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTex,
      color: screenTex ? 0xFFFFFF : 0x00F0FF,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });

    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(4.8, 3.2, -3.8);
    screen.lookAt(0, 2.0, 0);
    this.holoPanels.push(screen);
    this.group.add(screen);
  }

  setupEventListeners() {
    window.addEventListener('mousedown', (e) => {
      // Only drag if not clicking UI buttons
      if (e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('.ui-screen'))) {
        return;
      }
      this.isDragging = true;
      this.previousMouseX = e.clientX;
      this.previousMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMouseX;
      const deltaY = e.clientY - this.previousMouseY;
      this.previousMouseX = e.clientX;
      this.previousMouseY = e.clientY;

      this.targetRotationAngle += deltaX * 0.008;
      this.targetCameraHeight = THREE.MathUtils.clamp(
        this.targetCameraHeight - deltaY * 0.008,
        0.6,
        4.5
      );
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch controls
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMouseX = e.touches[0].clientX;
        this.previousMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMouseX;
      const deltaY = e.touches[0].clientY - this.previousMouseY;
      this.previousMouseX = e.touches[0].clientX;
      this.previousMouseY = e.touches[0].clientY;

      this.targetRotationAngle += deltaX * 0.008;
      this.targetCameraHeight = THREE.MathUtils.clamp(
        this.targetCameraHeight - deltaY * 0.008,
        0.6,
        4.5
      );
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Zoom on wheel
    window.addEventListener('wheel', (e) => {
      this.targetCameraDistance = THREE.MathUtils.clamp(
        this.targetCameraDistance + e.deltaY * 0.005,
        5.5,
        13.0
      );
    }, { passive: true });
  }

  setCameraAnglePreset(preset) {
    switch (preset) {
      case 'FRONT':
        this.targetRotationAngle = 0;
        this.targetCameraHeight = 1.6;
        this.targetCameraDistance = 7.2;
        break;
      case 'SIDE':
        this.targetRotationAngle = Math.PI * 0.5;
        this.targetCameraHeight = 1.5;
        this.targetCameraDistance = 7.5;
        break;
      case 'REAR':
        this.targetRotationAngle = Math.PI;
        this.targetCameraHeight = 1.7;
        this.targetCameraDistance = 7.2;
        break;
      case 'TOP':
        this.targetRotationAngle = Math.PI * 0.25;
        this.targetCameraHeight = 5.5;
        this.targetCameraDistance = 8.0;
        break;
      case 'LOW ANGLE':
        this.targetRotationAngle = -Math.PI * 0.25;
        this.targetCameraHeight = 0.75;
        this.targetCameraDistance = 6.4;
        break;
      case 'MODAL':
        this.targetRotationAngle = 0.35;
        this.targetCameraHeight = 1.8;
        this.targetCameraDistance = 7.8;
        break;
      case 'CLOSE_HERO':
        this.targetRotationAngle = 0.22;
        this.targetCameraHeight = 1.35;
        this.targetCameraDistance = 5.2;
        break;
    }
  }

  triggerLaunchPush() {
    this.targetCameraDistance = 4.2;
    this.targetCameraHeight = 1.25;
  }

  buildTechChips() {
    const chipsData = [
      { text: 'ION REAR THRUSTER // 420 KM/H', sub: 'CLASS S HYPER DRIVE', x: 0, y: 1.6, z: -2.8 },
      { text: 'MAG-REPULSOR COILS // 1.2M', sub: 'HARMONIC LEVITATION', x: -2.8, y: 1.2, z: 0.5 },
      { text: 'ACTIVE AERO FOIL // DEPLOYED', sub: 'GROUND EFFECT 0.88G', x: 2.8, y: 1.2, z: 0.5 }
    ];

    chipsData.forEach((d, idx) => {
      const chipGroup = new THREE.Group();
      chipGroup.position.set(d.x, d.y, d.z);
      chipGroup._baseY = d.y;

      let chipTex = null;
      if (typeof document !== 'undefined') {
        const cCanvas = document.createElement('canvas');
        cCanvas.width = 256;
        cCanvas.height = 72;
        const cctx = cCanvas.getContext('2d');

        cctx.fillStyle = 'rgba(5, 12, 24, 0.88)';
        cctx.fillRect(0, 0, 256, 72);

        cctx.strokeStyle = '#00F0FF';
        cctx.lineWidth = 2;
        cctx.strokeRect(2, 2, 252, 68);

        cctx.fillStyle = '#00F0FF';
        cctx.font = 'bold 13px monospace';
        cctx.fillText(d.text, 10, 28);

        cctx.fillStyle = '#94A3B8';
        cctx.font = '10px monospace';
        cctx.fillText(d.sub, 10, 52);

        chipTex = new THREE.CanvasTexture(cCanvas);
      }

      const chipPlaneGeo = new THREE.PlaneGeometry(1.4, 0.4);
      const chipMat = new THREE.MeshBasicMaterial({
        map: chipTex,
        color: chipTex ? 0xFFFFFF : 0x00F0FF,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const chipMesh = new THREE.Mesh(chipPlaneGeo, chipMat);
      chipGroup.add(chipMesh);

      // Anchor dot
      const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.y = -0.25;
      chipGroup.add(dot);

      this.techChipsGroup.add(chipGroup);
    });
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

    this.time = (this.time || 0) + delta;

    // Animate 360 Japan skyline components (traffic, signs, lights)
    if (this.panorama) {
      this.panorama.update(delta);
    }

    // 1. Slow smooth vehicle 360 showcase & orbit camera
    if (autoRotate && !this.isDragging) {
      this.targetRotationAngle += delta * 0.10;
      if (this.turntable) {
        this.turntable.rotation.y += delta * 0.12;
      }
    }

    // Smooth damping for orbit camera
    this.rotationAngle = THREE.MathUtils.lerp(this.rotationAngle, this.targetRotationAngle, delta * 8.0);
    this.cameraDistance = THREE.MathUtils.lerp(this.cameraDistance, this.targetCameraDistance, delta * 8.0);
    this.cameraHeight = THREE.MathUtils.lerp(this.cameraHeight, this.targetCameraHeight, delta * 8.0);

    // Apply orbit position to camera (centered right at the car)
    const cx = Math.sin(this.rotationAngle) * this.cameraDistance;
    const cz = Math.cos(this.rotationAngle) * this.cameraDistance;
    camera.position.set(cx, this.cameraHeight, cz);
    camera.lookAt(0, 0.95, 0); // Targets vehicle center

    // 2. Subtle vehicle hover/bobbing & suspension floating movement
    if (this.turntable && this.turntable.children) {
      this.turntable.children.forEach(child => {
        if (
          child !== this.baseMesh &&
          child !== this.deckMesh &&
          child !== this.ring1 &&
          child !== this.ring2 &&
          child !== this.energyRingGroup
        ) {
          child.position.y = 0.35 + Math.sin(this.time * 2.2) * 0.038;
          child.rotation.z = Math.sin(this.time * 1.6) * 0.008;
          child.rotation.x = Math.cos(this.time * 1.9) * 0.006;
        }
      });
    }

    // 3. Animated Energy Underneath Vehicle
    if (this.energyArcMesh) {
      this.energyArcMesh.rotation.z += delta * 0.95;
    }
    if (this.energyDiscMesh) {
      const pulse = 1.0 + Math.sin(this.time * 3.0) * 0.05;
      this.energyDiscMesh.scale.set(pulse, pulse, 1.0);
      if (this.energyDiscMat) {
        this.energyDiscMat.opacity = this.isGoldenMode ? 0.38 : (0.20 + Math.sin(this.time * 4.0) * 0.06);
      }
    }
    if (this.holoGridMesh) {
      this.holoGridMesh.position.z = (Math.sin(this.time * 0.8) * 0.1);
    }

    // 4. Atmospheric Particles Drift
    if (this.particles && this.particles.geometry && this.particles.geometry.attributes.position) {
      const posAttr = this.particles.geometry.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += delta * 0.35;
        if (arr[i + 1] > 6.8) {
          arr[i + 1] = 0.4;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 5. Billboard Floating Technical Information Chips
    if (this.techChipsGroup && this.techChipsGroup.children) {
      this.techChipsGroup.children.forEach((chip, i) => {
        chip.position.y = chip._baseY + Math.sin(this.time * 2.2 + i * 1.8) * 0.045;
        chip.lookAt(camera.position.x, chip.position.y, camera.position.z);
      });
    }

    // 6. Dynamic Key Light Sweep for Rich Chassis Reflections
    if (this.lights && this.lights[0]) {
      this.lights[0].position.x = 5.0 + Math.sin(this.time * 0.4) * 2.2;
    }
  }
}
