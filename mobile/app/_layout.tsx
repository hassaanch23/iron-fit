import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { AppTheme } from '@/constants/app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const NavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: AppTheme.colors.background,
    card: AppTheme.colors.card,
  },
};

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: AppTheme.colors.background,
    card: AppTheme.colors.card,
  },
};

function AppNavigator() {
  const colorScheme = useColorScheme();
  const { loading, token, onboardingComplete } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === '(auth)';

    if (token && onboardingComplete && inAuth && segments[1] === 'onboarding') {
      router.replace('/(tabs)');
      return;
    }

    if (token && inAuth && segments[1] !== 'onboarding' && segments[1] !== 'verify-otp') {
      if (!onboardingComplete) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (!token && !inAuth) {
      router.replace('/welcome');
    }
  }, [loading, token, segments, onboardingComplete]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: AppTheme.colors.background,
        }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? NavigationDarkTheme : NavigationLightTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'none',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen
          name="(tabs)"
          options={{ contentStyle: { backgroundColor: AppTheme.colors.background } }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
