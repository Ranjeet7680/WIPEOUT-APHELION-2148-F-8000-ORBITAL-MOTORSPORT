// ============================================================================
// NEO-SHINJUKU RIFT: AETHER-9 // BACKEND API: PILOT PROFILE & CLOUD SYNC
// Serverless endpoint deployed to Vercel / Node.js
// Syncs player rank, level, XP, credits, certifications and career stats
// ============================================================================

// Cloud profile database cache
const pilotProfiles = new Map([
  [
    'RANJEET',
    {
      callsign: 'RANJEET',
      licenseId: 'LIC-2089-RK-001',
      title: 'CREATOR // CHIEF PILOT',
      level: 10,
      xp: 42000,
      credits: 185000,
      tokens: 950,
      winStreak: 12,
      racesCompleted: 48,
      podiums: 46,
      tutorialCompleted: true,
      certifiedClass: 'CLASS_S_ORBITAL',
      unlockedVehicles: ['f8000', 'v720', 'x900', 'k77', 'r500', 'a11'],
      equippedVehicle: 'f8000',
      lastSynced: '2089-10-12T04:12:00Z'
    }
  ]
]);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Fetch cloud pilot profile
  if (req.method === 'GET') {
    const callsign = (req.query.callsign || 'RANJEET').toString().trim().toUpperCase();

    if (!pilotProfiles.has(callsign)) {
      // Create new profile dynamically
      pilotProfiles.set(callsign, {
        callsign,
        licenseId: `LIC-2089-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        title: 'ROOKIE CADET',
        level: 1,
        xp: 0,
        credits: 5000,
        tokens: 50,
        winStreak: 0,
        racesCompleted: 0,
        podiums: 0,
        tutorialCompleted: false,
        certifiedClass: 'CLASS_C_APPRENTICE',
        unlockedVehicles: ['f8000'],
        equippedVehicle: 'f8000',
        lastSynced: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      profile: pilotProfiles.get(callsign)
    });
  }

  // 2. POST: Cloud Sync local profile data
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { callsign = 'RANJEET', level, xp, credits, tokens, winStreak, tutorialCompleted } = body;

      const upperCallsign = callsign.trim().toUpperCase();
      const existing = pilotProfiles.get(upperCallsign) || {
        licenseId: `LIC-2089-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        title: 'NEURAL RACER',
        unlockedVehicles: ['f8000'],
        equippedVehicle: 'f8000',
        racesCompleted: 0,
        podiums: 0
      };

      const updated = {
        ...existing,
        callsign: upperCallsign,
        level: level !== undefined ? Math.max(existing.level || 1, level) : (existing.level || 1),
        xp: xp !== undefined ? Math.max(existing.xp || 0, xp) : (existing.xp || 0),
        credits: credits !== undefined ? Math.max(existing.credits || 0, credits) : (existing.credits || 0),
        tokens: tokens !== undefined ? Math.max(existing.tokens || 0, tokens) : (existing.tokens || 0),
        winStreak: winStreak !== undefined ? winStreak : (existing.winStreak || 0),
        tutorialCompleted: tutorialCompleted !== undefined ? tutorialCompleted : existing.tutorialCompleted,
        lastSynced: new Date().toISOString()
      };

      pilotProfiles.set(upperCallsign, updated);

      return res.status(200).json({
        success: true,
        message: 'PILOT PROFILE CLOUD SYNC SUCCESSFUL',
        profile: updated
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'PROFILE_SYNC_ERROR',
        details: err.message
      });
    }
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
}
