'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FCard, FBadge, FSectionHead, FButton, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { getRecentWorkouts, getAllPRs } from '@forge/common';
import type { WorkoutSession, PRRecord } from '@forge/common';

function fmt(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function WorkoutsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [prs, setPRs] = useState<PRRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getRecentWorkouts(user.uid, 20), getAllPRs(user.uid)])
      .then(([s, p]) => { setSessions(s); setPRs(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const muscles = ['All', ...Array.from(new Set(sessions.flatMap(s => s.exercises?.map(e => e.muscleGroup) ?? [])))];
  const filteredSessions = activeFilter === 'All'
    ? sessions
    : sessions.filter(s => s.exercises?.some(e => e.muscleGroup === activeFilter));

  const totalVolume = sessions.reduce((a, s) => a + (s.totalVolumeKg ?? 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>Workouts</h1>
          <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>
            {sessions.length > 0 ? `${sessions.length} sessions logged` : 'Start training from the mobile app'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
          {[
            { k: 'TOTAL SESSIONS', v: sessions.length.toString(), u: '' },
            { k: 'TOTAL VOLUME', v: totalVolume > 0 ? (totalVolume / 1000).toFixed(1) : '—', u: totalVolume > 0 ? 'k kg' : '' },
            { k: 'PERSONAL RECORDS', v: prs.length.toString(), u: '' },
            { k: 'AVG DURATION', v: sessions.length > 0 ? fmt(Math.round(sessions.filter(s => s.durationSeconds).reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / sessions.filter(s => s.durationSeconds).length || 0)) : '—', u: '' },
          ].map((s, i) => (
            <FCard key={i} padding={16}>
              <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{s.k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                <span className="num" style={{ fontSize: 26 }}>{s.v}</span>
                {s.u && <span style={{ color: FG.mid, fontSize: 11 }}>{s.u}</span>}
              </div>
            </FCard>
          ))}
        </div>

        {/* Filters */}
        {muscles.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            {muscles.map(m => (
              <button key={m} onClick={() => setActiveFilter(m)} style={{
                padding: '6px 12px', borderRadius: 99,
                background: activeFilter === m ? 'rgba(249,115,22,0.12)' : FG.bg1,
                border: `1px solid ${activeFilter === m ? 'rgba(249,115,22,0.3)' : FG.line}`,
                color: activeFilter === m ? FG.accent : FG.mid,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              }}>{m}</button>
            ))}
            <div style={{ flex: 1 }}/>
            <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{filteredSessions.length} sessions</span>
          </div>
        )}

        {/* Session list */}
        {filteredSessions.length === 0 && !loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12, color: FG.dim }}>
            <div style={{ fontSize: 48 }}>⚒</div>
            <h3 style={{ fontSize: 18, color: FG.text }}>No sessions yet</h3>
            <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 360 }}>Open the Forge mobile app, tap "Start Session" in the Lift tab, and log your first workout.</p>
          </div>
        ) : (
          <div style={{ background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', gap: 12, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', borderBottom: `1px solid ${FG.line}`, textTransform: 'uppercase' }}>
              <span>SESSION</span>
              <span>DATE</span>
              <span>EXERCISES</span>
              <span>VOLUME</span>
              <span>DURATION</span>
            </div>
            {filteredSessions.map((s, i) => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', gap: 12, alignItems: 'center', borderBottom: i < filteredSessions.length - 1 ? `1px solid ${FG.line}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{s.name || 'Workout'}</div>
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
                <span className="mono" style={{ fontSize: 12, color: FG.mid }}>
                  {s.durationSeconds ? fmt(s.durationSeconds) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PRs table */}
        {prs.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 12 }}><FSectionHead kicker="ALL TIME" title="Personal Records"/></div>
            <div style={{ background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', gap: 12, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', borderBottom: `1px solid ${FG.line}`, textTransform: 'uppercase' }}>
                <span>EXERCISE</span>
                <span>WEIGHT</span>
                <span>REPS</span>
                <span>EST. 1RM</span>
                <span>DATE</span>
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
          </div>
        )}
      </div>
    </div>
  );
}
