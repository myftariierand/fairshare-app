import { router, Stack } from 'expo-router'
import { View, FlatList } from 'react-native'
import { toast } from 'sonner-native'
import { useCSSVariable } from 'uniwind'

import {
  useAcceptGroupInviteMutation,
  useGetGroupInvitesQuery,
  useRejectGroupInviteMutation,
  type GroupInvite,
} from '@/services/group'

import { getErrorMessage } from '@/lib/utils'

import { GroupInviteStatus } from '@/types/common'

import { InboxIcon, XIcon } from 'lucide-react-native'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Empty } from '@/components/ui/empty'
import { SectionLabel } from '@/components/ui/section-label'
import { GroupAvatar } from '@/components/group/group-avatar'
import { Spinner } from '@/components/spinner'

export default function GroupInvitesScreen() {
  const card = useCSSVariable('--color-card') as string
  const { data = [], isPending } = useGetGroupInvitesQuery({ status: GroupInviteStatus.pending })

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9],
          // The sheet uses the card color so it reads as a layer above the screen
          contentStyle: { backgroundColor: card },
        }}
      />
      <FlatList
        className='bg-card flex-1'
        data={data}
        keyExtractor={item => item.id}
        contentContainerClassName='grow gap-3 px-5 pt-6 pb-10'
        ListHeaderComponent={
          <View className='gap-5'>
            <View className='flex-row items-start gap-3'>
              <View className='flex-1'>
                <Text role='heading' className='text-2xl font-bold tracking-tight'>
                  Invites
                </Text>
                <Text className='text-muted-foreground mt-1'>
                  Groups your friends have added you to.
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
            {data.length > 0 && <SectionLabel>Pending · {data.length}</SectionLabel>}
          </View>
        }
        renderItem={({ item }) => <InviteCard invite={item} />}
        ListFooterComponent={isPending ? undefined : <AllCaughtUp hasInvites={data.length > 0} />}
        ListFooterComponentClassName='grow'
      />
    </>
  )
}

function InviteCard({ invite }: { invite: GroupInvite }) {
  const acceptInvite = useAcceptGroupInviteMutation()
  const rejectInvite = useRejectGroupInviteMutation()
  const busy = acceptInvite.isPending || rejectInvite.isPending
  const members = invite.group._count?.members

  const handleAccept = async () => {
    try {
      await acceptInvite.mutateAsync({ groupId: invite.groupId, inviteId: invite.id })
      toast.success(`You joined ${invite.group.name}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleReject = async () => {
    try {
      await rejectInvite.mutateAsync({ inviteId: invite.id })
      toast.success('Invite declined')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <View className='bg-secondary border-border gap-4 rounded-xl border p-4'>
      <View className='flex-row items-center gap-3'>
        <GroupAvatar name={invite.group.name} cover={invite.group.cover} className='size-13' />
        <View className='flex-1'>
          <Text className='text-base font-semibold' numberOfLines={1}>
            {invite.group.name}
          </Text>
          <Text className='text-muted-foreground mt-0.5 text-sm' numberOfLines={1}>
            {invite.sender.name.split(' ')[0]} invited you
            {members ? ` · ${members} member${members === 1 ? '' : 's'}` : ''}
          </Text>
        </View>
      </View>
      <View className='flex-row gap-2.5'>
        <Button variant='outline' className='flex-1' disabled={busy} onPress={handleReject}>
          {rejectInvite.isPending ? <Spinner /> : <Text>Decline</Text>}
        </Button>
        <Button className='flex-1' disabled={busy} onPress={handleAccept}>
          {acceptInvite.isPending ? <Spinner /> : <Text>Join group</Text>}
        </Button>
      </View>
    </View>
  )
}

// Fills the rest of the sheet: the empty state when nothing is pending,
// or a quiet "that's all" under the last invite
function AllCaughtUp({ hasInvites }: { hasInvites: boolean }) {
  return (
    <Empty
      icon={InboxIcon}
      title={hasInvites ? "That's everything" : 'No invites right now'}
      description="New invites show up here, and we'll notify you."
      containerClassName='grow justify-center'
    />
  )
}
