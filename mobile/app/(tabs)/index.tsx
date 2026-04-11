import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import {
  BMI_NORMAL_MAX,
  BMI_OVERWEIGHT_MAX,
  BMI_UNDERWEIGHT_MAX,
  calcBmi,
  getBmiCategory,
  getBmiInfo,
} from '@/lib/bmi';
import { getAppleHealthStepsRollingWeekTotal } from '@/lib/apple-health-steps';
import {
  loadWellnessSnapshot,
  resolveHomeDashboardMetrics,
  type UserWellnessSnapshot,
} from '@/lib/metrics';
import type { Dashboard, HistoryPoint } from '@/types/api';

type SuggestedWorkout = {
  title: string;
  subtitle: string;
  /** Strength library exercise ids—shown on Start workout with video thumbnails and full demos */
  demoExerciseIds: string[];
};

/** Workouts matched to BMI band (same logic as getBmiInfo). */
function workoutsForBmi(bmi: number | null): { workouts: SuggestedWorkout[]; sectionHint: string } {
  if (bmi === null) {
    return {
      sectionHint: 'General picks to get you moving',
      workouts: [
        {
          title: 'Brisk walk',
          subtitle: '30 minutes of walking builds a daily habit.',
          demoExerciseIds: ['walking-lunge', 'goblet-squat', 'plank'],
        },
        {
          title: 'Light strength',
          subtitle: 'Bodyweight moves to support posture and energy.',
          demoExerciseIds: ['push-up', 'plank', 'goblet-squat'],
        },
      ],
    };
  }
  if (bmi < BMI_UNDERWEIGHT_MAX) {
    return {
      sectionHint: 'Focused on healthy weight gain and muscle',
      workouts: [
        {
          title: 'Strength training',
          subtitle: 'Compound lifts or resistance bands to build lean mass—pair with enough protein and calories.',
          demoExerciseIds: ['deadlift', 'back-squat', 'bench-press', 'pull-up'],
        },
        {
          title: 'Low-intensity cardio',
          subtitle: 'Short walks or easy cycling—keeps heart healthy without burning too many extra calories.',
          demoExerciseIds: ['walking-lunge', 'hip-thrust', 'plank'],
        },
      ],
    };
  }
  if (bmi < BMI_NORMAL_MAX) {
    return {
      sectionHint: 'Balanced for your healthy BMI',
      workouts: [
        {
          title: 'Mixed cardio',
          subtitle: 'Running, rowing, or dance—keep endurance up while you enjoy variety.',
          demoExerciseIds: ['walking-lunge', 'push-up', 'romanian-deadlift'],
        },
        {
          title: 'Strength maintenance',
          subtitle: 'Two sessions a week preserves muscle and supports metabolism.',
          demoExerciseIds: ['bench-press', 'dumbbell-row', 'goblet-squat'],
        },
      ],
    };
  }
  if (bmi < BMI_OVERWEIGHT_MAX) {
    return {
      sectionHint: 'Extra cardio to support gradual fat loss',
      workouts: [
        {
          title: 'Cycling or elliptical',
          subtitle: 'Lower impact on joints while you raise weekly calorie burn steadily.',
          demoExerciseIds: ['bulgarian-split-squat', 'romanian-deadlift', 'plank'],
        },
        {
          title: 'Interval walking',
          subtitle: 'Alternate brisk and easy pace—simple to start and easy to scale.',
          demoExerciseIds: ['walking-lunge', 'goblet-squat', 'overhead-press'],
        },
      ],
    };
  }
  return {
    sectionHint: 'Low-impact, joint-friendly options',
    workouts: [
      {
        title: 'Walking or aqua fitness',
        subtitle: 'Gentle on knees and hips—aim for consistent daily movement.',
        demoExerciseIds: ['walking-lunge', 'goblet-squat', 'plank'],
      },
      {
        title: 'Seated or supported strength',
        subtitle: 'Light resistance to maintain muscle; clear any plan with your clinician if needed.',
        demoExerciseIds: ['lat-pulldown', 'dumbbell-row', 'push-up'],
      },
    ],
  };
}

const EMPTY_WELLNESS: UserWellnessSnapshot = { waterLitersToday: null, restingHeartRateBpm: null };

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [wellness, setWellness] = useState<UserWellnessSnapshot>(EMPTY_WELLNESS);
  const [healthStepsWeek, setHealthStepsWeek] = useState<number | null>(null);

  const refreshWellness = useCallback(async () => {
    setWellness(await loadWellnessSnapshot());
  }, []);

  const refreshHealthSteps = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setHealthStepsWeek(null);
      return;
    }
    const n = await getAppleHealthStepsRollingWeekTotal();
    setHealthStepsWeek(n);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, historyRes] = await Promise.all([
          api.get<Dashboard>('/analytics/dashboard'),
          api.get<{ timeframe: string; points: HistoryPoint[] }>('/analytics/history?timeframe=week'),
        ]);
        setDashboard(dashRes.data);
        setHistory(historyRes.data.points);
      } catch {
        setDashboard({
          total_steps_week: 0,
          total_distance_week: 0,
          total_calories_week: 0,
          total_duration_week: 0,
          workouts_week: 0,
        });
        setHistory([]);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    void refreshWellness();
  }, [refreshWellness]);

  useFocusEffect(
    useCallback(() => {
      void refreshWellness();
      void refreshHealthSteps();
    }, [refreshWellness, refreshHealthSteps]),
  );

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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your metrics</Text>
      </View>
      <View style={styles.metricsRow}>
        {homeMetrics.map((m) => (
          <MetricCard
            key={m.id}
            label={m.label}
            value={m.value}
            unit={m.unit}
            icon={m.icon as keyof typeof Ionicons.glyphMap}
            iconColor={m.iconColor}
          />
        ))}
      </View>

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
        <Text style={styles.sectionTitle}>Suggested Workouts</Text>
        <Text style={styles.workoutSectionHint}>{sectionHint}</Text>
      </View>
      {suggestedWorkouts.map((w) => (
        <WorkoutCard
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
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function WorkoutCard({
  title,
  subtitle,
  accentColor,
  onStart,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
  onStart: () => void;
}) {
  return (
    <View style={[styles.workoutCard, { borderLeftWidth: 4, borderLeftColor: accentColor }]}>
      <Text style={styles.workoutTitle}>{title}</Text>
      <Text style={styles.workoutSubtitle}>{subtitle}</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.startButton, { backgroundColor: accentColor }]}
        onPress={onStart}>
        <Text style={styles.startButtonText}>Start workout</Text>
      </TouchableOpacity>
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  workoutSection: { marginTop: 12, gap: 4 },
  sectionTitle: { color: AppTheme.colors.textPrimary, fontSize: 26, fontWeight: '800' },
  workoutSectionHint: { fontSize: 14, color: AppTheme.colors.textSecondary, lineHeight: 20 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1,
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
  workoutCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 20,
    backgroundColor: AppTheme.colors.card,
    marginTop: 10,
  },
  workoutTitle: { color: AppTheme.colors.textPrimary, fontSize: 28, fontWeight: '700' },
  workoutSubtitle: { color: AppTheme.colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 4 },
  startButton: {
    marginTop: 16,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  startButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  helperText: { color: AppTheme.colors.textSecondary, fontSize: 13, marginTop: 4 },
});
