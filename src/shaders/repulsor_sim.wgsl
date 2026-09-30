struct SimUniforms {
  craftPosUV: vec2<f32>,       // Craft position mapped to [0, 1] texture space
  repulsorForce: f32,          // Normalized downward force (0.0 to 1.0)
  damping: f32,                // Damping factor (e.g., 0.025)
  waveSpeedSq: f32,            // (c * dt / dx)^2
  deltaTime: f32,
  resolution: vec2<f32>,
};

@group(0) @binding(0) var<uniform> sim: SimUniforms;
@group(0) @binding(1) var stateCurrent: texture_2d<f32>;
@group(0) @binding(2) var statePrevious: texture_2d<f32>;
@group(0) @binding(3) var stateNext: texture_storage_2d<r32float, write>;
@group(0) @binding(4) var normalDistortionOut: texture_storage_2d<rgba16float, write>;

@compute @workgroup_size(16, 16)
fn cs_main(@builtin(global_invocation_id) id: vec3<u32>) {
  let coords = vec2<i32>(id.xy);
  let dim = vec2<i32>(sim.resolution);

  if (coords.x >= dim.x || coords.y >= dim.y) {
    return;
  }

  // 1. Sample neighbor cells (5-point Laplacian stencil)
  let c  = textureLoad(stateCurrent, coords, 0).r;
  let l  = textureLoad(stateCurrent, clamp(coords + vec2<i32>(-1, 0), vec2<i32>(0), dim - 1), 0).r;
  let r  = textureLoad(stateCurrent, clamp(coords + vec2<i32>(1, 0), vec2<i32>(0), dim - 1), 0).r;
  let t  = textureLoad(stateCurrent, clamp(coords + vec2<i32>(0, -1), vec2<i32>(0), dim - 1), 0).r;
  let b  = textureLoad(stateCurrent, clamp(coords + vec2<i32>(0, 1), vec2<i32>(0), dim - 1), 0).r;
  let prev = textureLoad(statePrevious, coords, 0).r;

  let laplacian = (l + r + t + b) - 4.0 * c;

  // 2. Continuous injection from craft repulsor footprint
  let uv = vec2<f32>(coords) / sim.resolution;
  let dist = distance(uv, sim.craftPosUV);
  let footprintRadius = 0.045; // Localized coil radius
  var impulse = 0.0;
  if (dist < footprintRadius) {
    let decay = cos((dist / footprintRadius) * 1.5707963);
    impulse = sim.repulsorForce * decay * 2.5;
  }

  // 3. Discrete Verlet integration step
  let accel = sim.waveSpeedSq * laplacian - (sim.damping * (c - prev)) + impulse;
  let next = 2.0 * c - prev + accel;

  // Store solved displacement height
  textureStore(stateNext, coords, vec4<f32>(next, 0.0, 0.0, 1.0));

  // 4. Derive central difference normal vector for visual lensing
  let dX = (r - l) * 0.5;
  let dY = (b - t) * 0.5;
  let normal = normalize(vec3<f32>(-dX, -dY, 1.0));

  // Write packed normal and wave intensity for the fragment pass
  textureStore(normalDistortionOut, coords, vec4<f32>(normal * 0.5 + 0.5, abs(next)));
}
