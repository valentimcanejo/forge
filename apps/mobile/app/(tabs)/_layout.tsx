import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FG } from '@/constants/theme';

const ICONS: Record<string, string> = {
  index:    'M3 12L12 4l9 8M5 10v10h14V10',
  workout:  'M4 9h2v6H4zM18 9h2v6h-2zM7 11h10v2H7zM2 10h2v4H2zM20 10h2v4h-2z',
  diet:     'M6 3v9a3 3 0 003 3v6h2v-6a3 3 0 003-3V3M9 3v6M13 3v6M19 3c-1 2-1 5 0 8v10',
  progress: 'M3 17l6-6 4 4 8-8',
  library:  'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 22H20V4H6.5A2.5 2.5 0 004 6.5v13z',
  profile:  'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8',
};

const LABELS: Record<string, string> = {
  index: 'Home', workout: 'Lift', diet: 'Eat', progress: 'Progress', library: 'Library', profile: 'You',
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
      <Tabs.Screen name="index"    options={{ tabBarIcon: ({ focused }) => <TabIcon name="index"    focused={focused}/> }}/>
      <Tabs.Screen name="workout"  options={{ tabBarIcon: ({ focused }) => <TabIcon name="workout"  focused={focused}/> }}/>
      <Tabs.Screen name="diet"     options={{ tabBarIcon: ({ focused }) => <TabIcon name="diet"     focused={focused}/> }}/>
      <Tabs.Screen name="progress" options={{ tabBarIcon: ({ focused }) => <TabIcon name="progress" focused={focused}/> }}/>
      <Tabs.Screen name="library"  options={{ tabBarIcon: ({ focused }) => <TabIcon name="library"  focused={focused}/> }}/>
      <Tabs.Screen name="profile"  options={{ tabBarIcon: ({ focused }) => <TabIcon name="profile"  focused={focused}/> }}/>
      {/* Non-tab screens accessible from within tabs */}
      <Tabs.Screen name="badges"   options={{ href: null }}/>

    </Tabs>
  );
}
