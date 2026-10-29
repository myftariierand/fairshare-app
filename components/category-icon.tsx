import { View } from 'react-native'

import { Icon } from '@/components/ui/icon'
import { cn, transactionCategories } from '@/lib/utils'

import type { TransactionCategory } from '@/types/group'

// Line icon for a transaction category
export function CategoryGlyph({
  category,
  iconClassName,
}: {
  category: TransactionCategory
  iconClassName?: string
}) {
  const { icon } = transactionCategories[category]
  return <Icon as={icon} className={cn('text-muted-foreground size-5', iconClassName)} />
}

export function CategoryIcon({
  category,
  className,
}: {
  category: TransactionCategory
  className?: string
}) {
  return (
    <View
      className={cn(
        'bg-secondary size-11 shrink-0 items-center justify-center rounded-lg',
        className
      )}
    >
      <CategoryGlyph category={category} />
    </View>
  )
}
