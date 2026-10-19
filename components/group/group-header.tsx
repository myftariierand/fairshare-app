import { View, Image, Settings } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { format } from 'date-fns'

import { DotIcon, SettingsIcon, UserPlusIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Link } from 'expo-router'

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
    <View style={{ marginTop: insets.top }} className='flex-row items-center gap-2 p-2'>
      {cover && (
        <Image
          src={`${process.env.EXPO_PUBLIC_IMG_URL}/c_fill,w_400,h_400,g_auto,f_auto,q_auto/${cover}`}
          alt='group cover'
          className='size-12 rounded object-cover'
        />
      )}
      <View className='flex-1'>
        <Text className='text-lg'>{title}</Text>
        <View className='flex-row items-center'>
          <Text className='text-xs'>{format(createdAt, 'dd MMMM yyyy')}</Text>
          <Icon as={DotIcon} />
          <Text className='text-xs'>{members} people</Text>
        </View>
      </View>
      <Link asChild href={`/groups/${id}/invite-member`}>
        <Button size={'icon'} variant={'ghost'}>
          <Icon as={UserPlusIcon} />
        </Button>
      </Link>
      <Link asChild href={`/groups/${id}/settings`}>
        <Button size={'icon'} variant={'ghost'}>
          <Icon as={SettingsIcon} />
        </Button>
      </Link>
    </View>
  )
}
