import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useDashboardMetricData } from '@/hooks/use-dashboard-metric-data';
import { ALL_DASHBOARD_METRIC_IDS, resolveHomeDashboardMetrics } from '@/lib/metrics';

export default function MetricsScreen() {
  const router = useRouter();
  const { dashboard, history, profile, wellness, healthStepsWeek } = useDashboardMetricData();

  const allMetrics = useMemo(
    () =>
      resolveHomeDashboardMetrics(
        { dashboard, history, profile: profile ?? null, healthStepsWeek },
        wellness,
        ALL_DASHBOARD_METRIC_IDS,
      ),
    [dashboard, history, profile, wellness, healthStepsWeek],
  );

  return (
    <ScreenContainer scroll={false}>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={AppTheme.colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScreenHeader
        title="All metrics"
        subtitle="Weekly and daily stats from your logs, Apple Health (if enabled), and wellness entries."
      />

      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {allMetrics.map((m) => (
          <View key={m.id} style={[styles.rowCard, m.isPlaceholder && styles.rowCardMuted]}>
            <View style={[styles.rowIcon, { backgroundColor: `${m.iconColor}22` }]}>
              <Ionicons name={m.icon as keyof typeof Ionicons.glyphMap} size={26} color={m.iconColor} />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{m.label}</Text>
              <View style={styles.rowValues}>
                <Text style={styles.rowValue}>{m.value}</Text>
                <Text style={styles.rowUnit}>{m.unit}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  backText: { fontSize: 17, fontWeight: '600', color: AppTheme.colors.primary },
  listScroll: { flex: 1 },
  list: { paddingBottom: 28, gap: 12 },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 16,
  },
  rowCardMuted: { opacity: 0.92 },
  rowIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, minWidth: 0, gap: 6 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.textSecondary },
  rowValues: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  rowValue: { fontSize: 28, fontWeight: '800', color: AppTheme.colors.textPrimary },
  rowUnit: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.textSecondary },
});
