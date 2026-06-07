import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, linkWithCredential } from 'firebase/auth';
import { FG } from '@/constants/theme';
import { FButton } from '@/components/ui';
import { linkAnonymousWithEmail, auth } from '@forge/common';
import { useTranslation } from 'react-i18next';
import type { FirebaseError } from 'firebase/app';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export default function LinkAccountScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, access_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token ?? null, access_token);
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      setLoading(true);
      linkWithCredential(currentUser, credential)
        .then(() => {
          Alert.alert(t('auth.linkSuccess'), '', [{ text: 'OK', onPress: () => router.back() }]);
        })
        .catch(e => setError((e as FirebaseError).message ?? t('auth.linkingFailed')))
        .finally(() => setLoading(false));
    } else if (response?.type === 'error') {
      setError(response.error?.message ?? t('auth.linkingFailed'));
    }
  }, [response]);

  async function handleLink() {
    if (!name.trim() || !email || !password) { setError('Preenche todos os campos'); return; }
    if (password.length < 6) { setError(t('auth.passwordMinLength')); return; }
    setLoading(true);
    setError('');
    try {
      await linkAnonymousWithEmail(email, password, name.trim());
      Alert.alert(t('auth.linkSuccess'), '', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      const msg = (e as FirebaseError).message ?? t('auth.linkingFailed');
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*?\)\.?/, '').trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: FG.bg0 }}>
      <View style={{ position: 'absolute', bottom: -80, left: -60, right: -60, height: 400 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 200, backgroundColor: 'rgba(249,115,22,0.15)' }}/>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 13, color: FG.mid }}>← {t('common.back')}</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: FG.text, letterSpacing: -0.5 }}>{t('auth.linkHeading')}</Text>
            <Text style={{ fontSize: 14, color: FG.mid, marginTop: 8, lineHeight: 20 }}>{t('auth.linkSubtitle')}</Text>
          </View>

          {error ? (
            <View style={{ backgroundColor: 'rgba(226,109,109,0.12)', borderWidth: 1, borderColor: 'rgba(226,109,109,0.3)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
              <Text style={{ color: FG.err, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ gap: 12, marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' }}>{t('auth.fullName')}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholder="John Smith"
                placeholderTextColor={FG.dim}
                style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, borderRadius: 12, padding: 14, color: FG.text, fontSize: 15 }}
              />
            </View>
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
              <Text style={{ fontSize: 10, color: FG.dim, letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' }}>{t('auth.password')}</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={FG.dim}
                style={{ backgroundColor: FG.bg1, borderWidth: 1, borderColor: FG.line, borderRadius: 12, padding: 14, color: FG.text, fontSize: 15 }}
              />
            </View>
          </View>

          <FButton fullWidth onPress={handleLink} disabled={loading} size="lg">
            {loading ? t('auth.linkingAccount') : t('auth.saveProgress')}
          </FButton>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: FG.line }}/>
            <Text style={{ fontSize: 11, color: FG.dim }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: FG.line }}/>
          </View>

          <TouchableOpacity
            onPress={() => { setError(''); promptAsync(); }}
            disabled={!request || loading}
            style={{
              height: 48, borderRadius: 12, borderWidth: 1, borderColor: FG.line,
              backgroundColor: FG.bg1, alignItems: 'center', justifyContent: 'center',
              opacity: (!request || loading) ? 0.5 : 1,
            }}
          >
            <Text style={{ color: FG.text, fontSize: 14, fontWeight: '600' }}>Continuar com Google</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
