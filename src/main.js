import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { CityCircuit } from './track/CityCircuit.js';
import { NeoShinjukuWorld } from './world/NeoShinjukuWorld.js';
import { NightriftVehicle } from './craft/NightriftVehicle.js';
import { ArcadeRacingPhysics } from './physics/ArcadeRacingPhysics.js';
import { TrafficSystem } from './traffic/TrafficSystem.js';
import { RivalRacersSystem } from './ai/RivalRacersSystem.js';
import { CameraController, CAMERA_MODES } from './game/CameraController.js';
import { GameState, RACE_STATUS } from './game/GameState.js';
import { ModernRaceHUD } from './ui/ModernRaceHUD.js';
import { HolographicMinimap } from './ui/HolographicMinimap.js';
import { FullWorldMap } from './ui/FullWorldMap.js';
import { GarageUI } from './ui/GarageUI.js';
import { CyberpunkAudioEngine } from './audio/CyberpunkAudioEngine.js';

// ============================================================================
// NEO-SHINJUKU RIFT: HYPER CIRCUIT // AETHER-9
// 2089 OPEN-WORLD & CIRCUIT ARCADE RACING SIMULATION
// ============================================================================

class GameManager {
  constructor() {
    this.container = document.getElementById('canvas-container');

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.clock = new THREE.Clock();

    // Lighting
    this.sunLight = null;
    this.playerUnderglow = null;

    // Simulation Subsystems
    this.circuit = null;
    this.world = null;
    this.playerVehicle = null;
    this.physics = null;
    this.traffic = null;
    this.rivals = null;
    this.cameraController = null;
    this.sound = null;
    this.gameState = null;

    // User Interface Systems
    this.hud = null;
    this.minimap = null;
    this.worldMap = null;
    this.garage = null;

    // Input state
    this.keys = {};
    this.touchInputs = { throttle: 0, steer: 0, brake: 0, drift: false, boost: false };

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupLighting();
    this.setupPostProcessing();
    this.setupGameSubsystems();
    this.setupUI();
    this.setupInputs();

    window.addEventListener('resize', () => this.onResize());

    // Start simulation loop
    this.animate();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080F);
    this.scene.fog = new THREE.FogExp2(0x06080F, 0.00035);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, 10000);
    this.scene.add(this.camera);
  }

  setupLighting() {
    // Cyberpunk ambient atmospheric light
    const ambient = new THREE.AmbientLight(0x223048, 2.2);
    this.scene.add(ambient);

    // Cyan/indigo hemisphere skylight
    const hemiLight = new THREE.HemisphereLight(0x00F0FF, 0x141822, 1.5);
    this.scene.add(hemiLight);

    // Main directional sunlight with soft shadows
    this.sunLight = new THREE.DirectionalLight(0xE0F0FF, 2.8);
    this.sunLight.position.set(350, 1600, 450);
    this.sunLight.target.position.set(0, 150, 0);
    this.scene.add(this.sunLight.target);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 50;
    this.sunLight.shadow.camera.far = 3500;
    this.sunLight.shadow.camera.left = -700;
    this.sunLight.shadow.camera.right = 700;
    this.sunLight.shadow.camera.top = 700;
    this.sunLight.shadow.camera.bottom = -700;
    this.scene.add(this.sunLight);

    // Deep purple secondary rim light
    const rimLight = new THREE.DirectionalLight(0x7928CA, 1.8);
    rimLight.position.set(-500, 600, -400);
    this.scene.add(rimLight);
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.85,  // strength
      0.38,  // radius
      0.72   // threshold
    );
    this.composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  setupGameSubsystems() {
    // 1. Audio Engine
    this.sound = new CyberpunkAudioEngine();

    // 2. 8-District Metropolis Circuit
    this.circuit = new CityCircuit(this.scene);

    // 3. Neo-Shinjuku Open-World Environment
    this.world = new NeoShinjukuWorld(this.scene, this.circuit);

    // 4. Player Vehicle: F-8000 // NIGHTRIFT
    this.playerVehicle = new NightriftVehicle(this.scene, true, 0x00F0FF);

    // Neon underglow attached to player vehicle
    this.playerUnderglow = new THREE.PointLight(0x00F0FF, 3.5, 18);
    this.playerUnderglow.position.set(0, -0.2, 0);
    this.playerVehicle.group.add(this.playerUnderglow);

    // 5. Arcade Racing Physics (120Hz fixed sub-stepping)
    this.physics = new ArcadeRacingPhysics(this.circuit, this.sound);

    // 6. Civilian Traffic Fleet (Taxis, sedans, logistics vans, cargo haulers)
    this.traffic = new TrafficSystem(this.scene, this.circuit);

    // 7. 8 Rival AI Racers + Boss The Vector
    this.rivals = new RivalRacersSystem(this.scene, this.circuit);

    // 8. Dynamic Camera Controller
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);
    this.cameraController.reset(this.physics.pos, this.physics.quat);

    // 9. Game State Engine
    this.gameState = new GameState(this.sound);
    this.gameState.totalRacers = 9; // Player + 8 Rivals
    this.gameState.startCountdown();
  }

  setupUI() {
    // Modern perimeter race HUD
    this.hud = new ModernRaceHUD(this);

    // Holographic radar minimap
    this.minimap = new HolographicMinimap('hud-minimap-canvas', this.circuit);

    // Full interactive satellite world map (Key: 'M')
    this.worldMap = new FullWorldMap(this);

    // Underground hangar tuning facility (Key: 'G')
    this.garage = new GarageUI(this);
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Resume/init Web Audio on first user interaction
      if (this.sound) this.sound.resume();

      // Camera toggle: C or V
      if (e.code === 'KeyC' || e.code === 'KeyV') {
        this.cameraController.cycleMode();
      }

      // Reset / Restart: R
      if (e.code === 'KeyR') {
        this.restartRace();
      }

      // Escape key handles modals
      if (e.code === 'Escape') {
        if (this.worldMap && this.worldMap.isOpen) this.worldMap.close();
        if (this.garage && this.garage.isOpen) this.garage.close();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Pointer down resume audio
    window.addEventListener('pointerdown', () => {
      if (this.sound) this.sound.resume();
    });
  }

  restartRace() {
    this.physics.resetToStart();
    if (this.cameraController) {
      this.cameraController.reset(this.physics.pos, this.physics.quat);
    }
    if (this.gameState) {
      this.gameState.startCountdown();
    }
    if (this.rivals) {
      this.rivals.spawnRivalGrid();
    }
  }

  pollInputs() {
    let throttle = 0.0;
    let brake = 0.0;
    let steer = 0.0;
    let drift = false;
    let boost = false;
    let energyBrake = false;

    // 1. Keyboard
    if (this.keys['KeyW'] || this.keys['ArrowUp']) throttle = 1.0;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) brake = 1.0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) steer -= 1.0;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) steer += 1.0;

    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) drift = true;
    if (this.keys['Space']) boost = true;
    if (this.keys['KeyE']) energyBrake = true;

    // 2. Touch Inputs
    if (this.touchInputs.throttle > 0) throttle = this.touchInputs.throttle;
    if (this.touchInputs.brake > 0) brake = this.touchInputs.brake;
    if (this.touchInputs.steer !== 0) steer = this.touchInputs.steer;
    if (this.touchInputs.drift) drift = true;
    if (this.touchInputs.boost) boost = true;

    // 3. Gamepad API
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gamepads && gamepads[0]) {
      const gp = gamepads[0];
      if (Math.abs(gp.axes[0]) > 0.15) steer = gp.axes[0];
      if (gp.buttons[7] && gp.buttons[7].value > 0.1) throttle = gp.buttons[7].value;
      if (gp.buttons[6] && gp.buttons[6].value > 0.1) brake = gp.buttons[6].value;
      if (gp.buttons[0] && gp.buttons[0].pressed) throttle = 1.0;
      if (gp.buttons[2] && gp.buttons[2].pressed) brake = 1.0;
      if (gp.buttons[1] && gp.buttons[1].pressed) boost = true;
      if (gp.buttons[4] && gp.buttons[4].pressed) drift = true;
      if (gp.buttons[5] && gp.buttons[5].pressed) energyBrake = true;
    }

    return { throttle, brake, steer, drift, boost, energyBrake };
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Poll Player Inputs
    const inputs = this.pollInputs();
    const isRacing = this.gameState.status === RACE_STATUS.RACING;
    const effectiveThrottle = isRacing ? inputs.throttle : 0.0;

    this.physics.setInputs({
      throttle: effectiveThrottle,
      brake: inputs.brake,
      steer: inputs.steer,
      drift: inputs.drift,
      boost: inputs.boost,
      energyBrake: inputs.energyBrake
    });

    // 2. Step 120Hz Fixed Physics
    const renderAlpha = this.physics.update(delta);
    const speedKmh = this.physics.getSpeedKmh();

    // 3. Collision Handling (Traffic & Barriers)
    const trafficCol = this.traffic.checkCollision(this.physics.pos, 2.4);
    if (trafficCol.hit) {
      this.physics.pos.addScaledVector(trafficCol.repelVector, 0.45);
      this.physics.vel.multiplyScalar(0.92);
      this.cameraController.addShake(0.35);
    }

    if (this.physics.isColliding) {
      this.cameraController.addShake(this.physics.collisionImpulse);
    }

    // 4. Update Player Vehicle Transform & Kinetics
    const { pos: interpPos, quat: interpQuat } = this.physics.getInterpolatedTransform(renderAlpha);
    this.playerVehicle.group.position.copy(interpPos);
    this.playerVehicle.group.quaternion.copy(interpQuat);

    this.playerVehicle.updateKineticState(
      delta,
      inputs.steer,
      effectiveThrottle,
      inputs.brake,
      this.physics.isDrifting,
      this.physics.isBoosting,
      speedKmh
    );

    // 5. Update AI Rival Racers
    this.rivals.update(delta, interpPos, this.physics.currentU, this.physics.totalDistance, isRacing);

    // 6. Update Autonomous Civilian Traffic
    this.traffic.update(delta, interpPos, speedKmh);

    // 7. Update Neo-Shinjuku Open-World Environment
    this.world.update(delta, interpPos);

    // 8. Update Track Spline Elements (Boost Pads & Gates)
    this.circuit.update(delta);

    // 9. Update Game State (Laps, Standings, Times)
    this.gameState.update(delta, this.physics.currentU, speedKmh, this.rivals.rivals);

    // 10. Synthesize Cyberpunk Audio
    if (this.sound) {
      this.sound.update(speedKmh, effectiveThrottle, this.physics.isBoosting, this.physics.isDrifting, delta);
    }

    // 11. Update Camera Tracking
    this.cameraController.update(
      delta,
      interpPos,
      this.physics.vel,
      interpQuat,
      speedKmh,
      this.physics.isColliding,
      this.physics.isBoosting
    );

    // 12. Determine Current District & Update HUD / Radar
    const currentFrame = this.circuit.getFrameAt(this.physics.currentU);
    const currentDistrict = currentFrame ? currentFrame.district : null;

    if (this.hud) {
      this.hud.update(this.physics, this.gameState, this.rivals, currentDistrict);
    }

    if (this.minimap) {
      this.minimap.update(interpPos, interpQuat, this.physics.currentU, this.rivals.rivals, currentDistrict);
    }

    // 13. Render via Post-Processing Composer (Forward Bloom)
    this.composer.render();
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameManager();
});
