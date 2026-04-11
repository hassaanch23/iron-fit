import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type Props = {
  values: number[];
  /** X-axis labels; defaults to 1…n */
  labels?: string[];
  /** Bar fill (defaults to primary) */
  barColor?: string;
};

export function SimpleBars({ values, labels, barColor }: Props) {
  const max = Math.max(...values, 1);
  return (
    <View style={styles.wrapper}>
      {values.map((value, i) => {
        const height = Math.max(10, (value / max) * 96);
        const label = labels?.[i] ?? String(i + 1);
        return (
          <View key={`${i}-${value}`} style={styles.item}>
            <View style={[styles.barTrack]}>
              <View
                style={[
                  styles.bar,
                  { height, backgroundColor: barColor ?? AppTheme.colors.primary },
                ]}
              />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', paddingTop: 8, minHeight: 124 },
  item: { alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  barTrack: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    borderRadius: 12,
    backgroundColor: 'rgba(230, 232, 240, 0.45)',
    overflow: 'hidden',
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 10,
  },
  label: { color: AppTheme.colors.textSecondary, fontSize: 10, fontWeight: '600', textAlign: 'center' },
});
