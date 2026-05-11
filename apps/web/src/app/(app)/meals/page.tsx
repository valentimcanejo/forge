'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FCard, FBadge, FProgress, FRing, FSectionHead, FButton, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { logWater, getDailyLog } from '@forge/common';

const KCAL_TARGET = 2650;
const MACRO_TARGETS = { protein: 180, carbs: 320, fat: 80 };
const WATER_GOAL_ML = 3000;

const MEAL_SLOTS = [
  { name: 'Breakfast', time: '08:30', emoji: '🍳' },
  { name: 'Lunch',     time: '13:00', emoji: '🍱' },
  { name: 'Snack',     time: '16:30', emoji: '🥗' },
  { name: 'Dinner',    time: '20:00', emoji: '🍽' },
];

function today() { return new Date().toISOString().slice(0, 10); }

export default function MealsPage() {
  const { t } = useTranslation();
  const { user, todayLog, setTodayLog } = useAuthStore();
  const [addingWater, setAddingWater] = useState(false);

  const kcal = Math.round(todayLog?.totalKcal ?? 0);
  const protein = Math.round(todayLog?.totalProteinG ?? 0);
  const carbs = Math.round(todayLog?.totalCarbsG ?? 0);
  const fat = Math.round(todayLog?.totalFatG ?? 0);
  const waterMl = todayLog?.waterMl ?? 0;
  const meals = todayLog?.meals ?? [];

  const remaining = KCAL_TARGET - kcal;

  async function handleAddWater(ml: number) {
    if (!user) return;
    setAddingWater(true);
    try {
      await logWater(user.uid, today(), ml);
      const updated = await getDailyLog(user.uid, today());
      if (updated) setTodayLog(updated);
    } finally {
      setAddingWater(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>{t('diet.todaysPlate')}</h1>
          <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>{KCAL_TARGET} kcal target</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <FButton size="sm" onClick={() => window.location.href = '/meals'}>{t('diet.logFood')}</FButton>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
          {/* Macro ring */}
          <FCard padding={20}>
            <FSectionHead kicker="OVERVIEW" title="Daily totals"/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <FRing
                value={Math.min(kcal / KCAL_TARGET, 1)}
                size={130} stroke={11}
                label={kcal.toString()}
                sub={`of ${KCAL_TARGET}`}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { l: t('diet.protein'), v: protein, t2: MACRO_TARGETS.protein, c: FG.accent },
                  { l: t('diet.carbs'),   v: carbs,   t2: MACRO_TARGETS.carbs,   c: FG.warn },
                  { l: t('diet.fat'),     v: fat,     t2: MACRO_TARGETS.fat,     c: FG.ok },
                ].map(m => (
                  <div key={m.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: FG.mid }}>{m.l}</span>
                      <span className="mono" style={{ color: FG.text }}>{m.v}<span style={{ color: FG.dim }}>/{m.t2}g</span></span>
                    </div>
                    <FProgress value={m.t2 > 0 ? Math.min(m.v / m.t2, 1) : 0} color={m.c} height={5}/>
                  </div>
                ))}
              </div>
            </div>

            {kcal > 0 && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: remaining >= 0 ? 'rgba(94,209,154,0.06)' : 'rgba(226,109,109,0.06)', border: `1px solid ${remaining >= 0 ? 'rgba(94,209,154,0.2)' : 'rgba(226,109,109,0.2)'}`, display: 'flex', justifyContent: 'space-around' }}>
                {[
                  { l: 'Consumed', v: kcal.toString() },
                  { l: 'Target', v: KCAL_TARGET.toString() },
                  { l: remaining >= 0 ? 'Remaining' : 'Over', v: Math.abs(remaining).toString(), color: remaining >= 0 ? FG.ok : FG.err },
                ].map(s => (
                  <div key={s.l} style={{ textAlign: 'center' }}>
                    <div className="num" style={{ fontSize: 20, color: s.color }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            )}
          </FCard>

          {/* Water */}
          <FCard padding={18}>
            <FSectionHead kicker="WATER" title={t('diet.hydration')}/>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span className="num" style={{ fontSize: 38 }}>{(waterMl / 1000).toFixed(1)}</span>
              <span style={{ color: FG.mid }}>/ {(WATER_GOAL_ML / 1000).toFixed(1)} L</span>
              {waterMl >= WATER_GOAL_ML && <FBadge tone="ok">Goal!</FBadge>}
            </div>
            <FProgress value={Math.min(waterMl / WATER_GOAL_ML, 1)} color={FG.ok} height={5}/>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {[250, 500, 750].map(ml => (
                <button
                  key={ml}
                  onClick={() => handleAddWater(ml)}
                  disabled={addingWater}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: FG.bg2, border: `1px solid ${FG.line}`, color: FG.text, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: addingWater ? 0.5 : 1 }}
                >
                  +{ml}ml
                </button>
              ))}
            </div>
          </FCard>

          {/* Remaining macros */}
          <FCard padding={18}>
            <FSectionHead kicker="REMAINING" title="Budget"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {[
                { l: 'Calories', v: Math.max(0, KCAL_TARGET - kcal), u: 'kcal', c: FG.text },
                { l: 'Protein',  v: Math.max(0, MACRO_TARGETS.protein - protein), u: 'g', c: FG.accent },
                { l: 'Carbs',    v: Math.max(0, MACRO_TARGETS.carbs - carbs), u: 'g', c: FG.warn },
                { l: 'Fat',      v: Math.max(0, MACRO_TARGETS.fat - fat), u: 'g', c: FG.ok },
              ].map(m => (
                <div key={m.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: FG.mid }}>{m.l}</span>
                  <span className="mono" style={{ fontSize: 14, color: m.c, fontWeight: 600 }}>{m.v} <span style={{ fontSize: 10, color: FG.dim }}>{m.u}</span></span>
                </div>
              ))}
            </div>
          </FCard>
        </div>

        {/* Meal slots */}
        <div>
          <div style={{ marginBottom: 12 }}><FSectionHead kicker="MEALS · TODAY" title="Today's log"/></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MEAL_SLOTS.map((slot) => {
              const logged = meals.filter(m => m.name?.toLowerCase() === slot.name.toLowerCase());
              const slotKcal = logged.reduce((a, m) => a + (m.totalKcal ?? 0), 0);
              const slotP = logged.reduce((a, m) => a + (m.totalProteinG ?? 0), 0);
              const hasItems = logged.length > 0;

              return (
                <FCard key={slot.name} padding={16} style={{ opacity: !hasItems ? 0.65 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: hasItems ? '#2a1a14' : FG.bg2 }}>
                      {slot.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <h3 style={{ fontSize: 15, fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>{slot.name}</h3>
                        <span style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{slot.time}</span>
                      </div>
                      {hasItems ? (
                        <div style={{ fontSize: 12, color: FG.mid, marginTop: 3 }}>
                          {logged.flatMap(m => m.foods?.map(f => f.foodName) ?? [m.name]).slice(0, 3).join(' · ')}
                          {logged.length > 3 ? ` +${logged.length - 3} more` : ''}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: FG.accent, marginTop: 3 }}>Log from mobile app</div>
                      )}
                    </div>
                    {hasItems && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="num" style={{ fontSize: 18 }}>{Math.round(slotKcal)}</div>
                          <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>KCAL</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <FBadge tone="accent">{Math.round(slotP)}P</FBadge>
                        </div>
                      </div>
                    )}
                  </div>
                </FCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
