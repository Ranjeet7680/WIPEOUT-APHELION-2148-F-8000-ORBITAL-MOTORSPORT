// ============================================================================
// WIPEOUT: APHELION - CLUSTERED DEFERRED LIGHTING COMPUTE SHADER
// Octahedral normal decoding, Reverse-Z depth reconstruction, Cook-Torrance PBR
// ============================================================================

struct SceneUniforms {
  invProj: mat4x4<f32>,
  invView: mat4x4<f32>,
  cameraPos: vec3<f32>,
  resolution: vec2<f32>,
};

struct LightData {
  position: vec3<f32>,
  linearFalloff: f32,
  radiance: vec3<f32>,
  quadFalloff: f32,
};

@group(0) @binding(0) var<uniform> sceneUniforms: SceneUniforms;
@group(0) @binding(1) var<storage, read> lights: array<LightData>;
@group(0) @binding(2) var<storage, read> clusterLightIndices: array<u32>;
@group(0) @binding(3) var<storage, read> clusterLightCounts: array<u32>;

@group(1) @binding(0) var gAlbedoRoughness: texture_2d<f32>;
@group(1) @binding(1) var gNormalMetallic: texture_2d<f32>;
@group(1) @binding(2) var gEmissive: texture_2d<f32>;
@group(1) @binding(3) var sceneDepth: texture_depth_2d;
@group(1) @binding(4) var hdrAccumulation: texture_storage_2d<rgba16float, write>;

const PI: f32 = 3.14159265359;
const MAX_LIGHTS: u32 = 64u;

// Octahedral decoding to reconstruct a 3D unit normal from 2 float components
fn octDecode(p: vec2<f32>) -> vec3<f32> {
  var n = vec3<f32>(p.x, p.y, 1.0 - abs(p.x) - abs(p.y));
  let t = clamp(-n.z, 0.0, 1.0);
  n.x += select(t, -t, n.x >= 0.0);
  n.y += select(t, -t, n.y >= 0.0);
  return normalize(n);
}

// Cook-Torrance GGX Specular + Lambertian Diffuse
fn evaluatePBR(
  N: vec3<f32>,
  V: vec3<f32>,
  L: vec3<f32>,
  H: vec3<f32>,
  albedo: vec3<f32>,
  roughness: f32,
  metallic: f32
) -> vec3<f32> {
  let NdotL = max(dot(N, L), 0.0);
  let NdotV = max(dot(N, V), 0.001);
  let NdotH = max(dot(N, H), 0.0);
  let VdotH = max(dot(V, H), 0.0);

  // Fresnel Schlick
  let F0 = mix(vec3<f32>(0.04), albedo, metallic);
  let F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);

  // Normal Distribution Function (GGX)
  let alpha = roughness * roughness;
  let alpha2 = alpha * alpha;
  let denomGGX = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
  let D = alpha2 / (PI * denomGGX * denomGGX);

  // Geometry Function (Smith)
  let k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  let G1_V = NdotV / (NdotV * (1.0 - k) + k);
  let G1_L = NdotL / (NdotL * (1.0 - k) + k);
  let G = G1_V * G1_L;

  // Specular BRDF
  let specular = (D * G * F) / (4.0 * NdotV * NdotL + 0.0001);

  // Diffuse energy conservation
  let kD = (vec3<f32>(1.0) - F) * (1.0 - metallic);
  let diffuse = kD * albedo / PI;

  return (diffuse + specular) * NdotL;
}

fn computeClusterIndex(coords: vec2<i32>, depth: f32) -> u32 {
  let tileX = u32(coords.x) / 16u;
  let tileY = u32(coords.y) / 16u;
  let sliceZ = u32(clamp(depth * 32.0, 0.0, 31.0));
  return tileX + tileY * 16u + sliceZ * 256u;
}

@compute @workgroup_size(8, 8)
fn cs_lighting(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let coords = vec2<i32>(globalId.xy);
  let dim = vec2<i32>(sceneUniforms.resolution);
  if (coords.x >= dim.x || coords.y >= dim.y) {
    return;
  }

  let screenUV = vec2<f32>(coords) / sceneUniforms.resolution;

  // 1. Unpack G-Buffer
  let albedoRough = textureLoad(gAlbedoRoughness, coords, 0);
  let normalMetal = textureLoad(gNormalMetallic, coords, 0);
  let emissive = textureLoad(gEmissive, coords, 0).rgb;
  let depth = textureLoad(sceneDepth, coords, 0);

  // Skip background
  if (depth == 0.0) {
    textureStore(hdrAccumulation, coords, vec4<f32>(0.01, 0.01, 0.02, 1.0));
    return;
  }

  let N = octDecode(normalMetal.xy);
  let roughness = max(albedoRough.a, 0.04);
  let metallic = normalMetal.z;
  let albedo = albedoRough.rgb;

  // 2. Reconstruct World Position from Depth
  let clipPos = vec4<f32>(screenUV * 2.0 - 1.0, depth, 1.0);
  let viewPos = sceneUniforms.invProj * clipPos;
  let worldPos = (sceneUniforms.invView * (viewPos / viewPos.w)).xyz;
  let V = normalize(sceneUniforms.cameraPos - worldPos);

  // 3. Evaluate Direct Lighting via Clustered Grid
  var directLight = vec3<f32>(0.0);
  let clusterIdx = computeClusterIndex(coords, depth) % 256u;
  let lightCount = min(clusterLightCounts[clusterIdx], MAX_LIGHTS);

  for (var i = 0u; i < lightCount; i = i + 1u) {
    let light = lights[clusterLightIndices[clusterIdx * MAX_LIGHTS + i]];
    let L = normalize(light.position - worldPos);
    let H = normalize(V + L);
    let dist = length(light.position - worldPos);
    let atten = 1.0 / (1.0 + light.linearFalloff * dist + light.quadFalloff * dist * dist);

    directLight += evaluatePBR(N, V, L, H, albedo, roughness, metallic) * light.radiance * atten;
  }

  let finalColor = directLight + emissive;
  textureStore(hdrAccumulation, coords, vec4<f32>(finalColor, 1.0));
}
