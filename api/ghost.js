// ============================================================================
// NEO-SHINJUKU RIFT: AETHER-9 // BACKEND API: GHOST TELEMETRY REPLAY
// Serverless endpoint deployed to Vercel / Node.js
// Stores and streams compressed 60Hz/spline ghost recordings for time-trial competition
// ============================================================================

// Procedurally generate a baseline World Record Ghost for RANJEET // NIGHTRIFT
function generateDevGhostTelemetry() {
  const lapTime = 48.214;
  const sampleCount = 96; // Dense keyframes along track
  const keyframes = [];

  for (let i = 0; i <= sampleCount; i++) {
    const progress = i / sampleCount;
    const time = progress * lapTime;

    // Approximate circuit trajectory shape
    const angle = progress * Math.PI * 2;
    const r = 240 + Math.sin(angle * 3) * 60;
    const x = Math.sin(angle) * r;
    const z = Math.cos(angle) * r;
    const y = 8 + Math.sin(progress * Math.PI * 6) * 12;

    const speed = 410 + Math.sin(progress * Math.PI * 8) * 35;
    const boostActive = (progress > 0.18 && progress < 0.28) || (progress > 0.65 && progress < 0.78);

    keyframes.push({
      t: parseFloat(time.toFixed(3)),
      u: parseFloat(progress.toFixed(4)),
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(y.toFixed(2)),
      z: parseFloat(z.toFixed(2)),
      yaw: parseFloat((-angle).toFixed(3)),
      spd: Math.round(speed),
      boost: boostActive
    });
  }

  return {
    id: 'ghost_wr_ranjeet',
    trackId: 'aether_skyway_07',
    pilotName: 'RANJEET',
    vehicleId: 'f8000',
    vehicleName: 'F-8000 // NIGHTRIFT',
    lapTime: 48.214,
    lapTimeFormatted: '00:48.214',
    recordedAt: '2089-10-12T04:12:00Z',
    keyframes
  };
}

let activeWorldRecordGhost = generateDevGhostTelemetry();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Fetch active ghost replay telemetry
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      ghost: activeWorldRecordGhost
    });
  }

  // 2. POST: Upload new ghost telemetry from a faster lap
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { pilotName, vehicleId, vehicleName, lapTime, keyframes } = body;

      if (!lapTime || !Array.isArray(keyframes) || keyframes.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_GHOST_DATA: Telemetry keyframe array is corrupted or insufficient.'
        });
      }

      // If faster than current world record ghost, update WR ghost
      if (lapTime < activeWorldRecordGhost.lapTime && lapTime >= 24.0) {
        activeWorldRecordGhost = {
          id: `ghost_${Date.now()}`,
          trackId: 'aether_skyway_07',
          pilotName: (pilotName || 'PILOT_2089').toUpperCase(),
          vehicleId: vehicleId || 'f8000',
          vehicleName: vehicleName || 'F-8000 // NIGHTRIFT',
          lapTime: parseFloat(lapTime.toFixed(3)),
          lapTimeFormatted: `${Math.floor(lapTime / 60).toString().padStart(2, '0')}:${Math.floor(lapTime % 60).toString().padStart(2, '0')}.${Math.floor((lapTime % 1) * 1000).toString().padStart(3, '0')}`,
          recordedAt: new Date().toISOString(),
          keyframes: keyframes.slice(0, 180) // Limit keyframes to preserve payload size
        };

        return res.status(201).json({
          success: true,
          message: '★ NEW WORLD RECORD GHOST UPLOADED TO GLOBAL SATELLITE RELAY ★',
          isWorldRecord: true,
          ghostId: activeWorldRecordGhost.id
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Personal ghost recorded locally.',
        isWorldRecord: false
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'GHOST_INGESTION_ERROR',
        details: err.message
      });
    }
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
}
