import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topArt} pointerEvents="none">
        <View style={styles.arc} />
        <View style={[styles.arc, styles.arc2]} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.title}>Stay on Top of Your Health</Text>
        <Text style={styles.subtitle}>
          Track workouts, monitor progress, and get meaningful insights every week.
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cta}
          onPress={() => router.push('/login')}>
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    paddingHorizontal: 20,
  },
  topArt: { height: SCREEN_HEIGHT * 0.26, justifyContent: 'center', overflow: 'hidden' },
  arc: {
    position: 'absolute',
    width: 620,
    height: 320,
    borderRadius: 300,
    borderWidth: 42,
    borderColor: AppTheme.colors.primary,
    left: -190,
    top: -120,
  },
  arc2: { top: -30 },
  middle: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  title: { fontSize: 38, lineHeight: 44, fontWeight: '800', color: AppTheme.colors.textPrimary },
  subtitle: { fontSize: 16, color: AppTheme.colors.textSecondary, lineHeight: 22 },
  bottom: {
    paddingBottom: 16,
  },
  cta: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
