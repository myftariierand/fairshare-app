// lib/notifications.ts
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

import { api } from '@/lib/api'

// While the app is open, SSE already shows a toast, so don't show a system banner
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

let registeredToken: string | null = null

// Sent when signing out, so this phone stops getting that person's notifications
export const getRegisteredPushToken = () => registeredToken

export async function registerPushToken() {
  const token = await getPushToken()
  if (!token) return

  await api.post('/devices', { token, platform: Platform.OS })
  registeredToken = token
}

export async function getPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
    })

    await Notifications.setNotificationCategoryAsync('group_invite', [
      {
        identifier: 'accept',
        buttonTitle: 'Join',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'decline',
        buttonTitle: 'Decline',
        options: { opensAppToForeground: false, isDestructive: true },
      },
    ])
    await Notifications.setNotificationCategoryAsync('friend_request', [
      {
        identifier: 'accept',
        buttonTitle: 'Accept',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'decline',
        buttonTitle: 'Decline',
        options: { opensAppToForeground: false, isDestructive: true },
      },
    ])
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let status = existing
  if (existing !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status
  }
  if (status !== 'granted') return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data
}
