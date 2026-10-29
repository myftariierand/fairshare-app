import '@/global.css'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import { NativeTabs } from 'expo-router/native-tabs'
import { useCSSVariable } from 'uniwind'

import { useAuthUser } from '@/lib/auth-context'
import { useGetFriendRequestsQuery } from '@/services/friends'
import { useGetGroupInvitesQuery } from '@/services/group'
import { GroupInviteStatus } from '@/types/common'

const badge = (count: number) => (count > 9 ? '9+' : String(count))

// Native tab bar: UITabBarController on iOS (glass on iOS 26), Material bottom
// navigation on Android. Each tab folder has its own Stack for its header.
export default function TabsLayout() {
  const user = useAuthUser()
  const [primary, mutedForeground, card] = useCSSVariable([
    '--color-primary',
    '--color-muted-foreground',
    '--color-card',
  ]) as string[]

  const { data: invites } = useGetGroupInvitesQuery({ status: GroupInviteStatus.pending })
  const { data: requests } = useGetFriendRequestsQuery()
  const pendingInvites = invites?.length ?? 0
  const incomingRequests = requests?.filter(r => r.receiverId === user.id).length ?? 0

  return (
    <NativeTabs
      tintColor={primary}
      iconColor={{ default: mutedForeground, selected: primary }}
      labelStyle={{ fontFamily: 'Geist' }}
      // iOS draws its own glass bar; Android gets the card color
      backgroundColor={Platform.OS === 'android' ? card : undefined}
      minimizeBehavior='onScrollDown'
    >
      <NativeTabs.Trigger name='(groups)'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.3', selected: 'person.3.fill' }}
          md='groups'
        />
        <NativeTabs.Trigger.Label>Groups</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={!pendingInvites}>
          {badge(pendingInvites)}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='(friends)'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          md='group'
        />
        <NativeTabs.Trigger.Label>Friends</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={!incomingRequests}>
          {badge(incomingRequests)}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      {/* Never selected: the tap is turned off natively and opens the "Add expense to…" sheet */}
      <NativeTabs.Trigger
        name='add'
        disabled
        listeners={{ tabPress: () => router.push('/new-expense') }}
      >
        <NativeTabs.Trigger.Icon sf='plus.circle.fill' md='add_circle' />
        <NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='(activity)'>
        <NativeTabs.Trigger.Icon sf='clock.arrow.circlepath' md='history' />
        <NativeTabs.Trigger.Label>Activity</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='(profile)'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md='account_circle'
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
