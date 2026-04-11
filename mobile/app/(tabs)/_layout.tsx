import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTheme } from '@/constants/app-theme';

const TAB_CONFIG_BY_NAME: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { icon: 'home', label: 'Home' },
  history: { icon: 'time', label: 'History' },
  activity: { icon: 'stats-chart', label: 'Stats' },
  plans: { icon: 'calendar', label: 'Plans' },
  profile: { icon: 'person', label: 'Profile' },
};

const TAB_BAR_ORDER = ['index', 'history', 'activity', 'plans', 'profile'] as const;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index]?.name;

  const visibleRoutes = TAB_BAR_ORDER.map((name) => state.routes.find((r) => r.name === name)).filter(
    (r): r is (typeof state.routes)[number] => r != null,
  );

  return (
    <View style={[styles.barOuter, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        {visibleRoutes.map((route) => {
          const config = TAB_CONFIG_BY_NAME[route.name];
          if (!config) return null;
          const focused = activeName === route.name;

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              accessibilityRole="button"
              onPress={() => {
                if (!focused) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tabItem}>
              <TabIcon focused={focused} icon={config.icon} label={config.label} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function TabIcon({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
    return () => anim.stopAnimation();
  }, [focused]);

  /** Keep Animated.Text mounted even when inactive so native opacity updates always have a listener (fixes onAnimatedValueUpdate warnings). */
  return (
    <View style={focused ? styles.activePill : styles.inactiveWrap}>
      <Ionicons
        name={(focused ? icon : `${icon}-outline`) as keyof typeof Ionicons.glyphMap}
        size={focused ? 20 : 24}
        color={focused ? '#fff' : '#888'}
      />
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.activeLabel,
          { opacity: anim },
          focused ? styles.tabLabelExpanded : styles.tabLabelCollapsed,
        ]}>
        {label}
      </Animated.Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: AppTheme.colors.background,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          paddingTop: 0,
          paddingBottom: 0,
        },
      }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="metrics" options={{ href: null }} />
      <Tabs.Screen name="bmi" options={{ href: null }} />
      <Tabs.Screen name="workout-session" options={{ href: null }} />
      <Tabs.Screen name="suggested-workouts" options={{ href: null }} />
      <Tabs.Screen name="strength" options={{ href: null }} />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="plans" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barOuter: {
    backgroundColor: AppTheme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  bar: {
    height: 58,
    borderRadius: 35,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    paddingHorizontal: 4,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    maxWidth: 200,
  },
  inactiveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    overflow: 'hidden',
  },
  activeLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tabLabelExpanded: { maxWidth: 120 },
  tabLabelCollapsed: { maxWidth: 0, overflow: 'hidden' },
});
