import * as THREE from 'three';

// ============================================================================
// NEO-SHINJUKU RIFT: FIRST-TIME CINEMATIC INTRODUCTION
// High-altitude skyscraper sweep -> rapid dive into training hangar
// -> Vehicle revelation & sequential system ignition (Headlights, Core, Boost, Underglow)
// -> Handoff to Training Sector 01
// ============================================================================

export class FirstTimeCinematic {
  constructor(gameManager) {
    this.game = gameManager;
    this.isActive = false;
    this.timer = 0.0;
    this.duration = 9.5;

    // Cinematic camera waypoints
    this.camStartPos = new THREE.Vector3(350, 800, 650);
    this.camCityMid = new THREE.Vector3(120, 280, 240);
    this.camGarageEntry = new THREE.Vector3(0, 160, 25);
    this.camVehicleFocus = new THREE.Vector3(0, 150.8, 0);

    this.onComplete = null;
  }

  start(onComplete = null) {
    this.isActive = true;
    this.timer = 0.0;
    this.onComplete = onComplete;

    // Set environments: show city and track initially for the high-altitude sweep
    this.game.setTrackVisible(true);
    this.game.garageLobby.hide();
    this.game.podiumScene.hide();

    // Place camera high above Neo-Shinjuku
    this.game.camera.position.copy(this.camStartPos);
    this.game.camera.lookAt(new THREE.Vector3(0, 150, 0));

    // Show cinematic overlay
    this.game.ui.showFirstTimeCinematicOverlay();
    if (this.game.sound) {
      this.game.sound.setMusicState('INTRO');
    }
  }

  skip() {
    if (!this.isActive) return;
    this.finish();
  }

  finish() {
    this.isActive = false;
    this.game.ui.hideFirstTimeCinematicOverlay();

    if (this.onComplete) {
      this.onComplete();
    }
  }

  update(delta) {
    if (!this.isActive) return;

    this.timer += delta;
    const t = this.timer;

    // Phase 1: High-Altitude Skyscraper Sweep (0.0s - 4.5s)
    if (t < 4.5) {
      const p = t / 4.5;
      const easeP = p * p; // Accelerate downward
      this.game.camera.position.lerpVectors(this.camStartPos, this.camCityMid, easeP);
      this.game.camera.lookAt(new THREE.Vector3(0, 150 + Math.sin(t * 1.5) * 20, 0));

      this.game.ui.updateCinematicText('NEO-SHINJUKU RIFT // SECTOR 01', 'AETHER-9 ORBITAL SKYWAY METROPOLIS');
    }
    // Phase 2: Enter Hangar & Vehicle Revelation (4.5s - 7.0s)
    else if (t < 7.0) {
      const p = (t - 4.5) / 2.5;

      // Ensure vehicle is visible
      const startFrame = this.game.circuit.getFrameAt(0.0);
      const vehiclePos = startFrame.pos.clone().addScaledVector(startFrame.normal, 0.7);

      // Camera smoothly orbits vehicle
      const orbitAngle = p * Math.PI * 0.8;
      const radius = 14.0 - p * 4.0;
      this.game.camera.position.set(
        vehiclePos.x + Math.sin(orbitAngle) * radius,
        vehiclePos.y + 3.5 + Math.cos(p * 2.0) * 1.2,
        vehiclePos.z + Math.cos(orbitAngle) * radius
      );
      this.game.camera.lookAt(vehiclePos);

      if (t < 5.8) {
        this.game.ui.updateCinematicText('WELCOME, DRIVER.', 'RANJEET // DRIVER PROFILE DETECTED');
      } else {
        this.game.ui.updateCinematicText('YOUR VEHICLE IS READY.', 'F-8000 // NIGHTRIFT [INITIALIZING]');
      }
    }
    // Phase 3: Sequential Vehicle Systems Activation (7.0s - 9.5s)
    else if (t < 9.5) {
      const startFrame = this.game.circuit.getFrameAt(0.0);
      const vehiclePos = startFrame.pos.clone().addScaledVector(startFrame.normal, 0.7);

      this.game.camera.position.set(
        vehiclePos.x + Math.sin(Math.PI * 0.8 + (t - 7.0) * 0.4) * 9.5,
        vehiclePos.y + 2.8,
        vehiclePos.z + Math.cos(Math.PI * 0.8 + (t - 7.0) * 0.4) * 9.5
      );
      this.game.camera.lookAt(vehiclePos);

      // Sequential system power-on triggers
      if (t >= 7.2 && t < 7.8) {
        this.game.ui.updateCinematicText('SYSTEM DIAGNOSTIC: 25%', '► HEADLIGHTS: ONLINE');
      } else if (t >= 7.8 && t < 8.4) {
        this.game.ui.updateCinematicText('SYSTEM DIAGNOSTIC: 50%', '► ENERGY CORE: PULSING [100%]');
      } else if (t >= 8.4 && t < 9.0) {
        this.game.ui.updateCinematicText('SYSTEM DIAGNOSTIC: 75%', '► HYPER-BOOST NOZZLES: PRIMED');
      } else if (t >= 9.0) {
        this.game.ui.updateCinematicText('SYSTEM READY', 'TRAINING SECTOR 01 // AETHER DRIVER ACADEMY');
      }
    } else {
      this.finish();
    }
  }
}
