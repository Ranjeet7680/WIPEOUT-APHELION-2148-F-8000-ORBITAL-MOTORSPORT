// ============================================================================
// WIPEOUT: APHELION - VELOCITY MOTION BLUR RECONSTRUCTION PASS
// 12-tap directional trajectory filter with neighborhood depth clamping
// ============================================================================

struct MotionBlurUniforms {
  resolution: vec2<f32>,
  velocityScale: f32,
  maxBlurRadius: f32,
};

@group(0) @binding(0) var<uniform> uniforms: MotionBlurUniforms;
@group(0) @binding(1) var pointSampler: sampler;
@group(0) @binding(2) var linearSampler: sampler;
@group(0) @binding(3) var colorTexture: texture_2d<f32>;
@group(0) @binding(4) var motionVectorTexture: texture_2d<f32>;
@group(0) @binding(5) var depthTexture: texture_depth_2d;
@group(0) @binding(6) var outputTexture: texture_storage_2d<rgba16float, write>;

const TAP_COUNT: i32 = 12;

@compute @workgroup_size(8, 8)
fn cs_motion_blur(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let coords = vec2<i32>(globalId.xy);
  let dim = vec2<i32>(uniforms.resolution);
  if (coords.x >= dim.x || coords.y >= dim.y) {
    return;
  }

  let uv = (vec2<f32>(coords) + 0.5) / uniforms.resolution;

  // 1. Fetch velocity from Target 3
  var velocity = textureLoad(motionVectorTexture, coords, 0).xy * uniforms.velocityScale;
  let velLength = length(velocity);

  // Clamp blur to prevent extreme stretching artifacts
  if (velLength > uniforms.maxBlurRadius) {
    velocity = (velocity / velLength) * uniforms.maxBlurRadius;
  }

  let centerColor = textureLoad(colorTexture, coords, 0);
  let centerDepth = textureLoad(depthTexture, coords, 0);

  // If velocity is negligible, copy center color
  if (velLength < (0.5 / uniforms.resolution.x)) {
    textureStore(outputTexture, coords, centerColor);
    return;
  }

  // 2. 12-tap reconstruction filter along pixel trajectory
  var accumulatedColor = vec4<f32>(0.0);
  var totalWeight = 0.0;

  for (var i = 0; i < TAP_COUNT; i = i + 1) {
    let t = (f32(i) / f32(TAP_COUNT - 1)) - 0.5;
    let sampleUV = clamp(uv + velocity * t, vec2<f32>(0.0), vec2<f32>(1.0));
    let sampleCoords = vec2<i32>(sampleUV * uniforms.resolution);

    let sampleColor = textureLoad(colorTexture, sampleCoords, 0);
    let sampleDepth = textureLoad(depthTexture, sampleCoords, 0);

    // Depth-weighted rejection to eliminate edge bleeding from dynamic ship onto static track
    let depthDiff = abs(sampleDepth - centerDepth);
    let depthWeight = clamp(1.0 - depthDiff * 25.0, 0.1, 1.0);

    let sampleWeight = (1.0 - abs(t) * 0.8) * depthWeight;
    accumulatedColor += sampleColor * sampleWeight;
    totalWeight += sampleWeight;
  }

  let finalColor = accumulatedColor / max(totalWeight, 0.001);
  textureStore(outputTexture, coords, finalColor);
}
