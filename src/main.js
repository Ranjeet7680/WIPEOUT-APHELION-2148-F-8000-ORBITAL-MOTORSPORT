import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { CityCircuit } from './track/CityCircuit.js';
import { CoastlineCircuit } from './track/CoastlineCircuit.js';
import { FujiSkywayCircuit } from './track/FujiSkywayCircuit.js';
import { NeoShinjukuWorld } from './world/NeoShinjukuWorld.js';
import { CoastlineWorld } from './world/CoastlineWorld.js';
import { FujiSkywayWorld } from './world/FujiSkywayWorld.js';
import { getSectorDefinition } from './track/TrackData.js';
import { FuturisticVehicle, VEHICLE_CATALOG } from './craft/FuturisticVehicle.js';
import { ArcadeRacingPhysics } from './physics/ArcadeRacingPhysics.js';
import { TrafficSystem } from './traffic/TrafficSystem.js';
import { RivalRacersSystem } from './ai/RivalRacersSystem.js';
import { CameraController, CAMERA_MODES } from './game/CameraController.js';
import { GameState, RACE_STATUS } from './game/GameState.js';
import { GarageLobbyScene } from './world/GarageLobbyScene.js';
import { PodiumScene } from './world/PodiumScene.js';
import { CinematicUI } from './ui/CinematicUI.js';
import { HolographicMinimap } from './ui/HolographicMinimap.js';
import { FullWorldMap } from './ui/FullWorldMap.js';
import { CyberpunkAudioEngine } from './audio/CyberpunkAudioEngine.js';

import { saveManager } from './game/SaveManager.js';
import { VFXSystem } from './effects/VFXSystem.js';
import { VectorInstructor } from './tutorial/VectorInstructor.js';
import { TutorialManager } from './tutorial/TutorialManager.js';
import { FirstTimeCinematic } from './game/FirstTimeCinematic.js';
import { backendService } from './backend/BackendService.js';
import { HolographicGhostVehicle } from './craft/HolographicGhostVehicle.js';

// ============================================================================
// NEO-SHINJUKU RIFT: HYPER CIRCUIT // AETHER-9
// DEVELOPED BY RANJEET KUMAR
// First-Time Player Detection -> First-Time Cinematic -> Aether Driver Academy
// -> 3D Lobby HQ -> Car Select -> Match Prep -> Race Intro -> 120Hz Stunts & Racing -> Podium -> Winning HQ
// ============================================================================

class GameManager {
  constructor() {
    this.container = document.getElementById('canvas-container');

    // App state machine
    // 'LOADING', 'WELCOME_FIRST', 'CINEMATIC_INTRO', 'TUTORIAL', 'LOBBY', 'CAR_SELECT', 'GARAGE', 'MATCH_PREP', 'RACE_INTRO', 'COUNTDOWN', 'RACING', 'PAUSED', 'FINISH', 'RESULTS', 'PODIUM', 'WINNING_LOBBY'
    this.state = 'LOADING';

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.clock = new THREE.Clock();

    // Lighting
    this.sunLight = null;

    // Subsystems
    this.sound = null;
    this.currentSectorId = 'district';
    this.circuit = null;
    this.world = null;
    this.traffic = null;
    this.rivals = null;
    this.playerVehicle = null;
    this.physics = null;
    this.cameraController = null;
    this.gameState = null;

    // 3D Presentation Environments
    this.garageLobby = null;
    this.podiumScene = null;

    // UI Systems
    this.ui = null;
    this.minimap = null;
    this.worldMap = null;

    // First-Time & Academy Systems
    this.vfx = null;
    this.vector = null;
    this.tutorial = null;
    this.cinematicIntro = null;
    this.ghostVehicle = null;

    // Timers & progression
    this.loadingProgress = 0;
    this.raceIntroTimer = 0;
    this.finishTimer = 0;
    this.trafficCollisionCooldown = 0.0;
    this.saveManager = saveManager;
    this.winStreak = saveManager.data.player.winStreak || 3;
    this.playerLevel = saveManager.data.player.level || 87;
    this.playerXP = saveManager.data.player.xp || 8450;
    this.rewardsAwardedForRace = false;

    // Inputs
    this.keys = {};
    this.touchInputs = { throttle: 0, steer: 0, brake: 0, drift: false, boost: false };

    // Pre-allocated math vectors to eliminate garbage collection micro-stutters
    this._rearOffsetL = new THREE.Vector3(-1.1, 0.4, -2.2);
    this._rearOffsetR = new THREE.Vector3(1.1, 0.4, -2.2);
    this._rearPosL = new THREE.Vector3();
    this._rearPosR = new THREE.Vector3();
    this._driftDir = new THREE.Vector3();
    this._hitNorm = new THREE.Vector3();

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupLighting();
    this.setupPostProcessing();
    this.setupSubsystems();
    this.setupUI();
    this.setupInputs();

    window.addEventListener('resize', () => this.onResize());

    // Begin cinematic loading flow
    this.startLoadingFlow();

    // Simulation loop
    this.animate();
  }

  setupRenderer() {
    this.isMobile = typeof navigator !== 'undefined' && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const initialDpr = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.25);
    this.renderer.setPixelRatio(initialDpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
    this.renderer.shadowMap.enabled = false; // Disabled for silky smooth 60-144 FPS in night cityscape

    this.container.appendChild(this.renderer.domElement);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050a14);
    this.scene.fog = new THREE.FogExp2(0x06111f, 0.00028);

    // Camera near 0.5 prevents near-plane surface slicing and barrier clipping
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 10000);
    this.scene.add(this.camera);
  }

  setupLighting() {
    // Rich cyberpunk night ambient contrast with enhanced road & vehicle luminance
    const ambient = new THREE.AmbientLight(0x344660, 2.1);
    this.scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0x50E8FF, 0x1E2B3E, 1.55);
    this.scene.add(hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xE2F0FF, 2.6);
    this.sunLight.position.set(350, 1600, 450);
    this.sunLight.target.position.set(0, 150, 0);
    this.scene.add(this.sunLight.target);
    this.sunLight.castShadow = false;
    this.scene.add(this.sunLight);

    const rimLight = new THREE.DirectionalLight(0x9D4EDD, 1.75);
    rimLight.position.set(-500, 600, -400);
    this.scene.add(rimLight);
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // High-performance half-resolution bloom pass (4x faster fill-rate with smoother blur!)
    const bloomW = Math.max(256, Math.floor(window.innerWidth * 0.5));
    const bloomH = Math.max(256, Math.floor(window.innerHeight * 0.5));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(bloomW, bloomH),
      0.40,
      0.78,
      0.45
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  setGraphicsQuality(quality = 'HIGH') {
    this.graphicsQuality = quality;
    saveManager.updateSettings({ graphicsQuality: quality });

    switch (quality) {
      case 'LOW':
        // Rock-solid 144 FPS turbo mode (Direct hardware WebGL, zero-overhead shaders)
        this.renderer.setPixelRatio(1.0);
        this.renderer.shadowMap.enabled = false;
        this.skipComposer = true;
        if (this.bloomPass) this.bloomPass.enabled = false;
        if (this.vfx) this.vfx.setQuality('LOW');
        break;

      case 'MEDIUM':
        // Smooth 120-144 FPS balanced mode (Direct hardware WebGL + ACES tonemapping)
        this.renderer.setPixelRatio(1.0);
        this.renderer.shadowMap.enabled = false;
        this.skipComposer = true;
        if (this.bloomPass) this.bloomPass.enabled = false;
        if (this.vfx) this.vfx.setQuality('MEDIUM');
        break;

      case 'HIGH':
      default:
        // High-definition 120-144 FPS (Direct hardware WebGL + full particle fidelity)
        this.renderer.setPixelRatio(1.0);
        this.renderer.shadowMap.enabled = false;
        this.skipComposer = true;
        if (this.bloomPass) this.bloomPass.enabled = false;
        if (this.vfx) this.vfx.setQuality('HIGH');
        break;

      case 'ULTRA':
        // Cinematic Studio Bloom preset (Post-processing EffectComposer)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
        this.renderer.shadowMap.enabled = false;
        this.skipComposer = false;
        if (this.bloomPass) {
          this.bloomPass.enabled = true;
          this.bloomPass.strength = 0.35;
          this.bloomPass.threshold = 0.80;
        }
        if (this.vfx) this.vfx.setQuality('ULTRA');
        break;
    }

    if (this.ui && this.ui.syncSettingsDisplay) {
      this.ui.syncSettingsDisplay();
    }
  }

  toggleFpsCounter(forceState = null) {
    const nextState = forceState !== null ? forceState : !this.showFps;
    this.showFps = nextState;
    saveManager.updateSettings({ showFps: nextState });
    if (this.ui && this.ui.setFpsCounterVisible) {
      this.ui.setFpsCounterVisible(nextState);
    }
    return nextState;
  }

  setLobbyTheme(theme) {
    this.lobbyTheme = theme;
    saveManager.updateSettings({ lobbyTheme: theme });
    if (this.sound && this.sound.setLobbyTheme) {
      this.sound.setLobbyTheme(theme);
    }
    if (this.ui && this.ui.syncSettingsDisplay) {
      this.ui.syncSettingsDisplay();
    }
  }

  setControlScheme(scheme) {
    this.controlScheme = scheme;
    saveManager.updateSettings({ controlScheme: scheme });
    if (this.ui) {
      if (scheme === 'TOUCH') {
        this.ui.setTouchControlsVisible(true);
      } else {
        this.ui.setTouchControlsVisible(this.isMobile);
      }
    }
  }

  setupSubsystems() {
    // 1. Audio Engine
    this.sound = new CyberpunkAudioEngine();

    // 2. 3D Environments
    this.garageLobby = new GarageLobbyScene(this.scene);
    this.podiumScene = new PodiumScene(this.scene);

    // 3. Track Circuit & World Environment
    this.circuit = new CityCircuit(this.scene);
    this.world = new NeoShinjukuWorld(this.scene, this.circuit);

    // 4. Hero Player Vehicle
    this.playerVehicle = new FuturisticVehicle(this.scene, true, 'f8000');
    // Mount initially on garage turntable
    this.garageLobby.turntable.add(this.playerVehicle.group);
    this.playerVehicle.group.position.set(0, 0.95, 0);

    // 5. Arcade Racing Physics (120Hz fixed sub-stepping)
    this.physics = new ArcadeRacingPhysics(this.circuit, this.sound);
    this.physics.applyVehicleSpecs(this.playerVehicle.spec);

    // 6. Civilian Traffic & 7 AI Rivals (8 racers total)
    this.traffic = new TrafficSystem(this.scene, this.circuit);
    this.rivals = new RivalRacersSystem(this.scene, this.circuit);

    // Hide track, world, traffic, and rivals during initial garage lobby
    this.setTrackVisible(false);
    this.podiumScene.hide();

    // 7. Dynamic Camera & Game State
    this.cameraController = new CameraController(this.camera, this.renderer.domElement, this.circuit);
    this.cameraController.onCameraChange = (mode) => {
      if (this.ui) this.ui.updateCameraBadge(mode);
    };
    this.gameState = new GameState(this.sound);
    this.gameState.totalRacers = 8;
    this.gameState.onLapAdvance = (newLap) => {
      if (this.circuit && this.circuit.setLap) {
        this.circuit.setLap(newLap);
      }
    };

    // 8. VFX, Vector & Tutorial Managers
    this.vfx = new VFXSystem(this.scene, this.camera);
    this.vector = new VectorInstructor(this.sound);
    this.tutorial = new TutorialManager(this, this.vector);
    this.cinematicIntro = new FirstTimeCinematic(this);

    // Apply saved settings (Quality, Audio volumes, FPS, Control Scheme)
    const savedSettings = saveManager.getSettings();
    const defaultQuality = this.isMobile ? 'MEDIUM' : 'HIGH';
    this.setGraphicsQuality(savedSettings.graphicsQuality || defaultQuality);
    this.showFps = savedSettings.showFps !== undefined ? !!savedSettings.showFps : true;
    this.controlScheme = savedSettings.controlScheme || (this.isMobile ? 'TOUCH' : 'KEYBOARD');
    if (this.sound) {
      if (savedSettings.sfxVolume !== undefined) this.sound.setSfxVolume(savedSettings.sfxVolume);
      if (savedSettings.musicVolume !== undefined) this.sound.setMusicVolume(savedSettings.musicVolume);
      this.lobbyTheme = savedSettings.lobbyTheme || 'CHASE_THE_HORIZON';
      if (this.sound.setLobbyTheme) this.sound.setLobbyTheme(this.lobbyTheme);
    }

    // 9. Holographic Ghost Vehicle (Time-Attack Replay)
    this.ghostVehicle = new HolographicGhostVehicle(this.scene, this.circuit);
    this.ghostVehicle.enabled = saveManager.getSettings().ghostEnabled !== false;

    // Load active ghost telemetry from backend
    backendService.getGhostTelemetry().then(ghostData => {
      if (ghostData && this.ghostVehicle) {
        this.ghostVehicle.loadTelemetry(ghostData);
      }
    });
  }

  setupUI() {
    this.ui = new CinematicUI(this);
    this.minimap = new HolographicMinimap('hud-minimap-canvas', this.circuit);
    this.worldMap = new FullWorldMap(this);

    // Synchronize initial FPS meter visibility
    if (this.ui && this.ui.setFpsCounterVisible) {
      this.ui.setFpsCounterVisible(this.showFps);
    }

    // Action listener connects physics stunt rewards to UI popups
    this.physics.onAction = (name, points, combo) => {
      this.ui.showActionPopup(name, points, combo);
    };
  }

  ensureGameFocus() {
    if (typeof document !== 'undefined') {
      const active = document.activeElement;
      if (active && active !== document.body && active.blur && active.tagName !== 'INPUT') {
        active.blur();
      }
    }
    if (typeof window !== 'undefined' && window.focus) {
      window.focus();
    }
  }

  setupInputs() {
    const setKey = (codeOrKey, val) => {
      if (!codeOrKey) return;
      this.keys[codeOrKey] = val;
      if (typeof codeOrKey === 'string') {
        this.keys[codeOrKey.toLowerCase()] = val;
        this.keys[codeOrKey.toUpperCase()] = val;
      }
    };

    const ensureGameFocus = () => this.ensureGameFocus();

    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.tabIndex = 0;
      this.renderer.domElement.style.outline = 'none';
      this.renderer.domElement.addEventListener('pointerdown', ensureGameFocus);
    }
    if (this.container) {
      this.container.addEventListener('pointerdown', ensureGameFocus);
    }

    window.addEventListener('keydown', (e) => {
      if (e.code) setKey(e.code, true);
      if (e.key) setKey(e.key, true);

      if (this.sound) this.sound.resume();

      // Prevent page scrolling on driving keys during active race/countdown
      const isRacingState = (this.state === 'RACING' || this.state === 'TUTORIAL' || this.state === 'COUNTDOWN');
      const drivingCodes = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
      const drivingKeys = ['w', 's', 'a', 'd', 'W', 'S', 'A', 'D', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Up', 'Down', 'Left', 'Right'];
      if (isRacingState && (drivingCodes.includes(e.code) || drivingKeys.includes(e.key))) {
        e.preventDefault();
      }

      const isKeyV = e.code === 'KeyV' || e.key === 'v' || e.key === 'V';
      if (isKeyV) {
        if (this.state === 'RACING' || this.state === 'TUTORIAL') {
          const mode = this.cameraController.togglePerspective();
          if (this.sound && this.sound.playCameraSwitchSound) {
            this.sound.playCameraSwitchSound();
          }
          if (this.ui) this.ui.updateCameraBadge(mode);
        }
      }

      const isKeyC = e.code === 'KeyC' || e.key === 'c' || e.key === 'C';
      if (isKeyC) {
        if (this.state === 'RACING' || this.state === 'TUTORIAL') {
          const mode = this.cameraController.cycleMode();
          if (this.sound && this.sound.playCameraSwitchSound) {
            this.sound.playCameraSwitchSound();
          }
          if (this.ui) this.ui.updateCameraBadge(mode);
        }
      }

      const isKeyR = e.code === 'KeyR' || e.key === 'r' || e.key === 'R';
      if (isKeyR && (this.state === 'RACING' || this.state === 'TUTORIAL')) {
        if (e.shiftKey) {
          this.restartRace();
        } else if (this.physics && this.physics.resetToTrackCenter) {
          const respawnU = (this.gameState && this.gameState.lastCheckpointU > 0) ? this.gameState.lastCheckpointU : this.physics.currentU;
          this.physics.resetToTrackCenter(respawnU);
        }
      }

      if (e.code === 'F3' || e.key === 'F3') {
        e.preventDefault();
        this.toggleFpsCounter();
      }

      const isKeyM = e.code === 'KeyM' || e.key === 'm' || e.key === 'M';
      if (isKeyM) {
        if (this.ui) {
          if (this.ui.currentScreen === 'WORLD_MAP' || this.ui.currentScreen === 'EVENT_SELECT') {
            this.ui.showScreen('LOBBY');
          } else if (this.state === 'LOBBY') {
            this.ui.showWorldMap();
          }
        }
      }

      const isKeyG = e.code === 'KeyG' || e.key === 'g' || e.key === 'G';
      if (isKeyG) {
        if (this.state === 'LOBBY') {
          this.ui.showScreen('GARAGE');
        }
      }

      const isConfirmKey = e.code === 'Space' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter';
      if (isConfirmKey) {
        if (this.state === 'MATCH_PREP') {
          this.skipMatchmaking();
        } else if (this.state === 'PRE_RACE_LOADING') {
          this.skipPreRaceLoading();
        } else if (this.state === 'RACE_INTRO') {
          this.skipRaceIntro();
        } else if (this.state === 'POST_RACE_LOADING') {
          this.skipPostRaceLoading();
        } else if (this.state === 'PUBG_REWARDS') {
          if (this.ui && this.ui.claimPubgRewards) this.ui.claimPubgRewards();
        } else if (this.state === 'PODIUM') {
          this.startPostRaceLoading(() => this.showPubgRewards());
        }
      }

      if (e.code === 'Escape') {
        if (this.state === 'RACING' || this.state === 'TUTORIAL') {
          this.togglePause();
        } else if (this.state === 'PAUSED') {
          this.togglePause();
        } else if (this.state === 'RACE_INTRO') {
          this.skipRaceIntro();
        } else if (this.state === 'CINEMATIC_INTRO') {
          if (this.cinematicIntro) this.cinematicIntro.skip();
        } else if (this.ui && this.ui.currentScreen === 'ROYAL_PASS') {
          this.ui.hideRoyalPassScreen();
        } else if (this.ui && ['WORLD_MAP', 'EVENT_SELECT', 'LEADERBOARD', 'SETTINGS', 'DRIVING_SCHOOL', 'CAR_SELECT', 'GARAGE', 'CAREER', 'EVENTS'].includes(this.ui.currentScreen)) {
          this.ui.showScreen('LOBBY');
          if (this.garageLobby) this.garageLobby.setCameraAnglePreset('FRONT');
        } else if (this.worldMap && this.worldMap.isOpen) {
          this.worldMap.close();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code) setKey(e.code, false);
      if (e.key) setKey(e.key, false);
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.touchInputs = { throttle: 0, steer: 0, brake: 0, drift: false, boost: false, airbrakeLeft: false, airbrakeRight: false, energyBrake: false };
    });

    window.addEventListener('focus', () => {
      this.keys = {};
    });

    window.addEventListener('pointerdown', () => {
      if (this.sound) this.sound.resume();
      ensureGameFocus();
    });
  }

  startLoadingFlow() {
    this.state = 'LOADING';
    this.garageLobby.show();
    this.garageLobby.setCameraAnglePreset('FRONT');

    // 1. Show developer credit
    this.ui.showDeveloperCredit(() => {
      // 2. Progressive loading bar animation
      let p = 0;
      const loadInterval = setInterval(() => {
        p += 5 + Math.random() * 8;
        if (p >= 100) {
          p = 100;
          clearInterval(loadInterval);
          this.ui.updateLoadingProgress(100, 'SYSTEM READY // WELCOME PILOT');

          setTimeout(() => {
            // First-time player detection!
            if (saveManager.isFirstLaunch()) {
              this.state = 'WELCOME_FIRST';
              this.ui.showFirstTimeWelcome();
              this.sound.setMusicState('LOBBY');
            } else {
              // Returning player: go straight to lobby
              this.state = 'LOBBY';
              this.ui.showScreen('LOBBY');
              this.sound.setMusicState('LOBBY');
            }
          }, 600);
        } else {
          let statusText = 'INITIALIZING AETHER-9';
          if (p > 25) statusText = 'COMPILING QUANTUM SHADERS';
          if (p > 55) statusText = 'STARTING INDUCTION COILS';
          if (p > 85) statusText = 'CONNECTING TO NEO-SHINJUKU GRID';
          this.ui.updateLoadingProgress(p, statusText);
        }
      }, 70);
    });
  }

  startFirstTimeCinematicAndTutorial() {
    this.state = 'CINEMATIC_INTRO';
    this.cinematicIntro.start(() => {
      this.launchTutorial(true, null);
    });
  }

  launchTutorial(isFullCourse = true, moduleKey = null) {
    this.state = 'TUTORIAL';
    this.ui.showScreen('RACING');
    this.sound.setMusicState('RACING');

    this.garageLobby.hide();
    this.podiumScene.hide();
    this.setTrackVisible(true);

    if (this.playerVehicle.group.parent) {
      this.playerVehicle.group.parent.remove(this.playerVehicle.group);
    }
    this.scene.add(this.playerVehicle.group);

    this.physics.resetToStart();
    this.cameraController.setMode(CAMERA_MODES.CHASE);
    this.cameraController.reset(this.physics.pos, this.physics.quat);

    this.tutorial.startTutorial(isFullCourse, moduleKey);
  }

  setPlayerVehicle(vehicleId, isPreview = false) {
    const spec = VEHICLE_CATALOG.find(v => v.id === vehicleId) || VEHICLE_CATALOG[0];

    // Detach old vehicle
    if (this.playerVehicle && this.playerVehicle.group.parent) {
      this.playerVehicle.group.parent.remove(this.playerVehicle.group);
    }

    // Create new vehicle
    this.playerVehicle = new FuturisticVehicle(this.scene, true, spec);

    // Reattach to appropriate location
    if (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'RACE_INTRO' || this.state === 'TUTORIAL') {
      this.scene.add(this.playerVehicle.group);
    } else {
      this.garageLobby.turntable.add(this.playerVehicle.group);
      this.playerVehicle.group.position.set(0, 0.95, 0);
    }

    // Apply performance specs to physics
    this.physics.applyVehicleSpecs(spec);

    if (this.ui && this.ui.updateLobbyVehiclePanel) {
      this.ui.updateLobbyVehiclePanel(spec);
    }
  }

  loadSector(sectorId, force = false) {
    const sectorDef = getSectorDefinition(sectorId);
    const targetId = sectorDef.id; // 'coastline', 'fuji', or 'district'

    if (this.currentSectorId === targetId && !force && this.circuit && this.world) {
      if (this.ui && this.ui.updateTrackInfo) {
        this.ui.updateTrackInfo(sectorDef);
      }
      return;
    }

    const wasTrackVisible = (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'RACE_INTRO' || this.state === 'PRE_RACE_LOADING' || this.state === 'TUTORIAL');

    // 1. Clean up existing circuit and world
    if (this.world && this.world.dispose) {
      this.world.dispose();
    }
    if (this.circuit && this.circuit.dispose) {
      this.circuit.dispose();
    }

    this.currentSectorId = targetId;

    // 2. Instantiate new circuit and world matching Sector Design Bible
    if (targetId === 'coastline') {
      this.circuit = new CoastlineCircuit(this.scene);
      this.world = new CoastlineWorld(this.scene, this.circuit);
      this.scene.background = new THREE.Color(0x020813);
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color(0x04101e);
        this.scene.fog.density = 0.00022;
      }
    } else if (targetId === 'fuji') {
      this.circuit = new FujiSkywayCircuit(this.scene);
      this.world = new FujiSkywayWorld(this.scene, this.circuit);
      this.scene.background = new THREE.Color(0x0a1424);
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color(0x0c1a2e);
        this.scene.fog.density = 0.00030;
      }
    } else {
      this.circuit = new CityCircuit(this.scene);
      this.world = new NeoShinjukuWorld(this.scene, this.circuit);
      this.scene.background = new THREE.Color(0x050a14);
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color(0x06111f);
        this.scene.fog.density = 0.00028;
      }
    }

    // 3. Propagate new circuit to all sub-systems
    if (this.physics) this.physics.setCircuit(this.circuit);
    if (this.rivals) this.rivals.setCircuit(this.circuit);
    if (this.traffic) this.traffic.setCircuit(this.circuit);
    if (this.cameraController) this.cameraController.setCircuit(this.circuit);
    if (this.minimap) this.minimap.setCircuit(this.circuit);
    if (this.ghostVehicle) this.ghostVehicle.setCircuit(this.circuit);

    // 4. Update Game State targets
    if (this.gameState) {
      this.gameState.maxLaps = sectorDef.laps || 3;
      if (this.circuit.checkpoints && this.circuit.checkpoints.length > 0) {
        this.gameState.checkpointUList = this.circuit.checkpoints.map(c => typeof c === 'number' ? c : (c.u || 0));
        this.gameState.totalCheckpoints = this.gameState.checkpointUList.length;
      }
    }

    // 5. Reset player physics on starting grid
    if (this.physics) {
      this.physics.resetToStart();
    }

    // 6. Update track visibility
    this.setTrackVisible(wasTrackVisible);

    // 7. Update UI track briefing and telemetry
    if (this.ui && this.ui.updateTrackInfo) {
      this.ui.updateTrackInfo(sectorDef);
    }
  }

  setTrackVisible(visible) {
    if (this.circuit && this.circuit.setVisible) {
      this.circuit.setVisible(visible);
    } else if (this.circuit) {
      if (this.circuit.trackMesh) this.circuit.trackMesh.visible = visible;
      if (this.circuit.substructureMesh) this.circuit.substructureMesh.visible = visible;
      if (this.circuit.barrierMesh) this.circuit.barrierMesh.visible = visible;
      if (this.circuit.glowRailsMesh) this.circuit.glowRailsMesh.visible = visible;
      if (this.circuit.boostPadsGroup) this.circuit.boostPadsGroup.visible = visible;
      if (this.circuit.checkpointGatesGroup) this.circuit.checkpointGatesGroup.visible = visible;
      if (this.circuit.stuntRampsGroup) this.circuit.stuntRampsGroup.visible = visible;
      if (this.circuit.startFinishGantry) this.circuit.startFinishGantry.visible = visible;
      if (this.circuit.zebraCrossingsGroup) this.circuit.zebraCrossingsGroup.visible = visible;
      if (this.circuit.trafficLightsGroup) this.circuit.trafficLightsGroup.visible = visible;
      if (this.circuit.streetlightsGroup) this.circuit.streetlightsGroup.visible = visible;
    }
    if (this.world && this.world.root) this.world.root.visible = visible;
    if (this.traffic && this.traffic.group) this.traffic.group.visible = visible;
    if (this.rivals && this.rivals.rivals) {
      this.rivals.rivals.forEach(r => {
        if (r.vehicle && r.vehicle.group) r.vehicle.group.visible = visible;
      });
    }
  }

  startMatchmaking(sectorId = null) {
    if (sectorId) {
      this.loadSector(sectorId);
    } else if (this.ui && this.ui.selectedTrackId) {
      this.loadSector(this.ui.selectedTrackId);
    }
    this.state = 'MATCH_PREP';
    this.ui.showScreen('MATCH_PREP');

    if (this.matchInterval) clearInterval(this.matchInterval);
    if (this.matchTimeout) clearTimeout(this.matchTimeout);
    let p = 0;
    this.matchInterval = setInterval(() => {
      p += 12 + Math.random() * 16;
      this.ui.updateMatchPrep(Math.min(100, Math.floor(p)));

      if (p >= 100) {
        clearInterval(this.matchInterval);
        this.matchInterval = null;
        this.ui.updateMatchPrep(100);

        this.matchTimeout = setTimeout(() => {
          this.matchTimeout = null;
          this.startPreRaceLoading(() => {
            this.beginRaceIntro();
          });
        }, 350);
      }
    }, 90);
  }

  skipMatchmaking() {
    if (this.matchInterval) {
      clearInterval(this.matchInterval);
      this.matchInterval = null;
    }
    if (this.matchTimeout) {
      clearTimeout(this.matchTimeout);
      this.matchTimeout = null;
    }
    this.startPreRaceLoading(() => {
      this.beginRaceIntro();
    });
  }

  startPreRaceLoading(onComplete) {
    this.state = 'PRE_RACE_LOADING';

    // Switch 3D environments: show track & city, hide garage
    this.garageLobby.hide();
    this.podiumScene.hide();
    this.setTrackVisible(true);
    this.loadingSplineU = 0.04;
    this.loadingTimer = 0.0;

    // Attach hero player vehicle to scene for 3D track foreground showcase
    if (this.playerVehicle && this.playerVehicle.group) {
      if (this.playerVehicle.group.parent) {
        this.playerVehicle.group.parent.remove(this.playerVehicle.group);
      }
      this.scene.add(this.playerVehicle.group);
    }

    if (this.ui) {
      this.ui.showScreen('PRE_RACE_LOADING');
      if (this.ui.updateTrackInfo) {
        this.ui.updateTrackInfo(getSectorDefinition(this.currentSectorId));
      }
    }

    if (this.preRaceInterval) clearInterval(this.preRaceInterval);
    if (this.preRaceTimeout) clearTimeout(this.preRaceTimeout);
    this.preRaceOnComplete = onComplete;
    let p = 0;
    this.preRaceInterval = setInterval(() => {
      // Smooth continuous loading progression without random jumping
      p += 2.2;
      const curPct = Math.min(100, Math.floor(p));
      if (this.ui && this.ui.updatePreRaceProgress) {
        this.ui.updatePreRaceProgress(curPct);
      }
      if (p >= 100) {
        clearInterval(this.preRaceInterval);
        this.preRaceInterval = null;
        if (this.ui && this.ui.updatePreRaceProgress) {
          this.ui.updatePreRaceProgress(100);
        }

        // 100% Transition: camera accelerates forward + screen warp flash
        if (this.camera) {
          this.camera.fov = 86;
          this.camera.updateProjectionMatrix();
        }
        if (typeof document !== 'undefined') {
          const screenEl = document.getElementById('screen-pre-race-loading');
          if (screenEl) screenEl.classList.add('loading-warp-flash');
        }
        if (this.sound && this.sound.playRaceFound) {
          this.sound.playRaceFound();
        }

        // Seamless transition into race intro
        this.preRaceTimeout = setTimeout(() => {
          this.preRaceTimeout = null;
          this.skipPreRaceLoading();
        }, 550);
      }
    }, 50);
  }

  skipPreRaceLoading() {
    if (this.preRaceInterval) {
      clearInterval(this.preRaceInterval);
      this.preRaceInterval = null;
    }
    if (this.preRaceTimeout) {
      clearTimeout(this.preRaceTimeout);
      this.preRaceTimeout = null;
    }

    // Reset camera projection and clear warp flash
    if (this.camera) {
      this.camera.fov = 75;
      this.camera.updateProjectionMatrix();
    }
    if (typeof document !== 'undefined') {
      const screenEl = document.getElementById('screen-pre-race-loading');
      if (screenEl) screenEl.classList.remove('loading-warp-flash');
    }

    if (this.preRaceOnComplete) {
      const cb = this.preRaceOnComplete;
      this.preRaceOnComplete = null;
      cb();
    } else if (this.state === 'RACE_INTRO') {
      this.skipRaceIntro();
    } else {
      this.beginRaceIntro();
    }
  }

  startPostRaceLoading(onComplete) {
    this.state = 'POST_RACE_LOADING';
    if (this.ui) this.ui.showScreen('POST_RACE_LOADING');

    if (this.postSyncInterval) clearInterval(this.postSyncInterval);
    if (this.postSyncTimeout) clearTimeout(this.postSyncTimeout);
    this.postSyncOnComplete = onComplete;
    let p = 0;
    this.postSyncInterval = setInterval(() => {
      p += 15 + Math.random() * 18;
      if (this.ui && this.ui.updatePostSyncProgress) {
        this.ui.updatePostSyncProgress(Math.min(100, Math.floor(p)));
      }
      if (p >= 100) {
        clearInterval(this.postSyncInterval);
        this.postSyncInterval = null;
        if (this.ui && this.ui.updatePostSyncProgress) {
          this.ui.updatePostSyncProgress(100);
        }
        this.postSyncTimeout = setTimeout(() => {
          this.postSyncTimeout = null;
          this.skipPostRaceLoading();
        }, 500);
      }
    }, 100);
  }

  skipPostRaceLoading() {
    if (this.postSyncInterval) {
      clearInterval(this.postSyncInterval);
      this.postSyncInterval = null;
    }
    if (this.postSyncTimeout) {
      clearTimeout(this.postSyncTimeout);
      this.postSyncTimeout = null;
    }
    if (this.postSyncOnComplete) {
      const cb = this.postSyncOnComplete;
      this.postSyncOnComplete = null;
      cb();
    } else {
      this.showPubgRewards();
    }
  }

  showPubgRewards() {
    this.state = 'PUBG_REWARDS';
    this.podiumScene.hide();
    this.garageLobby.show();
    this.garageLobby.setCameraAnglePreset('FRONT');

    // Mount player vehicle
    if (this.playerVehicle && this.playerVehicle.group.parent) {
      this.playerVehicle.group.parent.remove(this.playerVehicle.group);
    }
    if (this.garageLobby && this.garageLobby.turntable && this.playerVehicle) {
      this.garageLobby.turntable.add(this.playerVehicle.group);
      this.playerVehicle.group.position.set(0, 0.95, 0);
    }

    if (this.ui) this.ui.showScreen('PUBG_REWARDS');
    if (this.sound) this.sound.playVictorySting();
  }

  beginRaceIntro() {
    this.ensureGameFocus();
    this.state = 'RACE_INTRO';
    this.ui.showScreen('RACE_INTRO');
    this.sound.setMusicState('INTRO');

    // Switch environments: hide garage, show track & city
    this.garageLobby.hide();
    this.podiumScene.hide();
    this.setTrackVisible(true);
    if (this.circuit && this.circuit.setLap) {
      this.circuit.setLap(1);
    }

    // Place player vehicle on starting slot 1
    if (this.playerVehicle.group.parent) {
      this.playerVehicle.group.parent.remove(this.playerVehicle.group);
    }
    this.scene.add(this.playerVehicle.group);

    this.physics.resetToStart();
    this.playerVehicle.group.position.copy(this.physics.pos);
    this.playerVehicle.group.quaternion.copy(this.physics.quat);
    if (this.playerVehicle.updateKineticState) {
      this.playerVehicle.updateKineticState(0.016, 0, 0, 0, false, false, 0);
    }
    this.rivals.spawnRivalGrid();

    this.raceIntroTimer = 0.0;
  }

  skipRaceIntro() {
    if (this.state === 'RACE_INTRO') {
      this.startCountdown();
    }
  }

  startCountdown() {
    this.ensureGameFocus();
    this.state = 'COUNTDOWN';
    this.rewardsAwardedForRace = false;
    this.trafficCollisionCooldown = 0.0;
    this.ui.showScreen('RACING');
    this.ui.showCountdownOverlay();
    if (this.sound && this.sound.setMusicState) {
      try { this.sound.setMusicState('COUNTDOWN'); } catch (e) { console.warn(e); }
    }
    if (this.circuit && this.circuit.setLap) {
      this.circuit.setLap(1);
    }

    this.physics.resetToStart();
    this.cameraController.setMode(CAMERA_MODES.CHASE);
    this.cameraController.reset(this.physics.pos, this.physics.quat, false);

    this.gameState.startCountdown();
  }

  togglePause() {
    if (this.state === 'RACING' || this.state === 'TUTORIAL' || this.state === 'COUNTDOWN') {
      this.prevActiveState = this.state;
      this.state = 'PAUSED';
      this.ui.showScreen('PAUSED');
    } else if (this.state === 'PAUSED') {
      this.state = this.prevActiveState || (this.tutorial.isActive ? 'TUTORIAL' : 'RACING');
      this.ui.showScreen('RACING');
      if (this.state === 'RACING' && this.ui) {
        this.ui.hideCountdownOverlay();
      }
    }
  }

  restartRace() {
    if (this.tutorial.isActive) {
      this.tutorial.startTutorial(!this.tutorial.isReplayingModule, this.tutorial.replayedModuleKey);
    } else {
      this.startCountdown();
    }
  }

  triggerRaceFinish() {
    this.state = 'FINISH';
    this.finalRacePosition = this.gameState.currentPosition;
    this.sound.setMusicState('PODIUM');
    this.sound.playVictorySting();
    this.cameraController.setMode(CAMERA_MODES.SLOW_MO_FINISH);
    this.finishTimer = 0.0;
    if (this.vfx) {
      this.vfx.spawnFinishCelebration(this.physics.pos);
    }
  }

  showPodiumSequence() {
    this.state = 'PODIUM';
    this.ui.showScreen('PODIUM');
    this.sound.setMusicState('PODIUM');

    // Hide track, show 3D podium
    this.setTrackVisible(false);
    this.garageLobby.hide();
    this.podiumScene.show();

    // Compute standings
    const standings = this.rivals.getStandings(this.physics.totalDistance, 'RANJEET');
    this.ui.setupPodiumOverlay(standings);

    const getCraftForRacer = (racerEntry) => {
      if (!racerEntry) return null;
      if (racerEntry.isPlayer) return this.playerVehicle;
      return racerEntry.vehicle;
    };

    const firstCraft = getCraftForRacer(standings[0]);
    const secondCraft = getCraftForRacer(standings[1]);
    const thirdCraft = getCraftForRacer(standings[2]);

    this.podiumScene.setupPodiumVehicles(firstCraft, secondCraft, thirdCraft);
  }

  showWinningLobby() {
    this.state = 'WINNING_LOBBY';
    this.podiumScene.hide();
    this.garageLobby.show();
    this.garageLobby.setCameraAnglePreset('FRONT');

    // Mount player vehicle on victory platform
    if (this.playerVehicle.group.parent) {
      this.playerVehicle.group.parent.remove(this.playerVehicle.group);
    }
    this.garageLobby.turntable.add(this.playerVehicle.group);
    this.playerVehicle.group.position.set(0, 0.95, 0);

    // Prevent duplicate reward awards if screen is visited multiple times
    if (this.rewardsAwardedForRace) {
      this.ui.showWinningLobby(this.winStreak, this.playerLevel, 0);
      return;
    }
    this.rewardsAwardedForRace = true;

    // Update player progression
    this.winStreak++;
    this.playerXP += 1250;
    saveManager.data.player.winStreak = this.winStreak;
    saveManager.data.player.xp = this.playerXP;
    saveManager.data.player.credits = (saveManager.data.player.credits || 45200) + 2500;

    const nextXp = saveManager.data.player.nextLevelXp || 12000;
    if (this.playerXP >= nextXp) {
      this.playerLevel = (saveManager.data.player.level || 87) + 1;
      saveManager.data.player.level = this.playerLevel;
      saveManager.data.player.nextLevelXp = Math.floor(nextXp * 1.25);
      const levelToast = document.getElementById('level-up-toast');
      if (levelToast) {
        levelToast.textContent = `★ LEVEL UP! LEVEL ${this.playerLevel} UNLOCKED ★`;
        levelToast.style.display = 'block';
      }
    }
    saveManager.save();
    if (this.ui && this.ui.updateLobbyHeader) {
      this.ui.updateLobbyHeader();
    }

    this.ui.showWinningLobby(this.winStreak, this.playerLevel, 1250);
  }

  playTutorialCompletionCinematic() {
    this.state = 'COMPLETION_CINEMATIC';
    this.podiumScene.hide();
    this.setTrackVisible(false);
    this.garageLobby.show();
    if (this.ui) this.ui.hideTutorialHUD();

    // Mount player vehicle on turntable
    if (this.playerVehicle.group.parent) {
      this.playerVehicle.group.parent.remove(this.playerVehicle.group);
    }
    this.garageLobby.turntable.add(this.playerVehicle.group);
    this.playerVehicle.group.position.set(0, 0.95, 0);

    // Camera starts close and smoothly pulls back
    this.garageLobby.cameraDistance = 4.5;
    this.garageLobby.targetCameraDistance = 8.5;
    this.garageLobby.cameraHeight = 1.6;
    this.garageLobby.targetCameraHeight = 2.2;

    this.ui.showFirstTimeCinematicOverlay();
    this.ui.updateCinematicText('DRIVER CERTIFIED // RANJEET', 'AETHER-9 NETWORK ACCESS GRANTED');

    if (this.vfx) {
      this.vfx.spawnLevelUpVFX(new THREE.Vector3(0, 0.4, 0));
    }

    this.vector.speak(
      'Welcome to Neo-Shinjuku. All district circuits are now open.',
      'WELCOME TO NEO-SHINJUKU // NETWORK ACCESS GRANTED',
      4200,
      () => {
        this.ui.hideFirstTimeCinematicOverlay();
        this.returnToLobby();
      }
    );
  }

  returnToLobby() {
    this.state = 'LOBBY';
    this.rewardsAwardedForRace = false;
    this.podiumScene.hide();
    this.setTrackVisible(false);
    this.garageLobby.show();
    this.garageLobby.setCameraAnglePreset('FRONT');
    if (this.ui) {
      this.ui.hideTutorialHUD();
      this.ui.hideCountdownOverlay();
      this.ui.showScreen('LOBBY');
    }
    if (this.vector) this.vector.hide();
    if (this.ghostVehicle) this.ghostVehicle.hide();

    if (this.playerVehicle.group.parent) {
      this.playerVehicle.group.parent.remove(this.playerVehicle.group);
    }
    this.garageLobby.turntable.add(this.playerVehicle.group);
    this.playerVehicle.group.position.set(0, 0.95, 0);

    this.sound.setMusicState('LOBBY');
  }

  setTouch(action, val) {
    this.sound.resume();
    this.touchInputs[action] = val;
  }

  pollInputs(dt = 0.016) {
    let throttle = 0.0;
    let brake = 0.0;
    let targetSteer = 0.0;
    let drift = false;
    let boost = false;
    let energyBrake = false;
    let airbrakeLeft = false;
    let airbrakeRight = false;

    const isW = !!(
      this.keys['KeyW'] || this.keys['ArrowUp'] ||
      this.keys['w'] || this.keys['W'] ||
      this.keys['Up'] || this.keys['Numpad8']
    );
    const isS = !!(
      this.keys['KeyS'] || this.keys['ArrowDown'] ||
      this.keys['s'] || this.keys['S'] ||
      this.keys['Down'] || this.keys['Numpad2']
    );
    const isA = !!(
      this.keys['KeyA'] || this.keys['ArrowLeft'] ||
      this.keys['a'] || this.keys['A'] ||
      this.keys['Left'] || this.keys['Numpad4']
    );
    const isD = !!(
      this.keys['KeyD'] || this.keys['ArrowRight'] ||
      this.keys['d'] || this.keys['D'] ||
      this.keys['Right'] || this.keys['Numpad6']
    );
    const isDrift = !!(
      this.keys['ShiftLeft'] || this.keys['ShiftRight'] ||
      this.keys['Shift'] || this.keys['shift']
    );
    const isBoost = !!(
      this.keys['Space'] || this.keys[' '] ||
      this.keys['space'] || this.keys['Spacebar'] || this.keys['Numpad0']
    );

    if (isW) throttle = 1.0;
    if (isS) brake = 1.0;
    if (isA) targetSteer -= 1.0;
    if (isD) targetSteer += 1.0;

    if (this.keys['KeyQ'] || this.keys['q'] || this.keys['Q']) airbrakeLeft = true;
    if (this.keys['KeyE'] || this.keys['e'] || this.keys['E']) airbrakeRight = true;
    if (this.keys['KeyB'] || this.keys['b'] || this.keys['B'] || (airbrakeLeft && airbrakeRight)) energyBrake = true;

    if (isDrift) drift = true;
    if (isBoost) boost = true;

    // Snappy, agile arcade steering response (zero input lag, authentic race craft agility)
    this.smoothSteer = this.smoothSteer || 0.0;
    const steerSmoothingRate = targetSteer === 0.0 ? 32.0 : 24.0;
    this.smoothSteer = THREE.MathUtils.damp(this.smoothSteer, targetSteer, steerSmoothingRate, dt);
    let steer = this.smoothSteer;

    // Mobile touch
    if (this.touchInputs.throttle > 0) throttle = this.touchInputs.throttle;
    if (this.touchInputs.brake > 0) brake = this.touchInputs.brake;
    if (this.touchInputs.steer !== 0) steer = this.touchInputs.steer;
    if (this.touchInputs.drift) drift = true;
    if (this.touchInputs.boost) boost = true;
    if (this.touchInputs.airbrakeLeft) airbrakeLeft = true;
    if (this.touchInputs.airbrakeRight) airbrakeRight = true;
    if (this.touchInputs.energyBrake) energyBrake = true;

    // Gamepad
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gamepads && gamepads[0]) {
      const gp = gamepads[0];
      if (Math.abs(gp.axes[0]) > 0.15) steer = gp.axes[0];
      if (gp.buttons[7] && gp.buttons[7].value > 0.1) throttle = gp.buttons[7].value;
      if (gp.buttons[6] && gp.buttons[6].value > 0.1) brake = gp.buttons[6].value;
      if (gp.buttons[0] && gp.buttons[0].pressed) throttle = 1.0;
      if (gp.buttons[2] && gp.buttons[2].pressed) brake = 1.0;
      if (gp.buttons[1] && gp.buttons[1].pressed) boost = true;
      if (gp.buttons[4] && gp.buttons[4].pressed) airbrakeLeft = true;
      if (gp.buttons[5] && gp.buttons[5].pressed) airbrakeRight = true;
      if (gp.buttons[3] && gp.buttons[3].pressed) drift = true;
    }

    // Interactive Control HUD Visual Feedback
    if (this.ui && this.ui.updateActiveControlsHUD) {
      this.ui.updateActiveControlsHUD({
        throttle: throttle > 0,
        brake: brake > 0,
        steerLeft: isA || steer < -0.25,
        steerRight: isD || steer > 0.25,
        drift: drift || (this.physics && this.physics.isDrifting),
        boost: boost || (this.physics && this.physics.isBoosting)
      });
    }

    return { throttle, brake, steer, drift, boost, energyBrake, airbrakeLeft, airbrakeRight };
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.05);

    // High-precision adaptive frame performance monitor
    this.frameCount = (this.frameCount || 0) + 1;
    this.lastFpsCheck = this.lastFpsCheck || performance.now();
    this.frameTimes = this.frameTimes || [];

    const now = performance.now();
    const actualDeltaMs = this.lastFrameTime ? (now - this.lastFrameTime) : 16.6;
    this.lastFrameTime = now;
    this.frameTimes.push(actualDeltaMs);
    if (this.frameTimes.length > 60) this.frameTimes.shift();

    if (now - this.lastFpsCheck >= 250) {
      const elapsed = (now - this.lastFpsCheck) * 0.001;
      const currentFps = Math.max(1, Math.round(this.frameCount / elapsed));

      let sumMs = 0;
      let worstMs = 0;
      for (let i = 0; i < this.frameTimes.length; i++) {
        sumMs += this.frameTimes[i];
        if (this.frameTimes[i] > worstMs) worstMs = this.frameTimes[i];
      }
      const avgMs = (sumMs / Math.max(1, this.frameTimes.length));
      const frameMs = avgMs.toFixed(1);
      const minFps = Math.max(1, Math.round(1000 / Math.max(1, worstMs)));

      this.frameCount = 0;
      this.lastFpsCheck = now;
      this.currentFps = currentFps;

      if (this.ui && this.ui.updateFpsCounter) {
        this.ui.updateFpsCounter(currentFps, frameMs, this.graphicsQuality, this.showFps, minFps);
      }

      // Automatically downgrade graphics if sub-24 FPS persists on ULTRA
      if (currentFps < 24 && this.graphicsQuality === 'ULTRA') {
        this.setGraphicsQuality('HIGH');
      } else if (currentFps < 18 && this.graphicsQuality === 'HIGH') {
        this.setGraphicsQuality('MEDIUM');
      }
    }

    // State Machine Dispatch
    switch (this.state) {
      case 'LOADING':
      case 'WELCOME_FIRST':
      case 'LOBBY':
      case 'ROYAL_PASS':
      case 'WORLD_MAP':
      case 'EVENT_SELECT':
      case 'CAR_SELECT':
      case 'GARAGE':
      case 'MATCH_PREP':
      case 'POST_RACE_LOADING':
      case 'PUBG_REWARDS':
      case 'WINNING_LOBBY':
      case 'DRIVING_SCHOOL':
      case 'SETTINGS': {
        const isOrbitingScreen = this.state === 'LOADING' || this.state === 'LOBBY' || (this.ui && this.ui.currentScreen === 'ROYAL_PASS');
        this.garageLobby.update(delta, this.camera, isOrbitingScreen);
        if (this.playerVehicle) {
          this.playerVehicle.updateKineticState(delta, 0, 0, 0, false, false, 0);
        }
        break;
      }

      case 'PRE_RACE_LOADING': {
        this.loadingTimer = (this.loadingTimer || 0) + delta;
        this.loadingSplineU = (this.loadingSplineU || 0.04) + delta * 0.012;
        if (this.loadingSplineU >= 1.0) this.loadingSplineU -= 1.0;

        // Animate traffic, world atmosphere & circuit
        if (this.traffic) this.traffic.update(delta);
        if (this.world) this.world.update(delta);
        if (this.circuit) this.circuit.update(delta);

        // Cinematic 3D camera fly-through along track spline
        const frame = this.circuit ? (this.circuit.getInterpolatedFrame ? this.circuit.getInterpolatedFrame(this.loadingSplineU) : this.circuit.getFrameAt(this.loadingSplineU)) : null;
        if (frame) {
          this._loadingCamPos = this._loadingCamPos || new THREE.Vector3();
          this._loadingLookTarget = this._loadingLookTarget || new THREE.Vector3();
          this._loadingVehPos = this._loadingVehPos || new THREE.Vector3();
          this._loadingMat = this._loadingMat || new THREE.Matrix4();

          // Camera placed slightly elevated and to the left of track lane
          this._loadingCamPos.copy(frame.pos)
            .addScaledVector(frame.normal, 4.2)
            .addScaledVector(frame.binormal, -3.8);
          this.camera.position.copy(this._loadingCamPos);

          this._loadingLookTarget.copy(frame.pos)
            .addScaledVector(frame.tangent, 38.0)
            .addScaledVector(frame.normal, 2.6);
          this.camera.lookAt(this._loadingLookTarget);

          // Hero vehicle positioned in foreground on the right side
          if (this.playerVehicle && this.playerVehicle.group) {
            if (!this.playerVehicle.group.parent || this.playerVehicle.group.parent !== this.scene) {
              this.scene.add(this.playerVehicle.group);
            }
            const hoverY = 1.85 + Math.sin(this.loadingTimer * 2.5) * 0.12;
            this._loadingVehPos.copy(frame.pos)
              .addScaledVector(frame.tangent, 10.2)
              .addScaledVector(frame.binormal, 3.4)
              .addScaledVector(frame.normal, hoverY);
            this.playerVehicle.group.position.copy(this._loadingVehPos);

            this._loadingMat.makeBasis(frame.binormal, frame.normal, frame.tangent);
            this.playerVehicle.group.quaternion.setFromRotationMatrix(this._loadingMat);
            this.playerVehicle.group.rotateY(-0.32 + Math.sin(this.loadingTimer * 0.8) * 0.08);
            this.playerVehicle.group.rotateZ(Math.sin(this.loadingTimer * 1.6) * 0.05);

            this.playerVehicle.updateKineticState(delta, 0.45, 0, 0, false, false, 0);
          }
        }
        break;
      }

      case 'CINEMATIC_INTRO': {
        this.cinematicIntro.update(delta);
        break;
      }

      case 'COMPLETION_CINEMATIC': {
        this.garageLobby.update(delta, this.camera, true);
        if (this.playerVehicle) {
          this.playerVehicle.updateKineticState(delta, 0, 0.2, 0, false, false, 0);
        }
        break;
      }

      case 'RACE_INTRO': {
        this.raceIntroTimer += delta;
        const introProg = Math.min(this.raceIntroTimer / 7.5, 1.0);
        this.cameraController.updateRaceIntro(introProg, this.circuit, this.rivals.rivals, this.playerVehicle);

        // Keep vehicle idling & aerodynamic breathing alive
        if (this.playerVehicle) {
          // Subtle engine rev during Shot 2 (exhaust spool up)
          const revThrottle = (introProg >= 0.25 && introProg < 0.50) ? 0.45 : 0.0;
          this.playerVehicle.updateKineticState(delta, 0, revThrottle, 0, false, false, 0);
        }
        if (this.rivals && this.rivals.rivals) {
          this.rivals.rivals.forEach(r => {
            if (r.vehicle) r.vehicle.updateKineticState(delta, 0, 0, 0, false, false, 0);
          });
        }

        const racerIndex = Math.floor(introProg * 8);
        this.ui.updateRaceIntroCard(racerIndex, 8, introProg);

        if (this.raceIntroTimer >= 7.5) {
          this.startCountdown();
        }
        break;
      }

      case 'COUNTDOWN': {
        const inputs = this.pollInputs(delta);
        this.physics.setInputs({ throttle: 0, brake: 0, steer: inputs.steer, drift: false, boost: false, energyBrake: false });
        const renderAlpha = this.physics.update(delta);
        const { pos: interpPos, quat: interpQuat } = this.physics.getInterpolatedTransform(renderAlpha);

        this.playerVehicle.group.position.copy(interpPos);
        this.playerVehicle.group.quaternion.copy(interpQuat);
        this.playerVehicle.updateKineticState(delta, inputs.steer, inputs.throttle, 0, false, false, 0);

        if (this.rivals && this.rivals.rivals) {
          this.rivals.rivals.forEach(r => {
            if (r.vehicle && r.vehicle.updateKineticState) {
              r.vehicle.updateKineticState(delta, 0, 0, 0, false, false, 0);
            }
          });
        }

        this.cameraController.update(delta, interpPos, this.physics.vel, interpQuat, 0, false, false, this.physics.aerialState);

        if (this.sunLight && interpPos) {
          this.sunLight.position.set(interpPos.x + 120, interpPos.y + 350, interpPos.z + 120);
          this.sunLight.target.position.copy(interpPos);
        }

        this.gameState.update(delta, this.physics.currentU, 0, this.rivals.rivals);
        if (this.gameState.status === RACE_STATUS.RACING) {
          this.state = 'RACING';
          this.ensureGameFocus();
          if (this.sound && this.sound.setMusicState) {
            try { this.sound.setMusicState('RACING'); } catch (e) { console.warn(e); }
          }
          if (this.ui) this.ui.triggerCountdownGo();
        } else {
          if (this.ui) {
            this.ui.updateCountdown(this.gameState.countdownTime, this.gameState.countdownInt);
          }
        }
        if (this.ui) {
          this.ui.updateHUD(this.physics, this.gameState);
        }
        break;
      }

      case 'TUTORIAL':
      case 'RACING': {
        // Continuous failsafe: guarantee countdown overlay never blocks the player while racing
        if (this.ui && this.gameState && this.gameState.raceTime > 0.6) {
          this.ui.hideCountdownOverlay();
        }

        const inputs = this.pollInputs(delta);
        this.physics.setInputs(inputs);

        const renderAlpha = this.physics.update(delta);
        const speedKmh = this.physics.getSpeedKmh();

        // Update Tutorial logic if in tutorial mode
        if (this.state === 'TUTORIAL') {
          this.tutorial.update(delta, this.keys, this.physics);
        }

        // Near miss & slipstream detection
        this.physics.checkTrafficNearMiss(this.traffic.vehicles, this.physics.pos);
        if (this.rivals && this.rivals.rivals.length > 0) {
          this.physics.checkSlipstream(this.rivals.rivals, this.physics.pos, this.physics.forward);
        }

        // Traffic collision check with cooldown, lateral deflection, and anti-freeze floor
        if (this.trafficCollisionCooldown > 0) {
          this.trafficCollisionCooldown -= delta;
        }

        const trafficCol = this.traffic.checkCollision(this.physics.pos, 2.4);
        if (trafficCol.hit && this.trafficCollisionCooldown <= 0) {
          this.trafficCollisionCooldown = 0.35;
          this.physics.applyExternalRepulsion(trafficCol.repelVector, 1.0);

          // Maintain minimum forward momentum (floor at 65 km/h) so player vehicle is never trapped
          const currentSpeed = this.physics.getSpeedKmh();
          const targetSpeed = Math.max(65.0, currentSpeed * 0.88);
          if (this.physics.vel.lengthSq() > 0.001) {
            this.physics.vel.setLength(targetSpeed / 3.6);
          } else {
            this.physics.vel.copy(this.physics.forward).multiplyScalar(targetSpeed / 3.6);
          }

          this.cameraController.addShake(0.35);
          if (this.vfx) {
            this.vfx.spawnCollisionSparks(this.physics.pos, trafficCol.repelVector, 1.4);
          }
          if (this.sound && this.sound.playCollisionImpact) {
            this.sound.playCollisionImpact(0.4);
          }
        }

        // Rival racer physical collision check
        if (this.rivals && this.rivals.rivals && this.trafficCollisionCooldown <= 0) {
          for (let i = 0; i < this.rivals.rivals.length; i++) {
            const rival = this.rivals.rivals[i];
            if (rival.vehicle && rival.vehicle.group) {
              const rPos = rival.vehicle.group.position;
              const distSq = this.physics.pos.distanceToSquared(rPos);
              if (distSq < 7.84) { // Within 2.8m collision radius
                this.trafficCollisionCooldown = 0.35;
                this._hitNorm.copy(this.physics.pos).sub(rPos).normalize();
                this.physics.applyExternalRepulsion(this._hitNorm, 1.25);

                const currentSpeed = this.physics.getSpeedKmh();
                const targetSpeed = Math.max(65.0, currentSpeed * 0.90);
                if (this.physics.vel.lengthSq() > 0.001) {
                  this.physics.vel.setLength(targetSpeed / 3.6);
                } else {
                  this.physics.vel.copy(this.physics.forward).multiplyScalar(targetSpeed / 3.6);
                }

                const frame = this.circuit.getFrameAt(this.physics.currentU);
                if (frame) {
                  rival.lane -= Math.sign(this._hitNorm.dot(frame.binormal)) * 1.8;
                }
                this.cameraController.addShake(0.35);
                if (this.vfx) {
                  this.vfx.spawnCollisionSparks(this.physics.pos, this._hitNorm, 1.5);
                }
                if (this.sound && this.sound.playCollisionImpact) {
                  this.sound.playCollisionImpact(0.45);
                }
                break;
              }
            }
          }
        }

        if (this.physics.isColliding) {
          if (this.sound && this.sound.playCollisionImpact) { this.sound.playCollisionImpact(this.physics.collisionImpulse); }
          this.cameraController.addShake(this.physics.collisionImpulse);
          if (this.vfx && Math.random() < 0.3) {
            const frame = this.circuit.getFrameAt(this.physics.currentU);
            if (frame) {
              this._hitNorm.copy(this.physics.pos).sub(frame.pos).normalize();
              this.vfx.spawnCollisionSparks(this.physics.pos, this._hitNorm, this.physics.collisionImpulse);
            }
          }
        }

        // Interpolated transform
        const { pos: interpPos, quat: interpQuat } = this.physics.getInterpolatedTransform(renderAlpha);
        this.playerVehicle.group.position.copy(interpPos);
        this.playerVehicle.group.quaternion.copy(interpQuat);

        this.playerVehicle.updateKineticState(
          delta,
          inputs.steer,
          inputs.throttle,
          inputs.brake,
          this.physics.isDrifting,
          this.physics.isBoosting,
          speedKmh,
          this.physics.aerialState,
          this.physics.getRunningTelemetry ? this.physics.getRunningTelemetry() : null
        );

        // Update AI and Traffic
        this.rivals.update(delta, interpPos, this.physics.currentU, this.physics.totalDistance, true);
        this.traffic.update(delta, interpPos, speedKmh);

        // Update environment & track
        this.world.update(delta, interpPos);
        this.circuit.update(delta);

        if (this.sunLight && interpPos) {
          this.sunLight.position.set(interpPos.x + 120, interpPos.y + 350, interpPos.z + 120);
          this.sunLight.target.position.copy(interpPos);
        }

        // Game state (Laps, standings, times)
        if (this.state === 'RACING') {
          this.gameState.update(delta, this.physics.currentU, speedKmh, this.rivals.rivals);

          // Final Lap check
          if (this.gameState.currentLap === 3 && this.sound.musicState !== 'FINAL_LAP') {
            this.sound.setMusicState('FINAL_LAP');
          }

          // Finish line check
          if (this.gameState.status === RACE_STATUS.FINISHED) {
            this.triggerRaceFinish();
          }
        }

        // Audio
        if (this.sound) {
          this.sound.update(speedKmh, inputs.throttle, this.physics.isBoosting, this.physics.isDrifting, delta);
        }

        // VFX System: Boost, Drift & Environment Particles (Zero Allocation Pipeline)
        if (this.vfx) {
          this._rearPosL.copy(this._rearOffsetL).applyQuaternion(interpQuat).add(interpPos);
          this._rearPosR.copy(this._rearOffsetR).applyQuaternion(interpQuat).add(interpPos);

          if (this.physics.isBoosting) {
            this.vfx.spawnBoostParticles(this._rearPosL, this._rearPosR, this.physics.forward, this.physics.boostTier === 'OVERDRIVE');
          }

          if (this.physics.isDrifting) {
            const steerSign = Math.sign(inputs.steer || 1.0);
            const driftIntensity = this.physics.driftIntensity !== undefined ? this.physics.driftIntensity : 0.5;
            this._driftDir.set(-steerSign, 0, 0).applyQuaternion(interpQuat);
            this.vfx.spawnDriftSparks(interpPos, this._driftDir, this.physics.driftDuration > 1.2, driftIntensity);
          }

          this.vfx.update(delta, interpPos, this.physics.vel, this.camera, this.physics.isBoosting, this.physics.isDrifting, speedKmh);
        }

        if (this.physics.boostJustFilled && this.ui && this.ui.flashBoostBar) { this.ui.flashBoostBar(); this.physics.boostJustFilled = false; }

        // Camera follow
        this.cameraController.update(
          delta,
          interpPos,
          this.physics.vel,
          interpQuat,
          speedKmh,
          this.physics.isColliding,
          this.physics.isBoosting,
          this.physics.aerialState,
          this.physics.landingShakeImpulse || 0.0
        );

        // Overtake detection against rival grid
        if (this.rivals && this.rivals.rivals && this.physics.checkOvertakes) {
          this.physics.checkOvertakes(this.rivals.rivals);
        }

        // Minimap & HUD
        const currentFrame = this.circuit.getFrameAt(this.physics.currentU);
        const currentDistrict = currentFrame ? currentFrame.district : null;

        // Holographic Ghost Vehicle (Time-Attack Telemetry & Realtime Delta)
        if (this.ghostVehicle && (this.state === 'RACING' || this.state === 'TUTORIAL')) {
          const ghostRes = this.ghostVehicle.update(this.gameState.currentLapTime, this.physics.currentU);
          if (ghostRes.active && this.ui) {
            this.ui.updateGhostDeltaHUD(ghostRes.timeDelta, ghostRes.isGhostAhead);
          }
        }

        if (this.ui) {
          this.ui.updateHUD(this.physics, this.gameState);
          if (this.ui && this.ui.updateSectorHUD && this.gameState.currentSector !== undefined) { this.ui.updateSectorHUD(this.gameState.currentSector, this.gameState.lapDeltaToPersonalBest, this.gameState.zoneColor); }
          if (currentDistrict) {
            this.ui.updateDistrictHUD(currentDistrict);
          }
        }

        if (this.minimap) {
          this.minimap.update(interpPos, interpQuat, this.physics.currentU, this.rivals.rivals, currentDistrict);
        }
        break;
      }

      case 'FINISH': {
        this.finishTimer += delta;
        const { pos: interpPos, quat: interpQuat } = this.physics.getInterpolatedTransform(1.0);
        this.cameraController.update(delta, interpPos, this.physics.vel, interpQuat, 180, false, false);
        this.playerVehicle.updateKineticState(delta, 0, 0.4, 0, false, false, 180);

        if (this.vfx) {
          this.vfx.update(delta, interpPos, this.physics.vel, this.camera, false, false, 120);
        }

        if (this.finishTimer >= 2.6) {
          this.state = 'RESULTS';
          this.ui.showResults(this.physics, this.gameState);
        }
        break;
      }

      case 'PODIUM': {
        this.podiumScene.update(delta, this.camera);
        break;
      }

      case 'PAUSED': {
        // Paused state: maintain frozen scene render without updating race timers or physics
        break;
      }
    }

    // Render via Post-Processing Composer (Bloom + ACES Tone Mapping) or direct WebGL for 60 FPS mobile
    if (this.skipComposer) {
      this.renderer.render(this.scene, this.camera);
    } else {
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
    if (this.bloomPass) { this.bloomPass.setSize(Math.max(256, Math.floor(w * 0.5)), Math.max(256, Math.floor(h * 0.5))); }
  }
}

// Safe instantiation respecting already-loaded DOM states
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameManager();
  });
} else {
  window.game = new GameManager();
}
