import type { Exercise, MuscleGroup, EquipmentType, Language } from '../types';

// ── free-exercise-db (primary) ────────────────────────────────────────────────

const FREE_DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const FREE_DB_IMG = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';

const FREE_DB_MUSCLE: Record<string, MuscleGroup> = {
  chest: 'chest',
  'middle back': 'back',
  lats: 'back',
  'lower back': 'back',
  traps: 'shoulders',
  shoulders: 'shoulders',
  biceps: 'arms',
  triceps: 'arms',
  forearms: 'arms',
  hamstrings: 'legs',
  quadriceps: 'legs',
  glutes: 'legs',
  calves: 'legs',
  adductors: 'legs',
  abductors: 'legs',
  abdominals: 'core',
  neck: 'shoulders',
  back: 'back',
};

const FREE_DB_EQUIP: Record<string, EquipmentType> = {
  barbell: 'barbell',
  dumbbell: 'dumbbell',
  cable: 'cable',
  machine: 'machine',
  kettlebells: 'kettlebell',
  bands: 'band',
  'body only': 'bodyweight',
  'medicine ball': 'custom',
  'foam roll': 'custom',
  'e-z curl bar': 'barbell',
  other: 'custom',
};

// muscle group → MuscleGroup for filter matching
const FREE_DB_MG_FOR_FILTER: Record<MuscleGroup, string[]> = {
  chest: ['chest'],
  back: ['back', 'lats', 'middle back', 'lower back', 'traps'],
  legs: ['hamstrings', 'quadriceps', 'glutes', 'calves', 'adductors', 'abductors'],
  shoulders: ['shoulders', 'traps', 'neck'],
  arms: ['biceps', 'triceps', 'forearms'],
  core: ['abdominals'],
  cardio: [],
  full_body: [],
};

interface FreeDBExercise {
  id: string;
  name: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  level: string;
  images: string[];
}

let freeDBCache: FreeDBExercise[] | null = null;
let freeDBPromise: Promise<FreeDBExercise[]> | null = null;

async function loadFreeDB(): Promise<FreeDBExercise[]> {
  if (freeDBCache) return freeDBCache;
  if (freeDBPromise) return freeDBPromise;
  freeDBPromise = fetch(FREE_DB_URL)
    .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
    .then((data: FreeDBExercise[]) => { freeDBCache = data; return data; })
    .catch(() => [] as FreeDBExercise[]);
  return freeDBPromise;
}

function mapFreeDB(ex: FreeDBExercise): Exercise {
  const primaryMuscle = ex.primaryMuscles[0] ?? '';
  const muscleGroup: MuscleGroup = FREE_DB_MUSCLE[primaryMuscle] ?? 'full_body';
  const equipment: EquipmentType = FREE_DB_EQUIP[ex.equipment ?? ''] ?? 'custom';
  const img0 = ex.images[0] ? `${FREE_DB_IMG}/${ex.images[0]}` : undefined;
  const img1 = ex.images[1] ? `${FREE_DB_IMG}/${ex.images[1]}` : undefined;

  return {
    id: `fdb_${ex.id}`,
    name: ex.name,
    muscleGroup,
    equipment,
    difficulty: (ex.level as 'beginner' | 'intermediate' | 'advanced') ?? 'intermediate',
    source: 'api',
    imageUrl: img0,
    imageUrl2: img1,
    instructions: ex.instructions,
  };
}

// ── wger.de (fallback / multilingual search) ──────────────────────────────────

const WGER_BASE = 'https://wger.de/api/v2';
const WGER_HOST = 'https://wger.de';
const WGER_LANG_ID: Record<Language, number> = { en: 2, pt: 7, es: 4 };

const WGER_CATEGORY: Record<number, MuscleGroup> = {
  8: 'arms', 9: 'legs', 10: 'core', 11: 'chest',
  12: 'back', 13: 'shoulders', 14: 'legs', 15: 'legs',
};

const WGER_EQUIPMENT: Record<number, EquipmentType> = {
  1: 'barbell', 2: 'dumbbell', 3: 'machine', 4: 'cable',
  5: 'bodyweight', 7: 'kettlebell', 8: 'band', 9: 'smith', 10: 'machine',
};

function wgerImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${WGER_HOST}${path}`;
}

function pickTranslation(
  translations: Array<{ language: number; name: string; description?: string }>,
  langId: number,
): { name: string; description: string } {
  const preferred = translations.find(t => t.language === langId);
  const english = translations.find(t => t.language === 2);
  const any = translations[0];
  const t = preferred ?? english ?? any;
  return { name: t?.name ?? '', description: t?.description ?? '' };
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface ExerciseSearchResult {
  exercises: Exercise[];
  fromAPI: boolean;
}

export interface BrowseExercisesResult {
  exercises: Exercise[];
  total: number;
  next: string | null;
}

// ── Browse ────────────────────────────────────────────────────────────────────

export async function browseExercises(opts: {
  language?: Language;
  muscleGroup?: MuscleGroup;
  limit?: number;
  offset?: number;
}): Promise<BrowseExercisesResult> {
  const { language = 'en', muscleGroup, limit = 20, offset = 0 } = opts;

  // wger has native PT/ES translations; freeDB is English-only
  if (language !== 'en') return browseWger(opts);

  try {
    const all = await loadFreeDB();
    if (all.length === 0) throw new Error('empty');

    const filterMuscles = muscleGroup ? new Set(FREE_DB_MG_FOR_FILTER[muscleGroup] ?? []) : null;

    const filtered = filterMuscles
      ? all.filter(ex => ex.primaryMuscles.some(m => filterMuscles.has(m)))
      : all;

    const total = filtered.length;
    const slice = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      exercises: slice.map(mapFreeDB),
      total,
      next: hasMore ? 'more' : null,
    };
  } catch {
    return browseWger(opts);
  }
}

async function browseWger(opts: {
  language?: Language;
  muscleGroup?: MuscleGroup;
  limit?: number;
  offset?: number;
}): Promise<BrowseExercisesResult> {
  const { language = 'en', muscleGroup, limit = 20, offset = 0 } = opts;
  const langId = WGER_LANG_ID[language];
  const categoryId = muscleGroup
    ? Object.entries(WGER_CATEGORY).find(([, mg]) => mg === muscleGroup)?.[0]
    : undefined;

  const params = new URLSearchParams({ format: 'json', limit: String(limit), offset: String(offset) });
  if (categoryId) params.set('category', categoryId);

  try {
    const res = await fetch(`${WGER_BASE}/exerciseinfo/?${params}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const results: Exercise[] = [];

    for (const item of (data.results ?? [])) {
      const translations: Array<{ language: number; name: string; description?: string }> = item.translations ?? [];
      const hasUsable = translations.some(t => t.language === 2 || t.language === langId);
      if (!hasUsable) continue;
      const { name } = pickTranslation(translations, langId);
      if (!name.trim()) continue;

      const mainImage = (item.images as Array<{ image: string; is_main: boolean }> | undefined)
        ?.find(img => img.is_main) ?? item.images?.[0];
      const catId: number | undefined = item.category?.id;
      const mg: MuscleGroup = catId ? (WGER_CATEGORY[catId] ?? 'full_body') : 'full_body';
      const equipIds: number[] = (item.equipment ?? []).map((e: { id?: number } | number) =>
        typeof e === 'object' ? (e.id ?? 0) : e);
      const eq: EquipmentType = equipIds.length > 0 ? (WGER_EQUIPMENT[equipIds[0]] ?? 'barbell') : 'barbell';

      results.push({
        id: String(item.id), name, muscleGroup: mg, equipment: eq,
        difficulty: 'intermediate', source: 'api', apiId: String(item.id),
        imageUrl: wgerImageUrl(mainImage?.image),
      });
    }
    return { exercises: results, total: data.count ?? 0, next: data.next ?? null };
  } catch {
    return { exercises: [], total: 0, next: null };
  }
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchExercisesAPI(
  query: string,
  language: Language = 'en',
): Promise<ExerciseSearchResult> {
  // wger has native PT/ES translations; skip freeDB for non-English
  if (language !== 'en') return searchWger(query, language);

  const lower = query.toLowerCase();

  try {
    const all = await loadFreeDB();
    if (all.length > 0) {
      const results = all
        .filter(ex => ex.name.toLowerCase().includes(lower))
        .slice(0, 30)
        .map(mapFreeDB);
      if (results.length > 0) return { exercises: results, fromAPI: true };
    }
  } catch {}

  // Fall back to wger.de (good for PT/ES language queries)
  return searchWger(query, language);
}

async function searchWger(query: string, language: Language): Promise<ExerciseSearchResult> {
  try {
    const url = `${WGER_BASE}/exercise/search/?term=${encodeURIComponent(query)}&language=${language}&format=json`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const exercises: Exercise[] = (data.suggestions ?? []).map((s: Record<string, unknown>) => {
      const d = (s.data ?? {}) as Record<string, unknown>;
      return {
        id: String(d.id ?? s.value),
        name: String(s.value ?? ''),
        muscleGroup: 'chest' as MuscleGroup,
        equipment: 'barbell' as EquipmentType,
        difficulty: 'intermediate' as const,
        source: 'api' as const,
        apiId: String(d.id ?? ''),
      };
    });
    return { exercises, fromAPI: true };
  } catch {
    return { exercises: [], fromAPI: false };
  }
}

// ── Detail (library modal) ────────────────────────────────────────────────────

export async function getExerciseDetailAPI(
  apiId: string,
  language: Language = 'en',
): Promise<Partial<Exercise> | null> {
  // fdb_ exercises already carry full data — no extra fetch needed
  if (apiId.startsWith('fdb_')) return null;

  try {
    const res = await fetch(`${WGER_BASE}/exerciseinfo/${apiId}/?format=json`);
    if (!res.ok) return null;
    const data = await res.json();

    const langId = WGER_LANG_ID[language];
    const translations: Array<{ language: number; name: string; description?: string }> = data.translations ?? [];
    const { name, description } = pickTranslation(translations, langId);

    const catId: number | undefined = data.category?.id;
    const muscleGroup: MuscleGroup = catId ? (WGER_CATEGORY[catId] ?? 'full_body') : 'full_body';
    const equipIds: number[] = (data.equipment ?? []).map((e: { id?: number } | number) =>
      typeof e === 'object' ? (e.id ?? 0) : e);
    const equipment: EquipmentType = equipIds.length > 0 ? (WGER_EQUIPMENT[equipIds[0]] ?? 'barbell') : 'barbell';
    const mainImage = (data.images as Array<{ image: string; is_main: boolean }> | undefined)
      ?.find(img => img.is_main) ?? data.images?.[0];
    const instructions = description
      ? description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split('. ').filter(Boolean)
      : [];

    return { name: name || undefined, muscleGroup, equipment, instructions, imageUrl: wgerImageUrl(mainImage?.image) };
  } catch {
    return null;
  }
}

// ── Local fallback list ───────────────────────────────────────────────────────

export const POPULAR_EXERCISES: Exercise[] = [
  { id: 'bench_press',    name: 'Barbell Bench Press',    muscleGroup: 'chest',     equipment: 'barbell',    difficulty: 'intermediate', source: 'api', apiId: '192'  },
  { id: 'deadlift',       name: 'Conventional Deadlift',  muscleGroup: 'back',      equipment: 'barbell',    difficulty: 'advanced',     source: 'api', apiId: '29'   },
  { id: 'back_squat',     name: 'Back Squat',             muscleGroup: 'legs',      equipment: 'barbell',    difficulty: 'intermediate', source: 'api', apiId: '111'  },
  { id: 'pullup',         name: 'Pull-up',                muscleGroup: 'back',      equipment: 'bodyweight', difficulty: 'intermediate', source: 'api', apiId: '31'   },
  { id: 'ohp',            name: 'Overhead Press',         muscleGroup: 'shoulders', equipment: 'barbell',    difficulty: 'intermediate', source: 'api', apiId: '219'  },
  { id: 'rdl',            name: 'Romanian Deadlift',      muscleGroup: 'legs',      equipment: 'barbell',    difficulty: 'intermediate', source: 'api', apiId: '103'  },
  { id: 'cable_row',      name: 'Cable Row',              muscleGroup: 'back',      equipment: 'cable',      difficulty: 'beginner',     source: 'api', apiId: '61'   },
  { id: 'incline_db',     name: 'Incline Dumbbell Press', muscleGroup: 'chest',     equipment: 'dumbbell',   difficulty: 'intermediate', source: 'api', apiId: '72'   },
];

export function filterExercises(exercises: Exercise[], query: string, muscle?: string): Exercise[] {
  const lower = query.toLowerCase();
  return exercises.filter(ex =>
    ex.name.toLowerCase().includes(lower) &&
    (!muscle || ex.muscleGroup === muscle)
  );
}
