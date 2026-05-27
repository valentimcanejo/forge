import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const app: FirebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

let _auth: Auth | null = null;

export function getAuthInstance(): Auth {
  if (_auth) return _auth;
  try {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e: any) {
    // auth/already-initialized: hot reload — retrieve the existing instance.
    // Any other error (e.g. bundle resolution issues): fall back to getAuth
    // which uses in-memory persistence rather than crashing the whole app.
    _auth = getAuth(app);
    if (!_auth) throw e;
  }
  return _auth;
}

// Initialise eagerly so auth is ready before any screen mounts.
// Wrapped in try/catch so a bad env config never crashes the module.
export let auth: Auth;
try {
  auth = getAuthInstance();
} catch (e) {
  console.error('[Forge] Firebase auth init failed:', e);
  // auth will be undefined; screens that use it will show their own error states
  auth = null as unknown as Auth;
}
