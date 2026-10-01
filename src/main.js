import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { CityCircuit } from './track/CityCircuit.js';
import { NeoShinjukuWorld } from './world/NeoShinjukuWorld.js';
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
    this.winStreak = saveManager.data.player.winStreak || 3;
    this.playerLevel = saveManager.data.player.level || 7;
    this.playerXP = saveManager.data.player.xp || 8450;

    // Inputs
    this.keys = {};
    this.touchInputs = { throttle: 0, steer: 0, brake: 0, drift: false, boost: false };

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
      stencil: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const initialDpr = this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(initialDpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080F);
    this.scene.fog = new THREE.FogExp2(0x06080F, 0.00035);

    // Camera near 0.5 prevents near-plane surface slicing and barrier clipping
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 10000);
    this.scene.add(this.camera);
  }

  setupLighting() {
    // Rich cyberpunk night ambient contrast
    const ambient = new THREE.AmbientLight(0x182436, 1.2);
    this.scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0x00F0FF, 0x090D16, 0.9);
    this.scene.add(hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xD8EEFF, 1.8);
    this.sunLight.position.set(350, 1600, 450);
    this.sunLight.target.position.set(0, 150, 0);
    this.scene.add(this.sunLight.target);
    this.sunLight.castShadow = !this.isMobile;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 50;
    this.sunLight.shadow.camera.far = 3500;
    this.sunLight.shadow.camera.left = -700;
    this.sunLight.shadow.camera.right = 700;
    this.sunLight.shadow.camera.top = 700;
    this.sunLight.shadow.camera.bottom = -700;
    this.scene.add(this.sunLight);

    const rimLight = new THREE.DirectionalLight(0x7928CA, 1.2);
    rimLight.position.set(-500, 600, -400);
    this.scene.add(rimLight);
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Balanced cyberpunk bloom: threshold 0.78 isolates true light sources without blowing out the screen
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.45,
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
        // Rock-solid 60 FPS mode for mobile and low-spec hardware (bypasses full-screen composer)
        this.renderer.setPixelRatio(1.0);
        this.renderer.shadowMap.enabled = false;
        this.skipComposer = true;
        if (this.bloomPass) this.bloomPass.enabled = false;
        if (this.vfx) this.vfx.setQuality('LOW');
        break;

      case 'MEDIUM':
        // Smooth 60 FPS with soft cyberpunk bloom
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
        this.renderer.shadowMap.enabled = false;
        this.skipComposer = false;
        if (this.bloomPass) {
          this.bloomPass.enabled = true;
          this.bloomPass.strength = 0.30;
          this.bloomPass.threshold = 0.82;
        }
        if (this.vfx) this.vfx.setQuality('MEDIUM');
        break;

      case 'HIGH':
        // Rich high-definition presentation with soft shadows
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
        this.renderer.shadowMap.enabled = true;
        this.skipComposer = false;
        if (this.bloomPass) {
          this.bloomPass.enabled = true;
          this.bloomPass.strength = 0.45;
          this.bloomPass.threshold = 0.78;
        }
        if (this.vfx) this.vfx.setQuality('HIGH');
        break;

      case 'ULTRA':
      default:
        // Studio cinematic preset
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        this.renderer.shadowMap.enabled = true;
        this.skipComposer = false;
        if (this.bloomPass) {
          this.bloomPass.enabled = true;
          this.bloomPass.strength = 0.52;
          this.bloomPass.threshold = 0.75;
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

    // Hide track & world during initial garage lobby
    this.setTrackVisible(false);
    this.podiumScene.hide();

    // 4. Hero Player Vehicle
    this.playerVehicle = new FuturisticVehicle(this.scene, true, 'f8000');
    // Mount initially on garage turntable
    this.garageLobby.turntable.add(this.playerVehicle.group);
    this.playerVehicle.group.position.set(0, 0.4, 0);

    // 5. Arcade Racing Physics (120Hz fixed sub-stepping)
    this.physics = new ArcadeRacingPhysics(this.circuit, this.sound);
    this.physics.applyVehicleSpecs(this.playerVehicle.spec);

    // 6. Civilian Traffic & 7 AI Rivals (8 racers total)
    this.traffic = new TrafficSystem(this.scene, this.circuit);
    this.rivals = new RivalRacersSystem(this.scene, this.circuit);

    // 7. Dynamic Camera & Game State
    this.cameraController = new CameraController(this.camera, this.renderer.domElement, this.circuit);
    this.cameraController.onCameraChange = (mode) => {
      if (this.ui) this.ui.updateCameraBadge(mode);
    };
    this.gameState = new GameState(this.sound);
    this.gameState.totalRacers = 8;

    // 8. VFX, Vector & Tutorial Managers
    this.vfx = new VFXSystem(this.scene, this.camera);
    this.vector = new VectorInstructor(this.sound);
    this.tutorial = new TutorialManager(this, this.vector);
    this.cinematicIntro = new FirstTimeCinematic(this);

    // Apply saved settings (Quality, Audio volumes, FPS, Control Scheme)
    const savedSettings = saveManager.getSettings();
    const defaultQuality = this.isMobile ? 'MEDIUM' : 'HIGH';
    this.setGraphicsQuality(savedSettings.graphicsQuality || defaultQuality);
    this.showFps = !!savedSettings.showFps;
    this.controlScheme = savedSettings.controlScheme || (this.isMobile ? 'TOUCH' : 'KEYBOARD');
    if (this.sound) {
      if (savedSettings.sfxVolume !== undefined) this.sound.setSfxVolume(savedSettings.sfxVolume);
      if (savedSettings.musicVolume !== undefined) this.sound.setMusicVolume(savedSettings.musicVolume);
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

    // Action listener connects physics stunt rewards to UI popups
    this.physics.onAction = (name, points, combo) => {
      this.ui.showActionPopup(name, points, combo);
    };
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (this.sound) this.sound.resume();

      if (e.code === 'KeyC' || e.code === 'KeyV') {
        if (this.state === 'RACING' || this.state === 'TUTORIAL') {
          const mode = this.cameraController.cycleMode();
          if (this.sound && this.sound.playCameraSwitchSound) {
            this.sound.playCameraSwitchSound();
          }
          if (this.ui) this.ui.updateCameraBadge(mode);
        }
      }

      if (e.code === 'KeyR' && (this.state === 'RACING' || this.state === 'TUTORIAL')) {
        this.restartRace();
      }

      if (e.code === 'KeyM') {
        if (this.ui) {
          if (this.ui.currentScreen === 'WORLD_MAP' || this.ui.currentScreen === 'EVENT_SELECT') {
            this.ui.showScreen('LOBBY');
          } else if (this.state === 'LOBBY') {
            this.ui.showWorldMap();
          }
        }
      }

      if (e.code === 'KeyG') {
        if (this.state === 'LOBBY') {
          this.ui.showScreen('GARAGE');
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
        } else if (this.ui && (this.ui.currentScreen === 'WORLD_MAP' || this.ui.currentScreen === 'EVENT_SELECT')) {
          this.ui.showScreen('LOBBY');
        } else if (this.worldMap && this.worldMap.isOpen) {
          this.worldMap.close();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('pointerdown', () => {
      if (this.sound) this.sound.resume();
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
      this.playerVehicle.group.position.set(0, 0.4, 0);
    }

    // Apply performance specs to physics
    this.physics.applyVehicleSpecs(spec);
  }

  setTrackVisible(visible) {
    if (this.circuit && this.circuit.trackMesh) this.circuit.trackMesh.visible = visible;
    if (this.circuit && this.circuit.substructureMesh) this.circuit.substructureMesh.visible = visible;
    if (this.circuit && this.circuit.barrierMesh) this.circuit.barrierMesh.visible = visible;
    if (this.circuit && this.circuit.glowRailsMesh) this.circuit.glowRailsMesh.visible = visible;
    if (this.circuit && this.circuit.boostPadsGroup) this.circuit.boostPadsGroup.visible = visible;
    if (this.circuit && this.circuit.checkpointGatesGroup) this.circuit.checkpointGatesGroup.visible = visible;
    if (this.circuit && this.circuit.stuntRampsGroup) this.circuit.stuntRampsGroup.visible = visible;
    if (this.circuit && this.circuit.startFinishGantry) this.circuit.startFinishGantry.visible = visible;
    if (this.world && this.world.root) this.world.root.visible = visible;
    if (this.traffic && this.traffic.group) this.traffic.group.visible = visible;
    if (this.rivals && this.rivals.rivals) {
      this.rivals.rivals.forEach(r => {
        if (r.vehicle && r.vehicle.group) r.vehicle.group.visible = visible;
      });
    }
  }

  startMatchmaking() {
    this.state = 'MATCH_PREP';
    this.ui.showScreen('MATCH_PREP');

    let p = 0;
    const matchInterval = setInterval(() => {
      p += 8 + Math.random() * 12;
      this.ui.updateMatchPrep(p);

      if (p >= 100) {
        clearInterval(matchInterval);

        setTimeout(() => {
          this.beginRaceIntro();
        }, 500);
      }
    }, 120);
  }

  beginRaceIntro() {
    this.state = 'RACE_INTRO';
    this.ui.showScreen('RACE_INTRO');
    this.sound.setMusicState('INTRO');

    // Switch environments: hide garage, show track & city
    this.garageLobby.hide();
    this.podiumScene.hide();
    this.setTrackVisible(true);

    // Place player vehicle on starting slot 1
    if (this.playerVehicle.group.parent) {
      this.playerVehicle.group.parent.remove(this.playerVehicle.group);
    }
    this.scene.add(this.playerVehicle.group);

    this.physics.resetToStart();
    this.rivals.spawnRivalGrid();

    this.raceIntroTimer = 0.0;
  }

  skipRaceIntro() {
    if (this.state === 'RACE_INTRO') {
      this.startCountdown();
    }
  }

  startCountdown() {
    this.state = 'COUNTDOWN';
    this.ui.showScreen('RACING');
    this.ui.showCountdownOverlay();
    this.sound.setMusicState('COUNTDOWN');

    this.physics.resetToStart();
    this.cameraController.setMode(CAMERA_MODES.CHASE);
    this.cameraController.reset(this.physics.pos, this.physics.quat);

    this.gameState.startCountdown();
  }

  togglePause() {
    if (this.state === 'RACING' || this.state === 'TUTORIAL') {
      this.state = 'PAUSED';
      this.ui.showScreen('PAUSED');
    } else if (this.state === 'PAUSED') {
      this.state = this.tutorial.isActive ? 'TUTORIAL' : 'RACING';
      this.ui.showScreen('RACING');
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
    this.playerVehicle.group.position.set(0, 0.4, 0);

    // Update player progression
    this.winStreak++;
    this.playerXP += 1250;
    saveManager.data.player.winStreak = this.winStreak;
    saveManager.data.player.xp = this.playerXP;
    saveManager.data.player.credits += 2500;

    if (this.playerXP >= 12000) {
      this.playerLevel = 8;
      saveManager.data.player.level = 8;
      document.getElementById('level-up-toast').style.display = 'block';
    }
    saveManager.save();

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
    this.playerVehicle.group.position.set(0, 0.4, 0);

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
    this.playerVehicle.group.position.set(0, 0.4, 0);

    this.sound.setMusicState('LOBBY');
  }

  setTouch(action, val) {
    this.sound.resume();
    this.touchInputs[action] = val;
  }

  pollInputs() {
    let throttle = 0.0;
    let brake = 0.0;
    let steer = 0.0;
    let drift = false;
    let boost = false;
    let energyBrake = false;
    let airbrakeLeft = false;
    let airbrakeRight = false;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) throttle = 1.0;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) brake = 1.0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) steer -= 1.0;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) steer += 1.0;

    if (this.keys['KeyQ']) airbrakeLeft = true;
    if (this.keys['KeyE']) airbrakeRight = true;
    if (this.keys['KeyB'] || (this.keys['KeyQ'] && this.keys['KeyE'])) energyBrake = true;

    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) drift = true;
    if (this.keys['Space']) boost = true;

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

    return { throttle, brake, steer, drift, boost, energyBrake, airbrakeLeft, airbrakeRight };
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Adaptive frame performance monitor
    this.frameCount = (this.frameCount || 0) + 1;
    this.lastFpsCheck = this.lastFpsCheck || performance.now();
    const now = performance.now();
    if (now - this.lastFpsCheck >= 500) {
      const elapsed = (now - this.lastFpsCheck) * 0.001;
      const currentFps = Math.round(this.frameCount / elapsed);
      const frameMs = (1000 / Math.max(1, currentFps)).toFixed(1);
      this.frameCount = 0;
      this.lastFpsCheck = now;
      this.currentFps = currentFps;

      if (this.ui && this.ui.updateFpsCounter) {
        this.ui.updateFpsCounter(currentFps, frameMs, this.graphicsQuality, this.showFps);
      }

      // Automatically downgrade graphics if sub-26 FPS persists
      if (currentFps < 26 && this.graphicsQuality === 'ULTRA') {
        this.setGraphicsQuality('HIGH');
      } else if (currentFps < 22 && this.graphicsQuality === 'HIGH') {
        this.setGraphicsQuality('MEDIUM');
      }
    }

    // State Machine Dispatch
    switch (this.state) {
      case 'LOADING':
      case 'WELCOME_FIRST':
      case 'LOBBY':
      case 'CAR_SELECT':
      case 'GARAGE':
      case 'MATCH_PREP':
      case 'WINNING_LOBBY':
      case 'DRIVING_SCHOOL':
      case 'SETTINGS': {
        this.garageLobby.update(delta, this.camera, this.state === 'LOADING' || this.state === 'LOBBY');
        if (this.playerVehicle) {
          this.playerVehicle.updateKineticState(delta, 0, 0, 0, false, false, 0);
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

        const racerIndex = Math.floor(introProg * 8);
        this.ui.updateRaceIntroCard(racerIndex, 8);

        if (this.raceIntroTimer >= 7.5) {
          this.startCountdown();
        }
        break;
      }

      case 'COUNTDOWN': {
        const inputs = this.pollInputs();
        this.physics.setInputs({ throttle: 0, brake: 0, steer: inputs.steer, drift: false, boost: false, energyBrake: false });
        const renderAlpha = this.physics.update(delta);
        const { pos: interpPos, quat: interpQuat } = this.physics.getInterpolatedTransform(renderAlpha);

        this.playerVehicle.group.position.copy(interpPos);
        this.playerVehicle.group.quaternion.copy(interpQuat);
        this.playerVehicle.updateKineticState(delta, inputs.steer, 0, 0, false, false, 0);

        this.cameraController.update(delta, interpPos, this.physics.vel, interpQuat, 0, false, false);

        this.gameState.update(delta, this.physics.currentU, 0, this.rivals.rivals);
        if (this.ui) {
          this.ui.updateCountdown(this.gameState.countdownTime, this.gameState.countdownInt);
          this.ui.updateHUD(this.physics, this.gameState);
        }

        if (this.gameState.status === RACE_STATUS.RACING) {
          this.state = 'RACING';
          this.sound.setMusicState('RACING');
          if (this.ui) this.ui.triggerCountdownGo();
        }
        break;
      }

      case 'TUTORIAL':
      case 'RACING': {
        const inputs = this.pollInputs();
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

        // Traffic collision check
        const trafficCol = this.traffic.checkCollision(this.physics.pos, 2.4);
        if (trafficCol.hit) {
          this.physics.pos.addScaledVector(trafficCol.repelVector, 0.45);
          this.physics.vel.multiplyScalar(0.92);
          this.cameraController.addShake(0.35);
          if (this.vfx) {
            this.vfx.spawnCollisionSparks(this.physics.pos, trafficCol.repelVector, 1.2);
          }
        }

        if (this.physics.isColliding) {
          this.cameraController.addShake(this.physics.collisionImpulse);
          if (this.vfx && Math.random() < 0.3) {
            const hitNorm = this.physics.pos.clone().sub(this.circuit.getFrameAt(this.physics.currentU).pos).normalize();
            this.vfx.spawnCollisionSparks(this.physics.pos, hitNorm, this.physics.collisionImpulse);
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
          this.physics.aerialState
        );

        // Update AI and Traffic
        this.rivals.update(delta, interpPos, this.physics.currentU, this.physics.totalDistance, true);
        this.traffic.update(delta, interpPos, speedKmh);

        // Update environment & track
        this.world.update(delta, interpPos);
        this.circuit.update(delta);

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

        // VFX System: Boost, Drift & Environment Particles
        if (this.vfx) {
          const rearL = interpPos.clone().add(new THREE.Vector3(-1.1, 0.4, -2.2).applyQuaternion(interpQuat));
          const rearR = interpPos.clone().add(new THREE.Vector3(1.1, 0.4, -2.2).applyQuaternion(interpQuat));

          if (this.physics.isBoosting) {
            this.vfx.spawnBoostParticles(rearL, rearR, this.physics.forward, this.physics.boostTier === 'OVERDRIVE');
          }

          if (this.physics.isDrifting) {
            const steerSign = Math.sign(inputs.steer || 1.0);
            this.vfx.spawnDriftSparks(interpPos, new THREE.Vector3(-steerSign, 0, 0).applyQuaternion(interpQuat), this.physics.driftDuration > 1.2);
          }

          this.vfx.update(delta, interpPos, this.physics.vel, this.camera, this.physics.isBoosting, this.physics.isDrifting, speedKmh);
        }

        // Camera follow
        this.cameraController.update(
          delta,
          interpPos,
          this.physics.vel,
          interpQuat,
          speedKmh,
          this.physics.isColliding,
          this.physics.isBoosting
        );

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
