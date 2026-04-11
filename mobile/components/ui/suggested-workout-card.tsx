import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type Props = {
  title: string;
  subtitle: string;
  accentColor: string;
  onStart: () => void;
};

export function SuggestedWorkoutCard({ title, subtitle, accentColor, onStart }: Props) {
  return (
    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: accentColor }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.startButton, { backgroundColor: accentColor }]}
        onPress={onStart}>
        <Text style={styles.startButtonText}>Start workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 20,
    backgroundColor: AppTheme.colors.card,
    marginTop: 10,
  },
  title: { color: AppTheme.colors.textPrimary, fontSize: 28, fontWeight: '700' },
  subtitle: { color: AppTheme.colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 4 },
  startButton: {
    marginTop: 16,
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  startButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
