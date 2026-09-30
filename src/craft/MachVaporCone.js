import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - MACH-1 CONDENSATION VAPOR CONE & SHOCK DIAMONDS
// 32-ring double-conical frustum with dynamic vertex normal noise displacement
// Snaps into visibility when speed > 343 m/s (1,235 km/h) or hyper-boost
// ============================================================================

export class MachVaporCone {
  constructor(craftGroup) {
    this.parent = craftGroup;
    this.mesh = null;
    this.soundSpeed = 343.0; // m/s (~1235 km/h)

    this.uniforms = {
      uTime: { value: 0.0 },
      uSpeedMs: { value: 0.0 },
      uSoundSpeed: { value: 343.0 },
      uAirDensity: { value: 1.0 },
      uBoostActive: { value: 0.0 }
    };

    this.build();
  }

  build() {
    // 32 radial segments double-conical frustum geometry
    // Upper cone flaring outward from cockpit, lower cone pinching back toward engine intakes
    const radialSegments = 32;
    const heightSegments = 16;
    const radiusTop = 1.1;
    const radiusBottom = 3.6;
    const height = 3.2;

    const geo = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
      heightSegments,
      true // open-ended hollow sleeve
    );
    geo.rotateX(Math.PI * 0.5); // Align along craft Z axis (forward/back)
    geo.translate(0, 0.45, -0.6); // Position around cockpit/canopy

    const vertexShader = `
      uniform float uTime;
      uniform float uSpeedMs;
      uniform float uSoundSpeed;
      uniform float uBoostActive;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying float vMachIntensity;

      void main() {
        vUv = uv;

        // Mach number intensity: s_mach = clamp((||v|| - v_sound) / 40.0, 0.0, 1.0)
        float vDiff = uSpeedMs - uSoundSpeed;
        float sMach = clamp(vDiff / 40.0, 0.0, 1.0) + (uBoostActive * 0.45);
        vMachIntensity = clamp(sMach, 0.0, 1.0);

        // High-frequency acoustic shock diamond displacement along vertex normal
        float shockWobble = sin(position.z * 18.0 + uTime * 28.0) * cos(position.x * 14.0);
        vec3 displacement = normal * (vMachIntensity * 0.28 * (1.0 + shockWobble * 0.4));
        vec3 displacedPos = position + displacement;

        vec4 worldP = modelMatrix * vec4(displacedPos, 1.0);
        vWorldPos = worldP.xyz;
        vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

        gl_Position = projectionMatrix * viewMatrix * worldP;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uAirDensity;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying float vMachIntensity;

      void main() {
        if (vMachIntensity <= 0.01) {
          discard;
        }

        // View-dependent Fresnel rim falloff
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float NdotV = max(dot(viewDir, vNormal), 0.0);
        float fresnel = pow(1.0 - NdotV, 3.2);

        // Trans-sonic condensation ring bands
        float rings = sin(vUv.y * 36.0 - uTime * 20.0) * 0.5 + 0.5;

        // Ionized white-cyan vapor
        vec3 vaporColor = mix(vec3(0.15, 0.88, 1.0), vec3(0.96, 0.99, 1.0), fresnel);

        // Alpha envelope
        float alpha = (fresnel * 0.78 + rings * 0.22) * vMachIntensity * uAirDensity * 0.82;
        if (alpha <= 0.01) discard;

        gl_FragColor = vec4(vaporColor, alpha);
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
    this.parent.add(this.mesh);
  }

  update(delta, speedKmh, isBoosting, inVacuumRift) {
    this.uniforms.uTime.value += delta;
    this.uniforms.uSpeedMs.value = speedKmh / 3.6;
    this.uniforms.uBoostActive.value = isBoosting ? 1.0 : 0.0;
    // In vacuum rift air density drops drastically (vapor vanishes in hard vacuum)
    this.uniforms.uAirDensity.value = inVacuumRift ? 0.05 : 1.0;
  }
}
