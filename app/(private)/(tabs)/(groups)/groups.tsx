import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { Stack, Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

import { computeBalances } from '@/lib/balances'
import { getGroups } from '@/services/group'
import { useGetProfileQuery } from '@/services/profile'

import type { Group } from '@/types/group'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { BalanceChip } from '@/components/ui/balance-chip'
import { Card } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { ListRow } from '@/components/ui/list-row'
import { SectionLabel } from '@/components/ui/section-label'
import { PlusIcon, SearchIcon, UserGroupIcon } from 'lucide-react-native'

import { GroupAvatar } from '@/components/group/group-avatar'
import { HeaderIconButton } from '@/components/header-icon-button'
import { headerRightOptions } from '@/components/header-button'

export default function GroupsScreen() {
  const [settledGroupsOpen, setSettleGroupsOpen] = useState(true)
  const [query, setQuery] = useState('')

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  })
  const { data: profile } = useGetProfileQuery()

  // Your net balance in each group, from the transactions the profile carries
  const balances = useMemo(() => {
    const result = new Map<string, number>()
    if (!profile) return result
    for (const group of profile.groups) {
      result.set(group.id, computeBalances(profile.id, group.transactions).net)
    }
    return result
  }, [profile])

  if (isPending) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator />
      </View>
    )
  }

  if (isError) {
    return (
      <View className='flex-1 items-center justify-center gap-4 p-6'>
        <Text className='text-destructive'>{error.message}</Text>
        <Button onPress={() => refetch()}>
          <Text>Try again</Text>
        </Button>
      </View>
    )
  }

  const q = query.trim().toLowerCase()
  const groups = q ? data.filter(group => group.name.toLowerCase().includes(q)) : data
  const activeGroups = groups.filter(
    group => group._count.transactions === 0 || group.remainingDebts > 0
  )
  const settledGroups = groups.filter(
    group => group._count.transactions > 0 && group.remainingDebts === 0
  )

  return (
    <>
      <Stack.Screen
        options={headerRightOptions(
          <HeaderIconButton href='/groups/new' icon={PlusIcon} label='New group' />
        )}
      />
      <FlatList
        // Lets iOS collapse the large title and keep content clear of the tab bar
        contentInsetAdjustmentBehavior='automatic'
        className='flex-1'
        data={activeGroups}
        keyExtractor={g => g.id}
        contentContainerClassName='gap-2 px-4 pb-28'
        keyboardShouldPersistTaps='handled'
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
        ListHeaderComponent={
          <View className='gap-6 pt-2 pb-2'>
            {data.length > 0 && (
              <View>
                <Input
                  value={query}
                  onChangeText={setQuery}
                  placeholder='Search groups'
                  accessibilityLabel='Search groups'
                  autoCorrect={false}
                  clearButtonMode='while-editing'
                  className='h-12 pl-11'
                />
                {/* Drawn after the input so it sits on top of the field's background */}
                <View
                  pointerEvents='none'
                  className='absolute inset-y-0 left-0 w-11 items-center justify-center'
                >
                  <Icon as={SearchIcon} className='text-muted-foreground size-5' />
                </View>
              </View>
            )}
            {activeGroups.length > 0 && <SectionLabel>Active · {activeGroups.length}</SectionLabel>}
          </View>
        }
        ListEmptyComponent={
          data.length === 0 ? (
            <Empty
              title='No groups yet'
              icon={UserGroupIcon}
              description='Create a group for a trip, a flat or a night out, then add friends to it.'
            />
          ) : groups.length === 0 ? (
            <Text className='text-muted-foreground py-8 text-center'>
              No groups match “{query.trim()}”
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <ActiveGroupRow group={item} balance={balances.get(item.id) ?? 0} />
        )}
        ListFooterComponent={
          settledGroups.length > 0 ? (
            <View className='mt-6'>
              <View className='flex-row items-center justify-between'>
                <SectionLabel>Settled · {settledGroups.length}</SectionLabel>
                <Button
                  variant='ghost'
                  size='sm'
                  onPress={() => setSettleGroupsOpen(open => !open)}
                  accessibilityState={{ expanded: settledGroupsOpen }}
                >
                  <Text className='text-muted-foreground'>
                    {settledGroupsOpen ? 'Hide' : 'Show'}
                  </Text>
                </Button>
              </View>
              {settledGroupsOpen &&
                settledGroups.map(item => (
                  <Link key={item.id} asChild href={`/groups/${item.id}`}>
                    <ListRow
                      title={item.name}
                      subtitle={`${item._count.members} member${item._count.members === 1 ? '' : 's'} · ${format(item.createdAt, 'MMM yyyy')}`}
                      leading={<GroupAvatar name={item.name} cover={item.cover} />}
                      showChevron
                    />
                  </Link>
                ))}
            </View>
          ) : undefined
        }
      />
    </>
  )
}

function ActiveGroupRow({ group, balance }: { group: Group; balance: number }) {
  const debts = group.remainingDebts
  const status =
    group._count.transactions === 0
      ? 'No expenses yet'
      : `${debts} open debt${debts === 1 ? '' : 's'}`

  return (
    <Card className='px-3 py-0'>
      <Link asChild href={`/groups/${group.id}`}>
        <ListRow
          className='py-3'
          title={group.name}
          subtitle={`${group._count.members} member${group._count.members === 1 ? '' : 's'} · ${status}`}
          leading={<GroupAvatar name={group.name} cover={group.cover} />}
          trailing={
            group._count.transactions > 0 ? (
              <BalanceChip value={balance} currency={group.currency} />
            ) : undefined
          }
        />
      </Link>
    </Card>
  )
}
