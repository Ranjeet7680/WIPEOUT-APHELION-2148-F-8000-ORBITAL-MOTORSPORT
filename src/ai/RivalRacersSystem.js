import * as THREE from 'three';
import { FuturisticVehicle } from '../craft/FuturisticVehicle.js';

// ============================================================================
// 7 ORIGINAL RIVAL AI RACERS (GRID OF 8 TOTAL WITH PLAYER "RANJEET")
// Kane, Mira, Zero, Volt, Rex, Ayla, Nova
// Diverse Driving Styles: Aggressive, Technical, Speedster, Balanced, Defensive, Drift Specialist, Risk-Taker
// ============================================================================

const _rivalMat = new THREE.Matrix4();
const _scratchTan1 = new THREE.Vector3();

export const RIVAL_ROSTER = [
  {
    id: 'ryuki',
    name: 'RYUKI',
    team: 'APEX SYNDICATE',
    vehicleId: 'v720',
    vehicleName: 'V-720 // PHANTOM',
    style: 'AGGRESSIVE',
    color: 0xFF1A1A,
    underglow: 0xFF0033,
    speedKmh: 410,
    accel: 1.06,
    aggro: 0.95,
    line: -3.5
  },
  {
    id: 'kaito',
    name: 'KAITO',
    team: 'TOKYO DRIFT',
    vehicleId: 'k77',
    vehicleName: 'K-77 // QUANTUM',
    style: 'DRIFT SPECIALIST',
    color: 0xFF007F,
    underglow: 0xFF007F,
    speedKmh: 405,
    accel: 1.02,
    aggro: 0.88,
    line: 3.0
  },
  {
    id: 'haruto',
    name: 'HARUTO',
    team: 'GHOST SPEED',
    vehicleId: 'a11',
    vehicleName: 'A-11 // AETHER',
    style: 'SPEEDSTER',
    color: 0xF0F4F8,
    underglow: 0x00D4FF,
    speedKmh: 408,
    accel: 1.04,
    aggro: 0.82,
    line: 0.0
  },
  {
    id: 'sora',
    name: 'SORA',
    team: 'LIGHTNING KINETICS',
    vehicleId: 'x900',
    vehicleName: 'X-900 // VELOCITY',
    style: 'BALANCED',
    color: 0xFFD700,
    underglow: 0xFFAA00,
    speedKmh: 398,
    accel: 1.05,
    aggro: 0.78,
    line: -2.0
  },
  {
    id: 'tanaka',
    name: 'TANAKA',
    team: 'TITAN MOTORSPORT',
    vehicleId: 'f8000',
    vehicleName: 'F-8000 // TITAN',
    style: 'DEFENSIVE',
    color: 0x333A44,
    underglow: 0xFF5500,
    speedKmh: 392,
    accel: 0.94,
    aggro: 0.92,
    line: 4.2
  },
  {
    id: 'mika',
    name: 'MIKA',
    team: 'NEBULA RACING',
    vehicleId: 'r500',
    vehicleName: 'R-500 // RAZOR',
    style: 'TECHNICAL',
    color: 0x9933FF,
    underglow: 0x7928CA,
    speedKmh: 396,
    accel: 0.97,
    aggro: 0.74,
    line: -2.8
  },
  {
    id: 'kenji',
    name: 'KENJI',
    team: 'EMERALD CORPS',
    vehicleId: 'k77',
    vehicleName: 'K-77 // EMERALD',
    style: 'RISK-TAKER',
    color: 0x00FF66,
    underglow: 0x00FF88,
    speedKmh: 394,
    accel: 0.99,
    aggro: 0.85,
    line: 2.2
  }
];

export class RivalRacersSystem {
  constructor(scene, circuit) {
    this.scene = scene;
    this.circuit = circuit;
    this.rivals = [];
    this.difficulty = 'NORMAL';

    this.spawnRivalGrid();
  }

  setCircuit(circuit) {
    this.circuit = circuit;
    this.spawnRivalGrid();
  }

  setDifficulty(level = 'NORMAL') {
    this.difficulty = level;
    let multiplier = 1.0;
    if (level === 'EASY') multiplier = 0.90;
    else if (level === 'HARD') multiplier = 1.06;

    this.rivals.forEach(r => {
      r.baseSpeedKmh = r.spec.speedKmh * multiplier;
    });
  }

  spawnRivalGrid() {
    // Clean up previous vehicles if any
    this.rivals.forEach(r => {
      if (r.vehicle && r.vehicle.group) {
        this.scene.remove(r.vehicle.group);
      }
    });
    this.rivals = [];

    RIVAL_ROSTER.forEach((spec, idx) => {
      const vehicle = new FuturisticVehicle(this.scene, false, spec.vehicleId);
      vehicle.setCustomLivery(spec.color, spec.underglow, spec.underglow, 'aero', 'wing');

      // Grid placement (slots 2 through 8 behind player slot 1)
      const gridSlot = idx + 2;
      const initialU = (1.0 - gridSlot * 0.011) % 1.0;
      const initialLane = (gridSlot % 2 === 0 ? 1 : -1) * (3.0 + (gridSlot * 0.75));

      // Initialize 3D world transform on starting grid slot
      const currentIdx = Math.floor(initialU * this.circuit.segments);
      const frame = (this.circuit.samples && this.circuit.samples[currentIdx]) || (this.circuit.getFrameAt ? this.circuit.getFrameAt(initialU) : null);
      if (frame) {
        _rivalMat.makeBasis(frame.binormal, frame.normal, frame.tangent);
        vehicle.group.quaternion.setFromRotationMatrix(_rivalMat);
        vehicle.group.position.copy(frame.pos)
          .addScaledVector(frame.binormal, initialLane)
          .addScaledVector(frame.normal, 0.45);
        if (vehicle.updateKineticState) {
          vehicle.updateKineticState(0.016, 0, 0, 0, false, false, 0);
        }
      }

      this.rivals.push({
        spec,
        vehicle,
        gridSlot,
        u: initialU,
        lane: initialLane,
        targetLane: initialLane,
        speedKmh: 0.0,
        baseSpeedKmh: spec.speedKmh,
        currentLap: 1,
        totalDistance: gridSlot * -35.0,
        boostTimer: 0.0,
        steerInput: 0.0,
        throttleInput: 1.0,
        brakeInput: 0.0,
        driftActive: false,
        isFinished: false
      });
    });
  }

  update(delta, playerPos, playerU, playerTotalDist, raceActive = false) {
    this.rivals.forEach((r, idx) => {
      const currentIdx = Math.floor(r.u * this.circuit.segments);
      const frame = this.circuit.samples[currentIdx] || this.circuit.samples[0];
      const lookAheadIdx = (currentIdx + 20) % this.circuit.segments;
      const lookFrame = this.circuit.samples[lookAheadIdx] || frame;

      // 1. Throttle / Acceleration & Braking into curves with corner anticipation
      if (raceActive) {
        let targetSpeed = r.baseSpeedKmh;

        if (r.isFinished) {
          // Finished rivals cruise smoothly down track
          targetSpeed = r.baseSpeedKmh * 0.65;
          r.brakeInput = 0.0;
          r.driftActive = false;
          r.boostTimer = 0.0;
        } else {
          const currentCurv = frame.curvature || 0;
          const upcomingCurv = lookFrame.curvature || 0;

          // Corner anticipation: start braking before entering sharp corners
          if (upcomingCurv > 0.0035 || currentCurv > 0.0035) {
            targetSpeed = r.baseSpeedKmh * (0.68 + (1.0 - r.spec.aggro) * 0.1);
            r.brakeInput = 0.45;
            r.driftActive = r.spec.style === 'DRIFT SPECIALIST' || (currentCurv > 0.004 && Math.random() < 0.4);
          } else {
            // Accelerate out of corners onto straightaways
            r.brakeInput = 0.0;
            r.driftActive = false;
          }

          // Tactical nitro boost on high-speed straightaways
          if (currentCurv < 0.0018 && upcomingCurv < 0.0018 && Math.random() < 0.015 && r.boostTimer <= 0) {
            r.boostTimer = 2.8 + r.spec.aggro * 0.8;
          }

          if (r.boostTimer > 0) {
            r.boostTimer -= delta;
            targetSpeed = r.baseSpeedKmh * 1.15;
          }

          if (playerTotalDist !== undefined) {
            const distGap = playerTotalDist - r.totalDistance;
            if (distGap > 800) {
              targetSpeed *= (1.0 + Math.min(0.12, distGap / 20000));
            } else if (distGap < -500) {
              targetSpeed *= Math.max(0.88, 1.0 - (r.totalDistance - playerTotalDist) / 25000);
            }
          }
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

      if (r.currentLap > 3) {
        r.currentLap = 3;
        r.isFinished = true;
      }

      // 3. Dynamic Racing Line, Apex Cut & Overtaking
      _scratchTan1.copy(frame.tangent).cross(lookFrame.tangent);
      const turnDir = _scratchTan1.dot(frame.normal);
      if (Math.abs(turnDir) > 0.05) {
        // Cut towards apex inside line
        r.targetLane = turnDir > 0 ? -5.5 : 5.5;
      } else {
        // Natural lane positioning with driver archetype personality
        r.targetLane = r.spec.line + Math.sin(r.u * 35.0 + idx) * 2.0;
      }

      // Defensive line blocking: defensive racers guard inside line when contested
      if (r.spec.style === 'DEFENSIVE' && playerTotalDist !== undefined) {
        const gapToPlayer = playerTotalDist - r.totalDistance;
        if (gapToPlayer > -12.0 && gapToPlayer < 4.0) {
          r.targetLane = THREE.MathUtils.clamp(r.targetLane, -2.5, 2.5);
        }
      }

      r.lane = THREE.MathUtils.lerp(r.lane, r.targetLane, delta * 2.5);
      r.steerInput = (r.targetLane - r.lane) * 0.25;

      // 4. Update 3D World Transform along Road
      r.vehicle.group.position.copy(frame.pos)
        .addScaledVector(frame.binormal, r.lane)
        .addScaledVector(frame.normal, 0.7);

      _rivalMat.makeBasis(frame.binormal, frame.normal, frame.tangent);
      r.vehicle.group.quaternion.setFromRotationMatrix(_rivalMat);

      // 5. Update vehicle kinetics
      r.vehicle.updateKineticState(
        delta,
        r.steerInput,
        r.throttleInput,
        r.brakeInput,
        r.driftActive,
        r.boostTimer > 0,
        r.speedKmh
      );

      // 6. Rivals avoid each other
      this.rivals.forEach((otherRival, otherIdx) => {
        if (idx !== otherIdx && !otherRival.isFinished) {
          if (Math.abs(r.u - otherRival.u) < 0.01) {
            const latDist = r.lane - otherRival.lane;
            if (Math.abs(latDist) < 8.0) {
              r.targetLane += latDist > 0 ? 2.0 : -2.0;
            }
          }
        }
      });
    });
  }

  getStandings(playerTotalDist, playerName = 'RANJEET') {
    const all = [
      { name: playerName, team: 'F-8000 // NIGHTRIFT', dist: playerTotalDist, isPlayer: true, color: '#00F0FF' },
      ...this.rivals.map(r => ({
        name: r.spec.name,
        team: r.spec.vehicleName,
        dist: r.totalDistance,
        isPlayer: false,
        color: `#${r.spec.color.toString(16).padStart(6, '0')}`,
        vehicle: r.vehicle,
        spec: r.spec
      }))
    ];

    all.sort((a, b) => b.dist - a.dist);
    return all;
  }

  despawnAll() {
    this.rivals.forEach(r => {
      if (r.vehicle && r.vehicle.group) {
        this.scene.remove(r.vehicle.group);
      }
    });
    this.rivals = [];
  }

  spawnSingleRival(id = 'kane', targetU = 0.05, speedKmh = 160.0) {
    this.despawnAll();
    const spec = RIVAL_ROSTER.find(r => r.id === id) || RIVAL_ROSTER[0];
    const vehicle = new FuturisticVehicle(this.scene, false, spec.vehicleId);
    vehicle.setCustomLivery(spec.color, spec.underglow, spec.underglow, 'aero', 'wing');

    this.rivals.push({
      spec,
      name: spec.name,
      vehicle,
      gridSlot: 2,
      u: targetU % 1.0,
      lane: 0.0,
      targetLane: 0.0,
      speedKmh: speedKmh,
      baseSpeedKmh: speedKmh,
      currentLap: 1,
      totalDistance: targetU * 5400.0,
      boostTimer: 0.0,
      steerInput: 0.0,
      throttleInput: 1.0,
      brakeInput: 0.0,
      driftActive: false,
      isFinished: false
    });
  }

  spawnTutorialGrid(racerIds = ['ryuki', 'kaito', 'haruto'], speedKmh = 220.0) {
    this.despawnAll();
    racerIds.forEach((id, idx) => {
      const spec = RIVAL_ROSTER.find(r => r.id === id) || RIVAL_ROSTER[idx];
      const vehicle = new FuturisticVehicle(this.scene, false, spec.vehicleId);
      vehicle.setCustomLivery(spec.color, spec.underglow, spec.underglow, 'aero', 'wing');

      const gridSlot = idx + 2;
      const initialU = (1.0 - gridSlot * 0.012) % 1.0;
      const initialLane = (gridSlot % 2 === 0 ? 1 : -1) * 3.5;

      this.rivals.push({
        spec,
        name: spec.name,
        vehicle,
        gridSlot,
        u: initialU,
        lane: initialLane,
        targetLane: initialLane,
        speedKmh: 0.0,
        baseSpeedKmh: speedKmh,
        currentLap: 1,
        totalDistance: gridSlot * -35.0,
        boostTimer: 0.0,
        steerInput: 0.0,
        throttleInput: 1.0,
        brakeInput: 0.0,
        driftActive: false,
        isFinished: false
      });
    });
  }
}
