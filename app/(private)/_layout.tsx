import { Stack, router } from 'expo-router'
import { useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'

import { useAuthUser } from '@/lib/auth-context'
import { usePushNotifications } from '@/hooks/use-push-notifications'

import SseHandler from '@/lib/SSEHandler'

export default function RootLayout() {
  const user = useAuthUser()
  usePushNotifications(user?.id)

  useEffect(() => {
    ;(async () => {
      const pending = await SecureStore.getItemAsync('pendingJoinGroupId')
      if (pending) {
        await SecureStore.deleteItemAsync('pendingJoinGroupId')
        router.replace(`/join-group/${pending}`)
      }
    })()
  }, [])

  return (
    <>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen
          name='groups/new'
          options={{
            title: 'New group',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name='new-expense'
          options={{
            title: 'Add expense to…',
            presentation: 'formSheet',
            sheetAllowedDetents: [0.6, 1],
            sheetGrabberVisible: true,
          }}
        />
      </Stack>
      <SseHandler />
    </>
  )
}
