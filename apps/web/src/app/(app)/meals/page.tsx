'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FCard, FBadge, FProgress, FRing, FSectionHead, FButton, FG } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import {
  logWater, getDailyLog, addMealToLog, searchFoodsAPI, calcFoodMacros, COMMON_FOODS,
} from '@forge/common';
import type { Food, MealLog, MealType, FoodEntry } from '@forge/common';

const KCAL_TARGET = 2650;
const MACRO_TARGETS = { protein: 180, carbs: 320, fat: 80 };
const WATER_GOAL_ML = 3000;

const MEAL_SLOTS = [
  { name: 'Breakfast', time: '08:30', emoji: '🍳' },
  { name: 'Lunch',     time: '13:00', emoji: '🍱' },
  { name: 'Snack',     time: '16:30', emoji: '🥗' },
  { name: 'Dinner',    time: '20:00', emoji: '🍽' },
];

const MEAL_TYPE_MAP: Record<string, MealType> = {
  breakfast: 'breakfast', lunch: 'lunch', snack: 'snack', dinner: 'dinner',
};

function mealTime(name: string) {
  const t: Record<string, string> = { Breakfast: '08:30', Lunch: '13:00', Snack: '16:30', Dinner: '20:00' };
  return t[name] ?? '';
}

function today() { return new Date().toISOString().slice(0, 10); }

// ── Food Log Modal ────────────────────────────────────────────────────────────

function FoodLogModal({
  mealName,
  onClose,
  onLogged,
}: {
  mealName: string;
  onClose: () => void;
  onLogged: () => void;
}) {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>(COMMON_FOODS);
  const [searching, setSearching] = useState(false);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { foods } = await searchFoodsAPI(query || 'protein');
        setResults(foods);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  async function logFood(food: Food) {
    if (!user || loggingId) return;
    setLoggingId(food.id);
    try {
      const serving = food.servingSuggestionG ?? 100;
      const macros = calcFoodMacros(food, serving);
      const entry: FoodEntry = {
        foodId: food.id,
        foodName: food.name,
        ...(food.brand ? { brand: food.brand } : {}),
        servingG: serving,
        servingLabel: food.servingLabel ?? `${serving}g`,
        kcal: macros.kcal,
        proteinG: macros.proteinG,
        carbsG: macros.carbsG,
        fatG: macros.fatG,
        source: food.source,
      };
      const mealLog: MealLog = {
        id: `${mealName.toLowerCase()}_${food.id}_${Date.now()}`,
        type: MEAL_TYPE_MAP[mealName.toLowerCase()] ?? 'lunch',
        name: mealName,
        scheduledTime: mealTime(mealName),
        foods: [entry],
        totalKcal: macros.kcal,
        totalProteinG: macros.proteinG,
        totalCarbsG: macros.carbsG,
        totalFatG: macros.fatG,
        completed: false,
      };
      await addMealToLog(user.uid, today(), mealLog);
      onLogged();
    } finally {
      setLoggingId(null);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(11,15,20,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ width: 500, maxHeight: '76vh', background: FG.bg1, border: `1px solid ${FG.lineStrong}`, borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{mealName} · {mealTime(mealName)}</div>
            <div style={{ fontSize: 20, fontFamily: 'DM Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>Log food</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: FG.dim, cursor: 'pointer', fontSize: 20, padding: '0 4px', lineHeight: 1 }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${FG.line}` }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke={FG.dim} strokeWidth="1.5"/>
              <path d="M10 10l3 3" stroke={FG.dim} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search foods…"
              style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, background: FG.bg2, border: `1px solid ${FG.line}`, borderRadius: 10, color: FG.text, fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ fontSize: 10, color: FG.dim, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
            {searching ? 'Searching…' : `${results.length} items`}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {results.map(food => {
            const serving = food.servingSuggestionG ?? 100;
            const macros = calcFoodMacros(food, serving);
            const isLogging = loggingId === food.id;
            return (
              <div
                key={food.id}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', borderBottom: `1px solid ${FG.line}` }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: FG.bg2, border: `1px solid ${FG.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🍽</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</div>
                  {food.brand && <div style={{ fontSize: 11, color: FG.dim, marginTop: 1 }}>{food.brand} · {food.servingLabel ?? `${serving}g`}</div>}
                  <div style={{ fontSize: 11, color: FG.mid, marginTop: 3, display: 'flex', gap: 8 }}>
                    <span>{macros.kcal} kcal</span>
                    <span style={{ color: FG.accent }}>{macros.proteinG}P</span>
                    <span style={{ color: FG.warn }}>{macros.carbsG}C</span>
                    <span style={{ color: FG.ok }}>{macros.fatG}F</span>
                  </div>
                </div>
                <button
                  onClick={() => logFood(food)}
                  disabled={!!loggingId}
                  style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: isLogging ? FG.dim : FG.accent, fontSize: 18, cursor: loggingId ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  {isLogging ? '…' : '+'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MealsPage() {
  const { t } = useTranslation();
  const { user, todayLog, setTodayLog } = useAuthStore();
  const [addingWater, setAddingWater] = useState(false);
  const [logModalMeal, setLogModalMeal] = useState<string | null>(null);

  // Refresh todayLog when page mounts
  useEffect(() => {
    if (!user) return;
    getDailyLog(user.uid, today())
      .then(log => { if (log) setTodayLog(log); })
      .catch(() => {});
  }, [user, setTodayLog]);

  const refreshLog = useCallback(async () => {
    if (!user) return;
    const updated = await getDailyLog(user.uid, today());
    if (updated) setTodayLog(updated);
    setLogModalMeal(null);
  }, [user, setTodayLog]);

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
          <div style={{ fontSize: 13, color: FG.mid, marginTop: 2 }}>{t('diet.kcalTarget', { kcal: KCAL_TARGET })}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <FButton size="sm" onClick={() => setLogModalMeal('Lunch')}>{t('diet.logFood')}</FButton>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, marginBottom: 18 }}>
          {/* Macro ring */}
          <FCard padding={20}>
            <FSectionHead kicker={t('diet.overview')} title={t('diet.dailyTotals')}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <FRing
                value={Math.min(kcal / KCAL_TARGET, 1)}
                size={130} stroke={11}
                label={kcal.toString()}
                sub={t('diet.ofTarget', { val: KCAL_TARGET })}
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
                  { l: t('diet.consumed'), v: kcal.toString() },
                  { l: t('diet.target'), v: KCAL_TARGET.toString() },
                  { l: remaining >= 0 ? t('diet.remaining') : t('diet.over'), v: Math.abs(remaining).toString(), color: remaining >= 0 ? FG.ok : FG.err },
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
            <FSectionHead kicker={t('diet.waterKicker')} title={t('diet.hydration')}/>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span className="num" style={{ fontSize: 38 }}>{(waterMl / 1000).toFixed(1)}</span>
              <span style={{ color: FG.mid }}>/ {(WATER_GOAL_ML / 1000).toFixed(1)} L</span>
              {waterMl >= WATER_GOAL_ML && <FBadge tone="ok">{t('diet.waterGoal')}</FBadge>}
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
            <FSectionHead kicker={t('diet.remainingKicker')} title={t('diet.budgetTitle')}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {[
                { l: t('diet.calories'), v: Math.max(0, KCAL_TARGET - kcal), u: 'kcal', c: FG.text },
                { l: t('diet.protein'),  v: Math.max(0, MACRO_TARGETS.protein - protein), u: 'g', c: FG.accent },
                { l: t('diet.carbs'),    v: Math.max(0, MACRO_TARGETS.carbs - carbs), u: 'g', c: FG.warn },
                { l: t('diet.fat'),      v: Math.max(0, MACRO_TARGETS.fat - fat), u: 'g', c: FG.ok },
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
          <div style={{ marginBottom: 12 }}><FSectionHead kicker={t('diet.mealsKicker')} title={t('diet.todaysLog')}/></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MEAL_SLOTS.map((slot) => {
              const logged = meals.filter(m => m.name?.toLowerCase() === slot.name.toLowerCase());
              const slotKcal = logged.reduce((a, m) => a + (m.totalKcal ?? 0), 0);
              const slotP = logged.reduce((a, m) => a + (m.totalProteinG ?? 0), 0);
              const hasItems = logged.length > 0;

              return (
                <div
                  key={slot.name}
                  onClick={() => setLogModalMeal(slot.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <FCard padding={16} style={{ opacity: !hasItems ? 0.65 : 1, transition: 'opacity 0.15s' }}>
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
                            {logged.length > 3 ? ` ${t('diet.plusMore', { n: logged.length - 3 })}` : ''}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: FG.accent, marginTop: 3, fontWeight: 600 }}>+ {t('diet.logFood')}</div>
                        )}
                      </div>
                      {hasItems && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div className="num" style={{ fontSize: 18 }}>{Math.round(slotKcal)}</div>
                            <div style={{ fontSize: 10, color: FG.dim, fontFamily: 'JetBrains Mono, monospace' }}>{t('diet.kcalLabel')}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <FBadge tone="accent">{Math.round(slotP)}P</FBadge>
                          </div>
                        </div>
                      )}
                    </div>
                  </FCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {logModalMeal && (
        <FoodLogModal
          mealName={logModalMeal}
          onClose={() => setLogModalMeal(null)}
          onLogged={refreshLog}
        />
      )}
    </div>
  );
}
