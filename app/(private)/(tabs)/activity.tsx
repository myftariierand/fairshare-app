import { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, SectionList, View } from 'react-native'
import { format, isSameYear } from 'date-fns'
import {
  User,
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
  Trash2,
  ActivityIcon,
  type LucideIcon,
} from 'lucide-react-native'

import { useAuthUser } from '@/lib/auth-context'
import { useActivities, ActivityAction } from '@/services/activity'
import { cn } from '@/lib/utils'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { IconTile } from '@/components/ui/icon-tile'
import { SectionLabel } from '@/components/ui/section-label'

import type { AcitivityLog } from '@/services/activity'
import type { User as AuthUser } from '@/lib/auth'

type Part = { text: string; muted?: boolean }
type Kind = 'expense' | 'payment' | 'group' | 'account'
type Tone = 'default' | 'payment' | 'member' | 'danger'
type LogConfig = { icon: LucideIcon; parts: Part[]; kind: Kind; tone: Tone }

const FILTERS: { value: 'all' | Kind; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expenses' },
  { value: 'payment', label: 'Payments' },
  { value: 'group', label: 'Groups & friends' },
  { value: 'account', label: 'Account' },
]

const TONE_CLASSES: Record<Tone, { tile: string; icon: string }> = {
  default: { tile: '', icon: '' },
  payment: { tile: 'bg-owed/10', icon: 'text-owed' },
  member: { tile: 'bg-tint-2', icon: 'text-tint-2-foreground' },
  danger: { tile: 'bg-destructive/10', icon: 'text-destructive' },
}

// muted connective text vs. emphasized names
const m = (text: string): Part => ({ text, muted: true })
const b = (text?: string): Part => ({ text: text ?? '' })

const getLogConfig = (activity: AcitivityLog, currentUserId?: string): LogConfig | null => {
  const group = activity.snapshot?.group
  const transaction = activity.snapshot?.transaction
  const who = (u?: AuthUser | null) => (u?.id === currentUserId ? 'You' : u?.name)

  switch (activity.action) {
    case ActivityAction.USER_REGISTERED:
      return {
        icon: User,
        kind: 'account',
        tone: 'default',
        parts: [b('You registered to FairShare')],
      }
    case ActivityAction.USER_CHANGED_PASSWORD:
      return {
        icon: UserLock,
        kind: 'account',
        tone: 'default',
        parts: [b('You changed your password')],
      }
    case ActivityAction.USER_UPDATED_PROFILE:
      return {
        icon: UserCog,
        kind: 'account',
        tone: 'default',
        parts: [b('You updated your profile')],
      }
    case ActivityAction.GROUP_CREATED:
      return {
        icon: Users,
        kind: 'group',
        tone: 'member',
        parts: [m('You created '), b(group?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_SENT:
      return currentUserId === activity.user.id
        ? {
            icon: GitPullRequestArrow,
            kind: 'group',
            tone: 'member',
            parts: [m('You sent a friend request to '), b(activity.targetUser?.name)],
          }
        : {
            icon: GitPullRequestArrow,
            kind: 'group',
            tone: 'member',
            parts: [m('You received a friend request from '), b(activity.user?.name)],
          }
    case ActivityAction.FRIENDSHIP_REQUEST_CANCELLED:
      return {
        icon: GitPullRequestClosed,
        kind: 'group',
        tone: 'default',
        parts: [m('You cancelled friend request to '), b(activity.user?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_REJECTED:
      return {
        icon: GitPullRequestDraft,
        kind: 'group',
        tone: 'default',
        parts: [m('You rejected friend request from '), b(activity.targetUser?.name)],
      }
    case ActivityAction.FRIENDSHIP_REQUEST_ACCEPTED:
      return {
        icon: GitPullRequest,
        kind: 'group',
        tone: 'member',
        parts: [b(activity.targetUser?.name), m(' accepted your friend request')],
      }
    case ActivityAction.FRIENDSHIP_REMOVED:
      return {
        icon: GitPullRequest,
        kind: 'group',
        tone: 'default',
        parts: [m('You removed '), b(activity.user?.name), m(' from your friends')],
      }
    case ActivityAction.GROUP_INVITATION_SENT:
      return {
        icon: UserSearch,
        kind: 'group',
        tone: 'member',
        parts: [
          b(who(activity.user)),
          m(' invited '),
          b(who(activity.targetUser)),
          m(' to join '),
          b(group?.name),
        ],
      }
    case ActivityAction.GROUP_INVITATION_REJECTED:
      return {
        icon: UserSearch,
        kind: 'group',
        tone: 'default',
        parts: [b(who(activity.user)), m(' declined the invitation to '), b(group?.name)],
      }
    case ActivityAction.GROUP_INVITATION_ACCEPTED:
      return {
        icon: UserPlus,
        kind: 'group',
        tone: 'member',
        parts: [b(who(activity.user)), m(' accepted the invitation to '), b(group?.name)],
      }
    case ActivityAction.GROUP_UPDATED:
      return {
        icon: Users,
        kind: 'group',
        tone: 'default',
        parts: [b(who(activity.user)), m(' updated '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_REMOVED:
      return {
        icon: UserMinus,
        kind: 'group',
        tone: 'danger',
        parts: [b(who(activity.targetUser)), m(' removed from '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_JOINED:
      return {
        icon: UserPlus,
        kind: 'group',
        tone: 'member',
        parts: [b(who(activity.user)), m(' joined '), b(group?.name)],
      }
    case ActivityAction.GROUP_MEMBER_LEFT:
      return {
        icon: UserMinus,
        kind: 'group',
        tone: 'default',
        parts: [b(who(activity.user)), m(' left '), b(group?.name)],
      }
    case ActivityAction.GROUP_DELETED:
      return {
        icon: Trash2,
        kind: 'group',
        tone: 'danger',
        parts: [b(group?.name), m(' was deleted')],
      }
    case ActivityAction.TRANSACTION_CREATED:
      return {
        icon: ReceiptText,
        kind: 'expense',
        tone: 'default',
        parts: [
          b(who(activity.user)),
          m(' added '),
          b(transaction?.description),
          m(' to '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_UPDATED:
      return {
        icon: ReceiptText,
        kind: 'expense',
        tone: 'default',
        parts: [
          b(who(activity.user)),
          m(' updated '),
          b(transaction?.description),
          m(' in '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_DELETED:
      return {
        icon: Trash2,
        kind: 'expense',
        tone: 'danger',
        parts: [
          b(who(activity.user)),
          m(' deleted '),
          b(transaction?.description),
          m(' from '),
          b(group?.name),
        ],
      }
    case ActivityAction.TRANSACTION_SETTLED:
      return {
        icon: Handshake,
        kind: 'payment',
        tone: 'payment',
        parts: [
          b('You '),
          m('and '),
          b(activity.targetUser?.name),
          m(' settled up in '),
          b(group?.name),
        ],
      }
    default:
      return null
  }
}

// Several adds or deletes in a row by one person in one group read as one line
const GROUPABLE = new Set([ActivityAction.TRANSACTION_CREATED, ActivityAction.TRANSACTION_DELETED])

type Entry = { key: string; items: AcitivityLog[]; config: LogConfig }
type Section = { title: string; data: Entry[] }

function sectionTitle(date: Date) {
  return format(date, isSameYear(date, new Date()) ? 'EEE, d MMM' : 'EEE, d MMM yyyy')
}

export default function ActivityScreen() {
  const user = useAuthUser()
  const [filter, setFilter] = useState<'all' | Kind>('all')
  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useActivities()

  // group by day (assumes the API returns newest first), then collapse runs
  const sections = useMemo<Section[]>(() => {
    const items = data?.pages.flatMap(page => page.data) ?? []
    const map = new Map<string, Entry[]>()

    for (const item of items) {
      const config = getLogConfig(item, user.id)
      if (!config || (filter !== 'all' && config.kind !== filter)) continue

      const title = sectionTitle(new Date(item.createdAt))
      const entries = map.get(title) ?? []
      const last = entries.at(-1)?.items[0]

      if (
        last &&
        GROUPABLE.has(item.action) &&
        last.action === item.action &&
        last.userId === item.userId &&
        last.groupId === item.groupId
      ) {
        entries.at(-1)!.items.push(item)
      } else {
        entries.push({ key: String(item.id), items: [item], config })
      }
      map.set(title, entries)
    }

    return Array.from(map, ([title, data]) => ({ title, data }))
  }, [data, filter, user.id])

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={entry => entry.key}
      stickySectionHeadersEnabled={false}
      contentContainerClassName='px-4 pb-8'
      refreshing={isRefetching}
      onRefresh={refetch}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      ListHeaderComponent={
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='-mx-4 py-2'
          contentContainerClassName='gap-2 px-4'
          accessibilityRole='tablist'
        >
          {FILTERS.map(f => (
            <Button
              key={f.value}
              size='sm'
              variant={filter === f.value ? 'default' : 'outline'}
              className='rounded-full'
              accessibilityState={{ selected: filter === f.value }}
              onPress={() => setFilter(f.value)}
            >
              <Text>{f.label}</Text>
            </Button>
          ))}
        </ScrollView>
      }
      ListEmptyComponent={
        <Empty
          title={filter === 'all' ? 'No activity yet' : 'Nothing here'}
          icon={ActivityIcon}
          description={
            filter === 'all'
              ? 'Expenses, payments and group changes will show up here.'
              : hasNextPage
                ? 'Nothing in what has loaded so far. Pull down or scroll to load more.'
                : 'No activity of this type yet.'
          }
        />
      }
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className='py-4' /> : undefined}
      renderSectionHeader={({ section }) => (
        <SectionLabel className='bg-background pt-5 pb-2'>{section.title}</SectionLabel>
      )}
      renderItem={({ item: entry }) => <ActivityRow entry={entry} currentUserId={user.id} />}
      ItemSeparatorComponent={() => <View className='h-1' />}
    />
  )
}

function ActivityRow({ entry, currentUserId }: { entry: Entry; currentUserId: string }) {
  const { items, config } = entry
  const first = items[0]
  const tone = TONE_CLASSES[config.tone]

  // newest first, so the run spans from the last item's time to the first's
  const time = format(new Date(first.createdAt), 'HH:mm')
  const startTime = format(new Date(items.at(-1)!.createdAt), 'HH:mm')

  let parts = config.parts
  let detail: string | null = null

  if (items.length > 1) {
    const actor = first.userId === currentUserId ? 'You' : first.user?.name
    const verb = first.action === ActivityAction.TRANSACTION_CREATED ? ' added ' : ' deleted '
    const prep = first.action === ActivityAction.TRANSACTION_CREATED ? ' to ' : ' from '
    parts = [
      b(actor),
      m(verb),
      b(`${items.length} expenses`),
      m(prep),
      b(first.snapshot?.group?.name),
    ]
    const names = items.map(i => i.snapshot?.transaction?.description).filter(Boolean)
    detail =
      names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3}` : names.join(', ')
  }

  return (
    <View className='flex-row gap-3 py-2'>
      <IconTile
        as={config.icon}
        className={cn('size-10 rounded-sm', tone.tile)}
        iconClassName={cn('size-5', tone.icon)}
      />
      <View className='flex-1'>
        <Text className='leading-5'>
          {parts.map((part, i) => (
            <Text key={i} className={part.muted ? 'text-muted-foreground' : 'font-semibold'}>
              {part.text}
            </Text>
          ))}
        </Text>
        <Text className='text-muted-foreground mt-0.5 text-sm' numberOfLines={1}>
          {startTime !== time ? `${startTime}–${time}` : time}
          {detail ? ` · ${detail}` : ''}
        </Text>
      </View>
    </View>
  )
}
