# ⚡ Physics & Driving Mechanics
> **NEO RACING // WORLD TOUR**  
> **120Hz Arcade Physics Engine & Flight Dynamics**

The driving model in **NEO RACING — WORLD TOUR** runs at an internal fixed tick rate of **120Hz (8.33ms per step)**, completely decoupled from the variable rendering framerate. This guarantees deterministic race results, instantaneous input response, and zero micro-stutters during high-speed racing.

---

## 🧮 1. Frenet-Serret Spline Coordinate System
Tracks in NEO RACING are constructed using 3D cubic Hermite space splines. The vehicle's position along the circuit is tracked via a continuous normalized scalar coordinate `u ∈ [0.0, 1.0]`.

For every sub-step, the physics engine computes the orthonormal Frenet-Serret moving frame:
$$\mathbf{T} = \frac{d\mathbf{r}}{ds} \quad (\text{Tangent Vector})$$
$$\mathbf{N} = \frac{d\mathbf{T}/ds}{\|d\mathbf{T}/ds\|} \quad (\text{Principal Normal / Bank Vector})$$
$$\mathbf{B} = \mathbf{T} \times \mathbf{N} \quad (\text{Binormal Vector})$$

This allows the craft to align smoothly with 3D corkscrews, vertical loop dives, and 60-degree banked chicanes without relying on clunky raycasts.

---

## 🏎️ 2. Magnetic Apex Drifting
Holding `[LEFT SHIFT]` while initiating a high-speed turn disengages lateral repulsor friction, placing the craft into a controlled power slide.

### Scoring Formula:
$$\text{Score} = \text{Base Rate} \times \Delta t \times \left(\frac{v}{v_{\text{ref}}}\right) \times (1 + |\theta_{\text{yaw}}|)$$
- **Score Accumulation**: Points increase continuously as long as the slide angle is maintained between 15° and 65°.
- **Boost Regeneration**: Drifting transfers kinetic friction directly into the Nitro reservoir at up to **24% capacity per second**.
- **Multiplier Combos**: Chaining drifts into near-misses triggers `x2`, `x3`, and `x4` combo banners.

---

## 🚀 3. Hyper-Boost & Overdrive Window
The vehicle is equipped with dual-stage ion plasma propulsion:
1. **Tier 1 (Hyper-Boost)**: Increases top speed by +60 km/h and doubles acceleration.
2. **Tier 2 (Plasma Overdrive)**: Activated by pressing `[SPACE]` within the **60%–85% resonance sweet spot**.
   - Triggers chromatic aberration screen bloom, extreme FOV dilation (75° → 98°), camera shudder, and blue/magenta twin afterburner ribbons.
   - Pushes craft speed beyond **420–460 km/h**.

---

## 🛡️ 4. Aerodynamic Slipstream & Near-Miss Bonuses
- **Slipstream Drafting**: Driving within 25 meters directly behind an opponent craft reduces aerodynamic drag by 45%, providing an automatic acceleration boost to facilitate high-speed overtakes.
- **Traffic Near-Miss**: Threading within 2.8 meters of civilian hover vehicles grants an instant **+100 Points** bonus and **+15% Nitro charge**.

---

## 📷 5. 6-DOF Dynamic Camera System
The camera controller supports 6 distinct perspective modes (cycled using `[C]`):
1. **CHASE**: Third-person follow camera with smooth spring-damper tracking and centrifugal roll banking.
2. **HOOD**: Forward-mounted camera on the front cowling for heightened speed sensation.
3. **COCKPIT**: Internal double-bubble canopy view with functional holographic flight reticle.
4. **BUMPER**: Low-clearance ground level camera showcasing asphalt velocity.
5. **ACTION**: Dynamic offset camera highlighting vehicle drifts, barrel rolls, and stunts.
6. **BROADCAST DRONE**: Orbiting cinematic spectator drone.

### Centrifugal Camera Banking:
The camera dynamically tilts into high-G turns:
$$\phi_{\text{cam}} = -k_{\text{bank}} \times (\mathbf{v} \cdot \mathbf{B}) \times \left(\frac{v}{v_{\text{max}}}\right)$$
Providing natural, visceral feedback during intense high-speed maneuvers.
