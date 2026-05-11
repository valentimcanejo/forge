import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { FG } from '@/constants/theme';
import { FCard, FBadge, FProgress, FRing, FButton } from '@/components/ui';
import { useStore } from '@/store/useStore';
import { getLevelForXP, getXPProgress } from '@forge/common';

function todayLabel() {
  return new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function DashboardScreen() {
  const { profile, gamification, todayLog } = useStore();

  const name = profile?.displayName?.split(' ')[0] ?? 'Athlete';
  const xp = gamification?.xp ?? 0;
  const level = getLevelForXP(xp);
  const xpProgress = getXPProgress(xp);
  const streak = gamification?.streakDays ?? 0;

  const kcalConsumed = todayLog?.totalKcal ?? 0;
  const kcalTarget = 2650; // TODO: from profile TDEE
  const protein = { v: Math.round(todayLog?.totalProteinG ?? 0), t: 180 };
  const carbs   = { v: Math.round(todayLog?.totalCarbsG ?? 0),   t: 320 };
  const fat     = { v: Math.round(todayLog?.totalFatG ?? 0),     t: 80  };
  const waterMl = todayLog?.waterMl ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <View>
            <Text style={{ fontSize: 13, color: FG.dim }}>{todayLabel()}</Text>
            <Text style={{ fontSize: 26, fontWeight: '700', color: FG.text, letterSpacing: -1, marginTop: 2 }}>
              Hey, {name}.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/>
              </Svg>
            </TouchableOpacity>
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: FG.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontWeight: '800', color: '#1a0a00', fontSize: 16 }}>{name[0]}</Text>
            </View>
          </View>
        </View>

        {/* Streak + XP card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <FCard elevated padding={16} style={{ overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(249,115,22,0.2)' }}/>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={{ fontSize: 18 }}>🔥</Text>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: FG.text, letterSpacing: -0.5 }}>{streak}</Text>
                  <Text style={{ fontSize: 12, color: FG.mid }}>day streak</Text>
                </View>
                <Text style={{ fontSize: 12, color: FG.dim, letterSpacing: 0.5 }}>
                  LVL {level.level} · {level.name.toUpperCase()}
                </Text>
              </View>
              <FRing value={xpProgress} size={64} stroke={5} label={`${Math.round(xpProgress * 100)}%`} sub="XP"/>
            </View>
            <View style={{ marginTop: 12 }}>
              <FProgress value={xpProgress}/>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 10, color: FG.dim }}>{xp} XP</Text>
              <Text style={{ fontSize: 10, color: FG.dim }}>{level.maxXP - xp} to LVL {level.level + 1}</Text>
            </View>
          </FCard>
        </View>

        {/* Today's workout CTA */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <View>
              <Text style={{ fontSize: 10, color: FG.accent, letterSpacing: 1.5 }}>TODAY</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: FG.text, letterSpacing: -0.5 }}>Log a workout</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/workout')}>
              <Text style={{ fontSize: 13, color: FG.mid }}>View →</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/workout')}
            style={{ backgroundColor: FG.bg1, borderRadius: 18, borderWidth: 1, borderColor: FG.line, overflow: 'hidden' }}
          >
            <View style={{ height: 80, backgroundColor: '#1a1008', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 12, flexDirection: 'row', gap: 6 }}>
              <FBadge tone="accent">+30 XP</FBadge>
              <FBadge tone="neutral">+50 XP on PR</FBadge>
            </View>
            <View style={{ padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontWeight: '700', fontSize: 15, color: FG.text }}>Start a session</Text>
                <Text style={{ fontSize: 12, color: FG.dim, marginTop: 2 }}>Track sets, weight & PRs</Text>
              </View>
              <FButton size="sm" onPress={() => router.push('/(tabs)/workout')}>Start</FButton>
            </View>
          </TouchableOpacity>
        </View>

        {/* Macros card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <FCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 11, color: FG.dim, letterSpacing: 0.8, textTransform: 'uppercase' }}>Today's Fuel</Text>
                <Text style={{ fontSize: 32, fontWeight: '700', color: FG.text, letterSpacing: -1 }}>
                  {kcalConsumed.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 12, color: FG.mid }}>/ {kcalTarget.toLocaleString()} kcal</Text>
              </View>
              <FRing value={Math.min(kcalConsumed / kcalTarget, 1)} size={54} stroke={5} label={`${Math.round(kcalConsumed / kcalTarget * 100)}%`}/>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { l: 'Protein', ...protein, c: FG.accent },
                { l: 'Carbs',   ...carbs,   c: FG.warn },
                { l: 'Fat',     ...fat,     c: FG.ok },
              ].map(m => (
                <View key={m.l} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: FG.dim, marginBottom: 4 }}>{m.l}</Text>
                  <FProgress value={m.t > 0 ? Math.min(m.v / m.t, 1) : 0} color={m.c} height={4}/>
                  <Text style={{ fontSize: 12, marginTop: 4, color: FG.text }}>
                    {m.v}<Text style={{ color: FG.dim }}>/{m.t}g</Text>
                  </Text>
                </View>
              ))}
            </View>
            {/* Water */}
            {waterMl < 2000 && (
              <View style={{ marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: 'rgba(240,184,110,0.08)', borderWidth: 1, borderColor: 'rgba(240,184,110,0.18)', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>💧</Text>
                <Text style={{ fontSize: 12, color: FG.warn, flex: 1 }}>
                  {(waterMl / 1000).toFixed(1)} / 3.0 L — drink more water
                </Text>
              </View>
            )}
          </FCard>
        </View>

        {/* Quick actions */}
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => router.push('/(modals)/add-food')} style={{ flex: 1, backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, padding: 14, alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 22 }}>🍽</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: FG.text }}>Log meal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/progress')} style={{ flex: 1, backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, padding: 14, alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 22 }}>📊</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: FG.text }}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/badges')} style={{ flex: 1, backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, padding: 14, alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 22 }}>⚒</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: FG.text }}>Badges</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
