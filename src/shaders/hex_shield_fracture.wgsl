// ============================================================================
// WIPEOUT: APHELION - PROCEDURAL HEX-SHIELD FRACTURE DEFORMATION (WGSL)
// Active conformal Voronoi lattice with impact wavefront propagation & HDR emission
// ============================================================================

struct ShieldUniforms {
  worldMatrix: mat4x4<f32>,
  viewProjMatrix: mat4x4<f32>,
  cameraPosition: vec3<f32>,
  impactWorldPos: vec3<f32>,
  waveRadius: f32,
  time: f32,
  damageRatio: f32, // 0.0 = 100% shield, 1.0 = depleted/critical
  hitIntensity: f32,
};

@group(0) @binding(0) var<uniform> shield: ShieldUniforms;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
};

struct VertexOutput {
  @builtin(position) clipPos: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
  @location(1) worldNormal: vec3<f32>,
  @location(2) uv: vec2<f32>,
};

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  // Wavefront normal extrusion at impact perimeter
  let worldP = shield.worldMatrix * vec4<f32>(in.position, 1.0);
  let distFromHit = distance(worldP.xyz, shield.impactWorldPos);
  let waveFront = abs(distFromHit - shield.waveRadius);
  let waveDeform = smoothstep(1.2, 0.0, waveFront) * shield.hitIntensity * 0.22;

  let displacedPos = in.position + in.normal * waveDeform;
  let displacedWorldP = shield.worldMatrix * vec4<f32>(displacedPos, 1.0);

  out.worldPos = displacedWorldP.xyz;
  out.worldNormal = normalize((shield.worldMatrix * vec4<f32>(in.normal, 0.0)).xyz);
  out.uv = in.uv;
  out.clipPos = shield.viewProjMatrix * displacedWorldP;

  return out;
}

// Procedural hexagonal lattice border distance
fn computeHexagonalBorder(p: vec2<f32>) -> f32 {
  let q = vec2<f32>(abs(p.x), abs(p.y));
  let d1 = dot(q, vec2<f32>(0.86602540378, 0.5)); // cos(30 deg), sin(30 deg)
  let d2 = q.y;
  let d = max(d1, d2);
  let hexFract = fract(d);
  return min(hexFract, 1.0 - hexFract);
}

@fragment
fn fs_shield_impact(in: VertexOutput) -> @location(0) vec4<f32> {
  // 1. Calculate Voronoi procedural lattice on hull UVs
  let cellUV = in.uv * 48.0;
  let distToEdge = computeHexagonalBorder(cellUV);

  // 2. Wavefront propagation from impact center
  let distFromHit = distance(in.worldPos, shield.impactWorldPos);
  let waveFront = abs(distFromHit - shield.waveRadius);

  // 3. Hex perimeter pulse & impact wave intensity
  let hexEdgeAlpha = smoothstep(0.06, 0.0, distToEdge);
  let waveIntensity = smoothstep(1.5, 0.0, waveFront) * (0.3 + shield.hitIntensity * 0.7);

  // 4. Critical status flicker
  let flicker = sin(shield.time * 60.0) * 0.5 + 0.5;

  // Energy color transition: Cyan -> Hazard Amber -> Hyper Vermilion
  let energyColor = mix(
    vec3<f32>(0.0, 0.94, 1.0),
    vec3<f32>(1.0, 0.16, 0.08),
    shield.damageRatio
  );

  // Fresnel rim glow
  let viewDir = normalize(shield.cameraPosition - in.worldPos);
  let fresnel = pow(1.0 - max(dot(viewDir, in.worldNormal), 0.0), 3.0);

  let finalRGB = energyColor * (hexEdgeAlpha * waveIntensity * 8.0 + fresnel * 1.5) * (0.7 + flicker * 0.3);
  let finalAlpha = clamp(waveIntensity * hexEdgeAlpha * 0.9 + fresnel * 0.4 + shield.hitIntensity * 0.35, 0.0, 0.92);

  return vec4<f32>(finalRGB, finalAlpha);
}
