import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';

export default function PlansScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Plans</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Weekly planner is coming next. For now, use Activity to log workouts.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 8, fontSize: 30, fontWeight: '800', color: AppTheme.colors.textPrimary },
  card: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    padding: AppTheme.spacing.md,
  },
  text: { color: AppTheme.colors.textSecondary, lineHeight: 20 },
});
