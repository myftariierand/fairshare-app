import { View } from 'react-native'

import { InboxIcon, LucideIcon } from 'lucide-react-native'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

type Props = {
  title: string
  description?: string
  icon?: LucideIcon
}

export function Empty({ title, description, icon = InboxIcon }: Props) {
  return (
    <View className='text-muted-foreground mt-12 grid items-center'>
      <View className='bg-muted size-10 items-center justify-center rounded'>
        <Icon as={icon} className='text-muted-foreground' />
      </View>
      <Text className='my-1 text-sm font-medium'>{title}</Text>
      {description && (
        <Text
          textBreakStrategy='balanced'
          className='text-muted-foreground max-w-2xs text-center text-xs font-medium'
        >
          {description}
        </Text>
      )}
    </View>
  )
}
