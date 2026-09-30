import { DISTRICTS } from '../track/CityCircuit.js';

// ============================================================================
// FULL WORLD MAP: NEO-SHINJUKU // NETWORK MAP (Key: 'M')
// Interactive district browser, race events, garage locator, and fast travel
// ============================================================================

export class FullWorldMap {
  constructor(gameManager) {
    this.game = gameManager;
    this.isOpen = false;
    this.selectedDistrict = DISTRICTS[0];

    this.container = document.createElement('div');
    this.container.id = 'full-world-map-modal';
    this.container.className = 'full-world-map-overlay';
    this.container.style.display = 'none';

    this.buildMapDOM();
    document.body.appendChild(this.container);

    // Keyboard listener for 'M'
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.toggle();
      }
    });
  }

  buildMapDOM() {
    this.container.innerHTML = `
      <div class="network-map-window">
        <div class="network-map-header">
          <div class="map-brand">
            <span class="pulse-dot"></span>
            <h2>NEO-SHINJUKU // SATELLITE NETWORK MAP</h2>
            <small>AETHER-9 ORBITAL GRID // 2089.11</small>
          </div>
          <button class="map-close-btn" id="map-close-btn">✕ [ESC]</button>
        </div>

        <div class="network-map-body">
          <!-- Left: District Roster & Event Selectors -->
          <div class="map-sidebar">
            <h3>[ MUNICIPAL DISTRICTS ]</h3>
            <div class="district-list" id="map-district-list">
              ${DISTRICTS.map((d, i) => `
                <div class="district-card ${i === 0 ? 'active' : ''}" data-id="${d.id}" style="border-left-color: ${d.color};">
                  <strong>${d.name}</strong>
                  <small>${d.subtitle}</small>
                </div>
              `).join('')}
            </div>

            <div class="map-event-box">
              <h4>[ ACTIVE EVENT ]</h4>
              <p><strong>AETHER SKYWAY GRAND PRIX</strong></p>
              <p>Rivals: 8 Class-A Contenders</p>
              <p>Weather: Acid Rain // 2089 Night</p>
              <button class="map-action-btn primary" id="btn-fast-travel">DEPLOY VEHICLE</button>
            </div>
          </div>

          <!-- Right: Interactive Canvas Map Visualization -->
          <div class="map-canvas-container">
            <canvas id="world-map-canvas" width="800" height="600"></canvas>
            <div class="map-legend">
              <span><i style="background:#00F0FF"></i> YOU</span>
              <span><i style="background:#FF1A1A"></i> RIVALS</span>
              <span><i style="background:#FFB800"></i> CHECKPOINTS</span>
              <span><i style="background:#7928CA"></i> GARAGE</span>
              <span><i style="background:#FF007F"></i> BOSS: THE VECTOR</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('map-close-btn').addEventListener('click', () => this.close());
    document.getElementById('btn-fast-travel').addEventListener('click', () => {
      this.close();
      this.game.physics.resetToStart();
    });

    // District selection
    const cards = this.container.querySelectorAll('.district-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedDistrict = DISTRICTS.find(d => d.id === card.dataset.id) || DISTRICTS[0];
        this.drawWorldMapCanvas();
      });
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.container.style.display = 'flex';
    this.drawWorldMapCanvas();
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }

  drawWorldMapCanvas() {
    const canvas = document.getElementById('world-map-canvas');
    if (!canvas || !this.game.circuit) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w * 0.5;
    const cy = h * 0.5;

    ctx.fillStyle = '#060912';
    ctx.fillRect(0, 0, w, h);

    // City grid background
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw District Sectors
    ctx.font = 'bold 11px monospace';
    DISTRICTS.forEach((d, idx) => {
      const angle = (idx / DISTRICTS.length) * Math.PI * 2;
      const rx = cx + Math.cos(angle) * 220;
      const ry = cy + Math.sin(angle) * 180;
      ctx.fillStyle = d.color;
      ctx.fillText(`// ${d.name}`, rx - 40, ry);
    });

    // Draw Complete Circuit Spline
    const mapScale = 0.22;
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 10;
    ctx.beginPath();

    const samples = this.game.circuit.samples;
    for (let i = 0; i <= samples.length; i += 2) {
      const s = samples[i % samples.length];
      const x = cx + s.pos.x * mapScale;
      const y = cy + s.pos.z * mapScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Garage Location
    ctx.fillStyle = '#7928CA';
    ctx.beginPath();
    ctx.arc(cx - 30, cy + 20, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('GARAGE', cx - 25, cy + 35);

    // Draw Boss Event: The Vector
    ctx.fillStyle = '#FF007F';
    ctx.beginPath();
    ctx.arc(cx + 140, cy - 80, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('BOSS: THE VECTOR', cx + 110, cy - 95);

    // Draw Player Position
    const pPos = this.game.physics.pos;
    const px = cx + pPos.x * mapScale;
    const py = cy + pPos.z * mapScale;

    ctx.fillStyle = '#00F0FF';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
