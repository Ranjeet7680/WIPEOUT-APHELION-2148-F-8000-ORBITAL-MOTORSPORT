// ============================================================================
// NEO-SHINJUKU RIFT: AETHER-9 // BACKEND API: GLOBAL PILOT LEADERBOARD
// Serverless endpoint deployed to Vercel / Node.js
// ============================================================================

// In-memory persistent cache for serverless invocation lifecycle
let leaderboardData = [
  {
    rank: 1,
    id: 'rec_dev_01',
    pilotName: 'RANJEET',
    callsign: 'NIGHT_COMMANDER',
    vehicleId: 'f8000',
    vehicleName: 'F-8000 // NIGHTRIFT',
    lapTime: 48.214,
    lapTimeFormatted: '00:48.214',
    topSpeed: 438,
    driftScore: 18450,
    stunts: 6,
    verified: true,
    badge: 'DEV_RECORD',
    date: '2089-10-12T04:12:00Z'
  },
  {
    rank: 2,
    id: 'rec_bot_01',
    pilotName: 'KANE',
    callsign: 'APEX_HUNTER',
    vehicleId: 'v720',
    vehicleName: 'V-720 // PHANTOM',
    lapTime: 49.850,
    lapTimeFormatted: '00:49.850',
    topSpeed: 425,
    driftScore: 15200,
    stunts: 5,
    verified: true,
    badge: 'AI_LEGEND',
    date: '2089-10-11T18:30:00Z'
  },
  {
    rank: 3,
    id: 'rec_bot_02',
    pilotName: 'NYX',
    callsign: 'VOID_WALKER',
    vehicleId: 'x900',
    vehicleName: 'X-900 // VELOCITY',
    lapTime: 50.120,
    lapTimeFormatted: '00:50.120',
    topSpeed: 418,
    driftScore: 14800,
    stunts: 4,
    verified: true,
    badge: 'PRO_PILOT',
    date: '2089-10-11T14:22:00Z'
  },
  {
    rank: 4,
    id: 'rec_bot_03',
    pilotName: 'ZEPHYR',
    callsign: 'AERO_PHANTOM',
    vehicleId: 'k77',
    vehicleName: 'K-77 // QUANTUM',
    lapTime: 51.340,
    lapTimeFormatted: '00:51.340',
    topSpeed: 432,
    driftScore: 13100,
    stunts: 3,
    verified: true,
    badge: 'PRO_PILOT',
    date: '2089-10-10T22:05:00Z'
  },
  {
    rank: 5,
    id: 'rec_bot_04',
    pilotName: 'VORTEX',
    callsign: 'ION_STORM',
    vehicleId: 'r500',
    vehicleName: 'R-500 // RAZOR',
    lapTime: 52.010,
    lapTimeFormatted: '00:52.010',
    topSpeed: 412,
    driftScore: 12900,
    stunts: 3,
    verified: true,
    badge: 'VETERAN',
    date: '2089-10-10T19:40:00Z'
  },
  {
    rank: 6,
    id: 'rec_bot_05',
    pilotName: 'SOLARIS',
    callsign: 'SOLAR_FLARE',
    vehicleId: 'a11',
    vehicleName: 'A-11 // AETHER',
    lapTime: 53.480,
    lapTimeFormatted: '00:53.480',
    topSpeed: 405,
    driftScore: 11400,
    stunts: 2,
    verified: true,
    badge: 'CADET',
    date: '2089-10-09T11:15:00Z'
  },
  {
    rank: 7,
    id: 'rec_bot_06',
    pilotName: 'RYUKI',
    callsign: 'APEX_PREDATOR',
    vehicleId: 'nxr01',
    vehicleName: 'NX-R01 // VORTEX',
    lapTime: 49.320,
    lapTimeFormatted: '00:49.320',
    topSpeed: 431,
    driftScore: 16800,
    stunts: 5,
    verified: true,
    badge: 'AI_LEGEND',
    date: '2089-10-12T01:00:00Z'
  },
  {
    rank: 8,
    id: 'rec_bot_07',
    pilotName: 'KAITO',
    callsign: 'DRIFT_TITAN',
    vehicleId: 'v720',
    vehicleName: 'V-720 // PHANTOM',
    lapTime: 49.850,
    lapTimeFormatted: '00:49.850',
    topSpeed: 425,
    driftScore: 17200,
    stunts: 4,
    verified: true,
    badge: 'AI_LEGEND',
    date: '2089-10-11T20:00:00Z'
  },
  {
    rank: 9,
    id: 'rec_bot_08',
    pilotName: 'HARUTO',
    callsign: 'NEON_BLADE',
    vehicleId: 'x900',
    vehicleName: 'X-900 // VELOCITY',
    lapTime: 50.780,
    lapTimeFormatted: '00:50.780',
    topSpeed: 420,
    driftScore: 14900,
    stunts: 4,
    verified: true,
    badge: 'AI_LEGEND',
    date: '2089-10-11T12:00:00Z'
  },
  {
    rank: 10,
    id: 'rec_bot_09',
    pilotName: 'SORA',
    callsign: 'AERO_PHANTOM',
    vehicleId: 'a11',
    vehicleName: 'A-11 // AETHER',
    lapTime: 51.240,
    lapTimeFormatted: '00:51.240',
    topSpeed: 418,
    driftScore: 14100,
    stunts: 3,
    verified: true,
    badge: 'PRO_PILOT',
    date: '2089-10-10T15:00:00Z'
  },
  {
    rank: 11,
    id: 'rec_bot_10',
    pilotName: 'TANAKA',
    callsign: 'CYBER_RONIN',
    vehicleId: 'k77',
    vehicleName: 'K-77 // QUANTUM',
    lapTime: 52.340,
    lapTimeFormatted: '00:52.340',
    topSpeed: 412,
    driftScore: 13200,
    stunts: 3,
    verified: true,
    badge: 'VETERAN',
    date: '2089-10-10T08:00:00Z'
  },
  {
    rank: 12,
    id: 'rec_bot_11',
    pilotName: 'MIKA',
    callsign: 'ION_VIXEN',
    vehicleId: 'f8000',
    vehicleName: 'F-8000 // NIGHTRIFT',
    lapTime: 52.910,
    lapTimeFormatted: '00:52.910',
    topSpeed: 408,
    driftScore: 12700,
    stunts: 2,
    verified: true,
    badge: 'VETERAN',
    date: '2089-10-09T18:00:00Z'
  },
  {
    rank: 13,
    id: 'rec_bot_12',
    pilotName: 'KENJI',
    callsign: 'MIDNIGHT_HAWK',
    vehicleId: 'v720',
    vehicleName: 'V-720 // PHANTOM',
    lapTime: 53.450,
    lapTimeFormatted: '00:53.450',
    topSpeed: 402,
    driftScore: 12100,
    stunts: 2,
    verified: true,
    badge: 'CADET',
    date: '2089-10-09T09:00:00Z'
  },
  {
    rank: 14,
    id: 'rec_bot_13',
    pilotName: 'ORION',
    callsign: 'GRAV_RIDER',
    vehicleId: 'f8000',
    vehicleName: 'F-8000 // NIGHTRIFT',
    lapTime: 54.910,
    lapTimeFormatted: '00:54.910',
    topSpeed: 395,
    driftScore: 9800,
    stunts: 2,
    verified: false,
    badge: 'CADET',
    date: '2089-10-08T09:12:00Z'
  }
];

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--.---';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Fetch global leaderboard
  if (req.method === 'GET') {
    const query = req.query || (req.url && req.url.includes('?') ? Object.fromEntries(new URLSearchParams(req.url.split('?')[1])) : {});
    const limit = Math.min(parseInt(query.limit || '50', 10), 100);
    const sorted = [...leaderboardData].sort((a, b) => a.lapTime - b.lapTime);
    sorted.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return res.status(200).json({
      success: true,
      track: 'SECTOR 07 // AETHER SKYWAY',
      totalEntries: sorted.length,
      worldRecord: sorted[0],
      leaderboard: sorted.slice(0, limit)
    });
  }

  // 2. POST: Submit a new lap telemetry record
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { pilotName, vehicleId, vehicleName, lapTime, topSpeed, driftScore, stunts } = body;

      // Anti-cheat & Physics validation bounds
      if (!lapTime || typeof lapTime !== 'number' || lapTime < 24.0 || lapTime > 600.0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_LAP_TIME: Lap time violates AETHER-9 relativistic speed constraints (24s - 600s).'
        });
      }

      const cleanPilot = (pilotName || 'PILOT_2089').toString().trim().slice(0, 24).toUpperCase();
      const cleanSpeed = Math.min(Math.max(Math.floor(topSpeed || 200), 50), 750);
      const cleanDrift = Math.max(Math.floor(driftScore || 0), 0);
      const cleanStunts = Math.max(Math.floor(stunts || 0), 0);

      const newEntry = {
        id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        pilotName: cleanPilot,
        callsign: cleanPilot === 'RANJEET' ? 'CREATOR // PILOT' : 'CHALLENGER',
        vehicleId: vehicleId || 'f8000',
        vehicleName: vehicleName || 'F-8000 // NIGHTRIFT',
        lapTime: parseFloat(lapTime.toFixed(3)),
        lapTimeFormatted: formatTime(lapTime),
        topSpeed: cleanSpeed,
        driftScore: cleanDrift,
        stunts: cleanStunts,
        verified: true,
        badge: cleanPilot === 'RANJEET' ? 'DEV_RECORD' : 'ONLINE_RACER',
        date: new Date().toISOString()
      };

      leaderboardData.push(newEntry);
      leaderboardData.sort((a, b) => a.lapTime - b.lapTime);

      leaderboardData.forEach((item, idx) => {
        item.rank = idx + 1;
      });

      const pilotRank = leaderboardData.findIndex(item => item.id === newEntry.id) + 1;
      const isWR = pilotRank === 1;

      return res.status(201).json({
        success: true,
        message: isWR ? '★ NEW WORLD RECORD ESTABLISHED! ★' : 'Telemetry verified and saved to orbital network.',
        rank: pilotRank,
        totalEntries: leaderboardData.length,
        entry: newEntry,
        deltaToFirst: parseFloat((newEntry.lapTime - leaderboardData[0].lapTime).toFixed(3)),
        rewards: {
          credits: isWR ? 10000 : Math.max(500, Math.floor(5000 / pilotRank)),
          xp: isWR ? 5000 : Math.max(300, Math.floor(2500 / pilotRank))
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'TELEMETRY_INGESTION_ERROR',
        details: err.message
      });
    }
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
}
