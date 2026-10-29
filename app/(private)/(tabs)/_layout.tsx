import '@/global.css'
import { useMemo } from 'react'
import { Platform } from 'react-native'
import { router } from 'expo-router'
import { NativeTabs } from 'expo-router/native-tabs'
import { useCSSVariable } from 'uniwind'

import { useAuthUser } from '@/lib/auth-context'
import { useGetFriendRequestsQuery } from '@/services/friends'
import { useGetGroupInvitesQuery } from '@/services/group'
import { GroupInviteStatus } from '@/types/common'

// Badges are rendered only when there's something to count: with any text, including
// "0", the native badge shows and its `hidden` prop is ignored
const badge = (count: number) => (count > 9 ? '9+' : String(count))

// #rrggbb plus an alpha byte; other formats come back unchanged
const withAlpha = (hex: string, alpha: number) =>
  /^#[0-9a-f]{6}$/i.test(hex)
    ? hex +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0')
    : hex

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

  // Stable objects: native tabs re-apply the whole bar appearance whenever these change
  const iconColor = useMemo(
    () => ({ default: mutedForeground, selected: primary }),
    [mutedForeground, primary]
  )
  const labelStyle = useMemo(() => ({ fontFamily: 'Geist' }), [])
  const indicatorColor = useMemo(() => withAlpha(primary, 0.16), [primary])

  return (
    <NativeTabs
      tintColor={primary}
      iconColor={iconColor}
      labelStyle={labelStyle}
      // Android: the selected pill is a soft accent tint instead of the wallpaper-based
      // system color, and no ripple, which flashed in that system color on every tap
      indicatorColor={indicatorColor}
      rippleColor='transparent'
      // iOS draws its own glass bar; Android gets the card color
      backgroundColor={Platform.OS === 'android' ? card : undefined}
      minimizeBehavior='onScrollDown'
      // Android's Material bar labels only the selected tab unless told otherwise
      labelVisibilityMode='labeled'
    >
      <NativeTabs.Trigger name='(groups)'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.3', selected: 'person.3.fill' }}
          md='groups'
        />
        <NativeTabs.Trigger.Label>Groups</NativeTabs.Trigger.Label>
        {pendingInvites > 0 && (
          <NativeTabs.Trigger.Badge>{badge(pendingInvites)}</NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name='(friends)'>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          md='group'
        />
        <NativeTabs.Trigger.Label>Friends</NativeTabs.Trigger.Label>
        {incomingRequests > 0 && (
          <NativeTabs.Trigger.Badge>{badge(incomingRequests)}</NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>

      {/* Never selected: the tap is turned off natively and opens the "Add expense to…" sheet */}
      <NativeTabs.Trigger
        name='add'
        disabled
        accessibilityLabel='Add expense'
        listeners={{ tabPress: () => router.push('/new-expense') }}
      >
        <NativeTabs.Trigger.Icon sf='plus.circle.fill' md='add_circle' />
        {/* Icon only; screen readers use the accessibility label */}
        <NativeTabs.Trigger.Label hidden />
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
