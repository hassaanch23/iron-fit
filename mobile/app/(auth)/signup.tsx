import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { useAuth } from '@/context/auth-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextInputField } from '@/components/ui/text-input-field';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSignup = async () => {
    try {
      await signup(email, password);
      router.replace('/(auth)/onboarding');
    } catch {
      Alert.alert('Signup failed', 'Use a valid email and a password with at least 8 characters.');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Get personalized metrics and weekly coaching insights.</Text>

      <TextInputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInputField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <PrimaryButton label="Create account" onPress={onSignup} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 26, fontSize: 32, fontWeight: '800', color: AppTheme.colors.textPrimary },
  subtitle: { fontSize: 16, color: AppTheme.colors.textSecondary, marginBottom: 8 },
});
