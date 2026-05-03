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
      // keep existing data on error — don't wipe to zeros
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
      void loadDashboardAndHistory();
    }, [refreshWellness, refreshHealthSteps, loadDashboardAndHistory]),
  );

  return {
    profile,
    dashboard,
    history,
    wellness,
    healthStepsWeek,
  };
}
