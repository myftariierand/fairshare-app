import '@/global.css';

import { Tabs } from 'expo-router';

import { UserGroupIcon, UserIcon, UsersIcon } from 'lucide-react-native';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: '#9ca3af',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => <UserGroupIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
