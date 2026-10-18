// hooks/usePushNotifications.ts
import { useEffect } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { getPushToken } from '@/lib/notifications'
import { api } from '@/lib/api' // your axios/fetch client
import { SseEventType } from '@/types/common'

export function usePushNotifications(userId?: string) {
  const router = useRouter()
  const lastResponse = Notifications.useLastNotificationResponse()

  // Register the device token after login
  useEffect(() => {
    if (!userId) return
    getPushToken().then(token => {
      if (token) api.post('/devices', { token, platform: Platform.OS })
    })
  }, [userId])

  // Handle taps, including the one that cold-started the app
  useEffect(() => {
    if (!lastResponse) return
    const { notification } = lastResponse
    const data = notification.request.content.data

    if (data?.type === SseEventType.TRANSACTION_ADDED) router.push(`/groups/${data.groupId}`)
    if (data?.type === SseEventType.TRANSACTION_UPDATED) router.push(`/groups/${data.groupId}`)
    if (data?.type === SseEventType.TRANSACTION_DELETED) router.push(`/groups/${data.groupId}`)
    if (data?.type === SseEventType.FRIEND_REQUEST_RECEIVED) router.push('/friends/requests')
    if (data?.type === SseEventType.FRIEND_REQUEST_ACCEPTED) router.push('/friends')
    if (data?.type === SseEventType.GROUP_INVITE_RECEIVED) router.push('/groups/invites')
    if (data?.type === SseEventType.GROUP_INVITE_ACCEPTED) router.push(`/groups/${data.groupId}`)
    if (data?.type === SseEventType.GROUP_INVITE_REJECTED) router.push(`/groups/${data.groupId}`)
    if (data?.type === SseEventType.GROUP_JOINED) router.push(`/groups/${data.groupId}`)

    Notifications.clearLastNotificationResponse()
  }, [lastResponse, router])
}
