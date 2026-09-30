// ============================================================================
// WIPEOUT: APHELION - WEBGPU NEURAL TRAJECTORY COMPUTE SHADER
// 3-Layer Residual Policy Network: [48 -> 128 -> 128 -> 5]
// Channel-specific activations: Tanh (Steer/Pitch), Sigmoid (Thrust/Brakes)
// Sub-0.5ms batch inference for decentralized autonomous craft fleet
// ============================================================================

struct NeuralUniforms {
  batchSize: u32,
  inputDim: u32,       // 48
  hiddenDim: u32,      // 128
  outputDim: u32,      // 5
};

@group(0) @binding(0) var<uniform> uniforms: NeuralUniforms;
@group(0) @binding(1) var<storage, read> observationInput: array<f32>;
@group(0) @binding(2) var<storage, read> weightsL1: array<f32>;        // 48 x 128
@group(0) @binding(3) var<storage, read> biasL1: array<f32>;           // 128
@group(0) @binding(4) var<storage, read> weightsL2: array<f32>;        // 128 x 128
@group(0) @binding(5) var<storage, read> biasL2: array<f32>;           // 128
@group(0) @binding(6) var<storage, read> weightsL3: array<f32>;        // 128 x 5
@group(0) @binding(7) var<storage, read> biasL3: array<f32>;           // 5
@group(0) @binding(8) var<storage, read_write> actionOutput: array<f32>; // batchSize x 5

// Fast polynomial GELU activation: 0.5 * x * (1.0 + tanh(sqrt(2.0/pi) * (x + 0.044715 * x^3)))
fn gelu(x: f32) -> f32 {
  let sqrt_2_over_pi = 0.7978845608;
  let c = 0.044715;
  let inner = sqrt_2_over_pi * (x + c * x * x * x);
  return 0.5 * x * (1.0 + tanh(inner));
}

fn sigmoid(x: f32) -> f32 {
  return 1.0 / (1.0 + exp(-clamp(x, -20.0, 20.0)));
}

// Thread-local scratch space for Layer 1 & 2 activations
var<workgroup> s_dense1: array<f32, 128>;
var<workgroup> s_res2: array<f32, 128>;

@compute @workgroup_size(128, 1, 1)
fn main(
  @builtin(workgroup_id) workgroup_id: vec3<u32>,
  @builtin(local_invocation_id) local_id: vec3<u32>
) {
  let craftIdx = workgroup_id.x;
  if (craftIdx >= uniforms.batchSize) {
    return;
  }

  let tid = local_id.x; // 0..127
  let inBase = craftIdx * uniforms.inputDim;
  let outBase = craftIdx * uniforms.outputDim;

  // --------------------------------------------------------------------------
  // LAYER 1: DENSE [48 -> 128] + GELU
  // Each thread calculates one hidden feature in [0..127]
  // --------------------------------------------------------------------------
  var sum1: f32 = biasL1[tid];
  for (var i: u32 = 0u; i < uniforms.inputDim; i = i + 1u) {
    let w_idx = i * uniforms.hiddenDim + tid;
    sum1 = sum1 + observationInput[inBase + i] * weightsL1[w_idx];
  }
  let d1 = gelu(sum1);
  s_dense1[tid] = d1;

  workgroupBarrier();

  // --------------------------------------------------------------------------
  // LAYER 2: DENSE [128 -> 128] + RESIDUAL ADDITION + GELU
  // Dense2 = (Dense1 * W2) + B2
  // Res2 = GELU(Dense1 + Dense2)
  // --------------------------------------------------------------------------
  var sum2: f32 = biasL2[tid];
  for (var j: u32 = 0u; j < uniforms.hiddenDim; j = j + 1u) {
    let w_idx = j * uniforms.hiddenDim + tid;
    sum2 = sum2 + s_dense1[j] * weightsL2[w_idx];
  }
  let r2 = gelu(s_dense1[tid] + sum2);
  s_res2[tid] = r2;

  workgroupBarrier();

  // --------------------------------------------------------------------------
  // LAYER 3: OUTPUT PROJECTION [128 -> 5]
  // First 5 threads compute the 5 actuation channels
  // --------------------------------------------------------------------------
  if (tid < uniforms.outputDim) {
    var outSum: f32 = biasL3[tid];
    for (var k: u32 = 0u; k < uniforms.hiddenDim; k = k + 1u) {
      let w_idx = k * uniforms.outputDim + tid;
      outSum = outSum + s_res2[k] * weightsL3[w_idx];
    }

    var activatedValue: f32 = 0.0;
    if (tid == 0u || tid == 1u) {
      // Actuation Channels 0 & 1: Lateral Steering & Pitch Trim -> Tanh [-1.0, 1.0]
      activatedValue = tanh(outSum);
    } else {
      // Actuation Channels 2, 3, 4: Thrust, Left Airbrake, Right Airbrake -> Sigmoid [0.0, 1.0]
      activatedValue = sigmoid(outSum);
    }

    actionOutput[outBase + tid] = activatedValue;
  }
}
