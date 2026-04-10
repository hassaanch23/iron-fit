import { Pressable, StyleSheet, Text } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type Props = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
};

export function PrimaryButton({ label, onPress, secondary = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        secondary ? styles.secondary : styles.primary,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.text, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primary: { backgroundColor: AppTheme.colors.primary },
  secondary: { backgroundColor: AppTheme.colors.primarySoft },
  pressed: { opacity: 0.85 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryText: { color: AppTheme.colors.primary },
});
