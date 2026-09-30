// ============================================================================
// WIPEOUT: APHELION - THE DESIGNERS REPUBLIC (tDR) UI SYSTEM & OVERLAY
// Y2K cyber-minimalist typography, race telemetry, team selector, leaderboards,
// and Diegetic Spatial Terminal for "Descent Vector" & The Aphelion Accord (2148)
// ============================================================================

import { NARRATIVE_ACTS, LORE_COALITIONS } from '../narrative/DescentVectorNarrative.js';

export class OverlayUI {
  constructor(gameManager) {
    this.game = gameManager;
    this.container = document.getElementById('ui-root');

    this.currentTerminalTab = 'act1';

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <!-- TOP DIEGETIC SYSTEM HEADER -->
      <header class="tdr-header">
        <div class="tdr-brand">
          <svg class="header-svg-radar" viewBox="0 0 32 32" width="24" height="24">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#00F0FF" stroke-width="1.2" opacity="0.4" />
            <circle cx="16" cy="16" r="8" fill="none" stroke="#00F0FF" stroke-width="1" stroke-dasharray="2,2" opacity="0.6" />
            <line x1="16" y1="2" x2="16" y2="30" stroke="#00F0FF" stroke-width="0.8" opacity="0.4" />
            <line x1="2" y1="16" x2="30" y2="16" stroke="#00F0FF" stroke-width="0.8" opacity="0.4" />
            <circle cx="16" cy="16" r="2.5" fill="#00F0FF" />
            <path d="M 16,16 L 30,16 A 14,14 0 0,0 26,6 Z" fill="#00F0FF" opacity="0.35">
              <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="2.5s" repeatCount="indefinite" />
            </path>
          </svg>
          <span class="brand-title">WIPEOUT // APHELION</span>
          <span class="tag-league">F-8000 LEAGUE</span>
          <span class="tag-year">2148.09</span>
        </div>

        <div class="tdr-circuit-info" id="circuit-info">
          NEO-SHINJUKU RIFT // SECTOR 07
        </div>

        <div class="tdr-controls-toolbar">
          <button class="tdr-btn" id="btn-terminal" title="Descent Vector Spatial Terminal">[ TERMINAL // DESCENT VECTOR ]</button>
          <button class="tdr-btn" id="btn-pipeline" title="Toggle MRT Deferred / Forward (F)">PIPELINE: <span id="pipeline-name">MRT DEFERRED</span></button>
          <button class="tdr-btn" id="btn-camera" title="Cycle Camera (C)">CAM: <span id="cam-name">CHASE</span></button>
          <button class="tdr-btn" id="btn-audio" title="Toggle Sound (M)">AUDIO: <span id="audio-state">ON</span></button>
          <button class="tdr-btn" id="btn-menu" title="Menu / Settings (ESC)">SETTINGS</button>
        </div>
      </header>

      <!-- COUNTDOWN LIGHT TREE -->
      <div class="tdr-countdown" id="countdown-overlay">
        <div class="light-tree">
          <span class="light red" id="light-1"></span>
          <span class="light red" id="light-2"></span>
          <span class="light red" id="light-3"></span>
          <span class="light green" id="light-go"></span>
        </div>
        <div class="countdown-text" id="countdown-text">READY</div>
      </div>

      <!-- RACE TELEMETRY (Subtle Peripheral Diegetic UI) -->
      <div class="tdr-telemetry-layer" id="race-telemetry">
        <!-- TOP LEFT: POSITION & LAP -->
        <div class="hud-box top-left">
          <div class="hud-label">[ F-8000 TELEMETRY ]</div>
          <div class="hud-row">
            <span class="stat-title">POSITION</span>
            <span class="stat-value large" id="hud-pos">01<small>/05</small></span>
          </div>
          <div class="hud-row">
            <span class="stat-title">LAP</span>
            <span class="stat-value" id="hud-lap">01<small>/03</small></span>
          </div>
          <div class="hud-row">
            <span class="stat-title">TIME</span>
            <span class="stat-value mono" id="hud-laptime">00:00.000</span>
          </div>
          <div class="hud-row">
            <span class="stat-title">BEST</span>
            <span class="stat-value mono" id="hud-besttime">--:--.---</span>
          </div>
          <div class="hud-row" style="margin-top: 6px; border-top: 1px dashed rgba(0, 240, 255, 0.25); padding-top: 4px;">
            <span class="stat-title">MRT G-BUFFER</span>
            <span class="stat-value mono" style="font-size: 11px; color: var(--color-cyan);" id="hud-mrt-status">TARGET 0-3 // 144Hz</span>
          </div>
          <div class="hud-row">
            <span class="stat-title">Hi-Z SSR</span>
            <span class="stat-value mono" style="font-size: 11px; color: #00F0FF;" id="hud-hiz-status">GGX VNDF // 5-MIP</span>
          </div>
          <div class="hud-row">
            <span class="stat-title">GPU MESHLETS</span>
            <span class="stat-value mono" style="font-size: 11px; color: #00F0FF;" id="hud-meshlet-status">0% CULLED</span>
          </div>
          <div class="hud-row">
            <span class="stat-title">NEURAL POLICY</span>
            <span class="stat-value mono" style="font-size: 11px; color: #00F0FF;" id="hud-neural-status">WEBNN // 0.3ms</span>
          </div>
          <div class="hud-row" id="hud-slipstream-row" style="display: none;">
            <span class="stat-title" style="color: #00F0FF;">SLIPSTREAM</span>
            <span class="stat-value mono" style="font-size: 11px; color: #00F0FF;" id="hud-slipstream-status">Cd 0.18 // -44% DRAG</span>
          </div>
        </div>

        <!-- TOP RIGHT: AIRBRAKES & THRUST GAUGES -->
        <div class="hud-box top-right">
          <div class="hud-label">[ KINETIC ARTICULATION ]</div>
          <div class="brake-gauge-group">
            <div class="brake-col">
              <span class="col-title">L-BRAKE [Q]</span>
              <div class="gauge-vertical"><div class="fill" id="gauge-lbrake"></div></div>
            </div>
            <div class="brake-col">
              <span class="col-title">THROTTLE</span>
              <div class="gauge-vertical"><div class="fill thrust" id="gauge-thrust"></div></div>
            </div>
            <div class="brake-col">
              <span class="col-title">R-BRAKE [E]</span>
              <div class="gauge-vertical"><div class="fill" id="gauge-rbrake"></div></div>
            </div>
          </div>
          <div class="boost-status" id="boost-status">HYPER-BOOST [SPACE] : READY</div>
        </div>

        <!-- TRI-VECTOR POWER & FRICTION CAPACITOR PANEL -->
        <div class="hud-box top-center-mechanics" id="hud-mechanics">
          <div class="hud-label">[ TRI-VECTOR ENERGY DIVERTER ]</div>
          <div class="power-buttons-row">
            <button class="pwr-btn active" data-pwr="BALANCED" id="pwr-btn-BALANCED"><small>[1]</small> BAL</button>
            <button class="pwr-btn" data-pwr="THRUST" id="pwr-btn-THRUST"><small>[2]</small> THR</button>
            <button class="pwr-btn" data-pwr="FLUX" id="pwr-btn-FLUX"><small>[3]</small> FLX</button>
            <button class="pwr-btn" data-pwr="BARRIER" id="pwr-btn-BARRIER"><small>[4]</small> BAR</button>
          </div>
          <div class="pwr-status-row">
            <span id="pwr-status-text">BALANCED (33/34/33)</span>
          </div>

          <!-- FRICTION CAPACITOR -->
          <div class="hud-label">[ FRICTION CAPACITOR ]</div>
          <div class="hud-progress-bar">
            <div class="hud-progress-fill" id="cap-progress-fill" style="width: 0%;"></div>
          </div>
          <div class="cap-actions-row">
            <span class="cap-tag" id="cap-burnout-tag">[SHIFT] BURNOUT</span>
            <span class="cap-tag" id="cap-emp-tag">[X] RADIAL EMP</span>
            <span class="cap-tag" id="cap-grind-tag" style="display:none; color:#00FF66;">⚡ GRINDING</span>
          </div>
        </div>

        <!-- CENTER BARS: VACUUM RIFT / DANGER NOTIFICATION -->
        <div class="hud-alert-banner" id="hud-alert-banner">
          <span class="alert-icon">⚠</span>
          <span class="alert-text" id="alert-text">ORBITAL VACUUM RIFT // RCS CONTROL ACTIVE</span>
        </div>

        <!-- COBRA AIR-ANCHOR BANNER -->
        <div class="hud-cobra-banner" id="hud-cobra-banner">
          <span class="alert-icon">◄◄</span>
          <span class="alert-text" id="cobra-text">COBRA AIR-ANCHOR // 180° REAR TARGETING // [K / SPACE] RAILGUN</span>
        </div>

        <!-- RE-ANCHOR GATE BANNER -->
        <div class="hud-reanchor-banner" id="hud-reanchor-banner">
          <span class="alert-icon">⚓</span>
          <span class="alert-text" id="reanchor-text">RE-ANCHOR GATE // 12.4° [LOCKED]</span>
        </div>

        <!-- JETTISON ASYMMETRY BANNER -->
        <div class="hud-jettison-banner" id="hud-jettison-banner">
          <span class="alert-icon">⚠</span>
          <span class="alert-text" id="jettison-text">AERO ASYMMETRY DETECTED // [J] JETTISON FAIRINGS (-18% MASS)</span>
        </div>

        <!-- SLIPSTREAM DRAFTING BANNER -->
        <div class="hud-draft-banner" id="hud-draft-banner">
          <span class="alert-icon">⚡</span>
          <span class="alert-text" id="draft-text">SLIPSTREAM LOCKED // Cd 0.18 // +44% EFFICIENCY</span>
        </div>

        <!-- IN-FLIGHT NEURO-LINK RADIO COMMS HUD -->
        <div class="hud-neurolink-comms" id="hud-neurolink" style="display: none;">
          <div class="neurolink-header">
            <span class="freq-tag">FREQ 142.85 MHz // SECURE AES-512</span>
            <span class="status-indicator live">LIVE FEED</span>
          </div>
          <div class="neurolink-body">
            <div class="speaker-badge" id="neurolink-speaker">[ MARCUS KANE // CALIBURN CHIEF ]</div>
            <div class="waveform-anim">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div class="comms-text" id="neurolink-text">Slingshot launch verified. Vector into turn 1!</div>
          </div>
        </div>

        <!-- BOTTOM RIGHT: LEADERBOARD / RIVALS -->
        <div class="hud-box bottom-right">
          <div class="hud-label">[ GRID STANDINGS ]</div>
          <div class="standings-list" id="standings-list">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>

      <!-- DIEGETIC SPATIAL TERMINAL: "DESCENT VECTOR" -->
      <div class="tdr-modal-backdrop" id="terminal-modal" style="display: none;">
        <div class="tdr-modal terminal-dialog">
          <div class="modal-header">
            <h2>[ DIEGETIC SPATIAL TERMINAL // ENCRYPTED TELEMETRY BUS ]</h2>
            <button class="tdr-btn close" id="btn-close-terminal">×</button>
          </div>
          <div class="modal-body terminal-body">
            <!-- Navigation -->
            <div class="terminal-nav">
              <div class="nav-section-title">CAMPAIGN: "DESCENT VECTOR"</div>
              <button class="term-nav-btn active" data-tab="act1">ACT I // NEO-SHINJUKU RIFT</button>
              <button class="term-nav-btn" data-tab="act2">ACT II // TYCHO ELEVATOR</button>
              <button class="term-nav-btn" data-tab="act3">ACT III // APHELION SCHISM</button>

              <div class="nav-section-title" style="margin-top: 15px;">THE APHELION ACCORD (2148)</div>
              <button class="term-nav-btn" data-tab="coalitions">COALITIONS & PMC DOSSIERS</button>
              <button class="term-nav-btn" data-tab="belmondo">BELMONDO ARCHIVES & TIMELINE</button>
            </div>

            <!-- Content Area -->
            <div class="terminal-content" id="terminal-content-area">
              <!-- Dynamically populated via renderTerminalContent -->
            </div>
          </div>
        </div>
      </div>

      <!-- RACE FINISH MODAL -->
      <div class="tdr-modal-backdrop" id="finish-modal" style="display: none;">
        <div class="tdr-modal">
          <div class="modal-header">
            <h2>RACE TERMINATED // OFFICIAL TELEMETRY</h2>
          </div>
          <div class="modal-body">
            <div class="podium-rank" id="finish-rank">PODIUM POSITION: 1ST</div>
            <div class="podium-stats">
              <div class="pod-row"><span>CIRCUIT:</span> <strong id="finish-circuit">NEO-SHINJUKU</strong></div>
              <div class="pod-row"><span>TOTAL TIME:</span> <strong id="finish-total-time">02:14.280</strong></div>
              <div class="pod-row"><span>BEST LAP:</span> <strong id="finish-best-lap">00:43.120</strong></div>
              <div class="pod-row"><span>MAX VELOCITY:</span> <strong id="finish-max-speed">1,482 KM/H</strong></div>
            </div>
            <div class="modal-actions">
              <button class="tdr-btn primary" id="btn-restart">RE-ENGAGE (R)</button>
              <button class="tdr-btn" id="btn-return-menu">RETURN TO HANGAR</button>
            </div>
          </div>
        </div>
      </div>

      <!-- SETTINGS & HANGAR MODAL -->
      <div class="tdr-modal-backdrop" id="menu-modal" style="display: none;">
        <div class="tdr-modal settings-dialog">
          <div class="modal-header">
            <h2>[ F-8000 LEAGUE CONFIGURATION // HANGAR ]</h2>
            <button class="tdr-btn close" id="btn-close-menu">×</button>
          </div>
          <div class="modal-body settings-grid">
            <!-- CIRCUIT SELECTION -->
            <div class="config-col">
              <h3>[ CIRCUIT SELECTOR ]</h3>
              <div class="option-cards" id="circuit-options">
                <button class="opt-card active" data-circuit="neoShinjuku">
                  <strong>NEO-SHINJUKU RIFT</strong>
                  <small>Sector 07 // Class-A // 4.8 km</small>
                </button>
                <button class="opt-card" data-circuit="tycho">
                  <strong>TYCHO SUPERCONDUCTOR</strong>
                  <small>Lunar Basin // Class-EX // 6.2 km</small>
                </button>
                <button class="opt-card" data-circuit="aphelionPrime">
                  <strong>APHELION PRIME</strong>
                  <small>Orbital Spaceport // Class-S // 5.4 km</small>
                </button>
              </div>

              <!-- RACE MODE SELECTION -->
              <h3 style="margin-top: 18px;">[ DISCIPLINE ]</h3>
              <div class="option-cards" id="mode-options">
                <button class="opt-card active" data-mode="GRAND_PRIX">
                  <strong>GRAND PRIX</strong>
                  <small>5-Craft Championship // 3 Laps</small>
                </button>
                <button class="opt-card" data-mode="TIME_TRIAL">
                  <strong>TIME TRIAL</strong>
                  <small>Solo Spline // High-G Ghost</small>
                </button>
                <button class="opt-card" data-mode="ZONE">
                  <strong>ZONE MODE</strong>
                  <small>Perpetual Acceleration // Reactive Audio</small>
                </button>
              </div>
            </div>

            <!-- TEAM SELECTION -->
            <div class="config-col">
              <h3>[ TEAM & CHASSIS HANGAR ]</h3>
              <div class="option-cards" id="team-options">
                <button class="opt-card active" data-team="agSys">
                  <strong>AG-SYSTEMS INTERCEPTOR</strong>
                  <small>Cyan / Neo-Tokyo Aerospace // 1,470 km/h // Accel Specialist</small>
                </button>
                <button class="opt-card" data-team="feisar">
                  <strong>FEISAR FX-450</strong>
                  <small>Electric Cyan & Gold / Federal European // 1,420 km/h // Max Agility</small>
                </button>
                <button class="opt-card" data-team="auricom">
                  <strong>AURICOM VANGUARD</strong>
                  <small>Hazard Amber / Pan-American Union // 1,500 km/h // Defensive Anchor</small>
                </button>
                <button class="opt-card" data-team="qirex">
                  <strong>QIREX-VOSTOK D-92</strong>
                  <small>Hazard Orange / Eurasian Industrial // 1,590 km/h // Brute Battering Ram</small>
                </button>
                <button class="opt-card" data-team="pirHana">
                  <strong>PIR-HANA SCORPIO</strong>
                  <small>Obsidian & Crimson / Privateer Syndicate // 1,650 km/h // Glass Cannon</small>
                </button>
              </div>

              <!-- CONTROLS REFERENCE -->
              <div class="controls-guide">
                <h4>[ FLIGHT CONTROLS ]</h4>
                <ul>
                  <li><kbd>W</kbd> or <kbd>↑</kbd> : Forward Ion Throttle</li>
                  <li><kbd>S</kbd> or <kbd>↓</kbd> : Reverse Repulsor Brake</li>
                  <li><kbd>A</kbd> / <kbd>D</kbd> or <kbd>←</kbd> / <kbd>→</kbd> : Steering (18° Inward Roll)</li>
                  <li><kbd>Q</kbd> : Left Vector Airbrake (Drift Pivot)</li>
                  <li><kbd>E</kbd> : Right Vector Airbrake (Drift Pivot)</li>
                  <li><kbd>SPACE</kbd> : Hyper-Boost Capacitor</li>
                </ul>
                <h4 style="margin-top:10px">[ CORE MECHANICS ]</h4>
                <ul>
                  <li><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> : Tri-Vector Power (Balanced / Thrust / Flux / Barrier)</li>
                  <li><kbd>Q</kbd>+<kbd>E</kbd>+<kbd>S</kbd> at &gt;120km/h : COBRA AIR-ANCHOR (1.8s rear targeting)</li>
                  <li><kbd>K</kbd> or <kbd>SPACE</kbd> during Cobra : Fire Railgun</li>
                  <li><kbd>SHIFT</kbd> : Capacitor BURNOUT Discharge (&gt;35% charge)</li>
                  <li><kbd>X</kbd> : Capacitor Radial EMP (&gt;60% charge)</li>
                  <li><kbd>J</kbd> : Emergency Fairing Jettison (-18% mass)</li>
                  <li><kbd>C</kbd> or <kbd>V</kbd> : Cycle Camera Mode</li>
                  <li><kbd>F</kbd> : Toggle MRT Deferred / Forward Pipeline</li>
                  <li><kbd>M</kbd> : Mute Audio</li>
                  <li><kbd>R</kbd> : Reset to Start Line</li>
                  <li><em>Gamepad: LT/RT = Airbrakes, D-Pad = Power, A = Thrust, B = Boost, LB/RB = Capacitor</em></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="tdr-btn primary" id="btn-apply-settings">LAUNCH RACE</button>
          </div>
        </div>
      </div>

      <!-- TOUCH CONTROLS FOR MOBILE / TABLET -->
      <div class="touch-controls" id="touch-controls">
        <div class="touch-left">
          <button class="touch-btn" id="touch-left-brake">L-BRAKE</button>
          <div class="touch-steer-row">
            <button class="touch-btn" id="touch-steer-l">◄</button>
            <button class="touch-btn" id="touch-steer-r">►</button>
          </div>
        </div>
        <div class="touch-right">
          <button class="touch-btn" id="touch-right-brake">R-BRAKE</button>
          <div class="touch-action-row">
            <button class="touch-btn boost" id="touch-boost">BOOST</button>
            <button class="touch-btn thrust" id="touch-thrust">THRUST</button>
          </div>
        </div>
      </div>
    `;

    this.renderTerminalContent('act1');
  }

  bindEvents() {
    // Pipeline toggle button
    document.getElementById('btn-pipeline').addEventListener('click', () => {
      const mode = this.game.toggleRenderMode();
      document.getElementById('pipeline-name').textContent = mode;
      document.getElementById('hud-mrt-status').textContent = mode === 'MRT DEFERRED' ? 'TARGET 0-3 // 144Hz' : 'FORWARD // BLOOM';
      const hizEl = document.getElementById('hud-hiz-status');
      if (hizEl) hizEl.textContent = mode === 'MRT DEFERRED' ? 'GGX VNDF // 5-MIP' : 'OFFLINE';
    });

    // Camera button
    document.getElementById('btn-camera').addEventListener('click', () => {
      const mode = this.game.cycleCamera();
      document.getElementById('cam-name').textContent = mode;
    });

    // Audio button
    document.getElementById('btn-audio').addEventListener('click', () => {
      const muted = this.game.toggleAudio();
      document.getElementById('audio-state').textContent = muted ? 'MUTED' : 'ON';
    });

    // Terminal Modal toggle
    const termModal = document.getElementById('terminal-modal');
    document.getElementById('btn-terminal').addEventListener('click', () => {
      termModal.style.display = 'flex';
      this.renderTerminalContent(this.currentTerminalTab);
    });
    document.getElementById('btn-close-terminal').addEventListener('click', () => {
      termModal.style.display = 'none';
    });

    // Terminal Tab navigation
    document.querySelectorAll('.term-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.term-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTerminalTab = btn.dataset.tab;
        this.renderTerminalContent(this.currentTerminalTab);
      });
    });

    // Settings menu open/close
    const menuModal = document.getElementById('menu-modal');
    document.getElementById('btn-menu').addEventListener('click', () => {
      menuModal.style.display = 'flex';
    });
    document.getElementById('btn-close-menu').addEventListener('click', () => {
      menuModal.style.display = 'none';
    });

    // Circuit selector options
    document.querySelectorAll('#circuit-options .opt-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#circuit-options .opt-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedCircuit = btn.dataset.circuit;
      });
    });

    // Team selector options
    document.querySelectorAll('#team-options .opt-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#team-options .opt-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedTeam = btn.dataset.team;
      });
    });

    // Mode selector options
    document.querySelectorAll('#mode-options .opt-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#mode-options .opt-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedMode = btn.dataset.mode;
      });
    });

    // Apply settings
    document.getElementById('btn-apply-settings').addEventListener('click', () => {
      menuModal.style.display = 'none';
      if (this.selectedCircuit || this.selectedTeam || this.selectedMode) {
        this.game.reconfigure(this.selectedCircuit, this.selectedTeam, this.selectedMode);
      }
    });

    // Restart button on finish modal
    document.getElementById('btn-restart').addEventListener('click', () => {
      document.getElementById('finish-modal').style.display = 'none';
      this.game.restartRace();
    });

    document.getElementById('btn-return-menu').addEventListener('click', () => {
      document.getElementById('finish-modal').style.display = 'none';
      menuModal.style.display = 'flex';
    });

    // Tri-Vector Power buttons
    document.querySelectorAll('.pwr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pwr = btn.dataset.pwr;
        if (this.game && this.game.physics) {
          this.game.physics.setPowerProfile(pwr);
        }
      });
    });

    // Touch controls listeners
    this.setupTouchControls();
  }

  renderTerminalContent(tabId) {
    const container = document.getElementById('terminal-content-area');
    if (!container) return;

    if (tabId.startsWith('act')) {
      const actIdx = parseInt(tabId.replace('act', ''), 10) - 1;
      const act = NARRATIVE_ACTS[actIdx] || NARRATIVE_ACTS[0];

      let interceptsHtml = '';
      act.intercepts.forEach(int => {
        interceptsHtml += `
          <div class="intercept-card">
            <div class="intercept-header">
              <span class="intercept-tag">[ INTERCEPT // ${int.id} ]</span>
              <span class="stat-value mono" style="color: var(--color-vermilion); font-size: 11px;">${int.classification}</span>
            </div>
            <div class="intercept-meta">
              <div><strong>SENDER:</strong> ${int.sender}</div>
              <div><strong>RECEIVER:</strong> ${int.receiver}</div>
              <div><strong>TIMESTAMP:</strong> ${int.timestamp}</div>
              <div><strong>SUBJECT:</strong> ${int.subject}</div>
            </div>
            <div class="intercept-body">
              ${int.body}
            </div>
          </div>
        `;
      });

      container.innerHTML = `
        <div style="border-bottom: 1px solid rgba(0,240,255,0.3); padding-bottom: 8px;">
          <h3 style="color: var(--color-cyan); margin-bottom: 4px;">${act.title}</h3>
          <div style="font-size: 12px; color: var(--color-amber);">${act.sector}</div>
        </div>
        <div style="background: rgba(0, 240, 255, 0.06); padding: 12px; border-left: 3px solid var(--color-cyan); font-size: 13px; line-height: 1.5;">
          <strong>BRIEFING:</strong> ${act.briefing}
        </div>
        <h4 style="margin-top: 10px; color: var(--color-cyan); font-size: 12px; letter-spacing: 1px;">[ DECRYPTED TELEMETRY INTERCEPTS & COMMS ]</h4>
        ${interceptsHtml}
      `;
    } else if (tabId === 'coalitions') {
      let foundingHtml = '';
      LORE_COALITIONS.FOUNDING.forEach(c => {
        foundingHtml += `
          <div class="intercept-card" style="border-left: 3px solid #00F0FF;">
            <div class="intercept-header">
              <strong style="color: #00F0FF; font-size: 14px;">${c.name}</strong>
              <span style="color: #8C99A8; font-size: 11px;">${c.origin}</span>
            </div>
            <div style="font-size: 11px; color: var(--color-amber); margin-bottom: 6px;">[ DOCTRINE: ${c.doctrine} ]</div>
            <p style="font-size: 12px; color: #D2D9E2; line-height: 1.45; margin-bottom: 8px;">${c.description}</p>
            <div style="font-size: 11px; color: #8C99A8;"><strong>SPECS:</strong> ${c.chassisSpecs}</div>
          </div>
        `;
      });

      let syndicateHtml = '';
      LORE_COALITIONS.SYNDICATE.forEach(c => {
        syndicateHtml += `
          <div class="intercept-card" style="border-left: 3px solid #FF2A13;">
            <div class="intercept-header">
              <strong style="color: #FF2A13; font-size: 14px;">${c.name}</strong>
              <span style="color: #8C99A8; font-size: 11px;">${c.origin}</span>
            </div>
            <div style="font-size: 11px; color: var(--color-amber); margin-bottom: 6px;">[ DOCTRINE: ${c.doctrine} ]</div>
            <p style="font-size: 12px; color: #D2D9E2; line-height: 1.45; margin-bottom: 8px;">${c.description}</p>
            <div style="font-size: 11px; color: #8C99A8;"><strong>SPECS:</strong> ${c.chassisSpecs}</div>
          </div>
        `;
      });

      let privateerHtml = '';
      LORE_COALITIONS.PRIVATEER.forEach(c => {
        privateerHtml += `
          <div class="intercept-card" style="border-left: 3px solid #FF4800;">
            <div class="intercept-header">
              <strong style="color: #FF4800; font-size: 14px;">${c.name}</strong>
              <span style="color: #8C99A8; font-size: 11px;">${c.origin}</span>
            </div>
            <div style="font-size: 11px; color: var(--color-amber); margin-bottom: 6px;">[ DOCTRINE: ${c.doctrine} ]</div>
            <p style="font-size: 12px; color: #D2D9E2; line-height: 1.45; margin-bottom: 8px;">${c.description}</p>
            <div style="font-size: 11px; color: #8C99A8;"><strong>SPECS:</strong> ${c.chassisSpecs}</div>
          </div>
        `;
      });

      container.innerHTML = `
        <h3 style="color: var(--color-cyan); margin-bottom: 4px;">THE APHELION ACCORD (2148) // ROSTER INTELLIGENCE</h3>
        <h4 style="color: #00F0FF; font-size: 12px; margin-top: 10px;">[ THE FOUNDING COALITIONS // PUBLIC GOVERNANCE ]</h4>
        ${foundingHtml}
        <h4 style="color: #FF2A13; font-size: 12px; margin-top: 14px;">[ THE SYNDICATE OUTLIERS // PMC & WAR-TECH ]</h4>
        ${syndicateHtml}
        <h4 style="color: #FF4800; font-size: 12px; margin-top: 14px;">[ THE PRIVATEERS // SQUADRON CALIBURN ]</h4>
        ${privateerHtml}
      `;
    } else if (tabId === 'belmondo') {
      container.innerHTML = `
        <h3 style="color: var(--color-cyan); margin-bottom: 4px;">DR. PIERRE BELMONDO & THE EVOLUTION OF FLIGHT</h3>
        <div style="font-size: 12px; color: #8C99A8; margin-bottom: 12px;">HISTORICAL RETROSPECTIVE: 2035 - 2148</div>

        <div class="intercept-card">
          <h4 style="color: var(--color-amber); margin-bottom: 8px;">2035: The Belmondo Breakthrough</h4>
          <p style="font-size: 13px; line-height: 1.5; color: #D2D9E2;">
            In 2035, French physicist Dr. Pierre Belmondo proved the existence of differential anti-gravity through high-frequency magnetohydrodynamic (MHD) resonance. His original intention was pure: to eliminate the friction of planetary gravity wells and liberate civilian transit.
          </p>
        </div>

        <div class="intercept-card">
          <h4 style="color: var(--color-cyan); margin-bottom: 8px;">2052 - 2097: F3600 & F9000 Leagues</h4>
          <p style="font-size: 13px; line-height: 1.5; color: #D2D9E2;">
            What began as an aerodynamic sporting showcase mutated into an hyper-militarized commercial arms race. Weaponized plasma cannons, automated seeker missiles, and lethal track hazards brought the catastrophic collapse of the corrupt F9000 league.
          </p>
        </div>

        <div class="intercept-card">
          <h4 style="color: var(--color-vermilion); margin-bottom: 8px;">2148: The Aphelion Schism</h4>
          <p style="font-size: 13px; line-height: 1.5; color: #D2D9E2;">
            Five decades after the FX400 corporate restructuring, the F-8000 Apex League suspended tracks across orbital tethers and Lagrange points. But beneath the televised spectacle, sovereign defense syndicates have mapped high-speed race lines as calibration vectors for atmospheric planetary defense grids.
          </p>
        </div>

        <div class="lore-timeline-box">
          <h4>EXPLORE THE FOUNDATIONAL ARCHIVE:</h4>
          <p style="font-size: 12px; line-height: 1.4; color: #EAEFF5;">
            For an exhaustive retrospective documenting Pierre Belmondo's breakthrough, team genealogies, and league evolution across five decades, examine the complete historical documentary:
          </p>
          <p style="margin-top: 8px;">
            <a href="https://www.youtube.com/watch?v=cJssL744efE" target="_blank" rel="noopener noreferrer">
              ► WATCH: WipEout Complete Lore Timeline Documentary
            </a>
          </p>
        </div>
      `;
    }
  }

  setupTouchControls() {
    const bindTouch = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
      el.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('mouseup', (e) => { e.preventDefault(); onUp(); });
    };

    bindTouch('touch-thrust', () => this.game.setTouchInput('throttle', 1), () => this.game.setTouchInput('throttle', 0));
    bindTouch('touch-steer-l', () => this.game.setTouchInput('steer', -1), () => this.game.setTouchInput('steer', 0));
    bindTouch('touch-steer-r', () => this.game.setTouchInput('steer', 1), () => this.game.setTouchInput('steer', 0));
    bindTouch('touch-left-brake', () => this.game.setTouchInput('leftBrake', 1), () => this.game.setTouchInput('leftBrake', 0));
    bindTouch('touch-right-brake', () => this.game.setTouchInput('rightBrake', 1), () => this.game.setTouchInput('rightBrake', 0));
    bindTouch('touch-boost', () => this.game.setTouchInput('boost', true), () => this.game.setTouchInput('boost', false));
  }

  update(gameState, physicsEngine, cameraMode, aiRacers, activeComms = null) {
    // 1. Countdown update
    const countdownEl = document.getElementById('countdown-overlay');
    if (gameState.status === 'COUNTDOWN') {
      countdownEl.style.display = 'flex';
      const count = gameState.countdownInt;
      const lightGo = document.getElementById('light-go');
      const light1 = document.getElementById('light-1');
      const light2 = document.getElementById('light-2');
      const light3 = document.getElementById('light-3');
      const cText = document.getElementById('countdown-text');

      light1.classList.toggle('active', count <= 3 && count > 0);
      light2.classList.toggle('active', count <= 2 && count > 0);
      light3.classList.toggle('active', count <= 1 && count > 0);
      lightGo.classList.toggle('active', count <= 0);

      cText.textContent = count > 0 ? count : 'GO!';
    } else {
      countdownEl.style.display = 'none';
    }

    // 2. HUD Telemetry stats
    document.getElementById('hud-pos').innerHTML = `${gameState.currentPosition.toString().padStart(2, '0')}<small>/05</small>`;
    document.getElementById('hud-lap').innerHTML = `${gameState.currentLap.toString().padStart(2, '0')}<small>/0${gameState.maxLaps}</small>`;
    document.getElementById('hud-laptime').textContent = gameState.formatTime(gameState.currentLapTime);
    document.getElementById('hud-besttime').textContent = gameState.formatTime(gameState.bestLapTime);

    // 3. Kinetic gauges
    document.getElementById('gauge-lbrake').style.height = `${physicsEngine.leftAirbrake * 100}%`;
    document.getElementById('gauge-rbrake').style.height = `${physicsEngine.rightAirbrake * 100}%`;
    document.getElementById('gauge-thrust').style.height = `${physicsEngine.throttle * 100}%`;

    const boostStatusEl = document.getElementById('boost-status');
    if (physicsEngine.isBoosting) {
      boostStatusEl.textContent = 'HYPER-BOOST : ENGAGED';
      boostStatusEl.style.color = '#00F0FF';
    } else {
      boostStatusEl.textContent = 'HYPER-BOOST [SPACE] : READY';
      boostStatusEl.style.color = '#FFB800';
    }

    // 3b. CORE 1: Tri-Vector Energy Diverter Buttons & Status
    if (physicsEngine.powerProfile) {
      document.querySelectorAll('.pwr-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pwr === physicsEngine.powerProfile);
      });
      const pwrText = document.getElementById('pwr-status-text');
      if (pwrText && physicsEngine.power) {
        const t = Math.round(physicsEngine.power.thrust * 100);
        const f = Math.round(physicsEngine.power.flux * 100);
        const b = Math.round(physicsEngine.power.barrier * 100);
        pwrText.textContent = `${physicsEngine.powerProfile} (${t}/${f}/${b})`;
      }
    }

    // 3c. CORE 3: Friction Capacitor Progress & Discharge Readiness
    const capVal = physicsEngine.frictionCapacitor || 0;
    const capFill = document.getElementById('cap-progress-fill');
    if (capFill) {
      capFill.style.width = `${Math.min(100, Math.round(capVal * 100))}%`;
      capFill.classList.toggle('emp-ready', capVal >= 0.60);
    }
    const capBurnout = document.getElementById('cap-burnout-tag');
    if (capBurnout) capBurnout.classList.toggle('ready', capVal >= 0.35);
    const capEmp = document.getElementById('cap-emp-tag');
    if (capEmp) capEmp.classList.toggle('ready', capVal >= 0.60);
    const capGrind = document.getElementById('cap-grind-tag');
    if (capGrind) capGrind.style.display = physicsEngine.isInductionGrinding ? 'inline' : 'none';

    // 3d. CORE 4: Cobra Air-Anchor Banner
    const cobraBanner = document.getElementById('hud-cobra-banner');
    if (cobraBanner) {
      cobraBanner.classList.toggle('visible', !!physicsEngine.cobraActive);
    }

    // 3e. CORE 2: Re-Anchor Gate Check Banner
    const reanchorBanner = document.getElementById('hud-reanchor-banner');
    const reanchorText = document.getElementById('reanchor-text');
    if (reanchorBanner && reanchorText) {
      if (physicsEngine.reAnchorTimer > 0) {
        const isLocked = physicsEngine.reAnchorStatus === 'LOCKED';
        reanchorBanner.className = `hud-reanchor-banner ${isLocked ? 'locked' : 'misaligned'}`;
        reanchorText.textContent = isLocked
          ? `RE-ANCHOR GATE: ${physicsEngine.reAnchorAlignment.toFixed(1)}° [LOCKED // SMOOTH CATCH]`
          : `RE-ANCHOR GATE: ${physicsEngine.reAnchorAlignment.toFixed(1)}° [MISALIGNED // 40% MOMENTUM LOSS]`;
      } else {
        reanchorBanner.className = 'hud-reanchor-banner';
      }
    }

    // 3f. CORE 5: Kinetic Component Jettison Banner
    const jettisonBanner = document.getElementById('hud-jettison-banner');
    const jettisonText = document.getElementById('jettison-text');
    if (jettisonBanner && jettisonText) {
      if (physicsEngine.jettisonAlertTimer > 0) {
        jettisonBanner.classList.add('visible');
        jettisonText.textContent = 'FAIRINGS JETTISONED // MASS: 984 KG // Cd: 0.27 // +22% ACCEL';
      } else if (!physicsEngine.jettisoned && Math.abs(physicsEngine.asymmetricPull) > 0.04) {
        jettisonBanner.classList.add('visible');
        const pullSide = physicsEngine.asymmetricPull > 0 ? 'RIGHT' : 'LEFT';
        jettisonText.textContent = `AERO DAMAGE (PULL ${pullSide}) // [J] EMERGENCY JETTISON (-18% MASS)`;
      } else {
        jettisonBanner.classList.remove('visible');
      }
    }

    // 4. In-Flight Neuro-Link Comms HUD
    const commsWidget = document.getElementById('hud-neurolink');
    if (activeComms) {
      commsWidget.style.display = 'block';
      const speakerEl = document.getElementById('neurolink-speaker');
      const textEl = document.getElementById('neurolink-text');
      if (speakerEl) speakerEl.textContent = `[ ${activeComms.speaker} // NEURO-LINK ]`;
      if (textEl) textEl.textContent = activeComms.text;
    } else {
      commsWidget.style.display = 'none';
    }

    // 5. Vacuum Rift Alert Banner
    const alertBanner = document.getElementById('hud-alert-banner');
    if (physicsEngine.inVacuumRift) {
      alertBanner.classList.add('visible');
    } else {
      alertBanner.classList.remove('visible');
    }

    // 5b. Slipstream Drafting Banner & Telemetry
    const draftBanner = document.getElementById('hud-draft-banner');
    const slipstreamRow = document.getElementById('hud-slipstream-row');
    if (this.game.draftInfo && this.game.draftInfo.isDrafting) {
      if (draftBanner) draftBanner.classList.add('visible');
      if (slipstreamRow) slipstreamRow.style.display = 'flex';
      const leaderName = this.game.draftInfo.leader ? this.game.draftInfo.leader.team.name.toUpperCase() : 'LEADER';
      const draftText = document.getElementById('draft-text');
      if (draftText) {
        draftText.textContent = `SLIPSTREAM LOCKED // ${leaderName} WAKE // Cd 0.18 // +44% EFFICIENCY`;
      }
    } else {
      if (draftBanner) draftBanner.classList.remove('visible');
      if (slipstreamRow) slipstreamRow.style.display = 'none';
    }

    // 5c. Meshlet Culling Telemetry
    if (this.game.meshletCulling) {
      const mStats = this.game.meshletCulling.getStats();
      const meshletEl = document.getElementById('hud-meshlet-status');
      if (meshletEl) {
        meshletEl.textContent = `${mStats.cullPercentage}% CULLED (${mStats.visible}/${mStats.total})`;
      }
    }

    // 5d. Neural Policy Telemetry
    if (this.game.neuralSystem) {
      const neuralEl = document.getElementById('hud-neural-status');
      if (neuralEl) {
        neuralEl.textContent = `${this.game.neuralSystem.backendName} // ${this.game.neuralSystem.latencyMs.toFixed(2)}ms`;
      }
    }

    // 6. Standings List
    const standingsContainer = document.getElementById('standings-list');
    if (standingsContainer && aiRacers) {
      const allRacers = [
        { name: 'YOU', team: this.game.currentTeam.name, dist: gameState.playerTotalDistance, isPlayer: true },
        ...aiRacers.map(ai => ({ name: ai.team.name.split(' ')[0], team: ai.team.name, dist: ai.totalDistance, isPlayer: false }))
      ];
      allRacers.sort((a, b) => b.dist - a.dist);

      let html = '';
      allRacers.forEach((racer, idx) => {
        const activeClass = racer.isPlayer ? 'player' : '';
        html += `<div class="standing-row ${activeClass}">
          <span>0${idx + 1}</span>
          <strong>${racer.name}</strong>
        </div>`;
      });
      standingsContainer.innerHTML = html;
    }

    // 7. Finish Modal
    const finishModal = document.getElementById('finish-modal');
    if (gameState.status === 'FINISHED' && finishModal.style.display === 'none') {
      finishModal.style.display = 'flex';
      const rankSuffix = gameState.currentPosition === 1 ? '1ST' : gameState.currentPosition === 2 ? '2ND' : gameState.currentPosition === 3 ? '3RD' : `${gameState.currentPosition}TH`;
      document.getElementById('finish-rank').textContent = `PODIUM POSITION: ${rankSuffix}`;
      document.getElementById('finish-circuit').textContent = this.game.currentTrackData.name;
      document.getElementById('finish-total-time').textContent = gameState.formatTime(gameState.raceTime);
      document.getElementById('finish-best-lap').textContent = gameState.formatTime(gameState.bestLapTime);
      document.getElementById('finish-max-speed').textContent = `${Math.floor(physicsEngine.getSpeedKmh())} KM/H`;
    }
  }
}
