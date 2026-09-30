import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - CONTINUOUS EXHAUST RIBBON EXTRUSION PIPELINE
// 128-element historical ring buffer sampled at 120Hz
// Camera-facing binormal cross product: B = norm(P_i - P_cam) x norm(P_i - P_{i-1})
// HDR Core Luminance: 18.0 cd/m^2 driving Dual-Kawase bloom and clustered lights
// ============================================================================

export class ExhaustRibbonPipeline {
  constructor(scene, colorHex = 0x00F0FF, ribbonWidth = 0.55, maxPoints = 128) {
    this.scene = scene;
    this.maxPoints = maxPoints;
    this.ribbonWidth = ribbonWidth;
    this.color = new THREE.Color(colorHex);

    // 128-element Ring Buffer for historical anchor positions and intensities
    this.historyPositions = [];
    this.historyIntensities = new Float32Array(maxPoints);
    for (let i = 0; i < maxPoints; i++) {
      this.historyPositions.push(new THREE.Vector3());
      this.historyIntensities[i] = 0;
    }
    this.head = 0;
    this.validPoints = 0;

    // Triangle strip geometry: 2 vertices per historical point = maxPoints * 2
    // Each quad between point i and i+1 consists of 2 triangles (6 indices)
    this.vertexCount = maxPoints * 2;
    this.positions = new Float32Array(this.vertexCount * 3);
    this.uvs = new Float32Array(this.vertexCount * 2);
    this.colors = new Float32Array(this.vertexCount * 3);
    this.intensities = new Float32Array(this.vertexCount);

    const indexCount = (maxPoints - 1) * 6;
    this.indices = new Uint16Array(indexCount);

    let idx = 0;
    for (let i = 0; i < maxPoints - 1; i++) {
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = (i + 1) * 2;
      const v3 = (i + 1) * 2 + 1;

      this.indices[idx++] = v0;
      this.indices[idx++] = v2;
      this.indices[idx++] = v1;

      this.indices[idx++] = v1;
      this.indices[idx++] = v2;
      this.indices[idx++] = v3;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(this.uvs, 2));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('a_Intensity', new THREE.BufferAttribute(this.intensities, 1));
    this.geometry.setIndex(new THREE.BufferAttribute(this.indices, 1));

    // Custom HDR Ribbon Shader Material with 18.0 cd/m^2 Core Radiance
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: this.color },
        uCoreLuminance: { value: 18.0 },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        attribute float a_Intensity;
        varying vec2 vUv;
        varying float vIntensity;
        varying vec3 vColor;

        void main() {
          vUv = uv;
          vIntensity = a_Intensity;
          vColor = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform float uCoreLuminance;
        uniform float uTime;
        varying vec2 vUv;
        varying float vIntensity;

        void main() {
          // Cross-ribbon Gaussian core profile: sharp laser-like center
          float distFromCenter = abs(vUv.x - 0.5) * 2.0;
          float coreProfile = exp(-pow(distFromCenter * 2.8, 2.0));

          // Plasma energy noise pulse
          float noise = sin(vUv.y * 30.0 - uTime * 25.0) * 0.15 + 0.85;

          // Tail fade-out along history length (vUv.y: 0 = nozzle, 1 = tip of trail)
          float lengthFade = pow(1.0 - vUv.y, 1.4);

          // HDR core color (boosted to 18.0 cd/m^2 for Dual-Kawase bloom extraction)
          vec3 coreColor = mix(uBaseColor, vec3(1.0, 1.0, 1.0), coreProfile * 0.85);
          vec3 hdrRadiance = coreColor * (coreProfile * uCoreLuminance + 1.2) * noise;

          float alpha = (coreProfile * 0.9 + 0.1) * lengthFade * vIntensity;
          if (alpha <= 0.01) discard;

          gl_FragColor = vec4(hdrRadiance, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    // Scratch math vectors
    this._pCam = new THREE.Vector3();
    this._vToCam = new THREE.Vector3();
    this._vTang = new THREE.Vector3();
    this._vBinorm = new THREE.Vector3();
    this._p0 = new THREE.Vector3();
    this._p1 = new THREE.Vector3();
  }

  // Record a new nozzle anchor transform
  pushAnchor(worldPos, thrustIntensity = 1.0) {
    this.head = (this.head + 1) % this.maxPoints;
    this.historyPositions[this.head].copy(worldPos);
    this.historyIntensities[this.head] = thrustIntensity;
    if (this.validPoints < this.maxPoints) {
      this.validPoints++;
    }
  }

  update(camera, delta) {
    this.material.uniforms.uTime.value += delta;
    if (this.validPoints < 2) return;

    this._pCam.copy(camera.position);

    let vIdx = 0;
    const count = this.validPoints;

    for (let i = 0; i < count; i++) {
      // Traverse from newest point (head) backward to oldest point
      const ringIdx = (this.head - i + this.maxPoints) % this.maxPoints;
      const prevRingIdx = (this.head - Math.max(0, i - 1) + this.maxPoints) % this.maxPoints;

      const pCurr = this.historyPositions[ringIdx];
      const pPrev = this.historyPositions[prevRingIdx];
      const intensity = this.historyIntensities[ringIdx];

      // Tangent along trail
      this._vTang.copy(pCurr).sub(pPrev);
      if (this._vTang.lengthSq() < 0.0001) {
        this._vTang.set(0, 0, 1);
      } else {
        this._vTang.normalize();
      }

      // Vector to camera
      this._vToCam.copy(pCurr).sub(this._pCam).normalize();

      // Camera-facing Binormal: B = norm(P_i - P_cam) x norm(P_i - P_{i-1})
      this._vBinorm.crossVectors(this._vToCam, this._vTang).normalize();

      // Taper ribbon width along trail length
      const t = i / (count - 1);
      const halfW = (this.ribbonWidth * (1.0 - t * 0.45)) * 0.5;

      // Left edge
      this._p0.copy(pCurr).addScaledVector(this._vBinorm, halfW);
      // Right edge
      this._p1.copy(pCurr).addScaledVector(this._vBinorm, -halfW);

      const base = i * 2;
      this.positions[base * 3]     = this._p0.x;
      this.positions[base * 3 + 1] = this._p0.y;
      this.positions[base * 3 + 2] = this._p0.z;

      this.positions[(base + 1) * 3]     = this._p1.x;
      this.positions[(base + 1) * 3 + 1] = this._p1.y;
      this.positions[(base + 1) * 3 + 2] = this._p1.z;

      this.uvs[base * 2]     = 0.0;
      this.uvs[base * 2 + 1] = t;

      this.uvs[(base + 1) * 2]     = 1.0;
      this.uvs[(base + 1) * 2 + 1] = t;

      this.intensities[base]     = intensity;
      this.intensities[base + 1] = intensity;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.uv.needsUpdate = true;
    this.geometry.attributes.a_Intensity.needsUpdate = true;
    this.geometry.setDrawRange(0, (count - 1) * 6);
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}
