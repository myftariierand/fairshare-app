import { ArrowDownLeftIcon, ArrowUpRightIcon } from 'lucide-react-native'
import { View } from 'react-native'

import { Amount, SETTLED_EPSILON } from '@/components/ui/amount'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { cn, formatAmount } from '@/lib/utils'

// Pill for a net balance. Direction is carried by the arrow and the label,
// not just the color.
function BalanceChip({
  value,
  currency,
  className,
}: {
  value: number
  currency: string
  className?: string
}) {
  if (Math.abs(value) <= SETTLED_EPSILON) {
    return (
      <View className={cn('bg-muted h-7 flex-row items-center rounded-full px-2.5', className)}>
        <Text className='text-muted-foreground text-xs font-semibold'>Settled</Text>
      </View>
    )
  }

  const owed = value > 0

  return (
    <View
      accessible
      accessibilityLabel={`${owed ? 'Owed to you' : 'You owe'} ${formatAmount(Math.abs(value), currency)}`}
      className={cn(
        'h-7 flex-row items-center gap-1 rounded-full px-2.5',
        owed ? 'bg-owed/10' : 'bg-owe/10',
        className
      )}
    >
      <Icon
        as={owed ? ArrowDownLeftIcon : ArrowUpRightIcon}
        className={cn('size-3.5', owed ? 'text-owed' : 'text-owe')}
      />
      <Amount value={value} currency={currency} tone='balance' className='text-xs font-semibold' />
    </View>
  )
}

export { BalanceChip }
