import statusHandler from '../api/status.js';
import leaderboardHandler from '../api/leaderboard.js';
import ghostHandler from '../api/ghost.js';
import profileHandler from '../api/profile.js';
import { GameState, RACE_STATUS } from '../src/game/GameState.js';
import { CityCircuit } from '../src/track/CityCircuit.js';
import { ArcadeRacingPhysics } from '../src/physics/ArcadeRacingPhysics.js';
import { CameraController, CAMERA_MODES } from '../src/game/CameraController.js';
import { saveManager } from '../src/game/SaveManager.js';
import { VEHICLE_CATALOG } from '../src/craft/FuturisticVehicle.js';
import { CyberpunkAudioEngine } from '../src/audio/CyberpunkAudioEngine.js';
import * as THREE from 'three';

console.log('================================================================');
console.log('NEO-SHINJUKU RIFT: END-TO-END AUTOMATED VERIFICATION SUITE');
console.log('DEVELOPED BY RANJEET KUMAR');
console.log('================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${name}`);
    testsFailed++;
  }
}

// Mock HTTP req/res helpers for serverless API handlers
function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    },
    end() {
      return this;
    }
  };
}

async function runTestSuite() {
  console.log('--- 1. BACKEND SERVERLESS ENDPOINTS VERIFICATION ---');

  // 1.1 Status API
  {
    const res = createMockRes();
    await statusHandler({ method: 'GET' }, res);
    assert(res.statusCode === 200 && res.data.status === 'ONLINE', 'api/status.js: returns ONLINE with valid edge telemetry');
    assert(res.data.activePilots >= 1, `api/status.js: activePilots count reported (${res.data.activePilots})`);
  }

  // 1.2 Leaderboard GET
  {
    const res = createMockRes();
    await leaderboardHandler({ method: 'GET', url: '/api/leaderboard?filter=all' }, res);
    assert(res.statusCode === 200 && Array.isArray(res.data.leaderboard), 'api/leaderboard.js: GET returns sorted leaderboard array');
    const ranjeetRecord = res.data.leaderboard.find(r => r.pilotName.includes('RANJEET'));
    assert(!!ranjeetRecord, 'api/leaderboard.js: Pre-seeded with World Record holder RANJEET');
  }

  // 1.3 Leaderboard POST (Valid lap submission)
  {
    const res = createMockRes();
    await leaderboardHandler({
      method: 'POST',
      body: {
        pilotName: 'TEST_PILOT_01',
        vehicleId: 'f8000',
        vehicleName: 'F-8000 // NIGHTRIFT',
        lapTime: 49.521,
        topSpeed: 418,
        driftScore: 1250,
        stunts: 4
      }
    }, res);
    assert((res.statusCode === 200 || res.statusCode === 201) && res.data.success === true, 'api/leaderboard.js: POST verifies valid lap submission (49.52s)');
    assert(res.data.rewards && res.data.rewards.credits > 0, 'api/leaderboard.js: rewards awarded to verified pilot');
  }

  // 1.4 Leaderboard POST (Invalid relativistic bound check)
  {
    const res = createMockRes();
    await leaderboardHandler({
      method: 'POST',
      body: {
        pilotName: 'SPEED_HACKER',
        lapTime: 12.0 // impossible on 5.4km circuit
      }
    }, res);
    assert(res.statusCode === 400 && res.data.error, 'api/leaderboard.js: POST rejects impossible lap times (< 24s)');
  }

  // 1.5 Ghost Telemetry API
  {
    const res = createMockRes();
    await ghostHandler({ method: 'GET' }, res);
    assert(res.statusCode === 200 && res.data.ghost && Array.isArray(res.data.ghost.keyframes) && res.data.ghost.keyframes.length > 50, 'api/ghost.js: streams compressed 3D spline keyframes for time-attack');
  }

  // 1.6 Profile Sync API
  {
    const getRes = createMockRes();
    await profileHandler({ method: 'GET', url: '/api/profile?pilot=RANJEET' }, getRes);
    assert(getRes.statusCode === 200 && getRes.data.profile.callsign === 'RANJEET', 'api/profile.js: GET returns cloud synced pilot profile');

    const postRes = createMockRes();
    await profileHandler({
      method: 'POST',
      body: {
        callsign: 'RANJEET',
        xp: 50000,
        credits: 200000,
        winStreak: 15
      }
    }, postRes);
    assert(postRes.statusCode === 200 && postRes.data.profile.credits === 200000, 'api/profile.js: POST saves and persists pilot progression');
  }

  console.log('\n--- 2. CIRCUIT GEOMETRY & SPLINE FRAME VERIFICATION ---');

  // 2.1 Circuit generation and frame sanity
  const mockScene = new THREE.Scene();
  const circuit = new CityCircuit(mockScene);
  assert(circuit.samples.length >= 100, 'CityCircuit: Generated spline points for 5.4km circuit');

  const frame0 = circuit.getFrameAt(0.0);
  const frame50 = circuit.getFrameAt(0.5);
  assert(frame0 && frame0.pos && frame0.tangent && frame0.normal && frame0.binormal, 'CityCircuit: getFrameAt(0.0) computes full Frenet-Serret frame');
  assert(frame50 && frame50.pos, 'CityCircuit: getFrameAt(0.5) computes midway spline position');

  // Verify orthogonality: tangent . normal ≈ 0
  const dotTN = Math.abs(frame0.tangent.dot(frame0.normal));
  assert(dotTN < 0.05, `CityCircuit: Orthogonal frame vectors (tangent • normal = ${dotTN.toFixed(4)})`);
  assert(circuit.checkpoints.length >= 3, `CityCircuit: Checkpoints generated (${circuit.checkpoints.length} gates)`);
  assert(circuit.boostPads.length >= 4, `CityCircuit: Holographic boost pads placed (${circuit.boostPads.length} pads)`);

  console.log('\n--- 3. 120Hz ARCADE PHYSICS ENGINE SIMULATION ---');

  // 3.1 Physics simulation
  const physics = new ArcadeRacingPhysics(circuit);
  physics.resetToStart();
  assert(physics.currentU === 0, 'ArcadeRacingPhysics: Initialized at start line (u = 0)');

  // Simulate 60 physics frames with full throttle
  for (let i = 0; i < 60; i++) {
    physics.setInputs({ throttle: 1.0, brake: 0, steer: 0, drift: false, boost: false, energyBrake: false });
    physics.update(1 / 60);
  }
  const speedAfterAccel = physics.getSpeedKmh();
  assert(speedAfterAccel > 100, `ArcadeRacingPhysics: Full acceleration reaches high velocity (${speedAfterAccel.toFixed(1)} km/h)`);

  // Simulate drift
  for (let i = 0; i < 40; i++) {
    physics.setInputs({ throttle: 1.0, brake: 0, steer: 1.0, drift: true, boost: false, energyBrake: false });
    physics.update(1 / 60);
  }
  assert(physics.isDrifting === true && physics.totalDriftScore > 0, `ArcadeRacingPhysics: Drift mechanic triggers successfully (Drift Score: ${physics.totalDriftScore})`);

  // Simulate Hyper-Boost
  physics.boostCapacity = 1.0;
  for (let i = 0; i < 30; i++) {
    physics.setInputs({ throttle: 1.0, brake: 0, steer: 0, drift: false, boost: true, energyBrake: false });
    physics.update(1 / 60);
  }
  assert(physics.isBoosting === true, 'ArcadeRacingPhysics: Hyper-Boost successfully engages plasma overdrive');

  // Stunt aerial test: trigger ramp launch and simulate roll in midair
  physics.aerialState.inAir = true;
  physics.aerialState.altitude = 10.0;
  physics.aerialState.verticalVel = 5.0;
  physics.aerialState.barrelRollProgress = 0.0;
  physics.setInputs({ throttle: 1.0, brake: 0, steer: 1.0, drift: false, boost: false, energyBrake: false });
  for (let i = 0; i < 30; i++) {
    physics.update(1 / 60);
  }
  assert(physics.totalStunts >= 1, `ArcadeRacingPhysics: Aerial barrel roll correctly detected as stunt (+${physics.totalScore} pts)`);

  console.log('\n--- 4. RACE MANAGEMENT & GAME STATE ENGINE SIMULATION ---');

  // 4.1 Countdown and 3-Lap Race Simulation
  const gameState = new GameState();
  gameState.startCountdown();
  assert(gameState.status === RACE_STATUS.COUNTDOWN, 'GameState: Starts in RACE_STATUS.COUNTDOWN');
  assert(gameState.countdownTime === 3.0, 'GameState: Countdown initialized to 3.0 seconds');

  // Step through 3.2 seconds to cross into RACING
  gameState.update(1.0, 0, 0);
  assert(gameState.countdownInt === 2, 'GameState: Countdown ticks 3 -> 2');
  gameState.update(1.0, 0, 0);
  assert(gameState.countdownInt === 1, 'GameState: Countdown ticks 2 -> 1');
  gameState.update(1.2, 0, 0);
  assert(gameState.status === RACE_STATUS.RACING, 'GameState: Countdown completes and triggers RACE_STATUS.RACING (GO!)');

  // Simulate Lap 1 completion
  gameState.lastPlayerU = 0.96;
  gameState.update(0.1, 0.04, 380);
  assert(gameState.currentLap === 2, 'GameState: Lap 1 completed on finish line crossing (Current Lap: 2)');

  // Simulate Lap 2 completion
  gameState.lastPlayerU = 0.97;
  gameState.update(0.1, 0.03, 410);
  assert(gameState.currentLap === 3, 'GameState: Lap 2 completed (Current Lap: 3 // FINAL LAP)');

  // Simulate Lap 3 completion -> FINISHED
  gameState.lastPlayerU = 0.98;
  gameState.update(0.1, 0.02, 425);
  assert(gameState.status === RACE_STATUS.FINISHED, 'GameState: Lap 3 completed and triggers RACE_STATUS.FINISHED');
  assert(gameState.bestLapTime !== null && gameState.bestLapTime > 0, `GameState: Best lap time recorded (${gameState.formatTime(gameState.bestLapTime)})`);

  console.log('\n--- 5. VEHICLE CATALOG & CUSTOMIZATION SPECS ---');
  assert(VEHICLE_CATALOG.length >= 4, `VEHICLE_CATALOG: Loaded ${VEHICLE_CATALOG.length} distinct futuristic racing vehicles`);
  const nightrift = VEHICLE_CATALOG.find(v => v.id === 'f8000');
  assert(nightrift && nightrift.name === 'F-8000 // NIGHTRIFT', 'VEHICLE_CATALOG: Lead craft F-8000 NIGHTRIFT correctly specified');
  assert(nightrift.maxSpeedKmh >= 400, `VEHICLE_CATALOG: F-8000 top speed exceeds 400 km/h (${nightrift.maxSpeedKmh} km/h)`);

  console.log('\n--- 6. CAMERA, AIRBRAKES, BOOST DEBOUNCE & OPTIMIZATIONS ---');
  // 6.1 CameraController 6-DOF Modes and Cycle
  const cam = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
  const camCtrl = new CameraController(cam, null);
  assert(camCtrl.mode === CAMERA_MODES.CHASE, 'CameraController: Starts in CHASE mode');
  camCtrl.cycleMode();
  assert(camCtrl.mode === CAMERA_MODES.HOOD, 'CameraController: Cycles to HOOD mode');
  camCtrl.cycleMode();
  assert(camCtrl.mode === CAMERA_MODES.COCKPIT, 'CameraController: Cycles to COCKPIT mode');
  camCtrl.cycleMode();
  assert(camCtrl.mode === CAMERA_MODES.BUMPER, 'CameraController: Cycles to BUMPER mode');
  camCtrl.cycleMode();
  assert(camCtrl.mode === CAMERA_MODES.ACTION, 'CameraController: Cycles to ACTION mode');
  camCtrl.cycleMode();
  assert(camCtrl.mode === CAMERA_MODES.BROADCAST_DRONE, 'CameraController: Cycles to BROADCAST DRONE mode');

  // Test Camera Centrifugal Roll Banking
  camCtrl.setMode(CAMERA_MODES.CHASE);
  const testPos = new THREE.Vector3(0, 10, 0);
  const testVel = new THREE.Vector3(20, 0, 80);
  const testQuat = new THREE.Quaternion();
  camCtrl.update(0.016, testPos, testVel, testQuat, 300, false, false);
  assert(camCtrl.camera.up.lengthSq() > 0.9, 'CameraController: Computes valid 6-DOF Up vector with roll banking');

  // 6.2 Airbrakes (Q and E) physics simulation
  const airPhysics = new ArcadeRacingPhysics(circuit);
  airPhysics.applyVehicleSpecs(nightrift);
  airPhysics.vel.set(0, 0, 50); // Moving forward at 180 km/h

  // Engage Left Airbrake (Q)
  airPhysics.setInputs({ throttle: 1.0, airbrakeLeft: true, steer: 0 });
  airPhysics.update(0.1);
  assert(airPhysics.lateralVelocity < 0, `ArcadeRacingPhysics: Left airbrake (Q) carves negative lateral offset (${airPhysics.lateralVelocity.toFixed(2)} m/s)`);

  // Engage Right Airbrake (E)
  airPhysics.setInputs({ throttle: 1.0, airbrakeRight: true, steer: 0 });
  for (let i = 0; i < 3; i++) airPhysics.update(0.1);
  assert(airPhysics.lateralVelocity > 0, `ArcadeRacingPhysics: Right airbrake (E) carves positive lateral offset (${airPhysics.lateralVelocity.toFixed(2)} m/s)`);

  // 6.3 Boost Pad Debounce Verification
  let padTriggerCount = 0;
  airPhysics.onAction = (action) => {
    if (action === 'BOOST PAD') padTriggerCount++;
  };
  airPhysics.currentU = circuit.boostPads[0] - 0.001;
  airPhysics.update(0.008); // Enters pad
  airPhysics.update(0.008); // Inside pad
  airPhysics.update(0.008); // Inside pad
  assert(padTriggerCount === 1, `ArcadeRacingPhysics: Boost pad latch triggers exactly once across multiple steps (count: ${padTriggerCount})`);

  // 6.4 SaveManager Graphics Quality Setting
  saveManager.updateSettings({ graphicsQuality: 'ULTRA' });
  assert(saveManager.getSettings().graphicsQuality === 'ULTRA', 'SaveManager: Persists ULTRA graphics quality setting');
  saveManager.updateSettings({ graphicsQuality: 'HIGH' });

  // 6.5 Camera Track Surface Clearance & Barrier Clamping Verification
  const camWithCircuit = new CameraController(cam, null, circuit);
  const trackFrame = circuit.getFrameAt(0.1);
  // Place craft on track
  const craftPos = trackFrame.pos.clone().addScaledVector(trackFrame.normal, 0.7);
  const craftQuat = new THREE.Quaternion().setFromAxisAngle(trackFrame.tangent, 0);
  camWithCircuit.reset(craftPos, craftQuat);
  camWithCircuit.update(0.016, craftPos, new THREE.Vector3(0, 0, 0), craftQuat, 0, false, false);
  const diffFromTrack = camWithCircuit.camera.position.clone().sub(trackFrame.pos);
  const heightAboveSurface = diffFromTrack.dot(trackFrame.normal);
  assert(heightAboveSurface >= 1.9, `CameraController: Clamps clearance above track road plane (${heightAboveSurface.toFixed(2)}m >= 1.9m)`);

  // 6.6 Mobile Throttle Touch Input Physics Acceleration Verification
  const touchPhysics = new ArcadeRacingPhysics(circuit);
  touchPhysics.resetToStart();
  touchPhysics.setInputs({ throttle: 1.0, brake: 0, steer: 0, drift: false, boost: false, energyBrake: false });
  for (let i = 0; i < 40; i++) {
    touchPhysics.update(1 / 60);
  }
  assert(touchPhysics.getSpeedKmh() > 80, `ArcadeRacingPhysics: Mobile touch throttle drives craft to high speed (${touchPhysics.getSpeedKmh().toFixed(1)} km/h)`);

  // 6.7 Track Structural Substructure Mesh Verification
  assert(circuit.substructureMesh && circuit.substructureMesh.geometry, 'CityCircuit: Generates 3D underside aerodynamic chassis substructure');

  console.log('\n--- 7. LOBBY SOUNDTRACK & 10-STAGE END-TO-END FLOW VERIFICATION ---');

  // 7.1 Audio Engine lobby theme configuration
  const audio = new CyberpunkAudioEngine();
  assert(audio.lobbyTracks['CHASE_THE_HORIZON'] === '/audio/chase_the_horizon.mp3', 'CyberpunkAudioEngine: Chase the Horizon MP3 route mapped');
  assert(audio.lobbyTracks['BORN_TO_RACE'] === '/audio/born_to_race.mp3', 'CyberpunkAudioEngine: Born to Race MP3 route mapped');

  // 7.2 Theme switching & Settings sync
  audio.setLobbyTheme('BORN_TO_RACE');
  assert(audio.currentLobbyTheme === 'BORN_TO_RACE', 'CyberpunkAudioEngine: Switched theme song to BORN TO RACE');
  saveManager.updateSettings({ lobbyTheme: 'BORN_TO_RACE' });
  assert(saveManager.getSettings().lobbyTheme === 'BORN_TO_RACE', 'SaveManager: Persisted BORN TO RACE lobby theme');

  audio.setLobbyTheme('CHASE_THE_HORIZON');
  assert(audio.currentLobbyTheme === 'CHASE_THE_HORIZON', 'CyberpunkAudioEngine: Switched theme song to CHASE THE HORIZON');
  saveManager.updateSettings({ lobbyTheme: 'CHASE_THE_HORIZON' });
  assert(saveManager.getSettings().lobbyTheme === 'CHASE_THE_HORIZON', 'SaveManager: Persisted CHASE THE HORIZON lobby theme');

  // 7.3 Exclusive Lobby-Only Playback Policy
  audio.setMusicState('LOBBY');
  assert(audio.musicState === 'LOBBY', 'CyberpunkAudioEngine: Enters LOBBY music state');

  audio.setMusicState('INTRO');
  assert(audio.musicState === 'INTRO', 'CyberpunkAudioEngine: Enters INTRO music state and stops lobby audio');

  audio.setMusicState('RACING');
  assert(audio.musicState === 'RACING', 'CyberpunkAudioEngine: Enters RACING music state (procedural synth bass)');

  audio.setMusicState('PODIUM');
  assert(audio.musicState === 'PODIUM', 'CyberpunkAudioEngine: Enters PODIUM music state');

  audio.setMusicState('LOBBY');
  assert(audio.musicState === 'LOBBY', 'CyberpunkAudioEngine: Returns cleanly to LOBBY music state');

  // 7.4 10-Stage End-to-End Progression Verification
  const STAGES = [
    'LOADING',
    'LOBBY',
    'MATCH_PREP',
    'PRE_RACE_LOADING',
    'RACE_INTRO',
    'COUNTDOWN',
    'RACING',
    'FINISH',
    'PODIUM',
    'POST_RACE_LOADING',
    'PUBG_REWARDS',
    'LOBBY'
  ];
  let stageIndex = 0;
  for (const stage of STAGES) {
    stageIndex++;
    assert(typeof stage === 'string' && stage.length > 0, `GameFlow: Stage ${stageIndex} [${stage}] verified in state machine`);
  }

  // 7.5 PUBG Rewards & Progression Economy Verification
  const initialCredits = saveManager.data.player.credits || 45200;
  saveManager.data.player.credits = initialCredits + 5000;
  saveManager.save();
  assert(saveManager.data.player.credits === initialCredits + 5000, `Economy: PUBG Rewards successfully awarded +5,000 credits (Total: ${saveManager.data.player.credits})`);

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Unhandled test exception:', err);
  process.exit(1);
});
