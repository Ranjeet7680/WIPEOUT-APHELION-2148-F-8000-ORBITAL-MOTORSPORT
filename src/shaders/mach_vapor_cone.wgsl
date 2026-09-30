// ============================================================================
// WIPEOUT: APHELION - MACH-1 PRANDTL-GLAUERT VAPOR CONE SHADER (WGSL)
// Conical shock sleeve with normal vertex displacement and dynamic Fresnel rim
// ============================================================================

struct VaporUniforms {
  worldMatrix: mat4x4<f32>,
  viewProjMatrix: mat4x4<f32>,
  cameraPosition: vec3<f32>,
  time: f32,
  speedMs: f32,
  soundSpeed: f32, // 343.0 m/s
  airDensity: f32,
  boostActive: f32,
};

@group(0) @binding(0) var<uniform> uniforms: VaporUniforms;

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
  @location(3) machIntensity: f32,
};

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
  var out: VertexOutput;

  // 1. Calculate Mach factor: s_mach = clamp((||v|| - v_sound) / 40.0, 0.0, 1.0)
  let vDiff = uniforms.speedMs - uniforms.soundSpeed;
  let sMach = clamp(vDiff / 40.0, 0.0, 1.0) + uniforms.boostActive * 0.4;
  out.machIntensity = clamp(sMach, 0.0, 1.0);

  // 2. High-frequency shock diamond displacement along vertex normal
  let shockWobble = sin(in.position.z * 18.0 + uniforms.time * 24.0) * cos(in.position.x * 12.0);
  let displacement = in.normal * (out.machIntensity * 0.28 * (1.0 + shockWobble * 0.35));
  let displacedPos = in.position + displacement;

  let worldP = uniforms.worldMatrix * vec4<f32>(displacedPos, 1.0);
  out.worldPos = worldP.xyz;
  out.worldNormal = normalize((uniforms.worldMatrix * vec4<f32>(in.normal, 0.0)).xyz);
  out.uv = in.uv;
  out.clipPos = uniforms.viewProjMatrix * worldP;

  return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  if (in.machIntensity <= 0.01) {
    discard;
  }

  // 1. View-dependent Fresnel rim falloff
  let viewDir = normalize(uniforms.cameraPosition - in.worldPos);
  let NdotV = max(dot(viewDir, in.worldNormal), 0.0);
  let fresnel = pow(1.0 - NdotV, 3.2);

  // 2. Condensation ring bands
  let rings = sin(in.uv.y * 36.0 - uniforms.time * 16.0) * 0.5 + 0.5;

  // 3. Vapor color: Electric cyan / ionized white
  let vaporColor = mix(vec3<f32>(0.2, 0.85, 1.0), vec3<f32>(0.95, 0.98, 1.0), fresnel);

  // 4. Alpha modulated by dynamic air pressure and Mach factor
  let alpha = (fresnel * 0.75 + rings * 0.25) * in.machIntensity * uniforms.airDensity * 0.85;

  return vec4<f32>(vaporColor, alpha);
}
