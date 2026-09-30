import { VEHICLE_CATALOG } from '../craft/FuturisticVehicle.js';
import { RIVAL_ROSTER } from '../ai/RivalRacersSystem.js';

// ============================================================================
// CINEMATIC UI: 2089 ARCADE RACING PRESENTATION & UX FLOW
// 3D Loading Screen, Developer Credit "DEVELOPED BY RANJEET KUMAR",
// 3D Interactive Lobby, Car Selection Carousel, Live Customization, Match Prep,
// Race Intro, Clean In-Race HUD with Action/Combo Popups, Pause, Results,
// 3D Podium Overlay & Winning Lobby Progression
// ============================================================================

export class CinematicUI {
  constructor(gameManager) {
    this.game = gameManager;

    this.container = document.createElement('div');
    this.container.id = 'cinematic-ui-root';
    document.body.appendChild(this.container);

    // Tip database
    this.proTips = [
      'DRIFT THROUGH SHARP CORNERS TO RECHARGE HYPER-BOOST RAPIDLY.',
      'TIME YOUR HYPER-BOOST IN THE PULSE WINDOW TO UNLOCK OVERDRIVE.',
      'HIT STUNT RAMPS AT HIGH VELOCITY TO PERFORM AERIAL BARREL ROLLS.',
      'FOLLOW OPPONENTS CLOSELY TO ACTIVATE LOW-DRAG SLIPSTREAM.',
      'THREAD CLOSE TO CIVILIAN TRAFFIC TO EARN NEAR MISS BOOST BONUSES.',
      'PRESS [E] FOR KINETIC ENERGY BRAKE BEFORE TIGHT HAIRPIN APEXES.'
    ];

    // Current state
    this.currentScreen = 'LOADING'; // LOADING, LOBBY, CAR_SELECT, GARAGE, MATCH_PREP, RACE_INTRO, RACING, PAUSED, RESULTS, PODIUM, WINNING_LOBBY
    this.selectedCarIndex = 0;
    this.tipIndex = 0;

    this.buildAllDOM();
    this.setupEventListeners();
  }

  buildAllDOM() {
    this.container.innerHTML = `
      <!-- 1. DEVELOPER CREDIT -->
      <div id="screen-dev-credit" class="ui-screen dev-credit-overlay">
        <div class="dev-credit-box">
          <span class="dev-subtitle">A GAME BY</span>
          <h1 class="dev-title">RANJEET KUMAR</h1>
          <div class="dev-scanline"></div>
        </div>
      </div>

      <!-- 2. 3D LOADING SCREEN OVERLAY -->
      <div id="screen-loading" class="ui-screen active">
        <div class="loading-top-brand">
          <h1 class="game-logo">NEO-SHINJUKU<br><span>RIFT</span></h1>
          <div class="game-subtitle">AETHER-9 // HYPER CIRCUIT</div>
        </div>

        <div class="loading-bottom-bar">
          <div class="loading-status-row">
            <span class="loading-pulse-dot"></span>
            <span id="loading-status-text">INITIALIZING AETHER-9 // QUANTUM ENGINES</span>
            <span id="loading-pct-text">0%</span>
          </div>
          <div class="loading-progress-track">
            <div id="loading-progress-fill" class="loading-progress-fill" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <!-- 3. MAIN 3D LOBBY (Underground Racing HQ) -->
      <div id="screen-lobby" class="ui-screen" style="display: none;">
        <!-- Top Left: Player Profile -->
        <div class="lobby-profile-card">
          <div class="profile-avatar">RK</div>
          <div class="profile-meta">
            <div class="profile-name-row">
              <strong id="lobby-player-name">RANJEET</strong>
              <span class="profile-lvl-badge" id="lobby-lvl-badge">LVL 07</span>
            </div>
            <div class="profile-xp-bar-track">
              <div class="profile-xp-fill" id="lobby-xp-fill" style="width: 65%"></div>
            </div>
            <small class="xp-ratio" id="lobby-xp-ratio">8,450 / 12,000 XP</small>
          </div>
        </div>

        <!-- Top Right: Currencies -->
        <div class="lobby-currencies">
          <div class="currency-pill credits">
            <span class="c-symbol">Ȼ</span>
            <strong id="lobby-credits">45,200</strong>
          </div>
          <div class="currency-pill tokens">
            <span class="c-symbol">◆</span>
            <strong id="lobby-tokens">350</strong>
          </div>
          <div class="currency-pill energy">
            <span class="c-symbol">⚡</span>
            <strong>10/10</strong>
          </div>
        </div>

        <!-- Left Vertical Navigation Menu -->
        <div class="lobby-menu-list">
          <button class="lobby-nav-btn active" data-nav="play"><span class="nav-num">01</span> RACE</button>
          <button class="lobby-nav-btn" data-nav="cars"><span class="nav-num">02</span> CARS</button>
          <button class="lobby-nav-btn" data-nav="garage"><span class="nav-num">03</span> GARAGE</button>
          <button class="lobby-nav-btn" data-nav="events"><span class="nav-num">04</span> EVENTS</button>
          <button class="lobby-nav-btn" data-nav="map"><span class="nav-num">05</span> MAP</button>
          <button class="lobby-nav-btn" data-nav="leaderboard"><span class="nav-num">06</span> RANKS</button>
          <button class="lobby-nav-btn" data-nav="settings"><span class="nav-num">07</span> SETTINGS</button>
        </div>

        <!-- Camera Angle Presets -->
        <div class="lobby-camera-presets">
          <span class="cam-preset-label">VIEW:</span>
          <button class="cam-btn" data-cam="FRONT">FRONT</button>
          <button class="cam-btn" data-cam="SIDE">SIDE</button>
          <button class="cam-btn" data-cam="REAR">REAR</button>
          <button class="cam-btn" data-cam="TOP">TOP</button>
          <button class="cam-btn" data-cam="LOW ANGLE">LOW</button>
        </div>

        <!-- Drag prompt helper -->
        <div class="lobby-drag-hint">◄ DRAG MOUSE / TOUCH TO ROTATE VEHICLE // SCROLL TO ZOOM ►</div>

        <!-- Giant Bottom CTA -->
        <div class="lobby-play-cta">
          <button id="btn-lobby-play" class="btn-primary-glow">
            <span class="cta-subtitle">SECTOR 07 // AETHER SKYWAY</span>
            <strong class="cta-title">PLAY RACE ►</strong>
          </button>
        </div>
      </div>

      <!-- 4. 3D CAR SELECTION CAROUSEL -->
      <div id="screen-car-select" class="ui-screen" style="display: none;">
        <div class="car-select-header">
          <button class="btn-back" id="btn-car-back">◄ BACK TO HQ</button>
          <h2>SELECT VEHICLE // 2089 FLEET</h2>
          <span class="car-count-badge" id="car-select-counter">01 / 06</span>
        </div>

        <!-- Carousel arrows -->
        <button class="carousel-arrow left" id="btn-car-prev">◄</button>
        <button class="carousel-arrow right" id="btn-car-next">►</button>

        <!-- Bottom Vehicle Specs & Stats Card -->
        <div class="car-spec-sheet">
          <div class="car-identity">
            <span class="car-class" id="car-spec-class">BALANCED PROTOTYPE</span>
            <h3 class="car-name" id="car-spec-name">F-8000 // NIGHTRIFT</h3>
            <p class="car-desc" id="car-spec-desc">Flagship 2089 anti-gravity machine with quad articulated nacelles.</p>
          </div>

          <div class="car-stats-grid">
            <div class="stat-bar-item">
              <div class="sb-label"><span>TOP SPEED</span><strong id="sb-spd">420 KM/H</strong></div>
              <div class="sb-track"><div class="sb-fill" id="sbf-spd" style="width: 88%"></div></div>
            </div>
            <div class="stat-bar-item">
              <div class="sb-label"><span>ACCELERATION</span><strong id="sb-acc">90%</strong></div>
              <div class="sb-track"><div class="sb-fill" id="sbf-acc" style="width: 90%"></div></div>
            </div>
            <div class="stat-bar-item">
              <div class="sb-label"><span>HANDLING</span><strong id="sb-hnd">92%</strong></div>
              <div class="sb-track"><div class="sb-fill" id="sbf-hnd" style="width: 92%"></div></div>
            </div>
            <div class="stat-bar-item">
              <div class="sb-label"><span>BRAKING</span><strong id="sb-brk">88%</strong></div>
              <div class="sb-track"><div class="sb-fill" id="sbf-brk" style="width: 88%"></div></div>
            </div>
            <div class="stat-bar-item">
              <div class="sb-label"><span>HYPER-BOOST</span><strong id="sb-bst">90%</strong></div>
              <div class="sb-track"><div class="sb-fill" id="sbf-bst" style="width: 90%"></div></div>
            </div>
          </div>

          <div class="car-select-actions">
            <button class="btn-action-primary" id="btn-car-choose">SELECT VEHICLE</button>
            <button class="btn-action-secondary" id="btn-car-customize">CUSTOMIZE</button>
          </div>
        </div>
      </div>

      <!-- 5. 3D LIVE VEHICLE CUSTOMIZATION -->
      <div id="screen-garage" class="ui-screen" style="display: none;">
        <div class="garage-top-bar">
          <button class="btn-back" id="btn-garage-back">◄ BACK TO HQ</button>
          <h2>HANGAR BAY // VEHICLE CUSTOMIZATION</h2>
          <button class="btn-action-primary small" id="btn-garage-done">APPLY & RETURN</button>
        </div>

        <div class="garage-customizer-panel">
          <h3>BODY PAINT LIVERY</h3>
          <div class="swatch-row" id="custom-body-swatches">
            <button class="color-swatch active" style="background:#00F0FF" data-color="0x00F0FF"></button>
            <button class="color-swatch" style="background:#FF1A1A" data-color="0xFF1A1A"></button>
            <button class="color-swatch" style="background:#FFB800" data-color="0xFFB800"></button>
            <button class="color-swatch" style="background:#7928CA" data-color="0x7928CA"></button>
            <button class="color-swatch" style="background:#00FF66" data-color="0x00FF66"></button>
            <button class="color-swatch" style="background:#F0F4F8" data-color="0xF0F4F8"></button>
            <button class="color-swatch" style="background:#0B0D12" data-color="0x0B0D12"></button>
            <button class="color-swatch" style="background:#FF007F" data-color="0xFF007F"></button>
          </div>

          <h3>NEON UNDERGLOW</h3>
          <div class="swatch-row" id="custom-underglow-swatches">
            <button class="color-swatch active" style="background:#00F0FF" data-underglow="0x00F0FF"></button>
            <button class="color-swatch" style="background:#FF0033" data-underglow="0xFF0033"></button>
            <button class="color-swatch" style="background:#00FF88" data-underglow="0x00FF88"></button>
            <button class="color-swatch" style="background:#FFAA00" data-underglow="0xFFAA00"></button>
            <button class="color-swatch" style="background:#9933FF" data-underglow="0x9933FF"></button>
            <button class="color-swatch" style="background:#FF007F" data-underglow="0xFF007F"></button>
          </div>

          <h3>AERO BODY KITS</h3>
          <div class="kit-options-row">
            <button class="kit-chip active" data-kit="aero">CIRCUIT AERO</button>
            <button class="kit-chip" data-kit="drag">HIGHWAY DIFFUSER</button>
            <button class="kit-chip" data-kit="vortex">VORTEX SPLIT</button>
          </div>

          <h3>SPOILER / WING</h3>
          <div class="kit-options-row">
            <button class="spoiler-chip active" data-spoiler="stock">STOCK FLAPS</button>
            <button class="spoiler-chip" data-spoiler="wing">CARBON DUAL WING</button>
          </div>
        </div>
      </div>

      <!-- 6. MATCH PREPARATION & TIPS MODAL -->
      <div id="screen-match-prep" class="ui-screen" style="display: none;">
        <div class="match-prep-window">
          <div class="match-found-banner">
            <span class="pulse-marker"></span>
            <h2>RACE FOUND // COMPETITIVE GRID</h2>
          </div>

          <div class="match-track-card">
            <div class="mt-detail"><strong>TRACK:</strong> NEO-SHINJUKU RIFT</div>
            <div class="mt-detail"><strong>SECTOR:</strong> 07 // AETHER SKYWAY</div>
            <div class="mt-detail"><strong>WEATHER:</strong> NIGHT // ACID RAIN</div>
            <div class="mt-detail"><strong>DISTANCE:</strong> 3 LAPS // 5.4 KM</div>
            <div class="mt-detail"><strong>OPPONENTS:</strong> 7 CLASS-A AI RACERS</div>
          </div>

          <div class="match-racer-lineup">
            <div class="match-racer you">01 RANJEET (YOU)</div>
            <div class="match-racer">02 KANE</div>
            <div class="match-racer">03 MIRA</div>
            <div class="match-racer">04 ZERO</div>
            <div class="match-racer">05 VOLT</div>
            <div class="match-racer">06 REX</div>
            <div class="match-racer">07 AYLA</div>
            <div class="match-racer">08 NOVA</div>
          </div>

          <div class="match-tip-box">
            <span class="tip-label">PRO RACING TIP:</span>
            <p id="match-tip-text">DRIFT THROUGH SHARP CORNERS TO BUILD BOOST.</p>
          </div>

          <div class="match-loading-bar-row">
            <span id="match-loading-msg">ENTERING GRID...</span>
            <div class="match-progress-track">
              <div id="match-progress-fill" class="match-progress-fill" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. RACE INTRO FLY-THROUGH OVERLAY -->
      <div id="screen-race-intro" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="intro-top-banner">
          <h2>NEO-SHINJUKU RIFT</h2>
          <small>GRID INSPECTION SEQUENCE</small>
        </div>

        <div class="intro-bot-card" id="intro-bot-card">
          <span class="ibc-label" id="ibc-pos">RACER 01 / 08</span>
          <h3 id="ibc-name">RANJEET</h3>
          <p id="ibc-vehicle">F-8000 // NIGHTRIFT</p>
          <div class="ibc-style">RACING STYLE: <strong id="ibc-style">PLAYER</strong></div>
        </div>

        <button class="btn-skip-intro" id="btn-skip-intro">SKIP INTRO [ESC] ►►</button>
      </div>

      <!-- 8. IN-RACE HUD LAYER -->
      <div id="screen-racing-hud" class="ui-screen" style="display: none; pointer-events: none;">
        <!-- TOP-LEFT: POSITION -->
        <div class="rh-corner top-left">
          <div class="rh-label">POS</div>
          <strong class="rh-val" id="rh-pos">01<small>/08</small></strong>
        </div>

        <!-- TOP-CENTER: LAP -->
        <div class="rh-corner top-center">
          <div class="rh-label">LAP</div>
          <strong class="rh-val" id="rh-lap">01<small>/03</small></strong>
          <div class="rh-lap-time" id="rh-lap-time">00:00.000</div>
        </div>

        <!-- TOP-RIGHT: SPEEDOMETER & PAUSE -->
        <div class="rh-corner top-right">
          <div class="rh-speed-wrap">
            <span class="rh-speed-num" id="rh-speed">000</span>
            <span class="rh-speed-unit">KM/H</span>
          </div>
          <button class="btn-pause-ingame" id="btn-pause-ingame" style="pointer-events: auto;">⏸ [ESC]</button>
        </div>

        <!-- RIGHT SIDE: HYPER-BOOST METER -->
        <div class="rh-boost-container">
          <div class="rh-boost-header">
            <span id="rh-boost-tier-label">HYPER BOOST</span>
            <strong id="rh-boost-pct">100%</strong>
          </div>
          <div class="rh-boost-track">
            <div class="rh-boost-fill" id="rh-boost-fill" style="height: 100%"></div>
            <div class="rh-boost-sweet-spot"></div>
          </div>
          <span class="rh-boost-key">[SPACE]</span>
        </div>

        <!-- BOTTOM-LEFT: MINIMAP RADAR CONTAINER -->
        <div class="rh-minimap-container">
          <div class="rh-minimap-header">[ AETHER-9 // RADAR ]</div>
          <canvas id="hud-minimap-canvas" width="180" height="180"></canvas>
        </div>

        <!-- BOTTOM-CENTER: STUNT / COMBO / ACTION BANNER -->
        <div class="rh-action-banner" id="rh-action-banner" style="display: none;">
          <div class="action-tag" id="rh-action-tag">+PERFECT LANDING</div>
          <div class="action-pts" id="rh-action-pts">+500 PTS</div>
          <div class="action-combo" id="rh-action-combo">x2 COMBO</div>
        </div>

        <!-- BOTTOM-RIGHT: DESKTOP CONTROLS GUIDE -->
        <div class="rh-controls-guide">
          <span>[W/A/S/D] DRIVE</span>
          <span>[SHIFT] DRIFT</span>
          <span>[SPACE] BOOST</span>
          <span>[E] BRAKE</span>
        </div>

        <!-- MOBILE TOUCH CONTROLS (Displayed only on touch devices) -->
        <div class="rh-mobile-controls" id="rh-mobile-controls" style="pointer-events: auto;">
          <div class="mobile-steer-cluster">
            <button class="m-touch-btn" id="m-btn-left">◄</button>
            <button class="m-touch-btn" id="m-btn-right">►</button>
          </div>
          <div class="mobile-action-cluster">
            <button class="m-touch-btn drift" id="m-btn-drift">DRIFT</button>
            <button class="m-touch-btn brake" id="m-btn-brake">BRAKE</button>
            <button class="m-touch-btn boost" id="m-btn-boost">BOOST</button>
          </div>
        </div>
      </div>

      <!-- 9. IN-GAME PAUSE MODAL -->
      <div id="screen-pause" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="pause-window">
          <h2>RACE PAUSED</h2>
          <div class="pause-menu">
            <button class="btn-pause-opt" id="btn-pause-resume">RESUME</button>
            <button class="btn-pause-opt" id="btn-pause-restart">RESTART RACE</button>
            <button class="btn-pause-opt" id="btn-pause-quit">QUIT TO HQ</button>
          </div>
        </div>
      </div>

      <!-- 10. RACE RESULTS SCREEN -->
      <div id="screen-results" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="results-window">
          <div class="results-header">
            <span class="res-sub">NEO-SHINJUKU RIFT // SECTOR 07</span>
            <h2>RACE COMPLETE</h2>
          </div>

          <div class="results-pos-hero" id="res-pos-hero">
            <span class="pos-big" id="res-pos-num">01</span>
            <strong class="pos-word" id="res-pos-word">1ST PLACE // VICTORY</strong>
          </div>

          <div class="results-stats-table">
            <div class="stat-row"><span>RACE TIME:</span><strong id="res-total-time">02:41.822</strong></div>
            <div class="stat-row"><span>BEST LAP:</span><strong id="res-best-lap">00:52.401</strong></div>
            <div class="stat-row"><span>TOP SPEED:</span><strong id="res-top-speed">421 KM/H</strong></div>
            <div class="stat-row"><span>AERIAL STUNTS:</span><strong id="res-stunts">7</strong></div>
            <div class="stat-row"><span>DRIFT DISTANCE:</span><strong id="res-drift">1,240 M</strong></div>
            <div class="stat-row"><span>NEAR MISSES:</span><strong id="res-near-miss">12</strong></div>
            <div class="stat-row highlight"><span>TOTAL SCORE:</span><strong id="res-score">24,850 PTS</strong></div>
          </div>

          <div class="results-actions">
            <button class="btn-action-primary" id="btn-results-podium">VIEW PODIUM ►</button>
            <button class="btn-action-secondary" id="btn-results-continue">CONTINUE</button>
          </div>
        </div>
      </div>

      <!-- 11. 3D PODIUM CELEBRATION OVERLAY -->
      <div id="screen-podium" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="podium-top-banner">
          <h2>VICTORY PODIUM PRESENTATION</h2>
          <small>AETHER-9 CHAMPIONSHIP</small>
        </div>

        <div class="podium-names-row">
          <div class="p-card silver">
            <span class="p-rank">2ND PLACE</span>
            <strong id="podium-2nd-name">KANE</strong>
            <small id="podium-2nd-team">SYNDICATE RAM</small>
          </div>
          <div class="p-card gold">
            <span class="p-rank">★ 1ST PLACE ★</span>
            <strong id="podium-1st-name">RANJEET</strong>
            <small id="podium-1st-team">F-8000 NIGHTRIFT</small>
          </div>
          <div class="p-card bronze">
            <span class="p-rank">3RD PLACE</span>
            <strong id="podium-3rd-name">MIRA</strong>
            <small id="podium-3rd-team">TOKYO KINETICS</small>
          </div>
        </div>

        <div class="podium-bottom-actions">
          <button class="btn-action-primary" id="btn-podium-continue">CONTINUE TO HQ ►</button>
        </div>
      </div>

      <!-- 12. WINNING LOBBY & REWARD UNLOCK -->
      <div id="screen-win-lobby" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="win-lobby-window">
          <div class="win-champion-header">
            <span class="win-icon">🏆</span>
            <h2>CHAMPION // SECTOR 07 COMPLETE</h2>
            <div class="win-streak-badge" id="win-streak-badge">WIN STREAK: 03 WINS</div>
          </div>

          <!-- XP Progression Bar -->
          <div class="win-xp-section">
            <div class="wxp-header">
              <span>XP EARNED: <b class="cyan" id="wxp-earned">+1,250 XP</b></span>
              <strong id="wxp-level">LEVEL 07</strong>
            </div>
            <div class="wxp-track">
              <div class="wxp-fill" id="wxp-fill" style="width: 75%"></div>
            </div>
            <div class="level-up-toast" id="level-up-toast" style="display:none;">★ LEVEL UP! LEVEL 08 UNLOCKED ★</div>
          </div>

          <!-- Rewards Cards Grid -->
          <div class="win-rewards-grid">
            <div class="reward-card">
              <span class="rc-type">CURRENCY</span>
              <strong class="rc-val">+2,500 Ȼ</strong>
              <small>CREDITS</small>
            </div>
            <div class="reward-card">
              <span class="rc-type">TOKENS</span>
              <strong class="rc-val">+50 ◆</strong>
              <small>PREMIUM TOKENS</small>
            </div>
            <div class="reward-card highlight">
              <span class="rc-type">VEHICLE PART</span>
              <strong class="rc-val">ION VORTEX CORE</strong>
              <small>RARE UPGRADE</small>
            </div>
          </div>

          <div class="win-actions">
            <button class="btn-action-primary" id="btn-win-next">NEXT RACE ►</button>
            <button class="btn-action-secondary" id="btn-win-garage">GARAGE</button>
            <button class="btn-action-secondary" id="btn-win-lobby">HQ LOBBY</button>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Lobby menu buttons
    this.container.querySelectorAll('.lobby-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.lobby-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const nav = btn.dataset.nav;
        if (this.game.sound) this.game.sound.playMenuClick();

        if (nav === 'play') this.game.startMatchmaking();
        if (nav === 'cars') this.showScreen('CAR_SELECT');
        if (nav === 'garage') this.showScreen('GARAGE');
        if (nav === 'map') {
          if (this.game.worldMap) this.game.worldMap.toggle();
        }
      });
    });

    // Lobby Play CTA
    document.getElementById('btn-lobby-play').addEventListener('click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.startMatchmaking();
    });

    // Camera preset buttons
    this.container.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.cam;
        if (this.game.garageLobby) {
          this.game.garageLobby.setCameraAnglePreset(preset);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Car select carousel
    document.getElementById('btn-car-prev').addEventListener('click', () => {
      this.selectedCarIndex = (this.selectedCarIndex - 1 + VEHICLE_CATALOG.length) % VEHICLE_CATALOG.length;
      this.updateCarSelectDetails();
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    document.getElementById('btn-car-next').addEventListener('click', () => {
      this.selectedCarIndex = (this.selectedCarIndex + 1) % VEHICLE_CATALOG.length;
      this.updateCarSelectDetails();
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    document.getElementById('btn-car-choose').addEventListener('click', () => {
      const chosenSpec = VEHICLE_CATALOG[this.selectedCarIndex];
      this.game.setPlayerVehicle(chosenSpec.id);
      this.showScreen('LOBBY');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    document.getElementById('btn-car-customize').addEventListener('click', () => {
      this.showScreen('GARAGE');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    document.getElementById('btn-car-back').addEventListener('click', () => {
      this.showScreen('LOBBY');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    // Garage back & done
    document.getElementById('btn-garage-back').addEventListener('click', () => {
      this.showScreen('LOBBY');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    document.getElementById('btn-garage-done').addEventListener('click', () => {
      this.showScreen('LOBBY');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    // Garage swatches
    this.container.querySelectorAll('#custom-body-swatches .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('#custom-body-swatches .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const colorHex = parseInt(btn.dataset.color, 16);
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setCustomLivery(colorHex, null, null, null, null);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    this.container.querySelectorAll('#custom-underglow-swatches .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('#custom-underglow-swatches .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const underglowHex = parseInt(btn.dataset.underglow, 16);
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setCustomLivery(null, underglowHex, null, null, null);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    this.container.querySelectorAll('.kit-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.kit-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.game.playerVehicle) {
          this.game.playerVehicle.updateAeroKit(btn.dataset.kit);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    this.container.querySelectorAll('.spoiler-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.spoiler-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.game.playerVehicle) {
          this.game.playerVehicle.updateSpoiler(btn.dataset.spoiler);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Skip race intro
    document.getElementById('btn-skip-intro').addEventListener('click', () => {
      this.game.skipRaceIntro();
    });

    // Pause in-game
    document.getElementById('btn-pause-ingame').addEventListener('click', () => {
      this.game.togglePause();
    });

    document.getElementById('btn-pause-resume').addEventListener('click', () => {
      this.game.togglePause();
    });

    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      this.game.togglePause();
      this.game.restartRace();
    });

    document.getElementById('btn-pause-quit').addEventListener('click', () => {
      this.game.togglePause();
      this.showScreen('LOBBY');
      this.game.returnToLobby();
    });

    // Results modal buttons
    document.getElementById('btn-results-podium').addEventListener('click', () => {
      this.game.showPodiumSequence();
    });

    document.getElementById('btn-results-continue').addEventListener('click', () => {
      this.game.showWinningLobby();
    });

    // Podium continue
    document.getElementById('btn-podium-continue').addEventListener('click', () => {
      this.game.showWinningLobby();
    });

    // Winning lobby buttons
    document.getElementById('btn-win-next').addEventListener('click', () => {
      this.game.startMatchmaking();
    });

    document.getElementById('btn-win-garage').addEventListener('click', () => {
      this.showScreen('GARAGE');
    });

    document.getElementById('btn-win-lobby').addEventListener('click', () => {
      this.showScreen('LOBBY');
      this.game.returnToLobby();
    });

    // Mobile touch buttons
    this.setupMobileTouchControls();
  }

  setupMobileTouchControls() {
    const bindTouch = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); }, { passive: false });
      el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); }, { passive: false });
      el.addEventListener('mousedown', () => onDown());
      el.addEventListener('mouseup', () => onUp());
    };

    bindTouch('m-btn-left', () => this.game.setTouch('steer', -1.0), () => this.game.setTouch('steer', 0));
    bindTouch('m-btn-right', () => this.game.setTouch('steer', 1.0), () => this.game.setTouch('steer', 0));
    bindTouch('m-btn-brake', () => this.game.setTouch('brake', 1.0), () => this.game.setTouch('brake', 0));
    bindTouch('m-btn-drift', () => this.game.setTouch('drift', true), () => this.game.setTouch('drift', false));
    bindTouch('m-btn-boost', () => this.game.setTouch('boost', true), () => this.game.setTouch('boost', false));
  }

  showScreen(screenName) {
    this.currentScreen = screenName;
    const screens = [
      'screen-dev-credit',
      'screen-loading',
      'screen-lobby',
      'screen-car-select',
      'screen-garage',
      'screen-match-prep',
      'screen-race-intro',
      'screen-racing-hud',
      'screen-pause',
      'screen-results',
      'screen-podium',
      'screen-win-lobby'
    ];

    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const targetMap = {
      'LOADING': 'screen-loading',
      'LOBBY': 'screen-lobby',
      'CAR_SELECT': 'screen-car-select',
      'GARAGE': 'screen-garage',
      'MATCH_PREP': 'screen-match-prep',
      'RACE_INTRO': 'screen-race-intro',
      'RACING': 'screen-racing-hud',
      'PAUSED': 'screen-pause',
      'RESULTS': 'screen-results',
      'PODIUM': 'screen-podium',
      'WINNING_LOBBY': 'screen-win-lobby'
    };

    const targetId = targetMap[screenName];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) el.style.display = 'flex';
    }

    if (screenName === 'CAR_SELECT') {
      this.updateCarSelectDetails();
    }
  }

  showDeveloperCredit(callback) {
    const el = document.getElementById('screen-dev-credit');
    if (!el) {
      if (callback) callback();
      return;
    }
    el.style.display = 'flex';
    el.classList.add('fade-in');

    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => {
        el.style.display = 'none';
        if (callback) callback();
      }, 800);
    }, 2400);
  }

  updateLoadingProgress(pct, statusText) {
    const fill = document.getElementById('loading-progress-fill');
    const pctEl = document.getElementById('loading-pct-text');
    const statusEl = document.getElementById('loading-status-text');

    if (fill) fill.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;
    if (statusEl && statusText) statusEl.textContent = statusText;
  }

  updateCarSelectDetails() {
    const spec = VEHICLE_CATALOG[this.selectedCarIndex];
    if (!spec) return;

    document.getElementById('car-select-counter').textContent = `0${this.selectedCarIndex + 1} / 0${VEHICLE_CATALOG.length}`;
    document.getElementById('car-spec-name').textContent = spec.name;
    document.getElementById('car-spec-class').textContent = spec.classType;
    document.getElementById('car-spec-desc').textContent = spec.description;

    document.getElementById('sb-spd').textContent = `${spec.maxSpeedKmh} KM/H`;
    document.getElementById('sbf-spd').style.width = `${spec.stats.topSpeed}%`;

    document.getElementById('sb-acc').textContent = `${spec.stats.accel}%`;
    document.getElementById('sbf-acc').style.width = `${spec.stats.accel}%`;

    document.getElementById('sb-hnd').textContent = `${spec.stats.handling}%`;
    document.getElementById('sbf-hnd').style.width = `${spec.stats.handling}%`;

    document.getElementById('sb-brk').textContent = `${spec.stats.braking}%`;
    document.getElementById('sbf-brk').style.width = `${spec.stats.braking}%`;

    document.getElementById('sb-bst').textContent = `${spec.stats.boost}%`;
    document.getElementById('sbf-bst').style.width = `${spec.stats.boost}%`;

    // Preview vehicle in 3D
    if (this.game) {
      this.game.setPlayerVehicle(spec.id, true);
    }
  }

  updateMatchPrep(progressPct) {
    const fill = document.getElementById('match-progress-fill');
    if (fill) fill.style.width = `${progressPct}%`;

    const tipEl = document.getElementById('match-tip-text');
    if (tipEl && Math.random() < 0.05) {
      this.tipIndex = (this.tipIndex + 1) % this.proTips.length;
      tipEl.textContent = this.proTips[this.tipIndex];
    }
  }

  updateRaceIntroCard(racerIndex, totalRacers = 8) {
    const card = document.getElementById('intro-bot-card');
    if (!card) return;

    if (racerIndex === 0) {
      document.getElementById('ibc-pos').textContent = `RACER 01 / 0${totalRacers}`;
      document.getElementById('ibc-name').textContent = 'RANJEET';
      document.getElementById('ibc-vehicle').textContent = this.game.playerVehicle.spec.name;
      document.getElementById('ibc-style').textContent = 'PLAYER CONTROLLER';
    } else {
      const rival = RIVAL_ROSTER[racerIndex - 1];
      if (rival) {
        document.getElementById('ibc-pos').textContent = `RACER 0${racerIndex + 1} / 0${totalRacers}`;
        document.getElementById('ibc-name').textContent = rival.name;
        document.getElementById('ibc-vehicle').textContent = rival.vehicleName;
        document.getElementById('ibc-style').textContent = rival.style;
      }
    }
  }

  showActionPopup(name, points, combo = 1) {
    const banner = document.getElementById('rh-action-banner');
    if (!banner) return;

    document.getElementById('rh-action-tag').textContent = `+${name}`;
    document.getElementById('rh-action-pts').textContent = `+${points} PTS`;
    document.getElementById('rh-action-combo').textContent = combo > 1 ? `x${combo} COMBO` : '';

    banner.style.display = 'flex';
    banner.classList.remove('pulse-banner');
    void banner.offsetWidth; // Force reflow
    banner.classList.add('pulse-banner');

    clearTimeout(this.actionTimeout);
    this.actionTimeout = setTimeout(() => {
      banner.style.display = 'none';
    }, 1800);
  }

  updateHUD(physics, gameState) {
    if (!physics || !gameState) return;

    const speed = Math.floor(physics.getSpeedKmh());
    const spdEl = document.getElementById('rh-speed');
    if (spdEl) spdEl.textContent = speed.toString().padStart(3, '0');

    document.getElementById('rh-pos').innerHTML = `${gameState.currentPosition.toString().padStart(2, '0')}<small>/08</small>`;
    document.getElementById('rh-lap').innerHTML = `${gameState.currentLap.toString().padStart(2, '0')}<small>/03</small>`;
    document.getElementById('rh-lap-time').textContent = gameState.formatTime(gameState.currentLapTime);

    // Boost meter & tier
    const boostPct = Math.round(physics.boostCapacity * 100);
    const boostFill = document.getElementById('rh-boost-fill');
    const boostLabel = document.getElementById('rh-boost-pct');
    const tierLabel = document.getElementById('rh-boost-tier-label');

    if (boostFill) boostFill.style.height = `${boostPct}%`;
    if (boostLabel) boostLabel.textContent = `${boostPct}%`;
    if (tierLabel) tierLabel.textContent = physics.boostTier === 'OVERDRIVE' ? 'OVERDRIVE BOOST' : 'HYPER BOOST';
  }

  showResults(physics, gameState) {
    this.showScreen('RESULTS');

    const pos = gameState.currentPosition;
    document.getElementById('res-pos-num').textContent = pos.toString().padStart(2, '0');
    document.getElementById('res-pos-word').textContent = pos === 1 ? '1ST PLACE // VICTORY' : `${pos}TH PLACE // COMPLETE`;

    document.getElementById('res-total-time').textContent = gameState.formatTime(gameState.raceTime);
    document.getElementById('res-best-lap').textContent = gameState.formatTime(gameState.bestLapTime);
    document.getElementById('res-top-speed').textContent = `${Math.floor(physics.maxSpeedKmh)} KM/H`;
    document.getElementById('res-stunts').textContent = physics.totalStunts.toString();
    document.getElementById('res-drift').textContent = `${Math.floor(physics.totalDriftDistance)} M`;
    document.getElementById('res-near-miss').textContent = physics.totalNearMisses.toString();
    document.getElementById('res-score').textContent = `${physics.totalScore.toLocaleString()} PTS`;
  }

  setupPodiumOverlay(standings) {
    if (!standings || standings.length < 3) return;
    document.getElementById('podium-1st-name').textContent = standings[0].name;
    document.getElementById('podium-1st-team').textContent = standings[0].team;

    document.getElementById('podium-2nd-name').textContent = standings[1].name;
    document.getElementById('podium-2nd-team').textContent = standings[1].team;

    document.getElementById('podium-3rd-name').textContent = standings[2].name;
    document.getElementById('podium-3rd-team').textContent = standings[2].team;
  }

  showWinningLobby(streak = 3, level = 7, xpGained = 1250) {
    this.showScreen('WINNING_LOBBY');
    document.getElementById('win-streak-badge').textContent = `WIN STREAK: 0${streak} WINS`;
    document.getElementById('wxp-earned').textContent = `+${xpGained} XP`;
    document.getElementById('wxp-level').textContent = `LEVEL 0${level}`;

    // Animate XP fill
    const fill = document.getElementById('wxp-fill');
    if (fill) {
      fill.style.width = '30%';
      setTimeout(() => {
        fill.style.width = '85%';
      }, 300);
    }
  }
}
