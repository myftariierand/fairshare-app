import { useMemo } from 'react'
import { Platform, RefreshControl, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNowStrict } from 'date-fns'
import { InboxIcon, PlusIcon, TagIcon } from 'lucide-react-native'

import { useAuthUser } from '@/lib/auth-context'
import { computeBalances } from '@/lib/balances'
import { computeMonthlyStats, type MonthlyStats } from '@/lib/home-stats'
import { cn, formatAmount, transactionCategories } from '@/lib/utils'
import { useActivities } from '@/services/activity'
import { getGroups, useGetGroupInvitesQuery } from '@/services/group'
import { useGetProfileQuery } from '@/services/profile'

import { GroupInviteStatus } from '@/types/common'
import type { Group as ProfileGroup } from '@/types/common'
import { TransactionType, type Group } from '@/types/group'

import { Amount, SETTLED_EPSILON } from '@/components/ui/amount'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { IconTile } from '@/components/ui/icon-tile'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { ListRow } from '@/components/ui/list-row'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import { ActivityLine, getLogConfig } from '@/components/activity-log'
import { BalanceSummary } from '@/components/balance-summary'
import { BugReportHint } from '@/components/bug-report-hint'
import { GroupAvatar } from '@/components/group/group-avatar'
import { HeaderIconButton } from '@/components/header-icon-button'

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const isActive = (group: Group) => group._count.transactions === 0 || group.remainingDebts > 0

// The group you're most likely to want next: the active one with the newest
// expense, or the newest group of all when nothing is open
function pickActiveGroup(groups: Group[], details: ProfileGroup[]) {
  const lastUsed = (group: Group) => {
    const txns = details.find(d => d.id === group.id)?.transactions ?? []
    return Math.max(
      new Date(group.createdAt).getTime(),
      ...txns.map(tx => new Date(tx.createdAt).getTime())
    )
  }
  const byRecent = [...groups].sort((a, b) => lastUsed(b) - lastUsed(a))
  const active = byRecent.find(isActive)
  return { group: active ?? byRecent[0], active: Boolean(active) }
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const user = useAuthUser()

  const profile = useGetProfileQuery()
  const groups = useQuery({ queryKey: ['groups'], queryFn: getGroups })
  const activities = useActivities()
  const { data: invites } = useGetGroupInvitesQuery({ status: GroupInviteStatus.pending })

  const stats = useMemo(
    () => (profile.data ? computeMonthlyStats(profile.data.id, profile.data.groups) : null),
    [profile.data]
  )

  const recent = useMemo(
    () =>
      (activities.data?.pages[0]?.data ?? [])
        .map(item => ({ item, config: getLogConfig(item, user.id) }))
        .filter(entry => entry.config !== null)
        .slice(0, 3),
    [activities.data, user.id]
  )

  const refreshing = profile.isRefetching || groups.isRefetching || activities.isRefetching
  const refresh = () => {
    void profile.refetch()
    void groups.refetch()
    void activities.refetch()
  }

  const details = profile.data?.groups ?? []
  const featured = groups.data?.length ? pickActiveGroup(groups.data, details) : null
  const isNewUser = groups.data?.length === 0

  return (
    // No header on this tab. iOS adds the safe areas itself (automatic insets, which
    // also clear the tab bar); Android needs the status bar offset by hand.
    <ScrollView
      contentInsetAdjustmentBehavior='automatic'
      contentContainerClassName='gap-6 px-4 pb-28'
      contentContainerStyle={{ paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <View className='flex-row items-center gap-3'>
        <InitialsAvatar name={user.name} className='size-11' />
        <View className='flex-1'>
          <Text className='text-muted-foreground text-sm'>
            {isNewUser ? 'Welcome' : greeting()}
          </Text>
          <Text className='text-2xl font-bold tracking-tight' numberOfLines={1}>
            {user.name.split(' ')[0]}
          </Text>
        </View>
        <HeaderIconButton
          href='/groups/invites'
          icon={InboxIcon}
          label='Group invites'
          count={invites?.length ?? 0}
        />
      </View>

      <BugReportHint />

      {isNewUser ? (
        <GetStarted />
      ) : (
        <>
          {profile.data && (
            <BalanceSummary
              userId={profile.data.id}
              transactions={details.flatMap(g => g.transactions)}
            />
          )}

          {featured && (
            <View className='gap-2.5'>
              <View className='flex-row items-center justify-between'>
                <SectionLabel>{featured.active ? 'Active group' : 'Latest group'}</SectionLabel>
                <Link asChild href='/groups'>
                  <Button variant='link' size='sm' className='h-auto px-0'>
                    <Text>All groups</Text>
                  </Button>
                </Link>
              </View>
              <ActiveGroupCard
                group={featured.group}
                details={details.find(d => d.id === featured.group.id)}
                userId={user.id}
              />
            </View>
          )}

          {stats && <MonthStats stats={stats} />}

          {recent.length > 0 && (
            <View>
              <View className='flex-row items-center justify-between'>
                <SectionLabel>Recent activity</SectionLabel>
                <Link asChild href='/activity'>
                  <Button variant='link' size='sm' className='h-auto px-0'>
                    <Text>See all</Text>
                  </Button>
                </Link>
              </View>
              {recent.map(({ item, config }) => (
                <ActivityLine
                  key={item.id}
                  config={config!}
                  meta={formatDistanceToNowStrict(item.createdAt, { addSuffix: true })}
                />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

function ActiveGroupCard({
  group,
  details,
  userId,
}: {
  group: Group
  details?: ProfileGroup
  userId: string
}) {
  const txns = details?.transactions ?? []
  const net = computeBalances(userId, txns).net
  const lastExpense = txns
    .filter(tx => tx.type === TransactionType.expense)
    .reduce<(typeof txns)[number] | undefined>(
      (latest, tx) => (!latest || tx.createdAt > latest.createdAt ? tx : latest),
      undefined
    )

  const members = `${group._count.members} member${group._count.members === 1 ? '' : 's'}`
  const debts = group.remainingDebts
  const status =
    group._count.transactions === 0
      ? 'No expenses yet'
      : debts > 0
        ? `${debts} open debt${debts === 1 ? '' : 's'}`
        : 'All settled'

  return (
    <Card className='gap-4 p-4'>
      <Link asChild href={`/groups/${group.id}`}>
        <ListRow
          className='py-0'
          title={group.name}
          subtitle={`${members} · ${status}`}
          leading={<GroupAvatar name={group.name} cover={group.cover} />}
          showChevron
        />
      </Link>

      {group._count.transactions > 0 && (
        <View className='flex-row gap-2.5'>
          <View className='bg-secondary flex-1 rounded-lg p-3'>
            <Text className='text-muted-foreground text-xs'>
              {net > SETTLED_EPSILON
                ? 'Owed to you'
                : net < -SETTLED_EPSILON
                  ? 'You owe'
                  : 'Your balance'}
            </Text>
            <Amount
              value={net}
              currency={group.currency}
              tone='balance'
              className='mt-0.5 font-semibold'
            />
          </View>
          {lastExpense && (
            <View className='bg-secondary flex-1 rounded-lg p-3'>
              <Text className='text-muted-foreground text-xs'>Last expense</Text>
              <Text className='mt-0.5 font-semibold' numberOfLines={1}>
                {lastExpense.description} ·{' '}
                {formatDistanceToNowStrict(lastExpense.createdAt, { addSuffix: true })}
              </Text>
            </View>
          )}
        </View>
      )}

      <View className='flex-row gap-2.5'>
        <Link asChild href={`/groups/${group.id}/add-expense`}>
          <Button className='flex-1'>
            <Icon as={PlusIcon} className='text-primary-foreground size-4' />
            <Text>Add expense</Text>
          </Button>
        </Link>
        {debts > 0 && (
          <Link asChild href={`/groups/${group.id}?tab=debts`}>
            <Button variant='outline' className='flex-1'>
              <Text>Settle up</Text>
            </Button>
          </Link>
        )}
      </View>
    </Card>
  )
}

function MonthStats({ stats }: { stats: MonthlyStats }) {
  const { currency, months } = stats
  const category = stats.topCategory
    ? transactionCategories[stats.topCategory.category as keyof typeof transactionCategories]
    : undefined
  const max = Math.max(...months.map(month => month.total))

  return (
    <View className='gap-2.5'>
      <SectionLabel>This month · {currency}</SectionLabel>
      <View className='flex-row gap-2.5'>
        <StatTile
          label='Your spending'
          hint={
            stats.change === null
              ? 'Your share of expenses'
              : `${stats.change >= 0 ? '↑' : '↓'} ${Math.round(Math.abs(stats.change) * 100)}% vs last month`
          }
        >
          <Amount value={stats.spent} currency={currency} className='text-xl font-semibold' />
        </StatTile>
        <StatTile
          label='Expenses'
          hint={`in ${stats.groups} group${stats.groups === 1 ? '' : 's'}`}
        >
          <Text className='font-mono text-xl font-semibold tabular-nums'>{stats.expenses}</Text>
        </StatTile>
      </View>
      {(stats.topCategory || stats.topPartner) && (
        <View className='flex-row gap-2.5'>
          {stats.topCategory && (
            <StatTile
              label='Top category'
              hint={`${Math.round(stats.topCategory.share * 100)}% of your share`}
            >
              <View className='flex-row items-center gap-2'>
                <IconTile as={category?.icon ?? TagIcon} size='sm' />
                <Text className='flex-1 font-semibold' numberOfLines={1}>
                  {category?.label ?? 'Other'}
                </Text>
              </View>
            </StatTile>
          )}
          {stats.topPartner && (
            <StatTile
              label='Split most with'
              hint={`${stats.topPartner.count} shared expense${stats.topPartner.count === 1 ? '' : 's'}`}
            >
              <View className='flex-row items-center gap-2'>
                <InitialsAvatar
                  name={stats.topPartner.name}
                  className='size-8'
                  textClassName='text-xs'
                />
                <Text className='flex-1 font-semibold' numberOfLines={1}>
                  {stats.topPartner.name.split(' ')[0]}
                </Text>
              </View>
            </StatTile>
          )}
        </View>
      )}

      {max > 0 && (
        <Card className='gap-4 p-4'>
          <Text className='font-semibold'>Your share, last 6 months</Text>
          <View
            accessible
            accessibilityLabel={`Monthly spending: ${months
              .map(month => `${month.label} ${formatAmount(month.total, currency)}`)
              .join(', ')}`}
            className='flex-row gap-2.5'
          >
            {months.map((month, i) => {
              const current = i === months.length - 1
              return (
                <View key={month.label} className='flex-1 items-center gap-1.5'>
                  <View className='h-20 w-full justify-end'>
                    <View
                      className={cn(
                        'w-full rounded-md',
                        current ? 'bg-primary' : 'bg-muted-foreground/25'
                      )}
                      style={{ height: Math.max(4, (month.total / max) * 80) }}
                    />
                  </View>
                  <Text
                    className={cn('text-xs', current ? 'font-semibold' : 'text-muted-foreground')}
                  >
                    {month.label}
                  </Text>
                </View>
              )
            })}
          </View>
        </Card>
      )}
    </View>
  )
}

function StatTile({
  label,
  hint,
  children,
}: {
  label: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <Card className='flex-1 gap-1.5 p-3.5'>
      <Text className='text-muted-foreground text-sm'>{label}</Text>
      {children}
      <Text className='text-muted-foreground text-xs' numberOfLines={1}>
        {hint}
      </Text>
    </Card>
  )
}

const STEPS = [
  { title: 'Create a group', subtitle: 'A trip, a flat, a dinner' },
  { title: 'Invite your friends', subtitle: 'Share a link or add them by email' },
  { title: 'Add an expense', subtitle: 'We work out who owes what' },
]

function GetStarted() {
  return (
    <Card className='gap-1 p-5'>
      <SectionLabel>Get started</SectionLabel>
      <Text className='mt-1 text-xl font-bold tracking-tight'>Split your first bill</Text>
      <Text className='text-muted-foreground text-sm'>
        Your active group, balances and monthly stats will show up here.
      </Text>
      <View className='my-2'>
        {STEPS.map((step, i) => (
          <View key={step.title}>
            {i > 0 && <Separator />}
            <View className='flex-row items-center gap-3 py-3'>
              <View
                className={cn(
                  'size-7 items-center justify-center rounded-full border',
                  i === 0 ? 'bg-primary border-primary' : 'border-border'
                )}
              >
                <Text
                  className={cn(
                    'font-mono text-xs font-semibold',
                    i === 0 ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {i + 1}
                </Text>
              </View>
              <View className='flex-1'>
                <Text className='font-semibold'>{step.title}</Text>
                <Text className='text-muted-foreground text-sm'>{step.subtitle}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      <View className='gap-2.5'>
        <Link asChild href='/groups/new'>
          <Button>
            <Icon as={PlusIcon} className='text-primary-foreground size-4' />
            <Text>Create a group</Text>
          </Button>
        </Link>
        <Link asChild href='/groups/invites'>
          <Button variant='outline'>
            <Text>I have an invite</Text>
          </Button>
        </Link>
      </View>
    </Card>
  )
}
