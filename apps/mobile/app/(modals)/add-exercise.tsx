import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { FG } from '@/constants/theme';
import { FButton, FBadge } from '@/components/ui';
import { searchExercisesAPI, getUserExercises, createCustomExercise, POPULAR_EXERCISES, filterExercises } from '@forge/common';
import type { Exercise, WorkoutExercise, MuscleGroup, EquipmentType } from '@forge/common';
import { useStore } from '@/store/useStore';

type Screen = 'search' | 'create';

const MUSCLE_LABELS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const MUSCLE_MAP: Record<string, MuscleGroup> = {
  Chest: 'chest', Back: 'back', Legs: 'legs',
  Shoulders: 'shoulders', Arms: 'arms', Core: 'core',
};
const MUSCLE_GROUPS_FORM = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const EQUIPMENT_FORM = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Smith', 'Band'];
const EQUIPMENT_MAP: Record<string, EquipmentType> = {
  Barbell: 'barbell', Dumbbell: 'dumbbell', Cable: 'cable', Machine: 'machine',
  Bodyweight: 'bodyweight', Kettlebell: 'kettlebell', Smith: 'smith', Band: 'band',
};
const ICONS = ['⚒', '◧', '⚙', '◬', '◯', '◫', '◪', '◰', '✦', '☉'];

function ExerciseRow({ exercise, onAdd }: { exercise: Exercise; onAdd: () => void }) {
  return (
    <View style={{ backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 11, backgroundColor: FG.bg2, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20 }}>⚒</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: FG.text }}>{exercise.name}</Text>
          <FBadge tone={exercise.source === 'custom' ? 'ok' : 'accent'} style={{ paddingHorizontal: 5, paddingVertical: 1 }}>
            {exercise.source === 'custom' ? 'MINE' : 'DB'}
          </FBadge>
        </View>
        <Text style={{ fontSize: 11, color: FG.dim, marginTop: 2 }}>
          <Text style={{ color: FG.mid }}>{exercise.muscleGroup}</Text>
          {' · '}{exercise.equipment}
          {exercise.timesLogged ? ` · ${exercise.timesLogged.toLocaleString()} uses` : ''}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2.5} strokeLinecap="round">
          <Path d="M12 5v14M5 12h14"/>
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

export default function AddExerciseModal() {
  const { user, activeSession, setActiveSession } = useStore();
  const [screen, setScreen] = useState<Screen>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [apiResults, setApiResults] = useState<Exercise[]>([]);
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [searching, setSearching] = useState(false);
  const [fromAPI, setFromAPI] = useState(false);

  const [exName, setExName] = useState('');
  const [exIcon, setExIcon] = useState(ICONS[0]);
  const [exPrimary, setExPrimary] = useState('Chest');
  const [exEquip, setExEquip] = useState('Barbell');
  const [exTrackBy, setExTrackBy] = useState<'Reps' | 'Time'>('Reps');
  const [exNotes, setExNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserExercises(user.uid).then(setUserExercises).catch(() => {});
  }, [user]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setApiResults([]); return; }
    setSearching(true);
    try {
      const res = await searchExercisesAPI(q);
      setApiResults(res.exercises);
      setFromAPI(res.fromAPI);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { doSearch(searchQuery); }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  const selectedMuscle = muscleFilter !== 'All' ? MUSCLE_MAP[muscleFilter] : undefined;

  const popularFiltered = filterExercises(POPULAR_EXERCISES, searchQuery, selectedMuscle);
  const userFiltered = filterExercises(userExercises, searchQuery, selectedMuscle);
  const allResults = [...userFiltered, ...(apiResults.length > 0 ? apiResults : popularFiltered)];

  function addExerciseToSession(exercise: Exercise) {
    if (!activeSession) {
      router.back();
      return;
    }
    const alreadyAdded = activeSession.exercises.some(e => e.exerciseId === exercise.id);
    if (alreadyAdded) { router.back(); return; }

    const newEx: WorkoutExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      order: activeSession.exercises.length,
      sets: [{ setNumber: 1, reps: 0, weightKg: 0, completed: false, isWarmup: false }],
    };
    setActiveSession({ ...activeSession, exercises: [...activeSession.exercises, newEx] });
    router.back();
  }

  async function handleSave() {
    if (!exName.trim() || !user) return;
    setSaving(true);
    try {
      const exercise: Omit<Exercise, 'id'> = {
        name: exName.trim(),
        muscleGroup: MUSCLE_MAP[exPrimary] ?? 'chest',
        equipment: EQUIPMENT_MAP[exEquip] ?? 'barbell',
        difficulty: 'intermediate',
        source: 'custom',
      };
      const id = await createCustomExercise(user.uid, exercise);
      if (activeSession) {
        addExerciseToSession({ ...exercise, id });
      } else {
        router.back();
      }
    } finally {
      setSaving(false);
    }
  }

  // ── SEARCH ────────────────────────────────────────────────────
  if (screen === 'search') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round">
                <Path d="M6 6l12 12M18 6L6 18"/>
              </Svg>
            </TouchableOpacity>
            <Text style={{ fontSize: 22, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>Add exercise</Text>
          </View>
          {!activeSession && (
            <Text style={{ fontSize: 12, color: FG.dim }}>No active session</Text>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <View style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7}/>
              <Path d="M21 21l-4.3-4.3"/>
            </Svg>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises…"
              placeholderTextColor={FG.dim}
              style={{ flex: 1, color: FG.text, fontSize: 14 }}
              returnKeyType="search"
            />
            <View style={{ width: 1, height: 16, backgroundColor: FG.line }}/>
            <Text style={{ fontSize: 11, color: searching ? FG.accent : FG.dim }}>
              {searching ? 'searching…' : `${allResults.length}`}
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 14 }}>
          {MUSCLE_LABELS.map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setMuscleFilter(m)}
              style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: muscleFilter === m ? 'rgba(249,115,22,0.12)' : FG.bg1, borderWidth: 1, borderColor: muscleFilter === m ? 'rgba(249,115,22,0.3)' : FG.line }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: muscleFilter === m ? FG.accent : FG.mid }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 8 }} showsVerticalScrollIndicator={false}>
          {allResults.map((ex, i) => (
            <ExerciseRow key={`${ex.id}-${i}`} exercise={ex} onAdd={() => addExerciseToSession(ex)}/>
          ))}

          <View style={{ marginTop: 6, padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: FG.lineStrong, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(249,115,22,0.1)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2} strokeLinecap="round">
                <Path d="M12 5v14M5 12h14"/>
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: FG.text }}>Not on the list?</Text>
              <Text style={{ fontSize: 11, color: FG.mid, marginTop: 2 }}>Create your own exercise</Text>
            </View>
            <FButton variant="soft" size="sm" onPress={() => setScreen('create')}>Create</FButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CREATE ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => setScreen('search')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round">
                <Path d="M15 18l-6-6 6-6"/>
              </Svg>
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 11, color: FG.accent, letterSpacing: 1.2, textTransform: 'uppercase' }}>New · Mine</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: FG.text, marginTop: 1, letterSpacing: -0.5 }}>Forge an exercise</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Name</Text>
            <TextInput
              value={exName}
              onChangeText={setExName}
              placeholder="Exercise name"
              placeholderTextColor={FG.dim}
              style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 12, padding: 14, color: FG.text, fontSize: 16, fontWeight: '600' }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Icon</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {ICONS.map(ic => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setExIcon(ic)}
                  style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: exIcon === ic ? 'rgba(249,115,22,0.14)' : FG.bg1, borderWidth: 1, borderColor: exIcon === ic ? 'rgba(249,115,22,0.4)' : FG.line, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 18 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Primary Muscle</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {MUSCLE_GROUPS_FORM.map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setExPrimary(m)}
                  style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: exPrimary === m ? FG.accent : FG.bg1, borderWidth: 1, borderColor: exPrimary === m ? FG.accent : FG.line }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: exPrimary === m ? '#1a0a00' : FG.mid }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Equipment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {EQUIPMENT_FORM.map(eq => (
                <TouchableOpacity
                  key={eq}
                  onPress={() => setExEquip(eq)}
                  style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: exEquip === eq ? FG.bg2 : FG.bg1, borderWidth: 1, borderColor: exEquip === eq ? FG.lineStrong : FG.line }}
                >
                  <Text style={{ fontSize: 12, color: exEquip === eq ? FG.text : FG.mid }}>{eq}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Track By</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['Reps', 'Time'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setExTrackBy(t)}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: exTrackBy === t ? FG.bg2 : FG.bg1, borderWidth: 1, borderColor: exTrackBy === t ? FG.lineStrong : FG.line, alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: exTrackBy === t ? FG.text : FG.mid }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Form Cue · Optional</Text>
            <TextInput
              value={exNotes}
              onChangeText={setExNotes}
              placeholder="e.g. Brace core, drive through heels"
              placeholderTextColor={FG.dim}
              multiline
              numberOfLines={3}
              style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, borderRadius: 12, padding: 12, color: FG.text, fontSize: 13, minHeight: 64, textAlignVertical: 'top' }}
            />
          </View>
        </ScrollView>

        <View style={{ position: 'absolute', bottom: 26, left: 20, right: 20, flexDirection: 'row', gap: 10 }}>
          <FButton variant="ghost" style={{ flex: 1 }} onPress={() => router.back()}>Cancel</FButton>
          <FButton style={{ flex: 2 }} onPress={handleSave} disabled={saving || !exName.trim()}>
            {saving ? 'Saving…' : activeSession ? 'Save & add to session' : 'Save exercise'}
          </FButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
