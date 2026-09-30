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
    this.countdownInt = 3;

    // Race progress
    this.currentLap = 1;
    this.maxLaps = 3;
    this.currentPosition = 1;
    this.totalRacers = 5;

    // Timers
    this.raceTime = 0.0;
    this.lapStartTime = 0.0;
    this.currentLapTime = 0.0;
    this.bestLapTime = null;
    this.lapHistory = [];

    // Zone Mode specific
    this.zoneLevel = 1;
    this.zoneSpeedMultiplier = 1.0;

    // Spline tracking
    this.playerTotalDistance = 0;
    this.lastPlayerU = 0;
  }

  startCountdown() {
    this.status = RACE_STATUS.COUNTDOWN;
    this.countdownTime = 3.0;
    this.countdownInt = 3;
    this.raceTime = 0;
    this.currentLap = 1;
    this.lapStartTime = 0;
    this.currentLapTime = 0;
    this.playerTotalDistance = 0;
  }

  update(delta, playerU, speedKmh, aiRacers = []) {
    // 1. Countdown Logic
    if (this.status === RACE_STATUS.COUNTDOWN) {
      this.countdownTime -= delta;
      const prevInt = this.countdownInt;
      this.countdownInt = Math.ceil(this.countdownTime);

      if (this.countdownInt !== prevInt && this.countdownInt > 0) {
        // Countdown beep
        if (this.sound) this.sound.playLapChime();
      }

      if (this.countdownTime <= 0) {
        this.status = RACE_STATUS.RACING;
        this.lapStartTime = performance.now();
        if (this.sound) this.sound.playBoostPadSound();
      }
      return;
    }

    if (this.status !== RACE_STATUS.RACING) return;

    // 2. Race Time update
    this.raceTime += delta;
    this.currentLapTime += delta;

    // 3. Track Lap Crossing (U wraps from ~0.95 to 0.05)
    if (this.lastPlayerU > 0.85 && playerU < 0.15) {
      this.onLapCompleted();
    }
    this.lastPlayerU = playerU;

    // Accumulate total distance
    const speedMs = speedKmh / 3.6;
    this.playerTotalDistance += speedMs * delta;

    // 4. Calculate Race Position (Grand Prix mode)
    if (this.mode === GAME_MODES.GRAND_PRIX) {
      let aheadCount = 0;
      aiRacers.forEach((ai) => {
        if (ai.totalDistance > this.playerTotalDistance) {
          aheadCount++;
        }
      });
      this.currentPosition = aheadCount + 1;
    }

    // 5. Zone Mode progression
    if (this.mode === GAME_MODES.ZONE) {
      // Every 12 seconds, increase zone
      this.zoneLevel = Math.floor(this.raceTime / 12) + 1;
      this.zoneSpeedMultiplier = 1.0 + (this.zoneLevel - 1) * 0.18;
    }
  }

  onLapCompleted() {
    this.lapHistory.push(this.currentLapTime);

    if (this.bestLapTime === null || this.currentLapTime < this.bestLapTime) {
      this.bestLapTime = this.currentLapTime;
    }

    if (this.sound) this.sound.playLapChime();

    if (this.currentLap >= this.maxLaps && this.mode === GAME_MODES.GRAND_PRIX) {
      this.status = RACE_STATUS.FINISHED;
    } else {
      this.currentLap++;
      this.currentLapTime = 0.0;
    }
  }

  formatTime(seconds) {
    if (seconds === null || isNaN(seconds)) return '--:--.---';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }
}
