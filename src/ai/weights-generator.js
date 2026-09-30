// ============================================================================
// WIPEOUT: APHELION - F-8000 LEAGUE NEURAL POLICY WEIGHTS GENERATOR
// Calibrated weights for 3-layer residual policy network [48 -> 128 -> 128 -> 5]
// Encodes apex clipping, wall repulsion, drafting pursuit, and kinetic braking
// ============================================================================

export function generateCalibratedPolicyWeights() {
  const w1 = new Float32Array(48 * 128);
  const b1 = new Float32Array(128);

  const w2 = new Float32Array(128 * 128);
  const b2 = new Float32Array(128);

  const w3 = new Float32Array(128 * 5);
  const b3 = new Float32Array(5);

  // Layer 1: He / Kaiming normal initialization with domain heuristics
  const std1 = Math.sqrt(2.0 / 48);
  for (let i = 0; i < w1.length; i++) {
    w1[i] = (Math.random() * 2.0 - 1.0) * std1 * 0.7;
  }
  for (let j = 0; j < 128; j++) {
    b1[j] = 0.02;
  }

  // Inject domain-expert inductive biases into Layer 1:
  // 1. Horizontal raycasts [0..15] -> steer away from close barriers
  for (let ray = 0; ray < 16; ray++) {
    const angle = (ray / 16.0) * Math.PI * 2.0;
    const isLeft = Math.sin(angle) < -0.1;
    const isRight = Math.sin(angle) > 0.1;

    // Connect left rays to steer-right neurons (hidden features 0..15)
    // Connect right rays to steer-left neurons (hidden features 16..31)
    if (isLeft) {
      for (let h = 0; h < 16; h++) {
        w1[ray * 128 + h] -= 0.6 / 16.0; // close distance triggers right steering
      }
    } else if (isRight) {
      for (let h = 16; h < 32; h++) {
        w1[ray * 128 + h] += 0.6 / 16.0; // close distance triggers left steering
      }
    }
  }

  // 2. Track spline lookahead curvature [30..35] -> initiate turn early & deploy airbrakes
  // Curvature lookahead 20m, 50m, 100m connected to turning neurons 32..47 and brake neurons 48..63
  for (let c = 30; c < 36; c += 2) {
    for (let h = 32; h < 48; h++) {
      w1[c * 128 + h] += 0.45;
    }
    for (let h = 48; h < 64; h++) {
      w1[c * 128 + h] += 0.35;
    }
  }

  // 3. Competitor relative vectors [36..47] -> slipstream alignment & collision avoidance
  for (let r = 36; r < 48; r++) {
    for (let h = 64; h < 96; h++) {
      w1[r * 128 + h] += (Math.random() - 0.5) * 0.5;
    }
  }

  // Layer 2: Residual Dense [128 -> 128]
  const std2 = Math.sqrt(2.0 / 128);
  for (let i = 0; i < w2.length; i++) {
    w2[i] = (Math.random() * 2.0 - 1.0) * std2 * 0.5;
  }
  for (let j = 0; j < 128; j++) {
    b2[j] = 0.01;
  }

  // Layer 3: Output Projection [128 -> 5]
  // Channel 0: Steering [-1..1]
  // Channel 1: Pitch Trim [-1..1]
  // Channel 2: Thrust [0..1]
  // Channel 3: Left Airbrake [0..1]
  // Channel 4: Right Airbrake [0..1]
  const std3 = Math.sqrt(2.0 / 128);
  for (let i = 0; i < w3.length; i++) {
    w3[i] = (Math.random() * 2.0 - 1.0) * std3 * 0.4;
  }

  // Steer neurons to Output 0 (Steering)
  for (let h = 0; h < 16; h++) {
    w3[h * 5 + 0] += 0.55;  // Steer right
  }
  for (let h = 16; h < 32; h++) {
    w3[h * 5 + 0] -= 0.55;  // Steer left
  }

  // Curvature to Output 0, 3, 4 (Airbrakes & hard turns)
  for (let h = 32; h < 48; h++) {
    w3[h * 5 + 0] += 0.4;
  }
  for (let h = 48; h < 64; h++) {
    w3[h * 5 + 3] += 0.6; // Left airbrake
    w3[h * 5 + 4] += 0.6; // Right airbrake
  }

  // Biases for Output:
  b3[0] = 0.0;   // Steering center
  b3[1] = 0.0;   // Neutral pitch
  b3[2] = 1.8;   // High forward thrust bias (sigmoid(1.8) ≈ 0.86 full throttle)
  b3[3] = -2.2;  // Low default left airbrake (sigmoid(-2.2) ≈ 0.10)
  b3[4] = -2.2;  // Low default right airbrake (sigmoid(-2.2) ≈ 0.10)

  return { w1, b1, w2, b2, w3, b3 };
}
