'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FCard, FButton, FG } from '@/components/ui';
import { browseExercises, searchExercisesAPI, getExerciseDetailAPI } from '@forge/common';
import type { Exercise, MuscleGroup, Language } from '@forge/common';

const MUSCLE_FILTER_VALUES: (MuscleGroup | 'all')[] = ['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'];

function muscleI18nKey(v: string): string {
  if (v === 'all') return 'library.muscleAll';
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

function ExerciseImage({ url, url2, name }: { url?: string; url2?: string; name: string }) {
  const [errored, setErrored] = useState(false);

  if (!url || errored) {
    return (
      <div style={{
        aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(249,115,22,0.02))',
        borderBottom: `1px solid ${FG.line}`,
      }}>
        <span style={{ fontSize: 40, opacity: 0.25 }}>⚒</span>
      </div>
    );
  }

  const imgStyle: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
  return (
    <div style={{ aspectRatio: '16/10', overflow: 'hidden', borderBottom: `1px solid ${FG.line}`, background: FG.bg2, position: 'relative' }}>
      <style>{`@keyframes fgAlt{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
      <img src={url} alt={name} onError={() => setErrored(true)} style={{ ...imgStyle, animation: url2 ? 'fgAlt 2.4s steps(1) infinite' : undefined }}/>
      {url2 && <img src={url2} alt="" style={{ ...imgStyle, animation: 'fgAlt 2.4s steps(1) infinite reverse' }}/>}
    </div>
  );
}

function ExerciseDetailModal({ exercise, language, onClose }: {
  exercise: Exercise;
  language: Language;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<Partial<Exercise> | null>(null);

  useEffect(() => {
    const id = exercise.apiId ?? exercise.id;
    if (!id) return;
    getExerciseDetailAPI(id, language).then(setDetail);
  }, [exercise.id, exercise.apiId, language]);

  const imgUrl = detail?.imageUrl ?? exercise.imageUrl;
  const imgUrl2 = exercise.imageUrl2;
  const name = exercise.name;
  const instructions = detail?.instructions ?? exercise.instructions ?? [];
  const muscleGroup = detail?.muscleGroup ?? exercise.muscleGroup;
  const equipment = detail?.equipment ?? exercise.equipment;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(11,15,20,0.88)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 520, background: FG.bg1,
        border: `1px solid ${FG.lineStrong}`, borderRadius: 20,
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative', background: FG.bg2, minHeight: 200 }}>
          {imgUrl ? (
            <div style={{ position: 'relative', maxHeight: 280, overflow: 'hidden' }}>
              <style>{`@keyframes fgAlt{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
              <img src={imgUrl} alt={name} style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block', animation: imgUrl2 ? 'fgAlt 2.4s steps(1) infinite' : undefined }}/>
              {imgUrl2 && <img src={imgUrl2} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'fgAlt 2.4s steps(1) infinite reverse' }}/>}
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 64, opacity: 0.2 }}>⚒</span>
            </div>
          )}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', border: 'none',
            color: FG.text, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          <h2 style={{ fontSize: 20, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>{name}</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: 'rgba(249,115,22,0.12)', color: FG.accent, border: '1px solid rgba(249,115,22,0.25)', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              {t(muscleI18nKey(muscleGroup))}
            </span>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: FG.bg2, color: FG.mid, border: `1px solid ${FG.line}`, textTransform: 'capitalize', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {t(equipmentI18nKey(equipment))}
            </span>
          </div>
          {instructions.length > 0 ? (
            <div>
              <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 10 }}>{t('library.instructions')}</div>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {instructions.map((step, i) => (
                  <li key={i} style={{ fontSize: 13, color: FG.mid, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{step}</li>
                ))}
              </ol>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: FG.dim, fontStyle: 'italic' }}>{t('library.noInstructions')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const { t, i18n } = useTranslation();
  const rawLang = i18n.language?.slice(0, 2) ?? 'en';
  const language: Language = (['en', 'pt', 'es'].includes(rawLang) ? rawLang : 'en') as Language;

  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [selected, setSelected] = useState<Exercise | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadExercises = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const offset = reset ? 0 : exercises.length;

    const result = await browseExercises({
      language,
      muscleGroup: muscleFilter === 'all' ? undefined : muscleFilter,
      limit: 24,
      offset,
    });

    if (reset) {
      setExercises(result.exercises);
    } else {
      setExercises(prev => [...prev, ...result.exercises]);
    }
    setTotal(result.total);
    setNextUrl(result.next);
    setLoading(false);
    setLoadingMore(false);
  }, [language, muscleFilter, exercises.length]);

  useEffect(() => {
    loadExercises(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, muscleFilter]);

  useEffect(() => {
    if (!query.trim()) {
      loadExercises(true);
      return;
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setLoading(true);
      const { exercises: found } = await searchExercisesAPI(query, language);
      setExercises(found);
      setTotal(found.length);
      setNextUrl(null);
      setLoading(false);
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{t('library.title')}</h1>
          <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>
            {loading ? t('common.loading') : t('library.exercisesCount', { n: total.toLocaleString() })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke={FG.dim} strokeWidth="1.5"/>
              <path d="M9.5 9.5l2.5 2.5" stroke={FG.dim} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder={t('library.searchPlaceholder')}
              style={{
                width: '100%', height: 36, paddingLeft: 32, paddingRight: 10,
                background: FG.bg1, border: `1px solid ${FG.line}`, borderRadius: 8,
                color: FG.text, fontFamily: 'Inter, sans-serif', fontSize: 13,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MUSCLE_FILTER_VALUES.map(mg => (
              <button
                key={mg}
                onClick={() => { setMuscleFilter(mg); setQuery(''); }}
                style={{
                  padding: '5px 13px', borderRadius: 99, cursor: 'pointer',
                  background: muscleFilter === mg ? 'rgba(249,115,22,0.12)' : FG.bg1,
                  border: `1px solid ${muscleFilter === mg ? 'rgba(249,115,22,0.3)' : FG.line}`,
                  color: muscleFilter === mg ? FG.accent : FG.mid,
                  fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >{t(muscleI18nKey(mg))}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: FG.bg1, border: `1px solid ${FG.line}` }}>
                <div style={{ aspectRatio: '16/10', background: FG.bg2, animation: 'pulse 1.5s infinite' }}/>
                <div style={{ padding: 14 }}>
                  <div style={{ height: 14, background: FG.bg2, borderRadius: 4, marginBottom: 8, width: '70%' }}/>
                  <div style={{ height: 11, background: FG.bg2, borderRadius: 4, width: '40%' }}/>
                </div>
              </div>
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: FG.dim }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, color: FG.text }}>{t('library.noExercises')}</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {exercises.map(ex => (
                <FCard key={ex.id} padding={0} style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelected(ex)}>
                  <ExerciseImage url={ex.imageUrl} url2={ex.imageUrl2} name={ex.name}/>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: FG.accent, marginTop: 4, fontFamily: 'Inter, sans-serif', fontWeight: 500, textTransform: 'capitalize' }}>
                      {t(muscleI18nKey(ex.muscleGroup))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {t(equipmentI18nKey(ex.equipment))}
                    </div>
                  </div>
                </FCard>
              ))}
            </div>

            {nextUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <FButton variant="ghost" onClick={() => loadExercises(false)} disabled={loadingMore}>
                  {loadingMore ? t('common.loading') : t('library.loadMore')}
                </FButton>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <ExerciseDetailModal exercise={selected} language={language} onClose={() => setSelected(null)}/>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
