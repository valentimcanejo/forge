import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { FG } from '@/constants/theme';
import { FCard, FBadge, FProgress, FButton } from '@/components/ui';
import { useStore } from '@/store/useStore';
import {
  createWorkoutSession, updateWorkoutSession, processWorkoutComplete,
  getRecentWorkouts,
} from '@forge/common';
import type { WorkoutSession, WorkoutExercise, SetLog } from '@forge/common';

function fmt(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function today() { return new Date().toISOString().slice(0, 10); }

const DAYS_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function WorkoutScreen() {
  const { user, activeSession, setActiveSession, setGamification } = useStore();
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(activeSession?.exercises ?? []);
  const [expandedEx, setExpandedEx] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load recent sessions if no active session
  useEffect(() => {
    if (!user || activeSession) return;
    getRecentWorkouts(user.uid, 5).then(setRecentSessions).catch(() => {});
  }, [user, activeSession]);

  // Timer
  useEffect(() => {
    if (!activeSession) return;
    if (paused) { clearInterval(timerRef.current!); return; }
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current!);
  }, [activeSession, paused]);

  // Sync exercises into store when they change
  useEffect(() => {
    if (activeSession) setActiveSession({ ...activeSession, exercises });
  }, [exercises]);

  // Pick up exercises added from the add-exercise modal
  useFocusEffect(
    useCallback(() => {
      if (!activeSession) return;
      const storeExs = activeSession.exercises ?? [];
      setExercises(prev => {
        const prevIds = new Set(prev.map(e => e.exerciseId));
        const added = storeExs.filter(e => !prevIds.has(e.exerciseId));
        return added.length > 0 ? [...prev, ...added] : prev;
      });
    }, [activeSession?.exercises?.length])
  );

  async function startSession() {
    if (!user) return;
    const session: Omit<WorkoutSession, 'id' | 'uid'> = {
      name: 'Workout',
      startedAt: new Date(),
      exercises: [],
      totalVolumeKg: 0,
    } as any;
    const id = await createWorkoutSession(user.uid, session);
    setActiveSession({ ...session, id, uid: user.uid } as WorkoutSession);
    setElapsed(0);
    setPaused(false);
    setExercises([]);
  }

  async function finishSession() {
    if (!user || !activeSession) return;
    setFinishing(true);
    try {
      const totalVolume = exercises.reduce((acc, ex) =>
        acc + ex.sets.reduce((s, set) => s + (set.weightKg ?? 0) * (set.reps ?? 0), 0), 0);

      const completed: WorkoutSession = {
        ...activeSession,
        exercises,
        completedAt: new Date(),
        durationSeconds: elapsed,
        totalVolumeKg: totalVolume,
      };
      await updateWorkoutSession(user.uid, activeSession.id, completed);
      const newGamification = await processWorkoutComplete(user.uid, completed);
      setGamification(newGamification);
      setActiveSession(null);
      setElapsed(0);
      setExercises([]);
      Alert.alert('Sessão concluída! 💪', `+30 XP ganho${totalVolume > 0 ? `\nVolume: ${Math.round(totalVolume)} kg` : ''}`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível guardar o treino.');
    } finally {
      setFinishing(false);
    }
  }

  function toggleSet(exIdx: number, setIdx: number) {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, j) => j === setIdx ? { ...s, completed: !s.completed } : s);
      return { ...ex, sets };
    }));
  }

  function updateSetValue(exIdx: number, setIdx: number, field: 'weightKg' | 'reps', raw: string) {
    const val = parseFloat(raw) || 0;
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const sets = ex.sets.map((s, j) => j === setIdx ? { ...s, [field]: val } : s);
      return { ...ex, sets };
    }));
  }

  // Week day strip
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - dayOfWeek + i);
    return { label: DAYS_ABBR[i], num: d.getDate(), isToday: i === dayOfWeek };
  });

  // ── NO ACTIVE SESSION ──────────────────────────────────────────
  if (!activeSession) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, marginBottom: 14 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>Lift</Text>
          <Text style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>Track your session</Text>
        </View>

        {/* Week strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 20, marginBottom: 20 }}>
          {weekDays.map((d, i) => (
            <View key={i} style={{
              width: 44, paddingVertical: 10, borderRadius: 12,
              backgroundColor: d.isToday ? FG.accent : FG.bg1,
              borderWidth: d.isToday ? 0 : 1, borderColor: FG.line, alignItems: 'center',
            }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: d.isToday ? '#1a0a00' : FG.mid }}>{d.label}</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: d.isToday ? '#1a0a00' : FG.text, marginTop: 2 }}>{d.num}</Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {/* Start button */}
          <TouchableOpacity
            onPress={startSession}
            style={{
              backgroundColor: FG.accent, borderRadius: 18, padding: 24,
              alignItems: 'center', marginBottom: 20,
              shadowColor: FG.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16,
            }}
          >
            <Text style={{ fontSize: 13, color: '#1a0a00', letterSpacing: 1.2, fontWeight: '700', opacity: 0.7 }}>TAP TO BEGIN</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#1a0a00', letterSpacing: -0.5, marginTop: 4 }}>Start Session</Text>
            <Text style={{ fontSize: 12, color: '#1a0a00', opacity: 0.6, marginTop: 4 }}>+30 XP on complete · +50 XP per PR</Text>
          </TouchableOpacity>

          {/* Recent sessions */}
          {recentSessions.length > 0 && (
            <View>
              <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>Recent Sessions</Text>
              <View style={{ gap: 8 }}>
                {recentSessions.map(s => (
                  <View key={s.id} style={{ backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, padding: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: FG.text }}>{s.name || 'Workout'}</Text>
                        <Text style={{ fontSize: 12, color: FG.dim, marginTop: 2 }}>
                          {new Date(s.startedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                          {s.durationSeconds ? ` · ${fmt(s.durationSeconds)}` : ''}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: FG.accent }}>{s.exercises?.length ?? 0} lifts</Text>
                        {s.totalVolumeKg > 0 && (
                          <Text style={{ fontSize: 11, color: FG.dim }}>{Math.round(s.totalVolumeKg)} kg vol</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {recentSessions.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>⚒</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: FG.text }}>No sessions yet</Text>
              <Text style={{ fontSize: 13, color: FG.mid, marginTop: 6 }}>Start your first workout above.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── ACTIVE SESSION ─────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      {/* Session header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <TouchableOpacity
          onPress={() => Alert.alert('Cancelar?', 'O progresso será perdido.', [
            { text: 'Não', style: 'cancel' },
            { text: 'Cancelar sessão', style: 'destructive', onPress: () => { setActiveSession(null); setElapsed(0); setExercises([]); } },
          ])}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: FG.text, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: FG.dim, letterSpacing: 0.8 }}>SESSION ACTIVE</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: FG.text }}>Workout</Text>
        </View>
        <FButton size="sm" onPress={finishSession} disabled={finishing}>
          {finishing ? '…' : 'Finish'}
        </FButton>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Timer */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 11, color: FG.accent, letterSpacing: 0.8 }}>{paused ? 'PAUSED' : 'SESSION ACTIVE'}</Text>
              <Text style={{ fontSize: 32, fontWeight: '700', color: FG.text, letterSpacing: -1, marginTop: 2 }}>{fmt(elapsed)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: FG.dim }}>SETS DONE</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: FG.text }}>
                {exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setPaused(p => !p)}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: FG.accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#1a0a00', fontSize: 18, fontWeight: '700' }}>{paused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise list */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {exercises.map((ex, exIdx) => {
            const allDone = ex.sets.every(s => s.completed);
            const isExpanded = expandedEx === ex.exerciseId;
            return (
              <TouchableOpacity
                key={ex.exerciseId}
                onPress={() => setExpandedEx(isExpanded ? null : ex.exerciseId)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: FG.bg1, borderWidth: 1,
                  borderColor: isExpanded ? 'rgba(249,115,22,0.4)' : FG.line,
                  borderRadius: 14, padding: 14, opacity: allDone ? 0.7 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: allDone ? 'rgba(94,209,154,0.15)' : FG.bg2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: allDone ? 'rgba(94,209,154,0.4)' : FG.line }}>
                    <Text style={{ fontSize: 12, color: allDone ? FG.ok : FG.dim }}>{ allDone ? '✓' : (exIdx + 1).toString()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', fontSize: 15, color: FG.text, textDecorationLine: allDone ? 'line-through' : 'none' }}>{ex.exerciseName}</Text>
                    <Text style={{ fontSize: 12, color: FG.dim, marginTop: 2 }}>
                      {ex.sets.length} sets · {ex.sets.filter(s => s.completed).length} done
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: FG.mid }}>{isExpanded ? '▲' : '▼'}</Text>
                </View>

                {isExpanded && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: FG.line, gap: 8 }}>
                    {ex.sets.map((set, setIdx) => (
                      <View key={setIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => toggleSet(exIdx, setIdx)}
                          style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: set.completed ? FG.ok : FG.bg2, borderWidth: 1, borderColor: set.completed ? FG.ok : FG.line, alignItems: 'center', justifyContent: 'center' }}
                        >
                          {set.completed && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                        </TouchableOpacity>
                        <Text style={{ fontSize: 11, color: FG.dim, width: 40 }}>SET {setIdx + 1}</Text>
                        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
                          <View style={{ flex: 1, backgroundColor: FG.bg2, borderRadius: 8, borderWidth: 1, borderColor: FG.line, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                              value={set.weightKg ? set.weightKg.toString() : ''}
                              onChangeText={v => updateSetValue(exIdx, setIdx, 'weightKg', v)}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor={FG.dim}
                              style={{ flex: 1, color: FG.text, fontSize: 14, fontWeight: '600' }}
                            />
                            <Text style={{ fontSize: 10, color: FG.dim }}>kg</Text>
                          </View>
                          <View style={{ flex: 1, backgroundColor: FG.bg2, borderRadius: 8, borderWidth: 1, borderColor: FG.line, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                              value={set.reps ? set.reps.toString() : ''}
                              onChangeText={v => updateSetValue(exIdx, setIdx, 'reps', v)}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor={FG.dim}
                              style={{ flex: 1, color: FG.text, fontSize: 14, fontWeight: '600' }}
                            />
                            <Text style={{ fontSize: 10, color: FG.dim }}>reps</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                    <TouchableOpacity
                      onPress={() => {
                        setExercises(prev => prev.map((e, i) => i === exIdx ? { ...e, sets: [...e.sets, { setNumber: e.sets.length + 1, reps: 0, weightKg: 0, completed: false, isWarmup: false }] } : e));
                      }}
                      style={{ paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: FG.line, borderStyle: 'dashed', alignItems: 'center', marginTop: 4 }}
                    >
                      <Text style={{ fontSize: 12, color: FG.dim }}>+ Add set</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => router.push('/(modals)/add-exercise')}
            style={{ padding: 14, borderRadius: 14, marginTop: 4, borderWidth: 1.5, borderStyle: 'dashed', borderColor: FG.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Text style={{ fontSize: 18, color: FG.mid }}>+</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: FG.mid }}>Add exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
