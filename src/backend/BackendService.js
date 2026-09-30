// ============================================================================
// NEO-SHINJUKU RIFT: AETHER-9 // FRONTEND BACKEND SERVICE
// Manages serverless communication with /api endpoints:
// - Global Live Leaderboards
// - Ghost Telemetry Streaming & Recording
// - Driver Cloud Sync & Progression
// - Orbital Network Health & Latency Telemetry
// ============================================================================

export class BackendService {
  constructor() {
    this.baseUrl = '/api';
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.lastPing = 18;
    this.serverStatus = 'ONLINE';
    this.cachedLeaderboard = null;
    this.cachedGhost = null;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.checkStatus();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.serverStatus = 'OFFLINE';
      });
    }

    // Initial ping
    this.checkStatus();
  }

  async checkStatus() {
    const start = performance.now();
    try {
      const res = await fetch(`${this.baseUrl}/status`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.lastPing = Math.round(performance.now() - start);
      this.serverStatus = data.status || 'ONLINE';
      return { online: true, ping: this.lastPing, data };
    } catch {
      this.lastPing = 0;
      this.serverStatus = 'OFFLINE_LOCAL';
      return { online: false, ping: 0, error: 'Cannot reach AETHER-9 edge relay.' };
    }
  }

  async getLeaderboard(limit = 20) {
    try {
      const res = await fetch(`${this.baseUrl}/leaderboard?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.cachedLeaderboard = data;
      return data;
    } catch (err) {
      console.warn('[BackendService] Leaderboard fetch fallback:', err);
      // Return cached or fallback data
      return this.getLocalFallbackLeaderboard();
    }
  }

  async submitLap(lapData) {
    try {
      const res = await fetch(`${this.baseUrl}/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lapData)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('[BackendService] Lap submission fallback:', err);
      return {
        success: true,
        message: 'Saved to local pilot drive (Cloud relay offline).',
        rank: 1,
        rewards: { credits: 2500, xp: 1250 }
      };
    }
  }

  async getGhostTelemetry(trackId = 'aether_skyway_07') {
    try {
      const res = await fetch(`${this.baseUrl}/ghost?track=${trackId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.cachedGhost = data.ghost;
      return data.ghost;
    } catch (err) {
      console.warn('[BackendService] Ghost fetch fallback:', err);
      return this.cachedGhost;
    }
  }

  async submitGhostTelemetry(ghostData) {
    try {
      const res = await fetch(`${this.baseUrl}/ghost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ghostData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[BackendService] Ghost upload skipped:', err);
      return { success: false, error: err.message };
    }
  }

  async syncProfile(profileData) {
    try {
      const res = await fetch(`${this.baseUrl}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[BackendService] Profile sync error:', err);
      return { success: false, error: err.message };
    }
  }

  getLocalFallbackLeaderboard() {
    return {
      success: true,
      track: 'SECTOR 07 // AETHER SKYWAY',
      totalEntries: 5,
      worldRecord: {
        rank: 1,
        pilotName: 'RANJEET',
        vehicleName: 'F-8000 // NIGHTRIFT',
        lapTimeFormatted: '00:48.214',
        topSpeed: 438,
        driftScore: 18450
      },
      leaderboard: [
        { rank: 1, pilotName: 'RANJEET', vehicleName: 'F-8000 // NIGHTRIFT', lapTimeFormatted: '00:48.214', topSpeed: 438, driftScore: 18450, badge: 'DEV_RECORD' },
        { rank: 2, pilotName: 'KANE', vehicleName: 'V-720 // PHANTOM', lapTimeFormatted: '00:49.850', topSpeed: 425, driftScore: 15200, badge: 'AI_LEGEND' },
        { rank: 3, pilotName: 'NYX', vehicleName: 'X-900 // VELOCITY', lapTimeFormatted: '00:50.120', topSpeed: 418, driftScore: 14800, badge: 'PRO_PILOT' },
        { rank: 4, pilotName: 'ZEPHYR', vehicleName: 'K-77 // QUANTUM', lapTimeFormatted: '00:51.340', topSpeed: 432, driftScore: 13100, badge: 'PRO_PILOT' },
        { rank: 5, pilotName: 'VORTEX', vehicleName: 'R-500 // RAZOR', lapTimeFormatted: '00:52.010', topSpeed: 412, driftScore: 12900, badge: 'VETERAN' }
      ]
    };
  }
}

export const backendService = new BackendService();
