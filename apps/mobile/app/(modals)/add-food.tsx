import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { FG } from '@/constants/theme';
import { FButton, FBadge } from '@/components/ui';
import { searchFoodsAPI, getUserFoods, createCustomFood, addMealToLog, getDailyLog, COMMON_FOODS, calcFoodMacros } from '@forge/common';
import type { Food, MealLog, FoodEntry, MealType } from '@forge/common';
import { useStore } from '@/store/useStore';

type Screen = 'search' | 'scan' | 'create';
type FoodType = 'Single food' | 'Recipe' | 'Meal';

function today() { return new Date().toISOString().slice(0, 10); }

const MEAL_TYPE_MAP: Record<string, MealType> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  snack: 'snack',
  dinner: 'dinner',
};

function mealTime(meal: string) {
  const times: Record<string, string> = { Breakfast: '08:30', Lunch: '13:00', Snack: '16:30', Dinner: '20:00' };
  return times[meal] ?? '';
}

function FoodRow({ food, onAdd }: { food: Food; onAdd: () => void }) {
  const serving = food.servingSuggestionG ?? 100;
  const macros = calcFoodMacros(food, serving);
  const badgeTone = food.source === 'custom' ? 'ok' : food.source === 'barcode' ? 'warn' : 'accent';
  const badgeLabel = food.source === 'custom' ? 'MINE' : food.source === 'barcode' ? 'SCAN' : 'API';
  const icon = food.source === 'custom' ? '◯' : '🍽';

  return (
    <View style={{
      backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line,
      padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
    }}>
      <View style={{ width: 44, height: 44, borderRadius: 11, backgroundColor: FG.bg2, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: FG.text }}>{food.name}</Text>
          <FBadge tone={badgeTone} style={{ paddingHorizontal: 5, paddingVertical: 1 }}>{badgeLabel}</FBadge>
        </View>
        {food.brand && <Text style={{ fontSize: 11, color: FG.mid, marginTop: 2 }}>{food.brand} · {food.servingLabel ?? `${serving}g`}</Text>}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          <Text style={{ fontSize: 10, color: FG.text }}>{macros.kcal} kcal</Text>
          <Text style={{ color: FG.line }}>·</Text>
          <Text style={{ fontSize: 10, color: FG.accent }}>{macros.proteinG}P</Text>
          <Text style={{ fontSize: 10, color: FG.warn }}>{macros.carbsG}C</Text>
          <Text style={{ fontSize: 10, color: FG.ok }}>{macros.fatG}F</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        style={{
          width: 34, height: 34, borderRadius: 17,
          backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2.5} strokeLinecap="round">
          <Path d="M12 5v14M5 12h14"/>
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

export default function AddFoodModal() {
  const { user, setTodayLog } = useStore();
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const mealName = params.meal ?? 'Lunch';
  const targetDate = params.date ?? today();

  const [screen, setScreen] = useState<Screen>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Food[]>(COMMON_FOODS);
  const [userFoods, setUserFoods] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [fromAPI, setFromAPI] = useState(false);
  const [logging, setLogging] = useState(false);

  const [foodType, setFoodType] = useState<FoodType>('Single food');
  const [fname, setFname] = useState('');
  const [fserving, setFserving] = useState('100');
  const [funit, setFunit] = useState('g');
  const [fkcal, setFkcal] = useState('');
  const [fp, setFp] = useState('');
  const [fc, setFc] = useState('');
  const [ff, setFf] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserFoods(user.uid).then(setUserFoods).catch(() => {});
  }, [user]);

  const doSearch = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await searchFoodsAPI(q || 'protein');
      setResults(res.foods);
      setFromAPI(res.fromAPI);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { doSearch(searchQuery); }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  async function logFood(food: Food) {
    if (!user) return;
    setLogging(true);
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
      await addMealToLog(user.uid, targetDate, mealLog);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to log food. Please try again.');
    } finally {
      setLogging(false);
    }
  }

  async function handleSave() {
    if (!fname.trim() || !fkcal) return;
    if (!user) return;
    setSaving(true);
    try {
      const servingG = parseFloat(fserving) || 100;
      await createCustomFood(user.uid, {
        name: fname.trim(),
        servingG,
        servingLabel: `${fserving}${funit}`,
        kcalPer100g: parseFloat(fkcal),
        proteinPer100g: parseFloat(fp) || 0,
        carbsPer100g: parseFloat(fc) || 0,
        fatPer100g: parseFloat(ff) || 0,
        source: 'custom',
      } as any);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  const allResults = [
    ...userFoods.filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())),
    ...results,
  ];

  // ── SEARCH ────────────────────────────────────────────────────
  if (screen === 'search') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round">
                <Path d="M6 6l12 12M18 6L6 18"/>
              </Svg>
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 11, color: FG.dim, letterSpacing: 1, textTransform: 'uppercase' }}>{mealName} · {mealTime(mealName)}</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: FG.text, marginTop: 1 }}>Log food</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setScreen('scan')} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={1.5} strokeLinecap="round">
              <Path d="M3 5v14M7 5v14M10 5v14M14 5v14M17 5v14M21 5v14"/>
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <View style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7}/>
              <Path d="M21 21l-4.3-4.3"/>
            </Svg>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search foods…"
              placeholderTextColor={FG.dim}
              style={{ flex: 1, color: FG.text, fontSize: 14 }}
            />
            <View style={{ width: 1, height: 16, backgroundColor: FG.line }}/>
            <Text style={{ fontSize: 11, color: searching ? FG.accent : FG.dim }}>
              {searching ? 'searching…' : `${allResults.length} items`}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginBottom: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fromAPI ? FG.ok : FG.dim }}/>
          <Text style={{ fontSize: 10, color: fromAPI ? FG.ok : FG.dim, letterSpacing: 0.8 }}>
            {fromAPI ? 'OPEN FOOD FACTS · CONNECTED' : 'LOCAL FALLBACK'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 8 }} showsVerticalScrollIndicator={false}>
          {allResults.map((food, i) => (
            <FoodRow key={`${food.id}-${i}`} food={food} onAdd={() => logFood(food)}/>
          ))}

          <View style={{ marginTop: 6, padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: FG.lineStrong, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(249,115,22,0.1)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2} strokeLinecap="round">
                <Path d="M12 5v14M5 12h14"/>
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: FG.text }}>Not on the list?</Text>
              <Text style={{ fontSize: 11, color: FG.mid, marginTop: 2 }}>Create your own food</Text>
            </View>
            <FButton variant="soft" size="sm" onPress={() => setScreen('create')}>Create</FButton>
          </View>
        </ScrollView>

        {logging && (
          <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: FG.bg2, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text style={{ color: FG.text, fontSize: 13 }}>Logging…</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ── SCAN ──────────────────────────────────────────────────────
  if (screen === 'scan') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
          <TouchableOpacity onPress={() => setScreen('search')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round">
              <Path d="M6 6l12 12M18 6L6 18"/>
            </Svg>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: FG.text }}>Scan barcode</Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <View style={{ aspectRatio: 4/5, borderRadius: 20, borderWidth: 1, borderColor: FG.lineStrong, backgroundColor: FG.bg2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, height: 60 }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={{ width: i % 3 === 0 ? 4 : 2, height: 50 + (i % 3) * 6, backgroundColor: i === 7 || i === 8 ? FG.accent : FG.text, opacity: 0.85 }}/>
              ))}
            </View>
            <View style={{ position: 'absolute', left: '12%', right: '12%', height: 2, top: '50%', backgroundColor: FG.accent }}/>
            <Text style={{ position: 'absolute', bottom: 16, fontSize: 10, color: FG.accent, letterSpacing: 1.8 }}>POINT CAMERA AT BARCODE</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => setScreen('create')}
            style={{ paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: FG.lineStrong, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 13, color: FG.mid }}>Can't scan? Create custom food →</Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2}>
              <Path d="M9 6l6 6-6 6"/>
            </Svg>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── CREATE ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
          <TouchableOpacity onPress={() => setScreen('search')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.text} strokeWidth={2} strokeLinecap="round">
              <Path d="M15 18l-6-6 6-6"/>
            </Svg>
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 11, color: FG.accent, letterSpacing: 1.2, textTransform: 'uppercase' }}>New · Mine</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: FG.text, marginTop: 1 }}>Create food</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 14, flexDirection: 'row', gap: 4 }}>
          {(['Single food', 'Recipe', 'Meal'] as FoodType[]).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setFoodType(t)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: foodType === t ? FG.bg2 : 'transparent', borderWidth: 1, borderColor: foodType === t ? FG.lineStrong : FG.line, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: foodType === t ? FG.text : FG.mid }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Name</Text>
            <TextInput
              value={fname}
              onChangeText={setFname}
              placeholder="Food name"
              placeholderTextColor={FG.dim}
              style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 12, padding: 14, color: FG.text, fontSize: 16, fontWeight: '600' }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Serving size</Text>
              <TextInput
                value={fserving}
                onChangeText={setFserving}
                keyboardType="decimal-pad"
                style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, borderRadius: 10, padding: 12, color: FG.text, fontSize: 14 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Unit</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {['g', 'ml', 'oz'].map(u => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setFunit(u)}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: funit === u ? FG.bg2 : FG.bg1, borderWidth: 1, borderColor: funit === u ? FG.lineStrong : FG.line }}
                  >
                    <Text style={{ fontSize: 13, color: funit === u ? FG.text : FG.mid }}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Macros (per {fserving}{funit})</Text>
            <View style={{ gap: 8 }}>
              {[
                { label: 'Calories (kcal)', value: fkcal, set: setFkcal, color: FG.text },
                { label: 'Protein (g)',     value: fp,    set: setFp,    color: FG.accent },
                { label: 'Carbs (g)',       value: fc,    set: setFc,    color: FG.warn },
                { label: 'Fat (g)',         value: ff,    set: setFf,    color: FG.ok },
              ].map(m => (
                <View key={m.label} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, borderRadius: 10 }}>
                  <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: m.color, borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}/>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 11 }}>
                    <Text style={{ fontSize: 13, color: FG.mid }}>{m.label}</Text>
                    <TextInput
                      value={m.value}
                      onChangeText={m.set}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={FG.dim}
                      style={{ color: FG.text, fontSize: 15, fontWeight: '700', textAlign: 'right', minWidth: 50 }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={{ position: 'absolute', bottom: 26, left: 20, right: 20, flexDirection: 'row', gap: 10 }}>
          <FButton variant="ghost" style={{ flex: 1 }} onPress={() => router.back()}>Cancel</FButton>
          <FButton style={{ flex: 2 }} onPress={handleSave} disabled={saving || !fname.trim() || !fkcal}>
            {saving ? 'Saving…' : 'Save food'}
          </FButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
