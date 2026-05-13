'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FCard, FSectionHead, FButton, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import {
  getRecentWorkouts, getAllPRs,
  getRoutines, createRoutine, updateRoutine, deleteRoutine, incrementRoutineUsage,
  createWorkoutSession, processWorkoutComplete,
  browseExercises, searchExercisesAPI, POPULAR_EXERCISES,
} from '@forge/common';
import type {
  WorkoutSession, WorkoutExercise,
  WorkoutRoutine, RoutineExercise, Exercise, Language,
} from '@forge/common';

function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

const MUSCLE_EMOJI: Record<string, string> = {
  chest: '💪', back: '🏋️', legs: '🦵', shoulders: '🔝',
  arms: '💪', core: '⚡', cardio: '🏃', full_body: '⚒',
};

function muscleI18nKey(v: string): string {
  if (v === 'full_body') return 'library.muscleFullBody';
  return `library.muscle${v.charAt(0).toUpperCase() + v.slice(1)}`;
}

function equipmentI18nKey(v: string): string {
  const map: Record<string, string> = {
    barbell: 'library.equipmentBarbell', dumbbell: 'library.equipmentDumbbell',
    cable: 'library.equipmentCable', machine: 'library.equipmentMachine',
    bodyweight: 'library.equipmentBodyweight', kettlebell: 'library.equipmentKettlebell',
    band: 'library.equipmentBand', smith: 'library.equipmentSmith', custom: 'library.equipmentCustom',
  };
  return map[v] ?? 'library.equipmentCustom';
}

// ── Exercise Picker ───────────────────────────────────────────────────────────

function ExThumb({ url, url2, emoji }: { url?: string; url2?: string; emoji: string }) {
  const [err, setErr] = useState(false);
  const base: React.CSSProperties = {
    width: 52, height: 52, borderRadius: 10, flexShrink: 0,
    background: FG.bg2, border: `1px solid ${FG.line}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    position: 'relative',
  };
  if (!url || err) {
    return <div style={base}><span style={{ fontSize: 22 }}>{emoji}</span></div>;
  }
  const imgStyle: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
  return (
    <div style={base}>
      <style>{`@keyframes fgAlt{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
      <img src={url} alt="" onError={() => setErr(true)} style={{ ...imgStyle, animation: url2 ? 'fgAlt 2.4s steps(1) infinite' : undefined }}/>
      {url2 && <img src={url2} alt="" style={{ ...imgStyle, animation: 'fgAlt 2.4s steps(1) infinite reverse' }}/>}
    </div>
  );
}

function ExercisePicker({ onAdd, onClose, language = 'en' }: { onAdd: (ex: Exercise) => void; onClose: () => void; language?: Language }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [defaultExercises, setDefaultExercises] = useState<Exercise[]>(POPULAR_EXERCISES);
  const [results, setResults] = useState<Exercise[]>(POPULAR_EXERCISES);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from wger API on mount
  useEffect(() => {
    browseExercises({ language, limit: 40, offset: 0 })
      .then(res => {
        if (res.exercises.length > 0) {
          setDefaultExercises(res.exercises);
          setResults(res.exercises);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (!query.trim()) { setResults(defaultExercises); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      const { exercises } = await searchExercisesAPI(query, language);
      setResults(exercises.length > 0 ? exercises : defaultExercises.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase())
      ));
      setSearching(false);
    }, 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, language, defaultExercises]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(11,15,20,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 520, maxHeight: '76vh', background: FG.bg1,
        border: `1px solid ${FG.lineStrong}`, borderRadius: 20,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${FG.line}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke={FG.dim} strokeWidth="1.5"/>
              <path d="M10 10l3 3" stroke={FG.dim} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder={t('workout.searchExercises')} style={{
              width: '100%', height: 38, paddingLeft: 34, paddingRight: 12,
              background: FG.bg2, border: `1px solid ${FG.line}`, borderRadius: 10,
              color: FG.text, fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}/>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: FG.dim, cursor: 'pointer', fontSize: 20, padding: '0 4px', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(loading || searching) && (
            <div style={{ padding: 20, textAlign: 'center', color: FG.dim, fontSize: 13 }}>
              {searching ? t('common.searching') : t('common.loading')}
            </div>
          )}
          {!loading && !searching && results.map(ex => (
            <div key={ex.id} onClick={() => onAdd(ex)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px',
              cursor: 'pointer', borderBottom: `1px solid ${FG.line}`,
            }}
              onMouseEnter={e => (e.currentTarget.style.background = FG.bg2)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ExThumb url={ex.imageUrl} url2={ex.imageUrl2} emoji={MUSCLE_EMOJI[ex.muscleGroup] ?? '⚒'}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{ex.name}</div>
                <div style={{ fontSize: 11, color: FG.dim, marginTop: 1 }}>
                  {t(muscleI18nKey(ex.muscleGroup))} · {t(equipmentI18nKey(ex.equipment))}
                </div>
              </div>
              <span style={{ fontSize: 11, color: FG.accent, fontFamily: 'JetBrains Mono, monospace' }}>+ {t('common.add')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Routine Editor Modal ──────────────────────────────────────────────────────

type DraftExercise = Omit<RoutineExercise, 'order'> & { key: number };

function RoutineEditor({
  initial, onSave, onClose,
}: {
  initial?: WorkoutRoutine;
  onSave: (name: string, description: string, exercises: RoutineExercise[]) => Promise<void>;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const rawLang = i18n.language?.slice(0, 2) ?? 'en';
  const language: Language = (['en', 'pt', 'es'].includes(rawLang) ? rawLang : 'en') as Language;
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [exercises, setExercises] = useState<DraftExercise[]>(
    (initial?.exercises ?? []).map((e, i) => ({ ...e, key: i }))
  );
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const keyRef = useRef(initial?.exercises.length ?? 0);

  function addExercise(ex: Exercise) {
    const key = keyRef.current++;
    setExercises(prev => [...prev, {
      key, exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup,
      targetSets: 3, repsMin: 8, repsMax: 12, startingWeightKg: undefined, order: prev.length,
    }]);
    setShowPicker(false);
  }

  function updateEx(key: number, field: keyof DraftExercise, value: string | number) {
    setExercises(prev => prev.map(e => e.key === key ? { ...e, [field]: value } : e));
  }

  async function handleSave() {
    if (!name.trim() || exercises.length === 0) return;
    setSaving(true);
    try {
      const finalExercises: RoutineExercise[] = exercises.map((e, i) => ({
        exerciseId: e.exerciseId, exerciseName: e.exerciseName, muscleGroup: e.muscleGroup,
        targetSets: e.targetSets, repsMin: e.repsMin, repsMax: e.repsMax,
        startingWeightKg: e.startingWeightKg, notes: e.notes, order: i,
      }));
      await onSave(name.trim(), description.trim(), finalExercises);
    } finally {
      setSaving(false);
    }
  }

  const cols = [
    { label: t('workout.targetSets'), field: 'targetSets' as const },
    { label: t('workout.repsMin'), field: 'repsMin' as const },
    { label: t('workout.repsMax'), field: 'repsMax' as const },
    { label: t('workout.startKg'), field: 'startingWeightKg' as const },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(11,15,20,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 620, maxHeight: '86vh', background: FG.bg1,
        border: `1px solid ${FG.lineStrong}`, borderRadius: 20,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder={t('workout.routineNamePlaceholder')}
              style={{
                width: '100%', background: 'none', border: 'none', outline: 'none',
                fontSize: 20, fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                letterSpacing: '-0.02em', color: FG.text, boxSizing: 'border-box',
              }}
            />
            <input
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder={t('workout.descriptionPlaceholder')}
              style={{
                width: '100%', background: 'none', border: 'none', outline: 'none',
                fontSize: 13, fontFamily: 'Inter, sans-serif', color: FG.mid,
                marginTop: 4, boxSizing: 'border-box',
              }}
            />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: FG.dim, cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {exercises.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: FG.dim, fontSize: 13 }}>
              {t('workout.addExercisesPrompt')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {exercises.map((ex) => (
                <div key={ex.key} style={{ background: FG.bg2, borderRadius: 12, border: `1px solid ${FG.line}`, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{MUSCLE_EMOJI[ex.muscleGroup] ?? '⚒'}</span>
                    <span style={{ flex: 1, fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{ex.exerciseName}</span>
                    <span style={{ fontSize: 11, color: FG.dim }}>{t(muscleI18nKey(ex.muscleGroup))}</span>
                    <button onClick={() => setExercises(prev => prev.filter(e => e.key !== ex.key))} style={{ background: 'none', border: 'none', color: FG.dim, cursor: 'pointer', fontSize: 16, padding: '0 2px' }}>×</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                    {cols.map(col => (
                      <div key={col.field}>
                        <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>{col.label.toUpperCase()}</div>
                        <input
                          type="number"
                          value={col.field === 'startingWeightKg' ? (ex.startingWeightKg ?? '') : ex[col.field as keyof typeof ex] as number}
                          onChange={e => updateEx(ex.key, col.field, parseFloat(e.target.value) || 0)}
                          style={{
                            width: '100%', height: 32, borderRadius: 7,
                            background: FG.bg1, border: `1px solid ${FG.line}`,
                            color: FG.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                            textAlign: 'center', outline: 'none', boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowPicker(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              border: `2px dashed ${FG.lineStrong}`, background: 'transparent',
              color: FG.mid, cursor: 'pointer', fontSize: 13,
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.color = FG.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = FG.lineStrong; e.currentTarget.style.color = FG.mid; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {t('workout.addExercise')}
          </button>
        </div>

        <div style={{ padding: '14px 24px', borderTop: `1px solid ${FG.line}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <FButton variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</FButton>
          <FButton size="sm" onClick={handleSave} disabled={saving || !name.trim() || exercises.length === 0}>
            {saving ? t('common.saving') : initial ? t('workout.saveChanges') : t('workout.createRoutine')}
          </FButton>
        </div>
      </div>

      {showPicker && <ExercisePicker onAdd={addExercise} onClose={() => setShowPicker(false)} language={language} />}
    </div>
  );
}

// ── Routine Preview Modal ─────────────────────────────────────────────────────

function RoutinePreviewModal({
  routine,
  onClose,
  onStart,
  onEdit,
}: {
  routine: WorkoutRoutine;
  onClose: () => void;
  onStart: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();

  const uniqueMuscles = Array.from(new Set(routine.exercises.map(e => e.muscleGroup)));
  const totalSets = routine.exercises.reduce((a, e) => a + e.targetSets, 0);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(11,15,20,0.88)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 560, maxHeight: '84vh', background: FG.bg1,
        border: `1px solid ${FG.lineStrong}`, borderRadius: 20,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${FG.line}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {routine.name}
              </div>
              {routine.description && (
                <div style={{ fontSize: 13, color: FG.mid, marginTop: 4 }}>{routine.description}</div>
              )}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: FG.dim, cursor: 'pointer', fontSize: 20, padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>✕</button>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{t('workout.previewOverview')}</div>
              <div style={{ fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: FG.text, marginTop: 2 }}>
                {routine.exercises.length} <span style={{ fontSize: 11, color: FG.mid, fontWeight: 400 }}>{t('workout.exercisesCount', { count: routine.exercises.length }).replace(/^\d+ ?/, '')}</span>
              </div>
            </div>
            <div style={{ width: 1, background: FG.line }}/>
            <div>
              <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>SETS</div>
              <div style={{ fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: FG.text, marginTop: 2 }}>{totalSets}</div>
            </div>
            <div style={{ width: 1, background: FG.line }}/>
            <div>
              <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{t('workout.previewMusclesLabel')}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                {uniqueMuscles.map(m => (
                  <span key={m} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(249,115,22,0.1)', color: FG.accent, border: '1px solid rgba(249,115,22,0.2)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {t(muscleI18nKey(m))}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Exercise list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {routine.exercises.map((ex, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '13px 24px',
              borderBottom: i < routine.exercises.length - 1 ? `1px solid ${FG.line}` : 'none',
            }}>
              {/* Number */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: FG.bg2, border: `1px solid ${FG.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: FG.dim, fontWeight: 700,
                marginTop: 1,
              }}>{i + 1}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, marginBottom: 5 }}>
                  {ex.exerciseName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(249,115,22,0.1)', color: FG.accent, border: '1px solid rgba(249,115,22,0.2)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {t(muscleI18nKey(ex.muscleGroup))}
                  </span>
                </div>
                {ex.notes && (
                  <div style={{ fontSize: 11, color: FG.dim, marginTop: 5, fontStyle: 'italic' }}>{ex.notes}</div>
                )}
              </div>

              {/* Sets / reps */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: FG.accent }}>
                  {ex.targetSets} × {ex.repsMin}–{ex.repsMax}
                </div>
                <div style={{ fontSize: 10, color: FG.dim, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                  {t('workout.sets').toUpperCase()} × {t('workout.reps').toUpperCase()}
                </div>
                {ex.startingWeightKg && (
                  <div style={{ fontSize: 11, color: FG.mid, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                    {t('workout.previewStartKg', { kg: ex.startingWeightKg })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${FG.line}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <FButton variant="ghost" size="sm" onClick={onEdit}>{t('common.edit')}</FButton>
          <FButton size="md" onClick={onStart} icon={
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2.5 1.5l7 4-7 4z" fill="currentColor"/>
            </svg>
          }>{t('workout.start')}</FButton>
        </div>
      </div>
    </div>
  );
}

// ── Active Session View ───────────────────────────────────────────────────────

function ActiveSessionView({
  session, elapsed, saving, routineName,
  onAddSet, onUpdateSet, onRemoveSet,
  onFinish, onDiscard,
}: {
  session: { name: string; exercises: WorkoutExercise[] };
  elapsed: number;
  saving: boolean;
  routineName: string;
  onAddSet: (exIdx: number) => void;
  onUpdateSet: (exIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: string) => void;
  onRemoveSet: (exIdx: number, setIdx: number) => void;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  const { t } = useTranslation();
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalVolume = session.exercises.reduce((a, e) =>
    a + e.sets.reduce((b, s) => b + s.weightKg * s.reps, 0), 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 32px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, background: FG.bg0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: FG.ok, boxShadow: `0 0 8px ${FG.ok}` }}/>
            <span style={{ fontSize: 11, color: FG.ok, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>{t('workout.liveSession')}</span>
          </div>
          <div style={{ fontSize: 20, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>{routineName}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: FG.accent, letterSpacing: '-0.02em', lineHeight: 1 }}>{fmt(elapsed)}</div>
            <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginTop: 2 }}>{t('common.elapsed')}</div>
          </div>
          <div style={{ width: 1, height: 32, background: FG.line }}/>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, lineHeight: 1 }}>{totalSets}</div>
            <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginTop: 2 }}>{t('workout.setsLabel')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, lineHeight: 1 }}>{Math.round(totalVolume)}</div>
            <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginTop: 2 }}>{t('workout.volKg')}</div>
          </div>
          <FButton variant="ghost" size="sm" onClick={onDiscard} style={{ color: FG.err, borderColor: 'rgba(226,109,109,0.3)' }}>{t('common.discard')}</FButton>
          <FButton size="md" onClick={onFinish} disabled={saving || totalSets === 0}>
            {saving ? t('common.saving') : t('workout.finishWorkout')}
          </FButton>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {session.exercises.map((ex, exIdx) => (
          <FCard key={exIdx} padding={0} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{MUSCLE_EMOJI[ex.muscleGroup] ?? '⚒'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>{ex.exerciseName}</div>
                <div style={{ fontSize: 11, color: FG.dim }}>{t(muscleI18nKey(ex.muscleGroup))}</div>
              </div>
              <button
                onClick={() => onAddSet(exIdx)}
                style={{ padding: '5px 14px', borderRadius: 99, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: FG.accent, fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer' }}
              >{t('workout.addSet')}</button>
            </div>
            <div style={{ padding: '10px 18px 14px' }}>
              {ex.sets.length === 0 ? (
                <div style={{ fontSize: 12, color: FG.dim, textAlign: 'center', padding: '10px 0' }}>{t('workout.clickAddSet')}</div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 76px 22px', gap: 8, paddingBottom: 4 }}>
                    {[t('workout.setNum'), t('workout.colWeightKg'), t('workout.colReps'), ''].map((h, i) => (
                      <span key={i} style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textAlign: 'center' }}>{h}</span>
                    ))}
                  </div>
                  {ex.sets.map((set, setIdx) => {
                    const stepBtn: React.CSSProperties = {
                      width: 30, height: 36, borderRadius: 7, flexShrink: 0,
                      background: FG.bg0, border: `1px solid ${FG.line}`,
                      color: FG.mid, cursor: 'pointer', fontSize: 16, lineHeight: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                      transition: 'color 0.12s, border-color 0.12s',
                    };
                    return (
                      <div key={setIdx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 76px 22px', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>{set.setNumber}</span>

                        {/* Weight stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            style={stepBtn}
                            onClick={() => onUpdateSet(exIdx, setIdx, 'weightKg', String(Math.max(0, (set.weightKg || 0) - 2.5)))}
                            onMouseEnter={e => { e.currentTarget.style.color = FG.text; e.currentTarget.style.borderColor = FG.lineStrong; }}
                            onMouseLeave={e => { e.currentTarget.style.color = FG.mid; e.currentTarget.style.borderColor = FG.line; }}
                          >−</button>
                          <input
                            type="number" value={set.weightKg || ''} placeholder="0"
                            onChange={e => onUpdateSet(exIdx, setIdx, 'weightKg', e.target.value)}
                            style={{ flex: 1, height: 36, borderRadius: 7, background: FG.bg2, border: `1px solid ${FG.line}`, color: FG.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, textAlign: 'center', outline: 'none', minWidth: 0, boxSizing: 'border-box' }}
                          />
                          <button
                            style={stepBtn}
                            onClick={() => onUpdateSet(exIdx, setIdx, 'weightKg', String((set.weightKg || 0) + 2.5))}
                            onMouseEnter={e => { e.currentTarget.style.color = FG.accent; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = FG.mid; e.currentTarget.style.borderColor = FG.line; }}
                          >+</button>
                        </div>

                        <input type="number" value={set.reps || ''} placeholder="0"
                          onChange={e => onUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                          style={{ height: 36, borderRadius: 7, background: FG.bg2, border: `1px solid ${FG.line}`, color: FG.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, textAlign: 'center', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                        />
                        <button onClick={() => onRemoveSet(exIdx, setIdx)} style={{ background: 'none', border: 'none', color: FG.dim, cursor: 'pointer', fontSize: 16, padding: 0, textAlign: 'center' }}>×</button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </FCard>
        ))}
      </div>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'routines' | 'history' | 'prs';

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function WorkoutsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const rawLang = i18n.language?.slice(0, 2) ?? 'en';
  const language: Language = (['en', 'pt', 'es'].includes(rawLang) ? rawLang : 'en') as Language;
  const [tab, setTab] = useState<Tab>('routines');
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPRs] = useState<Awaited<ReturnType<typeof getAllPRs>>>([]);
  const [loading, setLoading] = useState(true);

  const [showEditor, setShowEditor] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | undefined>(undefined);
  const [previewRoutine, setPreviewRoutine] = useState<WorkoutRoutine | null>(null);

  const [activeSession, setActiveSession] = useState<{
    name: string; routineId: string; startedAt: Date; exercises: WorkoutExercise[];
  } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getRoutines(user.uid), getRecentWorkouts(user.uid, 20), getAllPRs(user.uid)])
      .then(([r, s, p]) => { setRoutines(r); setSessions(s); setPRs(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeSession?.startedAt]);

  async function handleSaveRoutine(name: string, description: string, exercises: RoutineExercise[]) {
    if (!user) return;
    if (editingRoutine) {
      await updateRoutine(user.uid, editingRoutine.id, { name, description, exercises });
      setRoutines(prev => prev.map(r => r.id === editingRoutine.id ? { ...r, name, description, exercises, updatedAt: new Date() } : r));
    } else {
      const id = await createRoutine(user.uid, { name, description, exercises, timesUsed: 0 });
      setRoutines(prev => [{ id, uid: user.uid, name, description, exercises, createdAt: new Date(), updatedAt: new Date(), timesUsed: 0 }, ...prev]);
    }
    setShowEditor(false);
    setEditingRoutine(undefined);
  }

  async function handleDeleteRoutine(routine: WorkoutRoutine) {
    if (!user || !confirm(t('workout.deleteRoutineConfirm', { name: routine.name }))) return;
    await deleteRoutine(user.uid, routine.id);
    setRoutines(prev => prev.filter(r => r.id !== routine.id));
  }

  function startSessionFromRoutine(routine: WorkoutRoutine) {
    const exercises: WorkoutExercise[] = routine.exercises.map(re => ({
      exerciseId: re.exerciseId,
      exerciseName: re.exerciseName,
      muscleGroup: re.muscleGroup,
      sets: [],
      order: re.order,
    }));
    setActiveSession({ name: routine.name, routineId: routine.id, startedAt: new Date(), exercises });
    setElapsed(0);
  }

  function handleAddSet(exIdx: number) {
    setActiveSession(s => {
      if (!s) return s;
      return {
        ...s,
        exercises: s.exercises.map((ex, i) => {
          if (i !== exIdx) return ex;
          const prev = ex.sets[ex.sets.length - 1];
          return {
            ...ex, sets: [...ex.sets, {
              setNumber: ex.sets.length + 1,
              reps: prev?.reps ?? 0,
              weightKg: prev?.weightKg ?? 0,
              completed: false, isWarmup: false,
            }],
          };
        }),
      };
    });
  }

  function handleUpdateSet(exIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: string) {
    const num = parseFloat(value) || 0;
    setActiveSession(s => s ? ({
      ...s,
      exercises: s.exercises.map((ex, i) => i !== exIdx ? ex : {
        ...ex, sets: ex.sets.map((set, j) => j !== setIdx ? set : { ...set, [field]: num }),
      }),
    }) : s);
  }

  function handleRemoveSet(exIdx: number, setIdx: number) {
    setActiveSession(s => s ? ({
      ...s,
      exercises: s.exercises.map((ex, i) => i !== exIdx ? ex : {
        ...ex, sets: ex.sets.filter((_, j) => j !== setIdx).map((set, j) => ({ ...set, setNumber: j + 1 })),
      }),
    }) : s);
  }

  async function handleFinishSession() {
    if (!user || !activeSession) return;
    setSaving(true);
    try {
      const completedAt = new Date();
      const totalVolumeKg = activeSession.exercises.reduce((a, ex) =>
        a + ex.sets.reduce((b, s) => b + s.weightKg * s.reps, 0), 0
      );
      const sessionData: Omit<WorkoutSession, 'id' | 'uid'> = {
        name: activeSession.name, planName: '', dayType: '',
        startedAt: activeSession.startedAt, completedAt,
        durationSeconds: elapsed,
        exercises: activeSession.exercises,
        totalVolumeKg,
      };
      const id = await createWorkoutSession(user.uid, sessionData);
      const full: WorkoutSession = { ...sessionData, id, uid: user.uid };
      await processWorkoutComplete(user.uid, full).catch(() => {});
      await incrementRoutineUsage(user.uid, activeSession.routineId).catch(() => {});
      setSessions(prev => [full, ...prev]);
      setRoutines(prev => prev.map(r => r.id === activeSession.routineId
        ? { ...r, timesUsed: r.timesUsed + 1, lastUsedAt: new Date() } : r
      ));
      setActiveSession(null);
      setTab('history');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscardSession() {
    if (confirm(t('workout.discardConfirm'))) setActiveSession(null);
  }

  if (activeSession) {
    return (
      <ActiveSessionView
        session={activeSession}
        elapsed={elapsed}
        saving={saving}
        routineName={activeSession.name}
        onAddSet={handleAddSet}
        onUpdateSet={handleUpdateSet}
        onRemoveSet={handleRemoveSet}
        onFinish={handleFinishSession}
        onDiscard={handleDiscardSession}
      />
    );
  }

  const totalVolume = sessions.reduce((a, s) => a + (s.totalVolumeKg ?? 0), 0);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'routines', label: t('workout.tabRoutines') },
    { key: 'history', label: t('workout.tabHistory') },
    { key: 'prs', label: t('workout.tabPrs') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px 0', borderBottom: `1px solid ${FG.line}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{t('nav.workouts')}</h1>
            <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>
              {t('workout.routinesStats', { routines: routines.length, rs: routines.length !== 1 ? 's' : '', sessions: sessions.length })}
            </div>
          </div>
          {tab === 'routines' && (
            <FButton onClick={() => { setEditingRoutine(undefined); setShowEditor(true); }} icon={
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1.5v12M1.5 7.5h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }>{t('workout.newRoutine')}</FButton>
          )}
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {TABS.map(tabItem => (
            <button key={tabItem.key} onClick={() => setTab(tabItem.key)} style={{
              padding: '10px 18px', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === tabItem.key ? FG.accent : 'transparent'}`,
              color: tab === tabItem.key ? FG.accent : FG.mid, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.01em', transition: 'color 0.15s, border-color 0.15s',
            }}>
              {tabItem.label}
              {tabItem.key === 'routines' && routines.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', background: 'rgba(249,115,22,0.15)', color: FG.accent, padding: '1px 6px', borderRadius: 99 }}>{routines.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

        {/* ── Routines Tab ── */}
        {tab === 'routines' && (
          <>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: FG.dim, fontSize: 13 }}>{t('common.loading')}</div>
            ) : routines.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 14, color: FG.dim }}>
                <div style={{ fontSize: 52 }}>⚒</div>
                <h3 style={{ fontSize: 18, color: FG.text, margin: 0 }}>{t('workout.noRoutines')}</h3>
                <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 320, margin: 0 }}>{t('workout.noRoutinesPrompt')}</p>
                <FButton onClick={() => { setEditingRoutine(undefined); setShowEditor(true); }} style={{ marginTop: 4 }} icon={
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1.5v12M1.5 7.5h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                }>{t('workout.createRoutine')}</FButton>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {routines.map(routine => (
                  <FCard key={routine.id} padding={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${FG.line}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>{routine.name}</div>
                          {routine.description && (
                            <div style={{ fontSize: 12, color: FG.mid, marginTop: 3 }}>{routine.description}</div>
                          )}
                        </div>
                        {routine.timesUsed > 0 && (
                          <span style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', background: FG.bg2, padding: '3px 8px', borderRadius: 99, flexShrink: 0, marginTop: 1 }}>×{routine.timesUsed}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                        {routine.exercises.slice(0, 5).map((ex, i) => (
                          <span key={i} style={{
                            fontSize: 11, padding: '3px 8px', borderRadius: 99,
                            background: FG.bg2, color: FG.mid, border: `1px solid ${FG.line}`,
                            fontFamily: 'Inter, sans-serif',
                          }}>{ex.exerciseName}</span>
                        ))}
                        {routine.exercises.length > 5 && (
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: FG.bg2, color: FG.dim, border: `1px solid ${FG.line}` }}>+{routine.exercises.length - 5}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', flex: 1 }}>
                        {t('workout.exercisesCount', { count: routine.exercises.length })}
                      </span>
                      <button onClick={() => setPreviewRoutine(routine)} style={{
                        padding: '5px 12px', borderRadius: 99, background: 'none',
                        border: `1px solid ${FG.lineStrong}`, color: FG.mid, cursor: 'pointer',
                        fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                      }}>{t('workout.view')}</button>
                      <button onClick={() => { setEditingRoutine(routine); setShowEditor(true); }} style={{
                        padding: '5px 12px', borderRadius: 99, background: 'none',
                        border: `1px solid ${FG.lineStrong}`, color: FG.mid, cursor: 'pointer',
                        fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                      }}>{t('common.edit')}</button>
                      <button onClick={() => handleDeleteRoutine(routine)} style={{
                        padding: '5px 10px', borderRadius: 99, background: 'none',
                        border: '1px solid rgba(226,109,109,0.2)', color: FG.err, cursor: 'pointer',
                        fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                      }}>{t('common.delete')}</button>
                      <FButton size="sm" onClick={() => startSessionFromRoutine(routine)} icon={
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M2.5 1.5l7 4-7 4z" fill="currentColor"/>
                        </svg>
                      }>{t('workout.start')}</FButton>
                    </div>
                  </FCard>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              {[
                { k: t('workout.statsTotalSessions'), v: sessions.length.toString() },
                { k: t('workout.statsTotalVolume'), v: totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}k kg` : '—' },
                { k: t('workout.statsPersonalRecords'), v: prs.length.toString() },
                {
                  k: t('workout.statsAvgDuration'), v: (() => {
                    const w = sessions.filter(s => s.durationSeconds);
                    if (!w.length) return '—';
                    const avg = Math.round(w.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / w.length);
                    return fmt(avg);
                  })(),
                },
              ].map((s, i) => (
                <FCard key={i} padding={16}>
                  <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{s.k}</div>
                  <div style={{ marginTop: 8 }}><span className="num" style={{ fontSize: 24 }}>{s.v}</span></div>
                </FCard>
              ))}
            </div>
            {sessions.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12, color: FG.dim }}>
                <div style={{ fontSize: 48 }}>📋</div>
                <h3 style={{ fontSize: 16, color: FG.text, margin: 0 }}>{t('workout.noSessions')}</h3>
                <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 300, margin: 0 }}>{t('workout.startRoutinePrompt')}</p>
              </div>
            ) : (
              <div style={{ background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 20px', gap: 12, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', borderBottom: `1px solid ${FG.line}`, textTransform: 'uppercase' }}>
                  <span>{t('workout.colSession')}</span><span>{t('workout.colDate')}</span><span>{t('workout.colExercises')}</span><span>{t('workout.colVolume')}</span><span>{t('workout.colDuration')}</span>
                </div>
                {sessions.map((s, i) => (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '13px 20px', gap: 12, alignItems: 'center', borderBottom: i < sessions.length - 1 ? `1px solid ${FG.line}` : 'none' }}>
                    <div>
                      <div style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{s.name || t('workout.defaultName')}</div>
                      {s.exercises?.length > 0 && (
                        <div style={{ fontSize: 11, color: FG.dim, marginTop: 2 }}>
                          {s.exercises.slice(0, 2).map(e => e.exerciseName).join(', ')}
                          {s.exercises.length > 2 ? ` +${s.exercises.length - 2}` : ''}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: FG.mid, fontFamily: 'JetBrains Mono, monospace' }}>
                      {new Date(s.startedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                    <span className="mono" style={{ fontSize: 13 }}>{s.exercises?.length ?? 0}</span>
                    <span className="num" style={{ fontSize: 13, color: s.totalVolumeKg > 0 ? FG.accent : FG.dim }}>
                      {s.totalVolumeKg > 0 ? `${Math.round(s.totalVolumeKg)} kg` : '—'}
                    </span>
                    <span className="mono" style={{ fontSize: 12, color: FG.mid }}>{s.durationSeconds ? fmt(s.durationSeconds) : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PRs Tab ── */}
        {tab === 'prs' && (
          prs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12, color: FG.dim }}>
              <div style={{ fontSize: 48 }}>↗</div>
              <h3 style={{ fontSize: 16, color: FG.text, margin: 0 }}>{t('workout.noPRs')}</h3>
              <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 300, margin: 0 }}>{t('workout.noPRsPrompt')}</p>
            </div>
          ) : (
            <>
              <FSectionHead kicker={t('common.allTime').toUpperCase()} title={t('workout.statsPersonalRecords')}/>
              <div style={{ background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 20px', gap: 12, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', borderBottom: `1px solid ${FG.line}`, textTransform: 'uppercase' }}>
                  <span>{t('progress.colExercise')}</span><span>{t('progress.colWeight')}</span><span>{t('progress.colReps')}</span><span>{t('progress.colEst1rm')}</span><span>{t('progress.colDate')}</span>
                </div>
                {prs.sort((a, b) => b.estimatedOneRMKg - a.estimatedOneRMKg).map((pr, i, arr) => (
                  <div key={`${pr.exerciseId}-${i}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', gap: 12, alignItems: 'center', borderBottom: i < arr.length - 1 ? `1px solid ${FG.line}` : 'none' }}>
                    <span style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{pr.exerciseName}</span>
                    <span className="num" style={{ fontSize: 14, color: FG.accent }}>{pr.maxWeightKg} kg</span>
                    <span className="mono" style={{ fontSize: 12, color: FG.mid }}>×{pr.reps}</span>
                    <span className="num" style={{ fontSize: 13 }}>~{Math.round(pr.estimatedOneRMKg)}</span>
                    <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
                      {pr.achievedAt ? new Date(pr.achievedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>

      {previewRoutine && (
        <RoutinePreviewModal
          routine={previewRoutine}
          onClose={() => setPreviewRoutine(null)}
          onStart={() => { startSessionFromRoutine(previewRoutine); setPreviewRoutine(null); }}
          onEdit={() => { setEditingRoutine(previewRoutine); setPreviewRoutine(null); setShowEditor(true); }}
        />
      )}

      {showEditor && (
        <RoutineEditor
          initial={editingRoutine}
          onSave={handleSaveRoutine}
          onClose={() => { setShowEditor(false); setEditingRoutine(undefined); }}
        />
      )}
    </div>
  );
}
