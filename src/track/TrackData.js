import * as THREE from 'three';

// ============================================================================
// WIPEOUT: APHELION - TRACK SPLINE DEFINITIONS
// Complex 3D Ribbon trajectories with loops, vertical banks, and vacuum rifts
// ============================================================================

export const TRACK_CIRCUITS = {
  neoShinjuku: {
    id: 'neoShinjuku',
    name: 'NEO-SHINJUKU RIFT',
    subtitle: 'ORBITAL MEGACITY // SECTOR 07',
    lengthKm: 5.6,
    difficulty: 'CLASS-A',
    atmosphere: 'SUB-ORBITAL DENSE // ACID HAZE',
    colorTheme: {
      primary: '#00F0FF',
      rail: '#7928CA',
      ambient: '#090B10'
    },
    sectors: [
      { id: 'sector1', name: 'KABUKICHO SKY-CHICANE', zone: 'ZONE A: UPPER METROPOLIS', elevation: '+850m', range: [0.0, 0.25], pavement: 'Frosted photovoltaic composite' },
      { id: 'sector2', name: 'THE MONOLITH DIVE', zone: 'ZONE B: VERTICAL FALL (70°)', elevation: '+780m -> +100m', range: [0.25, 0.50], pavement: 'Superconducting induction ribbon' },
      { id: 'sector3', name: 'INDUSTRIAL CRYO-TRENCH', zone: 'ZONE C: LOWER SUB-CITY', elevation: '-120m', range: [0.50, 0.72], pavement: 'Grated titanium mesh with coolant conduits' },
      { id: 'sector4', name: 'MEGAPORT OVERPASS', zone: 'ZONE D: ATMOSPHERIC RIFT', elevation: '+600m -> +850m', range: [0.72, 1.0], pavement: '900m physical track disconnect (6-DOF)' }
    ],
    controlPoints: [
      new THREE.Vector3(0, 850, 0),         // START/FINISH: SHINJUKU GANTRY (Elev. +850m)
      new THREE.Vector3(180, 845, 260),     // ZONE A: Kabukicho Sky-Chicane approach
      new THREE.Vector3(420, 830, 480),     // Tight 90° S-bend through holo-billboard spires
      new THREE.Vector3(680, 810, 360),     // 120° apex turn; airbrake counter-roll
      new THREE.Vector3(820, 780, 150),     // Monolith Super-Spire architectural rim
      new THREE.Vector3(760, 520, -100),    // ZONE B: The Monolith Dive (70° continuous plunge)
      new THREE.Vector3(580, 260, -280),    // Flux clamping holding chassis to vertical plane (>1,000 km/h)
      new THREE.Vector3(340, 50, -420),     // Ground effect compression transition
      new THREE.Vector3(120, -120, -500),   // ZONE C: Industrial Cryo-Trench (-120m sub-surface datum)
      new THREE.Vector3(-180, -120, -460),  // Enclosed vacuum pipe with coolant distribution pipes
      new THREE.Vector3(-420, -120, -280),  // High-speed subterranean grinding corridor
      new THREE.Vector3(-600, 80, -60),     // Catapult launch ramp toward Megaport Overpass
      new THREE.Vector3(-680, 380, 160),    // ZONE D: Megaport Overpass (900m physical disconnect)
      new THREE.Vector3(-550, 680, 420),    // Sub-orbital ballistic drop (6-DOF RCS flight)
      new THREE.Vector3(-320, 820, 320),    // Magnetic catch-funnel & re-anchor gate pylon
      new THREE.Vector3(-120, 850, 140)     // High-speed final straight return to Shinjuku Gantry
    ],
    vacuumRiftRange: [0.72, 0.88], // Sector 4: 900m Atmospheric Rift
    boostPads: [0.03, 0.22, 0.48, 0.89],
    apexPoints: [0.16, 0.36, 0.62, 0.89]
  },

  tychoSuperconductor: {
    id: 'tychoSuperconductor',
    name: 'TYCHO SUPERCONDUCTOR',
    subtitle: 'LUNAR TERMINATOR // ZERO-G RIBBON',
    lengthKm: 6.2,
    difficulty: 'CLASS-EX',
    atmosphere: 'ORBITAL VACUUM',
    colorTheme: {
      primary: '#FF2A13',
      rail: '#7928CA',
      ambient: '#05070B'
    },
    controlPoints: [
      new THREE.Vector3(0, 40, 0),
      new THREE.Vector3(200, 50, 300),
      new THREE.Vector3(450, 90, 550),
      // Inverted Loop-The-Loop section
      new THREE.Vector3(700, 180, 600),
      new THREE.Vector3(820, 260, 450), // apex of inverted loop
      new THREE.Vector3(750, 150, 250),
      // Lunar crater trench run
      new THREE.Vector3(600, 30, 50),
      new THREE.Vector3(450, 15, -200),
      new THREE.Vector3(220, 60, -420),
      // High-G banked corkscrew
      new THREE.Vector3(-50, 130, -600),
      new THREE.Vector3(-350, 170, -520),
      new THREE.Vector3(-580, 120, -300),
      new THREE.Vector3(-620, 50, -50),
      new THREE.Vector3(-450, 30, 180),
      new THREE.Vector3(-200, 35, 120)
    ],
    vacuumRiftRange: [0.0, 1.0], // Full vacuum rift on the moon
    boostPads: [0.05, 0.31, 0.68, 0.91],
    apexPoints: [0.15, 0.42, 0.65, 0.85]
  },

  aphelionPrime: {
    id: 'aphelionPrime',
    name: 'APHELION PRIME',
    subtitle: 'ATMOSPHERIC RE-ENTRY RING // F-8000 PROVING GROUNDS',
    lengthKm: 5.4,
    difficulty: 'CLASS-S',
    atmosphere: 'HYPERSONIC IONOSPHERE',
    colorTheme: {
      primary: '#FFB800',
      rail: '#00F0FF',
      ambient: '#0A0812'
    },
    controlPoints: [
      new THREE.Vector3(0, 30, 0),
      new THREE.Vector3(150, 45, 320),
      new THREE.Vector3(400, 80, 600),
      new THREE.Vector3(700, 60, 680),
      // Supersonic Straight through Re-entry Ring
      new THREE.Vector3(980, 110, 480),
      new THREE.Vector3(1100, 160, 180),
      new THREE.Vector3(950, 130, -180),
      new THREE.Vector3(650, 75, -450),
      new THREE.Vector3(300, 35, -600),
      // Radical hairpin S-curves
      new THREE.Vector3(-80, 85, -620),
      new THREE.Vector3(-380, 140, -480),
      new THREE.Vector3(-550, 95, -220),
      new THREE.Vector3(-500, 45, 80),
      new THREE.Vector3(-300, 30, 220),
      new THREE.Vector3(-120, 25, 120)
    ],
    vacuumRiftRange: [0.38, 0.62],
    boostPads: [0.06, 0.28, 0.55, 0.79],
    apexPoints: [0.19, 0.45, 0.72, 0.89]
  }
};
