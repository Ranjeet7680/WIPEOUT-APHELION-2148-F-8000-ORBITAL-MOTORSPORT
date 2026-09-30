// ============================================================================
// WIPEOUT: APHELION - GPU-DRIVEN MESHLET OCCLUSION CULLING
// Frustum cone culling, Hi-Z occlusion test, and backface normal cone culling
// ============================================================================

struct CameraCullData {
  position: vec3<f32>,
  frustumPlanes: array<vec4<f32>, 6>,
  viewProjMatrix: mat4x4<f32>,
  resolution: vec2<f32>,
};

struct MeshletBounds {
  sphereCenterRadius: vec4<f32>, // xyz = center, w = bounding radius
  coneApexCutoff: vec4<f32>,     // xyz = normal cone apex, w = -cos(cone_angle)
  coneAxis: vec4<f32>,           // xyz = cluster normal orientation
};

struct DrawIndexedIndirectArgs {
  indexCount: atomic<u32>,
  instanceCount: u32,
  firstIndex: u32,
  baseVertex: i32,
  firstInstance: u32,
};

@group(0) @binding(0) var<uniform> camera: CameraCullData;
@group(0) @binding(1) var<storage, read> meshlets: array<MeshletBounds>;
@group(0) @binding(2) var<storage, read_write> drawArgs: DrawIndexedIndirectArgs;
@group(0) @binding(3) var<storage, read_write> visibleMeshletIndices: array<u32>;
@group(0) @binding(4) var hiZPyramid: texture_2d<f32>;

fn isOccludedByHiZ(sphereCenter: vec3<f32>, radius: f32) -> bool {
  // Project bounding sphere to screen-space AABB
  let clipCenter = camera.viewProjMatrix * vec4<f32>(sphereCenter, 1.0);
  if (clipCenter.w <= 0.0) {
    return false;
  }

  let ndc = clipCenter.xyz / clipCenter.w;
  let uv = ndc.xy * 0.5 + 0.5;

  let screenRadius = (radius / clipCenter.w) * camera.resolution.x * 0.5;
  let mip = clamp(log2(max(screenRadius, 1.0)), 0.0, 5.0);

  let coords = vec2<i32>(uv * camera.resolution * exp2(-mip));
  let minDepth = textureLoad(hiZPyramid, coords, i32(mip)).r;

  // If closest geometry in cell is farther in front of bounding sphere, occluded
  return ndc.z > minDepth + 0.005;
}

@compute @workgroup_size(64, 1, 1)
fn cs_cull_meshlets(@builtin(global_invocation_id) id: vec3<u32>) {
  let meshletIdx = id.x;
  if (meshletIdx >= arrayLength(&meshlets)) {
    return;
  }

  let m = meshlets[meshletIdx];

  // 1. Backface Cone Culling
  let camToApex = camera.position - m.coneApexCutoff.xyz;
  let camDist = length(camToApex);
  if (camDist > 0.001) {
    if (dot(camToApex, m.coneAxis.xyz) < m.coneApexCutoff.w * camDist) {
      return; // Entire meshlet is turned away from camera
    }
  }

  // 2. Frustum Culling (6 planes)
  for (var i = 0; i < 6; i = i + 1) {
    let dist = dot(camera.frustumPlanes[i].xyz, m.sphereCenterRadius.xyz) + camera.frustumPlanes[i].w;
    if (dist < -m.sphereCenterRadius.w) {
      return; // Outside view frustum
    }
  }

  // 3. Hi-Z Occlusion Test
  if (isOccludedByHiZ(m.sphereCenterRadius.xyz, m.sphereCenterRadius.w)) {
    return;
  }

  // Passed all tests: Append to visible list atomically (126 triangles * 3 vertices = 378 indices)
  let slot = atomicAdd(&drawArgs.indexCount, 378u);
  let visibleIdx = slot / 378u;
  if (visibleIdx < arrayLength(&visibleMeshletIndices)) {
    visibleMeshletIndices[visibleIdx] = meshletIdx;
  }
}
