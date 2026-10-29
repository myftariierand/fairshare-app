import { ScrollView, View } from 'react-native'
import { Stack, router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { useCSSVariable } from 'uniwind'
import { toast } from 'sonner-native'

import { useAuthUser } from '@/lib/auth-context'
import {
  useGetFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useCancelFriendRequestMutation,
} from '@/services/friends'
import { getErrorMessage } from '@/lib/utils'

import { UserPlusIcon, XIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { InitialsAvatar } from '@/components/ui/initials-avatar'
import { SectionLabel } from '@/components/ui/section-label'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/spinner'

type Request = NonNullable<ReturnType<typeof useGetFriendRequestsQuery>['data']>[number]

const ago = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: true })

export default function FriendRequestsScreen() {
  const { id } = useAuthUser()
  const card = useCSSVariable('--color-card') as string
  const { data = [], isPending } = useGetFriendRequestsQuery()

  const received = data.filter(r => r.receiverId === id)
  const sent = data.filter(r => r.senderId === id)

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9],
          // Same card-colored sheet as group invites and add friend
          contentStyle: { backgroundColor: card },
        }}
      />
      <ScrollView className='bg-card flex-1' contentContainerClassName='grow gap-6 px-5 pt-6 pb-10'>
        <View className='flex-row items-start gap-3'>
          <View className='flex-1'>
            <Text role='heading' className='text-2xl font-bold tracking-tight'>
              Friend requests
            </Text>
            <Text className='text-muted-foreground mt-1'>
              Accept requests to split costs with people.
            </Text>
          </View>
          <Button
            size='icon'
            variant='outline'
            accessibilityLabel='Close'
            onPress={() => router.back()}
          >
            <Icon as={XIcon} className='size-5' />
          </Button>
        </View>

        {received.length > 0 && (
          <View className='gap-3'>
            <SectionLabel>Received · {received.length}</SectionLabel>
            {received.map(request => (
              <ReceivedCard key={request.id} request={request} />
            ))}
          </View>
        )}

        {sent.length > 0 && (
          <View className='gap-1'>
            <SectionLabel>Sent · {sent.length}</SectionLabel>
            {sent.map((request, index) => (
              <View key={request.id}>
                {index > 0 && <Separator />}
                <SentRow request={request} />
              </View>
            ))}
          </View>
        )}

        {!isPending && data.length === 0 && (
          <Empty
            icon={UserPlusIcon}
            title='No friend requests'
            description='Requests you send or receive show up here.'
            containerClassName='grow justify-center'
          />
        )}
      </ScrollView>
    </>
  )
}

function ReceivedCard({ request }: { request: Request }) {
  const acceptRequest = useAcceptFriendRequestMutation()
  const rejectRequest = useRejectFriendRequestMutation()
  const busy = acceptRequest.isPending || rejectRequest.isPending
  const firstName = request.sender.name.split(' ')[0]

  const handleAccept = async () => {
    try {
      await acceptRequest.mutateAsync(request.id)
      toast.success(`You and ${firstName} are now friends`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDecline = async () => {
    try {
      await rejectRequest.mutateAsync(request.id)
      toast.success('Request declined')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <View className='bg-secondary border-border gap-4 rounded-xl border p-4'>
      <View className='flex-row items-center gap-3'>
        <InitialsAvatar name={request.sender.name} className='size-11' />
        <View className='flex-1'>
          <Text className='text-base font-semibold' numberOfLines={1}>
            {request.sender.name}
          </Text>
          <Text className='text-muted-foreground mt-0.5 text-sm' numberOfLines={1}>
            Wants to be friends · {ago(request.createdAt)}
          </Text>
        </View>
      </View>
      <View className='flex-row gap-2.5'>
        <Button variant='outline' className='flex-1' disabled={busy} onPress={handleDecline}>
          {rejectRequest.isPending ? <Spinner /> : <Text>Decline</Text>}
        </Button>
        <Button className='flex-1' disabled={busy} onPress={handleAccept}>
          {acceptRequest.isPending ? <Spinner /> : <Text>Accept</Text>}
        </Button>
      </View>
    </View>
  )
}

function SentRow({ request }: { request: Request }) {
  const cancelRequest = useCancelFriendRequestMutation()

  const handleCancel = async () => {
    try {
      await cancelRequest.mutateAsync(request.id)
      toast.success('Request cancelled')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <View className='min-h-16 flex-row items-center gap-3 py-2'>
      <InitialsAvatar name={request.receiver.name} className='size-11' />
      <View className='flex-1'>
        <Text className='font-semibold' numberOfLines={1}>
          {request.receiver.name}
        </Text>
        <Text className='text-muted-foreground text-sm' numberOfLines={1}>
          Sent {ago(request.createdAt)}
        </Text>
      </View>
      <Button
        size='sm'
        variant='outline'
        className='rounded-full px-4'
        disabled={cancelRequest.isPending}
        accessibilityLabel={`Cancel request to ${request.receiver.name}`}
        onPress={handleCancel}
      >
        {cancelRequest.isPending ? <Spinner /> : <Text className='text-sm'>Cancel</Text>}
      </Button>
    </View>
  )
}
