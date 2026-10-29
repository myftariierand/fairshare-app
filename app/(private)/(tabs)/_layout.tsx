import { Icon } from '@/components/ui/icon'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import '@/global.css'
import { useAuthUser } from '@/lib/auth-context'

import { Tabs, router } from 'expo-router'
import { Pressable, View } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { ActivityIcon, ContactIcon, PlusIcon, UserGroupIcon } from 'lucide-react-native'

export default function RootLayout() {
  const user = useAuthUser()
  const [mutedForeground, background] = useCSSVariable([
    '--color-muted-foreground',
    '--color-background',
  ]) as string[]
  // Navigation text isn't styled by Uniwind, so set the bundled font directly
  const fontFamily = 'Geist'

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: mutedForeground,
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        // Same ground as the screen, not the card color the navigation theme uses for headers
        headerStyle: { backgroundColor: background },
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
        name='add'
        options={{
          title: 'Add expense',
          tabBarLabel: () => null,
          tabBarButton: ({ style }) => (
            <View style={style} className='items-center justify-center'>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Add expense'
                onPress={() => router.push('/new-expense')}
                className='bg-primary h-12 w-14 items-center justify-center rounded-2xl active:opacity-80'
              >
                <Icon as={PlusIcon} className='text-primary-foreground size-6' />
              </Pressable>
            </View>
          ),
        }}
        listeners={{
          // never switch to the placeholder tab
          tabPress: e => e.preventDefault(),
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
          headerShown: false,
          tabBarIcon: () => (
            <InitialsAvatar name={user.name} className='size-7' textClassName='text-[10px]' />
          ),
        }}
      />
    </Tabs>
  )
}
