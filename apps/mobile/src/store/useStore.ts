import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserProfile, GamificationState, DailyLog, WorkoutSession } from '@forge/common';

interface AppState {
  // Auth
  user: User | null;
  authLoading: boolean;
  // Data
  profile: UserProfile | null;
  gamification: GamificationState | null;
  todayLog: DailyLog | null;
  activeSession: WorkoutSession | null;
  // Actions
  setUser: (user: User | null) => void;
  setAuthLoading: (v: boolean) => void;
  setProfile: (p: UserProfile | null) => void;
  setGamification: (g: GamificationState | null) => void;
  setTodayLog: (l: DailyLog | null) => void;
  setActiveSession: (s: WorkoutSession | null) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  authLoading: true,
  profile: null,
  gamification: null,
  todayLog: null,
  activeSession: null,
  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setProfile: (profile) => set({ profile }),
  setGamification: (gamification) => set({ gamification }),
  setTodayLog: (todayLog) => set({ todayLog }),
  setActiveSession: (activeSession) => set({ activeSession }),
  reset: () => set({ profile: null, gamification: null, todayLog: null, activeSession: null }),
}));
