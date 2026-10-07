import '@/global.css';

import { Tabs } from 'expo-router';

import { UserGroupIcon, UserIcon, UsersIcon } from 'lucide-react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

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
    </Tabs>
  );
}
