import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import Svg, { Path, Circle } from 'react-native-svg';
import { FG } from '@/constants/theme';
import { FButton } from '@/components/ui';
import { loginWithEmail } from '@forge/common';
import { auth } from '@forge/common';
import type { FirebaseError } from 'firebase/app';

// Required for OAuth redirect handling in Expo Go
WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

function ForgeLogo({ size = 36 }: { size?: number }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Path d="M8 32 L20 8 L32 32" stroke={FG.accent} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M13 22 L27 22" stroke={FG.accent} strokeWidth="3" strokeLinecap="round"/>
        <Circle cx="20" cy="8" r="3" fill={FG.accent}/>
      </Svg>
      <Text style={{ fontSize: size * 0.6, fontWeight: '800', color: FG.text, letterSpacing: 3 }}>FORGE</Text>
    </View>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    // Para builds nativos (não Expo Go), adiciona:
    // iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // Quando o OAuth regressa com sucesso, autentica no Firebase
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token ?? null, access_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then(() => router.replace('/(tabs)'))
        .catch(e => setError((e as FirebaseError).message ?? 'Google sign-in failed'))
        .finally(() => setLoading(false));
    } else if (response?.type === 'error') {
      setError(response.error?.message ?? 'Google sign-in cancelled');
    }
  }, [response]);

  async function handleLogin() {
    if (!email || !password) { setError('Preenche todos os campos'); return; }
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      router.replace('/(tabs)');
    } catch (e) {
      const msg = (e as FirebaseError).message ?? 'Login failed';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*?\)\.?/, '').trim());
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    await promptAsync();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }}>
      {/* Ambient glow */}
      <View style={{ position: 'absolute', bottom: -80, left: -60, right: -60, height: 400 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 200, backgroundColor: 'rgba(249,115,22,0.18)' }}/>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <ForgeLogo size={36}/>
            <Text style={{ fontSize: 13, color: FG.dim, marginTop: 10 }}>Welcome back. Keep forging.</Text>
          </View>

          {/* Error banner */}
          {error ? (
            <View style={{ backgroundColor: 'rgba(226,109,109,0.12)', borderWidth: 1, borderColor: 'rgba(226,109,109,0.3)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
              <Text style={{ color: FG.err, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="tu@exemplo.com"
                placeholderTextColor={FG.dim}
                style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, borderRadius: 12, padding: 14, color: FG.text, fontSize: 15 }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' }}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={FG.dim}
                style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, borderRadius: 12, padding: 14, color: FG.text, fontSize: 15 }}
              />
            </View>

            <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: FG.accent, fontWeight: '600' }}>Esqueceste a password?</Text>
            </TouchableOpacity>
          </View>

          {/* Email login */}
          <FButton fullWidth onPress={handleLogin} disabled={loading} size="lg">
            {loading ? 'A entrar…' : 'Entrar →'}
          </FButton>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: FG.line }}/>
            <Text style={{ fontSize: 11, color: FG.dim }}>ou continua com</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: FG.line }}/>
          </View>

          {/* Social buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
            <TouchableOpacity
              onPress={handleGoogle}
              disabled={!request || loading}
              style={{
                flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: FG.lineStrong,
                backgroundColor: FG.bg1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
                opacity: (!request || loading) ? 0.5 : 1,
              }}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path fill={FG.text} d="M21.35 11.1H12v3.8h5.35c-.5 2.4-2.55 3.8-5.35 3.8-3.2 0-5.8-2.6-5.8-5.7s2.6-5.7 5.8-5.7c1.45 0 2.75.5 3.75 1.45l2.7-2.7C16.85 4.4 14.6 3.5 12 3.5 7 3.5 3 7.5 3 12.5S7 21.5 12 21.5c5.2 0 8.6-3.65 8.6-8.8 0-.55-.05-1.1-.25-1.6z"/>
              </Svg>
              <Text style={{ color: FG.text, fontSize: 14, fontWeight: '600' }}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: FG.lineStrong,
                backgroundColor: FG.bg1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
              }}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path fill={FG.text} d="M16.46 12.6c0-2.5 2.05-3.7 2.13-3.78-1.16-1.7-2.97-1.93-3.62-1.96-1.55-.16-3 .9-3.79.9-.78 0-1.97-.87-3.24-.85-1.67.03-3.21.97-4.07 2.46-1.74 3.01-.45 7.46 1.25 9.9.83 1.2 1.81 2.55 3.1 2.5 1.25-.05 1.72-.81 3.23-.81 1.5 0 1.94.81 3.25.78 1.34-.03 2.19-1.22 3-2.43.94-1.4 1.34-2.74 1.36-2.81-.03-.02-2.6-1-2.6-3.93zm-2.5-7.21c.69-.83 1.15-1.99 1.02-3.14-.99.04-2.18.66-2.89 1.5-.64.73-1.2 1.9-1.05 3.04 1.1.08 2.23-.56 2.92-1.4z"/>
              </Svg>
              <Text style={{ color: FG.text, fontSize: 14, fontWeight: '600' }}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <TouchableOpacity onPress={() => router.replace('/(auth)/onboarding')} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: FG.mid }}>
              Sem conta?{' '}
              <Text style={{ color: FG.accent, fontWeight: '600' }}>Começa a treinar →</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
