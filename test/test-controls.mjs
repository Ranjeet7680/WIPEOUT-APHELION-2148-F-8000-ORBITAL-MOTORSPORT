import { ArcadeRacingPhysics } from '../src/physics/ArcadeRacingPhysics.js';
import { CityCircuit } from '../src/track/CityCircuit.js';
import * as THREE from 'three';

console.log('--- TESTING VEHICLE CONTROLS & MOVEMENT ENGINE ---');

// 1. Mock Circuit & Physics
const scene = new THREE.Scene();
const circuit = new CityCircuit(scene);
const physics = new ArcadeRacingPhysics(circuit, null);

// Initial state
assert(physics.currentU === 0, 'Initial U must be 0');
assert(physics.getSpeedKmh() === 0, 'Initial speed must be 0');
assert(Math.abs(physics.quat.length() - 1.0) < 1e-4, 'Initial quaternion must be normalized');

// 2. Test W / Accelerate from Standstill
console.log('Testing Acceleration with W (Throttle = 1.0)...');
physics.setInputs({ throttle: 1.0, brake: 0.0, steer: 0.0, drift: false, boost: false });
for (let i = 0; i < 30; i++) {
  physics.update(0.016);
}
const speedAfterW = physics.getSpeedKmh();
console.log(`Speed after 0.5s throttle: ${speedAfterW.toFixed(1)} km/h`);
assert(speedAfterW > 40.0, `Vehicle must accelerate forward under throttle, got ${speedAfterW} km/h`);
assert(physics.currentU > 0, `Track progression currentU must advance forward, got ${physics.currentU}`);
assert(Math.abs(physics.quat.length() - 1.0) < 1e-4, 'Quaternion must remain normalized during acceleration');

// 3. Test S / Brake and Smooth Reverse
console.log('Testing Braking and Reverse with S...');
physics.setInputs({ throttle: 0.0, brake: 1.0, steer: 0.0, drift: false, boost: false });
for (let i = 0; i < 60; i++) {
  physics.update(0.016);
}
const speedAfterBrake = physics.getSpeedKmh();
console.log(`Speed after braking: ${speedAfterBrake.toFixed(1)} km/h`);

// Continue holding S at low speed to engage reverse
for (let i = 0; i < 60; i++) {
  physics.update(0.016);
}
const signedSpeedAfterReverse = physics.getSignedSpeedKmh();
console.log(`Signed Speed after holding S: ${signedSpeedAfterReverse.toFixed(1)} km/h`);
assert(signedSpeedAfterReverse < 0, 'Holding S at standstill must engage reverse');

// 4. Test Steer A / Left and D / Right
console.log('Testing Lateral Steering A & D...');
physics.setInputs({ throttle: 1.0, brake: 0.0, steer: -1.0, drift: false, boost: false });
for (let i = 0; i < 30; i++) {
  physics.update(0.016);
}
const lateralLeft = physics.lateralOffset;
console.log(`Lateral offset steering left: ${lateralLeft.toFixed(2)}m`);
assert(lateralLeft !== 0, 'Steering left must deflect lateral offset');

physics.setInputs({ throttle: 1.0, brake: 0.0, steer: 1.0, drift: false, boost: false });
for (let i = 0; i < 60; i++) {
  physics.update(0.016);
}
const lateralRight = physics.lateralOffset;
console.log(`Lateral offset steering right: ${lateralRight.toFixed(2)}m`);
assert(lateralRight > lateralLeft, 'Steering right must move craft to the right relative to left');

// 5. Test Track Reset (R key action)
console.log('Testing Instant Re-Center (R key action)...');
physics.resetToTrackCenter();
assert(physics.lateralOffset === 0, 'Lateral offset must reset to 0');
assert(physics.getSpeedKmh() >= 80, 'Re-center must launch craft forward smoothly');
assert(Math.abs(physics.quat.length() - 1.0) < 1e-4, 'Quaternion must be normalized after re-center');

console.log('\n=============================================');
console.log('ALL MOVEMENT & CONTROLS CHECKS PASSED 100%!');
console.log('=============================================\n');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}
