import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserWellnessSnapshot } from '@/lib/metrics/types';

const KEY = '@ironfit_wellness_metrics_v1';

type Stored = {
  /** Cumulative liters per calendar day (YYYY-MM-DD) */
  waterByYmd: Record<string, number>;
  restingHeartRateBpm: number | null;
};

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultStored(): Stored {
  return { waterByYmd: {}, restingHeartRateBpm: null };
}

async function read(): Promise<Stored> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultStored();
    const p = JSON.parse(raw) as Partial<Stored>;
    return {
      waterByYmd: typeof p.waterByYmd === 'object' && p.waterByYmd !== null ? p.waterByYmd : {},
      restingHeartRateBpm:
        typeof p.restingHeartRateBpm === 'number' && p.restingHeartRateBpm > 0
          ? Math.round(p.restingHeartRateBpm)
          : null,
    };
  } catch {
    return defaultStored();
  }
}

async function write(data: Stored): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadWellnessSnapshot(): Promise<UserWellnessSnapshot> {
  const data = await read();
  const today = toYMD(new Date());
  const w = data.waterByYmd[today];
  return {
    waterLitersToday: typeof w === 'number' && w > 0 ? Math.round(w * 100) / 100 : w === 0 ? 0 : null,
    restingHeartRateBpm: data.restingHeartRateBpm,
  };
}

/** Add liters to today’s total (e.g. 0.25 after a glass). */
export async function addWaterLitersToday(liters: number): Promise<UserWellnessSnapshot> {
  if (!Number.isFinite(liters) || liters <= 0) return loadWellnessSnapshot();
  const data = await read();
  const today = toYMD(new Date());
  const prev = data.waterByYmd[today] ?? 0;
  data.waterByYmd[today] = Math.round((prev + liters) * 100) / 100;
  await write(data);
  return loadWellnessSnapshot();
}

export async function setRestingHeartRateBpm(bpm: number | null): Promise<UserWellnessSnapshot> {
  const data = await read();
  if (bpm === null || !Number.isFinite(bpm) || bpm <= 0) {
    data.restingHeartRateBpm = null;
  } else {
    data.restingHeartRateBpm = Math.min(220, Math.max(30, Math.round(bpm)));
  }
  await write(data);
  return loadWellnessSnapshot();
}
