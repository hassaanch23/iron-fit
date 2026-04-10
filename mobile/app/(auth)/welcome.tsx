import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';

export default function WelcomeScreen() {
  return (
    <ScreenContainer scroll={false}>
      <View style={styles.topArt}>
        <View style={styles.arc} />
        <View style={[styles.arc, styles.arc2]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Stay on Top of Your Health</Text>
        <Text style={styles.subtitle}>
          Track workouts, monitor progress, and get meaningful insights every week.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Get Started" onPress={() => router.push('/(auth)/signup')} />
        <PrimaryButton label="I already have an account" secondary onPress={() => router.push('/(auth)/login')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topArt: { height: 260, justifyContent: 'center', overflow: 'hidden' },
  arc: {
    position: 'absolute',
    width: 620,
    height: 320,
    borderRadius: 300,
    borderWidth: 42,
    borderColor: AppTheme.colors.primary,
    left: -190,
    top: -120,
  },
  arc2: { top: -30 },
  content: { flex: 1, justifyContent: 'center', gap: 10 },
  title: { fontSize: 38, lineHeight: 44, fontWeight: '800', color: AppTheme.colors.textPrimary },
  subtitle: { fontSize: 16, color: AppTheme.colors.textSecondary, lineHeight: 22 },
  actions: { gap: 10 },
});
