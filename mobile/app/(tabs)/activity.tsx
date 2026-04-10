import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextInputField } from '@/components/ui/text-input-field';
import { api } from '@/lib/api';
import type { Activity } from '@/types/api';

export default function ActivityScreen() {
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [recent, setRecent] = useState<Activity[]>([]);

  const loadRecent = async () => {
    try {
      const res = await api.get<Activity[]>('/activities?limit=5');
      setRecent(res.data);
    } catch {
      setRecent([]);
    }
  };

  useEffect(() => {
    void loadRecent();
  }, []);

  const save = async () => {
    try {
      await api.post('/activities', {
        kind: 'walking',
        steps: Number(steps || 0),
        distance_km: Number(distance || 0),
        duration_min: Number(duration || 0),
      });
      setSteps('');
      setDistance('');
      setDuration('');
      await loadRecent();
    } catch {
      Alert.alert('Save failed', 'Could not log activity right now.');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Log Activity</Text>
      <Text style={styles.subtitle}>Capture your daily movement in seconds.</Text>
      <TextInputField label="Steps" value={steps} onChangeText={setSteps} keyboardType="numeric" />
      <TextInputField label="Distance (km)" value={distance} onChangeText={setDistance} keyboardType="numeric" />
      <TextInputField label="Duration (min)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
      <PrimaryButton label="Save activity" onPress={save} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent logs</Text>
        {recent.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.rowMain}>
              {item.steps} steps • {item.distance_km} km
            </Text>
            <Text style={styles.rowSub}>{new Date(item.started_at).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 8, fontSize: 30, fontWeight: '800', color: AppTheme.colors.textPrimary },
  subtitle: { color: AppTheme.colors.textSecondary, marginBottom: 8 },
  section: { marginTop: 8, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: AppTheme.colors.textPrimary },
  row: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 12,
  },
  rowMain: { color: AppTheme.colors.textPrimary, fontWeight: '600' },
  rowSub: { color: AppTheme.colors.textSecondary, marginTop: 2 },
});
