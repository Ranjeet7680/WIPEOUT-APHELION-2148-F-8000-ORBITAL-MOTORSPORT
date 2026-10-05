# WIPEOUT: APHELION 2148 // 12-SLIDE PITCH & TECHNICAL DECK
## TEAM: rajranjeet7680 // PROJECT LEADER: RANJEET KUMAR

---

### SLIDE 1: TITLE SLIDE // APHELION 2148
- **Project**: WIPEOUT: APHELION 2148 // F-8000 ORBITAL MOTORSPORT
- **Engineering Team**: `rajranjeet7680`
- **Project Leader & Architect**: **Ranjeet Kumar**
- **Core Technology**: Three.js, WebGL2/WebGPU, 120Hz Physics Engine, Web Audio API, Vercel Serverless Edge
- **Deployment**: [https://optimistic-carson-pink.vercel.app](https://optimistic-carson-pink.vercel.app)
- **Status**: Gold Master Production Release (235/235 Tests Passing)
- **Visual Asset**: 
  ![Aphelion Header](../public/header.svg)

---

### SLIDE 2: EXECUTIVE VISION & ARCHITECTURAL PILLARS
- **High-Octane Futuristic Racing**: Blending the beloved high-speed intensity of anti-gravity arcade classics with modern browser and desktop performance.
- **Instant Browser Accessibility**: Zero heavy engine runtime overhead (loads in under 1.5 seconds worldwide without multi-gigabyte downloads).
- **Desktop 120Hz/144Hz Unlocked**: Native hardware acceleration launcher (`LaunchGame-PC.bat`) with discrete GPU priority and unlocked high refresh rate support.
- **3D Japan Skyline Showroom Lobby**: Full 360° pedestal vehicle inspection with unobstructed views and dynamic atmospheric lighting.
- **Visual Asset**:
  ![3D Japan Skyline Showroom Lobby](../docs/assets/screenshots/screenshot_garage_lobby_tokyo.png)

---

### SLIDE 3: END-TO-END SMOOTH DRIVING PHYSICS
- **Continuous $C^1$ Hermite Splines**: Complete elimination of polygonal segment shaking through smooth Frenet-Serret curve interpolation.
- **Zero Lateral Slide at Standstill**: Hyperbolic velocity envelope ($\mu_{\text{lateral}} = 0$ at $v = 0\,\text{km/h}$) ensures the vehicle stays locked on the grid while wheels turn realistically.
- **4-Corner Damped Harmonic Suspension**: Independent corner springs calculate acceleration squat ($+12\,\text{mm}$ rear), braking dive ($+15\,\text{mm}$ front), and centrifugal body roll.
- **Glancing Barrier Wall-Riding**: Contact scrubs velocity at an even $35\,\text{km/h/s}$ without pinball bouncing, rewarding precision racing lines.
- **Visual Asset**:
  ![In-Game High Speed Racing Telemetry](../docs/assets/screenshots/screenshot_race_hud_378kmh.png)

---

### SLIDE 4: THE 9-MACHINE ORIGINAL FLEET
- **Broad Mechanical Variety**: 9 hand-crafted vehicle classes spanning futuristic muscle, exotic hypercars, 80s wedge supercars, JDM tuners, DTM touring, and armored luxury SUVs.
- **Dynamic Aero & Active Kinematics**: Motorized GT wings that deploy under speed, thermochromic brake rotors that glow red under threshold braking, and procedural livery textures.
- **Featured Crafts**:
  - `F-8000 NIGHTRIFT` (Muscle Flagship, 420 km/h)
  - `NXR-01 HYPERCAR` (Exotic Mid-Engine, 382 km/h)
  - `V-720 PHANTOM` (Retro Wedge, 445 km/h)
  - `TERRA-X CYBER BEAST` (Armored Luxury SUV, 390 km/h)
- **Visual Asset**:
  ![3D Vehicle Fleet Selection Matrix](../docs/assets/screenshots/screenshot_car_selection_specs.png)

---

### SLIDE 5: THE 4 MASTER GRAND PRIX CIRCUITS
- **Sector 01 // Neo-Shinjuku Rift**: $5.4\,\text{km}$ through 8 futuristic districts, 140 skyscrapers, 5 transit tunnels, and suspension skybridges.
- **Sector 02 // Coastline Expressway**: $5.4\,\text{km}$ along the Pacific rim with a $12{,}000\,\text{m}$ Gerstner wave ocean shader, suspension towers, and kinetic wind turbines.
- **Sector 03 // Fuji Skyway Pass**: $5.2\,\text{km}$ high-altitude mountain climb spanning $+400\,\text{m}$ elevation with snow particles and a towering $1{,}800\,\text{m}$ Mount Fuji silhouette.
- **Sector 05 // Undercity & Night District**: $5.0\,\text{km}$ through subterranean pipe chasms with dynamic lap-by-lap hazard escalations.
- **Visual Asset**:
  ![Sector 01 Neon Core Metropolis](../docs/assets/screenshots/screenshot_district01_neoncore.png)

---

### SLIDE 6: DEDICATED CAREER CAMPAIGN MODE
- **5 Campaign Chapters**:
  - Chapter 1: *Rookie Proving Grounds* (Sector 01)
  - Chapter 2: *Urban Nightfall* (Sector 05)
  - Chapter 3: *Coastline Apex Rivalry* (Sector 02)
  - Chapter 4: *Fuji Summit Ascent* (Sector 03)
  - Chapter 5: *Aphelion Pinnacle Masters* (Championship Mix)
- **25 Hand-Crafted Stages**: Sprint, Elimination, Time Trial, Drift Challenge, and 1v1 Boss Rival Duels.
- **3-Star Objective Progression**: Podium finishes, clean racing bonuses, and time targets unlock Pilot License Tiers from Class C to Pinnacle.
- **Visual Asset**:
  ![Subterranean Pipe Chasm](../docs/assets/screenshots/screenshot_district05_undercity.png)

---

### SLIDE 7: LIVE OPERATIONS HUB & ROTATING EVENTS
- **Daily Circuit Cups**: 24-hour rotating challenges with fixed vehicle constraints and double Credit multipliers.
- **Weekly Aphelion Showdowns**: Global leaderboard tournaments awarding exclusive Gold-foil livery unlocks.
- **Special Ops Holographic Ghost Challenges**: Asynchronous competition against recorded developer and community ghost telemetry.
- **Energy Pool Mechanic**: 10-point capacity system (2 points per event) with automated cooldown replenishment to sustain long-term player retention.
- **Visual Asset**:
  ![Global World Tour Satellite Map](../docs/assets/screenshots/screenshot_satellite_world_map.png)

---

### SLIDE 8: PROCEDURAL WEB AUDIO SYNTHESIS
- **Zero Audio Latency & Zero Asset Bloat**: Audio is generated purely via the browser Web Audio API without multi-megabyte sound file downloads.
- **Dual-Oscillator RPM Synthesis**: Sawtooth + Square oscillators continuously modulated by real-time engine RPM ($40\,\text{Hz} \to 480\,\text{Hz}$).
- **Dynamic Biquad Filter Modulation**: Resonant lowpass filter sweeping between $600\,\text{Hz}$ and $4{,}500\,\text{Hz}$ under wide-open throttle.
- **Procedural Sound FX**: Procedural white noise tire screeching during high-G drifts, atmospheric wind buffeting, and Doppler pass-bys.
- **Visual Asset**:
  ![System Settings and Audio Controls](../docs/assets/screenshots/screenshot_system_settings_config.png)

---

### SLIDE 9: AI RIVAL RACING & TELEMETRY SYSTEMS
- **Lookahead Frenet Navigation**: AI rivals compute optimal path trajectories along continuous Hermite splines with speed-dependent lookahead horizons ($L = 25\,\text{m} + 0.12v$).
- **Dynamic Overtaking Lines**: Real-time lateral lane offsets dynamically resolve traffic, drafting slipstreams, and defensive blocking maneuvers.
- **Adaptive Elastic Rubberbanding**: Controlled $\pm 8\%$ performance modulation ensures heart-pounding bumper-to-bumper racing without artificial cheating.
- **Visual Asset**:
  ![High Altitude Track Bridge](../docs/assets/screenshots/screenshot_high_altitude_skyway.png)

---

### SLIDE 10: SERVERLESS EDGE CLOUD (VERCEL BACKEND)
- **Edge Microservices Architecture**:
  - `/api/leaderboard`: Global relativistic lap records with sub-10ms query times.
  - `/api/ghost`: 120Hz spline keyframe upload and streaming for transparent ghost vehicles.
  - `/api/profile`: Cloud synchronization of pilot rank, XP, credits, and unlocked vehicle fleets.
  - `/api/status`: Real-time health, serverless region telemetry, and round-trip ping.
- **Visual Asset**:
  ![Aether Port Orbital Corridors](../docs/assets/screenshots/screenshot_district06_aetherport.png)

---

### SLIDE 11: QUALITY ASSURANCE & 235 VERIFICATION TESTS
- **Exhaustive Automated Verification**: **235 automated simulation tests across 21 engineering modules**.
- **100% Pass Rate**: Validates spline continuity, zero-slide standstill math, collision dynamics, 4-corner suspension, audio synthesis, and Vercel edge endpoints.
- **Continuous Integration Stability**: Automated tests guarantee that every commit maintains gold master quality and performance benchmarks.
- **Summary**:
  - Total Tests: **235**
  - Passed: **235 (100%)**
  - Failed: **0**
  - Regressions: **0**

---

### SLIDE 12: CONCLUSION & FUTURE PRODUCTION ROADMAP
- **Proven Deliverables**:
  - Complete 9-car fleet & 4 master sectors fully playable.
  - Dedicated Career Campaign & Live Operations Hub live on Vercel production.
  - Desktop 120Hz/144Hz high-performance PC runtime.
- **Upcoming Roadmap (2026–2027)**:
  - Season 02: *Orbital Eclipse* track expansion.
  - WebGPU compute shader volumetric particle upgrades.
  - Real-time WebRTC peer-to-peer multiplayer grid racing.
  - WebXR full cockpit VR support.
- **Team**: `rajranjeet7680` | **Project Leader**: **Ranjeet Kumar**
- **Experience the Game Live**: [https://optimistic-carson-pink.vercel.app](https://optimistic-carson-pink.vercel.app)
