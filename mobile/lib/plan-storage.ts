import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = '@ironfit_plans_v2';
const LEGACY_KEY = '@ironfit_plans_v1';

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Cardio',
  'Full Body',
] as const;

export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Chest: '#E74C3C',
  Back: '#3498DB',
  Shoulders: '#F39C12',
  Biceps: '#2ECC71',
  Triceps: '#9B59B6',
  Legs: '#1ABC9C',
  Glutes: '#E67E22',
  Core: '#34495E',
  Cardio: '#E91E63',
  'Full Body': '#607D8B',
};

export type SetLog = {
  reps: number;
  weight?: number;
  unit?: 'kg' | 'lbs';
  note?: string;
};

export type PlanItem = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  muscleGroup: string;
  title: string;
  completed: boolean;
  sets: SetLog[];
  notes: string;
  /** Backend activity ID — set when synced, null when not yet synced or cleared */
  activityId?: number | null;
  /** ISO timestamp when the first set was logged — used to compute real workout duration */
  startedAt?: string | null;
};

export type PlanExerciseInput = {
  muscleGroup: string;
  title: string;
};

/* ------------------------------------------------------------------ */
/*  Normalization & migration                                          */
/* ------------------------------------------------------------------ */

function normalizePlanItem(raw: Record<string, unknown>): PlanItem | null {
  if (typeof raw.id !== 'string' || typeof raw.date !== 'string' || typeof raw.title !== 'string') return null;
  const muscleGroup = typeof raw.muscleGroup === 'string' && raw.muscleGroup ? raw.muscleGroup : 'Uncategorized';
  const notes = typeof raw.notes === 'string' ? raw.notes : '';
  const sets: SetLog[] = [];
  if (Array.isArray(raw.sets)) {
    for (const s of raw.sets) {
      if (s && typeof s === 'object' && 'reps' in s && typeof (s as Record<string, unknown>).reps === 'number') {
        const r = s as Record<string, unknown>;
        const entry: SetLog = { reps: Math.max(1, Math.round(r.reps as number)) };
        if (typeof r.weight === 'number' && r.weight > 0) entry.weight = r.weight;
        if (r.unit === 'kg' || r.unit === 'lbs') entry.unit = r.unit;
        if (typeof r.note === 'string' && r.note) entry.note = r.note;
        sets.push(entry);
      }
    }
  }
  const activityId = typeof raw.activityId === 'number' ? raw.activityId : null;
  const startedAt = typeof raw.startedAt === 'string' ? raw.startedAt : null;
  return { id: raw.id, date: raw.date, muscleGroup, title: raw.title, completed: sets.length > 0, sets, notes, activityId, startedAt };
}

function migrateLegacyItem(raw: Record<string, unknown>): PlanItem | null {
  if (typeof raw.id !== 'string' || typeof raw.date !== 'string' || typeof raw.title !== 'string') return null;
  const oldSets = typeof raw.sets === 'number' && raw.sets > 0 ? Math.round(raw.sets) : 0;
  const oldReps = typeof raw.reps === 'number' && raw.reps > 0 ? Math.round(raw.reps) : 0;
  const notes = typeof raw.notes === 'string' ? raw.notes : '';
  const sets: SetLog[] = oldSets > 0 && oldReps > 0 ? Array.from({ length: oldSets }, () => ({ reps: oldReps })) : [];
  return {
    id: raw.id,
    date: raw.date,
    muscleGroup: 'Uncategorized',
    title: raw.title,
    completed: sets.length > 0,
    sets,
    notes,
  };
}

function parseArray(json: string): Record<string, unknown>[] {
  const parsed = JSON.parse(json) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object');
}

/* ------------------------------------------------------------------ */
/*  CRUD                                                               */
/* ------------------------------------------------------------------ */

export async function loadPlans(): Promise<PlanItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      return parseArray(raw).map(normalizePlanItem).filter((n): n is PlanItem => n !== null);
    }
    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (!legacy) return [];
    const migrated = parseArray(legacy).map(migrateLegacyItem).filter((n): n is PlanItem => n !== null);
    if (migrated.length > 0) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
}

export async function savePlans(items: PlanItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function sortPlans(items: PlanItem[]): PlanItem[] {
  return [...items].sort(
    (a, b) => a.date.localeCompare(b.date) || a.muscleGroup.localeCompare(b.muscleGroup) || a.title.localeCompare(b.title),
  );
}

export async function addPlansBatch(date: string, inputs: PlanExerciseInput[]): Promise<PlanItem[]> {
  const items = await loadPlans();
  const additions: PlanItem[] = inputs
    .filter((i) => i.title.trim().length > 0)
    .map((input) => ({
      id: Crypto.randomUUID(),
      date,
      muscleGroup: input.muscleGroup || 'Uncategorized',
      title: input.title.trim(),
      completed: false,
      sets: [],
      notes: '',
    }));
  if (additions.length === 0) return items;
  const merged = sortPlans([...items, ...additions]);
  await savePlans(merged);
  return merged;
}

export async function addSetToExercise(id: string, set: SetLog): Promise<PlanItem[]> {
  const items = await loadPlans();
  const entry: SetLog = { reps: Math.max(1, Math.round(set.reps)) };
  if (set.weight != null && set.weight > 0) entry.weight = set.weight;
  if (set.unit) entry.unit = set.unit;
  if (set.note?.trim()) entry.note = set.note.trim();
  const next = items.map((p) => {
    if (p.id !== id) return p;
    const isFirst = p.sets.length === 0;
    return { ...p, sets: [...p.sets, entry], completed: true, startedAt: isFirst ? new Date().toISOString() : p.startedAt };
  });
  await savePlans(next);
  return next;
}

export async function updateSetInExercise(id: string, setIndex: number, set: SetLog): Promise<PlanItem[]> {
  const items = await loadPlans();
  const next = items.map((p) => {
    if (p.id !== id) return p;
    const newSets = p.sets.map((s, i) => {
      if (i !== setIndex) return s;
      const entry: SetLog = { reps: Math.max(1, Math.round(set.reps)) };
      if (set.weight != null && set.weight > 0) entry.weight = set.weight;
      if (set.unit) entry.unit = set.unit;
      if (set.note?.trim()) entry.note = set.note.trim();
      return entry;
    });
    return { ...p, sets: newSets };
  });
  await savePlans(next);
  return next;
}

export async function setPlanActivityId(planId: string, activityId: number | null): Promise<PlanItem[]> {
  const items = await loadPlans();
  const next = items.map((p) => (p.id === planId ? { ...p, activityId } : p));
  await savePlans(next);
  return next;
}

export async function removeSetFromExercise(id: string, setIndex: number): Promise<PlanItem[]> {
  const items = await loadPlans();
  const next = items.map((p) => {
    if (p.id !== id) return p;
    const newSets = p.sets.filter((_, i) => i !== setIndex);
    return { ...p, sets: newSets, completed: newSets.length > 0 };
  });
  await savePlans(next);
  return next;
}

export async function clearExerciseSets(id: string): Promise<PlanItem[]> {
  const items = await loadPlans();
  const next = items.map((p) => (p.id === id ? { ...p, sets: [], completed: false, startedAt: null } : p));
  await savePlans(next);
  return next;
}

export async function renamePlanExercise(id: string, title: string): Promise<PlanItem[]> {
  const items = await loadPlans();
  const trimmed = title.trim();
  if (!trimmed) return items;
  const next = items.map((p) => (p.id === id ? { ...p, title: trimmed } : p));
  await savePlans(next);
  return next;
}

export async function addExerciseToGroup(date: string, muscleGroup: string, title: string): Promise<PlanItem[]> {
  const trimmed = title.trim();
  if (!trimmed) return loadPlans();
  const items = await loadPlans();
  const item: PlanItem = {
    id: Crypto.randomUUID(),
    date,
    muscleGroup,
    title: trimmed,
    completed: false,
    sets: [],
    notes: '',
  };
  const merged = sortPlans([...items, item]);
  await savePlans(merged);
  return merged;
}

export async function deletePlan(id: string): Promise<PlanItem[]> {
  const items = await loadPlans();
  const next = items.filter((p) => p.id !== id);
  await savePlans(next);
  return next;
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

export function startOfWeekMonday(d = new Date()): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const day = c.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  c.setDate(c.getDate() + diff);
  return c;
}

export function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function muscleGroupColor(group: string): string {
  return MUSCLE_GROUP_COLORS[group] ?? '#78909C';
}
