import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = '@ironfit_plans_v1';

export type PlanItem = {
  id: string;
  /** Local calendar date YYYY-MM-DD */
  date: string;
  title: string;
  durationMin: number | null;
  completed: boolean;
  /** Planned or logged sets (null if not specified) */
  sets: number | null;
  /** Reps per set (null if not specified) */
  reps: number | null;
  /** Optional extra notes */
  notes: string;
};

export type PlanExerciseInput = {
  title: string;
  durationMin: number | null;
  sets: number | null;
  reps: number | null;
  notes: string;
};

function parsePositiveInt(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(999, Math.round(n));
}

export function parseSetsRepsFromStrings(setsStr: string, repsStr: string): { sets: number | null; reps: number | null } {
  return { sets: parsePositiveInt(setsStr), reps: parsePositiveInt(repsStr) };
}

function normalizePlanItem(raw: Record<string, unknown>): PlanItem | null {
  if (typeof raw.id !== 'string' || typeof raw.date !== 'string' || typeof raw.title !== 'string') return null;
  const durationMin =
    raw.durationMin === null || typeof raw.durationMin === 'number' ? (raw.durationMin as number | null) : null;
  const completed = typeof raw.completed === 'boolean' ? raw.completed : false;
  const sets = typeof raw.sets === 'number' && raw.sets > 0 ? Math.min(999, Math.round(raw.sets)) : null;
  const reps = typeof raw.reps === 'number' && raw.reps > 0 ? Math.min(9999, Math.round(raw.reps)) : null;
  const notes = typeof raw.notes === 'string' ? raw.notes : '';
  return {
    id: raw.id,
    date: raw.date,
    title: raw.title,
    durationMin,
    completed,
    sets,
    reps,
    notes,
  };
}

export async function loadPlans(): Promise<PlanItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: PlanItem[] = [];
    for (const x of parsed) {
      if (x === null || typeof x !== 'object') continue;
      const n = normalizePlanItem(x as Record<string, unknown>);
      if (n) out.push(n);
    }
    return out;
  } catch {
    return [];
  }
}

export async function savePlans(items: PlanItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function addPlan(
  input: Omit<PlanItem, 'id' | 'completed'> & { completed?: boolean },
): Promise<PlanItem[]> {
  return addPlansBatch(input.date, [
    {
      title: input.title,
      durationMin: input.durationMin,
      sets: input.sets ?? null,
      reps: input.reps ?? null,
      notes: input.notes ?? '',
      completed: input.completed,
    },
  ]);
}

export async function addPlansBatch(
  date: string,
  inputs: (PlanExerciseInput & { completed?: boolean })[],
): Promise<PlanItem[]> {
  const items = await loadPlans();
  const additions: PlanItem[] = inputs
    .filter((i) => i.title.trim().length > 0)
    .map((input) => ({
      id: Crypto.randomUUID(),
      date,
      title: input.title.trim(),
      durationMin: input.durationMin,
      completed: input.completed ?? false,
      sets: input.sets,
      reps: input.reps,
      notes: input.notes.trim(),
    }));
  if (additions.length === 0) return items;
  const merged = [...items, ...additions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  );
  await savePlans(merged);
  return merged;
}

export async function togglePlanComplete(id: string): Promise<PlanItem[]> {
  const items = await loadPlans();
  const next = items.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p));
  await savePlans(next);
  return next;
}

export async function deletePlan(id: string): Promise<PlanItem[]> {
  const items = await loadPlans();
  const next = items.filter((p) => p.id !== id);
  await savePlans(next);
  return next;
}

/** Monday 00:00:00 local */
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
