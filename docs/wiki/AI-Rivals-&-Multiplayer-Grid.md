# 🤖 AI Rivals & Multiplayer Grid
> **NEO RACING // WORLD TOUR**  
> **Competitive Grid Architecture & Telemetry Synchronization**

The competitive starting grid in NEO RACING consists of 8 pilots: the player (`RANJEET`) and 7 AI rivals, each governed by distinct behavioral models, driving personalities, and aggression thresholds.

---

## 👥 The 8-Pilot Grid Lineup

| Pos | Pilot Name | Craft Specification | Racing Style & Behavioral Traits |
| :---: | :--- | :--- | :--- |
| **01** | **RANJEET (YOU)** | `F-8000 NIGHTRIFT` / `NXR-01` | Player-controlled pilot. Adaptive vector drift and tactical boost. |
| **02** | **RYUKI** | `V-720 PHANTOM` | Hyper-aggressive speed demon. Dominates straightaways and defends apex lines. |
| **03** | **KAITO** | `X-900 VELOCITY` | Tactical blocker. Uses wide defensive cornering and slipstream cutoffs. |
| **04** | **HARUTO** | `K-77 QUANTUM` | Apex precision specialist. Carves optimal racing lines with minimum drift penalty. |
| **05** | **SORA** | `R-500 RAZOR` | Drift artist. Takes extreme slide angles and builds continuous boost chains. |
| **06** | **TANAKA** | `WL-04 APEX RALLY` | High stability and collision resistance. Unshaken by barrier contact. |
| **07** | **MIKA** | `A-11 AETHER` | Late-race surge specialist. Conserves boost reserves for a blistering final lap. |
| **08** | **KENJI** | `TERRA-X BEAST` | Heavy enforcer. Forces opponents off-line during contested corners. |

---

## 🏎️ AI Racing Logic & Collision Avoidance

1. **Target Spline Projection**: AI pilots calculate continuous ideal racing lines along the circuit spline with natural variations based on pilot temperament.
2. **Dynamic Overtake Logic**: When an opponent is detected ahead, the AI tests lateral offset clearances and initiates slipstream drafting before slingshotting past.
3. **Rubber-Banding & Elastic Balancing**: AI aggression scales smoothly depending on sector difficulty and player rank to ensure nail-biting, photo-finish conclusions.
4. **Collision Kinematics**: Craft-to-craft impacts calculate mutual impulse vectors and trigger procedural sparks, camera shake, and temporary momentum loss.

---

## 👻 Holographic Ghost Telemetry Replay

For Time-Attack and competitive qualification:
- Real-time pilot spline keyframes are compressed into lightweight delta buffers containing position `(x, y, z)`, quaternion orientation `(x, y, z, w)`, velocity, and lap timestamp.
- The holographic ghost vehicle renders as a translucent glowing wireframe craft on track.
- The HUD displays real-time delta markers:
  - Cyan `[-0.42s]`: Player is leading the world record ghost.
  - Magenta `[+0.28s]`: Player is trailing the world record ghost.

---

## 🌐 Edge Relay Cloud Leaderboards
- High-score lap submissions are cryptographically validated by the serverless API (`/api/leaderboard`).
- Impossible times (< 24s on 5.4km circuit) are rejected by anti-cheat heuristics.
- Global records synchronize across Edge Relay nodes (Tokyo, Singapore, Frankfurt, San Francisco) with under 20ms response latency.
