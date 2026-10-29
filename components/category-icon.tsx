import { View } from 'react-native'

import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { cn, transactionCategories } from '@/lib/utils'

import type { TransactionCategory } from '@/types/group'

// Emoji in the light/dark themes, line icon in the redesign theme. Both render
// and the theme hides one, so no JS theme check is needed.
export function CategoryGlyph({
  category,
  iconClassName,
}: {
  category: TransactionCategory
  iconClassName?: string
}) {
  const { emoji, icon } = transactionCategories[category]
  return (
    <>
      <View className='fairshare:hidden'>
        <Text>{emoji}</Text>
      </View>
      <View className='fairshare:flex hidden'>
        <Icon as={icon} className={cn('text-muted-foreground size-5', iconClassName)} />
      </View>
    </>
  )
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
        'bg-secondary fairshare:size-11 fairshare:rounded-lg size-8 shrink-0 items-center justify-center rounded',
        className
      )}
    >
      <CategoryGlyph category={category} />
    </View>
  )
}
