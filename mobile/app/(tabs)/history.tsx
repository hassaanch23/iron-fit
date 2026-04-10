import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SimpleBars } from '@/components/ui/simple-bars';
import { api } from '@/lib/api';
import type { HistoryPoint } from '@/types/api';

type Timeframe = 'week' | 'month';

export default function HistoryScreen() {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [points, setPoints] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<{ timeframe: string; points: HistoryPoint[] }>(
          `/analytics/history?timeframe=${timeframe}`
        );
        setPoints(res.data.points);
      } catch {
        setPoints([]);
      }
    };
    void load();
  }, [timeframe]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Progress History</Text>
      <View style={styles.switch}>
        <TimePill active={timeframe === 'week'} label="Week" onPress={() => setTimeframe('week')} />
        <TimePill active={timeframe === 'month'} label="Month" onPress={() => setTimeframe('month')} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Steps Trend</Text>
        <SimpleBars values={points.length ? points.map((p) => p.steps) : [1, 1, 1, 1, 1, 1, 1]} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Highlights</Text>
        {points.slice(-5).reverse().map((p) => (
          <View key={p.period} style={styles.pointRow}>
            <Text style={styles.pointLabel}>{p.period}</Text>
            <Text style={styles.pointValue}>{p.steps} steps</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

function TimePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 8, fontSize: 30, fontWeight: '800', color: AppTheme.colors.textPrimary },
  switch: { flexDirection: 'row', gap: 8 },
  pill: {
    backgroundColor: AppTheme.colors.primarySoft,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillActive: { backgroundColor: AppTheme.colors.primary },
  pillText: { color: AppTheme.colors.primary, fontWeight: '700' },
  pillTextActive: { color: '#fff' },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: AppTheme.spacing.md,
    gap: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: AppTheme.colors.textPrimary },
  pointRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pointLabel: { color: AppTheme.colors.textSecondary },
  pointValue: { color: AppTheme.colors.textPrimary, fontWeight: '600' },
});
