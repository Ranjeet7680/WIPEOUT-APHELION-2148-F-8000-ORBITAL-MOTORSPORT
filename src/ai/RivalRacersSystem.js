import * as THREE from 'three';
import { NightriftVehicle } from '../craft/NightriftVehicle.js';

// ============================================================================
// 8 ORIGINAL RIVAL AI RACERS + "THE VECTOR" BOSS ENCOUNTER
// Kane, Mira, Volt, Rex, Ayla, Nova, Kira, Zero + V-99 Vector
// ============================================================================

export const RIVAL_ROSTER = [
  { id: 'zero', name: 'ZERO', team: 'GHOST DIVISION', color: 0xF0F4F8, underglow: 0x00F0FF, speedKmh: 410, accel: 1.0, aggro: 0.85, line: 0.0 },
  { id: 'kane', name: 'KANE', team: 'SYNDICATE RAM', color: 0xFF1A1A, underglow: 0xFF2A13, speedKmh: 395, accel: 0.95, aggro: 0.95, line: -4.0 },
  { id: 'mira', name: 'MIRA', team: 'TOKYO KINETICS', color: 0x00F0FF, underglow: 0x00F0FF, speedKmh: 400, accel: 0.92, aggro: 0.70, line: 3.5 },
  { id: 'volt', name: 'VOLT', team: 'LIGHTNING CORP', color: 0xFFD700, underglow: 0xFFAA00, speedKmh: 390, accel: 1.05, aggro: 0.80, line: -2.0 },
  { id: 'rex', name: 'REX', team: 'TITAN HEAVY', color: 0x333A44, underglow: 0xFF5500, speedKmh: 385, accel: 0.88, aggro: 0.90, line: 4.5 },
  { id: 'ayla', name: 'AYLA', team: 'NEBULA DRIFT', color: 0x9933FF, underglow: 0x7928CA, speedKmh: 392, accel: 0.94, aggro: 0.75, line: -3.0 },
  { id: 'nova', name: 'NOVA', team: 'EMERALD SPEED', color: 0x00FF66, underglow: 0x00FF88, speedKmh: 388, accel: 0.96, aggro: 0.82, line: 2.0 },
  { id: 'kira', name: 'KIRA', team: 'APEX RACING', color: 0xFF8800, underglow: 0xFFB800, speedKmh: 394, accel: 0.93, aggro: 0.78, line: -1.0 }
];

export const BOSS_RIVAL = {
  id: 'vector',
  name: 'THE VECTOR',
  vehicle: 'V-99 VECTOR',
  team: 'SHADOW PROTOTYPE',
  color: 0x0D0E12,
  underglow: 0xFF0033,
  speedKmh: 425,
  accel: 1.12,
  aggro: 1.0
};

export class RivalRacersSystem {
  constructor(scene, circuit) {
    this.scene = scene;
    this.circuit = circuit;
    this.rivals = [];

    this.spawnRivalGrid();
  }

  spawnRivalGrid() {
    RIVAL_ROSTER.forEach((spec, idx) => {
      const vehicle = new NightriftVehicle(this.scene, false, spec.color);
      vehicle.setCustomColors(spec.color, spec.underglow);

      // Grid placement (slots 2 through 9 behind player slot 1)
      const gridSlot = idx + 1;
      const initialU = (1.0 - gridSlot * 0.012) % 1.0;
      const initialLane = (gridSlot % 2 === 0 ? 1 : -1) * (3.0 + (gridSlot * 0.8));

      this.rivals.push({
        spec,
        vehicle,
        gridSlot,
        u: initialU,
        lane: initialLane,
        targetLane: initialLane,
        speedKmh: 0.0, // Start from rest on grid
        baseSpeedKmh: spec.speedKmh,
        currentLap: 1,
        totalDistance: gridSlot * -40.0,
        boostTimer: 0.0,
        steerInput: 0.0,
        throttleInput: 1.0,
        brakeInput: 0.0,
        driftActive: false
      });
    });
  }

  update(delta, playerPos, playerU, playerTotalDist, raceActive = false) {
    this.rivals.forEach((r, idx) => {
      const currentIdx = Math.floor(r.u * this.circuit.segments);
      const frame = this.circuit.samples[currentIdx] || this.circuit.samples[0];
      const lookAheadIdx = (currentIdx + 20) % this.circuit.segments;
      const lookFrame = this.circuit.samples[lookAheadIdx] || frame;

      // 1. Acceleration / Throttle
      if (raceActive) {
        // Curve detection: slow down slightly on high curvature
        const curvature = frame.curvature || 0;
        let targetSpeed = r.baseSpeedKmh;

        if (curvature > 0.004) {
          targetSpeed = r.baseSpeedKmh * (0.65 + (1.0 - r.spec.aggro) * 0.1);
          r.brakeInput = 0.6;
        } else {
          r.brakeInput = 0.0;
        }

        // Boost logic (Occasional bursts on straights)
        if (curvature < 0.002 && Math.random() < 0.008 && r.boostTimer <= 0) {
          r.boostTimer = 3.5;
        }

        if (r.boostTimer > 0) {
          r.boostTimer -= delta;
          targetSpeed = r.baseSpeedKmh * 1.18;
        }

        r.speedKmh = THREE.MathUtils.lerp(r.speedKmh, targetSpeed, delta * 3.5 * r.spec.accel);
      } else {
        r.speedKmh = 0.0;
      }

      // 2. Track Progression
      const speedMs = r.speedKmh / 3.6;
      const trackLength = 5400.0;
      const deltaU = (speedMs * delta) / trackLength;

      const prevU = r.u;
      r.u = (r.u + deltaU) % 1.0;
      r.totalDistance += speedMs * delta;

      if (r.u < prevU) {
        r.currentLap++;
      }

      // 3. Dynamic Racing Line & Overtake Weaving
      const turnDir = frame.tangent.clone().cross(lookFrame.tangent).dot(frame.normal);
      if (Math.abs(turnDir) > 0.05) {
        // Cut apex of turn
        r.targetLane = turnDir > 0 ? -6.0 : 6.0;
      } else {
        // Straight line with slight lane variation
        r.targetLane = r.spec.line + Math.sin(r.u * 40.0 + idx) * 2.0;
      }

      r.lane = THREE.MathUtils.lerp(r.lane, r.targetLane, delta * 2.5);
      r.steerInput = (r.targetLane - r.lane) * 0.25;

      // 4. Update 3D World Transform along Road
      r.vehicle.group.position.copy(frame.pos)
        .addScaledVector(frame.binormal, r.lane)
        .addScaledVector(frame.normal, 0.7);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      r.vehicle.group.quaternion.setFromRotationMatrix(m);

      // 5. Update vehicle animations
      r.vehicle.updateKineticState(
        delta,
        r.steerInput,
        r.throttleInput,
        r.brakeInput,
        r.driftActive,
        r.boostTimer > 0,
        r.speedKmh
      );
    });
  }

  getStandings(playerTotalDist, playerName = 'YOU') {
    const all = [
      { name: playerName, team: 'F-8000 // NIGHTRIFT', dist: playerTotalDist, isPlayer: true, color: '#00F0FF' },
      ...this.rivals.map(r => ({
        name: r.spec.name,
        team: r.spec.team,
        dist: r.totalDistance,
        isPlayer: false,
        color: `#${r.spec.color.toString(16).padStart(6, '0')}`
      }))
    ];

    all.sort((a, b) => b.dist - a.dist);
    return all;
  }
}
