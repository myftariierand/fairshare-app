import { useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native'
import { Tabs, Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

import { getGroups, useGetGroupInvitesQuery } from '@/services/group'
import { useGetProfileQuery } from '@/services/profile'

import { GroupInviteStatus } from '@/types/common'
import type { Group } from '@/types/group'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Card } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { ListRow } from '@/components/ui/list-row'
import { SectionLabel } from '@/components/ui/section-label'
import { InboxIcon, PlusIcon, ReceiptTextIcon, UserGroupIcon } from 'lucide-react-native'

import { BalanceSummary } from '@/components/balance-summary'
import { GroupAvatar } from '@/components/group/group-avatar'
import { HeaderIconButton } from '@/components/header-icon-button'

export default function GroupsScreen() {
  const [settledGroupsOpen, setSettleGroupsOpen] = useState(true)

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  })
  const { data: invites } = useGetGroupInvitesQuery({ status: GroupInviteStatus.pending })
  const { data: profile } = useGetProfileQuery()

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

  const activeGroups = data.filter(
    group => group._count.transactions === 0 || group.remainingDebts > 0
  )
  const settledGroups = data.filter(
    group => group._count.transactions > 0 && group.remainingDebts === 0
  )

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <View className='flex-row gap-2'>
              <HeaderIconButton
                href='/groups/invites'
                icon={InboxIcon}
                label='Group invites'
                count={invites?.length ?? 0}
              />
              <HeaderIconButton href='/groups/new' icon={PlusIcon} label='New group' />
            </View>
          ),
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
      <FlatList
        className='flex-1'
        data={activeGroups}
        keyExtractor={g => g.id}
        contentContainerClassName='gap-2 px-4 pb-8'
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View className='gap-6 pt-2 pb-2'>
            {profile && (
              <BalanceSummary
                userId={profile.id}
                transactions={profile.groups.flatMap(g => g.transactions)}
              />
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
          ) : null
        }
        renderItem={({ item }) => <ActiveGroupRow group={item} />}
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
          ) : null
        }
      />
    </>
  )
}

function ActiveGroupRow({ group }: { group: Group }) {
  const debts = group.remainingDebts
  const status =
    group._count.transactions === 0
      ? 'No expenses yet'
      : `${debts} open debt${debts === 1 ? '' : 's'}`

  return (
    <Card className='flex-row items-center gap-0 py-0 pr-2 pl-3'>
      <Link asChild href={`/groups/${group.id}`}>
        <ListRow
          className='flex-1 py-3'
          title={group.name}
          subtitle={`${group._count.members} member${group._count.members === 1 ? '' : 's'} · ${status}`}
          leading={<GroupAvatar name={group.name} cover={group.cover} />}
        />
      </Link>
      <Link asChild href={`/groups/${group.id}/add-expense`}>
        <Button size='icon' variant='ghost' accessibilityLabel={`Add expense to ${group.name}`}>
          <Icon as={ReceiptTextIcon} className='text-primary' />
        </Button>
      </Link>
    </Card>
  )
}
