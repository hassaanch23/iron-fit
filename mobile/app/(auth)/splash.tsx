import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { SAFE_AREA_ALL_EDGES, ScreenContainer } from '@/components/ui/screen-container';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer scroll={false} edges={SAFE_AREA_ALL_EDGES}>
      <View style={styles.center}>
        <View style={styles.logoBubble}>
          <Text style={styles.logoText}>IF</Text>
        </View>
        <Text style={styles.brand}>Iron Fit</Text>
        <Text style={styles.tag}>Train smart. Track better.</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  logoBubble: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  brand: { color: AppTheme.colors.textPrimary, fontSize: 34, fontWeight: '800' },
  tag: { color: AppTheme.colors.textSecondary, fontSize: 16 },
});
