import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { UserProfile } from '../types';

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await createUserDocument(cred.user);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  await createUserDocument(cred.user);
  return cred.user;
}

export async function loginWithApple(): Promise<User> {
  const cred = await signInWithPopup(auth, appleProvider);
  await createUserDocument(cred.user);
  return cred.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

async function createUserDocument(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  const profile: Partial<UserProfile> = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? undefined,
    joinedAt: new Date(),
    fitnessLevel: 'beginner',
    goal: 'gain',
    dietaryRestrictions: [],
    language: 'en',
    weightUnit: 'kg',
    heightUnit: 'cm',
    notifications: {
      workoutReminder: true,
      mealReminder: true,
      streakAlert: true,
      badgeAlert: true,
      reminderTime: '08:00',
    },
  };

  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    joinedAt: data.createdAt?.toDate?.() ?? new Date(),
  } as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
