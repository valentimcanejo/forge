import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { FG } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { getDailyLog, getRecentDailyLogs, removeMealEntry, addMealToLog } from '@forge/common';
import type { DailyLog, MealLog } from '@forge/common';

const KCAL_TARGET = 2650;
const MACRO_TARGETS = { protein: 180, carbs: 320, fat: 80 };

const MEAL_SLOTS = [
  { name: 'Breakfast', label: 'Pequeno-almoço', emoji: '🍳' },
  { name: 'Lunch',     label: 'Almoço',          emoji: '🍱' },
  { name: 'Snack',     label: 'Lanche',           emoji: '🥗' },
  { name: 'Dinner',    label: 'Jantar',            emoji: '🍽' },
];

const DAY_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function todayStr() { return new Date().toISOString().slice(0, 10); }

function buildDateStrip() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    return { iso, abbr: DAY_ABBR[d.getDay()], isToday: iso === todayStr() };
  });
}

function formatDateLabel(iso: string): string {
  if (iso === todayStr()) return 'Hoje';
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (iso === yesterday.toISOString().slice(0, 10)) return 'Ontem';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Meal section ──────────────────────────────────────────────────────────────
function MealSection({
  slot, entries, selectedDate, suggestion, repeating,
  onDelete, onRepeat,
}: {
  slot: typeof MEAL_SLOTS[0];
  entries: MealLog[];
  selectedDate: string;
  suggestion: { date: string; entries: MealLog[] } | null;
  repeating: boolean;
  onDelete: (id: string) => void;
  onRepeat: (entries: MealLog[]) => void;
}) {
  const slotKcal = entries.reduce((a, m) => a + m.totalKcal, 0);
  const slotP = entries.reduce((a, m) => a + m.totalProteinG, 0);

  return (
    <View style={{ marginBottom: 8 }}>
      {/* Section header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>{slot.emoji}</Text>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: FG.text }}>{slot.label}</Text>
        {slotKcal > 0 && (
          <Text style={{ fontSize: 12, color: FG.mid, marginRight: 12 }}>
            {Math.round(slotKcal)} kcal · {Math.round(slotP)}P
          </Text>
        )}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(modals)/add-food', params: { meal: slot.name, date: selectedDate } })}
          style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2.5} strokeLinecap="round">
            <Path d="M12 5v14M5 12h14"/>
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Food entries card */}
      <View style={{ backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, overflow: 'hidden' }}>
        {entries.length > 0 ? (
          entries.map((m, i) => {
            const food = m.foods?.[0];
            const name = food?.foodName ?? m.name;
            const serving = food?.servingLabel ?? '';
            const kcal = Math.round(m.totalKcal);
            return (
              <View
                key={m.id}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i < entries.length - 1 ? 1 : 0, borderBottomColor: FG.line }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: FG.text }} numberOfLines={1}>{name}</Text>
                  <Text style={{ fontSize: 11, color: FG.dim, marginTop: 2 }}>
                    {[serving, `${kcal} kcal`].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 5, marginRight: 10 }}>
                  {m.totalProteinG > 0 && <Text style={{ fontSize: 10, color: FG.accent, fontWeight: '600' }}>{Math.round(m.totalProteinG)}P</Text>}
                  {m.totalCarbsG > 0 && <Text style={{ fontSize: 10, color: FG.warn, fontWeight: '600' }}>{Math.round(m.totalCarbsG)}C</Text>}
                  {m.totalFatG > 0 && <Text style={{ fontSize: 10, color: FG.ok, fontWeight: '600' }}>{Math.round(m.totalFatG)}G</Text>}
                </View>
                <TouchableOpacity onPress={() => onDelete(m.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth={2} strokeLinecap="round">
                    <Path d="M18 6L6 18M6 6l12 12"/>
                  </Svg>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
            <Text style={{ fontSize: 12, color: FG.dim }}>Nada registado</Text>

            {/* Suggestion row */}
            {suggestion && (
              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: FG.line, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: FG.dim, marginBottom: 2 }}>
                    De {formatDateLabel(suggestion.date)}:
                  </Text>
                  <Text style={{ fontSize: 12, color: FG.mid }} numberOfLines={1}>
                    {suggestion.entries
                      .map(e => e.foods?.[0]?.foodName ?? e.name)
                      .join(' · ')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onRepeat(suggestion.entries)}
                  disabled={repeating}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: 'rgba(249,115,22,0.1)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)' }}
                >
                  <Text style={{ fontSize: 12, color: repeating ? FG.dim : FG.accent, fontWeight: '600' }}>
                    {repeating ? '…' : 'Repetir'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DietScreen() {
  const { user, todayLog, setTodayLog } = useStore();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [log, setLog] = useState<DailyLog | null>(todayLog);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [repeating, setRepeating] = useState<string | null>(null);

  const dateStrip = buildDateStrip();

  // Load recent logs once for suggestions
  useEffect(() => {
    if (!user) return;
    getRecentDailyLogs(user.uid, 14).then(setRecentLogs).catch(() => {});
  }, [user]);

  // Refresh current day's log on focus
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getDailyLog(user.uid, selectedDate)
        .then(fresh => {
          setLog(fresh);
          if (selectedDate === todayStr()) setTodayLog(fresh);
        })
        .catch(() => {});
    }, [selectedDate, user])
  );

  function selectDate(iso: string) {
    setSelectedDate(iso);
    if (!user) return;
    getDailyLog(user.uid, iso)
      .then(fresh => {
        setLog(fresh);
        if (iso === todayStr()) setTodayLog(fresh);
      })
      .catch(() => {});
  }

  function getSuggestion(slotName: string): { date: string; entries: MealLog[] } | null {
    const lower = slotName.toLowerCase();
    const sorted = [...recentLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (const pastLog of sorted) {
      if (pastLog.date === selectedDate) continue;
      const entries = pastLog.meals.filter(m => m.name.toLowerCase() === lower);
      if (entries.length > 0) return { date: pastLog.date, entries };
    }
    return null;
  }

  async function handleDelete(mealLogId: string) {
    if (!user) return;
    setLog(prev => {
      if (!prev) return prev;
      const meals = prev.meals.filter(m => m.id !== mealLogId);
      const totals = meals.reduce(
        (acc, m) => ({
          totalKcal: acc.totalKcal + m.totalKcal,
          totalProteinG: acc.totalProteinG + m.totalProteinG,
          totalCarbsG: acc.totalCarbsG + m.totalCarbsG,
          totalFatG: acc.totalFatG + m.totalFatG,
        }),
        { totalKcal: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 }
      );
      return { ...prev, meals, ...totals };
    });
    await removeMealEntry(user.uid, selectedDate, mealLogId).catch(() => {});
  }

  async function handleRepeat(slotName: string, entries: MealLog[]) {
    if (!user) return;
    setRepeating(slotName);
    try {
      for (const meal of entries) {
        const newMeal: MealLog = {
          ...meal,
          id: `${meal.name.toLowerCase()}_repeat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        };
        await addMealToLog(user.uid, selectedDate, newMeal);
      }
      const fresh = await getDailyLog(user.uid, selectedDate);
      setLog(fresh);
      if (selectedDate === todayStr()) setTodayLog(fresh);
    } catch {
      // fallback: user can add manually
    } finally {
      setRepeating(null);
    }
  }

  const kcal = Math.round(log?.totalKcal ?? 0);
  const protein = Math.round(log?.totalProteinG ?? 0);
  const carbs = Math.round(log?.totalCarbsG ?? 0);
  const fat = Math.round(log?.totalFatG ?? 0);
  const kcalPct = Math.min(kcal / KCAL_TARGET, 1);
  const remaining = KCAL_TARGET - kcal;
  const meals = log?.meals ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingHorizontal: 20, paddingTop: 8, marginBottom: 14 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>Dieta</Text>
        <Text style={{ fontSize: 13, color: FG.dim }}>{formatDateLabel(selectedDate)}</Text>
      </View>

      {/* Date strip — só abreviação, sem número */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 16 }}
      >
        {dateStrip.map(d => {
          const isSelected = d.iso === selectedDate;
          return (
            <TouchableOpacity
              key={d.iso}
              onPress={() => selectDate(d.iso)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
                backgroundColor: isSelected ? FG.accent : FG.bg1,
                borderWidth: isSelected ? 0 : 1, borderColor: FG.line,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#1a0a00' : FG.mid }}>{d.abbr}</Text>
              {d.isToday && !isSelected && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: FG.accent, marginTop: 3 }}/>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Macro summary */}
        <View style={{ backgroundColor: FG.bg1, borderRadius: 16, borderWidth: 1, borderColor: FG.line, padding: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={{ fontSize: 26, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>{kcal}</Text>
              <Text style={{ fontSize: 13, color: FG.dim }}>/ {KCAL_TARGET} kcal</Text>
            </View>
            <Text style={{ fontSize: 13, color: remaining >= 0 ? FG.ok : FG.err, fontWeight: '600' }}>
              {remaining >= 0 ? `${remaining} restantes` : `${Math.abs(remaining)} acima`}
            </Text>
          </View>
          <View style={{ height: 5, backgroundColor: FG.bg2, borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
            <View style={{ width: `${kcalPct * 100}%`, height: '100%', backgroundColor: kcal > KCAL_TARGET ? FG.err : FG.accent, borderRadius: 3 }}/>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { label: 'P', value: protein, target: MACRO_TARGETS.protein, color: FG.accent },
              { label: 'C', value: carbs,   target: MACRO_TARGETS.carbs,   color: FG.warn },
              { label: 'G', value: fat,     target: MACRO_TARGETS.fat,     color: FG.ok },
            ].map(m => (
              <View key={m.label} style={{ flex: 1, backgroundColor: FG.bg2, borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: m.color, fontWeight: '700', letterSpacing: 0.5 }}>{m.label}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: FG.text, marginTop: 2 }}>{m.value}g</Text>
                <Text style={{ fontSize: 10, color: FG.dim, marginTop: 1 }}>de {m.target}g</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Meal sections */}
        {MEAL_SLOTS.map(slot => {
          const entries = meals.filter(m => m.name?.toLowerCase() === slot.name.toLowerCase());
          const suggestion = entries.length === 0 ? getSuggestion(slot.name) : null;
          return (
            <MealSection
              key={slot.name}
              slot={slot}
              entries={entries}
              selectedDate={selectedDate}
              suggestion={suggestion}
              repeating={repeating === slot.name}
              onDelete={handleDelete}
              onRepeat={entries => handleRepeat(slot.name, entries)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
