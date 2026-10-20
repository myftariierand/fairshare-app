import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import EventSource from 'react-native-sse'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, usePathname } from 'expo-router'
import { toast } from 'sonner-native'

import { SseEventType } from '@/types/common'
import { useAuth, useAuthUser } from '@/lib/auth-context'

type Key = readonly string[]

const KEYS: Partial<Record<SseEventType, Key[]>> = {
  [SseEventType.FRIEND_REMOVED]: [['friends']],
  [SseEventType.FRIEND_REQUEST_RECEIVED]: [['requests']],
  [SseEventType.FRIEND_REQUEST_REJECTED]: [['users'], ['requests']],
  [SseEventType.FRIEND_REQUEST_ACCEPTED]: [['users'], ['friends'], ['requests']],
  [SseEventType.GROUP_INVITE_RECEIVED]: [['group-invites']],
  [SseEventType.GROUP_INVITE_REJECTED]: [['group-invites'], ['users']],
  [SseEventType.GROUP_INVITE_ACCEPTED]: [['groups'], ['group-invites'], ['users']],
  [SseEventType.GROUP_JOINED]: [['groups'], ['group-invites']],
  [SseEventType.GROUP_UDPATED]: [['groups']],
  [SseEventType.GROUP_DELETED]: [['groups']],
  [SseEventType.GROUP_MEMBER_REMOVED]: [['groups'], ['group-invites']],
  [SseEventType.TRANSACTION_ADDED]: [['groups']],
  [SseEventType.TRANSACTION_UPDATED]: [['groups']],
  [SseEventType.TRANSACTION_DELETED]: [['groups'], ['expenses']],
  [SseEventType.TRANSACTION_SETTLED]: [['groups']],
  [SseEventType.CHECKLIST_ITEM_ADDED]: [['tasks']],
  [SseEventType.CHECKLIST_ITEM_DELETED]: [['tasks']],
  [SseEventType.CHECKLIST_ITEM_UPDATED]: [['tasks']],
  [SseEventType.CHECKLIST_ITEM_REORDERED]: [['tasks']],
}

const SILENT = [SseEventType.FRIEND_REMOVED, SseEventType.CHECKLIST_ITEM_REORDERED]

const SseHandler = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const user = useAuthUser()
  const token = useAuth()

  const pathname = usePathname()
  const pathnameRef = useRef(pathname)

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (!user) return

    let es: EventSource<'event'> | null = null

    const handle = (data: { type: SseEventType; message: string }) => {
      queryClient.invalidateQueries({ queryKey: ['activity'] })

      KEYS[data.type]?.forEach(queryKey => queryClient.invalidateQueries({ queryKey }))

      if (data.type === SseEventType.TRANSACTION_DELETED) {
        if (pathnameRef.current.includes('expenses')) {
          const groupId = pathnameRef.current.split('/')[2]
          router.replace(`/groups/${groupId}`)
        }

        queryClient.removeQueries({ queryKey: ['expenses'] })
      }

      if (data.type === SseEventType.GROUP_DELETED) router.replace('/')

      if (!SILENT.includes(data.type)) toast.info(data.message)
    }

    const connect = () => {
      es?.close()
      es = new EventSource<'event'>(`${process.env.EXPO_PUBLIC_API_URL}/sse/subscribe/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      es.addEventListener('event', e => {
        if (e.data) handle(JSON.parse(e.data))
      })
    }

    const disconnect = () => {
      es?.removeAllEventListeners()
      es?.close()
      es = null
    }

    connect()

    return () => {
      disconnect()
    }
  }, [user, token, queryClient, router])

  return null
}

export default SseHandler
