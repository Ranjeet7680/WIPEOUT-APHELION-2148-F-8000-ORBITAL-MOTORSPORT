import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - CONFORMAL HEX-SHIELD FRACTURE DEFORMATION
// Procedural Voronoi lattice with impact wavefront propagation, hex perimeter
// pulsing, and critical status flicker (Cyan -> Amber -> Acid Vermilion)
// ============================================================================

export class ConformalHexShield {
  constructor(craftGroup) {
    this.parent = craftGroup;
    this.mesh = null;

    this.uniforms = {
      uTime: { value: 0.0 },
      uImpactWorldPos: { value: new THREE.Vector3(0, 0, 0) },
      uWaveRadius: { value: 0.0 },
      uDamageRatio: { value: 0.0 }, // 0.0 = 100% health, 1.0 = depleted/critical
      uHitIntensity: { value: 0.0 }
    };

    this.build();
  }

  build() {
    // Aerodynamic form-fitting envelope geometry around craft hull
    const geo = new THREE.IcosahedronGeometry(3.6, 3);

    const vertexShader = `
      uniform mat4 modelMatrix;
      uniform vec3 uImpactWorldPos;
      uniform float uWaveRadius;
      uniform float uHitIntensity;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec4 worldP = modelMatrix * vec4(position, 1.0);
        float distFromHit = distance(worldP.xyz, uImpactWorldPos);
        float waveFront = abs(distFromHit - uWaveRadius);
        float waveDeform = smoothstep(1.4, 0.0, waveFront) * uHitIntensity * 0.28;

        vec3 displacedPos = position + normal * waveDeform;
        vec4 displacedWorldP = modelMatrix * vec4(displacedPos, 1.0);

        vWorldPos = displacedWorldP.xyz;
        vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

        gl_Position = projectionMatrix * viewMatrix * displacedWorldP;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec3 uImpactWorldPos;
      uniform float uWaveRadius;
      uniform float uDamageRatio;
      uniform float uHitIntensity;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      // Hexagonal border metric
      float computeHexagonalBorder(vec2 p) {
        vec2 q = vec2(abs(p.x), abs(p.y));
        float d1 = dot(q, vec2(0.8660254, 0.5));
        float d2 = q.y;
        float d = max(d1, d2);
        float hexFract = fract(d);
        return min(hexFract, 1.0 - hexFract);
      }

      void main() {
        // 1. Calculate Voronoi procedural lattice on hull UVs
        vec2 cellUV = vUv * 48.0;
        float distToEdge = computeHexagonalBorder(cellUV);

        // 2. Wavefront propagation from impact center
        float distFromHit = distance(vWorldPos, uImpactWorldPos);
        float waveFront = abs(distFromHit - uWaveRadius);

        // 3. Hex perimeter pulse & impact wavefront intensity
        float hexEdgeAlpha = smoothstep(0.065, 0.0, distToEdge);
        float waveIntensity = smoothstep(1.8, 0.0, waveFront) * (0.35 + uHitIntensity * 0.65);

        // 4. Critical status flicker
        float flicker = sin(uTime * 60.0) * 0.5 + 0.5;

        // Energy color transition: Cyan -> Hazard Amber -> Hyper Vermilion
        vec3 energyColor = mix(
          vec3(0.0, 0.94, 1.0),
          vec3(1.0, 0.16, 0.08),
          uDamageRatio
        );

        // 5. Fresnel rim glow
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

        // High radiance emission (8.0x) for bloom chain
        vec3 finalRGB = energyColor * (hexEdgeAlpha * waveIntensity * 8.0 + fresnel * 1.8) * (0.7 + flicker * 0.3);
        float finalAlpha = clamp(waveIntensity * hexEdgeAlpha * 0.9 + fresnel * 0.38 + uHitIntensity * 0.3, 0.0, 0.92);

        if (finalAlpha <= 0.01) discard;

        gl_FragColor = vec4(finalRGB, finalAlpha);
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
    this.mesh.scale.set(1.22, 0.78, 2.25);
    this.mesh.position.set(0, 0.3, 0);

    this.parent.add(this.mesh);
  }

  triggerImpact(hitWorldPos, intensity = 1.0) {
    this.uniforms.uImpactWorldPos.value.copy(hitWorldPos);
    this.uniforms.uWaveRadius.value = 0.0;
    this.uniforms.uHitIntensity.value = Math.min(this.uniforms.uHitIntensity.value + intensity, 1.5);
  }

  update(delta, shieldHealth) {
    this.uniforms.uTime.value += delta;
    this.uniforms.uDamageRatio.value = 1.0 - THREE.MathUtils.clamp(shieldHealth, 0.0, 1.0);

    // Propagate shockwave outwards along hull
    if (this.uniforms.uHitIntensity.value > 0.01) {
      this.uniforms.uWaveRadius.value += delta * 18.0; // Wave velocity 18 m/s
      this.uniforms.uHitIntensity.value = Math.max(0.0, this.uniforms.uHitIntensity.value - delta * 2.8);
    }
  }
}
