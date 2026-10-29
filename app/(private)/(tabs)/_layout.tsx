import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import '@/global.css'
import { useAuthUser } from '@/lib/auth-context'

import { Tabs } from 'expo-router'
import { useCSSVariable, useUniwind } from 'uniwind'
import { BRAND_THEME } from '@/lib/theme'

import { ActivityIcon, ContactIcon, UserGroupIcon, UserIcon } from 'lucide-react-native'

export default function RootLayout() {
  const user = useAuthUser()
  const mutedForeground = useCSSVariable('--color-muted-foreground') as string
  const { theme } = useUniwind()
  // Bundled in app.json; only the redesign theme uses it
  const fontFamily = theme === BRAND_THEME ? 'Geist' : undefined

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: mutedForeground,
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 28, fontWeight: '700', fontFamily },
        headerLeftContainerStyle: { paddingLeft: 4 },
        tabBarLabelStyle: { fontFamily, fontWeight: '500' },
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
        name='activity'
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <ActivityIcon size={size} color={color} />,
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
