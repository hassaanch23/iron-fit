export type { HomeMetricId, MetricContext, ResolvedHomeMetric, UserWellnessSnapshot } from '@/lib/metrics/types';
export { HOME_DASHBOARD_METRIC_IDS, METRIC_ACCENT, resolveHomeDashboardMetrics } from '@/lib/metrics/definitions';
export {
  addWaterLitersToday,
  loadWellnessSnapshot,
  setRestingHeartRateBpm,
} from '@/lib/metrics/wellness-storage';
