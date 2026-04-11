import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';
import { getStrengthExerciseById } from '@/data/strength-exercises';

function youtubeEmbedUri(videoId: string): string {
  const q = new URLSearchParams({
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${q.toString()}`;
}

export default function StrengthDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = typeof id === 'string' ? getStrengthExerciseById(id) : undefined;

  if (!ex) {
    return (
      <ScreenContainer>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={AppTheme.colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.missing}>Exercise not found.</Text>
      </ScreenContainer>
    );
  }

  const embedUri = youtubeEmbedUri(ex.youtubeVideoId);

  const openYoutubeExternal = () => {
    void WebBrowser.openBrowserAsync(ex.youtubeUrl);
  };

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={AppTheme.colors.primary} />
        <Text style={styles.backText}>Exercise library</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.playerShell}>
          <WebView
            source={{ uri: embedUri }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            nestedScrollEnabled
            androidLayerType="hardware"
            renderLoading={() => (
              <View style={styles.webLoading}>
                <ActivityIndicator size="large" color={AppTheme.colors.primary} />
                <Text style={styles.webLoadingText}>Loading video…</Text>
              </View>
            )}
          />
        </View>

        <Text style={styles.embedHint}>Plays inside the app. Use fullscreen on the player when available.</Text>

        <TouchableOpacity style={styles.externalLink} onPress={openYoutubeExternal} activeOpacity={0.7}>
          <Ionicons name="open-outline" size={20} color={AppTheme.colors.primary} />
          <Text style={styles.externalLinkText}>Open in browser / YouTube app</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{ex.name}</Text>
        <Text style={styles.equipment}>{ex.equipment}</Text>
        <Text style={styles.credit}>{ex.videoCredit}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to do it</Text>
          {ex.steps.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumWrap}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coaching cues</Text>
          {ex.cues.map((c, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={18} color={AppTheme.colors.success} />
              <Text style={styles.bulletText}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.warnSection]}>
          <Text style={styles.sectionTitle}>Avoid</Text>
          {ex.mistakes.map((m, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="close-circle" size={18} color="#E53935" />
              <Text style={styles.bulletText}>{m}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Videos are third-party content for education only. Stop if you feel pain and consider a qualified coach for
          form checks.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
  },
  backText: { fontSize: 17, fontWeight: '600', color: AppTheme.colors.primary },
  missing: { fontSize: 16, color: AppTheme.colors.textSecondary, marginTop: 24 },
  scroll: { paddingBottom: 32, gap: 12 },
  playerShell: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webview: { flex: 1, backgroundColor: '#000' },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    gap: 12,
  },
  webLoadingText: { fontSize: 14, color: AppTheme.colors.textSecondary, fontWeight: '600' },
  embedHint: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    lineHeight: 17,
    marginTop: -4,
  },
  externalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  externalLinkText: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.primary },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  equipment: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.textSecondary, marginTop: 4 },
  credit: { fontSize: 12, color: AppTheme.colors.textSecondary, lineHeight: 18, fontStyle: 'italic', marginTop: 6 },
  section: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 16,
    gap: 12,
    marginTop: 4,
  },
  warnSection: { borderColor: 'rgba(229,57,53,0.25)' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: AppTheme.colors.textPrimary },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNumWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 13, fontWeight: '800', color: AppTheme.colors.primary },
  stepText: { flex: 1, fontSize: 15, color: AppTheme.colors.textPrimary, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletText: { flex: 1, fontSize: 14, color: AppTheme.colors.textSecondary, lineHeight: 21 },
  disclaimer: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
