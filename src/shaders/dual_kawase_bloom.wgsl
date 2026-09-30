// ============================================================================
// WIPEOUT: APHELION - DUAL-KAWASE BLOOM CHAIN (COMPUTE SHADER)
// 4-stage 5-tap diagonal downsample + 4-stage 9-tap tent upsample
// ============================================================================

struct BloomUniforms {
  srcResolution: vec2<f32>,
  dstResolution: vec2<f32>,
  threshold: f32,
  intensity: f32,
};

@group(0) @binding(0) var<uniform> uniforms: BloomUniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var srcTexture: texture_2d<f32>;
@group(0) @binding(3) var dstTexture: texture_storage_2d<rgba16float, write>;

// 1. DOWNSAMPLE WITH LUMINANCE THRESHOLD PASS
@compute @workgroup_size(8, 8)
fn cs_downsample(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let coords = vec2<i32>(globalId.xy);
  let dim = vec2<i32>(uniforms.dstResolution);
  if (coords.x >= dim.x || coords.y >= dim.y) {
    return;
  }

  let uv = (vec2<f32>(coords) + 0.5) / uniforms.dstResolution;
  let halfPixel = 1.0 / uniforms.srcResolution;

  // 5-tap diagonal Dual-Kawase pattern
  let c  = textureSampleLevel(srcTexture, linearSampler, uv, 0.0).rgb;
  let tl = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>(-halfPixel.x, -halfPixel.y), 0.0).rgb;
  let tr = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>( halfPixel.x, -halfPixel.y), 0.0).rgb;
  let bl = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>(-halfPixel.x,  halfPixel.y), 0.0).rgb;
  let br = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>( halfPixel.x,  halfPixel.y), 0.0).rgb;

  var color = c * 0.5 + (tl + tr + bl + br) * 0.125;

  // Threshold filter for stage 0
  if (uniforms.threshold > 0.0) {
    let lum = dot(color, vec3<f32>(0.2126, 0.7152, 0.0722));
    let soft = clamp(lum - uniforms.threshold, 0.0, 1.0);
    color = color * (soft / max(lum, 0.0001));
  }

  textureStore(dstTexture, coords, vec4<f32>(color, 1.0));
}

// 2. UPSAMPLE WITH 9-TAP TENT FILTER PASS
@compute @workgroup_size(8, 8)
fn cs_upsample(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let coords = vec2<i32>(globalId.xy);
  let dim = vec2<i32>(uniforms.dstResolution);
  if (coords.x >= dim.x || coords.y >= dim.y) {
    return;
  }

  let uv = (vec2<f32>(coords) + 0.5) / uniforms.dstResolution;
  let d = (1.0 / uniforms.srcResolution) * 1.0;

  // 9-tap tent filter
  let c  = textureSampleLevel(srcTexture, linearSampler, uv, 0.0).rgb * 4.0;
  let l  = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>(-d.x,  0.0), 0.0).rgb * 2.0;
  let r  = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>( d.x,  0.0), 0.0).rgb * 2.0;
  let t  = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>( 0.0, -d.y), 0.0).rgb * 2.0;
  let b  = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>( 0.0,  d.y), 0.0).rgb * 2.0;
  let tl = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>(-d.x, -d.y), 0.0).rgb;
  let tr = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>( d.x, -d.y), 0.0).rgb;
  let bl = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>(-d.x,  d.y), 0.0).rgb;
  let br = textureSampleLevel(srcTexture, linearSampler, uv + vec2<f32>( d.x,  d.y), 0.0).rgb;

  let color = (c + l + r + t + b + tl + tr + bl + br) * (1.0 / 16.0);
  textureStore(dstTexture, coords, vec4<f32>(color * uniforms.intensity, 1.0));
}
