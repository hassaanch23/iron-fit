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
import { parseStrengthKind } from '@/lib/plan-sync';
import { muscleGroupColor } from '@/lib/plan-storage';
import type { Activity, HistoryPoint } from '@/types/api';

type Timeframe = 'week' | 'month';
type ChartMode = 'steps' | 'calories' | 'duration';

function formatPeriodLabel(period: string, timeframe: Timeframe): string {
  if (timeframe === 'week' && period.length > 6) return period.slice(-5);
  if (period.includes('T')) return period.slice(5, 10);
  return period.length > 8 ? period.slice(-8) : period;
}

function toHistoryPointsFromHealth(daily: { period: string; steps: number }[]): HistoryPoint[] {
  return daily.map((d) => ({ period: d.period, steps: d.steps, distance_km: 0, calories: 0, duration_min: 0 }));
}

export default function HistoryScreen() {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [chartMode, setChartMode] = useState<ChartMode>('steps');
  const [apiPoints, setApiPoints] = useState<HistoryPoint[]>([]);
  const [healthChartPoints, setHealthChartPoints] = useState<HistoryPoint[] | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get<{ timeframe: string; points: HistoryPoint[] }>(
        `/analytics/history?timeframe=${timeframe}`,
      );
      setApiPoints(res.data.points);
    } catch {
      setApiPoints([]);
    }

    if (Platform.OS !== 'ios') { setHealthChartPoints(null); return; }
    const sync = await isAppleHealthStepsSyncEnabled();
    if (!sync) { setHealthChartPoints(null); return; }
    const n = timeframe === 'week' ? 7 : 30;
    const daily = await getAppleHealthDailyStepsLastNDays(n);
    setHealthChartPoints(daily ? toHistoryPointsFromHealth(daily) : null);
  }, [timeframe]);

  const loadRecentActivities = useCallback(async () => {
    try {
      const res = await api.get<Activity[]>('/activities?limit=10');
      setRecentActivities(res.data);
    } catch {
      setRecentActivities([]);
    }
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);
  useEffect(() => { void loadRecentActivities(); }, [loadRecentActivities]);
  useFocusEffect(useCallback(() => { void loadHistory(); void loadRecentActivities(); }, [loadHistory, loadRecentActivities]));

  const chartPoints = healthChartPoints ?? apiPoints;
  const stepsFromAppleHealth = healthChartPoints != null;

  const stats = useMemo(() => {
    if (!chartPoints.length) return { totalSteps: 0, avgSteps: 0, totalCal: 0, totalDur: 0, activeDays: 0 };
    const totalSteps = chartPoints.reduce((s, p) => s + p.steps, 0);
    const totalCal = chartPoints.reduce((s, p) => s + p.calories, 0);
    const totalDur = chartPoints.reduce((s, p) => s + p.duration_min, 0);
    const activeDays = chartPoints.filter((p) => p.steps > 0 || p.calories > 0 || p.duration_min > 0).length;
    return { totalSteps, avgSteps: Math.round(totalSteps / chartPoints.length), totalCal, totalDur, activeDays };
  }, [chartPoints]);

  const chartValues = useMemo(() => {
    if (!chartPoints.length) return [];
    if (chartMode === 'calories') return chartPoints.map((p) => p.calories);
    if (chartMode === 'duration') return chartPoints.map((p) => p.duration_min);
    return chartPoints.map((p) => p.steps);
  }, [chartPoints, chartMode]);

  const barLabels = chartPoints.length ? chartPoints.map((p) => formatPeriodLabel(p.period, timeframe)) : undefined;

  const strengthRecent = useMemo(() => recentActivities.filter((a) => parseStrengthKind(a.kind)), [recentActivities]);
  const cardioRecent = useMemo(() => recentActivities.filter((a) => !parseStrengthKind(a.kind)), [recentActivities]);

  return (
    <ScreenContainer>
      <ScreenHeader title="History" subtitle="Track your progress over time." />

      {/* Timeframe pills */}
      <View style={st.segment}>
        <TimePill active={timeframe === 'week'} label="Week" onPress={() => setTimeframe('week')} />
        <TimePill active={timeframe === 'month'} label="Month" onPress={() => setTimeframe('month')} />
      </View>

      {/* Summary tiles */}
      <View style={st.tilesRow}>
        <MiniTile icon="footsteps-outline" value={stats.totalSteps.toLocaleString()} label="Steps" tint="#1F0F77" />
        <MiniTile icon="flame-outline" value={String(Math.round(stats.totalCal))} label="Calories" tint="#E74C3C" />
        <MiniTile icon="time-outline" value={`${stats.totalDur}`} label="Minutes" tint="#3498DB" />
        <MiniTile icon="calendar-outline" value={String(stats.activeDays)} label="Active" tint={AppTheme.colors.success} />
      </View>

      {/* Chart */}
      <View style={st.card}>
        <View style={st.cardHead}>
          <Text style={st.cardTitle}>
            {chartMode === 'steps' ? 'Steps' : chartMode === 'calories' ? 'Calories' : 'Duration'} trend
          </Text>
          <Text style={st.cardHint}>
            {stepsFromAppleHealth && chartMode === 'steps' ? 'Apple Health' : 'From logs'}
          </Text>
        </View>
        <View style={st.chartModePills}>
          {(['steps', 'calories', 'duration'] as ChartMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[st.chartPill, chartMode === m && st.chartPillActive]}
              onPress={() => setChartMode(m)}
              activeOpacity={0.8}>
              <Text style={[st.chartPillText, chartMode === m && st.chartPillTextActive]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {chartValues.length === 0 ? (
          <EmptyState
            icon="bar-chart-outline"
            title="No data yet"
            description="Log workouts in Plans or cardio in Stats to see trends here."
          />
        ) : (
          <SimpleBars values={chartValues} labels={barLabels} />
        )}
      </View>

      {/* Recent strength */}
      {strengthRecent.length > 0 && (
        <View style={st.card}>
          <View style={st.cardHead}>
            <Text style={st.cardTitle}>Recent workouts</Text>
            <Text style={st.cardHint}>{strengthRecent.length} session{strengthRecent.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={st.list}>
            {strengthRecent.slice(0, 5).map((a, i) => {
              const parsed = parseStrengthKind(a.kind);
              if (!parsed) return null;
              const tint = muscleGroupColor(parsed.muscleGroup);
              return (
                <View key={a.id} style={[st.row, i > 0 && st.rowBorder]}>
                  <View style={[st.rowIcon, { backgroundColor: tint + '18' }]}>
                    <Ionicons name="barbell-outline" size={18} color={tint} />
                  </View>
                  <View style={st.rowBody}>
                    <Text style={st.rowMain} numberOfLines={1}>{parsed.exercise}</Text>
                    <Text style={st.rowSub}>
                      <Text style={{ color: tint, fontWeight: '700' }}>{parsed.muscleGroup}</Text>
                      {' · '}{a.duration_min} min
                    </Text>
                  </View>
                  <Text style={st.rowDate}>
                    {new Date(a.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Recent cardio */}
      {cardioRecent.length > 0 && (
        <View style={st.card}>
          <View style={st.cardHead}>
            <Text style={st.cardTitle}>Recent cardio</Text>
            <Text style={st.cardHint}>{cardioRecent.length} log{cardioRecent.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={st.list}>
            {cardioRecent.slice(0, 5).map((a, i) => (
              <View key={a.id} style={[st.row, i > 0 && st.rowBorder]}>
                <View style={st.rowIcon}>
                  <Ionicons name="walk-outline" size={18} color={AppTheme.colors.primary} />
                </View>
                <View style={st.rowBody}>
                  <Text style={st.rowMain}>{a.steps.toLocaleString()} steps · {a.distance_km} km</Text>
                  <Text style={st.rowSub}>{a.duration_min} min</Text>
                </View>
                <Text style={st.rowDate}>
                  {new Date(a.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {recentActivities.length === 0 && chartPoints.length === 0 && (
        <View style={st.card}>
          <EmptyState
            icon="analytics-outline"
            title="No history yet"
            description="Complete exercises in Plans or log cardio in Stats to build your history."
          />
        </View>
      )}
    </ScreenContainer>
  );
}

function TimePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[st.pill, active && st.pillActive]}>
      <Text style={[st.pillText, active && st.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MiniTile({ icon, value, label, tint }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; tint: string }) {
  return (
    <View style={st.miniTile}>
      <Ionicons name={icon} size={16} color={tint} />
      <Text style={st.miniTileVal}>{value}</Text>
      <Text style={st.miniTileLabel}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  segment: { flexDirection: 'row', gap: 10, marginTop: 4 },
  pill: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  pillActive: { backgroundColor: AppTheme.colors.primary, borderColor: AppTheme.colors.primary },
  pillText: { color: AppTheme.colors.textSecondary, fontWeight: '700', fontSize: 15 },
  pillTextActive: { color: '#fff' },

  tilesRow: { flexDirection: 'row', gap: 8 },
  miniTile: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  miniTileVal: { fontSize: 15, fontWeight: '800', color: AppTheme.colors.textPrimary },
  miniTileLabel: { fontSize: 10, fontWeight: '600', color: AppTheme.colors.textSecondary },

  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 16,
    gap: 10,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cardTitle: { fontSize: 17, fontWeight: '800', color: AppTheme.colors.textPrimary },
  cardHint: { fontSize: 12, color: AppTheme.colors.textSecondary, fontWeight: '500' },

  chartModePills: { flexDirection: 'row', gap: 6 },
  chartPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: AppTheme.colors.background,
  },
  chartPillActive: { backgroundColor: AppTheme.colors.primary },
  chartPillText: { fontSize: 12, fontWeight: '700', color: AppTheme.colors.textSecondary },
  chartPillTextActive: { color: '#fff' },

  list: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: AppTheme.colors.border },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowMain: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textPrimary },
  rowSub: { fontSize: 12, color: AppTheme.colors.textSecondary, marginTop: 2 },
  rowDate: { fontSize: 12, fontWeight: '600', color: AppTheme.colors.textSecondary },
});
