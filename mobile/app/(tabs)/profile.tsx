import { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';
import { useAuth } from '@/context/auth-context';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextInputField } from '@/components/ui/text-input-field';
import { Toast } from '@/components/ui/toast';
import { getBmiCategory } from '@/lib/bmi';
import { api } from '@/lib/api';
import { parseStrengthKind } from '@/lib/plan-sync';
import { muscleGroupColor } from '@/lib/plan-storage';
import type { Activity, Dashboard } from '@/types/api';

type WeightUnit = 'kg' | 'lbs';
type HeightUnit = 'cm' | 'ft';
type Gender = 'male' | 'female' | 'other';

function toKg(v: number, u: WeightUnit) { return u === 'lbs' ? v * 0.453592 : v; }
function fromKg(kg: number, u: WeightUnit) { return u === 'lbs' ? kg / 0.453592 : kg; }
function toCm(v: number, u: HeightUnit) { return u === 'ft' ? v * 30.48 : v; }
function fromCm(cm: number, u: HeightUnit) { return u === 'ft' ? cm / 30.48 : cm; }

function calcBmi(wKg: number, hCm: number) {
  if (wKg <= 0 || hCm <= 0) return null;
  return wKg / ((hCm / 100) ** 2);
}
type MenuKey = 'personal' | 'body' | 'goals' | null;

export default function ProfileScreen() {
  const { profile, saveProfile, logout } = useAuth();
  const [activeSheet, setActiveSheet] = useState<MenuKey>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<string | undefined>(undefined);
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  const bmi = calcBmi(profile?.weight_kg ?? 0, profile?.height_cm ?? 0);

  const showToast = (msg: string, success = false) => {
    setToastColor(success ? '#2EBD85' : undefined);
    setToast(msg);
  };

  const loadStats = useCallback(async () => {
    try {
      const [d, a] = await Promise.all([
        api.get<Dashboard>('/analytics/dashboard'),
        api.get<Activity[]>('/activities?limit=20'),
      ]);
      setDash(d.data);
      setRecentActivities(a.data);
    } catch {}
  }, []);

  useEffect(() => { void loadStats(); }, [loadStats]);
  useFocusEffect(useCallback(() => { void loadStats(); }, [loadStats]));

  const strengthCount = recentActivities.filter((a) => parseStrengthKind(a.kind)).length;
  const topGroups = (() => {
    const m = new Map<string, number>();
    for (const a of recentActivities) {
      const p = parseStrengthKind(a.kind);
      if (p) m.set(p.muscleGroup, (m.get(p.muscleGroup) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  })();

  return (
    <ScreenContainer>
      <Toast message={toast} onDismiss={() => setToast(null)} color={toastColor} />

      <ScreenHeader title="Profile" subtitle="Your details, measurements, and goals." />

      {/* User header */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={AppTheme.colors.primary} />
        </View>
        <View style={styles.avatarInfo}>
          <Text style={styles.userName}>{profile?.name || 'User'}</Text>
          <Text style={styles.userSub}>
            {profile?.age ? `${profile.age} years` : ''}
            {profile?.weight_kg ? ` · ${profile.weight_kg} kg` : ''}
          </Text>
        </View>
      </View>

      {/* BMI card */}
      {bmi !== null && (
        <View style={styles.bmiCard}>
          <View style={styles.bmiLeft}>
            <Text style={styles.bmiLabel}>BMI</Text>
            <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
          </View>
          <View style={[styles.bmiBadge, { backgroundColor: getBmiCategory(bmi).color + '20' }]}>
            <Text style={[styles.bmiBadgeText, { color: getBmiCategory(bmi).color }]}>{getBmiCategory(bmi).label}</Text>
          </View>
        </View>
      )}

      {/* Weekly stats */}
      {dash && (
        <View style={styles.weekStatsCard}>
          <Text style={styles.weekStatsTitle}>This week</Text>
          <View style={styles.weekStatsRow}>
            <View style={styles.weekStatItem}>
              <Ionicons name="barbell-outline" size={16} color="#E74C3C" />
              <Text style={styles.weekStatVal}>{dash.workouts_week}</Text>
              <Text style={styles.weekStatLabel}>Workouts</Text>
            </View>
            <View style={styles.weekStatItem}>
              <Ionicons name="flame-outline" size={16} color="#F39C12" />
              <Text style={styles.weekStatVal}>{Math.round(dash.total_calories_week)}</Text>
              <Text style={styles.weekStatLabel}>Calories</Text>
            </View>
            <View style={styles.weekStatItem}>
              <Ionicons name="time-outline" size={16} color="#3498DB" />
              <Text style={styles.weekStatVal}>{dash.total_duration_week}</Text>
              <Text style={styles.weekStatLabel}>Minutes</Text>
            </View>
            <View style={styles.weekStatItem}>
              <Ionicons name="footsteps-outline" size={16} color={AppTheme.colors.primary} />
              <Text style={styles.weekStatVal}>{(dash.total_steps_week / 1000).toFixed(1)}k</Text>
              <Text style={styles.weekStatLabel}>Steps</Text>
            </View>
          </View>
        </View>
      )}

      {/* Top muscle groups */}
      {topGroups.length > 0 && (
        <View style={styles.mgStatsCard}>
          <Text style={styles.weekStatsTitle}>Top muscle groups</Text>
          <View style={styles.mgStatsGrid}>
            {topGroups.map(([group, count]) => {
              const tint = muscleGroupColor(group);
              return (
                <View key={group} style={[styles.mgStatChip, { backgroundColor: tint + '15' }]}>
                  <View style={[styles.mgStatDot, { backgroundColor: tint }]} />
                  <Text style={[styles.mgStatName, { color: tint }]}>{group}</Text>
                  <Text style={styles.mgStatCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Menu items */}
      <View style={styles.menuCard}>
        <MenuItem
          icon="person-outline"
          label="Personal Info"
          sub="Name, age, gender"
          onPress={() => setActiveSheet('personal')}
        />
        <MenuItem
          icon="body-outline"
          label="Body Measurements"
          sub="Weight, height"
          onPress={() => setActiveSheet('body')}
        />
        <MenuItem
          icon="flag-outline"
          label="Fitness Goals"
          sub="Weekly steps target"
          onPress={() => setActiveSheet('goals')}
          last
        />
      </View>

      <View style={styles.logoutSection}>
        <PrimaryButton label="Log out" secondary onPress={() => void logout()} />
      </View>

      {/* Sheets */}
      <PersonalSheet
        visible={activeSheet === 'personal'}
        profile={profile}
        onClose={() => setActiveSheet(null)}
        onSave={saveProfile}
        showToast={showToast}
      />
      <BodySheet
        visible={activeSheet === 'body'}
        profile={profile}
        onClose={() => setActiveSheet(null)}
        onSave={saveProfile}
        showToast={showToast}
      />
      <GoalsSheet
        visible={activeSheet === 'goals'}
        profile={profile}
        onClose={() => setActiveSheet(null)}
        onSave={saveProfile}
        showToast={showToast}
      />
    </ScreenContainer>
  );
}

/* ── Menu row ─────────────────────────────────────── */

function MenuItem({ icon, label, sub, onPress, last }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.menuItem, last && styles.menuItemLast]}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={22} color={AppTheme.colors.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

/* ── Sheet wrapper ────────────────────────────────── */

function Sheet({ visible, title, onClose, children }: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.sheetSafe}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={26} color={AppTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.sheetBody}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
}

/* ── Personal Info sheet ──────────────────────────── */

function PersonalSheet({ visible, profile, onClose, onSave, showToast }: {
  visible: boolean;
  profile: any;
  onClose: () => void;
  onSave: (p: any) => Promise<void>;
  showToast: (msg: string, success?: boolean) => void;
}) {
  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(profile?.age?.toString() ?? '');
  const [gender, setGender] = useState<Gender | null>(null);

  const save = async () => {
    if (!name.trim()) { showToast('Name is required'); return; }
    try {
      await onSave({ name, age: age ? Number(age) : null });
      showToast('Personal info updated', true);
      onClose();
    } catch { showToast('Save failed'); }
  };

  return (
    <Sheet visible={visible} title="Personal Info" onClose={onClose}>
      <TextInputField label="Name" value={name} onChangeText={setName} />
      <TextInputField label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.pillRow}>
          {(['male', 'female', 'other'] as Gender[]).map((g) => (
            <TouchableOpacity key={g} activeOpacity={0.8} onPress={() => setGender(g)}
              style={[styles.pill, gender === g && styles.pillActive]}>
              <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <PrimaryButton label="Save" onPress={save} />
    </Sheet>
  );
}

/* ── Body Measurements sheet ──────────────────────── */

function BodySheet({ visible, profile, onClose, onSave, showToast }: {
  visible: boolean;
  profile: any;
  onClose: () => void;
  onSave: (p: any) => Promise<void>;
  showToast: (msg: string, success?: boolean) => void;
}) {
  const [wUnit, setWUnit] = useState<WeightUnit>('kg');
  const [hUnit, setHUnit] = useState<HeightUnit>('cm');
  const [weight, setWeight] = useState(profile?.weight_kg?.toFixed(1) ?? '');
  const [height, setHeight] = useState(profile?.height_cm?.toFixed(1) ?? '');

  const save = async () => {
    if (!weight || !height) { showToast('Weight and height are required'); return; }
    try {
      await onSave({
        weight_kg: Math.round(toKg(Number(weight), wUnit) * 10) / 10,
        height_cm: Math.round(toCm(Number(height), hUnit) * 10) / 10,
      });
      showToast('Measurements updated', true);
      onClose();
    } catch { showToast('Save failed'); }
  };

  return (
    <Sheet visible={visible} title="Body Measurements" onClose={onClose}>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Weight</Text>
        <View style={styles.inputWithUnit}>
          <View style={styles.inputFlex}>
            <TextInputField label="" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
          </View>
          <View style={styles.unitToggle}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => {
              if (wUnit !== 'kg' && weight) setWeight(fromKg(toKg(Number(weight), 'lbs'), 'kg').toFixed(1));
              setWUnit('kg');
            }} style={[styles.unitPill, wUnit === 'kg' && styles.unitPillActive]}>
              <Text style={[styles.unitText, wUnit === 'kg' && styles.unitTextActive]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => {
              if (wUnit !== 'lbs' && weight) setWeight(fromKg(toKg(Number(weight), 'kg'), 'lbs').toFixed(1));
              setWUnit('lbs');
            }} style={[styles.unitPill, wUnit === 'lbs' && styles.unitPillActive]}>
              <Text style={[styles.unitText, wUnit === 'lbs' && styles.unitTextActive]}>lbs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Height</Text>
        <View style={styles.inputWithUnit}>
          <View style={styles.inputFlex}>
            <TextInputField label="" value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
          </View>
          <View style={styles.unitToggle}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => {
              if (hUnit !== 'cm' && height) setHeight(fromCm(toCm(Number(height), 'ft'), 'cm').toFixed(1));
              setHUnit('cm');
            }} style={[styles.unitPill, hUnit === 'cm' && styles.unitPillActive]}>
              <Text style={[styles.unitText, hUnit === 'cm' && styles.unitTextActive]}>cm</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => {
              if (hUnit !== 'ft' && height) setHeight(fromCm(toCm(Number(height), 'cm'), 'ft').toFixed(1));
              setHUnit('ft');
            }} style={[styles.unitPill, hUnit === 'ft' && styles.unitPillActive]}>
              <Text style={[styles.unitText, hUnit === 'ft' && styles.unitTextActive]}>ft</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <PrimaryButton label="Save" onPress={save} />
    </Sheet>
  );
}

/* ── Goals sheet ──────────────────────────────────── */

function GoalsSheet({ visible, profile, onClose, onSave, showToast }: {
  visible: boolean;
  profile: any;
  onClose: () => void;
  onSave: (p: any) => Promise<void>;
  showToast: (msg: string, success?: boolean) => void;
}) {
  const [goal, setGoal] = useState(profile?.target_value?.toString() ?? '');

  const save = async () => {
    try {
      await onSave({ target_value: goal ? Number(goal) : null });
      showToast('Goals updated', true);
      onClose();
    } catch { showToast('Save failed'); }
  };

  return (
    <Sheet visible={visible} title="Fitness Goals" onClose={onClose}>
      <TextInputField label="Weekly steps target" value={goal} onChangeText={setGoal} keyboardType="number-pad" />
      <PrimaryButton label="Save" onPress={save} />
    </Sheet>
  );
}

/* ── Styles ───────────────────────────────────────── */

const styles = StyleSheet.create({
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', color: AppTheme.colors.textPrimary },
  userSub: { fontSize: 14, color: AppTheme.colors.textSecondary, marginTop: 2 },

  bmiCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: AppTheme.colors.card, borderRadius: 18,
    borderWidth: 1, borderColor: AppTheme.colors.border, padding: 16,
  },
  bmiLeft: { gap: 2 },
  bmiLabel: { fontSize: 13, color: AppTheme.colors.textSecondary, fontWeight: '500' },
  bmiValue: { fontSize: 30, fontWeight: '800', color: AppTheme.colors.textPrimary },
  bmiBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  bmiBadgeText: { fontSize: 14, fontWeight: '700' },

  weekStatsCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 16,
    gap: 12,
  },
  weekStatsTitle: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  weekStatsRow: { flexDirection: 'row', gap: 8 },
  weekStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.colors.background,
    borderRadius: 12,
    paddingVertical: 10,
  },
  weekStatVal: { fontSize: 16, fontWeight: '800', color: AppTheme.colors.textPrimary },
  weekStatLabel: { fontSize: 10, fontWeight: '600', color: AppTheme.colors.textSecondary },

  mgStatsCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 16,
    gap: 10,
  },
  mgStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mgStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mgStatDot: { width: 8, height: 8, borderRadius: 4 },
  mgStatName: { fontSize: 13, fontWeight: '700' },
  mgStatCount: { fontSize: 13, fontWeight: '800', color: AppTheme.colors.textPrimary },

  menuCard: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: AppTheme.colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: AppTheme.colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600', color: AppTheme.colors.textPrimary },
  menuSub: { fontSize: 13, color: AppTheme.colors.textSecondary, marginTop: 1 },

  logoutSection: { marginTop: 24 },

  // Sheet
  sheetSafe: { flex: 1, backgroundColor: AppTheme.colors.background },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: AppTheme.colors.border,
  },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: AppTheme.colors.textPrimary },
  sheetBody: { padding: 20, gap: 16 },

  // Shared form styles (reused in sheets)
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 14, color: AppTheme.colors.textSecondary },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center',
    backgroundColor: AppTheme.colors.card, borderWidth: 1, borderColor: AppTheme.colors.border,
  },
  pillActive: { backgroundColor: AppTheme.colors.primary, borderColor: AppTheme.colors.primary },
  pillText: { fontSize: 15, fontWeight: '600', color: AppTheme.colors.textSecondary },
  pillTextActive: { color: '#fff' },
  inputWithUnit: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  inputFlex: { flex: 1 },
  unitToggle: {
    flexDirection: 'row', backgroundColor: AppTheme.colors.card,
    borderRadius: 12, borderWidth: 1, borderColor: AppTheme.colors.border, overflow: 'hidden', marginBottom: 2,
  },
  unitPill: { paddingVertical: 12, paddingHorizontal: 16 },
  unitPillActive: { backgroundColor: AppTheme.colors.primary },
  unitText: { fontSize: 14, fontWeight: '700', color: AppTheme.colors.textSecondary },
  unitTextActive: { color: '#fff' },
});
