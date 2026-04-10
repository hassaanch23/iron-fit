import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { useAuth } from '@/context/auth-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextInputField } from '@/components/ui/text-input-field';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Login failed', 'Please check your email and password.');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Continue your Iron Fit journey.</Text>

      <TextInputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInputField label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <PrimaryButton label="Sign in" onPress={onLogin} />
      <PrimaryButton
        label="Sign in with Google"
        secondary
        onPress={() => Alert.alert('Coming soon', 'Google sign-in is temporarily disabled.')}
      />

      <View style={styles.row}>
        <Text style={styles.hint}>No account yet?</Text>
        <Text style={styles.link} onPress={() => router.push('/(auth)/signup')}>
          {' '}
          Create one
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 26, fontSize: 32, fontWeight: '800', color: AppTheme.colors.textPrimary },
  subtitle: { fontSize: 16, color: AppTheme.colors.textSecondary, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
  hint: { color: AppTheme.colors.textSecondary },
  link: { color: AppTheme.colors.primary, fontWeight: '600' },
});
