# WIPEOUT-APHELION-2148-F-8000-ORBITAL-MOTORSPORT

> **WIPEOUT: APHELION (2148 F-8000 ORBITAL MOTORSPORT)**  
> Next-generation anti-gravity racing simulation fusing **The Designers Republic (tDR)** Y2K cyber-minimalist aesthetic, non-inertial 6-DOF flight dynamics, real-time kinetic energy distribution, and a benchmark-grade WebGPU / MRT Deferred rendering pipeline.

---

## ⚡ The 5 Core Differentiating Game Mechanics

```
                         [TOTAL SHIP POWER: 100%]
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
     [THRUST OVERDRIVE]      [FLUX CLAMPING]        [KINETIC BARRIER]
     Top speed & accel      Magnetic grip & down    Hull defense & ramming
```

### 1. Tri-Vector Energy Diverter (On-The-Fly Power Routing)
Replaces randomized pickups and passive shields with deterministic flight bus power routing. The pilot continuously modulates a finite 100% pool across three discrete subsystems (`[1]`, `[2]`, `[3]`, `[4]` or Gamepad D-Pad):
- **Balanced (33% / 34% / 33%)**: Baseline all-around flight profile.
- **Thrust Overdrive (70% / 15% / 15%)**: Ion nozzles burn at peak temperature, unlocking top speeds exceeding $1,200\,\text{km/h}$ ($1.51\times$ thrust). Downforce drops to minimal $18\,\text{m/s}^2$ inducing massive corner drift; hull integrity drops to paper-thin levels ($2.2\times$ damage taken).
- **Flux Clamping (15% / 70% / 15%)**: Repulsor coils pull down against the track’s superconducting rails with extreme magnetic force ($85\,\text{m/s}^2$) and restorative alignment torque ($97\,\text{m/s}^2$). Eliminates lateral slide, maximizes apex carving, and allows full-throttle traversal of inverted corkscrews.
- **Kinetic Barrier (15% / 15% / 70%)**: Converts craft into an immovable physical battering ram. Absorbs $85\%$ of wall and impact damage, transmitting devastating kinetic recoil pulses into colliding rivals.

### 2. Orbital De-Anchoring & 6-DOF Vacuum Rifts
```
[MAGNETIC TRACK] ──► [RIFT DISCONNECT] ──► [6-DOF FREE FLIGHT] ──► [RE-ANCHOR GATE]
 (Normal repulsor)    (Track normal vanishes)  (RCS pitch/yaw control)  (Magnetic catch vector)
```
- **Zero-G Atmospheric Inversion**: When crossing into vacuum rifts, magnetic downforce drops to zero and aerodynamic drag vanishes ($\rho_{air} = 0.04$). Aerodynamics shift from lift-wing aerodynamics to Reaction Control System (RCS) cold-gas thrusters.
- **Vector Re-Alignment & Re-Anchor Gate Check**:
  $$\theta_{\text{align}} = \arccos(\hat{v} \cdot \hat{t}_{\text{track}}) \times \frac{180^\circ}{\pi}$$
  - $\theta_{\text{align}} \le 30.0^\circ$ (**Smooth Magnetic Catch**): Track magnetic catch-funnels guide the craft seamlessly; trajectory is corrected to track tangent with green HUD telemetry lock.
  - $\theta_{\text{align}} > 30.0^\circ$ (**Violent Hull Bounce**): Severe momentum loss ($40\%$ instant speed drop), violent tumbling torque impulse, $20\%$ hull damage, and massive spark cascades.

### 3. Friction Capacitor & Induction Wall-Grinding
```
[ACUTE SCRAPING (<15°)] ──► [INDUCTION CHARGING] ──► [BURNOUT CATAPULT / RADIAL EMP]
```
- **Tungsten-Copper Contact Skids**: Scraping against electromagnetic track barriers at acute angles ($< 15^\circ$) incurs **zero speed penalty**. It channels kinetic energy directly into the Friction Capacitor ($0 \to 100\%$ charge in $\sim 2.2\,\text{s}$).
- **Capacitor Discharge Modes**:
  - *Thermal Burnout Catapult* (`[SHIFT]` / `[LB]`, $\ge 35\%$ charge): Discharges stored induction current into afterburners for an instant $+45\,\text{m/s}$ ($+162\,\text{km/h}$) catapult impulse.
  - *Radial EMP Shockwave* (`[X]` / `[RB]`, $\ge 60\%$ charge): Emits an expanding $25\,\text{m}$ electromagnetic pulse wave that disables adjacent rivals' magnetic flux clamping for $3\,\text{s}$ and deals direct shield disruption.

### 4. The "Cobra Air-Anchor" & 180° Decoupled Targeting
```
  [Velocity Vector: 1,000 km/h Forward] ════════════════════════════════►
                     │
     Dual Airbrakes Engaged 100% + Pitch-Up
                     ▼
  [Craft Hull Rotates 180° Backward] ──► [Fires Railgun at Pursuers] ──► [Snaps Forward]
```
- **Pugachev’s Air-Anchor**: Engaging $100\%$ dual airbrakes (`[Q]` + `[E]`) + violent pitch-up (`[S]` or Down Arrow) at $> 120\,\text{km/h}$ deploys all 16 kinetic surfaces simultaneously.
- **Decoupled Drift**: Forward linear momentum is preserved as the chassis decouples and rotates $180^\circ$ backward facing pursuers down the track for up to $1.8\,\text{s}$.
- **Rearward Retaliation**: Fire kinetic railgun slugs (`[K]`, Left Click, or `[SPACE]` during Cobra) directly into trailing opponents' cockpits, dealing $35\%$ damage and kinetic recoil before snapping forward.

### 5. Kinetic Component Jettison (Dynamic Weight Shedding)
- **Persistent Hull Damage**: High-G collisions bend and fracture aerodynamic canards, inducing persistent asymmetric steering bias ($\Delta \tau_{\text{steer}} \pm 0.22$) that forces the craft to pull continuously left or right.
- **Emergency Jettison** (`[J]` / `[Y]`): Detonates micro-explosive squibs along structural shear planes to discard damaged exterior fairings:
  - Sheds $18\%$ dry mass ($1,200\,\text{kg} \to 984\,\text{kg}$).
  - Drops aerodynamic drag coefficient $C_d$ from $0.32$ to $0.27$.
  - Boosts engine acceleration by $+22\%$.
  - Clears all asymmetric handling pull.
  - *Trade-off*: Maximum shield capacity is permanently capped at $75\%$.

---

## 🏎️ Factory Teams & Fleet Roster

The championship features five primary factory teams representing competing industrial design philosophies:

| Team | Name | Silhouette & Tech | Top Speed | Handling Focus |
| :--- | :--- | :--- | :--- | :--- |
| **AG-Systems** | AG SYSTEMS INTERCEPTOR | Neo-Tokyo swept-forward composite delta wing; razor-thin carbon-aramid profile; exposed copper field coils | $1,470\,\text{km/h}$ | **Acceleration Specialist**. Fast recovery out of hairpins, highly sensitive pitch control. |
| **FEISAR** | FEISAR FX-450 | Federal European needle-nosed tri-hull with twin articulated forward canards and electric-cyan striping | $1,420\,\text{km/h}$ | **Maximum Agility**. Instantaneous turn-in, precise airbrake response, high maneuverability. |
| **Auricom** | AURICOM VANGUARD | Pan-American lifting-body fuselage with enclosed cockpit canopy and twin vertical stabilizers | $1,500\,\text{km/h}$ | **Defensive Anchor**. Robust harmonic shielding ($1.1\times$), predictable drift curve, high cross-wind stability. |
| **Qirex** | QIREX-VOSTOK D-92 | Eurasian brutalist slab-hull in matte graphite and hazard orange; exposed titanium heat exchangers | $1,590\,\text{km/h}$ | **Top-End Brute**. Massive dry mass, monolithic titanium battering ram, supreme kinetic resistance. |
| **Pir-Hana** | PIR-HANA SCORPIO | Privateer Syndicate aggressive multi-segmented hull with predatory forward prongs and crimson emissive accents | $1,650\,\text{km/h}$ | **Hyper-Velocity Glass Cannon**. Uncapped boost speed, extreme oversteer tendency, high shield fragility. |

---

## 🏙️ Circuit Architecture: Neo-Shinjuku Rift (Sector 07)

Neo-Shinjuku Rift is a multi-tiered, elevated circuit suspended between kilometers-tall arcologies, commercial megatowers, and sub-surface industrial trenches spanning an elevation range from $+850\,\text{m}$ down to $-120\,\text{m}$:

```
    [START/FINISH: SHINJUKU GANTRY] (Elev. +850m)
                   │
                   ▼
     [ZONE A: KABUKICHO SKY-CHICANE] ─── S-bends through dense holo-billboard spires
                   │
                   ▼
     [ZONE B: THE MONOLITH DIVE] ─────── 70° vertical plunge down a skyscraper core (+780m -> +100m)
                   │
                   ▼
     [ZONE C: INDUSTRIAL CRYO-TRENCH] ── Sub-surface vacuum pipe (-120m below city datum)
                   │
                   ▼
     [ZONE D: MEGAPORT OVERPASS] ─────── 900m mag-lev atmospheric rift jump (6-DOF RCS mode)
                   │
                   ▼
           [LOOP & RETURN TO GANTRY]
```

- **Zone A: Kabukicho Sky-Chicane (+850m)**: Frosted photovoltaic composite illuminated by neon ground tracks; tight $90^\circ$ and $120^\circ$ apex turns requiring rapid airbrake flicking and counter-roll.
- **Zone B: The Monolith Dive (+780m to +100m)**: Superconducting induction ribbon wrapped around a hexagonal architectural super-spire; continuous 70-degree downward corkscrew accelerating past $1,000\,\text{km/h}$.
- **Zone C: The Industrial Cryo-Trench (-120m)**: Grated titanium mesh exposing massive coolant distribution pipes and pulsed steam exhaust vents with high ground effect compression and wall-grinding contact rails.
- **Zone D: Megaport Overpass (+600m to +850m)**: 900-meter physical track disconnect; ballistic drop where pilots enter 6-DOF RCS mode and must align their entry with the downstream magnetic catch gate ($\le 30^\circ$).

---

## ⚡ Technical Architecture Overview

### 1. 6-DOF Anti-Gravity Physics Engine (120Hz Fixed Sub-Stepping)
- **4-Corner PID Levitation Array**: Simulates 4 independent magnetohydrodynamic (MHD) repulsor probes at FL, FR, RL, and RR corners ($K_p = 110.0, K_i = 5.0, K_d = 24.0$) maintaining nominal ride height $h_{target} = 1.6\,\text{m}$.
- **128-bit SIMD Vectorized Suspension ODE**: Vectorized 4-probe spring-damper integration solving acceleration and velocity in parallel.
- **Magnetic Flux Rail Clamping**: Progressive non-linear clamping force preventing decoupling on vertical corkscrews and negative-G crests:
  $$F_{clamp} = k_{flux} \cdot \left(\frac{h_{target}}{h + \epsilon}\right)^2 \cdot \vec{n}_{track}$$
- **Kinetic Vector Airbrakes**: Dual independent airbrakes mapped to `[Q]` and `[E]` with mechanical flap deployment, triggering localized drag and aggressive yaw drift pivots.

### 2. Volumetric Wake Turbulence & Slipstream Drafting
- **Dynamic Slipstream Reduction**: Leading crafts project a low-pressure wake cone. Trailing ships evaluating forward ray probes with $\vec{u} \cdot \vec{v}_{craft} > 45\,\text{m/s}$ trigger:
  - $44\%$ drag coefficient reduction ($C_d$ drops from $0.32$ to $0.18$).
  - High-frequency $4.2\,\text{kHz}$ resonant turbine drafting whistle in Web Audio FM synthesis.
  - Pulsing diegetic HUD notification banner (`[ SLIPSTREAM LOCKED // Cd 0.18 // +44% EFFICIENCY ]`).

### 3. MRT Deferred Renderer & Post-Processing Graph
- **4-Target G-Buffer Layout**:
  - `Target 0`: Albedo (RGB) + Roughness (A)
  - `Target 1`: Octahedral Normal (RG) + Metallic (B) + AO (A)
  - `Target 2`: HDR Emissive (RGB) + Material ID (A)
  - `Target 3`: Screen-Space Velocity Vectors (RG)
  - `Depth`: 32-bit Floating-Point Depth buffer
- **Hi-Z Screen-Space Glossy Reflections (SSGI / SSR)**: 5-level conservative min-depth mip pyramid with GGX VNDF specular importance sampling.
- **Velocity Motion Blur**: 12-tap screen-space reconstruction filter sampling along velocity vectors.
- **Dual-Kawase Bloom Chain**: 4 downsample + 4 upsample stages with bilinear offsets for wide HDR plasma glow.
- **AgX Filmic Tonemapping**: Non-linear color transformation preserving high-chroma highlights without hue skewing.
- **Temporal Anti-Aliasing (TAA)**: Halton(2, 3) 8-phase sub-pixel camera jitter with YCoCg neighborhood clamping.

### 4. Client-Side Neural Trajectory Prediction Engine (WebNN / WebGPU / SIMD)
- **Compressed 48-Dimensional Observation Space**: Proximity raycasts, suspension probes, 3-axis linear & angular velocities, track spline delta, curvature lookaheads, and rival relative vectors.
- **Continuous 5-Channel Actuation Space**: Steering/Roll, Pitch Trim, Throttle, Left Airbrake, Right Airbrake.
- **Multi-Tier Execution Provider Architecture**: W3C WebNN API (`navigator.ml`), ONNX Runtime Web (`onnxruntime-web`), WebGPU Compute Shaders, and SIMD128 fallback running inference in $<0.35\,\text{ms}$.

---

## 🎮 Flight Controls Reference

| Action | Keyboard / Mouse | Gamepad (DualSense / Xbox) | Touch Controls |
| :--- | :--- | :--- | :--- |
| **Ion Throttle** | `W` or `↑` | `Right Trigger` / `Button A` | `THRUST` Button |
| **Reverse / Repulsor Brake** | `S` or `↓` | `Left Trigger` / `Button X` | — |
| **Lateral Steer & Roll** | `A` / `D` or `←` / `→` | `Left Analog Stick (X)` | `◄` / `►` Steer Buttons |
| **Pitch Nose Up / Down** | `W` / `S` | `Left Analog Stick (Y)` | — |
| **Left Vector Airbrake** | `Q` | `Left Bumper (LB / L1)` | `L-BRAKE` Button |
| **Right Vector Airbrake** | `E` | `Right Bumper (RB / R1)` | `R-BRAKE` Button |
| **Tri-Vector Power Bus** | `1` (BAL), `2` (THR), `3` (FLX), `4` (BAR) | `D-Pad` (Up: BAL, Right: THR, Down: FLX, Left: BAR) | UI Power Buttons |
| **Burnout Boost Catapult** | `SHIFT` (Left or Right) | `Left Bumper (LB)` (When Charged) | `BOOST` Button |
| **Radial EMP Shockwave** | `X` | `Right Bumper (RB)` (When Charged) | — |
| **Cobra Air-Anchor** | `Q` + `E` + `S` (Hold at $>120\,\text{km/h}$) | `LB` + `RB` + `Stick Down` | — |
| **Decoupled Kinetic Railgun** | `K` / Left Click / `SPACE` (in Cobra) | `Button X` / `Button B` (in Cobra) | — |
| **Component Jettison** | `J` | `Button Y` | — |
| **Hyper-Boost** | `SPACE` (When not in Cobra) | `Button B` | `BOOST` Button |
| **Cycle Camera Mode** | `C` or `V` | `D-Pad Down` | Header Cam Button |
| **Diegetic Terminal** | Click `[ TERMINAL ]` | — | Header Terminal Button |
| **Toggle Render Pipeline** | `F` | — | Header Pipeline Button |
| **Mute / Unmute Audio** | `M` | — | Header Audio Button |
| **Reset to Track** | `R` | `Select / Share` | — |
| **Settings / Hangar Menu** | `ESC` | `Start / Options` | Header Settings Button |

---

## 🛠️ Quick Start & Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Preview production build
npm run preview
```

---

## 📜 License & Credits

Built with Three.js, Vite, ONNX Runtime Web, and WebGPU. Inspired by Psygnosis / Studio Liverpool's *WipEout* series and the visual language of **The Designers Republic (tDR)**.
