// ============================================================================
// WIPEOUT: APHELION - G-BUFFER RASTERIZATION SHADER (MRT)
// Target 0: Albedo.RGB + Roughness
// Target 1: OctNormal.XY + Metallic + AO/Cavity
// Target 2: Emissive.RGB (HDR) + Material ID
// Target 3: MotionVector.XY (Screen-Space Velocity)
// ============================================================================

struct CameraMatrices {
  viewProjection: mat4x4<f32>,
  prevViewProjection: mat4x4<f32>,
  jitter: vec2<f32>,
  prevJitter: vec2<f32>,
};

struct InstanceData {
  modelMatrix: mat4x4<f32>,
  prevModelMatrix: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> camera: CameraMatrices;
@group(1) @binding(0) var<storage, read> instances: array<InstanceData>;
@group(2) @binding(0) var albedoSampler: sampler;
@group(2) @binding(1) var albedoTexture: texture_2d<f32>;
@group(2) @binding(2) var normalMap: texture_2d<f32>;
@group(2) @binding(3) var pbrMap: texture_2d<f32>;       // R: Roughness, G: Metallic, B: Cavity
@group(2) @binding(4) var emissiveMap: texture_2d<f32>;  // RGB: HDR Color

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) tangent: vec4<f32>,
  @location(3) uv: vec2<f32>,
  @builtin(instance_index) instanceIdx: u32,
};

struct VertexOutput {
  @builtin(position) clipPos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) worldNormal: vec3<f32>,
  @location(2) worldTangent: vec3<f32>,
  @location(3) worldBitangent: vec3<f32>,
  @location(4) currNdc: vec4<f32>,
  @location(5) prevNdc: vec4<f32>,
};

// Octahedral encoding to store a 3D unit normal in 2 float components
fn octEncode(n: vec3<f32>) -> vec2<f32> {
  let l1Norm = abs(n.x) + abs(n.y) + abs(n.z);
  var p = n.xy * (1.0 / l1Norm);
  if (n.z < 0.0) {
    p = (1.0 - abs(p.yx)) * select(vec2<f32>(-1.0), vec2<f32>(1.0), p >= vec2<f32>(0.0));
  }
  return p;
}

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  let inst = instances[in.instanceIdx];
  let worldPos = inst.modelMatrix * vec4<f32>(in.position, 1.0);
  let prevWorldPos = inst.prevModelMatrix * vec4<f32>(in.position, 1.0);

  out.clipPos = camera.viewProjection * worldPos;
  out.uv = in.uv;

  let N = normalize((inst.modelMatrix * vec4<f32>(in.normal, 0.0)).xyz);
  let T = normalize((inst.modelMatrix * vec4<f32>(in.tangent.xyz, 0.0)).xyz);
  let B = cross(N, T) * in.tangent.w;

  out.worldNormal = N;
  out.worldTangent = T;
  out.worldBitangent = B;

  // Track velocity vectors for motion blur and TAA
  out.currNdc = out.clipPos;
  out.prevNdc = camera.prevViewProjection * prevWorldPos;

  return out;
}

struct GBufferOutput {
  @location(0) albedoRough: vec4<f32>,
  @location(1) normalMetalAO: vec4<f32>,
  @location(2) emissiveMatId: vec4<f32>,
  @location(3) motionVectors: vec2<f32>,
};

@fragment
fn fs_main(in: VertexOutput) -> GBufferOutput {
  var out: GBufferOutput;

  let albedo = textureSample(albedoTexture, albedoSampler, in.uv);
  let pbr = textureSample(pbrMap, albedoSampler, in.uv);
  let rawNormal = textureSample(normalMap, albedoSampler, in.uv).rgb * 2.0 - 1.0;
  let emissive = textureSample(emissiveMap, albedoSampler, in.uv).rgb;

  let tbn = mat3x3<f32>(in.worldTangent, in.worldBitangent, in.worldNormal);
  let finalNormal = normalize(tbn * rawNormal);

  // Velocity Calculation: (CurrentScreenPos - PrevScreenPos)
  let a = (in.currNdc.xy / in.currNdc.w) - camera.jitter;
  let b = (in.prevNdc.xy / in.prevNdc.w) - camera.prevJitter;
  let velocity = (a - b) * 0.5; // Map from NDC [-1, 1] to UV [0, 1]

  out.albedoRough = vec4<f32>(albedo.rgb, pbr.r);
  out.normalMetalAO = vec4<f32>(octEncode(finalNormal), pbr.g, pbr.b);
  out.emissiveMatId = vec4<f32>(emissive, 1.0); // ID 1.0 = Default Ship Composite PBR
  out.motionVectors = velocity;

  return out;
}
