'use client';
import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserProfile, GamificationState, DailyLog } from '@forge/common';

interface AuthStore {
  user: User | null;
  profile: UserProfile | null;
  gamification: GamificationState | null;
  todayLog: DailyLog | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setGamification: (g: GamificationState | null) => void;
  setTodayLog: (l: DailyLog | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  gamification: null,
  todayLog: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setGamification: (gamification) => set({ gamification }),
  setTodayLog: (todayLog) => set({ todayLog }),
  setLoading: (loading) => set({ loading }),
}));
