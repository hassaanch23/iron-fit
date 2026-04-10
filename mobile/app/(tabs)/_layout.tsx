import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Text, View } from 'react-native';

import { AppTheme } from '@/constants/app-theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 78,
          borderRadius: 34,
          backgroundColor: 'rgba(255,255,255,0.55)',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          paddingHorizontal: 10,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={32}
            tint="light"
            style={{ flex: 1, borderRadius: 34, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.35)' }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="home-outline" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="time-outline" label="History" />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="stats-chart-outline" label="Stats" />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="calendar-outline" label="Plans" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="person-outline" label="Profile" />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ focused, name, label }: { focused: boolean; name: keyof typeof Ionicons.glyphMap; label: string }) {
  if (focused) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 18,
          paddingVertical: 11,
          borderRadius: 999,
          backgroundColor: AppTheme.colors.primary,
        }}>
        <Ionicons size={22} name={name} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{label}</Text>
      </View>
    );
  }

  return <Ionicons size={28} name={name} color="#B0B0B0" />;
}
