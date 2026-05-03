import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { getAppleHealthStepsRollingWeekTotal } from '@/lib/apple-health-steps';
import { loadWellnessSnapshot, type UserWellnessSnapshot } from '@/lib/metrics';
import type { Dashboard, HistoryPoint } from '@/types/api';

const EMPTY_WELLNESS: UserWellnessSnapshot = { waterLitersToday: null, restingHeartRateBpm: null };

export function useDashboardMetricData() {
  const { profile, token } = useAuth();
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
    setHealthStepsWeek(await getAppleHealthStepsRollingWeekTotal());
  }, []);

  const loadDashboardAndHistory = useCallback(async () => {
    if (!token) return;
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
  }, [token]);

  useEffect(() => {
    void loadDashboardAndHistory();
  }, [loadDashboardAndHistory]);

  useEffect(() => {
    void refreshWellness();
  }, [refreshWellness]);

  useFocusEffect(
    useCallback(() => {
      void refreshWellness();
      void refreshHealthSteps();
    }, [refreshWellness, refreshHealthSteps]),
  );

  return {
    profile,
    dashboard,
    history,
    wellness,
    healthStepsWeek,
  };
}
