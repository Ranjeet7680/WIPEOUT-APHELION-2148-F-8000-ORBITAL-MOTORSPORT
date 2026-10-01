import * as THREE from 'three';
import { saveManager } from '../game/SaveManager.js';

// ============================================================================
// TRAINING SECTOR 01: AETHER DRIVER ACADEMY
// Complete 10-Step Interactive Driving School + Final 2-Lap Graduation Race
// Steps: Movement, Braking Zone, Drift Meter, Hyper Boost, Checkpoint Routing,
// Minimap Highlight, Timing-based Perfect Boost, Stunt Ramp & Rolls,
// Civilian Near Misses, AI Rival Overtake, Certification & Rewards
// ============================================================================

export const TUTORIAL_STEPS = {
  STEP_01_MOVEMENT: 0,
  STEP_02_BRAKING: 1,
  STEP_03_DRIFT: 2,
  STEP_04_BOOST: 3,
  STEP_05_CHECKPOINTS: 4,
  STEP_06_MINIMAP: 5,
  STEP_07_PERFECT_BOOST: 6,
  STEP_08_STUNT: 7,
  STEP_09_TRAFFIC: 8,
  STEP_10_RIVAL: 9,
  FINAL_RACE: 10,
  COMPLETED: 11
};

export class TutorialManager {
  constructor(gameManager, vectorInstructor) {
    this.game = gameManager;
    this.vector = vectorInstructor;

    this.isActive = false;
    this.currentStep = TUTORIAL_STEPS.STEP_01_MOVEMENT;
    this.isReplayingModule = false;
    this.replayedModuleKey = null;

    // Step state tracking
    this.movementTracker = { drivenForward: false, steered: false, timer: 0 };
    this.brakingZoneU = 0.08;
    this.brakingZoneMesh = null;
    this.driftProgress = 0.0;
    this.boostTriggered = false;
    this.checkpointsPassed = 0;
    this.minimapPaused = false;
    this.perfectBoostSweetSpot = false;
    this.stuntsDone = 0;
    this.nearMissCount = 0;
    this.rivalOvertaken = false;

    // Final race state
    this.finalRaceLaps = 2;
    this.currentLap = 1;

    // 3D Visual Props for Tutorial (Braking zone, Holographic gates)
    this.tutorialPropsGroup = new THREE.Group();
    this.game.scene.add(this.tutorialPropsGroup);
    this.tutorialPropsGroup.visible = false;

    this.createBrakingZoneMarker();
  }

  createBrakingZoneMarker() {
    // Holographic glowing braking zone decal across track
    const w = this.game.circuit.roadWidth;
    const l = 35.0;
    const geo = new THREE.PlaneGeometry(w, l);
    geo.rotateX(-Math.PI * 0.5);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255, 30, 60, 0.4)';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#FF1E3C';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 236);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▼ BRAKING ZONE // STOP HERE ▼', 256, 140);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.brakingZoneMesh = new THREE.Mesh(geo, mat);
    this.brakingZoneMesh.visible = false;
    this.tutorialPropsGroup.add(this.brakingZoneMesh);
  }

  startTutorial(isFullCourse = true, singleModuleKey = null) {
    this.isActive = true;
    this.isReplayingModule = !isFullCourse;
    this.replayedModuleKey = singleModuleKey;

    // Show tutorial track props
    this.tutorialPropsGroup.visible = true;

    // Position player vehicle at tutorial sector start
    this.game.setTrackVisible(true);
    this.game.garageLobby.hide();
    this.game.podiumScene.hide();

    if (this.game.playerVehicle.group.parent) {
      this.game.playerVehicle.group.parent.remove(this.game.playerVehicle.group);
    }
    this.game.scene.add(this.game.playerVehicle.group);

    this.game.physics.resetToStart();
    this.game.physics.boostCapacity = 1.0;

    // Reset AI racers for tutorial mode
    this.game.rivals.despawnAll();

    // Map module key to step index
    if (!isFullCourse && singleModuleKey) {
      const map = {
        movement: TUTORIAL_STEPS.STEP_01_MOVEMENT,
        braking: TUTORIAL_STEPS.STEP_02_BRAKING,
        drift: TUTORIAL_STEPS.STEP_03_DRIFT,
        boost: TUTORIAL_STEPS.STEP_04_BOOST,
        checkpoints: TUTORIAL_STEPS.STEP_05_CHECKPOINTS,
        minimap: TUTORIAL_STEPS.STEP_06_MINIMAP,
        perfectBoost: TUTORIAL_STEPS.STEP_07_PERFECT_BOOST,
        stunts: TUTORIAL_STEPS.STEP_08_STUNT,
        traffic: TUTORIAL_STEPS.STEP_09_TRAFFIC,
        rival: TUTORIAL_STEPS.STEP_10_RIVAL,
        finalRace: TUTORIAL_STEPS.FINAL_RACE
      };
      this.currentStep = map[singleModuleKey] !== undefined ? map[singleModuleKey] : TUTORIAL_STEPS.STEP_01_MOVEMENT;
    } else {
      this.currentStep = TUTORIAL_STEPS.STEP_01_MOVEMENT;
    }

    this.initCurrentStep();
  }

  initCurrentStep() {
    // Reset transient step flags
    this.movementTracker = { drivenForward: false, steered: false, timer: 0 };
    this.driftProgress = 0.0;
    this.boostTriggered = false;
    this.checkpointsPassed = 0;
    this.minimapPaused = false;
    this.stuntsDone = 0;
    this.nearMissCount = 0;
    this.rivalOvertaken = false;

    // Hide braking zone unless on step 2
    if (this.brakingZoneMesh) {
      this.brakingZoneMesh.visible = (this.currentStep === TUTORIAL_STEPS.STEP_02_BRAKING);
      if (this.brakingZoneMesh.visible) {
        const frame = this.game.circuit.getFrameAt(this.brakingZoneU);
        this.brakingZoneMesh.position.copy(frame.pos).addScaledVector(frame.normal, 0.2);
        this.brakingZoneMesh.quaternion.copy(new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent)
        ));
      }
    }

    // Step-specific instructions & Vector voice prompts
    switch (this.currentStep) {
      case TUTORIAL_STEPS.STEP_01_MOVEMENT:
        this.game.ui.showTutorialInstruction(
          'STEP 01 // MOVEMENT',
          'ACCELERATE: [W] / [UP]  |  STEER: [A / D] / [LEFT / RIGHT]',
          'Drive forward and steer to calibrate propulsion modules.'
        );
        this.vector.speak(
          'Welcome, driver. Accelerate using W or Up Arrow, and steer using A and D.',
          'Accelerate using [W] / [UP ARROW]. Steer using [A / D].'
        );
        break;

      case TUTORIAL_STEPS.STEP_02_BRAKING:
        this.game.ui.showTutorialInstruction(
          'STEP 02 // BRAKING ZONE',
          'BRAKE: [S] / [DOWN]  |  EMERGENCY: [E]',
          'Accelerate into the red zone, then brake to a complete stop.'
        );
        this.vector.speak(
          'Braking zone ahead. Bring the vehicle to a controlled stop.',
          'Braking zone ahead. Press [S] to halt.'
        );
        break;

      case TUTORIAL_STEPS.STEP_03_DRIFT:
        this.game.ui.showTutorialInstruction(
          'STEP 03 // HIGH-SPEED DRIFT',
          'HOLD [SHIFT] + [STEER A/D]',
          'Initiate drift into the corner to build boost power.'
        );
        this.vector.speak(
          'Corner approaching. Hold Shift and steer to initiate a drift.',
          'Hold [SHIFT] while steering to drift.'
        );
        break;

      case TUTORIAL_STEPS.STEP_04_BOOST:
        this.game.physics.boostCapacity = 1.0;
        this.game.ui.showTutorialInstruction(
          'STEP 04 // HYPER BOOST',
          'PRESS [SPACE] TO IGNITE BOOST',
          'Discharge ion plasma injectors to break sound barrier.'
        );
        this.vector.speak(
          'Boost ready. Press Space to ignite Hyper-Boost.',
          'Press [SPACE] to ignite Hyper-Boost.'
        );
        break;

      case TUTORIAL_STEPS.STEP_05_CHECKPOINTS:
        this.game.ui.showTutorialInstruction(
          'STEP 05 // ROUTE NAVIGATION',
          'DRIVE THROUGH 3 HOLOGRAPHIC GATES',
          'Follow the cyan telemetry course markers.'
        );
        this.vector.speak(
          'Follow the blue route through the navigation checkpoints.',
          'Pass through 3 holographic checkpoint gates.'
        );
        break;

      case TUTORIAL_STEPS.STEP_06_MINIMAP:
        this.minimapPaused = true;
        this.game.ui.highlightMinimap();
        this.game.ui.showTutorialInstruction(
          'STEP 06 // HOLOGRAPHIC RADAR',
          'PRESS [ANY KEY] / [TAP] TO RESUME',
          'The radar monitors track geometry, competitors and altitude rifts.'
        );
        this.vector.speak(
          'The minimap shows your position, route, rivals and checkpoints.',
          'The minimap shows your position, route, and checkpoints.'
        );
        break;

      case TUTORIAL_STEPS.STEP_07_PERFECT_BOOST:
        this.game.ui.showPerfectBoostWindow(true);
        this.game.ui.showTutorialInstruction(
          'STEP 07 // PERFECT BOOST TIMING',
          'ACTIVATE BOOST INSIDE THE SWEET SPOT [SPACE]',
          'Trigger boost when the needle aligns with the cyan target.'
        );
        this.vector.speak(
          'Activate boost when the indicator enters the perfect zone.',
          'Time your boost in the sweet spot for OVERDRIVE.'
        );
        break;

      case TUTORIAL_STEPS.STEP_08_STUNT:
        // Teleport near ramp at u = 0.20
        const rampFrame = this.game.circuit.getFrameAt(0.20);
        this.game.physics.currentU = 0.20;
        this.game.physics.pos.copy(rampFrame.pos).addScaledVector(rampFrame.normal, 0.8);
        this.game.physics.vel.copy(rampFrame.tangent).multiplyScalar(55.0); // 200 km/h

        this.game.ui.showTutorialInstruction(
          'STEP 08 // AERIAL STUNT & LANDING',
          'LAUNCH OFF RAMP  |  ROLL: [A/D]  |  SPIN: [SPACE]',
          'Hit the ramp at high speed, perform a stunt and land cleanly.'
        );
        this.vector.speak(
          'Use the ramp. Steer in midair for barrel rolls, or boost for 360 spins.',
          'Hit the ramp. Perform a Barrel Roll or 360 Spin.'
        );
        break;

      case TUTORIAL_STEPS.STEP_09_TRAFFIC:
        // Spawn civilian traffic directly ahead of player
        this.game.traffic.spawnCivilianDroneCluster(this.game.physics.currentU + 0.03, 3);
        this.game.ui.showTutorialInstruction(
          'STEP 09 // CIVILIAN TRAFFIC & NEAR MISS',
          'PASS CLOSE TO HOVER TRAFFIC WITHOUT COLLIDING',
          'Thread between slow vehicles to earn instant boost energy surges.'
        );
        this.vector.speak(
          'Pass close to traffic without colliding to earn near miss bonuses.',
          'Pass close to civilian hover traffic.'
        );
        break;

      case TUTORIAL_STEPS.STEP_10_RIVAL:
        // Spawn Kane 40m ahead driving at 160 km/h
        this.game.rivals.spawnSingleRival('kane', this.game.physics.currentU + 0.025, 170.0);
        this.game.ui.showTutorialInstruction(
          'STEP 10 // AI RIVAL OVERTAKE',
          'OVERTAKE RIVAL RACER: KANE',
          'Draft in Kane\'s slipstream and execute a clean high-speed pass.'
        );
        this.vector.speak(
          'Rival detected. Draft behind Kane and overtake.',
          'Overtake rival racer: KANE.'
        );
        break;

      case TUTORIAL_STEPS.FINAL_RACE:
        // Spawn 3 beginner AI bots
        this.game.rivals.spawnTutorialGrid(['kane', 'mira', 'zero'], 220.0);
        this.game.physics.resetToStart();
        this.game.gameState.startCountdown();
        this.game.ui.showTutorialInstruction(
          'FINAL TRAINING RUN // 2 LAPS',
          'RACE 3 ACADEMY CADETS // PROVE YOUR COMPETENCE',
          'Apply everything you have learned: Boost, Drift, Stunts & Overtakes.'
        );
        this.vector.speak(
          'Final training run initiated. Two laps against academy pilots. Good luck.',
          'Final training run: 2 Laps vs Academy Cadets.'
        );
        break;
    }
  }

  update(delta, keys, physics) {
    if (!this.isActive) return;

    const speedKmh = physics.getSpeedKmh();

    switch (this.currentStep) {
      // ----------------------------------------------------------------------
      // STEP 01: MOVEMENT
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_01_MOVEMENT: {
        if (keys['KeyW'] || keys['ArrowUp'] || speedKmh > 60.0) {
          this.movementTracker.drivenForward = true;
        }
        if (Math.abs(physics.inputs.steer) > 0.4 || Math.abs(physics.lateralOffset) > 2.0) {
          this.movementTracker.steered = true;
        }
        if (this.movementTracker.drivenForward && this.movementTracker.steered) {
          this.movementTracker.timer += delta;
          if (this.movementTracker.timer > 1.8) {
            this.completeStep(TUTORIAL_STEPS.STEP_01_MOVEMENT, 'movement', '✓ MOVEMENT COMPLETE', 100);
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 02: BRAKING
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_02_BRAKING: {
        const distToZone = Math.abs(physics.currentU - this.brakingZoneU) * 5400.0;
        this.game.ui.updateBrakingDistance(distToZone, speedKmh);

        const reachedZone = (distToZone < 70.0) || (physics.currentU > (this.brakingZoneU - 0.015) && physics.totalDistance > 60.0);
        if (reachedZone) {
          if (keys['KeyS'] || keys['ArrowDown'] || keys['KeyE'] || (physics.inputs && physics.inputs.brake > 0) || speedKmh < 18.0) {
            if (speedKmh < 18.0) {
              this.completeStep(TUTORIAL_STEPS.STEP_02_BRAKING, 'braking', '✓ BRAKING COMPLETE', 150);
            }
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 03: DRIFT
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_03_DRIFT: {
        if (physics.isDrifting && speedKmh > 80.0) {
          this.driftProgress += delta * 0.85;
          this.game.ui.updateDriftMeter(this.driftProgress);

          if (this.driftProgress >= 1.0) {
            this.completeStep(TUTORIAL_STEPS.STEP_03_DRIFT, 'drift', 'PERFECT DRIFT!', 250);
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 04: BOOST
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_04_BOOST: {
        if (physics.isBoosting && speedKmh > 260.0) {
          this.completeStep(TUTORIAL_STEPS.STEP_04_BOOST, 'boost', '✓ BOOST COMPLETE', 200);
        }
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 05: CHECKPOINTS
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_05_CHECKPOINTS: {
        // Track passing through any of the circuit checkpoints
        this.game.circuit.checkpoints.slice(0, 3).forEach(cp => {
          if (Math.abs(physics.currentU - cp.u) < 0.012) {
            if (!cp.tutorialPassed) {
              cp.tutorialPassed = true;
              this.checkpointsPassed++;
              this.vector.speak(`Checkpoint ${this.checkpointsPassed} verified.`, `Checkpoint 0${this.checkpointsPassed} / 03 complete.`);
              this.game.vfx.spawnCheckpointBurst(physics.pos, physics.quat, true);

              if (this.checkpointsPassed >= 3) {
                this.completeStep(TUTORIAL_STEPS.STEP_05_CHECKPOINTS, 'checkpoints', '✓ NAVIGATION COMPLETE', 250);
              }
            }
          }
        });
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 06: MINIMAP
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_06_MINIMAP: {
        // Paused until user presses key or touch
        if (this.minimapPaused) {
          const hasInput = Object.values(keys).some(k => k === true);
          if (hasInput) {
            this.minimapPaused = false;
            this.game.ui.unhighlightMinimap();
            this.completeStep(TUTORIAL_STEPS.STEP_06_MINIMAP, 'minimap', '✓ RADAR CALIBRATED', 100);
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 07: PERFECT BOOST TIMING
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_07_PERFECT_BOOST: {
        // UI needle oscillates in timing window
        const now = performance.now() * 0.003;
        const needlePos = (Math.sin(now * 3.5) + 1.0) * 0.5; // 0..1
        this.game.ui.updatePerfectBoostNeedle(needlePos);

        // Keep boost gauge topped up so pilot can retry smoothly
        physics.boostCapacity = 1.0;

        const inSweetSpot = (needlePos >= 0.36 && needlePos <= 0.64);
        if (keys['Space'] || (physics.inputs && physics.inputs.boost)) {
          if (inSweetSpot) {
            physics.boostTier = 'OVERDRIVE';
            this.game.ui.showPerfectBoostWindow(false);
            this.completeStep(TUTORIAL_STEPS.STEP_07_PERFECT_BOOST, 'perfectBoost', 'PERFECT BOOST! // OVERDRIVE', 350);
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 08: STUNT TRAINING
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_08_STUNT: {
        if (physics.aerialState.inAir) {
          if (physics.aerialState.barrelRollProgress > 1.0 || physics.aerialState.spin360Progress > 1.0 || physics.totalStunts > 0) {
            this.stuntsDone++;
          }
        }
        // Completed upon clean landing or stunt registered
        if ((!physics.aerialState.inAir && this.stuntsDone > 0) || physics.totalStunts > 0) {
          this.completeStep(TUTORIAL_STEPS.STEP_08_STUNT, 'stunts', 'STUNT COMPLETE! // +500 XP', 500);
        }
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 09: TRAFFIC / NEAR MISS
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_09_TRAFFIC: {
        if (physics.totalNearMisses > this.nearMissCount) {
          this.nearMissCount = physics.totalNearMisses;
          this.vector.speak('Near miss confirmed. Clean precision.', `NEAR MISS x0${this.nearMissCount}!`);
        }
        if (this.nearMissCount >= 1 || physics.totalNearMisses >= 1) {
          this.completeStep(TUTORIAL_STEPS.STEP_09_TRAFFIC, 'traffic', '✓ TRAFFIC NAVIGATION COMPLETE', 300);
        }
        break;
      }

      // ----------------------------------------------------------------------
      // STEP 10: AI RIVAL OVERTAKE
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.STEP_10_RIVAL: {
        const kane = this.game.rivals.rivals.find(r => r.name.toLowerCase() === 'kane');
        if (kane) {
          // If player's total distance surpasses Kane's total distance or spline progression
          if (physics.totalDistance > (kane.totalDistance + 8.0) || (physics.currentU > kane.currentU && (physics.currentU - kane.currentU < 0.1))) {
            this.completeStep(TUTORIAL_STEPS.STEP_10_RIVAL, 'rival', '✓ OVERTAKE COMPLETE', 400);
          }
        } else {
          this.completeStep(TUTORIAL_STEPS.STEP_10_RIVAL, 'rival', '✓ OVERTAKE COMPLETE', 400);
        }
        break;
      }

      // ----------------------------------------------------------------------
      // FINAL RACE: 2 LAPS VS 3 BOTS
      // ----------------------------------------------------------------------
      case TUTORIAL_STEPS.FINAL_RACE: {
        if (this.game.gameState.currentLap > this.finalRaceLaps) {
          this.completeTutorialGraduation();
        }
        break;
      }
    }
  }

  completeStep(stepIndex, moduleKey, successTitle, xpReward) {
    saveManager.completeModule(moduleKey);

    // Audio chime & visual popup
    if (this.game.sound) this.game.sound.playPerfectLanding();
    this.game.ui.showActionPopup(successTitle, xpReward, 1);

    if (this.isReplayingModule) {
      // Replaying a single module finishes immediately
      setTimeout(() => {
        this.finishSingleModuleReplay(moduleKey);
      }, 1500);
      return;
    }

    // Advance to next step
    setTimeout(() => {
      this.currentStep = stepIndex + 1;
      this.initCurrentStep();
    }, 1800);
  }

  finishSingleModuleReplay(moduleKey) {
    this.isActive = false;
    this.tutorialPropsGroup.visible = false;
    this.game.ui.showDrivingSchoolModal();
    this.vector.speak('Module completed successfully. Returning to driving school.', 'Module Complete.');
  }

  completeTutorialGraduation() {
    this.currentStep = TUTORIAL_STEPS.COMPLETED;
    this.isActive = false;
    this.tutorialPropsGroup.visible = false;

    // Grant certification rewards
    saveManager.completeTutorial({ xp: 2500, credits: 1000, badge: true });

    // Show certified UI modal
    this.game.ui.showTutorialCertifiedModal({
      accelerationStars: 4,
      handlingStars: 3,
      driftStars: 4,
      boostStars: 5,
      stuntStars: 3,
      xpEarned: 2500,
      creditsEarned: 1000
    });

    this.vector.speak(
      'Training complete. Driver certified. Welcome to Neo-Shinjuku.',
      'TRAINING COMPLETE // DRIVER CERTIFIED // AETHER-9 NETWORK ACCESS GRANTED'
    );
  }
}
