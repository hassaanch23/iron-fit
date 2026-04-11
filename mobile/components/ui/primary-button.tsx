import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

type Props = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
};

export function PrimaryButton({ label, onPress, secondary = false }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.base, secondary ? styles.secondary : styles.primary]}>
      <Text style={[styles.text, secondary && styles.secondaryText]}>{label}</Text>
    </TouchableOpacity>
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
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryText: { color: AppTheme.colors.primary },
});
