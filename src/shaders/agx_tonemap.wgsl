// ============================================================================
// WIPEOUT: APHELION - AgX FILM TONEMAPPING & COLOR GRADING
// Preserves chromatic volume of electric cyan plumes without Reinhard burnout
// ============================================================================

struct TonemapUniforms {
  exposure: f32,
  saturation: f32,
  contrast: f32,
  resolution: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: TonemapUniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var hdrSceneTexture: texture_2d<f32>;
@group(0) @binding(3) var bloomTexture: texture_2d<f32>;
@group(0) @binding(4) var ldrOutputTexture: texture_storage_2d<rgba8unorm, write>;

// AgX Input & Output Color Space Transformation Matrices
const agxMatIn: mat3x3<f32> = mat3x3<f32>(
  0.842479062253094, 0.0423282422610123, 0.0423756549057051,
  0.0784335999999992, 0.878468636469772, 0.0784336,
  0.0792237451477643, 0.0791661274605434, 0.879223745147764
);

const agxMatOut: mat3x3<f32> = mat3x3<f32>(
  1.19687900512017, -0.0528968517590771, -0.052971635523654,
  -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
  -0.0990297440797205, -0.0989611768448433, 1.15107367264188
);

fn agxTonemap(hdrColor: vec3<f32>) -> vec3<f32> {
  // 1. Transform to AgX input color space
  let agxColor = agxMatIn * hdrColor;

  // 2. Log-domain mapping
  let minEV = -10.0;
  let maxEV = 6.5;
  let logMapped = clamp(
    (log2(max(agxColor, vec3<f32>(1e-5))) - minEV) / (maxEV - minEV),
    vec3<f32>(0.0),
    vec3<f32>(1.0)
  );

  // 3. Sigmoid S-curve application
  let sCurve = 0.5 - sin(asin(1.0 - 2.0 * logMapped) / 2.0);

  // 4. Transform back to target Rec.709 presentation
  return max(agxMatOut * sCurve, vec3<f32>(0.0));
}

@compute @workgroup_size(8, 8)
fn cs_tonemap(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let coords = vec2<i32>(globalId.xy);
  let dim = vec2<i32>(uniforms.resolution);
  if (coords.x >= dim.x || coords.y >= dim.y) {
    return;
  }

  let uv = (vec2<f32>(coords) + 0.5) / uniforms.resolution;

  let hdrColor = textureLoad(hdrSceneTexture, coords, 0).rgb * uniforms.exposure;
  let bloom = textureSampleLevel(bloomTexture, linearSampler, uv, 0.0).rgb;

  // Composite Bloom
  let composite = hdrColor + bloom;

  // Apply AgX Film Tonemapping
  var ldr = agxTonemap(composite);

  // Contrast & Saturation color grading
  let luminance = dot(ldr, vec3<f32>(0.2126, 0.7152, 0.0722));
  ldr = mix(vec3<f32>(luminance), ldr, uniforms.saturation);
  ldr = pow(ldr, vec3<f32>(uniforms.contrast));

  textureStore(ldrOutputTexture, coords, vec4<f32>(ldr, 1.0));
}
