import { useMemo } from 'react'
import { ActivityIndicator, SectionList, View } from 'react-native'
import { format } from 'date-fns'
import {
  User,
  Dot,
  UserLock,
  UserCog,
  Users,
  GitPullRequestArrow,
  GitPullRequestClosed,
  GitPullRequest,
  UserSearch,
  GitPullRequestDraft,
  UserPlus,
  ReceiptText,
  Handshake,
  UserMinus,
  type LucideIcon,
  DotIcon,
} from 'lucide-react-native'

import { useAuthUser } from '@/lib/auth-context'
import { useActivities, ActivityAction } from '@/services/activity'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'

import type { AcitivityLog } from '@/services/activity'

const COLORS = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  muted: '#737373',
}

type Part = { text: string; muted?: boolean }
type LogConfig = { icon: LucideIcon; parts: Part[] }

// muted connective text vs. emphasized names
const m = (text: string): Part => ({ text, muted: true })
const b = (text?: string): Part => ({ text: text ?? '' })

const getLogConfig = (activity: AcitivityLog, currentUserId?: string): LogConfig | null => {
  const group = activity.snapshot?.group
  const transaction = activity.snapshot?.transaction

  switch (activity.action) {
    case ActivityAction.USER_REGISTERED:
      return { icon: User, parts: [b('You registered to FairShare')] }
    case ActivityAction.USER_CHANGED_PASSWORD:
      return { icon: UserLock, parts: [b('You changed your password')] }
    case ActivityAction.USER_UPDATED_PROFILE:
      return { icon: UserCog, parts: [b('You updated your profile')] }
    case ActivityAction.GROUP_CREATED:
      return {
        icon: Users,
        parts: [m('You created '), b(group?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_SENT:
      return currentUserId === activity.user.id
        ? {
            icon: GitPullRequestArrow,
            parts: [m('You sent a friend request to '), b(activity.targetUser?.name)],
          }
        : {
            icon: GitPullRequestArrow,
            parts: [m('You received a friend request from '), b(activity.user?.name)],
          }
    case ActivityAction.FRIENDSHIP_REQUEST_CANCELLED:
      return {
        icon: GitPullRequestClosed,
        parts: [m('You cancelled friend request to '), b(activity.user?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_REJECTED:
      return {
        icon: GitPullRequestDraft,
        parts: [m('You rejected friend request from '), b(activity.targetUser?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_ACCEPTED:
      return {
        icon: GitPullRequest,
        parts: [b(activity.targetUser?.name), m(' accepted your friend request')],
      }
    case ActivityAction.FRIENDSHIP_REMOVED:
      return {
        icon: GitPullRequest,
        parts: [m('You removed '), b(activity.user?.name), m(' from your friends')],
      }
    case ActivityAction.GROUP_INVITATION_SENT:
      return {
        icon: UserSearch,
        parts: [
          b(activity.user?.name),
          m(' invited '),
          b(activity.targetUser?.name),
          m(' to join '),
          b(group?.name),
        ],
      }
    case ActivityAction.GROUP_INVITATION_REJECTED:
      return {
        icon: UserSearch,
        parts: [b(activity.user?.name), m(' rejected invitation to join '), b(group?.name)],
      }
    case ActivityAction.GROUP_INVITATION_ACCEPTED:
      return {
        icon: UserPlus,
        parts: [b(activity.user?.name), m(' accepted invitation to join '), b(group?.name)],
      }
    case ActivityAction.GROUP_UPDATED:
      return {
        icon: Users,
        parts: [b(activity.user?.name), m(' updated '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_REMOVED:
      return {
        icon: UserMinus,
        parts: [b(activity.targetUser?.name), m(' has been removed from '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_JOINED:
      return {
        icon: UserPlus,
        parts: [b(activity.user?.name), m(' joined '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_LEFT:
      return {
        icon: UserMinus,
        parts: [b(activity.user?.name), m(' left '), b(group?.name)],
      }
    case ActivityAction.GROUP_DELETED:
      return {
        icon: Users,
        parts: [b(group?.name), m(' has been deleted')],
      }
    case ActivityAction.TRANSACTION_CREATED:
      return {
        icon: ReceiptText,
        parts: [
          b(activity.user?.name),
          m(' added '),
          b(transaction?.description),
          m(' to '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_UPDATED:
      return {
        icon: ReceiptText,
        parts: [
          b(activity.user?.name),
          m(' updated '),
          b(transaction?.description),
          m(' in '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_DELETED:
      return {
        icon: ReceiptText,
        parts: [
          b(activity.user?.name),
          m(' deleted '),
          b(transaction?.description),
          m(' from '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_SETTLED:
      return {
        icon: Handshake,
        parts: [
          b('You '),
          m('and '),
          b(activity.targetUser?.name),
          m(' are settled in '),
          b(group?.name),
        ],
      }
    default:
      return null
  }
}

type Section = { title: string; data: AcitivityLog[] }

export default function ActivityScreen() {
  const user = useAuthUser()
  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useActivities()

  // group by month (assumes the API returns newest first)
  const sections = useMemo<Section[]>(() => {
    const items = data?.pages.flatMap(page => page.data) ?? []
    const map = new Map<string, AcitivityLog[]>()

    for (const item of items) {
      const key = format(new Date(item.createdAt), 'MMMM yyyy')
      const list = map.get(key)
      if (list) list.push(item)
      else map.set(key, [item])
    }

    return Array.from(map, ([title, data]) => ({ title, data }))
  }, [data])

  return (
    <>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          stickySectionHeadersEnabled
          className='px-4'
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
          renderSectionHeader={({ section }) => (
            <Text variant={'large'} className='bg-background pt-2 pb-1'>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => {
            const config = getLogConfig(item, user?.id)
            if (!config) return null

            const date = new Date(item.createdAt)

            return (
              <View className='flex-row items-center gap-4'>
                <Icon as={config.icon} />
                <View>
                  <Text>
                    {config.parts.map((part, i) => (
                      <Text key={i} variant={part.muted ? 'muted' : 'default'}>
                        {part.text}
                      </Text>
                    ))}
                  </Text>
                  <View className='flex-row items-center'>
                    <Text variant={'muted'}>{format(date, 'dd MMM yyyy')}</Text>
                    <Icon as={DotIcon} className='text-muted-foreground' />
                    <Text variant={'muted'}>{format(date, 'HH:mm')}</Text>
                  </View>
                </View>
              </View>
            )
          }}
          ItemSeparatorComponent={() => <View className='h-4' />}
        />
      )}
    </>
  )
}
