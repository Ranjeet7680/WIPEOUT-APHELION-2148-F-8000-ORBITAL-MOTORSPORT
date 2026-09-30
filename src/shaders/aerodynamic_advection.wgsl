// ============================================================================
// WIPEOUT: APHELION - 3D EULERIAN FLUID ADVECTION (MACCORMACK SCHEME)
// Navier-Stokes wake turbulence with Boussinesq vortex shearing
// ============================================================================

struct FluidGridUniforms {
  gridDimensions: vec3<u32>,
  cellSize: f32,
  deltaTime: f32,
  viscosity: f32,
  vorticityScale: f32,
};

@group(0) @binding(0) var<uniform> fluid: FluidGridUniforms;
@group(0) @binding(1) var velocityIn: texture_3d<f32>;
@group(0) @binding(2) var velocityOut: texture_storage_3d<rgba16float, write>;
@group(0) @binding(3) var linearSampler: sampler;

// MacCormack advection scheme for low-dissipation vortex preservation
@compute @workgroup_size(8, 8, 8)
fn cs_advect(@builtin(global_invocation_id) id: vec3<u32>) {
  if (any(id >= fluid.gridDimensions)) {
    return;
  }

  let gridDimF = vec3<f32>(fluid.gridDimensions);
  let uvw = (vec3<f32>(id) + 0.5) / gridDimF;
  let currentVel = textureLoad(velocityIn, vec3<i32>(id), 0).xyz;

  // 1. Forward advection step (backtrace trajectory)
  let backtrackedUVW = uvw - (currentVel * fluid.deltaTime) / (gridDimF * fluid.cellSize);
  let phiHat = textureSampleLevel(velocityIn, linearSampler, backtrackedUVW, 0.0).xyz;

  // 2. Reverse step to estimate error
  let forwardUVW = backtrackedUVW + (phiHat * fluid.deltaTime) / (gridDimF * fluid.cellSize);
  let phiTilde = textureSampleLevel(velocityIn, linearSampler, forwardUVW, 0.0).xyz;

  // 3. MacCormack correction: phi = phiHat + 0.5 * (currentVel - phiTilde)
  var advectedVel = phiHat + 0.5 * (currentVel - phiTilde);

  // 4. Clamping against neighbor extrema to prevent overshoots
  let texel = 1.0 / gridDimF;
  let v0 = textureSampleLevel(velocityIn, linearSampler, backtrackedUVW + vec3<f32>(-texel.x, 0.0, 0.0), 0.0).xyz;
  let v1 = textureSampleLevel(velocityIn, linearSampler, backtrackedUVW + vec3<f32>( texel.x, 0.0, 0.0), 0.0).xyz;
  let v2 = textureSampleLevel(velocityIn, linearSampler, backtrackedUVW + vec3<f32>(0.0, -texel.y, 0.0), 0.0).xyz;
  let v3 = textureSampleLevel(velocityIn, linearSampler, backtrackedUVW + vec3<f32>(0.0,  texel.y, 0.0), 0.0).xyz;
  let minNeighbor = min(min(min(v0, v1), v2), v3);
  let maxNeighbor = max(max(max(v0, v1), v2), v3);
  advectedVel = clamp(advectedVel, minNeighbor, maxNeighbor);

  // Store intermediate velocity for pressure Poisson solve
  textureStore(velocityOut, vec3<i32>(id), vec4<f32>(advectedVel, 1.0));
}
