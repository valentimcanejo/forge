import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FG } from '@/constants/theme';
import { FCard, FBadge, FProgress, FRing, FButton } from '@/components/ui';
import { useStore } from '@/store/useStore';
import { BADGES, getLevelForXP, getXPProgress, logout } from '@forge/common';

export default function ProfileScreen() {
  const { profile, gamification, user, reset } = useStore();

  const name = profile?.displayName ?? user?.displayName ?? 'Athlete';
  const handle = profile?.email?.split('@')[0] ?? '';
  const xp = gamification?.xp ?? 0;
  const level = getLevelForXP(xp);
  const xpProgress = getXPProgress(xp);
  const streak = gamification?.streakDays ?? 0;
  const earnedIds = gamification?.badgesEarned ?? [];
  const totalWorkouts = gamification?.totalWorkouts ?? 0;
  const totalPRs = gamification?.totalPRs ?? 0;

  const joinedStr = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })
    : '';

  async function handleLogout() {
    Alert.alert('Log out?', 'Tens a certeza?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive',
        onPress: async () => {
          await logout();
          reset();
          router.replace('/(auth)/onboarding');
        },
      },
    ]);
  }

  const SETTINGS = [
    { l: 'Personal info', sub: `${profile?.weightKg ? profile.weightKg + ' kg · ' : ''}${profile?.heightCm ? profile.heightCm + ' cm' : 'Not set'}` },
    { l: 'Goals', sub: profile?.goal ? `Currently: ${profile.goal}` : 'Not set' },
    { l: 'Units & language', sub: `${profile?.weightUnit ?? 'kg'} · ${profile?.heightUnit ?? 'cm'} · ${profile?.language?.toUpperCase() ?? 'EN'}` },
    { l: 'Notifications', sub: profile?.notifications?.workoutReminder ? 'Reminders active' : 'Off' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, marginBottom: 16 }}>
          <View style={{ borderRadius: 22, padding: 20, borderWidth: 1, borderColor: FG.line, backgroundColor: FG.bg1, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 74, height: 74, borderRadius: 22, backgroundColor: '#2a1a14', borderWidth: 2, borderColor: 'rgba(249,115,22,0.5)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: FG.accent }}>{name[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '700', color: FG.text }}>{name}</Text>
              <Text style={{ fontSize: 12, color: FG.mid, marginTop: 2 }}>
                {handle ? `@${handle}` : ''}{joinedStr ? ` · joined ${joinedStr}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <FBadge tone="accent">⚒ LVL {level.level}</FBadge>
                {streak > 0 && <FBadge tone="ok">{streak} day streak 🔥</FBadge>}
              </View>
            </View>
          </View>
        </View>

        {/* Quick stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16, flexDirection: 'row', gap: 8 }}>
          {[
            { l: 'WORKOUTS', v: totalWorkouts.toString() },
            { l: 'PR LIFTS',  v: totalPRs.toString() },
            { l: 'BADGES',   v: earnedIds.length.toString() },
          ].map(s => (
            <View key={s.l} style={{ flex: 1, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, borderRadius: 12, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '700', color: FG.text }}>{s.v}</Text>
              <Text style={{ fontSize: 9, color: FG.dim, letterSpacing: 0.8, marginTop: 2 }}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Level XP */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <FCard elevated padding={18} style={{ overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(249,115,22,0.15)' }}/>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 11, color: FG.accent, letterSpacing: 1 }}>LEVEL {level.level}</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: FG.text, marginTop: 2 }}>{level.name}</Text>
              </View>
              <FRing value={xpProgress} size={64} stroke={5} label={`${Math.round(xpProgress * 100)}%`}/>
            </View>
            <FProgress value={xpProgress}/>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 11, color: FG.mid }}>{xp} XP</Text>
              <Text style={{ fontSize: 11, color: FG.mid }}>· {level.maxXP - xp} to LVL {level.level + 1}</Text>
            </View>
          </FCard>
        </View>

        {/* Badges preview */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: FG.text }}>Badges</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/badges')}>
              <Text style={{ fontSize: 13, color: FG.accent, fontWeight: '600' }}>View all →</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {BADGES.slice(0, 6).map(b => {
              const isEarned = earnedIds.includes(b.id);
              return (
                <View key={b.id} style={{ width: '30%', aspectRatio: 1, borderRadius: 14, backgroundColor: isEarned ? FG.bg1 : 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: isEarned ? FG.line : FG.line, alignItems: 'center', justifyContent: 'center', gap: 4, opacity: isEarned ? 1 : 0.4 }}>
                  <Text style={{ fontSize: 26 }}>{b.icon}</Text>
                  <Text style={{ fontSize: 9, fontWeight: '600', color: isEarned ? FG.text : FG.dim, textAlign: 'center', paddingHorizontal: 4 }}>{b.id.replace(/_/g, ' ')}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Lumen banner */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ borderRadius: 18, padding: 16, backgroundColor: FG.bg1, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', overflow: 'hidden' }}>
            <FBadge tone="accent" style={{ marginBottom: 8, alignSelf: 'flex-start' }}>COMING SOON</FBadge>
            <Text style={{ fontWeight: '700', fontSize: 16, color: FG.text, marginBottom: 4 }}>Connect Lumen</Text>
            <Text style={{ fontSize: 12, color: FG.mid, marginBottom: 12, lineHeight: 18 }}>
              Auto-detect metabolic state and tune macros to your daily fuel.
            </Text>
            <FButton variant="soft" size="sm">Notify me</FButton>
          </View>
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>ACCOUNT</Text>
          <View style={{ backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, overflow: 'hidden' }}>
            {SETTINGS.map((row, i) => (
              <TouchableOpacity key={row.l} style={{ padding: 14, paddingHorizontal: 16, borderBottomWidth: i < SETTINGS.length - 1 ? 1 : 0, borderBottomColor: FG.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 14, color: FG.text }}>{row.l}</Text>
                  <Text style={{ fontSize: 12, color: FG.dim, marginTop: 2 }}>{row.sub}</Text>
                </View>
                <Text style={{ fontSize: 16, color: FG.dim }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(226,109,109,0.3)', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: FG.err }}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
