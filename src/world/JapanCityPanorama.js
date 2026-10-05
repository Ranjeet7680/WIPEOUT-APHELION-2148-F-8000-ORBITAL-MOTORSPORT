import * as THREE from 'three';

// ============================================================================
// 360-DEGREE PANORAMIC JAPAN / NEO-TOKYO CYBERPUNK CITYSCAPE
// Surrounds all lobbies (Main Garage, Royal Pass, Finish/Podium) with a full
// 360° illuminated panoramic skyline: Shinjuku & Shibuya high-rises,
// Tokyo Tower silhouette, Skytree spire, Mt. Fuji, holographic kanji signs,
// elevated orbital highway light trails, and celebration spotlights.
// Developed by Ranjeet Kumar
// ============================================================================

export class JapanCityPanorama {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.name = 'JapanCity360Panorama';

    this.isVictoryMode = !!options.victoryMode;
    this.skyDome = null;
    this.trafficTrails = [];
    this.searchlights = [];
    this.kanjiSigns = [];
    this.animTime = 0;

    this.buildSkyAtmosphere();
    this.build360Skyscrapers();
    this.buildTokyoLandmarks();
    this.buildHolographicKanjiSigns();
    this.buildOrbitalHighwayRings();

    if (this.isVictoryMode) {
      this.buildVictoryCelebrationBeams();
    }
  }

  buildSkyAtmosphere() {
    // 360 Sky Cylinder with Cyberpunk Tokyo Night Horizon Gradient
    const skyGeo = new THREE.CylinderGeometry(140, 140, 95, 32, 1, true);
    let skyTex = null;

    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Vertical Night Sky Gradient: Deep Indigo Zenith -> Shinjuku Cyber Magenta/Cyan Horizon
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0.0, '#040711'); // Zenith
      grad.addColorStop(0.45, '#090f22'); // Mid-sky
      grad.addColorStop(0.72, '#151336'); // Cyberpunk haze
      grad.addColorStop(0.88, '#1e0c2b'); // Shinjuku magenta light pollution
      grad.addColorStop(1.0, '#071626'); // Horizon cyan haze
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Distant stars / orbital satellite points
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (let i = 0; i < 240; i++) {
        const sx = Math.random() * 1024;
        const sy = Math.random() * 320;
        const sSize = Math.random() < 0.2 ? 2.0 : 1.2;
        ctx.fillRect(sx, sy, sSize, sSize);
      }

      // Stylized Cyberpunk Moon in North-West
      ctx.fillStyle = '#E8F4FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(280, 140, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      skyTex = new THREE.CanvasTexture(canvas);
      skyTex.wrapS = THREE.RepeatWrapping;
      skyTex.wrapT = THREE.ClampToEdgeWrapping;
    }

    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      color: skyTex ? 0xFFFFFF : 0x090f22,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.skyDome.position.y = 28;
    this.group.add(this.skyDome);
  }

  build360Skyscrapers() {
    // 360-degree cylinder layout of high-tech Tokyo skyscrapers
    const colors = [0x00F0FF, 0xFFB800, 0xFF007F, 0x00FF88, 0x7928CA, 0x00A8FF];
    const bldgMat = new THREE.MeshStandardMaterial({
      color: 0x060B16,
      metalness: 0.92,
      roughness: 0.18
    });

    const bldgCount = 48;
    for (let i = 0; i < bldgCount; i++) {
      const angle = (i / bldgCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
      // Staggered radii: Inner ring (52-65m), Outer ring (75-105m)
      const ringType = i % 2;
      const radius = ringType === 0 ? (52 + Math.random() * 12) : (78 + Math.random() * 26);
      const bx = Math.sin(angle) * radius;
      const bz = Math.cos(angle) * radius;

      const bw = 4.0 + Math.random() * 5.5;
      const bd = 4.0 + Math.random() * 5.5;
      const bh = (ringType === 0 ? 22 : 36) + Math.random() * 42;

      const bGeo = new THREE.BoxGeometry(bw, bh, bd);
      const bldg = new THREE.Mesh(bGeo, bldgMat);
      bldg.position.set(bx, bh * 0.5 - 2, bz);
      bldg.lookAt(0, bldg.position.y, 0); // Face showroom center
      this.group.add(bldg);

      // Glowing Horizontal Architectural Window Bands
      const bandCount = Math.floor(bh / 3.8);
      for (let b = 1; b < bandCount; b++) {
        if (Math.random() > 0.28) {
          const bandGeo = new THREE.BoxGeometry(bw + 0.12, 0.35, bd + 0.12);
          const colorHex = colors[(i + b) % colors.length];
          const bandMat = new THREE.MeshBasicMaterial({ color: colorHex });
          const band = new THREE.Mesh(bandGeo, bandMat);
          band.position.set(bx, b * 3.8 - 2, bz);
          band.rotation.copy(bldg.rotation);
          this.group.add(band);
        }
      }

      // Rooftop Spire / Antenna with Red Warning Beacon
      if (Math.random() > 0.4) {
        const spireH = 4.0 + Math.random() * 8.0;
        const spireGeo = new THREE.CylinderGeometry(0.06, 0.14, spireH, 6);
        const spireMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.9 });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.set(bx, bh - 2 + spireH * 0.5, bz);
        this.group.add(spire);

        const beaconGeo = new THREE.SphereGeometry(0.22, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xFF1830 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(bx, bh - 2 + spireH, bz);
        this.group.add(beacon);
      }
    }
  }

  buildTokyoLandmarks() {
    // 1. Tokyo Tower replica at ~88m South-East
    const ttGroup = new THREE.Group();
    const ttAngle = Math.PI * 0.35;
    const ttDist = 88;
    ttGroup.position.set(Math.sin(ttAngle) * ttDist, 0, Math.cos(ttAngle) * ttDist);

    // Red & White Lattice Sections
    const towerH = 68;
    const towerMatRed = new THREE.MeshBasicMaterial({ color: 0xFF2A14 });
    const towerMatWhite = new THREE.MeshBasicMaterial({ color: 0xF4F6F8 });

    // Lower tapered legs
    const baseLegGeo = new THREE.CylinderGeometry(1.2, 5.8, 28, 4);
    const baseLegs = new THREE.Mesh(baseLegGeo, towerMatRed);
    baseLegs.position.y = 14;
    ttGroup.add(baseLegs);

    // Main Observation Deck
    const obsGeo = new THREE.CylinderGeometry(3.8, 3.8, 4.0, 16);
    const obsMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const obsDeck = new THREE.Mesh(obsGeo, obsMat);
    obsDeck.position.y = 30;
    ttGroup.add(obsDeck);

    // Upper tower shaft
    const upperGeo = new THREE.CylinderGeometry(0.6, 2.2, 28, 4);
    const upperTower = new THREE.Mesh(upperGeo, towerMatWhite);
    upperTower.position.y = 46;
    ttGroup.add(upperTower);

    // Top Observation Spire
    const topSpireGeo = new THREE.CylinderGeometry(0.1, 0.4, 14, 8);
    const topSpire = new THREE.Mesh(topSpireGeo, towerMatRed);
    topSpire.position.y = 67;
    ttGroup.add(topSpire);

    // Pulsing Red Beacon on Top
    const ttBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xFF0033 })
    );
    ttBeacon.position.y = 74;
    ttGroup.add(ttBeacon);

    this.group.add(ttGroup);

    // 2. Tokyo Skytree Spire at ~105m North-West
    const stGroup = new THREE.Group();
    const stAngle = -Math.PI * 0.65;
    const stDist = 105;
    stGroup.position.set(Math.sin(stAngle) * stDist, 0, Math.cos(stAngle) * stDist);

    const stMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const stGeo = new THREE.CylinderGeometry(0.8, 4.2, 85, 12);
    const skytree = new THREE.Mesh(stGeo, stMat);
    skytree.position.y = 42.5;
    stGroup.add(skytree);

    // Cyan Light Rings on Skytree
    [25, 45, 65, 80].forEach(ry => {
      const ringGeo = new THREE.TorusGeometry(ry > 50 ? 1.6 : 2.8, 0.18, 8, 24);
      ringGeo.rotateX(Math.PI * 0.5);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
      ring.position.y = ry;
      stGroup.add(ring);
    });

    this.group.add(stGroup);

    // 3. Distant Mt. Fuji Silhouette in North-West
    const fujiGeo = new THREE.ConeGeometry(38, 26, 16);
    const fujiMat = new THREE.MeshStandardMaterial({
      color: 0x070c1a,
      roughness: 0.9,
      metalness: 0.1
    });
    const fuji = new THREE.Mesh(fujiGeo, fujiMat);
    const fujiDist = 130;
    const fujiAngle = -Math.PI * 0.38;
    fuji.position.set(Math.sin(fujiAngle) * fujiDist, 10, Math.cos(fujiAngle) * fujiDist);
    this.group.add(fuji);

    // Snow-capped peak
    const peakGeo = new THREE.ConeGeometry(12, 8.5, 16);
    const peakMat = new THREE.MeshBasicMaterial({ color: 0xBACEDC });
    const peak = new THREE.Mesh(peakGeo, peakMat);
    peak.position.set(Math.sin(fujiAngle) * fujiDist, 19, Math.cos(fujiAngle) * fujiDist);
    this.group.add(peak);
  }

  buildHolographicKanjiSigns() {
    if (typeof document === 'undefined') return;

    const kanjiList = [
      { text: '新宿', sub: 'NEO-SHINJUKU', color: '#00F0FF', angle: 0.2 },
      { text: '渋谷', sub: 'SHIBUYA CROSS', color: '#FF007F', angle: 1.1 },
      { text: '光速', sub: 'APHELION 2148', color: '#FFB800', angle: 2.3 },
      { text: '東京', sub: 'TOKYO METRO', color: '#00FF88', angle: 3.4 },
      { text: '競技', sub: 'GRAND PRIX', color: '#7928CA', angle: 4.5 },
      { text: '超音速', sub: 'HYPERSONIC', color: '#FF0055', angle: 5.4 }
    ];

    kanjiList.forEach(k => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#060B16';
      ctx.fillRect(0, 0, 512, 256);

      ctx.strokeStyle = k.color;
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 244);

      ctx.fillStyle = k.color;
      ctx.font = 'bold 96px "Noto Sans JP", sans-serif, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(k.text, 256, 125);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px monospace';
      ctx.fillText(k.sub, 256, 195);

      const tex = new THREE.CanvasTexture(canvas);
      const signMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide
      });

      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 6.0), signMat);
      const dist = 48 + Math.random() * 15;
      signMesh.position.set(Math.sin(k.angle) * dist, 18 + Math.random() * 8, Math.cos(k.angle) * dist);
      signMesh.lookAt(0, signMesh.position.y, 0); // Face center showroom
      this.kanjiSigns.push(signMesh);
      this.group.add(signMesh);
    });
  }

  buildOrbitalHighwayRings() {
    // Concentric 360-degree elevated skyway rings with pulsing vehicle light streams
    [
      { radius: 46, height: 12, color: 0x00F0FF, speed: 0.4 },
      { radius: 68, height: 18, color: 0xFFB800, speed: -0.32 },
      { radius: 92, height: 26, color: 0xFF007F, speed: 0.25 }
    ].forEach((ring, idx) => {
      // Highway deck
      const roadGeo = new THREE.TorusGeometry(ring.radius, 0.45, 8, 64);
      roadGeo.rotateX(Math.PI * 0.5);
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x0c1424,
        metalness: 0.85,
        roughness: 0.3
      });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.y = ring.height;
      this.group.add(road);

      // Glowing guardrail light strips
      const railGeo = new THREE.TorusGeometry(ring.radius + 0.4, 0.06, 6, 64);
      railGeo.rotateX(Math.PI * 0.5);
      const railMat = new THREE.MeshBasicMaterial({ color: ring.color });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.y = ring.height + 0.25;
      this.group.add(rail);

      // Moving light-trail vehicle pulses
      const pulseCount = 12;
      for (let p = 0; p < pulseCount; p++) {
        const pulseAngle = (p / pulseCount) * Math.PI * 2;
        const pulseGeo = new THREE.BoxGeometry(2.4, 0.2, 0.35);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: p % 2 === 0 ? 0xFFFFFF : ring.color
        });
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        pulse.userData = {
          baseAngle: pulseAngle,
          radius: ring.radius,
          height: ring.height + 0.3,
          speed: ring.speed
        };
        this.trafficTrails.push(pulse);
        this.group.add(pulse);
      }
    });
  }

  buildVictoryCelebrationBeams() {
    // 4 Dynamic Sky Searchlights criss-crossing in celebration
    const spotColors = [0xFFD700, 0x00F0FF, 0xFF007F, 0x00FF88];
    const beamPositions = [
      { x: -32, z: -32 },
      { x: 32, z: -32 },
      { x: -32, z: 32 },
      { x: 32, z: 32 }
    ];

    beamPositions.forEach((pos, idx) => {
      // Cylinder Light Beam
      const beamGeo = new THREE.CylinderGeometry(0.3, 5.0, 90, 16, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: spotColors[idx % spotColors.length],
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(pos.x, 45, pos.z);
      beam.userData = {
        baseX: pos.x,
        baseZ: pos.z,
        phase: idx * Math.PI * 0.5,
        speed: 0.7 + idx * 0.15
      };
      this.searchlights.push(beam);
      this.group.add(beam);
    });
  }

  update(delta) {
    this.animTime += delta;

    // 1. Animate orbital skyway traffic trails circling 360°
    for (let i = 0; i < this.trafficTrails.length; i++) {
      const t = this.trafficTrails[i];
      const curAngle = t.userData.baseAngle + this.animTime * t.userData.speed;
      const x = Math.sin(curAngle) * t.userData.radius;
      const z = Math.cos(curAngle) * t.userData.radius;
      t.position.set(x, t.userData.height, z);
      // Align with tangent of circular orbit
      t.rotation.y = -curAngle + Math.PI * 0.5;
    }

    // 2. Animate sweeping celebration searchlights
    for (let i = 0; i < this.searchlights.length; i++) {
      const beam = this.searchlights[i];
      const p = beam.userData;
      const sweepX = Math.sin(this.animTime * p.speed + p.phase) * 0.28;
      const sweepZ = Math.cos(this.animTime * (p.speed * 0.85) + p.phase) * 0.28;
      beam.rotation.z = sweepX;
      beam.rotation.x = sweepZ;
    }

    // 3. Subtle floating hover on kanji billboards
    for (let i = 0; i < this.kanjiSigns.length; i++) {
      const sign = this.kanjiSigns[i];
      sign.position.y += Math.sin(this.animTime * 1.5 + i) * 0.003;
    }
  }
}
