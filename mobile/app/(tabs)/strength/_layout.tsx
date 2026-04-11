import { Stack } from 'expo-router';

export default function StrengthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F6F7FB' },
      }}
    />
  );
}
