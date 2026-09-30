// ============================================================================
// WIPEOUT: APHELION - TRACK WALL SCRAPE & SPARK PHYSICS SIMULATION (WGSL)
// 65,536 Ballistic Euler integration, substrate collision plane, restitution,
// kinetic friction, and color temperature radiation decay
// ============================================================================

struct Particle {
  position: vec4<f32>,   // xyz: world pos, w: lifetime [0.0 = dead, 1.0 = new]
  velocity: vec4<f32>,   // xyz: velocity vector, w: mass
  colorSize: vec4<f32>,  // rgb: radiant emission, a: billboard size
};

struct SparkSimUniforms {
  deltaTime: f32,
  gravity: vec3<f32>,
  trackSurfaceY: f32,    // Local track elevation plane
  restitution: f32,      // Coefficient of restitution (bounce energy)
  friction: f32,         // Tangential friction damping
};

@group(0) @binding(0) var<uniform> sim: SparkSimUniforms;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

@compute @workgroup_size(64, 1, 1)
fn cs_update_sparks(@builtin(global_invocation_id) id: vec3<u32>) {
  let idx = id.x;
  if (idx >= arrayLength(&particles)) {
    return;
  }

  var p = particles[idx];
  if (p.position.w <= 0.0) {
    return; // Dead particle
  }

  // 1. Age particle
  let decayRate = 1.8; // Normalized lifespan ~0.55 seconds
  p.position.w -= sim.deltaTime * decayRate;

  // 2. Ballistic Euler integration
  var vel = p.velocity.xyz;
  vel += sim.gravity * sim.deltaTime;
  var pos = p.position.xyz + vel * sim.deltaTime;

  // 3. Collision plane with track substrate
  if (pos.y <= sim.trackSurfaceY) {
    pos.y = sim.trackSurfaceY;
    // Reflect vertical velocity with damping
    vel.y = -vel.y * sim.restitution;
    // Apply kinetic friction along horizontal axes
    vel.x *= sim.friction;
    vel.z *= sim.friction;
  }

  // 4. Color temperature decay (White-hot -> Amber -> Ash)
  let life = clamp(p.position.w, 0.0, 1.0);
  p.colorSize.r = mix(0.8, 4.0, life);
  p.colorSize.g = mix(0.1, 1.8, pow(life, 2.0));
  p.colorSize.b = mix(0.0, 0.4, pow(life, 4.0));
  p.colorSize.a = mix(0.0, 0.08, life); // Scale down as it cools

  p.position = vec4<f32>(pos, p.position.w);
  p.velocity = vec4<f32>(vel, p.velocity.w);
  particles[idx] = p;
}
