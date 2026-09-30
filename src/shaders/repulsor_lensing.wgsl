struct CameraUniforms {
  viewProjInverse: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  projMatrix: mat4x4<f32>,
  cameraWorldPos: vec3<f32>,
  viewportSize: vec2<f32>,
};

struct RepulsorProxyUniforms {
  worldMatrix: mat4x4<f32>,
  intensity: f32,
  dispersion: f32, // Chromatic aberration factor
  thermalGlowColor: vec3<f32>,
};

@group(0) @binding(0) var<uniform> camera: CameraUniforms;
@group(1) @binding(0) var<uniform> proxy: RepulsorProxyUniforms;

@group(2) @binding(0) var sceneSampler: sampler;
@group(2) @binding(1) var sceneColorTexture: texture_2d<f32>;
@group(2) @binding(2) var sceneDepthTexture: texture_depth_2d;
@group(2) @binding(3) var waveNormalTexture: texture_2d<f32>;

struct VertexOutput {
  @builtin(position) clipPos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) worldPos: vec3<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  // Screen-covering triangle or proxy billboard
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0)
  );

  var out: VertexOutput;
  out.clipPos = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  out.uv = pos[vertexIndex] * 0.5 + 0.5;
  out.uv.y = 1.0 - out.uv.y; // Correct WebGPU coordinate flip
  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let screenUV = in.clipPos.xy / camera.viewportSize;

  // 1. Sample wave normal and intensity from Compute Pass output
  let waveData = textureSample(waveNormalTexture, sceneSampler, screenUV);
  let normal = waveData.rgb * 2.0 - 1.0;
  let waveAmplitude = waveData.a;

  if (waveAmplitude < 0.001) {
    discard;
  }

  // 2. Fetch linear scene depth to prevent refracting objects in front of the field
  let rawDepth = textureSample(sceneDepthTexture, sceneSampler, screenUV);
  
  // Reconstruct world space Z distance
  let clipSpacePos = vec4<f32>(screenUV * 2.0 - 1.0, rawDepth, 1.0);
  let viewSpacePos = camera.viewProjInverse * clipSpacePos;
  let sceneLinearDepth = viewSpacePos.w;

  // 3. Compute screen-space refractive offset
  let distortionStrength = proxy.intensity * waveAmplitude * 0.035;
  let refractOffset = normal.xy * distortionStrength;

  // 4. Chromatic Aberration (R/G/B phase shift)
  let delta = proxy.dispersion * distortionStrength;
  let uvR = screenUV + refractOffset * (1.0 + delta);
  let uvG = screenUV + refractOffset;
  let uvB = screenUV + refractOffset * (1.0 - delta);

  let colR = textureSample(sceneColorTexture, sceneSampler, uvR).r;
  let colG = textureSample(sceneColorTexture, sceneSampler, uvG).g;
  let colB = textureSample(sceneColorTexture, sceneSampler, uvB).b;
  let refractedBase = vec3<f32>(colR, colG, colB);

  // 5. Fresnel Edge Falloff & Thermal Plasma Emission
  let edgeFade = smoothstep(0.0, 0.2, waveAmplitude);
  let thermalGlow = proxy.thermalGlowColor * pow(waveAmplitude, 1.8) * 3.5;

  let finalRGB = mix(refractedBase, refractedBase + thermalGlow, edgeFade);

  return vec4<f32>(finalRGB, 1.0);
}
