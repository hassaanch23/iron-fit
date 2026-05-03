import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SuggestedWorkoutCard } from '@/components/ui/suggested-workout-card';
import { calcBmi, getBmiCategory, getBmiInfo } from '@/lib/bmi';
import { workoutsForBmi } from '@/lib/suggested-workouts';
import { useDashboardMetricData } from '@/hooks/use-dashboard-metric-data';
import { resolveHomeDashboardMetrics } from '@/lib/metrics';
import { loadPlans, muscleGroupColor, toYMD, type PlanItem } from '@/lib/plan-storage';
import { api } from '@/lib/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, dashboard, history, wellness, healthStepsWeek } = useDashboardMetricData();

  const [todayPlans, setTodayPlans] = useState<PlanItem[]>([]);

  const loadTodayPlans = useCallback(async () => {
    const all = await loadPlans();
    const today = toYMD(new Date());
    setTodayPlans(all.filter((p) => p.date === today));
  }, []);

  useEffect(() => { void loadTodayPlans(); }, [loadTodayPlans]);
  useFocusEffect(useCallback(() => { void loadTodayPlans(); }, [loadTodayPlans]));

  const homeMetrics = useMemo(
    () => resolveHomeDashboardMetrics({ dashboard, history, profile: profile ?? null, healthStepsWeek }, wellness),
    [dashboard, history, profile, wellness, healthStepsWeek],
  );

  const bmi = calcBmi(profile?.weight_kg ?? null, profile?.height_cm ?? null);
  const { workouts: suggestedWorkouts, sectionHint } = workoutsForBmi(bmi);
  const workoutAccent = bmi !== null ? getBmiInfo(bmi).color : AppTheme.colors.primary;

  const bmiMenuSub = bmi !== null
    ? `${bmi.toFixed(1)} kg/m² · ${getBmiCategory(bmi).label}`
    : 'Gauge, category, and healthy range';

  const todayDone = todayPlans.filter((p) => p.completed).length;
  const todayTotal = todayPlans.length;
  const todayGroups = [...new Set(todayPlans.map((p) => p.muscleGroup))];
  const todaySets = todayPlans.reduce((s, p) => s + p.sets.length, 0);

  return (
    <ScreenContainer>
      <ScreenHeader
        title={`Hi, ${profile?.name || 'Athlete'}`}
        subtitle="Here's your snapshot for today."
      />

      {/* Today's plan card */}
      {todayTotal > 0 && (
        <TouchableOpacity style={st.todayCard} activeOpacity={0.8} onPress={() => router.push('/plans')}>
          <View style={st.todayCardHead}>
            <View style={st.todayCardIcon}>
              <Ionicons name="barbell-outline" size={22} color="#fff" />
            </View>
            <View style={st.todayCardInfo}>
              <Text style={st.todayCardTitle}>Today's Plan</Text>
              <Text style={st.todayCardSub}>
                {todayDone}/{todayTotal} exercises · {todaySets} sets logged
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </View>
          {/* Progress bar */}
          <View style={st.progressBarBg}>
            <View style={[st.progressBarFill, { width: `${todayTotal ? (todayDone / todayTotal) * 100 : 0}%` }]} />
          </View>
          {/* Muscle group chips */}
          <View style={st.todayChips}>
            {todayGroups.map((g) => (
              <View key={g} style={[st.todayChip, { backgroundColor: muscleGroupColor(g) + '30' }]}>
                <Text style={[st.todayChipText, { color: muscleGroupColor(g) }]}>{g}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* Weekly stats row */}
      <View style={st.weekRow}>
        <WeekTile icon="flame-outline" value={dashboard ? String(Math.round(dashboard.total_calories_week)) : '—'} label="Calories" tint="#E74C3C" />
        <WeekTile icon="barbell-outline" value={dashboard ? String(dashboard.workouts_week) : '—'} label="Workouts" tint={AppTheme.colors.primary} />
        <WeekTile icon="time-outline" value={dashboard ? String(dashboard.total_duration_week) : '—'} label="Minutes" tint="#3498DB" />
      </View>

      <SectionHeaderWithSeeAll title="Your Metrics" onSeeAll={() => router.push('/metrics')} style={st.sectionFirst} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={st.metricsScroll}
        contentContainerStyle={st.metricsScrollContent}>
        {homeMetrics.map((m) => (
          <View key={m.id} style={st.metricCardWrap}>
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

      {/* Quick links */}
      <TouchableOpacity style={st.menuItem} activeOpacity={0.7} onPress={() => router.push('/bmi')}>
        <View style={st.menuIcon}>
          <Ionicons name="body-outline" size={22} color={AppTheme.colors.primary} />
        </View>
        <View style={st.menuText}>
          <Text style={st.menuLabel}>BMI insights</Text>
          <Text style={st.menuSub}>{bmiMenuSub}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={st.menuItem} activeOpacity={0.7} onPress={() => router.push('/strength')}>
        <View style={st.menuIcon}>
          <Ionicons name="fitness-outline" size={22} color={AppTheme.colors.primary} />
        </View>
        <View style={st.menuText}>
          <Text style={st.menuLabel}>Exercise library</Text>
          <Text style={st.menuSub}>Video demos, form cues, and full exercise list</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      {/* Suggested workouts */}
      <View style={st.workoutSection}>
        <SectionHeaderWithSeeAll title="Suggested Workouts" onSeeAll={() => router.push('/suggested-workouts')} />
        <Text style={st.workoutHint}>{sectionHint}</Text>
      </View>
      {suggestedWorkouts.map((w) => (
        <SuggestedWorkoutCard
          key={w.title}
          title={w.title}
          subtitle={w.subtitle}
          accentColor={workoutAccent}
          onStart={() =>
            router.push({ pathname: '/workout-session', params: { title: w.title, subtitle: w.subtitle, ids: w.demoExerciseIds.join(',') } })
          }
        />
      ))}
    </ScreenContainer>
  );
}

/* ── Sub-components ── */

function SectionHeaderWithSeeAll({ title, onSeeAll, style }: { title: string; onSeeAll: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[st.sectionRow, style]}>
      <Text style={st.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} activeOpacity={0.65}>
        <Text style={st.seeAll}>see all</Text>
      </TouchableOpacity>
    </View>
  );
}

function MetricCard({ label, value, unit, icon, iconColor }: { label: string; value: string; unit: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }) {
  return (
    <View style={st.metricCard}>
      <View style={st.metricTop}>
        <Text style={st.metricLabel}>{label}</Text>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={st.metricBottom}>
        <Text style={st.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{value}</Text>
        <Text style={st.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function WeekTile({ icon, value, label, tint }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; tint: string }) {
  return (
    <View style={st.weekTile}>
      <Ionicons name={icon} size={16} color={tint} />
      <Text style={st.weekTileVal}>{value}</Text>
      <Text style={st.weekTileLabel}>{label}</Text>
    </View>
  );
}

/* ── Styles ── */

const st = StyleSheet.create({
  /* Today's plan */
  todayCard: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  todayCardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  todayCardIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  todayCardInfo: { flex: 1 },
  todayCardTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  todayCardSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressBarFill: { height: 6, borderRadius: 3, backgroundColor: '#fff', minWidth: 6 },
  todayChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  todayChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  todayChipText: { fontSize: 12, fontWeight: '700' },

  /* Week stats */
  weekRow: { flexDirection: 'row', gap: 8 },
  weekTile: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  weekTileVal: { fontSize: 17, fontWeight: '800', color: AppTheme.colors.textPrimary },
  weekTileLabel: { fontSize: 10, fontWeight: '600', color: AppTheme.colors.textSecondary },

  /* Section header */
  sectionFirst: { marginTop: 6 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  sectionTitle: { flex: 1, flexShrink: 1, color: AppTheme.colors.textPrimary, fontSize: 22, fontWeight: '800' },
  seeAll: { fontSize: 14, fontWeight: '500', color: AppTheme.colors.primary },

  /* Metrics scroll */
  metricsScroll: { marginHorizontal: -4, marginTop: 4 },
  metricsScrollContent: { flexDirection: 'row', gap: 10, paddingVertical: 4, paddingRight: 12 },
  metricCardWrap: { width: 148 },
  metricCard: {
    width: '100%', borderRadius: 18, padding: 14,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1, borderColor: AppTheme.colors.border, minHeight: 110,
  },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 16 },
  metricLabel: { color: AppTheme.colors.textSecondary, fontSize: 13, fontWeight: '500' },
  metricValue: { color: AppTheme.colors.textPrimary, fontSize: 28, lineHeight: 32, fontWeight: '700' },
  metricUnit: { color: AppTheme.colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 3 },

  /* Menu items */
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14,
    backgroundColor: AppTheme.colors.card, borderRadius: 18,
    borderWidth: 1, borderColor: AppTheme.colors.border, gap: 12,
  },
  menuIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1, gap: 2 },
  menuLabel: { fontSize: 16, fontWeight: '700', color: AppTheme.colors.textPrimary },
  menuSub: { fontSize: 12, color: AppTheme.colors.textSecondary, lineHeight: 16 },

  /* Suggested workouts */
  workoutSection: { marginTop: 8, gap: 4 },
  workoutHint: { fontSize: 13, color: AppTheme.colors.textSecondary, lineHeight: 18 },
});
