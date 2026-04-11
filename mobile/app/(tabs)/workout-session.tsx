import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { AppTheme } from '@/constants/app-theme';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { getStrengthExerciseById, strengthExerciseThumbnail, type StrengthExercise } from '@/data/strength-exercises';

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function parseIdsParam(raw: string | string[] | undefined): string[] {
  const s = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string; subtitle?: string; ids?: string }>();
  const title =
    typeof params.title === 'string' ? params.title : Array.isArray(params.title) ? params.title[0] : 'Workout';
  const subtitle =
    typeof params.subtitle === 'string'
      ? params.subtitle
      : Array.isArray(params.subtitle)
        ? params.subtitle[0]
        : '';

  const demoExercises = useMemo(() => {
    const ids = parseIdsParam(params.ids);
    const list: StrengthExercise[] = [];
    for (const id of ids) {
      const ex = getStrengthExerciseById(id);
      if (ex) list.push(ex);
    }
    return list;
  }, [params.ids]);

  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const tick = useCallback(() => {
    setElapsed((e) => e + 1);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  const finish = () => {
    setRunning(false);
    router.back();
  };

  return (
    <ScreenContainer>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => {
          setRunning(false);
          router.back();
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Close workout">
        <Ionicons name="chevron-down" size={26} color={AppTheme.colors.textSecondary} />
        <Text style={styles.backText}>Close</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <View style={styles.pulseRing}>
            <Ionicons name="fitness-outline" size={40} color={AppTheme.colors.primary} />
          </View>
          <Text style={styles.sessionLabel}>Session</Text>
          <Text style={styles.title} numberOfLines={3}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={4}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {demoExercises.length > 0 ? (
          <View style={styles.demosSection}>
            <Text style={styles.demosSectionTitle}>Form & video demos</Text>
            <Text style={styles.demosSectionHint}>
              Tap a move for step-by-step cues and to open the YouTube demo.
            </Text>
            <View style={styles.demoList}>
              {demoExercises.map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  style={styles.demoCard}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/strength/${ex.id}`)}>
                  <Image
                    source={{ uri: strengthExerciseThumbnail(ex.youtubeVideoId) }}
                    style={styles.demoThumb}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.demoCardBody}>
                    <Text style={styles.demoName} numberOfLines={2}>
                      {ex.name}
                    </Text>
                    <Text style={styles.demoSummary} numberOfLines={2}>
                      {ex.demoSummary}
                    </Text>
                    <View style={styles.demoFooter}>
                      <Ionicons name="logo-youtube" size={16} color="#E53935" />
                      <Text style={styles.demoWatch}>Open demo</Text>
                      <Ionicons name="chevron-forward" size={16} color={AppTheme.colors.textSecondary} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.libraryFallback} onPress={() => router.push('/strength')} activeOpacity={0.85}>
            <Ionicons name="library-outline" size={22} color={AppTheme.colors.primary} />
            <Text style={styles.libraryFallbackText}>Browse the exercise library for videos and cues</Text>
            <Ionicons name="chevron-forward" size={18} color={AppTheme.colors.textSecondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.browseAll} onPress={() => router.push('/strength')} activeOpacity={0.75}>
          <Text style={styles.browseAllText}>See all exercises</Text>
        </TouchableOpacity>

        <View style={styles.timerCard}>
          <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          <Text style={styles.timerHint}>{running ? 'Timer running' : 'Paused'}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.controlSecondary]}
            onPress={() => setRunning((r) => !r)}
            activeOpacity={0.85}>
            <Ionicons name={running ? 'pause' : 'play'} size={24} color={AppTheme.colors.primary} />
            <Text style={styles.controlLabel}>{running ? 'Pause' : 'Resume'}</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton label="End workout" onPress={finish} />

        <Text style={styles.footerHint}>
          When you’re done, log steps and distance in Stats so History stays up to date.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28, gap: 14 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  backText: { fontSize: 15, fontWeight: '600', color: AppTheme.colors.textSecondary },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 4 },
  pulseRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppTheme.colors.card,
  },
  sessionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: AppTheme.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  demosSection: { gap: 8 },
  demosSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    paddingHorizontal: 4,
  },
  demosSectionHint: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  demoList: { gap: 12 },
  demoCard: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    overflow: 'hidden',
    minHeight: 112,
  },
  demoThumb: { width: 108, minHeight: 112, backgroundColor: AppTheme.colors.border },
  demoCardBody: { flex: 1, padding: 12, justifyContent: 'center', minWidth: 0 },
  demoName: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  demoSummary: { fontSize: 12, color: AppTheme.colors.textSecondary, lineHeight: 17, marginTop: 4 },
  demoFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  demoWatch: { flex: 1, fontSize: 13, fontWeight: '700', color: AppTheme.colors.primary },
  libraryFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
  },
  libraryFallbackText: { flex: 1, fontSize: 14, fontWeight: '600', color: AppTheme.colors.textPrimary, lineHeight: 20 },
  browseAll: { alignSelf: 'center', paddingVertical: 4 },
  browseAllText: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.primary },
  timerCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  timer: {
    fontSize: 56,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerHint: { fontSize: 14, color: AppTheme.colors.textSecondary, fontWeight: '600' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.card,
  },
  controlSecondary: { borderColor: AppTheme.colors.primarySoft },
  controlLabel: { fontSize: 16, fontWeight: '700', color: AppTheme.colors.primary },
  footerHint: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
});
