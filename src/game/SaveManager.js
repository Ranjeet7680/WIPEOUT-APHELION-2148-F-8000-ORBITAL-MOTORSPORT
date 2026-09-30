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
    graphicsQuality: 'HIGH'
  },
  player: {
    name: 'RANJEET',
    level: 7,
    xp: 8450,
    credits: 45200,
    tokens: 350,
    winStreak: 3
  }
};

export class SaveManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
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
        player: {
          ...DEFAULT_SAVE_DATA.player,
          ...(parsed.player || {})
        }
      };
    } catch (e) {
      console.warn('Failed to load save data from localStorage, using defaults', e);
      return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    }
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
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

  resetData() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    this.save();
  }
}

export const saveManager = new SaveManager();
