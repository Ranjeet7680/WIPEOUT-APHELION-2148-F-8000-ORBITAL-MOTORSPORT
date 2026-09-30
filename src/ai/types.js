// ============================================================================
// WIPEOUT: APHELION - NEURAL TRAJECTORY SYSTEM TYPES & TENSOR SPECIFICATION
// 48-Dimensional Observation Space -> 5-Dimensional Actuation Channels
// ============================================================================

export const OBS_DIM = 48;
export const ACTION_DIM = 5;

// Observation Vector Tensor Layout
export const OBS_INDICES = {
  // [0:15] 16 Horizontal Proximity Raycasts in local XZ plane [0..1] (0m to 120m)
  RAYCAST_START: 0,
  RAYCAST_COUNT: 16,

  // [16:19] 4 Hull Suspension Height Probes (FL, FR, RL, RR) [0..1] (0m to 10m)
  HEIGHT_PROBES_START: 16,
  HEIGHT_PROBES_COUNT: 4,

  // [20:22] Local Linear Velocity [X, Y, Z] normalized to [-1..1] (+-400 m/s)
  LOCAL_LINEAR_VEL_START: 20,
  LOCAL_LINEAR_VEL_COUNT: 3,

  // [23:25] Local Angular Velocity [Pitch, Yaw, Roll] normalized to [-1..1] (+-4pi rad/s)
  LOCAL_ANGULAR_VEL_START: 23,
  LOCAL_ANGULAR_VEL_COUNT: 3,

  // [26:29] Track Spline Delta: [LateralOffset, BankAngle, Grade, HeadingErrorVsTrack]
  TRACK_SPLINE_DELTA_START: 26,
  TRACK_SPLINE_DELTA_COUNT: 4,

  // [30:35] Ahead Curvature Lookahead (t + 20m, t + 50m, t + 100m) -> 3x [Curvature, Torsion]
  AHEAD_CURVATURE_START: 30,
  AHEAD_CURVATURE_COUNT: 6,

  // [36:41] Rival 1 Relative Position [X, Y, Z] & Relative Velocity [X, Y, Z]
  RIVAL1_START: 36,
  RIVAL1_COUNT: 6,

  // [42:47] Rival 2 Relative Position [X, Y, Z] & Relative Velocity [X, Y, Z]
  RIVAL2_START: 42,
  RIVAL2_COUNT: 6,
};

// Continuous Action Vector Channels
export const ACTION_INDICES = {
  STEERING: 0,       // Lateral Steering / Inward Roll [-1.0, 1.0] (Tanh)
  PITCH_TRIM: 1,     // Longitudinal Pitch Trim [-1.0, 1.0] (Tanh)
  THROTTLE: 2,       // Ion Engine Thrust [ 0.0, 1.0] (Sigmoid)
  LEFT_AIRBRAKE: 3,  // Left Vector Airbrake [ 0.0, 1.0] (Sigmoid)
  RIGHT_AIRBRAKE: 4  // Right Vector Airbrake [ 0.0, 1.0] (Sigmoid)
};

export const MAX_CONSTANTS = {
  MAX_RAY_DIST: 120.0,
  MAX_HEIGHT_DIST: 10.0,
  MAX_VELOCITY: 400.0,
  MAX_ANGULAR_VEL: Math.PI * 4.0,
  MAX_RIVAL_DIST: 100.0
};
