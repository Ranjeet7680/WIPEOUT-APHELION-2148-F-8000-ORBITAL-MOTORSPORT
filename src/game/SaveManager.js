// ============================================================================
// NEO-SHINJUKU RIFT: PERSISTENT SAVE MANAGER (V2)
// Tracks First-Time Player state, Tutorial completion, Driving School modules,
// Audio/Voice settings, XP, Credits, and Player Driver Profile
// ============================================================================

const SAVE_KEY = 'neo_shinjuku_rift_save_v2';

const DEFAULT_SAVE_DATA = {
  version: 2,
  firstLaunch: true,
  tutorialCompleted: false,
  tutorialSkipped: false,
  tutorialProgress: {
    movement: false,
    braking: false,
    drift: false,
    boost: false,
    checkpoints: false,
    minimap: false,
    perfectBoost: false,
    stunts: false,
    traffic: false,
    rival: false,
    finalRace: false
  },
  tutorialRewards: {
    badge: false,
    credits: 0,
    xp: 0
  },
  settings: {
    vectorEnabled: true,
    voiceEnabled: true,
    subtitleEnabled: true,
    sfxVolume: 1.0,
    musicVolume: 0.85,
    ghostEnabled: true,
    showFps: true,
    graphicsQuality: 'HIGH',
    lobbyTheme: 'CHASE_THE_HORIZON'
  },
  player: {
    name: 'RANJEET',
    level: 87,
    xp: 8450,
    nextLevelXp: 12000,
    credits: 45200,
    tokens: 350,
    energy: 10,
    maxEnergy: 10,
    winStreak: 3,
    worldProgress: 140,
    maxWorldProgress: 144,
    selectedRegion: 'neo_city',
    selectedCar: 'f8000'
  },
  royalPass: {
    season: 1,
    level: 12,
    xp: 1450,
    xpNext: 2000,
    isElite: true,
    claimedTiers: [1, 2, 3, 4],
    viewTrack: 'elite'
  },
  dailyReward: {
    streak: 3,
    lastClaimDate: null,
    claimedToday: false
  },
  personalBests: {
    shinjuku: { lapTime: 48.214, topSpeed: 438, driftScore: 18450, date: '2089-10-12T04:12:00Z' },
    fuji: { lapTime: 54.120, topSpeed: 420, driftScore: 14200, date: '2089-10-11T12:00:00Z' },
    district: { lapTime: 51.850, topSpeed: 428, driftScore: 16100, date: '2089-10-10T16:30:00Z' },
    coastline: { lapTime: 56.400, topSpeed: 440, driftScore: 13900, date: '2089-10-09T20:15:00Z' }
  }
};

export class SaveManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (typeof localStorage === 'undefined') {
        return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
      }
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
      }
      const parsed = JSON.parse(raw);
      // Merge with defaults in case new fields were added
      return {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        tutorialProgress: {
          ...DEFAULT_SAVE_DATA.tutorialProgress,
          ...(parsed.tutorialProgress || {})
        },
        tutorialRewards: {
          ...DEFAULT_SAVE_DATA.tutorialRewards,
          ...(parsed.tutorialRewards || {})
        },
        settings: {
          ...DEFAULT_SAVE_DATA.settings,
          ...(parsed.settings || {})
        },
        royalPass: {
          ...DEFAULT_SAVE_DATA.royalPass,
          ...(parsed.royalPass || {}),
          season: 1,
          claimedTiers: Array.isArray(parsed.royalPass?.claimedTiers) ? parsed.royalPass.claimedTiers : DEFAULT_SAVE_DATA.royalPass.claimedTiers
        },
        dailyReward: {
          ...DEFAULT_SAVE_DATA.dailyReward,
          ...(parsed.dailyReward || {})
        },
        personalBests: {
          ...DEFAULT_SAVE_DATA.personalBests,
          ...(parsed.personalBests || {})
        },
        player: {
          ...DEFAULT_SAVE_DATA.player,
          ...(parsed.player || {}),
          level: Math.max(DEFAULT_SAVE_DATA.player.level, parsed.player?.level || 0),
          energy: parsed.player?.energy ?? 10,
          maxEnergy: 10,
          worldProgress: parsed.player?.worldProgress ?? 140,
          maxWorldProgress: 144
        }
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    }
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.warn('Failed to persist save data to localStorage', e);
    }
  }

  isFirstLaunch() {
    return !!this.data.firstLaunch;
  }

  markFirstLaunchComplete() {
    this.data.firstLaunch = false;
    this.save();
  }

  isTutorialCompleted() {
    return !!this.data.tutorialCompleted;
  }

  completeTutorial(rewards = { xp: 2500, credits: 1000, badge: true }) {
    this.data.tutorialCompleted = true;
    this.data.firstLaunch = false;
    this.data.tutorialRewards = {
      badge: true,
      credits: (this.data.tutorialRewards.credits || 0) + (rewards.credits || 1000),
      xp: (this.data.tutorialRewards.xp || 0) + (rewards.xp || 2500)
    };

    // Mark all modules complete
    Object.keys(this.data.tutorialProgress).forEach(key => {
      this.data.tutorialProgress[key] = true;
    });

    // Credit player progression
    this.data.player.xp += (rewards.xp || 2500);
    this.data.player.credits += (rewards.credits || 1000);
    if (this.data.player.xp >= 12000) {
      this.data.player.level = Math.max(this.data.player.level, 8);
    }

    this.save();
  }

  skipTutorial() {
    this.data.tutorialSkipped = true;
    this.data.firstLaunch = false;
    this.save();
  }

  completeModule(moduleKey) {
    if (this.data.tutorialProgress[moduleKey] !== undefined) {
      this.data.tutorialProgress[moduleKey] = true;
      this.save();
    }
  }

  getSettings() {
    return this.data.settings;
  }

  updateSettings(partial) {
    this.data.settings = {
      ...this.data.settings,
      ...partial
    };
    this.save();
  }

  getRoyalPass() {
    if (!this.data.royalPass) {
      this.data.royalPass = {
        season: 1,
        level: 12,
        xp: 1450,
        xpNext: 2000,
        isElite: true,
        claimedTiers: [1, 2, 3, 4],
        viewTrack: 'elite'
      };
    }
    return this.data.royalPass;
  }

  addRoyalPassXP(amount) {
    const rp = this.getRoyalPass();
    rp.xp += amount;
    let leveledUp = false;
    while (rp.xp >= rp.xpNext && rp.level < 25) {
      rp.xp -= rp.xpNext;
      rp.level += 1;
      rp.xpNext = Math.min(5000, Math.floor(rp.xpNext * 1.15));
      leveledUp = true;
    }
    this.save();
    return { rp, leveledUp };
  }

  claimRoyalPassTier(tierNumber, reward) {
    const rp = this.getRoyalPass();
    if (!rp.claimedTiers.includes(tierNumber)) {
      rp.claimedTiers.push(tierNumber);
      if (reward) {
        if (reward.credits) this.data.player.credits = (this.data.player.credits || 0) + reward.credits;
        if (reward.tokens) this.data.player.tokens = (this.data.player.tokens || 0) + reward.tokens;
      }
      this.save();
      return true;
    }
    return false;
  }

  claimAllRoyalPassTiers(tiersWithRewards) {
    const rp = this.getRoyalPass();
    let totalCredits = 0;
    let totalTokens = 0;
    let count = 0;

    tiersWithRewards.forEach(item => {
      if (!rp.claimedTiers.includes(item.tier)) {
        rp.claimedTiers.push(item.tier);
        if (item.reward?.credits) totalCredits += item.reward.credits;
        if (item.reward?.tokens) totalTokens += item.reward.tokens;
        count++;
      }
    });

    if (totalCredits > 0) this.data.player.credits = (this.data.player.credits || 0) + totalCredits;
    if (totalTokens > 0) this.data.player.tokens = (this.data.player.tokens || 0) + totalTokens;
    this.save();
    return { count, totalCredits, totalTokens };
  }

  recordPersonalBest(trackId, time, speed, drift) {
    if (!this.data.personalBests) this.data.personalBests = {};
    const current = this.data.personalBests[trackId];
    if (!current || time < current.lapTime) {
      this.data.personalBests[trackId] = {
        lapTime: time,
        topSpeed: Math.max(speed, current?.topSpeed || 0),
        driftScore: Math.max(drift, current?.driftScore || 0),
        date: new Date().toISOString()
      };
      this.save();
      return true;
    }
    return false;
  }

  resetData() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    this.save();
  }
}

export const saveManager = new SaveManager();
