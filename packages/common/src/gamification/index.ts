import type { Badge, GamificationState, Level, PRRecord, WorkoutSession } from '../types';

export const LEVELS: Level[] = [
  { level: 1, name: 'Rookie', minXP: 0, maxXP: 200 },
  { level: 2, name: 'Copper Forger', minXP: 200, maxXP: 500 },
  { level: 3, name: 'Bronze Forger', minXP: 500, maxXP: 1000 },
  { level: 4, name: 'Iron Trainee', minXP: 1000, maxXP: 1500 },
  { level: 5, name: 'Iron Lifter', minXP: 1500, maxXP: 2000 },
  { level: 6, name: 'Iron Warrior', minXP: 2000, maxXP: 2500 },
  { level: 7, name: 'Iron Forger', minXP: 2500, maxXP: 3000 },
  { level: 8, name: 'Steel Forger', minXP: 3000, maxXP: 4000 },
  { level: 9, name: 'Steel Warrior', minXP: 4000, maxXP: 5500 },
  { level: 10, name: 'Gold Forger', minXP: 5500, maxXP: 7500 },
  { level: 15, name: 'Diamond Forger', minXP: 7500, maxXP: 12000 },
  { level: 20, name: 'Legend', minXP: 12000, maxXP: Infinity },
];

export const BADGES: Badge[] = [
  {
    id: 'first_lift', nameKey: 'badges.firstLift', descriptionKey: 'badges.firstLiftDesc',
    icon: '⚒', rarity: 'common', xpReward: 10,
    condition: { type: 'workouts', threshold: 1 },
  },
  {
    id: 'week_streak', nameKey: 'badges.weekStreak', descriptionKey: 'badges.weekStreakDesc',
    icon: '🔥', rarity: 'common', xpReward: 50,
    condition: { type: 'streak', threshold: 7 },
  },
  {
    id: 'pr_hunter', nameKey: 'badges.prHunter', descriptionKey: 'badges.prHunterDesc',
    icon: '↗', rarity: 'common', xpReward: 100,
    condition: { type: 'pr', threshold: 5 },
  },
  {
    id: 'macro_master', nameKey: 'badges.macroMaster', descriptionKey: 'badges.macroMasterDesc',
    icon: '◷', rarity: 'common', xpReward: 75,
    condition: { type: 'macros', threshold: 7 },
  },
  {
    id: 'iron_forger', nameKey: 'badges.ironForger', descriptionKey: 'badges.ironForgerDesc',
    icon: '⚙', rarity: 'rare', xpReward: 250,
    condition: { type: 'level', threshold: 7 },
  },
  {
    id: 'volume_king', nameKey: 'badges.volumeKing', descriptionKey: 'badges.volumeKingDesc',
    icon: '◬', rarity: 'rare', xpReward: 200,
    condition: { type: 'custom', threshold: 50000 },
  },
  {
    id: 'photo_diary', nameKey: 'badges.photoDiary', descriptionKey: 'badges.photoDiaryDesc',
    icon: '◐', rarity: 'common', xpReward: 100,
    condition: { type: 'photos', threshold: 12 },
  },
  {
    id: 'hundred_lifts', nameKey: 'badges.hundredLifts', descriptionKey: 'badges.hundredLiftsDesc',
    icon: '✦', rarity: 'rare', xpReward: 150,
    condition: { type: 'workouts', threshold: 100 },
  },
  {
    id: 'naturally_built', nameKey: 'badges.naturallyBuilt', descriptionKey: 'badges.naturallyBuiltDesc',
    icon: '✺', rarity: 'legendary', xpReward: 500,
    condition: { type: 'streak', threshold: 365 },
  },
  {
    id: 'sleep_warrior', nameKey: 'badges.sleepWarrior', descriptionKey: 'badges.sleepWarriorDesc',
    icon: '☾', rarity: 'common', xpReward: 75,
    condition: { type: 'custom', threshold: 14 },
  },
];

export const XP_REWARDS = {
  workoutComplete: 30,
  mealLogged: 10,
  macrosHit: 25,
  prSet: 50,
  progressPhoto: 20,
  weightLogged: 5,
  streakBonus: (days: number) => Math.min(days * 2, 50),
} as const;

export function getLevelForXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getXPProgress(xp: number): number {
  const level = getLevelForXP(xp);
  if (level.maxXP === Infinity) return 1;
  const range = level.maxXP - level.minXP;
  const earned = xp - level.minXP;
  return Math.min(earned / range, 1);
}

export function getXPToNextLevel(xp: number): number {
  const level = getLevelForXP(xp);
  if (level.maxXP === Infinity) return 0;
  return level.maxXP - xp;
}

export function calculateStreakBonus(streakDays: number): number {
  return XP_REWARDS.streakBonus(streakDays);
}

export function isStreakAlive(lastActivityDate: string): boolean {
  const last = new Date(lastActivityDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < 2;
}

export function checkNewBadges(state: GamificationState): Badge[] {
  const newBadges: Badge[] = [];
  for (const badge of BADGES) {
    if (state.badgesEarned.includes(badge.id)) continue;
    let earned = false;
    switch (badge.condition.type) {
      case 'workouts': earned = state.totalWorkouts >= badge.condition.threshold; break;
      case 'streak': earned = state.streakDays >= badge.condition.threshold; break;
      case 'pr': earned = state.totalPRs >= badge.condition.threshold; break;
      case 'level': earned = state.level >= badge.condition.threshold; break;
    }
    if (earned) newBadges.push(badge);
  }
  return newBadges;
}

export function estimateOneRM(weightKg: number, reps: number): number {
  // Epley formula
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function calculateWorkoutXP(session: WorkoutSession): number {
  let xp = XP_REWARDS.workoutComplete;
  const volumeBonus = Math.floor(session.totalVolumeKg / 1000) * 5;
  return xp + Math.min(volumeBonus, 50);
}

export function calculateTDEE(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}): number {
  const { weightKg, heightCm, age, sex, activityLevel } = params;
  let bmr: number;
  if (sex === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return Math.round(bmr * multipliers[activityLevel]);
}

export function calculateMacroTargets(kcal: number, goal: 'gain' | 'cut' | 'maintain', weightKg: number) {
  const proteinG = Math.round(weightKg * 2.2);
  const proteinKcal = proteinG * 4;
  const remaining = kcal - proteinKcal;
  let carbRatio: number;
  switch (goal) {
    case 'gain': carbRatio = 0.55; break;
    case 'cut': carbRatio = 0.40; break;
    default: carbRatio = 0.48;
  }
  const carbsG = Math.round((remaining * carbRatio) / 4);
  const fatG = Math.round((remaining * (1 - carbRatio)) / 9);
  return { proteinG, carbsG, fatG };
}
