'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FCard, FBadge, FProgress, FSparkline, FRing, FBars, FSectionHead, FButton, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { getLevelForXP, getXPProgress, getXPToNextLevel, getProgressHistory, getWeeklyVolume } from '@forge/common';
import type { ProgressEntry } from '@forge/common';

const DAYS = ['M','T','W','T','F','S','S'];
const KCAL_TARGET = 2650;
const MACRO_TARGETS = { protein: 180, carbs: 320, fat: 80 };

export default function DashboardPage() {
  const { t } = useTranslation();
  const { profile, gamification, todayLog, user } = useAuthStore();

  const [weightTrend, setWeightTrend] = useState<number[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<number[]>(new Array(7).fill(0));
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    getProgressHistory(user.uid, 12)
      .then(entries => {
        setProgressEntries(entries);
        const trend = entries.filter(e => e.weightKg != null).map(e => e.weightKg as number);
        setWeightTrend(trend);
      })
      .catch(() => {});
    getWeeklyVolume(user.uid)
      .then(setWeeklyVolume)
      .catch(() => {});
  }, [user]);

  const xp = gamification?.xp ?? 0;
  const xpProgress = getXPProgress(xp);
  const level = getLevelForXP(xp);
  const xpToNext = getXPToNextLevel(xp);
  const streak = gamification?.streakDays ?? 0;
  const name = profile?.displayName?.split(' ')[0] ?? 'Athlete';

  const kcalConsumed = Math.round(todayLog?.totalKcal ?? 0);
  const protein = Math.round(todayLog?.totalProteinG ?? 0);
  const carbs = Math.round(todayLog?.totalCarbsG ?? 0);
  const fat = Math.round(todayLog?.totalFatG ?? 0);
  const waterMl = todayLog?.waterMl ?? 0;

  const latestEntry = progressEntries[progressEntries.length - 1];
  const firstEntry = progressEntries[0];
  const latestWeight = latestEntry?.weightKg;
  const weightDiff = latestEntry?.weightKg != null && firstEntry?.weightKg != null
    ? latestEntry.weightKg - firstEntry.weightKg
    : null;

  const totalVolume = weeklyVolume.reduce((a, b) => a + b, 0);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const firstDateLabel = firstEntry
    ? new Date(firstEntry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()
    : '';
  const lastDateLabel = latestEntry
    ? new Date(latestEntry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {t('dashboard.greeting', { name })}
          </h1>
          <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>
            {dateStr}{streak > 0 ? ` · Day ${streak} of streak` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ background: FG.bg1, border: `1px solid ${FG.line}`, borderRadius: 10, padding: '8px 12px', width: 240, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <span style={{ color: FG.dim, fontSize: 12, fontFamily: 'Inter, sans-serif', flex: 1 }}>Search…</span>
            <span style={{ color: FG.dim, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '2px 5px', background: FG.bg2, borderRadius: 4 }}>⌘K</span>
          </div>
          <FButton size="sm" onClick={() => window.location.href = '/workouts'}>{t('dashboard.logWorkout')}</FButton>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Top stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {[
            {
              k: 'BODY WEIGHT', v: latestWeight != null ? latestWeight.toFixed(1) : '—', u: 'kg',
              d: weightDiff != null ? `${weightDiff >= 0 ? '+' : ''}${weightDiff.toFixed(1)} kg · ${progressEntries.length}W` : 'no data yet',
              tone: weightDiff != null && weightDiff <= 0 ? 'ok' : 'warn',
              spark: weightTrend.length >= 2 ? weightTrend : null,
            },
            {
              k: 'WEEKLY VOLUME', v: totalVolume > 0 ? (totalVolume / 1000).toFixed(1) : '—', u: totalVolume > 0 ? 'k kg' : '',
              d: totalVolume > 0 ? 'this week' : 'start a workout',
              tone: 'ok', spark: weeklyVolume.some(v => v > 0) ? weeklyVolume : null,
            },
            {
              k: 'PROTEIN TODAY', v: protein.toString(), u: 'g',
              d: `target ${MACRO_TARGETS.protein}g`,
              tone: protein >= MACRO_TARGETS.protein ? 'ok' : 'warn', spark: null,
            },
            {
              k: 'XP TO LVL ' + (level.level + 1), v: String(xpToNext), u: 'xp',
              d: `${Math.round(xpProgress * 100)}% complete`,
              tone: 'accent', spark: null,
            },
          ].map((s, i) => (
            <FCard key={i} padding={16}>
              <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{s.k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <span className="num" style={{ fontSize: 28 }}>{s.v}</span>
                {s.u && <span style={{ color: FG.mid, fontSize: 12 }}>{s.u}</span>}
              </div>
              <div style={{ fontSize: 11, marginTop: 4, color: s.tone === 'ok' ? FG.ok : s.tone === 'warn' ? FG.warn : FG.accent, fontFamily: 'JetBrains Mono, monospace' }}>{s.d}</div>
              {s.spark && <div style={{ marginTop: 8 }}><FSparkline data={s.spark} w={220} h={40}/></div>}
            </FCard>
          ))}
        </div>

        {/* Main 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginBottom: 18 }}>
          {/* Weight chart */}
          <FCard padding={20}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <FSectionHead kicker="BODY WEIGHT" title={weightTrend.length >= 2 ? `${progressEntries.length} week trend` : 'Weight trend'}/>
            </div>
            {weightTrend.length >= 2 ? (
              <>
                <FSparkline data={weightTrend} w={520} h={180}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
                  <span>{firstEntry?.weightKg?.toFixed(1)} kg · {firstDateLabel}</span>
                  <span style={{ color: FG.accent }}>{latestEntry?.weightKg?.toFixed(1)} kg · {lastDateLabel}</span>
                </div>
              </>
            ) : (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: FG.dim }}>
                <div style={{ fontSize: 32 }}>📊</div>
                <div style={{ fontSize: 13 }}>Log weight in Progress to see your trend</div>
              </div>
            )}
          </FCard>

          {/* Macros */}
          <FCard padding={20}>
            <FSectionHead kicker="TODAY" title="Macros"/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
              <FRing
                value={Math.min(kcalConsumed / KCAL_TARGET, 1)}
                size={88} stroke={8}
                label={kcalConsumed.toString()}
                sub={`of ${KCAL_TARGET}`}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { l: 'Protein', v: protein, t: MACRO_TARGETS.protein, c: FG.accent },
                  { l: 'Carbs',   v: carbs,   t: MACRO_TARGETS.carbs,   c: FG.warn },
                  { l: 'Fat',     v: fat,      t: MACRO_TARGETS.fat,    c: FG.ok },
                ].map(m => (
                  <div key={m.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3, color: FG.mid }}>
                      <span>{m.l}</span>
                      <span className="mono" style={{ color: FG.text }}>{m.v}/{m.t}g</span>
                    </div>
                    <FProgress value={m.t > 0 ? Math.min(m.v / m.t, 1) : 0} color={m.c} height={4}/>
                  </div>
                ))}
              </div>
            </div>
            {waterMl < 2000 && (
              <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(240,184,110,0.08)', border: `1px solid rgba(240,184,110,0.18)`, display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: FG.warn }}>
                💧 {(waterMl / 1000).toFixed(1)} / 3.0 L — log water in Meals
              </div>
            )}
          </FCard>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {/* Volume bars */}
          <FCard padding={18}>
            <FSectionHead kicker="THIS WEEK" title="Volume"/>
            <FBars data={weeklyVolume} w={260} h={120}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
              {DAYS.map((d, i) => <span key={i} style={{ flex: 1, textAlign: 'center', color: i === new Date().getDay() ? FG.accent : FG.dim }}>{d}</span>)}
            </div>
          </FCard>

          {/* Level / XP */}
          <FCard padding={18}>
            <FSectionHead kicker={`LVL ${level.level} · ${level.name.toUpperCase()}`} title="Experience"/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <FRing value={xpProgress} size={72} stroke={6} label={`${Math.round(xpProgress * 100)}%`} sub="XP"/>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: FG.text, fontFamily: 'DM Sans, sans-serif' }}>{xp.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: FG.mid, marginTop: 2 }}>total XP</div>
                <div style={{ fontSize: 11, color: FG.accent, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>{xpToNext} to LVL {level.level + 1}</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}><FProgress value={xpProgress} height={4}/></div>
          </FCard>

          {/* Recent activity */}
          <FCard padding={18}>
            <FSectionHead kicker="ACTIVITY" title="Recent"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {gamification && gamification.streakDays > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${FG.warn}1A`, color: FG.warn, border: `1px solid ${FG.warn}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🔥</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>Day {streak} streak</div>
                    <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>keep it up</div>
                  </div>
                </div>
              )}
              {gamification && gamification.totalWorkouts > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${FG.ok}1A`, color: FG.ok, border: `1px solid ${FG.ok}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{gamification.totalWorkouts} workouts logged</div>
                    <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>total</div>
                  </div>
                </div>
              )}
              {gamification && gamification.totalPRs > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${FG.accent}1A`, color: FG.accent, border: `1px solid ${FG.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>↗</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{gamification.totalPRs} personal records</div>
                    <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>all time</div>
                  </div>
                </div>
              )}
              {(!gamification || (gamification.totalWorkouts === 0 && gamification.totalPRs === 0 && gamification.streakDays === 0)) && (
                <div style={{ color: FG.dim, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                  Start your first workout to see activity here
                </div>
              )}
            </div>
          </FCard>
        </div>
      </div>
    </div>
  );
}
