import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { FG } from '@/constants/theme';

type NotifKind = 'badge' | 'workout' | 'meal' | 'pr' | 'rest';
type NotifTone = 'accent' | 'warn' | 'ok' | 'neutral';

const TONE_COLORS: Record<NotifTone, string> = {
  accent: FG.accent,
  warn: FG.warn,
  ok: FG.ok,
  neutral: FG.mid,
};

interface Notif {
  kind: NotifKind;
  title: string;
  sub: string;
  time: string;
  icon: string;
  tone: NotifTone;
  hero?: boolean;
}

const ALL_NOTIFS: Notif[] = [
  { kind: 'badge',   title: 'Badge unlocked',      sub: 'Iron Forger — LVL 7 reached',        time: '2m',        icon: '⚒', tone: 'accent',  hero: true },
  { kind: 'workout', title: 'Workout streak +1',   sub: 'Day 14 — keep the fire alive',        time: '1h',        icon: '🔥', tone: 'warn' },
  { kind: 'meal',    title: 'Snack logged',         sub: 'Greek yogurt + nuts · 320 kcal',       time: '3h',        icon: '🥗', tone: 'ok' },
  { kind: 'meal',    title: 'Dinner reminder',      sub: "You're 830 kcal short — plan meal",   time: '5h',        icon: '◷', tone: 'warn' },
  { kind: 'pr',      title: 'New PR detected',      sub: 'Bench: 185 lb × 8 (+5 lb)',           time: 'yesterday', icon: '↗', tone: 'accent' },
  { kind: 'rest',    title: 'Rest day reminder',    sub: 'Tomorrow is a planned rest',           time: 'yesterday', icon: '◐', tone: 'neutral' },
];

const FILTERS = ['All', 'Workouts', 'Meals', 'Badges'] as const;
type Filter = typeof FILTERS[number];

const KIND_TO_FILTER: Record<NotifKind, Filter> = {
  badge: 'Badges',
  workout: 'Workouts',
  meal: 'Meals',
  pr: 'Workouts',
  rest: 'Workouts',
};

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<Filter>('All');

  const visible = ALL_NOTIFS.filter(n =>
    filter === 'All' || KIND_TO_FILTER[n.kind] === filter
  );
  const hero = visible[0];
  const rest = visible.slice(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{
          width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1,
          borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center',
        }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round">
            <Path d="M15 18l-6-6 6-6"/>
          </Svg>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>Activity</Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 12, color: FG.accent, fontWeight: '600' }}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 14 }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999,
                backgroundColor: filter === f ? FG.bg2 : 'transparent',
                borderWidth: 1, borderColor: filter === f ? FG.lineStrong : FG.line,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: filter === f ? FG.text : FG.mid }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hero notification */}
        {hero && (
          <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
            <View style={{
              backgroundColor: 'rgba(249,115,22,0.12)',
              borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)',
              borderRadius: 18, padding: 16,
              flexDirection: 'row', alignItems: 'center', gap: 14,
              overflow: 'hidden',
            }}>
              <View style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: TONE_COLORS[hero.tone],
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 22, color: '#1a0a00' }}>{hero.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: FG.text }}>{hero.title}</Text>
                <Text style={{ fontSize: 12, color: FG.mid, marginTop: 2 }}>{hero.sub}</Text>
              </View>
              <Text style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono' }}>{hero.time}</Text>
            </View>
          </View>
        )}

        {/* Notification list */}
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
          {rest.map((n, i) => {
            const c = TONE_COLORS[n.tone];
            return (
              <TouchableOpacity
                key={i}
                style={{
                  backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line,
                  padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
              >
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: `${c}1A`, borderWidth: 1, borderColor: `${c}33`,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 16 }}>{n.icon}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: FG.text }}>{n.title}</Text>
                  <Text style={{ fontSize: 12, color: FG.mid, marginTop: 1 }} numberOfLines={1}>{n.sub}</Text>
                </View>
                <Text style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono' }}>{n.time}</Text>
              </TouchableOpacity>
            );
          })}

          {visible.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>◐</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: FG.text }}>All quiet</Text>
              <Text style={{ fontSize: 13, color: FG.mid, marginTop: 6 }}>No {filter.toLowerCase()} notifications yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
