import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - HIGH-VELOCITY TRACK WALL SCRAPE & SPARK DYNAMICS
// Ballistic Euler integration, substrate collision plane bounce with restitution,
// tangential friction damping, and Planck color temperature radiation decay
// (White-hot [4.0, 1.8, 0.4] -> Amber -> Ash)
// ============================================================================

export class ProceduralSparkVFX {
  constructor(scene, maxSparks = 2048) {
    this.scene = scene;
    this.maxSparks = maxSparks;

    // Simulation parameters matching spark_physics_sim.wgsl
    this.gravity = new THREE.Vector3(0, -28.0, 0);
    this.restitution = 0.45; // Coefficient of restitution (bounce energy)
    this.friction = 0.82;    // Tangential friction damping
    this.decayRate = 2.2;    // Lifespan ~0.45s

    // Buffer attributes
    this.positions = new Float32Array(maxSparks * 3);
    this.colors = new Float32Array(maxSparks * 3);
    this.sizes = new Float32Array(maxSparks);

    // Physical particle states
    this.velocities = [];
    this.lifetimes = new Float32Array(maxSparks); // 1.0 = new, 0.0 = dead
    this.trackHeights = new Float32Array(maxSparks);
    this.head = 0;

    for (let i = 0; i < maxSparks; i++) {
      this.velocities.push(new THREE.Vector3());
      this.lifetimes[i] = 0.0;
      this.trackHeights[i] = 0.0;
      this.positions[i * 3 + 1] = -9999.0;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Custom point shader for HDR sparks
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vColor;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Circular billboard particle with soft core
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distSq = dot(coord, coord);
          if (distSq > 0.25) discard;

          float core = exp(-distSq * 12.0);
          gl_FragColor = vec4(vColor * (1.0 + core * 2.5), 1.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  emitScrapeSparks(origin, wallNormal, craftVel, count = 25, trackSurfaceY = 0.0) {
    const forwardSpeed = craftVel.length();
    const speedRatio = Math.min(forwardSpeed / 350.0, 1.4);

    for (let i = 0; i < count; i++) {
      const idx = this.head;

      this.positions[idx * 3]     = origin.x + (Math.random() - 0.5) * 0.3;
      this.positions[idx * 3 + 1] = origin.y + (Math.random() - 0.5) * 0.3;
      this.positions[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.3;

      // Ballistic velocity: strong reflection off barrier normal + trailing craft wake
      const bounceVel = wallNormal.clone().multiplyScalar(12.0 + Math.random() * 20.0 * speedRatio);
      bounceVel.addScaledVector(craftVel, 0.45 + (Math.random() - 0.5) * 0.2);
      bounceVel.x += (Math.random() - 0.5) * 14.0;
      bounceVel.y += (Math.random() - 0.5) * 10.0;
      bounceVel.z += (Math.random() - 0.5) * 14.0;

      this.velocities[idx].copy(bounceVel);
      this.lifetimes[idx] = 1.0;
      this.trackHeights[idx] = trackSurfaceY;

      this.head = (this.head + 1) % this.maxSparks;
    }
  }

  update(delta) {
    let activeSparks = 0;

    for (let i = 0; i < this.maxSparks; i++) {
      if (this.lifetimes[i] > 0.0) {
        // 1. Age particle
        this.lifetimes[i] -= delta * this.decayRate;
        const life = Math.max(0.0, this.lifetimes[i]);

        if (life <= 0.0) {
          this.positions[i * 3 + 1] = -9999.0;
          continue;
        }

        activeSparks++;

        // 2. Ballistic Euler integration
        const vel = this.velocities[i];
        vel.addScaledVector(this.gravity, delta);

        this.positions[i * 3]     += vel.x * delta;
        this.positions[i * 3 + 1] += vel.y * delta;
        this.positions[i * 3 + 2] += vel.z * delta;

        // 3. Collision plane with track substrate
        const groundY = this.trackHeights[i];
        if (this.positions[i * 3 + 1] <= groundY) {
          this.positions[i * 3 + 1] = groundY;
          vel.y = -vel.y * this.restitution;
          vel.x *= this.friction;
          vel.z *= this.friction;
        }

        // 4. Color temperature decay (White-hot -> Amber -> Ash)
        // R: mix(0.8, 4.0, life), G: mix(0.1, 1.8, life^2), B: mix(0.0, 0.4, life^4)
        this.colors[i * 3]     = THREE.MathUtils.lerp(0.8, 4.0, life);
        this.colors[i * 3 + 1] = THREE.MathUtils.lerp(0.1, 1.8, life * life);
        this.colors[i * 3 + 2] = THREE.MathUtils.lerp(0.0, 0.4, life * life * life * life);
        this.sizes[i] = THREE.MathUtils.lerp(0.0, 2.6, life);
      }
    }

    if (activeSparks > 0) {
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;
      this.geometry.attributes.size.needsUpdate = true;
    }
  }

  dispose() {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
}
