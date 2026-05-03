import { api } from '@/lib/api';
import { setPlanActivityId, type PlanItem, type SetLog } from '@/lib/plan-storage';

/**
 * Sync a completed plan exercise to the backend as an Activity.
 * Called when the first set is logged on an exercise.
 * Returns updated plans array with activityId set, or the original if sync fails.
 */
function elapsedMinutes(startedAt: string | null | undefined): number {
  if (!startedAt) return 1;
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 60_000;
  return Math.max(1, Math.round(elapsed));
}

export async function syncPlanExercise(plan: PlanItem): Promise<PlanItem[]> {
  if (plan.activityId) return setPlanActivityId(plan.id, plan.activityId);
  try {
    const totalReps = plan.sets.reduce((sum, s) => sum + s.reps, 0);
    const durationEstimate = elapsedMinutes(plan.startedAt);
    const caloriesEstimate = totalReps * 0.5;

    const res = await api.post<{ id: number }>('/activities', {
      kind: `strength:${plan.muscleGroup}:${plan.title}`,
      steps: 0,
      distance_km: 0,
      calories: Math.round(caloriesEstimate),
      duration_min: durationEstimate,
      started_at: plan.startedAt ?? `${plan.date}T${new Date().toISOString().slice(11)}`,
    });
    return setPlanActivityId(plan.id, res.data.id);
  } catch {
    return setPlanActivityId(plan.id, null);
  }
}

/**
 * Remove the synced activity from the backend when sets are cleared.
 * Returns updated plans array with activityId cleared.
 */
export async function unsyncPlanExercise(plan: PlanItem): Promise<PlanItem[]> {
  if (!plan.activityId) return setPlanActivityId(plan.id, null);
  try {
    await api.delete(`/activities/${plan.activityId}`);
  } catch {
    // Activity may already be deleted; that's fine
  }
  return setPlanActivityId(plan.id, null);
}

/**
 * Update an existing synced activity after more sets are logged.
 * Re-POSTs the activity data (delete old + create new) since there's no PUT endpoint.
 */
export async function resyncPlanExercise(plan: PlanItem): Promise<PlanItem[]> {
  if (plan.activityId) {
    try {
      await api.delete(`/activities/${plan.activityId}`);
    } catch {
      // ignore
    }
  }
  const totalReps = plan.sets.reduce((sum, s) => sum + s.reps, 0);
  const durationEstimate = elapsedMinutes(plan.startedAt);
  const caloriesEstimate = totalReps * 0.5;

  try {
    const res = await api.post<{ id: number }>('/activities', {
      kind: `strength:${plan.muscleGroup}:${plan.title}`,
      steps: 0,
      distance_km: 0,
      calories: Math.round(caloriesEstimate),
      duration_min: durationEstimate,
      started_at: plan.startedAt ?? `${plan.date}T${new Date().toISOString().slice(11)}`,
    });
    return setPlanActivityId(plan.id, res.data.id);
  } catch {
    return setPlanActivityId(plan.id, null);
  }
}

/** Parse a strength activity kind string → { muscleGroup, exercise } */
export function parseStrengthKind(kind: string): { muscleGroup: string; exercise: string } | null {
  if (!kind.startsWith('strength:')) return null;
  const parts = kind.split(':');
  if (parts.length < 3) return null;
  return { muscleGroup: parts[1], exercise: parts.slice(2).join(':') };
}

/** Format a set log for display: "12 reps × 60 kg" */
export function formatSetSummary(sets: SetLog[]): string {
  if (sets.length === 0) return '';
  const totalSets = sets.length;
  const totalReps = sets.reduce((s, x) => s + x.reps, 0);
  return `${totalSets} set${totalSets !== 1 ? 's' : ''} · ${totalReps} reps`;
}
