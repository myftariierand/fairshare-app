import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react-native'
import { View } from 'react-native'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

const iconTileVariants = cva('bg-secondary shrink-0 items-center justify-center', {
  variants: {
    size: {
      sm: 'size-8 rounded-md',
      md: 'size-11 rounded-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

type IconTileProps = VariantProps<typeof iconTileVariants> & {
  as: LucideIcon
  className?: string
  iconClassName?: string
}

// Rounded square holding an icon, used for list leading slots
function IconTile({ as, size, className, iconClassName }: IconTileProps) {
  return (
    <View className={cn(iconTileVariants({ size }), className)}>
      <Icon
        as={as}
        className={cn('text-muted-foreground', size === 'sm' ? 'size-4' : 'size-5', iconClassName)}
      />
    </View>
  )
}

export { IconTile, iconTileVariants }
