/**
 * Single place to configure which metrics appear on Home and how they resolve.
 * API-backed metrics use `MetricContext.dashboard` / `history`; device-backed use `UserWellnessSnapshot`.
 */

import { AppTheme } from '@/constants/app-theme';
import type { HomeMetricId, MetricContext, ResolvedHomeMetric, UserWellnessSnapshot } from '@/lib/metrics/types';

/** Accent colors per metric (not duplicated in screens). */
export const METRIC_ACCENT: Record<HomeMetricId, string> = {
  steps_daily_avg: '#1F0F77',
  calories_daily_avg: '#F4B740',
  distance_week_km: '#2EBD85',
  active_minutes_week: '#FF9800',
  workouts_week: AppTheme.colors.primary,
  water_today_l: '#2196F3',
  resting_hr_bpm: '#7E5BEF',
};

/**
 * Home row: order and selection. Swap ids or reorder without touching UI components.
 * Available ids: steps_daily_avg, calories_daily_avg, distance_week_km, active_minutes_week,
 * workouts_week, water_today_l, resting_hr_bpm
 */
export const HOME_DASHBOARD_METRIC_IDS: HomeMetricId[] = [
  'steps_daily_avg',
  'calories_daily_avg',
  'water_today_l',
];

function dash(): string {
  return '—';
}

function avgDaily(total: number, days = 7): number {
  return Math.max(0, Math.round(total / days));
}

function resolveSteps(ctx: MetricContext, _w: UserWellnessSnapshot): ResolvedHomeMetric {
  const apiTotal = ctx.dashboard?.total_steps_week ?? 0;
  const total =
    typeof ctx.healthStepsWeek === 'number' && !Number.isNaN(ctx.healthStepsWeek) ? ctx.healthStepsWeek : apiTotal;
  const v = avgDaily(total);
  return {
    id: 'steps_daily_avg',
    label: 'Steps',
    value: v.toLocaleString(),
    unit: '/day',
    icon: 'walk-outline',
    iconColor: METRIC_ACCENT.steps_daily_avg,
  };
}

function resolveCalories(ctx: MetricContext, _w: UserWellnessSnapshot): ResolvedHomeMetric {
  const total = ctx.dashboard?.total_calories_week ?? 0;
  const v = avgDaily(total);
  return {
    id: 'calories_daily_avg',
    label: 'Calories',
    value: `${v}`,
    unit: '/day',
    icon: 'flame',
    iconColor: METRIC_ACCENT.calories_daily_avg,
  };
}

function resolveDistanceWeek(ctx: MetricContext, _w: UserWellnessSnapshot): ResolvedHomeMetric {
  const km = ctx.dashboard?.total_distance_week ?? 0;
  return {
    id: 'distance_week_km',
    label: 'Distance',
    value: km >= 10 ? km.toFixed(1) : km.toFixed(2),
    unit: 'km · week',
    icon: 'navigate-outline',
    iconColor: METRIC_ACCENT.distance_week_km,
  };
}

function resolveActiveWeek(ctx: MetricContext, _w: UserWellnessSnapshot): ResolvedHomeMetric {
  const min = ctx.dashboard?.total_duration_week ?? 0;
  return {
    id: 'active_minutes_week',
    label: 'Active',
    value: `${min}`,
    unit: 'min · week',
    icon: 'timer-outline',
    iconColor: METRIC_ACCENT.active_minutes_week,
  };
}

function resolveWorkoutsWeek(ctx: MetricContext, _w: UserWellnessSnapshot): ResolvedHomeMetric {
  const n = ctx.dashboard?.workouts_week ?? 0;
  return {
    id: 'workouts_week',
    label: 'Sessions',
    value: `${n}`,
    unit: '· week',
    icon: 'fitness-outline',
    iconColor: METRIC_ACCENT.workouts_week,
  };
}

function resolveWater(_ctx: MetricContext, w: UserWellnessSnapshot): ResolvedHomeMetric {
  const has = typeof w.waterLitersToday === 'number';
  return {
    id: 'water_today_l',
    label: 'Water',
    value: has ? w.waterLitersToday!.toFixed(w.waterLitersToday! >= 10 ? 1 : 2) : dash(),
    unit: 'L · today',
    icon: 'water',
    iconColor: METRIC_ACCENT.water_today_l,
    isPlaceholder: !has,
  };
}

function resolveRestingHr(_ctx: MetricContext, w: UserWellnessSnapshot): ResolvedHomeMetric {
  const has = typeof w.restingHeartRateBpm === 'number';
  return {
    id: 'resting_hr_bpm',
    label: 'Resting HR',
    value: has ? `${w.restingHeartRateBpm}` : dash(),
    unit: 'bpm',
    icon: 'heart',
    iconColor: METRIC_ACCENT.resting_hr_bpm,
    isPlaceholder: !has,
  };
}

const RESOLVERS: Record<HomeMetricId, (ctx: MetricContext, w: UserWellnessSnapshot) => ResolvedHomeMetric> = {
  steps_daily_avg: resolveSteps,
  calories_daily_avg: resolveCalories,
  distance_week_km: resolveDistanceWeek,
  active_minutes_week: resolveActiveWeek,
  workouts_week: resolveWorkoutsWeek,
  water_today_l: resolveWater,
  resting_hr_bpm: resolveRestingHr,
};

export function resolveHomeDashboardMetrics(
  ctx: MetricContext,
  wellness: UserWellnessSnapshot,
): ResolvedHomeMetric[] {
  return HOME_DASHBOARD_METRIC_IDS.map((id) => RESOLVERS[id](ctx, wellness));
}
