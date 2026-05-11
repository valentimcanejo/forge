import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import '../src/lib/i18n';
import { subscribeToAuthState, getUserProfile, getGamificationState, getDailyLog, initGamificationState } from '@forge/common';
import { useStore } from '@/store/useStore';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function AuthGate() {
  const { user, authLoading, setUser, setAuthLoading, setProfile, setGamification, setTodayLog, reset } = useStore();
  const segments = useSegments();

  useEffect(() => {
    const unsub = subscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser) {
        try {
          const [profile, gamification, todayLog] = await Promise.all([
            getUserProfile(firebaseUser.uid),
            getGamificationState(firebaseUser.uid),
            getDailyLog(firebaseUser.uid, today()),
          ]);
          setProfile(profile);

          // Init gamification if first time
          if (!gamification) {
            const fresh = await initGamificationState(firebaseUser.uid);
            setGamification(fresh);
          } else {
            setGamification(gamification);
          }

          setTodayLog(todayLog);
        } catch (e) {
          console.warn('Failed to load user data:', e);
        }
      } else {
        reset();
      }
    });
    return unsub;
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (authLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/onboarding');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, authLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <StatusBar style="light"/>
      <AuthGate/>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }}/>
        <Stack.Screen name="(modals)/add-exercise" options={{ presentation: 'modal', animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="(modals)/add-food" options={{ presentation: 'modal', animation: 'slide_from_bottom' }}/>
      </Stack>
    </I18nextProvider>
  );
}
