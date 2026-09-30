import * as THREE from 'three';
import { OBS_DIM, MAX_CONSTANTS } from './types.js';

// ============================================================================
// WIPEOUT: APHELION - TELEMETRY INGESTION & ZERO-COPY TENSOR CONSTRUCTION
// Inlines all vector math to avoid GC pressure during 144Hz race loops
// ============================================================================

const { MAX_RAY_DIST, MAX_HEIGHT_DIST, MAX_VELOCITY, MAX_ANGULAR_VEL, MAX_RIVAL_DIST } = MAX_CONSTANTS;

// Reusable scratch objects to eliminate per-frame allocations
const _invQuat = new THREE.Quaternion();
const _localVel = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
const _relPos = new THREE.Vector3();
const _relVel = new THREE.Vector3();
const _probePos = new THREE.Vector3();

// 4 Hull Suspension probe offsets: FL, FR, RL, RR
const SUSPENSION_OFFSETS = [
  new THREE.Vector3(-1.2, -0.4, 2.0),
  new THREE.Vector3(1.2, -0.4, 2.0),
  new THREE.Vector3(-1.5, -0.4, -2.0),
  new THREE.Vector3(1.5, -0.4, -2.0)
];

export function extractCraftTelemetry(
  slot,
  inputBuffer,
  inputDim = OBS_DIM,
  craft,
  trackBuilder,
  rivals = []
) {
  const base = slot * inputDim;

  const craftPos = craft.pos || craft.position;
  const craftQuat = craft.quat || craft.quaternion;
  const craftVel = craft.vel || craft.linearVelocity || new THREE.Vector3(0, 0, craft.speedKmh ? craft.speedKmh / 3.6 : 300);
  const craftAngVel = craft.angVel || craft.angularVelocity || new THREE.Vector3(0, 0, 0);

  _invQuat.copy(craftQuat).invert();
  _fwd.set(0, 0, 1).applyQuaternion(craftQuat);
  _right.set(1, 0, 0).applyQuaternion(craftQuat);
  _up.set(0, 1, 0).applyQuaternion(craftQuat);

  const trackInfo = trackBuilder.getClosestTrackFrame
    ? trackBuilder.getClosestTrackFrame(craftPos)
    : { lateralOffset: craft.lateralOffset || 0, binormal: _right, normal: _up, tangent: _fwd, curvature: 0.001, torsion: 0.0 };

  const halfWidth = trackBuilder.trackWidth ? trackBuilder.trackWidth * 0.5 : 16.0;
  const lateralDist = trackInfo.lateralOffset || 0;

  // --------------------------------------------------------------------------
  // 1. Horizontal Proximity Probes (16 directions in local XZ plane)
  // --------------------------------------------------------------------------
  const probeAngles = 16;
  for (let i = 0; i < probeAngles; i++) {
    const angle = (i / probeAngles) * Math.PI * 2.0;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    _rayDir.copy(_right).multiplyScalar(cosA).addScaledVector(_fwd, sinA);

    // Calculate boundary distance to track walls
    const sideProj = _rayDir.dot(trackInfo.binormal || _right);
    let boundaryDist = MAX_RAY_DIST;
    if (Math.abs(sideProj) > 0.04) {
      const wallOffset = sideProj > 0 ? (halfWidth - lateralDist) : (halfWidth + lateralDist);
      boundaryDist = Math.max(0.5, Math.min(wallOffset / Math.abs(sideProj), MAX_RAY_DIST));
    }
    inputBuffer[base + i] = boundaryDist / MAX_RAY_DIST;
  }

  // --------------------------------------------------------------------------
  // 2. Hull Suspension Probes (4 corners: FL, FR, RL, RR)
  // --------------------------------------------------------------------------
  for (let i = 0; i < 4; i++) {
    _probePos.copy(SUSPENSION_OFFSETS[i]).applyQuaternion(craftQuat).add(craftPos);
    // Height above superconductor track ribbon (target is ~1.6m)
    const height = Math.max(0.2, Math.min(1.6 + (craftPos.y - (trackInfo.pos ? trackInfo.pos.y : craftPos.y)), MAX_HEIGHT_DIST));
    inputBuffer[base + 16 + i] = height / MAX_HEIGHT_DIST;
  }

  // --------------------------------------------------------------------------
  // 3. Local Kinematic States (Velocity & Angular Rates)
  // --------------------------------------------------------------------------
  _localVel.copy(craftVel).applyQuaternion(_invQuat);
  inputBuffer[base + 20] = Math.max(-1.0, Math.min(_localVel.x / MAX_VELOCITY, 1.0));
  inputBuffer[base + 21] = Math.max(-1.0, Math.min(_localVel.y / MAX_VELOCITY, 1.0));
  inputBuffer[base + 22] = Math.max(-1.0, Math.min(_localVel.z / MAX_VELOCITY, 1.0));

  inputBuffer[base + 23] = Math.max(-1.0, Math.min(craftAngVel.x / MAX_ANGULAR_VEL, 1.0));
  inputBuffer[base + 24] = Math.max(-1.0, Math.min(craftAngVel.y / MAX_ANGULAR_VEL, 1.0));
  inputBuffer[base + 25] = Math.max(-1.0, Math.min(craftAngVel.z / MAX_ANGULAR_VEL, 1.0));

  // --------------------------------------------------------------------------
  // 4. Track Spline Delta & Lookahead Curvature (t + 20m, t + 50m, t + 100m)
  // --------------------------------------------------------------------------
  let offset = base + 26;
  inputBuffer[offset++] = Math.max(-1.0, Math.min(lateralDist / halfWidth, 1.0)); // Lateral offset normalized

  // Bank angle relative to world up
  const bankAngle = trackInfo.binormal ? Math.atan2(trackInfo.binormal.y, trackInfo.binormal.x) : 0.0;
  inputBuffer[offset++] = Math.max(-1.0, Math.min(bankAngle / Math.PI, 1.0));

  // Grade (slope)
  const grade = trackInfo.tangent ? trackInfo.tangent.y : 0.0;
  inputBuffer[offset++] = Math.max(-1.0, Math.min(grade, 1.0));

  // Heading error vs track tangent
  const headingError = trackInfo.tangent ? (1.0 - _fwd.dot(trackInfo.tangent)) * (_fwd.dot(trackInfo.binormal) > 0 ? 1 : -1) : 0.0;
  inputBuffer[offset++] = Math.max(-1.0, Math.min(headingError, 1.0));

  // Ahead curvature & torsion samples at 20m, 50m, 100m
  const trackU = craft.u !== undefined ? craft.u : (trackInfo.u || 0.0);
  const trackSegments = trackBuilder.segments || 600;
  const currSeg = Math.floor(trackU * trackSegments);

  const lookaheadOffsets = [20, 50, 100];
  for (let i = 0; i < 3; i++) {
    const lookSeg = (currSeg + Math.floor(lookaheadOffsets[i] * 0.5)) % trackSegments;
    const lookSample = trackBuilder.samples ? trackBuilder.samples[lookSeg] : null;

    const curv = lookSample && lookSample.curvature ? lookSample.curvature * 100.0 : 0.1;
    const tors = lookSample && lookSample.torsion ? lookSample.torsion * 100.0 : 0.0;

    inputBuffer[offset++] = Math.max(-1.0, Math.min(curv, 1.0));
    inputBuffer[offset++] = Math.max(-1.0, Math.min(tors, 1.0));
  }

  // --------------------------------------------------------------------------
  // 5. Competitor Proximity Vectors (Nearest 2 rivals)
  // --------------------------------------------------------------------------
  // Sort rivals by distance to current craft
  const sortedRivals = [];
  for (let i = 0; i < rivals.length; i++) {
    const r = rivals[i];
    if (r === craft) continue;
    const rPos = r.pos || r.position;
    if (!rPos) continue;
    const d = craftPos.distanceTo(rPos);
    sortedRivals.push({ rival: r, dist: d });
  }
  sortedRivals.sort((a, b) => a.dist - b.dist);

  for (let i = 0; i < 2; i++) {
    if (i < sortedRivals.length) {
      const r = sortedRivals[i].rival;
      const rPos = r.pos || r.position;
      const rVel = r.vel || r.linearVelocity || new THREE.Vector3(0, 0, r.speedKmh ? r.speedKmh / 3.6 : 300);

      _relPos.copy(rPos).sub(craftPos).applyQuaternion(_invQuat);
      _relVel.copy(rVel).sub(craftVel).applyQuaternion(_invQuat);

      inputBuffer[offset++] = Math.max(-1.0, Math.min(_relPos.x / MAX_RIVAL_DIST, 1.0));
      inputBuffer[offset++] = Math.max(-1.0, Math.min(_relPos.y / MAX_RIVAL_DIST, 1.0));
      inputBuffer[offset++] = Math.max(-1.0, Math.min(_relPos.z / MAX_RIVAL_DIST, 1.0));

      inputBuffer[offset++] = Math.max(-1.0, Math.min(_relVel.x / MAX_VELOCITY, 1.0));
      inputBuffer[offset++] = Math.max(-1.0, Math.min(_relVel.y / MAX_VELOCITY, 1.0));
      inputBuffer[offset++] = Math.max(-1.0, Math.min(_relVel.z / MAX_VELOCITY, 1.0));
    } else {
      for (let j = 0; j < 6; j++) {
        inputBuffer[offset++] = 0.0;
      }
    }
  }
}
