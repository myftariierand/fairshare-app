import { useEffect, useRef } from 'react'
import EventSource from 'react-native-sse'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, usePathname } from 'expo-router'
import { toast } from 'sonner-native'

import { SseEventType } from '@/types/common'
import { api } from '@/lib/api'
import { useAuthUser } from '@/lib/auth-context'

type Key = readonly string[]

const KEYS: Partial<Record<SseEventType, Key[]>> = {
  [SseEventType.FRIEND_REMOVED]: [['friends'], ['profile']],
  [SseEventType.FRIEND_REQUEST_RECEIVED]: [['requests']],
  [SseEventType.FRIEND_REQUEST_REJECTED]: [['users'], ['requests']],
  [SseEventType.FRIEND_REQUEST_ACCEPTED]: [['users'], ['friends'], ['requests'], ['profile']],
  [SseEventType.GROUP_INVITE_RECEIVED]: [['group-invites']],
  [SseEventType.GROUP_INVITE_REJECTED]: [['group-invites'], ['users']],
  [SseEventType.GROUP_INVITE_ACCEPTED]: [['groups'], ['group-invites'], ['users'], ['profile']],
  [SseEventType.GROUP_JOINED]: [['groups'], ['group-invites'], ['profile']],
  [SseEventType.GROUP_UDPATED]: [['groups'], ['profile']],
  [SseEventType.GROUP_DELETED]: [['groups'], ['profile']],
  [SseEventType.GROUP_MEMBER_REMOVED]: [['groups'], ['group-invites']],
  [SseEventType.TRANSACTION_ADDED]: [['groups'], ['profile']],
  [SseEventType.TRANSACTION_UPDATED]: [['groups'], ['profile']],
  [SseEventType.TRANSACTION_DELETED]: [['groups'], ['expenses'], ['profile']],
  [SseEventType.TRANSACTION_SETTLED]: [['groups'], ['profile']],
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

  const pathname = usePathname()
  const pathnameRef = useRef(pathname)

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (!user) return

    let es: EventSource<'event'> | null = null
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    let stopped = false

    const handle = (data: { type: SseEventType; message: string }) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })

      KEYS[data.type]?.forEach(queryKey => queryClient.invalidateQueries({ queryKey }))

      if (data.type === SseEventType.TRANSACTION_DELETED) {
        if (pathnameRef.current.includes('expenses')) {
          const groupId = pathnameRef.current.split('/')[2]
          router.replace(`/groups/${groupId}`)
        }

        queryClient.removeQueries({ queryKey: ['expenses'] })
      }

      if (data.type === SseEventType.GROUP_MEMBER_REMOVED) {
        const groupId = pathnameRef.current.split('/')[2]
        if (pathnameRef.current.includes('groups')) {
          router.replace('/')
        }

        queryClient.removeQueries({ queryKey: ['groups', groupId] })
      }

      if (data.type === SseEventType.GROUP_DELETED) router.replace('/')

      if (!SILENT.includes(data.type)) toast.info(data.message)
    }

    const disconnect = () => {
      es?.removeAllEventListeners()
      es?.close()
      es = null
    }

    const retry = () => {
      if (stopped) return

      attempts++
      retryTimer = setTimeout(connect, Math.min(1000 * 2 ** attempts, 30_000))
    }

    // A ticket works once, so every connection needs a new one. The library's own polling
    // stays on: when a stream ends cleanly it fires no event, but reopening with the used
    // ticket fails, and that error is what tells us to get a new one.
    const connect = async () => {
      try {
        const { data } = await api.post<{ ticket: string }>('/sse/ticket')

        if (stopped) return

        es = new EventSource<'event'>(
          `${process.env.EXPO_PUBLIC_API_URL}/sse/subscribe?ticket=${encodeURIComponent(data.ticket)}`
        )
        es.addEventListener('open', () => {
          attempts = 0
        })
        es.addEventListener('event', e => {
          if (e.data) handle(JSON.parse(e.data))
        })
        es.addEventListener('error', () => {
          disconnect()
          retry()
        })
      } catch {
        retry()
      }
    }

    connect()

    return () => {
      stopped = true
      clearTimeout(retryTimer)
      disconnect()
    }
  }, [user, queryClient, router])

  return null
}

export default SseHandler
