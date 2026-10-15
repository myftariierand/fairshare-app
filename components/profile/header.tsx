import { View } from 'react-native'

import type { User } from '@/lib/auth'

import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CalendarDaysIcon, MailIcon } from 'lucide-react-native'

export default function ProfileHeader({ user }: { user: User }) {
  const initials = user.name
    .split(' ')
    .map(s => s[0])
    .join('')
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  return (
    <Card>
      <CardContent className='flex-row items-start gap-4'>
        <View className='flex-row items-center gap-4'>
          <Avatar alt='user' className='size-14'>
            <AvatarFallback className='border-border border'>
              <Text>{initials}</Text>
            </AvatarFallback>
          </Avatar>
          <View>
            <Text className='mb-2 text-xl font-semibold'>{user.name}</Text>
            <View className='space-y-2 text-xs'>
              <View className='flex-row items-center gap-1.5'>
                <Icon as={MailIcon} size={12} />
                <Text>{user.email}</Text>
              </View>
              <View className='flex-row items-center gap-1.5'>
                <Icon as={CalendarDaysIcon} size={12} />
                <Text>Member since {memberSince}</Text>
              </View>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}
