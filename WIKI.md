# WIPEOUT: APHELION 2148 // TECHNICAL WIKI & SYSTEM ARCHITECTURE
### Official Documentation & Developer Guide // Developed by Ranjeet Kumar

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [120Hz Sub-Stepping Deterministic Physics Engine](#2-120hz-sub-stepping-deterministic-physics-engine)
3. [Continuous $C^1$ Spline Geometry & Frenet-Serret Tracking](#3-continuous-c1-spline-geometry--frenet-serret-tracking)
4. [Vehicle Catalog & 4-Corner Automotive Suspension](#4-vehicle-catalog--4-corner-automotive-suspension)
5. [Multi-Circuit Master Matrix (Sectors 01, 02, 03, 05)](#5-multi-circuit-master-matrix-sectors-01-02-03-05)
6. [Dynamic 6-DOF Racing Camera System](#6-dynamic-6-dof-racing-camera-system)
7. [Procedural Web Audio Engine & Sound Design](#7-procedural-web-audio-engine--sound-design)
8. [AI Rival Behavior & Traffic Systems](#8-ai-rival-behavior--traffic-systems)
9. [Serverless Telemetry, Leaderboards & Holographic Ghost](#9-serverless-telemetry-leaderboards--holographic-ghost)
10. [Native PC Gaming Software Runtime (Windows Desktop)](#10-native-pc-gaming-software-runtime-windows-desktop)
11. [Vercel Cloud Deployment & Web Optimization](#11-vercel-cloud-deployment--web-optimization)
12. [Verification Suite & Automated Testing (229 Tests)](#12-verification-suite--automated-testing-229-tests)

---

## 1. System Architecture Overview

WIPEOUT: APHELION 2148 is built on a high-throughput, zero-garbage-collection architectural paradigm. The application operates simultaneously as a high-performance WebGL/WebGPU web experience and a discrete GPU-accelerated native PC desktop software.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MAIN THREAD / RUNTIME                           │
│  (Window / Electron Shell / RequestAnimationFrame / 60-144 FPS)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          ▼                                                   ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     GAME MANAGER STATE LOOP   │               │     THREE.JS RENDER LOOP      │
│  - Input Polling (KB/GP/Touch)│               │  - Scene Graph Update         │
│  - State Machine Dispatcher   │               │  - Shadow Cascades & Direction│
│  - Audio Engine Dispatch      │               │  - Post-Processing Pipeline   │
│  - HUD & DOM Overlay Updates  │               │    (UnrealBloomPass, ACES)    │
└──────────────┬────────────────┘               └───────────────▲───────────────┘
               │                                                │
               ▼                                                │
┌───────────────────────────────┐                               │
│  120Hz FIXED ACCUMULATOR      │                               │
│  - stepPhysics(1 / 120s)      │                               │
│  - Progressive Torque Curve   │                               │
│  - Aerodynamic Quadratic Drag │                               │
│  - Dynamic Turn-In Yaw        │                               │
│  - Continuous Frenet Spline   │                               │
│  - Glancing Wall Slide        │                               │
└──────────────┬────────────────┘                               │
               │                                                │
               ▼                                                │
┌───────────────────────────────┐                               │
│  HERMITE INTERPOLATOR         │───────────────────────────────┘
│  - getInterpolatedTransform() │  (Transforms render positions & orientations
│  - Sub-step Alpha Blending    │   smoothly without micro-stutter)
└───────────────────────────────┘
```

---

## 2. 120Hz Sub-Stepping Deterministic Physics Engine

The physics simulation runs inside `src/physics/ArcadeRacingPhysics.js` using a fixed sub-stepping timestep of $\Delta t = \frac{1}{120}\,\text{s}$ ($8.33\,\text{ms}$) with a fractional accumulator for sub-frame render interpolation.

### 2.1 Torque & Dynamic 7-Speed Transmission Curves
Acceleration is governed by progressive torque multiplication bands rather than abrupt static forces:
- **1st Gear ($0 - 65\,\text{km/h}$)**: Launch torque multiplier $3.6 \times - 1.2 \times \left(\frac{v}{65}\right)$
- **2nd Gear ($65 - 135\,\text{km/h}$)**: Strong mid-acceleration pull ($2.4 \times - 1.7 \times$)
- **3rd Gear ($135 - 210\,\text{km/h}$)**: Corner exit torque sweep ($1.7 \times - 1.3 \times$)
- **4th Gear ($210 - 285\,\text{km/h}$)**: High-speed corridor pull ($1.3 \times - 1.1 \times$)
- **5th Gear ($285 - 350\,\text{km/h}$)**: Aerodynamic top-end battle ($1.1 \times - 1.0 \times$)
- **6th & 7th Gear ($350 - 445\,\text{km/h}$)**: Overdrive & Nitro peak velocity envelope.

### 2.2 Standstill Stability & Speed-Proportional Steering Authority
To eliminate unnatural sideways crab-walking or drifting while parked at the start line or during countdown:
$$\text{speedFactor} = \text{clamp}\left(\frac{|v_{\text{kmh}}|}{14.0}, 0.0, 1.0\right)$$
- At $v = 0\,\text{km/h}$: $\text{speedFactor} = 0$, guaranteeing zero lateral sliding on the starting grid.
- Steering wheel angles and wheel camber respond visually, while the vehicle remains rock-solid in place until throttle is engaged.

### 2.3 Glancing Barrier Wall-Riding & Breakaway
Superconducting barriers eliminate destructive pinball repulsions. When the craft touches a barrier ($|\text{offset}| \ge \frac{W_{\text{road}}}{2} - 0.2\,\text{m}$):
- Outward velocity is canceled instantly.
- Inward cushioning velocity is applied softly ($-0.8\,\text{m/s}$).
- Speed scrubs progressively via surface friction ($-35.0\,\text{km/h}$ per second of contact).
- If the driver steers away from the wall ($\text{sign}(\text{steer}) \ne \text{sign}(\text{offset})$), an immediate $-3.5\,\text{m/s}$ breakaway impulse is applied, granting clean, unhindered return to the center lane.

---

## 3. Continuous $C^1$ Spline Geometry & Frenet-Serret Tracking

All circuits implement continuous spline interpolation via `getInterpolatedFrame(u)` in `CityCircuit.js`, `CoastlineCircuit.js`, and `FujiSkywayCircuit.js`.

### 3.1 Mathematical Formulation
Given normalized track progression $u \in [0, 1)$ and total discretized segments $N = 600$:
$$i_0 = \lfloor u \cdot N \rfloor \pmod N, \quad i_1 = (i_0 + 1) \pmod N, \quad \alpha = (u \cdot N) - \lfloor u \cdot N \rfloor$$
The frame components are continuously evaluated via zero-allocation vector math:
$$\mathbf{P}(u) = (1 - \alpha)\mathbf{P}_{i_0} + \alpha\mathbf{P}_{i_1}$$
$$\mathbf{T}(u) = \text{normalize}\left((1 - \alpha)\mathbf{T}_{i_0} + \alpha\mathbf{T}_{i_1}\right)$$
$$\mathbf{N}(u) = \text{normalize}\left((1 - \alpha)\mathbf{N}_{i_0} + \alpha\mathbf{N}_{i_1}\right)$$
$$\mathbf{B}(u) = \text{normalize}\left((1 - \alpha)\mathbf{B}_{i_0} + \alpha\mathbf{B}_{i_1}\right)$$

### 3.2 Dynamic Heading Yaw
In previous versions, vehicle physics quaternions were rigidly locked to the track tangent. In the overhauled engine:
$$\theta_{\text{turn}} = \begin{cases} -\theta_{\text{drift}} & \text{if drifting} \\ \text{steerForce} \times 0.10 \times \min\left(1.0, \frac{|v|}{28.0}\right) & \text{otherwise} \end{cases}$$
$$\mathbf{q}_{\text{craft}} = \mathbf{q}_{\text{Frenet}} \times \text{QuatFromAxisAngle}(\mathbf{N}_{\text{track}}, \theta_{\text{turn}})$$
$$\mathbf{v}_{\text{composite}} = \mathbf{fwd}_{\text{craft}} \cdot v_{\text{longitudinal}} + \mathbf{B}_{\text{track}} \cdot v_{\text{lateral}}$$

---

## 4. Vehicle Catalog & 4-Corner Automotive Suspension

`src/craft/FuturisticVehicle.js` provides 9 distinct, fully modeled aerodynamic machines with PBR materials, custom fascias, active aerodynamics, thermochromic glowing brake rotors, and independent 4-corner suspension.

### 4.1 Complete 9-Vehicle Fleet Matrix
| ID | Model Name | Category | Archetype / Inspiration | Top Speed | Accel | Handling | Boost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `f8000` | **F-8000 // NIGHTRIFT** | MUSCLE | Widebody Hellcat Coupe | $420\,\text{km/h}$ | $90\%$ | $92\%$ | $90\%$ |
| `nxr01` | **NXR-01 // HYPERCAR** | HYPERCAR | Carrera Mid-Engine Exotic | $382\,\text{km/h}$ | $96\%$ | $88\%$ | $94\%$ |
| `v720` | **V-720 // PHANTOM** | SUPERCAR | F40 Wedge Classic | $445\,\text{km/h}$ | $82\%$ | $80\%$ | $94\%$ |
| `x900` | **X-900 // VELOCITY** | SPORTS | RX-7 JDM Tuner Fastback | $410\,\text{km/h}$ | $98\%$ | $86\%$ | $92\%$ |
| `k77` | **K-77 // QUANTUM** | JDM | E30 M3 German DTM Touring | $400\,\text{km/h}$ | $86\%$ | $98\%$ | $86\%$ |
| `r500` | **R-500 // RAZOR** | MUSCLE | 1970 Challenger R/T Muscle | $415\,\text{km/h}$ | $90\%$ | $94\%$ | $95\%$ |
| `wl04` | **WL-04 // APEX RALLY** | RALLY | Rally Cross / Stock Car | $395\,\text{km/h}$ | $94\%$ | $95\%$ | $88\%$ |
| `terrax` | **TERRA-X // CYBER BEAST**| OFF-ROAD | Escalade Armored Luxury SUV| $390\,\text{km/h}$ | $92\%$ | $90\%$ | $90\%$ |
| `a11` | **A-11 // AETHER** | HYPERCAR | Mercedes-AMG Executive GT | $430\,\text{km/h}$ | $95\%$ | $88\%$ | $98\%$ |

### 4.2 2nd-Order Harmonic Suspension Equation
Suspension pitch and roll are computed via second-order mass-spring-damper differential equations:
$$\ddot{x}_{\text{pitch}} = k_p \cdot (x_{\text{target}} - x_{\text{pitch}}) - c_p \cdot \dot{x}_{\text{pitch}}$$
$$\ddot{x}_{\text{roll}} = k_r \cdot (x_{\text{target}} - x_{\text{roll}}) - c_r \cdot \dot{x}_{\text{roll}}$$
- **Squat on Throttle**: Rear corner mounts compress lower than front mounts.
- **Dive on Brake**: Front corner mounts compress lower than rear mounts while thermochromic rotor materials heat up to an orange emissive glow ($0\text{ to }2.0\,\text{intensity}$).
- **Ackermann Steering**: Inner wheel pivots at a steeper angle ($1.08\times$) than outer wheel ($0.94\times$) on turn-in with negative camber lean.
- **Venturi Ground Effect**: Hypersonic velocities suck the chassis down by up to $-0.035\,\text{m}$ toward the asphalt.

---

## 5. Multi-Circuit Master Matrix (Sectors 01, 02, 03, 05)

| Sector | Circuit Name | Length | Samples | Checkpoints | Boost Pads | Environmental Highlights |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01 / 07** | **NEO-SHINJUKU RIFT** | $5.4\,\text{km}$ | 600 | 8 Gates | 8 Pads | 140 skyscrapers, 5 monumental tunnels, architectural skybridge |
| **02** | **COASTLINE EXPRESSWAY** | $5.4\,\text{km}$ | 600 | 8 Gates | 8 Pads | $12{,}000\,\text{m}$ Pacific water shader, Ocean Run suspension towers, wind turbines, sea mist |
| **03** | **FUJI SKYWAY PASS** | $5.2\,\text{km}$ | 600 | 8 Gates | 8 Pads | $+400\,\text{m}$ mountain climb, $1{,}800\,\text{m}$ Mount Fuji cone silhouette, alpine pine forest, falling snow |
| **05** | **NIGHT DISTRICT** | $5.0\,\text{km}$ | 600 | 8 Gates | 8 Pads | Downtown elimination corridors, dynamic lap 1/2/3 hazard escalations (Cyan $\rightarrow$ Amber $\rightarrow$ Red) |

---

## 6. Dynamic 6-DOF Racing Camera System

`src/game/CameraController.js` manages multiple camera modes with smooth spring-damper following and mode transition blending:
- **CHASE (TPP)**: Positioned firmly behind vehicle rear ($\Delta z = -7.4\,\text{m}$, height $2.3\,\text{m}$, look-ahead $20.0\,\text{m}$). Includes centrifugal roll banking into curves and jump trajectory pitch.
- **HOOD**: Fastened onto the front cowl with direct road contact perception.
- **COCKPIT**: Pilot interior perspective inside the canopy canopy with micro-head bob.
- **BUMPER**: Low-slung front splitter camera with extreme ground-level speed perception.
- **BROADCAST DRONE**: High-altitude telephoto trackside tower camera ($34^\circ\,\text{FOV}$).
- **ACTION**: Floating orbital perspective tracking dynamic drift angles.
- **SLOW-MO FINISH**: Checkered line crossing cinematic camera.
- **Seamless Match Start**: `CameraController.reset(pos, quat, snap = false)` blends from the gantry swoop into chase cam with zero 1-frame position/FOV jumps.

---

## 7. Procedural Web Audio Engine & Sound Design

`src/audio/CyberpunkAudioEngine.js` generates fully procedural, zero-external-asset audio using the Web Audio API:
- **Engine Sound**: Dual oscillator array (sawtooth base tone + sub-bass triangle) driving an active resonant lowpass filter modulated by vehicle RPM and throttle load.
- **Wind Buffeting & Hypersonic Whistle**: Bandpass noise generator scaling with aerodynamic velocity ($>250\,\text{km/h}$).
- **Gear Shift Backfire Pops**: Fast burst noise envelope firing on upshifts and downshifts.
- **Soundtrack Modes**:
  - `LOBBY`: Ambient atmospheric synth drone.
  - `CHASE THE HORIZON`: High-energy electronic melodic synthwave.
  - `BORN TO RACE`: Driving industrial cyberpunk drum & bass.
  - `COUNTDOWN` & `RACING`: Adaptive race score with dynamic intensity filter.
  - `FINAL LAP`: High-tempo battle mix.

---

## 8. AI Rival Behavior & Traffic Systems

- **Rival AI (`RivalRacersSystem.js`)**: 8 autonomous competitors with unique pilot profiles (Kaito, Ryuki, Haruto, Sora, Tanaka, Mika, Kenji, Nyx). Features dynamic lane choice, slipstream drafting, corner speed anticipation, and collision deflection.
- **Traffic System (`TrafficSystem.js`)**: Multi-lane civilian hover vehicles traveling at calibrated highway speeds. Triggering near misses ($<3.5\,\text{m}$) awards boost energy and bonus points.

---

## 9. Serverless Telemetry, Leaderboards & Holographic Ghost

The game communicates with Vercel Serverless Functions (`/api`):
- **/api/leaderboard**: Global lap time registry with multi-circuit filtering, tamper validation, and instant standing calculation.
- **/api/ghost**: Relativistic 3D keyframe spline recorder and streamer. Renders a translucent cyan wireframe ghost vehicle (`HolographicGhostVehicle.js`) directly on track with realtime delta time HUD updates.
- **/api/profile**: Player career progression sync (Level, XP, Credits, Premium Tokens, Certified Academy badges).
- **/api/status**: Edge ping latency and active grid telemetry.

---

## 10. Native PC Gaming Software Runtime (Windows Desktop)

WIPEOUT: APHELION 2148 includes a native PC gaming desktop runtime (`desktop/main.cjs`):
- **High-Performance Flags**: Runs Chromium with discrete GPU hardware acceleration (`--ignore-gpu-blocklist`, `--enable-zero-copy`, `--enable-gpu-rasterization`, `--disable-software-rasterizer`).
- **120Hz/144Hz Unlocked Refresh Rate**: Zero VSync stutter, ultra-low input latency.
- **1-Click Launcher (`LaunchGame-PC.bat`)**:
  - Validates Node.js environment.
  - Compiles production bundle with Vite.
  - Launches native desktop window ($1600 \times 900$) with discrete GPU acceleration.

---

## 11. Vercel Cloud Deployment & Web Optimization

- **Build Pipeline**: Vite 5 production bundler with tree-shaking and vendor chunk splitting (`three-vendor.js`).
- **Asset Caching**: `vercel.json` configures immutable 1-year caching for JavaScript, CSS, and 3D WebAssembly binaries, with stale-while-revalidate for images and procedural audio.
- **Live Production URL**: [optimistic-carson-pink.vercel.app](https://optimistic-carson-pink.vercel.app)

---

## 12. Verification Suite & Automated Testing (229 Tests)

Run the full end-to-end verification suite:
```bash
node test/e2e-simulation-test.js
```

### Complete Test Coverage Breakdown:
1. **Section 01-12**: Core game loop, input controllers, track geometry, collision logic, leaderboard backend, and state machine (64 tests).
2. **Section 13**: Skyscraper road tunnels, TPP camera, reverse gear, thermochromic rotors, and active GT wings (12 tests).
3. **Section 14**: Dynamic telemetry, curb rumble, 2nd-order suspension, 4-corner independent weight transfer, Ackermann steering, venturi downforce (10 tests).
4. **Section 15**: Tunnel interior detection, zero streetlight clipping, progressive steering, self-centering damping (8 tests).
5. **Section 16**: Zero-crossing road clearance across 140 arcology skyscrapers, portal crowns, and traffic gantries (3 tests).
6. **Section 17**: Progressive launch curve, progressive nitro ramp, 3-tier steering sensitivity, landing detection, overtakes, camera scale (10 tests).
7. **Section 18**: Countdown overlay failsafe, procedural audio nodes, race timer transition (8 tests).
8. **Section 19**: Sector 02, 03, 05 master matrix, ocean shader, mountain climb +400m, pine forest, snow, dynamic elimination hazard escalation, full lap driving simulations (30 tests).
9. **Section 20**: Continuous $C^1$ spline interpolation, 0 km/h standstill stability, dynamic turn-in heading yaw, glancing barrier wall-riding, clean breakaway, soft camera reset, countdown revving (11 tests).

**Total Verification Result**: **229 PASSED, 0 FAILED**.
