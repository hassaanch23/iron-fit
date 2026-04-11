import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { AppTheme } from '@/constants/app-theme';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import {
  STRENGTH_CATEGORIES,
  STRENGTH_EXERCISES,
  type StrengthCategory,
  type StrengthExercise,
  strengthExerciseThumbnail,
} from '@/data/strength-exercises';

function categoryLabel(cat: StrengthCategory): string {
  return STRENGTH_CATEGORIES.find((c) => c.key === cat)?.label ?? cat;
}

function exerciseMatchesSearch(ex: StrengthExercise, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const haystack = `${ex.name} ${ex.demoSummary} ${ex.equipment} ${ex.id} ${categoryLabel(ex.category)}`.toLowerCase();
  return haystack.includes(t);
}

export default function StrengthListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<StrengthCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const byCat =
      filter === 'all' ? STRENGTH_EXERCISES : STRENGTH_EXERCISES.filter((e) => e.category === filter);
    return byCat.filter((e) => exerciseMatchesSearch(e, searchQuery));
  }, [filter, searchQuery]);

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={AppTheme.colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScreenHeader
        title="Exercise library"
        subtitle="Video demos, form cues, and trusted YouTube references for every move."
      />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color={AppTheme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search name, muscle group, equipment…"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={10}
            accessibilityLabel="Clear search"
            style={styles.searchClear}>
            <Ionicons name="close-circle" size={22} color={AppTheme.colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}>
        <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        {STRENGTH_CATEGORIES.map((c) => (
          <FilterChip
            key={c.key}
            label={c.label}
            active={filter === c.key}
            onPress={() => setFilter(c.key)}
          />
        ))}
      </ScrollView>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptySearch}>
            <Ionicons name="search-outline" size={40} color={AppTheme.colors.border} />
            <Text style={styles.emptySearchTitle}>No exercises match</Text>
            <Text style={styles.emptySearchSub}>
              Try another word, clear the search, or switch category chips above.
            </Text>
          </View>
        ) : (
          filtered.map((ex) => (
            <TouchableOpacity
              key={ex.id}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => router.push(`/strength/${ex.id}`)}>
              <Image
                source={{ uri: strengthExerciseThumbnail(ex.youtubeVideoId) }}
                style={styles.thumb}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={styles.catPill}>
                    <Text style={styles.catPillText}>{categoryShort(ex.category)}</Text>
                  </View>
                  <Text style={styles.equipment}>{ex.equipment}</Text>
                </View>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exSummary} numberOfLines={2}>
                  {ex.demoSummary}
                </Text>
                <View style={styles.cardFooter}>
                  <Ionicons name="logo-youtube" size={18} color="#E53935" />
                  <Text style={styles.watchHint}>Demo video</Text>
                  <Ionicons name="chevron-forward" size={18} color={AppTheme.colors.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

function categoryShort(c: StrengthCategory): string {
  switch (c) {
    case 'lower':
      return 'Lower';
    case 'push':
      return 'Push';
    case 'pull':
      return 'Pull';
    case 'core':
      return 'Core';
  }
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.85}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  backText: { fontSize: 17, fontWeight: '600', color: AppTheme.colors.primary },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchIcon: { marginRight: 4 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: AppTheme.colors.textPrimary,
    paddingVertical: 10,
    paddingRight: 8,
  },
  searchClear: { padding: 4 },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptySearchTitle: { fontSize: 17, fontWeight: '800', color: AppTheme.colors.textPrimary },
  emptySearchSub: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  chipsScroll: { marginHorizontal: -4, maxHeight: 48 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingVertical: 4, paddingRight: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  chipActive: { backgroundColor: AppTheme.colors.primary, borderColor: AppTheme.colors.primary },
  chipText: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textSecondary },
  chipTextActive: { color: '#fff' },
  list: { gap: 14, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    overflow: 'hidden',
    minHeight: 132,
  },
  thumb: { width: 120, minHeight: 132, backgroundColor: AppTheme.colors.border },
  cardBody: { flex: 1, padding: 14, justifyContent: 'space-between', minWidth: 0 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  catPill: {
    backgroundColor: AppTheme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  catPillText: { fontSize: 11, fontWeight: '800', color: AppTheme.colors.primary },
  equipment: { fontSize: 11, color: AppTheme.colors.textSecondary, fontWeight: '600', flex: 1, textAlign: 'right' },
  exName: { fontSize: 17, fontWeight: '800', color: AppTheme.colors.textPrimary, marginTop: 6 },
  exSummary: { fontSize: 13, color: AppTheme.colors.textSecondary, lineHeight: 19, marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  watchHint: { flex: 1, fontSize: 13, fontWeight: '700', color: AppTheme.colors.textPrimary },
});
