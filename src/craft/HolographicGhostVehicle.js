import * as THREE from 'three';

// ============================================================================
// HOLOGRAPHIC GHOST VEHICLE: TIME-ATTACK REPLAY SYSTEM
// Translucent neon cyan wireframe racing craft replaying the world record
// or rival ghost telemetry with synchronized spline interpolation & delta HUD
// ============================================================================

export class HolographicGhostVehicle {
  constructor(scene, circuit) {
    this.scene = scene;
    this.circuit = circuit;

    this.enabled = true;
    this.visible = false;
    this.telemetry = null;
    this.keyframes = [];
    this.totalDuration = 48.214;

    this.group = new THREE.Group();
    this.group.name = 'holographic-ghost-racer';

    this.buildGhostMesh();
    this.buildGhostMarker();

    this.scene.add(this.group);
    this.group.visible = false;
  }

  buildGhostMesh() {
    // 1. Aerodynamic main fuselage
    const bodyGeo = new THREE.ConeGeometry(1.2, 5.2, 5);
    bodyGeo.rotateX(Math.PI * 0.5);

    const ghostMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      wireframe: false
    });

    const bodyMesh = new THREE.Mesh(bodyGeo, ghostMat);
    bodyMesh.position.y = 0.45;
    this.group.add(bodyMesh);

    // 2. Glowing wireframe edges
    const wireGeo = new THREE.WireframeGeometry(bodyGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x80FFFF,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const wireLines = new THREE.LineSegments(wireGeo, wireMat);
    wireLines.position.y = 0.45;
    this.group.add(wireLines);

    // 3. Dual Wing Nacelles
    const wingGeo = new THREE.BoxGeometry(3.6, 0.12, 1.6);
    const wingMesh = new THREE.Mesh(wingGeo, ghostMat);
    wingMesh.position.set(0, 0.4, -0.6);
    this.group.add(wingMesh);

    const wingWire = new THREE.LineSegments(new THREE.WireframeGeometry(wingGeo), wireMat);
    wingWire.position.set(0, 0.4, -0.6);
    this.group.add(wingWire);

    // 4. Twin Holographic Thruster Orbs
    const thrusterGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const thrusterMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    this.leftThruster.position.set(-0.9, 0.45, -2.5);
    this.group.add(this.leftThruster);

    this.rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    this.rightThruster.position.set(0.9, 0.45, -2.5);
    this.group.add(this.rightThruster);

    // 5. Thruster Particle Stream
    const trailCount = 30;
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailCount * 3);
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

    const trailMat = new THREE.PointsMaterial({
      color: 0x00F0FF,
      size: 0.4,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.trailPoints = new THREE.Points(trailGeo, trailMat);
    this.group.add(this.trailPoints);
  }

  buildGhostMarker() {
    // Holographic digital nameplate hovering above ghost
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 15, 30, 0.75)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◈ [GHOST] RANJEET', 256, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('RECORD: 00:48.214', 256, 96);

    this.markerTexture = new THREE.CanvasTexture(canvas);
    const markerMat = new THREE.SpriteMaterial({
      map: this.markerTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    this.markerSprite = new THREE.Sprite(markerMat);
    this.markerSprite.scale.set(4.5, 1.15, 1);
    this.markerSprite.position.set(0, 2.6, 0);
    this.group.add(this.markerSprite);
  }

  loadTelemetry(telemetryData) {
    if (!telemetryData) return;
    this.telemetry = telemetryData;
    this.keyframes = telemetryData.keyframes || [];
    this.totalDuration = telemetryData.lapTime || 48.214;

    // Update marker text if custom pilot
    if (telemetryData.pilotName) {
      this.updateMarkerText(telemetryData.pilotName, telemetryData.lapTimeFormatted || '00:48.214');
    }
  }

  updateMarkerText(pilotName, lapFormatted) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 15, 30, 0.75)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`◈ [GHOST] ${pilotName.toUpperCase()}`, 256, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`RECORD: ${lapFormatted}`, 256, 96);

    this.markerTexture.image = canvas;
    this.markerTexture.needsUpdate = true;
  }

  update(currentLapTime, playerU) {
    if (!this.enabled || this.keyframes.length < 2 || !this.circuit) {
      this.group.visible = false;
      return { active: false, timeDelta: 0, isGhostAhead: false };
    }

    this.group.visible = true;

    // Loop lap time
    const t = currentLapTime % this.totalDuration;

    // Find keyframes bounding t
    let idxA = 0;
    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (this.keyframes[i + 1].t >= t) {
        idxA = i;
        break;
      }
    }
    const kfA = this.keyframes[idxA];
    const kfB = this.keyframes[Math.min(idxA + 1, this.keyframes.length - 1)];

    const span = Math.max(0.0001, kfB.t - kfA.t);
    const alpha = THREE.MathUtils.clamp((t - kfA.t) / span, 0, 1);

    // Interpolate Track Spline U position
    const ghostU = (kfA.u + (kfB.u - kfA.u) * alpha) % 1.0;
    const frame = this.circuit.getFrameAt(ghostU);

    if (frame) {
      this.group.position.copy(frame.pos).addScaledVector(frame.normal, 0.5);

      // Align rotation to circuit tangent
      const rotMatrix = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      this.group.quaternion.setFromRotationMatrix(rotMatrix);
    }

    // Calculate real-time Delta relative to player track progression
    let uDiff = ghostU - playerU;
    if (uDiff > 0.5) uDiff -= 1.0;
    if (uDiff < -0.5) uDiff += 1.0;

    // Convert track delta to time estimate (track is ~5.4km, average speed 115m/s)
    const trackLengthMeters = 5400;
    const distanceDelta = uDiff * trackLengthMeters;
    const timeDelta = -(distanceDelta / 115.0); // positive means player is slower (behind), negative means player is ahead!
    const isGhostAhead = uDiff > 0;

    // Thruster pulse
    const pulse = 0.7 + Math.sin(t * 18.0) * 0.3;
    if (this.leftThruster) this.leftThruster.scale.setScalar(pulse);
    if (this.rightThruster) this.rightThruster.scale.setScalar(pulse);

    return {
      active: true,
      ghostU,
      ghostPos: this.group.position,
      timeDelta,
      isGhostAhead,
      lapTimeFormatted: this.telemetry ? this.telemetry.lapTimeFormatted : '00:48.214'
    };
  }

  show() {
    this.visible = true;
    if (this.enabled) this.group.visible = true;
  }

  hide() {
    this.visible = false;
    this.group.visible = false;
  }
}
