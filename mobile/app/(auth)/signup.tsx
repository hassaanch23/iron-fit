import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';
import { useAuth } from '@/context/auth-context';
import { GoogleButton } from '@/components/ui/google-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextInputField } from '@/components/ui/text-input-field';
import { Toast } from '@/components/ui/toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export default function SignupScreen() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const emailError = emailTouched && email.length > 0 && !EMAIL_RE.test(email)
    ? 'Enter a valid email address'
    : null;

  const passwordError = passwordTouched && password.length > 0 && password.length < MIN_PASSWORD
    ? `Password must be at least ${MIN_PASSWORD} characters`
    : null;

  const handleEmailChange = useCallback((val: string) => {
    setEmail(val);
    if (!emailTouched && val.length > 0) setEmailTouched(true);
  }, [emailTouched]);

  const handlePasswordChange = useCallback((val: string) => {
    setPassword(val);
    if (!passwordTouched && val.length > 0) setPasswordTouched(true);
  }, [passwordTouched]);

  const onSignup = async () => {
    if (!email.trim()) {
      setToast('Email is required');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setToast('Please enter a valid email address');
      setEmailTouched(true);
      return;
    }
    if (!password) {
      setToast('Password is required');
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setToast(`Password must be at least ${MIN_PASSWORD} characters`);
      setPasswordTouched(true);
      return;
    }
    try {
      await signup(email, password);
      router.replace({ pathname: '/verify-otp', params: { email } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed. Try again.';
      setToast(msg);
    }
  };

  const onGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-up failed. Try again.';
      setToast(msg);
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
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Get personalized metrics and weekly coaching insights.</Text>

            <TextInputField
              label="Email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              error={emailError}
            />
            <TextInputField
              label="Password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              error={passwordError}
            />

            <View style={styles.createBlock}>
              <PrimaryButton label="Create account" onPress={onSignup} />
            </View>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <GoogleButton onPress={onGoogle} />

            <View style={styles.footerRow}>
              <Text style={styles.footerHint}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.link}>Sign in</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: '25%',
  },
  form: { gap: AppTheme.spacing.md },
  title: { fontSize: 32, fontWeight: '800', color: AppTheme.colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 16, color: AppTheme.colors.textSecondary, marginBottom: 4, textAlign: 'center' },
  createBlock: { marginTop: 4 },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 22,
  },
  orLine: { flex: 1, height: 1, backgroundColor: AppTheme.colors.border },
  orText: { color: AppTheme.colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 8,
  },
  footerHint: { color: AppTheme.colors.textSecondary, fontSize: 15 },
  link: { color: AppTheme.colors.primary, fontWeight: '600', fontSize: 15 },
});
