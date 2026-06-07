import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp, Timestamp,
  getDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { WorkoutSession, Exercise, WorkoutRoutine } from '../types';

const routinesCol = (uid: string) => collection(db, 'users', uid, 'routines');

function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

export async function getRoutines(uid: string): Promise<WorkoutRoutine[]> {
  const q = query(routinesCol(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
      lastUsedAt: data.lastUsedAt ? (data.lastUsedAt as Timestamp).toDate() : undefined,
    } as WorkoutRoutine;
  });
}

export async function createRoutine(uid: string, data: Omit<WorkoutRoutine, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(routinesCol(uid), {
    ...data,
    exercises: data.exercises.map(stripUndefined),
    uid,
    timesUsed: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateRoutine(uid: string, routineId: string, data: Partial<Omit<WorkoutRoutine, 'id' | 'uid'>>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'routines', routineId), {
    ...data,
    ...(data.exercises ? { exercises: data.exercises.map(stripUndefined) } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function getRoutine(uid: string, routineId: string): Promise<WorkoutRoutine | null> {
  const ref = doc(db, 'users', uid, 'routines', routineId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    lastUsedAt: data.lastUsedAt ? (data.lastUsedAt as Timestamp).toDate() : undefined,
  } as WorkoutRoutine;
}

export async function deleteRoutine(uid: string, routineId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'routines', routineId));
}

export async function incrementRoutineUsage(uid: string, routineId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'routines', routineId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  await updateDoc(ref, {
    timesUsed: (snap.data().timesUsed ?? 0) + 1,
    lastUsedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

const workoutsCol = (uid: string) => collection(db, 'users', uid, 'workouts');
const exercisesCol = collection(db, 'exercises');
const userExercisesCol = (uid: string) => collection(db, 'users', uid, 'exercises');

export async function createWorkoutSession(uid: string, data: Omit<WorkoutSession, 'id' | 'uid'>): Promise<string> {
  const ref = await addDoc(workoutsCol(uid), {
    ...data,
    uid,
    startedAt: Timestamp.fromDate(data.startedAt),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateWorkoutSession(uid: string, sessionId: string, data: Partial<WorkoutSession>): Promise<void> {
  const ref = doc(db, 'users', uid, 'workouts', sessionId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { ...data };
  if (data.completedAt) update.completedAt = Timestamp.fromDate(data.completedAt);
  await updateDoc(ref, update);
}

export async function getRecentWorkouts(uid: string, count = 20): Promise<WorkoutSession[]> {
  const q = query(workoutsCol(uid), orderBy('startedAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      startedAt: (data.startedAt as Timestamp).toDate(),
      completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : undefined,
    } as WorkoutSession;
  });
}

export async function getWorkoutSession(uid: string, sessionId: string): Promise<WorkoutSession | null> {
  const ref = doc(db, 'users', uid, 'workouts', sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    startedAt: (data.startedAt as Timestamp).toDate(),
    completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : undefined,
  } as WorkoutSession;
}

export async function deleteWorkoutSession(uid: string, sessionId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'workouts', sessionId));
}

export async function searchExercises(query_: string, muscleGroup?: string): Promise<Exercise[]> {
  let q = query(exercisesCol, limit(30));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Exercise);
  const lower = query_.toLowerCase();
  return results.filter(ex =>
    ex.name.toLowerCase().includes(lower) &&
    (!muscleGroup || ex.muscleGroup === muscleGroup)
  );
}

export async function getUserExercises(uid: string): Promise<Exercise[]> {
  const snap = await getDocs(userExercisesCol(uid));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Exercise);
}

export async function createCustomExercise(uid: string, exercise: Omit<Exercise, 'id'>): Promise<string> {
  const ref = await addDoc(userExercisesCol(uid), {
    ...exercise,
    source: 'custom',
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getWeeklyVolume(uid: string): Promise<number[]> {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const q = query(
    workoutsCol(uid),
    where('startedAt', '>=', Timestamp.fromDate(weekStart)),
    orderBy('startedAt', 'asc')
  );
  const snap = await getDocs(q);
  const dailyVolume = new Array(7).fill(0);
  snap.docs.forEach(d => {
    const data = d.data();
    const date = (data.startedAt as Timestamp).toDate();
    const dayIndex = date.getDay();
    dailyVolume[dayIndex] += data.totalVolumeKg ?? 0;
  });
  return dailyVolume;
}
