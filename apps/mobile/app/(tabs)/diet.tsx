import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { FG } from '@/constants/theme';
import { FCard, FBadge, FProgress, FRing } from '@/components/ui';
import { useStore } from '@/store/useStore';
import { getDailyLog, logWater } from '@forge/common';

const WATER_GOAL_ML = 3000;
const KCAL_TARGET = 2650;
const MACRO_TARGETS = { protein: 180, carbs: 320, fat: 80 };

const MEAL_SLOTS = [
  { name: 'Breakfast', time: '08:30', emoji: '🍳' },
  { name: 'Lunch',     time: '13:00', emoji: '🍱' },
  { name: 'Snack',     time: '16:30', emoji: '🥗' },
  { name: 'Dinner',    time: '20:00', emoji: '🍽' },
];

function today() { return new Date().toISOString().slice(0, 10); }

export default function DietScreen() {
  const { user, todayLog, setTodayLog } = useStore();
  const [addingWater, setAddingWater] = useState(false);

  // Refresh log when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getDailyLog(user.uid, today())
        .then(log => { if (log) setTodayLog(log); })
        .catch(() => {});
    }, [user])
  );

  const kcal = todayLog?.totalKcal ?? 0;
  const protein = Math.round(todayLog?.totalProteinG ?? 0);
  const carbs = Math.round(todayLog?.totalCarbsG ?? 0);
  const fat = Math.round(todayLog?.totalFatG ?? 0);
  const waterMl = todayLog?.waterMl ?? 0;

  async function handleAddWater(ml: number) {
    if (!user) return;
    setAddingWater(true);
    try {
      await logWater(user.uid, today(), ml);
      const updated = await getDailyLog(user.uid, today());
      if (updated) setTodayLog(updated);
    } catch {
      Alert.alert('Erro', 'Não foi possível registar água.');
    } finally {
      setAddingWater(false);
    }
  }

  // Group logged meals by type
  const loggedMeals = todayLog?.meals ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, marginBottom: 14 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: FG.text, letterSpacing: -1 }}>Today's Plate</Text>
        <Text style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>
          {KCAL_TARGET} kcal target
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Calorie ring */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <FCard padding={20}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
              <FRing
                value={Math.min(kcal / KCAL_TARGET, 1)}
                size={108} stroke={9}
                label={kcal.toString()}
                sub={`of ${KCAL_TARGET}`}
              />
              <View style={{ flex: 1, gap: 12 }}>
                {[
                  { l: 'Protein', v: protein, t: MACRO_TARGETS.protein, c: FG.accent },
                  { l: 'Carbs',   v: carbs,   t: MACRO_TARGETS.carbs,   c: FG.warn },
                  { l: 'Fat',     v: fat,     t: MACRO_TARGETS.fat,     c: FG.ok },
                ].map(m => (
                  <View key={m.l}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: FG.mid }}>{m.l}</Text>
                      <Text style={{ fontSize: 11, color: FG.text }}>{m.v}/{m.t}g</Text>
                    </View>
                    <FProgress value={m.t > 0 ? Math.min(m.v / m.t, 1) : 0} color={m.c} height={4}/>
                  </View>
                ))}
              </View>
            </View>

            {/* Water tracker */}
            <View style={{ marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: 'rgba(94,209,154,0.06)', borderWidth: 1, borderColor: 'rgba(94,209,154,0.15)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>💧</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: FG.text }}>
                    {(waterMl / 1000).toFixed(1)} / {(WATER_GOAL_ML / 1000).toFixed(1)} L
                  </Text>
                </View>
                <FBadge tone={waterMl >= WATER_GOAL_ML ? 'ok' : 'warn'}>
                  {waterMl >= WATER_GOAL_ML ? 'Goal reached!' : `${Math.round((WATER_GOAL_ML - waterMl) / 1000 * 10) / 10}L to go`}
                </FBadge>
              </View>
              <FProgress value={Math.min(waterMl / WATER_GOAL_ML, 1)} color={FG.ok} height={4}/>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                {[250, 500, 750].map(ml => (
                  <TouchableOpacity
                    key={ml}
                    onPress={() => handleAddWater(ml)}
                    disabled={addingWater}
                    style={{ flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: FG.bg2, borderWidth: 1, borderColor: FG.line, alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 12, color: FG.text, fontWeight: '600' }}>+{ml}ml</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </FCard>
        </View>

        {/* Meal slots */}
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {MEAL_SLOTS.map((slot, i) => {
            const logged = loggedMeals.filter(m => m.name?.toLowerCase() === slot.name.toLowerCase());
            const slotKcal = logged.reduce((a, m) => a + (m.totalKcal ?? 0), 0);
            const slotP = logged.reduce((a, m) => a + (m.totalProteinG ?? 0), 0);
            const hasItems = logged.length > 0;

            return (
              <TouchableOpacity
                key={i}
                onPress={() => router.push({ pathname: '/(modals)/add-food', params: { meal: slot.name } })}
                style={{
                  backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line,
                  padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center',
                  opacity: (!hasItems && i > 1) ? 0.65 : 1,
                }}
              >
                <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: hasItems ? '#2a1a14' : FG.bg2, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22 }}>{slot.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Text style={{ fontWeight: '600', fontSize: 15, color: FG.text }}>{slot.name}</Text>
                    <Text style={{ fontSize: 11, color: FG.dim }}>{slot.time}</Text>
                  </View>
                  {hasItems ? (
                    <>
                      <Text style={{ fontSize: 12, color: FG.mid, marginTop: 2 }}>
                        {logged.flatMap(m => m.foods?.map(f => f.foodName) ?? [m.name]).slice(0, 2).join(' · ')}
                        {logged.length > 2 ? ` +${logged.length - 2}` : ''}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                        <FBadge tone="ok">{Math.round(slotKcal)} kcal</FBadge>
                        <FBadge tone="accent">{Math.round(slotP)}g P</FBadge>
                      </View>
                    </>
                  ) : (
                    <Text style={{ fontSize: 12, color: FG.accent, marginTop: 6, fontWeight: '600' }}>
                      + Tap to log food
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Remaining / remaining budget */}
        {kcal > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <FCard>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: FG.dim }}>Consumed</Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: FG.text }}>{kcal}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: FG.dim }}>Target</Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: FG.text }}>{KCAL_TARGET}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: FG.dim }}>Remaining</Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: kcal > KCAL_TARGET ? FG.err : FG.ok }}>
                    {Math.abs(KCAL_TARGET - kcal)}
                  </Text>
                  <Text style={{ fontSize: 9, color: FG.dim }}>{kcal > KCAL_TARGET ? 'over' : 'left'}</Text>
                </View>
              </View>
            </FCard>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(modals)/add-food')}
        style={{ position: 'absolute', bottom: 92, right: 18, width: 56, height: 56, borderRadius: 28, backgroundColor: FG.accent, alignItems: 'center', justifyContent: 'center', shadowColor: FG.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 }}
      >
        <Text style={{ fontSize: 28, color: '#1a0a00', fontWeight: '300', lineHeight: 30 }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
