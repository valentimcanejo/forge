import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { FG } from '@/constants/theme';
import { FCard, FBadge, FSparkline } from '@/components/ui';
import { useStore } from '@/store/useStore';
import { getProgressHistory, getAllPRs } from '@forge/common';
import type { ProgressEntry, PRRecord } from '@forge/common';

const TABS = ['Body', 'Lifts', 'Photos'];

const MEASURE_KEYS: Array<{ label: string; key: keyof ProgressEntry; unit: string }> = [
  { label: 'Chest',     key: 'chestCm',    unit: 'cm' },
  { label: 'Arms',      key: 'armsCm',     unit: 'cm' },
  { label: 'Waist',     key: 'waistCm',    unit: 'cm' },
  { label: 'Body fat',  key: 'bodyFatPct', unit: '%'  },
];

function fmt(n: number | undefined) {
  if (n == null) return '—';
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}

function dateDiff(entries: ProgressEntry[], key: keyof ProgressEntry): string {
  const vals = entries.map(e => e[key] as number | undefined).filter((v): v is number => v != null);
  if (vals.length < 2) return '';
  const diff = vals[vals.length - 1] - vals[0];
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}`;
}

export default function ProgressScreen() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('Body');
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [prs, setPRs] = useState<PRRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      Promise.all([
        getProgressHistory(user.uid, 12),
        getAllPRs(user.uid),
      ]).then(([hist, allPRs]) => {
        setEntries(hist);
        setPRs(allPRs);
      }).catch(() => {}).finally(() => setLoading(false));
    }, [user])
  );

  const weightTrend = entries
    .filter(e => e.weightKg != null)
    .map(e => e.weightKg as number);

  const latestEntry = entries[entries.length - 1];
  const firstEntry = entries[0];
  const latestWeight = latestEntry?.weightKg;
  const firstWeight = firstEntry?.weightKg;
  const weightDiff = latestWeight != null && firstWeight != null
    ? latestWeight - firstWeight
    : null;

  const photos = entries.filter(e => e.photoUrl);
  const weeksIn = entries.length > 0
    ? Math.round((new Date().getTime() - new Date(entries[0].date).getTime()) / (7 * 86400000))
    : 0;

  const firstDateLabel = firstEntry
    ? new Date(firstEntry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()
    : '';
  const lastDateLabel = latestEntry
    ? new Date(latestEntry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()
    : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, marginBottom: 14 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: FG.text, letterSpacing: -1 }}>Progress</Text>
        <Text style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>
          {weeksIn > 0 ? `${weeksIn} weeks tracked` : 'Start logging to see trends'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 14 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10,
              backgroundColor: activeTab === tab ? FG.bg2 : 'transparent',
              borderWidth: 1, borderColor: activeTab === tab ? FG.lineStrong : FG.line,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: activeTab === tab ? FG.text : FG.mid }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'Body' && (
          <>
            {/* Weight card */}
            <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
              <FCard padding={18}>
                <Text style={{ fontSize: 11, color: FG.dim, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                  Body weight · {weeksIn > 0 ? `${weeksIn}W` : 'All time'}
                </Text>
                {latestWeight != null ? (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                      <Text style={{ fontSize: 40, fontWeight: '700', color: FG.text, letterSpacing: -1 }}>{fmt(latestWeight)}</Text>
                      <Text style={{ color: FG.mid }}>kg</Text>
                      {weightDiff != null && (
                        <FBadge tone={weightDiff <= 0 ? 'ok' : 'warn'} style={{ marginLeft: 6 }}>
                          {weightDiff >= 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                        </FBadge>
                      )}
                    </View>
                    {weightTrend.length >= 2 && (
                      <>
                        <FSparkline data={weightTrend} w={324} h={70}/>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                          <Text style={{ fontSize: 10, color: FG.dim }}>{firstDateLabel}</Text>
                          <Text style={{ fontSize: 10, color: FG.dim }}>{lastDateLabel}</Text>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <Text style={{ fontSize: 14, color: FG.dim, marginTop: 8 }}>No weight entries yet</Text>
                )}
              </FCard>
            </View>

            {/* Measurements */}
            <View style={{ paddingHorizontal: 20, marginBottom: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {MEASURE_KEYS.map(m => {
                const latest = latestEntry?.[m.key] as number | undefined;
                const diff = dateDiff(entries, m.key);
                const isPositive = diff.startsWith('+');
                return (
                  <FCard key={m.label} padding={14} style={{ width: '47%' }}>
                    <Text style={{ fontSize: 11, color: FG.dim, letterSpacing: 0.8, textTransform: 'uppercase' }}>{m.label}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                      <Text style={{ fontSize: 22, fontWeight: '700', color: FG.text }}>{fmt(latest)}</Text>
                      <Text style={{ fontSize: 11, color: FG.mid }}>{m.unit}</Text>
                    </View>
                    {diff ? (
                      <Text style={{ fontSize: 11, color: isPositive ? FG.accent : FG.ok, marginTop: 2 }}>{diff}</Text>
                    ) : (
                      <Text style={{ fontSize: 11, color: FG.dim, marginTop: 2 }}>no data</Text>
                    )}
                  </FCard>
                );
              })}
            </View>

            {entries.length === 0 && !loading && (
              <View style={{ paddingHorizontal: 20, alignItems: 'center', paddingTop: 20 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📊</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: FG.text, marginBottom: 6 }}>No data yet</Text>
                <Text style={{ fontSize: 13, color: FG.dim, textAlign: 'center' }}>
                  Log your weight and measurements to track your progress over time.
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'Lifts' && (
          <View style={{ paddingHorizontal: 20 }}>
            {prs.length === 0 && !loading ? (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🏋️</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: FG.text, marginBottom: 6 }}>No PRs yet</Text>
                <Text style={{ fontSize: 13, color: FG.dim, textAlign: 'center' }}>
                  Complete workouts to automatically track your personal records.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {prs
                  .slice()
                  .sort((a, b) => b.estimatedOneRMKg - a.estimatedOneRMKg)
                  .map((pr, i) => {
                    const dateStr = pr.achievedAt
                      ? new Date(pr.achievedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '';
                    return (
                      <View
                        key={`${pr.exerciseId}-${i}`}
                        style={{ backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                      >
                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#2a1a14', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 20 }}>🏆</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: FG.text }}>{pr.exerciseName}</Text>
                          <Text style={{ fontSize: 12, color: FG.dim, marginTop: 2 }}>{dateStr}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 18, fontWeight: '700', color: FG.accent }}>{pr.maxWeightKg}<Text style={{ fontSize: 12, color: FG.mid }}> kg</Text></Text>
                          <Text style={{ fontSize: 11, color: FG.dim }}>×{pr.reps} · 1RM ~{Math.round(pr.estimatedOneRMKg)}kg</Text>
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}
          </View>
        )}

        {activeTab === 'Photos' && (
          <View style={{ paddingHorizontal: 20 }}>
            {photos.length === 0 && !loading ? (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📸</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: FG.text, marginBottom: 6 }}>No photos yet</Text>
                <Text style={{ fontSize: 13, color: FG.dim, textAlign: 'center' }}>
                  Log a progress entry with a photo to start your visual timeline.
                </Text>
              </View>
            ) : (
              <>
                {photos.length >= 2 && (
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <View>
                        <Text style={{ fontSize: 10, color: FG.accent, letterSpacing: 1.5 }}>PHOTO COMPARE</Text>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: FG.text }}>First vs Latest</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[photos[0], photos[photos.length - 1]].map((p, i) => (
                        <View key={i} style={{ flex: 1 }}>
                          <View style={{ aspectRatio: 3/4, borderRadius: 14, overflow: 'hidden', backgroundColor: FG.bg2 }}>
                            <Image source={{ uri: p.photoUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover"/>
                            <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 }}>
                              <Text style={{ fontSize: 9, color: FG.text, letterSpacing: 0.8 }}>{i === 0 ? 'FIRST' : 'LATEST'}</Text>
                            </View>
                            <View style={{ position: 'absolute', bottom: 8, right: 8 }}>
                              <Text style={{ fontSize: 9, color: FG.dim }}>
                                {new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {photos.map((p, i) => (
                    <View key={i} style={{ width: '31%', aspectRatio: 3/4, borderRadius: 10, overflow: 'hidden', backgroundColor: FG.bg2 }}>
                      <Image source={{ uri: p.photoUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover"/>
                      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 4, paddingHorizontal: 6 }}>
                        <Text style={{ fontSize: 8, color: FG.text }}>
                          {new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </Text>
                        {p.photoAngle && (
                          <Text style={{ fontSize: 7, color: FG.dim, textTransform: 'capitalize' }}>{p.photoAngle}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
