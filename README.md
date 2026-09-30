# NEO-SHINJUKU RIFT // HYPER CIRCUIT // AETHER-9

<p align="center">
  <a href="https://optimistic-carson-pink.vercel.app">
    <img src="./public/header.svg" width="100%" alt="NEO-SHINJUKU RIFT // HYPER CIRCUIT // AETHER-9 Animated Header" />
  </a>
</p>

<p align="center">
  <a href="https://optimistic-carson-pink.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-00F0FF?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://github.com/Ranjeet7680/WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT"><img src="https://img.shields.io/badge/Vehicle-F--8000%20NIGHTRIFT-FFB800?style=for-the-badge" alt="Vehicle" /></a>
  <a href="https://github.com/Ranjeet7680/WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT"><img src="https://img.shields.io/badge/World-8%20Districts-FF2A13?style=for-the-badge" alt="World" /></a>
  <a href="https://github.com/Ranjeet7680/WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT"><img src="https://img.shields.io/badge/Physics-420%20km%2Fh%20120Hz-7928CA?style=for-the-badge" alt="Physics" /></a>
</p>

> **NEO-SHINJUKU RIFT: HYPER CIRCUIT // AETHER-9**  
> Complete, playable futuristic open-world / circuit arcade racing game built for the web.  
> Features the original **F-8000 // NIGHTRIFT** racing machine, 8 cyberpunk districts, autonomous civilian traffic, 8 rival AI racers + boss encounter, real-time rotating holographic minimap radar, interactive full-world satellite map (`[M]`), underground tuning garage (`[G]`), and responsive 120Hz arcade drift physics.  
> 🌐 **Play Instantly in Browser**: [optimistic-carson-pink.vercel.app](https://optimistic-carson-pink.vercel.app)

---

## 🏎️ Key Features & Architecture

### 1. 80–90% Unobstructed Playable 3D Racing Viewport
- **Centered Third-Person Chase Camera**: Dynamic follow system with apex lead, collision camera shake, FOV punch (75° to 105°) on hyper-boost, and smooth corner anticipation.
- **Peripheral Cyber-Minimalist HUD**: Digital speedometer, live grid standings, boost gauge, checkpoint objectives, and telemetry badges neatly arranged around the screen perimeter to keep the racing view wide open.

### 2. Player Vehicle: F-8000 // NIGHTRIFT (Year 2089)
- **Aero Monocoque**: Ultra-low carbon-fiber composite chassis with sharp aerodynamic chines, front air intakes, and rear energy diffuser.
- **Quad Articulated Propulsion Modules**: 4 independent suspension nacelles with spinning induction coils that react dynamically to steering, drifting, and boosting.
- **Pulsing Cyan Energy Core**: Central magnetic chamber that surges in rate and scale during hyper-boost.
- **Dual Plasma Exhaust**: Particle/mesh flame plumes that scale and flicker with throttle input and hyper-boost.
- **Active Aerodynamics**: Dynamic airbrake flaps deploy during sharp cornering, braking, and drifting.
- **Neon Underglow & Digital Brake Lights**: Reactive lighting illuminating the road beneath the vehicle.

### 3. Responsive Arcade Racing Physics (120Hz ODE)
- **Top Speed**: $420\,\text{km/h}$ with hyper-boost, $380\,\text{km/h}$ baseline cruising.
- **Drift Mechanics (`[SHIFT]`)**: Lateral slip angle with counter-steer bonus, spark emission, and rapid Hyper-Boost recharge while drifting.
- **Hyper-Boost (`[SPACE]`)**: Up to 5 seconds of continuous supercharged propulsion; recharges automatically through clean driving, drifting, and hitting boost pads.
- **Energy Emergency Brake (`[E]`)**: Immediate kinetic deceleration for hairpin turns.
- **Boost Pads & Checkpoint Gates**: 8 dynamic induction pads along the track providing instant $+65\,\text{km/h}$ speed kicks.

### 4. Open-World Environment: Neo-Shinjuku (2089)
Spans 8 distinct atmospheric districts along a 5.4 km multi-tiered circuit:
1. **Neon Core**: Metropolis heart with 140 instanced skyscrapers, giant animated holographic billboards, and neon ground guidance tracks.
2. **Skyway District**: Elevated highway viaduct (+600m datum) overlooking the sprawling skyline.
3. **Industrial Rift**: Heavy production sector with coolant pipelines, factory corridors, and pulsed steam vents.
4. **Old Shinjuku**: Dense retro-cyber backstreets with hanging red paper lanterns and narrow alleys.
5. **Undercity**: Subterranean titanium pipe tunnel (-40m datum) with high ground-effect speed.
6. **Aether Port**: Spaceport flyover with launch pads and a massive $+2,400\,\text{m}$ orbital elevator tether.
7. **Mega Tower Zone**: Super-spire spiral corkscrew culminating in a dramatic 70° vertical plunge.
8. **Quantum Outskirts**: Hypersonic home straightaway leading back to the Start/Finish gantry.
- **Atmospheric Weather**: Dynamic rain particle field centered around the vehicle with wet road specular reflections.

### 5. Autonomous Civilian Traffic Fleet
- **Civilian Vehicles**: Autonomous cyber-taxis, executive sedans, logistics vans, and massive cargo haulers.
- **Multi-Lane AI**: Continuous lane navigation across 4 highway corridors with periodic lane-changing maneuvers and collision repulsion.

### 6. 8 Rival Racers + "The Vector" Boss Encounter
- **Class-A Contenders**: Zero (Ghost Division), Kane (Syndicate Ram), Mira (Tokyo Kinetics), Volt (Lightning Corp), Rex (Titan Heavy), Ayla (Nebula Drift), Nova (Emerald Speed), Kira (Apex Racing).
- **Boss Encounter**: *The Vector* (V-99 Vector) — high-speed shadow prototype with 425 km/h capability.
- **Real-Time Standings**: Live distance-based leaderboard ranking calculating player position 1 through 9.

### 7. Holographic Minimap Radar `[ AETHER-9 // NAV ]`
- Real-time rotating 2D canvas radar in the top-right corner.
- Rotates dynamically with vehicle heading so "up" is always the forward driving direction.
- Tracks road spline ribbon, green boost pads, amber checkpoints, rival racer blips, and player location.

### 8. Satellite Full World Map (`[M]`)
- Fullscreen interactive tactical network map of Neo-Shinjuku.
- District browser with municipal details, active Grand Prix events, garage locator, and instant vehicle deployment button.

### 9. Underground Tuning Hangar Bay (`[G]`)
- Fullscreen vehicle customization facility.
- Primary body livery color palette swatches (Cyan, Crimson, Gold, Ultraviolet, Acid Lime, Ghost White).
- Neon underglow customization swatches.
- Aerodynamic kit selector (Circuit Aero, Super-Highway Diffuser, Vortex Split Wing).
- Live performance specification gauges.

---

## 🎮 Controls Reference

| Action | Primary Key | Alternate Key | Gamepad (Xbox / PS) |
| :--- | :--- | :--- | :--- |
| **Accelerate / Drive** | `W` | `↑ Up Arrow` | `Right Trigger` / `Button A` |
| **Brake / Reverse** | `S` | `↓ Down Arrow` | `Left Trigger` / `Button X` |
| **Steer Left / Right** | `A` / `D` | `← / → Arrows` | `Left Analog Stick (X)` |
| **Drift Mode** | `SHIFT` (Left or Right) | — | `Left Bumper (LB / L1)` |
| **Hyper-Boost** | `SPACE` | — | `Button B` |
| **Energy Brake** | `E` | — | `Right Bumper (RB / R1)` |
| **Satellite World Map** | `M` | — | — |
| **Underground Garage** | `G` | — | — |
| **Cycle Camera Mode** | `C` or `V` | — | `D-Pad Down` |
| **Reset / Restart Race** | `R` | — | `Select / Back` |
| **Close Menus / Modals** | `ESC` | — | `Start / Options` |

---

## 🛠️ Development & Deployment

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (Vite)
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview local build
npm run preview
```

---

## 📜 Credits & Technology Stack
- **Engine**: Three.js (r160) + Postprocessing EffectComposer (UnrealBloomPass)
- **Audio**: Web Audio API (FM Synthesizers, noise filters, procedural sequencer)
- **Build Tool**: Vite 5
- **Deployment**: Vercel
