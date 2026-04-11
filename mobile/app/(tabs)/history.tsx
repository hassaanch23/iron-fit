import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SimpleBars } from '@/components/ui/simple-bars';
import { api } from '@/lib/api';
import { getAppleHealthDailyStepsLastNDays, isAppleHealthStepsSyncEnabled } from '@/lib/apple-health-steps';
import type { HistoryPoint } from '@/types/api';

type Timeframe = 'week' | 'month';

function formatPeriodLabel(period: string, timeframe: Timeframe): string {
  if (timeframe === 'week' && period.length > 6) return period.slice(-5);
  if (period.includes('T')) return period.slice(5, 10);
  return period.length > 8 ? period.slice(-8) : period;
}

function toHistoryPointsFromHealth(
  daily: { period: string; steps: number }[],
): HistoryPoint[] {
  return daily.map((d) => ({
    period: d.period,
    steps: d.steps,
    distance_km: 0,
    calories: 0,
    duration_min: 0,
  }));
}

export default function HistoryScreen() {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [apiPoints, setApiPoints] = useState<HistoryPoint[]>([]);
  const [healthChartPoints, setHealthChartPoints] = useState<HistoryPoint[] | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get<{ timeframe: string; points: HistoryPoint[] }>(
        `/analytics/history?timeframe=${timeframe}`,
      );
      setApiPoints(res.data.points);
    } catch {
      setApiPoints([]);
    }

    if (Platform.OS !== 'ios') {
      setHealthChartPoints(null);
      return;
    }
    const sync = await isAppleHealthStepsSyncEnabled();
    if (!sync) {
      setHealthChartPoints(null);
      return;
    }
    const n = timeframe === 'week' ? 7 : 30;
    const daily = await getAppleHealthDailyStepsLastNDays(n);
    setHealthChartPoints(daily ? toHistoryPointsFromHealth(daily) : null);
  }, [timeframe]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  const chartPoints = healthChartPoints ?? apiPoints;
  const stepsFromAppleHealth = healthChartPoints != null;

  const { totalSteps, avgSteps, maxSteps } = useMemo(() => {
    if (!chartPoints.length) return { totalSteps: 0, avgSteps: 0, maxSteps: 0 };
    const total = chartPoints.reduce((s, p) => s + p.steps, 0);
    return {
      totalSteps: total,
      avgSteps: Math.round(total / chartPoints.length),
      maxSteps: Math.max(...chartPoints.map((p) => p.steps)),
    };
  }, [chartPoints]);

  const barValues = chartPoints.length ? chartPoints.map((p) => p.steps) : [];
  const barLabels = chartPoints.length ? chartPoints.map((p) => formatPeriodLabel(p.period, timeframe)) : undefined;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="History"
        subtitle="Track how your movement adds up over time."
      />

      <View style={styles.segment}>
        <TimePill active={timeframe === 'week'} label="Week" onPress={() => setTimeframe('week')} />
        <TimePill active={timeframe === 'month'} label="Month" onPress={() => setTimeframe('month')} />
      </View>

      <View style={styles.statsRow}>
        <StatTile
          icon="walk-outline"
          label="Total steps"
          value={chartPoints.length ? totalSteps.toLocaleString() : '—'}
          tint="#1F0F77"
        />
        <StatTile
          icon="analytics-outline"
          label="Daily avg"
          value={chartPoints.length ? avgSteps.toLocaleString() : '—'}
          tint={AppTheme.colors.primary}
        />
        <StatTile
          icon="trophy-outline"
          label="Best day"
          value={chartPoints.length ? maxSteps.toLocaleString() : '—'}
          tint="#F4B740"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Steps trend</Text>
          <Text style={styles.cardHint}>
            {stepsFromAppleHealth ? 'Apple Health · local days' : 'From your logs'}
          </Text>
        </View>
        {chartPoints.length === 0 ? (
          <EmptyState
            icon="bar-chart-outline"
            title="No history yet"
            description="Log walks and workouts from the Stats tab, or enable Apple Health on iOS in Stats to see steps here."
          />
        ) : (
          <SimpleBars values={barValues} labels={barLabels} />
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Recent highlights</Text>
          <Text style={styles.cardHint}>From your saved logs</Text>
        </View>
        {apiPoints.length === 0 ? (
          <Text style={styles.muted}>Nothing to show yet.</Text>
        ) : (
          <View style={styles.list}>
            {apiPoints
              .slice(-6)
              .reverse()
              .map((p, i) => (
                <View
                  key={p.period}
                  style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={styles.rowLeft}>
                    <View style={styles.rowIcon}>
                      <Ionicons name="walk-outline" size={20} color={AppTheme.colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.rowPeriod}>{formatPeriodLabel(p.period, timeframe)}</Text>
                      <Text style={styles.rowMeta}>
                        {p.distance_km.toFixed(1)} km · {p.calories} kcal
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.rowSteps}>{p.steps.toLocaleString()}</Text>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

function TimePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatTile({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statIcon, { backgroundColor: tint + '18' }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: 10, marginTop: 4 },
  pill: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  pillActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  pillText: { color: AppTheme.colors.textSecondary, fontWeight: '700', fontSize: 15 },
  pillTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statTile: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 12,
    gap: 8,
    minWidth: 0,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { fontSize: 11, color: AppTheme.colors.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: AppTheme.spacing.md,
    gap: 12,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: AppTheme.colors.textPrimary },
  cardHint: { fontSize: 12, color: AppTheme.colors.textSecondary, fontWeight: '500' },
  muted: { color: AppTheme.colors.textSecondary, fontSize: 14, paddingVertical: 8 },
  list: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: AppTheme.colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowPeriod: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.textPrimary },
  rowMeta: { fontSize: 12, color: AppTheme.colors.textSecondary, marginTop: 2 },
  rowSteps: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.primary },
});
