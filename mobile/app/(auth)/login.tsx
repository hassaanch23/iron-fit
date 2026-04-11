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

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const emailError = emailTouched && email.length > 0 && !EMAIL_RE.test(email)
    ? 'Enter a valid email address'
    : null;

  const handleEmailChange = useCallback((val: string) => {
    setEmail(val);
    if (!emailTouched && val.length > 0) setEmailTouched(true);
  }, [emailTouched]);

  const onLogin = async () => {
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
    try {
      await login(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      setToast(msg);
    }
  };

  const onGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed. Try again.';
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Continue your Iron Fit journey.</Text>

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
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.signInBlock}>
              <PrimaryButton label="Sign in" onPress={onLogin} />
            </View>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <GoogleButton onPress={onGoogle} />

            <View style={styles.footerRow}>
              <Text style={styles.footerHint}>{"Don't have an account? "}</Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.link}>Sign up</Text>
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
  signInBlock: { marginTop: 4 },
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
