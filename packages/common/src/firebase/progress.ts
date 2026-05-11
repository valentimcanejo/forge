import {
  collection, doc, addDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp,
  updateDoc, getDoc,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import type { ProgressEntry, PRRecord } from '../types';

const progressCol = (uid: string) => collection(db, 'users', uid, 'progress');
const prsCol = (uid: string) => collection(db, 'users', uid, 'prs');

export async function logProgress(uid: string, entry: Omit<ProgressEntry, 'id' | 'uid'>): Promise<string> {
  const ref = await addDoc(progressCol(uid), {
    ...entry,
    uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getProgressHistory(uid: string, weeks = 12): Promise<ProgressEntry[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const q = query(
    progressCol(uid),
    where('date', '>=', cutoffStr),
    orderBy('date', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }) as ProgressEntry);
}

export async function uploadProgressPhoto(uid: string, file: File | Blob, entryId: string): Promise<string> {
  const path = `progress/${uid}/${entryId}_${Date.now()}.jpg`;
  const sRef = storageRef(storage, path);
  await uploadBytes(sRef, file);
  return getDownloadURL(sRef);
}

export async function savePR(uid: string, pr: PRRecord): Promise<void> {
  const existing = await getExistingPR(uid, pr.exerciseId);
  if (existing && existing.estimatedOneRMKg >= pr.estimatedOneRMKg) return;

  if (existing) {
    await updateDoc(doc(db, 'users', uid, 'prs', pr.exerciseId), {
      ...pr,
      updatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(prsCol(uid), {
      ...pr,
      achievedAt: pr.achievedAt,
      createdAt: serverTimestamp(),
    });
  }
}

async function getExistingPR(uid: string, exerciseId: string): Promise<PRRecord | null> {
  const q = query(prsCol(uid), where('exerciseId', '==', exerciseId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as PRRecord;
}

export async function getAllPRs(uid: string): Promise<PRRecord[]> {
  const snap = await getDocs(prsCol(uid));
  return snap.docs.map(d => d.data() as PRRecord);
}

export async function getWeightTrend(uid: string, weeks = 12): Promise<Array<{ date: string; weightKg: number }>> {
  const entries = await getProgressHistory(uid, weeks);
  return entries
    .filter(e => e.weightKg != null)
    .map(e => ({ date: e.date, weightKg: e.weightKg! }));
}
