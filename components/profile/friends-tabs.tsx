import { View, Image } from 'react-native'
import { Link } from 'expo-router'

import { formatDistance } from 'date-fns'

import type { Profile } from '@/types/common'

import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function FriendsTab({ friends }: { friends: Profile['friends'] }) {
  return (
    <Card>
      <CardContent className='gap-3 p-4 py-0'>
        {friends.map(f => {
          return (
            <View key={f.email} className='flex-row items-center'>
              <Avatar alt={f.name}>
                <AvatarFallback className='border-border border'>
                  <Text>{f.name.slice(0, 2)}</Text>
                </AvatarFallback>
              </Avatar>
              <View className='ml-3 flex-1'>
                <Text className='flex items-center gap-1 font-semibold'>{f.name}</Text>
                <Text className='text-muted-foreground text-xs'>{f.email}</Text>
              </View>
            </View>
          )
        })}
      </CardContent>
    </Card>
  )
}
