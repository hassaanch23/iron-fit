import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppTheme } from '@/constants/app-theme';
import { BmiGauge } from '@/components/ui/bmi-gauge';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useAuth } from '@/context/auth-context';
import { calcBmi, getBmiInfo } from '@/lib/bmi';

export default function BmiScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const bmi = calcBmi(profile?.weight_kg ?? null, profile?.height_cm ?? null);

  return (
    <ScreenContainer>
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
        title="BMI insights"
        subtitle="Body mass index, category, and personalized tips."
      />

      {bmi !== null ? (
        <>
          <BmiGauge
            bmi={bmi}
            weightKg={profile?.weight_kg ?? null}
            heightCm={profile?.height_cm ?? null}
          />
          <View style={styles.suggestionCard}>
            <Ionicons name="bulb-outline" size={18} color={getBmiInfo(bmi).color} />
            <Text style={styles.suggestionText}>{getBmiInfo(bmi).suggestion}</Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="person-outline" size={40} color={AppTheme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Height and weight needed</Text>
          <Text style={styles.emptyBody}>
            Add your height and weight in Profile so we can calculate your BMI and show the gauge.
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: -4,
  },
  backText: {
    fontSize: 17,
    fontWeight: '600',
    color: AppTheme.colors.primary,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
  },
  suggestionText: {
    color: AppTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 28,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 15,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
