import { FlatList, View } from 'react-native'
import { Stack } from 'expo-router'

import { useAuthUser } from '@/lib/auth-context'
import {
  useGetFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelFriendRequestMutation,
} from '@/services/friends'

import { Text } from '@/components/ui/text'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistance } from 'date-fns'
import { Icon } from '@/components/ui/icon'
import { ArrowDownLeftIcon, ArrowUpRightIcon, CheckIcon, XIcon } from 'lucide-react-native'
import { Button } from '@/components/ui/button'

export default function FriendRequestsScreen() {
  const { id } = useAuthUser()
  const { data } = useGetFriendRequestsQuery()
  const acceptRequest = useAcceptFriendRequestMutation()
  const rejectRequest = useRejectFriendRequestMutation()
  const cancelRequest = useCancelFriendRequestMutation()

  const now = new Date()

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9],
        }}
      />
      <View className='p-4'>
        <Text variant={'large'}>FRIEND REQUESTS</Text>
        <Text variant={'muted'} className='mb-4'>
          Check out your friend requests.
        </Text>
        <FlatList
          data={data}
          keyExtractor={u => u.id}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          renderItem={({ item }) => {
            return (
              <View className='flex-row items-center'>
                {/* <Avatar alt={item.name}>
                <AvatarFallback className='border-border border'>
                  <Text>{item.name.slice(0, 2)}</Text>
                </AvatarFallback>
              </Avatar> */}
                <View className='flex-1'>
                  <View className='flex-row items-center gap-1 font-semibold'>
                    {item.senderId === id ? (
                      <>
                        <Text>{item.receiver.name}</Text>
                        <Icon as={ArrowUpRightIcon} size={20} className='text-muted-foreground' />
                      </>
                    ) : (
                      <>
                        <Text>{item.sender.name}</Text>
                        <Icon as={ArrowDownLeftIcon} size={20} className='text-muted-foreground' />
                      </>
                    )}
                  </View>
                  <Text variant={'muted'} className='text-xs'>
                    {formatDistance(item.createdAt, now, {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
                {item.senderId === id ? (
                  <Button
                    size={'sm'}
                    variant={'outline'}
                    className='ml-auto'
                    disabled={cancelRequest.isPending}
                    onPress={() => cancelRequest.mutate(item.id)}
                  >
                    <Icon as={XIcon} className='text-destructive' />
                    <Text>Cancel</Text>
                  </Button>
                ) : (
                  <>
                    <Button
                      size={'sm'}
                      variant={'outline'}
                      className='ml-auto'
                      disabled={acceptRequest.isPending}
                      onPress={() => acceptRequest.mutate(item.id)}
                    >
                      <Icon as={CheckIcon} className='text-success' />
                      <Text>Accept</Text>
                    </Button>
                    <Button
                      size={'sm'}
                      variant={'outline'}
                      className='ml-1 size-8 px-0'
                      disabled={rejectRequest.isPending}
                      onPress={() => rejectRequest.mutate(item.id)}
                    >
                      <Icon as={XIcon} className='text-destructive' />
                    </Button>
                  </>
                )}
              </View>
            )
          }}
        />
      </View>
    </>
  )
}
