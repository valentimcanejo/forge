import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { FG } from '@/constants/theme';
import { FButton, FBadge } from '@/components/ui';
import {
  createRoutine, updateRoutine, deleteRoutine,
  getRoutine, getUserExercises, searchExercisesAPI,
  POPULAR_EXERCISES, filterExercises,
} from '@forge/common';
import type { WorkoutRoutine, RoutineExercise, Exercise, MuscleGroup } from '@forge/common';
import { useStore } from '@/store/useStore';

type ViewMode = 'form' | 'picker';

const MUSCLE_LABELS = ['Todos', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const MUSCLE_MAP: Record<string, MuscleGroup> = {
  Chest: 'chest', Back: 'back', Legs: 'legs',
  Shoulders: 'shoulders', Arms: 'arms', Core: 'core',
};

// ── Exercise row in the picker ────────────────────────────────────────────────
function PickerRow({ exercise, onAdd }: { exercise: Exercise; onAdd: () => void }) {
  return (
    <View style={{ backgroundColor: FG.bg1, borderRadius: 12, borderWidth: 1, borderColor: FG.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: FG.text }}>{exercise.name}</Text>
        <Text style={{ fontSize: 11, color: FG.dim, marginTop: 2 }}>
          {exercise.muscleGroup} · {exercise.equipment}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2.5} strokeLinecap="round">
          <Path d="M12 5v14M5 12h14"/>
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

// ── Routine exercise row in the form ─────────────────────────────────────────
function RoutineExRow({
  ex, idx,
  onChangeSets, onChangeRepsMin, onChangeRepsMax, onDelete,
}: {
  ex: RoutineExercise; idx: number;
  onChangeSets: (v: number) => void;
  onChangeRepsMin: (v: string) => void;
  onChangeRepsMax: (v: string) => void;
  onDelete: () => void;
}) {
  return (
    <View style={{ backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, padding: 14 }}>
      {/* Line 1: name + muscle + delete */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: FG.text }}>{ex.exerciseName}</Text>
          <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(249,115,22,0.1)' }}>
            <Text style={{ fontSize: 10, color: FG.accent }}>{ex.muscleGroup}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth={2} strokeLinecap="round">
            <Path d="M18 6L6 18M6 6l12 12"/>
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Line 2: sets stepper + rep range */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {/* Sets stepper */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: FG.bg2, borderRadius: 10, borderWidth: 1, borderColor: FG.line, paddingHorizontal: 2, paddingVertical: 4 }}>
          <TouchableOpacity
            onPress={() => onChangeSets(Math.max(1, ex.targetSets - 1))}
            style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18, color: FG.mid, lineHeight: 20 }}>−</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 14, fontWeight: '700', color: FG.text, minWidth: 24, textAlign: 'center' }}>
            {ex.targetSets}
          </Text>
          <TouchableOpacity
            onPress={() => onChangeSets(ex.targetSets + 1)}
            style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 18, color: FG.accent, lineHeight: 20 }}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 11, color: FG.dim }}>séries</Text>

        <View style={{ width: 1, height: 16, backgroundColor: FG.line }}/>

        {/* Rep range */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TextInput
            value={ex.repsMin.toString()}
            onChangeText={onChangeRepsMin}
            keyboardType="number-pad"
            style={{ width: 36, backgroundColor: FG.bg2, borderWidth: 1, borderColor: FG.line, borderRadius: 8, paddingVertical: 6, textAlign: 'center', color: FG.text, fontSize: 13, fontWeight: '600' }}
          />
          <Text style={{ fontSize: 12, color: FG.dim }}>–</Text>
          <TextInput
            value={ex.repsMax.toString()}
            onChangeText={onChangeRepsMax}
            keyboardType="number-pad"
            style={{ width: 36, backgroundColor: FG.bg2, borderWidth: 1, borderColor: FG.line, borderRadius: 8, paddingVertical: 6, textAlign: 'center', color: FG.text, fontSize: 13, fontWeight: '600' }}
          />
          <Text style={{ fontSize: 11, color: FG.dim }}>reps</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ManageRoutineModal() {
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const { user } = useStore();
  const isEdit = Boolean(routineId);

  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);

  // Picker state
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('Todos');
  const [apiResults, setApiResults] = useState<Exercise[]>([]);
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [searching, setSearching] = useState(false);

  // Load routine for edit mode
  useEffect(() => {
    if (!routineId || !user) return;
    getRoutine(user.uid, routineId)
      .then(r => {
        if (r) { setName(r.name); setExercises(r.exercises.slice().sort((a, b) => a.order - b.order)); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [routineId, user]);

  // Load user exercises for picker
  useEffect(() => {
    if (!user) return;
    getUserExercises(user.uid).then(setUserExercises).catch(() => {});
  }, [user]);

  // Debounced search in picker
  useEffect(() => {
    if (viewMode !== 'picker') return;
    const timer = setTimeout(async () => {
      if (!query.trim()) { setApiResults([]); return; }
      setSearching(true);
      try {
        const res = await searchExercisesAPI(query);
        setApiResults(res.exercises);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, viewMode]);

  const selectedMuscle = muscleFilter !== 'Todos' ? MUSCLE_MAP[muscleFilter] : undefined;
  const popularFiltered = filterExercises(POPULAR_EXERCISES, query, selectedMuscle);
  const userFiltered = filterExercises(userExercises, query, selectedMuscle);
  const pickerResults = [...userFiltered, ...(apiResults.length > 0 ? apiResults : popularFiltered)];

  function addExercise(ex: Exercise) {
    const alreadyAdded = exercises.some(e => e.exerciseId === ex.id);
    if (!alreadyAdded) {
      setExercises(prev => [...prev, {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        targetSets: 3,
        repsMin: 8,
        repsMax: 12,
        order: prev.length,
      }]);
    }
    setViewMode('form');
    setQuery('');
    setApiResults([]);
  }

  function updateEx(idx: number, patch: Partial<RoutineExercise>) {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, ...patch } : e));
  }

  function removeEx(idx: number) {
    setExercises(prev => prev.filter((_, i) => i !== idx).map((e, i) => ({ ...e, order: i })));
  }

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        exercises: exercises.map((e, i) => ({ ...e, order: i })),
        timesUsed: 0,
      };
      if (isEdit && routineId) {
        await updateRoutine(user.uid, routineId, payload);
      } else {
        await createRoutine(user.uid, payload);
      }
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível guardar a rotina.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || !routineId) return;
    Alert.alert('Apagar rotina?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar', style: 'destructive',
        onPress: async () => {
          await deleteRoutine(user.uid, routineId).catch(() => {});
          router.back();
        },
      },
    ]);
  }

  // ── LOADING ──
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: FG.bg0, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={FG.accent}/>
      </View>
    );
  }

  // ── PICKER VIEW ──
  if (viewMode === 'picker') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
          <TouchableOpacity
            onPress={() => { setViewMode('form'); setQuery(''); setApiResults([]); }}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round">
              <Path d="M15 18l-6-6 6-6"/>
            </Svg>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>Escolher exercício</Text>
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <View style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7}/><Path d="M21 21l-4.3-4.3"/>
            </Svg>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Pesquisar exercícios…"
              placeholderTextColor={FG.dim}
              style={{ flex: 1, color: FG.text, fontSize: 14 }}
              autoFocus
            />
            {searching && <ActivityIndicator size="small" color={FG.accent}/>}
          </View>
        </View>

        {/* Muscle filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 12 }}>
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

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 8 }}>
          {pickerResults.map((ex, i) => (
            <PickerRow key={`${ex.id}-${i}`} exercise={ex} onAdd={() => addExercise(ex)}/>
          ))}
          {pickerResults.length === 0 && !searching && (
            <Text style={{ textAlign: 'center', color: FG.dim, fontSize: 13, paddingVertical: 40 }}>Nenhum resultado</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── FORM VIEW ──
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round">
                <Path d="M6 6l12 12M18 6L6 18"/>
              </Svg>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>
              {isEdit ? 'Editar rotina' : 'Nova rotina'}
            </Text>
          </View>
          {isEdit && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={{ fontSize: 13, color: FG.err }}>Apagar</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 16 }}>
          {/* Name */}
          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Nome da rotina</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="ex: Push Day, Full Body A…"
              placeholderTextColor={FG.dim}
              style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 12, padding: 14, color: FG.text, fontSize: 16, fontWeight: '600' }}
            />
          </View>

          {/* Exercises list */}
          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
              Exercícios {exercises.length > 0 ? `(${exercises.length})` : ''}
            </Text>
            <View style={{ gap: 8 }}>
              {exercises.map((ex, idx) => (
                <RoutineExRow
                  key={`${ex.exerciseId}-${idx}`}
                  ex={ex}
                  idx={idx}
                  onChangeSets={v => updateEx(idx, { targetSets: v })}
                  onChangeRepsMin={v => updateEx(idx, { repsMin: parseInt(v) || 0 })}
                  onChangeRepsMax={v => updateEx(idx, { repsMax: parseInt(v) || 0 })}
                  onDelete={() => removeEx(idx)}
                />
              ))}

              <TouchableOpacity
                onPress={() => setViewMode('picker')}
                style={{ padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: FG.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.mid} strokeWidth={2} strokeLinecap="round">
                  <Path d="M12 5v14M5 12h14"/>
                </Svg>
                <Text style={{ fontSize: 14, fontWeight: '600', color: FG.mid }}>Adicionar exercício</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={{ position: 'absolute', bottom: 26, left: 20, right: 20, flexDirection: 'row', gap: 10 }}>
          <FButton variant="ghost" style={{ flex: 1 }} onPress={() => router.back()}>Cancelar</FButton>
          <FButton style={{ flex: 2 }} onPress={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'A guardar…' : isEdit ? 'Guardar alterações' : 'Criar rotina'}
          </FButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
