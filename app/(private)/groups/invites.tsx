import { Stack } from 'expo-router'
import { View, FlatList, Image } from 'react-native'
import { toast } from 'sonner-native'

import {
  useAcceptGroupInviteMutation,
  useGetGroupInvitesQuery,
  useRejectGroupInviteMutation,
} from '@/services/group'

import { getErrorMessage } from '@/lib/utils'

import { GroupInviteStatus } from '@/types/common'

import { CheckIcon, XIcon } from 'lucide-react-native'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Empty } from '@/components/ui/empty'

export default function GroupInvitesScreen() {
  const { data } = useGetGroupInvitesQuery({ status: GroupInviteStatus.pending })

  const acceptInvite = useAcceptGroupInviteMutation()
  const rejectInvite = useRejectGroupInviteMutation()

  const handleAccept = async (groupId: string, inviteId: string) => {
    try {
      await acceptInvite.mutateAsync({ groupId, inviteId })
      toast.success('Invite accepted!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleReject = async (inviteId: string) => {
    try {
      await rejectInvite.mutateAsync({ inviteId })
      toast.success('Invite rejected!')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

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
        <Text variant={'large'}>GROUP INVITES</Text>
        <Text variant={'muted'} className='mb-4'>
          Check out your group invites and join your friends.
        </Text>
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          ListEmptyComponent={
            <Empty
              title='No Invites'
              description='There seem to be no group invites for you at this moment.'
            />
          }
          renderItem={({ item }) => {
            return (
              <View className='flex-row items-center gap-2'>
                <Image
                  className='size-12 shrink-0 rounded-lg'
                  src={
                    item.group.cover
                      ? `${process.env.EXPO_PUBLIC_IMG_URL}/c_fill,w_100,h_100,g_auto,f_auto,q_auto/${item.group.cover}`
                      : undefined
                  }
                />
                <View className='shrink'>
                  <Text className='font-semibold'>{item.group.name}</Text>
                  <Text variant={'muted'} textBreakStrategy='balanced'>
                    {item.sender.name} invites you to join this group
                  </Text>
                </View>
                <Button
                  size={'sm'}
                  variant={'outline'}
                  className='ml-auto'
                  disabled={acceptInvite.isPending}
                  onPress={() => handleAccept(item.groupId, item.id)}
                >
                  <Icon as={CheckIcon} className='text-success' />
                  <Text>Join</Text>
                </Button>
                <Button
                  size={'sm'}
                  variant={'outline'}
                  className='ml-1 size-8 px-0'
                  disabled={rejectInvite.isPending}
                  onPress={() => handleReject(item.id)}
                >
                  <Icon as={XIcon} className='text-destructive' />
                </Button>
              </View>
            )
          }}
        />
      </View>
    </>
  )
}
