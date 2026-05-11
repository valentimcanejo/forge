'use client';
import { useEffect } from 'react';
import { subscribeToAuthState, getUserProfile, getGamificationState, getDailyLog, initGamificationState } from '@forge/common';
import { useAuthStore } from '@/store/authStore';

function today() { return new Date().toISOString().slice(0, 10); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setGamification, setTodayLog, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = subscribeToAuthState(async (user) => {
      setUser(user);
      if (user) {
        const [profile, gamification, todayLog] = await Promise.all([
          getUserProfile(user.uid),
          getGamificationState(user.uid),
          getDailyLog(user.uid, today()),
        ]);
        setProfile(profile);
        if (!gamification) {
          const fresh = await initGamificationState(user.uid);
          setGamification(fresh);
        } else {
          setGamification(gamification);
        }
        setTodayLog(todayLog);
      } else {
        setProfile(null);
        setGamification(null);
        setTodayLog(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [setUser, setProfile, setGamification, setTodayLog, setLoading]);

  return <>{children}</>;
}
