import * as Crypto from 'expo-crypto';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextInputField } from '@/components/ui/text-input-field';
import {
  addExerciseToGroup,
  addPlansBatch,
  addSetToExercise,
  clearExerciseSets,
  deletePlan,
  loadPlans,
  MUSCLE_GROUPS,
  muscleGroupColor,
  type PlanExerciseInput,
  type PlanItem,
  renamePlanExercise,
  type SetLog,
  removeSetFromExercise,
  startOfWeekMonday,
  toYMD,
  updateSetInExercise,
} from '@/lib/plan-storage';
import { resyncPlanExercise, unsyncPlanExercise } from '@/lib/plan-sync';
import { useRouter } from 'expo-router';

/* ------------------------------------------------------------------ */
/*  Draft types for the Add modal                                      */
/* ------------------------------------------------------------------ */

type ExerciseDraft = { key: string; title: string };
type MuscleGroupDraft = { key: string; muscleGroup: string; exercises: ExerciseDraft[] };

function newExerciseDraft(): ExerciseDraft {
  return { key: Crypto.randomUUID(), title: '' };
}
function newGroupDraft(): MuscleGroupDraft {
  return { key: Crypto.randomUUID(), muscleGroup: '', exercises: [newExerciseDraft()] };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function weekRangeYmd(anchor: Date) {
  const monday = startOfWeekMonday(anchor);
  const sun = new Date(monday);
  sun.setDate(monday.getDate() + 6);
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
  return { mon: toYMD(monday), sun: toYMD(sun), days };
}

function parseYmdDisplay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function detailDayTitle(ymd: string): string {
  const [y, mo, d] = ymd.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function uniqueGroups(items: PlanItem[]): string[] {
  return [...new Set(items.map((p) => p.muscleGroup))].sort();
}

/* ------------------------------------------------------------------ */
/*  Main screen                                                        */
/* ------------------------------------------------------------------ */

export default function PlansScreen() {
  const router = useRouter();

  const [weekOffset, setWeekOffset] = useState(0);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [detailYmd, setDetailYmd] = useState<string | null>(null);

  // Add-modal state
  const [selectedYmd, setSelectedYmd] = useState(() => toYMD(new Date()));
  const [groupDrafts, setGroupDrafts] = useState<MuscleGroupDraft[]>([newGroupDraft()]);

  const anchor = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const { mon, sun, days } = useMemo(() => weekRangeYmd(anchor), [anchor]);

  const refresh = useCallback(async () => {
    setPlans(await loadPlans());
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const weekPlans = useMemo(() => plans.filter((p) => p.date >= mon && p.date <= sun), [plans, mon, sun]);

  const plansByYmd = useMemo(() => {
    const m = new Map<string, PlanItem[]>();
    for (const p of weekPlans) {
      const arr = m.get(p.date) ?? [];
      arr.push(p);
      m.set(p.date, arr);
    }
    return m;
  }, [weekPlans]);

  const daysWithPlans = useMemo(() => days.filter((d) => (plansByYmd.get(d.ymd) ?? []).length > 0), [days, plansByYmd]);

  const detailItems = useMemo(() => {
    if (!detailYmd) return [];
    return plans.filter((p) => p.date === detailYmd).sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup) || a.title.localeCompare(b.title));
  }, [plans, detailYmd]);

  const detailGrouped = useMemo(() => {
    const m = new Map<string, PlanItem[]>();
    for (const p of detailItems) {
      const arr = m.get(p.muscleGroup) ?? [];
      arr.push(p);
      m.set(p.muscleGroup, arr);
    }
    return [...m.entries()];
  }, [detailItems]);

  const totalExercises = weekPlans.length;
  const doneExercises = weekPlans.filter((p) => p.completed).length;
  const totalSets = weekPlans.reduce((s, p) => s + p.sets.length, 0);

  // ── Callbacks ──

  const pickDefaultYmd = useCallback(() => {
    const today = toYMD(new Date());
    return days.some((x) => x.ymd === today) ? today : days[0].ymd;
  }, [days]);

  const openAdd = useCallback(() => {
    setDetailYmd(null);
    setSelectedYmd(pickDefaultYmd());
    setGroupDrafts([newGroupDraft()]);
    setAddOpen(true);
  }, [pickDefaultYmd]);

  const openAddForDay = useCallback((ymd: string) => {
    setDetailYmd(null);
    setSelectedYmd(ymd);
    setGroupDrafts([newGroupDraft()]);
    setAddOpen(true);
  }, []);

  const submitAdd = async () => {
    const batch: PlanExerciseInput[] = groupDrafts.flatMap((g) =>
      g.exercises
        .filter((e) => e.title.trim())
        .map((e) => ({ muscleGroup: g.muscleGroup || 'Uncategorized', title: e.title })),
    );
    if (batch.length === 0) return;
    setPlans(await addPlansBatch(selectedYmd, batch));
    setAddOpen(false);
  };

  const handleAddSet = async (id: string, set: SetLog) => {
    const updated = await addSetToExercise(id, set);
    setPlans(updated);
    const exercise = updated.find((p) => p.id === id);
    if (exercise) {
      try {
        setPlans(await resyncPlanExercise(exercise));
      } catch {
        Alert.alert('Sync failed', 'Set saved locally but could not reach the server. Check that the backend is running.');
      }
    }
  };

  const handleUpdateSet = async (id: string, idx: number, set: SetLog) => {
    const updated = await updateSetInExercise(id, idx, set);
    setPlans(updated);
    const exercise = updated.find((p) => p.id === id);
    if (exercise) {
      try {
        setPlans(await resyncPlanExercise(exercise));
      } catch {
        Alert.alert('Sync failed', 'Set saved locally but could not reach the server. Check that the backend is running.');
      }
    }
  };

  const handleRemoveSet = async (id: string, idx: number) => {
    const updated = await removeSetFromExercise(id, idx);
    setPlans(updated);
    const exercise = updated.find((p) => p.id === id);
    if (exercise && exercise.sets.length > 0) {
      try {
        setPlans(await resyncPlanExercise(exercise));
      } catch {
        // not critical — local data is correct
      }
    } else if (exercise) {
      setPlans(await unsyncPlanExercise(exercise));
    }
  };

  const handleClearSets = async (id: string) => {
    const exercise = plans.find((p) => p.id === id);
    const updated = await clearExerciseSets(id);
    setPlans(updated);
    if (exercise) {
      setPlans(await unsyncPlanExercise(exercise));
    }
  };

  const handleDelete = async (id: string) => {
    const exercise = plans.find((p) => p.id === id);
    if (exercise?.activityId) {
      await unsyncPlanExercise(exercise);
    }
    const next = await deletePlan(id);
    setPlans(next);
    if (detailYmd && next.filter((p) => p.date === detailYmd).length === 0) setDetailYmd(null);
  };

  const handleRename = async (id: string, title: string) => {
    setPlans(await renamePlanExercise(id, title));
  };

  const handleAddExerciseToGroup = async (muscleGroup: string, title: string) => {
    if (!detailYmd || !title.trim()) return;
    setPlans(await addExerciseToGroup(detailYmd, muscleGroup, title));
  };

  const weekTitle = `${parseYmdDisplay(mon)} – ${parseYmdDisplay(sun)}`;

  // ── Render ──

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Plans"
        subtitle="Organise exercises by muscle group — log each set when you train."
      />

      {/* Week navigator */}
      <View style={s.weekNav}>
        <TouchableOpacity style={s.weekNavBtn} onPress={() => setWeekOffset((w) => w - 1)} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={AppTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={s.weekNavTitle}>{weekTitle}</Text>
        <TouchableOpacity style={s.weekNavBtn} onPress={() => setWeekOffset((w) => w + 1)} hitSlop={12}>
          <Ionicons name="chevron-forward" size={22} color={AppTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary tiles */}
      <View style={s.summary}>
        <SummaryTile label="Exercises" value={totalExercises} />
        <SummaryTile label="Done" value={doneExercises} />
        <SummaryTile label="Sets" value={totalSets} />
      </View>

      {/* Add button */}
      <TouchableOpacity style={s.addBtn} activeOpacity={0.85} onPress={openAdd}>
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={s.addBtnText}>Add exercises</Text>
      </TouchableOpacity>

      {/* Day cards or empty state */}
      {weekPlans.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyTitle}>Nothing scheduled this week</Text>
          <Text style={s.emptySub}>Tap "Add exercises" to pick muscle groups and exercises for each day.</Text>
        </View>
      ) : (
        <View style={s.daysStack}>
          {daysWithPlans.map((d) => {
            const items = plansByYmd.get(d.ymd) ?? [];
            const groups = uniqueGroups(items);
            const setsLogged = items.reduce((acc, p) => acc + p.sets.length, 0);
            const isToday = d.ymd === toYMD(new Date());
            return (
              <TouchableOpacity
                key={d.ymd}
                style={[s.dayCard, isToday && s.dayCardToday]}
                activeOpacity={0.75}
                onPress={() => setDetailYmd(d.ymd)}>
                <View style={s.dayCardHead}>
                  <Text style={s.dayCardTitle}>
                    {d.label} {d.dayNum}
                    {isToday ? <Text style={s.todayBadge}> · Today</Text> : null}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={AppTheme.colors.textSecondary} />
                </View>
                <View style={s.mgChipsRow}>
                  {groups.map((g) => (
                    <View key={g} style={[s.mgChipSmall, { backgroundColor: muscleGroupColor(g) + '20' }]}>
                      <Text style={[s.mgChipSmallText, { color: muscleGroupColor(g) }]}>{g}</Text>
                    </View>
                  ))}
                </View>
                <Text style={s.dayCardMeta}>
                  {items.length} exercise{items.length !== 1 ? 's' : ''} · {setsLogged} set{setsLogged !== 1 ? 's' : ''} logged
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={s.linkRow} onPress={() => router.push('/activity')} activeOpacity={0.7}>
        <Ionicons name="stats-chart-outline" size={20} color={AppTheme.colors.primary} />
        <Text style={s.linkText}>Log activity in Stats</Text>
        <Ionicons name="chevron-forward" size={18} color={AppTheme.colors.textSecondary} />
      </TouchableOpacity>

      {/* ── Day detail modal ── */}
      <DayDetailModal
        detailYmd={detailYmd}
        detailItems={detailItems}
        detailGrouped={detailGrouped}
        onClose={() => setDetailYmd(null)}
        onAddSet={handleAddSet}
        onUpdateSet={handleUpdateSet}
        onRemoveSet={handleRemoveSet}
        onClearSets={handleClearSets}
        onDelete={handleDelete}
        onRename={handleRename}
        onAddExerciseToGroup={handleAddExerciseToGroup}
        onAddMore={openAddForDay}
      />

      {/* ── Add exercises modal ── */}
      <Modal visible={addOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddOpen(false)}>
        <SafeAreaView style={s.modalSafe} edges={['top', 'left', 'right']}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add exercises</Text>
            <TouchableOpacity onPress={() => setAddOpen(false)} hitSlop={12}>
              <Ionicons name="close" size={28} color={AppTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled" contentContainerStyle={s.modalBodyContent}>
            {/* Day selector */}
            <Text style={s.fieldLabel}>Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayChips}>
              {days.map((d) => (
                <TouchableOpacity
                  key={d.ymd}
                  onPress={() => setSelectedYmd(d.ymd)}
                  style={[s.dayChip, selectedYmd === d.ymd && s.dayChipActive]}>
                  <Text style={[s.dayChipLabel, selectedYmd === d.ymd && s.dayChipLabelActive]}>{d.label}</Text>
                  <Text style={[s.dayChipNum, selectedYmd === d.ymd && s.dayChipNumActive]}>{d.dayNum}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Muscle group draft sections */}
            {groupDrafts.map((gd, gi) => (
              <MuscleGroupDraftSection
                key={gd.key}
                draft={gd}
                index={gi}
                canRemove={groupDrafts.length > 1}
                onUpdate={(patch) =>
                  setGroupDrafts((prev) => prev.map((g) => (g.key === gd.key ? { ...g, ...patch } : g)))
                }
                onRemove={() => setGroupDrafts((prev) => prev.filter((g) => g.key !== gd.key))}
              />
            ))}

            <TouchableOpacity
              style={s.addGroupLink}
              onPress={() => setGroupDrafts((prev) => [...prev, newGroupDraft()])}
              activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={22} color={AppTheme.colors.primary} />
              <Text style={s.addGroupLinkText}>Add another muscle group</Text>
            </TouchableOpacity>

            <PrimaryButton label="Add to plan" onPress={() => void submitAdd()} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScreenContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/* ── Day detail modal with collapsible muscle groups ── */

function DayDetailModal({
  detailYmd,
  detailItems,
  detailGrouped,
  onClose,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onClearSets,
  onDelete,
  onRename,
  onAddExerciseToGroup,
  onAddMore,
}: {
  detailYmd: string | null;
  detailItems: PlanItem[];
  detailGrouped: [string, PlanItem[]][];
  onClose: () => void;
  onAddSet: (id: string, set: SetLog) => void;
  onUpdateSet: (id: string, idx: number, set: SetLog) => void;
  onRemoveSet: (id: string, idx: number) => void;
  onClearSets: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onAddExerciseToGroup: (muscleGroup: string, title: string) => void;
  onAddMore: (ymd: string) => void;
}) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [newExName, setNewExName] = useState('');
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroup((prev) => (prev === group ? null : group));
    setAddingToGroup(null);
    setNewExName('');
  };

  const submitNewExercise = (group: string) => {
    if (!newExName.trim()) return;
    onAddExerciseToGroup(group, newExName.trim());
    setNewExName('');
    setAddingToGroup(null);
  };

  return (
    <Modal visible={detailYmd !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.modalSafe} edges={['top', 'left', 'right']}>
        <View style={s.modalHeader}>
          <View style={s.modalHeaderText}>
            <Text style={s.modalTitle}>{detailYmd ? detailDayTitle(detailYmd) : 'Day'}</Text>
            <Text style={s.modalSubtitle}>
              {detailItems.length} exercise{detailItems.length !== 1 ? 's' : ''} · {detailItems.reduce((a, p) => a + p.sets.length, 0)} sets logged
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={28} color={AppTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled" contentContainerStyle={s.modalBodyContent}>
          {detailGrouped.map(([group, items]) => {
            const tint = muscleGroupColor(group);
            const isExpanded = expandedGroup === group;
            const doneCount = items.filter((p) => p.completed).length;
            const setsCount = items.reduce((a, p) => a + p.sets.length, 0);
            return (
              <View key={group}>
                <TouchableOpacity
                  style={[s.mgCard, isExpanded && { borderColor: tint }]}
                  activeOpacity={0.75}
                  onPress={() => toggleGroup(group)}>
                  <View style={s.mgCardLeft}>
                    <View style={[s.mgDot, { backgroundColor: tint }]} />
                    <View style={s.mgCardInfo}>
                      <Text style={s.mgCardTitle}>{group}</Text>
                      <Text style={s.mgCardMeta}>
                        {items.length} exercise{items.length !== 1 ? 's' : ''} · {doneCount} done · {setsCount} set{setsCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={AppTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={s.mgExpandedContent}>
                    {items.map((p) => (
                      <ExerciseCard
                        key={p.id}
                        plan={p}
                        onAddSet={(set) => void onAddSet(p.id, set)}
                        onUpdateSet={(idx, set) => void onUpdateSet(p.id, idx, set)}
                        onRemoveSet={(idx) => void onRemoveSet(p.id, idx)}
                        onClearSets={() => void onClearSets(p.id)}
                        onDelete={() => void onDelete(p.id)}
                        onRename={(title) => void onRename(p.id, title)}
                      />
                    ))}
                    {addingToGroup === group ? (
                      <View style={s.inlineAddRow}>
                        <TextInput
                          value={newExName}
                          onChangeText={setNewExName}
                          placeholder="Exercise name"
                          style={[s.setInput, { flex: 1 }]}
                          placeholderTextColor="#999"
                          autoFocus
                          onSubmitEditing={() => submitNewExercise(group)}
                          returnKeyType="done"
                        />
                        <TouchableOpacity
                          style={[s.addSetBtn, { backgroundColor: tint }]}
                          onPress={() => submitNewExercise(group)}
                          activeOpacity={0.85}>
                          <Ionicons name="add" size={16} color="#fff" />
                          <Text style={s.addSetBtnText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setAddingToGroup(null); setNewExName(''); }} hitSlop={8}>
                          <Text style={s.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={s.addExInGroupLink}
                        onPress={() => { setAddingToGroup(group); setNewExName(''); }}
                        activeOpacity={0.7}>
                        <Ionicons name="add-circle-outline" size={18} color={tint} />
                        <Text style={[s.addExInGroupText, { color: tint }]}>Add exercise to {group}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          {detailYmd ? (
            <TouchableOpacity style={s.addMoreLink} onPress={() => onAddMore(detailYmd)} activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={22} color={AppTheme.colors.primary} />
              <Text style={s.addMoreText}>Add more exercises</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.summaryTile}>
      <Text style={s.summaryVal}>{value}</Text>
      <Text style={s.summaryLab}>{label}</Text>
    </View>
  );
}

/* ── Muscle group draft section in Add modal ── */

function MuscleGroupDraftSection({
  draft,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: {
  draft: MuscleGroupDraft;
  index: number;
  canRemove: boolean;
  onUpdate: (patch: Partial<Omit<MuscleGroupDraft, 'key'>>) => void;
  onRemove: () => void;
}) {
  const addExercise = () =>
    onUpdate({ exercises: [...draft.exercises, newExerciseDraft()] });

  const updateExercise = (key: string, title: string) =>
    onUpdate({ exercises: draft.exercises.map((e) => (e.key === key ? { ...e, title } : e)) });

  const removeExercise = (key: string) => {
    if (draft.exercises.length <= 1) return;
    onUpdate({ exercises: draft.exercises.filter((e) => e.key !== key) });
  };

  return (
    <View style={s.draftSection}>
      <View style={s.draftSectionHead}>
        <Text style={s.draftSectionTitle}>Muscle Group {index + 1}</Text>
        {canRemove ? (
          <TouchableOpacity onPress={onRemove} hitSlop={10}>
            <Text style={s.removeLink}>Remove</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.mgChipsWrap}>
        {MUSCLE_GROUPS.map((mg) => {
          const active = draft.muscleGroup === mg;
          return (
            <TouchableOpacity
              key={mg}
              style={[s.mgChip, active && { backgroundColor: muscleGroupColor(mg), borderColor: muscleGroupColor(mg) }]}
              onPress={() => onUpdate({ muscleGroup: mg })}>
              <Text style={[s.mgChipText, active && s.mgChipTextActive]}>{mg}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {draft.exercises.map((ex, ei) => (
        <View key={ex.key} style={s.exerciseDraftRow}>
          <View style={s.exerciseDraftInput}>
            <TextInputField
              label={`Exercise ${ei + 1}`}
              value={ex.title}
              onChangeText={(t) => updateExercise(ex.key, t)}
              placeholder="e.g. Bench Press"
            />
          </View>
          {draft.exercises.length > 1 ? (
            <TouchableOpacity onPress={() => removeExercise(ex.key)} hitSlop={10} style={s.exerciseDraftRemove}>
              <Ionicons name="close-circle" size={22} color={AppTheme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      ))}

      <TouchableOpacity style={s.addExerciseLink} onPress={addExercise} activeOpacity={0.7}>
        <Ionicons name="add-outline" size={20} color={AppTheme.colors.primary} />
        <Text style={s.addExerciseLinkText}>Add exercise</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ── Exercise card in Day detail ── */

function formatSetDetail(set: SetLog): string {
  const parts = [`${set.reps} reps`];
  if (set.weight != null) parts.push(`${set.weight} ${set.unit ?? 'kg'}`);
  return parts.join(' × ');
}

function ExerciseCard({
  plan: p,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onClearSets,
  onDelete,
  onRename,
}: {
  plan: PlanItem;
  onAddSet: (set: SetLog) => void;
  onUpdateSet: (setIndex: number, set: SetLog) => void;
  onRemoveSet: (setIndex: number) => void;
  onClearSets: () => void;
  onDelete: () => void;
  onRename?: (title: string) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(p.title);
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [noteInput, setNoteInput] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const resetForm = () => {
    setRepsInput('');
    setWeightInput('');
    setNoteInput('');
    setEditingIdx(null);
    setFormOpen(false);
  };

  const openAdd = () => {
    setEditingIdx(null);
    setRepsInput('');
    setWeightInput('');
    setNoteInput('');
    setFormOpen(true);
  };

  const startEdit = (idx: number) => {
    const set = p.sets[idx];
    if (!set) return;
    setRepsInput(String(set.reps));
    setWeightInput(set.weight != null ? String(set.weight) : '');
    setUnit(set.unit ?? 'kg');
    setNoteInput(set.note ?? '');
    setEditingIdx(idx);
    setFormOpen(true);
  };

  const handleSubmit = () => {
    const reps = parseInt(repsInput, 10);
    if (!reps || reps <= 0) {
      Alert.alert('Invalid', 'Enter a positive number of reps.');
      return;
    }
    const weight = parseFloat(weightInput);
    const set: SetLog = { reps };
    if (Number.isFinite(weight) && weight > 0) {
      set.weight = weight;
      set.unit = unit;
    }
    if (noteInput.trim()) set.note = noteInput.trim();

    if (editingIdx !== null) {
      onUpdateSet(editingIdx, set);
    } else {
      onAddSet(set);
    }
    resetForm();
  };

  const tint = muscleGroupColor(p.muscleGroup);



  return (
    <View style={s.exCard}>
      {/* Header */}
      <View style={s.exCardHead}>
        <View style={s.exCardTitleRow}>
          {p.completed && (
            <View style={[s.doneBadge, { backgroundColor: tint }]}>
              <Ionicons name="checkmark" size={13} color="#fff" />
            </View>
          )}
          {editingName ? (
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={s.exTitleInput}
              autoFocus
              onBlur={() => {
                if (nameInput.trim() && nameInput.trim() !== p.title) onRename?.(nameInput.trim());
                setEditingName(false);
              }}
              onSubmitEditing={() => {
                if (nameInput.trim() && nameInput.trim() !== p.title) onRename?.(nameInput.trim());
                setEditingName(false);
              }}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={() => { setNameInput(p.title); setEditingName(true); }} activeOpacity={0.6} style={s.exTitleTap}>
              <Text style={[s.exTitle, p.completed && s.exTitleDone]}>{p.title}</Text>
              {onRename && <Ionicons name="pencil" size={12} color={AppTheme.colors.textSecondary} style={s.editIcon} />}
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={10}>
          <Ionicons name="trash-outline" size={18} color={AppTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Timer removed */}

      {/* Logged sets */}
      {p.sets.length > 0 ? (
        <View style={s.setsList}>
          {p.sets.map((set, i) => (
            <View key={i} style={[s.setRow, editingIdx === i && formOpen && s.setRowEditing]}>
              <TouchableOpacity style={s.setInfoCol} onPress={() => startEdit(i)} activeOpacity={0.6}>
                <View style={s.setInfo}>
                  <Text style={s.setBadge}>Set {i + 1}</Text>
                  <Text style={s.setReps}>{formatSetDetail(set)}</Text>
                  <Ionicons name="pencil" size={13} color={AppTheme.colors.textSecondary} style={s.editIcon} />
                </View>
                {set.note ? <Text style={s.setNote}>{set.note}</Text> : null}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onRemoveSet(i)} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={AppTheme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      {/* Collapsed: "Add set" button */}
      {!formOpen && (
        <TouchableOpacity style={[s.addSetToggle, { borderColor: tint }]} onPress={openAdd} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={18} color={tint} />
          <Text style={[s.addSetToggleText, { color: tint }]}>Add set</Text>
        </TouchableOpacity>
      )}

      {/* Expanded: form */}
      {formOpen && (
        <View style={s.addSetForm}>
          {editingIdx !== null && (
            <Text style={s.formLabel}>Editing Set {editingIdx + 1}</Text>
          )}
          <View style={s.addSetTopRow}>
            <TextInput
              value={repsInput}
              onChangeText={setRepsInput}
              placeholder="Reps"
              keyboardType="number-pad"
              style={[s.setInput, { flex: 1 }]}
              placeholderTextColor="#999"
              autoFocus
            />
            <TextInput
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="Weight"
              keyboardType="decimal-pad"
              style={[s.setInput, { flex: 1 }]}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={s.unitToggle}
              onPress={() => setUnit((u) => (u === 'kg' ? 'lbs' : 'kg'))}
              activeOpacity={0.7}>
              <Text style={s.unitToggleText}>{unit}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.addSetBottomRow}>
            <TextInput
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="Note (optional)"
              style={[s.setInput, { flex: 1 }]}
              placeholderTextColor="#999"
            />
          </View>
          <View style={s.formActions}>
            <TouchableOpacity style={[s.addSetBtn, { backgroundColor: tint }]} onPress={handleSubmit} activeOpacity={0.85}>
              <Ionicons name={editingIdx !== null ? 'checkmark' : 'add'} size={16} color="#fff" />
              <Text style={s.addSetBtnText}>{editingIdx !== null ? 'Save' : 'Add set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetForm} hitSlop={8}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Clear all */}
      {p.sets.length > 0 && !formOpen && (
        <TouchableOpacity onPress={onClearSets} style={s.clearLink} hitSlop={8}>
          <Text style={s.clearLinkText}>Clear all sets</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  /* Week nav */
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  weekNavBtn: { padding: 8 },
  weekNavTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.textPrimary },

  /* Summary */
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

  /* Add button */
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  /* Empty */
  emptyCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 20,
    gap: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  emptySub: { fontSize: 14, color: AppTheme.colors.textSecondary, lineHeight: 20 },

  /* Day cards */
  daysStack: { gap: 12 },
  dayCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
    gap: 8,
  },
  dayCardToday: { borderColor: AppTheme.colors.primary, borderWidth: 1.5 },
  dayCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayCardTitle: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  todayBadge: { fontWeight: '600', color: AppTheme.colors.primary },
  mgChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mgChipSmall: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  mgChipSmallText: { fontSize: 12, fontWeight: '700' },
  dayCardMeta: { fontSize: 13, color: AppTheme.colors.textSecondary, fontWeight: '600' },

  /* Link row */
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  linkText: { flex: 1, fontSize: 15, fontWeight: '600', color: AppTheme.colors.primary },

  /* Modal shared */
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

  /* Day chips */
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

  /* Muscle group draft section */
  draftSection: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.card,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  draftSectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  draftSectionTitle: { fontSize: 15, fontWeight: '800', color: AppTheme.colors.textPrimary },
  removeLink: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textSecondary },
  mgChipsWrap: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  mgChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  mgChipText: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.textSecondary },
  mgChipTextActive: { color: '#fff' },
  exerciseDraftRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  exerciseDraftInput: { flex: 1 },
  exerciseDraftRemove: { paddingBottom: 12 },
  addExerciseLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  addExerciseLinkText: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.primary },
  addGroupLink: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, marginBottom: 8 },
  addGroupLinkText: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.primary },
  addMoreLink: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
  addMoreText: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.primary },

  /* Day detail — muscle group cards */
  mgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    padding: 14,
    marginBottom: 8,
  },
  mgCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  mgDot: { width: 10, height: 10, borderRadius: 5 },
  mgCardInfo: { flex: 1 },
  mgCardTitle: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  mgCardMeta: { fontSize: 12, color: AppTheme.colors.textSecondary, fontWeight: '600', marginTop: 2 },
  mgExpandedContent: { marginBottom: 12 },
  addExInGroupLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 4 },
  addExInGroupText: { fontSize: 14, fontWeight: '700' },
  inlineAddRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 2 },

  /* Exercise card */
  exCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  exCardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  doneBadge: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  exTitleTap: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  exTitle: { fontSize: 15, fontWeight: '700', color: AppTheme.colors.textPrimary, flexShrink: 1 },
  exTitleDone: { textDecorationLine: 'line-through', color: AppTheme.colors.textSecondary },
  exTitleInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.colors.textPrimary,
    borderBottomWidth: 1.5,
    borderBottomColor: AppTheme.colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },

  /* Timer */
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  timerText: { fontSize: 15, fontWeight: '800', color: AppTheme.colors.primary, fontVariant: ['tabular-nums'] },

  /* Sets list */
  setsList: { gap: 6 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppTheme.colors.background,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  setInfoCol: { flex: 1, gap: 2 },
  setInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  setBadge: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.textSecondary },
  setReps: { fontSize: 15, fontWeight: '800', color: AppTheme.colors.textPrimary },
  setRowEditing: { borderColor: AppTheme.colors.primary, borderWidth: 1.5 },
  editIcon: { marginLeft: 4, opacity: 0.5 },
  setNote: { fontSize: 12, color: AppTheme.colors.textSecondary, fontStyle: 'italic', marginLeft: 2 },
  noSets: { fontSize: 13, color: AppTheme.colors.textSecondary, fontStyle: 'italic' },

  /* Add set toggle + form */
  addSetToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addSetToggleText: { fontSize: 14, fontWeight: '700' },
  addSetForm: { gap: 8 },
  addSetTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addSetBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setInput: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.colors.textPrimary,
  },
  unitToggle: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 48,
    alignItems: 'center',
  },
  unitToggleText: { fontSize: 14, fontWeight: '800', color: AppTheme.colors.primary },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addSetBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  formActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cancelText: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textSecondary },
  formLabel: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.primary, marginBottom: -2 },

  /* Clear */
  clearLink: { alignSelf: 'flex-start' },
  clearLinkText: { fontSize: 13, fontWeight: '700', color: AppTheme.colors.textSecondary },
});
