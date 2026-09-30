import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { DeferredRenderer } from './pipelines/DeferredRenderer.js';
import { RepulsorWavePass } from './pipelines/RepulsorWavePass.js';
import { WebGPURenderGraph } from './pipelines/WebGPURenderGraph.js';
import { WebGPURepulsorPipeline } from './pipelines/WebGPURepulsorPipeline.js';
import { SoundEngine } from './audio/SoundEngine.js';
import { TRACK_CIRCUITS } from './track/TrackData.js';
import { TrackBuilder } from './track/TrackBuilder.js';
import { SceneryBuilder } from './track/SceneryBuilder.js';
import { CraftMesh, CRAFT_TEAMS } from './craft/CraftMesh.js';
import { ParticleSystem } from './craft/ParticleSystem.js';
import { PhysicsEngine } from './physics/PhysicsEngine.js';
import { SpatialHUD } from './ui/SpatialHUD.js';
import { CockpitHUD } from './ui/CockpitHUD.js';
import { OverlayUI } from './ui/OverlayUI.js';
import { AIRacer } from './ai/AIRacer.js';
import { CameraController, CAMERA_MODES } from './game/CameraController.js';
import { GameState, GAME_MODES, RACE_STATUS } from './game/GameState.js';
import { WakeTurbulenceSim } from './pipelines/WakeTurbulenceSim.js';
import { MeshletCulling } from './pipelines/MeshletCulling.js';
import { DualSenseHaptics } from './game/DualSenseHaptics.js';
import { NeuralTrajectorySystem } from './ai/neural-inference-engine.js';
import { NeuralAgentController } from './ai/neural-agent-controller.js';
import { DescentVectorNarrative } from './narrative/DescentVectorNarrative.js';
import { StartGridGantry } from './game/StartGridGantry.js';

// ============================================================================
// WIPEOUT: APHELION - MAIN APPLICATION & GAME ENGINE ORCHESTRATOR
// Multiple Render Target (MRT) Deferred Pipeline with 12-Tap Velocity Motion
// Blur, Dual-Kawase Bloom, AgX Film Tonemapping, TAA, and 2D Wave Lensing
// ============================================================================

class GameManager {
  constructor() {
    this.container = document.getElementById('canvas-container');

    // Configuration
    this.currentCircuitKey = 'neoShinjuku';
    this.currentTrackData = TRACK_CIRCUITS[this.currentCircuitKey];
    this.currentTeamKey = 'agSys'; // Default to AG-Systems Interceptor (Kaelen Voss / Akira Thorne)
    this.currentTeam = CRAFT_TEAMS[this.currentTeamKey];

    // Narrative & Start Grid Gantry
    this.narrative = new DescentVectorNarrative();
    this.startGantry = null;
    this.playerEliminated = false;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Rendering Pipelines (MRT Deferred + Post-Processing Graph)
    this.useDeferredMRT = true;
    this.deferredRenderer = null;
    this.composer = null;
    this.repulsorPass = null;

    // WebGPU Native Pipeline
    this.webgpuRenderGraph = null;
    this.webgpuPipeline = null;

    // Subsystems
    this.sound = new SoundEngine();
    this.particles = null;
    this.track = null;
    this.scenery = null;
    this.playerCraft = null;
    this.physics = null;
    this.spatialHUD = null;
    this.cockpitHUD = null;
    this.cameraController = null;
    this.gameState = null;
    this.ui = null;
    this.aiRacers = [];
    this.wakeTurbulence = null;
    this.meshletCulling = null;
    this.haptics = null;
    this.draftInfo = { isDrafting: false, dragCoefficient: 0.32, draftVelocity: 0, leader: null };
    this.webgpuDevice = null;
    this.neuralSystem = null;
    this.neuralController = null;

    // Inputs
    this.keys = {};
    this.touchInputs = {
      throttle: 0,
      steer: 0,
      leftBrake: 0,
      rightBrake: 0,
      boost: false
    };

    // Lights
    this.craftLight = null;

    // Timing
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupSubsystems();
    this.setupPostProcessing();
    this.setupWebGPUPipeline();
    this.setupInputs();
    this.setupUI();

    // Resize listener
    window.addEventListener('resize', () => this.onResize());

    // Start loop
    this.animate();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // AA handled via TAA in deferred pipeline
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080F);
    this.scene.fog = new THREE.FogExp2(0x06080F, 0.0007);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, 8000);
    this.scene.add(this.camera);
    this.scene.userData.activeCamera = this.camera;

    // Ambient Lighting
    const ambient = new THREE.AmbientLight(0x182030, 1.2);
    this.scene.add(ambient);

    // Directional Sunlight (Casts shadows from megastructures)
    const sunLight = new THREE.DirectionalLight(0xE0F0FF, 2.5);
    sunLight.position.set(400, 800, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 50;
    sunLight.shadow.camera.far = 2500;
    sunLight.shadow.camera.left = -500;
    sunLight.shadow.camera.right = 500;
    sunLight.shadow.camera.top = 500;
    sunLight.shadow.camera.bottom = -500;
    this.scene.add(sunLight);

    // Secondary colored rim light
    const rimLight = new THREE.DirectionalLight(0x7928CA, 1.4);
    rimLight.position.set(-500, -200, -400);
    this.scene.add(rimLight);
  }

  setupPostProcessing() {
    // 1. MRT DEFERRED RENDERER PIPELINE (4 Targets + Motion Vectors + Dual-Kawase Bloom + AgX + TAA)
    this.deferredRenderer = new DeferredRenderer(
      this.renderer,
      this.scene,
      this.camera,
      window.innerWidth,
      window.innerHeight
    );

    // 2. FORWARD EFFECT COMPOSER (Fallback / Comparative pipeline)
    this.composer = new EffectComposer(this.renderer);
    this.repulsorPass = new RepulsorWavePass(
      this.scene,
      this.camera,
      window.innerWidth,
      window.innerHeight
    );
    this.composer.addPass(this.repulsorPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.15,
      0.45,
      0.82
    );
    this.composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  setupWebGPUPipeline() {
    if (navigator.gpu) {
      navigator.gpu.requestAdapter()
        .then(adapter => adapter ? adapter.requestDevice() : null)
        .then(device => {
          if (device) {
            this.webgpuDevice = device;
            this.webgpuRenderGraph = new WebGPURenderGraph();
            this.webgpuRenderGraph.initialize(device, window.innerWidth, window.innerHeight);

            this.webgpuPipeline = new WebGPURepulsorPipeline();
            this.webgpuPipeline.initialize(device);

            if (this.neuralSystem && this.neuralSystem.backendName.includes('SIMD')) {
              this.neuralSystem.initialize(device);
            }
            console.log('WebGPU Native MRT Render Graph & Compute Lensing Active.');
          }
        })
        .catch(err => {
          console.log('WebGPU native pipeline operating in hybrid WebGL2 mode:', err);
        });
    }
  }

  setupSubsystems() {
    // 1. Particles
    this.particles = new ParticleSystem(this.scene);

    // 2. Track, Scenery & Pneumatic Start-Grid Gantry
    this.track = new TrackBuilder(this.scene, this.currentTrackData);
    this.scenery = new SceneryBuilder(this.scene, this.currentTrackData);
    this.startGantry = new StartGridGantry(this.scene, this.track);

    // 3. Player Craft
    this.playerCraft = new CraftMesh(this.scene, this.currentTeam, true);

    // Craft under-glow point light
    this.craftLight = new THREE.PointLight(this.currentTeam.primaryColor, 3.5, 25);
    this.playerCraft.group.add(this.craftLight);

    // 4. Physics Engine (120Hz fixed sub-stepping)
    this.physics = new PhysicsEngine(this.track, this.sound, this.particles);
    this.physics.setTeam(this.currentTeam);

    // 5. Diegetic Spatial UI & Cockpit HUD
    this.spatialHUD = new SpatialHUD(this.scene);
    this.cockpitHUD = new CockpitHUD(this.playerCraft.visualGroup);

    // 6. Camera Controller
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);

    // 7. Game State
    this.gameState = new GameState(this.sound);

    // 8. AI Rival Racers
    this.spawnAIRacers();

    // 9. Benchmark Advanced Systems: Wake Turbulence, Meshlet Culling, DualSense Haptics
    this.wakeTurbulence = new WakeTurbulenceSim(this.scene);
    this.meshletCulling = new MeshletCulling(this.camera);
    this.haptics = new DualSenseHaptics();

    if (this.track && this.track.trackMesh) {
      this.meshletCulling.buildMeshletsFromGeometry(this.track.trackMesh.geometry, this.track.trackMesh.matrixWorld);
    }

    // 10. WebNN / WebGPU Neural Trajectory Engine & Batched Agent Controller
    this.neuralSystem = new NeuralTrajectorySystem({
      batchSize: Math.max(8, this.aiRacers.length),
      inputDim: 48,
      outputDim: 5,
      modelPath: '/models/racing_policy_aphelion.onnx'
    });
    this.neuralController = new NeuralAgentController(this.neuralSystem, this.aiRacers.length, 48, 5);
    this.neuralSystem.initialize(this.webgpuDevice);

    // Start countdown & trigger Act comms
    this.gameState.startCountdown();
    const currentAct = this.narrative.getCurrentAct();
    if (currentAct && currentAct.commsFeed) {
      this.narrative.triggerComms(currentAct.commsFeed);
    }
  }

  spawnAIRacers() {
    this.aiRacers.forEach(ai => this.scene.remove(ai.craftMesh.group));
    this.aiRacers = [];

    const availableRivals = ['agSys', 'feisar', 'qirex', 'auricom', 'pirHana'].filter(t => t !== this.currentTeamKey);
    const rivalTeams = availableRivals.slice(0, 4);
    rivalTeams.forEach((teamKey, idx) => {
      const ai = new AIRacer(this.scene, this.track, teamKey, idx + 1);
      this.aiRacers.push(ai);
    });

    // Keep totalRacers in sync with actual grid (player + AI count)
    if (this.gameState) {
      this.gameState.totalRacers = 1 + this.aiRacers.length;
    }

    if (this.neuralController) {
      this.neuralController.setNumCrafts(this.aiRacers.length);
    }
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Resume Web Audio on first user interaction
      this.sound.resume();

      // Camera toggle: C or V
      if (e.code === 'KeyC' || e.code === 'KeyV') {
        const mode = this.cameraController.cycleMode();
        this.updateCameraUIVisibility(mode);
      }

      // Pipeline toggle: F
      if (e.code === 'KeyF') {
        const mode = this.toggleRenderMode();
        const pName = document.getElementById('pipeline-name');
        if (pName) pName.textContent = mode;
      }

      // Reset to start line: R
      if (e.code === 'KeyR') {
        this.restartRace();
      }

      // Mute audio: M
      if (e.code === 'KeyM') {
        this.toggleAudio();
      }

      // Settings menu: Escape
      if (e.code === 'Escape') {
        const modal = document.getElementById('menu-modal');
        if (modal) {
          modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
        }
      }

      // CORE 1: Tri-Vector Energy Diverter (1: Balanced, 2: Thrust, 3: Flux, 4: Barrier)
      if (e.code === 'Digit1') this.physics.setPowerProfile('BALANCED');
      if (e.code === 'Digit2') this.physics.setPowerProfile('THRUST');
      if (e.code === 'Digit3') this.physics.setPowerProfile('FLUX');
      if (e.code === 'Digit4') this.physics.setPowerProfile('BARRIER');

      // CORE 3: Friction Capacitor Discharges
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.physics.dischargeCapacitor('BURNOUT', this.aiRacers);
      }
      if (e.code === 'KeyX') {
        this.physics.dischargeCapacitor('EMP', this.aiRacers);
      }

      // CORE 5: Kinetic Component Jettison (-18% dry mass)
      if (e.code === 'KeyJ') {
        this.physics.triggerEmergencyJettison();
      }

      // CORE 4: Decoupled Kinetic Railgun Slug
      if (e.code === 'KeyK') {
        this.physics.fireRailgun(this.aiRacers);
      }
      if (e.code === 'Space' && this.physics.cobraActive) {
        this.physics.fireRailgun(this.aiRacers);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Pointer down resume audio & fire kinetic railgun on click
    window.addEventListener('pointerdown', (e) => {
      this.sound.resume();
      if (e.button === 0 && e.target.tagName === 'CANVAS') {
        this.physics.fireRailgun(this.aiRacers);
      }
    });
  }

  setupUI() {
    this.ui = new OverlayUI(this);
  }

  toggleRenderMode() {
    this.useDeferredMRT = !this.useDeferredMRT;
    return this.useDeferredMRT ? 'MRT DEFERRED' : 'FORWARD COMPOSER';
  }

  setTouchInput(name, val) {
    this.sound.resume();
    this.touchInputs[name] = val;
  }

  cycleCamera() {
    const mode = this.cameraController.cycleMode();
    this.updateCameraUIVisibility(mode);
    return mode;
  }

  updateCameraUIVisibility(mode) {
    const camNameEl = document.getElementById('cam-name');
    if (camNameEl) camNameEl.textContent = mode;

    if (mode === CAMERA_MODES.COCKPIT) {
      this.cockpitHUD.setVisible(true);
      this.spatialHUD.setVisible(false);
    } else {
      this.cockpitHUD.setVisible(false);
      this.spatialHUD.setVisible(mode !== CAMERA_MODES.BROADCAST_DRONE);
    }
  }

  toggleAudio() {
    this.sound.resume();
    return this.sound.toggleMute();
  }

  restartRace() {
    this.physics.resetToStart();
    this.playerEliminated = false;
    this.gameState.startCountdown();
    this.aiRacers.forEach(ai => {
      ai.initPosition();
      ai.isEliminated = false;
      ai.eliminationTriggered = false;
    });

    if (this.startGantry) {
      this.startGantry.clampExtension = 1.0;
      this.startGantry.empPulseActive = false;
    }

    const currentAct = this.narrative.getCurrentAct();
    if (currentAct && currentAct.commsFeed) {
      this.narrative.triggerComms(currentAct.commsFeed);
    }
  }

  reconfigure(circuitKey, teamKey, modeKey) {
    if (circuitKey && TRACK_CIRCUITS[circuitKey]) {
      this.currentCircuitKey = circuitKey;
      this.currentTrackData = TRACK_CIRCUITS[circuitKey];

      this.scene.remove(this.track.trackMesh);
      this.scene.remove(this.scenery.cityGroup);
      if (this.startGantry && this.startGantry.gantryGroup) {
        this.scene.remove(this.startGantry.gantryGroup);
      }

      this.track = new TrackBuilder(this.scene, this.currentTrackData);
      this.scenery = new SceneryBuilder(this.scene, this.currentTrackData);
      this.startGantry = new StartGridGantry(this.scene, this.track);
      this.physics.track = this.track;

      if (circuitKey === 'neoShinjuku') this.narrative.unlockAct(0);
      else if (circuitKey === 'tycho') this.narrative.unlockAct(1);
      else if (circuitKey === 'aphelionPrime') this.narrative.unlockAct(2);

      if (this.meshletCulling && this.track.trackMesh) {
        this.meshletCulling.meshlets = [];
        this.meshletCulling.buildMeshletsFromGeometry(this.track.trackMesh.geometry, this.track.trackMesh.matrixWorld);
      }

      const circuitInfo = document.getElementById('circuit-info');
      if (circuitInfo) {
        circuitInfo.textContent = `${this.currentTrackData.name} // ${this.currentTrackData.subtitle}`;
      }
    }

    if (teamKey && CRAFT_TEAMS[teamKey]) {
      this.currentTeamKey = teamKey;
      this.currentTeam = CRAFT_TEAMS[teamKey];

      this.scene.remove(this.playerCraft.group);
      this.playerCraft = new CraftMesh(this.scene, this.currentTeam, true);
      this.craftLight.color.setHex(this.currentTeam.primaryColor);
      this.playerCraft.group.add(this.craftLight);
      this.cockpitHUD = new CockpitHUD(this.playerCraft.visualGroup);
      this.updateCameraUIVisibility(this.cameraController.mode);
    }

    if (modeKey && GAME_MODES[modeKey]) {
      this.gameState.mode = GAME_MODES[modeKey];
    }

    this.spawnAIRacers();
    this.restartRace();
  }

  pollInputs() {
    let throttle = 0;
    let steer = 0;
    let pitch = 0;
    let leftBrake = 0;
    let rightBrake = 0;
    let boost = false;

    // 1. Keyboard Inputs
    if (this.keys['KeyW'] || this.keys['ArrowUp']) {
      throttle += 1.0;
      pitch += 0.35;
    }
    if (this.keys['KeyS'] || this.keys['ArrowDown']) {
      throttle -= 0.6;
      pitch -= 1.0; // Violent pitch-up (Cobra trigger requirement)
    }
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) steer -= 1.0;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) steer += 1.0;

    // Independent Vector Airbrakes
    if (this.keys['KeyQ']) leftBrake = 1.0;
    if (this.keys['KeyE']) rightBrake = 1.0;

    // Boost (contextual: Hyper-Boost normally, or Railgun fire during Cobra)
    if (this.keys['Space'] && !this.physics.cobraActive) boost = true;

    // 2. Touch Inputs
    if (this.touchInputs.throttle !== 0) throttle = this.touchInputs.throttle;
    if (this.touchInputs.steer !== 0) steer = this.touchInputs.steer;
    if (this.touchInputs.leftBrake > 0) leftBrake = this.touchInputs.leftBrake;
    if (this.touchInputs.rightBrake > 0) rightBrake = this.touchInputs.rightBrake;
    if (this.touchInputs.boost) boost = true;

    // 3. Gamepad API
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gamepads && gamepads[0]) {
      const gp = gamepads[0];
      if (Math.abs(gp.axes[0]) > 0.15) steer = gp.axes[0];
      if (Math.abs(gp.axes[1]) > 0.15) pitch = -gp.axes[1];

      if (gp.buttons[6]) leftBrake = Math.max(leftBrake, gp.buttons[6].value);
      if (gp.buttons[7]) rightBrake = Math.max(rightBrake, gp.buttons[7].value);

      if (gp.buttons[0] && gp.buttons[0].pressed) throttle = 1.0;
      if (gp.buttons[2] && gp.buttons[2].pressed) throttle = -0.6;
      if (gp.buttons[1] && gp.buttons[1].pressed) {
        if (this.physics.cobraActive) {
          this.physics.fireRailgun(this.aiRacers);
        } else {
          boost = true;
        }
      }

      // D-Pad Tri-Vector power switching: Up=Balanced, Right=Thrust, Down=Flux, Left=Barrier
      if (gp.buttons[12] && gp.buttons[12].pressed) this.physics.setPowerProfile('BALANCED');
      if (gp.buttons[15] && gp.buttons[15].pressed) this.physics.setPowerProfile('THRUST');
      if (gp.buttons[13] && gp.buttons[13].pressed) this.physics.setPowerProfile('FLUX');
      if (gp.buttons[14] && gp.buttons[14].pressed) this.physics.setPowerProfile('BARRIER');

      // Bumpers for Friction Capacitor discharge: LB=Burnout, RB=EMP
      if (gp.buttons[4] && gp.buttons[4].pressed) this.physics.dischargeCapacitor('BURNOUT', this.aiRacers);
      if (gp.buttons[5] && gp.buttons[5].pressed) this.physics.dischargeCapacitor('EMP', this.aiRacers);

      // Y button: Emergency Component Jettison
      if (gp.buttons[3] && gp.buttons[3].pressed) this.physics.triggerEmergencyJettison();
    }

    return { throttle, steer, pitch, leftBrake, rightBrake, boost };
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Poll Inputs
    const inputs = this.pollInputs();

    const isRacing = this.gameState.status === RACE_STATUS.RACING;
    const effectiveThrottle = isRacing ? inputs.throttle : 0;

    this.physics.setInputs(
      effectiveThrottle,
      inputs.steer,
      inputs.pitch,
      inputs.leftBrake,
      inputs.rightBrake,
      inputs.boost
    );

    // 2. 120Hz Sub-Stepping Physics Update
    const renderAlpha = this.physics.update(delta);

    // 2b. Start-Grid Pneumatic Gantry & Cryogenic Vapor Update
    if (this.startGantry) {
      this.startGantry.update(delta, this.gameState.countdownTime, this.gameState.status);
    }

    // 2c. Narrative & Neuro-Link Comms Controller Update
    if (this.narrative) {
      this.narrative.update(delta);
    }

    // 3. Interpolated Render Transform for Player Craft
    const { pos: interpPos, quat: interpQuat } = this.physics.getInterpolatedTransform(renderAlpha);
    this.playerCraft.group.position.copy(interpPos);
    this.playerCraft.group.quaternion.copy(interpQuat);

    const speedKmh = this.physics.getSpeedKmh();
    const speedRatio = speedKmh / this.currentTeam.maxSpeedKmh;

    // 3b. G-Force Vector Computation
    const gForce = {
      lateral: -inputs.steer * (speedRatio * 3.5),
      longitudinal: (this.physics.isBoosting ? 4.5 : effectiveThrottle * 2.2) - (this.physics.leftAirbrake + this.physics.rightAirbrake) * 3.0,
      magnitude: 1.0 + Math.abs(inputs.steer * 2.8) + (this.physics.isBoosting ? 3.5 : 0)
    };

    // 4. Update Kinetic Articulation of Player Craft (16-Surface Rig, Canards, Flaps, Nozzles, Shield, Mach Cone, Ribbons, Pilot IK)
    const trackApexTarget = this.track ? this.track.getPointAt((this.physics.currentTrackU + 0.05) % 1.0) : null;
    this.playerCraft.updateKineticState(
      delta,
      inputs.steer,
      this.physics.leftAirbrake,
      this.physics.rightAirbrake,
      speedRatio,
      this.physics.isBoosting,
      this.physics.shieldHealth,
      trackApexTarget,
      gForce,
      inputs.pitch
    );

    // Dynamic Conformal Hex Shield Impact on Wall / Barrier Scrape
    if (this.physics.isWallScraping && Math.random() < 0.35) {
      const craftRightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(interpQuat);
      const impactContact = interpPos.clone().addScaledVector(craftRightVec, (inputs.steer >= 0 ? 1 : -1) * 1.5);
      this.playerCraft.triggerShieldImpact(impactContact, 0.75);
    }

    // Player Elimination Check
    if (this.physics.shieldHealth <= 0 && !this.playerEliminated) {
      this.playerEliminated = true;
      this.particles.triggerElimination(interpPos, this.physics.vel, this.currentTeam.primaryColor);
      this.cameraController.triggerEliminationReplay(interpPos, 3.2);
    }

    // 5. Update AI Racers with Batched Neural Trajectory Policy
    if (isRacing) {
      if (this.neuralController) {
        this.neuralController.updateTick(this.aiRacers, this.track, this.playerCraft);
      }
      this.aiRacers.forEach(ai => {
        ai.update(delta, interpPos, this.physics.currentTrackU, this.aiRacers);
        if (ai.isEliminated && !ai.barricadeDeployed) {
          ai.barricadeDeployed = true;
          this.physics.deployEnergyBarricade(ai.pos);
        }
      });
    }

    // 5b. Update Fluid Wake Simulation & Slipstream Drafting
    const craftFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(interpQuat);
    const craftRight = new THREE.Vector3(1, 0, 0).applyQuaternion(interpQuat);

    if (this.wakeTurbulence) {
      // Inject player craft wake
      this.wakeTurbulence.injectCraftWake(interpPos, craftFwd, craftRight, speedKmh, effectiveThrottle);

      // Inject AI crafts' wake for multi-craft turbulence
      this.aiRacers.forEach(ai => {
        const aiFwd = new THREE.Vector3(0, 0, 1).applyQuaternion(ai.quat);
        const aiRight = new THREE.Vector3(1, 0, 0).applyQuaternion(ai.quat);
        this.wakeTurbulence.injectCraftWake(ai.pos, aiFwd, aiRight, ai.speedKmh, 1.0);
      });

      // Evaluate slipstream drafting against leaders (Cd: 0.32 -> 0.18 when u · v > 45 m/s)
      this.draftInfo = this.wakeTurbulence.evaluateSlipstream(
        interpPos,
        this.physics.vel,
        craftFwd,
        this.aiRacers
      );
      this.physics.dragCoefficient = this.draftInfo.dragCoefficient;
      this.wakeTurbulence.update(delta);
    }

    // 5c. GPU Meshlet Occlusion Culling
    if (this.meshletCulling) {
      this.meshletCulling.cull();
    }

    // 6. Update Game State
    this.gameState.update(delta, this.physics.currentTrackU, speedKmh, this.aiRacers);

    // 7. Update Track & Environment
    this.track.update(speedKmh, this.physics.currentTrackU);
    this.scenery.update(delta);

    // 8. Update Particles
    this.particles.update(delta);

    // 9. Update Dynamic Audio Synthesis (MHD engine, airbrakes, slipstream whistle)
    this.sound.update(
      speedKmh,
      effectiveThrottle,
      this.physics.leftAirbrake + this.physics.rightAirbrake,
      this.physics.shieldHealth,
      this.physics.isBoosting,
      this.draftInfo.isDrafting
    );

    // 10. Update Camera
    this.cameraController.update(
      delta,
      interpPos,
      this.physics.vel,
      interpQuat,
      speedKmh,
      this.physics.isWallScraping,
      this.physics.isBoosting
    );

    // 11. Update 3D Diegetic Spatial UI & Cockpit HUD
    this.spatialHUD.update(
      delta,
      interpPos,
      this.physics.vel,
      interpQuat,
      speedKmh,
      this.physics.shieldHealth,
      this.gameState.currentLap,
      this.gameState.maxLaps,
      this.gameState.currentPosition,
      this.gameState.totalRacers,
      this.physics.isBoosting,
      this.physics.inVacuumRift,
      this.physics
    );

    const rivalsRadar = this.aiRacers.map(ai => {
      const rel = ai.pos.clone().sub(interpPos).applyQuaternion(interpQuat.clone().invert());
      return { relX: rel.x, relZ: rel.z };
    });

    this.cockpitHUD.update(
      speedKmh,
      gForce,
      this.physics.shieldHealth,
      this.physics.boostTimer > 0 ? this.physics.boostTimer / 2.2 : 1.0,
      this.physics.leftAirbrake + this.physics.rightAirbrake,
      rivalsRadar,
      this.physics
    );

    // 12. Update UI DOM Elements & In-Flight Neuro-Link Comms
    const activeComms = this.narrative ? this.narrative.getActiveComms() : null;
    this.ui.update(this.gameState, this.physics, this.cameraController.mode, this.aiRacers, activeComms);

    // 13. UPDATE REPULSOR MULTI-PASS GRAVITATIONAL LENSING TELEMETRY
    const downwardForce = THREE.MathUtils.clamp(
      0.85 + (effectiveThrottle * 0.4) + (this.physics.isBoosting ? 0.9 : 0.0),
      0.2,
      1.8
    );

    const isBrakingHard = (this.physics.leftAirbrake + this.physics.rightAirbrake) > 0.25;
    const thermalColor = isBrakingHard
      ? new THREE.Color(0xFF3B00)
      : new THREE.Color(this.currentTeam.primaryColor);

    if (this.repulsorPass) {
      this.repulsorPass.updateCraftTelemetry(interpPos, this.camera, downwardForce, thermalColor, 1.25);
    }

    // 13b. DualSense Advanced Haptics Update
    if (this.haptics) {
      this.haptics.update(
        speedKmh,
        effectiveThrottle,
        this.physics.leftAirbrake + this.physics.rightAirbrake,
        downwardForce,
        this.physics.isWallScraping
      );
    }

    // 14. EXECUTE RENDERING GRAPH
    if (this.useDeferredMRT && this.deferredRenderer) {
      // Multiple Render Target (MRT) Deferred Lighting + Velocity Motion Blur + Dual-Kawase Bloom + AgX + TAA
      this.deferredRenderer.execute(speedKmh, this.repulsorPass);
    } else {
      // Forward EffectComposer
      this.composer.render();
    }
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);

    if (this.repulsorPass) {
      this.repulsorPass.setSize(w, h);
    }
    if (this.deferredRenderer) {
      this.deferredRenderer.setSize(w, h);
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.aphelionGame = new GameManager();
});
