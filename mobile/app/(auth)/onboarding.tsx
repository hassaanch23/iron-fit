import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';
import { useAuth } from '@/context/auth-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextInputField } from '@/components/ui/text-input-field';
import { Toast } from '@/components/ui/toast';
import { getBmiCategory } from '@/lib/bmi';

type WeightUnit = 'kg' | 'lbs';
type HeightUnit = 'cm' | 'ft';
type Gender = 'male' | 'female' | 'other';

function toKg(value: number, unit: WeightUnit): number {
  return unit === 'lbs' ? value * 0.453592 : value;
}

function toCm(value: number, unit: HeightUnit): number {
  return unit === 'ft' ? value * 30.48 : value;
}

function calcBmi(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}


export default function OnboardingScreen() {
  const router = useRouter();
  const { saveProfile } = useAuth();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [goal, setGoal] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const weightKg = weight ? toKg(Number(weight), weightUnit) : 0;
  const heightCm = height ? toCm(Number(height), heightUnit) : 0;
  const bmi = calcBmi(weightKg, heightCm);

  const onSave = async () => {
    if (!name.trim()) { setToast('Please enter your name'); return; }
    if (!age) { setToast('Please enter your age'); return; }
    if (!gender) { setToast('Please select your gender'); return; }
    if (!weight) { setToast('Please enter your weight'); return; }
    if (!height) { setToast('Please enter your height'); return; }

    try {
      await saveProfile({
        name,
        age: Number(age),
        weight_kg: Math.round(weightKg * 10) / 10,
        height_cm: Math.round(heightCm * 10) / 10,
        goal_type: 'weekly_steps',
        target_value: goal ? Number(goal) : null,
      });
      router.replace('/(tabs)');
    } catch {
      setToast('Could not save your profile. Check your connection and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Toast message={toast} onDismiss={() => setToast(null)} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <View style={styles.form}>
            <Text style={styles.title}>Set your baseline</Text>
            <Text style={styles.subtitle}>We use this to personalize your dashboard and calculate your BMI.</Text>

            <TextInputField label="Name" value={name} onChangeText={setName} />
            <TextInputField label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />

            {/* Gender */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.pillRow}>
                {(['male', 'female', 'other'] as Gender[]).map((g) => (
                  <TouchableOpacity
                    key={g}
                    activeOpacity={0.8}
                    onPress={() => setGender(g)}
                    style={[styles.pill, gender === g && styles.pillActive]}>
                    <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Weight */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Weight</Text>
              <View style={styles.inputWithUnit}>
                <View style={styles.inputFlex}>
                  <TextInputField
                    label=""
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.unitToggle}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setWeightUnit('kg')}
                    style={[styles.unitPill, weightUnit === 'kg' && styles.unitPillActive]}>
                    <Text style={[styles.unitText, weightUnit === 'kg' && styles.unitTextActive]}>kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setWeightUnit('lbs')}
                    style={[styles.unitPill, weightUnit === 'lbs' && styles.unitPillActive]}>
                    <Text style={[styles.unitText, weightUnit === 'lbs' && styles.unitTextActive]}>lbs</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Height */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Height</Text>
              <View style={styles.inputWithUnit}>
                <View style={styles.inputFlex}>
                  <TextInputField
                    label=""
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.unitToggle}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setHeightUnit('cm')}
                    style={[styles.unitPill, heightUnit === 'cm' && styles.unitPillActive]}>
                    <Text style={[styles.unitText, heightUnit === 'cm' && styles.unitTextActive]}>cm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setHeightUnit('ft')}
                    style={[styles.unitPill, heightUnit === 'ft' && styles.unitPillActive]}>
                    <Text style={[styles.unitText, heightUnit === 'ft' && styles.unitTextActive]}>ft</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* BMI preview */}
            {bmi !== null && (
              <View style={styles.bmiCard}>
                <Text style={styles.bmiTitle}>Your BMI</Text>
                <View style={styles.bmiRow}>
                  <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
                  <View style={[styles.bmiBadge, { backgroundColor: getBmiCategory(bmi).color + '20' }]}>
                    <Text style={[styles.bmiBadgeText, { color: getBmiCategory(bmi).color }]}>
                      {getBmiCategory(bmi).label}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TextInputField
              label="Weekly steps target (optional)"
              value={goal}
              onChangeText={setGoal}
              keyboardType="number-pad"
            />

            <PrimaryButton label="Finish setup" onPress={onSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppTheme.colors.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: AppTheme.spacing.md,
    paddingTop: '10%',
  },
  form: { gap: 14 },
  title: { fontSize: 32, fontWeight: '800', color: AppTheme.colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 15, color: AppTheme.colors.textSecondary, textAlign: 'center', marginBottom: 4 },

  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 14, color: AppTheme.colors.textSecondary },

  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  pillActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  pillText: { fontSize: 15, fontWeight: '600', color: AppTheme.colors.textSecondary },
  pillTextActive: { color: '#fff' },

  inputWithUnit: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  inputFlex: { flex: 1 },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    overflow: 'hidden',
    marginBottom: 2,
  },
  unitPill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  unitPillActive: {
    backgroundColor: AppTheme.colors.primary,
  },
  unitText: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textSecondary },
  unitTextActive: { color: '#fff' },

  bmiCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  bmiTitle: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.textSecondary },
  bmiRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bmiValue: { fontSize: 36, fontWeight: '800', color: AppTheme.colors.textPrimary },
  bmiBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  bmiBadgeText: { fontSize: 14, fontWeight: '700' },
});
