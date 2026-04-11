import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { SuggestedWorkoutCard } from '@/components/ui/suggested-workout-card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useAuth } from '@/context/auth-context';
import { calcBmi, getBmiInfo } from '@/lib/bmi';
import { workoutsForBmi } from '@/lib/suggested-workouts';

export default function SuggestedWorkoutsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const bmi = calcBmi(profile?.weight_kg ?? null, profile?.height_cm ?? null);
  const { workouts, sectionHint } = useMemo(() => workoutsForBmi(bmi), [bmi]);
  const accent = bmi !== null ? getBmiInfo(bmi).color : AppTheme.colors.primary;

  return (
    <ScreenContainer scroll={false}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={24} color={AppTheme.colors.primary} />
        <Text style={styles.backText}>Home</Text>
      </TouchableOpacity>

      <ScreenHeader
        title="Suggested workouts"
        subtitle="Picks based on your profile. Start a session to open video demos for each move."
      />

      <Text style={styles.hint}>{sectionHint}</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {workouts.map((w) => (
          <SuggestedWorkoutCard
            key={w.title}
            title={w.title}
            subtitle={w.subtitle}
            accentColor={accent}
            onStart={() =>
              router.push({
                pathname: '/workout-session',
                params: {
                  title: w.title,
                  subtitle: w.subtitle,
                  ids: w.demoExerciseIds.join(','),
                },
              })
            }
          />
        ))}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  backText: { fontSize: 17, fontWeight: '600', color: AppTheme.colors.primary },
  hint: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  footerSpacer: { height: 8 },
});
