import { Stack } from 'expo-router'

import { useAuthUser } from '@/lib/auth-context'
import { usePushNotifications } from '@/hooks/use-push-notifications'

import SseHandler from '@/lib/SSEHandler'

export default function RootLayout() {
  const user = useAuthUser()
  usePushNotifications(user?.id)

  return (
    <>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen
          name='groups/new'
          options={{
            title: 'New Group',
            presentation: 'modal',
          }}
        />
      </Stack>
      <SseHandler />
    </>
  )
}
