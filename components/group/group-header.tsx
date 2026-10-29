import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { format } from 'date-fns'

import { ArrowLeftIcon, SlidersHorizontalIcon, UserPlusIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { GroupAvatar } from '@/components/group/group-avatar'
import ShareGroupDialog from '@/components/group/share-group-dialog'

export default function GroupHeader({
  id,
  title,
  createdAt,
  members,
  cover,
}: {
  id: string
  title: string
  createdAt: string
  members: number
  cover?: string
}) {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ paddingTop: insets.top + 8 }} className='bg-background gap-4 px-4 pb-2'>
      <View className='flex-row items-center gap-2'>
        <Button
          size='icon'
          variant='outline'
          accessibilityLabel='Back to groups'
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <Icon as={ArrowLeftIcon} />
        </Button>
        <View className='flex-1' />
        <ShareGroupDialog groupId={id} />
        <Link asChild href={`/groups/${id}/invite-member`}>
          <Button size='icon' variant='outline' accessibilityLabel='Invite a friend'>
            <Icon as={UserPlusIcon} />
          </Button>
        </Link>
        <Link asChild href={`/groups/${id}/settings`}>
          <Button size='icon' variant='outline' accessibilityLabel='Group settings'>
            <Icon as={SlidersHorizontalIcon} />
          </Button>
        </Link>
      </View>
      <View className='flex-row items-center gap-3'>
        <GroupAvatar name={title} cover={cover} className='size-14 rounded-xl' />
        <View className='flex-1'>
          <Text role='heading' className='text-2xl font-bold tracking-tight' numberOfLines={1}>
            {title}
          </Text>
          <Text className='text-muted-foreground text-sm'>
            {format(createdAt, 'd MMM yyyy')} · {members} member{members === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
    </View>
  )
}
