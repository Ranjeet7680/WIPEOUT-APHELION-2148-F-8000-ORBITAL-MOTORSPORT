import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - DIEGETIC CONFORMAL SHIELD MESH & SHADER
// Active hex-wireframe wrapping hull: cyan -> amber -> acid hyper-vermilion
// ============================================================================

export class ShieldMesh {
  constructor(craftMeshGroup) {
    this.parentGroup = craftMeshGroup;
    this.mesh = null;
    this.uniforms = {
      uTime: { value: 0 },
      uShieldHealth: { value: 1.0 }, // 1.0 = 100%, 0.0 = 0%
      uHitPulse: { value: 0.0 },     // Spikes on impact
      uColorHealthy: { value: new THREE.Color(0x00F0FF) },
      uColorWarning: { value: new THREE.Color(0xFFB800) },
      uColorCritical: { value: new THREE.Color(0xFF2A13) }
    };

    this.build();
  }

  build() {
    // Envelope geometry around craft hull
    const geo = new THREE.IcosahedronGeometry(3.6, 2);

    // Custom GLSL Shader for Diegetic Conformal Energy Barrier
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        vec4 worldP = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldP.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldP;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uShieldHealth;
      uniform float uHitPulse;
      uniform vec3 uColorHealthy;
      uniform vec3 uColorWarning;
      uniform vec3 uColorCritical;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        // Fresnel rim glow
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
        fresnel = pow(fresnel, 2.8);

        // Hexagonal grid & scanline interference
        vec2 grid = abs(fract(vUv * 24.0 - 0.5) - 0.5) / fwidth(vUv * 24.0);
        float line = min(grid.x, grid.y);
        float hexGrid = 1.0 - min(line, 1.0);

        // Scanline sweep
        float scanline = sin(vWorldPos.y * 12.0 + uTime * 6.0) * 0.5 + 0.5;

        // Dynamic color transition based on shield health
        vec3 baseColor;
        if (uShieldHealth > 0.5) {
          float t = (uShieldHealth - 0.5) * 2.0;
          baseColor = mix(uColorWarning, uColorHealthy, t);
        } else {
          float t = uShieldHealth * 2.0;
          baseColor = mix(uColorCritical, uColorWarning, t);
        }

        // Critical flicker when shield < 20%
        float flicker = 1.0;
        if (uShieldHealth < 0.25) {
          flicker = sin(uTime * 35.0) > 0.1 ? 1.0 : 0.2;
        }

        // Total alpha opacity
        float alpha = (fresnel * 0.75 + hexGrid * 0.4 + scanline * 0.2 + uHitPulse * 0.8) * flicker;
        alpha *= (0.2 + uShieldHealth * 0.8);

        // Hit pulse color flash
        vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), uHitPulse * 0.6);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.scale.set(1.2, 0.75, 2.2); // Form-fitting teardrop/dart envelope
    this.mesh.position.set(0, 0.3, 0);

    this.parentGroup.add(this.mesh);
  }

  triggerHit(intensity = 1.0) {
    this.uniforms.uHitPulse.value = Math.min(this.uniforms.uHitPulse.value + intensity, 1.0);
  }

  update(delta, shieldHealth) {
    this.uniforms.uTime.value += delta;
    this.uniforms.uShieldHealth.value = shieldHealth;

    // Decay hit pulse
    if (this.uniforms.uHitPulse.value > 0) {
      this.uniforms.uHitPulse.value = Math.max(0, this.uniforms.uHitPulse.value - delta * 3.5);
    }
  }
}
