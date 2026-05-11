import type { Exercise, MuscleGroup, EquipmentType } from '../types';

const WGER_BASE = 'https://wger.de/api/v2';

const MUSCLE_MAP: Record<string, MuscleGroup> = {
  chest: 'chest', back: 'back', legs: 'legs',
  shoulders: 'shoulders', arms: 'arms', core: 'core',
  biceps: 'arms', triceps: 'arms', hamstrings: 'legs',
  quadriceps: 'legs', glutes: 'legs', calves: 'legs',
};

const EQUIPMENT_MAP: Record<string, EquipmentType> = {
  barbell: 'barbell', dumbbell: 'dumbbell', kettlebell: 'kettlebell',
  cable: 'cable', machine: 'machine', 'body weight': 'bodyweight',
  band: 'band',
};

export interface ExerciseSearchResult {
  exercises: Exercise[];
  fromAPI: boolean;
}

export async function searchExercisesAPI(query: string, language = 'en'): Promise<ExerciseSearchResult> {
  try {
    const url = `${WGER_BASE}/exercise/search/?term=${encodeURIComponent(query)}&language=${language}&format=json`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('API error');

    const data = await res.json();
    const suggestions: Exercise[] = (data.suggestions ?? []).map((s: Record<string, unknown>) => ({
      id: String(s.data && typeof s.data === 'object' && 'id' in s.data ? (s.data as Record<string, unknown>).id : s.value),
      name: String(s.value ?? ''),
      muscleGroup: MUSCLE_MAP[String(s.data && typeof s.data === 'object' && 'category' in s.data ? (s.data as Record<string, unknown>).category : '').toLowerCase()] ?? 'chest',
      equipment: 'barbell',
      difficulty: 'intermediate',
      source: 'api' as const,
      apiId: String(s.data && typeof s.data === 'object' && 'id' in s.data ? (s.data as Record<string, unknown>).id : ''),
    }));

    return { exercises: suggestions, fromAPI: true };
  } catch {
    return { exercises: [], fromAPI: false };
  }
}

export async function getExerciseDetailAPI(apiId: string): Promise<Partial<Exercise> | null> {
  try {
    const res = await fetch(`${WGER_BASE}/exerciseinfo/${apiId}/?format=json`);
    if (!res.ok) return null;
    const data = await res.json();

    const muscles: string[] = (data.muscles ?? []).map((m: Record<string, unknown>) =>
      String(m.name_en ?? '').toLowerCase()
    );
    const muscleGroup = muscles.length > 0 ? (MUSCLE_MAP[muscles[0]] ?? 'chest') : 'chest';

    const equipmentList: string[] = (data.equipment ?? []).map((e: Record<string, unknown>) =>
      String(e.name ?? '').toLowerCase()
    );
    const equipment = equipmentList.length > 0 ? (EQUIPMENT_MAP[equipmentList[0]] ?? 'barbell') : 'barbell';

    const instructions: string[] = (data.translations ?? [])
      .filter((t: Record<string, unknown>) => t.language === 2)
      .map((t: Record<string, unknown>) => String(t.description ?? ''));

    return { muscleGroup, equipment, instructions };
  } catch {
    return null;
  }
}

export const POPULAR_EXERCISES: Exercise[] = [
  { id: 'bench_press', name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: 'barbell', difficulty: 'intermediate', source: 'api', timesLogged: 8200 },
  { id: 'deadlift', name: 'Conventional Deadlift', muscleGroup: 'back', secondaryMuscles: ['legs'], equipment: 'barbell', difficulty: 'advanced', source: 'api', timesLogged: 6400 },
  { id: 'back_squat', name: 'Back Squat', muscleGroup: 'legs', equipment: 'barbell', difficulty: 'intermediate', source: 'api', timesLogged: 7100 },
  { id: 'pullup', name: 'Pull-up', muscleGroup: 'back', equipment: 'bodyweight', difficulty: 'intermediate', source: 'api', timesLogged: 4800 },
  { id: 'ohp', name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'barbell', difficulty: 'intermediate', source: 'api', timesLogged: 3200 },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'legs', secondaryMuscles: ['back'], equipment: 'barbell', difficulty: 'intermediate', source: 'api', timesLogged: 2900 },
  { id: 'bss', name: 'Bulgarian Split Squat', muscleGroup: 'legs', equipment: 'dumbbell', difficulty: 'intermediate', source: 'api', timesLogged: 2100 },
  { id: 'cable_row', name: 'Cable Row', muscleGroup: 'back', equipment: 'cable', difficulty: 'beginner', source: 'api', timesLogged: 5000 },
  { id: 'incline_db', name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: 'dumbbell', difficulty: 'intermediate', source: 'api', timesLogged: 5600 },
  { id: 'cable_fly', name: 'Cable Fly', muscleGroup: 'chest', equipment: 'cable', difficulty: 'beginner', source: 'api', timesLogged: 3100 },
  { id: 'skullcrushers', name: 'Skullcrushers', muscleGroup: 'arms', equipment: 'barbell', difficulty: 'intermediate', source: 'api', timesLogged: 2400 },
  { id: 'cable_pushdown', name: 'Cable Pushdown', muscleGroup: 'arms', equipment: 'cable', difficulty: 'beginner', source: 'api', timesLogged: 3800 },
];

export function filterExercises(exercises: Exercise[], query: string, muscle?: string): Exercise[] {
  const lower = query.toLowerCase();
  return exercises.filter(ex =>
    ex.name.toLowerCase().includes(lower) &&
    (!muscle || ex.muscleGroup === muscle)
  );
}
