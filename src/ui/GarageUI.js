// ============================================================================
// UNDERGROUND VEHICLE GARAGE & CUSTOMIZATION FACILITY (Key: 'G')
// Body Paint, Neon Underglow, Engine Tuning & Aerodynamic Upgrades
// ============================================================================

export class GarageUI {
  constructor(gameManager) {
    this.game = gameManager;
    this.isOpen = false;

    this.container = document.createElement('div');
    this.container.id = 'garage-modal-container';
    this.container.className = 'garage-modal-overlay';
    this.container.style.display = 'none';

    // Upgrade state
    this.upgrades = {
      topSpeed: 3,
      accel: 2,
      handling: 4,
      braking: 3,
      boost: 2
    };

    this.buildGarageDOM();
    document.body.appendChild(this.container);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'g' || e.key === 'G') {
        this.toggle();
      }
    });
  }

  buildGarageDOM() {
    this.container.innerHTML = `
      <div class="garage-window">
        <div class="garage-header">
          <div class="garage-brand">
            <h2>[ NEO-SHINJUKU // UNDERGROUND HANGAR BAY ]</h2>
            <small>F-8000 NIGHTRIFT // CHASSIS TUNING FACILITY</small>
          </div>
          <button class="garage-close-btn" id="garage-close-btn">✕ [ESC]</button>
        </div>

        <div class="garage-body">
          <!-- Left Column: Customization & Paint Options -->
          <div class="garage-panel">
            <h3>[ VEHICLE LIVERY & PAINT ]</h3>
            <div class="color-picker-group">
              <label>BODY PRIMARY COLOR</label>
              <div class="color-swatches" id="body-swatches">
                <button class="swatch" style="background:#00F0FF" data-color="0x00F0FF" title="Cyan"></button>
                <button class="swatch" style="background:#FF1A1A" data-color="0xFF1A1A" title="Crimson"></button>
                <button class="swatch" style="background:#FFB800" data-color="0xFFB800" title="Gold"></button>
                <button class="swatch" style="background:#7928CA" data-color="0x7928CA" title="Ultraviolet"></button>
                <button class="swatch" style="background:#00FF66" data-color="0x00FF66" title="Acid Lime"></button>
                <button class="swatch" style="background:#F0F4F8" data-color="0xF0F4F8" title="Ghost White"></button>
              </div>

              <label style="margin-top:14px;">NEON UNDERGLOW</label>
              <div class="color-swatches" id="underglow-swatches">
                <button class="swatch" style="background:#00F0FF" data-underglow="0x00F0FF"></button>
                <button class="swatch" style="background:#FF007F" data-underglow="0xFF007F"></button>
                <button class="swatch" style="background:#00FF66" data-underglow="0x00FF66"></button>
                <button class="swatch" style="background:#FFB800" data-underglow="0xFFB800"></button>
                <button class="swatch" style="background:#9933FF" data-underglow="0x9933FF"></button>
              </div>
            </div>

            <h3 style="margin-top:20px;">[ AERODYNAMIC BODY KITS ]</h3>
            <div class="kit-options">
              <button class="kit-btn active" data-kit="aero">CIRCUIT AERO CANARDS</button>
              <button class="kit-btn" data-kit="drag">SUPER-HIGHWAY DIFFUSER</button>
              <button class="kit-btn" data-kit="vortex">VORTEX SPLIT WING</button>
            </div>
          </div>

          <!-- Right Column: Performance Upgrades -->
          <div class="garage-panel">
            <h3>[ PERFORMANCE SPECIFICATIONS ]</h3>
            <div class="stat-bar-group">
              <div class="perf-row">
                <span>TOP SPEED (420 KM/H)</span>
                <div class="perf-bar"><div class="fill" style="width:85%"></div></div>
              </div>
              <div class="perf-row">
                <span>ION ACCELERATION</span>
                <div class="perf-bar"><div class="fill" style="width:90%"></div></div>
              </div>
              <div class="perf-row">
                <span>AERO GRIP & DRIFT</span>
                <div class="perf-bar"><div class="fill" style="width:94%"></div></div>
              </div>
              <div class="perf-row">
                <span>ENERGY BRAKES</span>
                <div class="perf-bar"><div class="fill" style="width:88%"></div></div>
              </div>
              <div class="perf-row">
                <span>HYPER-BOOST DURATION</span>
                <div class="perf-bar"><div class="fill" style="width:95%"></div></div>
              </div>
            </div>

            <div class="garage-cta-box">
              <p>Vehicle: <strong>F-8000 // NIGHTRIFT</strong></p>
              <p>Powertrain: <strong>Quad Magnetohydrodynamic Turbines</strong></p>
              <button class="garage-deploy-btn" id="garage-deploy-btn">DEPLOY TO TRACK</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('garage-close-btn').addEventListener('click', () => this.close());
    document.getElementById('garage-deploy-btn').addEventListener('click', () => this.close());

    // Swatches listeners
    this.container.querySelectorAll('#body-swatches .swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = parseInt(btn.dataset.color, 16);
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setCustomColors(hex, null);
        }
      });
    });

    this.container.querySelectorAll('#underglow-swatches .swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = parseInt(btn.dataset.underglow, 16);
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setCustomColors(null, hex);
        }
      });
    });
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.container.style.display = 'flex';
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }
}
