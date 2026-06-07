import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FG } from '@/constants/theme';
import { FButton } from '@/components/ui';
import { signInAnonymousUser } from '@forge/common';

const FEATURES = [
  { icon: '⚒', key: 'auth.feature1' },
  { icon: '◷', key: 'auth.feature2' },
  { icon: '↗', key: 'auth.feature3' },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      await signInAnonymousUser();
      // AuthGate detects user && inAuth → redirects to /(tabs) automatically
    } catch {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: FG.bg0 }}>
      {/* Ambient glow */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', backgroundColor: 'rgba(249,115,22,0.12)', borderRadius: 999, transform: [{ scaleX: 2 }] }}/>
      </View>

      {/* Progress bar */}
      <SafeAreaView>
        <View style={{ flexDirection: 'row', gap: 4, paddingHorizontal: 24, paddingTop: 8 }}>
          {[0,1,2,3,4].map(i => (
            <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i === 0 ? FG.accent : 'rgba(255,255,255,0.08)' }}/>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 12 }}>
          <Text style={{ fontSize: 11, color: FG.dim, letterSpacing: 1.5 }}>STEP 1 / 5</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}><Text style={{ fontSize: 11, color: FG.accent, letterSpacing: 1.2 }}>SKIP</Text></TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Center content */}
      <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center' }}>
        {/* Logo + heading */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 44, fontWeight: '700', color: FG.text, letterSpacing: -2 }}>FORGE</Text>
          </View>
          <Text style={{ fontSize: 32, fontWeight: '700', color: FG.text, textAlign: 'center', letterSpacing: -1, lineHeight: 38, marginTop: 24 }}>
            {t('auth.tagline')}
          </Text>
          <Text style={{ fontSize: 15, color: FG.mid, textAlign: 'center', lineHeight: 22, marginTop: 12 }}>
            {t('auth.subtitle')}
          </Text>
        </View>

        {/* Feature cards */}
        <View style={{ gap: 10 }}>
          {FEATURES.map((f, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: FG.line }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(249,115,22,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: FG.accent }}>{f.icon}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: FG.text }}>{t(f.key)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 48, gap: 10 }}>
        <FButton size="lg" fullWidth onPress={handleStart} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : t('auth.startTraining')}
        </FButton>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <FButton variant="ghost" style={{ flex: 1 }} onPress={() => router.push('/(auth)/login')}>
            {t('auth.continueWithGoogle')}
          </FButton>
          <FButton variant="ghost" style={{ flex: 1 }} onPress={() => router.push('/(auth)/login')}>
            {t('auth.continueWithApple')}
          </FButton>
        </View>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ marginTop: 4 }}>
          <Text style={{ textAlign: 'center', color: FG.dim, fontSize: 13 }}>
            {t('auth.haveAccount')}{' '}
            <Text style={{ color: FG.accent, fontWeight: '600' }}>{t('auth.login')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
