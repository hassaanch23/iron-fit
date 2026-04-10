import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    flex: 1,
    gap: 4,
  },
  label: { color: AppTheme.colors.textSecondary, fontSize: 13 },
  value: { color: AppTheme.colors.textPrimary, fontSize: 23, fontWeight: '700' },
  hint: { color: AppTheme.colors.textSecondary, fontSize: 12 },
});
