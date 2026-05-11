'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FCard, FBadge, FSparkline, FSectionHead, FButton, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { getProgressHistory, getAllPRs } from '@forge/common';
import type { ProgressEntry, PRRecord } from '@forge/common';

function fmt(n: number | undefined) {
  if (n == null) return '—';
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}

function dateDiff(entries: ProgressEntry[], key: keyof ProgressEntry): string {
  const vals = entries.map(e => e[key] as number | undefined).filter((v): v is number => v != null);
  if (vals.length < 2) return '';
  const diff = vals[vals.length - 1] - vals[0];
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`;
}

export default function ProgressPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Body');
  const tabs = ['Body', 'Lifts', 'Photos'];
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [prs, setPRs] = useState<PRRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getProgressHistory(user.uid, 12), getAllPRs(user.uid)])
      .then(([hist, allPRs]) => { setEntries(hist); setPRs(allPRs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const weightTrend = entries.filter(e => e.weightKg != null).map(e => e.weightKg as number);
  const latestEntry = entries[entries.length - 1];
  const firstEntry = entries[0];
  const latestWeight = latestEntry?.weightKg;
  const weightDiff = latestWeight != null && firstEntry?.weightKg != null ? latestWeight - firstEntry.weightKg : null;
  const weeksIn = entries.length > 0
    ? Math.round((Date.now() - new Date(entries[0].date).getTime()) / (7 * 86400000))
    : 0;
  const photos = entries.filter(e => e.photoUrl);

  const MEASURES = [
    { label: 'Weight',   key: 'weightKg'   as const, unit: 'kg' },
    { label: 'Body fat', key: 'bodyFatPct' as const, unit: '%' },
    { label: 'Chest',    key: 'chestCm'   as const, unit: 'cm' },
    { label: 'Waist',    key: 'waistCm'   as const, unit: 'cm' },
    { label: 'Arms',     key: 'armsCm'    as const, unit: 'cm' },
    { label: 'Thighs',   key: 'thighsCm'  as const, unit: 'cm' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>{t('progress.title')}</h1>
          <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>
            {weeksIn > 0 ? `${weeksIn} weeks tracked` : 'Start logging to see trends'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 16px', borderRadius: 8,
              background: activeTab === tab ? FG.bg2 : 'transparent',
              border: `1px solid ${activeTab === tab ? FG.lineStrong : 'transparent'}`,
              color: activeTab === tab ? FG.text : FG.mid,
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
            }}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Body' && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 18 }}>
              {MEASURES.map(m => {
                const latest = latestEntry?.[m.key] as number | undefined;
                const diff = dateDiff(entries, m.key);
                const isPositive = diff.startsWith('+');
                return (
                  <FCard key={m.label} padding={16}>
                    <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{m.label.toUpperCase()}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                      <span className="num" style={{ fontSize: 22 }}>{fmt(latest)}</span>
                      <span style={{ color: FG.mid, fontSize: 11 }}>{m.unit}</span>
                    </div>
                    {diff && (
                      <div style={{ fontSize: 11, marginTop: 4, color: isPositive ? FG.accent : FG.ok, fontFamily: 'JetBrains Mono, monospace' }}>{diff}</div>
                    )}
                  </FCard>
                );
              })}
            </div>

            {/* Weight chart */}
            <FCard padding={20} style={{ marginBottom: 14 }}>
              <FSectionHead kicker="BODY WEIGHT" title={weightTrend.length >= 2 ? `${weeksIn} week trend` : 'Weight trend'}/>
              {weightTrend.length >= 2 ? (
                <>
                  <FSparkline data={weightTrend} w={900} h={160}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
                    <span>{firstEntry?.weightKg?.toFixed(1)} kg · {new Date(firstEntry!.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                    {weightDiff != null && (
                      <span style={{ color: weightDiff <= 0 ? FG.ok : FG.warn }}>{weightDiff >= 0 ? '+' : ''}{weightDiff.toFixed(1)} kg</span>
                    )}
                    <span style={{ color: FG.accent }}>{latestEntry?.weightKg?.toFixed(1)} kg · {new Date(latestEntry!.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                  </div>
                </>
              ) : (
                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: FG.dim }}>
                  <div style={{ fontSize: 32 }}>📊</div>
                  <div style={{ fontSize: 13 }}>No weight data yet — log progress entries to see trends</div>
                </div>
              )}
            </FCard>
          </>
        )}

        {activeTab === 'Lifts' && (
          <div>
            {prs.length === 0 && !loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12, color: FG.dim }}>
                <div style={{ fontSize: 48 }}>🏋️</div>
                <h3 style={{ fontSize: 18, color: FG.text }}>No PRs yet</h3>
                <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 360 }}>Complete workouts on mobile to automatically track your personal records here.</p>
              </div>
            ) : (
              <div style={{ background: FG.bg1, borderRadius: 14, border: `1px solid ${FG.line}`, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', gap: 12, fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', borderBottom: `1px solid ${FG.line}`, textTransform: 'uppercase' }}>
                  <span>EXERCISE</span>
                  <span>WEIGHT</span>
                  <span>REPS</span>
                  <span>EST. 1RM</span>
                  <span>DATE</span>
                </div>
                {prs
                  .slice()
                  .sort((a, b) => b.estimatedOneRMKg - a.estimatedOneRMKg)
                  .map((pr, i, arr) => (
                    <div key={`${pr.exerciseId}-${i}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', gap: 12, alignItems: 'center', borderBottom: i < arr.length - 1 ? `1px solid ${FG.line}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2a1a14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏆</div>
                        <span style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{pr.exerciseName}</span>
                      </div>
                      <span className="num" style={{ fontSize: 15, color: FG.accent }}>{pr.maxWeightKg} kg</span>
                      <span className="mono" style={{ fontSize: 12, color: FG.mid }}>×{pr.reps}</span>
                      <span className="num" style={{ fontSize: 14 }}>~{Math.round(pr.estimatedOneRMKg)} kg</span>
                      <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
                        {pr.achievedAt ? new Date(pr.achievedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Photos' && (
          <div>
            {photos.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12, color: FG.dim }}>
                <div style={{ fontSize: 48 }}>📸</div>
                <h3 style={{ fontSize: 18, color: FG.text }}>No photos yet</h3>
                <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 360 }}>Log progress entries with photos from the mobile app to start your visual timeline.</p>
              </div>
            ) : (
              <div>
                {photos.length >= 2 && (
                  <FCard padding={20} style={{ marginBottom: 18 }}>
                    <FSectionHead kicker="COMPARE" title="First vs Latest"/>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[photos[0], photos[photos.length - 1]].map((p, i) => (
                        <div key={i}>
                          <div style={{ aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden', background: FG.bg2, position: 'relative' }}>
                            <img src={p.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '3px 8px', fontSize: 10, color: FG.text, letterSpacing: '0.1em' }}>
                              {i === 0 ? 'FIRST' : 'LATEST'}
                            </div>
                          </div>
                          <div style={{ marginTop: 6, fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
                            {new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FCard>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {photos.map((p, i) => (
                    <div key={i}>
                      <div style={{ aspectRatio: '3/4', borderRadius: 12, overflow: 'hidden', background: FG.bg2, position: 'relative' }}>
                        <img src={p.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>
                          {new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()}
                        </span>
                        {p.photoAngle && <span style={{ fontSize: 10, color: FG.mid, fontFamily: 'JetBrains Mono, monospace', textTransform: 'capitalize' }}>{p.photoAngle}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
