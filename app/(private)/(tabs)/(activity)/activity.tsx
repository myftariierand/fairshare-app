import { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, SectionList, View } from 'react-native'
import { format, isSameYear } from 'date-fns'
import { ActivityIcon } from 'lucide-react-native'

import { useAuthUser } from '@/lib/auth-context'
import { useActivities, ActivityAction } from '@/services/activity'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { SectionLabel } from '@/components/ui/section-label'
import {
  ActivityLine,
  b,
  getLogConfig,
  m,
  type Kind,
  type LogConfig,
} from '@/components/activity-log'

import type { AcitivityLog } from '@/services/activity'

const FILTERS: { value: 'all' | Kind; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expenses' },
  { value: 'payment', label: 'Payments' },
  { value: 'group', label: 'Groups & friends' },
  { value: 'account', label: 'Account' },
]

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
      // Lets iOS collapse the large title and keep content clear of the tab bar
      contentInsetAdjustmentBehavior='automatic'
      sections={sections}
      keyExtractor={entry => entry.key}
      stickySectionHeadersEnabled={false}
      contentContainerClassName='px-4 pb-28'
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
    <ActivityLine
      config={config}
      parts={parts}
      meta={`${startTime !== time ? `${startTime}–${time}` : time}${detail ? ` · ${detail}` : ''}`}
    />
  )
}
