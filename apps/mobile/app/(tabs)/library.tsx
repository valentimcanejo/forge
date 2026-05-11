import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { FG } from '@/constants/theme';
import { FBadge } from '@/components/ui';

const SECTIONS = ['Lifts', 'Foods', 'Recipes', 'Cardio'] as const;
type Section = typeof SECTIONS[number];

const MUSCLE_FILTERS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

const EXERCISES = [
  { name: 'Barbell Bench Press', muscle: 'Chest', logged: '8.2k logged', icon: '⚒', warm: true },
  { name: 'Conventional Deadlift', muscle: 'Back · Legs', logged: '6.4k logged', icon: '◧', warm: false },
  { name: 'Back Squat', muscle: 'Legs', logged: '7.1k logged', icon: '⚙', warm: false },
  { name: 'Pull-up', muscle: 'Back', logged: '4.8k logged', icon: '◬', warm: false },
  { name: 'Overhead Press', muscle: 'Shoulders', logged: '3.2k logged', icon: '◯', warm: false },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', logged: '3.9k logged', icon: '◫', warm: false },
  { name: 'Incline DB Press', muscle: 'Chest', logged: '2.7k logged', icon: '◧', warm: false },
  { name: 'Barbell Row', muscle: 'Back', logged: '2.5k logged', icon: '⚒', warm: false },
];

const FOODS = [
  { name: 'Chicken breast', brand: 'USDA', kcal: 165, p: 31, c: 0, f: 4, serving: '100g', icon: '🍗' },
  { name: 'Whey isolate', brand: 'Custom', kcal: 110, p: 23, c: 2, f: 1, serving: '30g scoop', icon: '◯' },
  { name: 'White rice', brand: 'USDA', kcal: 130, p: 3, c: 28, f: 0, serving: '100g cooked', icon: '🍚' },
  { name: 'Greek yogurt', brand: 'USDA', kcal: 59, p: 10, c: 4, f: 0, serving: '100g', icon: '◧' },
  { name: 'Oats', brand: 'USDA', kcal: 389, p: 17, c: 66, f: 7, serving: '100g dry', icon: '🥣' },
  { name: 'Eggs', brand: 'USDA', kcal: 155, p: 13, c: 1, f: 11, serving: '2 large', icon: '🥚' },
];

export default function LibraryScreen() {
  const [section, setSection] = useState<Section>('Lifts');
  const [muscle, setMuscle] = useState('All');
  const [query, setQuery] = useState('');

  const filteredExercises = EXERCISES.filter(ex =>
    (muscle === 'All' || ex.muscle.includes(muscle)) &&
    ex.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredFoods = FOODS.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, marginBottom: 14 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>Library</Text>
          <Text style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>650 lifts · 1,800 foods</Text>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <View style={{
            backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line,
            borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
            flexDirection: 'row', alignItems: 'center', gap: 10,
          }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={FG.dim} strokeWidth={2} strokeLinecap="round">
              <Circle cx={11} cy={11} r={7}/>
              <Path d="M21 21l-4.3-4.3"/>
            </Svg>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search lifts, food, recipes…"
              placeholderTextColor={FG.dim}
              style={{ flex: 1, color: FG.text, fontSize: 14 }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={{ color: FG.dim, fontSize: 18, lineHeight: 18 }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 14 }}>
          {SECTIONS.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setSection(s)}
              style={{
                paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
                backgroundColor: section === s ? FG.accent : 'transparent',
                borderWidth: 1, borderColor: section === s ? FG.accent : FG.line,
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600',
                color: section === s ? '#1a0a00' : FG.mid,
              }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Muscle filter (Lifts only) */}
        {section === 'Lifts' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginBottom: 14 }}>
            {MUSCLE_FILTERS.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setMuscle(m)}
                style={{
                  paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999,
                  backgroundColor: muscle === m ? 'rgba(249,115,22,0.12)' : FG.bg1,
                  borderWidth: 1, borderColor: muscle === m ? 'rgba(249,115,22,0.3)' : FG.line,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '500', color: muscle === m ? FG.accent : FG.mid }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Exercises list */}
        {section === 'Lifts' && (
          <View style={{ paddingHorizontal: 20, gap: 8 }}>
            {filteredExercises.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={{
                  backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line,
                  padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
              >
                <View style={{
                  width: 50, height: 50, borderRadius: 12,
                  backgroundColor: ex.warm ? 'rgba(249,115,22,0.12)' : FG.bg2,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 22 }}>{ex.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: FG.text }}>{ex.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: FG.accent, fontWeight: '500' }}>{ex.muscle}</Text>
                    <Text style={{ color: FG.dim }}>·</Text>
                    <Text style={{ fontSize: 11, color: FG.dim, fontFamily: 'JetBrains Mono' }}>{ex.logged}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(modals)/add-exercise')}
                  style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2.5} strokeLinecap="round">
                    <Path d="M12 5v14M5 12h14"/>
                  </Svg>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            {filteredExercises.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>⚒</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: FG.text }}>No exercises found</Text>
                <Text style={{ fontSize: 13, color: FG.mid, marginTop: 6 }}>Try a different filter or create your own</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(modals)/add-exercise')}
                  style={{ marginTop: 16 }}
                >
                  <FBadge tone="accent">+ Create custom lift</FBadge>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Foods list */}
        {section === 'Foods' && (
          <View style={{ paddingHorizontal: 20, gap: 8 }}>
            {filteredFoods.map((food, i) => (
              <TouchableOpacity
                key={i}
                style={{
                  backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line,
                  padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
              >
                <View style={{
                  width: 50, height: 50, borderRadius: 12, backgroundColor: FG.bg2,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 22 }}>{food.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: FG.text }}>{food.name}</Text>
                    <FBadge tone={food.brand === 'Custom' ? 'ok' : 'neutral'} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
                      {food.brand === 'Custom' ? 'MINE' : 'API'}
                    </FBadge>
                  </View>
                  <Text style={{ fontSize: 11, color: FG.dim, marginTop: 2 }}>{food.serving}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: FG.text }}>{food.kcal} kcal</Text>
                    <Text style={{ color: FG.line }}>·</Text>
                    <Text style={{ fontSize: 10, color: FG.accent }}>{food.p}P</Text>
                    <Text style={{ fontSize: 10, color: FG.warn }}>{food.c}C</Text>
                    <Text style={{ fontSize: 10, color: FG.ok }}>{food.f}F</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(modals)/add-food')}
                  style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={FG.accent} strokeWidth={2.5} strokeLinecap="round">
                    <Path d="M12 5v14M5 12h14"/>
                  </Svg>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty states for Recipes / Cardio */}
        {(section === 'Recipes' || section === 'Cardio') && (
          <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>{section === 'Recipes' ? '🍱' : '🏃'}</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: FG.text }}>Coming soon</Text>
            <Text style={{ fontSize: 13, color: FG.mid, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              {section === 'Recipes' ? 'Meal recipes with automatic macro calculation.' : 'Cardio tracking with distance and pace metrics.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
