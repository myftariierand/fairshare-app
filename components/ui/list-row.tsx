import { ChevronRightIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

type ListRowProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  showChevron?: boolean
}

// One row in a list: leading slot, title + subtitle, trailing slot.
// Works with <Link asChild>, which passes onPress through.
function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  showChevron = false,
  className,
  ...props
}: ListRowProps) {
  return (
    <Pressable
      className={cn('min-h-14 flex-row items-center gap-3 py-2 active:opacity-70', className)}
      role={props.onPress ? 'button' : undefined}
      {...props}
    >
      {leading}
      <View className='flex-1'>
        <Text numberOfLines={1} className='font-semibold'>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className='text-muted-foreground mt-0.5 text-sm'>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? <Icon as={ChevronRightIcon} className='text-muted-foreground size-5' /> : null}
    </Pressable>
  )
}

export { ListRow }
