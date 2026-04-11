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
  /** Logged when marked done (required for completed) */
  sets: number | null;
  reps: number | null;
  notes: string;
};

/** Add-to-plan: exercise name only. Sets/reps/notes are logged when you mark done. */
export type PlanTitleInput = {
  title: string;
};

function clampSetsReps(sets: number, reps: number): { sets: number; reps: number } {
  return {
    sets: Math.min(999, Math.max(1, Math.round(sets))),
    reps: Math.min(9999, Math.max(1, Math.round(reps))),
  };
}

function parsePositiveInt(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function parseSetsRepsFromStrings(setsStr: string, repsStr: string): { sets: number | null; reps: number | null } {
  const sets = parsePositiveInt(setsStr);
  const reps = parsePositiveInt(repsStr);
  return { sets, reps };
}

function normalizePlanItem(raw: Record<string, unknown>): PlanItem | null {
  if (typeof raw.id !== 'string' || typeof raw.date !== 'string' || typeof raw.title !== 'string') return null;
  const durationMin =
    raw.durationMin === null || typeof raw.durationMin === 'number' ? (raw.durationMin as number | null) : null;
  let completed = typeof raw.completed === 'boolean' ? raw.completed : false;
  const sets = typeof raw.sets === 'number' && raw.sets > 0 ? Math.min(999, Math.round(raw.sets)) : null;
  const reps = typeof raw.reps === 'number' && raw.reps > 0 ? Math.min(9999, Math.round(raw.reps)) : null;
  const notes = typeof raw.notes === 'string' ? raw.notes : '';
  if (completed && (sets == null || reps == null)) {
    completed = false;
  }
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

export async function addPlan(input: { date: string; title: string }): Promise<PlanItem[]> {
  return addPlansBatch(input.date, [{ title: input.title }]);
}

export async function addPlansBatch(date: string, inputs: PlanTitleInput[]): Promise<PlanItem[]> {
  const items = await loadPlans();
  const additions: PlanItem[] = inputs
    .filter((i) => i.title.trim().length > 0)
    .map((input) => ({
      id: Crypto.randomUUID(),
      date,
      title: input.title.trim(),
      durationMin: null,
      completed: false,
      sets: null,
      reps: null,
      notes: '',
    }));
  if (additions.length === 0) return items;
  const merged = [...items, ...additions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  );
  await savePlans(merged);
  return merged;
}

export async function completePlanItem(
  id: string,
  log: { sets: number; reps: number; notes?: string },
): Promise<PlanItem[]> {
  const { sets, reps } = clampSetsReps(log.sets, log.reps);
  const items = await loadPlans();
  const next = items.map((p) =>
    p.id === id
      ? {
          ...p,
          completed: true,
          sets,
          reps,
          notes: (log.notes ?? '').trim(),
        }
      : p,
  );
  await savePlans(next);
  return next;
}

export async function uncompletePlanItem(id: string): Promise<PlanItem[]> {
  const items = await loadPlans();
  const next = items.map((p) =>
    p.id === id
      ? {
          ...p,
          completed: false,
          sets: null,
          reps: null,
          notes: '',
        }
      : p,
  );
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
