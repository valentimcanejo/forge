import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp, Timestamp,
  getDoc, setDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { DailyLog, Food, MealLog } from '../types';

const dailyLogCol = (uid: string) => collection(db, 'users', uid, 'dailyLogs');
const foodsCol = collection(db, 'foods');
const userFoodsCol = (uid: string) => collection(db, 'users', uid, 'foods');

export async function getDailyLog(uid: string, date: string): Promise<DailyLog | null> {
  const ref = doc(db, 'users', uid, 'dailyLogs', date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as DailyLog;
}

export async function upsertDailyLog(uid: string, date: string, data: Partial<DailyLog>): Promise<void> {
  const ref = doc(db, 'users', uid, 'dailyLogs', date);
  await setDoc(ref, { ...data, uid, date, updatedAt: serverTimestamp() }, { merge: true });
}

export async function addMealToLog(uid: string, date: string, meal: MealLog): Promise<void> {
  const log = await getDailyLog(uid, date);
  const meals = log?.meals ?? [];
  const idx = meals.findIndex(m => m.id === meal.id);
  if (idx >= 0) meals[idx] = meal;
  else meals.push(meal);

  const totals = meals.reduce(
    (acc, m) => ({
      totalKcal: acc.totalKcal + m.totalKcal,
      totalProteinG: acc.totalProteinG + m.totalProteinG,
      totalCarbsG: acc.totalCarbsG + m.totalCarbsG,
      totalFatG: acc.totalFatG + m.totalFatG,
    }),
    { totalKcal: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 }
  );

  await upsertDailyLog(uid, date, { meals, ...totals });
}

export async function logWater(uid: string, date: string, addMl: number): Promise<void> {
  const log = await getDailyLog(uid, date);
  const currentMl = log?.waterMl ?? 0;
  await upsertDailyLog(uid, date, { waterMl: currentMl + addMl });
}

export async function searchFoods(query_: string): Promise<Food[]> {
  const snap = await getDocs(query(foodsCol, limit(50)));
  const all = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Food);
  const lower = query_.toLowerCase();
  return all.filter(f => f.name.toLowerCase().includes(lower));
}

export async function getUserFoods(uid: string): Promise<Food[]> {
  const snap = await getDocs(userFoodsCol(uid));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Food);
}

export async function createCustomFood(uid: string, food: Omit<Food, 'id'>): Promise<string> {
  const ref = await addDoc(userFoodsCol(uid), {
    ...food,
    source: 'custom',
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getRecentDailyLogs(uid: string, days = 30): Promise<DailyLog[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const q = query(
    dailyLogCol(uid),
    where('date', '>=', cutoffStr),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }) as DailyLog);
}
