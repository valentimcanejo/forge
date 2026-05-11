import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { GamificationState, WeeklyMission } from '../types';
import {
  getLevelForXP, checkNewBadges, isStreakAlive, XP_REWARDS,
  calculateWorkoutXP, BADGES,
} from '../gamification';
import type { WorkoutSession } from '../types';

const gamificationRef = (uid: string) => doc(db, 'users', uid, 'gamification', 'state');

export async function getGamificationState(uid: string): Promise<GamificationState | null> {
  const snap = await getDoc(gamificationRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as GamificationState;
}

export async function initGamificationState(uid: string): Promise<GamificationState> {
  const initial: GamificationState = {
    uid,
    xp: 0,
    level: 1,
    levelName: 'Rookie',
    streakDays: 0,
    longestStreak: 0,
    lastActivityDate: new Date().toISOString().split('T')[0],
    badgesEarned: [],
    weeklyMissions: [
      {
        id: 'weekly_prs',
        titleKey: 'gamification.weeklyMission',
        target: 3,
        current: 0,
        xpReward: 150,
        expiresAt: getNextSunday(),
      },
    ],
    totalWorkouts: 0,
    totalPRs: 0,
  };
  await setDoc(gamificationRef(uid), initial);
  return initial;
}

export async function awardXP(uid: string, amount: number, reason: string): Promise<GamificationState> {
  const state = await getOrInitState(uid);
  const newXP = state.xp + amount;
  const newLevel = getLevelForXP(newXP);

  const today = new Date().toISOString().split('T')[0];
  let newStreak = state.streakDays;
  if (isStreakAlive(state.lastActivityDate) && state.lastActivityDate !== today) {
    newStreak += 1;
  } else if (!isStreakAlive(state.lastActivityDate)) {
    newStreak = 1;
  }

  const updatedState: GamificationState = {
    ...state,
    xp: newXP,
    level: newLevel.level,
    levelName: newLevel.name,
    streakDays: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastActivityDate: today,
  };

  const newBadges = checkNewBadges(updatedState);
  if (newBadges.length > 0) {
    updatedState.badgesEarned = [...state.badgesEarned, ...newBadges.map(b => b.id)];
    const badgeXP = newBadges.reduce((sum, b) => sum + b.xpReward, 0);
    updatedState.xp += badgeXP;
  }

  await updateDoc(gamificationRef(uid), {
    ...updatedState,
    updatedAt: serverTimestamp(),
  });

  return updatedState;
}

export async function processWorkoutComplete(uid: string, session: WorkoutSession): Promise<GamificationState> {
  const xp = calculateWorkoutXP(session);
  const state = await awardXP(uid, xp, 'workout_complete');
  await updateDoc(gamificationRef(uid), {
    totalWorkouts: state.totalWorkouts + 1,
  });
  return state;
}

export async function processMealLogged(uid: string): Promise<void> {
  await awardXP(uid, XP_REWARDS.mealLogged, 'meal_logged');
}

export async function processPRSet(uid: string): Promise<GamificationState> {
  const state = await awardXP(uid, XP_REWARDS.prSet, 'pr_set');
  await updateDoc(gamificationRef(uid), {
    totalPRs: state.totalPRs + 1,
  });
  return state;
}

async function getOrInitState(uid: string): Promise<GamificationState> {
  const state = await getGamificationState(uid);
  if (state) return state;
  return initGamificationState(uid);
}

function getNextSunday(): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (7 - day));
  d.setHours(23, 59, 59, 999);
  return d;
}
