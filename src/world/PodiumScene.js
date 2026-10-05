import * as THREE from 'three';
import { JapanCityPanorama } from './JapanCityPanorama.js';

// ============================================================================
// 3D AI-GENERATED STYLE VICTORY CHAMPIONSHIP PODIUM & FINISH LOBBY
// Surrounding 360° Illuminated Neo-Tokyo Skyline, Sweeping Searchlights,
// Holographic AI-Generated Victory Arch, 3-Tier Neon Pedestals, Top 3 Vehicles,
// Cascading Confetti Particles, and 360° Orbiting Celebration Camera
// Developed by Ranjeet Kumar
// ============================================================================

export class PodiumScene {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'PodiumEnvironment';

    this.pedestals = [];
    this.vehicles = [];
    this.confettiParticles = null;
    this.spotlights = [];
    this.orbitAngle = 0;
    this.animTime = 0;

    // 360 Panoramic Japan City with Sweeping Victory Searchlights
    this.panorama = new JapanCityPanorama({ victoryMode: true });
    this.group.add(this.panorama.group);

    this.buildPodiumArchitecture();
    this.buildAIVictoryArch();
    this.buildConfettiParticles();
  }

  buildPodiumArchitecture() {
    // 1. Glossy Dark Floor with Circular Neon Inlays
    const floorGeo = new THREE.CylinderGeometry(24, 25, 0.5, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070a12,
      metalness: 0.95,
      roughness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Neon floor rings
    [10, 16, 22].forEach((radius, idx) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.08, 12, 64);
      ringGeo.rotateX(Math.PI * 0.5);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0xFFB800 : (idx === 1 ? 0x00F0FF : 0x7928CA)
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.02;
      this.group.add(ring);
    });

    // 2. Three Tiered Pedestals
    // 1st Place (Center, Height 1.8m, Gold)
    // 2nd Place (Left, Height 1.2m, Silver)
    // 3rd Place (Right, Height 0.7m, Bronze)
    const tiers = [
      { rank: 1, pos: new THREE.Vector3(0, 0.9, 0), h: 1.8, w: 5.5, d: 7.5, color: 0xFFD700, label: '1ST PLACE' },
      { rank: 2, pos: new THREE.Vector3(-6.2, 0.6, -1.0), h: 1.2, w: 5.0, d: 7.0, color: 0xE0E8F5, label: '2ND PLACE' },
      { rank: 3, pos: new THREE.Vector3(6.2, 0.35, -1.0), h: 0.7, w: 5.0, d: 7.0, color: 0xCD7F32, label: '3RD PLACE' }
    ];

    tiers.forEach(t => {
      const pedGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const pedMat = new THREE.MeshStandardMaterial({
        color: 0x0c111c,
        metalness: 0.92,
        roughness: 0.2
      });
      const pedMesh = new THREE.Mesh(pedGeo, pedMat);
      pedMesh.position.copy(t.pos);
      pedMesh.receiveShadow = true;
      this.group.add(pedMesh);

      // Glowing rank border
      const edgeGeo = new THREE.BoxGeometry(t.w + 0.1, 0.1, t.d + 0.1);
      const edgeMat = new THREE.MeshBasicMaterial({ color: t.color });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.set(t.pos.x, t.pos.y + t.h * 0.5 + 0.05, t.pos.z);
      this.group.add(edge);

      // Spotlights for each pedestal
      const spot = new THREE.SpotLight(t.color, 4.0, 30, Math.PI * 0.3, 0.4);
      spot.position.set(t.pos.x, 15, t.pos.z + 4);
      spot.target.position.set(t.pos.x, t.pos.y + t.h * 0.5, t.pos.z);
      this.group.add(spot);
      this.group.add(spot.target);
      this.spotlights.push(spot);
    });

    // 3. Floating Backdrop Hologram Banner
    if (typeof document !== 'undefined') {
      const bannerCanvas = document.createElement('canvas');
      bannerCanvas.width = 1024;
      bannerCanvas.height = 256;
      const bctx = bannerCanvas.getContext('2d');
      bctx.fillStyle = '#060914';
      bctx.fillRect(0, 0, 1024, 256);
      bctx.strokeStyle = '#FFD700';
      bctx.lineWidth = 8;
      bctx.strokeRect(10, 10, 1004, 236);
      bctx.fillStyle = '#FFD700';
      bctx.font = 'bold 72px monospace';
      bctx.textAlign = 'center';
      bctx.fillText('◄◄ CHAMPIONSHIP PODIUM ►►', 512, 105);
      bctx.fillStyle = '#00F0FF';
      bctx.font = 'bold 40px monospace';
      bctx.fillText('NEO-SHINJUKU RIFT // AETHER-9', 512, 185);

      const bannerTex = new THREE.CanvasTexture(bannerCanvas);
      const bannerMat = new THREE.MeshBasicMaterial({
        map: bannerTex,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.0), bannerMat);
      bannerMesh.position.set(0, 8.5, -8.0);
      this.group.add(bannerMesh);
    }
  }

  buildAIVictoryArch() {
    // Holographic Futuristic AI-Generated Victory Arch over the podium
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 0);

    // Glowing Neon Portal Torus Arc
    const arcRadius = 11.5;
    const arcGeo = new THREE.TorusGeometry(arcRadius, 0.18, 16, 64, Math.PI);
    const arcMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    arcMesh.position.set(0, 2.0, -1.0);
    archGroup.add(arcMesh);

    // Outer Cyan Chevron Ring
    const arcGeo2 = new THREE.TorusGeometry(arcRadius + 1.2, 0.12, 12, 48, Math.PI);
    const arcMat2 = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const arcMesh2 = new THREE.Mesh(arcGeo2, arcMat2);
    arcMesh2.position.set(0, 2.0, -1.0);
    archGroup.add(arcMesh2);

    // AI Victory Hologram Crown in Center Apex
    if (typeof document !== 'undefined') {
      const crownCanvas = document.createElement('canvas');
      crownCanvas.width = 512;
      crownCanvas.height = 128;
      const cctx = crownCanvas.getContext('2d');
      cctx.fillStyle = '#0a1020';
      cctx.fillRect(0, 0, 512, 128);
      cctx.strokeStyle = '#00F0FF';
      cctx.lineWidth = 4;
      cctx.strokeRect(4, 4, 504, 120);

      cctx.fillStyle = '#FFD700';
      cctx.font = 'bold 36px monospace';
      cctx.textAlign = 'center';
      cctx.fillText('★ AI VICTORY ARENA ★', 256, 52);

      cctx.fillStyle = '#00FF88';
      cctx.font = 'bold 22px monospace';
      cctx.fillText('NEO RACING WORLD TOUR', 256, 95);

      const crownTex = new THREE.CanvasTexture(crownCanvas);
      const crownMat = new THREE.MeshBasicMaterial({
        map: crownTex,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide
      });
      const crownMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.8), crownMat);
      crownMesh.position.set(0, 13.8, -1.0);
      archGroup.add(crownMesh);
    }

    this.group.add(archGroup);
  }

  buildConfettiParticles() {
    const particleCount = 600;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const gold = new THREE.Color(0xFFD700);
    const cyan = new THREE.Color(0x00F0FF);
    const purple = new THREE.Color(0x7928CA);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = Math.random() * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const c = (i % 3 === 0) ? gold : (i % 3 === 1 ? cyan : purple);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.confettiParticles = new THREE.Points(geo, mat);
    this.group.add(this.confettiParticles);
  }

  setupPodiumVehicles(firstCraft, secondCraft, thirdCraft) {
    // Clear previously mounted vehicles
    this.vehicles.forEach(v => {
      if (v && v.craft && v.craft.group && v.craft.group.parent) {
        v.craft.group.parent.remove(v.craft.group);
      }
    });
    this.vehicles = [];

    // Position 1: Center (Height: 1.8m + vehicle offset)
    if (firstCraft) {
      firstCraft.group.position.set(0, 1.85, 0);
      firstCraft.group.rotation.set(0, 0, 0);
      this.group.add(firstCraft.group);
      this.vehicles.push({ craft: firstCraft, rank: 1 });
    }

    // Position 2: Left (Height: 1.2m + offset, angled slightly inward)
    if (secondCraft) {
      secondCraft.group.position.set(-6.2, 1.25, -1.0);
      secondCraft.group.rotation.set(0, 0.28, 0);
      this.group.add(secondCraft.group);
      this.vehicles.push({ craft: secondCraft, rank: 2 });
    }

    // Position 3: Right (Height: 0.7m + offset, angled inward)
    if (thirdCraft) {
      thirdCraft.group.position.set(6.2, 0.75, -1.0);
      thirdCraft.group.rotation.set(0, -0.28, 0);
      this.group.add(thirdCraft.group);
      this.vehicles.push({ craft: thirdCraft, rank: 3 });
    }
  }

  show() {
    if (!this.group.parent) {
      this.scene.add(this.group);
    }
    this.group.visible = true;
    this.orbitAngle = 0;
  }

  hide() {
    this.group.visible = false;
  }

  update(delta, camera) {
    if (!this.group.visible) return;

    this.animTime += delta;

    // Update 360 Japan city panoramic animations & searchlights
    if (this.panorama) {
      this.panorama.update(delta);
    }

    // Orbit camera smoothly around podium (full 360° view of Japan city and celebration)
    this.orbitAngle += delta * 0.22;
    const r = 16.0;
    camera.position.set(
      Math.sin(this.orbitAngle) * r,
      5.2 + Math.sin(this.orbitAngle * 0.5) * 1.5,
      Math.cos(this.orbitAngle) * r + 2.0
    );
    camera.lookAt(0, 2.4, 0);

    // Animate falling confetti
    if (this.confettiParticles) {
      const pos = this.confettiParticles.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= delta * 3.5;
        if (pos[i] < 0) {
          pos[i] = 16.0;
        }
      }
      this.confettiParticles.geometry.attributes.position.needsUpdate = true;
      this.confettiParticles.rotation.y += delta * 0.15;
    }

    // Animate vehicle victory revs
    this.vehicles.forEach(v => {
      if (v.craft && v.craft.updatePodiumCelebration) {
        v.craft.updatePodiumCelebration(delta, v.rank);
      }
    });
  }
}
