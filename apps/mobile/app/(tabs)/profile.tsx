import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FG } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { logout } from '@forge/common';

export default function ProfileScreen() {
  const { profile, gamification, user, reset } = useStore();

  const name = profile?.displayName ?? user?.displayName ?? 'Atleta';
  const handle = profile?.email ? `@${profile.email.split('@')[0]}` : '';
  const joinedStr = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('pt', { month: 'short', year: 'numeric' })
    : '';
  const totalWorkouts = gamification?.totalWorkouts ?? 0;

  async function handleLogout() {
    Alert.alert('Sair?', 'Tens a certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          await logout();
          reset();
          router.replace('/(auth)/onboarding');
        },
      },
    ]);
  }

  const SETTINGS = [
    { l: 'Informação pessoal', sub: `${profile?.weightKg ? profile.weightKg + ' kg · ' : ''}${profile?.heightCm ? profile.heightCm + ' cm' : 'Não definido'}` },
    { l: 'Objetivo', sub: profile?.goal ? `Atualmente: ${profile.goal}` : 'Não definido' },
    { l: 'Unidades e idioma', sub: `${profile?.weightUnit ?? 'kg'} · ${profile?.heightUnit ?? 'cm'} · ${profile?.language?.toUpperCase() ?? 'PT'}` },
    { l: 'Notificações', sub: profile?.notifications?.workoutReminder ? 'Lembretes ativos' : 'Desligado' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Guest banner */}
        {user?.isAnonymous && (
          <TouchableOpacity
            onPress={() => router.push('/(auth)/link-account')}
            style={{ marginHorizontal: 20, marginTop: 8, marginBottom: 4, borderRadius: 14, padding: 14, backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: FG.accent }}>Modo visitante</Text>
              <Text style={{ fontSize: 12, color: FG.mid, marginTop: 2 }}>Os teus dados podem ser perdidos. Cria uma conta para os guardar.</Text>
            </View>
            <Text style={{ fontSize: 16, color: FG.accent, marginLeft: 10 }}>›</Text>
          </TouchableOpacity>
        )}

        {/* Profile card */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, marginBottom: 20 }}>
          <View style={{ borderRadius: 22, padding: 20, borderWidth: 1, borderColor: FG.line, backgroundColor: FG.bg1, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#2a1a14', borderWidth: 2, borderColor: 'rgba(249,115,22,0.4)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: FG.accent }}>{name[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: FG.text }}>{name}</Text>
              <Text style={{ fontSize: 12, color: FG.dim, marginTop: 3 }}>
                {[handle, joinedStr ? `desde ${joinedStr}` : ''].filter(Boolean).join(' · ')}
              </Text>
              <Text style={{ fontSize: 12, color: FG.mid, marginTop: 6 }}>
                {totalWorkouts} {totalWorkouts === 1 ? 'treino' : 'treinos'}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>CONTA</Text>
          <View style={{ backgroundColor: FG.bg1, borderRadius: 14, borderWidth: 1, borderColor: FG.line, overflow: 'hidden' }}>
            {SETTINGS.map((row, i) => (
              <TouchableOpacity
                key={row.l}
                style={{ padding: 14, paddingHorizontal: 16, borderBottomWidth: i < SETTINGS.length - 1 ? 1 : 0, borderBottomColor: FG.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <View>
                  <Text style={{ fontSize: 14, color: FG.text }}>{row.l}</Text>
                  <Text style={{ fontSize: 12, color: FG.dim, marginTop: 2 }}>{row.sub}</Text>
                </View>
                <Text style={{ fontSize: 16, color: FG.dim }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(226,109,109,0.25)', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: FG.err }}>Sair</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
