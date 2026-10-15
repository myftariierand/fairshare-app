import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import '@/global.css'
import { useAuthUser } from '@/lib/auth-context'

import { Tabs } from 'expo-router'

import { ContactIcon, UserGroupIcon, UserIcon } from 'lucide-react-native'

export default function RootLayout() {
  const user = useAuthUser()

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => <UserGroupIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name='friends'
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => <ContactIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: () => (
            <Avatar alt={user.name} className='size-7'>
              <AvatarFallback className='border-border size border'>
                <Text className='text-xs'>{user.name.slice(0, 2)}</Text>
              </AvatarFallback>
            </Avatar>
          ),
        }}
      />
    </Tabs>
  )
}
