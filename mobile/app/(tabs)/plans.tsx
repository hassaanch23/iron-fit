import * as Crypto from 'expo-crypto';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextInputField } from '@/components/ui/text-input-field';
import {
  addPlansBatch,
  deletePlan,
  loadPlans,
  parseSetsRepsFromStrings,
  type PlanItem,
  startOfWeekMonday,
  toYMD,
  togglePlanComplete,
} from '@/lib/plan-storage';

type ExerciseDraft = {
  key: string;
  title: string;
  sets: string;
  reps: string;
  notes: string;
};

function newDraft(): ExerciseDraft {
  return { key: Crypto.randomUUID(), title: '', sets: '', reps: '', notes: '' };
}

function weekRangeYmd(anchor: Date): { mon: string; sun: string; days: { ymd: string; label: string; dayNum: string }[] } {
  const monday = startOfWeekMonday(anchor);
  const sun = new Date(monday);
  sun.setDate(monday.getDate() + 6);
  const sunYmd = toYMD(sun);
  const days: { ymd: string; label: string; dayNum: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      ymd: toYMD(d),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNum: String(d.getDate()),
    });
  }
  return { mon: toYMD(monday), sun: sunYmd, days };
}

function formatSetsReps(p: PlanItem): string {
  if (p.sets != null && p.reps != null) return `${p.sets} × ${p.reps}`;
  if (p.sets != null) return `${p.sets} sets`;
  if (p.reps != null) return `${p.reps} reps`;
  return '';
}

function parseYmdDisplay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function detailDayTitle(ymd: string): string {
  const [y, mo, d] = ymd.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  return dt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function PlansScreen() {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [detailYmd, setDetailYmd] = useState<string | null>(null);
  const [exerciseDrafts, setExerciseDrafts] = useState<ExerciseDraft[]>([newDraft()]);
  const [selectedYmd, setSelectedYmd] = useState(() => toYMD(new Date()));

  const anchor = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const { mon, sun, days } = useMemo(() => weekRangeYmd(anchor), [anchor]);

  const refresh = useCallback(async () => {
    setPlans(await loadPlans());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const weekPlans = useMemo(
    () => plans.filter((p) => p.date >= mon && p.date <= sun),
    [plans, mon, sun],
  );

  const plansByYmd = useMemo(() => {
    const m = new Map<string, PlanItem[]>();
    for (const p of weekPlans) {
      const arr = m.get(p.date) ?? [];
      arr.push(p);
      m.set(p.date, arr);
    }
    for (const [k, arr] of m) {
      arr.sort((a, b) => a.title.localeCompare(b.title));
      m.set(k, arr);
    }
    return m;
  }, [weekPlans]);

  const daysWithPlans = useMemo(
    () => days.filter((d) => (plansByYmd.get(d.ymd) ?? []).length > 0),
    [days, plansByYmd],
  );

  const detailItems = useMemo(() => {
    if (!detailYmd) return [];
    return plans.filter((p) => p.date === detailYmd).sort((a, b) => a.title.localeCompare(b.title));
  }, [plans, detailYmd]);

  const detailDayMeta = useMemo(() => {
    if (!detailYmd) return null;
    return { title: detailDayTitle(detailYmd), ymd: detailYmd };
  }, [detailYmd]);

  const total = weekPlans.length;
  const done = weekPlans.filter((p) => p.completed).length;

  const pickDefaultYmd = useCallback(() => {
    const today = toYMD(new Date());
    return days.some((x) => x.ymd === today) ? today : days[0].ymd;
  }, [days]);

  const openAdd = useCallback(() => {
    setDetailYmd(null);
    setSelectedYmd(pickDefaultYmd());
    setExerciseDrafts([newDraft()]);
    setAddOpen(true);
  }, [pickDefaultYmd]);

  const openAddMoreForDay = useCallback(
    (ymd: string) => {
      setDetailYmd(null);
      setSelectedYmd(ymd);
      setExerciseDrafts([newDraft()]);
      setAddOpen(true);
    },
    [],
  );

  const updateDraft = (key: string, patch: Partial<Omit<ExerciseDraft, 'key'>>) => {
    setExerciseDrafts((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const addDraftRow = () => {
    setExerciseDrafts((prev) => [...prev, newDraft()]);
  };

  const removeDraftRow = (key: string) => {
    setExerciseDrafts((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));
  };

  const submitAdd = async () => {
    const batch = exerciseDrafts
      .map((d) => {
        const { sets, reps } = parseSetsRepsFromStrings(d.sets, d.reps);
        return {
          title: d.title.trim(),
          sets,
          reps,
          notes: d.notes.trim(),
          durationMin: null as number | null,
        };
      })
      .filter((x) => x.title.length > 0);
    if (batch.length === 0) return;
    const next = await addPlansBatch(selectedYmd, batch);
    setPlans(next);
    setAddOpen(false);
  };

  const onToggle = async (id: string) => {
    setPlans(await togglePlanComplete(id));
  };

  const onDelete = async (id: string) => {
    const next = await deletePlan(id);
    setPlans(next);
    if (detailYmd && next.filter((p) => p.date === detailYmd).length === 0) {
      setDetailYmd(null);
    }
  };

  const weekTitle = `${parseYmdDisplay(mon)} – ${parseYmdDisplay(sun)}`;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Plans"
        subtitle="Add one or more exercises per day—tap a day to see sets, reps, and notes."
      />

      <View style={styles.weekNav}>
        <TouchableOpacity
          style={styles.weekNavBtn}
          onPress={() => setWeekOffset((w) => w - 1)}
          hitSlop={12}
          accessibilityLabel="Previous week">
          <Ionicons name="chevron-back" size={22} color={AppTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.weekNavTitle}>{weekTitle}</Text>
        <TouchableOpacity
          style={styles.weekNavBtn}
          onPress={() => setWeekOffset((w) => w + 1)}
          hitSlop={12}
          accessibilityLabel="Next week">
          <Ionicons name="chevron-forward" size={22} color={AppTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryVal}>{total}</Text>
          <Text style={styles.summaryLab}>Planned</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryVal}>{done}</Text>
          <Text style={styles.summaryLab}>Done</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryVal}>{total ? Math.round((done / total) * 100) : 0}%</Text>
          <Text style={styles.summaryLab}>Complete</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addMainBtn} activeOpacity={0.85} onPress={openAdd}>
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.addMainBtnText}>Add exercises</Text>
      </TouchableOpacity>

      {weekPlans.length === 0 ? (
        <View style={styles.emptyWeek}>
          <Text style={styles.emptyWeekTitle}>Nothing scheduled this week</Text>
          <Text style={styles.emptyWeekSub}>Use Add exercises to log sets, reps, and optional notes.</Text>
        </View>
      ) : (
        <View style={styles.daysStack}>
          {daysWithPlans.map((d) => {
            const items = plansByYmd.get(d.ymd) ?? [];
            const preview =
              items.length === 1
                ? items[0].title
                : `${items[0].title} · +${items.length - 1} more`;
            return (
              <TouchableOpacity
                key={d.ymd}
                style={[styles.dayBlock, d.ymd === toYMD(new Date()) && styles.dayBlockToday]}
                activeOpacity={0.75}
                onPress={() => setDetailYmd(d.ymd)}
                accessibilityRole="button"
                accessibilityLabel={`View ${d.label} plans`}>
                <View style={styles.dayBlockHead}>
                  <View style={styles.dayBlockHeadLeft}>
                    <Text style={styles.dayBlockTitle}>
                      {d.label} {d.dayNum}
                      {d.ymd === toYMD(new Date()) ? <Text style={styles.todayBadge}> · Today</Text> : null}
                    </Text>
                    <Text style={styles.dayBlockCount}>
                      {items.length} exercise{items.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={AppTheme.colors.textSecondary} />
                </View>
                <Text style={styles.dayPreview} numberOfLines={2}>
                  {preview}
                </Text>
                <Text style={styles.dayTapHint}>Tap to view all</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => router.push('/activity')}
        activeOpacity={0.7}>
        <Ionicons name="stats-chart-outline" size={20} color={AppTheme.colors.primary} />
        <Text style={styles.linkText}>Log activity in Stats</Text>
        <Ionicons name="chevron-forward" size={18} color={AppTheme.colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={detailYmd !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailYmd(null)}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'left', 'right']}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle}>{detailDayMeta?.title ?? 'Day'}</Text>
              <Text style={styles.modalSubtitle}>{detailItems.length} exercise{detailItems.length === 1 ? '' : 's'}</Text>
            </View>
            <TouchableOpacity onPress={() => setDetailYmd(null)} hitSlop={12} accessibilityLabel="Close">
              <Ionicons name="close" size={28} color={AppTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalBodyContent}>
            {detailItems.map((p) => (
              <ExerciseDetailRow key={p.id} plan={p} onToggle={() => void onToggle(p.id)} onDelete={() => void onDelete(p.id)} />
            ))}
            {detailYmd ? (
              <TouchableOpacity
                style={styles.addMoreLink}
                onPress={() => openAddMoreForDay(detailYmd)}
                activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={22} color={AppTheme.colors.primary} />
                <Text style={styles.addMoreLinkText}>Add more exercises to this day</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={addOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddOpen(false)}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'left', 'right']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add exercises</Text>
            <TouchableOpacity onPress={() => setAddOpen(false)} hitSlop={12}>
              <Ionicons name="close" size={28} color={AppTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalBodyContent}>
            <Text style={styles.fieldLabel}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>
              {days.map((d) => (
                <TouchableOpacity
                  key={d.ymd}
                  onPress={() => setSelectedYmd(d.ymd)}
                  style={[styles.dayChip, selectedYmd === d.ymd && styles.dayChipActive]}>
                  <Text style={[styles.dayChipLabel, selectedYmd === d.ymd && styles.dayChipLabelActive]}>{d.label}</Text>
                  <Text style={[styles.dayChipNum, selectedYmd === d.ymd && styles.dayChipNumActive]}>{d.dayNum}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {exerciseDrafts.map((row, index) => (
              <View key={row.key} style={styles.draftCard}>
                <View style={styles.draftCardHead}>
                  <Text style={styles.draftCardTitle}>Exercise {index + 1}</Text>
                  {exerciseDrafts.length > 1 ? (
                    <TouchableOpacity onPress={() => removeDraftRow(row.key)} hitSlop={10}>
                      <Text style={styles.draftRemove}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TextInputField label="Name" value={row.title} onChangeText={(t) => updateDraft(row.key, { title: t })} />
                <View style={styles.setsRepsRow}>
                  <View style={styles.setsRepsCol}>
                    <TextInputField
                      label="Sets (optional)"
                      value={row.sets}
                      onChangeText={(t) => updateDraft(row.key, { sets: t })}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.setsRepsCol}>
                    <TextInputField
                      label="Reps (optional)"
                      value={row.reps}
                      onChangeText={(t) => updateDraft(row.key, { reps: t })}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <Text style={styles.fieldLabel}>Notes (optional)</Text>
                <TextInput
                  value={row.notes}
                  onChangeText={(t) => updateDraft(row.key, { notes: t })}
                  style={styles.notesInput}
                  placeholder="e.g. RPE 8, form cues…"
                  placeholderTextColor="#aaa"
                  multiline
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addAnotherRow} onPress={addDraftRow} activeOpacity={0.7}>
              <Ionicons name="add-outline" size={22} color={AppTheme.colors.primary} />
              <Text style={styles.addAnotherRowText}>Add another exercise</Text>
            </TouchableOpacity>

            <PrimaryButton label="Save all to plan" onPress={() => void submitAdd()} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScreenContainer>
  );
}

function ExerciseDetailRow({
  plan: p,
  onToggle,
  onDelete,
}: {
  plan: PlanItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const sr = formatSetsReps(p);
  return (
    <View style={styles.detailExerciseCard}>
      <View style={styles.planRow}>
        <TouchableOpacity style={styles.checkHit} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: p.completed }}>
          <View style={[styles.checkbox, p.completed && styles.checkboxOn]}>
            {p.completed ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
          </View>
        </TouchableOpacity>
        <View style={styles.planBody}>
          <Text style={[styles.planTitle, p.completed && styles.planTitleDone]}>{p.title}</Text>
          {(() => {
            const parts: string[] = [];
            if (sr) parts.push(sr);
            if (p.durationMin != null) parts.push(`${p.durationMin} min`);
            if (parts.length === 0) return null;
            return <Text style={styles.planMeta}>{parts.join(' · ')}</Text>;
          })()}
          {p.notes ? <Text style={styles.planNotes}>{p.notes}</Text> : null}
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={10} accessibilityLabel="Remove exercise">
          <Ionicons name="trash-outline" size={20} color={AppTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  weekNavBtn: { padding: 8 },
  weekNavTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.textPrimary },
  summary: { flexDirection: 'row', gap: 10 },
  summaryTile: {
    flex: 1,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  summaryVal: { fontSize: 22, fontWeight: '800', color: AppTheme.colors.primary },
  summaryLab: { fontSize: 12, fontWeight: '600', color: AppTheme.colors.textSecondary },
  addMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
  },
  addMainBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyWeek: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 20,
    gap: 6,
  },
  emptyWeekTitle: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  emptyWeekSub: { fontSize: 14, color: AppTheme.colors.textSecondary, lineHeight: 20 },
  daysStack: { gap: 12 },
  dayBlock: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
    gap: 8,
  },
  dayBlockToday: { borderColor: AppTheme.colors.primary, borderWidth: 1.5 },
  dayBlockHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dayBlockHeadLeft: { flex: 1, minWidth: 0 },
  dayBlockTitle: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  todayBadge: { fontWeight: '600', color: AppTheme.colors.primary },
  dayBlockCount: { fontSize: 13, color: AppTheme.colors.textSecondary, fontWeight: '600', marginTop: 4 },
  dayPreview: { fontSize: 14, color: AppTheme.colors.textPrimary, fontWeight: '600', lineHeight: 20 },
  dayTapHint: { fontSize: 12, color: AppTheme.colors.textSecondary, fontStyle: 'italic' },
  planRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkHit: { paddingVertical: 4 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: AppTheme.colors.success, borderColor: AppTheme.colors.success },
  planBody: { flex: 1, minWidth: 0 },
  planTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.textPrimary },
  planTitleDone: { textDecorationLine: 'line-through', color: AppTheme.colors.textSecondary },
  planMeta: { fontSize: 13, color: AppTheme.colors.textSecondary, marginTop: 4, fontWeight: '600' },
  planNotes: { fontSize: 13, color: AppTheme.colors.textPrimary, marginTop: 8, lineHeight: 19 },
  detailExerciseCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
    marginBottom: 10,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  linkText: { flex: 1, fontSize: 15, fontWeight: '600', color: AppTheme.colors.primary },
  modalSafe: { flex: 1, backgroundColor: AppTheme.colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppTheme.colors.border,
  },
  modalHeaderText: { flex: 1, marginRight: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: AppTheme.colors.textPrimary },
  modalSubtitle: { fontSize: 13, color: AppTheme.colors.textSecondary, marginTop: 4, fontWeight: '600' },
  modalBody: { flex: 1 },
  modalBodyContent: { padding: 20, gap: 8, paddingBottom: 40 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: AppTheme.colors.textSecondary, marginBottom: 4 },
  dayChips: { flexDirection: 'row', gap: 8, marginBottom: 12, paddingVertical: 4 },
  dayChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    minWidth: 64,
  },
  dayChipActive: { backgroundColor: AppTheme.colors.primary, borderColor: AppTheme.colors.primary },
  dayChipLabel: { fontSize: 12, fontWeight: '700', color: AppTheme.colors.textSecondary },
  dayChipLabelActive: { color: 'rgba(255,255,255,0.9)' },
  dayChipNum: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary, marginTop: 2 },
  dayChipNumActive: { color: '#fff' },
  draftCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.card,
    padding: 14,
    gap: 4,
    marginBottom: 12,
  },
  draftCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  draftCardTitle: { fontSize: 15, fontWeight: '800', color: AppTheme.colors.textPrimary },
  draftRemove: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textSecondary },
  setsRepsRow: { flexDirection: 'row', gap: 10 },
  setsRepsCol: { flex: 1 },
  notesInput: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 88,
    fontSize: 16,
    color: AppTheme.colors.textPrimary,
    textAlignVertical: 'top',
  },
  addAnotherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  addAnotherRowText: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.primary },
  addMoreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    marginTop: 4,
  },
  addMoreLinkText: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.primary, flex: 1 },
});
