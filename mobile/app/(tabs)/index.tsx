import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import type { Dashboard, HistoryPoint } from '@/types/api';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

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

  return (
    <ScreenContainer>
      <Text style={styles.greeting}>Hi, {profile?.name || 'Athlete'}!</Text>
      <Text style={styles.heading}>Your Metrics</Text>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Metrics</Text>
        <Text style={styles.sectionLink}>see all</Text>
      </View>
      <View style={styles.metricsRow}>
        <MetricGlassCard
          label="Water"
          value="2.9"
          unit="Liters"
          icon="water"
          iconColor="#1F0F77"
        />
        <MetricGlassCard
          label="Calories"
          value={`${Math.max(0, Math.round((dashboard?.total_calories_week ?? 0) / 7))}`}
          unit="Cal"
          icon="flame"
          iconColor="#F4B740"
        />
        <MetricGlassCard
          label="Heart Rate"
          value={history.length ? `${76}` : '--'}
          unit="Bpm"
          icon="heart"
          iconColor="#7E5BEF"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested Workouts</Text>
        <Text style={styles.sectionLink}>see all</Text>
      </View>
      <WorkoutGlassCard
        title="Running"
        subtitle="Burn fat and boost endurance with a steady run."
        onPress={() => {}}
      />
      <WorkoutGlassCard
        title="Biking"
        subtitle="Strengthen your legs and improve stamina, indoors or out."
        onPress={() => {}}
      />

      {history.length === 0 && (
        <Text style={styles.helperText}>No logged workouts yet. Start one from Activity to populate insights.</Text>
      )}
    </ScreenContainer>
  );
}

function MetricGlassCard({
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
    <BlurView intensity={35} tint="light" style={styles.metricCard}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <View style={styles.metricBottom}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </BlurView>
  );
}

function WorkoutGlassCard({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <BlurView intensity={30} tint="light" style={styles.workoutCard}>
      <Text style={styles.workoutTitle}>{title}</Text>
      <Text style={styles.workoutSubtitle}>{subtitle}</Text>
      <Pressable onPress={onPress} style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Workout</Text>
      </Pressable>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  greeting: { color: AppTheme.colors.textSecondary, fontSize: 15, marginTop: 8, marginBottom: 2 },
  heading: { color: AppTheme.colors.textPrimary, fontSize: 30, fontWeight: '800', marginBottom: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  sectionTitle: { color: AppTheme.colors.textPrimary, fontSize: 34, fontWeight: '800' },
  sectionLink: { color: AppTheme.colors.primary, fontSize: 18, fontWeight: '500' },
  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    padding: AppTheme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.45)',
    minHeight: 130,
  },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 24 },
  metricLabel: { color: AppTheme.colors.textPrimary, fontSize: 18, fontWeight: '500' },
  metricValue: { color: '#000', fontSize: 42, lineHeight: 44, fontWeight: '500' },
  metricUnit: { color: '#222', fontSize: 16, lineHeight: 22, marginBottom: 6 },
  workoutCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    overflow: 'hidden',
    padding: 22,
    backgroundColor: 'rgba(255,255,255,0.45)',
    minHeight: 190,
    marginTop: 6,
  },
  workoutTitle: { color: AppTheme.colors.textPrimary, fontSize: 50, lineHeight: 54, fontWeight: '600' },
  workoutSubtitle: { color: AppTheme.colors.textSecondary, fontSize: 17, lineHeight: 24, marginTop: 6, maxWidth: '82%' },
  startButton: {
    marginTop: 20,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  helperText: { color: AppTheme.colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 94 },
});
