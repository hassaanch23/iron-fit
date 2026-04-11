import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /**
   * Tab screens omit `bottom` so the system doesn’t pad content above the tab bar twice.
   */
  edges?: Edge[];
};

/** Default: no bottom inset (tab bar handles home indicator). */
const DEFAULT_EDGES: Edge[] = ['top', 'left', 'right'];

/** Use on auth / modal flows where there is no tab bar. */
export const SAFE_AREA_ALL_EDGES: Edge[] = ['top', 'right', 'left', 'bottom'];

export function ScreenContainer({ children, scroll = true, edges = DEFAULT_EDGES }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
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
