import { useCallback, useEffect, useState } from 'react';
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
import type { Activity } from '@/types/api';

const EMPTY_WELLNESS: UserWellnessSnapshot = { waterLitersToday: null, restingHeartRateBpm: null };

export default function ActivityScreen() {
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

  const loadRecent = async () => {
    try {
      const res = await api.get<Activity[]>('/activities?limit=8');
      setRecent(res.data);
    } catch {
      setRecent([]);
    }
  };

  useEffect(() => {
    void loadRecent();
  }, []);

  useEffect(() => {
    void refreshWellness();
  }, [refreshWellness]);

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
    if (on) {
      setHealthTodaySteps(await getAppleHealthStepsToday());
    } else {
      setHealthTodaySteps(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshWellness();
      void refreshAppleHealth();
    }, [refreshWellness, refreshAppleHealth]),
  );

  const enableAppleHealthSync = async () => {
    try {
      await requestAppleHealthStepsReadPermission();
      await setAppleHealthStepsSyncEnabled(true);
      setHealthSyncOn(true);
      setHealthTodaySteps(await getAppleHealthStepsToday());
    } catch {
      Alert.alert(
        'Apple Health',
        'Could not read steps. Open the Health app → Sharing → Apps and allow access for Iron Fit.',
      );
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
    } catch {
      Alert.alert('Save failed', 'Could not log activity right now.');
    }
  };

  const addWater = async (liters: number) => {
    try {
      setWellness(await addWaterLitersToday(liters));
    } catch {
      Alert.alert('Could not save', 'Water intake was not updated.');
    }
  };

  const saveRestingHr = async () => {
    const n = Number(restingHrInput);
    if (!restingHrInput.trim() || !Number.isFinite(n) || n <= 0) {
      try {
        setWellness(await setRestingHeartRateBpm(null));
        setRestingHrInput('');
      } catch {
        Alert.alert('Could not save', 'Heart rate was not cleared.');
      }
      return;
    }
    try {
      setWellness(await setRestingHeartRateBpm(n));
      setRestingHrInput('');
    } catch {
      Alert.alert('Could not save', 'Heart rate was not updated.');
    }
  };

  const waterLabel =
    typeof wellness.waterLitersToday === 'number'
      ? `${wellness.waterLitersToday.toFixed(wellness.waterLitersToday >= 10 ? 1 : 2)} L today`
      : 'Not logged yet — tap below to add';

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Stats"
        subtitle="Log movement in seconds—steps, distance, and time."
      />

      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="pulse" size={32} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Quick log</Text>
        <Text style={styles.heroSub}>Every entry updates your dashboard and history charts.</Text>
      </View>

      {Platform.OS === 'ios' && healthKitOk ? (
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>Apple Health</Text>
          <Text style={styles.healthExplainer}>
            Use the same step totals as the Health app on Home and History (rolling week, local time).
          </Text>
          {healthSyncOn ? (
            <>
              <Text style={styles.healthToday}>
                Today (Health):{' '}
                <Text style={styles.healthTodayVal}>
                  {healthTodaySteps !== null ? healthTodaySteps.toLocaleString() : '—'} steps
                </Text>
              </Text>
              <TouchableOpacity style={styles.healthDisableBtn} onPress={() => void disableAppleHealthSync()}>
                <Text style={styles.healthDisableText}>Stop using Apple Health for steps</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.healthExplainer}>
                Manual logs below still save to your account. Turn this on to align step charts with Apple Health.
              </Text>
              <PrimaryButton label="Use Apple Health for steps" onPress={() => void enableAppleHealthSync()} />
            </>
          )}
        </View>
      ) : null}

      <View style={styles.formCard}>
        <Text style={styles.formCardTitle}>New activity</Text>
        <TextInputField label="Steps" value={steps} onChangeText={setSteps} keyboardType="numeric" />
        <TextInputField
          label="Distance (km)"
          value={distance}
          onChangeText={setDistance}
          keyboardType="decimal-pad"
        />
        <TextInputField
          label="Duration (min)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
        <PrimaryButton label="Save activity" onPress={save} />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formCardTitle}>Wellness</Text>
        <Text style={styles.wellnessWaterLine}>{waterLabel}</Text>
        <View style={styles.waterChips}>
          {([0.25, 0.5, 1] as const).map((L) => (
            <TouchableOpacity
              key={L}
              style={styles.waterChip}
              onPress={() => void addWater(L)}
              activeOpacity={0.85}>
              <Text style={styles.waterChipText}>+{L} L</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.wellnessHint}>
          {typeof wellness.restingHeartRateBpm === 'number'
            ? `Current: ${wellness.restingHeartRateBpm} bpm. Enter a new value to replace, or save with the field empty to clear.`
            : 'Optional manual entry (e.g. from a watch). Leave empty and tap save to clear a saved value.'}
        </Text>
        <TextInputField
          label="Resting heart rate (bpm)"
          value={restingHrInput}
          onChangeText={setRestingHrInput}
          keyboardType="numeric"
        />
        <PrimaryButton label="Save resting HR" onPress={() => void saveRestingHr()} />
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <Text style={styles.sectionHint}>{recent.length} logged</Text>
      </View>

      {recent.length === 0 ? (
        <View style={styles.emptyCard}>
          <EmptyState
            icon="add-circle-outline"
            title="No logs yet"
            description="Add your first walk or workout above. It will show up here and in History."
          />
        </View>
      ) : (
        <View style={styles.listCard}>
          {recent.map((item, index) => (
            <View key={item.id} style={[styles.row, index > 0 && styles.rowBorder]}>
              <View style={styles.rowIcon}>
                <Ionicons name="fitness-outline" size={22} color={AppTheme.colors.primary} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowMain}>
                  {item.steps.toLocaleString()} steps · {item.distance_km} km · {item.duration_min} min
                </Text>
                <Text style={styles.rowSub}>
                  {new Date(item.started_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 22,
    padding: 22,
    gap: 8,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 20 },
  formCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: AppTheme.spacing.md,
    gap: 4,
  },
  formCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginBottom: 8,
  },
  healthExplainer: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  healthToday: { fontSize: 15, color: AppTheme.colors.textPrimary, fontWeight: '600', marginBottom: 12 },
  healthTodayVal: { fontWeight: '800', color: AppTheme.colors.primary },
  healthDisableBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  healthDisableText: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.textSecondary },
  wellnessWaterLine: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  waterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  waterChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: AppTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  waterChipText: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.primary },
  wellnessHint: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: AppTheme.colors.textPrimary },
  sectionHint: { fontSize: 13, color: AppTheme.colors.textSecondary, fontWeight: '600' },
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
    paddingHorizontal: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: AppTheme.colors.border },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowMain: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.textPrimary },
  rowSub: { fontSize: 13, color: AppTheme.colors.textSecondary, marginTop: 4 },
});
