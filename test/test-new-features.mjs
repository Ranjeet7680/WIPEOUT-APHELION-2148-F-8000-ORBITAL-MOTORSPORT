import { saveManager } from '../src/game/SaveManager.js';
import { backendService } from '../src/backend/BackendService.js';
import { ROYAL_PASS_SEASON_1_TIERS } from '../src/ui/CinematicUI.js';
import fs from 'fs';

console.log('--- TESTING NEW FEATURES ---');

// 1. Verify Image Assets Exist
console.log('1. Verifying Image Assets...');
assert(fs.existsSync('./public/images/event_midnight_cup.jpg'), 'Event poster public/images/event_midnight_cup.jpg must exist');
assert(fs.existsSync('./public/images/loading_screen.jpg'), 'New loading screen public/images/loading_screen.jpg must exist');
assert(fs.existsSync('./public/images/loading_screen_new.jpg'), 'New loading screen backup must exist');
console.log('✓ All generated images verified!');

// 2. Test Royal Pass Season 01
console.log('2. Testing Royal Pass Season 01...');
assert(Array.isArray(ROYAL_PASS_SEASON_1_TIERS), 'ROYAL_PASS_SEASON_1_TIERS must be an array');
assert(ROYAL_PASS_SEASON_1_TIERS.length === 20, 'Must have 20 tiers');
assert(ROYAL_PASS_SEASON_1_TIERS[19].isPinnacle === true, 'Tier 20 must be Pinnacle 24K Golden Hypercar');

const rp = saveManager.getRoyalPass();
assert(rp.season === 1, `Season must be 1, got ${rp.season}`);
console.log(`Current Royal Pass: Level ${rp.level}, XP ${rp.xp}/${rp.xpNext}, Claimed: [${rp.claimedTiers.join(', ')}]`);

const initialCredits = saveManager.data.player.credits;
const initialTokens = saveManager.data.player.tokens;

// Test Claim Tier
const testTier = ROYAL_PASS_SEASON_1_TIERS.find(t => !rp.claimedTiers.includes(t.tier) && rp.level >= t.tier);
if (testTier) {
  const claimed = saveManager.claimRoyalPassTier(testTier.tier, testTier.reward);
  assert(claimed === true, `Should successfully claim tier ${testTier.tier}`);
  assert(saveManager.getRoyalPass().claimedTiers.includes(testTier.tier), `Claimed tiers must include ${testTier.tier}`);
  console.log(`✓ Claimed Tier ${testTier.tier} (${testTier.title}): +${testTier.reward.credits} Cr, +${testTier.reward.tokens} Tokens`);
}

// Test XP Boost & Level Up
const initialLevel = saveManager.getRoyalPass().level;
const boostRes = saveManager.addRoyalPassXP(5000);
console.log(`✓ Boosted 5000 XP: New Level ${boostRes.rp.level}, Leveled Up: ${boostRes.leveledUp}`);
assert(boostRes.rp.level >= initialLevel, 'Level must increase or stay high');

// 3. Test Leaderboard Multi-Track & Rivals
console.log('3. Testing Leaderboard multi-circuit & rivals...');
const shinjukuFallback = backendService.getLocalFallbackLeaderboard('shinjuku');
assert(shinjukuFallback.success === true, 'Fallback must be successful');
assert(shinjukuFallback.leaderboard.length >= 10, 'Must have at least 10 pilots');

const rivals = ['RYUKI', 'KAITO', 'HARUTO', 'SORA', 'TANAKA', 'MIKA', 'KENJI'];
for (const rival of rivals) {
  const found = shinjukuFallback.leaderboard.some(p => p.pilotName === rival);
  assert(found, `Leaderboard must contain in-game rival ${rival}`);
}
console.log('✓ In-game rivals verified in leaderboard roster (Ryuki, Kaito, Haruto, Sora, Tanaka, Mika, Kenji)');

// Test Fuji track
const fujiFallback = backendService.getLocalFallbackLeaderboard('fuji');
assert(fujiFallback.track.includes('FUJI'), 'Fuji circuit name must be correct');
console.log(`✓ Multi-circuit fallback verified (${fujiFallback.track})`);

// 4. Test Personal Best Recording
saveManager.recordPersonalBest('shinjuku', 47.950, 442, 19200);
assert(saveManager.data.personalBests.shinjuku.lapTime === 47.950, 'Personal best lap time must be recorded');
console.log('✓ Personal best recording verified');

console.log('\n========================================');
console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY!');
console.log('========================================');

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}
