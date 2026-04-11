import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';

export default function OnboardingIntroScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <Text style={styles.title}>Build Better Fitness Habits</Text>
      <Text style={styles.subtitle}>
        See progress, get insights, and stay consistent with a routine designed for you.
      </Text>

      <Feature icon="stats-chart" title="Smart Analytics" text="Weekly and monthly insights from your activity." />
      <Feature icon="walk" title="Activity Logging" text="Track steps, distance, calories, and workout time." />
      <Feature icon="trophy" title="Goal Focused" text="Set goals and monitor progress in one place." />

      <View style={styles.actions}>
        <PrimaryButton label="Continue" onPress={() => router.replace('/onboarding')} />
      </View>
    </ScreenContainer>
  );
}

function Feature({ icon, title, text }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }) {
  return (
    <View style={styles.featureCard}>
      <Ionicons name={icon} size={20} color={AppTheme.colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 18, fontSize: 34, lineHeight: 38, fontWeight: '800', color: AppTheme.colors.textPrimary },
  subtitle: { color: AppTheme.colors.textSecondary, fontSize: 16, lineHeight: 22, marginBottom: 6 },
  featureCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
  },
  featureTitle: { color: AppTheme.colors.textPrimary, fontWeight: '700', fontSize: 16 },
  featureText: { color: AppTheme.colors.textSecondary, marginTop: 2 },
  actions: { marginTop: 8 },
});
