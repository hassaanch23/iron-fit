import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SuggestedWorkoutCard } from '@/components/ui/suggested-workout-card';
import { calcBmi, getBmiCategory, getBmiInfo } from '@/lib/bmi';
import { workoutsForBmi } from '@/lib/suggested-workouts';
import { useDashboardMetricData } from '@/hooks/use-dashboard-metric-data';
import { resolveHomeDashboardMetrics } from '@/lib/metrics';
import type { HistoryPoint } from '@/types/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, dashboard, history, wellness, healthStepsWeek } = useDashboardMetricData();

  const homeMetrics = useMemo(
    () =>
      resolveHomeDashboardMetrics(
        { dashboard, history, profile: profile ?? null, healthStepsWeek },
        wellness,
      ),
    [dashboard, history, profile, wellness, healthStepsWeek],
  );

  const bmi = calcBmi(profile?.weight_kg ?? null, profile?.height_cm ?? null);
  const { workouts: suggestedWorkouts, sectionHint } = workoutsForBmi(bmi);
  const workoutAccent = bmi !== null ? getBmiInfo(bmi).color : AppTheme.colors.primary;

  const bmiMenuSub =
    bmi !== null
      ? `${bmi.toFixed(1)} kg/m² · ${getBmiCategory(bmi).label}`
      : 'Gauge, category, and healthy range';

  return (
    <ScreenContainer>
      <ScreenHeader
        title={`Hi, ${profile?.name || 'Athlete'}`}
        subtitle="Here’s your snapshot for today."
      />

      <SectionHeaderWithSeeAll
        title="Your Metrics"
        onSeeAll={() => router.push('/metrics')}
        style={styles.sectionHeaderFirst}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.metricsScroll}
        contentContainerStyle={styles.metricsScrollContent}>
        {homeMetrics.map((m) => (
          <View key={m.id} style={styles.metricCardWrap}>
            <MetricCard
              label={m.label}
              value={m.value}
              unit={m.unit}
              icon={m.icon as keyof typeof Ionicons.glyphMap}
              iconColor={m.iconColor}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.homeMenuItem}
        activeOpacity={0.7}
        onPress={() => router.push('/bmi')}
        accessibilityRole="button"
        accessibilityLabel="BMI insights">
        <View style={styles.homeMenuIcon}>
          <Ionicons name="body-outline" size={22} color={AppTheme.colors.primary} />
        </View>
        <View style={styles.homeMenuText}>
          <Text style={styles.homeMenuLabel}>BMI insights</Text>
          <Text style={styles.homeMenuSub}>{bmiMenuSub}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeMenuItem}
        activeOpacity={0.7}
        onPress={() => router.push('/strength')}
        accessibilityRole="button"
        accessibilityLabel="Exercise library with video demos">
        <View style={styles.homeMenuIcon}>
          <Ionicons name="fitness-outline" size={22} color={AppTheme.colors.primary} />
        </View>
        <View style={styles.homeMenuText}>
          <Text style={styles.homeMenuLabel}>Exercise library</Text>
          <Text style={styles.homeMenuSub}>Video demos, form cues, and full exercise list</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <View style={styles.workoutSection}>
        <SectionHeaderWithSeeAll
          title="Suggested Workouts"
          onSeeAll={() => router.push('/suggested-workouts')}
        />
        <Text style={styles.workoutSectionHint}>{sectionHint}</Text>
      </View>
      {suggestedWorkouts.map((w) => (
        <SuggestedWorkoutCard
          key={w.title}
          title={w.title}
          subtitle={w.subtitle}
          accentColor={workoutAccent}
          onStart={() =>
            router.push({
              pathname: '/workout-session',
              params: {
                title: w.title,
                subtitle: w.subtitle,
                ids: w.demoExerciseIds.join(','),
              },
            })
          }
        />
      ))}

      {history.length === 0 && (
        <Text style={styles.helperText}>
          No logged activity this week yet—add steps or workouts in Stats to fill steps and calories. Log water there too.
        </Text>
      )}
    </ScreenContainer>
  );
}

function SectionHeaderWithSeeAll({
  title,
  onSeeAll,
  style,
}: {
  title: string;
  onSeeAll: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeaderRow, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity
        onPress={onSeeAll}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        activeOpacity={0.65}
        accessibilityRole="button"
        accessibilityLabel={`See all ${title}`}>
        <Text style={styles.sectionSeeAll}>see all</Text>
      </TouchableOpacity>
    </View>
  );
}

function MetricCard({
  label,
  value,
  unit,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.metricBottom}>
        <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
          {value}
        </Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    gap: 12,
  },
  homeMenuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeMenuText: { flex: 1, gap: 2 },
  homeMenuLabel: { fontSize: 17, fontWeight: '700', color: AppTheme.colors.textPrimary },
  homeMenuSub: { fontSize: 13, color: AppTheme.colors.textSecondary, lineHeight: 18 },
  sectionHeaderFirst: { marginTop: 10 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  workoutSection: { marginTop: 12, gap: 6 },
  sectionTitle: {
    flex: 1,
    flexShrink: 1,
    color: AppTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  sectionSeeAll: {
    fontSize: 15,
    fontWeight: '400',
    color: AppTheme.colors.primary,
    letterSpacing: 0.2,
  },
  workoutSectionHint: { fontSize: 14, color: AppTheme.colors.textSecondary, lineHeight: 20 },
  metricsScroll: { marginHorizontal: -4, marginTop: 4 },
  metricsScrollContent: { flexDirection: 'row', gap: 10, paddingVertical: 4, paddingRight: 12 },
  metricCardWrap: { width: 152 },
  metricCard: {
    width: '100%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    minHeight: 120,
  },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 20 },
  metricLabel: { color: AppTheme.colors.textSecondary, fontSize: 14, fontWeight: '500' },
  metricValue: { color: AppTheme.colors.textPrimary, fontSize: 32, lineHeight: 36, fontWeight: '700' },
  metricUnit: { color: AppTheme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 4 },
  helperText: { color: AppTheme.colors.textSecondary, fontSize: 13, marginTop: 4 },
});
