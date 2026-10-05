import * as THREE from 'three';
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

export const TPP_CAMERA_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cam-svg-logo"><polygon points="12 2 19 11 5 11" fill="currentColor" fill-opacity="0.25"/><line x1="12" y1="11" x2="12" y2="16"/><rect x="8" y="16" width="8" height="6" rx="1.5"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/><line x1="5" y1="11" x2="19" y2="11"/></svg>`;

export const FPP_CAMERA_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cam-svg-logo"><path d="M3 8 C6 4 18 4 21 8"/><circle cx="12" cy="12" r="4" stroke-dasharray="3 1.5"/><line x1="12" y1="5" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="5" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="19" y2="12"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M7 21 C9 18 15 18 17 21" stroke-width="2.2"/></svg>`;

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

export const ROYAL_PASS_SEASON_1_TIERS = [
  { tier: 1, title: 'GENESIS CYAN LIVERY', icon: '🎨', reward: { credits: 5000, tokens: 50, item: 'Livery: Genesis Cyan' }, type: 'free' },
  { tier: 2, title: '+10,000 CREDITS', icon: 'Ȼ', reward: { credits: 10000, tokens: 0 }, type: 'free' },
  { tier: 3, title: 'ION DRIFT BOOSTERS', icon: '⚡', reward: { credits: 12000, tokens: 50, item: 'Part: Ion Boosters' }, type: 'elite' },
  { tier: 4, title: 'NEON UNDERGLOW: VIOLET', icon: '💜', reward: { credits: 15000, tokens: 100, item: 'Neon Underglow' }, type: 'elite' },
  { tier: 5, title: '+250 PREMIUM TOKENS', icon: '◈', reward: { credits: 0, tokens: 250 }, type: 'free' },
  { tier: 6, title: 'CONFORMAL ION SHIELD V2', icon: '🛡️', reward: { credits: 20000, tokens: 50, item: 'Shield V2' }, type: 'elite' },
  { tier: 7, title: '+25,000 CREDITS', icon: 'Ȼ', reward: { credits: 25000, tokens: 0 }, type: 'free' },
  { tier: 8, title: 'TITANIUM AERO WING', icon: '🚀', reward: { credits: 15000, tokens: 100, item: 'Part: Aero Wing' }, type: 'elite' },
  { tier: 9, title: 'VORTEX NITRO EXHAUST', icon: '🔥', reward: { credits: 20000, tokens: 50, item: 'VFX: Vortex Exhaust' }, type: 'elite' },
  { tier: 10, title: '+350 PREMIUM TOKENS', icon: '◈', reward: { credits: 0, tokens: 350 }, type: 'free' },
  { tier: 11, title: 'S-CLASS ENGINE TUNING', icon: '💎', reward: { credits: 30000, tokens: 100, item: 'Part: S-Class ECU' }, type: 'elite' },
  { tier: 12, title: '+40,000 CREDITS', icon: 'Ȼ', reward: { credits: 40000, tokens: 0 }, type: 'free' },
  { tier: 13, title: 'SPECTRA CHAMELEON PAINT', icon: '🎨', reward: { credits: 20000, tokens: 150, item: 'Paint: Chameleon' }, type: 'elite' },
  { tier: 14, title: 'QUANTUM OVERDRIVE CORE', icon: '⚡', reward: { credits: 35000, tokens: 100, item: 'Part: Overdrive Core' }, type: 'elite' },
  { tier: 15, title: '+500 PREMIUM TOKENS', icon: '◈', reward: { credits: 0, tokens: 500 }, type: 'free' },
  { tier: 16, title: 'APHELION ELITE PILOT SUIT', icon: '🏆', reward: { credits: 40000, tokens: 200, item: 'Suit: Aphelion Elite' }, type: 'elite' },
  { tier: 17, title: '+60,000 CREDITS', icon: 'Ȼ', reward: { credits: 60000, tokens: 0 }, type: 'free' },
  { tier: 18, title: 'CARBON MONOCOQUE CHASSIS', icon: '🚀', reward: { credits: 50000, tokens: 250, item: 'Chassis: Carbon Monocoque' }, type: 'elite' },
  { tier: 19, title: '+750 PREMIUM TOKENS', icon: '◈', reward: { credits: 0, tokens: 750 }, type: 'free' },
  { tier: 20, title: '24K GOLDEN HYPERCAR', icon: '👑', reward: { credits: 100000, tokens: 1000, item: 'Vehicle: 24K Golden Hypercar Prototype' }, type: 'elite', isPinnacle: true }
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

    // High-performance cached DOM helpers (prevents DOM layout thrashing & repeat queries)
    this._domCache = new Map();
    const getEl = (id) => {
      let el = this._domCache.get(id);
      if (!el || !el.isConnected) {
        el = document.getElementById(id) || (this.container ? this.container.querySelector('#' + id) : null);
        if (el) this._domCache.set(id, el);
      }
      return el;
    };

    this.safeSetText = (id, text) => {
      const el = getEl(id);
      if (el && el.textContent !== text) el.textContent = text;
    };
    this.safeSetHTML = (id, html) => {
      const el = getEl(id);
      if (el && el.innerHTML !== html) el.innerHTML = html;
    };
    this.safeSetWidth = (id, width) => {
      const el = getEl(id);
      if (el && el.style.width !== width) el.style.width = width;
    };
    this.safeBind = (id, event, handler) => {
      const el = getEl(id);
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
    this.dailyClaimed = false;

    // Leaderboard & Royal Pass State
    this.leaderboardTrack = 'shinjuku';
    this.leaderboardFilter = 'all';
    this.leaderboardSearch = '';
    this.royalPassViewTrack = 'elite';

    this.buildAllDOM();
    this.setupEventListeners();
    this.startLoadingRainEffect();
  }

  buildAllDOM() {
    this.container.innerHTML = `
      <!-- OMNIPRESENT REAL-TIME CYBERPUNK FPS & TELEMETRY HUD (Active across all screens) -->
      <div id="perf-fps-meter-overlay" class="perf-fps-meter-overlay" style="display: none;" title="Toggle FPS Meter [F3]">
        <div class="perf-fps-badge">
          <span class="perf-dot" id="perf-status-dot"></span>
          <span class="perf-val-bold" id="perf-global-fps">60</span>
          <span class="perf-unit-label">FPS</span>
          <span class="perf-pipe">|</span>
          <span class="perf-ms-text" id="perf-global-ms">16.6ms</span>
          <span class="perf-pipe">|</span>
          <span class="perf-min-label">MIN</span>
          <span class="perf-min-val" id="perf-global-min">58</span>
          <span class="perf-pipe">|</span>
          <span class="perf-quality-chip" id="perf-global-quality">HIGH</span>
          <span class="perf-f3-tag">[F3]</span>
        </div>
      </div>

      <!-- 1. DEVELOPER CREDIT -->
      <div id="screen-dev-credit" class="ui-screen dev-credit-overlay" style="cursor: pointer;">
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
          <div class="dev-skip-hint" style="font-family: var(--font-mono); font-size: 11px; color: var(--color-cyan); margin-top: 18px; letter-spacing: 2px; text-shadow: 0 0 8px #00F0FF;">CLICK ANYWHERE OR PRESS [SPACE / ENTER] TO START ►</div>
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
            <button class="top-nav-btn active" data-tab="race">RACE</button>
            <button class="top-nav-btn" data-tab="garage">GARAGE</button>
            <button class="top-nav-btn" data-tab="cars">CARS</button>
            <button class="top-nav-btn" data-tab="career">CAREER</button>
            <button class="top-nav-btn" data-tab="events">EVENTS</button>
            <button class="top-nav-btn" data-tab="leaderboard">LEADERBOARD</button>
            <button class="top-nav-btn" data-tab="shop">SHOP</button>
            <button class="top-nav-btn" data-tab="settings">SETTINGS</button>
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

        <!-- Left Column: Player Profile + Main Vehicle Panel -->
        <div class="lobby-left-column">
          <div class="lobby-profile-card">
            <div class="profile-avatar-wrap">
              <div class="profile-avatar">RK</div>
              <div class="profile-badge-ring"></div>
            </div>
            <div class="profile-meta">
              <div class="profile-name-row">
                <strong id="lobby-player-name">RANJEET</strong>
                <span class="profile-lvl-badge" id="lobby-lvl-badge">LVL 87</span>
              </div>
              <div class="profile-rank-tag" id="lobby-rank-tag">GRANDMASTER // ORBITAL ELITE</div>
              <div class="profile-xp-bar-track">
                <div class="profile-xp-fill" id="lobby-xp-fill" style="width: 70%"></div>
              </div>
              <small class="xp-ratio" id="lobby-xp-ratio">8,450 / 12,000 XP</small>
            </div>
          </div>

          <!-- Main Vehicle Panel -->
          <div class="lobby-main-vehicle-panel" id="lobby-main-vehicle-panel">
            <div class="lmv-header">
              <div class="lmv-badge-row">
                <span class="lmv-rarity pinnacle" id="lobby-v-rarity">PINNACLE</span>
                <span class="lmv-class" id="lobby-v-class">S-CLASS HYPERCAR</span>
                <span class="lmv-pr" id="lobby-v-pr">PR 955</span>
              </div>
              <h3 class="lmv-name" id="lobby-v-name">F-8000 // NIGHTRIFT</h3>
            </div>
            <div class="lmv-stats-bars">
              <div class="lmv-bar-row">
                <span class="lmv-lbl">TOP SPEED</span>
                <div class="lmv-track"><div class="lmv-fill spd" id="lobby-sbf-spd" style="width: 94%"></div></div>
                <strong class="lmv-val" id="lobby-sb-spd">420 KM/H</strong>
              </div>
              <div class="lmv-bar-row">
                <span class="lmv-lbl">ACCEL</span>
                <div class="lmv-track"><div class="lmv-fill acc" id="lobby-sbf-acc" style="width: 96%"></div></div>
                <strong class="lmv-val" id="lobby-sb-acc">9.6</strong>
              </div>
              <div class="lmv-bar-row">
                <span class="lmv-lbl">HANDLING</span>
                <div class="lmv-track"><div class="lmv-fill hnd" id="lobby-sbf-hnd" style="width: 88%"></div></div>
                <strong class="lmv-val" id="lobby-sb-hnd">8.8</strong>
              </div>
              <div class="lmv-bar-row">
                <span class="lmv-lbl">BOOST</span>
                <div class="lmv-track"><div class="lmv-fill bst" id="lobby-sbf-bst" style="width: 94%"></div></div>
                <strong class="lmv-val" id="lobby-sb-bst">9.4</strong>
              </div>
            </div>
            <div class="lmv-actions">
              <button class="btn-lobby-vaction" id="btn-lobby-quick-customize">⚙ CUSTOMIZE</button>
              <button class="btn-lobby-vaction" id="btn-lobby-quick-cars">◄► CHANGE FLEET</button>
            </div>
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

        <!-- Right Column: Compact Next Event Panel + Season 01 & Daily Rewards -->
        <div class="lobby-right-column">
          <!-- Compact Next Event Panel -->
          <div class="lobby-next-event-panel" id="lobby-next-event-panel">
            <div class="lne-header">
              <span class="pulse-marker red"></span>
              <strong>NEXT EVENT</strong>
              <span class="lne-timer" id="lne-timer">00:04:32</span>
            </div>
            <div class="lne-body">
              <div class="lne-title-wrap">
                <h4>NEO-SHINJUKU MIDNIGHT CUP</h4>
                <small class="lne-track-sub">NEO-SHINJUKU RIFT // SECTOR 07</small>
              </div>
              <div class="lne-meta-chips">
                <span class="lne-chip diff">RANKED S-CLASS</span>
                <span class="lne-chip reward">25,000 Ȼ + 2,500 XP</span>
              </div>
              <div class="lne-preview-thumb">
                <img src="/images/event_midnight_cup.jpg" alt="Neo-Shinjuku Midnight Cup Poster" class="lne-poster-img" />
                <div class="lne-scan-line"></div>
                <div class="lne-thumb-grid"></div>
                <div class="lne-poster-overlay">
                  <span class="lne-thumb-tag"><span class="pulse-marker red"></span> CIRCUIT PREVIEW</span>
                  <span class="lne-circuit-badge">SECTOR 07 // MIDNIGHT CUP</span>
                </div>
              </div>
              <button class="btn-next-event-play" id="btn-next-event-play">ENTER EVENT ►</button>
            </div>
          </div>

          <div class="lobby-season-card" id="card-season-pass">
            <div class="lsc-top-row">
              <span class="lsc-tag">CURRENT SEASON</span>
              <span class="lsc-live-badge"><span class="pulse-marker green"></span> LIVE</span>
            </div>
            <h3>SEASON 01</h3>
            <div class="lsc-sub">ROYAL PASS // 360 GOLDEN CAR</div>
            <div class="lsc-xp-bar-wrap">
              <div class="lsc-xp-bar">
                <div class="lsc-xp-fill" id="lsc-xp-fill" style="width: 58%"></div>
              </div>
              <div class="lsc-xp-labels">
                <span id="lsc-tier-text">TIER 12 / 25</span>
                <span id="lsc-xp-text">1,450 / 2,000 XP</span>
              </div>
            </div>
            <p>Compete in Sector 07 and showcase the exclusive 24K Golden Hypercar.</p>
            <button class="btn-season-view" id="btn-season-view">👑 ROYAL PASS 360 ►</button>
          </div>

          <div class="lobby-daily-reward-card" id="card-daily-rewards">
            <div class="ldr-header">
              <span class="ldr-icon">🎁</span>
              <div>
                <strong>DAILY REWARDS</strong>
                <small id="ldr-status">READY TO CLAIM</small>
              </div>
              <span class="ldr-streak-pill" id="ldr-streak-pill">DAY 3 STREAK 🔥</span>
            </div>
            <button class="btn-claim-reward" id="btn-claim-daily">CLAIM NOW (+1,500 Ȼ)</button>
          </div>
        </div>

        <!-- Bottom Track Carousel & Giant Primary CTA -->
        <div class="lobby-bottom-bar">
          <div class="track-carousel" id="lobby-track-carousel">
            <div class="track-card active" data-track="shinjuku">
              <div class="tc-thumb tc-shinjuku">
                <span class="tc-weather-badge">NIGHT // CYBERPUNK</span>
                <span class="tc-diff-badge easy">NORMAL</span>
              </div>
              <div class="tc-info">
                <span class="tc-type">SECTOR 01 // HIGHWAY RIFT</span>
                <strong>NEO-SHINJUKU</strong>
                <div class="tc-stats-row">
                  <span>3.8 KM • 2 LAPS</span>
                  <span>EST. 02:24</span>
                  <span>8 RACERS</span>
                </div>
                <div class="tc-detail-row">
                  <span class="tc-reward">REWARD: 12,500 Ȼ + 1,200 XP</span>
                  <span class="tc-rival">RIVAL: RYUKI</span>
                </div>
              </div>
            </div>
            <div class="track-card" data-track="fuji">
              <div class="tc-thumb tc-fuji">
                <span class="tc-weather-badge">ALPINE // CLEAR</span>
                <span class="tc-diff-badge medium">CLASS A</span>
              </div>
              <div class="tc-info">
                <span class="tc-type">SECTOR 03 // MOUNTAIN DRIFT</span>
                <strong>FUJI SKYWAY</strong>
                <div class="tc-stats-row">
                  <span>4.5 KM • 2 LAPS</span>
                  <span>EST. 02:45</span>
                  <span>8 RACERS</span>
                </div>
                <div class="tc-detail-row">
                  <span class="tc-reward">REWARD: 14,000 Ȼ + 1,400 XP</span>
                  <span class="tc-rival">RIVAL: KAITO</span>
                </div>
              </div>
            </div>
            <div class="track-card" data-track="district">
              <div class="tc-thumb tc-district">
                <span class="tc-weather-badge">DUSK // NEON RAIN</span>
                <span class="tc-diff-badge hard">HARD</span>
              </div>
              <div class="tc-info">
                <span class="tc-type">SECTOR 05 // ELIMINATION</span>
                <strong>NIGHT DISTRICT</strong>
                <div class="tc-stats-row">
                  <span>5.0 KM • 3 LAPS</span>
                  <span>EST. 03:10</span>
                  <span>8 RACERS</span>
                </div>
                <div class="tc-detail-row">
                  <span class="tc-reward">REWARD: 16,500 Ȼ + 1,650 XP</span>
                  <span class="tc-rival">RIVAL: HARUTO</span>
                </div>
              </div>
            </div>
            <div class="track-card" data-track="coastline">
              <div class="tc-thumb tc-coastline">
                <span class="tc-weather-badge">OCEAN // STORM</span>
                <span class="tc-diff-badge extreme">EXTREME</span>
              </div>
              <div class="tc-info">
                <span class="tc-type">SECTOR 02 // HYPERWAY</span>
                <strong>COASTLINE</strong>
                <div class="tc-stats-row">
                  <span>5.4 KM • 3 LAPS</span>
                  <span>EST. 02:50</span>
                  <span>8 RACERS</span>
                </div>
                <div class="tc-detail-row">
                  <span class="tc-reward">REWARD: 18,000 Ȼ + 1,800 XP</span>
                  <span class="tc-rival">RIVAL: SORA</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Primary CTA Button -->
          <div class="lobby-play-cta">
            <button id="btn-lobby-play" class="btn-primary-glow">
              <span class="cta-subtitle">SECTOR 07 // AETHER SKYWAY</span>
              <strong class="cta-title">RACE NOW ►</strong>
            </button>
          </div>

          <!-- Bottom Subtle Navigation Hints Bar -->
          <div class="lobby-bottom-hints" id="lobby-bottom-hints">
            <button class="lbh-item" data-hint="garage">GARAGE</button>
            <span class="lbh-dot">•</span>
            <button class="lbh-item" data-hint="customize">CUSTOMIZE</button>
            <span class="lbh-dot">•</span>
            <button class="lbh-item" data-hint="cars">CHANGE VEHICLE</button>
            <span class="lbh-dot">•</span>
            <button class="lbh-item" data-hint="profile">PROFILE</button>
            <span class="lbh-dot">•</span>
            <button class="lbh-item" data-hint="settings">SETTINGS</button>
          </div>
        </div>
      </div>

      <!-- 5.4 ROYAL PASS 360 GOLDEN CAR SHOWCASE LOBBY -->
      <div id="screen-royal-pass" class="ui-screen" style="display: none;">
        <div class="royal-pass-header-bar">
          <div class="rph-title-group">
            <span class="rph-crown-icon">👑</span>
            <div>
              <h2>ROYAL PASS // SEASON 01 [GENESIS ELITE]</h2>
              <small>EXCLUSIVE 24K GOLD PROTOTYPE HYPERCAR // 360° SHOWROOM</small>
            </div>
          </div>
          <div class="rph-stats-group">
            <div class="rph-stat">
              <span>SEASON LEVEL:</span>
              <strong id="rp-stat-tier">TIER 12 / 25</strong>
            </div>
            <div class="rph-stat">
              <span>PRESTIGE XP:</span>
              <strong class="gold-text" id="rp-stat-xp">1,450 / 2,000 XP</strong>
            </div>
          </div>
          <div class="rph-header-actions">
            <button class="btn-rp-boost" id="btn-rp-test-boost">⚡ +500 SEASON XP</button>
            <button class="btn-royal-back" id="btn-royal-pass-back">◄ BACK TO MAIN LOBBY</button>
          </div>
        </div>

        <div class="royal-pass-center-hint">
          <div class="rph-gold-badge">★ 24K MIRROR GOLD EDITION // 360° ROTATION ★</div>
          <div class="rp-showroom-controls">
            <span class="rp-cam-label">CAMERA:</span>
            <button class="rp-cam-btn active" data-cam="FRONT">FRONT</button>
            <button class="rp-cam-btn" data-cam="SIDE">SIDE</button>
            <button class="rp-cam-btn" data-cam="REAR">REAR</button>
            <button class="rp-cam-btn" data-cam="TOP">TOP</button>
            <button class="rp-cam-btn" data-cam="LOW ANGLE">LOW</button>
          </div>
          <div class="rph-drag-hint">◄ DRAG MOUSE / TOUCH TO ROTATE 360° // SCROLL TO ZOOM ►</div>
        </div>

        <div class="royal-pass-bottom-track">
          <div class="rp-track-header">
            <div class="rp-pass-type-toggle">
              <button class="rp-pill free" id="btn-rp-tab-free">FREE PASS</button>
              <button class="rp-pill elite active" id="btn-rp-tab-elite">👑 ELITE PASS [ACTIVE]</button>
            </div>
            <div class="rp-actions-right">
              <span class="rp-ready-count-badge" id="rp-ready-count-badge">0 REWARDS READY</span>
              <button class="btn-claim-all-rp" id="btn-claim-royal-rewards">🎁 CLAIM ALL UNLOCKED REWARDS</button>
            </div>
          </div>

          <div class="rp-tiers-scroll" id="rp-tiers-scroll">
            <!-- Dynamically populated by renderRoyalPassTiers() -->
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
            <div style="margin-top: 14px; text-align: center;">
              <button id="btn-match-launch-now" class="btn-action-primary" style="padding: 10px 24px; font-size: 13px; letter-spacing: 2px; cursor: pointer;">⚡ LAUNCH RACE NOW [SPACE / ENTER] ►</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PRE-RACE TRACK LOADING SCREEN (AAA CINEMATIC 3D TRACK FLY-THROUGH) -->
      <div id="screen-pre-race-loading" class="ui-screen" style="display: none; pointer-events: auto;">
        <div class="pre-race-backdrop live-3d-backdrop">
          <div class="pr-scanline-grid"></div>
          <div class="pr-vignette"></div>
          <div class="pr-hud-flicker"></div>
        </div>
        <div class="pre-race-content">
          <!-- Top Loading Status Bar -->
          <div class="pr-top-status-bar">
            <div class="pr-status-badge">
              <span class="pulse-marker cyan"></span>
              <strong class="pr-status-tag">RACE INITIALIZING</strong>
              <span class="pr-badge-pipe">|</span>
              <span class="pr-sub-grid-status">ORBITAL GRID SYNCHRONIZED</span>
            </div>
            <div class="pr-tech-indicator">
              <span class="pr-radar-spin"></span>
              <span id="pr-feed-fps">TELEMETRY LINK: 120 FPS // 18ms</span>
            </div>
          </div>

          <!-- Center Loading Information -->
          <div class="pr-center-info-hero">
            <div class="pr-track-sub-tag">CIRCUIT SECTOR BRIEFING</div>
            <h1 class="pr-hero-track-name" id="pr-hero-track-name">NEON HORIZON</h1>
            <div class="pr-hero-location" id="pr-hero-location">MEGACITY SECTOR 07</div>
            <div class="pr-hero-sub-stats" id="pr-hero-sub-stats">
              <span>LAP 03</span> • <span>8.4 KM</span> • <span>NIGHT</span> • <span>RANKED RACE</span>
            </div>
          </div>

          <!-- Small Vehicle Cards: Player vs Opponent -->
          <div class="pr-versus-container compact">
            <div class="pr-versus-card player-side">
              <div class="pr-card-badge">★ PLAYER ★</div>
              <div class="pr-pilot-info">
                <div class="pr-avatar avatar-you">RK</div>
                <div class="pr-meta-group">
                  <h3 id="pr-player-pilot-name">RANJEET</h3>
                  <span class="pr-team" id="pr-player-team">TEAM APHELION</span>
                  <div class="pr-stat-chips">
                    <span class="pr-chip elo" id="pr-player-lvl">LVL 87</span>
                    <span class="pr-chip record" id="pr-player-rank">RANK #01</span>
                  </div>
                </div>
              </div>
              <div class="pr-vehicle-info">
                <div class="pr-v-row">
                  <span class="pr-vname" id="pr-player-veh-name">F-8000 // NIGHTRIFT</span>
                  <span class="pr-vclass" id="pr-player-veh-class">S-CLASS • PR 940</span>
                </div>
              </div>
            </div>

            <div class="pr-versus-badge">
              <span class="vs-text">VS</span>
              <div class="vs-energy-ring"></div>
            </div>

            <div class="pr-versus-card rival-side">
              <div class="pr-card-badge red">CHALLENGER // OPPONENT</div>
              <div class="pr-pilot-info">
                <div class="pr-avatar avatar-rival">RY</div>
                <div class="pr-meta-group">
                  <h3 id="pr-rival-pilot-name">RYUKI</h3>
                  <span class="pr-team">TOKYO KINETICS</span>
                  <div class="pr-stat-chips">
                    <span class="pr-chip elo">LVL 85</span>
                    <span class="pr-chip record">RANK #02</span>
                  </div>
                </div>
              </div>
              <div class="pr-vehicle-info">
                <div class="pr-v-row">
                  <span class="pr-vname">AURORA FALCON</span>
                  <span class="pr-vclass">S-CLASS • PR 935</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Futuristic Multi-Stage Progress Bar & Checklist -->
          <div class="pr-loading-center-block">
            <div class="pr-stages-checklist" id="pr-stages-checklist">
              <div class="psc-item done" id="psc-track"><span class="psc-check">✓</span> <span class="psc-label">INITIALIZING TRACK</span></div>
              <div class="psc-item done" id="psc-veh"><span class="psc-check">✓</span> <span class="psc-label">LOADING VEHICLES</span></div>
              <div class="psc-item done" id="psc-opp"><span class="psc-check">✓</span> <span class="psc-label">SYNCING OPPONENTS</span></div>
              <div class="psc-item active" id="psc-grav"><span class="psc-check">...</span> <span class="psc-label">CALIBRATING GRAVITY</span></div>
              <div class="psc-item pending" id="psc-prep"><span class="psc-check">...</span> <span class="psc-label">PREPARING RACE</span></div>
            </div>

            <div class="pre-race-loading-footer">
              <div class="pr-progress-header">
                <span id="pr-loading-msg">CALIBRATING GRAVITY FIELDS...</span>
                <strong id="pr-loading-pct">LOADING 67%</strong>
              </div>
              <div class="pr-progress-track">
                <div id="pr-progress-fill" class="pr-progress-fill" style="width: 67%"></div>
                <div class="pr-scan-beam" id="pr-scan-beam"></div>
              </div>
              <div style="margin-top: 10px; text-align: center;">
                <button id="btn-pr-skip" class="btn-action-primary" style="padding: 9px 24px; font-size: 12px; letter-spacing: 2px; cursor: pointer;">START RACE NOW [SPACE / ENTER] ►</button>
              </div>
            </div>
          </div>

          <!-- Bottom Telemetry Row: Rotating Racing Tip + System Status -->
          <div class="pr-bottom-telemetry-row">
            <div class="pr-tip-box" id="pr-tip-box">
              <span class="ptb-tag">💡 RACING TIP</span>
              <p class="ptb-text" id="pr-tip-text">"Use boost after exiting sharp corners for maximum acceleration."</p>
            </div>

            <div class="pr-sys-status-box">
              <span class="pssb-tag">SYSTEM STATUS</span>
              <div class="pssb-grid">
                <div class="pssb-row"><span>NETWORK</span><strong class="green-text" id="pss-net">ONLINE</strong></div>
                <div class="pssb-row"><span>PHYSICS</span><strong class="green-text" id="pss-phy">READY</strong></div>
                <div class="pssb-row"><span>TRACK</span><strong class="green-text" id="pss-trk">READY</strong></div>
                <div class="pssb-row"><span>VEHICLE</span><strong class="green-text" id="pss-veh">READY</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 9. RACE INTRO FLY-THROUGH OVERLAY -->
      <div id="screen-race-intro" class="ui-screen intro-cinematic-screen" style="display: none; pointer-events: auto;">
        <div class="intro-letterbox intro-letterbox-top"></div>
        <div class="intro-letterbox intro-letterbox-bottom"></div>

        <div class="intro-broadcast-badge" id="intro-broadcast-badge">
          <span class="ibc-rec-dot"></span>
          <span class="ibc-rec-tag">REC // LIVE BROADCAST</span>
          <span class="ibc-pipe">|</span>
          <span class="ibc-shot-id" id="ibc-shot-id">CAM 01 // HERO FASCIA</span>
        </div>

        <div class="intro-top-banner">
          <h2>NEO-SHINJUKU RIFT</h2>
          <small id="intro-banner-sub">ORBITAL GRAND PRIX // GRID INSPECTION</small>
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
        <!-- OFF-TRACK 3-SECOND AUTOMATIC RESET ALERT OVERLAY -->
        <div id="hud-offtrack-alert" class="hud-offtrack-alert" style="display: none; pointer-events: auto;">
          <div class="offtrack-content-box">
            <div class="ot-header">
              <span class="ot-warning-icon">⚠️</span>
              <div class="ot-text-wrap">
                <strong class="ot-title">OFF-TRACK // BARRIER IMPACT DETECTED</strong>
                <span class="ot-sub">RESETTING TO TRACK CENTER IN <b id="ot-countdown-timer" class="ot-timer">03.0s</b></span>
              </div>
            </div>
            <div class="ot-progress-bar">
              <div id="ot-progress-fill" class="ot-progress-fill" style="width: 100%;"></div>
            </div>
            <div class="ot-footer-row">
              <span class="ot-hint">PRESS <kbd>R</kbd> OR TAP BUTTON TO RE-ENGAGE</span>
              <button class="btn-ot-reset-now" id="btn-ot-reset-now">RESET NOW ↺</button>
            </div>
          </div>
        </div>

        <!-- TOP-LEFT PANEL: Pause + POS + LAP + PROGRESS + 8-RACER TOWER LEADERBOARD -->
        <div class="hud-top-left-panel">
          <div class="hud-race-metrics-row">
            <button class="hud-pause-btn" id="btn-pause-ingame" style="pointer-events: auto;" title="Pause Race">||</button>
            <div class="metric-card pos">
              <span class="mc-label">POS.</span>
              <strong class="mc-val" id="rh-pos">01<small>/08</small></strong>
            </div>
            <div class="metric-card lap">
              <span class="mc-label">LAP</span>
              <strong class="mc-val" id="rh-lap">01<small>/03</small></strong>
            </div>
            <div class="metric-card checkpoint">
              <span class="mc-label">CHECKPOINT</span>
              <strong class="mc-val" id="rh-checkpoint-badge">01<small>/08</small></strong>
            </div>
            <div class="metric-card progress">
              <span class="mc-label">PROGRESS</span>
              <strong class="mc-val" id="rh-progress-badge">0%</strong>
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

        <!-- TOP-CENTER: Turn Guidance, Wrong-Way Alert & Dual Progress/Nitro Gauge -->
        <div class="hud-top-center-panel">
          <!-- Upcoming Turn Indicator -->
          <div class="hud-turn-indicator" id="hud-turn-indicator" style="display: none;">
            <div class="ti-arrow" id="ti-arrow">◄ ◄ ◄</div>
            <div class="ti-text" id="ti-text">SHARP LEFT TURN</div>
          </div>

          <!-- Wrong-Way Warning Alert -->
          <div class="hud-wrong-way-banner" id="hud-wrong-way-banner" style="display: none;">
            <span class="ww-icon">⚠️</span>
            <span class="ww-title">WRONG WAY!</span>
            <span class="ww-sub">TURN AROUND IMMEDIATELY</span>
          </div>

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
            <div class="tacho-rpm-readout" id="rh-rpm-readout">6,800 RPM</div>
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
            <button class="btn-camera-hud" id="btn-camera-hud" style="pointer-events: auto;" title="Perspective: TPP (Chase Cam). Click or press [V] to switch to FPP">
              <span class="cam-icon-wrap">${TPP_CAMERA_SVG}</span>
              <span class="cam-perspective-badge">TPP</span>
              <span class="cam-mode-label">CHASE</span>
            </button>
          </div>
        </div>

        <!-- RIGHT-SIDE: Floating Stunt & Score Feed (Drift, Near Miss, Overtake, Perfect Line, Landing) -->
        <div class="hud-stunt-feed" id="hud-stunt-feed">
          <div class="stunt-entry stunt-drift" id="stunt-drift-entry" style="display: none;">
            <span class="stunt-icon">⚡</span>
            <span class="stunt-text" id="stunt-drift-text">DRIFT 120m</span>
            <strong class="stunt-pts" id="stunt-drift-pts">+200</strong>
          </div>
          <div class="stunt-entry stunt-nearmiss" id="stunt-nearmiss-entry" style="display: none;">
            <span class="stunt-icon">⚠️</span>
            <span class="stunt-text" id="stunt-nearmiss-text">NEAR MISS x2</span>
            <strong class="stunt-pts" id="stunt-nearmiss-pts">+250</strong>
          </div>
          <div class="stunt-entry stunt-nitro" id="stunt-nitro-entry" style="display: none;">
            <span class="stunt-icon">🔥</span>
            <span class="stunt-text" id="stunt-nitro-text">PERFECT NITRO</span>
            <strong class="stunt-pts" id="stunt-nitro-pts">+150</strong>
          </div>
          <div class="stunt-entry stunt-overtake" id="stunt-overtake-entry" style="display: none;">
            <span class="stunt-icon">🏎️</span>
            <span class="stunt-text" id="stunt-overtake-text">OVERTAKE</span>
            <strong class="stunt-pts" id="stunt-overtake-pts">+500</strong>
          </div>
          <div class="stunt-entry stunt-line" id="stunt-line-entry" style="display: none;">
            <span class="stunt-icon">📐</span>
            <span class="stunt-text" id="stunt-line-text">PERFECT LINE</span>
            <strong class="stunt-pts" id="stunt-line-pts">+400</strong>
          </div>
          <div class="stunt-entry stunt-landing" id="stunt-landing-entry" style="display: none;">
            <span class="stunt-icon">✨</span>
            <span class="stunt-text" id="stunt-landing-text">CLEAN LANDING</span>
            <strong class="stunt-pts" id="stunt-landing-pts">+300</strong>
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

        <!-- BOTTOM-CENTER: Horizontal Segmented Nitro Reservoir Gauge -->
        <div class="hud-bottom-center-panel">
          <div class="nitro-reservoir-box">
            <div class="nrb-header">
              <span class="nrb-label" id="rh-boost-tier-label">NITRO RESERVOIR</span>
              <strong class="nrb-pct" id="rh-boost-pct">100%</strong>
            </div>
            <div class="nrb-track segmented">
              <div class="nrb-segment-divider" style="left: 25%;"></div>
              <div class="nrb-segment-divider" style="left: 50%;"></div>
              <div class="nrb-segment-divider" style="left: 75%;"></div>
              <div class="nrb-fill" id="rh-boost-fill" style="width: 100%"></div>
              <div class="nrb-glow-pulse"></div>
            </div>
            <span class="nrb-key">[SPACE] NITRO OVERDRIVE</span>
          </div>
        </div>

        <!-- Collision Impact Flash Overlay -->
        <div id="hud-impact-flash" class="hud-impact-flash" style="display: none;"></div>

        <!-- BOTTOM-RIGHT: Action Buttons (Nitro, Brake, Gas, Cam) + Desktop Controls Guide -->
        <div class="hud-bottom-right-panel" style="pointer-events: auto;">
          <div class="action-buttons-cluster">
            <button class="hud-btn-circular cam" id="m-btn-cam" title="Toggle TPP/FPP Camera">
              <span class="cam-icon-wrap">${TPP_CAMERA_SVG}</span>
              <span class="cam-mini-badge">TPP</span>
            </button>
            <button class="hud-btn-action brake" id="m-btn-brake">BRAKE</button>
            <button class="hud-btn-action throttle" id="m-btn-throttle">DRIVE</button>
            <button class="hud-btn-circular nitro" id="m-btn-boost" title="Nitro Boost">
              <span class="nitro-flame-icon">🔥</span>
              <span class="nitro-label">NITRO</span>
            </button>
          </div>
          <div class="rh-controls-guide" id="rh-controls-guide">
            <span class="ctrl-chip" id="ctrl-hint-drive"><kbd id="key-w">W</kbd>/<kbd id="key-s">S</kbd> DRIVE</span>
            <span class="ctrl-chip" id="ctrl-hint-steer"><kbd id="key-a">A</kbd>/<kbd id="key-d">D</kbd> STEER</span>
            <span class="ctrl-chip" id="ctrl-hint-drift"><kbd id="key-shift">SHIFT</kbd> DRIFT</span>
            <span class="ctrl-chip" id="ctrl-hint-nitro"><kbd id="key-space">SPACE</kbd> NITRO</span>
            <span class="ctrl-chip" id="ctrl-hint-cam"><kbd id="key-c">C</kbd> CAM</span>
            <span class="ctrl-chip reset-chip" id="ctrl-hint-reset" style="cursor: pointer; pointer-events: auto;" title="Instant track re-center"><kbd id="key-r">R</kbd> RE-CENTER</span>
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
            <div class="setting-item">
              <div class="si-info">
                <strong>MAIN LOBBY THEME SONG</strong>
                <small>Select exclusive soundtrack for the Main HQ Lobby</small>
              </div>
              <div class="quality-selector-group" id="settings-lobby-theme-group">
                <button class="btn-theme-chip active" data-theme="CHASE_THE_HORIZON">CHASE THE HORIZON</button>
                <button class="btn-theme-chip" data-theme="BORN_TO_RACE">BORN TO RACE</button>
                <button class="btn-theme-chip" data-theme="PROCEDURAL_SYNTH">CYBER SYNTH</button>
              </div>
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
            <button class="btn-pause-opt" id="btn-pause-resume">RESUME RACE [ESC]</button>
            <button class="btn-pause-opt" id="btn-pause-restart">RESTART RACE</button>
            <button class="btn-pause-opt" id="btn-pause-reset" style="color: #00F0FF; border-color: rgba(0,240,255,0.6);">RE-CENTER CRAFT [R]</button>
            <button class="btn-pause-opt primary" id="btn-pause-finish" style="color: #FFB800; border-color: rgba(255,184,0,0.7); font-weight: bold;">END RACE & GO TO FINISH LOBBY ►</button>
            <button class="btn-pause-opt" id="btn-pause-quit">RETURN TO MAIN LOBBY</button>
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
            <div class="stat-row"><span>POSITION CHANGE:</span><strong id="res-pos-change" class="cyan-text">+2 POS (P3 → P1)</strong></div>
            <div class="stat-row"><span>TOP SPEED:</span><strong id="res-top-speed">421 KM/H</strong></div>
            <div class="stat-row highlight"><span>XP EARNED:</span><strong id="res-xp-val" class="gold-text">+2,500 XP</strong></div>
            <div class="stat-row highlight"><span>COINS REWARD:</span><strong id="res-coins-val" class="cyan-text">+15,000 Ȼ</strong></div>
            <div class="stat-row"><span>REWARD TROPHY:</span><strong class="gold-text">TIER S GOLD TROPHY</strong></div>
            <div class="stat-row"><span>AERIAL STUNTS:</span><strong id="res-stunts">7</strong></div>
            <div class="stat-row"><span>DRIFT DISTANCE:</span><strong id="res-drift">1,240 M</strong></div>
            <div class="stat-row"><span>NEAR MISSES:</span><strong id="res-near-miss">12</strong></div>
            <div class="stat-row highlight"><span>TOTAL SCORE:</span><strong id="res-score">24,850 PTS</strong></div>
          </div>

          <div class="results-actions">
            <button class="btn-action-primary glow" id="btn-results-next">NEXT RACE ►</button>
            <button class="btn-action-secondary" id="btn-results-garage">GARAGE ⚙</button>
            <button class="btn-action-secondary" id="btn-results-menu">MAIN MENU ◄</button>
            <button class="btn-action-secondary" id="btn-results-upload">UPLOAD ☁</button>
            <button class="btn-action-primary" id="btn-results-podium">VIEW PODIUM ►</button>
            <button class="btn-action-secondary" id="btn-results-continue" style="display: none;">CONTINUE</button>
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
          <div style="margin-top: 16px; text-align: center;">
            <button id="btn-post-sync-skip" class="btn-action-primary" style="padding: 10px 24px; font-size: 13px; letter-spacing: 2px; cursor: pointer;">PROCEED TO REWARDS [SPACE / ENTER] ►</button>
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
              <div class="lh-title-text-group">
                <h2>GLOBAL PILOT LEADERBOARD // AETHER-9</h2>
                <small class="lh-subtitle">ORBITAL QUANTUM SATELLITE TELEMETRY RELAY</small>
              </div>
              <div class="lh-relay-badge" id="lh-relay-status">
                <span class="pulse-marker green"></span>
                <span id="lh-relay-text">EDGE RELAY: TOKYO-01 // 16ms</span>
              </div>
            </div>

            <!-- Track Selector Tabs -->
            <div class="lb-track-selector-bar">
              <span class="lb-track-label">CIRCUIT:</span>
              <button class="lb-track-tab active" data-track="shinjuku">🏁 NEO-SHINJUKU RIFT</button>
              <button class="lb-track-tab" data-track="fuji">🗻 FUJI SKYWAY</button>
              <button class="lb-track-tab" data-track="district">🌆 NIGHT DISTRICT</button>
              <button class="lb-track-tab" data-track="coastline">🌊 COASTLINE EXPRESSWAY</button>
            </div>

            <!-- World Record Showcase Banner -->
            <div class="lb-wr-banner" id="lb-wr-banner">
              <div class="lb-wr-badge">★ CURRENT WORLD RECORD ★</div>
              <div class="lb-wr-details">
                <div class="lb-wr-pilot">
                  <span class="lb-wr-icon">👑</span>
                  <div>
                    <strong id="lb-wr-name">RANJEET</strong>
                    <small id="lb-wr-callsign">CREATOR // NIGHT_COMMANDER</small>
                  </div>
                </div>
                <div class="lb-wr-stat">
                  <span>RECORD LAP</span>
                  <strong class="cyan-text" id="lb-wr-time">00:48.214</strong>
                </div>
                <div class="lb-wr-stat">
                  <span>TOP SPEED</span>
                  <strong id="lb-wr-speed">438 KM/H</strong>
                </div>
                <div class="lb-wr-stat">
                  <span>DRIFT SCORE</span>
                  <strong id="lb-wr-drift">18,450 PTS</strong>
                </div>
                <button class="btn-race-ghost-wr" id="btn-race-wr-ghost">⚡ RACE AGAINST GHOST ►</button>
              </div>
            </div>

            <div class="lh-filter-row">
              <div class="lh-filter-tabs">
                <button class="lh-filter-btn active" data-filter="all">ALL PILOTS</button>
                <button class="lh-filter-btn" data-filter="rivals">AI RIVALS</button>
                <button class="lh-filter-btn" data-filter="dev">DEV RECORD</button>
                <button class="lh-filter-btn" data-filter="my">MY RECORDS</button>
              </div>

              <div class="lb-search-wrap">
                <input type="text" id="lb-search-input" placeholder="🔍 SEARCH PILOT OR VEHICLE..." class="lb-search-input" />
              </div>

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
                  <th>DELTA</th>
                  <th>TOP SPEED</th>
                  <th>DRIFT PTS</th>
                  <th>STATUS</th>
                  <th>CHALLENGE</th>
                </tr>
              </thead>
              <tbody id="leaderboard-rows-body">
                <tr><td colspan="9" class="lb-loading"><span class="pulse-marker"></span> QUERYING ORBITAL TELEMETRY RELAY...</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Player Standing Dock -->
          <div class="lb-player-dock" id="lb-player-dock">
            <div class="lb-dock-left">
              <span class="lb-dock-pill">YOUR STANDING</span>
              <strong id="lb-dock-pilot">RANJEET</strong>
              <span class="lb-dock-rank" id="lb-dock-rank">CURRENT RANK: #01 (WORLD RECORD)</span>
            </div>
            <div class="lb-dock-stats">
              <div><span>BEST LAP:</span><strong id="lb-dock-time">00:48.214</strong></div>
              <div><span>TOP SPEED:</span><strong id="lb-dock-spd">438 KM/H</strong></div>
              <div><span>DRIFT PTS:</span><strong id="lb-dock-drift">18,450 PTS</strong></div>
            </div>
            <button class="btn-upload-dock" id="btn-leaderboard-refresh">🔄 SYNC TELEMETRY</button>
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
      btn.addEventListener('mouseenter', () => {
        if (this.game.sound && this.game.sound.playUIHover) this.game.sound.playUIHover();
      });
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.top-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        if (this.game.sound) this.game.sound.playMenuClick();

        if (tab === 'royalpass') this.showRoyalPassScreen();
        if (tab === 'lobby') this.showScreen('LOBBY');
        if (tab === 'race') this.triggerPlayRaceFlow();
        if (tab === 'cars') this.showScreen('CAR_SELECT');
        if (tab === 'garage') this.showScreen('GARAGE');
        if (tab === 'career' || tab === 'map') this.showWorldMap();
        if (tab === 'shop') this.showScreen('GARAGE');
        if (tab === 'events') this.showWorldMap();
        if (tab === 'leaderboard') this.showLeaderboardModal();
        if (tab === 'more' || tab === 'settings') this.showSettingsModal();
      });
    });

    // Brand badge click returns to 3D Showroom
    safeBind('lobby-brand-badge', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showScreen('LOBBY');
      if (this.game.returnToLobby) this.game.returnToLobby();
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

        if (this.game && this.game.loadSector) {
          this.game.loadSector(this.selectedTrackId);
        }

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

    // 5. Royal Pass Season 01 View & Action buttons
    safeBind('btn-season-view', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showRoyalPassScreen();
    });
    safeBind('btn-royal-pass-back', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.hideRoyalPassScreen();
    });
    safeBind('btn-claim-royal-rewards', 'click', () => {
      this.claimRoyalPassRewards();
    });
    safeBind('btn-rp-test-boost', 'click', () => {
      this.boostRoyalPassXP(500);
    });
    safeBind('btn-rp-tab-free', 'click', () => {
      this.switchRoyalPassTrack('free');
    });
    safeBind('btn-rp-tab-elite', 'click', () => {
      this.switchRoyalPassTrack('elite');
    });

    // Royal Pass 360 Showroom camera angles
    this.container.querySelectorAll('.rp-cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.rp-cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const preset = btn.dataset.cam;
        if (this.game && this.game.garageLobby) {
          this.game.garageLobby.setCameraAnglePreset(preset);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    // Off-track manual reset button
    safeBind('btn-ot-reset-now', 'click', () => {
      if (this.game && this.game.physics) {
        this.game.physics.resetToTrackCenter();
      }
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
      if (this.game.sound) {
        this.game.sound.resume();
        this.game.sound.playMenuClick();
      }
      this.game.startMatchmaking();
    });

    safeBind('btn-event-choose-car', 'click', () => {
      if (this.game.sound) {
        this.game.sound.resume();
        this.game.sound.playMenuClick();
      }
      this.showScreen('CAR_SELECT');
    });

    // 11. In-game HUD Virtual Controls (TPP / FPP Camera Toggle)
    safeBind('m-btn-cam', 'click', () => {
      if (this.game.cameraController) {
        const nextMode = this.game.cameraController.togglePerspective();
        if (this.game.sound && this.game.sound.playCameraSwitchSound) {
          this.game.sound.playCameraSwitchSound();
        }
        this.updateCameraBadge(nextMode);
      }
      if (this.game && this.game.ensureGameFocus) {
        this.game.ensureGameFocus();
      }
    });

    // Touch and pointer controls are centrally configured in setupMobileTouchControls()

    // Lobby Play CTA
    safeBind('btn-lobby-play', 'click', () => {
      this.triggerPlayRaceFlow();
    });

    // Lobby Quick Vehicle Actions & Next Event CTA
    safeBind('btn-lobby-quick-customize', 'click', () => {
      this.showScreen('GARAGE');
      this.switchGarageTab('body');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-lobby-quick-cars', 'click', () => {
      this.showScreen('CAR_SELECT');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    safeBind('btn-next-event-play', 'click', () => {
      this.selectedTrackId = 'fuji';
      if (this.game && this.game.loadSector) {
        this.game.loadSector(this.selectedTrackId);
      }
      if (this.game && this.game.sound) this.game.sound.playCountdownBeep(true);
      if (this.game && this.game.ensureGameFocus) this.game.ensureGameFocus();
      this.triggerPlayRaceFlow();
    });

    const lneThumb = this.container.querySelector('.lne-preview-thumb');
    if (lneThumb) {
      lneThumb.addEventListener('click', () => {
        this.selectedTrackId = 'fuji';
        if (this.game && this.game.loadSector) {
          this.game.loadSector(this.selectedTrackId);
        }
        if (this.game && this.game.sound) this.game.sound.playMenuClick();
        if (this.game && this.game.ensureGameFocus) this.game.ensureGameFocus();
        this.triggerPlayRaceFlow();
      });
    }

    // Bottom Subtle Navigation Hints
    this.container.querySelectorAll('.lbh-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const hint = btn.dataset.hint;
        if (this.game.sound) this.game.sound.playMenuClick();
        if (hint === 'garage') {
          this.showScreen('GARAGE');
        } else if (hint === 'customize') {
          this.showScreen('GARAGE');
          this.switchGarageTab('body');
        } else if (hint === 'cars') {
          this.showScreen('CAR_SELECT');
        } else if (hint === 'profile' || hint === 'settings') {
          this.showScreen('SETTINGS');
        }
      });
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

    // 5b. Matchmaking instant launch
    safeBind('btn-match-launch-now', 'click', () => {
      if (this.game.sound) {
        this.game.sound.resume();
        this.game.sound.playMenuClick();
      }
      if (this.game.skipMatchmaking) {
        this.game.skipMatchmaking();
      }
    });

    // 5c. Pre-race loading instant launch / Start Race Now
    safeBind('btn-pr-skip', 'click', () => {
      if (this.game.sound) {
        this.game.sound.resume();
        this.game.sound.playMenuClick();
      }
      if (this.game.state === 'RACE_INTRO') {
        this.game.skipRaceIntro();
      } else if (this.game.skipPreRaceLoading) {
        this.game.skipPreRaceLoading();
      }
    });

    // 6. Skip race intro
    safeBind('btn-skip-intro', 'click', () => {
      if (this.game.sound) {
        this.game.sound.resume();
        this.game.sound.playMenuClick();
      }
      this.game.skipRaceIntro();
    });

    // 7. Pause in-game
    safeBind('btn-pause-ingame', 'click', () => {
      this.game.togglePause();
    });

    safeBind('btn-pause-resume', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.togglePause();
    });

    safeBind('btn-pause-restart', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.restartRace();
    });

    safeBind('btn-pause-reset', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      if (this.game.physics && this.game.physics.resetToTrackCenter) {
        this.game.physics.resetToTrackCenter(this.game.physics.currentU);
      }
      this.game.togglePause();
    });

    safeBind('btn-pause-finish', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.triggerRaceFinish();
    });

    safeBind('btn-pause-quit', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.returnToLobby();
    });

    safeBind('ctrl-hint-reset', 'click', () => {
      if (this.game.physics && this.game.physics.resetToTrackCenter) {
        this.game.physics.resetToTrackCenter(this.game.physics.currentU);
      }
      if (this.game && this.game.ensureGameFocus) {
        this.game.ensureGameFocus();
      }
    });

    // 8. Results modal buttons
    safeBind('btn-results-next', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.startMatchmaking();
    });

    safeBind('btn-results-garage', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.showScreen('GARAGE');
    });

    safeBind('btn-results-menu', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      this.game.returnToLobby();
    });

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

    // 9b. Post-race telemetry sync skip
    safeBind('btn-post-sync-skip', 'click', () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      if (this.game.skipPostRaceLoading) {
        this.game.skipPostRaceLoading();
      }
    });

    // PUBG Claim All & Return to Lobby
    safeBind('btn-pubg-claim', 'click', () => {
      if (this.game.sound) {
        this.game.sound.playVictorySting();
      }
      this.claimPubgRewards();
    });

    // PUBG Card click interactions
    this.container.querySelectorAll('.pubg-reward-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (this.game.sound) this.game.sound.playBoostCollect();
        card.style.transform = 'scale(1.08) translateY(-8px)';
        setTimeout(() => {
          card.style.transform = '';
        }, 250);
      });
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

    // Omnipresent FPS Overlay quick toggle
    const globalFpsOverlay = document.getElementById('perf-fps-meter-overlay') || this.container.querySelector('#perf-fps-meter-overlay');
    if (globalFpsOverlay) {
      globalFpsOverlay.addEventListener('click', () => {
        this.game.toggleFpsCounter();
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

    // In-game HUD Camera button (TPP / FPP Camera Toggle)
    safeBind('btn-camera-hud', 'click', () => {
      if (this.game.cameraController) {
        const nextMode = this.game.cameraController.togglePerspective();
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

    // Main Lobby Theme Song selector chips
    this.container.querySelectorAll('.btn-theme-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.container.querySelectorAll('.btn-theme-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const theme = chip.dataset.theme;
        if (this.game.setLobbyTheme) {
          this.game.setLobbyTheme(theme);
        }
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    });

    safeBind('btn-reset-save', 'click', () => {
      if (confirm('RESET ALL DRIVER SAVED DATA & PROGRESS?')) {
        saveManager.resetData();
        window.location.reload();
      }
    });

    // 14. Leaderboard Modal Buttons, Track Tabs, Search & Filters
    safeBind('btn-leaderboard-close', 'click', () => {
      this.showScreen('LOBBY');
      if (this.game.garageLobby) this.game.garageLobby.setCameraAnglePreset('FRONT');
      if (this.game.sound) this.game.sound.playMenuClick();
    });

    this.container.querySelectorAll('.lb-track-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.container.querySelectorAll('.lb-track-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.leaderboardTrack = tab.dataset.track;
        if (this.game.sound) this.game.sound.playMenuClick();
        this.fetchAndRenderLeaderboard();
      });
    });

    this.container.querySelectorAll('.lh-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.lh-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.leaderboardFilter = btn.dataset.filter;
        if (this.game.sound) this.game.sound.playMenuClick();
        this.renderLeaderboardRows(this.leaderboardFilter, this.leaderboardSearch);
      });
    });

    const searchInput = document.getElementById('lb-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.leaderboardSearch = e.target.value.trim().toLowerCase();
        this.renderLeaderboardRows(this.leaderboardFilter, this.leaderboardSearch);
      });
    }

    safeBind('btn-race-wr-ghost', 'click', () => {
      this.challengeWorldRecordGhost();
    });

    safeBind('btn-leaderboard-refresh', 'click', async () => {
      if (this.game.sound) this.game.sound.playMenuClick();
      await this.fetchAndRenderLeaderboard(true);
    });

    const ghostBtn = document.getElementById('btn-toggle-ghost-lb');
    if (ghostBtn) {
      ghostBtn.addEventListener('click', () => {
        const isActive = ghostBtn.classList.toggle('active');
        ghostBtn.textContent = isActive ? 'ON' : 'OFF';
        saveManager.data.settings.ghostEnabled = isActive;
        saveManager.save();
        if (this.game.sound) this.game.sound.playMenuClick();
      });
    }

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
      const el = document.getElementById(id) || (this.container && this.container.querySelector(`#${id}`));
      if (!el) return;

      let isPressed = false;

      const handlePressStart = (e) => {
        if (e && e.cancelable && e.type.startsWith('touch')) {
          e.preventDefault();
        }
        if (isPressed) return;
        isPressed = true;
        if (navigator.vibrate) {
          try { navigator.vibrate(15); } catch {}
        }
        onDown();
      };

      const handlePressEnd = (e) => {
        if (!isPressed) return;
        isPressed = false;
        onUp();
      };

      // Pointer events (modern unified input)
      el.addEventListener('pointerdown', handlePressStart);
      el.addEventListener('pointerup', handlePressEnd);
      el.addEventListener('pointercancel', handlePressEnd);
      el.addEventListener('pointerleave', handlePressEnd);

      // Mobile Touch events fallback
      el.addEventListener('touchstart', handlePressStart, { passive: false });
      el.addEventListener('touchend', handlePressEnd, { passive: false });
      el.addEventListener('touchcancel', handlePressEnd, { passive: false });

      // Desktop Mouse events fallback
      el.addEventListener('mousedown', handlePressStart);
      el.addEventListener('mouseup', handlePressEnd);
      el.addEventListener('mouseleave', handlePressEnd);
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
      'screen-countdown-overlay',
      'screen-royal-pass'
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
      'ROYAL_PASS': 'screen-royal-pass',
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

    if (screenName !== 'ROYAL_PASS') {
      if (this.game && this.game.garageLobby && this.game.garageLobby.isGoldenMode) {
        this.game.garageLobby.setGoldenCarMode(false);
      }
      if (this.game && this.game.playerVehicle && this.game.playerVehicle.setGoldenCarMode) {
        this.game.playerVehicle.setGoldenCarMode(false);
      }
    }

    if (screenName === 'LOBBY') {
      this.updateLobbyHeader();
      this.updateLobbyVehiclePanel();
      this.updateLobbySeasonCard();
    }

    if (screenName === 'PRE_RACE_LOADING') {
      this.startPreRaceLoadingEffects();
    } else if (this._prTipTimer) {
      clearInterval(this._prTipTimer);
      this._prTipTimer = null;
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

  showRoyalPassScreen() {
    this.showScreen('ROYAL_PASS');
    if (this.game && this.game.garageLobby) {
      this.game.garageLobby.setGoldenCarMode(true);
      this.game.garageLobby.setCameraAnglePreset('FRONT');
    }
    if (this.game && this.game.playerVehicle && this.game.playerVehicle.setGoldenCarMode) {
      this.game.playerVehicle.setGoldenCarMode(true);
    }
    this.updateRoyalPassHeader();
    this.renderRoyalPassTiers();
  }

  hideRoyalPassScreen() {
    if (this.game && this.game.garageLobby) {
      this.game.garageLobby.setGoldenCarMode(false);
      this.game.garageLobby.setCameraAnglePreset('FRONT');
    }
    if (this.game && this.game.playerVehicle && this.game.playerVehicle.setGoldenCarMode) {
      this.game.playerVehicle.setGoldenCarMode(false);
    }
    this.showScreen('LOBBY');
    this.updateLobbySeasonCard();
  }

  updateRoyalPassHeader() {
    const rp = saveManager.getRoyalPass();
    this.safeSetText('rp-stat-tier', `TIER ${rp.level} / ${ROYAL_PASS_SEASON_1_TIERS.length}`);
    this.safeSetText('rp-stat-xp', `${rp.xp.toLocaleString()} / ${rp.xpNext.toLocaleString()} XP`);

    // Count ready tiers
    const readyTiers = ROYAL_PASS_SEASON_1_TIERS.filter(t => rp.level >= t.tier && !rp.claimedTiers.includes(t.tier));
    const badge = document.getElementById('rp-ready-count-badge');
    if (badge) {
      badge.textContent = `${readyTiers.length} REWARD${readyTiers.length === 1 ? '' : 'S'} READY`;
      badge.style.display = readyTiers.length > 0 ? 'inline-block' : 'none';
    }

    const claimAllBtn = document.getElementById('btn-claim-royal-rewards');
    if (claimAllBtn) {
      if (readyTiers.length > 0) {
        claimAllBtn.textContent = `🎁 CLAIM ALL (${readyTiers.length}) REWARDS`;
        claimAllBtn.style.opacity = '1';
        claimAllBtn.style.pointerEvents = 'auto';
      } else {
        claimAllBtn.textContent = '✓ ALL REWARDS CLAIMED';
        claimAllBtn.style.opacity = '0.6';
        claimAllBtn.style.pointerEvents = 'none';
      }
    }

    this.updateLobbySeasonCard();
  }

  updateLobbySeasonCard() {
    const rp = saveManager.getRoyalPass();
    this.safeSetText('lsc-tier-text', `TIER ${rp.level} / ${ROYAL_PASS_SEASON_1_TIERS.length}`);
    this.safeSetText('lsc-xp-text', `${rp.xp.toLocaleString()} / ${rp.xpNext.toLocaleString()} XP`);
    const pct = Math.min(100, Math.round((rp.xp / rp.xpNext) * 100));
    const fill = document.getElementById('lsc-xp-fill');
    if (fill) fill.style.width = `${pct}%`;
  }

  renderRoyalPassTiers() {
    const scrollContainer = document.getElementById('rp-tiers-scroll');
    if (!scrollContainer) return;

    const rp = saveManager.getRoyalPass();
    const viewTrack = this.royalPassViewTrack || 'elite';

    scrollContainer.innerHTML = ROYAL_PASS_SEASON_1_TIERS.map(item => {
      const isClaimed = rp.claimedTiers.includes(item.tier);
      const isReady = rp.level >= item.tier && !isClaimed;
      const isLocked = rp.level < item.tier;

      let cardClass = 'rp-tier-card';
      if (isClaimed) cardClass += ' claimed';
      else if (isReady) cardClass += ' ready glow';
      else if (isLocked) cardClass += ' locked';
      if (item.isPinnacle) cardClass += ' pinnacle glow';

      const trackBadge = `<span class="tier-pass-type-tag ${item.type}">${item.type.toUpperCase()}</span>`;

      let statusHtml = '';
      if (isClaimed) {
        statusHtml = `<span class="claimed-tag">CLAIMED ✓</span>`;
      } else if (isReady) {
        statusHtml = `<button class="btn-claim-tier" data-tier="${item.tier}">CLAIM</button>`;
      } else {
        statusHtml = `<small>LOCKED (TIER ${item.tier})</small>`;
      }

      if (item.isPinnacle && !isClaimed) {
        statusHtml += `<span class="pinnacle-tag">GRAND REWARD</span>`;
      }

      let rewardText = '';
      if (item.reward.credits) rewardText += `+${item.reward.credits.toLocaleString()} Ȼ `;
      if (item.reward.tokens) rewardText += `+${item.reward.tokens.toLocaleString()} ◈`;

      return `
        <div class="${cardClass}" data-tier="${item.tier}">
          ${trackBadge}
          <span class="rpt-num">TIER 0${item.tier}</span>
          <span class="rpt-icon">${item.icon}</span>
          <strong>${item.title}</strong>
          ${rewardText ? `<span class="tier-reward-pill">${rewardText}</span>` : ''}
          ${statusHtml}
        </div>
      `;
    }).join('');

    // Bind individual claim buttons
    scrollContainer.querySelectorAll('.btn-claim-tier').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tier = parseInt(btn.dataset.tier, 10);
        this.claimRoyalPassTier(tier);
      });
    });

    // Allow clicking ready cards directly
    scrollContainer.querySelectorAll('.rp-tier-card.ready').forEach(card => {
      card.addEventListener('click', () => {
        const tier = parseInt(card.dataset.tier, 10);
        this.claimRoyalPassTier(tier);
      });
    });
  }

  claimRoyalPassTier(tierNumber) {
    const tier = ROYAL_PASS_SEASON_1_TIERS.find(t => t.tier === tierNumber);
    if (!tier) return;

    const claimed = saveManager.claimRoyalPassTier(tierNumber, tier.reward);
    if (!claimed) return;

    if (this.game && this.game.sound) this.game.sound.playUpgradeSound();

    let rewardDesc = '';
    if (tier.reward.credits) rewardDesc += `+${tier.reward.credits.toLocaleString()} Ȼ CREDITS `;
    if (tier.reward.tokens) rewardDesc += `+${tier.reward.tokens.toLocaleString()} ◈ TOKENS `;
    if (tier.reward.item) rewardDesc += `// UNLOCKED: ${tier.reward.item}`;

    this.showCyberpunkToast(
      `👑 ROYAL PASS TIER ${tierNumber} CLAIMED!`,
      rewardDesc || tier.title,
      tier.icon || '🎁',
      tier.isPinnacle ? 'gold' : 'cyan'
    );

    this.updateLobbyHeader();
    this.updateRoyalPassHeader();
    this.renderRoyalPassTiers();
  }

  claimRoyalPassRewards() {
    const rp = saveManager.getRoyalPass();
    const readyTiers = ROYAL_PASS_SEASON_1_TIERS.filter(t => rp.level >= t.tier && !rp.claimedTiers.includes(t.tier));

    if (readyTiers.length === 0) {
      this.showCyberpunkToast(
        'ROYAL PASS UP TO DATE',
        'ALL UNLOCKED SEASON 01 REWARDS HAVE BEEN CLAIMED.',
        '✓',
        'cyan'
      );
      return;
    }

    const res = saveManager.claimAllRoyalPassTiers(readyTiers);
    if (this.game && this.game.sound) this.game.sound.playVictorySting();

    this.showCyberpunkToast(
      `★ ALL (${res.count}) REWARDS CLAIMED! ★`,
      `+${res.totalCredits.toLocaleString()} Ȼ CREDITS | +${res.totalTokens.toLocaleString()} ◈ PREMIUM TOKENS`,
      '👑',
      'gold'
    );

    this.updateLobbyHeader();
    this.updateRoyalPassHeader();
    this.renderRoyalPassTiers();
  }

  boostRoyalPassXP(amount = 500) {
    const result = saveManager.addRoyalPassXP(amount);
    if (this.game && this.game.sound) {
      if (result.leveledUp) {
        this.game.sound.playVictorySting();
      } else {
        this.game.sound.playUpgradeSound();
      }
    }

    if (result.leveledUp) {
      this.showCyberpunkToast(
        `⚡ SEASON 01 TIER LEVEL UP!`,
        `ADVANCED TO ROYAL PASS TIER ${result.rp.level}! NEW REWARDS UNLOCKED!`,
        '⭐',
        'gold'
      );
    } else {
      this.showCyberpunkToast(
        `+${amount} SEASON XP EARNED`,
        `CURRENT PROGRESS: ${result.rp.xp} / ${result.rp.xpNext} XP (TIER ${result.rp.level})`,
        '⚡',
        'cyan'
      );
    }

    this.updateRoyalPassHeader();
    this.renderRoyalPassTiers();
  }

  switchRoyalPassTrack(trackType) {
    this.royalPassViewTrack = trackType;
    const freeBtn = document.getElementById('btn-rp-tab-free');
    const eliteBtn = document.getElementById('btn-rp-tab-elite');
    if (freeBtn && eliteBtn) {
      if (trackType === 'free') {
        freeBtn.className = 'rp-pill free active';
        eliteBtn.className = 'rp-pill elite';
      } else {
        freeBtn.className = 'rp-pill free';
        eliteBtn.className = 'rp-pill elite active';
      }
    }
    if (this.game && this.game.sound) this.game.sound.playMenuClick();
    this.renderRoyalPassTiers();
  }

  showCyberpunkToast(title, message, icon = '✨', type = 'cyan') {
    let toast = document.getElementById('cyberpunk-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cyberpunk-toast-notification';
      toast.className = 'cyberpunk-toast-notification';
      document.body.appendChild(toast);
    }

    toast.className = `cyberpunk-toast-notification ${type === 'gold' ? 'gold' : ''} active`;
    toast.innerHTML = `
      <span class="cpt-icon">${icon}</span>
      <div class="cpt-content">
        <strong>${title}</strong>
        <p>${message}</p>
      </div>
    `;

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3800);
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
    const region = WORLD_REGIONS[this.selectedRegionIndex];
    if (region) {
      if (region.id === 'coastline') this.selectedTrackId = 'coastline';
      else if (region.id === 'snow_peaks') this.selectedTrackId = 'fuji';
      else this.selectedTrackId = 'district';

      if (this.game && this.game.loadSector) {
        this.game.loadSector(this.selectedTrackId);
      }
    }
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

    if (region.id === 'coastline') this.selectedTrackId = 'coastline';
    else if (region.id === 'snow_peaks') this.selectedTrackId = 'fuji';
    else this.selectedTrackId = 'district';

    if (this.game && this.game.loadSector) {
      this.game.loadSector(this.selectedTrackId);
    }

    this.safeSetText('ses-type', `${evt.type} RACE`);
    this.safeSetText('ses-title', evt.name);
    this.safeSetText('ses-meta', `${evt.dist} // ${evt.laps} ${evt.laps > 1 ? 'LAPS' : 'LAP'} // RECOMMENDED: ${evt.classReq} // REWARD: ${evt.rewardCr.toLocaleString()} CREDITS, ${evt.rewardXp} XP`);
  }

  claimDailyReward() {
    if (this.dailyClaimed) {
      this.showCyberpunkToast(
        'DAILY REWARD ALREADY CLAIMED',
        'REWARD ALREADY CLAIMED FOR TODAY! CHECK BACK TOMORROW AT 00:00 UTC.',
        '✓',
        'cyan'
      );
      return;
    }
    this.dailyClaimed = true;
    saveManager.data.player.credits = (saveManager.data.player.credits || 45200) + 1500;
    saveManager.data.player.tokens = (saveManager.data.player.tokens || 350) + 50;
    saveManager.save();

    this.safeSetText('lobby-credits', saveManager.data.player.credits.toLocaleString());
    this.safeSetText('lobby-tokens', saveManager.data.player.tokens.toLocaleString());
    this.safeSetText('ldr-status', 'CLAIMED ✓ (+1,500 Ȼ, +50 ◈)');
    const btn = document.getElementById('btn-claim-daily');
    if (btn) {
      btn.textContent = 'CLAIMED ✓';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }

    if (this.game.sound) this.game.sound.playVictorySting();
    this.showCyberpunkToast(
      '🎁 DAILY LOGIN REWARD CLAIMED!',
      '+1,500 Ȼ CREDITS | +50 ◈ TOKENS // 3-DAY STREAK MAINTAINED 🔥',
      '🎁',
      'gold'
    );
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

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      el.removeEventListener('click', finish);
      window.removeEventListener('keydown', keyHandler);
      el.classList.add('fade-out');
      setTimeout(() => {
        el.style.display = 'none';
        if (callback) callback();
      }, 300);
    };

    const keyHandler = (e) => {
      if (['Space', 'Enter', 'Escape'].includes(e.code) || e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        finish();
      }
    };

    el.addEventListener('click', finish);
    window.addEventListener('keydown', keyHandler);

    setTimeout(() => {
      finish();
    }, 2800);
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

    // 9. Main Lobby Theme Song Chips
    const activeTheme = this.game.lobbyTheme || settings.lobbyTheme || 'CHASE_THE_HORIZON';
    this.container.querySelectorAll('.btn-theme-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.theme === activeTheme);
    });
  }

  updateFpsCounter(fps, ms, quality, isVisible, minFps = null) {
    const globalOverlay = document.getElementById('perf-fps-meter-overlay');
    const hudPill = document.getElementById('perf-telemetry-hud');
    const lobbyPill = document.getElementById('lobby-perf-badge');

    if (!isVisible) {
      if (globalOverlay) globalOverlay.style.display = 'none';
      if (hudPill) hudPill.style.display = 'none';
      if (lobbyPill) lobbyPill.style.display = 'none';
      return;
    }

    if (globalOverlay) {
      globalOverlay.style.display = 'flex';
      this.safeSetText('perf-global-fps', fps.toString());
      this.safeSetText('perf-global-ms', `${ms}ms`);
      const minFpsDisplay = (minFps !== null && minFps !== undefined) ? minFps.toString() : Math.max(1, fps - 3).toString();
      this.safeSetText('perf-global-min', minFpsDisplay);
      this.safeSetText('perf-global-quality', quality);

      const statusDot = document.getElementById('perf-status-dot');
      const fpsNum = document.getElementById('perf-global-fps');
      if (statusDot) {
        if (fps >= 55) {
          statusDot.className = 'perf-dot green';
          if (fpsNum) fpsNum.style.color = '#00FF88';
        } else if (fps >= 30) {
          statusDot.className = 'perf-dot yellow';
          if (fpsNum) fpsNum.style.color = '#FFB800';
        } else {
          statusDot.className = 'perf-dot red';
          if (fpsNum) fpsNum.style.color = '#FF1E28';
        }
      }
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
    const globalOverlay = document.getElementById('perf-fps-meter-overlay');
    const hudPill = document.getElementById('perf-telemetry-hud');
    const lobbyPill = document.getElementById('lobby-perf-badge');
    if (globalOverlay) globalOverlay.style.display = visible ? 'flex' : 'none';
    if (hudPill) hudPill.style.display = visible ? 'flex' : 'none';
    if (lobbyPill) lobbyPill.style.display = visible ? 'flex' : 'none';

    // Synchronize settings button state
    const fpsBtn = document.getElementById('btn-toggle-fps') || (this.container ? this.container.querySelector('#btn-toggle-fps') : null);
    if (fpsBtn) {
      fpsBtn.textContent = visible ? 'ON' : 'OFF';
      fpsBtn.className = `btn-toggle ${visible ? 'active' : ''}`;
    }
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

  triggerPlayRaceFlow() {
    const btn = document.getElementById('btn-lobby-play') || this.container.querySelector('#btn-lobby-play');
    if (!btn || btn.dataset.busy === 'true') return;
    btn.dataset.busy = 'true';

    if (this.game.sound) {
      this.game.sound.resume();
      this.game.sound.playMenuClick();
    }

    btn.classList.add('btn-pressed');
    if (btn && btn.blur) btn.blur();
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    if (this.game && this.game.ensureGameFocus) {
      this.game.ensureGameFocus();
    }
    this.spawnButtonParticleBurst(btn);

    // Camera cinematic push towards vehicle
    if (this.game && this.game.garageLobby && this.game.garageLobby.triggerLaunchPush) {
      this.game.garageLobby.triggerLaunchPush();
    }

    // Transform into SEARCHING...
    btn.innerHTML = `
      <span class="cta-subtitle"><span class="pulse-marker cyan"></span> CONNECTING TO ORBITAL GRID...</span>
      <strong class="cta-title">SEARCHING...</strong>
    `;

    setTimeout(() => {
      btn.classList.remove('btn-pressed');
      btn.classList.add('btn-found');
      if (this.game.sound && this.game.sound.playRaceFound) {
        this.game.sound.playRaceFound();
      }
      btn.innerHTML = `
        <span class="cta-subtitle"><span class="pulse-marker green"></span> GRID LOCKED // 8 PILOTS</span>
        <strong class="cta-title">MATCH FOUND</strong>
      `;

      setTimeout(() => {
        btn.dataset.busy = 'false';
        btn.classList.remove('btn-found');
        const trackNames = {
          shinjuku: 'NEO-SHINJUKU // URBAN CIRCUIT',
          fuji: 'FUJI SKYWAY // HIGHWAY PASS',
          district: 'NIGHT DISTRICT // ELIMINATION',
          coastline: 'COASTLINE // S-CLASS EXPRESSWAY'
        };
        const subText = trackNames[this.selectedTrackId] || 'SECTOR // CIRCUIT';
        btn.innerHTML = `
          <span class="cta-subtitle">${subText}</span>
          <strong class="cta-title">RACE NOW ►</strong>
        `;
        this.game.startMatchmaking(this.selectedTrackId);
      }, 360);
    }, 400);
  }

  spawnButtonParticleBurst(btn) {
    if (typeof document === 'undefined') return;
    const rect = btn.getBoundingClientRect();
    const count = 14;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'btn-burst-particle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 32 + Math.random() * 48;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.left = `${rect.left + rect.width * 0.5}px`;
      p.style.top = `${rect.top + rect.height * 0.5}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 550);
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
      const rarity = ['f8000', 'nxr01', 'v720'].includes(v.id) ? 'PINNACLE' : ['x900', 'k77'].includes(v.id) ? 'LEGENDARY' : 'EPIC';
      const pr = Math.round((v.maxSpeedKmh * 0.9) + (v.stats.accel * 3.6) + (v.stats.handling * 2.4) + ((v.stats.boost || 90) * 1.2));
      const spdPct = Math.min(100, Math.round(v.maxSpeedKmh / 4.5));
      const accPct = Math.min(100, v.stats.accel >= 10 ? v.stats.accel : v.stats.accel * 10);
      const hndPct = Math.min(100, v.stats.handling >= 10 ? v.stats.handling : v.stats.handling * 10);
      const bstPct = Math.min(100, (v.stats.nitro ? v.stats.nitro * 10 : (v.stats.boost || 90)));

      return `
        <div class="mcc-card ${isSelected ? 'active' : ''}" data-index="${originalIdx}">
          <div class="mcc-accent-bar" style="background:${colorHex}"></div>
          <div class="mcc-top-badge-row">
            <span class="mcc-rarity ${rarity.toLowerCase()}">${rarity}</span>
            <span class="mcc-pr">PR ${pr}</span>
          </div>
          <div class="mcc-card-preview">
            <div class="mcc-preview-glow" style="background:radial-gradient(circle, ${colorHex}55 0%, transparent 70%)"></div>
            <span class="mcc-silhouette">${v.name.split('//')[0].trim()}</span>
          </div>
          <div class="mcc-header">
            <strong class="mcc-name">${v.name.split('//')[0].trim()}</strong>
            <span class="mcc-cat">${v.category || 'HYPERCAR'}</span>
          </div>
          <small class="mcc-class">${v.classType}</small>

          <div class="mcc-mini-bars">
            <div class="mcc-bar-row">
              <span class="mbr-label">SPD</span>
              <div class="mbr-track"><div class="mbr-fill" style="width: ${spdPct}%"></div></div>
              <span class="mbr-val">${v.maxSpeedKmh}</span>
            </div>
            <div class="mcc-bar-row">
              <span class="mbr-label">ACC</span>
              <div class="mbr-track"><div class="mbr-fill acc" style="width: ${accPct}%"></div></div>
              <span class="mbr-val">${(v.stats.accel >= 10 ? (v.stats.accel / 10).toFixed(1) : v.stats.accel.toFixed(1))}</span>
            </div>
            <div class="mcc-bar-row">
              <span class="mbr-label">HND</span>
              <div class="mbr-track"><div class="mbr-fill hnd" style="width: ${hndPct}%"></div></div>
              <span class="mbr-val">${(v.stats.handling >= 10 ? (v.stats.handling / 10).toFixed(1) : v.stats.handling.toFixed(1))}</span>
            </div>
            <div class="mcc-bar-row">
              <span class="mbr-label">BST</span>
              <div class="mbr-track"><div class="mbr-fill bst" style="width: ${bstPct}%"></div></div>
              <span class="mbr-val">${(v.stats.boost >= 10 ? (v.stats.boost / 10).toFixed(1) : (v.stats.boost || 90))}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    strip.querySelectorAll('.mcc-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (this.game.sound && this.game.sound.playUIHover) this.game.sound.playUIHover();
      });
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

  updateRaceIntroCard(racerIndex, totalRacers = 8, introProgress = 0.0) {
    const card = document.getElementById('intro-bot-card') || this.container.querySelector('#intro-bot-card');
    if (!card) return;

    const playerName = (this.game && this.game.playerVehicle && this.game.playerVehicle.spec)
      ? this.game.playerVehicle.spec.name
      : 'F-8000 // NIGHTRIFT';

    if (introProgress < 0.25) {
      this.safeSetText('ibc-shot-id', 'CAM 01 // HERO FASCIA & AERO');
      this.safeSetText('ibc-pos', 'POLE POSITION // 01');
      this.safeSetText('ibc-name', 'RANJEET');
      this.safeSetText('ibc-vehicle', playerName);
      this.safeSetText('ibc-style', 'TITANIUM CHASSIS // ACTIVE DOWNFORCE');
    } else if (introProgress < 0.50) {
      this.safeSetText('ibc-shot-id', 'CAM 02 // PROPULSION & EXHAUST');
      this.safeSetText('ibc-pos', 'PROPULSION TELEMETRY');
      this.safeSetText('ibc-name', 'TURBINE ENGAGED');
      this.safeSetText('ibc-vehicle', playerName);
      this.safeSetText('ibc-style', 'NITROUS RESEED // OVERDRIVE READY');
    } else if (introProgress < 0.72) {
      this.safeSetText('ibc-shot-id', 'CAM 03 // GRID LINEUP & TELEMETRY');
      if (racerIndex === 0) {
        this.safeSetText('ibc-pos', `RACER 01 / 0${totalRacers}`);
        this.safeSetText('ibc-name', 'RANJEET');
        this.safeSetText('ibc-vehicle', playerName);
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
    } else {
      this.safeSetText('ibc-shot-id', 'CAM 04 // LAUNCH GANTRY TOUCHDOWN');
      this.safeSetText('ibc-pos', 'GRID STANDING: P1');
      this.safeSetText('ibc-name', 'RANJEET');
      this.safeSetText('ibc-vehicle', playerName);
      this.safeSetText('ibc-style', 'SYSTEM READY FOR GREEN LIGHT');
    }
  }

  showCountdownOverlay() {
    this._countdownGoTriggered = false;
    if (this._countdownHideTimeout) {
      clearTimeout(this._countdownHideTimeout);
      this._countdownHideTimeout = null;
    }
    const el = document.getElementById('screen-countdown-overlay');
    if (el) {
      el.classList.remove('flash-go');
      el.style.display = 'flex';
      el.style.opacity = '1';
    }
    const num = document.getElementById('countdown-num');
    if (num) {
      num.textContent = '3';
      num.className = 'countdown-number-hero';
    }
    const sub = document.getElementById('countdown-sub');
    if (sub) {
      sub.textContent = 'SYSTEM CHARGE // 33%';
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
      el.style.display = 'none';
      el.classList.remove('flash-go');
    }
    if (this._countdownHideTimeout) {
      clearTimeout(this._countdownHideTimeout);
      this._countdownHideTimeout = null;
    }
  }

  updateCountdown(timeRemaining, countInt) {
    const el = document.getElementById('screen-countdown-overlay');
    if (!el) return;

    // When countdown completes or is zero, transition to GO immediately
    if (timeRemaining <= 0) {
      this.triggerCountdownGo();
      return;
    }

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
        num.className = 'countdown-number-hero slam pulse';
        if (this.game.sound && this.game.sound.playCountdownPip) this.game.sound.playCountdownPip(false);
        if (this.game.cameraController && this.game.cameraController.addShake) this.game.cameraController.addShake(0.08);
        setTimeout(() => { if (num) num.className = 'countdown-number-hero'; }, 180);
      }
      if (sub) sub.textContent = 'SYSTEM CHARGE // 33%';
    } else if (timeRemaining > 1.0) {
      if (l1) l1.className = 'gantry-light red-on';
      if (l2) l2.className = 'gantry-light red-on';
      if (l3) l3.className = 'gantry-light';
      if (num.textContent !== '2') {
        num.textContent = '2';
        num.className = 'countdown-number-hero slam pulse';
        if (this.game.sound && this.game.sound.playCountdownPip) this.game.sound.playCountdownPip(false);
        if (this.game.cameraController && this.game.cameraController.addShake) this.game.cameraController.addShake(0.08);
        setTimeout(() => { if (num) num.className = 'countdown-number-hero'; }, 180);
      }
      if (sub) sub.textContent = 'SYSTEM CHARGE // 66%';
    } else if (timeRemaining > 0.0) {
      if (l1) l1.className = 'gantry-light red-on';
      if (l2) l2.className = 'gantry-light red-on';
      if (l3) l3.className = 'gantry-light red-on';
      if (num.textContent !== '1') {
        num.textContent = '1';
        num.className = 'countdown-number-hero slam pulse';
        if (this.game.sound && this.game.sound.playCountdownPip) this.game.sound.playCountdownPip(false);
        if (this.game.cameraController && this.game.cameraController.addShake) this.game.cameraController.addShake(0.08);
        setTimeout(() => { if (num) num.className = 'countdown-number-hero'; }, 180);
      }
      if (sub) sub.textContent = 'SYSTEM CHARGE // 100%';
    }
  }

  triggerCountdownGo() {
    if (this._countdownGoTriggered) return;
    this._countdownGoTriggered = true;

    const l1 = document.getElementById('glight-1');
    const l2 = document.getElementById('glight-2');
    const l3 = document.getElementById('glight-3');
    const num = document.getElementById('countdown-num');
    const sub = document.getElementById('countdown-sub');
    const el = document.getElementById('screen-countdown-overlay');

    if (l1) l1.className = 'gantry-light green-on';
    if (l2) l2.className = 'gantry-light green-on';
    if (l3) l3.className = 'gantry-light green-on';

    if (num) {
      num.textContent = 'GO!';
      num.className = 'countdown-number-hero go slam pulse';
    }
    if (sub) {
      sub.textContent = 'ENGAGE // HYPER DRIVE ACTIVE';
    }

    if (el) {
      el.classList.add('flash-go');
    }

    if (this.game && this.game.sound) {
      if (this.game.sound.playCountdownPip) this.game.sound.playCountdownPip(true);
      if (this.game.sound.playOverdriveBurstSound) this.game.sound.playOverdriveBurstSound();
    }

    if (this.game && this.game.cameraController && this.game.cameraController.addShake) {
      this.game.cameraController.addShake(0.28);
    }

    if (this._countdownHideTimeout) clearTimeout(this._countdownHideTimeout);
    this._countdownHideTimeout = setTimeout(() => {
      this.hideCountdownOverlay();
    }, 650);
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
    } else if (upperName.includes('OVERTAKE')) {
      const el = document.getElementById('stunt-overtake-entry');
      const textEl = document.getElementById('stunt-overtake-text');
      const ptsEl = document.getElementById('stunt-overtake-pts');
      if (el) {
        if (textEl) textEl.textContent = 'OVERTAKE';
        if (ptsEl) ptsEl.textContent = `+${points || 500}`;
        el.style.display = 'flex';
        el.classList.add('stunt-pop');
        clearTimeout(this.overtakeStuntTimeout);
        this.overtakeStuntTimeout = setTimeout(() => { el.style.display = 'none'; }, 2200);
      }
    } else if (upperName.includes('PERFECT LINE') || upperName.includes('CORNER')) {
      const el = document.getElementById('stunt-line-entry');
      const textEl = document.getElementById('stunt-line-text');
      const ptsEl = document.getElementById('stunt-line-pts');
      if (el) {
        if (textEl) textEl.textContent = 'PERFECT LINE';
        if (ptsEl) ptsEl.textContent = `+${points || 400}`;
        el.style.display = 'flex';
        el.classList.add('stunt-pop');
        clearTimeout(this.lineStuntTimeout);
        this.lineStuntTimeout = setTimeout(() => { el.style.display = 'none'; }, 2200);
      }
    } else if (upperName.includes('CLEAN LANDING') || upperName.includes('LANDING')) {
      const el = document.getElementById('stunt-landing-entry');
      const textEl = document.getElementById('stunt-landing-text');
      const ptsEl = document.getElementById('stunt-landing-pts');
      if (el) {
        if (textEl) textEl.textContent = upperName.includes('PERFECT') ? 'PERFECT LANDING' : 'CLEAN LANDING';
        if (ptsEl) ptsEl.textContent = `+${points || 300}`;
        el.style.display = 'flex';
        el.classList.add('stunt-pop');
        clearTimeout(this.landingStuntTimeout);
        this.landingStuntTimeout = setTimeout(() => { el.style.display = 'none'; }, 2200);
      }
    }

    clearTimeout(this.actionTimeout);
    this.actionTimeout = setTimeout(() => {
      if (banner) banner.style.display = 'none';
    }, 1800);
  }

  updateActiveControlsHUD(states) {
    if (!states) return;
    if (!this.ctrlElements) {
      this.ctrlElements = {
        keyW: document.getElementById('key-w'),
        keyS: document.getElementById('key-s'),
        keyA: document.getElementById('key-a'),
        keyD: document.getElementById('key-d'),
        keyShift: document.getElementById('key-shift'),
        keySpace: document.getElementById('key-space'),
        chipDrive: document.getElementById('ctrl-hint-drive'),
        chipSteer: document.getElementById('ctrl-hint-steer'),
        chipDrift: document.getElementById('ctrl-hint-drift'),
        chipNitro: document.getElementById('ctrl-hint-nitro')
      };
    }
    const e = this.ctrlElements;
    if (!e.keyW) return;

    if (states.throttle) { e.keyW.classList.add('active'); if (e.chipDrive) e.chipDrive.classList.add('active'); }
    else { e.keyW.classList.remove('active'); }

    if (states.brake) { e.keyS.classList.add('active'); if (e.chipDrive) e.chipDrive.classList.add('active'); }
    else { e.keyS.classList.remove('active'); }
    if (!states.throttle && !states.brake && e.chipDrive) { e.chipDrive.classList.remove('active'); }

    if (states.steerLeft) { e.keyA.classList.add('active'); if (e.chipSteer) e.chipSteer.classList.add('active'); }
    else { e.keyA.classList.remove('active'); }

    if (states.steerRight) { e.keyD.classList.add('active'); if (e.chipSteer) e.chipSteer.classList.add('active'); }
    else { e.keyD.classList.remove('active'); }
    if (!states.steerLeft && !states.steerRight && e.chipSteer) { e.chipSteer.classList.remove('active'); }

    if (states.drift) { if (e.keyShift) e.keyShift.classList.add('active'); if (e.chipDrift) e.chipDrift.classList.add('active'); }
    else { if (e.keyShift) e.keyShift.classList.remove('active'); if (e.chipDrift) e.chipDrift.classList.remove('active'); }

    if (states.boost) { if (e.keySpace) e.keySpace.classList.add('active'); if (e.chipNitro) e.chipNitro.classList.add('active'); }
    else { if (e.keySpace) e.keySpace.classList.remove('active'); if (e.chipNitro) e.chipNitro.classList.remove('active'); }
  }

  updateHUD(physics, gameState) {
    if (!physics || !gameState) return;

    // Smooth animated digital speed transition
    const rawSpeed = physics.getSpeedKmh();
    this._displaySpeed = this._displaySpeed !== undefined ? this._displaySpeed : rawSpeed;
    this._displaySpeed = THREE.MathUtils.lerp(this._displaySpeed, rawSpeed, 0.35);
    const speed = Math.floor(this._displaySpeed);
    this.safeSetText('rh-speed', speed.toString().padStart(3, '0'));

    // Dynamic Gear Indicator (Gears 1 to 7 based on propulsion velocity) with tactile 60 FPS shift pop
    const gear = speed < 25 ? 1 : speed < 80 ? 2 : speed < 160 ? 3 : speed < 240 ? 4 : speed < 320 ? 5 : speed < 400 ? 6 : 7;
    const gearEl = document.getElementById('rh-gear') || this.container.querySelector('#rh-gear');
    if (gearEl) {
      if (this._lastHudGear !== undefined && this._lastHudGear !== gear && speed > 20) {
        gearEl.classList.remove('gear-shift-pop');
        void gearEl.offsetWidth; // Trigger reflow to restart CSS pop animation
        gearEl.classList.add('gear-shift-pop');
      }
      gearEl.textContent = `GEAR ${gear}`;
    }
    this._lastHudGear = gear;

    // Pink Time Badge
    const timeFormatted = gameState.formatTime(gameState.currentLapTime || gameState.raceTime || 0);
    this.safeSetText('rh-lap-time', `TIME: ${timeFormatted}`);

    // Visual RPM tachometer calculation and readout
    const gearMinSpeed = [0, 0, 25, 80, 160, 240, 320, 400][gear] || 0;
    const gearMaxSpeed = [0, 25, 80, 160, 240, 320, 400, 440][gear] || 440;
    const gearSpan = Math.max(1, gearMaxSpeed - gearMinSpeed);
    const gearRatio = Math.min(1.0, Math.max(0.0, (speed - gearMinSpeed) / gearSpan));
    const rpm = Math.floor(3400 + gearRatio * 6200);

    const tachoRatio = Math.min(speed / 430.0, 1.0);
    const tachoFill = document.getElementById('rh-tacho-fill') || this.container.querySelector('#rh-tacho-fill');
    if (tachoFill) {
      tachoFill.style.width = `${Math.round(tachoRatio * 100)}%`;
      if (rpm > 8800) {
        tachoFill.style.background = 'linear-gradient(90deg, #FFB800, #FF1E3C)';
      } else {
        tachoFill.style.background = '';
      }
    }

    const rpmEl = document.getElementById('rh-rpm-readout') || this.container.querySelector('#rh-rpm-readout');
    if (rpmEl) {
      rpmEl.textContent = `${rpm.toLocaleString()} RPM`;
      if (rpm > 8800) rpmEl.classList.add('redline');
      else rpmEl.classList.remove('redline');
    }

    // Position & Lap (use smoothed displayPosition if available)
    const displayPos = gameState.displayPosition !== undefined ? gameState.displayPosition : gameState.currentPosition;
    this.safeSetHTML('rh-pos', `${displayPos.toString().padStart(2, '0')}<small>/08</small>`);
    const posEl = document.getElementById('rh-pos') || this.container.querySelector('#rh-pos');
    if (posEl) {
      if (displayPos === 1) posEl.classList.add('pos-first');
      else posEl.classList.remove('pos-first');
    }
    const maxLapsStr = (gameState.maxLaps || 3).toString().padStart(2, '0');
    this.safeSetHTML('rh-lap', `${gameState.currentLap.toString().padStart(2, '0')}<small>/${maxLapsStr}</small>`);

    // Race Progress %
    const totalCircuitLaps = (gameState.maxLaps || 3.0);
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

    // Live 8-Pilot Leaderboard Tower Update with live opponent distance
    this._lastTowerUpdate = this._lastTowerUpdate || 0;
    const nowTowerTime = performance.now();
    if (this.game.rivals && (nowTowerTime - this._lastTowerUpdate > 100)) {
      this._lastTowerUpdate = nowTowerTime;
      const standings = this.game.rivals.getStandings(physics.totalDistance, 'RANJEET');
      const towerEl = document.getElementById('hud-leaderboard-tower');
      if (towerEl && standings && standings.length >= 8) {
        let orderKey = '';
        for (let i = 0; i < 8; i++) orderKey += standings[i].name[0] + (standings[i].isPlayer ? 'P' : '');
        if (this._lastTowerKey !== orderKey || !towerEl.children.length) {
          this._lastTowerKey = orderKey;
          towerEl.innerHTML = standings.slice(0, 8).map((racer, idx) => {
            const pos = idx + 1;
            const isPlayer = racer.isPlayer;
            const deltaM = Math.abs(Math.round(racer.dist - physics.totalDistance));
            const deltaLabel = isPlayer ? 'YOU' : `${racer.dist > physics.totalDistance ? '+' : '-'}${deltaM}m`;
            return `
              <div class="lbt-item ${isPlayer ? 'player active' : ''}" data-pilot="${racer.name.toLowerCase()}">
                <span class="lbt-pos">${pos}</span>
                <span class="lbt-name">${racer.name}</span>
                <span class="lbt-you ${isPlayer ? '' : 'delta'}">${deltaLabel}</span>
              </div>
            `;
          }).join('');
        }
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

    // Checkpoint progress update
    if (gameState.getCheckpointProgress) {
      this.safeSetHTML('rh-checkpoint-badge', `${gameState.getCheckpointProgress()}`);
    }

    // Wrong-Way HUD Alert Banner
    const wrongWayBanner = document.getElementById('hud-wrong-way-banner');
    if (wrongWayBanner) {
      wrongWayBanner.style.display = gameState.isWrongWay ? 'flex' : 'none';
    }

    // Upcoming Turn Indicator with Distance Countdown
    const turnIndicator = document.getElementById('hud-turn-indicator');
    if (turnIndicator && this.game && this.game.circuit) {
      let sharpTurnU = null;
      let sharpTurnBank = 0;
      for (let scan = 0.008; scan <= 0.035; scan += 0.006) {
        const testU = (physics.currentU + scan) % 1.0;
        const testFrame = this.game.circuit.getFrameAt(testU);
        if (testFrame && (testFrame.curvature > 0.40 || Math.abs(testFrame.bank || 0) > 0.04)) {
          sharpTurnU = scan;
          sharpTurnBank = testFrame.bank || 0;
          break;
        }
      }

      if (sharpTurnU !== null) {
        const isLeft = sharpTurnBank > 0;
        const distM = Math.max(15, Math.floor(sharpTurnU * 5400));
        turnIndicator.style.display = 'flex';
        this.safeSetText('ti-arrow', isLeft ? '◄ ◄ ◄' : '► ► ►');
        this.safeSetText('ti-text', isLeft ? `SHARP LEFT // ${distM}M` : `SHARP RIGHT // ${distM}M`);
      } else {
        turnIndicator.style.display = 'none';
      }
    }

    // Collision Impact Flash trigger
    const impactFlashEl = document.getElementById('hud-impact-flash');
    if (impactFlashEl && physics.impactFlash) {
      impactFlashEl.style.display = 'block';
      clearTimeout(this._impactFlashTimeout);
      this._impactFlashTimeout = setTimeout(() => {
        impactFlashEl.style.display = 'none';
      }, 220);
    }

    // Off-Track 3-Second Automatic Reset HUD Alert
    const otAlert = document.getElementById('hud-offtrack-alert');
    if (otAlert) {
      if (physics.isOffTrack) {
        otAlert.style.display = 'block';
        const cd = Math.max(0.0, physics.offTrackCountdown !== undefined ? physics.offTrackCountdown : 0.0);
        this.safeSetText('ot-countdown-timer', `0${cd.toFixed(1)}s`);
        const otFill = document.getElementById('ot-progress-fill');
        if (otFill) {
          const fillPct = Math.max(0, Math.min(100, (cd / 3.0) * 100));
          otFill.style.width = `${fillPct}%`;
        }
      } else {
        otAlert.style.display = 'none';
      }
    }

    // Safety guard: Guarantee countdown overlay is NEVER stuck on screen while racing
    if (gameState && (gameState.status === 'RACING' || (gameState.raceTime && gameState.raceTime > 0.4))) {
      const cdEl = document.getElementById('screen-countdown-overlay');
      if (cdEl && cdEl.style.display !== 'none' && (gameState.raceTime > 0.7 || !this._countdownHideTimeout)) {
        this.hideCountdownOverlay();
      }
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
    const isFpp = (mode === 'COCKPIT' || mode === 'HOOD' || mode === 'BUMPER');
    const badgeText = isFpp ? 'FPP' : 'TPP';
    const subLabel = mode || (isFpp ? 'COCKPIT' : 'CHASE');

    // 1. Top HUD Button
    const btn = document.getElementById('btn-camera-hud') || (this.container && this.container.querySelector('#btn-camera-hud'));
    if (btn) {
      if (isFpp) {
        btn.classList.add('fpp-active');
        btn.setAttribute('title', 'Perspective: FPP (First-Person Cockpit). Click or press [V] to switch to TPP');
      } else {
        btn.classList.remove('fpp-active');
        btn.setAttribute('title', 'Perspective: TPP (Third-Person Chase). Click or press [V] to switch to FPP');
      }
      const iconWrap = btn.querySelector('.cam-icon-wrap');
      if (iconWrap) {
        iconWrap.innerHTML = isFpp ? FPP_CAMERA_SVG : TPP_CAMERA_SVG;
      }
      const badgeEl = btn.querySelector('.cam-perspective-badge');
      if (badgeEl) {
        badgeEl.textContent = badgeText;
      }
      const modeEl = btn.querySelector('.cam-mode-label');
      if (modeEl) {
        modeEl.textContent = subLabel;
      }
    }

    // 2. Mobile Circular HUD Button
    const mBtn = document.getElementById('m-btn-cam') || (this.container && this.container.querySelector('#m-btn-cam'));
    if (mBtn) {
      if (isFpp) {
        mBtn.classList.add('fpp-active');
        mBtn.setAttribute('title', 'Perspective: FPP. Tap to switch to TPP');
      } else {
        mBtn.classList.remove('fpp-active');
        mBtn.setAttribute('title', 'Perspective: TPP. Tap to switch to FPP');
      }
      const iconWrap = mBtn.querySelector('.cam-icon-wrap');
      if (iconWrap) {
        iconWrap.innerHTML = isFpp ? FPP_CAMERA_SVG : TPP_CAMERA_SVG;
      }
      const badgeEl = mBtn.querySelector('.cam-mini-badge');
      if (badgeEl) {
        badgeEl.textContent = badgeText;
      }
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

  // Update track briefing, HUD names, and sector stats dynamically
  updateTrackInfo(sectorDef) {
    if (!sectorDef) return;
    this.currentSectorDef = sectorDef;

    // Update Pre-Race Hero Screen
    const heroName = document.getElementById('pr-hero-track-name');
    if (heroName) heroName.textContent = sectorDef.name || 'NEON HORIZON';

    const heroLoc = document.getElementById('pr-hero-location');
    if (heroLoc) heroLoc.textContent = `${sectorDef.sectorNum || 'SECTOR'} // ${sectorDef.subtitle || 'HIGHWAY RIFT'}`;

    const heroStats = document.getElementById('pr-hero-sub-stats');
    if (heroStats) {
      heroStats.innerHTML = `<span>${sectorDef.laps || 3} LAPS</span> • <span>${sectorDef.lengthKm || 5.0} KM</span> • <span>${sectorDef.difficulty || 'CLASS-A'}</span> • <span>RANKED RACE</span>`;
    }

    // Update Lobby CTA Subtitle
    const ctaSub = document.querySelector('.cta-subtitle');
    if (ctaSub) {
      ctaSub.textContent = `${sectorDef.sectorNum || 'SECTOR'} // ${sectorDef.name || 'CIRCUIT'}`;
    }

    // Update Results Subtitle
    const resSub = document.querySelector('.res-sub');
    if (resSub) {
      resSub.textContent = `${sectorDef.name || 'CIRCUIT'} // ${sectorDef.sectorNum || 'SECTOR'}`;
    }

    // Update Win Subtitle
    const winTitle = document.querySelector('.win-champion-header h2');
    if (winTitle) {
      winTitle.textContent = `CHAMPION // ${sectorDef.sectorNum || 'SECTOR'} COMPLETE`;
    }

    // Update In-Game Lap Display Target
    const lapEl = document.getElementById('rh-lap');
    if (lapEl) {
      const maxLapsStr = (sectorDef.laps || 3).toString().padStart(2, '0');
      lapEl.innerHTML = `01<small>/${maxLapsStr}</small>`;
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

    const posChange = pos <= 2 ? `+${3 - pos} POS (P3 → P${pos})` : `P${pos} FINISH`;
    this.safeSetText('res-pos-change', posChange);

    // Roll up animated reward numbers
    const targetCoins = pos === 1 ? 15000 : (pos === 2 ? 10000 : 7500);
    const targetXp = pos === 1 ? 2500 : (pos === 2 ? 1800 : 1200);
    const duration = 1200;
    const startTime = performance.now();
    const animInterval = setInterval(() => {
      const now = performance.now();
      const progress = Math.min(1.0, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const curCoins = Math.round(ease * targetCoins);
      const curXp = Math.round(ease * targetXp);
      this.safeSetText('res-coins-val', `+${curCoins.toLocaleString()} Ȼ`);
      this.safeSetText('res-xp-val', `+${curXp.toLocaleString()} XP`);
      if (this.game.sound && this.game.sound.playRewardRoll && Math.random() < 0.3) {
        this.game.sound.playRewardRoll();
      }
      if (progress >= 1.0) {
        clearInterval(animInterval);
        if (this.game.sound && this.game.sound.playConfirmation) {
          this.game.sound.playConfirmation();
        }
        if (gameState.bestLapTime > 0) {
          saveManager.recordPersonalBest(
            this.selectedTrackId,
            gameState.bestLapTime,
            Math.floor(physics.maxSpeedKmh),
            Math.floor(physics.totalScore || 0)
          );
        }
        saveManager.addRoyalPassXP(pos === 1 ? 500 : (pos === 2 ? 350 : 250));
        this.updateLobbySeasonCard();
      }
    }, 40);

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
    await this.fetchAndRenderLeaderboard();
  }

  async fetchAndRenderLeaderboard(forceRefresh = false) {
    const tbody = document.getElementById('leaderboard-rows-body') || this.container.querySelector('#leaderboard-rows-body');
    if (tbody && (!this.cachedLeaderboard || forceRefresh)) {
      tbody.innerHTML = `<tr><td colspan="9" class="lb-loading"><span class="pulse-marker"></span> QUERYING ORBITAL TELEMETRY RELAY...</td></tr>`;
    }

    try {
      const status = await backendService.checkStatus();
      this.updateCloudStatusBadge(status.online, status.ping);

      const data = await backendService.getLeaderboard(50);
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.leaderboard)) {
        list = data.leaderboard;
      }

      // Always merge fallback data if list is short or empty
      const fallback = backendService.getLocalFallbackLeaderboard(this.leaderboardTrack);
      if (list.length === 0) {
        list = fallback.leaderboard;
      }

      // Merge player's real personal best if available
      const pb = saveManager.data.personalBests?.[this.leaderboardTrack];
      if (pb) {
        const playerPilot = {
          rank: 1,
          pilotName: saveManager.data.player.name || 'RANJEET',
          callsign: 'CREATOR // PILOT',
          vehicleName: 'F-8000 // NIGHTRIFT',
          lapTime: pb.lapTime,
          lapTimeFormatted: this.formatLeaderboardTime(pb.lapTime),
          topSpeed: pb.topSpeed || 438,
          driftScore: pb.driftScore || 18450,
          badge: 'DEV_RECORD',
          isPlayer: true
        };
        const existingIdx = list.findIndex(e => e.pilotName === playerPilot.pilotName);
        if (existingIdx >= 0) {
          list[existingIdx] = playerPilot;
        } else {
          list.push(playerPilot);
        }
      }

      list.sort((a, b) => a.lapTime - b.lapTime);
      list.forEach((item, idx) => { item.rank = idx + 1; });

      this.cachedLeaderboard = {
        success: true,
        track: this.leaderboardTrack,
        worldRecord: list[0],
        leaderboard: list
      };

      this.updateLeaderboardShowcase(list);
      this.renderLeaderboardRows(this.leaderboardFilter, this.leaderboardSearch);
    } catch (err) {
      console.warn('[Leaderboard] Network error, utilizing local telemetry cache:', err);
      const fallback = backendService.getLocalFallbackLeaderboard(this.leaderboardTrack);
      this.cachedLeaderboard = fallback;
      this.updateLeaderboardShowcase(fallback.leaderboard);
      this.renderLeaderboardRows(this.leaderboardFilter, this.leaderboardSearch);
    }
  }

  updateLeaderboardShowcase(entries) {
    if (!entries || entries.length === 0) return;
    const wr = entries[0];
    this.safeSetText('lb-wr-name', wr.pilotName);
    this.safeSetText('lb-wr-callsign', wr.callsign || 'WORLD RECORD HOLDER');
    this.safeSetText('lb-wr-time', wr.lapTimeFormatted);
    this.safeSetText('lb-wr-speed', `${wr.topSpeed} KM/H`);
    this.safeSetText('lb-wr-drift', `${(wr.driftScore || 0).toLocaleString()} PTS`);

    // Update bottom dock
    const playerName = saveManager.data.player.name || 'RANJEET';
    const playerEntry = entries.find(e => e.pilotName === playerName) || wr;
    this.safeSetText('lb-dock-pilot', playerName);
    this.safeSetText('lb-dock-rank', `CURRENT RANK: #${playerEntry.rank.toString().padStart(2, '0')}${playerEntry.rank === 1 ? ' (WORLD RECORD)' : ''}`);
    this.safeSetText('lb-dock-time', playerEntry.lapTimeFormatted);
    this.safeSetText('lb-dock-spd', `${playerEntry.topSpeed} KM/H`);
    this.safeSetText('lb-dock-drift', `${(playerEntry.driftScore || 0).toLocaleString()} PTS`);
  }

  renderLeaderboardRows(filter = 'all', searchQuery = '') {
    const tbody = document.getElementById('leaderboard-rows-body') || this.container.querySelector('#leaderboard-rows-body');
    if (!tbody) return;

    if (!this.cachedLeaderboard || !this.cachedLeaderboard.leaderboard) {
      this.cachedLeaderboard = backendService.getLocalFallbackLeaderboard(this.leaderboardTrack);
    }

    let entries = [...this.cachedLeaderboard.leaderboard];
    const topLap = entries[0] ? entries[0].lapTime : 48.214;
    const playerName = saveManager.data.player.name || 'RANJEET';

    if (filter === 'dev') {
      entries = entries.filter(e => e.pilotName === playerName || e.badge === 'DEV_RECORD');
    } else if (filter === 'rivals') {
      entries = entries.filter(e => e.badge === 'AI_LEGEND' || e.badge === 'PRO_PILOT' || e.badge === 'VETERAN');
    } else if (filter === 'my') {
      entries = entries.filter(e => e.pilotName === playerName || e.isPlayer);
      if (entries.length === 0) {
        entries = [{
          rank: 1,
          pilotName: playerName,
          callsign: 'CREATOR // PILOT',
          vehicleName: 'F-8000 // NIGHTRIFT',
          lapTime: 48.214,
          lapTimeFormatted: '00:48.214',
          topSpeed: 438,
          driftScore: 18450,
          badge: 'DEV_RECORD',
          isPlayer: true
        }];
      }
    }

    if (searchQuery) {
      entries = entries.filter(e => 
        e.pilotName.toLowerCase().includes(searchQuery) || 
        (e.vehicleName && e.vehicleName.toLowerCase().includes(searchQuery)) ||
        (e.callsign && e.callsign.toLowerCase().includes(searchQuery))
      );
    }

    if (entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="lb-empty">NO TELEMETRY MATCHING "${searchQuery.toUpperCase()}"</td></tr>`;
      return;
    }

    tbody.innerHTML = entries.map((item, idx) => {
      const isPlayer = item.pilotName === playerName || item.isPlayer;
      const rankBadge = item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : item.rank === 3 ? 'bronze' : '';
      const tagText = item.badge === 'DEV_RECORD' ? '👑 CREATOR' : item.badge === 'AI_LEGEND' ? '⚡ AI BOSS' : item.badge === 'PRO_PILOT' ? '🔥 PRO' : 'VERIFIED';
      const delta = (item.lapTime - topLap).toFixed(3);
      const deltaFormatted = item.rank === 1 ? 'WORLD RECORD' : `+${delta}s`;

      return `
        <tr class="${isPlayer ? 'player-row' : ''}">
          <td class="col-rank"><span class="rank-pill ${rankBadge}">#0${item.rank}</span></td>
          <td class="col-pilot">
            <strong>${item.pilotName}</strong>
            <small>${item.callsign || 'PILOT'}</small>
          </td>
          <td class="col-vehicle">${item.vehicleName || 'F-8000 // NIGHTRIFT'}</td>
          <td class="col-time"><strong>${item.lapTimeFormatted}</strong></td>
          <td class="col-delta ${item.rank === 1 ? 'wr' : ''}">${deltaFormatted}</td>
          <td class="col-spd">${item.topSpeed} KM/H</td>
          <td class="col-drift">${(item.driftScore || 0).toLocaleString()} PTS</td>
          <td class="col-badge"><span class="verified-tag ${item.badge}">${tagText}</span></td>
          <td>
            <button class="btn-challenge-ghost" data-pilot="${item.pilotName}" data-time="${item.lapTime}">⚡ RACE GHOST</button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach race ghost buttons
    tbody.querySelectorAll('.btn-challenge-ghost').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pilot = btn.dataset.pilot;
        const time = parseFloat(btn.dataset.time);
        this.challengePilotGhost(pilot, time);
      });
    });
  }

  formatLeaderboardTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:48.214';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }

  challengeWorldRecordGhost() {
    if (!this.cachedLeaderboard || !this.cachedLeaderboard.worldRecord) return;
    const wr = this.cachedLeaderboard.worldRecord;
    this.challengePilotGhost(wr.pilotName, wr.lapTime);
  }

  challengePilotGhost(pilotName, lapTime) {
    if (this.game && this.game.sound) {
      this.game.sound.playCountdownBeep(true);
    }
    this.showCyberpunkToast(
      `GHOST TELEMETRY ENGAGED`,
      `CHALLENGING ${pilotName} (${this.formatLeaderboardTime(lapTime)}) ON ${this.leaderboardTrack.toUpperCase()}!`,
      '⚡',
      'cyan'
    );
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    if (this.game && this.game.ensureGameFocus) {
      this.game.ensureGameFocus();
    }
    this.selectedTrackId = this.leaderboardTrack;
    this.showScreen('LOBBY');
    setTimeout(() => {
      this.triggerPlayRaceFlow();
    }, 400);
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

  updateLobbyVehiclePanel(spec = null) {
    if (!spec) {
      spec = (this.game && this.game.playerVehicle && this.game.playerVehicle.spec)
        ? this.game.playerVehicle.spec
        : VEHICLE_CATALOG[this.selectedCarIndex || 0];
    }
    if (!spec) return;

    const rarity = ['f8000', 'nxr01', 'v720'].includes(spec.id) ? 'PINNACLE' : ['x900', 'k77'].includes(spec.id) ? 'LEGENDARY' : 'EPIC';
    const pr = Math.round((spec.maxSpeedKmh * 0.9) + (spec.stats.accel * 3.6) + (spec.stats.handling * 2.4) + ((spec.stats.boost || 90) * 1.2));
    const spdPct = Math.min(100, Math.round(spec.maxSpeedKmh / 4.5));
    const accPct = Math.min(100, spec.stats.accel >= 10 ? spec.stats.accel : spec.stats.accel * 10);
    const hndPct = Math.min(100, spec.stats.handling >= 10 ? spec.stats.handling : spec.stats.handling * 10);
    const bstPct = Math.min(100, (spec.stats.nitro ? spec.stats.nitro * 10 : (spec.stats.boost || 90)));

    this.safeSetText('lobby-v-name', spec.name);
    this.safeSetText('lobby-v-class', `${spec.category || 'HYPERCAR'} // ${spec.classType || 'BALANCED'}`);
    this.safeSetText('lobby-v-rarity', rarity);
    this.safeSetText('lobby-v-pr', `PR ${pr}`);

    const rarityEl = document.getElementById('lobby-v-rarity');
    if (rarityEl) {
      rarityEl.className = `lmv-rarity ${rarity.toLowerCase()}`;
    }

    this.safeSetText('lobby-sb-spd', `${spec.maxSpeedKmh} KM/H`);
    this.safeSetWidth('lobby-sbf-spd', `${spdPct}%`);

    const accVal = (spec.stats.accel >= 10 ? (spec.stats.accel / 10).toFixed(1) : spec.stats.accel.toFixed(1));
    this.safeSetText('lobby-sb-acc', accVal);
    this.safeSetWidth('lobby-sbf-acc', `${accPct}%`);

    const hndVal = (spec.stats.handling >= 10 ? (spec.stats.handling / 10).toFixed(1) : spec.stats.handling.toFixed(1));
    this.safeSetText('lobby-sb-hnd', hndVal);
    this.safeSetWidth('lobby-sbf-hnd', `${hndPct}%`);

    const bstVal = (spec.stats.boost >= 10 ? (spec.stats.boost / 10).toFixed(1) : (spec.stats.boost || 90));
    this.safeSetText('lobby-sb-bst', bstVal.toString());
    this.safeSetWidth('lobby-sbf-bst', `${bstPct}%`);
  }

  startPreRaceLoadingEffects() {
    const playerSpec = (this.game && this.game.playerVehicle && this.game.playerVehicle.spec)
      ? this.game.playerVehicle.spec
      : VEHICLE_CATALOG[0];
    const playerPr = Math.round((playerSpec.maxSpeedKmh * 0.9) + (playerSpec.stats.accel * 3.6) + (playerSpec.stats.handling * 2.4) + ((playerSpec.stats.boost || 90) * 1.2));

    this.safeSetText('pr-player-pilot-name', saveManager.data.player?.name || 'RANJEET');
    this.safeSetText('pr-player-veh-name', playerSpec.name);
    this.safeSetText('pr-player-veh-class', `${playerSpec.classType || 'S-CLASS'} • PR ${playerPr}`);
    this.safeSetText('pr-player-lvl', `LVL ${saveManager.data.player?.level || 87}`);

    const tips = [
      '"Use boost after exiting sharp corners for maximum acceleration."',
      '"Tap airbrakes [Q / E] to initiate high-speed magnetic drift through tight chicanes."',
      '"Drafting behind rival slipstreams charges your kinetic boost capacitor."',
      '"Hit induction pads on apex curbs to sustain top supersonic velocity."',
      '"Clean landings after track jumps award bonus nitro overdrive energy."'
    ];

    if (this._prTipTimer) clearInterval(this._prTipTimer);
    let tipIdx = 0;
    const tipEl = document.getElementById('pr-tip-text');
    if (tipEl) tipEl.textContent = tips[0];

    this._prTipTimer = setInterval(() => {
      tipIdx = (tipIdx + 1) % tips.length;
      if (tipEl) {
        tipEl.style.opacity = '0';
        setTimeout(() => {
          if (tipEl) {
            tipEl.textContent = tips[tipIdx];
            tipEl.style.opacity = '1';
          }
        }, 280);
      }
    }, 3000);
  }

  updatePreRaceProgress(pct) {
    const rounded = Math.min(100, Math.floor(pct));
    this.safeSetWidth('pr-progress-fill', `${rounded}%`);
    this.safeSetText('pr-loading-pct', `LOADING ${rounded}%`);

    const setItemState = (id, state) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = `psc-item ${state}`;
      const check = el.querySelector('.psc-check');
      if (check) {
        check.textContent = state === 'done' ? '✓' : (state === 'active' ? '...' : '-');
      }
    };

    const beam = document.getElementById('pr-scan-beam');
    if (beam) {
      beam.style.left = `${rounded}%`;
    }

    if (rounded < 20) {
      setItemState('psc-track', 'active');
      setItemState('psc-veh', 'pending');
      setItemState('psc-opp', 'pending');
      setItemState('psc-grav', 'pending');
      setItemState('psc-prep', 'pending');
      this.safeSetText('pr-loading-msg', 'INITIALIZING TRACK TOPOLOGY...');
    } else if (rounded < 45) {
      setItemState('psc-track', 'done');
      setItemState('psc-veh', 'active');
      setItemState('psc-opp', 'pending');
      setItemState('psc-grav', 'pending');
      setItemState('psc-prep', 'pending');
      this.safeSetText('pr-loading-msg', 'LOADING HIGH-PRECISION VEHICLES...');
    } else if (rounded < 70) {
      setItemState('psc-track', 'done');
      setItemState('psc-veh', 'done');
      setItemState('psc-opp', 'active');
      setItemState('psc-grav', 'pending');
      setItemState('psc-prep', 'pending');
      this.safeSetText('pr-loading-msg', 'SYNCING ORBITAL OPPONENT TELEMETRY...');
    } else if (rounded < 92) {
      setItemState('psc-track', 'done');
      setItemState('psc-veh', 'done');
      setItemState('psc-opp', 'done');
      setItemState('psc-grav', 'active');
      setItemState('psc-prep', 'pending');
      this.safeSetText('pr-loading-msg', 'CALIBRATING ANTI-GRAVITY FIELDS...');
    } else if (rounded < 100) {
      setItemState('psc-track', 'done');
      setItemState('psc-veh', 'done');
      setItemState('psc-opp', 'done');
      setItemState('psc-grav', 'done');
      setItemState('psc-prep', 'active');
      this.safeSetText('pr-loading-msg', 'PREPARING RACE LAUNCH GANTRY...');
    } else {
      setItemState('psc-track', 'done');
      setItemState('psc-veh', 'done');
      setItemState('psc-opp', 'done');
      setItemState('psc-grav', 'done');
      setItemState('psc-prep', 'done');
      this.safeSetText('pr-loading-msg', 'ALL SYSTEMS GREEN // LAUNCHING RACE');
    }
  }

  updatePostSyncProgress(pct) {
    this.safeSetWidth('post-sync-fill', `${pct}%`);
    this.safeSetText('post-sync-pct', `${pct}%`);
  }

  updateLobbyHeader() {
    if (!saveManager || !saveManager.data || !saveManager.data.player) return;
    const p = saveManager.data.player;
    this.safeSetText('lobby-player-name', p.name || 'RANJEET');
    this.safeSetText('lobby-lvl-badge', `LVL ${p.level || 87}`);
    this.safeSetText('lobby-credits', (p.credits || 45200).toLocaleString());
    this.safeSetText('lobby-tokens', (p.tokens || 350).toLocaleString());
    const xp = p.xp || 8450;
    const nextXp = p.nextLevelXp || 12000;
    const pct = Math.min(100, Math.max(0, Math.round((xp / nextXp) * 100)));
    this.safeSetWidth('lobby-xp-fill', `${pct}%`);
    this.safeSetText('lobby-xp-ratio', `${xp.toLocaleString()} / ${nextXp.toLocaleString()} XP`);
  }

  claimPubgRewards() {
    if (saveManager && saveManager.data && saveManager.data.player) {
      saveManager.data.player.credits = (saveManager.data.player.credits || 45200) + 5000;
      saveManager.data.player.xp = (saveManager.data.player.xp || 8450) + 2500;
      const nextXp = saveManager.data.player.nextLevelXp || 12000;
      if (saveManager.data.player.xp >= nextXp) {
        saveManager.data.player.level = (saveManager.data.player.level || 87) + 1;
        saveManager.data.player.nextLevelXp = Math.floor(nextXp * 1.25);
      }
      saveManager.save();
    }
    this.updateLobbyHeader();
    this.showScreen('LOBBY');
    this.game.returnToLobby();
  }
}
