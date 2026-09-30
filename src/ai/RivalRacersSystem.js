import * as THREE from 'three';
import { FuturisticVehicle } from '../craft/FuturisticVehicle.js';

// ============================================================================
// 7 ORIGINAL RIVAL AI RACERS (GRID OF 8 TOTAL WITH PLAYER "RANJEET")
// Kane, Mira, Zero, Volt, Rex, Ayla, Nova
// Diverse Driving Styles: Aggressive, Technical, Speedster, Balanced, Defensive, Drift Specialist, Risk-Taker
// ============================================================================

export const RIVAL_ROSTER = [
  {
    id: 'kane',
    name: 'KANE',
    team: 'SYNDICATE RAM',
    vehicleId: 'v720',
    vehicleName: 'V-720 // PHANTOM',
    style: 'AGGRESSIVE',
    color: 0xFF1A1A,
    underglow: 0xFF0033,
    speedKmh: 405,
    accel: 1.05,
    aggro: 0.95,
    line: -3.5
  },
  {
    id: 'mira',
    name: 'MIRA',
    team: 'TOKYO KINETICS',
    vehicleId: 'k77',
    vehicleName: 'K-77 // QUANTUM',
    style: 'TECHNICAL',
    color: 0x00F0FF,
    underglow: 0x00F0FF,
    speedKmh: 400,
    accel: 0.98,
    aggro: 0.72,
    line: 3.0
  },
  {
    id: 'zero',
    name: 'ZERO',
    team: 'GHOST DIVISION',
    vehicleId: 'a11',
    vehicleName: 'A-11 // AETHER',
    style: 'SPEEDSTER',
    color: 0xF0F4F8,
    underglow: 0x00D4FF,
    speedKmh: 412,
    accel: 1.02,
    aggro: 0.88,
    line: 0.0
  },
  {
    id: 'volt',
    name: 'VOLT',
    team: 'LIGHTNING CORP',
    vehicleId: 'x900',
    vehicleName: 'X-900 // VELOCITY',
    style: 'BALANCED',
    color: 0xFFD700,
    underglow: 0xFFAA00,
    speedKmh: 395,
    accel: 1.08,
    aggro: 0.80,
    line: -2.0
  },
  {
    id: 'rex',
    name: 'REX',
    team: 'TITAN HEAVY',
    vehicleId: 'f8000',
    vehicleName: 'F-8000 // TITAN',
    style: 'DEFENSIVE',
    color: 0x333A44,
    underglow: 0xFF5500,
    speedKmh: 388,
    accel: 0.92,
    aggro: 0.90,
    line: 4.2
  },
  {
    id: 'ayla',
    name: 'AYLA',
    team: 'NEBULA DRIFT',
    vehicleId: 'r500',
    vehicleName: 'R-500 // RAZOR',
    style: 'DRIFT SPECIALIST',
    color: 0x9933FF,
    underglow: 0x7928CA,
    speedKmh: 396,
    accel: 0.96,
    aggro: 0.75,
    line: -2.8
  },
  {
    id: 'nova',
    name: 'NOVA',
    team: 'EMERALD SPEED',
    vehicleId: 'k77',
    vehicleName: 'K-77 // EMERALD',
    style: 'RISK-TAKER',
    color: 0x00FF66,
    underglow: 0x00FF88,
    speedKmh: 392,
    accel: 0.98,
    aggro: 0.84,
    line: 2.2
  }
];

export class RivalRacersSystem {
  constructor(scene, circuit) {
    this.scene = scene;
    this.circuit = circuit;
    this.rivals = [];

    this.spawnRivalGrid();
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

      // 1. Throttle / Acceleration & Braking into curves
      if (raceActive) {
        const curvature = frame.curvature || 0;
        let targetSpeed = r.baseSpeedKmh;

        if (curvature > 0.0035) {
          targetSpeed = r.baseSpeedKmh * (0.68 + (1.0 - r.spec.aggro) * 0.1);
          r.brakeInput = 0.5;
          r.driftActive = r.spec.style === 'DRIFT SPECIALIST' || Math.random() < 0.4;
        } else {
          r.brakeInput = 0.0;
          r.driftActive = false;
        }

        // Boost bursts on straights
        if (curvature < 0.002 && Math.random() < 0.012 && r.boostTimer <= 0) {
          r.boostTimer = 3.2;
        }

        if (r.boostTimer > 0) {
          r.boostTimer -= delta;
          targetSpeed = r.baseSpeedKmh * 1.16;
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

      // 3. Dynamic Racing Line, Apex Cut & Overtaking
      const turnDir = frame.tangent.clone().cross(lookFrame.tangent).dot(frame.normal);
      if (Math.abs(turnDir) > 0.05) {
        r.targetLane = turnDir > 0 ? -6.0 : 6.0;
      } else {
        r.targetLane = r.spec.line + Math.sin(r.u * 35.0 + idx) * 2.2;
      }

      r.lane = THREE.MathUtils.lerp(r.lane, r.targetLane, delta * 2.5);
      r.steerInput = (r.targetLane - r.lane) * 0.25;

      // 4. Update 3D World Transform along Road
      r.vehicle.group.position.copy(frame.pos)
        .addScaledVector(frame.binormal, r.lane)
        .addScaledVector(frame.normal, 0.7);

      const m = new THREE.Matrix4().makeBasis(frame.binormal, frame.normal, frame.tangent);
      r.vehicle.group.quaternion.setFromRotationMatrix(m);

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
      driftActive: false
    });
  }

  spawnTutorialGrid(racerIds = ['kane', 'mira', 'zero'], speedKmh = 220.0) {
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
        driftActive: false
      });
    });
  }
}
