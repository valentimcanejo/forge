export type GoalType = 'gain' | 'cut' | 'maintain';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'full_body';
export type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell' | 'band' | 'smith' | 'custom';
export type ExerciseSource = 'api' | 'custom';
export type FoodSource = 'api' | 'custom' | 'barcode';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
export type BadgeRarity = 'common' | 'rare' | 'legendary';
export type Language = 'en' | 'es' | 'pt';
export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  handle?: string;
  joinedAt: Date;
  birthYear: number;
  weightKg: number;
  heightCm: number;
  fitnessLevel: FitnessLevel;
  goal: GoalType;
  dietaryRestrictions: string[];
  language: Language;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  workoutReminder: boolean;
  mealReminder: boolean;
  streakAlert: boolean;
  badgeAlert: boolean;
  reminderTime: string;
}

export interface GamificationState {
  uid: string;
  xp: number;
  level: number;
  levelName: string;
  streakDays: number;
  longestStreak: number;
  lastActivityDate: string;
  badgesEarned: string[];
  weeklyMissions: WeeklyMission[];
  totalWorkouts: number;
  totalPRs: number;
}

export interface WeeklyMission {
  id: string;
  titleKey: string;
  target: number;
  current: number;
  xpReward: number;
  expiresAt: Date;
}

export interface Badge {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  rarity: BadgeRarity;
  xpReward: number;
  condition: BadgeCondition;
}

export interface BadgeCondition {
  type: 'workouts' | 'streak' | 'pr' | 'level' | 'macros' | 'photos' | 'custom';
  threshold: number;
}

export interface WorkoutSession {
  id: string;
  uid: string;
  name: string;
  planName: string;
  dayType: string;
  startedAt: Date;
  completedAt?: Date;
  durationSeconds?: number;
  exercises: WorkoutExercise[];
  totalVolumeKg: number;
  notes?: string;
  week?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: SetLog[];
  notes?: string;
  order: number;
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  isWarmup: boolean;
  rpe?: number;
  timestamp?: Date;
}

export interface Exercise {
  id: string;
  name: string;
  nameKey?: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: FitnessLevel;
  source: ExerciseSource;
  instructions?: string[];
  videoUrl?: string;
  imageUrl?: string;
  timesLogged?: number;
  createdBy?: string;
  apiId?: string;
}

export interface DailyLog {
  id: string;
  uid: string;
  date: string;
  meals: MealLog[];
  totalKcal: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  waterMl: number;
  weightKg?: number;
  notes?: string;
}

export interface MealLog {
  id: string;
  type: MealType;
  name: string;
  scheduledTime: string;
  foods: FoodEntry[];
  totalKcal: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  completed: boolean;
}

export interface FoodEntry {
  foodId: string;
  foodName: string;
  brand?: string;
  servingG: number;
  servingLabel: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: FoodSource;
}

export interface Food {
  id: string;
  name: string;
  brand?: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  servingSuggestionG?: number;
  servingLabel?: string;
  barcode?: string;
  source: FoodSource;
  createdBy?: string;
  apiId?: string;
}

export interface ProgressEntry {
  id: string;
  uid: string;
  date: string;
  weightKg?: number;
  bodyFatPct?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  photoUrl?: string;
  photoAngle?: 'front' | 'side' | 'back';
  notes?: string;
}

export interface PRRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  reps: number;
  estimatedOneRMKg: number;
  achievedAt: Date;
  sessionId: string;
}

export interface NutritionGoal {
  uid: string;
  kcalTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  waterTargetMl: number;
  phase: GoalType;
  weeklyWeightChangeKg: number;
}

export interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
}
