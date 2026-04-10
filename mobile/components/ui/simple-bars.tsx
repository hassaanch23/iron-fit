import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type Props = {
  values: number[];
};

export function SimpleBars({ values }: Props) {
  const max = Math.max(...values, 1);
  return (
    <View style={styles.wrapper}>
      {values.map((value, i) => {
        const height = Math.max(8, (value / max) * 84);
        return (
          <View key={`${i}-${value}`} style={styles.item}>
            <View style={[styles.bar, { height }]} />
            <Text style={styles.label}>{i + 1}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', paddingTop: 6 },
  item: { alignItems: 'center', gap: 6, flex: 1 },
  bar: { width: '100%', borderRadius: 10, backgroundColor: AppTheme.colors.primary },
  label: { color: AppTheme.colors.textSecondary, fontSize: 11 },
});
