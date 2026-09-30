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
    // 1. Wet Reflective Hexagonal Metallic Floor
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x060810,
      metalness: 0.95,
      roughness: 0.12,
      envMapIntensity: 1.5
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI * 0.5;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Grid markings on floor
    const gridHelper = new THREE.GridHelper(80, 40, 0x00F0FF, 0x151f32);
    gridHelper.position.y = 0.02;
    this.group.add(gridHelper);

    // 2. Central Elevated Rotating Turntable Platform
    const turntableGeo = new THREE.CylinderGeometry(4.8, 5.2, 0.4, 32);
    const turntableMat = new THREE.MeshStandardMaterial({
      color: 0x0b0e18,
      metalness: 0.92,
      roughness: 0.2
    });
    const turntableMesh = new THREE.Mesh(turntableGeo, turntableMat);
    turntableMesh.position.y = 0.2;
    turntableMesh.receiveShadow = true;
    this.turntable.add(turntableMesh);

    // Glowing Neon Ring around turntable
    const ringGeo = new THREE.TorusGeometry(5.0, 0.08, 16, 64);
    ringGeo.rotateX(Math.PI * 0.5);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.38;
    this.turntable.add(ring);

    this.group.add(this.turntable);

    // 3. Overhead Industrial Gantries & Support Pillars
    const pillarGeo = new THREE.BoxGeometry(1.6, 16, 1.6);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0e1320, metalness: 0.9, roughness: 0.3 });

    [-18, 18].forEach(x => {
      [-18, 18].forEach(z => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(x, 8, z);
        this.group.add(pillar);
      });
    });

    // Overhead truss bridge
    const trussGeo = new THREE.BoxGeometry(40, 1.2, 2.5);
    const truss1 = new THREE.Mesh(trussGeo, pillarMat);
    truss1.position.set(0, 14, -18);
    this.group.add(truss1);

    const truss2 = new THREE.Mesh(trussGeo, pillarMat);
    truss2.position.set(0, 14, 18);
    this.group.add(truss2);

    // 4. Floating Holographic Screens
    const screenGeo = new THREE.PlaneGeometry(6, 3.2);
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 256;
    const sctx = screenCanvas.getContext('2d');
    sctx.fillStyle = '#060a14';
    sctx.fillRect(0, 0, 512, 256);
    sctx.strokeStyle = '#00F0FF';
    sctx.lineWidth = 4;
    sctx.strokeRect(8, 8, 496, 240);
    sctx.fillStyle = '#00F0FF';
    sctx.font = 'bold 28px monospace';
    sctx.fillText('NEO-SHINJUKU RACING HQ', 30, 60);
    sctx.fillStyle = '#FFFFFF';
    sctx.font = '18px monospace';
    sctx.fillText('AETHER-9 CHAMPIONSHIP // SECTOR 07', 30, 100);
    sctx.fillText('ALL SYSTEMS NOMINAL // 100% READY', 30, 140);
    sctx.fillStyle = '#FFB800';
    sctx.fillText('GRID QUALIFIERS: ACTIVE', 30, 180);

    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });

    const holoScreen = new THREE.Mesh(screenGeo, screenMat);
    holoScreen.position.set(0, 5.5, -9);
    this.holoPanels.push(holoScreen);
    this.group.add(holoScreen);

    // 5. Moving Atmospheric Laser Scanners
    for (let i = 0; i < 4; i++) {
      const laserGeo = new THREE.CylinderGeometry(0.04, 0.04, 18, 8);
      const laserMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00F0FF : 0x7928CA,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const laser = new THREE.Mesh(laserGeo, laserMat);
      laser.position.set(Math.cos((i / 4) * Math.PI * 2) * 8, 6, Math.sin((i / 4) * Math.PI * 2) * 8);
      laser.rotation.z = Math.PI * 0.25;
      this.lasers.push(laser);
      this.group.add(laser);
    }

    // 6. Moody Cyberpunk Lighting
    const spotCyan = new THREE.SpotLight(0x00F0FF, 5.0, 30, Math.PI * 0.28, 0.4);
    spotCyan.position.set(-6, 12, 6);
    spotCyan.target.position.set(0, 0.5, 0);
    this.group.add(spotCyan);
    this.group.add(spotCyan.target);

    const spotPurple = new THREE.SpotLight(0x7928CA, 4.5, 30, Math.PI * 0.28, 0.4);
    spotPurple.position.set(6, 12, -6);
    spotPurple.target.position.set(0, 0.5, 0);
    this.group.add(spotPurple);
    this.group.add(spotPurple.target);

    const keyLight = new THREE.DirectionalLight(0xE0F0FF, 1.8);
    keyLight.position.set(0, 16, 8);
    this.group.add(keyLight);
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

    // Animate moving laser lights
    this.lasers.forEach((laser, idx) => {
      laser.rotation.y = time * 0.8 + idx;
      laser.rotation.x = Math.sin(time * 1.2 + idx) * 0.35;
    });

    // Holographic screen hover bob
    this.holoPanels.forEach((panel, idx) => {
      panel.position.y = 5.5 + Math.sin(time * 2.0 + idx) * 0.15;
    });
  }
}
