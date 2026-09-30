// ============================================================================
// WIPEOUT: APHELION - TEMPORAL ANTI-ALIASING (TAA) RESOLVE PASS
// YCoCg 3x3 neighborhood clamping + exponential moving average (alpha = 0.08)
// ============================================================================

struct TaaUniforms {
  resolution: vec2<f32>,
  alpha: f32, // 0.08
};

@group(0) @binding(0) var<uniform> uniforms: TaaUniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var currentColor: texture_2d<f32>;
@group(0) @binding(3) var historyColor: texture_2d<f32>;
@group(0) @binding(4) var motionVectors: texture_2d<f32>;
@group(0) @binding(5) var resolvedOutput: texture_storage_2d<rgba8unorm, write>;

// RGB to YCoCg space conversion
fn rgbToYCoCg(c: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(
     0.25 * c.r + 0.5 * c.g + 0.25 * c.b,
     0.5  * c.r             - 0.5  * c.b,
    -0.25 * c.r + 0.5 * c.g - 0.25 * c.b
  );
}

// YCoCg to RGB space conversion
fn yCoCgToRgb(c: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(
    c.x + c.y - c.z,
    c.x       + c.z,
    c.x - c.y - c.z
  );
}

@compute @workgroup_size(8, 8)
fn cs_taa_resolve(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let coords = vec2<i32>(globalId.xy);
  let dim = vec2<i32>(uniforms.resolution);
  if (coords.x >= dim.x || coords.y >= dim.y) {
    return;
  }

  let uv = (vec2<f32>(coords) + 0.5) / uniforms.resolution;

  // 1. Current frame color
  let currentRGB = textureLoad(currentColor, coords, 0).rgb;
  let currentYCoCg = rgbToYCoCg(currentRGB);

  // 2. Fetch motion vector from Target 3
  let velocity = textureLoad(motionVectors, coords, 0).xy;
  let historyUV = uv - velocity;

  // If reprojected UV is offscreen, output current frame
  if (historyUV.x < 0.0 || historyUV.x > 1.0 || historyUV.y < 0.0 || historyUV.y > 1.0) {
    textureStore(resolvedOutput, coords, vec4<f32>(currentRGB, 1.0));
    return;
  }

  // 3. 3x3 Neighborhood color bounding box in YCoCg space
  var minColor = currentYCoCg;
  var maxColor = currentYCoCg;

  for (var y = -1; y <= 1; y = y + 1) {
    for (var x = -1; x <= 1; x = x + 1) {
      let sampleCoords = clamp(coords + vec2<i32>(x, y), vec2<i32>(0), dim - 1);
      let sampleYCoCg = rgbToYCoCg(textureLoad(currentColor, sampleCoords, 0).rgb);
      minColor = min(minColor, sampleYCoCg);
      maxColor = max(maxColor, sampleYCoCg);
    }
  }

  // 4. Sample and clamp history color
  let historyRGB = textureSampleLevel(historyColor, linearSampler, historyUV, 0.0).rgb;
  var historyYCoCg = rgbToYCoCg(historyRGB);
  historyYCoCg = clamp(historyYCoCg, minColor, maxColor);

  // 5. Exponential Moving Average blend
  let resolvedYCoCg = mix(historyYCoCg, currentYCoCg, uniforms.alpha);
  let finalRGB = clamp(yCoCgToRgb(resolvedYCoCg), vec3<f32>(0.0), vec3<f32>(1.0));

  textureStore(resolvedOutput, coords, vec4<f32>(finalRGB, 1.0));
}
