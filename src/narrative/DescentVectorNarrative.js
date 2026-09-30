// ============================================================================
// WIPEOUT: APHELION - NARRATIVE ENGINE: "DESCENT VECTOR" (2148)
// The Aphelion Accord, Pierre Belmondo's Legacy, Diegetic Spatial Terminals,
// Encrypted Telemetry Intercepts, Neuro-Link Comms, and Planetary Defense Lore
// ============================================================================

export const LORE_COALITIONS = {
  FOUNDING: [
    {
      id: 'feisar',
      name: 'FEISAR-Orbital',
      origin: 'European Consortium // Brussels-Toulouse Apex Hub',
      doctrine: 'Public Trust & Orbital Corridor Governance',
      motto: 'EQUITAS VIA AETHERA (Justice through the Ether)',
      description: 'The political cornerstone of the post-F9000 restructuring. Builds ultra-maneuverable craft featuring multi-slotted front canards and harmonic stability stabilizers. Races to maintain civilian public oversight over orbital drop spires and Earth-Moon transit lanes.',
      chassisSpecs: 'Carbon-Titanium Monocoque // 12-Slot Aerodynamic Canards // High Grip Repulsor Matrix',
      keyPersonnel: 'Commissioner Hélène Laurent, Chief Test Pilot Teresa Silva'
    },
    {
      id: 'agSys',
      name: 'AG Systems Neo-Tokyo',
      origin: 'Kanto Megacity // Belmondo Memorial Laboratory',
      doctrine: 'Pure Flight Kinetics & Anti-Gravity Telemetry',
      motto: 'ASCENT WITHOUT MASS',
      description: 'The ancestral scientific home of Dr. Pierre Belmondo’s 2035 breakthrough. Prioritizes pure flight kinetics over brute defensive bulk. Fields needle-nosed, ultra-light carbon chassis with unmatched thrust-to-weight ratios and vector airbrake response.',
      chassisSpecs: 'Lifting-Body Carbon Aramid // Dual Vectoring Ion Gimbal // High-Efficiency Cryo Repulsors',
      keyPersonnel: 'Chief Aerodynamicist Jin Kazama, Lead Pilot Akira Thorne'
    },
    {
      id: 'auricom',
      name: 'Auricom Vanguard',
      origin: 'North American Trade Accord // New Detroit Spire',
      doctrine: 'Humanitarian Integrity & Harmonic Energy Shielding',
      motto: 'INTEGRITY UNDER PRESSURE',
      description: 'Founded by disciples of Belmondo’s humanitarian transit movement. Acting as the self-appointed integrity police of the F-8000 grid, Auricom craft carry heavy multi-layered harmonic energy shields and dense kinetic absorbers to counteract syndicate aggression.',
      chassisSpecs: 'Reinforced Titanium Frame // Dual-Lobe Harmonic Deflector // High-Yield Kinetic Dampeners',
      keyPersonnel: 'Director Sarah Vance, Senior Flight Marshal Connor Brody'
    }
  ],
  SYNDICATE: [
    {
      id: 'tigron',
      name: 'Tigron-Mirza Consortium',
      origin: 'Deregulated Equatorial Platforms // Malacca Orbital Launch Ring',
      doctrine: 'Volatile War-Tech & Sub-Plasma Acceleration',
      motto: 'MAXIMUM TERMINAL FORCE',
      description: 'A sovereign private military contractor (PMC) testing bleeding-edge combat avionics in front of two billion live-feed subscribers. Notorious for fielding unstable sub-plasma accelerators and bypassing league safety limits on gravitational g-force tolerances.',
      chassisSpecs: 'Tungsten-Carbide Wedge // High-Pressure Sub-Plasma Emitter // Overclocked MHD Coils',
      keyPersonnel: 'Warlord-Executive Tariq Mirza, Enforcer Pilot Nyx Vance'
    },
    {
      id: 'qirex',
      name: 'Qirex-Vostok Dynamics',
      origin: 'Eurasian Industrial Complex // Magnitogorsk Sub-Orbital Forge',
      doctrine: 'Monolithic Heavy Armor & Track Bullying',
      motto: 'FORCE RESOLVES ALL VECTORS',
      description: 'An industrial defense titan converting heavy military airframes into racing machines. Their monolithic, angular titanium battering rams dominate tracks through physical intimidation, extreme top-end velocity, and explosive magnetic flux retention.',
      chassisSpecs: 'Depleted Titanium Battering Ram // Quad-Array Heavy Induction Plugs // Impact Deflection Vanes',
      keyPersonnel: 'General-Director Vladimir Chernov, Pilot Ivan Morozov'
    },
    {
      id: 'pirHana',
      name: 'Piranha-Scorpio Cartel',
      origin: 'Deep Oceanic Orbital Platform // Belém-Luna Hydro-Corridor',
      doctrine: 'Orbital Cartel Hegemony & Hyper-Velocity Infiltration',
      motto: 'TERMINAL HORIZON',
      description: 'An enigmatic conglomerate operating with black-market telemetry encryption. Their obsidian needle craft achieve unprecedented straight-line speeds exceeding 1,600 km/h, utilizing banned hyper-boost capacitor cascades to shatter sector records.',
      chassisSpecs: 'Obsidian Nano-Composite // Dual High-Torque Plasma Cannons // Illegal Boost Cascades',
      keyPersonnel: 'Unknown Handler [RED_ACTED], Syndicate Pilot Hector Ramos'
    }
  ],
  PRIVATEER: [
    {
      id: 'caliburn',
      name: 'Caliburn Flightworks',
      origin: 'Subterranean Workshop // Neo-Shinjuku Maintenance Rift 04',
      doctrine: 'Scrappy Privateer Aerodynamics & Decommissioned Military Avionics',
      motto: 'CARVE THE LINE',
      description: 'A shoestring privateer squad founded by decommissioned orbital shuttle engineers and former test pilots. Flying an extensively customized prototype airframe pieced together from surplus military interceptor hulls, Caliburn relies on pilot finesse, raw reflex, and stolen telemetry decoders.',
      chassisSpecs: 'Hybrid Carbon-Aramid Monocoque // Hand-Tuned Vector Bleeders // Stolen Military Telemetry Bus',
      keyPersonnel: 'Crew Chief Marcus Kane, Protagonist Pilot Kaelen Voss'
    }
  ]
};

// ----------------------------------------------------------------------------
// CAMPAIGN DOSSIERS & DIEGETIC INTERCEPTS: "DESCENT VECTOR"
// ----------------------------------------------------------------------------
export const NARRATIVE_ACTS = [
  {
    act: 1,
    title: 'ACT I: SUBTERRANEAN DRIFT // NEO-SHINJUKU',
    circuit: 'Neo-Shinjuku Rift',
    sector: 'Sector 07 // Sub-Surface Maintenance Tube',
    briefing: 'Welcome to the grid, Voss. Caliburn Flightworks is one race away from total asset foreclosure. Qualify in the top 3 through Neo-Shinjuku’s high-G chicanes to secure our league license. Keep your neuro-link frequency open—our scanners are picking up abnormal military telemetry relays hardwired into the track’s magnetic induction pylons.',
    intercepts: [
      {
        id: 'INT-01-A',
        sender: 'TIGRON_MIRZA // INTERNAL ENCRYPTED (AES-512)',
        receiver: 'PMC CELL ALPHA',
        timestamp: '2148.09.12 // 02:44:11 UTC',
        classification: 'RESTRICTED // WAR-TECH TESTING',
        subject: 'Pylon 42 Relay Calibration',
        body: 'The F-8000 race in Sector 07 is proceeding on schedule. Ensure the high-altitude drop chicane receives the firmware patch. Each craft passing through the apex at Mach 1 generates the doppler radar signature required to calibrate the orbital interceptor grid. Civilians must believe it is standard race telemetry.',
        unlocked: true
      },
      {
        id: 'INT-01-B',
        sender: 'MARCUS KANE // CALIBURN CHIEF ENGINEER',
        receiver: 'KAELEN VOSS // COCKPIT MFD',
        timestamp: '2148.09.12 // 03:01:05 UTC',
        classification: 'TEAM RADIO // DIRECT FEED',
        subject: 'Airbrake Flutter & Throttle Warning',
        body: 'Voss, I saw your test run telemetry. You’re hitting the vector airbrakes at 1,100 km/h. At that speed, air resistance restricts flap deflection to 26 degrees to prevent structural shear. Trust the split bleeders—they shed the boundary layer turbulence so you can pivot without tearing the carbon wings off. Bring the bird home in one piece.',
        unlocked: true
      }
    ],
    commsFeed: [
      { speaker: 'KANE', text: 'Green lights across all 4 repulsor coils. Slingshot launch in 3... 2... 1...', audioTone: 'LOW_CHIRP' },
      { speaker: 'VOSS', text: 'Gantry clamps disengaged. MHD ignition verified. Vectoring into turn 1.', audioTone: 'RADIO_CLICK' },
      { speaker: 'KANE', text: 'Careful on that negative-G crest, Voss! Magnetic flux clamping will pull 12 Gs!', audioTone: 'URGENT_BEEP' }
    ]
  },
  {
    act: 2,
    title: 'ACT II: THE SUPERCONDUCTOR ELEVATOR // TYCHO BASIN',
    circuit: 'Tycho Superconductor',
    sector: 'Lunar South Pole // High-G Vacuum Rift',
    briefing: 'We’re racing on lunar superconducting rails suspended 300 meters above Tycho Crater. In the vacuum rift, aerodynamic drag plummets to near zero and airbrakes switch to pure kinetic vector thrusters. Tigron-Mirza and Qirex are deploying military-grade kinetic disruption shielding. We need to download the pylon packet data while staying in their slipstream.',
    intercepts: [
      {
        id: 'INT-02-A',
        sender: 'QIREX-VOSTOK DYNAMICS // COMMAND STATION MAGNITOGORSK',
        receiver: 'PILOT MOROZOV // CRAFT OVERLORD-01',
        timestamp: '2148.09.18 // 14:18:22 UTC',
        classification: 'TACTICAL DIRECTIVE',
        subject: 'Interception Protocol: Target Caliburn',
        body: 'Caliburn’s pilot, Voss, has fitted a modified wide-band telemetry interceptor to their chassis nose. Do not permit them to hold your wake for more than three consecutive seconds. Pin them against the outer mag-rail in the zero-G inverted corkscrew. League stewards will rule it a racing incident.',
        unlocked: false
      },
      {
        id: 'INT-02-B',
        sender: 'DR. ELENA ROSTOVA // EX-VOSTOK BALLISTICS RESEARCH',
        receiver: 'KAELEN VOSS // ANONYMOUS COMM DROP',
        timestamp: '2148.09.18 // 17:55:09 UTC',
        classification: 'BLACK-BOX DECRYPTION',
        subject: 'The Aphelion Spire is Not a Track',
        body: 'Kaelen, Pierre Belmondo envisioned anti-gravity as humanity’s liberation from gravity wells. The syndicates have perverted his harmonic equations into orbital artillery tracking. The F-8000 Grand Prix at Aphelion Prime is the live deployment test for an atmospheric missile defense grid targeting Earth’s sovereign spaceports. Win the race. Trigger the broadcast override from the podium.',
        unlocked: false
      }
    ],
    commsFeed: [
      { speaker: 'VOSS', text: 'Entering lunar vacuum rift. Drag is gone. Speed passing 1,400 km/h!', audioTone: 'STATIC_BURST' },
      { speaker: 'KANE', text: 'Qirex is boxing you from the left rail! Slipstream behind him and let Navier-Stokes do the work!', audioTone: 'HIGH_ALARM' },
      { speaker: 'ROSTOVA', text: 'Telemetry packet 88% downloaded... Keep within 20 meters of his engine wake!', audioTone: 'DATA_PING' }
    ]
  },
  {
    act: 3,
    title: 'ACT III: THE APHELION SCHISM // ORBITAL SPIRE',
    circuit: 'Aphelion Prime',
    sector: 'Lagrange Point 1 // Orbital Megastructure',
    briefing: 'The championship finale. An 8-kilometer suspended orbital ribbon wrapping around the planetary defense spire. The military contractors have locked down the telemetry relays. To blow the whistle on the Aphelion Accord, you must push the Caliburn chassis past Mach 1.4, breach the spire’s inner slipstream corridor, and cross the finish line in 1st position.',
    intercepts: [
      {
        id: 'INT-03-A',
        sender: 'TIGRON // SYNDICATE HIGH COUNCIL',
        receiver: 'ALL PMC UNITS // EMERGENCY VECTOR',
        timestamp: '2148.09.25 // 21:02:11 UTC',
        classification: 'LETHAL AUTHORIZATION',
        subject: 'Containment Failure at Spire Node 0',
        body: 'Voss has breached the defense grid frequency. All craft authorized to utilize maximum kinetic weapon force and overdriven sub-plasma discharges. Neutralize Caliburn before the broadcast feed reaches the lunar relay satellites.',
        unlocked: false
      },
      {
        id: 'INT-03-B',
        sender: 'FEISAR-ORBITAL // COMMISSIONER LAURENT',
        receiver: 'CALIBURN FLIGHTWORKS // ALL CHANNELS',
        timestamp: '2148.09.25 // 21:30:44 UTC',
        classification: 'EMERGENCY LEAGUE BROADCAST',
        subject: 'Sanctions Declared Against Syndicate Outliers',
        body: 'FEISAR and Auricom Vanguard are deploying harmonic shield barriers to escort Caliburn. Voss, you have the grid behind you. Show the solar system what true flight looks like.',
        unlocked: false
      }
    ],
    commsFeed: [
      { speaker: 'KANE', text: 'MHD coils are glowing incandescent yellow! 120 cd/m² thermal stress on the ventral plates!', audioTone: 'URGENT_BEEP' },
      { speaker: 'VOSS', text: 'Sonic boom verified! Mach 1.2 through the orbital vacuum tube!', audioTone: 'BOOM_THUD' },
      { speaker: 'COMMISSIONER', text: 'Broadcast override established. The Aphelion Schism is in the open!', audioTone: 'TRIUMPH_CHIME' }
    ]
  }
];

// ----------------------------------------------------------------------------
// NARRATIVE STATE CONTROLLER
// ----------------------------------------------------------------------------
export class DescentVectorNarrative {
  constructor() {
    this.currentActIndex = 0;
    this.activeCommsQueue = [];
    this.activeCommsTimer = 0;
    this.currentCommsMessage = null;
    this.unlockedIntercepts = new Set(['INT-01-A', 'INT-01-B']);
  }

  getCurrentAct() {
    return NARRATIVE_ACTS[this.currentActIndex];
  }

  unlockAct(actIndex) {
    if (actIndex < NARRATIVE_ACTS.length) {
      this.currentActIndex = actIndex;
      const act = NARRATIVE_ACTS[actIndex];
      act.intercepts.forEach(int => {
        this.unlockedIntercepts.add(int.id);
      });
    }
  }

  triggerComms(commsArray) {
    this.activeCommsQueue.push(...commsArray);
  }

  update(delta) {
    if (this.currentCommsMessage) {
      this.activeCommsTimer -= delta;
      if (this.activeCommsTimer <= 0) {
        this.currentCommsMessage = null;
      }
    }

    if (!this.currentCommsMessage && this.activeCommsQueue.length > 0) {
      this.currentCommsMessage = this.activeCommsQueue.shift();
      this.activeCommsTimer = 4.2; // Display duration in seconds
    }
  }

  getActiveComms() {
    return this.currentCommsMessage;
  }
}
