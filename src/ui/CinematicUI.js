import { VEHICLE_CATALOG } from '../craft/FuturisticVehicle.js';
import { RIVAL_ROSTER } from '../ai/RivalRacersSystem.js';
import { saveManager } from '../game/SaveManager.js';
import { backendService } from '../backend/BackendService.js';

// ============================================================================
// CINEMATIC UI: 2089 ARCADE RACING PRESENTATION & UX FLOW
// Developer Credit "DEVELOPED BY RANJEET KUMAR", 3D Loading Screen,
// First-Time Player Welcome & Driving School Academy, 3D Interactive Lobby,
// Car Selection Carousel, Live Customization, Match Prep, Race Intro,
// High-tech HUD, Pause, Results, 3D Victory Podium, Winning Lobby,
// Global Cloud Leaderboard & Realtime Ghost Telemetry Replay
// ============================================================================

// ============================================================================
// 8 WORLD TOUR REGIONS DEFINITION (Reference: Neon World Tour Racing Map)
// Total Stars: 140 / 144 Stars (97% completion)
// ============================================================================
export const WORLD_REGIONS = [
  {
    id: 'neo_city',
    name: 'NEO CITY',
    sector: 'SECTOR 01',
    subtitle: 'High-Altitude Urban Circuit',
    description: 'Skyscrapers, blazing neon billboards, elevated highways and high-speed urban street racing through the cyberpunk metropolis.',
    color: '#00F0FF',
    accentColor: '#FF007F',
    stars: '24/24',
    maxStars: 24,
    currentStars: 24,
    completion: 100,
    rewards: { credits: 50000, xp: 5000, vehicle: 'NXR-01 HYPERCAR' },
    x: 50,
    y: 45,
    events: [
      { id: 'nc_sprint', name: 'NEO-SHINJUKU SPRINT', type: 'SPRINT', dist: '3.2 KM', laps: 1, diff: 'EASY', classReq: 'CLASS C', rewardCr: 8000, rewardXp: 800, best: '01:12.420', stars: 3 },
      { id: 'nc_circuit', name: 'NEO-SHINJUKU NIGHT RUN', type: 'CIRCUIT', dist: '3.8 KM', laps: 2, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 12500, rewardXp: 1200, best: '02:24.110', stars: 3 },
      { id: 'nc_tt', name: 'NEON CORE TIME TRIAL', type: 'TIME TRIAL', dist: '4.5 KM', laps: 1, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 10000, rewardXp: 1000, best: '01:38.250', stars: 3 },
      { id: 'nc_drift', name: 'APEX MAGNET DRIFT', type: 'DRIFT', dist: '2.8 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 15000, rewardXp: 1500, best: '42,000 PTS', stars: 3 },
      { id: 'nc_elim', name: 'MIDNIGHT ELIMINATION', type: 'ELIMINATION', dist: '5.0 KM', laps: 3, diff: 'HARD', classReq: 'CLASS S', rewardCr: 16000, rewardXp: 1600, best: 'RANK #01', stars: 3 },
      { id: 'nc_cp', name: 'CYBER GATES CHECKPOINT', type: 'CHECKPOINT', dist: '4.2 KM', laps: 1, diff: 'MEDIUM', classReq: 'CLASS B', rewardCr: 11000, rewardXp: 1100, best: '01:45.900', stars: 3 },
      { id: 'nc_nitro', name: 'OVERDRIVE NITRO SPRINT', type: 'NITRO CHALLENGE', dist: '3.5 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 18000, rewardXp: 1800, best: '01:20.500', stars: 3 },
      { id: 'nc_boss', name: 'BOSS RACE // THE VECTOR', type: 'BOSS RACE', dist: '5.4 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 25000, rewardXp: 3000, best: '02:41.822', stars: 3 }
    ]
  },
  {
    id: 'coastline',
    name: 'COASTLINE',
    sector: 'SECTOR 02',
    subtitle: 'Hyper Highway & Ocean Cliffs',
    description: 'Bioluminescent ocean waves crashing against sheer rock walls, suspension sky-bridges and high-speed coastal expressways.',
    color: '#00E5FF',
    accentColor: '#0088FF',
    stars: '18/18',
    maxStars: 18,
    currentStars: 18,
    completion: 100,
    rewards: { credits: 40000, xp: 4000, vehicle: 'A-11 AETHER PROTO' },
    x: 25,
    y: 65,
    events: [
      { id: 'cl_sprint', name: 'PACIFIC WAVE SPRINT', type: 'SPRINT', dist: '3.6 KM', laps: 1, diff: 'EASY', classReq: 'CLASS B', rewardCr: 9000, rewardXp: 900, best: '01:16.800', stars: 3 },
      { id: 'cl_circuit', name: 'COASTAL CLIFF CIRCUIT', type: 'CIRCUIT', dist: '4.2 KM', laps: 2, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 13000, rewardXp: 1300, best: '02:30.400', stars: 3 },
      { id: 'cl_tt', name: 'TIDAL SURGE TIME TRIAL', type: 'TIME TRIAL', dist: '4.8 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 11500, rewardXp: 1100, best: '01:42.100', stars: 3 },
      { id: 'cl_drift', name: 'OCEAN DRIVE DRIFT', type: 'DRIFT', dist: '3.1 KM', laps: 1, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 14000, rewardXp: 1400, best: '38,500 PTS', stars: 3 },
      { id: 'cl_elim', name: 'REEF RUN ELIMINATION', type: 'ELIMINATION', dist: '5.2 KM', laps: 3, diff: 'HARD', classReq: 'CLASS S', rewardCr: 16500, rewardXp: 1650, best: 'RANK #01', stars: 3 },
      { id: 'cl_cp', name: 'SUSPENSION BRIDGE RUN', type: 'CHECKPOINT', dist: '4.0 KM', laps: 1, diff: 'MEDIUM', classReq: 'CLASS B', rewardCr: 10500, rewardXp: 1050, best: '01:39.200', stars: 3 },
      { id: 'cl_nitro', name: 'LIGHTHOUSE NITRO DASH', type: 'NITRO CHALLENGE', dist: '3.4 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 17500, rewardXp: 1750, best: '01:18.900', stars: 3 },
      { id: 'cl_boss', name: 'BOSS: TIDAL VORTEX', type: 'BOSS RACE', dist: '5.6 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 24000, rewardXp: 2800, best: '02:46.300', stars: 3 }
    ]
  },
  {
    id: 'snow_peaks',
    name: 'SNOW PEAKS',
    sector: 'SECTOR 03',
    subtitle: 'Glacial Pass & Sub-Zero Tunnels',
    description: 'Sub-zero alpine mountain passes, zero-friction ice surfaces, cryogenic wind tunnels, and hazardous cliff drops.',
    color: '#8AE2FF',
    accentColor: '#D8EEFF',
    stars: '18/18',
    maxStars: 18,
    currentStars: 18,
    completion: 100,
    rewards: { credits: 42000, xp: 4200, vehicle: 'F-8000 BLIZZARD' },
    x: 72,
    y: 25,
    events: [
      { id: 'sp_sprint', name: 'FROSTBITE SPRINT', type: 'SPRINT', dist: '3.4 KM', laps: 1, diff: 'NORMAL', classReq: 'CLASS B', rewardCr: 9500, rewardXp: 950, best: '01:14.300', stars: 3 },
      { id: 'sp_circuit', name: 'AVALANCHE PASS CIRCUIT', type: 'CIRCUIT', dist: '4.4 KM', laps: 2, diff: 'HARD', classReq: 'CLASS S', rewardCr: 14000, rewardXp: 1400, best: '02:35.800', stars: 3 },
      { id: 'sp_tt', name: 'CRYOGENIC TIME TRIAL', type: 'TIME TRIAL', dist: '4.6 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 12000, rewardXp: 1200, best: '01:40.400', stars: 3 },
      { id: 'sp_drift', name: 'GLACIAL SLIDE DRIFT', type: 'DRIFT', dist: '3.0 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S', rewardCr: 16000, rewardXp: 1600, best: '46,000 PTS', stars: 3 },
      { id: 'sp_elim', name: 'BLIZZARD ELIMINATION', type: 'ELIMINATION', dist: '5.1 KM', laps: 3, diff: 'HARD', classReq: 'CLASS S', rewardCr: 17000, rewardXp: 1700, best: 'RANK #01', stars: 3 },
      { id: 'sp_cp', name: 'SUMMIT RIDGE CHECKPOINT', type: 'CHECKPOINT', dist: '4.3 KM', laps: 1, diff: 'MEDIUM', classReq: 'CLASS B', rewardCr: 11000, rewardXp: 1100, best: '01:42.500', stars: 3 },
      { id: 'sp_nitro', name: 'SUB-ZERO NITRO BLITZ', type: 'NITRO CHALLENGE', dist: '3.6 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 18500, rewardXp: 1850, best: '01:21.000', stars: 3 },
      { id: 'sp_boss', name: 'BOSS: ICEBREAKER APEX', type: 'BOSS RACE', dist: '5.5 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 26000, rewardXp: 3100, best: '02:44.200', stars: 3 }
    ]
  },
  {
    id: 'forest',
    name: 'FOREST',
    sector: 'SECTOR 04',
    subtitle: 'Bioluminescent Canopy Winding Roads',
    description: 'Dense glowing flora, elevated canopy walkways, high-speed roots and chicanes requiring pinpoint steering agility.',
    color: '#00FF88',
    accentColor: '#00CC44',
    stars: '16/16',
    maxStars: 16,
    currentStars: 16,
    completion: 100,
    rewards: { credits: 38000, xp: 3800, vehicle: 'K-77 MANTIS AERO' },
    x: 35,
    y: 35,
    events: [
      { id: 'fo_sprint', name: 'CANOPY SHADOW SPRINT', type: 'SPRINT', dist: '3.1 KM', laps: 1, diff: 'EASY', classReq: 'CLASS C', rewardCr: 8500, rewardXp: 850, best: '01:10.900', stars: 3 },
      { id: 'fo_circuit', name: 'REDWOOD LOOP CIRCUIT', type: 'CIRCUIT', dist: '3.9 KM', laps: 2, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 12800, rewardXp: 1250, best: '02:26.500', stars: 3 },
      { id: 'fo_tt', name: 'BIO-MIST TIME TRIAL', type: 'TIME TRIAL', dist: '4.2 KM', laps: 1, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 10500, rewardXp: 1050, best: '01:36.400', stars: 3 },
      { id: 'fo_drift', name: 'MOSS RIDGE DRIFT', type: 'DRIFT', dist: '2.9 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 14500, rewardXp: 1450, best: '39,000 PTS', stars: 3 },
      { id: 'fo_elim', name: 'FERN VALLEY ELIMINATION', type: 'ELIMINATION', dist: '4.8 KM', laps: 3, diff: 'HARD', classReq: 'CLASS S', rewardCr: 15500, rewardXp: 1550, best: 'RANK #01', stars: 3 },
      { id: 'fo_cp', name: 'ANCIENT GROVE GATES', type: 'CHECKPOINT', dist: '4.1 KM', laps: 1, diff: 'MEDIUM', classReq: 'CLASS B', rewardCr: 10800, rewardXp: 1080, best: '01:43.100', stars: 3 },
      { id: 'fo_nitro', name: 'PHOTOSYNTH NITRO SPRINT', type: 'NITRO CHALLENGE', dist: '3.3 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 17000, rewardXp: 1700, best: '01:17.400', stars: 3 },
      { id: 'fo_boss', name: 'BOSS: SYLVAN OVERLORD', type: 'BOSS RACE', dist: '5.2 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 23500, rewardXp: 2700, best: '02:40.100', stars: 3 }
    ]
  },
  {
    id: 'desert',
    name: 'DESERT',
    sector: 'SECTOR 05',
    subtitle: 'Golden Dune Super-Expressway',
    description: 'Blistering solar flats, monumental mirror towers, sandstorm tunnels and wide supersonic straights reaching 450 km/h.',
    color: '#FFB800',
    accentColor: '#FF8800',
    stars: '20/20',
    maxStars: 20,
    currentStars: 20,
    completion: 100,
    rewards: { credits: 45000, xp: 4500, vehicle: 'V-720 MIRAGE' },
    x: 80,
    y: 55,
    events: [
      { id: 'de_sprint', name: 'SOLAR DUNE SPRINT', type: 'SPRINT', dist: '3.8 KM', laps: 1, diff: 'EASY', classReq: 'CLASS B', rewardCr: 9200, rewardXp: 920, best: '01:15.200', stars: 3 },
      { id: 'de_circuit', name: 'MIRAGE HIGHWAY CIRCUIT', type: 'CIRCUIT', dist: '4.6 KM', laps: 2, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 13500, rewardXp: 1350, best: '02:32.000', stars: 3 },
      { id: 'de_tt', name: 'SANDSTORM TIME TRIAL', type: 'TIME TRIAL', dist: '4.9 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 11800, rewardXp: 1180, best: '01:41.200', stars: 3 },
      { id: 'de_drift', name: 'CANYON CREST DRIFT', type: 'DRIFT', dist: '3.2 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 15200, rewardXp: 1520, best: '41,500 PTS', stars: 3 },
      { id: 'de_elim', name: 'DUST DEVIL ELIMINATION', type: 'ELIMINATION', dist: '5.3 KM', laps: 3, diff: 'HARD', classReq: 'CLASS S', rewardCr: 16800, rewardXp: 1680, best: 'RANK #01', stars: 3 },
      { id: 'de_cp', name: 'SOLAR ARRAY CHECKPOINT', type: 'CHECKPOINT', dist: '4.4 KM', laps: 1, diff: 'MEDIUM', classReq: 'CLASS B', rewardCr: 11200, rewardXp: 1120, best: '01:44.000', stars: 3 },
      { id: 'de_nitro', name: 'SUPERSONIC NITRO RUN', type: 'NITRO CHALLENGE', dist: '3.7 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 18200, rewardXp: 1820, best: '01:19.800', stars: 3 },
      { id: 'de_boss', name: 'BOSS: SOLARIS PRIME', type: 'BOSS RACE', dist: '5.7 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 25500, rewardXp: 3000, best: '02:45.000', stars: 3 }
    ]
  },
  {
    id: 'volcano',
    name: 'VOLCANO',
    sector: 'SECTOR 06',
    subtitle: 'Molten Magma Ridge & Thermal Geysers',
    description: 'Active volcanic caldera circuits, bubbling sulfur lakes, glowing lava falls and obsidian asphalt corridors.',
    color: '#FF3B30',
    accentColor: '#FF6600',
    stars: '16/16',
    maxStars: 16,
    currentStars: 16,
    completion: 100,
    rewards: { credits: 48000, xp: 4800, vehicle: 'X-900 INFERNO' },
    x: 65,
    y: 78,
    events: [
      { id: 'vo_sprint', name: 'MAGMA CRUST SPRINT', type: 'SPRINT', dist: '3.3 KM', laps: 1, diff: 'NORMAL', classReq: 'CLASS B', rewardCr: 9800, rewardXp: 980, best: '01:13.900', stars: 3 },
      { id: 'vo_circuit', name: 'CALDERA RIM CIRCUIT', type: 'CIRCUIT', dist: '4.3 KM', laps: 2, diff: 'HARD', classReq: 'CLASS S', rewardCr: 14200, rewardXp: 1420, best: '02:34.500', stars: 3 },
      { id: 'vo_tt', name: 'SULFUR VENT TIME TRIAL', type: 'TIME TRIAL', dist: '4.5 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 12200, rewardXp: 1220, best: '01:39.900', stars: 3 },
      { id: 'vo_drift', name: 'OBSIDIAN HAIRPIN DRIFT', type: 'DRIFT', dist: '2.9 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 16500, rewardXp: 1650, best: '45,200 PTS', stars: 3 },
      { id: 'vo_elim', name: 'LAVA SURGE ELIMINATION', type: 'ELIMINATION', dist: '5.0 KM', laps: 3, diff: 'HARD', classReq: 'CLASS S', rewardCr: 17200, rewardXp: 1720, best: 'RANK #01', stars: 3 },
      { id: 'vo_cp', name: 'GEYSER FIELD GATES', type: 'CHECKPOINT', dist: '4.2 KM', laps: 1, diff: 'MEDIUM', classReq: 'CLASS B', rewardCr: 11400, rewardXp: 1140, best: '01:43.600', stars: 3 },
      { id: 'vo_nitro', name: 'PLASMA THERMAL SPRINT', type: 'NITRO CHALLENGE', dist: '3.5 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 18800, rewardXp: 1880, best: '01:20.200', stars: 3 },
      { id: 'vo_boss', name: 'BOSS: PYROCLASTIC REX', type: 'BOSS RACE', dist: '5.5 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 26500, rewardXp: 3200, best: '02:43.800', stars: 3 }
    ]
  },
  {
    id: 'hillside',
    name: 'HILLSIDE',
    sector: 'SECTOR 07',
    subtitle: 'Terraced Switchbacks & Torii Shrines',
    description: 'Traditional cyber-Japanese mountain villas, glowing red torii gates, blossom trees and continuous descending switchbacks.',
    color: '#FFE600',
    accentColor: '#FFAA00',
    stars: '16/16',
    maxStars: 16,
    currentStars: 16,
    completion: 100,
    rewards: { credits: 40000, xp: 4000, vehicle: 'R-500 RONIN' },
    x: 42,
    y: 72,
    events: [
      { id: 'hi_sprint', name: 'TORII ARCH SPRINT', type: 'SPRINT', dist: '3.2 KM', laps: 1, diff: 'EASY', classReq: 'CLASS C', rewardCr: 8800, rewardXp: 880, best: '01:11.800', stars: 3 },
      { id: 'hi_circuit', name: 'SAKURA PASS CIRCUIT', type: 'CIRCUIT', dist: '4.0 KM', laps: 2, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 13200, rewardXp: 1300, best: '02:28.200', stars: 3 },
      { id: 'hi_tt', name: 'BAMBOO VALLEY TIME TRIAL', type: 'TIME TRIAL', dist: '4.4 KM', laps: 1, diff: 'NORMAL', classReq: 'CLASS A', rewardCr: 10800, rewardXp: 1080, best: '01:37.600', stars: 3 },
      { id: 'hi_drift', name: 'SWITCHBACK KING DRIFT', type: 'DRIFT', dist: '3.0 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 15500, rewardXp: 1550, best: '43,800 PTS', stars: 3 },
      { id: 'hi_elim', name: 'VALLEY MIST ELIMINATION', type: 'ELIMINATION', dist: '4.9 KM', laps: 3, diff: 'HARD', classReq: 'CLASS S', rewardCr: 16200, rewardXp: 1620, best: 'RANK #01', stars: 3 },
      { id: 'hi_cp', name: 'TERRACE TEMPLE RUN', type: 'CHECKPOINT', dist: '4.1 KM', laps: 1, diff: 'MEDIUM', classReq: 'CLASS B', rewardCr: 10900, rewardXp: 1090, best: '01:42.800', stars: 3 },
      { id: 'hi_nitro', name: 'DRAGON TAIL NITRO DASH', type: 'NITRO CHALLENGE', dist: '3.4 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 17800, rewardXp: 1780, best: '01:19.100', stars: 3 },
      { id: 'hi_boss', name: 'BOSS: KAMI SHADOW', type: 'BOSS RACE', dist: '5.3 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 24500, rewardXp: 2900, best: '02:42.500', stars: 3 }
    ]
  },
  {
    id: 'night_district',
    name: 'NIGHT DISTRICT',
    sector: 'SECTOR 08',
    subtitle: 'Underground Syndicate & Neon Chasm',
    description: 'Illegal neon-drenched subterranean tunnels, zero-gravity vertical drops, magnetic loops and unforgiving tight barriers.',
    color: '#9933FF',
    accentColor: '#FF007F',
    stars: '12/12',
    maxStars: 12,
    currentStars: 12,
    completion: 100,
    rewards: { credits: 55000, xp: 6000, vehicle: 'APHELION PROTOTYPE Z' },
    x: 55,
    y: 28,
    events: [
      { id: 'nd_sprint', name: 'CHASM SPRINT', type: 'SPRINT', dist: '3.5 KM', laps: 1, diff: 'NORMAL', classReq: 'CLASS B', rewardCr: 10000, rewardXp: 1000, best: '01:13.200', stars: 3 },
      { id: 'nd_circuit', name: 'UNDERGROUND GRAND PRIX', type: 'CIRCUIT', dist: '4.5 KM', laps: 2, diff: 'HARD', classReq: 'CLASS S', rewardCr: 15000, rewardXp: 1500, best: '02:33.100', stars: 3 },
      { id: 'nd_tt', name: 'NEON TUNNEL TIME TRIAL', type: 'TIME TRIAL', dist: '4.7 KM', laps: 1, diff: 'HARD', classReq: 'CLASS S', rewardCr: 12500, rewardXp: 1250, best: '01:38.900', stars: 3 },
      { id: 'nd_drift', name: 'SUB-LEVEL DRIFT MATRIX', type: 'DRIFT', dist: '3.1 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 17000, rewardXp: 1700, best: '48,000 PTS', stars: 3 },
      { id: 'nd_elim', name: 'MIDNIGHT SYNDICATE ELIMINATION', type: 'ELIMINATION', dist: '5.4 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 18000, rewardXp: 1800, best: 'RANK #01', stars: 3 },
      { id: 'nd_cp', name: 'GRAVITY WELL CHECKPOINT', type: 'CHECKPOINT', dist: '4.3 KM', laps: 1, diff: 'HARD', classReq: 'CLASS A', rewardCr: 12000, rewardXp: 1200, best: '01:41.500', stars: 3 },
      { id: 'nd_nitro', name: 'HYPER-ION NITRO OVERDRIVE', type: 'NITRO CHALLENGE', dist: '3.6 KM', laps: 1, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 19500, rewardXp: 1950, best: '01:18.200', stars: 3 },
      { id: 'nd_boss', name: 'BOSS: ECLIPSE OVERLORD', type: 'BOSS RACE', dist: '5.8 KM', laps: 3, diff: 'EXTREME', classReq: 'CLASS S+', rewardCr: 30000, rewardXp: 3500, best: '02:39.800', stars: 3 }
    ]
  }
];

export class CinematicUI {
  constructor(gameManager) {
    this.game = gameManager;

    this.container = document.createElement('div');
    this.container.id = 'cinematic-ui-root';
    document.body.appendChild(this.container);

    // Tip database
    this.proTips = [
      'DRIFT THROUGH SHARP CORNERS TO RECHARGE HYPER-BOOST RAPIDLY.',
      'TIME YOUR HYPER-BOOST IN THE PULSE WINDOW TO UNLOCK OVERDRIVE.',
      'HIT STUNT RAMPS AT HIGH VELOCITY TO PERFORM AERIAL BARREL ROLLS.',
      'FOLLOW OPPONENTS CLOSELY TO ACTIVATE LOW-DRAG SLIPSTREAM.',
      'THREAD CLOSE TO CIVILIAN TRAFFIC TO EARN NEAR MISS BOOST BONUSES.',
      'PRESS [E] FOR KINETIC ENERGY BRAKE BEFORE TIGHT HAIRPIN APEXES.'
    ];

    // Safe DOM helpers
    this.safeSetText = (id, text) => {
      const el = document.getElementById(id) || this.container.querySelector('#' + id);
      if (el) el.textContent = text;
    };
    this.safeSetHTML = (id, html) => {
      const el = document.getElementById(id) || this.container.querySelector('#' + id);
      if (el) el.innerHTML = html;
    };
    this.safeSetWidth = (id, width) => {
      const el = document.getElementById(id) || this.container.querySelector('#' + id);
      if (el) el.style.width = width;
    };
    this.safeBind = (id, event, handler) => {
      const el = document.getElementById(id) || this.container.querySelector('#' + id);
      if (el) el.addEventListener(event, handler);
    };

    // Current state
    this.currentScreen = 'LOADING';
    this.selectedCarIndex = 0;
    this.selectedCarCategory = 'ALL';
    this.activeGarageTab = 'body';
    this.carUpgrades = saveManager.data.playerUpgrades || {
      engine: 1,
      turbo: 1,
      transmission: 1,
      tires: 1,
      brakes: 1,
      nitro: 1
    };
    this.selectedRegionIndex = 0;
    this.selectedEventIndex = 1;
    this.selectedTrackId = 'shinjuku';
    this.tipIndex = 0;
    this.actionTimeout = null;
    this.cachedLeaderboard = null;
    this.rainAnimFrame = null;

    this.buildAllDOM();
    this.setupEventListeners();
    this.startLoadingRainEffect();
  }

  buildAllDOM() {
    this.container.innerHTML = `
      <!-- 1. DEVELOPER CREDIT -->
      <div id="screen-dev-credit" class="ui-screen dev-credit-overlay">
        <div class="dev-credit-box">
          <div class="dev-bracket top-left"></div>
          <div class="dev-bracket top-right"></div>
          <div class="dev-bracket btm-left"></div>
          <div class="dev-bracket btm-right"></div>
          <div class="dev-logo-container">
            <img src="/images/game_logo.jpg" alt="Wipeout Aphelion 2148 Logo" class="dev-game-logo-img" />
          </div>
          <div class="dev-studio-tag">ORBITAL MOTORSPORT STUDIOS PRESENTS</div>
          <span class="dev-subtitle">A GAME BY</span>
          <h1 class="dev-title">RANJEET KUMAR</h1>
          <div class="dev-role-badge">CHIEF SIMULATION ARCHITECT & CREATOR</div>
          <div class="dev-scanline"></div>
        </div>
      </div>

      <!-- 2. 3D CINEMATIC LOADING SCREEN (Reference: Neo-Shinjuku Rainy Night) -->
      <div id="screen-loading" class="ui-screen active">
        <div class="loading-cinematic-backdrop">
          <img src="/images/loading_screen.jpg" class="loading-bg-img" alt="Neo-Shinjuku Wet Night" />
          <canvas id="loading-rain-canvas" class="loading-rain-canvas"></canvas>
          <div class="loading-vignette"></div>
          <div class="loading-scanlines"></div>
        </div>

        <div class="loading-ui-layer">
          <!-- Top Row: Logo & Developer Credit -->
          <div class="loading-top-row">
            <div class="loading-brand-left">
              <span class="loading-brand-sub">NEO RACING</span>
              <h1 class="loading-brand-title">WORLD TOUR</h1>
            </div>
            <div class="loading-dev-right">
              <span class="loading-dev-sub">DEVELOPED BY</span>
              <strong class="loading-dev-name">RANJEET KUMAR</strong>
            </div>
          </div>

          <!-- Center schematic / subtitle glow -->
          <div class="loading-center-atmosphere">
            <div class="loading-cyber-reticle"></div>
          </div>

          <!-- Bottom Container -->
          <div class="loading-bottom-container">
            <div class="loading-track-left">
              <span class="lt-sub">CURRENT TRACK</span>
              <h2 class="lt-title">NEO-SHINJUKU</h2>
              <span class="lt-country">JAPAN</span>
            </div>

            <div class="loading-center-hud">
              <div class="loading-status-text" id="loading-status-text">INITIALIZING AETHER-9 // QUANTUM ENGINES</div>
              <div class="loading-progress-box">
                <div class="loading-progress-track">
                  <div id="loading-progress-fill" class="loading-progress-fill" style="width: 0%"></div>
                </div>
                <span class="loading-pct-label" id="loading-pct-text">0%</span>
              </div>
              <div class="loading-pills-row">
                <span class="loading-pill">MASTER THE CONTROLS</span>
                <span class="loading-pill">UPGRADE YOUR CARS</span>
                <span class="loading-pill">EXPLORE NEW LOCATIONS</span>
                <span class="loading-pill">COMPETE GLOBALLY</span>
              </div>
            </div>

            <div class="loading-next-right">
              <span class="lns-sub">NEXT STOP</span>
              <h2 class="lns-track">FUJI SKYWAY</h2>
              <span class="lns-country">HIGHWAY PASS</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. FIRST-TIME PLAYER WELCOME OVERLAY -->
      <div id="screen-welcome-first" class="ui-screen welcome-first-overlay" style="display: none;">
        <div class="welcome-first-box">
          <div class="wfb-header">
            <span class="wfb-tag">SYSTEM ALERT // PROTOCOL 01</span>
            <h2>WELCOME TO<br><span class="cyan">NEO RACING WORLD TOUR</span></h2>
            <small id="wfb-init-text">INITIALIZING DRIVER PROFILE...</small>
          </div>
          <div class="wfb-body">
            <div class="driver-scan-box">
              <span class="scan-pulse"></span>
              <strong id="wfb-status-msg">NEW DRIVER DETECTED</strong>
              <p>TRAINING PROTOCOL REQUIRED BEFORE ENTERING COMPETITIVE SECTOR 07 CIRCUITS.</p>
            </div>
          </div>
          <div class="wfb-actions">
            <button class="btn-action-primary glow" id="btn-welcome-tutorial">START TUTORIAL ►</button>
            <button class="btn-action-secondary" id="btn-welcome-skip">SKIP TUTORIAL</button>
          </div>
          <small class="wfb-hint">Tutorial can be accessed anytime from SETTINGS or MAIN MENU</small>
        </div>
      </div>

      <!-- 4. FIRST-TIME CINEMATIC INTRODUCTION OVERLAY -->
      <div id="screen-cinematic-intro" class="ui-screen cinematic-intro-overlay" style="display: none;">
        <div class="cinematic-letterbox top"></div>
        <div class="cinematic-intro-content">
          <h2 id="cinematic-title-text">WELCOME, DRIVER.</h2>
          <p id="cinematic-sub-text">RANJEET // DRIVER PROFILE DETECTED</p>
        </div>
        <button class="btn-skip-intro" id="btn-skip-cinematic">SKIP [ESC] ►►</button>
        <div class="cinematic-letterbox bottom"></div>
      </div>

      <!-- 5. MAIN 3D CYBERPUNK RACING LOBBY (Reference: Neon Cyberpunk Racing Lobby) -->
      <div id="screen-lobby" class="ui-screen" style="display: none;">
        <!-- Top Navigation Bar -->
        <div class="lobby-top-navbar">
          <div class="lobby-brand-badge">
            <span class="lbb-neon">NEO RACING</span>
            <span class="lbb-sub">WORLD TOUR</span>
          </div>

          <div class="lobby-nav-pills">
            <button class="top-nav-btn active" data-tab="lobby">LOBBY</button>
            <button class="top-nav-btn" data-tab="race">RACE</button>
            <button class="top-nav-btn" data-tab="cars">CARS</button>
            <button class="top-nav-btn" data-tab="garage">GARAGE</button>
            <button class="top-nav-btn" data-tab="map">MAP</button>
            <button class="top-nav-btn" data-tab="shop">SHOP</button>
            <button class="top-nav-btn" data-tab="events">EVENTS</button>
            <button class="top-nav-btn" data-tab="more">MORE</button>
          </div>

          <div class="lobby-top-right">
            <div class="currency-pill cloud online" id="lobby-cloud-badge">
              <span class="cloud-dot green"></span>
              <strong id="cloud-status-text">CLOUD: ONLINE 18ms</strong>
            </div>
            <div class="currency-pill credits">
              <span class="c-symbol">Ȼ</span>
              <strong id="lobby-credits">45,200</strong>
            </div>
            <div class="currency-pill tokens">
              <span class="c-symbol">◆</span>
              <strong id="lobby-tokens">350</strong>
            </div>
            <div class="currency-pill energy">
              <span class="c-symbol">⚡</span>
              <strong>10/10</strong>
            </div>
            <button class="btn-lobby-settings-icon" id="btn-lobby-settings-cog" title="Settings">⚙</button>
          </div>
        </div>

        <!-- Left Column: Player Profile + Quick Menu -->
        <div class="lobby-left-column">
          <div class="lobby-profile-card">
            <div class="profile-avatar">RK</div>
            <div class="profile-meta">
              <div class="profile-name-row">
                <strong id="lobby-player-name">RANJEET</strong>
                <span class="profile-lvl-badge" id="lobby-lvl-badge">LVL 87</span>
              </div>
              <div class="profile-xp-bar-track">
                <div class="profile-xp-fill" id="lobby-xp-fill" style="width: 70%"></div>
              </div>
              <small class="xp-ratio" id="lobby-xp-ratio">8,450 / 12,000 XP</small>
            </div>
          </div>

          <div class="lobby-quick-menu">
            <button class="lqm-btn active" data-nav="play"><span class="lqm-num">01</span> RACE</button>
            <button class="lqm-btn" data-nav="cars"><span class="lqm-num">02</span> CARS</button>
            <button class="lqm-btn" data-nav="garage"><span class="lqm-num">03</span> GARAGE</button>
            <button class="lqm-btn" data-nav="map"><span class="lqm-num">04</span> WORLD MAP</button>
            <button class="lqm-btn" data-nav="events"><span class="lqm-num">05</span> EVENTS</button>
            <button class="lqm-btn" data-nav="leaderboard"><span class="lqm-num">06</span> MULTIPLAYER</button>
            <button class="lqm-btn" data-nav="rewards" id="btn-quick-rewards"><span class="lqm-num">07</span> REWARDS</button>
            <button class="lqm-btn" data-nav="settings"><span class="lqm-num">08</span> SETTINGS</button>
          </div>
        </div>

        <!-- Center Controls: View Angles & Interaction Hint -->
        <div class="lobby-center-controls">
          <div class="lobby-camera-presets">
            <span class="cam-preset-label">VIEW:</span>
            <button class="cam-btn" data-cam="FRONT">FRONT</button>
            <button class="cam-btn" data-cam="SIDE">SIDE</button>
            <button class="cam-btn" data-cam="REAR">REAR</button>
            <button class="cam-btn" data-cam="TOP">TOP</button>
            <button class="cam-btn" data-cam="LOW ANGLE">LOW</button>
          </div>
          <div class="lobby-drag-hint">◄ DRAG MOUSE / TOUCH TO ROTATE VEHICLE // SCROLL TO ZOOM ►</div>
        </div>

        <!-- Right Column: Season 07 & Live Events & Daily Rewards -->
        <div class="lobby-right-column">
          <div class="lobby-season-card">
            <span class="lsc-tag">CURRENT SEASON</span>
            <h3>SEASON 07</h3>
            <div class="lsc-sub">AETHER SKYWAY</div>
            <p>Compete in Sector 07 and unlock the Apex Prototype Chassis.</p>
            <button class="btn-season-view" id="btn-season-view">VIEW SEASON ►</button>
          </div>

          <div class="lobby-live-events-card">
            <div class="lle-header">
              <span class="pulse-marker red"></span>
              <strong>LIVE EVENTS</strong>
              <span class="lle-timer" id="lle-timer">02:14:38</span>
            </div>
            <div class="lle-body">
              <h4>MIDNIGHT TOKYO SHAKEDOWN</h4>
              <small>Limited Time // 35,000 Ȼ + Rare Decal</small>
            </div>
          </div>

          <div class="lobby-daily-reward-card" id="card-daily-rewards">
            <div class="ldr-header">
              <span class="ldr-icon">🎁</span>
              <div>
                <strong>DAILY REWARDS</strong>
                <small id="ldr-status">READY TO CLAIM</small>
              </div>
            </div>
            <button class="btn-claim-reward" id="btn-claim-daily">CLAIM NOW (+1,500 Ȼ)</button>
          </div>
        </div>

        <!-- Bottom Track Carousel & Giant Primary CTA -->
        <div class="lobby-bottom-bar">
          <div class="track-carousel" id="lobby-track-carousel">
            <div class="track-card active" data-track="shinjuku">
              <div class="tc-thumb tc-shinjuku"></div>
              <div class="tc-info">
                <span class="tc-type">URBAN SPRINT</span>
                <strong>NEO-SHINJUKU</strong>
                <small>3.8 KM // 2 LAPS</small>
              </div>
            </div>
            <div class="track-card" data-track="fuji">
              <div class="tc-thumb tc-fuji"></div>
              <div class="tc-info">
                <span class="tc-type">MOUNTAIN DRIFT</span>
                <strong>FUJI SKYWAY</strong>
                <small>4.5 KM // CLASS A</small>
              </div>
            </div>
            <div class="track-card" data-track="district">
              <div class="tc-thumb tc-district"></div>
              <div class="tc-info">
                <span class="tc-type">ELIMINATION</span>
                <strong>NIGHT DISTRICT</strong>
                <small>5.0 KM // CLASS S</small>
              </div>
            </div>
            <div class="track-card" data-track="coastline">
              <div class="tc-thumb tc-coastline"></div>
              <div class="tc-info">
                <span class="tc-type">OCEAN HIGHWAY</span>
                <strong>COASTLINE</strong>
                <small>5.4 KM // S-CLASS</small>
              </div>
            </div>
          </div>

          <!-- Primary CTA Button -->
          <div class="lobby-play-cta">
            <button id="btn-lobby-play" class="btn-primary-glow">
              <span class="cta-subtitle">SECTOR 07 // AETHER SKYWAY</span>
              <strong class="cta-title">PLAY RACE ►</strong>
            </button>
          </div>
        </div>
      </div>

      <!-- 5.5 DEDICATED INTERACTIVE WORLD TOUR MAP SCREEN (Reference: World Map / Explore Every Horizon) -->
      <div id="screen-world-map" class="ui-screen" style="display: none;">
        <div class="world-map-top-bar">
          <div class="wmt-brand">
            <span class="pulse-marker green"></span>
            <div>
              <h2>NEO RACING // WORLD TOUR</h2>
              <small>ORBITAL SATELLITE NETWORK // EXPLORE EVERY HORIZON</small>
            </div>
          </div>
          <div class="wmt-progress">
            <div class="wmt-progress-label">
              <span>WORLD COMPLETION:</span>
              <strong id="wmt-stars-text">140 / 144 STARS ★ (97%)</strong>
            </div>
            <div class="wmt-progress-track">
              <div class="wmt-progress-fill" style="width: 97%"></div>
            </div>
          </div>
          <button class="btn-map-back" id="btn-world-map-back">◄ BACK TO LOBBY</button>
        </div>

        <div class="world-map-layout">
          <!-- Left 8 Regions Sidebar -->
          <div class="world-regions-sidebar">
            <h3>[ WORLD REGIONS ]</h3>
            <div class="world-region-items" id="world-region-items"></div>
          </div>

          <!-- Center Interactive Archipelago Map Canvas & Nodes -->
          <div class="world-map-display">
            <div class="world-map-canvas-wrap">
              <canvas id="world-tour-canvas" width="1000" height="620"></canvas>
              <div class="world-map-nodes-overlay" id="world-map-nodes"></div>
            </div>
            <div class="world-map-legend">
              <span><i style="background:#00F0FF"></i> UNLOCKED REGION</span>
              <span><i style="background:#FFB800"></i> HIGH REWARD</span>
              <span><i style="background:#FF007F"></i> BOSS SECTOR</span>
              <span><i style="background:#00FF88"></i> 100% COMPLETE</span>
            </div>
          </div>

          <!-- Right Region Detail / Preview Card -->
          <div class="world-region-detail-card" id="world-region-detail">
            <div class="wrd-header">
              <span class="wrd-badge" id="wrd-badge">REGION 01 // SECTOR 07</span>
              <h2 id="wrd-name">NEO CITY</h2>
              <div class="wrd-stars" id="wrd-stars">★★★★★ 24/24 STARS</div>
            </div>
            <div class="wrd-preview-thumb" id="wrd-thumb"></div>
            <p class="wrd-desc" id="wrd-desc">
              Skyscrapers, neon lights and high-speed urban racing.
            </p>
            <div class="wrd-rewards-box">
              <div class="wrd-reward-item"><span>CREDITS:</span><strong>50,000 CREDITS</strong></div>
              <div class="wrd-reward-item"><span>XP REWARD:</span><strong>5,000 XP</strong></div>
              <div class="wrd-reward-item"><span>VEHICLE:</span><strong class="cyan">VEHICLE REWARD</strong></div>
            </div>
            <button class="btn-action-primary glow" id="btn-world-view-region">VIEW REGION ►</button>
          </div>
        </div>
      </div>

      <!-- 5.6 REGION RACE EVENT SELECTION SCREEN -->
      <div id="screen-event-select" class="ui-screen" style="display: none;">
        <div class="event-select-top-bar">
          <button class="btn-back" id="btn-event-select-back">◄ BACK TO WORLD MAP</button>
          <div class="est-title-wrap">
            <span class="est-sub" id="est-region-sub">REGION: NEO-SHINJUKU</span>
            <h2 id="est-region-name">RACE EVENT SELECTION</h2>
          </div>
          <div class="est-stats-pill">
            <span>AVAILABLE EVENTS: <strong>8 / 8</strong></span>
          </div>
        </div>

        <div class="event-select-grid" id="event-select-cards-grid"></div>

        <!-- Event Bottom Bar with Selected Event Info & Start Race CTA -->
        <div class="event-select-bottom-bar">
          <div class="selected-event-summary" id="selected-event-summary">
            <div class="ses-type" id="ses-type">CIRCUIT RACE</div>
            <strong class="ses-title" id="ses-title">NEO-SHINJUKU NIGHT RUN</strong>
            <div class="ses-meta" id="ses-meta">3.8 KM // 2 LAPS // RECOMMENDED: CLASS A // REWARD: 12,500 CREDITS, 1,200 XP</div>
          </div>
          <div class="ses-actions">
            <button class="btn-action-secondary" id="btn-event-choose-car">CHOOSE CAR</button>
            <button class="btn-primary-glow" id="btn-event-start-race">START RACE ►</button>
          </div>
        </div>
      </div>

      <!-- 6. 3D CAR SELECTION CAROUSEL -->
      <div id="screen-car-select" class="ui-screen" style="display: none;">
        <div class="car-select-header">
          <button class="btn-back" id="btn-car-back">◄ BACK TO HQ</button>
          <div class="car-select-title-group">
            <h2>SELECT VEHICLE // 2089 FLEET</h2>
            <div class="car-category-filters" id="car-category-filters">
              <button class="cat-filter-btn active" data-cat="ALL">ALL</button>
              <button class="cat-filter-btn" data-cat="HYPERCAR">HYPERCAR</button>
              <button class="cat-filter-btn" data-cat="SUPERCAR">SUPERCAR</button>
              <button class="cat-filter-btn" data-cat="SPORTS">SPORTS</button>
              <button class="cat-filter-btn" data-cat="MUSCLE">MUSCLE</button>
              <button class="cat-filter-btn" data-cat="JDM">JDM</button>
              <button class="cat-filter-btn" data-cat="RALLY">RALLY</button>
              <button class="cat-filter-btn" data-cat="OFF-ROAD">OFF-ROAD</button>
            </div>
          </div>
          <span class="car-count-badge" id="car-select-counter">01 / 09</span>
        </div>

        <!-- Carousel arrows -->
        <button class="carousel-arrow left" id="btn-car-prev">◄</button>
        <button class="carousel-arrow right" id="btn-car-next">►</button>

        <div class="car-select-viewport-hint">◄ DRAG MOUSE / TOUCH TO ROTATE VEHICLE // SCROLL TO ZOOM ►</div>

        <!-- Bottom Vehicle Specs & Stats Card -->
        <div class="car-spec-sheet">
          <div class="car-spec-top-row">
            <div class="car-identity">
              <div class="car-badge-row">
                <span class="car-class" id="car-spec-category">HYPERCAR</span>
                <span class="car-subclass" id="car-spec-class">BALANCED PROTOTYPE</span>
              </div>
              <h3 class="car-name" id="car-spec-name">F-8000 // NIGHTRIFT</h3>
              <p class="car-desc" id="car-spec-desc">Flagship 2089 anti-gravity machine with quad articulated nacelles.</p>
            </div>

            <div class="car-stats-grid">
              <div class="stat-bar-item">
                <div class="sb-label"><span>TOP SPEED</span><strong id="sb-spd">420 KM/H</strong></div>
                <div class="sb-track"><div class="sb-fill" id="sbf-spd" style="width: 88%"></div></div>
              </div>
              <div class="stat-bar-item">
                <div class="sb-label"><span>ACCELERATION</span><strong id="sb-acc">9.6</strong></div>
                <div class="sb-track"><div class="sb-fill" id="sbf-acc" style="width: 96%"></div></div>
              </div>
              <div class="stat-bar-item">
                <div class="sb-label"><span>HANDLING</span><strong id="sb-hnd">8.8</strong></div>
                <div class="sb-track"><div class="sb-fill" id="sbf-hnd" style="width: 88%"></div></div>
              </div>
              <div class="stat-bar-item">
                <div class="sb-label"><span>NITRO</span><strong id="sb-bst">9.4</strong></div>
                <div class="sb-track"><div class="sb-fill" id="sbf-bst" style="width: 94%"></div></div>
              </div>
              <div class="stat-bar-item">
                <div class="sb-label"><span>DRIFT</span><strong id="sb-drf">9.2</strong></div>
                <div class="sb-track"><div class="sb-fill" id="sbf-drf" style="width: 92%"></div></div>
              </div>
              <div class="stat-bar-item">
                <div class="sb-label"><span>BRAKING</span><strong id="sb-brk">9.0</strong></div>
                <div class="sb-track"><div class="sb-fill" id="sbf-brk" style="width: 90%"></div></div>
              </div>
            </div>
          </div>

          <!-- Mini vehicle card strip below -->
          <div class="car-cards-carousel-strip" id="car-cards-strip"></div>

          <div class="car-select-actions">
            <button class="btn-action-primary glow" id="btn-car-choose">SELECT</button>
            <button class="btn-action-secondary" id="btn-car-customize">CUSTOMIZE</button>
            <button class="btn-action-secondary" id="btn-car-upgrade">UPGRADE</button>
          </div>
        </div>
      </div>

      <!-- 7. 3D LIVE VEHICLE CUSTOMIZATION & PERFORMANCE TUNING -->
      <div id="screen-garage" class="ui-screen" style="display: none;">
        <div class="garage-top-bar">
          <button class="btn-back" id="btn-garage-back">◄ BACK TO HQ</button>
          <div class="garage-title-wrap">
            <h2>HANGAR BAY // VEHICLE CUSTOMIZATION & PERFORMANCE TUNING</h2>
            <small>REAL-TIME 3D PREVIEW // 2089 AETHER SPEC</small>
          </div>
          <div class="garage-top-right-meta">
            <div class="currency-pill credits">
              <span class="c-symbol">Ȼ</span>
              <strong id="garage-credits-val">45,200</strong>
            </div>
            <button class="btn-action-primary small glow" id="btn-garage-done">APPLY & RETURN</button>
          </div>
        </div>

        <!-- Garage Camera Controls Overlay -->
        <div class="garage-cam-controls">
          <button class="btn-garage-cam" id="btn-gcam-rot-l">◄ ROTATE</button>
          <button class="btn-garage-cam" id="btn-gcam-rot-r">ROTATE ►</button>
          <button class="btn-garage-cam" id="btn-gcam-zoom-in">ZOOM +</button>
          <button class="btn-garage-cam" id="btn-gcam-zoom-out">ZOOM -</button>
          <button class="btn-garage-cam" id="btn-gcam-reset">RESET CAM</button>
        </div>

        <!-- Customization Tabs -->
        <div class="garage-customizer-tabs">
          <button class="g-tab-btn active" data-gtab="body">BODY</button>
          <button class="g-tab-btn" data-gtab="paint">PAINT</button>
          <button class="g-tab-btn" data-gtab="decals">DECALS</button>
          <button class="g-tab-btn" data-gtab="wheels">WHEELS</button>
          <button class="g-tab-btn" data-gtab="lights">LIGHTS</button>
          <button class="g-tab-btn" data-gtab="exhaust">EXHAUST</button>
          <button class="g-tab-btn" data-gtab="performance">PERFORMANCE</button>
        </div>

        <div class="garage-customizer-panel">
          <!-- 1. BODY TAB -->
          <div class="garage-tab-content active" id="gtab-content-body">
            <h3>AERO BODY KITS</h3>
            <div class="kit-options-row">
              <button class="kit-chip active" data-kit="aero">CIRCUIT AERO</button>
              <button class="kit-chip" data-kit="drag">HIGHWAY DIFFUSER</button>
              <button class="kit-chip" data-kit="vortex">VORTEX SPLIT</button>
            </div>

            <h3>SPOILER / WING</h3>
            <div class="kit-options-row">
              <button class="spoiler-chip active" data-spoiler="stock">STOCK FLAPS</button>
              <button class="spoiler-chip" data-spoiler="wing">CARBON DUAL WING</button>
              <button class="spoiler-chip" data-spoiler="vortex">HIGH DOWNFORCE GT</button>
            </div>
          </div>

          <!-- 2. PAINT TAB -->
          <div class="garage-tab-content" id="gtab-content-paint" style="display:none;">
            <h3>METALLIC BODY PAINT</h3>
            <div class="swatch-row" id="custom-body-swatches">
              <button class="color-swatch active" style="background:#00F0FF" data-color="0x00F0FF" title="Cyan Spark"></button>
              <button class="color-swatch" style="background:#FF1A1A" data-color="0xFF1A1A" title="Crimson Core"></button>
              <button class="color-swatch" style="background:#FFB800" data-color="0xFFB800" title="Solar Gold"></button>
              <button class="color-swatch" style="background:#7928CA" data-color="0x7928CA" title="Void Violet"></button>
              <button class="color-swatch" style="background:#00FF66" data-color="0x00FF66" title="Emerald Hyper"></button>
              <button class="color-swatch" style="background:#F0F4F8" data-color="0xF0F4F8" title="Glacial White"></button>
              <button class="color-swatch" style="background:#0B0D12" data-color="0x0B0D12" title="Obsidian Shadow"></button>
              <button class="color-swatch" style="background:#FF007F" data-color="0xFF007F" title="Neon Magenta"></button>
            </div>
          </div>

          <!-- 3. DECALS TAB -->
          <div class="garage-tab-content" id="gtab-content-decals" style="display:none;">
            <h3>CUSTOM RACING LIVERIES</h3>
            <div class="kit-options-row" id="custom-decal-options">
              <button class="decal-chip active" data-decal="none">CLEAN FACTORY</button>
              <button class="decal-chip" data-decal="stripes">TWIN STRIPES</button>
              <button class="decal-chip" data-decal="apex_racing">01 APEX RACING</button>
              <button class="decal-chip" data-decal="cyber_hex">CYBER HEX</button>
              <button class="decal-chip" data-decal="syndicate">SYNDICATE 疾風</button>
              <button class="decal-chip" data-decal="sakura">SAKURA DRIFT</button>
            </div>
          </div>

          <!-- 4. WHEELS TAB -->
          <div class="garage-tab-content" id="gtab-content-wheels" style="display:none;">
            <h3>REPULSOR WHEELS & RIMS</h3>
            <div class="kit-options-row" id="custom-wheel-options">
              <button class="wheel-chip active" data-wheel="cyber">CYBER MAG-LEV</button>
              <button class="wheel-chip" data-wheel="turbine">VORTEX TURBINE</button>
              <button class="wheel-chip" data-wheel="concave">TITANIUM 5-SPOKE</button>
              <button class="wheel-chip" data-wheel="disc">AETHER DISC SHIELD</button>
            </div>
          </div>

          <!-- 5. LIGHTS TAB -->
          <div class="garage-tab-content" id="gtab-content-lights" style="display:none;">
            <h3>NEON UNDERGLOW</h3>
            <div class="swatch-row" id="custom-underglow-swatches">
              <button class="color-swatch active" style="background:#00F0FF" data-underglow="0x00F0FF" title="Cyan"></button>
              <button class="color-swatch" style="background:#FF0033" data-underglow="0xFF0033" title="Red"></button>
              <button class="color-swatch" style="background:#00FF88" data-underglow="0x00FF88" title="Green"></button>
              <button class="color-swatch" style="background:#FFAA00" data-underglow="0xFFAA00" title="Gold"></button>
              <button class="color-swatch" style="background:#9933FF" data-underglow="0x9933FF" title="Purple"></button>
              <button class="color-swatch" style="background:#FF007F" data-underglow="0xFF007F" title="Magenta"></button>
            </div>
          </div>

          <!-- 6. EXHAUST TAB -->
          <div class="garage-tab-content" id="gtab-content-exhaust" style="display:none;">
            <h3>PLASMA EXHAUST & TRAIL</h3>
            <div class="swatch-row" id="custom-exhaust-swatches">
              <button class="color-swatch active" style="background:#00F0FF" data-exhaust="0x00F0FF" title="Cyan Ion"></button>
              <button class="color-swatch" style="background:#9933FF" data-exhaust="0x9933FF" title="Violet Fusion"></button>
              <button class="color-swatch" style="background:#FF1E3C" data-exhaust="0xFF1E3C" title="Crimson Boost"></button>
              <button class="color-swatch" style="background:#FFB800" data-exhaust="0xFFB800" title="Solar Burst"></button>
              <button class="color-swatch" style="background:#00FF88" data-exhaust="0x00FF88" title="Emerald Warp"></button>
            </div>
          </div>

          <!-- 7. PERFORMANCE UPGRADES TAB -->
          <div class="garage-tab-content" id="gtab-content-performance" style="display:none;">
            <h3>PERFORMANCE TUNING & UPGRADES</h3>
            <div class="perf-upgrades-list" id="perf-upgrades-list"></div>
          </div>
        </div>
      </div>

      <!-- 8. HIGH-TECH 8-PILOT MATCHMAKING RADAR -->
      <div id="screen-match-prep" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="match-prep-backdrop">
          <img src="/images/match_making.jpg" class="match-backdrop-img" alt="Matchmaking Radar Grid" />
          <div class="match-backdrop-tint"></div>
        </div>
        <div class="match-prep-window">
          <div class="match-found-banner">
            <span class="pulse-marker"></span>
            <h2>MATCHMAKING: TOKYO METROPOLITAN RIFT // RANKED GRAND PRIX</h2>
          </div>
          <div class="match-radar-header-row">
            <div class="radar-status-badge"><span class="green-dot"></span> <strong id="match-pilot-count">7/8</strong> PILOTS CONNECTED</div>
            <div class="radar-ping-badge">PING: <strong>28ms</strong> | LOSS: <strong>0%</strong></div>
            <div class="radar-timer-badge">SESSION LAUNCH: <strong id="match-timer-val">00:14</strong></div>
          </div>
          <div class="match-pilot-grid" id="match-pilot-grid">
            <div class="pilot-card ready"><span class="pc-rank">R1</span><div class="pc-avatar"></div><strong class="pc-name">VOID_WALKER</strong><span class="pc-tier platinum">PLATINUM</span><small>V-SPEC FURY</small><span class="pc-status">READY</span></div>
            <div class="pilot-card ready"><span class="pc-rank">R2</span><div class="pc-avatar"></div><strong class="pc-name">CHRONOS_RACER</strong><span class="pc-tier gold">GOLD</span><small>STEALTH INTERCEPTOR</small><span class="pc-status">READY</span></div>
            <div class="pilot-card ready"><span class="pc-rank">R3</span><div class="pc-avatar"></div><strong class="pc-name">N30_KID</strong><span class="pc-tier silver">SILVER</span><small>PLASMA WRAITH</small><span class="pc-status">READY</span></div>
            <div class="pilot-card ready"><span class="pc-rank">R4</span><div class="pc-avatar"></div><strong class="pc-name">CYBER_SAMURAI</strong><span class="pc-tier diamond">DIAMOND</span><small>NEON STRIKER</small><span class="pc-status">READY</span></div>
            <div class="pilot-card ready"><span class="pc-rank">R5</span><div class="pc-avatar"></div><strong class="pc-name">AETHER_DRIFTER</strong><span class="pc-tier gold">GOLD</span><small>GRAVITY RIDER</small><span class="pc-status">READY</span></div>
            <div class="pilot-card ready"><span class="pc-rank">R6</span><div class="pc-avatar"></div><strong class="pc-name">SHADOW_FAX</strong><span class="pc-tier platinum">PLATINUM</span><small>SONIC BOOM</small><span class="pc-status">READY</span></div>
            <div class="pilot-card ready"><span class="pc-rank">R7</span><div class="pc-avatar"></div><strong class="pc-name">HEX_WAVE</strong><span class="pc-tier gold">GOLD</span><small>PULSE PHANTOM</small><span class="pc-status">READY</span></div>
            <div class="pilot-card ready you"><span class="pc-rank">R8</span><div class="pc-avatar avatar-you"></div><strong class="pc-name">RANJEET (YOU)</strong><span class="pc-tier grandmaster">GRANDMASTER</span><small>F-8000 NIGHTRIFT</small><span class="pc-status">READY</span></div>
          </div>
          <div class="match-loading-bar-row">
            <span id="match-loading-msg">GRID SYNCED // ALL 8 PILOTS CONNECTED...</span>
            <div class="match-progress-track">
              <div id="match-progress-fill" class="match-progress-fill" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- PRE-RACE TRACK LOADING SCREEN (VERSUS & SCHEMATIC) -->
      <div id="screen-pre-race-loading" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="pre-race-backdrop">
          <img src="/images/loading_pre_race.jpg" class="pre-race-bg-img" alt="Pre-Race Loading Circuit" />
          <div class="pre-race-tint"></div>
        </div>
        <div class="pre-race-content">
          <div class="pre-race-top-bar">
            <div class="pr-title-box">
              <span class="pr-sub">ORBITAL GRAND PRIX // PRE-RACE BRIEFING</span>
              <h2 class="pr-title">NEO-SHINJUKU RIFT CIRCUIT</h2>
            </div>
            <div class="pr-specs-box">
              <div class="pr-spec-pill">LENGTH: <strong>5.4 KM</strong></div>
              <div class="pr-spec-pill">TURNS: <strong>8 GATES</strong></div>
              <div class="pr-spec-pill">ELEVATION: <strong>+140M</strong></div>
            </div>
          </div>
          <div class="pre-race-versus-container">
            <div class="pr-versus-card player-side">
              <span class="pr-card-badge">LEAD PILOT</span>
              <div class="pr-pilot-info">
                <h3>RANJEET</h3>
                <span class="pr-team">TEAM APHELION</span>
              </div>
              <div class="pr-vehicle-info">
                <span class="pr-vname">F-8000 // NIGHTRIFT</span>
                <span class="pr-vclass">S-CLASS 420 KM/H</span>
              </div>
            </div>
            <div class="pr-versus-badge">VS</div>
            <div class="pr-versus-card rival-side">
              <span class="pr-card-badge red">CHALLENGER</span>
              <div class="pr-pilot-info">
                <h3>RYUKI</h3>
                <span class="pr-team">TOKYO KINETICS</span>
              </div>
              <div class="pr-vehicle-info">
                <span class="pr-vname">AURORA FALCON</span>
                <span class="pr-vclass">AGGRESSIVE RACER</span>
              </div>
            </div>
          </div>
          <div class="pre-race-loading-footer">
            <div class="pr-progress-header">
              <span id="pr-loading-msg">COMPILING WEBGPU GRAPH PIPELINES...</span>
              <strong id="pr-loading-pct">94%</strong>
            </div>
            <div class="pr-progress-track">
              <div id="pr-progress-fill" class="pr-progress-fill" style="width: 94%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 9. RACE INTRO FLY-THROUGH OVERLAY -->
      <div id="screen-race-intro" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="intro-top-banner">
          <h2>NEO-SHINJUKU RIFT</h2>
          <small>GRID INSPECTION SEQUENCE</small>
        </div>

        <div class="intro-bot-card" id="intro-bot-card">
          <span class="ibc-label" id="ibc-pos">RACER 01 / 08</span>
          <h3 id="ibc-name">RANJEET</h3>
          <p id="ibc-vehicle">F-8000 // NIGHTRIFT</p>
          <div class="ibc-style">RACING STYLE: <strong id="ibc-style">PLAYER</strong></div>
        </div>

        <button class="btn-skip-intro" id="btn-skip-intro">SKIP INTRO [ESC] ►►</button>
      </div>

      <!-- 9.5 COUNTDOWN GANTRY OVERLAY -->
      <div id="screen-countdown-overlay" class="countdown-overlay" style="display: none;">
        <div class="countdown-gantry">
          <div class="countdown-lights-bar">
            <div class="gantry-light" id="glight-1"></div>
            <div class="gantry-light" id="glight-2"></div>
            <div class="gantry-light" id="glight-3"></div>
          </div>
          <div class="countdown-number-hero" id="countdown-num">3</div>
          <div class="countdown-sub" id="countdown-sub">SYSTEM CHARGE // 33%</div>
        </div>
      </div>

      <!-- 10. IN-RACE HUD LAYER (Reference: Neo-Shinjuku Street Race Gameplay HUD) -->
      <div id="screen-racing-hud" class="ui-screen" style="display: none; pointer-events: none;">
        <!-- TOP-LEFT PANEL: Pause + POS + LAP + PROGRESS + 8-RACER TOWER LEADERBOARD -->
        <div class="hud-top-left-panel">
          <div class="hud-race-metrics-row">
            <button class="hud-pause-btn" id="btn-pause-ingame" style="pointer-events: auto;" title="Pause Race">||</button>
            <div class="metric-card pos">
              <span class="mc-label">POS.</span>
              <strong class="mc-val" id="rh-pos">3<small>/8</small></strong>
            </div>
            <div class="metric-card lap">
              <span class="mc-label">LAP</span>
              <strong class="mc-val" id="rh-lap">1<small>/2</small></strong>
            </div>
            <div class="metric-card progress">
              <span class="mc-label">PROGRESS</span>
              <strong class="mc-val" id="rh-progress-badge">42%</strong>
            </div>
          </div>

          <!-- 8-Pilot Leaderboard Tower -->
          <div class="hud-leaderboard-tower" id="hud-leaderboard-tower">
            <div class="lbt-item" data-pilot="ryuki"><span class="lbt-pos">1</span><span class="lbt-name">RYUKI</span></div>
            <div class="lbt-item" data-pilot="kaito"><span class="lbt-pos">2</span><span class="lbt-name">KAITO</span></div>
            <div class="lbt-item player active" data-pilot="ranjeet"><span class="lbt-pos">3</span><span class="lbt-name">RANJEET</span><span class="lbt-you">YOU</span></div>
            <div class="lbt-item" data-pilot="haruto"><span class="lbt-pos">4</span><span class="lbt-name">HARUTO</span></div>
            <div class="lbt-item" data-pilot="sora"><span class="lbt-pos">5</span><span class="lbt-name">SORA</span></div>
            <div class="lbt-item" data-pilot="tanaka"><span class="lbt-pos">6</span><span class="lbt-name">TANAKA</span></div>
            <div class="lbt-item" data-pilot="mika"><span class="lbt-pos">7</span><span class="lbt-name">MIKA</span></div>
            <div class="lbt-item" data-pilot="kenji"><span class="lbt-pos">8</span><span class="lbt-name">KENJI</span></div>
          </div>
        </div>

        <!-- TOP-CENTER: Dual Yellow/Cyan Progress & Nitro Indicator -->
        <div class="hud-top-center-panel">
          <div class="hud-dual-gauge">
            <div class="gauge-strip progress-strip">
              <span class="gs-label">CIRCUIT</span>
              <div class="gs-track"><div class="gs-fill yellow" id="hud-dual-progress-fill" style="width: 42%"></div></div>
            </div>
            <div class="gauge-strip nitro-strip">
              <span class="gs-label">NITRO</span>
              <div class="gs-track"><div class="gs-fill cyan" id="hud-dual-nitro-fill" style="width: 80%"></div></div>
            </div>
          </div>
          <div class="rh-ghost-delta" id="rh-ghost-delta" style="display: none;">
            <span class="delta-tag">GHOST:</span>
            <strong id="rh-ghost-delta-val" class="delta-ahead">-0.00s</strong>
          </div>
          <div class="rh-district-banner" id="rh-district-banner" style="display: none;">
            <span class="rh-district-sub">DISTRICT ENTERED</span>
            <strong class="rh-district-name" id="rh-district-name">NEON CORE</strong>
          </div>
        </div>

        <!-- TOP-RIGHT: Speedometer + Gear 5 + Pink Timer Badge -->
        <div class="hud-top-right-panel">
          <div class="speed-cluster">
            <div class="speed-number-wrap">
              <span class="speed-num" id="rh-speed">276</span>
              <span class="speed-unit">KM/H</span>
            </div>
            <div class="gear-badge" id="rh-gear">GEAR 5</div>
            <div class="time-pink-badge" id="rh-lap-time">TIME: 00:48.326</div>
            <div id="rh-sector-label" style="display: none;">S1</div>
            <div id="rh-pb-delta" style="display: none;">PB +0.00s</div>
          </div>
          <div class="hud-tacho-line">
            <div class="tacho-line-fill" id="rh-tacho-fill" style="width: 65%"></div>
          </div>
          <div class="hud-right-actions">
            <div id="perf-telemetry-hud" class="perf-telemetry-pill" style="display: none; pointer-events: auto;">
              <span class="perf-dot green"></span>
              <span id="perf-fps-val">60 FPS</span>
              <span class="perf-divider">|</span>
              <span id="perf-ms-val">16.6ms</span>
              <span class="perf-divider">|</span>
              <span id="perf-quality-val">HIGH</span>
            </div>
            <button class="btn-touch-toggle" id="btn-touch-toggle" style="pointer-events: auto;">📱 TOUCH</button>
            <button class="btn-camera-hud" id="btn-camera-hud" style="pointer-events: auto;">🎥 CAM: CHASE</button>
          </div>
        </div>

        <!-- RIGHT-SIDE: Floating Stunt & Score Feed (Drift, Near Miss, Perfect Nitro) -->
        <div class="hud-stunt-feed" id="hud-stunt-feed">
          <div class="stunt-entry stunt-drift" id="stunt-drift-entry" style="display: none;">
            <span class="stunt-icon">⚡</span>
            <span class="stunt-text" id="stunt-drift-text">DRIFT 120m</span>
            <strong class="stunt-pts" id="stunt-drift-pts">+200</strong>
          </div>
          <div class="stunt-entry stunt-nearmiss" id="stunt-nearmiss-entry" style="display: none;">
            <span class="stunt-icon">⚠️</span>
            <span class="stunt-text" id="stunt-nearmiss-text">NEAR MISS x2</span>
            <strong class="stunt-pts" id="stunt-nearmiss-pts">+100</strong>
          </div>
          <div class="stunt-entry stunt-nitro" id="stunt-nitro-entry" style="display: none;">
            <span class="stunt-icon">🔥</span>
            <span class="stunt-text" id="stunt-nitro-text">PERFECT NITRO</span>
            <strong class="stunt-pts" id="stunt-nitro-pts">+150</strong>
          </div>
          <div class="rh-action-banner" id="rh-action-banner" style="display: none;">
            <div class="action-tag" id="rh-action-tag">+PERFECT LANDING</div>
            <div class="action-pts" id="rh-action-pts">+500 PTS</div>
            <div class="action-combo" id="rh-action-combo">x2 COMBO</div>
          </div>
        </div>

        <!-- BOTTOM-LEFT: Minimap Radar + Steering Controls -->
        <div class="hud-bottom-left-panel">
          <div class="minimap-circular-frame" id="rh-minimap-wrap">
            <canvas id="hud-minimap-canvas" width="180" height="180"></canvas>
            <div class="minimap-outer-ring"></div>
            <div class="minimap-focus-ring" id="minimap-focus-ring" style="display: none;"></div>
          </div>
          <div class="hud-steer-buttons" id="hud-steer-buttons" style="pointer-events: auto;">
            <button class="btn-steer left" id="m-btn-left">◄</button>
            <button class="btn-steer right" id="m-btn-right">►</button>
          </div>
        </div>

        <!-- BOTTOM-CENTER: Horizontal Nitro Reservoir Gauge -->
        <div class="hud-bottom-center-panel">
          <div class="nitro-reservoir-box">
            <div class="nrb-header">
              <span class="nrb-label" id="rh-boost-tier-label">NITRO RESERVOIR</span>
              <strong class="nrb-pct" id="rh-boost-pct">100%</strong>
            </div>
            <div class="nrb-track">
              <div class="nrb-fill" id="rh-boost-fill" style="width: 100%"></div>
              <div class="nrb-glow-pulse"></div>
            </div>
            <span class="nrb-key">[SPACE] NITRO OVERDRIVE</span>
          </div>
        </div>

        <!-- BOTTOM-RIGHT: Action Buttons (Nitro, Brake, Gas, Cam) + Desktop Controls Guide -->
        <div class="hud-bottom-right-panel" style="pointer-events: auto;">
          <div class="action-buttons-cluster">
            <button class="hud-btn-circular cam" id="m-btn-cam" title="Toggle Camera">📹</button>
            <button class="hud-btn-action brake" id="m-btn-brake">BRAKE</button>
            <button class="hud-btn-action throttle" id="m-btn-throttle">DRIVE</button>
            <button class="hud-btn-circular nitro" id="m-btn-boost" title="Nitro Boost">
              <span class="nitro-flame-icon">🔥</span>
              <span class="nitro-label">NITRO</span>
            </button>
          </div>
          <div class="rh-controls-guide" id="rh-controls-guide">
            <span>[W/S] DRIVE/BRAKE</span>
            <span>[A/D] STEER</span>
            <span>[SHIFT] DRIFT</span>
            <span>[SPACE] NITRO</span>
            <span>[C] CAM</span>
          </div>
        </div>
      </div>

      <!-- 11. TUTORIAL IN-GAME HUD OVERLAY -->
      <div id="tutorial-hud-overlay" class="tutorial-hud-overlay" style="display: none; pointer-events: none;">
        <!-- Step Instruction Banner -->
        <div class="tutorial-instruction-card" id="tutorial-instruction-card">
          <div class="tic-header">
            <span class="tic-badge" id="tic-step-badge">STEP 01 // MOVEMENT</span>
            <span class="tic-pulse-dot"></span>
          </div>
          <h3 class="tic-action" id="tic-action-keys">ACCELERATE: [W] / [UP]  |  STEER: [A / D]</h3>
          <p class="tic-desc" id="tic-desc-text">Drive forward and steer to calibrate propulsion modules.</p>
        </div>

        <!-- Braking distance meter -->
        <div class="tutorial-braking-hud" id="tutorial-braking-hud" style="display: none;">
          <span>BRAKING DISTANCE</span>
          <strong id="tbh-dist">120 M</strong>
          <div class="tbh-bar"><div id="tbh-fill" style="width: 100%"></div></div>
        </div>

        <!-- Drift meter bar -->
        <div class="tutorial-drift-hud" id="tutorial-drift-hud" style="display: none;">
          <div class="tdh-header"><span>DRIFT METER</span><strong id="tdh-pct">0%</strong></div>
          <div class="tdh-track"><div id="tdh-fill" style="width: 0%"></div></div>
        </div>

        <!-- Perfect boost timing window -->
        <div class="tutorial-boost-timing-hud" id="tutorial-boost-timing-hud" style="display: none;">
          <span>BOOST TIMING WINDOW</span>
          <div class="tbth-track">
            <div class="tbth-sweet-spot">PERFECT</div>
            <div class="tbth-needle" id="tbth-needle" style="left: 50%"></div>
          </div>
          <small>PRESS [SPACE] IN CYAN SWEET SPOT</small>
        </div>
      </div>

      <!-- 12. DRIVER CERTIFIED COMPLETION MODAL -->
      <div id="screen-tutorial-certified" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="certified-window">
          <div class="cw-header">
            <span class="cw-tag">AETHER DRIVER ACADEMY // CERTIFICATE</span>
            <h2>TRAINING COMPLETE</h2>
            <div class="cw-check">✓ DRIVER CERTIFIED</div>
          </div>
          <div class="cw-pilot-row">
            <span>PILOT: <strong>RANJEET</strong></span>
            <span>CALLSIGN: <strong>NIGHTRIFT-01</strong></span>
          </div>
          <div class="cw-skills-grid">
            <div class="skill-row"><span>ACCELERATION</span><div class="stars">★★★★☆</div></div>
            <div class="skill-row"><span>HANDLING</span><div class="stars">★★★☆☆</div></div>
            <div class="skill-row"><span>DRIFT</span><div class="stars">★★★★☆</div></div>
            <div class="skill-row"><span>BOOST</span><div class="stars">★★★★★</div></div>
            <div class="skill-row"><span>STUNTS</span><div class="stars">★★★☆☆</div></div>
          </div>
          <div class="cw-rewards-row">
            <div class="cw-reward-chip">
              <span class="r-icon">🎖</span>
              <strong>TRAINING DRIVER BADGE</strong>
              <small>UNLOCKED</small>
            </div>
            <div class="cw-reward-chip">
              <span class="r-icon">⚡</span>
              <strong>+2,500 XP</strong>
              <small>PILOT LEVEL</small>
            </div>
            <div class="cw-reward-chip">
              <span class="r-icon">Ȼ</span>
              <strong>+1,000 CREDITS</strong>
              <small>CURRENCY</small>
            </div>
          </div>
          <div class="cw-actions">
            <button class="btn-action-primary glow" id="btn-certified-lobby">ENTER NEO-SHINJUKU // HQ LOBBY ►</button>
          </div>
        </div>
      </div>

      <!-- 13. DRIVING SCHOOL (TUTORIAL REPLAY & MODULES) -->
      <div id="screen-driving-school" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="ds-window">
          <div class="ds-top-bar">
            <button class="btn-back" id="btn-ds-back">◄ BACK TO HQ</button>
            <h2>AETHER DRIVER ACADEMY // DRIVING SCHOOL</h2>
            <button class="btn-action-primary small glow" id="btn-ds-play-full">PLAY FULL COURSE ►</button>
          </div>
          <div class="ds-modules-grid" id="ds-modules-grid"></div>
        </div>
      </div>

      <!-- 14. SETTINGS MODAL -->
      <div id="screen-settings" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="settings-window">
          <div class="settings-header">
            <h2>SETTINGS // SYSTEM CONFIG</h2>
            <button class="btn-close-settings" id="btn-settings-close">✕</button>
          </div>
          <div class="settings-sections">
            <div class="setting-item">
              <div class="si-info">
                <strong>GRAPHICS QUALITY</strong>
                <small>Scales resolution, bloom passes, and particle fidelity</small>
              </div>
              <div class="quality-selector-group" id="settings-quality-group">
                <button class="btn-quality-chip" data-quality="LOW">LOW [60FPS]</button>
                <button class="btn-quality-chip" data-quality="MEDIUM">MED</button>
                <button class="btn-quality-chip active" data-quality="HIGH">HIGH</button>
                <button class="btn-quality-chip" data-quality="ULTRA">ULTRA</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="si-info">
                <strong>SHOW FPS & TELEMETRY HUD</strong>
                <small>Real-time framerate, ms latency, and GPU health counter</small>
              </div>
              <button class="btn-toggle" id="btn-toggle-fps">OFF</button>
            </div>

            <div class="setting-item">
              <div class="si-info">
                <strong>CONTROL SCHEME</strong>
                <small>Select active driver input configuration</small>
              </div>
              <div class="quality-selector-group" id="settings-control-group">
                <button class="btn-control-chip active" data-control="KEYBOARD">KEYBOARD</button>
                <button class="btn-control-chip" data-control="TOUCH">TOUCH</button>
                <button class="btn-control-chip" data-control="GAMEPAD">GAMEPAD</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="si-info">
                <strong>DEFAULT CAMERA VIEW</strong>
                <small>Preferred 6-DOF racing perspective</small>
              </div>
              <div class="quality-selector-group" id="settings-cam-group">
                <button class="btn-cam-chip active" data-cam="CHASE">CHASE</button>
                <button class="btn-cam-chip" data-cam="HOOD">HOOD</button>
                <button class="btn-cam-chip" data-cam="COCKPIT">COCKPIT</button>
                <button class="btn-cam-chip" data-cam="BUMPER">BUMPER</button>
                <button class="btn-cam-chip" data-cam="ACTION">ACTION</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="si-info">
                <strong>CENTRIFUGAL CAMERA BANKING</strong>
                <small>Tilts camera realistically into high-G turns</small>
              </div>
              <button class="btn-toggle active" id="btn-toggle-cam-banking">ON</button>
            </div>

            <div class="setting-item">
              <div class="si-info">
                <strong>VECTOR AI VOICE</strong>
                <small>Synthetic neural audio instructor</small>
              </div>
              <button class="btn-toggle active" id="btn-toggle-voice">ON</button>
            </div>
            <div class="setting-item">
              <div class="si-info">
                <strong>SUBTITLES</strong>
                <small>Display dialogue text banners</small>
              </div>
              <button class="btn-toggle active" id="btn-toggle-subtitles">ON</button>
            </div>
            <div class="setting-item">
              <div class="si-info">
                <strong>HOLOGRAPHIC GHOST</strong>
                <small>Race against world record time-attack telemetry</small>
              </div>
              <button class="btn-toggle active" id="btn-toggle-ghost">ON</button>
            </div>
            <div class="setting-item">
              <div class="si-info">
                <strong>REPLAY TUTORIAL</strong>
                <small>Launch Driver Academy training modules</small>
              </div>
              <button class="btn-action-secondary small" id="btn-settings-replay-tut">REPLAY TUTORIAL</button>
            </div>
            <div class="setting-item">
              <div class="si-info">
                <strong>SFX VOLUME</strong>
                <small>Engines, plasma boosts, and stunt audio</small>
              </div>
              <input type="range" min="0" max="100" value="100" class="setting-slider" id="slider-sfx">
            </div>
            <div class="setting-item">
              <div class="si-info">
                <strong>MUSIC VOLUME</strong>
                <small>Cyberpunk synthwave and racing themes</small>
              </div>
              <input type="range" min="0" max="100" value="85" class="setting-slider" id="slider-music">
            </div>
            <div class="setting-item danger">
              <div class="si-info">
                <strong>RESET PROGRESS</strong>
                <small>Clear local save data & reset tutorial</small>
              </div>
              <button class="btn-danger small" id="btn-reset-save">RESET DATA</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 15. IN-GAME PAUSE MODAL -->
      <div id="screen-pause" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="pause-window">
          <h2>RACE PAUSED</h2>
          <div class="pause-menu">
            <button class="btn-pause-opt" id="btn-pause-resume">RESUME</button>
            <button class="btn-pause-opt" id="btn-pause-restart">RESTART RACE</button>
            <button class="btn-pause-opt" id="btn-pause-quit">QUIT TO HQ</button>
          </div>
        </div>
      </div>

      <!-- 16. RACE RESULTS SCREEN -->
      <div id="screen-results" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="results-window">
          <div class="results-header">
            <span class="res-sub">NEO-SHINJUKU RIFT // SECTOR 07</span>
            <h2>RACE COMPLETE</h2>
          </div>

          <div class="results-pos-hero" id="res-pos-hero">
            <span class="pos-big" id="res-pos-num">01</span>
            <strong class="pos-word" id="res-pos-word">1ST PLACE // VICTORY</strong>
          </div>

          <div class="results-stats-table">
            <div class="stat-row"><span>RACE TIME:</span><strong id="res-total-time">02:41.822</strong></div>
            <div class="stat-row"><span>BEST LAP:</span><strong id="res-best-lap">00:52.401</strong></div>
            <div class="stat-row"><span>TOP SPEED:</span><strong id="res-top-speed">421 KM/H</strong></div>
            <div class="stat-row"><span>AERIAL STUNTS:</span><strong id="res-stunts">7</strong></div>
            <div class="stat-row"><span>DRIFT DISTANCE:</span><strong id="res-drift">1,240 M</strong></div>
            <div class="stat-row"><span>NEAR MISSES:</span><strong id="res-near-miss">12</strong></div>
            <div class="stat-row highlight"><span>TOTAL SCORE:</span><strong id="res-score">24,850 PTS</strong></div>
          </div>

          <div class="results-actions">
            <button class="btn-action-primary glow" id="btn-results-upload">UPLOAD TO LEADERBOARD ☁</button>
            <button class="btn-action-primary" id="btn-results-podium">VIEW PODIUM ►</button>
            <button class="btn-action-secondary" id="btn-results-continue">CONTINUE</button>
          </div>
          <div class="results-upload-status" id="res-upload-status" style="display:none;"></div>
        </div>
      </div>

      <!-- 17. 3D PODIUM CELEBRATION OVERLAY -->
      <div id="screen-podium" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="podium-top-banner">
          <h2>VICTORY PODIUM PRESENTATION</h2>
          <small>AETHER-9 CHAMPIONSHIP</small>
        </div>

        <div class="podium-names-row">
          <div class="p-card silver">
            <span class="p-rank">2ND PLACE</span>
            <strong id="podium-2nd-name">RYUKI</strong>
            <small id="podium-2nd-team">TOKYO KINETICS</small>
          </div>
          <div class="p-card gold">
            <span class="p-rank">★ 1ST PLACE ★</span>
            <strong id="podium-1st-name">RANJEET</strong>
            <small id="podium-1st-team">F-8000 NIGHTRIFT</small>
          </div>
          <div class="p-card bronze">
            <span class="p-rank">3RD PLACE</span>
            <strong id="podium-3rd-name">KAITO</strong>
            <small id="podium-3rd-team">SYNDICATE RAM</small>
          </div>
        </div>

        <div class="podium-bottom-actions">
          <button class="btn-action-primary" id="btn-podium-continue">CONTINUE TO REWARDS ►</button>
        </div>
      </div>

      <!-- POST-RACE CLOUD SYNC LOADING SCREEN -->
      <div id="screen-post-loading" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="post-loading-backdrop">
          <img src="/images/loading_post_race.jpg" class="post-loading-bg-img" alt="Cloud Telemetry Sync" />
          <div class="post-loading-tint"></div>
        </div>
        <div class="post-loading-content">
          <div class="post-sync-header">
            <span class="ps-sub">RACING LEGENDS HQ // SECURE TELEMETRY</span>
            <h2 class="ps-title">SYNCHRONIZING TELEMETRY TO CLOUD SERVERS</h2>
          </div>
          <div class="post-sync-terminal">
            <div class="pst-line">✓ VALIDATING LAP TIMES & SECTOR SPLITS...</div>
            <div class="pst-line">✓ ENCRYPTING ANTI-CHEAT TOKENS...</div>
            <div class="pst-line">✓ UPDATING GLOBAL LEADERBOARDS & RANKINGS...</div>
            <div class="pst-line">✓ CALCULATING PILOT EXP & VICTORY LOOT...</div>
          </div>
          <div class="post-sync-progress-box">
            <div class="psp-track">
              <div id="post-sync-fill" class="psp-fill" style="width: 88%"></div>
            </div>
            <span class="psp-pct" id="post-sync-pct">88%</span>
          </div>
        </div>
      </div>

      <!-- PUBG / APEX STYLE VICTORY REWARD LOBBY -->
      <div id="screen-pubg-rewards" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="pubg-rewards-backdrop">
          <img src="/images/reward_lobby_pubg.jpg" class="pubg-rewards-bg-img" alt="Victory Rewards Crate" />
          <div class="pubg-rewards-tint"></div>
        </div>
        <div class="pubg-rewards-container">
          <div class="pubg-banner-wrap">
            <div class="pubg-victory-banner">
              <span class="pv-icon">🏆</span>
              <h1 class="pv-headline">VICTORY // APHELION CHAMPION</h1>
              <span class="pv-sub">ORBITAL MOTORSPORT SEASON 5 // TOURNAMENT WINNER</span>
            </div>
          </div>

          <div class="pubg-cards-row">
            <div class="pubg-reward-card legendary">
              <div class="prc-tier-badge">LEGENDARY</div>
              <div class="prc-icon-art livery">⚡</div>
              <strong class="prc-title">NEON OVERDRIVE</strong>
              <span class="prc-desc">EXCLUSIVE SHIP LIVERY</span>
              <div class="prc-glow"></div>
            </div>

            <div class="pubg-reward-card credits">
              <div class="prc-tier-badge gold">CURRENCY</div>
              <div class="prc-icon-art coins">🪙</div>
              <strong class="prc-title">+5,000 CR</strong>
              <span class="prc-desc">TOURNAMENT CREDITS</span>
              <div class="prc-glow"></div>
            </div>

            <div class="pubg-reward-card exp">
              <div class="prc-tier-badge blue">EXPERIENCE</div>
              <div class="prc-icon-art xp">⭐</div>
              <strong class="prc-title">+1,500 EXP</strong>
              <span class="prc-desc">PILOT MASTERY</span>
              <div class="prc-glow"></div>
            </div>
          </div>

          <div class="pubg-battlepass-row">
            <div class="pb-bp-header">
              <span class="bp-title">BATTLE PASS PROGRESSION // SEASON 5</span>
              <strong class="bp-levels">TIER 48 ➔ <span class="gold-text">TIER 49 [LEVEL UP!]</span></strong>
            </div>
            <div class="pb-bp-track">
              <div class="pb-bp-fill" id="pubg-bp-fill" style="width: 100%"></div>
            </div>
          </div>

          <div class="pubg-footer-actions">
            <button class="btn-claim-rewards" id="btn-pubg-claim">
              <span class="bcr-icon">🎁</span>
              <strong class="bcr-text">CLAIM ALL & RETURN TO MAIN LOBBY</strong>
            </button>
          </div>
        </div>
      </div>

      <!-- 18. WINNING LOBBY & REWARD UNLOCK -->
      <div id="screen-win-lobby" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="win-lobby-window">
          <div class="win-champion-header">
            <span class="win-icon">🏆</span>
            <h2>CHAMPION // SECTOR 07 COMPLETE</h2>
            <div class="win-streak-badge" id="win-streak-badge">WIN STREAK: 03 WINS</div>
          </div>

          <!-- XP Progression Bar -->
          <div class="win-xp-section">
            <div class="wxp-header">
              <span>XP EARNED: <b class="cyan" id="wxp-earned">+1,250 XP</b></span>
              <strong id="wxp-level">LEVEL 07</strong>
            </div>
            <div class="wxp-track">
              <div class="wxp-fill" id="wxp-fill" style="width: 75%"></div>
            </div>
            <div class="level-up-toast" id="level-up-toast" style="display:none;">★ LEVEL UP! LEVEL 08 UNLOCKED ★</div>
          </div>

          <!-- Rewards Cards Grid -->
          <div class="win-rewards-grid">
            <div class="reward-card">
              <span class="rc-type">CURRENCY</span>
              <strong class="rc-val">+2,500 Ȼ</strong>
              <small>CREDITS</small>
            </div>
            <div class="reward-card">
              <span class="rc-type">TOKENS</span>
              <strong class="rc-val">+50 ◆</strong>
              <small>PREMIUM TOKENS</small>
            </div>
            <div class="reward-card highlight">
              <span class="rc-type">VEHICLE PART</span>
              <strong class="rc-val">ION VORTEX CORE</strong>
              <small>RARE UPGRADE</small>
            </div>
          </div>

          <div class="win-actions">
            <button class="btn-action-primary" id="btn-win-next">NEXT RACE ►</button>
            <button class="btn-action-secondary" id="btn-win-garage">GARAGE</button>
            <button class="btn-action-secondary" id="btn-win-lobby">HQ LOBBY</button>
          </div>
        </div>
      </div>

      <!-- 18. GLOBAL LEADERBOARDS & WORLD RECORDS -->
      <div id="screen-leaderboard" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="leaderboard-window">
          <div class="leaderboard-header">
            <div class="lh-title-row">
              <button class="btn-back" id="btn-leaderboard-close">◄ BACK TO HQ</button>
              <h2>GLOBAL PILOT LEADERBOARD // AETHER-9</h2>
              <div class="lh-relay-badge" id="lh-relay-status">
                <span class="pulse-marker green"></span>
                <span id="lh-relay-text">EDGE RELAY: TOKYO-01 // 16ms</span>
              </div>
            </div>
            <div class="lh-filter-row">
              <button class="lh-filter-btn active" data-filter="all">ALL PILOTS</button>
              <button class="lh-filter-btn" data-filter="dev">DEV RECORD</button>
              <button class="lh-filter-btn" data-filter="rivals">AI LEGENDS</button>
              <div class="lh-ghost-toggle-wrap">
                <span>RACE AGAINST GHOST:</span>
                <button class="btn-toggle active" id="btn-toggle-ghost-lb">ON</button>
              </div>
            </div>
          </div>
          <div class="leaderboard-table-container">
            <table class="leaderboard-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>PILOT CALLSIGN</th>
                  <th>VEHICLE</th>
                  <th>LAP TIME</th>
                  <th>TOP SPEED</th>
                  <th>DRIFT PTS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody id="leaderboard-rows-body">
                <tr><td colspan="7" class="lb-loading">CONNECTING TO ORBITAL TELEMETRY RELAY...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const safeBind = (id, event, handler) => {
      const el = document.getElementById(id) || this.container.querySelector(`#${id}`);
      if (el) el.addEventListener(event, handler);
    };

    // 1. Top Navbar Pills Navigation
    this.container.querySelectorAll('.top-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.top-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        if (this.game.sound) this.game.sound.playMenuClick();

        if (tab === 'lobby') this.showScreen('LOBBY');
        if (tab === 'race') this.game.startMatchmaking();
        if (tab === 'cars') this.showScreen('CAR_SELECT');
        if (tab === 'garage') this.showScreen('GARAGE');
        if (tab === 'map') this.showWorldMap();
        if (tab === 'shop') this.showScreen('GARAGE');
        if (tab === 'events') this.showWorldMap();
        if (tab === 'more' || tab === 'settings') this.showSettingsModal();
      });
    });

    // 2. Left Quick Menu Navigation
    this.container.querySelectorAll('.lqm-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.lqm-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const nav = btn.dataset.nav;
        if (this.game.sound) this.game.sound.playMenuClick();

        if (nav === 'play') this.game.startMatchmaking();
        if (nav === 'cars') this.showScreen('CAR_SELECT');
        if (nav === 'garage') this.showScreen('GARAGE');
        if (nav === 'map') this.showWorldMap();
        if (nav === 'events') this.showWorldMap();
        if (nav === 'leaderboard') this.showLeaderboardModal();
        if (nav === 'rewards') this.claimDailyReward();
        if (nav === 'settings') this.showSettingsModal();
      });
    });

    // 3. Track Carousel Selection
    this.container.querySelectorAll('.track-card').forEach(card => {
      card.addEventListener('click', () => {
        this.container.querySelectorAll('.track-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedTrackId = card.dataset.track;
        if (this.game.sound) this.game.sound.playMenuClick();

        const trackNames = {
          shinjuku: 'NEO-SHINJUKU // URBAN CIRCUIT',
          fuji: 'FUJI SKYWAY // HIGHWAY PASS',
          district: 'NIGHT DISTRICT // ELIMINATION',
          coastline: 'COASTLINE // S-CLASS EXPRESSWAY'
        };
        const ctaSub = document.querySelector('.cta-subtitle');
        if (ctaSub && trackNames[this.selectedTrackId]) {
          ctaSub.textContent = trackNames[this.selectedTrackId];
        }
      });
    });

    // 4. Daily Rewards Claim
    const claimDailyHandler = () => {
      this.claimDailyReward();
    };
    safeBind('btn-claim-daily', 'click', claimDailyHandler);
    safeBind('btn-quick-rewards', 'click', claimDailyHandler);

    // 5. Season View button
    safeBind('btn-season-view', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showWorldMap();
    });

    // 6. Settings cog in top right
    safeBind('btn-lobby-settings-cog', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showSettingsModal();
    });

    // 7. World Map back to Lobby
    safeBind('btn-world-map-back', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showScreen('LOBBY');
    });

    // 8. World Map View Region Events
    safeBind('btn-world-view-region', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showEventSelect(this.selectedRegionIndex);
    });

    // 9. Event Select back to World Map
    safeBind('btn-event-select-back', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showWorldMap();
    });

    // 10. Event Select Start Race & Choose Car
    safeBind('btn-event-start-race', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.startMatchmaking();
    });

    safeBind('btn-event-choose-car', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showScreen('CAR_SELECT');
    });

    // 11. In-game HUD Virtual Controls
    safeBind('m-btn-cam', 'click', () => {
      if (this.game.cameraController) {
        const nextMode = this.game.cameraController.cycleMode();
        if (this.game.sound && this.game.sound.playCameraSwitchSound) {
          this.game.sound.playCameraSwitchSound();
        }
        this.updateCameraBadge(nextMode);
      }
    });

    const bindTouchAction = (id, onDown, onUp) => {
      const el = document.getElementById(id) || this.container.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        onDown();
      }, { passive: false });
      el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); }, { passive: false });
      el.addEventListener('touchcancel', (e) => { e.preventDefault(); onUp(); }, { passive: false });
      el.addEventListener('mousedown', () => onDown());
      el.addEventListener('mouseup', () => onUp());
      el.addEventListener('mouseleave', () => onUp());
    };

    bindTouchAction('m-btn-left', () => this.game.setTouch('steer', -1.0), () => this.game.setTouch('steer', 0));
    bindTouchAction('m-btn-right', () => this.game.setTouch('steer', 1.0), () => this.game.setTouch('steer', 0));
    bindTouchAction('m-btn-throttle', () => this.game.setTouch('throttle', 1.0), () => this.game.setTouch('throttle', 0));
    bindTouchAction('m-btn-brake', () => this.game.setTouch('brake', 1.0), () => this.game.setTouch('brake', 0));
    bindTouchAction('m-btn-boost', () => this.game.setTouch('boost', true), () => this.game.setTouch('boost', false));

    // Lobby Play CTA
    safeBind('btn-lobby-play', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.startMatchmaking();
    });

    // Camera preset buttons
    this.container.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.cam;
        if (this.game.garageLobby) {
          this.game.garageLobby.setCameraAnglePreset(preset);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // 2. Car selection carousel & category filters
    safeBind('btn-car-prev', 'click', () => {
      this.selectedCarIndex = (this.selectedCarIndex - 1 + VEHICLE_CATALOG.length) % VEHICLE_CATALOG.length;
      this.updateCarSelectDetails();
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-car-next', 'click', () => {
      this.selectedCarIndex = (this.selectedCarIndex + 1) % VEHICLE_CATALOG.length;
      this.updateCarSelectDetails();
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-car-choose', 'click', () => {
      const chosenSpec = VEHICLE_CATALOG[this.selectedCarIndex];
      this.game.setPlayerVehicle(chosenSpec.id);
      this.showScreen('LOBBY');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-car-customize', 'click', () => {
      this.showScreen('GARAGE');
      this.switchGarageTab('body');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-car-upgrade', 'click', () => {
      this.showScreen('GARAGE');
      this.switchGarageTab('performance');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-car-back', 'click', () => {
      this.showScreen('LOBBY');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    // Category filter pills
    this.container.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedCarCategory = btn.dataset.cat;
        this.renderCarSelectCards();

        if (this.selectedCarCategory !== 'ALL') {
          const matchIdx = VEHICLE_CATALOG.findIndex(v => v.category === this.selectedCarCategory);
          if (matchIdx !== -1) {
            this.selectedCarIndex = matchIdx;
            this.updateCarSelectDetails();
          }
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // 3. Garage & Customization
    safeBind('btn-garage-back', 'click', () => {
      this.showScreen('LOBBY');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-garage-done', 'click', () => {
      this.showScreen('LOBBY');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    // Garage tabs
    this.container.querySelectorAll('.g-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchGarageTab(btn.dataset.gtab);
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Body paint swatches
    this.container.querySelectorAll('#custom-body-swatches .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('#custom-body-swatches .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const colorHex = parseInt(btn.dataset.color, 16);
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setCustomLivery(colorHex, null, null, null, null);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Neon underglow swatches
    this.container.querySelectorAll('#custom-underglow-swatches .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('#custom-underglow-swatches .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const underglowHex = parseInt(btn.dataset.underglow, 16);
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setCustomLivery(null, underglowHex, null, null, null);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Aero body kits
    this.container.querySelectorAll('.kit-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.kit-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.game.playerVehicle) {
          this.game.playerVehicle.updateAeroKit(btn.dataset.kit);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Spoilers
    this.container.querySelectorAll('.spoiler-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.spoiler-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.game.playerVehicle) {
          this.game.playerVehicle.updateSpoiler(btn.dataset.spoiler);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Decals
    this.container.querySelectorAll('.decal-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.decal-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setDecal(btn.dataset.decal);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Wheels
    this.container.querySelectorAll('.wheel-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.wheel-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setWheelType(btn.dataset.wheel);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Exhaust
    this.container.querySelectorAll('#custom-exhaust-swatches .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('#custom-exhaust-swatches .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const exhaustHex = parseInt(btn.dataset.exhaust, 16);
        if (this.game.playerVehicle) {
          this.game.playerVehicle.setExhaustColor(exhaustHex);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Garage camera buttons
    safeBind('btn-gcam-rot-l', 'click', () => {
      if (this.game.garageLobby) this.game.garageLobby.targetRotationAngle -= 0.6;
      if (this.game.sound) this.game.sound.playMenuClick();
    });
    safeBind('btn-gcam-rot-r', 'click', () => {
      if (this.game.garageLobby) this.game.garageLobby.targetRotationAngle += 0.6;
      if (this.game.sound) this.game.sound.playMenuClick();
    });
    safeBind('btn-gcam-zoom-in', 'click', () => {
      if (this.game.garageLobby) {
        this.game.garageLobby.targetCameraDistance = Math.max(4.5, this.game.garageLobby.targetCameraDistance - 1.2);
      }
      if (this.game.sound) this.game.sound.playMenuClick();
    });
    safeBind('btn-gcam-zoom-out', 'click', () => {
      if (this.game.garageLobby) {
        this.game.garageLobby.targetCameraDistance = Math.min(13.0, this.game.garageLobby.targetCameraDistance + 1.2);
      }
      if (this.game.sound) this.game.sound.playMenuClick();
    });
    safeBind('btn-gcam-reset', 'click', () => {
      if (this.game.garageLobby) this.game.garageLobby.setCameraAnglePreset('FRONT');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    // 4. First-time Welcome & Skip buttons
    safeBind('btn-welcome-tutorial', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.startFirstTimeCinematicAndTutorial();
    });

    safeBind('btn-welcome-skip', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      saveManager.skipTutorial();
      this.showScreen('LOBBY');
      this.game.returnToLobby();
      this.showActionPopup('TUTORIAL SKIPPED', 0, 1);
    });

    // 5. Cinematic Skip
    safeBind('btn-skip-cinematic', 'click', () => {
      if (this.game.cinematicIntro) {
        this.game.cinematicIntro.skip();
      }
    });

    // 6. Skip race intro
    safeBind('btn-skip-intro', 'click', () => {
      this.game.skipRaceIntro();
    });

    // 7. Pause in-game
    safeBind('btn-pause-ingame', 'click', () => {
      this.game.togglePause();
    });

    safeBind('btn-pause-resume', 'click', () => {
      this.game.togglePause();
    });

    safeBind('btn-pause-restart', 'click', () => {
      this.game.togglePause();
      this.game.restartRace();
    });

    safeBind('btn-pause-quit', 'click', () => {
      this.game.togglePause();
      this.showScreen('LOBBY');
      this.game.returnToLobby();
    });

    // 8. Results modal buttons
    safeBind('btn-results-podium', 'click', () => {
      this.game.showPodiumSequence();
    });

    safeBind('btn-results-continue', 'click', () => {
      this.game.showWinningLobby();
    });

    // 9. Podium continue -> Post-Race Cloud Sync Loading -> PUBG Rewards
    safeBind('btn-podium-continue', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      if (this.game.startPostRaceLoading) {
        this.game.startPostRaceLoading(() => {
          this.game.showPubgRewards();
        });
      } else {
        this.game.showWinningLobby();
      }
    });

    // PUBG Claim All & Return to Lobby
    safeBind('btn-pubg-claim', 'click', () => {
      if (this.game.sound) {
        this.game.sound.playVictorySting();
      }
      this.claimPubgRewards();
    });

    // 10. Winning lobby buttons
    safeBind('btn-win-next', 'click', () => {
      this.game.startMatchmaking();
    });

    safeBind('btn-win-garage', 'click', () => {
      this.showScreen('GARAGE');
    });

    safeBind('btn-win-lobby', 'click', () => {
      this.showScreen('LOBBY');
      this.game.returnToLobby();
    });

    // 11. Certified modal button
    safeBind('btn-certified-lobby', 'click', () => {
      this.game.playTutorialCompletionCinematic();
    });

    // 12. Driving school buttons
    safeBind('btn-ds-back', 'click', () => {
      this.showScreen('LOBBY');
      if (this.game.garageLobby) this.game.garageLobby.setCameraAnglePreset('FRONT');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-ds-play-full', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.launchTutorial(true, null);
    });

    // 13. Settings Modal buttons
    safeBind('btn-settings-close', 'click', () => {
      this.showScreen('LOBBY');
      if (this.game.garageLobby) this.game.garageLobby.setCameraAnglePreset('FRONT');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    // Graphics Quality selector chips
    this.container.querySelectorAll('.btn-quality-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.container.querySelectorAll('.btn-quality-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const quality = chip.dataset.quality;
        if (this.game.setGraphicsQuality) {
          this.game.setGraphicsQuality(quality);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // FPS & Telemetry HUD toggle
    const fpsBtn = document.getElementById('btn-toggle-fps') || this.container.querySelector('#btn-toggle-fps');
    if (fpsBtn) {
      fpsBtn.addEventListener('click', () => {
        const nextState = this.game.toggleFpsCounter();
        fpsBtn.textContent = nextState ? 'ON' : 'OFF';
        fpsBtn.className = `btn-toggle ${nextState ? 'active' : ''}`;
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    }

    // Control Scheme selector chips
    this.container.querySelectorAll('.btn-control-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.container.querySelectorAll('.btn-control-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const scheme = chip.dataset.control;
        if (this.game.setControlScheme) {
          this.game.setControlScheme(scheme);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Camera preset selector chips
    this.container.querySelectorAll('.btn-cam-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.container.querySelectorAll('.btn-cam-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cam = chip.dataset.cam;
        if (this.game.cameraController) {
          this.game.cameraController.setMode(cam);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Camera roll banking toggle
    const bankBtn = document.getElementById('btn-toggle-cam-banking') || this.container.querySelector('#btn-toggle-cam-banking');
    if (bankBtn) {
      bankBtn.addEventListener('click', () => {
        const nextState = !this.game.cameraController.enableBanking;
        this.game.cameraController.enableBanking = nextState;
        bankBtn.textContent = nextState ? 'ON' : 'OFF';
        bankBtn.className = `btn-toggle ${nextState ? 'active' : ''}`;
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    }

    // In-game HUD Camera button
    safeBind('btn-camera-hud', 'click', () => {
      if (this.game.cameraController) {
        const nextMode = this.game.cameraController.cycleMode();
        if (this.game.sound && this.game.sound.playCameraSwitchSound) {
          this.game.sound.playCameraSwitchSound();
        }
        this.updateCameraBadge(nextMode);
      }
    });

    const voiceBtn = document.getElementById('btn-toggle-voice') || this.container.querySelector('#btn-toggle-voice');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        const current = saveManager.getSettings().voiceEnabled;
        saveManager.updateSettings({ voiceEnabled: !current });
        voiceBtn.textContent = !current ? 'ON' : 'OFF';
        voiceBtn.className = `btn-toggle ${!current ? 'active' : ''}`;
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    }

    const subBtn = document.getElementById('btn-toggle-subtitles') || this.container.querySelector('#btn-toggle-subtitles');
    if (subBtn) {
      subBtn.addEventListener('click', () => {
        const current = saveManager.getSettings().subtitleEnabled;
        saveManager.updateSettings({ subtitleEnabled: !current });
        subBtn.textContent = !current ? 'ON' : 'OFF';
        subBtn.className = `btn-toggle ${!current ? 'active' : ''}`;
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    }

    const toggleGhostFn = () => {
      const current = saveManager.getSettings().ghostEnabled !== false;
      const next = !current;
      saveManager.updateSettings({ ghostEnabled: next });

      const gBtn = document.getElementById('btn-toggle-ghost') || this.container.querySelector('#btn-toggle-ghost');
      const gBtnLb = document.getElementById('btn-toggle-ghost-lb') || this.container.querySelector('#btn-toggle-ghost-lb');
      if (gBtn) {
        gBtn.textContent = next ? 'ON' : 'OFF';
        gBtn.className = `btn-toggle ${next ? 'active' : ''}`;
      }
      if (gBtnLb) {
        gBtnLb.textContent = next ? 'ON' : 'OFF';
        gBtnLb.className = `btn-toggle ${next ? 'active' : ''}`;
      }
      if (this.game.ghostVehicle) {
        this.game.ghostVehicle.enabled = next;
      }
      if (this.game.sound) this.game.sound.playMenuClick();
    };

    safeBind('btn-toggle-ghost', 'click', toggleGhostFn);
    safeBind('btn-toggle-ghost-lb', 'click', toggleGhostFn);

    safeBind('btn-settings-replay-tut', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showDrivingSchoolModal();
    });

    const sfxSlider = document.getElementById('slider-sfx') || this.container.querySelector('#slider-sfx');
    if (sfxSlider) {
      sfxSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        saveManager.updateSettings({ sfxVolume: val });
        if (this.game.sound) this.game.sound.setSfxVolume(val);
      });
    }

    const musicSlider = document.getElementById('slider-music') || this.container.querySelector('#slider-music');
    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        saveManager.updateSettings({ musicVolume: val });
        if (this.game.sound) this.game.sound.setMusicVolume(val);
      });
    }

    safeBind('btn-reset-save', 'click', () => {
      if (confirm('RESET ALL DRIVER SAVED DATA & PROGRESS?')) {
        saveManager.resetData();
        window.location.reload();
      }
    });

    // 14. Leaderboard Modal Buttons & Filters
    safeBind('btn-leaderboard-close', 'click', () => {
      this.showScreen('LOBBY');
      if (this.game.garageLobby) this.game.garageLobby.setCameraAnglePreset('FRONT');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    this.container.querySelectorAll('.lh-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.lh-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.game.sound) this.game.sound.playMenuClick();
        this.renderLeaderboardRows(btn.dataset.filter);
      });
    });

    // 15. Race Results Upload Button
    safeBind('btn-results-upload', 'click', async () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      const statusEl = document.getElementById('res-upload-status');
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.textContent = 'TRANSMITTING TELEMETRY TO ORBITAL RELAY...';
        statusEl.className = 'results-upload-status syncing';
      }

      const lapData = {
        pilotName: saveManager.data.player.name || 'RANJEET',
        vehicleId: this.game.playerVehicle ? this.game.playerVehicle.spec.id : 'f8000',
        vehicleName: this.game.playerVehicle ? this.game.playerVehicle.spec.name : 'F-8000 // NIGHTRIFT',
        lapTime: this.game.gameState.bestLapTime || this.game.gameState.currentLapTime || 52.4,
        topSpeed: Math.floor(this.game.physics ? this.game.physics.maxSpeedKmh : 420),
        driftScore: this.game.physics ? this.game.physics.totalDriftScore : 0,
        stunts: this.game.physics ? this.game.physics.totalStunts : 0
      };

      const res = await backendService.submitLap(lapData);
      if (statusEl) {
        if (res.success) {
          statusEl.textContent = `★ VERIFIED: RANK #${res.rank.toString().padStart(2, '0')} // +${res.rewards.credits}Ȼ +${res.rewards.xp}XP ★`;
          statusEl.className = 'results-upload-status success';
          if (this.game.sound) this.game.sound.playVictorySting();
        } else {
          statusEl.textContent = res.error || 'FAILED TO UPLOAD TELEMETRY';
          statusEl.className = 'results-upload-status error';
        }
      }
    });

    // Mobile touch toggle & controls
    safeBind('btn-touch-toggle', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.toggleTouchMode();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('touchstart', () => {
        if (!this.isTouchMode) {
          this.isTouchMode = true;
          this.updateTouchModeUI();
        }
      }, { passive: true, once: true });
    }

    this.setupMobileTouchControls();
  }

  setupMobileTouchControls() {
    const bindTouch = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (navigator.vibrate) {
          try { navigator.vibrate(15); } catch {}
        }
        onDown();
      }, { passive: false });
      el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); }, { passive: false });
      el.addEventListener('touchcancel', (e) => { e.preventDefault(); onUp(); }, { passive: false });
      el.addEventListener('mousedown', () => onDown());
      el.addEventListener('mouseup', () => onUp());
      el.addEventListener('mouseleave', () => onUp());
    };

    bindTouch('m-btn-left', () => this.game.setTouch('steer', -1.0), () => this.game.setTouch('steer', 0));
    bindTouch('m-btn-right', () => this.game.setTouch('steer', 1.0), () => this.game.setTouch('steer', 0));
    bindTouch('m-btn-airbrake-l', () => this.game.setTouch('airbrakeLeft', true), () => this.game.setTouch('airbrakeLeft', false));
    bindTouch('m-btn-airbrake-r', () => this.game.setTouch('airbrakeRight', true), () => this.game.setTouch('airbrakeRight', false));
    bindTouch('m-btn-throttle', () => this.game.setTouch('throttle', 1.0), () => this.game.setTouch('throttle', 0));
    bindTouch('m-btn-brake', () => this.game.setTouch('brake', 1.0), () => this.game.setTouch('brake', 0));
    bindTouch('m-btn-drift', () => this.game.setTouch('drift', true), () => this.game.setTouch('drift', false));
    bindTouch('m-btn-boost', () => this.game.setTouch('boost', true), () => this.game.setTouch('boost', false));
  }

  toggleTouchMode() {
    this.isTouchMode = !this.isTouchMode;
    this.updateTouchModeUI();
  }

  updateTouchModeUI() {
    const mobileControls = document.getElementById('rh-mobile-controls');
    const controlsGuide = document.getElementById('rh-controls-guide');
    const minimapWrap = document.getElementById('rh-minimap-wrap');
    const toggleBtn = document.getElementById('btn-touch-toggle');

    if (this.isTouchMode) {
      if (mobileControls) mobileControls.style.display = 'flex';
      if (controlsGuide) controlsGuide.style.display = 'none';
      if (minimapWrap) minimapWrap.classList.add('touch-layout');
      if (toggleBtn) toggleBtn.textContent = '📱 TOUCH: ON';
    } else {
      if (mobileControls) mobileControls.style.display = 'none';
      if (controlsGuide) controlsGuide.style.display = 'flex';
      if (minimapWrap) minimapWrap.classList.remove('touch-layout');
      if (toggleBtn) toggleBtn.textContent = '⌨️ DESKTOP';
    }
  }

  showScreen(screenName) {
    this.currentScreen = screenName;
    const screens = [
      'screen-dev-credit',
      'screen-loading',
      'screen-welcome-first',
      'screen-cinematic-intro',
      'screen-lobby',
      'screen-world-map',
      'screen-event-select',
      'screen-car-select',
      'screen-garage',
      'screen-match-prep',
      'screen-pre-race-loading',
      'screen-race-intro',
      'screen-racing-hud',
      'screen-tutorial-certified',
      'screen-driving-school',
      'screen-settings',
      'screen-pause',
      'screen-results',
      'screen-podium',
      'screen-post-loading',
      'screen-pubg-rewards',
      'screen-win-lobby',
      'screen-leaderboard',
      'screen-countdown-overlay'
    ];

    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    const targetMap = {
      'LOADING': 'screen-loading',
      'WELCOME_FIRST': 'screen-welcome-first',
      'CINEMATIC_INTRO': 'screen-cinematic-intro',
      'LOBBY': 'screen-lobby',
      'WORLD_MAP': 'screen-world-map',
      'EVENT_SELECT': 'screen-event-select',
      'CAR_SELECT': 'screen-car-select',
      'GARAGE': 'screen-garage',
      'MATCH_PREP': 'screen-match-prep',
      'PRE_RACE_LOADING': 'screen-pre-race-loading',
      'RACE_INTRO': 'screen-race-intro',
      'RACING': 'screen-racing-hud',
      'CERTIFIED': 'screen-tutorial-certified',
      'DRIVING_SCHOOL': 'screen-driving-school',
      'SETTINGS': 'screen-settings',
      'PAUSED': 'screen-pause',
      'RESULTS': 'screen-results',
      'PODIUM': 'screen-podium',
      'POST_RACE_LOADING': 'screen-post-loading',
      'PUBG_REWARDS': 'screen-pubg-rewards',
      'WINNING_LOBBY': 'screen-win-lobby',
      'LEADERBOARD': 'screen-leaderboard'
    };

    const targetId = targetMap[screenName];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) el.style.display = 'flex';
    }

    if (screenName === 'RACING') {
      this.updateTouchModeUI();
    }

    if (screenName === 'CAR_SELECT') {
      this.updateCarSelectDetails();
    }

    if (screenName === 'WORLD_MAP') {
      this.renderWorldMap();
      this.drawWorldTourMapCanvas();
    }

    if (screenName === 'EVENT_SELECT') {
      this.renderRegionEvents(WORLD_REGIONS[this.selectedRegionIndex]);
    }
  }

  showWorldMap() {
    this.showScreen('WORLD_MAP');
    if (this.game.sound) this.game.sound.playMenuClick();
  }

  renderWorldMap() {
    const listEl = document.getElementById('world-region-items');
    if (listEl) {
      listEl.innerHTML = WORLD_REGIONS.map((region, idx) => {
        const isSelected = idx === this.selectedRegionIndex;
        return `
          <div class="world-region-item ${isSelected ? 'active' : ''}" data-idx="${idx}" style="border-left-color: ${region.color}">
            <div class="wri-top">
              <span class="wri-name">${region.name}</span>
              <span class="wri-stars">★ ${region.stars}</span>
            </div>
            <div class="wri-sub">${region.subtitle}</div>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('.world-region-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.idx, 10);
          this.selectRegion(idx);
        });
      });
    }

    this.updateRegionDetailCard(WORLD_REGIONS[this.selectedRegionIndex]);
  }

  selectRegion(idx) {
    this.selectedRegionIndex = idx;
    const region = WORLD_REGIONS[idx];
    if (this.game.sound) this.game.sound.playMenuClick();
    this.renderWorldMap();
    this.drawWorldTourMapCanvas();
  }

  updateRegionDetailCard(region) {
    if (!region) return;
    this.safeSetText('wrd-badge', `${region.sector} // ${region.subtitle}`);
    this.safeSetText('wrd-name', region.name);
    this.safeSetText('wrd-stars', `★★★★★ ${region.stars} STARS`);
    this.safeSetText('wrd-desc', region.description);

    const rewardsBox = document.querySelector('.wrd-rewards-box');
    if (rewardsBox && region.rewards) {
      rewardsBox.innerHTML = `
        <div class="wrd-reward-item"><span>CREDITS:</span><strong>+${region.rewards.credits.toLocaleString()} Ȼ</strong></div>
        <div class="wrd-reward-item"><span>XP REWARD:</span><strong>+${region.rewards.xp.toLocaleString()} XP</strong></div>
        <div class="wrd-reward-item"><span>VEHICLE:</span><strong class="cyan">${region.rewards.vehicle}</strong></div>
      `;
    }

    const thumb = document.getElementById('wrd-thumb');
    if (thumb) {
      thumb.style.borderColor = region.color;
      thumb.style.boxShadow = `0 0 25px ${region.color}33`;
    }
  }

  drawWorldTourMapCanvas() {
    const canvas = document.getElementById('world-tour-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Deep space/tactical grid background
    ctx.fillStyle = '#030812';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Connect regions with high-altitude orbital routes
    ctx.lineWidth = 2;
    for (let i = 0; i < WORLD_REGIONS.length; i++) {
      const r1 = WORLD_REGIONS[i];
      const r2 = WORLD_REGIONS[(i + 1) % WORLD_REGIONS.length];
      const x1 = (r1.x / 100) * w;
      const y1 = (r1.y / 100) * h;
      const x2 = (r2.x / 100) * w;
      const y2 = (r2.y / 100) * h;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, r1.color + '66');
      grad.addColorStop(1, r2.color + '66');
      ctx.strokeStyle = grad;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Archipelago Region Nodes
    WORLD_REGIONS.forEach((r, idx) => {
      const rx = (r.x / 100) * w;
      const ry = (r.y / 100) * h;
      const isSelected = idx === this.selectedRegionIndex;

      // Outer glowing pulse ring
      ctx.strokeStyle = r.color;
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = isSelected ? 20 : 10;
      ctx.beginPath();
      ctx.arc(rx, ry, isSelected ? 28 : 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner fill node
      ctx.fillStyle = isSelected ? '#FFFFFF' : r.color;
      ctx.beginPath();
      ctx.arc(rx, ry, isSelected ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = isSelected ? 'bold 13px "Space Grotesk", sans-serif' : '11px "Share Tech Mono", monospace';
      ctx.fillStyle = isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.85)';
      ctx.fillText(r.name, rx - 35, ry + (isSelected ? 44 : 32));
      ctx.font = '10px "Share Tech Mono", monospace';
      ctx.fillStyle = r.color;
      ctx.fillText(`★ ${r.stars}`, rx - 20, ry + (isSelected ? 56 : 44));
    });
  }

  showEventSelect(regionIdx = 0) {
    this.selectedRegionIndex = regionIdx;
    this.showScreen('EVENT_SELECT');
    if (this.game.sound) this.game.sound.playMenuClick();
  }

  renderRegionEvents(region) {
    if (!region) region = WORLD_REGIONS[0];
    this.safeSetText('est-region-sub', `${region.sector} // ${region.subtitle}`);
    this.safeSetText('est-region-name', `${region.name} // RACE EVENTS`);

    const grid = document.getElementById('event-select-cards-grid');
    if (!grid) return;

    grid.innerHTML = region.events.map((evt, idx) => {
      const isSelected = idx === this.selectedEventIndex;
      return `
        <div class="event-card ${isSelected ? 'active' : ''}" data-idx="${idx}">
          <div class="ec-top">
            <span class="ec-type ${evt.type.toLowerCase()}">${evt.type}</span>
            <span class="ec-stars">★★★</span>
          </div>
          <h3 class="ec-title">${evt.name}</h3>
          <div class="ec-details">
            <div class="ecd-item"><span>DISTANCE:</span><strong>${evt.dist} (${evt.laps} ${evt.laps > 1 ? 'LAPS' : 'LAP'})</strong></div>
            <div class="ecd-item"><span>CLASS:</span><strong class="cyan">${evt.classReq}</strong></div>
            <div class="ecd-item"><span>DIFFICULTY:</span><strong>${evt.diff}</strong></div>
            <div class="ecd-item"><span>BEST TIME:</span><strong class="yellow">${evt.best}</strong></div>
          </div>
          <div class="ec-rewards">
            <span class="ec-cr">+${evt.rewardCr.toLocaleString()} Ȼ</span>
            <span class="ec-xp">+${evt.rewardXp} XP</span>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.event-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const idx = parseInt(card.dataset.idx, 10);
        this.selectEvent(idx);
      });
    });

    this.selectEvent(this.selectedEventIndex);
  }

  selectEvent(idx) {
    this.selectedEventIndex = idx;
    const region = WORLD_REGIONS[this.selectedRegionIndex];
    if (!region || !region.events) return;
    const evt = region.events[idx] || region.events[0];

    this.safeSetText('ses-type', `${evt.type} RACE`);
    this.safeSetText('ses-title', evt.name);
    this.safeSetText('ses-meta', `${evt.dist} // ${evt.laps} ${evt.laps > 1 ? 'LAPS' : 'LAP'} // RECOMMENDED: ${evt.classReq} // REWARD: ${evt.rewardCr.toLocaleString()} CREDITS, ${evt.rewardXp} XP`);
  }

  claimDailyReward() {
    if (this.dailyClaimed) {
      alert('DAILY REWARD ALREADY CLAIMED FOR TODAY! CHECK BACK TOMORROW.');
      return;
    }
    this.dailyClaimed = true;
    saveManager.data.player.credits = (saveManager.data.player.credits || 45200) + 1500;
    saveManager.save();

    this.safeSetText('lobby-credits', saveManager.data.player.credits.toLocaleString());
    this.safeSetText('ldr-status', 'CLAIMED ✓ (+1,500 Ȼ)');
    const btn = document.getElementById('btn-claim-daily');
    if (btn) {
      btn.textContent = 'CLAIMED ✓';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }

    if (this.game.sound) this.game.sound.playVictorySting();
    this.showActionPopup('DAILY REWARD CLAIMED', 1500, 1);
  }

  startLoadingRainEffect() {
    const canvas = document.getElementById('loading-rain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drops = [];
    const dropCount = 120;
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: 15 + Math.random() * 25,
        spd: 12 + Math.random() * 18,
        alpha: 0.15 + Math.random() * 0.35
      });
    }

    const animateRain = () => {
      if (this.currentScreen !== 'LOADING' && this.currentScreen !== 'DEV_CREDIT') return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.strokeStyle = `rgba(0, 240, 255, ${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.len);
        ctx.stroke();

        d.y += d.spd;
        d.x -= 1;
        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      }
      this.rainAnimFrame = requestAnimationFrame(animateRain);
    };
    animateRain();
  }

  showDeveloperCredit(callback) {
    const el = document.getElementById('screen-dev-credit');
    if (!el) {
      if (callback) callback();
      return;
    }
    el.style.display = 'flex';
    el.classList.add('fade-in');

    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => {
        el.style.display = 'none';
        if (callback) callback();
      }, 800);
    }, 2400);
  }

  showFirstTimeWelcome() {
    this.showScreen('WELCOME_FIRST');
    const initText = document.getElementById('wfb-init-text');
    const statusMsg = document.getElementById('wfb-status-msg');

    setTimeout(() => {
      if (initText) initText.textContent = 'DRIVER PROFILE GENERATED: RANJEET';
    }, 1200);

    setTimeout(() => {
      if (statusMsg) statusMsg.textContent = 'AETHER-9 ACADEMY PROTOCOL ACTIVE';
    }, 2400);
  }

  showFirstTimeCinematicOverlay() {
    this.showScreen('CINEMATIC_INTRO');
  }

  updateCinematicText(title, subtitle) {
    const t = document.getElementById('cinematic-title-text');
    const s = document.getElementById('cinematic-sub-text');
    if (t) t.textContent = title;
    if (s) s.textContent = subtitle;
  }

  hideFirstTimeCinematicOverlay() {
    const el = document.getElementById('screen-cinematic-intro');
    if (el) el.style.display = 'none';
  }

  showTutorialInstruction(badge, actionKeys, desc) {
    const hud = document.getElementById('tutorial-hud-overlay');
    if (hud) hud.style.display = 'block';

    const b = document.getElementById('tic-step-badge');
    const a = document.getElementById('tic-action-keys');
    const d = document.getElementById('tic-desc-text');

    if (b) b.textContent = badge;
    if (a) a.textContent = actionKeys;
    if (d) d.textContent = desc;
  }

  hideTutorialHUD() {
    const hud = document.getElementById('tutorial-hud-overlay');
    if (hud) hud.style.display = 'none';
  }

  updateBrakingDistance(dist, speedKmh) {
    const el = document.getElementById('tutorial-braking-hud');
    const distText = document.getElementById('tbh-dist');
    const fill = document.getElementById('tbh-fill');

    if (el) el.style.display = 'block';
    if (distText) distText.textContent = `${Math.max(0, Math.floor(dist))} M`;
    if (fill) fill.style.width = `${Math.min(100, (dist / 140) * 100)}%`;
  }

  updateDriftMeter(progress) {
    const el = document.getElementById('tutorial-drift-hud');
    const pct = document.getElementById('tdh-pct');
    const fill = document.getElementById('tdh-fill');

    if (el) el.style.display = 'block';
    const percent = Math.min(100, Math.round(progress * 100));
    if (pct) pct.textContent = `${percent}%`;
    if (fill) fill.style.width = `${percent}%`;
  }

  showPerfectBoostWindow(visible) {
    const el = document.getElementById('tutorial-boost-timing-hud');
    if (el) el.style.display = visible ? 'block' : 'none';
  }

  updatePerfectBoostNeedle(pos) {
    const needle = document.getElementById('tbth-needle');
    if (needle) needle.style.left = `${pos * 100}%`;
  }

  highlightMinimap() {
    const ring = document.getElementById('minimap-focus-ring');
    if (ring) ring.style.display = 'block';
  }

  unhighlightMinimap() {
    const ring = document.getElementById('minimap-focus-ring');
    if (ring) ring.style.display = 'none';
  }

  showTutorialCertifiedModal(data) {
    this.hideTutorialHUD();
    this.showScreen('CERTIFIED');
  }

  showDrivingSchoolModal() {
    this.showScreen('DRIVING_SCHOOL');
    if (this.game.garageLobby) {
      this.game.garageLobby.setCameraAnglePreset('MODAL');
    }
    const grid = document.getElementById('ds-modules-grid');
    if (!grid) return;

    const progress = saveManager.data.tutorialProgress || {};
    const modules = [
      { key: 'movement', num: '01', name: 'PROPULSION & MOVEMENT', desc: 'Calibrate directional vector steering and acceleration.' },
      { key: 'braking', num: '02', name: 'BRAKING ZONE', desc: 'Execute threshold braking before high-speed hazards.' },
      { key: 'drift', num: '03', name: 'MAGNETIC DRIFT', desc: 'Carve apex corners and convert kinetic friction into boost.' },
      { key: 'boost', num: '04', name: 'HYPER BOOST', desc: 'Ignite ion thrust overdrive to exceed 420 km/h.' },
      { key: 'checkpoints', num: '05', name: 'CHECKPOINT NAVIGATION', desc: 'Follow high-altitude blue navigation telemetry gates.' },
      { key: 'minimap', num: '06', name: 'HOLOGRAPHIC RADAR', desc: 'Read rival positions, altitude deltas and upcoming hazards.' },
      { key: 'perfectBoost', num: '07', name: 'PERFECT BOOST TIMING', desc: 'Time plasma discharges inside the resonance sweet spot.' },
      { key: 'stunts', num: '08', name: 'AERIAL STUNTS & LANDING', desc: 'Execute 360 flat spins, barrel rolls and perfect landings.' },
      { key: 'traffic', num: '09', name: 'CIVILIAN TRAFFIC & WEAVING', desc: 'Thread close to civilian hover vehicles for near miss surges.' },
      { key: 'rival', num: '10', name: 'RIVAL OVERTAKE', desc: 'Slipstream behind Kane and execute an aggressive overtake.' },
      { key: 'finalRace', num: '11', name: 'FINAL GRADUATION RACE', desc: 'Two laps against academy pilots with all systems active.' }
    ];

    grid.innerHTML = modules.map(m => {
      const isComplete = !!progress[m.key];
      return `
        <div class="ds-module-card ${isComplete ? 'completed' : ''}">
          <div class="dsm-header">
            <span class="dsm-num">${m.num}</span>
            <span class="dsm-status">${isComplete ? '✓ COMPLETE' : 'INCOMPLETE'}</span>
          </div>
          <h4>${m.name}</h4>
          <p>${m.desc}</p>
          <button class="btn-action-secondary small dsm-play-btn" data-module="${m.key}">
            ${isComplete ? 'REPLAY MODULE' : 'PRACTICE'}
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.dsm-play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modKey = btn.dataset.module;
        this.game.launchTutorial(false, modKey);
      });
    });
  }

  showSettingsModal() {
    this.showScreen('SETTINGS');
    if (this.game.garageLobby) {
      this.game.garageLobby.setCameraAnglePreset('MODAL');
    }
    this.syncSettingsDisplay();
  }

  syncSettingsDisplay() {
    const settings = saveManager.getSettings();

    // 1. Graphics Quality Chips
    const activeQuality = this.game.graphicsQuality || settings.graphicsQuality || 'HIGH';
    this.container.querySelectorAll('.btn-quality-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.quality === activeQuality);
    });

    // 2. Control Scheme Chips
    const activeControl = this.game.controlScheme || settings.controlScheme || 'KEYBOARD';
    this.container.querySelectorAll('.btn-control-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.control === activeControl);
    });

    // 3. Camera Mode Chips
    const activeCam = (this.game.cameraController ? this.game.cameraController.mode : 'CHASE');
    this.container.querySelectorAll('.btn-cam-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.cam === activeCam);
    });

    // 4. FPS Counter Toggle
    const fpsBtn = document.getElementById('btn-toggle-fps') || this.container.querySelector('#btn-toggle-fps');
    if (fpsBtn) {
      fpsBtn.textContent = this.game.showFps ? 'ON' : 'OFF';
      fpsBtn.className = `btn-toggle ${this.game.showFps ? 'active' : ''}`;
    }

    // 5. Centrifugal Camera Banking Toggle
    const bankBtn = document.getElementById('btn-toggle-cam-banking') || this.container.querySelector('#btn-toggle-cam-banking');
    if (bankBtn && this.game.cameraController) {
      const isBank = !!this.game.cameraController.enableBanking;
      bankBtn.textContent = isBank ? 'ON' : 'OFF';
      bankBtn.className = `btn-toggle ${isBank ? 'active' : ''}`;
    }

    // 6. Vector AI Voice & Subtitles
    const voiceBtn = document.getElementById('btn-toggle-voice') || this.container.querySelector('#btn-toggle-voice');
    if (voiceBtn) {
      voiceBtn.textContent = settings.voiceEnabled !== false ? 'ON' : 'OFF';
      voiceBtn.className = `btn-toggle ${settings.voiceEnabled !== false ? 'active' : ''}`;
    }

    const subBtn = document.getElementById('btn-toggle-subtitles') || this.container.querySelector('#btn-toggle-subtitles');
    if (subBtn) {
      subBtn.textContent = settings.subtitleEnabled !== false ? 'ON' : 'OFF';
      subBtn.className = `btn-toggle ${settings.subtitleEnabled !== false ? 'active' : ''}`;
    }

    // 7. Holographic Ghost
    const ghostBtn = document.getElementById('btn-toggle-ghost') || this.container.querySelector('#btn-toggle-ghost');
    if (ghostBtn) {
      const isGhost = settings.ghostEnabled !== false;
      ghostBtn.textContent = isGhost ? 'ON' : 'OFF';
      ghostBtn.className = `btn-toggle ${isGhost ? 'active' : ''}`;
    }

    // 8. Sliders
    const sfxSlider = document.getElementById('slider-sfx') || this.container.querySelector('#slider-sfx');
    if (sfxSlider && settings.sfxVolume !== undefined) {
      sfxSlider.value = Math.round(settings.sfxVolume * 100);
    }
    const musSlider = document.getElementById('slider-music') || this.container.querySelector('#slider-music');
    if (musSlider && settings.musicVolume !== undefined) {
      musSlider.value = Math.round(settings.musicVolume * 100);
    }
  }

  updateFpsCounter(fps, ms, quality, isVisible) {
    const hudPill = document.getElementById('perf-telemetry-hud');
    const lobbyPill = document.getElementById('lobby-perf-badge');

    if (!isVisible) {
      if (hudPill) hudPill.style.display = 'none';
      if (lobbyPill) lobbyPill.style.display = 'none';
      return;
    }

    if (hudPill) {
      hudPill.style.display = 'flex';
      this.safeSetText('perf-fps-val', `${fps} FPS`);
      this.safeSetText('perf-ms-val', `${ms}ms`);
      this.safeSetText('perf-quality-val', quality);
    }

    if (lobbyPill) {
      lobbyPill.style.display = 'flex';
      this.safeSetText('lobby-perf-text', `${fps} FPS // ${quality}`);
    }
  }

  setFpsCounterVisible(visible) {
    const hudPill = document.getElementById('perf-telemetry-hud');
    const lobbyPill = document.getElementById('lobby-perf-badge');
    if (hudPill) hudPill.style.display = visible ? 'flex' : 'none';
    if (lobbyPill) lobbyPill.style.display = visible ? 'flex' : 'none';
  }

  updateLoadingProgress(pct, statusText) {
    const fill = document.getElementById('loading-progress-fill');
    const pctEl = document.getElementById('loading-pct-text');
    const statusEl = document.getElementById('loading-status-text');
    const briefingEl = document.getElementById('loading-briefing-text');

    if (fill) fill.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;
    if (statusEl && statusText) statusEl.textContent = statusText;

    if (briefingEl) {
      if (pct < 25) {
        briefingEl.textContent = 'NEO-SHINJUKU RIFT // 5.4 KM HIGHWAY // 8 DISTRICT GATES // ZERO GRAVITY DIVE AT SECTOR 07';
      } else if (pct < 55) {
        briefingEl.textContent = 'PRO TIP: DRIFT THROUGH TURNS TO RAPIDLY RECHARGE HYPER-BOOST CAPACITORS';
      } else if (pct < 85) {
        briefingEl.textContent = 'PRO TIP: TIME HYPER-BOOST AT 60%-85% SWEET SPOT TO ACTIVATE PLASMA OVERDRIVE';
      } else {
        briefingEl.textContent = 'ALL SYSTEMS NOMINAL // DRIVER RANJEET // READY FOR LAUNCH';
      }
    }
  }

  renderCarSelectCards() {
    const strip = document.getElementById('car-cards-strip') || this.container.querySelector('#car-cards-strip');
    if (!strip) return;

    const filtered = VEHICLE_CATALOG.map((v, originalIdx) => ({ v, originalIdx }))
      .filter(({ v }) => this.selectedCarCategory === 'ALL' || v.category === this.selectedCarCategory);

    strip.innerHTML = filtered.map(({ v, originalIdx }) => {
      const isSelected = originalIdx === this.selectedCarIndex;
      const colorHex = '#' + (v.primaryColor || 0x00F0FF).toString(16).padStart(6, '0');
      return `
        <div class="mcc-card ${isSelected ? 'active' : ''}" data-index="${originalIdx}">
          <div class="mcc-accent-bar" style="background:${colorHex}"></div>
          <div class="mcc-header">
            <span class="mcc-cat">${v.category || 'HYPERCAR'}</span>
            <span class="mcc-spd">${v.maxSpeedKmh} KM/H</span>
          </div>
          <strong class="mcc-name">${v.name.split('//')[0].trim()}</strong>
          <small class="mcc-class">${v.classType}</small>
        </div>
      `;
    }).join('');

    strip.querySelectorAll('.mcc-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        this.selectedCarIndex = idx;
        this.updateCarSelectDetails();
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });
  }

  updateCarSelectDetails() {
    const spec = VEHICLE_CATALOG[this.selectedCarIndex];
    if (!spec) return;

    this.safeSetText('car-select-counter', `0${this.selectedCarIndex + 1} / 0${VEHICLE_CATALOG.length}`);
    this.safeSetText('car-spec-name', spec.name);
    this.safeSetText('car-spec-category', spec.category || 'HYPERCAR');
    this.safeSetText('car-spec-class', spec.classType);
    this.safeSetText('car-spec-desc', spec.description);

    const speed = spec.maxSpeedKmh || (spec.stats.topSpeedKmh || 420);
    this.safeSetText('sb-spd', `${speed} KM/H`);
    this.safeSetWidth('sbf-spd', `${Math.min(100, Math.round(speed / 4.5))}%`);

    const accelDec = (spec.stats.accel >= 10 ? (spec.stats.accel / 10).toFixed(1) : spec.stats.accel.toFixed(1));
    this.safeSetText('sb-acc', accelDec);
    this.safeSetWidth('sbf-acc', `${Math.min(100, spec.stats.accel >= 10 ? spec.stats.accel : spec.stats.accel * 10)}%`);

    const hndDec = (spec.stats.handling >= 10 ? (spec.stats.handling / 10).toFixed(1) : spec.stats.handling.toFixed(1));
    this.safeSetText('sb-hnd', hndDec);
    this.safeSetWidth('sbf-hnd', `${Math.min(100, spec.stats.handling >= 10 ? spec.stats.handling : spec.stats.handling * 10)}%`);

    const nitroDec = (spec.stats.nitro ? (spec.stats.nitro >= 10 ? (spec.stats.nitro / 10).toFixed(1) : spec.stats.nitro.toFixed(1)) : (spec.stats.boost / 10).toFixed(1));
    this.safeSetText('sb-bst', nitroDec);
    this.safeSetWidth('sbf-bst', `${Math.min(100, Math.round(parseFloat(nitroDec) * 10))}%`);

    const driftDec = (spec.stats.drift ? (spec.stats.drift >= 10 ? (spec.stats.drift / 10).toFixed(1) : spec.stats.drift.toFixed(1)) : '9.1');
    this.safeSetText('sb-drf', driftDec);
    this.safeSetWidth('sbf-drf', `${Math.min(100, Math.round(parseFloat(driftDec) * 10))}%`);

    const brkDec = (spec.stats.braking >= 10 ? (spec.stats.braking / 10).toFixed(1) : spec.stats.braking.toFixed(1));
    this.safeSetText('sb-brk', brkDec);
    this.safeSetWidth('sbf-brk', `${Math.min(100, spec.stats.braking >= 10 ? spec.stats.braking : spec.stats.braking * 10)}%`);

    this.renderCarSelectCards();

    // Preview vehicle in 3D
    if (this.game) {
      this.game.setPlayerVehicle(spec.id, true);
    }
  }

  switchGarageTab(tabId) {
    this.activeGarageTab = tabId;
    this.container.querySelectorAll('.g-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.gtab === tabId);
    });

    this.container.querySelectorAll('.garage-tab-content').forEach(panel => {
      panel.style.display = (panel.id === `gtab-content-${tabId}`) ? 'block' : 'none';
      panel.classList.toggle('active', panel.id === `gtab-content-${tabId}`);
    });

    if (tabId === 'performance') {
      this.renderPerformanceUpgrades();
    }
  }

  renderPerformanceUpgrades() {
    const container = document.getElementById('perf-upgrades-list') || this.container.querySelector('#perf-upgrades-list');
    if (!container) return;

    const parts = [
      { id: 'engine', name: 'PLASMA ENGINE', stat: 'TOP SPEED +8 KM/H', icon: '⚡' },
      { id: 'turbo', name: 'TWIN TURBOCHARGER', stat: 'ACCELERATION +0.4', icon: '🌪️' },
      { id: 'transmission', name: 'ION TRANSMISSION', stat: 'VELOCITY CURVE +6 KM/H', icon: '⚙️' },
      { id: 'tires', name: 'REPULSOR FLUX TIRES', stat: 'HANDLING & GRIP +0.3', icon: '🛞' },
      { id: 'brakes', name: 'KINETIC CERAMIC BRAKES', stat: 'BRAKING POWER +0.4', icon: '🛑' },
      { id: 'nitro', name: 'OVERDRIVE NITRO INJECTOR', stat: 'NITRO RECHARGE +0.5', icon: '🔥' }
    ];

    const playerCredits = saveManager.data.player?.credits || 45200;
    this.safeSetText('garage-credits-val', playerCredits.toLocaleString());

    container.innerHTML = parts.map(part => {
      const currentLevel = this.carUpgrades[part.id] || 1;
      const isMax = currentLevel >= 5;
      const cost = currentLevel * 6000;
      const canAfford = playerCredits >= cost;

      let pips = '';
      for (let i = 1; i <= 5; i++) {
        pips += `<span class="pip ${i <= currentLevel ? 'filled' : ''}"></span>`;
      }

      return `
        <div class="perf-upgrade-row">
          <div class="pur-info">
            <span class="pur-icon">${part.icon}</span>
            <div>
              <strong>${part.name}</strong>
              <small class="pur-stat">${part.stat}</small>
            </div>
          </div>
          <div class="pur-level-meter">
            <div class="pur-pips">${pips}</div>
            <span class="pur-lvl-text">LVL 0${currentLevel} / 05</span>
          </div>
          <div class="pur-action">
            ${isMax 
              ? `<span class="pur-max-badge">MAXED OUT</span>`
              : `<button class="btn-upgrade-part ${canAfford ? 'affordable' : 'locked'}" data-part="${part.id}">
                  UPGRADE (${cost.toLocaleString()} Ȼ)
                 </button>`
            }
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-upgrade-part').forEach(btn => {
      btn.addEventListener('click', () => {
        this.buyUpgrade(btn.dataset.part);
      });
    });
  }

  buyUpgrade(partId) {
    const currentLevel = this.carUpgrades[partId] || 1;
    if (currentLevel >= 5) return;
    const cost = currentLevel * 6000;
    const playerCredits = saveManager.data.player?.credits || 45200;

    if (playerCredits < cost) {
      this.showActionPopup('INSUFFICIENT CREDITS', 0, 1);
      return;
    }

    saveManager.data.player.credits -= cost;
    this.carUpgrades[partId] = currentLevel + 1;
    saveManager.data.playerUpgrades = this.carUpgrades;
    saveManager.save();

    if (this.game.sound) this.game.sound.playCountdownBeep(true);
    this.showActionPopup(`${partId.toUpperCase()} UPGRADED TO LVL 0${this.carUpgrades[partId]}!`, 0, 1);
    this.safeSetText('lobby-credits', saveManager.data.player.credits.toLocaleString());
    this.renderPerformanceUpgrades();
  }

  updateMatchPrep(progressPct) {
    this.safeSetWidth('match-progress-fill', `${progressPct}%`);

    const tipEl = document.getElementById('match-tip-text') || this.container.querySelector('#match-tip-text');
    if (tipEl && Math.random() < 0.05) {
      this.tipIndex = (this.tipIndex + 1) % this.proTips.length;
      tipEl.textContent = this.proTips[this.tipIndex];
    }
  }

  updateRaceIntroCard(racerIndex, totalRacers = 8) {
    const card = document.getElementById('intro-bot-card') || this.container.querySelector('#intro-bot-card');
    if (!card) return;

    if (racerIndex === 0) {
      this.safeSetText('ibc-pos', `RACER 01 / 0${totalRacers}`);
      this.safeSetText('ibc-name', 'RANJEET');
      this.safeSetText('ibc-vehicle', this.game.playerVehicle ? this.game.playerVehicle.spec.name : 'F-8000 // NIGHTRIFT');
      this.safeSetText('ibc-style', 'PLAYER CONTROLLER');
    } else {
      const rivals = this.game.rivals ? this.game.rivals.rivals : [];
      const rival = rivals[racerIndex - 1];
      if (rival) {
        this.safeSetText('ibc-pos', `RACER 0${racerIndex + 1} / 0${totalRacers}`);
        this.safeSetText('ibc-name', rival.name);
        this.safeSetText('ibc-vehicle', rival.spec.vehicleName);
        this.safeSetText('ibc-style', rival.spec.style);
      }
    }
  }

  showCountdownOverlay() {
    const el = document.getElementById('screen-countdown-overlay');
    if (el) {
      el.style.display = 'flex';
      el.style.opacity = '1';
    }
    const num = document.getElementById('countdown-num');
    if (num) {
      num.textContent = '3';
      num.className = 'countdown-number-hero';
    }
    const l1 = document.getElementById('glight-1');
    const l2 = document.getElementById('glight-2');
    const l3 = document.getElementById('glight-3');
    if (l1) l1.className = 'gantry-light red-on';
    if (l2) l2.className = 'gantry-light';
    if (l3) l3.className = 'gantry-light';
  }

  hideCountdownOverlay() {
    const el = document.getElementById('screen-countdown-overlay');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.display = 'none';
      }, 400);
    }
  }

  updateCountdown(timeRemaining, countInt) {
    const el = document.getElementById('screen-countdown-overlay');
    if (!el) return;
    if (el.style.display !== 'flex') {
      el.style.display = 'flex';
      el.style.opacity = '1';
    }

    const l1 = document.getElementById('glight-1');
    const l2 = document.getElementById('glight-2');
    const l3 = document.getElementById('glight-3');
    const num = document.getElementById('countdown-num');
    const sub = document.getElementById('countdown-sub');
    if (!num) return;

    if (timeRemaining > 2.0) {
      if (l1) l1.className = 'gantry-light red-on';
      if (l2) l2.className = 'gantry-light';
      if (l3) l3.className = 'gantry-light';
      if (num.textContent !== '3') {
        num.textContent = '3';
        num.className = 'countdown-number-hero pulse';
        setTimeout(() => { if (num) num.className = 'countdown-number-hero'; }, 150);
      }
      if (sub) sub.textContent = 'SYSTEM CHARGE // 33%';
    } else if (timeRemaining > 1.0) {
      if (l1) l1.className = 'gantry-light red-on';
      if (l2) l2.className = 'gantry-light red-on';
      if (l3) l3.className = 'gantry-light';
      if (num.textContent !== '2') {
        num.textContent = '2';
        num.className = 'countdown-number-hero pulse';
        setTimeout(() => { if (num) num.className = 'countdown-number-hero'; }, 150);
      }
      if (sub) sub.textContent = 'SYSTEM CHARGE // 66%';
    } else if (timeRemaining > 0.0) {
      if (l1) l1.className = 'gantry-light red-on';
      if (l2) l2.className = 'gantry-light red-on';
      if (l3) l3.className = 'gantry-light red-on';
      if (num.textContent !== '1') {
        num.textContent = '1';
        num.className = 'countdown-number-hero pulse';
        setTimeout(() => { if (num) num.className = 'countdown-number-hero'; }, 150);
      }
      if (sub) sub.textContent = 'SYSTEM CHARGE // 100%';
    }
  }

  triggerCountdownGo() {
    const l1 = document.getElementById('glight-1');
    const l2 = document.getElementById('glight-2');
    const l3 = document.getElementById('glight-3');
    const num = document.getElementById('countdown-num');
    const sub = document.getElementById('countdown-sub');

    if (l1) l1.className = 'gantry-light green-on';
    if (l2) l2.className = 'gantry-light green-on';
    if (l3) l3.className = 'gantry-light green-on';

    if (num) {
      num.textContent = 'GO!';
      num.className = 'countdown-number-hero go pulse';
    }
    if (sub) {
      sub.textContent = 'ENGAGE // HYPER DRIVE ACTIVE';
    }

    setTimeout(() => {
      this.hideCountdownOverlay();
    }, 700);
  }

  showActionPopup(name, points, combo = 1) {
    const banner = document.getElementById('rh-action-banner') || this.container.querySelector('#rh-action-banner');
    if (banner) {
      this.safeSetText('rh-action-tag', `+${name}`);
      this.safeSetText('rh-action-pts', points > 0 ? `+${points} PTS` : '');
      this.safeSetText('rh-action-combo', combo > 1 ? `x${combo} COMBO` : '');

      banner.style.display = 'flex';
      banner.classList.remove('pulse-banner');
      void banner.offsetWidth;
      banner.classList.add('pulse-banner');
    }

    // Floating Stunt Score Popups (Right Side Feed)
    const upperName = (name || '').toUpperCase();
    if (upperName.includes('DRIFT')) {
      const el = document.getElementById('stunt-drift-entry');
      const textEl = document.getElementById('stunt-drift-text');
      const ptsEl = document.getElementById('stunt-drift-pts');
      if (el) {
        if (textEl) textEl.textContent = `DRIFT ${points > 0 ? points * 2 : 120}m`;
        if (ptsEl) ptsEl.textContent = `+${points || 200}`;
        el.style.display = 'flex';
        el.classList.add('stunt-pop');
        clearTimeout(this.driftStuntTimeout);
        this.driftStuntTimeout = setTimeout(() => { el.style.display = 'none'; }, 2200);
      }
    } else if (upperName.includes('NEAR MISS')) {
      const el = document.getElementById('stunt-nearmiss-entry');
      const textEl = document.getElementById('stunt-nearmiss-text');
      const ptsEl = document.getElementById('stunt-nearmiss-pts');
      if (el) {
        if (textEl) textEl.textContent = `NEAR MISS x${combo || 2}`;
        if (ptsEl) ptsEl.textContent = `+${points || 100}`;
        el.style.display = 'flex';
        el.classList.add('stunt-pop');
        clearTimeout(this.nearMissStuntTimeout);
        this.nearMissStuntTimeout = setTimeout(() => { el.style.display = 'none'; }, 2200);
      }
    } else if (upperName.includes('NITRO') || upperName.includes('BOOST')) {
      const el = document.getElementById('stunt-nitro-entry');
      const textEl = document.getElementById('stunt-nitro-text');
      const ptsEl = document.getElementById('stunt-nitro-pts');
      if (el) {
        if (textEl) textEl.textContent = 'PERFECT NITRO';
        if (ptsEl) ptsEl.textContent = `+${points || 150}`;
        el.style.display = 'flex';
        el.classList.add('stunt-pop');
        clearTimeout(this.nitroStuntTimeout);
        this.nitroStuntTimeout = setTimeout(() => { el.style.display = 'none'; }, 2200);
      }
    }

    clearTimeout(this.actionTimeout);
    this.actionTimeout = setTimeout(() => {
      if (banner) banner.style.display = 'none';
    }, 1800);
  }

  updateHUD(physics, gameState) {
    if (!physics || !gameState) return;

    const speed = Math.floor(physics.getSpeedKmh());
    this.safeSetText('rh-speed', speed.toString().padStart(3, '0'));

    // Dynamic Gear Indicator (Gears 1 to 7 based on propulsion velocity)
    const gear = speed < 25 ? 1 : speed < 80 ? 2 : speed < 160 ? 3 : speed < 240 ? 4 : speed < 320 ? 5 : speed < 400 ? 6 : 7;
    this.safeSetText('rh-gear', `GEAR ${gear}`);

    // Pink Time Badge
    const timeFormatted = gameState.formatTime(gameState.currentLapTime || gameState.raceTime || 0);
    this.safeSetText('rh-lap-time', `TIME: ${timeFormatted}`);

    // Tachometer fill bar
    const tachoRatio = Math.min(speed / 430.0, 1.0);
    const tachoFill = document.getElementById('rh-tacho-fill') || this.container.querySelector('#rh-tacho-fill');
    if (tachoFill) tachoFill.style.width = `${Math.round(tachoRatio * 100)}%`;

    // Position & Lap (use smoothed displayPosition if available)
    const displayPos = gameState.displayPosition !== undefined ? gameState.displayPosition : gameState.currentPosition;
    this.safeSetHTML('rh-pos', `${displayPos.toString().padStart(2, '0')}<small>/08</small>`);
    const posEl = document.getElementById('rh-pos') || this.container.querySelector('#rh-pos');
    if (posEl) {
      if (displayPos === 1) posEl.classList.add('pos-first');
      else posEl.classList.remove('pos-first');
    }
    this.safeSetHTML('rh-lap', `${gameState.currentLap.toString().padStart(2, '0')}<small>/02</small>`);

    // Race Progress %
    const totalCircuitLaps = 2.0;
    const progressPct = Math.min(100, Math.max(0, Math.floor(((gameState.currentLap - 1 + (physics.currentU || 0)) / totalCircuitLaps) * 100)));
    this.safeSetText('rh-progress-badge', `${progressPct}%`);
    this.safeSetWidth('hud-dual-progress-fill', `${progressPct}%`);

    // Boost meter & reservoir with overdrive pulse effect
    const boostPct = Math.round(physics.boostCapacity * 100);
    const boostFill = document.getElementById('rh-boost-fill') || this.container.querySelector('#rh-boost-fill');
    if (boostFill) {
      boostFill.style.width = `${boostPct}%`;
      // Visual tier styling: OVERDRIVE gets a golden glow
      if (physics.isBoosting && physics.boostTier === 'OVERDRIVE') {
        boostFill.style.background = 'linear-gradient(90deg, #FFB800, #FF6600)';
        boostFill.style.boxShadow = '0 0 12px rgba(255,184,0,0.8)';
      } else if (physics.isBoosting) {
        boostFill.style.background = 'linear-gradient(90deg, #00F0FF, #7928CA)';
        boostFill.style.boxShadow = '0 0 8px rgba(0,240,255,0.6)';
      } else if (physics.boostCapacity >= 0.98) {
        // Full charge indicator: gentle cyan pulse
        boostFill.style.background = 'linear-gradient(90deg, #00F0FF, #00FF88)';
        boostFill.style.boxShadow = '0 0 6px rgba(0,240,255,0.5)';
      } else {
        boostFill.style.background = '';
        boostFill.style.boxShadow = '';
      }
    }

    this.safeSetWidth('hud-dual-nitro-fill', `${boostPct}%`);
    this.safeSetText('rh-boost-pct', `${boostPct}%`);
    this.safeSetText('rh-boost-tier-label', physics.boostTier === 'OVERDRIVE' ? '⚡ OVERDRIVE NITRO' : 'NITRO RESERVOIR');

    // Personal Best Delta display (if available from improved GameState)
    const deltaEl = document.getElementById('rh-pb-delta') || this.container.querySelector('#rh-pb-delta');
    if (deltaEl) {
      if (gameState.lapDeltaToPersonalBest !== null && gameState.lapDeltaToPersonalBest !== undefined) {
        const delta = gameState.lapDeltaToPersonalBest;
        const sign = delta <= 0 ? '' : '+';
        deltaEl.textContent = `PB ${sign}${delta.toFixed(2)}s`;
        deltaEl.style.color = delta <= 0 ? '#00FF88' : '#FF4400';
        deltaEl.style.display = 'block';
      } else {
        deltaEl.style.display = 'none';
      }
    }

    // Live 8-Pilot Leaderboard Tower Update
    if (this.game.rivals) {
      const standings = this.game.rivals.getStandings(physics.totalDistance, 'RANJEET');
      const towerEl = document.getElementById('hud-leaderboard-tower');
      if (towerEl && standings && standings.length >= 8) {
        towerEl.innerHTML = standings.slice(0, 8).map((racer, idx) => {
          const pos = idx + 1;
          const isPlayer = racer.isPlayer;
          return `
            <div class="lbt-item ${isPlayer ? 'player active' : ''}" data-pilot="${racer.name.toLowerCase()}">
              <span class="lbt-pos">${pos}</span>
              <span class="lbt-name">${racer.name}</span>
              ${isPlayer ? '<span class="lbt-you">YOU</span>' : ''}
            </div>
          `;
        }).join('');
      }
    }

    // Drift active popup trigger
    if (physics.isDrifting) {
      const el = document.getElementById('stunt-drift-entry');
      const textEl = document.getElementById('stunt-drift-text');
      const ptsEl = document.getElementById('stunt-drift-pts');
      if (el) {
        const driftM = Math.floor(physics.driftDuration * 45);
        if (textEl) textEl.textContent = `DRIFT ${driftM}m`;
        if (ptsEl) ptsEl.textContent = `+${Math.max(100, Math.floor(physics.totalDriftScore))}`;
        el.style.display = 'flex';
      }
    }

    // Slipstream drafting indicator
    const slipstreamBanner = document.getElementById('rh-slipstream-banner') || this.container.querySelector('#rh-slipstream-banner');
    if (slipstreamBanner) {
      slipstreamBanner.style.display = physics.isSlipstreaming ? 'flex' : 'none';
    }
  }

  updateDistrictHUD(district) {
    if (!district) return;
    if (this.lastDistrictId !== district.id) {
      this.lastDistrictId = district.id;
      const banner = document.getElementById('rh-district-banner') || this.container.querySelector('#rh-district-banner');
      const nameEl = document.getElementById('rh-district-name') || this.container.querySelector('#rh-district-name');
      if (banner && nameEl) {
        nameEl.textContent = `${district.name} // ${district.subtitle || 'SECTOR'}`;
        banner.style.display = 'flex';
        clearTimeout(this.districtTimeout);
        this.districtTimeout = setTimeout(() => {
          banner.style.display = 'none';
        }, 3400);
      }
    }
  }

  updateCameraBadge(mode) {
    const btn = document.getElementById('btn-camera-hud') || this.container.querySelector('#btn-camera-hud');
    if (btn) {
      btn.textContent = `🎥 CAM: ${mode}`;
    }
  }

  // Sector time & PB delta HUD — called from main.js after updateHUD in RACING state
  updateSectorHUD(currentSector, lapDeltaToPB, zoneColor) {
    // Sector indicator (S1/S2/S3)
    const sectorEl = document.getElementById('rh-sector-label') || this.container.querySelector('#rh-sector-label');
    if (sectorEl) {
      const labels = ['S1', 'S2', 'S3'];
      sectorEl.textContent = labels[Math.min(currentSector, 2)] || 'S1';
      sectorEl.style.display = 'block';
    }

    // Zone color (Zone mode) — tint the boost bar container
    if (zoneColor) {
      const boostContainer = document.getElementById('rh-boost-fill') || this.container.querySelector('#rh-boost-fill');
      if (boostContainer && boostContainer.parentElement) {
        boostContainer.parentElement.style.borderColor = zoneColor;
      }
    }
  }

  // Flash the boost bar white for 1 frame on full recharge — called from main.js when boostJustFilled
  flashBoostBar() {
    const boostFill = document.getElementById('rh-boost-fill') || this.container.querySelector('#rh-boost-fill');
    if (!boostFill) return;

    // White flash overlay
    boostFill.style.transition = 'background 0.05s ease';
    boostFill.style.background = '#FFFFFF';
    boostFill.style.boxShadow = '0 0 20px rgba(255,255,255,0.9)';

    setTimeout(() => {
      // Fade back to cyan over 200ms
      boostFill.style.transition = 'background 0.2s ease, box-shadow 0.2s ease';
      boostFill.style.background = 'linear-gradient(90deg, #00F0FF, #00FF88)';
      boostFill.style.boxShadow = '0 0 8px rgba(0,240,255,0.5)';
    }, 80);

    // Also flash the percentage text
    const boostPct = document.getElementById('rh-boost-pct') || this.container.querySelector('#rh-boost-pct');
    if (boostPct) {
      boostPct.style.color = '#FFFFFF';
      boostPct.style.textShadow = '0 0 8px #00F0FF';
      setTimeout(() => {
        boostPct.style.color = '';
        boostPct.style.textShadow = '';
      }, 300);
    }
  }

  updateGhostDeltaHUD(timeDelta, isGhostAhead) {
    const el = document.getElementById('rh-ghost-delta') || this.container.querySelector('#rh-ghost-delta');
    const valEl = document.getElementById('rh-ghost-delta-val') || this.container.querySelector('#rh-ghost-delta-val');
    if (!el || !valEl) return;


    el.style.display = 'flex';
    const sign = timeDelta >= 0 ? '+' : '';
    valEl.textContent = `${sign}${timeDelta.toFixed(2)}s`;

    if (timeDelta <= 0) {
      valEl.className = 'delta-ahead'; // green/cyan (player leading)
    } else {
      valEl.className = 'delta-behind'; // orange/red (ghost leading)
    }
  }

  showResults(physics, gameState) {
    this.showScreen('RESULTS');

    const pos = gameState.currentPosition;
    this.safeSetText('res-pos-num', pos.toString().padStart(2, '0'));
    this.safeSetText('res-pos-word', pos === 1 ? '1ST PLACE // VICTORY' : `${pos}TH PLACE // COMPLETE`);

    this.safeSetText('res-total-time', gameState.formatTime(gameState.raceTime));
    this.safeSetText('res-best-lap', gameState.formatTime(gameState.bestLapTime));
    this.safeSetText('res-top-speed', `${Math.floor(physics.maxSpeedKmh)} KM/H`);
    this.safeSetText('res-stunts', physics.totalStunts.toString());
    this.safeSetText('res-drift', `${Math.floor(physics.totalDriftDistance)} M`);
    this.safeSetText('res-near-miss', physics.totalNearMisses.toString());
    this.safeSetText('res-score', `${physics.totalScore.toLocaleString()} PTS`);

    const statusEl = document.getElementById('res-upload-status') || this.container.querySelector('#res-upload-status');
    if (statusEl) statusEl.style.display = 'none';
  }

  setupPodiumOverlay(standings) {
    if (!standings || standings.length < 3) return;
    this.safeSetText('podium-1st-name', standings[0].name);
    this.safeSetText('podium-1st-team', standings[0].team);

    this.safeSetText('podium-2nd-name', standings[1].name);
    this.safeSetText('podium-2nd-team', standings[1].team);

    this.safeSetText('podium-3rd-name', standings[2].name);
    this.safeSetText('podium-3rd-team', standings[2].team);
  }

  showWinningLobby(streak = 3, level = 7, xpGained = 1250) {
    this.showScreen('WINNING_LOBBY');
    this.safeSetText('win-streak-badge', `WIN STREAK: 0${streak} WINS`);
    this.safeSetText('wxp-earned', `+${xpGained} XP`);
    this.safeSetText('wxp-level', `LEVEL 0${level}`);

    const fill = document.getElementById('wxp-fill') || this.container.querySelector('#wxp-fill');
    if (fill) {
      fill.style.width = '30%';
      setTimeout(() => {
        fill.style.width = '85%';
      }, 300);
    }
  }

  async showLeaderboardModal() {
    this.showScreen('LEADERBOARD');
    if (this.game.garageLobby) {
      this.game.garageLobby.setCameraAnglePreset('MODAL');
    }
    const tbody = document.getElementById('leaderboard-rows-body') || this.container.querySelector('#leaderboard-rows-body');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="lb-loading"><span class="pulse-marker"></span> QUERYING ORBITAL TELEMETRY RELAY...</td></tr>`;
    }

    // Ping check
    const status = await backendService.checkStatus();
    this.updateCloudStatusBadge(status.online, status.ping);

    const data = await backendService.getLeaderboard(50);
    this.cachedLeaderboard = data;
    this.renderLeaderboardRows('all');
  }

  renderLeaderboardRows(filter = 'all') {
    const tbody = document.getElementById('leaderboard-rows-body') || this.container.querySelector('#leaderboard-rows-body');
    if (!tbody || !this.cachedLeaderboard) return;

    let entries = this.cachedLeaderboard.leaderboard || [];

    if (filter === 'dev') {
      entries = entries.filter(e => e.pilotName === 'RANJEET' || e.badge === 'DEV_RECORD');
    } else if (filter === 'rivals') {
      entries = entries.filter(e => e.badge === 'AI_LEGEND' || e.badge === 'PRO_PILOT');
    }

    if (entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="lb-empty">NO TELEMETRY MATCHING FILTER</td></tr>`;
      return;
    }

    tbody.innerHTML = entries.map((item, idx) => {
      const isPlayer = item.pilotName === 'RANJEET';
      const rankBadge = item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : item.rank === 3 ? 'bronze' : '';
      const tagText = item.badge === 'DEV_RECORD' ? '★ CREATOR' : item.badge === 'AI_LEGEND' ? 'AI BOSS' : 'VERIFIED';

      return `
        <tr class="${isPlayer ? 'player-row' : ''}">
          <td class="col-rank"><span class="rank-pill ${rankBadge}">#0${item.rank}</span></td>
          <td class="col-pilot">
            <strong>${item.pilotName}</strong>
            <small>${item.callsign || 'PILOT'}</small>
          </td>
          <td class="col-vehicle">${item.vehicleName || 'F-8000 // NIGHTRIFT'}</td>
          <td class="col-time"><strong>${item.lapTimeFormatted}</strong></td>
          <td class="col-spd">${item.topSpeed} KM/H</td>
          <td class="col-drift">${(item.driftScore || 0).toLocaleString()} PTS</td>
          <td class="col-badge"><span class="verified-tag ${item.badge}">${tagText}</span></td>
        </tr>
      `;
    }).join('');
  }

  updateCloudStatusBadge(online, ping = 18) {
    const textEl = document.getElementById('cloud-status-text') || this.container.querySelector('#cloud-status-text');
    const badgeEl = document.getElementById('lobby-cloud-badge') || this.container.querySelector('#lobby-cloud-badge');
    const relayText = document.getElementById('lh-relay-text') || this.container.querySelector('#lh-relay-text');

    if (online) {
      if (textEl) textEl.textContent = `CLOUD: ONLINE ${ping}ms`;
      if (badgeEl) badgeEl.className = 'currency-pill cloud online';
      if (relayText) relayText.textContent = `EDGE RELAY: TOKYO-01 // ${ping}ms`;
    } else {
      if (textEl) textEl.textContent = `CLOUD: OFFLINE LOCAL`;
      if (badgeEl) badgeEl.className = 'currency-pill cloud offline';
      if (relayText) relayText.textContent = `EDGE RELAY: OFFLINE // LOCAL STORAGE`;
    }
  }

  updatePreRaceProgress(pct) {
    this.safeSetWidth('pr-progress-fill', `${pct}%`);
    this.safeSetText('pr-loading-pct', `${pct}%`);
    if (pct >= 85) {
      this.safeSetText('pr-loading-msg', 'SYNCHRONIZING ORBITAL GRID... READY TO LAUNCH');
    }
  }

  updatePostSyncProgress(pct) {
    this.safeSetWidth('post-sync-fill', `${pct}%`);
    this.safeSetText('post-sync-pct', `${pct}%`);
  }

  claimPubgRewards() {
    if (this.game.saveManager) {
      this.game.saveManager.credits = (this.game.saveManager.credits || 0) + 5000;
      this.game.saveManager.pilotLevel = (this.game.saveManager.pilotLevel || 48) + 1;
      this.game.saveManager.save();
    }
    this.safeSetText('lobby-credits-val', (this.game.saveManager?.credits || 129500).toLocaleString());
    this.safeSetText('lobby-level-val', `LVL ${(this.game.saveManager?.pilotLevel || 49)}`);
    this.showScreen('LOBBY');
    this.game.returnToLobby();
  }
}
