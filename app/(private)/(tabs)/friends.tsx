import { View, FlatList, RefreshControl } from 'react-native'

import { useGetFriendRequestsQuery, useGetFriendsQuery } from '@/services/friends'

import { ContactIcon, InboxIcon, UserPlusIcon } from 'lucide-react-native'
import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Link, Tabs } from 'expo-router'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import RemoveFriendDialog from '@/components/friend/remove-friend-dialog'

export default function FriendsScreen() {
  const { data, isRefetching, refetch } = useGetFriendsQuery()
  const { data: requests } = useGetFriendRequestsQuery()

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => {
            return (
              <>
                <Link asChild href={'/friends/add'}>
                  <Button size={'sm'} variant={'secondary'} className='mr-2'>
                    <Icon as={UserPlusIcon} />
                    <Text>Add Friend</Text>
                  </Button>
                </Link>
                <Link asChild href={'/friends/requests'}>
                  <Button size={'icon'} variant={'secondary'} className='size-8'>
                    <Icon as={InboxIcon} />
                    {!!requests?.length && (
                      <Badge
                        className='absolute -top-2 -right-2 h-4 w-4 p-0'
                        variant={'destructive'}
                      >
                        <Text className='text-xs'>1</Text>
                      </Badge>
                    )}
                  </Button>
                </Link>
              </>
            )
          },
          headerRightContainerStyle: { paddingRight: 16 },
        }}
      />
      <FlatList
        className='flex-1'
        data={data}
        keyExtractor={g => g.id}
        contentContainerClassName='gap-3 p-4'
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <Empty
            title='No Friends'
            icon={ContactIcon}
            description='Add friends by tapping in Add Friend button, searching and sending requests.'
          />
        }
        renderItem={({ item }) => (
          <View className='flex-row items-center'>
            <Avatar alt={item.name}>
              <AvatarFallback className='border-border border'>
                <Text>{item.name.slice(0, 2)}</Text>
              </AvatarFallback>
            </Avatar>
            <View className='ml-3 flex-1'>
              <Text className='flex items-center gap-1 font-semibold'>{item.name}</Text>
              <Text className='text-muted-foreground text-xs'>{item.email}</Text>
            </View>
            <RemoveFriendDialog friend={item} />
          </View>
        )}
      />
    </>
  )
}
