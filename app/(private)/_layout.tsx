import { Stack, router } from 'expo-router'
import { useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'

import { useAuthUser } from '@/lib/auth-context'
import { usePushNotifications } from '@/hooks/use-push-notifications'

import SseHandler from '@/lib/SSEHandler'

// Sheets with their own title and close button. How a screen is presented has to be set
// here: from inside the screen it can arrive after the push, leaving a plain screen.
const SHEET = {
  presentation: 'formSheet' as const,
  headerShown: false,
  sheetGrabberVisible: true,
  sheetAllowedDetents: [0.9],
}

// Full height for sheets with inputs: iOS stretches a shorter detent toward full screen
// when the keyboard opens, which made the sheet jump. At full height it stays put.
const FULL_SHEET = { ...SHEET, sheetAllowedDetents: [1] }

export default function RootLayout() {
  const user = useAuthUser()
  usePushNotifications(user?.id)

  useEffect(() => {
    ;(async () => {
      const pending = await SecureStore.getItemAsync('pendingJoinToken')
      if (pending) {
        await SecureStore.deleteItemAsync('pendingJoinToken')
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
        <Stack.Screen name='groups/invites' options={SHEET} />
        <Stack.Screen name='groups/[groupId]/invite-member' options={FULL_SHEET} />
        <Stack.Screen name='friends/requests' options={SHEET} />
        <Stack.Screen name='friends/add' options={FULL_SHEET} />
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
