// ============================================================================
// WIPEOUT: APHELION - HIERARCHICAL-Z (Hi-Z) SCREEN-SPACE GLOSSY REFLECTIONS
// Conservative min-depth pyramid ray marching + GGX VNDF specular sampling
// ============================================================================

struct SsrUniforms {
  viewMatrix: mat4x4<f32>,
  projMatrix: mat4x4<f32>,
  invProjMatrix: mat4x4<f32>,
  cameraPos: vec3<f32>,
  maxSteps: u32,
  resolution: vec2<f32>,
  roughnessCutoff: f32,
};

@group(0) @binding(0) var<uniform> ssr: SsrUniforms;
@group(0) @binding(1) var linearSampler: sampler;
@group(0) @binding(2) var pointSampler: sampler;
@group(0) @binding(3) var colorTexture: texture_2d<f32>;
@group(0) @binding(4) var normalTexture: texture_2d<f32>;
@group(0) @binding(5) var roughnessTexture: texture_2d<f32>;
@group(0) @binding(6) var hiZPyramid: texture_2d<f32>; // Mip-mapped conservative min depth
@group(0) @binding(7) var ssrOutput: texture_storage_2d<rgba16float, write>;

// GGX Visible Normal Distribution Function (VNDF) sampling
fn sampleGGX_VNDF(Ve: vec3<f32>, alpha: f32, u1: f32, u2: f32) -> vec3<f32> {
  let Vh = normalize(vec3<f32>(alpha * Ve.x, alpha * Ve.y, Ve.z));
  let lensq = Vh.x * Vh.x + Vh.y * Vh.y;
  let T1 = select(vec3<f32>(1.0, 0.0, 0.0), vec3<f32>(-Vh.y, Vh.x, 0.0) / sqrt(lensq), lensq > 0.0);
  let T2 = cross(Vh, T1);

  let r = sqrt(u1);
  let phi = 2.0 * 3.14159265 * u2;
  let t1 = r * cos(phi);
  var t2 = r * sin(phi);
  let s = 0.5 * (1.0 + Vh.z);
  t2 = (1.0 - s) * sqrt(max(0.0, 1.0 - t1 * t1)) + s * t2;

  let Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;
  let Ne = normalize(vec3<f32>(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
  return Ne;
}

// Hi-Z Logarithmic Screen-Space Ray Marching
fn rayCastHiZ(rayOrigin: vec3<f32>, rayDir: vec3<f32>, maxSteps: u32) -> vec3<f32> {
  var currentPos = rayOrigin;
  var currentMip = 0.0;
  let dirSign = sign(rayDir);

  for (var step = 0u; step < maxSteps; step = step + 1u) {
    let cellCoord = vec2<i32>(currentPos.xy * exp2(-currentMip));
    let cellMinZ = textureLoad(hiZPyramid, cellCoord, i32(currentMip)).r;

    // Test ray depth against conservative bounding cell
    if (currentPos.z < cellMinZ) {
      if (currentMip == 0.0) {
        // Intersection confirmed at finest level
        return currentPos;
      }
      // Step down to finer resolution for precision
      currentMip = max(0.0, currentMip - 1.0);
    } else {
      // Step along ray and advance to coarser MIP if skipping empty space
      currentPos += rayDir * (0.015 * exp2(currentMip));
      currentMip = min(5.0, currentMip + 0.5);
    }
  }
  return vec3<f32>(-1.0); // Miss
}

@compute @workgroup_size(8, 8)
fn cs_ssr(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let coords = vec2<i32>(globalId.xy);
  let dim = vec2<i32>(ssr.resolution);
  if (coords.x >= dim.x || coords.y >= dim.y) {
    return;
  }

  let uv = (vec2<f32>(coords) + 0.5) / ssr.resolution;
  let depth = textureLoad(hiZPyramid, coords, 0).r;
  let roughness = textureLoad(roughnessTexture, coords, 0).a;

  // Skip sky or non-reflective matte surfaces
  if (depth == 0.0 || roughness > ssr.roughnessCutoff) {
    textureStore(ssrOutput, coords, vec4<f32>(0.0));
    return;
  }

  // Reconstruct View Space Position
  let clipPos = vec4<f32>(uv * 2.0 - 1.0, depth, 1.0);
  let viewPos4 = ssr.invProjMatrix * clipPos;
  let viewPos = viewPos4.xyz / viewPos4.w;

  let rawNormal = textureLoad(normalTexture, coords, 0).xyz;
  let normal = normalize((ssr.viewMatrix * vec4<f32>(rawNormal, 0.0)).xyz);
  let viewDir = normalize(-viewPos);

  // Microfacet normal via GGX VNDF
  let H = sampleGGX_VNDF(viewDir, roughness * roughness, 0.5, 0.5);
  let reflectDir = reflect(-viewDir, H);

  // Transform ray to screen space for Hi-Z traversal
  let rayOriginSS = vec3<f32>(uv, depth);
  let rayEndView = viewPos + reflectDir * 50.0;
  let rayEndClip = ssr.projMatrix * vec4<f32>(rayEndView, 1.0);
  let rayEndSS = vec3<f32>((rayEndClip.xy / rayEndClip.w) * 0.5 + 0.5, rayEndClip.z / rayEndClip.w);
  let rayDirSS = normalize(rayEndSS - rayOriginSS);

  // Perform Hi-Z Ray Marching
  let hitSS = rayCastHiZ(rayOriginSS, rayDirSS, ssr.maxSteps);

  if (hitSS.x >= 0.0 && hitSS.x <= 1.0 && hitSS.y >= 0.0 && hitSS.y <= 1.0) {
    let hitColor = textureSampleLevel(colorTexture, linearSampler, hitSS.xy, roughness * 3.0).rgb;
    // Edge fade
    let dU = 1.0 - abs(hitSS.x * 2.0 - 1.0);
    let dV = 1.0 - abs(hitSS.y * 2.0 - 1.0);
    let edgeFade = clamp(dU * dV * 8.0, 0.0, 1.0);

    let finalReflection = hitColor * edgeFade;
    textureStore(ssrOutput, coords, vec4<f32>(finalReflection, edgeFade));
  } else {
    textureStore(ssrOutput, coords, vec4<f32>(0.0));
  }
}
