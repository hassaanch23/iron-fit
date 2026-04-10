import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
};

export function ScreenContainer({ children, scroll = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, styles.content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AppTheme.colors.background },
  container: { flex: 1 },
  content: { padding: AppTheme.spacing.md, gap: AppTheme.spacing.md },
});
