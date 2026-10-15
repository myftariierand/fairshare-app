import { View, FlatList, RefreshControl } from 'react-native'

import { useGetFriendsQuery } from '@/services/friends'

import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import RemoveFriendDialog from '@/components/friend/remove-friend-dialog'
import { Link, Tabs } from 'expo-router'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { InboxIcon, UserPlusIcon } from 'lucide-react-native'

export default function FriendsScreen() {
  const { data, isRefetching, refetch } = useGetFriendsQuery()

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => {
            return (
              <>
                <Link asChild href={'/friends/add'}>
                  <Button size={'sm'} className='mr-2'>
                    <Icon as={UserPlusIcon} />
                    <Text>Add Friend</Text>
                  </Button>
                </Link>
                <Link asChild href={'/friends/requests'}>
                  <Button size={'icon'} className='size-8'>
                    <Icon as={InboxIcon} />
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
          <Text className='text-muted-foreground text-center'>No active groups</Text>
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
