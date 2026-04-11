import type { Dashboard, HistoryPoint, Profile } from '@/types/api';

/** Extend this union when adding new dashboard metrics. */
export type HomeMetricId =
  | 'steps_daily_avg'
  | 'calories_daily_avg'
  | 'distance_week_km'
  | 'active_minutes_week'
  | 'workouts_week'
  | 'water_today_l'
  | 'resting_hr_bpm';

export type MetricContext = {
  dashboard: Dashboard | null;
  history: HistoryPoint[];
  profile: Profile | null;
  /** iOS: when Apple Health sync is on, rolling 7-day step total from HealthKit (matches Health app sources). */
  healthStepsWeek?: number | null;
};

/** Values the API does not provide; stored on device. */
export type UserWellnessSnapshot = {
  /** Liters logged today; `null` if nothing logged yet today */
  waterLitersToday: number | null;
  restingHeartRateBpm: number | null;
};

export type ResolvedHomeMetric = {
  id: HomeMetricId;
  label: string;
  value: string;
  unit: string;
  /** Ionicons glyph name */
  icon: string;
  iconColor: string;
  /** True when value is a dash placeholder (no data yet). */
  isPlaceholder?: boolean;
};
