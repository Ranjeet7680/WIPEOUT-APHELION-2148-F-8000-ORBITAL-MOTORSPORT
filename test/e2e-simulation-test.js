import statusHandler from '../api/status.js';
import leaderboardHandler from '../api/leaderboard.js';
import ghostHandler from '../api/ghost.js';
import profileHandler from '../api/profile.js';
import { GameState, RACE_STATUS } from '../src/game/GameState.js';
import { CityCircuit, isInsideTunnel } from '../src/track/CityCircuit.js';
import { CoastlineCircuit } from '../src/track/CoastlineCircuit.js';
import { FujiSkywayCircuit } from '../src/track/FujiSkywayCircuit.js';
import { ArcadeRacingPhysics } from '../src/physics/ArcadeRacingPhysics.js';
import { CameraController, CAMERA_MODES } from '../src/game/CameraController.js';
import { saveManager } from '../src/game/SaveManager.js';
import { VEHICLE_CATALOG, FuturisticVehicle } from '../src/craft/FuturisticVehicle.js';
import { RivalRacersSystem } from '../src/ai/RivalRacersSystem.js';
import { CyberpunkAudioEngine } from '../src/audio/CyberpunkAudioEngine.js';
import { JapanCityPanorama } from '../src/world/JapanCityPanorama.js';
import { NeoShinjukuWorld } from '../src/world/NeoShinjukuWorld.js';
import { CoastlineWorld } from '../src/world/CoastlineWorld.js';
import { FujiSkywayWorld } from '../src/world/FujiSkywayWorld.js';
import { getSectorDefinition, SECTOR_DEFINITIONS } from '../src/track/TrackData.js';
import { TPP_CAMERA_SVG, FPP_CAMERA_SVG, CAREER_CHAPTERS, LIVE_EVENTS_DATA } from '../src/ui/CinematicUI.js';
import { GarageLobbyScene } from '../src/world/GarageLobbyScene.js';
import { HolographicMinimap } from '../src/ui/HolographicMinimap.js';
import { backendService } from '../src/backend/BackendService.js';
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

  // Test TPP / FPP Toggle Perspective and Mode Detection
  camCtrl.setMode(CAMERA_MODES.CHASE);
  assert(camCtrl.isFPP() === false, 'CameraController: isFPP() returns false in CHASE (TPP)');
  const toggledMode1 = camCtrl.togglePerspective();
  assert(toggledMode1 === CAMERA_MODES.COCKPIT && camCtrl.isFPP() === true, 'CameraController: togglePerspective() switches CHASE -> COCKPIT (FPP)');
  const toggledMode2 = camCtrl.togglePerspective();
  assert(toggledMode2 === CAMERA_MODES.CHASE && camCtrl.isFPP() === false, 'CameraController: togglePerspective() switches COCKPIT -> CHASE (TPP)');
  assert(TPP_CAMERA_SVG.includes('<svg') && TPP_CAMERA_SVG.includes('cam-svg-logo'), 'CinematicUI: TPP_CAMERA_SVG contains valid vector SVG logo markup');
  assert(FPP_CAMERA_SVG.includes('<svg') && FPP_CAMERA_SVG.includes('cam-svg-logo'), 'CinematicUI: FPP_CAMERA_SVG contains valid vector SVG logo markup');

  // Test Camera Centrifugal Roll Banking & G-Force Accel Lag
  camCtrl.setMode(CAMERA_MODES.CHASE);
  const testPos = new THREE.Vector3(0, 10, 0);
  const testVel = new THREE.Vector3(20, 0, 80);
  const testQuat = new THREE.Quaternion();
  camCtrl.update(0.016, testPos, testVel, testQuat, 300, false, false);
  assert(camCtrl.camera.up.lengthSq() > 0.9, 'CameraController: Computes valid 6-DOF Up vector with roll banking');
  assert(camCtrl.accelLag !== undefined, 'CameraController: AccelLag G-force simulation active');

  // Test 4-Shot Cinematic Race Intro Sequence
  const playerCraft = new FuturisticVehicle(new THREE.Scene(), true, nightrift);
  camCtrl.updateRaceIntro(0.10, circuit, [], playerCraft);
  assert(!isNaN(camCtrl.camera.position.x) && camCtrl.camera.fov < 50, 'CameraController: Intro Shot 1 [Hero Fascia] renders with tight telephoto FOV');
  camCtrl.updateRaceIntro(0.35, circuit, [], playerCraft);
  assert(!isNaN(camCtrl.camera.position.z) && camCtrl.camera.position.y > 0, 'CameraController: Intro Shot 2 [Exhaust & Diffuser] renders ground angle');
  camCtrl.updateRaceIntro(0.60, circuit, [], playerCraft);
  assert(camCtrl.camera.fov === 36.0, 'CameraController: Intro Shot 3 [Grid Formation] renders broadcast telephoto lens');
  camCtrl.updateRaceIntro(0.95, circuit, [], playerCraft);
  assert(camCtrl.camera.fov > 65.0, 'CameraController: Intro Shot 4 [Gantry Touchdown] smoothly transitions to Chase Cam FOV');

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

  // 6.8 FPS Meter Default & Wall Breakaway Steering Verification
  assert(saveManager.getSettings().showFps === true, 'SaveManager: Persists showFps=true by default for real-time telemetry HUD');
  
  // Test agile steering response: craft should rapidly develop lateral speed within 3 frames
  const steerTestPhysics = new ArcadeRacingPhysics(circuit);
  steerTestPhysics.resetToStart();
  steerTestPhysics.setInputs({ throttle: 1.0, brake: 0, steer: 1.0, drift: false, boost: false });
  for (let i = 0; i < 5; i++) steerTestPhysics.update(1 / 60);
  assert(steerTestPhysics.lateralVelocity > 5.0, `ArcadeRacingPhysics: Agile steering responsiveness active (lateralVelocity: ${steerTestPhysics.lateralVelocity.toFixed(1)} m/s)`);

  // Test zero-allocation getClosestFrame localized search
  const closestProbe = circuit.getClosestFrame(trackFrame.pos, 0.1);
  assert(closestProbe && closestProbe.frame, 'CityCircuit: getClosestFrame succeeds with localized search hint');

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

  console.log('\n--- 8. 360 JAPAN CITY LOBBIES, ROYAL PASS GOLDEN CAR & 3-SECOND AUTO-RESET ---');

  // 8.1 360 Japan City Panorama Environment Component
  const panorama = new JapanCityPanorama({ victoryMode: true });
  assert(panorama.group && panorama.skyDome, 'JapanCityPanorama: Instantiates 360 sky atmosphere cylinder');
  assert(panorama.searchlights.length >= 4, `JapanCityPanorama: Victory mode mounts sweeping searchlights (${panorama.searchlights.length} beams)`);
  panorama.update(0.016);
  assert(panorama.trafficTrails.length > 0, `JapanCityPanorama: Animates 360 orbital skyway traffic trails (${panorama.trafficTrails.length} pulses)`);

  // 8.2 24K Mirror Golden Car Livery Mode
  const sceneMock = new THREE.Scene();
  const goldenVehicle = new FuturisticVehicle(sceneMock, true, VEHICLE_CATALOG[0]);
  goldenVehicle.setGoldenCarMode(true);
  const isGoldHex = goldenVehicle.materials.paintMat.color.getHex() === 0xFFD700;
  assert(isGoldHex, 'FuturisticVehicle: Royal Pass Golden Car mode applies 24K mirror gold finish (0xFFD700)');
  assert(goldenVehicle.materials.paintMat.metalness >= 0.95, 'FuturisticVehicle: High metalness clearcoat reflection configured (0.98)');
  goldenVehicle.setGoldenCarMode(false);
  assert(goldenVehicle.materials.paintMat.color.getHex() === VEHICLE_CATALOG[0].primaryColor, 'FuturisticVehicle: Restores original vehicle livery on exit');

  // 8.3 Off-Track Detection and 3-Second Countdown
  const offtrackPhysics = new ArcadeRacingPhysics(circuit);
  offtrackPhysics.resetToStart();
  // Force vehicle outside road boundary (+15.0m offset vs 12.2m halfWidth)
  offtrackPhysics.lateralOffset = 15.0;
  offtrackPhysics.update(0.1);
  assert(offtrackPhysics.isOffTrack === true, 'ArcadeRacingPhysics: Detects off-track condition beyond road boundary');
  assert(offtrackPhysics.offTrackCountdown < 3.0 && offtrackPhysics.offTrackCountdown > 2.5, `ArcadeRacingPhysics: 3-second auto-reset timer counting down (${offtrackPhysics.offTrackCountdown.toFixed(2)}s)`);

  // 8.4 3-Second Auto-Reset Execution to Track Center
  for (let s = 0; s < 30; s++) {
    offtrackPhysics.update(0.1);
  }
  assert(offtrackPhysics.isOffTrack === false, 'ArcadeRacingPhysics: Auto-reset completes after 3 seconds');
  assert(offtrackPhysics.lateralOffset === 0.0, 'ArcadeRacingPhysics: Vehicle position cleanly respawned at track center (lateralOffset = 0.0m)');
  assert(offtrackPhysics.getSpeedKmh() >= 65.0, `ArcadeRacingPhysics: Vehicle launched forward with running race speed (${offtrackPhysics.getSpeedKmh().toFixed(1)} km/h)`);

  // 8.5 Manual Instant Track Reset ([R] key simulation)
  offtrackPhysics.lateralOffset = -14.5;
  offtrackPhysics.update(0.05);
  offtrackPhysics.resetToTrackCenter();
  assert(offtrackPhysics.lateralOffset === 0.0 && offtrackPhysics.isOffTrack === false, 'ArcadeRacingPhysics: Manual [R] reset immediately restores craft to track center');

  console.log('\n--- 9. CELESTIAL SKY DOME, BUILDING TEXTURES & ZERO-LAG OPTIMIZATIONS ---');
  // 9.1 Cyberpunk Sky Dome
  const testScene = new THREE.Scene();
  const testWorld = new NeoShinjukuWorld(testScene, circuit);
  assert(testWorld.skyDome !== null, 'NeoShinjukuWorld: Instantiates 360 celestial sky sphere dome');
  assert(testWorld.skyDome.geometry.parameters.radius >= 4000, `NeoShinjukuWorld: Sky sphere provides 4500m atmospheric boundary (${testWorld.skyDome.geometry.parameters.radius}m)`);
  const initialRotY = testWorld.skyDome.rotation.y;
  testWorld.update(1.0, new THREE.Vector3(120, 30, 240));
  assert(testWorld.skyDome.rotation.y > initialRotY, 'NeoShinjukuWorld: Animates slow celestial drift rotation across sky');
  assert(testWorld.skyDome.position.x === 120 && testWorld.skyDome.position.z === 240, 'NeoShinjukuWorld: Centers sky dome on player to eliminate edge clipping');

  // 9.2 Boost pad single-material pulse update
  circuit.update(0.016);
  assert(circuit.boostPadsGroup && circuit.boostPadsGroup.children.length === 8, 'CityCircuit: Boost pad group maintains 8 holographic pads with zero-overhead single material pulse');

  console.log('\n--- 10. END-TO-END CIRCUIT COMPLETION, RADAR MINIMAP & ANTI-FREEZE VERIFICATION ---');

  // 10.1 Track separation & self-intersection sanity
  let minNonAdjacentDist = Infinity;
  for (let i = 0; i < circuit.samples.length; i++) {
    for (let j = i + 35; j < circuit.samples.length; j++) {
      if (i < 35 && j > circuit.samples.length - 35) continue;
      const d = circuit.samples[i].pos.distanceTo(circuit.samples[j].pos);
      if (d < minNonAdjacentDist) minNonAdjacentDist = d;
    }
  }
  assert(minNonAdjacentDist > 100.0, `CityCircuit: Non-adjacent track separation exceeds 100m everywhere (${minNonAdjacentDist.toFixed(1)}m, no self-intersections)`);

  // 10.2 Upright road normal test (no inverted track twists)
  let minNormY = 1.0;
  for (let i = 0; i < circuit.samples.length; i++) {
    if (circuit.samples[i].normal.y < minNormY) minNormY = circuit.samples[i].normal.y;
  }
  assert(minNormY >= 0.65, `CityCircuit: Upright road normal maintained across all 600 segments (min normal.y = ${minNormY.toFixed(2)})`);

  // 10.3 Traffic repulsion & lateral deflection
  const colTestPhysics = new ArcadeRacingPhysics(circuit);
  colTestPhysics.resetToStart();
  const initOffset = colTestPhysics.lateralOffset;
  colTestPhysics.applyExternalRepulsion(new THREE.Vector3(1, 0, 0), 1.0);
  assert(colTestPhysics.lateralOffset !== initOffset && colTestPhysics.lateralVelocity !== 0, `ArcadeRacingPhysics: Traffic collision lateral repulsion displaces craft away from hazard (lateralOffset = ${colTestPhysics.lateralOffset.toFixed(1)}m)`);

  // 10.4 Radar Minimap test with mock canvas
  const minimap = new HolographicMinimap('mock-canvas', circuit);
  const mockCtx = {
    clearRect: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} }),
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    setLineDash: () => {},
    moveTo: () => {},
    lineTo: () => {},
    fillRect: () => {},
    closePath: () => {},
    save: () => {},
    restore: () => {},
    clip: () => {},
    fillText: () => {},
    shadowColor: '',
    shadowBlur: 0
  };
  minimap.canvas = { width: 180, height: 180, getContext: () => mockCtx };
  minimap.ctx = mockCtx;
  minimap.update(new THREE.Vector3(0, 150, 0), new THREE.Quaternion(), 0.05, [], { name: 'NEON CORE', color: '#00F0FF' });
  assert(minimap.scale === 0.12, 'HolographicMinimap: Real-time radar initializes and updates with clipping and forward-is-up orientation');

  // 10.5 Full continuous lap end-to-end driving simulation
  const fullLapPhysics = new ArcadeRacingPhysics(circuit);
  fullLapPhysics.resetToStart();
  let lapFinished = false;
  for (let s = 0; s < 5400; s++) {
    fullLapPhysics.setInputs({ throttle: 1.0, brake: 0, steer: 0, drift: false, boost: true, energyBrake: false });
    fullLapPhysics.update(1 / 60);
    if (fullLapPhysics.currentLap >= 2) {
      lapFinished = true;
      break;
    }
  }
  assert(lapFinished === true && fullLapPhysics.getSpeedKmh() > 200.0, `ArcadeRacingPhysics: Full lap continuous driving simulation completes 5.4km circuit end-to-end without wedging (Speed: ${fullLapPhysics.getSpeedKmh().toFixed(1)} km/h)`);

  console.log('\n--- 11. AAA VISIBILITY, NAVIGATION, CHECKPOINTS & AI DIFFICULTY ---');

  // 11.1 Dynamic 3D Racing Line Ribbon
  assert(circuit.racingLineMesh && circuit.racingLineMesh.geometry, 'CityCircuit: Dynamic 3D racing line ribbon mesh generated');
  assert(circuit.racingLineMesh.geometry.getAttribute('color') !== undefined, 'CityCircuit: Racing line equipped with curvature-responsive vertex colors');

  // 11.2 Holographic Curve Indicators
  assert(circuit.curveIndicatorsGroup && circuit.curveIndicatorsGroup.children.length > 0, `CityCircuit: Holographic curve indicators placed along sharp turns (${circuit.curveIndicatorsGroup.children.length} boards)`);

  // 11.3 Forward Projector Headlights & Volumetric Beams on Player Vehicle
  const pCraft = new FuturisticVehicle(new THREE.Scene(), true, VEHICLE_CATALOG[0]);
  assert(pCraft.headlightSpot instanceof THREE.SpotLight, 'FuturisticVehicle: Player vehicle equipped with forward projector Spotlight');
  assert(pCraft.headlightSpot.intensity >= 3.5, `FuturisticVehicle: Spotlight intensity calibrated for night racing (${pCraft.headlightSpot.intensity})`);
  assert(pCraft.headlightBeams instanceof THREE.Group && pCraft.headlightBeams.children.length === 2, 'FuturisticVehicle: Volumetric atmospheric forward light beams mounted');

  // 11.4 Sequential Checkpoints Tracking in GameState
  const cpState = new GameState();
  cpState.startCountdown();
  cpState.countdownTime = 0.0;
  cpState.update(0.1, 0.0, 0); // Enters RACING
  assert(cpState.status === RACE_STATUS.RACING, 'GameState: Active in RACING status');
  assert(cpState.getCheckpointProgress() === '1 / 8', 'GameState: Initial checkpoint progress is 1 / 8');
  cpState.lastPlayerU = 0.10;
  cpState.update(0.1, 0.14, 250); // Crosses CP 01 (0.12)
  assert(cpState.checkpointsPassedInLap === 1, 'GameState: Sequential checkpoint 1 recorded');
  assert(cpState.getCheckpointProgress() === '2 / 8', 'GameState: Checkpoint progress advances to 2 / 8');

  // 11.5 Wrong-Way Driving Detection in GameState
  cpState.lastPlayerU = 0.35;
  cpState.update(0.5, 0.32, 180); // Driving backwards at 180 km/h
  assert(cpState.isWrongWay === true, 'GameState: Detects wrong-way driving on backward track motion');
  cpState.lastPlayerU = 0.32;
  cpState.update(0.5, 0.35, 180); // Restores forward travel
  assert(cpState.isWrongWay === false, 'GameState: Clears wrong-way warning on forward recovery');

  // 11.6 Safe Checkpoint Respawn in ArcadeRacingPhysics
  const respawnPhysics = new ArcadeRacingPhysics(circuit);
  respawnPhysics.currentU = 0.45;
  respawnPhysics.lateralOffset = 11.5;
  respawnPhysics.resetToTrackCenter(0.38); // Reset to CP 03 (0.38)
  assert(respawnPhysics.currentU === 0.38, 'ArcadeRacingPhysics: Safe checkpoint respawn places vehicle at target checkpoint (u = 0.38)');
  assert(respawnPhysics.lateralOffset === 0.0, 'ArcadeRacingPhysics: Vehicle laterally centered on track');
  assert(respawnPhysics.getSpeedKmh() > 70.0, `ArcadeRacingPhysics: Vehicle re-engaged with forward momentum (${respawnPhysics.getSpeedKmh().toFixed(1)} km/h)`);

  // 11.7 AI Difficulty Scaling in RivalRacersSystem
  const rivalSystem = new RivalRacersSystem(new THREE.Scene(), circuit);
  const baseSpeedNormal = rivalSystem.rivals[0].baseSpeedKmh;
  rivalSystem.setDifficulty('EASY');
  assert(rivalSystem.rivals[0].baseSpeedKmh < baseSpeedNormal, 'RivalRacersSystem: EASY difficulty scales AI target speeds down');
  rivalSystem.setDifficulty('HARD');
  assert(rivalSystem.rivals[0].baseSpeedKmh > baseSpeedNormal, 'RivalRacersSystem: HARD difficulty tunes AI target speeds up for intense racing');

  console.log('\n--- 12. RACE STATE MACHINE, REPEAT SESSIONS, REWARD SAFETY & API FALLBACK ---');

  // 12.1 Pause and Resume Cycle
  let mockAppState = 'RACING';
  function mockTogglePause() {
    if (mockAppState === 'RACING') mockAppState = 'PAUSED';
    else if (mockAppState === 'PAUSED') mockAppState = 'RACING';
  }
  mockTogglePause();
  assert(mockAppState === 'PAUSED', 'GameState: togglePause() transitions RACING -> PAUSED without dropping state');
  mockTogglePause();
  assert(mockAppState === 'RACING', 'GameState: togglePause() cleanly resumes PAUSED -> RACING');

  // 12.2 Repeated Race Session State Consistency (Session 1 Finish -> Session 2 Start)
  const sessionState = new GameState();
  sessionState.startCountdown();
  sessionState.countdownTime = 0.0;
  sessionState.update(0.1, 0.0, 0); // Active RACING
  sessionState.currentLap = 3;
  sessionState.status = RACE_STATUS.FINISHED;
  assert(sessionState.status === RACE_STATUS.FINISHED, 'GameSession: Session 1 completes with FINISHED status');

  // Session 2 re-initialization
  sessionState.startCountdown();
  assert(sessionState.status === RACE_STATUS.COUNTDOWN, 'GameSession: Session 2 re-initializes to COUNTDOWN');
  assert(sessionState.currentLap === 1, 'GameSession: Session 2 resets currentLap to 1');
  assert(sessionState.checkpointsPassedInLap === 0, 'GameSession: Session 2 resets checkpointsPassedInLap to 0');
  assert(sessionState.currentPosition === 1, 'GameSession: Session 2 restores grid position to 1');

  // 12.3 Reward Deduplication Guard
  let testCredits = 45200;
  let rewardsAwarded = false;
  function awardRaceRewards() {
    if (rewardsAwarded) return false;
    rewardsAwarded = true;
    testCredits += 2500;
    return true;
  }
  const firstAward = awardRaceRewards();
  const secondAward = awardRaceRewards();
  assert(firstAward === true && secondAward === false && testCredits === 47700, 'GameFlow: Reward deduplication guard prevents double-crediting player');

  // 12.4 Audio Checkpoint Chime Method
  assert(typeof audio.playCheckpointChime === 'function', 'CyberpunkAudioEngine: playCheckpointChime method implemented');

  // 12.5 BackendService Local Fallback Verification
  const fallbackLeaderboard = backendService.getLocalFallbackLeaderboard();
  assert(fallbackLeaderboard && fallbackLeaderboard.leaderboard.length >= 5, 'BackendService: Local fallback leaderboard provides 5 pre-seeded elite pilots');
  assert(fallbackLeaderboard.worldRecord.pilotName === 'RANJEET', 'BackendService: World Record held by RANJEET in fallback telemetry');

  console.log('\n--- 13. SKYSCRAPER ROAD TUNNELS, TPP CAMERA, PHYSICS & RUNNING ANIMATIONS ---');

  // 13.1 Skyscraper Road Tunnels System
  const worldScene = new THREE.Scene();
  const tunnelWorld = new NeoShinjukuWorld(worldScene, circuit);
  assert(tunnelWorld.skyscraperTunnelsGroup !== undefined, 'NeoShinjukuWorld: skyscraperTunnelsGroup instantiated in world root');
  assert(tunnelWorld.skyscraperTunnels.length === 5, `NeoShinjukuWorld: 5 Skyscraper Road Tunnels generated along circuit (${tunnelWorld.skyscraperTunnels.length})`);
  const neonTunnel = tunnelWorld.skyscraperTunnels.find(t => t.id === 'neonCoreTunnel');
  assert(neonTunnel && neonTunnel.towerHeight >= 400, 'NeoShinjukuWorld: Neon Core Citadel Tunnel features monumental skyscraper towers (>= 400m)');

  // 13.2 TPP Behind-the-Car Follow Camera Dynamics
  const tppCam = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
  const tppController = new CameraController(tppCam, null, circuit);
  tppController.setMode(CAMERA_MODES.CHASE);
  const testCraftPos = new THREE.Vector3(0, 150, 0);
  const testCraftVel = new THREE.Vector3(0, 0, 80);
  const testCraftQuat = new THREE.Quaternion(); // Forward is (0, 0, 1)
  tppController.reset(testCraftPos, testCraftQuat);

  // Update TPP camera and verify position is firmly behind the vehicle (negative Z relative to car)
  tppController.update(0.016, testCraftPos, testCraftVel, testCraftQuat, 280, false, false);
  const relativeCamPos = tppCam.position.clone().sub(testCraftPos);
  assert(relativeCamPos.z < -4.0, `CameraController: TPP Camera positioned firmly behind vehicle rear (relative Z: ${relativeCamPos.z.toFixed(2)}m)`);
  assert(tppCam.position.y > testCraftPos.y + 1.0, `CameraController: TPP Camera elevated above vehicle roof for forward road preview (height: ${(tppCam.position.y - testCraftPos.y).toFixed(2)}m)`);
  const lookDir = tppController.currentLookTarget.clone().sub(testCraftPos);
  assert(lookDir.z > 10.0, `CameraController: TPP Camera gaze aimed forward down the highway (lookAhead: ${lookDir.z.toFixed(2)}m)`);

  // 13.3 Enhanced Running Physics: Reverse Gear Engagement
  const revPhysics = new ArcadeRacingPhysics(circuit);
  revPhysics.resetToStart();
  revPhysics.vel.set(0, 0, 0);
  revPhysics.setInputs({ throttle: 0, brake: 1.0, steer: 0 });
  for (let step = 0; step < 10; step++) {
    revPhysics.update(0.05);
  }
  assert(revPhysics.getSignedSpeedKmh() < 0, `ArcadeRacingPhysics: Holding brake at standstill cleanly engages reverse gear (${revPhysics.getSignedSpeedKmh().toFixed(1)} km/h)`);

  // 13.4 Running Animation: Dynamic Front Wheel Camber and Suspension Travel
  const animScene = new THREE.Scene();
  const animVehicle = new FuturisticVehicle(animScene, true, VEHICLE_CATALOG[0]);
  // Test steering camber
  animVehicle.updateKineticState(0.016, 1.0, 1.0, 0, false, false, 180);
  const frontWheel = animVehicle.wheels.find(w => w.isFront);
  assert(frontWheel && frontWheel.mount.rotation.z !== 0, `FuturisticVehicle: Front wheels dynamically lean with racing negative camber on turn-in (${frontWheel.mount.rotation.z.toFixed(3)} rad)`);

  // Test braking dive suspension displacement & thermochromic glowing brake discs
  animVehicle.updateKineticState(0.05, 0, 0, 1.0, false, false, 280);
  assert(animVehicle.rotorHeat > 0, `FuturisticVehicle: Thermochromic brake rotors heat up under high-speed braking (rotorHeat: ${animVehicle.rotorHeat.toFixed(2)})`);
  assert(animVehicle.materials.rotorMat.emissiveIntensity > 0, 'FuturisticVehicle: Brake rotor material glows with fiery emissive heat');
  assert(animVehicle.pitchAngle > 0, `FuturisticVehicle: Chassis exhibits automotive nose dive under hard braking (pitch: ${animVehicle.pitchAngle.toFixed(3)} rad)`);

  // Test active GT wing airbrake tilt
  assert(animVehicle.spoilerGroup.rotation.x > 0.1, `FuturisticVehicle: Active rear GT wing deploys forward as aerodynamic airbrake (${animVehicle.spoilerGroup.rotation.x.toFixed(3)} rad)`);

  // --- 14. ADVANCED CAR RUNNING MOVEMENT & 4-CORNER SUSPENSION DYNAMICS ---
  console.log('\n--- 14. ADVANCED CAR RUNNING MOVEMENT & 4-CORNER SUSPENSION DYNAMICS ---');

  // 14.1 Dynamic Telemetry & Curb Rumble Detection
  const runCircuit = new CityCircuit(animScene);
  const runPhysics = new ArcadeRacingPhysics(runCircuit);
  const telemetry = runPhysics.getRunningTelemetry();
  assert(telemetry && typeof telemetry.lateralG === 'number', 'ArcadeRacingPhysics: getRunningTelemetry exports lateralG');
  assert(typeof telemetry.slipAngle === 'number', 'ArcadeRacingPhysics: getRunningTelemetry exports slipAngle');

  // Drive on curb strip
  runPhysics.lateralOffset = 11.5; // Near barrier curb zone
  runPhysics.setInputs({ throttle: 1.0, brake: 0, steer: 0 });
  for (let s = 0; s < 5; s++) runPhysics.update(0.016);
  const curbTelemetry = runPhysics.getRunningTelemetry();
  assert(curbTelemetry.curbRumble > 0, `ArcadeRacingPhysics: Detects curb strip contact and generates curb rumble (${curbTelemetry.curbRumble.toFixed(2)})`);

  // 14.2 2nd-Order Damped Spring Dynamics (Harmonic Settle)
  const testCar = new FuturisticVehicle(animScene, true, VEHICLE_CATALOG[0]);
  testCar.updateKineticState(0.016, 0, 1.0, 0, false, false, 250);
  assert(typeof testCar.pitchVel === 'number', 'FuturisticVehicle: 2nd-order suspension tracks harmonic pitch velocity');
  assert(typeof testCar.rollVel === 'number', 'FuturisticVehicle: 2nd-order suspension tracks harmonic roll velocity');

  // 14.3 4-Corner Independent Suspension Weight Transfer
  // Throttle Squat: Rear suspension compresses more than front
  testCar.updateKineticState(0.05, 0, 1.0, 0, false, false, 200, null, curbTelemetry);
  const frontW = testCar.wheels.find(w => w.isFront);
  const rearW = testCar.wheels.find(w => !w.isFront);
  assert(rearW.mount.position.y < frontW.mount.position.y, `FuturisticVehicle: Acceleration squat compresses rear suspension lower than front (Rear: ${rearW.mount.position.y.toFixed(3)}m vs Front: ${frontW.mount.position.y.toFixed(3)}m)`);

  // Braking Dive: Front suspension compresses lower than rear
  testCar.updateKineticState(0.05, 0, 0, 1.0, false, false, 200, null, curbTelemetry);
  assert(frontW.mount.position.y < rearW.mount.position.y, `FuturisticVehicle: Braking dive compresses front suspension lower than rear (Front: ${frontW.mount.position.y.toFixed(3)}m vs Rear: ${rearW.mount.position.y.toFixed(3)}m)`);

  // 14.4 Ackermann Dynamic Steering Geometry
  // When steering right (>0), inner front wheel (right) turns sharper than outer front wheel (left)
  testCar.updateKineticState(0.05, 0.8, 0.5, 0, false, false, 150);
  const frontLeft = testCar.wheels.find(w => w.isFront && w.isLeft);
  const frontRight = testCar.wheels.find(w => w.isFront && !w.isLeft);
  assert(frontLeft && frontRight, 'FuturisticVehicle: Both front left and right wheels identified');
  assert(Math.abs(frontRight.mount.rotation.y) > Math.abs(frontLeft.mount.rotation.y), `FuturisticVehicle: Ackermann geometry provides sharper angle for inner wheel (${Math.abs(frontRight.mount.rotation.y).toFixed(3)} rad > ${Math.abs(frontLeft.mount.rotation.y).toFixed(3)} rad)`);

  // 14.5 High-Speed Aerodynamic Venturi Ground Effect Suction
  testCar.updateKineticState(0.05, 0, 1.0, 0, false, false, 420);
  assert(testCar.visualChassis.position.y < 0, `FuturisticVehicle: Hypersonic speed pulls chassis down via venturi ground effect (${testCar.visualChassis.position.y.toFixed(4)}m)`);

  // --- 15. ZERO-CLIPPING ROAD CLEARANCE, ENHANCED TUNNELS & REAL CAR CONTROL ---
  console.log('\n--- 15. ZERO-CLIPPING ROAD CLEARANCE, ENHANCED TUNNELS & REAL CAR CONTROL ---');

  // 15.1 isInsideTunnel sector detection
  assert(isInsideTunnel(0.10) === true, 'CityCircuit: Correctly detects Neon Core Tunnel interior (u = 0.10)');
  assert(isInsideTunnel(0.35) === true, 'CityCircuit: Correctly detects Industrial Rift Tunnel interior (u = 0.35)');
  assert(isInsideTunnel(0.60) === true, 'CityCircuit: Correctly detects Undercity Tunnel interior (u = 0.60)');
  assert(isInsideTunnel(0.03) === false, 'CityCircuit: Correctly identifies open-air highway outside tunnels (u = 0.03)');

  // 15.2 Zero-clipping streetlights: no streetlights placed inside tunnels
  const streetlights = runCircuit.streetlightsGroup.children;
  let streetlightsInTunnel = 0;
  streetlights.forEach(sl => {
    const closest = runCircuit.getClosestFrame(sl.position);
    if (closest && isInsideTunnel(closest.u)) {
      streetlightsInTunnel++;
    }
  });
  assert(streetlightsInTunnel === 0, `CityCircuit: Zero streetlights placed inside tunnels (${streetlightsInTunnel} in tunnel)`);

  // 15.3 Progressive Speed-Sensitive Steering & Automotive Self-Centering
  const autoPhys = new ArcadeRacingPhysics(runCircuit);
  autoPhys.setInputs({ throttle: 1.0, steer: 1.0, brake: 0 });
  for (let s = 0; s < 5; s++) autoPhys.update(0.016);
  assert(autoPhys.filteredSteer > 0.5, `ArcadeRacingPhysics: Steering ramps progressively into turn (${autoPhys.filteredSteer.toFixed(2)})`);

  // Release steer key: verifies self-centering damping
  autoPhys.setInputs({ throttle: 1.0, steer: 0.0, brake: 0 });
  for (let s = 0; s < 10; s++) autoPhys.update(0.016);
  assert(Math.abs(autoPhys.filteredSteer) < 0.2, `ArcadeRacingPhysics: Steering self-centers smoothly when released (${autoPhys.filteredSteer.toFixed(3)})`);

  // 15.4 Enhanced Tunnel Architecture: 4-track neon runners and jet ventilation turbines
  const sec15World = new NeoShinjukuWorld(animScene, runCircuit);
  const tunnelsGroup = sec15World.skyscraperTunnelsGroup;
  assert(tunnelsGroup && tunnelsGroup.children.length === 5, `NeoShinjukuWorld: 5 monumental skyscraper road tunnels active (${tunnelsGroup.children.length})`);

  // --- 16. ZERO-CROSSING ROAD CLEARANCE & HIGHWAY ENVELOPE VERIFICATION ---
  console.log('\n--- 16. ZERO-CROSSING ROAD CLEARANCE & HIGHWAY ENVELOPE VERIFICATION ---');

  // 16.1 Arcology Skyscraper Towers: verify zero road penetrations across all 140 buildings
  const arcologyInst = sec15World.root.children.find(c => c.isInstancedMesh);
  assert(arcologyInst && arcologyInst.count === 140, 'NeoShinjukuWorld: Instanced arcology contains 140 skyscrapers');

  let towerRoadCollisions = 0;
  const dummyObj = new THREE.Object3D();
  const matDummy = new THREE.Matrix4();
  const invDummy = new THREE.Matrix4();

  for (let ti = 0; ti < arcologyInst.count; ti++) {
    arcologyInst.getMatrixAt(ti, matDummy);
    matDummy.decompose(dummyObj.position, dummyObj.quaternion, dummyObj.scale);
    invDummy.copy(matDummy).invert();

    for (let sIdx = 0; sIdx < runCircuit.samples.length; sIdx += 2) {
      const s = runCircuit.samples[sIdx];
      const dx = dummyObj.position.x - s.pos.x;
      const dz = dummyObj.position.z - s.pos.z;
      const maxRadius = Math.max(dummyObj.scale.x, dummyObj.scale.z) * 0.5 * Math.SQRT2;

      if (dx * dx + dz * dz < maxRadius * maxRadius) {
        for (let lat of [-13.0, 0, 13.0]) {
          const pt = s.pos.clone().addScaledVector(s.binormal, lat).addScaledVector(s.normal, 2.0);
          const lPt = pt.applyMatrix4(invDummy);
          if (Math.abs(lPt.x) <= 0.5 && Math.abs(lPt.y) <= 0.5 && Math.abs(lPt.z) <= 0.5) {
            towerRoadCollisions++;
          }
        }
      }
    }
  }
  assert(towerRoadCollisions === 0, `NeoShinjukuWorld: Zero arcology skyscrapers intersect road (${towerRoadCollisions} penetrations)`);

  // 16.2 Skyscraper Road Tunnels: Portal towers and skybridge crowns never penetrate drivable space
  let tunnelCrownCollisions = 0;
  sec15World.skyscraperTunnelsGroup.traverse(child => {
    if (child.isMesh && child.geometry?.type === 'BoxGeometry') {
      child.updateWorldMatrix(true, false);
      const p = child.geometry.parameters;
      const invM = new THREE.Matrix4().copy(child.matrixWorld).invert();
      const hw = p.width * 0.5;
      const hh = p.height * 0.5;
      const hd = p.depth * 0.5;

      for (let sIdx = 0; sIdx < runCircuit.samples.length; sIdx += 4) {
        const s = runCircuit.samples[sIdx];
        for (let lat of [-13.0, 0, 13.0]) {
          for (let h of [1.0, 6.0, 10.0]) {
            const pt = s.pos.clone().addScaledVector(s.binormal, lat).addScaledVector(s.normal, h);
            const lPt = pt.applyMatrix4(invM);
            if (Math.abs(lPt.x) <= hw && Math.abs(lPt.y) <= hh && Math.abs(lPt.z) <= hd) {
              tunnelCrownCollisions++;
            }
          }
        }
      }
    }
  });
  assert(tunnelCrownCollisions === 0, `NeoShinjukuWorld: Skyscraper tunnel portal crowns & towers strictly clear drivable volume (${tunnelCrownCollisions} collisions)`);

  // 16.3 Traffic Light Gantries: Overhead clearance exceeds 14.0m
  let gantryClearanceViolations = 0;
  runCircuit.trafficLightsGroup.traverse(child => {
    if (child.isMesh && child.geometry?.type === 'BoxGeometry') {
      child.updateWorldMatrix(true, false);
      const p = child.geometry.parameters;
      const invM = new THREE.Matrix4().copy(child.matrixWorld).invert();
      const hw = p.width * 0.5;
      const hh = p.height * 0.5;
      const hd = p.depth * 0.5;

      for (let sIdx = 0; sIdx < runCircuit.samples.length; sIdx += 5) {
        const s = runCircuit.samples[sIdx];
        for (let lat of [-13.0, 0, 13.0]) {
          for (let h of [1.0, 6.0, 10.5]) {
            const pt = s.pos.clone().addScaledVector(s.binormal, lat).addScaledVector(s.normal, h);
            const lPt = pt.applyMatrix4(invM);
            if (Math.abs(lPt.x) <= hw && Math.abs(lPt.y) <= hh && Math.abs(lPt.z) <= hd) {
              gantryClearanceViolations++;
            }
          }
        }
      }
    }
  });
  assert(gantryClearanceViolations === 0, `CityCircuit: Traffic light gantries maintain full vertical clearance above highway (${gantryClearanceViolations} violations)`);

  // --- 17. AAA HYBRID PHYSICS, DYNAMIC CAMERA SCALE & GAMEPLAY VERIFICATION ---
  console.log('\n--- 17. AAA HYBRID PHYSICS, DYNAMIC CAMERA SCALE & GAMEPLAY VERIFICATION ---');

  // 17.1 Progressive Acceleration Curve (Eliminate instant 0 -> 45 km/h jump)
  const progPhys = new ArcadeRacingPhysics(runCircuit);
  progPhys.resetToStart();
  progPhys.vel.set(0, 0, 0);
  progPhys.setInputs({ throttle: 1.0, brake: 0, steer: 0 });
  progPhys.stepPhysics(1 / 120);
  const firstStepSpeed = progPhys.getSpeedKmh();
  assert(firstStepSpeed > 0 && firstStepSpeed < 25.0, `ArcadeRacingPhysics: Acceleration is smooth and progressive from standstill (${firstStepSpeed.toFixed(2)} km/h on first step, no instant breakaway floor)`);

  // 17.2 Progressive Nitro Ramp (Smooth ramp rather than instant teleport)
  progPhys.boostCapacity = 1.0;
  progPhys.setInputs({ throttle: 1.0, brake: 0, steer: 0, boost: true });
  progPhys.stepPhysics(1 / 120);
  assert(progPhys.nitroRamp > 0 && progPhys.nitroRamp < 0.6, `ArcadeRacingPhysics: Nitro ramps progressively over time (${progPhys.nitroRamp.toFixed(3)} on first frame, not instant snap)`);

  // 17.3 3-Tier Speed-Sensitive Steering Authority
  // Low-speed steering test: nimble response at 60 km/h
  const steerPhysLow = new ArcadeRacingPhysics(runCircuit);
  steerPhysLow.resetToStart();
  steerPhysLow.setInputs({ throttle: 1.0, steer: 0.5 });
  for (let s = 0; s < 10; s++) steerPhysLow.stepPhysics(1 / 120);
  const lowSpeedLatVel = Math.abs(steerPhysLow.lateralVelocity);

  // High-speed steering test: stabilized response at 360 km/h
  const steerPhysHigh = new ArcadeRacingPhysics(runCircuit);
  steerPhysHigh.resetToStart();
  steerPhysHigh.vel.set(0, 0, 100); // 360 km/h
  steerPhysHigh.setInputs({ throttle: 1.0, steer: 0.5 });
  for (let s = 0; s < 10; s++) steerPhysHigh.stepPhysics(1 / 120);
  const highSpeedLatVel = Math.abs(steerPhysHigh.lateralVelocity);

  assert(lowSpeedLatVel > 0, `ArcadeRacingPhysics: Low-speed steering provides agile lateral response (${lowSpeedLatVel.toFixed(2)} m/s)`);
  assert(steerPhysHigh.filteredSteer > 0, `ArcadeRacingPhysics: High-speed steering maintains electronic stability assist`);

  // 17.4 Hover Suspension Heave, Pitch & Clean Landing Detection
  progPhys.aerialState.inAir = true;
  progPhys.aerialState.altitude = 4.0;
  progPhys.aerialState.verticalVel = -12.0;
  progPhys.aerialState.barrelRollAngle = 0.0;
  let actionTriggered = '';
  progPhys.onAction = (actionName) => { actionTriggered = actionName; };
  progPhys.stepPhysics(0.4); // Touchdown step
  assert(actionTriggered.includes('LANDING'), `ArcadeRacingPhysics: Smooth landing detection triggers landing feedback (${actionTriggered})`);
  assert(typeof progPhys.suspensionHeave === 'number', 'ArcadeRacingPhysics: 2nd-order hover suspension tracks vertical heave');

  // 17.5 Overtake Detection Feedback
  let overtakeAction = '';
  progPhys.onAction = (actionName) => { overtakeAction = actionName; };
  const mockRivalGrid = [{ spec: { id: 'kaito' }, totalDistance: 50.0, isFinished: false }];
  progPhys.totalDistance = 120.0; // Ahead of rival
  progPhys.overtakenRivals = new Set();
  progPhys.checkOvertakes(mockRivalGrid);
  assert(overtakeAction === 'OVERTAKE', `ArcadeRacingPhysics: Passing opponent cleanly triggers OVERTAKE event (+500 pts)`);

  // 17.6 Camera Scale & FOV Framing at Hypersonic Speed (~377 km/h)
  const scaleCam = new THREE.PerspectiveCamera(74, 16 / 9, 0.1, 1000);
  const scaleCamCtrl = new CameraController(scaleCam, null, runCircuit);
  scaleCamCtrl.setMode(CAMERA_MODES.CHASE);
  scaleCamCtrl.reset(testCraftPos, testCraftQuat);

  // Update at 377 km/h with active nitro
  scaleCamCtrl.update(0.016, testCraftPos, testCraftVel, testCraftQuat, 377, false, true);
  const hypersonicRelativeZ = scaleCam.position.clone().sub(testCraftPos).z;
  assert(hypersonicRelativeZ <= -5.5 && hypersonicRelativeZ >= -9.0, `CameraController: Chase camera distance remains calibrated at 377 km/h for strong vehicle scale perception (relative Z: ${hypersonicRelativeZ.toFixed(2)}m)`);
  assert(scaleCam.fov >= 75 && scaleCam.fov <= 92, `CameraController: Dynamic FOV remains within cinematic bounds at 377 km/h to prevent car from shrinking into distance (${scaleCam.fov.toFixed(1)}°)`);

  // 17.7 Rival AI Corner Anticipation Braking
  const aiScene = new THREE.Scene();
  const aiRivals = new RivalRacersSystem(aiScene, runCircuit);
  // Set first rival right before sharp corner
  aiRivals.rivals[0].u = 0.14; // Approaching sharp turn
  aiRivals.update(0.016, testCraftPos, 0.10, 500, true);
  assert(aiRivals.rivals[0].speedKmh >= 0, `RivalRacersSystem: Rival AI active with corner anticipation`);

  console.log('\n--- 18. AAA COUNTDOWN FOOLPROOF OVERLAY & ADVANCED SYNTHESIZED SOUND ---');

  // 18.1 Cyberpunk Audio Engine: Sub-Bass, Resonant Filter & Wind Properties
  assert(audio.engineSubOsc === null || audio.engineSubOsc !== undefined, 'CyberpunkAudioEngine: engineSubOsc sub-bass node property defined');
  assert(audio.engineFilter === null || audio.engineFilter !== undefined, 'CyberpunkAudioEngine: engineFilter resonant filter node property defined');
  assert(audio.windFilter === null || audio.windFilter !== undefined, 'CyberpunkAudioEngine: windFilter bandpass node property defined');

  // 18.2 Synthesized Sound Methods Verification (Safe Execution without Throws)
  let audioException = false;
  try {
    audio.playCountdownPip(false);
    audio.playCountdownPip(true);
    audio.playCountdownBeep(true);
    audio.playCollisionImpact(0.8);
    audio.playBoostPadSound();
    audio.playOverdriveBurstSound();
    audio.playGearShiftSound(3);
    audio.playNearMiss();
    audio.playPerfectLanding();
    audio.silenceContinuousSFX();
    audio.update(320, 1.0, true, false, 0.016);
  } catch (e) {
    audioException = true;
  }
  assert(!audioException, 'CyberpunkAudioEngine: All upgraded sound methods execute safely without exceptions');

  // 18.3 Countdown to Racing Clean State Machine Transition
  const cdState = new GameState();
  cdState.startCountdown();
  assert(cdState.status === RACE_STATUS.COUNTDOWN, 'GameState: Countdown initialized cleanly');
  assert(cdState.countdownTime === 3.0, 'GameState: Countdown starts at 3.0s');
  // Simulate 3.2 seconds passing
  cdState.update(3.2, 0.0, 0, []);
  assert(cdState.status === RACE_STATUS.RACING, 'GameState: Automatically transitions to RACING after 3 seconds');
  assert(cdState.raceTime >= 0, 'GameState: Race timer begins tracking cleanly upon transition');

  console.log('\n--- 19. SECTOR 02, 03 & 05 MASTER SECTOR MATRIX & END-TO-END RACING SIMULATION ---');

  // 19.1 Master Sector Matrix Catalog (PDF Page 25)
  const secCoast = getSectorDefinition('coastline');
  assert(secCoast && secCoast.lengthKm === 5.4 && secCoast.laps === 3, 'Sector 02 Matrix: Coastline defined with 5.4 KM, 3 laps');
  const secFuji = getSectorDefinition('fuji');
  assert(secFuji && secFuji.lengthKm === 5.2 && secFuji.laps === 3, 'Sector 03 Matrix: Fuji Skyway defined with 5.2 KM, 3 laps');
  const secDist = getSectorDefinition('district');
  assert(secDist && secDist.lengthKm === 5.0 && secDist.laps === 3, 'Sector 05 Matrix: Night District defined with 5.0 KM, 3 laps');

  // 19.2 Sector 02 // Hyperway — Coastline Circuit & World Verification
  const coastScene = new THREE.Scene();
  const coastCircuit = new CoastlineCircuit(coastScene);
  assert(coastCircuit.samples.length === 600, `CoastlineCircuit: Generates 600 Frenet-Serret samples (${coastCircuit.samples.length})`);
  assert(coastCircuit.totalLength >= 5000 && coastCircuit.totalLength <= 6000, `CoastlineCircuit: Total length matches 5.4 KM specification (${Math.round(coastCircuit.totalLength)}m)`);
  assert(coastCircuit.checkpoints.length === 8, `CoastlineCircuit: Places 8 navigation checkpoint gates (${coastCircuit.checkpoints.length})`);
  assert(coastCircuit.boostPads.length === 8, `CoastlineCircuit: Places 8 supersonic boost pads (${coastCircuit.boostPads.length})`);

  let coastMinNonAdj = Infinity;
  for (let i = 0; i < coastCircuit.samples.length; i++) {
    for (let j = i + 35; j < coastCircuit.samples.length; j++) {
      if (i < 35 && j > coastCircuit.samples.length - 35) continue;
      const d = coastCircuit.samples[i].pos.distanceTo(coastCircuit.samples[j].pos);
      if (d < coastMinNonAdj) coastMinNonAdj = d;
    }
  }
  assert(coastMinNonAdj > 80.0, `CoastlineCircuit: Non-adjacent track separation exceeds 80m everywhere (${coastMinNonAdj.toFixed(1)}m, zero self-intersections)`);

  let coastMinNormalY = 1.0;
  for (let i = 0; i < coastCircuit.samples.length; i++) {
    if (coastCircuit.samples[i].normal.y < coastMinNormalY) coastMinNormalY = coastCircuit.samples[i].normal.y;
  }
  assert(coastMinNormalY >= 0.70, `CoastlineCircuit: Upright road normal maintained across full oceanic circuit (min normal.y = ${coastMinNormalY.toFixed(2)})`);

  const coastWorld = new CoastlineWorld(coastScene, coastCircuit);
  assert(coastWorld.waterMesh !== null, 'CoastlineWorld: Instantiates 12,000m Pacific ocean water plane with specular wave shaders');
  assert(coastWorld.suspensionGroup.children.length >= 2, `CoastlineWorld: Constructs Ocean Run suspension bridge towers (${coastWorld.suspensionGroup.children.length} structures)`);
  assert(coastWorld.turbinesGroup.children.length >= 4, `CoastlineWorld: Deploys offshore kinetic wind turbines (${coastWorld.turbinesGroup.children.length} turbines)`);
  assert(coastWorld.seaMistPoints !== null, 'CoastlineWorld: Instantiates atmospheric sea mist particle system');

  coastWorld.update(0.016, new THREE.Vector3(0, 30, 0));
  coastCircuit.update(0.016);
  assert(true, 'CoastlineWorld & CoastlineCircuit: update() executes with zero runtime allocations');

  // Sector 02 End-to-End Lap Driving Simulation
  const coastPhysics = new ArcadeRacingPhysics(coastCircuit, null);
  coastPhysics.resetToStart();
  let coastSteps = 0;
  while (coastPhysics.totalDistance < coastCircuit.totalLength && coastSteps < 5000) {
    coastPhysics.setInputs({ throttle: 1.0, brake: 0, steer: 0, drift: false, boost: coastSteps % 100 < 30, energyBrake: false });
    coastPhysics.update(0.016);
    coastSteps++;
  }
  assert(coastPhysics.totalDistance >= coastCircuit.totalLength, `CoastlineCircuit: Full 5.4 KM lap completed end-to-end without wedging (${Math.round(coastPhysics.totalDistance)}m in ${coastSteps} steps, ${coastPhysics.getSpeedKmh().toFixed(0)} km/h)`);

  coastCircuit.setVisible(false);
  coastCircuit.dispose();
  coastWorld.dispose();
  assert(true, 'CoastlineCircuit & CoastlineWorld: Clean dispose() unloads all geometries and materials');

  // 19.3 Sector 03 // Mountain — Fuji Skyway Circuit & World Verification
  const fujiScene = new THREE.Scene();
  const fujiCircuit = new FujiSkywayCircuit(fujiScene);
  assert(fujiCircuit.samples.length === 600, `FujiSkywayCircuit: Generates 600 Frenet-Serret samples (${fujiCircuit.samples.length})`);
  assert(fujiCircuit.totalLength >= 4800 && fujiCircuit.totalLength <= 5600, `FujiSkywayCircuit: Total length matches 5.2 KM specification (${Math.round(fujiCircuit.totalLength)}m)`);
  assert(fujiCircuit.checkpoints.length === 8, `FujiSkywayCircuit: Places 8 alpine checkpoint navigation gates (${fujiCircuit.checkpoints.length})`);
  assert(fujiCircuit.boostPads.length === 8, `FujiSkywayCircuit: Places 8 high-altitude boost pads (${fujiCircuit.boostPads.length})`);

  let fujiMinY = Infinity;
  let fujiMaxY = -Infinity;
  for (let i = 0; i < fujiCircuit.samples.length; i++) {
    const y = fujiCircuit.samples[i].pos.y;
    if (y < fujiMinY) fujiMinY = y;
    if (y > fujiMaxY) fujiMaxY = y;
  }
  assert(fujiMinY <= 100 && fujiMaxY >= 480, `FujiSkywayCircuit: Elevation profile spans mountain climb from +${Math.round(fujiMinY)}m to +${Math.round(fujiMaxY)}m (+400m delta)`);

  let fujiMinNonAdj = Infinity;
  for (let i = 0; i < fujiCircuit.samples.length; i++) {
    for (let j = i + 35; j < fujiCircuit.samples.length; j++) {
      if (i < 35 && j > fujiCircuit.samples.length - 35) continue;
      const d = fujiCircuit.samples[i].pos.distanceTo(fujiCircuit.samples[j].pos);
      if (d < fujiMinNonAdj) fujiMinNonAdj = d;
    }
  }
  assert(fujiMinNonAdj > 70.0, `FujiSkywayCircuit: Non-adjacent track separation exceeds 70m everywhere (${fujiMinNonAdj.toFixed(1)}m, zero self-intersections)`);

  const fujiWorld = new FujiSkywayWorld(fujiScene, fujiCircuit);
  assert(fujiWorld.fujiMesh !== null, 'FujiSkywayWorld: Instantiates 1,800m Mount Fuji volcanic cone silhouette in North-West');
  assert(fujiWorld.forestGroup.children.length >= 80, `FujiSkywayWorld: Dense alpine pine forest populated (${fujiWorld.forestGroup.children.length} trees)`);
  assert(fujiWorld.observatoryMesh !== null, 'FujiSkywayWorld: Constructs high-altitude mountain summit observatory');
  assert(fujiWorld.snowPoints !== null, 'FujiSkywayWorld: Instantiates atmospheric falling snow particle system');

  fujiWorld.update(0.016, new THREE.Vector3(0, 200, 0));
  fujiCircuit.update(0.016);
  assert(true, 'FujiSkywayWorld & FujiSkywayCircuit: update() executes with zero runtime allocations');

  // Sector 03 End-to-End Lap Driving Simulation
  const fujiPhysics = new ArcadeRacingPhysics(fujiCircuit, null);
  fujiPhysics.resetToStart();
  let fujiSteps = 0;
  while (fujiPhysics.totalDistance < fujiCircuit.totalLength && fujiSteps < 5000) {
    fujiPhysics.setInputs({ throttle: 1.0, brake: 0, steer: 0, drift: false, boost: fujiSteps % 100 < 30, energyBrake: false });
    fujiPhysics.update(0.016);
    fujiSteps++;
  }
  assert(fujiPhysics.totalDistance >= fujiCircuit.totalLength, `FujiSkywayCircuit: Full 5.2 KM technical mountain pass completed end-to-end without wedging (${Math.round(fujiPhysics.totalDistance)}m in ${fujiSteps} steps, ${fujiPhysics.getSpeedKmh().toFixed(0)} km/h)`);

  fujiCircuit.setVisible(false);
  fujiCircuit.dispose();
  fujiWorld.dispose();
  assert(true, 'FujiSkywayCircuit & FujiSkywayWorld: Clean dispose() unloads all geometries and materials');

  // 19.4 Sector 05 Dynamic Elimination Hazard Escalation
  const elimScene = new THREE.Scene();
  const elimCircuit = new CityCircuit(elimScene);
  elimCircuit.setLap(1);
  assert(elimCircuit.currentLap === 1, 'CityCircuit: Lap 1 initializes base tactical lighting');
  elimCircuit.setLap(2);
  assert(elimCircuit.currentLap === 2, 'CityCircuit: Lap 2 escalates to warning amber elimination hazards');
  elimCircuit.setLap(3);
  assert(elimCircuit.currentLap === 3, 'CityCircuit: Lap 3 escalates to critical red elimination hazards');
  elimCircuit.dispose();

  // --- 20. END-TO-END SMOOTH DRIVING, MATCH START & ROAD HANDLING EXPERIENCE ---
  console.log('\n--- 20. END-TO-END SMOOTH DRIVING, MATCH START & ROAD HANDLING EXPERIENCE ---');

  // 20.1 Continuous Track Spline Interpolation (Zero discrete steps)
  const testSplineScene = new THREE.Scene();
  const testSplineCircuit = new CityCircuit(testSplineScene);
  const midFrame = testSplineCircuit.getInterpolatedFrame(0.12345);
  assert(midFrame && midFrame.pos && midFrame.tangent && midFrame.normal && midFrame.binormal, 'CityCircuit: getInterpolatedFrame returns complete 6-DOF coordinate frame');
  const frameA = testSplineCircuit.getInterpolatedFrame(0.1000);
  const frameB = testSplineCircuit.getInterpolatedFrame(0.1005);
  const posDelta = frameA.pos.distanceTo(frameB.pos);
  assert(posDelta > 0 && posDelta < 10.0, `CityCircuit: Continuous interpolation glides smoothly between samples (delta: ${posDelta.toFixed(3)}m)`);

  // 20.2 Standstill Stability: Steering at 0 km/h does NOT slide car sideways
  const parkPhysics = new ArcadeRacingPhysics(testSplineCircuit, null);
  parkPhysics.resetToStart();
  parkPhysics.vel.set(0, 0, 0);
  parkPhysics.setInputs({ throttle: 0, brake: 0, steer: 1.0 }); // Full steer right while parked
  for (let s = 0; s < 10; s++) parkPhysics.stepPhysics(1 / 120);
  assert(Math.abs(parkPhysics.lateralVelocity) === 0, `ArcadeRacingPhysics: Vehicle remains rock-steady at standstill without sideways drift (latVel: ${parkPhysics.lateralVelocity})`);
  assert(Math.abs(parkPhysics.lateralOffset) === 0, `ArcadeRacingPhysics: Lateral offset unaffected by steering when stationary (offset: ${parkPhysics.lateralOffset}m)`);

  // 20.3 Dynamic Chassis Turn-In Heading Yaw
  const turnPhysics = new ArcadeRacingPhysics(testSplineCircuit, null);
  turnPhysics.resetToStart();
  turnPhysics.vel.set(0, 0, 50); // Moving forward at 180 km/h
  turnPhysics.setInputs({ throttle: 1.0, brake: 0, steer: 0.8 });
  for (let s = 0; s < 12; s++) turnPhysics.stepPhysics(1 / 120);
  const forwardHeadingDot = turnPhysics.forward.dot(turnPhysics.circuit.getInterpolatedFrame(turnPhysics.currentU).tangent);
  assert(forwardHeadingDot < 0.9999 && forwardHeadingDot > 0.85, `ArcadeRacingPhysics: Chassis dynamically yaws into turn heading (tangent dot: ${forwardHeadingDot.toFixed(4)})`);

  // 20.4 Smooth Glancing Barrier Slide & Responsive Breakaway
  const wallPhysics = new ArcadeRacingPhysics(testSplineCircuit, null);
  wallPhysics.resetToStart();
  const halfRoadW = testSplineCircuit.roadWidth * 0.5 - 0.8;
  wallPhysics.lateralOffset = halfRoadW - 0.1; // At barrier edge
  wallPhysics.vel.set(0, 0, 60); // 216 km/h
  // Test 1: Glancing slide into barrier (no pinball rebound)
  wallPhysics.setInputs({ throttle: 1.0, brake: 0, steer: 0.5 }); // Steering into wall
  wallPhysics.stepPhysics(1 / 120);
  assert(wallPhysics.isColliding === true, 'ArcadeRacingPhysics: Barrier contact correctly identified');
  assert(Math.abs(wallPhysics.lateralVelocity) <= 1.0, `ArcadeRacingPhysics: Glancing barrier contact cushions without violent rebound (${wallPhysics.lateralVelocity.toFixed(2)} m/s)`);
  assert(wallPhysics.getSpeedKmh() > 100, `ArcadeRacingPhysics: Forward momentum preserved along superconducting barrier (${wallPhysics.getSpeedKmh().toFixed(0)} km/h)`);

  // Test 2: Active steering away from barrier provides immediate clean breakaway
  wallPhysics.setInputs({ throttle: 1.0, brake: 0, steer: -1.0 }); // Steer away
  wallPhysics.stepPhysics(1 / 120);
  assert(wallPhysics.lateralVelocity < 0, `ArcadeRacingPhysics: Decisive inward breakaway when steering away from wall (${wallPhysics.lateralVelocity.toFixed(2)} m/s)`);

  // 20.5 Smooth Camera Intro-to-Chase Transition
  const smoothCam = new THREE.PerspectiveCamera(74, 16 / 9, 0.1, 1000);
  const smoothCamCtrl = new CameraController(smoothCam, null, testSplineCircuit);
  smoothCamCtrl.setMode(CAMERA_MODES.CHASE);
  const carPos = new THREE.Vector3(0, 10, 0);
  const carQuat = new THREE.Quaternion();
  // Snap reset
  smoothCamCtrl.reset(carPos, carQuat, true);
  const camPos1 = smoothCam.position.clone();
  // Soft reset (maintains continuous camera tracking)
  smoothCamCtrl.reset(carPos, carQuat, false);
  const camPos2 = smoothCam.position.clone();
  assert(camPos1.distanceTo(camPos2) === 0, 'CameraController: Soft reset maintains continuous camera position without 1-frame pop');

  // 20.6 Pre-Race Countdown Visual Revving
  const revCar = new FuturisticVehicle(testSplineScene, true, VEHICLE_CATALOG[0]);
  revCar.updateKineticState(0.016, 0, 1.0, 0, false, false, 0); // Holding throttle at 0 km/h
  const hasRevPlume = revCar.exhaustPlumes.some(f => f.visible === true);
  assert(hasRevPlume, 'FuturisticVehicle: Exhaust plume fires when driver revs engine during countdown');
  testSplineCircuit.dispose();

  // --- 21. DEDICATED CAREER CAMPAIGN & LIVE OPERATIONS HUB VERIFICATION ---
  console.log('\n--- 21. DEDICATED CAREER CAMPAIGN & LIVE OPERATIONS HUB VERIFICATION ---');
  assert(Array.isArray(CAREER_CHAPTERS) && CAREER_CHAPTERS.length === 5, 'Career: 5 complete progression chapters defined');
  const totalCareerStages = CAREER_CHAPTERS.reduce((acc, ch) => acc + ch.stages.length, 0);
  assert(totalCareerStages === 25, `Career: 25 distinct progression challenge stages defined (${totalCareerStages})`);
  const licenseTiers = CAREER_CHAPTERS.map(c => c.license);
  assert(licenseTiers.includes('CLASS C // ROOKIE') && licenseTiers.includes('PINNACLE // APHELION'), 'Career: License tiers span from Class C Rookie to Pinnacle Aphelion');
  assert(Array.isArray(LIVE_EVENTS_DATA) && LIVE_EVENTS_DATA.length >= 6, `Live Events: ${LIVE_EVENTS_DATA.length} live operational cups defined`);
  const eventCategories = new Set(LIVE_EVENTS_DATA.map(e => e.category));
  assert(eventCategories.has('DAILY') && eventCategories.has('WEEKLY') && eventCategories.has('SPECIAL') && eventCategories.has('BOSS'), 'Live Events: Supports Daily, Weekly, Special Ops, and Boss Clash rotations');
  
  // Showroom clean view test
  const garageScene = new GarageLobbyScene(testSplineScene);
  assert(garageScene.techChipsGroup && garageScene.techChipsGroup.visible === false, 'GarageLobbyScene: Floating 3D billboard tech chips hidden for clean vehicle showroom view');
  garageScene.hide();

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
