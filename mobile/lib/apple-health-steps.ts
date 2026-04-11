import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_KEY = '@ironfit_apple_health_steps_sync_v1';

type HealthKitModule = typeof import('@kayzmann/expo-healthkit');

let healthKitCache: HealthKitModule | null | undefined;

function getHealthKit(): HealthKitModule | null {
  if (Platform.OS !== 'ios') return null;
  if (healthKitCache !== undefined) return healthKitCache;
  try {
    // Native module missing in Expo Go / web — fall back gracefully.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    healthKitCache = require('@kayzmann/expo-healthkit') as HealthKitModule;
  } catch {
    healthKitCache = null;
  }
  return healthKitCache;
}

export function isAppleHealthStepsPlatformSupported(): boolean {
  const hk = getHealthKit();
  return hk != null && hk.isAvailable();
}

export async function isAppleHealthStepsSyncEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(SYNC_KEY);
  return v === '1';
}

export async function setAppleHealthStepsSyncEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(SYNC_KEY, enabled ? '1' : '0');
}

/** Rolling window matching backend analytics: last 7×24h from now (local). */
export async function getAppleHealthStepsRollingWeekTotal(): Promise<number | null> {
  const hk = getHealthKit();
  if (!hk?.isAvailable()) return null;
  const enabled = await isAppleHealthStepsSyncEnabled();
  if (!enabled) return null;
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
    const n = await hk.getSteps(start, end);
    return Math.max(0, Math.round(n));
  } catch {
    return null;
  }
}

export async function getAppleHealthStepsToday(): Promise<number | null> {
  const hk = getHealthKit();
  if (!hk?.isAvailable()) return null;
  const enabled = await isAppleHealthStepsSyncEnabled();
  if (!enabled) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  try {
    const n = await hk.getSteps(start, new Date());
    return Math.max(0, Math.round(n));
  } catch {
    return null;
  }
}

/** One row per local calendar day, oldest first (matches simple bar charts). */
export async function getAppleHealthDailyStepsLastNDays(
  dayCount: number,
): Promise<{ period: string; steps: number }[] | null> {
  const hk = getHealthKit();
  if (!hk?.isAvailable()) return null;
  const enabled = await isAppleHealthStepsSyncEnabled();
  if (!enabled) return null;
  const out: { period: string; steps: number }[] = [];
  try {
    for (let i = dayCount - 1; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const start = new Date(day);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const steps = await hk.getSteps(start, end);
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, '0');
      const d = String(day.getDate()).padStart(2, '0');
      out.push({ period: `${y}-${m}-${d}`, steps: Math.max(0, Math.round(steps)) });
    }
    return out;
  } catch {
    return null;
  }
}

export async function requestAppleHealthStepsReadPermission(): Promise<void> {
  const hk = getHealthKit();
  if (!hk?.isAvailable()) return;
  await hk.requestAuthorization(['Steps'], []);
}
