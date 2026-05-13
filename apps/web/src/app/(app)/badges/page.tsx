'use client';
import { useTranslation } from 'react-i18next';
import { FCard, FBadge, FProgress, FStat, FRing, FSectionHead, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { getLevelForXP, getXPProgress, getXPToNextLevel, BADGES } from '@forge/common';

const RANKING = [
  { rank: 1, name: 'Ana M.', xp: 4280, you: false },
  { rank: 2, name: 'Carlos S.', xp: 3920, you: false },
  { rank: 3, name: 'Diego R.', xp: 2140, you: true },
  { rank: 4, name: 'Marina K.', xp: 1980, you: false },
  { rank: 5, name: 'Joao P.', xp: 1820, you: false },
];

export default function BadgesPage() {
  const { t } = useTranslation();
  const { gamification } = useAuthStore();

  const xp = gamification?.xp ?? 0;
  const level = getLevelForXP(xp);
  const xpProgress = getXPProgress(xp);
  const xpToNext = getXPToNextLevel(xp);
  const streak = gamification?.streakDays ?? 0;
  const earned = gamification?.badgesEarned ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${FG.line}`, flexShrink: 0 }}>
        <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>{t('gamification.title')}</h1>
        <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>{t('gamification.subtitle')}</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Level header */}
        <div className="heat" style={{ borderRadius: 18, padding: 24, border: `1px solid ${FG.line}`, position: 'relative', overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <FRing value={xpProgress} size={104} stroke={9} label={`${Math.round(xpProgress * 100)}%`} sub={`LVL ${level.level}`}/>
              <div>
                <div style={{ fontSize: 11, color: FG.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>
                  {t('gamification.level', { n: level.level })} · {level.name.toUpperCase()}
                </div>
                <h2 style={{ fontSize: 32, marginTop: 6 }}>{xp.toLocaleString()} <span style={{ color: FG.dim, fontWeight: 500, fontSize: 18 }}>{t('gamification.xp')}</span></h2>
                <div style={{ fontSize: 13, color: FG.mid, marginTop: 4 }}>
                  {t('gamification.xpToNextLevel', { xp: xpToNext })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { v: String(streak), l: t('gamification.streak') },
                { v: String(earned.length), l: t('gamification.badges') },
                { v: String(gamification?.totalPRs ?? 0), l: t('gamification.prs') },
              ].map(s => (
                <div key={s.l} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${FG.line}`, borderRadius: 12, padding: '14px 22px', textAlign: 'center', minWidth: 80 }}>
                  <div className="num" style={{ fontSize: 24 }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          {/* Badge grid */}
          <div>
            <FSectionHead kicker={t('gamification.badgesEarned', { earned: earned.length, locked: BADGES.length - earned.length })} title={t('gamification.badges')}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {BADGES.map((b) => {
                const isEarned = earned.includes(b.id);
                const isRare = b.rarity !== 'common';
                const isGlow = b.id === 'iron_forger' && isEarned;
                return (
                  <div key={b.id} style={{
                    aspectRatio: '1', borderRadius: 16, padding: 14,
                    background: isEarned ? (isRare ? 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(240,184,110,0.06))' : FG.bg1) : 'rgba(255,255,255,0.02)',
                    border: isEarned ? (isRare ? '1px solid rgba(249,115,22,0.4)' : `1px solid ${FG.line}`) : `1px dashed ${FG.line}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden', opacity: isEarned ? 1 : 0.45,
                  }}>
                    {isGlow && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(249,115,22,0.3), transparent 70%)', animation: 'pulseGlow 2s infinite' }}/>}
                    <div style={{ fontSize: 32, position: 'relative', filter: isEarned ? 'none' : 'grayscale(1)', marginBottom: 8 }}>{b.icon}</div>
                    <div style={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: isEarned ? FG.text : FG.dim, textAlign: 'center', position: 'relative' }}>
                      {t(b.nameKey)}
                    </div>
                    <div style={{ fontSize: 9, color: isEarned ? FG.accent : FG.dim, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, position: 'relative' }}>
                      {isEarned ? t('gamification.earned') : `+${b.xpReward} XP`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ranking + mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FCard padding={18}>
              <FSectionHead kicker={t('gamification.weeklyMission')} title="3 PRs in 7 days"/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <FStat value="2" unit="/ 3" size="sm"/>
                <FBadge tone="warn">+150 XP</FBadge>
              </div>
              <FProgress value={0.66} color={FG.warn}/>
              <div style={{ fontSize: 11, color: FG.dim, marginTop: 8, fontFamily: 'Inter, sans-serif' }}>3 days left · {t('gamification.keepPushing')}</div>
            </FCard>

            <FCard padding={18}>
              <FSectionHead kicker={t('gamification.thisMonth')} title={t('gamification.ranking')}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RANKING.map(r => (
                  <div key={r.rank} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8,
                    background: r.you ? 'rgba(249,115,22,0.1)' : 'transparent',
                    border: r.you ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
                  }}>
                    <span className="num" style={{ width: 22, fontSize: 13, color: r.rank === 1 ? FG.accent : r.you ? FG.accent : FG.mid }}>{r.rank}</span>
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: FG.bg2, border: `1px solid ${FG.line}` }}/>
                    <span style={{ flex: 1, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: r.you ? 700 : 500, color: r.you ? FG.text : FG.mid }}>
                      {r.name}{r.you && <span style={{ color: FG.accent, marginLeft: 6, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{t('gamification.you')}</span>}
                    </span>
                    <span className="mono" style={{ fontSize: 12, color: r.you ? FG.accent : FG.text }}>{r.xp.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </FCard>
          </div>
        </div>
      </div>
    </div>
  );
}
