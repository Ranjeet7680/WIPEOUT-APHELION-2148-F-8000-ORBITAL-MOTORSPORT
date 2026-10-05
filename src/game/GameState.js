// ============================================================================
// WIPEOUT: APHELION - RACE MANAGEMENT & GAME STATE ENGINE
// Lap timers, grid positions, race modes (Grand Prix, Time Trial, Zone, Sandbox)
// ============================================================================

export const GAME_MODES = {
  GRAND_PRIX: 'GRAND_PRIX',
  TIME_TRIAL: 'TIME_TRIAL',
  ZONE: 'ZONE',
  SANDBOX: 'SANDBOX'
};

export const RACE_STATUS = {
  COUNTDOWN: 'COUNTDOWN',
  RACING: 'RACING',
  FINISHED: 'FINISHED'
};

export class GameState {
  constructor(soundEngine) {
    this.sound = soundEngine;

    this.mode = GAME_MODES.GRAND_PRIX;
    this.status = RACE_STATUS.COUNTDOWN;

    // Countdown timer (3.. 2.. 1.. GO!)
    this.countdownTime = 3.0;
    this.countdownInt = 4;

    // Race progress
    this.currentLap = 1;
    this.maxLaps = 3;
    this.currentPosition = 1;
    this.displayPosition = 1;
    this.positionChangeTimer = 0;
    this.totalRacers = 5;
    this.onLapAdvance = null;

    // Timers
    this.raceTime = 0.0;
    this.lapStartTime = 0.0;
    this.currentLapTime = 0.0;
    this.bestLapTime = null;
    this.lapDeltaToPersonalBest = null;
    this.deltaDisplayTimer = 0.0;
    this.lapHistory = [];

    // Sectors
    this.sectorStartTime = 0.0;
    this.currentSector = 0;
    this.sectorTimes = [];
    this.bestSectorTimes = [null, null, null];

    // Zone Mode specific
    this.zoneLevel = 1;
    this.zoneSpeedMultiplier = 1.0;
    this.zoneColor = '#00F0FF';

    // Spline tracking & Checkpoints
    this.playerTotalDistance = 0;
    this.lastPlayerU = 0;
    this.totalCheckpoints = 8;
    this.currentCheckpointIndex = 0;
    this.checkpointsPassedInLap = 0;
    this.checkpointUList = [0.12, 0.25, 0.38, 0.50, 0.65, 0.78, 0.88, 0.98];
    this.lastCheckpointU = 0.0;
    this.isWrongWay = false;
    this.wrongWayTimer = 0.0;
  }

  getSectorLabel() {
    return 'S' + (this.currentSector + 1);
  }

  startCountdown() {
    this.status = RACE_STATUS.COUNTDOWN;
    this.countdownTime = 3.0;
    this.countdownInt = 4;
    this.raceTime = 0;
    this.currentLap = 1;
    this.lapStartTime = 0;
    this.currentLapTime = 0;
    this.playerTotalDistance = 0;
    this.currentSector = 0;
    this.lastPlayerU = 0.0;
    this.sectorStartTime = 0;
    this.sectorTimes = [];
    this.lapDeltaToPersonalBest = null;
    this.deltaDisplayTimer = 0.0;
    this.bestLapTime = null;
    this.lapHistory = [];
    this.bestSectorTimes = [null, null, null];
    this.currentPosition = 1;
    this.displayPosition = 1;
    this.positionChangeTimer = 0;
    this.currentCheckpointIndex = 0;
    this.checkpointsPassedInLap = 0;
    this.lastCheckpointU = 0.0;
    this.isWrongWay = false;
    this.wrongWayTimer = 0.0;
  }

  update(delta, playerU, speedKmh, aiRacers = []) {
    // 1. Countdown Logic
    if (this.status === RACE_STATUS.COUNTDOWN) {
      this.countdownTime -= delta;
      const prevInt = this.countdownInt;
      this.countdownInt = Math.ceil(this.countdownTime);

      if (this.countdownInt !== prevInt && this.countdownInt > 0) {
        // Countdown beep
        if (this.sound && this.sound.playCountdownBeep) this.sound.playCountdownBeep(false);
      }

      if (this.countdownTime <= 0) {
        this.status = RACE_STATUS.RACING;
        this.lapStartTime = performance.now();
        this.sectorStartTime = this.lapStartTime;
        if (this.sound && this.sound.playCountdownBeep) this.sound.playCountdownBeep(true);
        if (this.sound) this.sound.playBoostPadSound();
      }
      return;
    }

    if (this.status !== RACE_STATUS.RACING) return;

    // 2. Race Time update
    this.raceTime += delta;
    this.currentLapTime += delta;

    if (this.deltaDisplayTimer > 0) {
      this.deltaDisplayTimer -= delta;
      if (this.deltaDisplayTimer <= 0) {
        this.lapDeltaToPersonalBest = null;
      }
    }

    // 3. Track Checkpoints & Sectors
    for (let i = 0; i < this.checkpointUList.length; i++) {
      const cpU = this.checkpointUList[i];
      if ((this.lastPlayerU <= cpU && playerU >= cpU) || (Math.abs(playerU - cpU) < 0.025)) {
        if (i === this.currentCheckpointIndex) {
          this.currentCheckpointIndex = (this.currentCheckpointIndex + 1) % this.totalCheckpoints;
          this.checkpointsPassedInLap++;
          this.lastCheckpointU = cpU;
          if (this.sound && this.sound.playCheckpointChime) this.sound.playCheckpointChime();
        }
      }
    }

    const sector1Threshold = 0.333;
    const sector2Threshold = 0.666;

    if (this.currentSector === 0 && playerU >= sector1Threshold && this.lastPlayerU < sector1Threshold) {
      this.recordSector(0);
      this.currentSector = 1;
    } else if (this.currentSector === 1 && playerU >= sector2Threshold && this.lastPlayerU < sector2Threshold) {
      this.recordSector(1);
      this.currentSector = 2;
    }

    // 4. Track Lap Crossing (U wraps from ~0.95 to 0.05)
    if (this.lastPlayerU > 0.85 && playerU < 0.15) {
      this.recordSector(2);
      this.onLapCompleted();
      this.currentSector = 0;
      this.sectorStartTime = performance.now();
      this.checkpointsPassedInLap = 0;
      this.currentCheckpointIndex = 0;
      this.lastCheckpointU = 0.0;
    }

    // Wrong-way driving detection
    if (speedKmh > 25.0) {
      const isWrapping = (this.lastPlayerU > 0.85 && playerU < 0.15);
      if (!isWrapping && (this.lastPlayerU - playerU > 0.0012)) {
        this.wrongWayTimer += delta;
        if (this.wrongWayTimer > 0.3) {
          this.isWrongWay = true;
        }
      } else {
        this.wrongWayTimer = Math.max(0.0, this.wrongWayTimer - delta * 2.0);
        if (this.wrongWayTimer <= 0) {
          this.isWrongWay = false;
        }
      }
    } else {
      this.isWrongWay = false;
      this.wrongWayTimer = 0.0;
    }

    this.lastPlayerU = playerU;

    // Accumulate total distance
    const speedMs = speedKmh / 3.6;
    this.playerTotalDistance += speedMs * delta;

    // 5. Calculate Race Position (Grand Prix mode)
    if (this.mode === GAME_MODES.GRAND_PRIX) {
      let aheadCount = 0;
      aiRacers.forEach((ai) => {
        if (ai.totalDistance > this.playerTotalDistance) {
          aheadCount++;
        }
      });
      const newPos = aheadCount + 1;
      
      if (newPos !== this.currentPosition) {
        this.currentPosition = newPos;
        this.positionChangeTimer = 0.3;
      }
      
      if (this.positionChangeTimer > 0) {
        this.positionChangeTimer -= delta;
      } else {
        this.displayPosition = this.currentPosition;
      }
    }

    // 6. Zone Mode progression
    if (this.mode === GAME_MODES.ZONE) {
      // Every 12 seconds, increase zone
      this.zoneLevel = Math.floor(this.raceTime / 12) + 1;
      this.zoneSpeedMultiplier = Math.min(3.5, 1.0 + (this.zoneLevel - 1) * 0.18);
      
      if (this.zoneLevel <= 3) this.zoneColor = '#00F0FF';
      else if (this.zoneLevel <= 6) this.zoneColor = '#FFD700';
      else if (this.zoneLevel <= 10) this.zoneColor = '#FF4400';
      else this.zoneColor = '#FF0080';
    }
  }

  recordSector(sectorIndex) {
    const now = performance.now();
    const sectorTime = (now - this.sectorStartTime) / 1000.0;
    this.sectorTimes[sectorIndex] = sectorTime;
    
    if (this.bestSectorTimes[sectorIndex] !== null) {
      this.lapDeltaToPersonalBest = sectorTime - this.bestSectorTimes[sectorIndex];
      this.deltaDisplayTimer = 4.0;
    }

    if (this.bestSectorTimes[sectorIndex] === null || sectorTime < this.bestSectorTimes[sectorIndex]) {
      this.bestSectorTimes[sectorIndex] = sectorTime;
    }
    
    this.sectorStartTime = now;
  }

  onLapCompleted() {
    this.lapHistory.push(this.currentLapTime);

    if (this.bestLapTime !== null) {
      this.lapDeltaToPersonalBest = this.currentLapTime - this.bestLapTime;
      this.deltaDisplayTimer = 4.0;
    }

    if (this.bestLapTime === null || this.currentLapTime < this.bestLapTime) {
      this.bestLapTime = this.currentLapTime;
    }

    if (this.sound) this.sound.playLapChime();

    if (this.currentLap >= this.maxLaps && this.mode === GAME_MODES.GRAND_PRIX) {
      this.displayPosition = this.currentPosition;
      this.status = RACE_STATUS.FINISHED;
    } else {
      this.currentLap++;
      this.currentLapTime = 0.0;
      if (this.onLapAdvance) {
        this.onLapAdvance(this.currentLap);
      }
    }
  }

  formatTime(seconds) {
    if (seconds === null || isNaN(seconds)) return '--:--.---';
    const sign = seconds < 0 ? '-' : '';
    const absSec = Math.abs(seconds);
    const mins = Math.floor(absSec / 60);
    const secs = Math.floor(absSec % 60);
    const millis = Math.floor((absSec % 1) * 1000);
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }

  getCheckpointProgress() {
    return `${Math.min(this.totalCheckpoints, this.checkpointsPassedInLap + 1)} / ${this.totalCheckpoints}`;
  }

  getCurrentCheckpointName() {
    const cpNames = [
      'CP 01 // NEON GATE',
      'CP 02 // SKYWAY SUMMIT',
      'CP 03 // CRYO-TRENCH',
      'CP 04 // OLD ALLEY',
      'CP 05 // UNDERCITY EXIT',
      'CP 06 // LAUNCH PYLON',
      'CP 07 // MEGA TOWER SWEEP',
      'CP 08 // GANTRY APPROACH'
    ];
    return cpNames[this.currentCheckpointIndex] || 'CP 01';
  }
}
