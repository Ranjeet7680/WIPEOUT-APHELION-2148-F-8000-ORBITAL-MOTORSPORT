// ============================================================================
// MODERN RACE HUD: NEO-SHINJUKU RIFT // HYPER CIRCUIT
// 80–90% Unobstructed Racing Viewport, Peripheral Cyberpunk Telemetry,
// Digital Speedometer, Hyper-Boost Energy Gauge, and Live Standings
// ============================================================================

export class ModernRaceHUD {
  constructor(gameManager) {
    this.game = gameManager;

    this.container = document.createElement('div');
    this.container.id = 'modern-race-hud';
    this.container.className = 'modern-hud-layer';

    this.buildHUDDOM();
    document.body.appendChild(this.container);
  }

  buildHUDDOM() {
    this.container.innerHTML = `
      <!-- TOP NAVIGATION BAR -->
      <div class="hud-top-bar">
        <!-- TOP-LEFT: STANDINGS -->
        <div class="hud-corner-box top-left">
          <div class="hud-box-header">[ GRID STANDINGS ]</div>
          <div class="hud-standings-list" id="hud-standings">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- TOP-CENTER: DISTRICT BANNER -->
        <div class="hud-center-district">
          <div class="district-title" id="hud-district-name">NEO-SHINJUKU RIFT // NEON CORE</div>
          <div class="district-sub" id="hud-district-sub">DISTRICT 01 // METROPOLIS HEART</div>
        </div>

        <!-- TOP-RIGHT: HOLOGRAPHIC MINIMAP -->
        <div class="hud-corner-box top-right minimap-box">
          <div class="hud-box-header">[ AETHER-9 // NAV ]</div>
          <canvas id="hud-minimap-canvas" width="200" height="200"></canvas>
        </div>
      </div>

      <!-- RACE TELEMETRY BADGES (UPPER LEFT) -->
      <div class="hud-race-badges">
        <div class="badge-item">
          <span class="badge-label">POS</span>
          <strong class="badge-val cyan" id="hud-pos">01<small>/09</small></strong>
        </div>
        <div class="badge-item">
          <span class="badge-label">LAP</span>
          <strong class="badge-val" id="hud-lap">01<small>/03</small></strong>
        </div>
        <div class="badge-item">
          <span class="badge-label">TIME</span>
          <strong class="badge-val mono" id="hud-time">00:00.000</strong>
        </div>
        <div class="badge-item">
          <span class="badge-label">BEST</span>
          <strong class="badge-val mono" id="hud-best">--:--.---</strong>
        </div>
      </div>

      <!-- COUNTDOWN LIGHT TREE & TEXT -->
      <div class="hud-countdown" id="hud-countdown-overlay">
        <div class="countdown-lights">
          <span class="c-light red" id="cl-1"></span>
          <span class="c-light red" id="cl-2"></span>
          <span class="c-light red" id="cl-3"></span>
          <span class="c-light green" id="cl-go"></span>
        </div>
        <div class="countdown-big-text" id="hud-countdown-text">READY</div>
        <div class="countdown-sub-text" id="hud-countdown-sub">SYSTEM CHECK // BOOST READY</div>
      </div>

      <!-- BOTTOM NAVIGATION & SPEEDOMETER -->
      <div class="hud-bottom-bar">
        <!-- BOTTOM-LEFT: COMPACT TECHNICAL TELEMETRY -->
        <div class="hud-corner-box bottom-left compact">
          <div class="hud-box-header">[ SYSTEM TELEMETRY ]</div>
          <div class="telemetry-compact-grid">
            <span>MRT G-BUFFER: <b class="cyan">TARGET 0-3</b></span>
            <span>Hi-Z SSR: <b class="cyan">GGX VNDF</b></span>
            <span>GPU MESHLETS: <b class="cyan">73% CULLED</b></span>
            <span>NEURAL POLICY: <b class="cyan">0.32ms</b></span>
          </div>
        </div>

        <!-- BOTTOM-CENTER: CURRENT OBJECTIVE & CONTROLS HELPER -->
        <div class="hud-center-objective">
          <span class="obj-tag">CURRENT OBJECTIVE</span>
          <strong class="obj-text" id="hud-objective-text">REACH CHECKPOINT 01 // NEON GATE</strong>
          <div class="hud-controls-helper">
            <span>[W/A/S/D] DRIVE</span>
            <span>[SHIFT] DRIFT</span>
            <span>[SPACE] BOOST</span>
            <span>[E] BRAKE</span>
            <span>[M] MAP</span>
            <span>[G] GARAGE</span>
            <span>[C] CAM</span>
            <span>[R] RESET</span>
          </div>
        </div>

        <!-- BOTTOM-RIGHT: DIGITAL SPEEDOMETER & HYPER-BOOST GAUGE -->
        <div class="hud-corner-box bottom-right speed-box">
          <div class="speed-readout">
            <span class="speed-num" id="hud-speed">000</span>
            <span class="speed-unit">KM/H</span>
          </div>
          <div class="drift-status" id="hud-drift-status">DRIFT: READY</div>

          <div class="boost-meter-container">
            <div class="boost-label">
              <span>HYPER-BOOST [SPACE]</span>
              <span id="hud-boost-pct">100%</span>
            </div>
            <div class="boost-bar-track">
              <div class="boost-bar-fill" id="hud-boost-fill" style="width:100%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- FINISH RESULTS MODAL -->
      <div class="hud-finish-modal" id="hud-finish-modal" style="display:none;">
        <div class="finish-window">
          <h2>RACE COMPLETE</h2>
          <div class="finish-pos" id="finish-pos">1ST PLACE</div>
          <div class="finish-stats-grid">
            <div class="stat-cell"><span>TOTAL TIME</span><strong id="f-total-time">02:14.382</strong></div>
            <div class="stat-cell"><span>BEST LAP</span><strong id="f-best-lap">00:42.119</strong></div>
            <div class="stat-cell"><span>TOP SPEED</span><strong id="f-top-speed">420 KM/H</strong></div>
            <div class="stat-cell"><span>DRIFT SCORE</span><strong id="f-drift-score">14,250 PTS</strong></div>
          </div>
          <button class="finish-btn" id="finish-restart-btn">RACE AGAIN</button>
        </div>
      </div>
    `;

    document.getElementById('finish-restart-btn').addEventListener('click', () => {
      this.game.restartRace();
      document.getElementById('hud-finish-modal').style.display = 'none';
    });
  }

  update(physics, gameState, rivalsSystem, currentDistrict) {
    if (!physics || !gameState) return;

    const speedKmh = Math.floor(physics.getSpeedKmh());

    // 1. Speedometer
    const speedEl = document.getElementById('hud-speed');
    if (speedEl) speedEl.textContent = speedKmh.toString().padStart(3, '0');

    // 2. Drift status
    const driftEl = document.getElementById('hud-drift-status');
    if (driftEl) {
      if (physics.isDrifting) {
        driftEl.textContent = 'DRIFT: ENGAGED // +BOOST';
        driftEl.className = 'drift-status active';
      } else {
        driftEl.textContent = 'DRIFT [SHIFT]: READY';
        driftEl.className = 'drift-status';
      }
    }

    // 3. Hyper-Boost Bar
    const boostFill = document.getElementById('hud-boost-fill');
    const boostPct = document.getElementById('hud-boost-pct');
    if (boostFill) {
      const pct = Math.round(physics.boostCapacity * 100);
      boostFill.style.width = `${pct}%`;
      boostFill.classList.toggle('boosting', physics.isBoosting);
      if (boostPct) boostPct.textContent = `${pct}%`;
    }

    // 4. Badges: Position, Lap, Time
    document.getElementById('hud-pos').innerHTML = `${gameState.currentPosition.toString().padStart(2, '0')}<small>/09</small>`;
    document.getElementById('hud-lap').innerHTML = `${gameState.currentLap.toString().padStart(2, '0')}<small>/03</small>`;
    document.getElementById('hud-time').textContent = gameState.formatTime(gameState.currentLapTime);
    document.getElementById('hud-best').textContent = gameState.formatTime(gameState.bestLapTime);

    // 5. District title
    if (currentDistrict) {
      document.getElementById('hud-district-name').textContent = `NEO-SHINJUKU RIFT // ${currentDistrict.name}`;
      document.getElementById('hud-district-sub').textContent = currentDistrict.subtitle;
    }

    // 6. Checkpoint objective
    const nextCp = this.game.circuit.checkpoints.find(cp => cp.u > physics.currentU) || this.game.circuit.checkpoints[0];
    if (nextCp) {
      document.getElementById('hud-objective-text').textContent = `REACH ${nextCp.name}`;
    }

    // 7. Standings
    if (rivalsSystem) {
      const standings = rivalsSystem.getStandings(physics.totalDistance, 'YOU');
      const container = document.getElementById('hud-standings');
      if (container) {
        container.innerHTML = standings.slice(0, 5).map((r, i) => `
          <div class="standing-item ${r.isPlayer ? 'player' : ''}">
            <span>0${i + 1}</span>
            <strong style="color:${r.color}">${r.name}</strong>
          </div>
        `).join('');
      }
    }

    // 8. Countdown
    const countdownOverlay = document.getElementById('hud-countdown-overlay');
    if (gameState.status === 'COUNTDOWN') {
      countdownOverlay.style.display = 'flex';
      const c = gameState.countdownInt;
      document.getElementById('cl-1').classList.toggle('active', c <= 3 && c > 0);
      document.getElementById('cl-2').classList.toggle('active', c <= 2 && c > 0);
      document.getElementById('cl-3').classList.toggle('active', c <= 1 && c > 0);
      document.getElementById('cl-go').classList.toggle('active', c <= 0);

      const bigText = document.getElementById('hud-countdown-text');
      if (bigText) bigText.textContent = c > 0 ? c.toString() : 'GO!';
    } else {
      countdownOverlay.style.display = 'none';
    }

    // 9. Finish Modal
    const finishModal = document.getElementById('hud-finish-modal');
    if (gameState.status === 'FINISHED' && finishModal.style.display === 'none') {
      finishModal.style.display = 'flex';
      document.getElementById('finish-pos').textContent = gameState.currentPosition === 1 ? '1ST PLACE // VICTORY' : `${gameState.currentPosition}TH PLACE`;
      document.getElementById('f-total-time').textContent = gameState.formatTime(gameState.raceTime);
      document.getElementById('f-best-lap').textContent = gameState.formatTime(gameState.bestLapTime);
      document.getElementById('f-top-speed').textContent = `${speedKmh} KM/H`;
      document.getElementById('f-drift-score').textContent = `${physics.totalDriftScore.toLocaleString()} PTS`;
    }
  }
}
