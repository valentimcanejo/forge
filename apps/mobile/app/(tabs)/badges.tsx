import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FG } from '@/constants/theme';
import { FCard, FBadge, FProgress, FRing } from '@/components/ui';

const BADGES_DATA = [
  { id: 'first_lift',    name: 'First Lift',       icon: '⚒', earned: true,  glow: true,  rare: false },
  { id: 'week_streak',   name: 'Week Streak',       icon: '🔥', earned: true,  glow: false, rare: false },
  { id: 'pr_hunter',     name: 'PR Hunter',         icon: '↗', earned: true,  glow: false, rare: false },
  { id: 'macro_master',  name: 'Macro Master',      icon: '◷', earned: true,  glow: false, rare: false },
  { id: 'iron_forger',   name: 'Iron Forger',       icon: '⚙', earned: true,  glow: false, rare: true  },
  { id: 'volume_king',   name: 'Volume King',       icon: '◬', earned: false, glow: false, rare: false },
  { id: 'photo_diary',   name: 'Photo Diary',       icon: '◐', earned: false, glow: false, rare: false },
  { id: '100_lifts',     name: '100 Lifts',         icon: '✦', earned: false, glow: false, rare: false },
  { id: 'naturally_built', name: 'Naturally Built', icon: '✺', earned: false, glow: false, rare: true  },
];

const LEVEL_XP = 2140;
const LEVEL_NEXT_XP = 3000;
const XP_PROGRESS = LEVEL_XP / LEVEL_NEXT_XP;

export default function BadgesScreen() {
  const earnedCount = BADGES_DATA.filter(b => b.earned).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, marginBottom: 14 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>Forge</Text>
          <Text style={{ fontSize: 13, color: FG.dim, marginTop: 2 }}>Badges, levels, missions</Text>
        </View>

        {/* Level progress card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{
            borderRadius: 18, padding: 18, borderWidth: 1, borderColor: FG.line,
            backgroundColor: FG.bg1, position: 'relative', overflow: 'hidden',
          }}>
            {/* Warm glow */}
            <View style={{
              position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90,
              backgroundColor: 'rgba(249,115,22,0.18)',
            }}/>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 11, color: FG.accent, letterSpacing: 1.2, textTransform: 'uppercase' }}>Level 7</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', color: FG.text, marginTop: 2, letterSpacing: -0.5 }}>Iron Forger</Text>
              </View>
              <FRing value={XP_PROGRESS} size={64} stroke={5} label="68%"/>
            </View>

            <FProgress value={XP_PROGRESS}/>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 11, color: FG.mid, fontFamily: 'JetBrains Mono' }}>
                {LEVEL_XP.toLocaleString()} XP
              </Text>
              <Text style={{ fontSize: 11, color: FG.mid, fontFamily: 'JetBrains Mono' }}>
                · {(LEVEL_NEXT_XP - LEVEL_XP).toLocaleString()} to LVL 8 · Steel Forger
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly mission */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase' }}>Weekly Mission</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: FG.text }}>3 PRs in 7 days</Text>
          </View>
          <FCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1, textTransform: 'uppercase' }}>Progress</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 2 }}>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: FG.text }}>2</Text>
                  <Text style={{ fontSize: 14, color: FG.mid }}> / 3</Text>
                </View>
              </View>
              <FBadge tone="warn">+150 XP</FBadge>
            </View>
            <FProgress value={0.66} color={FG.warn}/>
            <Text style={{ fontSize: 12, color: FG.dim, marginTop: 8 }}>3 days left · keep pushing</Text>
          </FCard>
        </View>

        {/* XP reward summary */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>XP REWARDS</Text>
          <View style={{ backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, overflow: 'hidden' }}>
            {[
              { label: 'Complete workout', xp: '+30' },
              { label: 'Log a meal', xp: '+10' },
              { label: 'Hit macro targets', xp: '+25' },
              { label: 'Set a PR', xp: '+50' },
              { label: 'Daily streak bonus', xp: '+15' },
            ].map((r, i, a) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingHorizontal: 16, paddingVertical: 12,
                  borderBottomWidth: i < a.length - 1 ? 1 : 0, borderBottomColor: FG.line,
                }}
              >
                <Text style={{ fontSize: 13, color: FG.text }}>{r.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: FG.accent, fontFamily: 'JetBrains Mono' }}>{r.xp}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badge grid */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase' }}>{earnedCount} Earned</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: FG.text }}>Badges</Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {BADGES_DATA.map((b, i) => (
              <TouchableOpacity
                key={b.id}
                style={{
                  width: '30%', aspectRatio: 1, borderRadius: 16,
                  backgroundColor: b.earned
                    ? (b.rare ? 'rgba(249,115,22,0.1)' : FG.bg1)
                    : 'rgba(255,255,255,0.02)',
                  borderWidth: 1,
                  borderColor: b.earned
                    ? (b.rare ? 'rgba(249,115,22,0.4)' : FG.line)
                    : FG.line,
                  borderStyle: b.earned ? 'solid' : 'dashed',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  opacity: b.earned ? 1 : 0.4,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {b.glow && (
                  <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(249,115,22,0.15)',
                  }}/>
                )}
                <Text style={{ fontSize: 28 }}>{b.icon}</Text>
                <Text style={{
                  fontSize: 10, fontWeight: '600',
                  color: b.earned ? FG.text : FG.dim,
                  textAlign: 'center', paddingHorizontal: 4,
                }}>{b.name}</Text>
                {b.rare && b.earned && (
                  <View style={{
                    position: 'absolute', top: 6, right: 6,
                    backgroundColor: 'rgba(249,115,22,0.3)',
                    borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1,
                  }}>
                    <Text style={{ fontSize: 7, color: FG.accent, fontWeight: '700', letterSpacing: 0.5 }}>RARE</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
