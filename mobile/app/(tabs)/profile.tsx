import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { useAuth } from '@/context/auth-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextInputField } from '@/components/ui/text-input-field';

export default function ProfileScreen() {
  const { profile, saveProfile, logout } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [weight, setWeight] = useState(profile?.weight_kg?.toString() ?? '');
  const [goal, setGoal] = useState(profile?.target_value?.toString() ?? '');

  const onSave = async () => {
    try {
      await saveProfile({
        name,
        weight_kg: weight ? Number(weight) : null,
        target_value: goal ? Number(goal) : null,
      });
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch {
      Alert.alert('Save failed', 'Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>My Profile</Text>
      <TextInputField label="Name" value={name} onChangeText={setName} />
      <TextInputField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <TextInputField
        label="Weekly target (steps)"
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
      />
      <PrimaryButton label="Save changes" onPress={onSave} />
      <PrimaryButton label="Log out" secondary onPress={() => void logout()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 8, fontSize: 30, fontWeight: '800', color: AppTheme.colors.textPrimary },
});
