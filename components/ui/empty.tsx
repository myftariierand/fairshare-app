import { View } from 'react-native'

import { cn } from '@/lib/utils'

import { InboxIcon, LucideIcon } from 'lucide-react-native'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'

type Props = {
  title: string
  description?: string
  icon?: LucideIcon
  containerClassName?: string
}

// Centered icon tile, title and a short line of help text
export function Empty({ title, description, icon = InboxIcon, containerClassName }: Props) {
  return (
    <View className={cn('items-center gap-2 py-12', containerClassName)}>
      <View className='bg-secondary size-14 items-center justify-center rounded-xl'>
        <Icon as={icon} className='text-muted-foreground size-6' />
      </View>
      <Text className='mt-1 text-center font-semibold'>{title}</Text>
      {description && (
        <Text
          textBreakStrategy='balanced'
          className='text-muted-foreground max-w-60 text-center text-sm'
        >
          {description}
        </Text>
      )}
    </View>
  )
}
