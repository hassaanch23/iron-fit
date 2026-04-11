import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { useAuth } from '@/context/auth-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SAFE_AREA_ALL_EDGES, ScreenContainer } from '@/components/ui/screen-container';
import { Toast } from '@/components/ui/toast';

const CODE_LENGTH = 6;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, resendOtp } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const char = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = digits.join('');

  const onVerify = async () => {
    if (code.length < CODE_LENGTH) {
      setToastType('error');
      setToast('Please enter the full 6-digit code');
      return;
    }
    setVerifying(true);
    try {
      await verifyOtp(email ?? '', code);
      router.replace('/onboarding');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Try again.';
      setToastType('error');
      setToast(msg);
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    try {
      await resendOtp(email ?? '');
      setToastType('success');
      setToast('New code sent! Check your email.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not resend. Try again later.';
      setToastType('error');
      setToast(msg);
    }
  };

  return (
    <ScreenContainer edges={SAFE_AREA_ALL_EDGES}>
      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        color={toastType === 'success' ? '#2EBD85' : undefined}
      />

      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <View style={styles.codeRow}>
        {digits.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputRefs.current[i] = ref; }}
            value={digit}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
            autoFocus={i === 0}
            selectTextOnFocus
          />
        ))}
      </View>

      <View style={styles.verifyBlock}>
        <PrimaryButton
          label={verifying ? 'Verifying...' : 'Verify'}
          onPress={onVerify}
        />
      </View>

      <View style={styles.resendRow}>
        <Text style={styles.resendHint}>{"Didn't receive the code? "}</Text>
        <TouchableOpacity onPress={onResend}>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 32, fontSize: 32, fontWeight: '800', color: AppTheme.colors.textPrimary },
  subtitle: {
    fontSize: 16,
    color: AppTheme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  emailHighlight: {
    color: AppTheme.colors.textPrimary,
    fontWeight: '700',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.card,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
  },
  codeBoxFilled: {
    borderColor: AppTheme.colors.primary,
  },
  verifyBlock: { marginTop: 8 },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendHint: { color: AppTheme.colors.textSecondary, fontSize: 15 },
  resendLink: { color: AppTheme.colors.primary, fontWeight: '600', fontSize: 15 },
});
