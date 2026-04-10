import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { useAuth } from '@/context/auth-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextInputField } from '@/components/ui/text-input-field';

export default function OnboardingScreen() {
  const { saveProfile } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');

  const onSave = async () => {
    try {
      await saveProfile({
        name,
        age: age ? Number(age) : null,
        weight_kg: weight ? Number(weight) : null,
        goal_type: 'weekly_steps',
        target_value: goal ? Number(goal) : null,
      });
    } catch {
      Alert.alert('Saved locally', 'Profile will sync when login is enabled.');
    }
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Set your baseline</Text>
      <Text style={styles.subtitle}>We use this to personalize your dashboard and insights.</Text>

      <TextInputField label="Name" value={name} onChangeText={setName} />
      <TextInputField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
      <TextInputField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <TextInputField
        label="Weekly steps target"
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
      />

      <PrimaryButton label="Finish setup" onPress={onSave} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 26, fontSize: 32, fontWeight: '800', color: AppTheme.colors.textPrimary },
  subtitle: { fontSize: 16, color: AppTheme.colors.textSecondary, marginBottom: 8 },
});
