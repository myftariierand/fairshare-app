import { useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, View, Image } from 'react-native'
import { Tabs, Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { format, formatDistance } from 'date-fns'

import { getGroups, useGetGroupInvitesQuery } from '@/services/group'

import { GroupInviteStatus } from '@/types/common'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { EyeIcon, InboxIcon, PlusIcon } from 'lucide-react-native'
import { Badge } from '@/components/ui/badge'

export default function GroupsScreen() {
  const [settledGroupsOpen, setSettleGroupsOpen] = useState(true)

  const { data, isPending, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  })
  const { data: invites } = useGetGroupInvitesQuery({ status: GroupInviteStatus.pending })

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

  const now = new Date()
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
          title: 'Groups',
          headerRight: () => (
            <>
              <Link asChild href={'/groups/new'}>
                <Button size={'sm'} variant={'secondary'} className='mr-2'>
                  <Icon as={PlusIcon} />
                  <Text>Create Group</Text>
                </Button>
              </Link>
              <Link asChild href={'/groups/invites'}>
                <Button size={'icon'} variant={'secondary'} className='size-8'>
                  <Icon as={InboxIcon} />
                  {!!invites?.length && (
                    <Badge className='absolute -top-2 -right-2 h-4 w-4 p-0' variant={'destructive'}>
                      <Text className='text-xs'>1</Text>
                    </Badge>
                  )}
                </Button>
              </Link>
            </>
          ),
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
      <FlatList
        className='flex-1'
        data={activeGroups}
        keyExtractor={g => g.id}
        contentContainerClassName='gap-3 p-4'
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <Text className='text-muted-foreground text-center'>No active groups</Text>
        }
        renderItem={({ item }) => (
          <Card className='gap-0 p-0'>
            {!!item.cover && (
              <Image
                src={`${process.env.EXPO_PUBLIC_IMG_URL}/${item.cover}`}
                alt='active group cover'
                className='relative h-36 w-full rounded-xl object-cover'
              />
            )}
            <CardHeader className='p-4'>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>
                {format(item.createdAt, 'MMM dd, yyyy')} &bull; {item.remainingDebts} remaining
                debts
              </CardDescription>
            </CardHeader>
            <CardFooter className='gap-2 p-2 pt-0'>
              <Link asChild href={`/groups/${item.id}/add-expense`}>
                <Button variant='outline' className='flex-1'>
                  <Icon as={PlusIcon} />
                  <Text>Add Expense</Text>
                </Button>
              </Link>
              <Link asChild href={`/groups/${item.id}`}>
                <Button variant='outline' className='flex-1'>
                  <Icon as={EyeIcon} />
                  <Text>View Group</Text>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}
        ListFooterComponent={
          settledGroups.length > 0 ? (
            <Collapsible open={settledGroupsOpen} onOpenChange={setSettleGroupsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' className='w-full'>
                  <Text>
                    {settledGroupsOpen ? 'Hide' : 'View'} Settled Groups ({settledGroups.length})
                  </Text>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className='gap-2 pt-2'>
                {settledGroups.length === 0 ? (
                  <Text className='text-muted-foreground text-center'>No settled groups yet</Text>
                ) : (
                  settledGroups.map(item => (
                    <Link
                      key={item.id}
                      asChild
                      href={`/groups/${item.id}`}
                      className='h-auto w-full'
                    >
                      <Button variant='ghost' className='h-auto w-full items-center gap-4 p-1'>
                        <Image
                          className='size-12 shrink-0 rounded-lg'
                          src={
                            item.cover
                              ? `${process.env.EXPO_PUBLIC_IMG_URL}/c_fill,w_100,h_100,g_auto,f_auto,q_auto/${item.cover}`
                              : undefined
                          }
                        />
                        <View className='flex-1'>
                          <Text className='font-semibold'>{item.name}</Text>
                          <Text className='text-muted-foreground text-xs'>
                            {item._count.members} member(s)
                          </Text>
                        </View>
                        <Text className='text-muted-foreground text-xs'>
                          {formatDistance(item.createdAt, now, { addSuffix: true })}
                        </Text>
                      </Button>
                    </Link>
                  ))
                )}
              </CollapsibleContent>
            </Collapsible>
          ) : null
        }
      />
    </>
  )
}
