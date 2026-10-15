import { View, Image } from 'react-native'
import { Link } from 'expo-router'

import { formatDistance } from 'date-fns'

import type { Profile } from '@/types/common'

import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function GroupsTab({ groups }: { groups: Profile['groups'] }) {
  const now = new Date()

  return (
    <Card>
      <CardContent className='gap-3 p-0'>
        {groups.map((g, i) => (
          <Link asChild key={g.id} href={`/groups/${g.id}`}>
            <Button variant={'ghost'}>
              <Image
                className='size-10 shrink-0 rounded'
                src={
                  g.cover
                    ? `${process.env.EXPO_PUBLIC_IMG_URL}/c_fill,w_100,h_100,g_auto,f_auto,q_auto/${g.cover}`
                    : undefined
                }
              />
              <View className='flex-1'>
                <Text className='font-semibold'>{g.name}</Text>
                <Text className='text-muted-foreground text-xs'>{g.members.length} member(s)</Text>
              </View>
              <Text className='text-muted-foreground text-xs'>
                {formatDistance(g.createdAt, now, { addSuffix: true })}
              </Text>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
