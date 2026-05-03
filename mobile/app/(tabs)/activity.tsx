import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { EmptyState } from '@/components/ui/empty-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextInputField } from '@/components/ui/text-input-field';
import { api } from '@/lib/api';
import {
  getAppleHealthStepsToday,
  isAppleHealthStepsPlatformSupported,
  isAppleHealthStepsSyncEnabled,
  requestAppleHealthStepsReadPermission,
  setAppleHealthStepsSyncEnabled,
} from '@/lib/apple-health-steps';
import {
  addWaterLitersToday,
  loadWellnessSnapshot,
  setRestingHeartRateBpm,
  type UserWellnessSnapshot,
} from '@/lib/metrics';
import { parseStrengthKind } from '@/lib/plan-sync';
import { muscleGroupColor } from '@/lib/plan-storage';
import type { Activity } from '@/types/api';

type TabId = 'overview' | 'log' | 'wellness';

const EMPTY_WELLNESS: UserWellnessSnapshot = { waterLitersToday: null, restingHeartRateBpm: null };

export default function ActivityScreen() {
  const [tab, setTab] = useState<TabId>('overview');
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [recent, setRecent] = useState<Activity[]>([]);
  const [wellness, setWellness] = useState<UserWellnessSnapshot>(EMPTY_WELLNESS);
  const [restingHrInput, setRestingHrInput] = useState('');
  const [healthKitOk, setHealthKitOk] = useState(false);
  const [healthSyncOn, setHealthSyncOn] = useState(false);
  const [healthTodaySteps, setHealthTodaySteps] = useState<number | null>(null);

  const refreshWellness = useCallback(async () => {
    setWellness(await loadWellnessSnapshot());
  }, []);

  const loadRecent = useCallback(async () => {
    try {
      const res = await api.get<Activity[]>('/activities?limit=20');
      setRecent(res.data);
    } catch {
      // keep existing data on error — don't wipe the list
    }
  }, []);

  useEffect(() => { void loadRecent(); }, [loadRecent]);
  useEffect(() => { void refreshWellness(); }, [refreshWellness]);

  const refreshAppleHealth = useCallback(async () => {
    if (Platform.OS !== 'ios' || !isAppleHealthStepsPlatformSupported()) {
      setHealthKitOk(false);
      setHealthSyncOn(false);
      setHealthTodaySteps(null);
      return;
    }
    setHealthKitOk(true);
    const on = await isAppleHealthStepsSyncEnabled();
    setHealthSyncOn(on);
    setHealthTodaySteps(on ? await getAppleHealthStepsToday() : null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshWellness();
      void refreshAppleHealth();
      void loadRecent();
    }, [refreshWellness, refreshAppleHealth, loadRecent]),
  );

  const enableAppleHealthSync = async () => {
    try {
      await requestAppleHealthStepsReadPermission();
      await setAppleHealthStepsSyncEnabled(true);
      setHealthSyncOn(true);
      setHealthTodaySteps(await getAppleHealthStepsToday());
    } catch {
      Alert.alert('Apple Health', 'Could not read steps. Open Health → Sharing → Apps and allow access.');
    }
  };

  const disableAppleHealthSync = async () => {
    await setAppleHealthStepsSyncEnabled(false);
    setHealthSyncOn(false);
    setHealthTodaySteps(null);
  };

  const save = async () => {
    try {
      await api.post('/activities', {
        kind: 'walking',
        steps: Number(steps || 0),
        distance_km: Number(distance || 0),
        duration_min: Number(duration || 0),
      });
      setSteps('');
      setDistance('');
      setDuration('');
      await loadRecent();
      setTab('overview');
    } catch {
      Alert.alert('Save failed', 'Could not log activity right now.');
    }
  };

  const addWater = async (liters: number) => {
    try { setWellness(await addWaterLitersToday(liters)); } catch { Alert.alert('Error', 'Could not save.'); }
  };

  const saveRestingHr = async () => {
    const n = Number(restingHrInput);
    if (!restingHrInput.trim() || !Number.isFinite(n) || n <= 0) {
      try { setWellness(await setRestingHeartRateBpm(null)); setRestingHrInput(''); } catch {}
      return;
    }
    try { setWellness(await setRestingHeartRateBpm(n)); setRestingHrInput(''); } catch {}
  };

  // ── Derived stats ──

  const strengthActivities = useMemo(() => recent.filter((a) => parseStrengthKind(a.kind)), [recent]);
  const cardioActivities = useMemo(() => recent.filter((a) => !parseStrengthKind(a.kind)), [recent]);

  const strengthStats = useMemo(() => {
    const groups = new Map<string, number>();
    let totalDuration = 0;
    let totalCalories = 0;
    for (const a of strengthActivities) {
      const parsed = parseStrengthKind(a.kind);
      if (parsed) groups.set(parsed.muscleGroup, (groups.get(parsed.muscleGroup) ?? 0) + 1);
      totalDuration += a.duration_min;
      totalCalories += a.calories;
    }
    return { count: strengthActivities.length, groups: [...groups.entries()].sort((a, b) => b[1] - a[1]), totalDuration, totalCalories };
  }, [strengthActivities]);

  const cardioStats = useMemo(() => {
    let totalSteps = 0, totalDistance = 0, totalDuration = 0;
    for (const a of cardioActivities) {
      totalSteps += a.steps;
      totalDistance += a.distance_km;
      totalDuration += a.duration_min;
    }
    return { count: cardioActivities.length, totalSteps, totalDistance, totalDuration };
  }, [cardioActivities]);

  const waterLabel =
    typeof wellness.waterLitersToday === 'number'
      ? `${wellness.waterLitersToday.toFixed(wellness.waterLitersToday >= 10 ? 1 : 2)} L`
      : '—';

  // ── Render ──

  return (
    <ScreenContainer>
      <ScreenHeader title="Stats" subtitle="Your workouts, cardio, and wellness at a glance." />

      {/* Tabs */}
      <View style={st.tabs}>
        <TabPill id="overview" label="Overview" active={tab} onPress={setTab} />
        <TabPill id="log" label="Log" active={tab} onPress={setTab} />
        <TabPill id="wellness" label="Wellness" active={tab} onPress={setTab} />
      </View>

      {tab === 'overview' && (
        <>
          {/* Quick stat tiles */}
          <View style={st.tilesRow}>
            <StatTile icon="barbell-outline" label="Workouts" value={String(strengthStats.count)} tint="#E74C3C" />
            <StatTile icon="walk-outline" label="Cardio" value={String(cardioStats.count)} tint="#3498DB" />
            <StatTile icon="water-outline" label="Water" value={waterLabel} tint="#1ABC9C" />
          </View>

          {/* Strength summary */}
          {strengthStats.count > 0 && (
            <View style={st.card}>
              <View style={st.cardHead}>
                <Text style={st.cardTitle}>Strength training</Text>
                <Text style={st.cardHint}>{strengthStats.count} session{strengthStats.count !== 1 ? 's' : ''}</Text>
              </View>
              <View style={st.mgBreakdown}>
                {strengthStats.groups.map(([group, count]) => (
                  <View key={group} style={st.mgBreakdownRow}>
                    <View style={[st.mgDot, { backgroundColor: muscleGroupColor(group) }]} />
                    <Text style={st.mgBreakdownLabel}>{group}</Text>
                    <Text style={st.mgBreakdownVal}>{count} exercise{count !== 1 ? 's' : ''}</Text>
                  </View>
                ))}
              </View>
              <View style={st.miniStats}>
                <Text style={st.miniStat}>~{strengthStats.totalDuration} min</Text>
                <Text style={st.miniStatDot}>·</Text>
                <Text style={st.miniStat}>~{strengthStats.totalCalories} cal</Text>
              </View>
            </View>
          )}

          {/* Cardio summary */}
          {cardioStats.count > 0 && (
            <View style={st.card}>
              <View style={st.cardHead}>
                <Text style={st.cardTitle}>Cardio & walking</Text>
                <Text style={st.cardHint}>{cardioStats.count} log{cardioStats.count !== 1 ? 's' : ''}</Text>
              </View>
              <View style={st.cardioTiles}>
                <View style={st.cardioTile}>
                  <Ionicons name="footsteps-outline" size={18} color={AppTheme.colors.primary} />
                  <Text style={st.cardioTileVal}>{cardioStats.totalSteps.toLocaleString()}</Text>
                  <Text style={st.cardioTileLabel}>steps</Text>
                </View>
                <View style={st.cardioTile}>
                  <Ionicons name="navigate-outline" size={18} color={AppTheme.colors.primary} />
                  <Text style={st.cardioTileVal}>{cardioStats.totalDistance.toFixed(1)}</Text>
                  <Text style={st.cardioTileLabel}>km</Text>
                </View>
                <View style={st.cardioTile}>
                  <Ionicons name="time-outline" size={18} color={AppTheme.colors.primary} />
                  <Text style={st.cardioTileVal}>{cardioStats.totalDuration}</Text>
                  <Text style={st.cardioTileLabel}>min</Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent activity */}
          <View style={st.sectionHead}>
            <Text style={st.sectionTitle}>Recent</Text>
            <Text style={st.sectionHint}>{recent.length} total</Text>
          </View>

          {recent.length === 0 ? (
            <View style={st.emptyCard}>
              <EmptyState
                icon="add-circle-outline"
                title="No activity yet"
                description="Log a workout from the Plans tab or add cardio from the Log tab."
              />
            </View>
          ) : (
            <View style={st.listCard}>
              {recent.slice(0, 10).map((item, index) => (
                <ActivityRow key={item.id} item={item} showBorder={index > 0} />
              ))}
            </View>
          )}
        </>
      )}

      {tab === 'log' && (
        <>
          {Platform.OS === 'ios' && healthKitOk ? (
            <View style={st.card}>
              <View style={st.cardHead}>
                <Text style={st.cardTitle}>Apple Health</Text>
              </View>
              {healthSyncOn ? (
                <>
                  <Text style={st.healthToday}>
                    Today: <Text style={st.healthTodayVal}>{healthTodaySteps?.toLocaleString() ?? '—'} steps</Text>
                  </Text>
                  <TouchableOpacity style={st.textBtn} onPress={() => void disableAppleHealthSync()}>
                    <Text style={st.textBtnLabel}>Stop using Apple Health</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={st.hint}>Sync step data from the Health app for accurate charts.</Text>
                  <PrimaryButton label="Enable Apple Health" onPress={() => void enableAppleHealthSync()} />
                </>
              )}
            </View>
          ) : null}

          <View style={st.card}>
            <View style={st.cardHead}>
              <Text style={st.cardTitle}>Log cardio</Text>
            </View>
            <Text style={st.hint}>Manual entry for walks, runs, or any cardio session.</Text>
            <TextInputField label="Steps" value={steps} onChangeText={setSteps} keyboardType="numeric" />
            <TextInputField label="Distance (km)" value={distance} onChangeText={setDistance} keyboardType="decimal-pad" />
            <TextInputField label="Duration (min)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
            <PrimaryButton label="Save activity" onPress={save} />
          </View>
        </>
      )}

      {tab === 'wellness' && (
        <>
          <View style={st.card}>
            <View style={st.cardHead}>
              <Text style={st.cardTitle}>Water intake</Text>
              <Text style={st.cardHint}>{waterLabel} today</Text>
            </View>
            <View style={st.waterChips}>
              {([0.25, 0.5, 1] as const).map((L) => (
                <TouchableOpacity key={L} style={st.waterChip} onPress={() => void addWater(L)} activeOpacity={0.85}>
                  <Text style={st.waterChipText}>+{L} L</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={st.card}>
            <View style={st.cardHead}>
              <Text style={st.cardTitle}>Resting heart rate</Text>
              {typeof wellness.restingHeartRateBpm === 'number' && (
                <Text style={st.cardHint}>{wellness.restingHeartRateBpm} bpm</Text>
              )}
            </View>
            <Text style={st.hint}>
              {typeof wellness.restingHeartRateBpm === 'number'
                ? 'Enter a new value to update, or save empty to clear.'
                : 'Optional — enter your resting HR from a watch or manual reading.'}
            </Text>
            <TextInputField
              label="BPM"
              value={restingHrInput}
              onChangeText={setRestingHrInput}
              keyboardType="numeric"
            />
            <PrimaryButton label="Save" onPress={() => void saveRestingHr()} />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TabPill({ id, label, active, onPress }: { id: TabId; label: string; active: TabId; onPress: (id: TabId) => void }) {
  const isActive = active === id;
  return (
    <TouchableOpacity
      style={[st.tabPill, isActive && st.tabPillActive]}
      onPress={() => onPress(id)}
      activeOpacity={0.85}>
      <Text style={[st.tabPillText, isActive && st.tabPillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatTile({ icon, label, value, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tint: string }) {
  return (
    <View style={st.statTile}>
      <View style={[st.statIcon, { backgroundColor: tint + '18' }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text style={st.statVal}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityRow({ item, showBorder }: { item: Activity; showBorder: boolean }) {
  const strength = parseStrengthKind(item.kind);
  const tint = strength ? muscleGroupColor(strength.muscleGroup) : AppTheme.colors.primary;
  return (
    <View style={[st.row, showBorder && st.rowBorder]}>
      <View style={[st.rowIcon, { backgroundColor: tint + '18' }]}>
        <Ionicons name={strength ? 'barbell-outline' : 'fitness-outline'} size={20} color={tint} />
      </View>
      <View style={st.rowBody}>
        {strength ? (
          <>
            <Text style={st.rowMain} numberOfLines={1}>{strength.exercise}</Text>
            <Text style={st.rowSub} numberOfLines={1}>
              <Text style={{ color: tint, fontWeight: '700' }}>{strength.muscleGroup}</Text>
              {' · '}{item.duration_min} min · {item.calories} cal
            </Text>
          </>
        ) : (
          <>
            <Text style={st.rowMain} numberOfLines={1}>
              {item.steps.toLocaleString()} steps · {item.distance_km} km
            </Text>
            <Text style={st.rowSub}>{item.duration_min} min</Text>
          </>
        )}
      </View>
      <Text style={st.rowDate}>
        {new Date(item.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const st = StyleSheet.create({
  /* Tabs */
  tabs: { flexDirection: 'row', gap: 8 },
  tabPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  tabPillActive: { backgroundColor: AppTheme.colors.primary, borderColor: AppTheme.colors.primary },
  tabPillText: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textSecondary },
  tabPillTextActive: { color: '#fff' },

  /* Stat tiles */
  tilesRow: { flexDirection: 'row', gap: 10 },
  statTile: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: AppTheme.colors.textPrimary },
  statLabel: { fontSize: 11, fontWeight: '600', color: AppTheme.colors.textSecondary },

  /* Cards */
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
  cardHint: { fontSize: 13, color: AppTheme.colors.textSecondary, fontWeight: '600' },

  /* Muscle group breakdown */
  mgBreakdown: { gap: 6 },
  mgBreakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mgDot: { width: 8, height: 8, borderRadius: 4 },
  mgBreakdownLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: AppTheme.colors.textPrimary },
  mgBreakdownVal: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.textSecondary },
  miniStats: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 },
  miniStat: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.textSecondary },
  miniStatDot: { fontSize: 13, color: AppTheme.colors.border },

  /* Cardio tiles */
  cardioTiles: { flexDirection: 'row', gap: 10 },
  cardioTile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.colors.primarySoft,
    borderRadius: 14,
    paddingVertical: 12,
  },
  cardioTileVal: { fontSize: 18, fontWeight: '800', color: AppTheme.colors.textPrimary },
  cardioTileLabel: { fontSize: 11, fontWeight: '600', color: AppTheme.colors.textSecondary },

  /* Section head */
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: AppTheme.colors.textPrimary },
  sectionHint: { fontSize: 13, color: AppTheme.colors.textSecondary, fontWeight: '600' },

  /* List */
  emptyCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    overflow: 'hidden',
  },
  listCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: AppTheme.colors.border },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, minWidth: 0 },
  rowMain: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textPrimary },
  rowSub: { fontSize: 12, color: AppTheme.colors.textSecondary, marginTop: 2 },
  rowDate: { fontSize: 12, fontWeight: '600', color: AppTheme.colors.textSecondary },

  /* Log tab */
  hint: { fontSize: 13, color: AppTheme.colors.textSecondary, lineHeight: 18 },
  healthToday: { fontSize: 15, color: AppTheme.colors.textPrimary, fontWeight: '600' },
  healthTodayVal: { fontWeight: '800', color: AppTheme.colors.primary },
  textBtn: { alignSelf: 'flex-start', paddingVertical: 4 },
  textBtnLabel: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textSecondary },

  /* Wellness tab */
  waterChips: { flexDirection: 'row', gap: 10 },
  waterChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
  },
  waterChipText: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.primary },
});
