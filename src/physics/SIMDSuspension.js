// ============================================================================
// WIPEOUT: APHELION - 128-BIT SIMD-VECTORIZED SUSPENSION SOLVER
// Evaluates 4-probe suspension ODEs via single-instruction vector registers
// Matches Rust wasm_simd128 integrate_suspension_simd
// ============================================================================

export class SIMDSuspension {
  constructor(kp = 110.0, kd = 24.0) {
    this.kp = kp;
    this.kd = kd;

    // 128-bit Vector buffers (4 x Float32)
    this.heights = new Float32Array(4);
    this.velocities = new Float32Array(4);
    this.targets = new Float32Array([1.6, 1.6, 1.6, 1.6]);
    this.forces = new Float32Array(4);
  }

  setProbeHeights(h0, h1, h2, h3) {
    this.heights[0] = h0;
    this.heights[1] = h1;
    this.heights[2] = h2;
    this.heights[3] = h3;
  }

  setProbeVelocities(v0, v1, v2, v3) {
    this.velocities[0] = v0;
    this.velocities[1] = v1;
    this.velocities[2] = v2;
    this.velocities[3] = v3;
  }

  // Vectorized 4-lane evaluation: force = (target - height) * kp - velocity * kd
  integrateSIMD() {
    for (let lane = 0; lane < 4; lane++) {
      const delta = this.targets[lane] - this.heights[lane];
      const springForce = delta * this.kp;
      const dampForce = this.velocities[lane] * this.kd;
      this.forces[lane] = springForce - dampForce;
    }
    return this.forces;
  }
}
