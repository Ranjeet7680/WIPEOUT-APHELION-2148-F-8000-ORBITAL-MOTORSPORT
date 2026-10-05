# WIPEOUT: APHELION 2148 // F-8000 ORBITAL MOTORSPORT
### HIGH-OCTANE 3D ARCADE STREET RACING // DEVELOPED BY RANJEET KUMAR

<p align="center">
  <a href="https://optimistic-carson-pink.vercel.app">
    <img src="./public/header.svg" width="100%" alt="WIPEOUT: APHELION 2148 // Animated Header" />
  </a>
</p>

<p align="center">
  <a href="https://optimistic-carson-pink.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-00F0FF?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://github.com/Ranjeet7680/WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT"><img src="https://img.shields.io/badge/Developer-Ranjeet%20Kumar-FFB800?style=for-the-badge" alt="Developer" /></a>
  <a href="https://github.com/Ranjeet7680/WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT"><img src="https://img.shields.io/badge/Fleet-9%20Original%20Cars-FF2A13?style=for-the-badge" alt="Fleet" /></a>
  <a href="https://github.com/Ranjeet7680/WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT"><img src="https://img.shields.io/badge/Sectors-4%20Grand%20Prix%20Circuits-7928CA?style=for-the-badge" alt="Sectors" /></a>
  <a href="https://github.com/Ranjeet7680/WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT"><img src="https://img.shields.io/badge/Tests-235%2F235%20Passing-00FF66?style=for-the-badge" alt="Tests Passing" /></a>
  <a href="https://github.com/Ranjeet7680/WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT/blob/main/WIKI.md"><img src="https://img.shields.io/badge/Docs-Technical%20Wiki-00D4FF?style=for-the-badge" alt="Wiki" /></a>
</p>

> **WIPEOUT: APHELION 2148** is a state-of-the-art 3D futuristic arcade racing game developed by **Ranjeet Kumar**.  
> Built with Three.js, deterministic 120Hz sub-stepping physics, continuous $C^1$ spline interpolation, 4-corner harmonic suspension dynamics, Web Audio API procedural sound synthesis, 9 detailed high-performance vehicles, and 4 master sector circuits across Tokyo, oceanic coastlines, and alpine mountain summits.  
> 🌐 **Play Live in Browser**: [optimistic-carson-pink.vercel.app](https://optimistic-carson-pink.vercel.app)  
> 📖 **Comprehensive Technical Documentation**: [WIKI.md](./WIKI.md)

---

## 🌟 Highlights & Major Features

- **End-to-End Smooth Driving Physics**:
  - **Continuous $C^1$ Spline Interpolation**: Tracks are continuously sampled across Frenet-Serret frames, completely eliminating 9-meter stepped oscillations.
  - **Zero Sideways Slide at Standstill**: At $0\,\text{km/h}$, lateral sliding is eliminated ($\text{speedFactor} = 0$). Front wheels turn and camber in place, while the vehicle remains rock-steady on the grid.
  - **Dynamic Chassis Turn-In Yaw**: When steering, the vehicle dynamically yaws into the direction of travel with authentic racing aerodynamics.
  - **Glancing Barrier Wall-Riding**: Superconducting barriers cushion contact, scrub speed smoothly (35 km/h per second), and provide crisp, immediate breakaway when steering away without pinball rebounds.
  - **Pre-Race Engine Revving**: Drivers can rev the engine during countdown, spooling exhaust plumes and squatting the rear suspension before green light launch.
  - **Smooth Camera Transitions**: Eliminates 1-frame pops when transitioning from cinematic intro swoops into chase cam.
- **4 Master Grand Prix Circuits**:
  - **Sector 01 // Neo-Shinjuku Rift** ($5.4\,\text{km}$, 8 districts, 140 skyscrapers, 5 monumental tunnels).
  - **Sector 02 // Coastline Expressway** ($5.4\,\text{km}$, $12{,}000\,\text{m}$ Pacific ocean water shader, Ocean Run suspension bridge, kinetic wind turbines, sea mist).
  - **Sector 03 // Fuji Skyway Pass** ($5.2\,\text{km}$, technical mountain climb $+400\,\text{m}$, $1{,}800\,\text{m}$ Mount Fuji silhouette, alpine pine forest, falling snow).
  - **Sector 05 // Night District Elimination** ($5.0\,\text{km}$, downtown neon corridors, dynamic lap 1/2/3 hazard escalations).
- **9 High-Performance Vehicles**: Muscle, Exotic Hypercars, 80s Wedge Supercars, JDM Tuners, DTM Touring, Vintage 1970 Muscle, Rally Cross, Armored Luxury SUVs, and Executive GTs.
- **4-Corner Independent Suspension**: Damped 2nd-order harmonic spring equations for squat under throttle, dive under braking, thermochromic glowing brake discs, and venturi downforce suction.
- **Procedural Cyberpunk Audio Engine**: Dual-oscillator engine synthesizers, resonant lowpass filters, airbrake wooshes, wind buffeting, and adaptive soundtracks.
- **Native PC Gaming Software Runtime**: Includes 120Hz/144Hz discrete GPU-accelerated desktop client for Windows (`LaunchGame-PC.bat`).
- **Serverless Edge Backend on Vercel**: Global leaderboards, relativistic holographic ghost telemetry replay, cloud profile sync, and latency tracking.

---

## 🚀 Complete Game Flow & UX Progression

```
FIRST EVER LAUNCH:
3D LOADING ──► "DEVELOPED BY RANJEET KUMAR" ──► FIRST-TIME PLAYER WELCOME ──► FIRST-TIME CINEMATIC
      │
      ▼
AETHER DRIVER ACADEMY (10 Interactive Steps + Vector AI Voice) ──► DRIVER CERTIFIED ──► 3D LOBBY HQ

SUBSEQUENT LAUNCHES:
3D LOADING ──► DEVELOPER CREDIT ──► 3D UNDERGROUND RACING HQ (Direct Access, Zero Interruptions)
      │
      ├──► 3D VEHICLE SHOWCASE (Drag rotate, scroll zoom, camera angle presets)
      ├──► CAR SELECTION CAROUSEL (9 Original Machines & Animated Radar Stats)
      ├──► LIVE CUSTOMIZATION (Livery paints, neon underglow, aero kits, spoilers, wheels)
      ├──► TRACK SELECTION MATRIX (Sectors 01, 02, 03, 05 with dynamic 3D loading)
      ├──► ROYAL PASS SEASON 01 (Elite / Free tracks, 50+ unlockable tiers, XP claims)
      ├──► DRIVING SCHOOL / TUTORIAL REPLAY (Practice any academy module)
      ├──► SETTINGS (Controls, Graphics Quality ULTRA/HIGH/MED/LOW, 60/120 FPS Toggle, Audio Sliders)
      ▼
[ PLAY RACE ] ──► MATCHMAKING & TIPS ──► FLY-THROUGH CINEMATIC ──► STARTING GRID INSPECTION
      │
      ▼
COUNTDOWN (3.. 2.. 1.. GO!) ──► HIGH-OCTANE ARCADE RACE (Drift, Boost, Stunts, Near Misses)
      │
      ▼
CHECKERED FINISH LINE (Slow-Mo Side Tracking) ──► RACE RESULTS
      │
      ▼
SPECTACULAR 3D VICTORY PODIUM (1st, 2nd, 3rd Tiered Pedestals, Spotlights & Confetti)
      │
      ▼
PUBG-STYLE REWARDS (Tap-to-reveal reward cards: Credits, Tokens, XP, Rare Cores)
      │
      ▼
WINNING LOBBY (Champion Platform, Win Streak Tracking, Animated XP Level-Up)
```

---

## 🏎️ Complete 9-Vehicle Fleet

| ID | Vehicle Name | Class | Silhouette & Specialization | Max Speed | Accel | Handling | Boost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `f8000` | **F-8000 // NIGHTRIFT** | MUSCLE | Flagship widebody Hellcat coupe, quad halo projector lamps, dual heat-extractor hood | $420\,\text{km/h}$ | $90\%$ | $92\%$ | $90\%$ |
| `nxr01` | **NXR-01 // HYPERCAR** | HYPERCAR | Carrera mid-engine exotic, teardrop lights, roll-hoop nacelles, active GT wing | $382\,\text{km/h}$ | $96\%$ | $88\%$ | $94\%$ |
| `v720` | **V-720 // PHANTOM** | SUPERCAR | Ferrari F40 wedge classic, pop-up lights, side air strakes, triple exhaust | $445\,\text{km/h}$ | $82\%$ | $80\%$ | $94\%$ |
| `x900` | **X-900 // VELOCITY** | SPORTS | RX-7 JDM tuner fastback, front-mount intercooler, ducktail spoiler | $410\,\text{km/h}$ | $98\%$ | $86\%$ | $92\%$ |
| `k77` | **K-77 // QUANTUM** | JDM | E30 M3 German DTM touring, twin kidney grille, quad round lamps, box flares | $400\,\text{km/h}$ | $86\%$ | $98\%$ | $86\%$ |
| `r500` | **R-500 // RAZOR** | MUSCLE | 1970 Challenger R/T classic muscle, functional shaker scoop, vintage dish wheels | $415\,\text{km/h}$ | $90\%$ | $94\%$ | $95\%$ |
| `wl04` | **WL-04 // APEX RALLY** | RALLY | Competition rally cross machine, quad bumper spotlights, competition wing | $395\,\text{km/h}$ | $94\%$ | $95\%$ | $88\%$ |
| `terrax` | **TERRA-X // CYBER BEAST**| OFF-ROAD | Escalade armored luxury SUV, tall multi-slat chrome grille, vertical LED blades | $390\,\text{km/h}$ | $92\%$ | $90\%$ | $90\%$ |
| `a11` | **A-11 // AETHER** | HYPERCAR | Mercedes-AMG executive GT, chrome louvre grille, panoramic glass, quad exhausts | $430\,\text{km/h}$ | $95\%$ | $88\%$ | $98\%$ |

---

## 🏁 Master Track Matrix (4 Distinct Circuits)

1. **Sector 01 // Neo-Shinjuku Rift** ($5.4\,\text{km}$, $600\,\text{samples}$):
   - 8 futuristic cyberpunk districts (Neon Core, Skyway, Industrial Rift, Old Shinjuku, Undercity, Aether Port, Mega Tower, Quantum Outskirts).
   - 140 arcology skyscrapers, 5 monumental skyscraper tunnels, architectural skybridge.
2. **Sector 02 // Coastline Expressway** ($5.4\,\text{km}$, $600\,\text{samples}$):
   - $12{,}000\,\text{m}$ Pacific ocean water shader with specular wave reflections.
   - Ocean Run suspension bridge towers, kinetic offshore wind turbines, and volumetric sea mist.
3. **Sector 03 // Fuji Skyway Pass** ($5.2\,\text{km}$, $600\,\text{samples}$):
   - High-altitude technical mountain pass spanning $+400\,\text{m}$ elevation climb.
   - $1{,}800\,\text{m}$ Mount Fuji volcanic cone silhouette, dense alpine pine forest (180+ trees), and falling snow particles.
4. **Sector 05 // Night District** ($5.0\,\text{km}$, $600\,\text{samples}$):
   - Neon-drenched downtown elimination corridors with dynamic lap 1/2/3 hazard escalations.

---

## 🎮 Controls Reference

| Action | Desktop Keyboard | Mobile Touch | Gamepad (Xbox / PS) |
| :--- | :--- | :--- | :--- |
| **Drive / Accelerate** | `W` or `↑ Up` | Auto / Touch | `Right Trigger` / `A` |
| **Brake / Reverse** | `S` or `↓ Down` | `BRAKE` Button | `Left Trigger` / `X` |
| **Steer Left / Right** | `A` / `D` or `← / →` | `◄` / `►` Touch Buttons | `Left Analog Stick (X)` |
| **Drift Mode** | `SHIFT` (Left or Right) | `DRIFT` Button | `Left Bumper (LB)` |
| **Hyper-Boost** | `SPACE` | `BOOST` Button | `Button B` |
| **Airbrakes (Left / Right)** | `Q` / `E` | — | `LB` / `RB` |
| **Energy Brake** | `B` or `Q + E` | `ENERGY BRAKE` | `RB` |
| **Toggle Camera (TPP / FPP)** | `C` or HUD Camera Icon | Camera Button | `Y` / `Select` |
| **Rotate 3D Lobby Vehicle** | Click & Drag Mouse | Single Finger Drag | `Right Analog Stick` |
| **Zoom 3D Vehicle** | Mouse Wheel Scroll | Pinch Zoom | `Triggers` |
| **Satellite World Map** | `M` | Menu Button | — |
| **Customization Garage** | `G` | Menu Button | — |
| **Instant Track Reset** | `R` or Click HUD Reset | — | — |
| **Pause Game** | `ESC` | `⏸` Button | `Start / Options` |

---

## ⚡ Quick Launch (Windows Desktop PC)

For discrete GPU hardware acceleration and 120Hz/144Hz unlocked refresh rates:
```cmd
LaunchGame-PC.bat
```
This launcher:
1. Validates the local Node.js environment.
2. Compiles optimized WebGPU/WebGL shaders and production bundles (`npm run build`).
3. Boots the native desktop client with discrete GPU hardware acceleration flags.

For web development mode:
```cmd
start.bat
```

---

- **Dedicated Career Mode & Live Operations Hub**:
  - **Career Progression**: 5 distinct campaign chapters spanning from Rookie Proving Grounds to Aphelion Grand Prix, 25 sequential challenges with star objectives and license tier unlocks.
  - **Live Operations Hub**: Rotating Daily Cups, Weekly Showdowns, Special Ops Ghost Telemetry, and Boss Rival Duels with a dedicated energy mechanic.
  - **UI Polish**: Native browser scrollbars replaced with cyber neon scrollbars, showroom floating chips cleared for an unobstructed 360° vehicle view, and desktop HUD decluttered.

---

## 🧪 Automated Verification Suite (235 Tests)

To run the complete automated test suite:
```bash
node test/e2e-simulation-test.js
```
**Verification Status**: **235 PASSED, 0 FAILED** across 21 distinct verification modules.

---

## 🌐 Serverless Edge Backend on Vercel

- **Global Pilot Leaderboards (`/api/leaderboard`)**: Real-time relativistic lap records and multi-circuit filtering.
- **Holographic Ghost Telemetry (`/api/ghost`)**: 3D keyframe spline streamer rendering live translucent ghost vehicles with real-time delta times.
- **Driver Cloud Profile Sync (`/api/profile`)**: Pilot rank, XP, credits, tokens, and academy certifications.
- **Orbital Edge Relay Telemetry (`/api/status`)**: Latency metrics and active grid telemetry.

---

## 📖 Technical Documentation

For the complete technical breakdown of physics equations, spline math, zero-allocation memory pipelines, audio nodes, and Electron architecture, see:
👉 **[WIKI.md](./WIKI.md)**
