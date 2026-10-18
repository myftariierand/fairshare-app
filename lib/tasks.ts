// tasks/notification-task.ts
import * as TaskManager from 'expo-task-manager'
import * as Notifications from 'expo-notifications'
import { BackgroundNotificationTaskResult } from 'expo-notifications'

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK'

import { acceptGroupInvite, rejectGroupInvite } from '@/services/group'
import { acceptFriendRequest, rejectFriendRequest } from '@/services/friends'
import { SseEventType } from '@/types/common'

async function handleResponse(response: Notifications.NotificationResponse) {
  const { actionIdentifier, notification } = response
  const content = notification.request.content as any

  if (actionIdentifier !== 'accept' && actionIdentifier !== 'decline') return

  await Notifications.dismissNotificationAsync(notification.request.identifier)

  let data: Record<string, string> = content.data ?? {}
  if (!content.data && content.dataString) {
    try {
      data = JSON.parse(content.dataString)
    } catch (e) {
      console.warn('bad dataString', e)
      return
    }
  }

  const accepted = actionIdentifier === 'accept'

  try {
    switch (data.type) {
      case SseEventType.GROUP_INVITE_RECEIVED:
        if (accepted) await acceptGroupInvite({ groupId: data.groupId, inviteId: data.inviteId })
        else await rejectGroupInvite({ inviteId: data.inviteId })
        break

      case SseEventType.FRIEND_REQUEST_RECEIVED:
        if (accepted) await acceptFriendRequest(data.requestId)
        else await rejectFriendRequest(data.requestId)
        break

      default:
        console.warn('unhandled action for type', data.type)
    }
  } catch (e) {
    console.warn('notification action failed', e)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Something went wrong',
        body: 'Could not process that action. Open the app to try again.',
      },
      trigger: { channelId: 'default' },
    })
  }
}

async function handleIncoming(data: any) {
  const raw = data?.data?.dataString
  const payload = raw ? JSON.parse(raw) : (data?.data ?? {})
  const { title, body, categoryId, ...rest } = payload
  if (!title) return console.warn('no title in payload', payload)

  await Notifications.scheduleNotificationAsync({
    content: { title, body, categoryIdentifier: categoryId, data: rest },
    trigger: { channelId: 'default' },
  })
}

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.warn(error)
    return
  }

  if (data && 'actionIdentifier' in data) {
    await handleResponse(data)
  } else {
    await handleIncoming(data)
  }
  return BackgroundNotificationTaskResult.NewData
})

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK)
