import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FG } from '@/constants/theme';

const ICONS: Record<string, string> = {
  workout: 'M4 9h2v6H4zM18 9h2v6h-2zM7 11h10v2H7zM2 10h2v4H2zM20 10h2v4h-2z',
  diet:    'M6 3v9a3 3 0 003 3v6h2v-6a3 3 0 003-3V3M9 3v6M13 3v6M19 3c-1 2-1 5 0 8v10',
  profile: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8',
};

const LABELS: Record<string, string> = {
  workout: 'Treino',
  diet:    'Dieta',
  profile: 'Eu',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const color = focused ? FG.accent : FG.dim;
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d={ICONS[name] ?? ''}/>
      </Svg>
      <Text style={{ fontSize: 10, fontWeight: '600', color, letterSpacing: 0.3 }}>{LABELS[name]}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: FG.bg0,
          borderTopColor: FG.line,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 28,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="workout" options={{ tabBarIcon: ({ focused }) => <TabIcon name="workout" focused={focused}/> }}/>
      <Tabs.Screen name="diet"    options={{ tabBarIcon: ({ focused }) => <TabIcon name="diet"    focused={focused}/> }}/>
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused}/> }}/>

      {/* Hidden — code preserved, inaccessible via nav */}
      <Tabs.Screen name="index"    options={{ href: null }}/>
      <Tabs.Screen name="progress" options={{ href: null }}/>
      <Tabs.Screen name="library"  options={{ href: null }}/>
      <Tabs.Screen name="badges"   options={{ href: null }}/>
    </Tabs>
  );
}
